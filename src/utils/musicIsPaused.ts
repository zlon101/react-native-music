import { State, usePlaybackState } from 'react-native-track-player';
import { getType } from '@/utils/tool';

export default (state: undefined | State | ReturnType<typeof usePlaybackState>) => {
  if (getType(state, 'object')) {
    return state!.state !== State.Playing;
  }
  return state !== State.Playing;
};
