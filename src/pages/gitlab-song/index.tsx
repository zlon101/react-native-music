import React, { useEffect, useState, useCallback, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { useImmer } from 'use-immer';
import { getMusicList, GitlabBuff, GitlabPlugin } from '@/plugins/gitlab';
import { Log } from '@/utils/tool';
import { GitlabMusicSheetId } from '@/constants/commonConst';
import MusicQueue from '@/core/musicQueue';
import MusicSheetPage from '@/components/musicSheetPage';
import ListLoading from '@/components/base/listLoading';
import { next } from 'cheerio/lib/api/traversing';

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
  const [loading, setLoading] = useState(true);
  const playQueue = MusicQueue.useMusicQueue();
  const [page, setPage] = useState(1);
  const [loadMore, setLoadMore] = useState<'loading' | 'done' | 'idle'>('idle');

  // 从 gitlab api 获取文件列表
  const fetchPage = useCallback(
    (page: number) => {
      getMusicList(page)
        .then((list: IGitlabResponseItem[]) => {
          if (!list || !list.length) {
            setLoadMore('done');
            return;
          }
          setLoadMore('idle');
          const _list = list.map(item => {
            const playUrl = GitlabPlugin.methods.getMediaSource(item).url;
            return {
              ...item,
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
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [sheetInfo],
  );

  useEffect(() => {
    console.clear();
    GitlabBuff.read();
    fetchPage(1);
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

  const onGetStatus = async () => {
    const state = await TrackPlayer.getPlaybackState();
    const queue = await TrackPlayer.getQueue();
    const volume = await TrackPlayer.getVolume();

    // let trackIndex = await TrackPlayer.getCurrentTrack();
    // let trackObject = await TrackPlayer.getTrack(trackIndex);
    // Log(`trackObject: ${trackObject.title}`);
    //
    // const position = await TrackPlayer.getPosition();
    // const duration = await TrackPlayer.getDuration();
    // Log(`duration: ${duration}  position: ${position}`);

    Log(
      `
      state: ${JSON.stringify(state, null, 2)}
      queue: %o,
    `,
      queue,
    );
  };

  // 下拉加载更多
  const handleEndReached = useCallback(() => {
    // Log('下拉加载更多');
    // 已经全部加载
    if (loadMore === 'done') {
      return;
    }
    setLoadMore('loading');
    const nextPage = page + 1;
    fetchPage(nextPage);
    setPage(nextPage);
  }, [page, fetchPage, loadMore]);

  if (loading) {
    return (
      <View style={style.loadingWrap}>
        <ListLoading />
      </View>
    );
  }
  return (
    <MusicSheetPage
      navTitle="Gitlab"
      sheetInfo={sheetInfo}
      onItemPress={onItemPress}
      loadMore={loadMore}
      onEndReached={handleEndReached}>
      {/*
      <View>
        <Button title="获取状态" onPress={onGetStatus} />
        <Button title="播放/暂停" onPress={onPlay} />
        <Button title="下一首" onPress={onSkipToNext} />
        <Button title="上一首" onPress={onSkipToPrevious} />
        <Button title="onDownload" onPress={onDownload} />
        <Text style={{ color: 'red' }}>{JSON.stringify(progress, null, 2)}</Text>
      </View>
      */}
    </MusicSheetPage>
  );
}

const style = StyleSheet.create({
  loadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    flex: 1,
  },
});

//#region 工具函数

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
