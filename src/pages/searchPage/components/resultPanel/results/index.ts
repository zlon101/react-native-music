import React from 'react';
import AlbumResultItem from './albumResultItem';
import ArtistResultItem from './artistResultItem';
import MusicResultItem from './musicResultItem';
import MusicSheetResultItem from './musicSheetResultItem';

const results: Array<{
  key: ICommon.SupportMediaType;
  title: string;
  component: React.FC<any>;
}> = [
  {
    key: 'music',
    title: '单曲',
    component: MusicResultItem,
  },
  {
    key: 'album',
    title: '专辑',
    component: AlbumResultItem,
  },
  {
    key: 'artist',
    title: '作者',
    component: ArtistResultItem,
  },
  {
    key: 'sheet',
    title: '歌单',
    component: MusicSheetResultItem,
  },
];

const renderMap: Partial<Record<ICommon.SupportMediaType, React.FC<any>>> = {};
results.forEach(_ => (renderMap[_.key] = _.component));

export default results;
export { renderMap };
