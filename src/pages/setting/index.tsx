import React from 'react';
import { StyleSheet, View } from 'react-native';
import settingTypes from './settingTypes';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import StatusBar from '@/components/base/statusBar';
import { useParams } from '@/entry/router';
import HorizonalSafeAreaView from '@/components/base/horizonalSafeAreaView';
import AppBar from '@/components/base/appBar';
import rpx from '@/utils/rpx';
// import PluginSetting from './settingTypes/pluginSetting';

export default function Setting() {
  const { type } = useParams<'setting'>();
  const settingItem = settingTypes[type];

  return (
    <SafeAreaView edges={['bottom', 'top']} style={style.wrapper}>
      <StatusBar />
      {settingItem.showNav === false ? null : <AppBar>{settingItem?.title}</AppBar>}

      {type === 'plugin' ? (
        // <PluginSetting />
        <settingItem.component />
      ) : (
        <HorizonalSafeAreaView style={style.wrapper}>
          <settingItem.component />
        </HorizonalSafeAreaView>
      )}
    </SafeAreaView>
  );
}

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    flex: 1,
  },
  appbar: {
    shadowColor: 'transparent',
    backgroundColor: '#2b333eaa',
  },
  header: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
  },
});
