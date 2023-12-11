import React, { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import rpx from '@/utils/rpx';
import ListItem from '../base/listItem';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MusicQueue from '@/core/musicQueue';

import LocalMusicSheet from '@/core/localMusicSheet';
import { showPanel } from '../panels/usePanel';
import TitleAndTag from './titleAndTag';
import ThemeText from '../base/themeText';
import useColors from '@/hooks/useColors';

interface IMusicItemProps {
  index?: string | number;
  showMoreIcon?: boolean;
  musicItem: IMusic.IMusicItem;
  musicSheet?: IMusic.IMusicSheetItem;
  onItemPress?: (musicItem: IMusic.IMusicItem) => void;
  onItemLongPress?: () => void;
  itemPaddingRight?: number;
  left?: React.FC;
  containerStyle?: StyleProp<ViewStyle>;
  isActive?: boolean;
}
export default function MusicItem(props: IMusicItemProps) {
  const {
    musicItem,
    index,
    onItemPress,
    onItemLongPress,
    musicSheet,
    itemPaddingRight,
    showMoreIcon = true,
    left: Left,
    containerStyle,
    isActive,
  } = props;

  const colors = useColors();

  const desJsx = musicItem.artist && (
    <View style={styles.descContainer}>
      {LocalMusicSheet.isLocalMusic(musicItem) && (
        <Icon style={styles.icon} color="#11659a" name="check-circle" size={rpx(22)} />
      )}
      <ThemeText numberOfLines={1} fontSize="description" fontColor="textSecondary">
        {musicItem.artist}
        {musicItem.album ? ` - ${musicItem.album}` : ''}
      </ThemeText>
    </View>
  );

  const txtColor = isActive ? colors.textHighlight ?? colors.primary : colors.text;

  return (
    <ListItem
      heightType="big"
      style={containerStyle}
      withHorizonalPadding
      leftPadding={index !== undefined ? 0 : undefined}
      rightPadding={itemPaddingRight}
      onLongPress={onItemLongPress}
      onPress={() => {
        if (onItemPress) {
          onItemPress(musicItem);
        } else {
          MusicQueue.play(musicItem);
        }
      }}>
      {Left ? <Left /> : null}
      {index !== undefined ? (
        <ListItem.ListItemText
          width={rpx(82)}
          position="none"
          fixedWidth
          contentStyle={[styles.indexText, { color: txtColor }]}>
          {index}
        </ListItem.ListItemText>
      ) : null}
      <ListItem.Content
        color={txtColor}
        title={<TitleAndTag title={musicItem.title} tag={musicItem.platform} color={txtColor} />}
        description={desJsx}
      />
      {showMoreIcon ? (
        <ListItem.ListItemIcon
          width={rpx(48)}
          position="none"
          icon="dots-vertical"
          onPress={() => {
            showPanel('MusicItemOptions', {
              musicItem,
              musicSheet,
            });
          }}
        />
      ) : null}
    </ListItem>
  );
}

const styles = StyleSheet.create({
  icon: {
    marginRight: rpx(6),
  },
  descContainer: {
    flexDirection: 'row',
    marginTop: rpx(16),
  },

  indexText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
