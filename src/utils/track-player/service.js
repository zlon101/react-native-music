import TrackPlayer, {Event, State} from 'react-native-track-player';
// import Config from '@/core/config';
// import musicIsPaused from '@/utils/musicIsPaused';
// import MusicQueue from '../core/musicQueue';

let resumeState;

export default async function() {
  // 媒体控制
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemotePrevious, () =>
    TrackPlayer.skipToPrevious(),
  );
  TrackPlayer.addEventListener(Event.RemoteNext, () =>
    TrackPlayer.skipToNext(),
  );
  TrackPlayer.addEventListener(
    Event.RemoteDuck,
    async ({paused, permanent}) => {
      if (permanent || paused) {
        return TrackPlayer.pause();
      }
      /*****
      const tempRemoteDuckConf = Config.get(
        'setting.basic.tempRemoteDuck',
      );
      if (tempRemoteDuckConf === '降低音量') {
        if (paused) {
          return TrackPlayer.setVolume(0.5);
        } else {
          return TrackPlayer.setVolume(1);
        }
        if (paused) {
          resumeState = await TrackPlayer.getState();
          return TrackPlayer.pause();
        } else {
          if (resumeState && !musicIsPaused(resumeState)) {
            resumeState = null;
            return TrackPlayer.play();
          }
          resumeState = null;
        }
      }
       **/
    },
  );
  TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, evt => {
    // Config.set('status.music.progress', evt.position, false);
  });
}
