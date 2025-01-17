import React from 'react';
import { StyleSheet, View } from 'react-native';
import rpx from '@/utils/rpx';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MusicQueue from '@/core/musicQueue';
import repeatModeConst from '@/constants/repeatModeConst';
import musicIsPaused from '@/utils/musicIsPaused';

import useOrientation from '@/hooks/useOrientation';
import { showPanel } from '@/components/panels/usePanel';

export default function () {
  const repeatMode = MusicQueue.useRepeatMode();
  const musicState = MusicQueue.usePlaybackState();
  const orientation = useOrientation();

  const _isPaused = musicIsPaused(musicState);

  return (
    <>
      <View
        style={[
          style.wrapper,
          orientation === 'horizonal'
            ? {
                marginTop: 0,
              }
            : null,
        ]}>
        <Icon
          color={'white'}
          name={repeatModeConst[repeatMode].icon}
          size={rpx(56)}
          onPress={() => {
            MusicQueue.toggleRepeatMode();
          }}
        />
        <Icon
          color={'white'}
          name={'skip-previous'}
          size={rpx(56)}
          onPress={() => {
            MusicQueue.skipToPrevious();
          }}
        />
        <Icon
          color={'white'}
          name={_isPaused ? 'play-circle-outline' : 'pause-circle-outline'}
          size={rpx(96)}
          onPress={() => {
            if (_isPaused) {
              MusicQueue.play();
            } else {
              MusicQueue.pause();
            }
          }}
        />
        <Icon
          color={'white'}
          name={'skip-next'}
          size={rpx(56)}
          onPress={() => {
            MusicQueue.skipToNext();
          }}
        />
        <Icon
          color={'white'}
          name={'playlist-music'}
          size={rpx(56)}
          onPress={() => {
            showPanel('PlayList');
          }}
        />
      </View>
    </>
  );
}

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginTop: rpx(36),
    height: rpx(100),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});
