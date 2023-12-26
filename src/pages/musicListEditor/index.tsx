import React, { useCallback, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import StatusBar from '@/components/base/statusBar';
import { useParams } from '@/entry/router';
import globalStyle from '@/constants/globalStyle';
import VerticalSafeAreaView from '@/components/base/verticalSafeAreaView';
import AppBar from '@/components/base/appBar';
import { GitlabMusicSheetId } from '@/constants/commonConst';
import { delFiles } from '@/plugins/gitlab';
import { trace } from '@/utils/log';
import { editingMusicListAtom, musicListChangedAtom } from './store/atom';
import Bottom from './components/bottom';
import Body from './components/body';
import { showDialog } from '@/components/dialogs/useDialog';
import Toast from '@/utils/toast';

interface ISelectItem {
  checked: boolean;
  musicItem: {
    id: string;
    name: string;
    path: string;
    [k: string]: any;
  }
}

export default function MusicListEditor() {
  const { musicSheet, musicList } = useParams<'music-list-editor'>();
  const setEditingMusicList = useSetAtom(editingMusicListAtom);
  const setMusicListChanged = useSetAtom(musicListChangedAtom);

  const onDel = useCallback(async (selected: ISelectItem[]) => {
    if (!selected || !selected?.length) return;
    const names = selected.map(item => item.musicItem.name.replace(/\.\w+$/i, '')).join('、');
    const paths = selected.map(item => item.musicItem.path);
    showDialog('SimpleDialog', {
      title: '删除歌曲',
      content: `确定删除【${names}】吗?`,
      onOk: async () => {
        const res: any = await delFiles(paths);
        if (res.stats && !res.status) {
          Toast.success('删除成功');
        } else {
          Toast.warn('删除失败');
        }
      },
    });
  }, []);

  const isGitlabSheet = musicSheet?.id === GitlabMusicSheetId;

  useEffect(() => {
    setEditingMusicList((musicList ?? []).map(_ => ({ musicItem: _, checked: false })));
    return () => {
      setEditingMusicList([]);
      setMusicListChanged(false);
    };
  }, []);

  return (
    <VerticalSafeAreaView style={globalStyle.fwflex1}>
      <StatusBar />
      <AppBar>{musicSheet?.title ?? '歌单'}</AppBar>
      <Body />
      <Bottom onDel={isGitlabSheet ? onDel : undefined} />
    </VerticalSafeAreaView>
  );
}
