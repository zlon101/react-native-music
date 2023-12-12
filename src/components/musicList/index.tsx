import React from 'react';
import { FlatListProps } from 'react-native';
import rpx from '@/utils/rpx';
import MusicQueue from '@/core/musicQueue';
import MusicItem from '../mediaItem/musicItem';
import Empty from '../base/empty';
import { FlashList } from '@shopify/flash-list';
import ListLoading from '../base/listLoading';
import ListReachEnd from '../base/listReachEnd';

interface IMusicListProps {
  /** 顶部 */
  Header?: FlatListProps<IMusic.IMusicItem>['ListHeaderComponent'] | null;
  /** 音乐列表 */
  musicList?: IMusic.IMusicItem[];
  /** 所在歌单 */
  musicSheet?: IMusic.IMusicSheetItem;
  /** 是否展示序号 */
  showIndex?: boolean;
  /** 点击 */
  onItemPress?: (musicItem: IMusic.IMusicItem, musicList?: IMusic.IMusicItem[], index?: number) => void;
  loadMore?: 'loading' | 'done' | 'idle';
  onEndReached?: () => void;
}
const ITEM_HEIGHT = rpx(120);

/** 音乐列表 */
export default function MusicList(props: IMusicListProps) {
  const { Header, musicList, musicSheet, showIndex, onItemPress, onEndReached, loadMore = 'idle' } = props;
  const currentMusic = MusicQueue.useCurrentMusicItem();

  const isActive = _item => currentMusic && currentMusic.id === _item.id;

  return (
    <FlashList
      ListHeaderComponent={Header}
      ListEmptyComponent={loadMore !== 'loading' ? Empty : null}
      ListFooterComponent={loadMore === 'done' ? ListReachEnd : loadMore === 'loading' ? ListLoading : null}
      data={musicList ?? []}
      keyExtractor={musicItem => `ml-${musicItem.id}${musicItem.platform}-${musicItem.title}`}
      estimatedItemSize={ITEM_HEIGHT}
      renderItem={({ index, item: musicItem }) => {
        return (
          <MusicItem
            musicItem={musicItem}
            index={showIndex ? index + 1 : undefined}
            isActive={isActive(musicItem)}
            musicSheet={musicSheet}
            onItemPress={() => {
              if (onItemPress) {
                onItemPress(musicItem, musicList, index);
              } else {
                MusicQueue.playWithReplaceQueue(musicItem, musicList ?? []);
              }
            }}
          />
        );
      }}
      onEndReached={() => {
        if (loadMore !== 'loading') {
          onEndReached?.();
        }
      }}
      onEndReachedThreshold={0.1}
    />
  );
}
