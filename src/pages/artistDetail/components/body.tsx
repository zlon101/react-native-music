import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import rpx from '@/utils/rpx';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { fontWeightConst } from '@/constants/uiConst';
import ResultList from './resultList';
import { useAtomValue } from 'jotai';
import { queryResultAtom } from '../store/atoms';
import content from './content';
import useColors from '@/hooks/useColors';

const sceneMap: Record<string, React.FC> = {
  album: BodyContentWrapper,
  music: BodyContentWrapper,
};

const routes = [
  {
    key: 'music',
    title: '单曲',
  },
  {
    key: 'album',
    title: '专辑',
  },
];

export default function Body() {
  const [index, setIndex] = useState(0);
  const colors = useColors();

  return (
    <TabView
      lazy
      style={style.wrapper}
      navigationState={{
        index,
        routes,
      }}
      renderTabBar={props => (
        <TabBar
          {...props}
          style={style.transparentColor}
          tabStyle={{
            width: 'auto',
          }}
          renderIndicator={() => null}
          pressColor="transparent"
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
              {route.title}
            </Text>
          )}
        />
      )}
      renderScene={SceneMap(sceneMap)}
      onIndexChange={setIndex}
      initialLayout={{ width: rpx(750) }}
    />
  );
}

export function BodyContentWrapper(props: any) {
  const tab: IArtist.ArtistMediaType = props.route.key;
  const queryResult = useAtomValue(queryResultAtom);

  const Component = content[tab];
  const renderItem = ({ item, index }: any) => <Component item={item} index={index} />;

  return <ResultList tab={tab} data={queryResult[tab]} renderItem={renderItem} />;
}

const style = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  transparentColor: {
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    borderColor: 'transparent',
  },
});
