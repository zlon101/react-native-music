import * as React from 'react';
import Toast from 'react-native-toast-message';
import { Button, View, useWindowDimensions } from 'react-native'
import { TabView, SceneMap } from 'react-native-tab-view';
import DeviceInfo from 'react-native-device-info';

export const ToastTest = () => {
  const showToast = () => {
    console.log('showToast');
    Toast.show({
      type: 'success',
      text1: 'Hello',
      text2: 'This is some something 👋'
    });
  };

  console.log('\nrender Toast')

  return (
    <View>
      <Button title='Toast Test' onPress={showToast} />
    </View>
  );
}

/**
 * Tab 测试
 * *****/
const FirstRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#ff4081' }} />
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }} />
);

const renderScene = SceneMap({
  first: FirstRoute,
  second: SecondRoute,
});

export function TabViewExample() {
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'first', title: 'First' },
    { key: 'second', title: 'Second' },
  ]);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
    />
  );
}

export function getDevice() {
  DeviceInfo.getAndroidId().then((androidId) => {
    console.log('getAndroidId', androidId);
  });;
}
