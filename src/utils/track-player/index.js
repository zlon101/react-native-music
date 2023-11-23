import TrackPlayer, { State, Capability } from 'react-native-track-player';
import playbackService from './service';

// 1. 注册
export function registerService() {
  TrackPlayer.registerPlaybackService(() => playbackService);
}

// 2. 初始化
export async function setUp() {
  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });
  } catch (e) {
    console.log('TrackPlayer.setupPlayer 失败:\n', e);
  }

  await TrackPlayer.updateOptions({
    icon: require('@/assets/logo-transparent.png'),
    alwaysPauseOnInterruption: true,
    progressUpdateEventInterval: 1,
    capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
    notificationCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
  });

  // TrackPlayer.updateOptions({
  //   // Media controls capabilities
  //   capabilities: [
  //     Capability.Play,
  //     Capability.Pause,
  //     Capability.SkipToNext,
  //     Capability.SkipToPrevious,
  //     Capability.Stop,
  //   ],
  //
  //   // Capabilities that will show up when the notification is in the compact form on Android
  //   compactCapabilities: [Capability.Play, Capability.Pause],
  //
  //   // Icons for the notification on Android (if you don't like the default ones)
  //   playIcon: require('./play-icon.png'),
  //   pauseIcon: require('./pause-icon.png'),
  //   stopIcon: require('./stop-icon.png'),
  //   previousIcon: require('./previous-icon.png'),
  //   nextIcon: require('./next-icon.png'),
  //   icon: require('./notification-icon.png')
  // });
}

// 3. 新增
// You can then [add](https://rntp.dev/docs/api/functions/queue#addtracks-insertbeforeindex) the items to the queue
const track1 = {
  url: require('@/assets/成都.mp3'),
  // Load media from the network
  // url: 'http://example.com/avaritia.mp3',
  // Load media from the file system
  // url: 'file:///storage/sdcard0/Downloads/artwork.png',
  title: 'Avaritia',
  artist: 'deadmau5',
  album: 'while(1<2)',
  genre: 'Progressive House, Electro House',
  date: '2014-05-20T07:00:00+00:00', // RFC 3339
  artwork: 'http://example.com/cover.png', // Load artwork from the network
  duration: 402444, // s
};

export async function add() {
  await TrackPlayer.add([track1]);
  // await TrackPlayer.add([track1, track2, track3]);
}

export async function getQueue() {
  return await TrackPlayer.getQueue();
}

// 播放状态
export async function getState() {
  const { state, error } = await TrackPlayer.getPlaybackState();
  if (error) {
    console.log('\n❌ getPlaybackState 错误:\n', error);
    return;
  }
  if (state === State.Playing) {
    console.log('The player is playing');
  }
  return state;
}

// 修改状态
