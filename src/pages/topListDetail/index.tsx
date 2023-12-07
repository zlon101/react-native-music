import React from 'react';
import useTopListDetail from './hooks/useTopListDetail';
import { useParams } from '@/entry/router';
import MusicSheetPage from '@/components/musicSheetPage';

export default function TopListDetail() {
  const { pluginHash, topList } = useParams<'top-list-detail'>();
  const topListDetail = useTopListDetail(topList, pluginHash);

  return <MusicSheetPage navTitle="榜单" sheetInfo={topListDetail} />;
}

const topListDetailDemo = {
  id: '19723756',
  coverImg: 'http://p2.music.126.net/pcYHpMkdC69VVvWiynNklA==/109951166952713766.jpg?param=40y40',
  title: '飙升榜',
  description: '刚刚更新',
  musicList: [
    {
      id: 2024600749,
      artwork: 'https://p2.music.126.net/lYjEBXsQOaxwbGNpOfHF3Q==/109951168374734405.jpg',
      title: 'Eutopia',
      artist: '布和笛箫',
      album: 'Eutopia（笛子版）',
      url: 'https://music.163.com/song/media/outer/url?id=2024600749.mp3',
      qualities: {
        low: {},
        standard: {},
        high: {},
        super: {},
      },
      copyrightId: 0,
      platform: '网易云',
    },
  ],
};
