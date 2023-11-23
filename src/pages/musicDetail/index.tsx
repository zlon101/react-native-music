import StatusBar from '@/components/base/statusBar';
import globalStyle from '@/constants/globalStyle';
import useOrientation from '@/hooks/useOrientation';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Background from './components/background';
import Bottom from './components/bottom';
import Content from './components/content';
import Lyric from './components/content/lyric';
import NavBar from './components/navBar';
import Config from '@/core/config';
import { activateKeepAwake, deactivateKeepAwake } from '@sayem314/react-native-keep-awake';

export default function MusicDetail() {
  const orientation = useOrientation();

  useEffect(() => {
    const needAwake = Config.get('setting.basic.musicDetailAwake');
    if (needAwake) {
      activateKeepAwake();
    }
    return () => {
      if (needAwake) {
        deactivateKeepAwake();
      }
    };
  }, []);

  return (
    <>
      <Background />
      <SafeAreaView style={globalStyle.fwflex1}>
        <StatusBar backgroundColor={'transparent'} />
        <View style={style.bodyWrapper}>
          <View style={globalStyle.flex1}>
            <NavBar />
            <Content />
            <Bottom />
          </View>
          {orientation === 'horizonal' ? <Lyric /> : null}
        </View>
      </SafeAreaView>
    </>
  );
}

const style = StyleSheet.create({
  bodyWrapper: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
  },
});
