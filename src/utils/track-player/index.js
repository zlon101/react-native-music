import TrackPlayer, { State, Capability } from 'react-native-track-player';
import playbackService from './service';

// 1. 注册
export function registerPlaybackService() {
  // TrackPlayer.registerPlaybackService(() => playbackService);
}

// 2. 初始化
export async function setUp() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    // icon: ImgAsset.logoTransparent,
    alwaysPauseOnInterruption: true,
    progressUpdateEventInterval: 1,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    notificationCapabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
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
// var track1 = {
//   url: 'http://example.com/avaritia.mp3', // Load media from the network
//   title: 'Avaritia',
//   artist: 'deadmau5',
//   album: 'while(1<2)',
//   genre: 'Progressive House, Electro House',
//   date: '2014-05-20T07:00:00+00:00', // RFC 3339
//   artwork: 'http://example.com/cover.png', // Load artwork from the network
//   duration: 402 // Duration in seconds
// };
//
// const track2 = {
//   url: require('./coelacanth.ogg'), // Load media from the app bundle
//   title: 'Coelacanth I',
//   artist: 'deadmau5',
//   artwork: require('./cover.jpg'), // Load artwork from the app bundle
//   duration: 166
// };
//
// const track3 = {
//   url: 'file:///storage/sdcard0/Downloads/artwork.png', // Load media from the file system
//   title: 'Ice Age',
//   artist: 'deadmau5',
//   // Load artwork from the file system:
//   artwork: 'file:///storage/sdcard0/Downloads/cover.png',
//   duration: 411
// };
export async function add() {
  // await TrackPlayer.add([track1, track2, track3]);
}


// 播放状态
export async function getState() {
  const state = await TrackPlayer.getPlaybackState();
  if (state === State.Playing) {
    console.log('The player is playing');
  }
}


let trackIndex = await TrackPlayer.getCurrentTrack();
let trackObject = await TrackPlayer.getTrack(trackIndex);
console.log(`Title: ${trackObject.title}`);

const position = await TrackPlayer.getPosition();
const duration = await TrackPlayer.getDuration();
console.log(`${duration - position} seconds left.`);

// 修改状态

