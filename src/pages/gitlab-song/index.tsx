import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import RNFS from 'react-native-fs';
import TrackPlayer, { Event, State, useProgress } from 'react-native-track-player';
import { useImmer } from 'use-immer';

// import useTopListDetail from './hooks/useTopListDetail';
// import { useParams } from '@/entry/router';
import MusicSheetPage from '@/components/musicSheetPage';
import { getAllMusic, GitlabPlugin } from '@/plugins/gitlab';
import { Log } from '@/utils/tool';
import CustomPath from '@/constants/pathConst';

/**
 * url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3'
 * url: 'https://gitlab.com/api/v4/projects/48952022/repository/files/mp3%2Ffaded.mp3/raw?private_token%3Dglpat-4jvu2R5etMDtVXJsDx33%26ref%3Dmaster'
 * url: '/storage/emulated/0/Android/data/com.musicrn/files/download/music/夜曲.mp3'
 * *****/

async function testTrackPlayer(ls: any) {
  const tracks = ls.map(item => {
    delete item.type;
    return {
      ...item,
      title: item.name.replace(/\.\w+$/, ''),
      url: GitlabPlugin.methods.getMediaSource(item),
      // contentType: 'application/octet-stream',
      // contentType: 'audio/mpeg',
      // type: 'smoothstreaming',
    };
  });

  await TrackPlayer.add(tracks);
}

TrackPlayer.addEventListener(Event.PlaybackState, e => {
  // Log('PlaybackState:\n', JSON.stringify(e, null, 2));
});

TrackPlayer.addEventListener(Event.PlaybackError, e => {
  Log('PlaybackError:\n', JSON.stringify(e, null, 2));
});

function GitlabList() {
  // const { pluginHash, topList } = useParams<'top-list-detail'>();
  // const topListDetail = useTopListDetail(topList, pluginHash);
  const [sheetInfo, updateSheet] = useImmer(topListDetailDemo);
  const progress = useProgress();

  useEffect(() => {
    console.clear();

    readFile().then(list => {
      Log('本地文件列表 \n', list);

      // TrackPlayer.add(list as any);

      updateSheet(draft => {
        draft.musicList = list;
      });
    });

    /*********
    getAllMusic().then(list => {
      if (list.length) {
        // testTrackPlayer(list);
        const nQueue = list.map(item => {
          return {
            ...item,
            artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
            title: item.name.replace(/\.\w+$/, ''),
            platform: 'gitlab',
            url: GitlabPlugin.methods.getMediaSource(item),
          };
        });
        updateSheet(draft => {
          draft.musicList = nQueue;
        });
      }
    });
    **/
  }, []);

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

  const onPlay = async () => {
    const { state } = await TrackPlayer.getPlaybackState();
    if (state === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
    // TrackPlayer.reset();
  };

  const onSkipToNext = () => TrackPlayer.skipToNext();

  const onSkipToPrevious = () => TrackPlayer.skipToPrevious();

  const onDownload = async () => {
    const { promise } = RNFS.downloadFile({
      fromUrl: GitlabPlugin.methods.getMediaSource('faded.mp3').url,
      toFile: CustomPath.downloadMusicPath + 'faded.mp3',
      begin: arg => {
        // Log('begin\n', arg);
      },
      progress: arg => {
        // Log('progress\n', arg);
      },
    });
    promise
      .then(res => {
        Log('下载成功\n', res);
      })
      .catch(err => {
        Log('下载失败\n', err);
      });
  };

  return (
    <MusicSheetPage navTitle="自建源" sheetInfo={sheetInfo}>
      <View>
        <Button title="获取状态" onPress={onGetStatus} />
        <Button title="播放/暂停" onPress={onPlay} />
        <Button title="下一首" onPress={onSkipToNext} />
        <Button title="上一首" onPress={onSkipToPrevious} />
        <Button title="onDownload" onPress={onDownload} />
        <Text style={{ color: 'red' }}>{JSON.stringify(progress, null, 2)}</Text>
      </View>
    </MusicSheetPage>
  );
}

export default GitlabList;

export async function readFile() {
  // get a list of files and directories in the main bundle
  // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
  const musicFiles: any[] = [];
  try {
    const list = await RNFS.readDir(CustomPath.downloadMusicPath);
    list.forEach(item => {
      if (item.isFile()) {
        musicFiles.push({
          id: item.name,
          artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
          title: item.name,
          $: {
            localPath: item.path,
          },
          size: item.size,
          platform: '本地',
          // platform: 'gitlab',
        });
      }
    });
    return musicFiles;
  } catch (e) {
    Log(`读取 ${CustomPath.downloadMusicPath} 失败：`, e);
  }
}

const topListDetailDemo: any = {
  id: '19723756',
  coverImg: 'http://p2.music.126.net/pcYHpMkdC69VVvWiynNklA==/109951166952713766.jpg?param=40y40',
  title: '飙升榜',
  description: '刚刚更新',
  musicList: [
    // {
    //   id: 2024600749,
    //   artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
    //   title: 'Eutopia',
    //   artist: '布和笛箫',
    //   album: 'Eutopia（笛子版）',
    //   url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3',
    //   qualities: {
    //     low: {},
    //     standard: {},
    //     high: {},
    //     super: {},
    //   },
    //   copyrightId: 0,
    //   platform: '网易云',
    // },
  ],
};
