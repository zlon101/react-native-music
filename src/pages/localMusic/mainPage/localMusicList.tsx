import React from 'react';
import MusicList from '@/components/musicList';
import LocalMusicSheet from '@/core/localMusicSheet';
import { localMusicSheetId } from '@/constants/commonConst';
import HorizonalSafeAreaView from '@/components/base/horizonalSafeAreaView';
import globalStyle from '@/constants/globalStyle';
import { Log } from '@/utils/tool';

export default function LocalMusicList() {
  const musicList = LocalMusicSheet.useMusicList();
  Log('本地音乐列表 \n', musicList);
  return (
    <HorizonalSafeAreaView style={globalStyle.flex1}>
      <MusicList
        musicList={musicList}
        showIndex
        musicSheet={{
          id: localMusicSheetId,
          title: '本地',
          musicList: musicList,
        }}
      />
    </HorizonalSafeAreaView>
  );
}
