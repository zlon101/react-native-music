import React, { useState } from 'react';
import useColors from '@/hooks/useColors';
import rpx from '@/utils/rpx';
import { StyleSheet, View } from 'react-native';
import ThemeText from '@/components/base/themeText';
import Input from '@/components/base/input';
import { fontSizeConst } from '@/constants/uiConst';
import Button from '@/components/base/button';
import { hideDialog } from '../useDialog';
import Dialog from './base';

interface IProps {
  onOk: (name: string) => void;
}
export default function AddGitlabMusic(props: IProps) {
  const colors = useColors();
  const [name, setName] = useState('');

  const {onOk} = props;

  async function onConfirm() {
    if (!name) {
      hideDialog();
    } else {
      onOk(name);
    }
  }

  return (
    <Dialog onDismiss={hideDialog}>
      <Dialog.Content style={style.content}>
        <View style={style.row}>
          <ThemeText>新增歌曲名称</ThemeText>
        </View>
        <View style={style.row}>
          <ThemeText fontSize="description">同时添加多个名称可用、符号分割</ThemeText>
        </View>
        <View style={style.row}>
          <Input
            numberOfLines={1}
            textAlign="left"
            value={name}
            hasHorizonalPadding={false}
            onChangeText={str => setName(str.trim())}
            style={{
              width: '100%',
              height: fontSizeConst.content * 2.5,
              borderBottomWidth: 1,
              includeFontPadding: false,
              borderBottomColor: colors.text,
            }}
          />
        </View>
      </Dialog.Content>
      <Dialog.Actions>
        <Button withHorizonalPadding onPress={hideDialog}>
          取消
        </Button>
        <Button withHorizonalPadding onPress={onConfirm}>
          确认
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const style = StyleSheet.create({
  content: {
    height: rpx(450),
  },
  row: {
    marginTop: rpx(16),
    height: rpx(80),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: rpx(12),
  },
});
