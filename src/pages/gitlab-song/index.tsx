import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useImmer } from 'use-immer';
import { getMusicList, GitlabBuff, GitlabPlugin, getImageList } from '@/plugins/gitlab';
import { GitlabMusicSheetId } from '@/constants/commonConst';
import MusicQueue from '@/core/musicQueue';
import MusicSheetPage from '@/components/musicSheetPage';
import { Log } from '@/utils/tool';

/**
 * url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3'
 * url: 'https://gitlab.com/api/v4/projects/48952022/repository/files/mp3%2Ffaded.mp3/raw?private_token%3Dglpat-4jvu2R5etMDtVXJsDx33%26ref%3Dmaster'
 * url: '/storage/emulated/0/Android/data/com.musicrn/files/download/music/夜曲.mp3'
 * *****/

// gitlab 响应的列表数据
interface IGitlabResponseItem {
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

export default function GitlabList() {
  const [sheetInfo, updateSheetInfo] = useImmer(SheetInfoInit);
  const playQueue = MusicQueue.useMusicQueue();
  const [page, setPage] = useState(1);
  const [loadMore, setLoadMore] = useState<'loading' | 'done' | 'idle'>('loading');
  const [imgs, setImgs] = useState<IGitlabResponseItem[]>([]);

  // 调试
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

  // 从 gitlab api 获取文件列表
  const fetchPage = useCallback(
    (page: number) => {
      getMusicList(page).then((list: IGitlabResponseItem[]) => {
        if (!list || !list.length) {
          setLoadMore('done');
          return;
        }
        setLoadMore('idle');
        const lastLen = sheetInfo.musicList.length;
        const _list = list.map((item, _idx) => {
          const playUrl = GitlabPlugin.methods.getMediaSource(item).url;
          const imgInd = (lastLen + _idx) % (imgs.length);
          return {
            ...item,
            // artwork: 'https://gitlab.com/api/v4/projects/52878930/repository/files/images%2FWechatIMG29.jpg/raw?private_token=glpat-4jvu2R5etMDtVXJsDx33&ref=main',
            artwork: imgs[imgInd],
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
        updateSheetInfo(draft => {
          draft.musicList = [...sheetInfo.musicList, ..._list] as any;
        });
      });
    },
    [sheetInfo, imgs],
  );

  useEffect(() => {
    GitlabBuff.read();
    getImageList().then(imgs => {
      setImgs(confused(imgs));
      fetchPage(1);
    });
  }, []);

  const onItemPress = useCallback(
    async (musicItem, list, index) => {
      const itemName = musicItem.name;
      // 不在缓存目录中，先下载
      await GitlabBuff.write(itemName);

      if (playQueue?.length) {
        await MusicQueue.play(musicItem);
      } else {
        await MusicQueue.playWithReplaceQueue(musicItem, sheetInfo.musicList);
      }
    },
    [sheetInfo.musicList, playQueue?.length],
  );

  // 下拉加载更多
  const handleEndReached = useCallback(() => {
    // 已经全部加载
    if (loadMore === 'done' || !sheetInfo.musicList.length) {
      return;
    }
    setLoadMore('loading');
    const nextPage = page + 1;
    fetchPage(nextPage);
    setPage(nextPage);
  }, [page, fetchPage, loadMore, sheetInfo.musicList.length]);

  return (
    <MusicSheetPage
      navTitle="Gitlab"
      sheetInfo={sheetInfo}
      onItemPress={onItemPress}
      loadMore={loadMore}
      onEndReached={handleEndReached}>
      {/*
      <View style={{backgroundColor: '#fff'}}>
        <Text>{JSON.stringify(debugJson, null, 2)}</Text>
        <Button title="获取状态" onPress={onGetStatus} />
      </View>
      */}
    </MusicSheetPage>
  );
}

//#region 工具函数
type IOrder = 'asc' | 'des' | 'random';
function getNextIdx(pre: number, N: number, mode: IOrder = 'asc') {
  let next = -1;
  if (mode === 'asc') {
    next = pre + 1;
    return pre < 0 ? 0 : next % N;
  }
  if (mode === 'des') {
    next = (pre - 1) % N;
    return next < 0 ? N + (next % N) : next;
  }
  return generataRandom(0, N - 1);
}

// 混淆
function confused(arr: any[]) {
  const N = (arr || []).length;
  if (N < 2) {
    return arr;
  }
  return shuffle([...arr]);
}

// 洗牌算法
function shuffle(arr: any[]) {
  let n = arr.length;
  let random = -1;
  while (0 != n) {
    random = (Math.random() * n--) >>> 0; // 无符号右移位运算符向下取整
    //或者改写成 random = Math.floor(Math.random() * n--)
    [arr[n], arr[random]] = [arr[random], arr[n]]; // ES6的解构赋值实现变量互换
  }
  return arr;
}

// 生成随机数
function generataRandom(min: number, max: number, num = 1) {
  if (max < min) {
    throw new Error(`min: ${min} and max:${max} 不符合预期`);
  }
  if (max === min) {
    return min;
  }
  const len = max - min + 1;
  const fn = () => Math.floor(Math.random() * len + min);
  if (num < 2) {
    return fn();
  }
  const result = Array(num).fill(0);
  result.forEach((_, idx) => {
    result[idx] = fn();
  });
  return result;
}

/**
const SheetMock: any = {
  id: '19723756',
  coverImg: 'http://p2.music.126.net/pcYHpMkdC69VVvWiynNklA==/109951166952713766.jpg?param=40y40',
  title: '飙升榜',
  description: '刚刚更新',
  musicList: [
    {
      id: 2024600749,
      artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
      title: 'Eutopia',
      artist: '布和笛箫',
      album: 'Eutopia（笛子版）',
      url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3',
      qualities: {
        low: {},
        standard: {},
        high: {},
        super: {},
      },
      copyrightId: 0,
      platform: '网易云',
    },
  ],
};
 **/
//#endregion
