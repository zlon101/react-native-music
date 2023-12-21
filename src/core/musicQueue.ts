import { produce } from 'immer';
import TrackPlayer, {
  Event,
  RepeatMode,
  State,
  Track,
  TrackMetadataBase,
  usePlaybackState,
  useProgress,
} from 'react-native-track-player';
import shuffle from 'lodash.shuffle';
import musicIsPaused from '@/utils/musicIsPaused';
import Config from './config';
import { EDeviceEvents, internalFakeSoundKey, internalSymbolKey } from '@/constants/commonConst';
import StateMapper from '@/utils/stateMapper';
import delay from '@/utils/delay';
import { errorLog, trace } from '../utils/log';
import { isSameMediaItem, mergeProps } from '@/utils/mediaItem';
import PluginManager from './pluginManager';
import Network from './network';
import Toast from '@/utils/toast';
import LocalMusicSheet from './localMusicSheet';
import { SoundAsset } from '@/constants/assetsConst';
import { getQualityOrder } from '@/utils/qualities';
import musicHistory from './musicHistory';
import getUrlExt from '@/utils/getUrlExt';
import { DeviceEventEmitter } from 'react-native';
import LyricManager from './lyricManager';
import { Log } from '@/utils/tool';
import { GitlabBuff } from '@/plugins/gitlab';
import {createEventBus} from '@/utils/subscribe';

enum MusicRepeatMode {
  /** 随机播放 */
  SHUFFLE = 'SHUFFLE',
  /** 列表循环 */
  QUEUE = 'QUEUE',
  /** 单曲循环 */
  SINGLE = 'SINGLE',
}

const EventBusPlayer = createEventBus();
export const PlayListEndEvent = 'end_of_list';

/** 核心的状态 */
let currentIndex: number = -1;
let musicQueue: Array<IMusic.IMusicItem> = [];
let repeatMode: MusicRepeatMode = MusicRepeatMode.QUEUE;
let currentQuality: IMusic.IQualityKey = 'standard';
const getRepeatMode = () => repeatMode;
const getCurrentMusicItem = () => musicQueue[currentIndex];
const getMusicQueue = () => musicQueue;
const getCurrentQuality = () => currentQuality;

const currentMusicStateMapper = new StateMapper(getCurrentMusicItem);
const musicQueueStateMapper = new StateMapper(getMusicQueue);
const repeatModeStateMapper = new StateMapper(getRepeatMode);
const currentQualityStateMapper = new StateMapper(getCurrentQuality);

/** 内部使用的排序id */
let globalId: number = 0; // 记录加入队列的次序

const maxMusicQueueLength = 1500; // 当前播放最大限制
const halfMaxMusicQueueLength = Math.floor(maxMusicQueueLength / 2);

/** 初始化 */
const setup = async () => {
  // 需要hook一下播放，所以采用这种方式
  await TrackPlayer.reset();
  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  musicQueue.length = 0;
  /** 状态恢复 */
  try {
    const config = Config.get('status.music');
    if (config?.rate) {
      await TrackPlayer.setRate(+config.rate / 100);
    }
    if (config?.repeatMode) {
      repeatMode = config.repeatMode as MusicRepeatMode;
    }
    if (config?.musicQueue && Array.isArray(config?.musicQueue)) {
      addAll(config.musicQueue, undefined, true, repeatMode === MusicRepeatMode.SHUFFLE);
    }
    currentQuality = Config.get('setting.basic.defaultPlayQuality') ?? 'standard';
    if (config?.track) {
      currentIndex = findMusicIndex(config.track);

      // todo： 想想是在这里还是加在下边的play
      if (currentIndex !== -1) {
        // todo: 这样写不好，简介引入了setup里面musicQueue和pluginManager的初始化时序关系 并且阻塞启动时间，因此这里如果失败不重试
        const newSource = await PluginManager.getByMedia(config.track)?.methods.getMediaSource(
          config.track,
          currentQuality,
          0,
        );
        // 重新初始化 获取最新的链接
        musicQueue = produce(musicQueue, draft => {
          const musicItem = {
            ...config.track,
            ...(newSource ?? {}),
          } as IMusic.IMusicItem;
          draft[currentIndex] = musicItem;
          config.track = musicItem;
        });
      }
      // todo： 判空，理论上不会发生
      await TrackPlayer.add([config.track as Track, getFakeNextTrack()]);
    }

    if (config?.progress) {
      await TrackPlayer.seekTo(config.progress);
    }

    trace('状态恢复', config);
  } catch (e) {
    errorLog('状态恢复失败', e);
  }

  // 不要依赖 playbackchanged ，不稳定,
  // 一首歌结束了
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
    trace('PlaybackQueueEnded');
    if (repeatMode === MusicRepeatMode.SINGLE) {
      await play(undefined, true);
    } else {
      await skipToNext();
    }
  });

  /** 播放下一个 PlaybackTrackChanged */
  TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async evt => {
    // 是track里的，不是playlist里的
    // trace('PlaybackTrackChanged 播放下一个', {
    //   evt,
    // });
    const nextIndex = evt.index;

    if (nextIndex === 1 && (await TrackPlayer.getTrack(nextIndex))?.$ === internalFakeSoundKey) {
      if (MusicQueue.getRepeatMode() === 'SINGLE') {
        await MusicQueue.play(undefined, true);
      } else {
        const queue = await TrackPlayer.getQueue();
        // 要跳到的下一个就是当前的，并且队列里面有多首歌  因为有重复事件(因为不同的原因重复触发)
        if (
          isSameMediaItem(queue[1] as unknown as ICommon.IMediaBase, MusicQueue.getCurrentMusicItem()) &&
          MusicQueue.getMusicQueue().length > 1
        ) {
          return;
        }
        trace('PlaybackTrackChanged-shouldskip', {
          evt,
          queue,
        });
        await skipToNext();
      }
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, async e => {
    Log('PlaybackError:\n', e);
    errorLog('Player播放失败', e);
    await _playFail('setup');
  });

  currentMusicStateMapper.notify();
  repeatModeStateMapper.notify();
};

/** 播放模式相关 */
const _toggleRepeatMapping = {
  [MusicRepeatMode.SHUFFLE]: MusicRepeatMode.SINGLE,
  [MusicRepeatMode.SINGLE]: MusicRepeatMode.QUEUE,
  [MusicRepeatMode.QUEUE]: MusicRepeatMode.SHUFFLE,
};
const toggleRepeatMode = () => {
  setRepeatMode(_toggleRepeatMapping[repeatMode]);
};

const setRepeatMode = (mode: MusicRepeatMode) => {
  const currentMusicItem = musicQueue[currentIndex];
  if (mode === MusicRepeatMode.SHUFFLE) {
    musicQueue = shuffle(musicQueue);
  } else {
    musicQueue = produce(musicQueue, draft => {
      return draft.sort((a, b) => a?.[internalSymbolKey]?.globalId - b?.[internalSymbolKey]?.globalId ?? 0);
    });
  }
  currentIndex = findMusicIndex(currentMusicItem);
  repeatMode = mode;
  TrackPlayer.updateMetadataForTrack(1, getFakeNextTrack());
  // 记录
  Config.set('status.music.repeatMode', mode, false);
  repeatModeStateMapper.notify();
  currentMusicStateMapper.notify();
  musicQueueStateMapper.notify();
};

// 获取目标item下标
const findMusicIndex = (musicItem?: IMusic.IMusicItem) =>
  musicItem
    ? musicQueue.findIndex(
        queueMusicItem => queueMusicItem.id === musicItem.id && queueMusicItem.platform === musicItem.platform,
      )
    : currentIndex;

const shrinkMusicQueueToSize = (queue: IMusic.IMusicItem[], targetIndex = currentIndex) => {
  // 播放列表上限，太多无法缓存状态
  if (queue.length > maxMusicQueueLength) {
    if (targetIndex < halfMaxMusicQueueLength) {
      queue = queue.slice(0, maxMusicQueueLength);
    } else {
      const right = Math.min(queue.length, targetIndex + halfMaxMusicQueueLength);
      const left = Math.max(0, right - maxMusicQueueLength);
      queue = queue.slice(left, right);
    }
  }
  return queue;
};

/** 添加到播放列表 */
const addAll = (
  musicItems: Array<IMusic.IMusicItem> = [],
  beforeIndex?: number,
  notCache?: boolean,
  shouldShuffle?: boolean,
) => {
  const _musicItems = musicItems.map(item =>
    produce(item, draft => {
      if (draft[internalSymbolKey]) {
        draft[internalSymbolKey].globalId = ++globalId;
      } else {
        draft[internalSymbolKey] = {
          globalId: ++globalId,
        };
      }
    }),
  );
  if (beforeIndex === undefined) {
    musicQueue = musicQueue.concat(_musicItems.filter(_ => findMusicIndex(_) === -1));
  } else {
    let currentMusic: IMusic.IMusicItem | null = null;
    const beforeDraft = musicQueue
      .slice(0, beforeIndex)
      .filter(item => _musicItems.findIndex(mi => isSameMediaItem(mi, item)) === -1);
    const afterDraft = musicQueue
      .slice(beforeIndex)
      .filter(item => _musicItems.findIndex(mi => isSameMediaItem(mi, item)) === -1);

    if (beforeDraft.length < beforeIndex) {
      currentMusic = musicQueue[currentIndex];
    }
    musicQueue = [...beforeDraft, ...musicItems, ...afterDraft];
    if (currentMusic) {
      currentIndex = findMusicIndex(currentMusic);
    }
  }
  // 播放列表上限，太多无法缓存状态
  musicQueue = shrinkMusicQueueToSize(musicQueue, findMusicIndex(_musicItems[0]));
  if (!notCache) {
    Config.set('status.music.musicQueue', musicQueue, false);
  }
  if (shouldShuffle) {
    musicQueue = shuffle(musicQueue);
  }
  musicQueueStateMapper.notify();
};

/** 追加到队尾 */
const add = (musicItem: IMusic.IMusicItem | IMusic.IMusicItem[], beforeIndex?: number) => {
  addAll(Array.isArray(musicItem) ? musicItem : [musicItem], beforeIndex);
};

const addNext = (musicItem: IMusic.IMusicItem | IMusic.IMusicItem[]) => {
  const shouldPlay = musicQueue.length === 0;
  add(musicItem, currentIndex + 1);
  if (shouldPlay) {
    play(Array.isArray(musicItem) ? musicItem[0] : musicItem);
  }
};

const remove = async (musicItem: IMusic.IMusicItem) => {
  const _ind = findMusicIndex(musicItem);
  // 移除的是当前项
  if (_ind === currentIndex) {
    // 停下
    await TrackPlayer.reset();
    musicQueue = produce(musicQueue, draft => {
      draft.splice(_ind, 1);
    });
    if (musicQueue.length === 0) {
      currentIndex = -1;
    } else {
      currentIndex = currentIndex % musicQueue.length;
      play();
    }
  } else if (_ind !== -1 && _ind < currentIndex) {
    musicQueue = produce(musicQueue, draft => {
      draft.splice(_ind, 1);
    });
    currentIndex -= 1;
  } else {
    musicQueue = produce(musicQueue, draft => {
      draft.splice(_ind, 1);
    });
  }
  Config.set('status.music.musicQueue', musicQueue, false);
  musicQueueStateMapper.notify();
  currentMusicStateMapper.notify();
};

/** 清空播放列表 */
const clear = async () => {
  musicQueue = [];
  currentIndex = -1;

  Config.set('status.music', {
    repeatMode,
  });
  await TrackPlayer.reset();
  musicQueueStateMapper.notify();
  currentMusicStateMapper.notify();
};

function getNextPlayIndex(nowIdx: number, N: number, isLast = false): number {
  const inc = isLast ? -1 : 1;
  if (nowIdx > -1) {
    return (nowIdx + inc) % N;
  }
  return (nowIdx - 1 + N) % N;
}

/**
 * 获取自动播放的下一个track
 */
const getFakeNextTrack = () => {
  let track: Track | undefined;
  const N = musicQueue.length;
  if (repeatMode === MusicRepeatMode.SINGLE) {
    track = musicQueue[currentIndex] as Track;
  } else {
    track = N !== 0 ? (musicQueue[getNextPlayIndex(currentIndex, N)] as Track) : undefined;
    // TODO 针对 gitlab 处理，提前下载到缓存目录中
    if (track) {
      GitlabBuff.write(track.path)
    }
  }

  if (track) {
    return produce(track, _ => {
      _.url = SoundAsset.fakeAudio;
      _.$ = internalFakeSoundKey;
    });
  } else {
    return { url: SoundAsset.fakeAudio, $: internalFakeSoundKey } as Track;
  }
};

/** 播放音乐
 * musicItem有值：播放音乐
 * musicItem为空，且forcePlay为false或空：继续播放
 * musicItem为空，且forcePlay为true：强制从头开始播放
 */
const play = async (musicItem?: IMusic.IMusicItem, forcePlay?: boolean) => {
  deleteArtwork(musicItem);

  try {
    trace('播放', musicItem);
    //#region 移动网络时 根据设置重置player
    if (
      Network.isCellular() &&
      !Config.get('setting.basic.useCelluarNetworkPlay') &&
      !LocalMusicSheet.isLocalMusic(musicItem ?? musicQueue[currentIndex] ?? null)
    ) {
      Toast.warn('当前设置移动网络不可播放，可在侧边栏基本设置中打开');
      await TrackPlayer.reset();
      return;
    }
    //#endregion
    const _currentIndex = findMusicIndex(musicItem);
    if (!musicItem && _currentIndex === currentIndex && !forcePlay) {
      // 如果暂停就继续播放，否则
      const currentTrack = await TrackPlayer.getTrack(0);
      if (currentTrack && currentTrack.url) {
        const state = await TrackPlayer.getState();
        if (musicIsPaused(state)) {
          trace('PLAY-继续播放', currentTrack);
          await TrackPlayer.play();
          return;
        }
        return;
      }
    }
    currentIndex = _currentIndex;

    if (currentIndex === -1) {
      if (musicItem) {
        add(musicItem);
        currentIndex = musicQueue.length - 1;
      } else {
        return;
      }
    }
    const _musicItem = musicQueue[currentIndex];
    let track: IMusic.IMusicItem;

    //#region 针对 gitlab 平台特殊处理
    if (_musicItem.sourcePlatform === 'gitlab') {
      await GitlabBuff.write(_musicItem.path);
    }
    //#endregion

    try {
      // 通过插件获取音乐
      const plugin = PluginManager.getByName(_musicItem.platform);
      //#region 音质判断
      const qualityOrder = getQualityOrder(
        Config.get('setting.basic.defaultPlayQuality') ?? 'standard',
        Config.get('setting.basic.playQualityOrder') ?? 'asc',
      );
      let source: IPlugin.IMediaSourceResult | null = null;

      // Log('1111111111111111');
      for (let quality of qualityOrder) {
        if (isSameMediaItem(musicQueue[currentIndex], _musicItem)) {
          source = (await plugin?.methods?.getMediaSource(_musicItem, quality)) ?? null;
          if (source) {
            currentQuality = quality;
            currentQualityStateMapper.notify();
            break;
          }
        } else {
          // 中断
          return;
        }
      }

      // Log('22222222222', source);
      if (!source) {
        if (!_musicItem.url) {
          throw new Error('播放失败');
        }
        source = {
          url: _musicItem.url,
        };
        currentQuality = 'standard';
        currentQualityStateMapper.notify();
      }
      if (getUrlExt(source.url) === '.m3u8') {
        // @ts-ignore
        source.type = 'hls';
      }
      //#endregion
      // 获取音乐信息
      track = mergeProps(_musicItem, source) as IMusic.IMusicItem;
      /** 可能点了很多次。。。 */
      if (!isSameMediaItem(_musicItem, musicQueue[currentIndex])) {
        return;
      }
      musicQueue = produce(musicQueue, draft => {
        draft[currentIndex] = { ...track };
        draft[currentIndex].url = _musicItem.url; // todo 这里写的不好
      });

      musicHistory.addMusic(_musicItem);

      // Log('33333333333', track);
      await replaceTrack(track as Track);
      currentMusicStateMapper.notify();
      let info: Partial<IMusic.IMusicItem> | null = null;
      try {
        // @ts-ignore
        info = (await plugin?.methods?.getMusicInfo?.(_musicItem)) ?? null;
      } catch {}

      if (info && isSameMediaItem(_musicItem, musicQueue[currentIndex])) {
        await TrackPlayer.updateMetadataForTrack(0, mergeProps(track, info) as TrackMetadataBase);
        musicQueue = produce(musicQueue, draft => {
          draft[currentIndex] = mergeProps(track as IMusic.IMusicItem, info!) as IMusic.IMusicItem;
          draft[currentIndex].url = _musicItem.url; // todo 这里写的不好
        });
        currentMusicStateMapper.notify();
      }

      if (!isSameMediaItem(LyricManager.getLyricState()?.lyricParser?.getCurrentMusicItem?.(), musicItem)) {
        DeviceEventEmitter.emit(EDeviceEvents.REFRESH_LYRIC, true);
      }
    } catch (e) {
      // 播放失败
      console.log('播放失败', e);
      if (isSameMediaItem(_musicItem, musicQueue[currentIndex])) {
        await _playFail('play函数');
      }
      return;
    }
  } catch (e: any) {
    if (e?.message === 'The player is not initialized. Call setupPlayer first.') {
      trace('重新初始化player', '');
      await TrackPlayer.setupPlayer();
      play(musicItem, forcePlay);
    }
    errorLog('播放失败!!!', e?.message ?? '');
  }
};

const replaceTrack = async (track: Track, autoPlay = true) => {
  await TrackPlayer.reset();
  // await TrackPlayer.remove([0, 1]);
  // console.log(await TrackPlayer.getQueue(), 'REPLACE-TRACK');
  await TrackPlayer.add([track, getFakeNextTrack()]);
  // console.log(await TrackPlayer.getQueue(), 'REPLACE-TRACK-AFTER-ADD');
  if (autoPlay) {
    await TrackPlayer.play();
  }
  Config.set('status.music.track', track as IMusic.IMusicItem, false);
  Config.set('status.music.progress', 0, false);
};

const _playFail = async (msg = '') => {
  errorLog(`${msg} 播放失败，自动跳过`, {
    currentIndex,
  });
  await TrackPlayer.reset();
  await TrackPlayer.add([
    (musicQueue[currentIndex] ?? {
      url: SoundAsset.fakeAudio,
      $: internalFakeSoundKey,
    }) as Track,
    getFakeNextTrack(),
  ]);
  if (!Config.get('setting.basic.autoStopWhenError')) {
    await delay(300);
    await skipToNext();
  }
};

const playWithReplaceQueue = async (musicItem: IMusic.IMusicItem, newQueue: IMusic.IMusicItem[]) => {
  if (newQueue.length !== 0) {
    newQueue = shrinkMusicQueueToSize(
      newQueue,
      newQueue.findIndex(_ => isSameMediaItem(_, musicItem)),
    );
    deleteArtwork(newQueue);
    musicQueue = [];
    addAll(newQueue, undefined, undefined, repeatMode === MusicRepeatMode.SHUFFLE);
    await play(musicItem, true);
  }
};

const pause = async () => {
  await TrackPlayer.pause();
};

const skipToNext = async () => {
  const N = musicQueue.length;
  if (N === 0) {
    currentIndex = -1;
    return;
  }

  // 列表最后一个播放完成，尝试获取下一页数据
  if (currentIndex >= N - 2) {
    EventBusPlayer.emit(PlayListEndEvent);
  }
  await play(musicQueue[getNextPlayIndex(currentIndex, musicQueue.length)], true);
};

const skipToPrevious = async () => {
  if (musicQueue.length === 0) {
    currentIndex = -1;
    return;
  }
  if (currentIndex === -1) {
    currentIndex = 0;
  }
  await play(musicQueue[getNextPlayIndex(currentIndex, musicQueue.length, true)], true);
};

/** 修改当前播放的音质 */
const changeQuality = async (newQuality: IMusic.IQualityKey) => {
  // 获取当前的音乐和进度
  const musicItem = musicQueue[currentIndex];
  if (newQuality === currentQuality) {
    return true;
  }
  const position = await TrackPlayer.getPosition();
  const plugin = PluginManager.getByMedia(musicItem);
  try {
    const newSource = await plugin?.methods?.getMediaSource(musicItem, newQuality);
    if (!newSource?.url) {
      throw new Error();
    }
    if (isSameMediaItem(musicItem, musicQueue[currentIndex])) {
      const playingState = await TrackPlayer.getState();
      await replaceTrack(mergeProps(musicItem, newSource) as unknown as Track, !musicIsPaused(playingState));
      await TrackPlayer.seekTo(position);
      currentQuality = newQuality;
      currentQualityStateMapper.notify();
    }
    return true;
  } catch {
    // 修改失败
    return false;
  }
};

// 当 artwork 为空时删除属性
const deleteArtwork = (musics: any) => {
  if (!musics) return;

  if (Array.isArray(musics)) {
    musics.forEach(item => {
      if (item && item.artwork === '') {
        item.artwork = undefined;
      }
    });
    return;
  }

  if (musics.artwork === '') {
    musics.artwork = undefined;
  }
};

const MusicQueue = {
  setup,
  useMusicQueue: musicQueueStateMapper.useMappedState,
  getMusicQueue: getMusicQueue,
  addAll,
  add,
  addNext,
  skipToNext,
  skipToPrevious,
  play,
  playWithReplaceQueue,
  pause,
  remove,
  clear,
  useCurrentMusicItem: currentMusicStateMapper.useMappedState,
  getCurrentMusicItem: getCurrentMusicItem,
  useRepeatMode: repeatModeStateMapper.useMappedState,
  getRepeatMode,
  toggleRepeatMode,
  MusicRepeatMode,
  usePlaybackState,
  MusicState: State,
  useProgress,
  getPosition: TrackPlayer.getPosition,
  reset: TrackPlayer.reset,
  seekTo: TrackPlayer.seekTo,
  currentIndex,
  changeQuality,
  useCurrentQuality: currentQualityStateMapper.useMappedState,
  getNextPlayIndex,
  EventBusPlayer,
};

export default MusicQueue;
