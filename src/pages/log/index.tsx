import React, { useCallback } from 'react';
import { StyleSheet, VirtualizedList, Text, View, TextInput } from 'react-native';
import { IPageProps } from '@/types';
import { useLog } from './context';

const Item = (props: {item: any}) => {
  const itemData = props.item;

  let str = '';
  try {
    str = JSON.stringify(itemData, null, 2);
  } catch {
    console.error('itemData');
    str = 'itemData 无法 json 序列号';
  }
  return (<View style={styles.item}>
    <Text>{str}</Text>
  </View>);
};

const getItem = (_data: any, index: number) => {
  return _data[index];
};

export default () => {
  const { logState, dispatch } = useLog();
  const [text, onChangeText] = React.useState('Useless Text');

  const onSubmit = useCallback(() => {
    text && dispatch({
      type: 'add',
      label: '测试',
      text,
    });
  }, [text]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
      />
      <VirtualizedList
        style={styles.listWrap}
        data={logState}
        initialNumToRender={Math.min(24, logState.length)}
        renderItem={({item}) => <Item item={item} />}
        keyExtractor={(item: any) => item.id}
        getItemCount={() => Math.min(24, logState.length)}
        getItem={getItem}
      />
    </View>
  );
};

const border = {
  borderWidth: 1,
  borderColor: 'red',
};
const styles = StyleSheet.create({
  border,
  container: {
    flex: 1,
    padding: 2,
  },
  input: {
    ...border,
    borderWidth: 1,
    borderColor: 'green',
  },
  listWrap: {
    flex: 1,
  },
  item: {
    ...border,
    borderColor: 'blue',
    fontSize: 14,
    marginBottom: 8,
  },
});
