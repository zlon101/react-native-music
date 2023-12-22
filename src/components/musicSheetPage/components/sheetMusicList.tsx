import React from 'react';
import { View } from 'react-native';
import Loading from '@/components/base/loading';
import Header from './header';
import MusicList from '@/components/musicList';
import Config from '@/core/config';
import MusicQueue from '@/core/musicQueue';
import globalStyle from '@/constants/globalStyle';
import HorizonalSafeAreaView from '@/components/base/horizonalSafeAreaView';

interface IMusicListProps {
  sheetInfo: IMusic.IMusicSheetItem | null;
  musicList?: IMusic.IMusicItem[] | null;
  onEndReached?: () => void;
  loadMore?: 'loading' | 'done' | 'idle';
  showHeader?: boolean;
  onItemPress?: (item: IMusic.IMusicItem, list: IMusic.IMusicItem[], index?: number) => void;
}

export default function SheetMusicList(props: IMusicListProps) {
  const { sheetInfo: topListDetail, onEndReached, loadMore, onItemPress } = props;
  const showHeader = props.showHeader || false;
  const musicList = props.musicList || topListDetail?.musicList;

  return (
    <View style={globalStyle.fwflex1}>
      {!musicList ? (
        <Loading />
      ) : (
        <HorizonalSafeAreaView style={globalStyle.fwflex1}>
          <MusicList
            showIndex
            loadMore={loadMore}
            Header={showHeader ? <Header topListDetail={topListDetail} musicList={musicList} /> : null}
            musicList={musicList}
            onItemPress={(musicItem, musicList, index) => {
              if (onItemPress) {
                onItemPress(musicItem, musicList as IMusic.IMusicItem[], index);
                return;
              }
              if (Config.get('setting.basic.clickMusicInAlbum') === '播放单曲') {
                MusicQueue.play(musicItem);
              } else {
                MusicQueue.playWithReplaceQueue(musicItem, musicList ?? [musicItem]);
              }
            }}
            onEndReached={() => {
              onEndReached?.();
            }}
          />
        </HorizonalSafeAreaView>
      )}
    </View>
  );
}
