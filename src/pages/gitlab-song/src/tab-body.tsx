import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Route } from 'react-native-tab-view';
import { useImmer } from 'use-immer';
import Toast from 'react-native-toast-message';
import SheetMusicList from '@/components/musicSheetPage/components/sheetMusicList';
import { getMusicList, GitlabBuff, GitlabPlugin, getFileUrl, getImageList } from "@/plugins/gitlab";
import { GitlabMusicSheetId } from '@/constants/commonConst';
import MusicQueue, {playPage} from '@/core/musicQueue';
import {trace} from '@/utils/log';
import { confused } from '@/utils/array';

// gitlab 响应的列表数据
export interface IGitlabResponseItem {
  id: string;
  name: string; // 带有文件后缀
  type: string;
  path: string;
  mode: string;
}

const SheetInfoInit = {
  id: GitlabMusicSheetId,
  title: 'Gitlab',
  musicList: [],
};

interface ITabBodyProps {
  route: Route & {
    filePath: string;
    title: string;
  };
  emitList: any;
  getFilePath: any;
}

function TabBody(props: ITabBodyProps) {
  const [sheetInfo, updateSheetInfo] = useImmer<IMusic.IMusicSheetItem>(SheetInfoInit);
  // const playQueue = MusicQueue.useMusicQueue();
  const [page, setPage] = [playPage.useValue(), playPage.setValue];
  const [imgs, setImgs] = useState<IGitlabResponseItem[]>([]);
  // idle: 闲置  done: 数据全部加载
  const [loadMore, setLoadMore] = useState<'loading' | 'done' | 'idle'>('loading');
  // 切换播放列表
  const [changeQueue, setChangeQueue] = useState(false);

  const { route, emitList, getFilePath } = props;
  const routeKey = route.key;
  const isAllPage = routeKey === 'all';
  let filePath = route.filePath;

  //#region 调试
  const [debugJson, setDebugVal] = useState({});
  const onGetStatus = async () => {
    // const state = await TrackPlayer.getPlaybackState();
    const queue = await TrackPlayer.getQueue();
    // const volume = await TrackPlayer.getVolume();
    const trackIndex = await TrackPlayer.getActiveTrackIndex();
    const trackObject = await TrackPlayer.getActiveTrack();
    setDebugVal({
      queueLength: queue.length,
      trackIndex,
      trackObject,
    });
  };
  useEffect(() => {
    onGetStatus();
  }, []);
  //#endregion

  //#region 从 gitlab api 获取文件列表
  const fetchPage = useCallback(
    async (page: number, nextDir = false) => {
      if (isAllPage) {
        filePath = getFilePath(nextDir);
        // 【全部】tab下，并且所有文件全部加载
        if (filePath === 'load_all_finished' || filePath === 'null') {
          // trace('load_all_finished', filePath);
          setLoadMore('done');
          return;
        }
      }

      // trace(`加载数据 page: ${page}  filePath: ${filePath}`);
      const list: IGitlabResponseItem[] = await getMusicList(page, filePath);
      trace(`fetch 列表长度: ${list?.length}`);
      //#region 当前目录文件已经全部加载
      if (!list || !list.length) {
        emitList(routeKey, {
          list: sheetInfo.musicList,
          loadAll: true,
          filePath,
        });

        // 获取下一个目录的文件
        if (isAllPage) {
          setPage(1);
          // setLoadMore('idle');
          return await fetchPage(1, true);
        }
        setLoadMore('done');
        return;
      }
      //#endregion

      const lastLength = sheetInfo.musicList.length;
      const imgNum = imgs ? imgs.length : 0;
      const _list = list.map((item, _idx) => {
        const playUrl = GitlabPlugin.methods.getMediaSource(item).url;
        const imgInd = (lastLength + _idx) % imgNum;
        return {
          ...item,
          id: item.id + item.name,
          // artwork: 'https://gitlab.com/api/v4/projects/52878930/repository/files/images%2FWechatIMG29.jpg/raw?private_token=glpat-4jvu2R5etMDtVXJsDx33&ref=main',
          artwork: imgNum ? getFileUrl(imgs[imgInd]?.path) : undefined,
          type: 'default',
          title: item.name.replace(/\.\w+$/, ''),
          platform: '本地',
          sourcePlatform: 'gitlab',
          url: playUrl,
          $: {
            localPath: playUrl,
          },
        };
      });
      const newMusics: any = [...sheetInfo.musicList, ..._list];
      updateSheetInfo(draft => {
        draft.musicList = newMusics;
      });

      emitList(routeKey, {
        list: newMusics,
        filePath,
      });
      setLoadMore('idle');
      return _list;
    },
    [sheetInfo.musicList, routeKey, isAllPage, filePath, getFilePath, emitList, imgs],
  );
  //#endregion

  // 下拉加载更多
  const handleEndReached = useCallback(async (_page?: number) => {
    // 已经全部加载或者首次进入
    if (loadMore === 'done' || !sheetInfo.musicList.length) {
      return;
    }
    setLoadMore('loading');
    const nextPage = _page || (page + 1);
    trace(`加载第 ${nextPage} 页`);
    const newMusics: any = await fetchPage(nextPage);
    setPage(nextPage);
    if (newMusics) {
      MusicQueue.add(newMusics);
    }
  }, [page, fetchPage, loadMore, sheetInfo.musicList.length]);


  const onItemPress = useCallback(
    async (musicItem) => {
      Toast.show({type: 'info', text1: '加载中...'});

      const nowChangeQueue = changeQueue;
      if (!nowChangeQueue) {
        playPage.setValue(1);
      }
      setChangeQueue(true);

      // const itemName = musicItem.name;
      // 不在缓存目录中，先下载
      await GitlabBuff.write(musicItem.path);
      try {
        if (nowChangeQueue) {
          await MusicQueue.play(musicItem);
        } else {
          await MusicQueue.playWithReplaceQueue(musicItem, sheetInfo.musicList);
        }
      } catch (_) {
      }
      setTimeout(() => Toast.hide(), 200);
    },
    [sheetInfo.musicList, changeQueue],
  );

  // 读缓存、获取封面图像、按页码获取文件列表
  useEffect(() => {
    GitlabBuff.read();
    Promise.all([
      fetchPage(1),
      getImageList(),
    ]).then(([_musics, _imgs]) => {
      const imgNum = _imgs?.length;
      if (!_musics?.length || !imgNum) {
        return;
      }
      const _images = confused(_imgs);
      setImgs(_images);

      const _musics2: any = _musics.map((item3, idx3) => {
        return {
          ...item3,
          artwork: getFileUrl( _images[idx3 % imgNum]?.path ),
        }
      });
      updateSheetInfo(draft => {
        draft.musicList = _musics2;
      });
    }).catch(imgErr => {
      trace(`获取封面失败`, imgErr, 'error');
    });
  }, []);

  // 列表播放完成，加载下一页
  useEffect(() => {
    if (!changeQueue) return;
    MusicQueue.setLoadMore((_page) => {
      trace(`列表播放完成，加载下一页，routeKey:${routeKey}`, null, 'debug');
      handleEndReached(_page);
    });
  }, [changeQueue, handleEndReached]);

  return (
    <SheetMusicList
      sheetInfo={sheetInfo as any}
      onEndReached={handleEndReached}
      loadMore={loadMore}
      onItemPress={onItemPress}
    />
  );
}

export default TabBody; // React.memo(TabBody, (prevProps, nextProps) => true);

// const SheetMock: any = {
//   id: '19723756',
//   coverImg: 'http://p2.music.126.net/pcYHpMkdC69VVvWiynNklA==/109951166952713766.jpg?param=40y40',
//   title: '飙升榜',
//   description: '刚刚更新',
//   musicList: [
//     {
//       id: 2024600749,
//       artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
//       title: 'Eutopia',
//       artist: '布和笛箫',
//       album: 'Eutopia（笛子版）',
//       url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3',
//       qualities: {
//         low: {},
//         standard: {},
//         high: {},
//         super: {},
//       },
//       copyrightId: 0,
//       platform: '网易云',
//     },
//   ],
// };
