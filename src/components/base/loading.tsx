import React from 'react';
import { StyleSheet, View } from 'react-native';
import rpx from '@/utils/rpx';
import { ActivityIndicator } from 'react-native';
import ThemeText from './themeText';
import useColors from '@/hooks/useColors';

interface ILoadingProps {
  text?: string;
  showText?: boolean;
  height?: number;
}
export default function Loading(props: ILoadingProps) {
  const colors = useColors();
  const { showText = true, height, text } = props;

  return (
    <View style={[style.wrapper, { height }]}>
      <ActivityIndicator animating color={colors.text} />
      {showText ? (
        <ThemeText fontSize="title" fontWeight="semibold" style={style.text}>
          {text ?? '加载中...'}
        </ThemeText>
      ) : null}
    </View>
  );
}

const style = StyleSheet.create({
  wrapper: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: rpx(48),
  },
});
