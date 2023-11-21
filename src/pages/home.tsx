import React from 'react';
import { Button, Text, View } from 'react-native';
import { add, getQueue } from '@/utils/track-player';
import { IPageProps } from '@/types';

export default ({ navigation }: IPageProps) => {
  const onAdd = () => {
    add();
  };
  const onGetQueue = async () => {
    const list = await getQueue();
    console.log('\nlist:', list);
  };

  return (<View>
    <Text>Home AA</Text>
    <Button title="add" onPress={onAdd} />
    <Button title="onGetQueue" onPress={onGetQueue} />
    <Button title="log" onPress={() => {
      navigation.navigate('Log');
    }} />
  </View>);
};
