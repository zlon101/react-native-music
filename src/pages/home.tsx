import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CircularProgressBase } from 'react-native-circular-progress-indicator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { add, getQueue } from '@/utils/track-player';
import { IPageProps } from '@/types';

export default ({ navigation }: IPageProps) => {
  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('my-key');
        if (value !== null) {
          // value previously stored
        }
      } catch (e) {
        // error reading value
      }
    };
    // getData();
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
      <Text>Home AA</Text>
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
      <Button
        title="log"
        onPress={() => {
          navigation.navigate('Log');
        }}
      />
    </View>
  );
};
