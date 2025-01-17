import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import { add, getQueue } from '@/utils/track-player';
import { IPageProps } from '@/types';
import { ToastTest, getDevice, readFile } from '@/test';

export default ({ navigation }: IPageProps) => {
  useEffect(() => {
    getDevice();
    // readFile();
  }, []);

  const onAdd = () => {
    add();
  };

  const onGetQueue = async () => {
    const list = await getQueue();
    console.log('\nlist:', list);
  };

  return (
    <View>
      <Text>Home AA BB CC DD</Text>
      <Button title="add" onPress={onAdd} />
      {/*<Button title="onGetQueue" onPress={onGetQueue} />*/}
      <Icon accessible accessibilityLabel="播放列表" name="playlist-music" size={56} />
      <CircularProgressBase
        activeStrokeWidth={4}
        inActiveStrokeWidth={2}
        inActiveStrokeOpacity={0.2}
        value={43}
        duration={100}
        radius={36}
        activeStrokeColor={'red'}
        inActiveStrokeColor={'blue'}
      />
      <ToastTest />
      <Button
        title="log"
        onPress={() => {
          navigation.navigate('Log');
        }}
      />
      <Button
        title="debug"
        onPress={() => {
          navigation.navigate('Debug');
        }}
      />
      <Button
        title="Home2"
        onPress={() => {
          navigation.navigate('Home2');
        }}
      />
    </View>
  );
};
