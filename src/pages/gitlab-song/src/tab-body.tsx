import React, { useEffect, useState, useCallback } from 'react';
// import { View, Text } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { Route } from 'react-native-tab-view';
import { useImmer } from 'use-immer';
import Toast from 'react-native-toast-message';
import SheetMusicList from '@/components/musicSheetPage/components/sheetMusicList';
import { getMusicList, GitlabBuff, GitlabPlugin, getFileUrl } from '@/plugins/gitlab';
import { GitlabMusicSheetId } from '@/constants/commonConst';
import MusicQueue from '@/core/musicQueue';
import {Log} from '@/utils/tool';

/**
 * url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3'
 * url: 'https://gitlab.com/api/v4/projects/48952022/repository/files/mp3%2Ffaded.mp3/raw?private_token%3Dglpat-4jvu2R5etMDtVXJsDx33%26ref%3Dmaster'
 * url: '/storage/emulated/0/Android/data/com.musicrn/files/download/music/夜曲.mp3'
 * *****/

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
  imgs: any[];
}

function TabBody(props: ITabBodyProps) {
  const [sheetInfo, updateSheetInfo] = useImmer<IMusic.IMusicSheetItem>(SheetInfoInit);
  const playQueue = MusicQueue.useMusicQueue();
  const [page, setPage] = useState(1);
  // idle: 闲置  done: 数据全部加载
  const [loadMore, setLoadMore] = useState<'loading' | 'done' | 'idle'>('loading');

  const { route, emitList, getFilePath, imgs } = props;
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
    (page: number, nextDir = false) => {
      if (isAllPage) {
        filePath = getFilePath(nextDir);
        // 【全部】tab下，并且所有文件全部加载
        if (filePath === 'load_all_finished' || filePath === 'null') {
          // Log('load_all_finished', filePath);
          setLoadMore('done');
          return;
        }
      }

      // Log(`加载数据 page: ${page}  filePath: ${filePath}`);
      getMusicList(page, filePath).then((list: IGitlabResponseItem[]) => {
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
            fetchPage(1, true);
          } else {
            setLoadMore('done');
          }
          return;
        }
        //#endregion

        // const lastLen = sheetInfo.musicList.length;
        const _list = list.map((item, _idx) => {
          const playUrl = GitlabPlugin.methods.getMediaSource(item).url;
          // const imgInd = (lastLen + _idx) % imgs.length;
          return {
            ...item,
            // artwork: 'https://gitlab.com/api/v4/projects/52878930/repository/files/images%2FWechatIMG29.jpg/raw?private_token=glpat-4jvu2R5etMDtVXJsDx33&ref=main',
            // artwork: getFileUrl(imgs[imgInd]?.path),
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
      });
    },
    [sheetInfo, routeKey, isAllPage, filePath, getFilePath, emitList],
  );
  //#endregion

  //#region 读缓存、获取封面图像、按页码获取文件列表
  useEffect(() => {
    GitlabBuff.read();
    fetchPage(1);
  }, []);
  //#endregion

  const onItemPress = useCallback(
    async (musicItem, _, _idx) => {
      Toast.show({
        type: 'info',
        text1: '加载中...',
      });
      // const itemName = musicItem.name;
      // 不在缓存目录中，先下载
      await GitlabBuff.write(musicItem.path);

      const track = {...musicItem};
      const imgNum = imgs.length;
      const _musics = sheetInfo.musicList.map((item3, idx3) => {
        return {
          ...item3,
          artwork: getFileUrl( imgs[idx3 % imgNum]?.path ),
        }
      });
      track.artwork = _musics[_idx]?.artwork;

      try {
        if (playQueue?.length) {
          await MusicQueue.play(track);
        } else {
          await MusicQueue.playWithReplaceQueue(track, _musics);
        }
      } catch (_) {
      }
      setTimeout(() => Toast.hide(), 200);
    },
    [sheetInfo.musicList, playQueue?.length, imgs],
  );

  // 下拉加载更多
  const handleEndReached = useCallback(() => {
    // 已经全部加载或者首次进入
    if (loadMore === 'done' || !sheetInfo.musicList.length) {
      return;
    }
    setLoadMore('loading');
    const nextPage = page + 1;
    fetchPage(nextPage);
    setPage(nextPage);
  }, [page, fetchPage, loadMore, sheetInfo.musicList.length]);

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
