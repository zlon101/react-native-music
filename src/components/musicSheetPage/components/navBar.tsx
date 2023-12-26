import React from 'react';

import { ROUTE_PATH, useNavigate } from '@/entry/router';
import AppBar from '@/components/base/appBar';

interface IMenu {
  title: string;
  icon: string;
  onPress: (...args: any[]) => void;
}
interface INavBarProps {
  navTitle: string;
  musicList: IMusic.IMusicItem[] | null;
  moreMenu?: IMenu[];
  sheetInfo?: IMusic.IMusicSheetItemBase;
}

export default function (props: INavBarProps) {
  const navigate = useNavigate();
  const { navTitle, musicList = [], moreMenu = [], sheetInfo } = props;

  const actions = [
    {
      icon: 'magnify',
      onPress() {
        navigate(ROUTE_PATH.SEARCH_MUSIC_LIST, {
          musicList: musicList,
        });
      },
    },
  ];

  const menu = [
    {
      icon: 'playlist-edit',
      title: '批量编辑',
      onPress() {
        navigate(ROUTE_PATH.MUSIC_LIST_EDITOR, {
          musicList: musicList,
          musicSheet: {
            id: sheetInfo?.id,
            title: navTitle,
          },
        });
      },
    },
    ...moreMenu,
  ];

  return (
    <AppBar
      actions={actions}
      menu={menu}>
      {navTitle}
    </AppBar>
  );
}
