import useColors from '@/hooks/useColors';
import { TabBar } from 'react-native-tab-view';
import { Text } from 'react-native';
import rpx from '@/utils/rpx';
import { fontWeightConst } from '@/constants/uiConst';
import React from 'react';

const tabBarSty = {
  backgroundColor: 'transparent',
  shadowColor: 'transparent',
  borderColor: 'transparent',
};

const TabHeader = (props2: any) => {
  const colors = useColors();
  return (
    <TabBar
      {...props2}
      scrollEnabled
      style={tabBarSty}
      tabStyle={{
        width: 'auto',
      }}
      inactiveColor={colors.text}
      activeColor={colors.primary}
      renderLabel={({ route, focused, color }) => (
        <Text
          numberOfLines={1}
          style={{
            width: rpx(160),
            fontWeight: focused ? fontWeightConst.bolder : fontWeightConst.medium,
            color,
            textAlign: 'center',
          }}>
          {route.title ?? '(未命名)'}
        </Text>
      )}
      indicatorStyle={{
        backgroundColor: colors.primary,
        height: rpx(4),
      }}
    />
  );
};

export default TabHeader;
