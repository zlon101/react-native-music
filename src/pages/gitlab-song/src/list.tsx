import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { TabView } from 'react-native-tab-view';
import { useImmer } from 'use-immer';
import { getImageList, getRepositoryTree } from '@/plugins/gitlab';
import NoPlugin from '@/components/base/noPlugin';
import VerticalSafeAreaView from '@/components/base/verticalSafeAreaView';
import globalStyle from '@/constants/globalStyle';
import NavBar from '@/components/musicSheetPage/components/navBar';
import { vw } from '@/utils/rpx';
import MusicBar from '@/components/musicBar';
import Loading from '@/components/base/loading';
import { confused } from '@/utils/array';
import { ROUTE_PATH, useNavigate } from '@/entry/router';
import { trace } from '@/utils/log';
import TabHeader from './tab-header';
import TabBody, { IGitlabResponseItem } from './tab-body';

export default function GitlabPage() {
  const [index, setIndex] = useState(0);
  const [pageState, setPageState] = useState<'loading' | 'empty' | 'normal'>('loading');
  // 所有music目录
  const [musicDirs, setMusicDirs] = useState<
    {
      label: string;
      filePath: string;
      title: string;
      key: string;
    }[]
  >([]);
  const [imgs, setImgs] = useState<IGitlabResponseItem[]>([]);

  const [listStore, updateListStore] = useImmer<any>({});

  const routes: any[] = useMemo(() => {
    return [
      {
        title: '全部',
        key: 'all',
        filePath: '',
      },
      ...musicDirs,
    ];
  }, [musicDirs]);

  const routeKey = routes[index]?.key;

  useEffect(() => {
    getRepositoryTree().then(list => {
      const dirs = (list || []).filter(_i => _i.type === 'tree' && /^music-/.test(_i.name));
      if (!dirs.length) {
        setPageState('empty');
        return;
      }
      dirs.forEach(_i => {
        _i.title = _i.name.split('-')[1];
        _i.key = _i.path;
        _i.filePath = _i.path;
      });
      setMusicDirs(dirs);
      setPageState('normal');
    });
    getImageList()
      .then(_imgs => {
        setImgs(confused(_imgs));
      })
      .catch(imgErr => {
        trace(`获取封面失败\n`, imgErr);
      });
  }, []);

  const onUpdateList = useCallback((routeKey, payload: { list: any; loadAll: boolean }) => {
    updateListStore(draft => {
      draft[routeKey] = payload;
    });
  }, []);

  // 全部加载
  const [nowDirLoadForAll, setNowDirLoadForAll] = useState(0);
  const getFilePath = useCallback(
    (nextDir?: boolean) => {
      // trace('1 musicDirs:\n%o nowDirLoadForAll:%d', musicDirs, nowDirLoadForAll);
      if (!musicDirs || !musicDirs.length) {
        return 'null';
      }
      if (nextDir) {
        // trace('切换到下一个目录，当前目录:', nowDirLoadForAll);
        // 所有目录全部加载
        if (nowDirLoadForAll >= musicDirs.length - 1) {
          return 'load_all_finished';
        }
        setNowDirLoadForAll(nowDirLoadForAll + 1);
        return musicDirs[nowDirLoadForAll + 1].filePath;
      }
      return musicDirs[nowDirLoadForAll]?.filePath;
    },
    [musicDirs, nowDirLoadForAll],
  );

  const currentMusics = listStore[routeKey]?.list || [];

  const navigate = useNavigate();
  const navMenu = useMemo(() => {
    return [
      {
        title: '添加歌曲',
        icon: 'square-edit-outline',
        onPress: () => navigate(ROUTE_PATH.Add_Gitlab_Music),
      },
    ];
  }, []);

  if (pageState === 'loading') {
    return <Loading />;
  }
  if (pageState === 'empty') {
    return <NoPlugin notSupportType="未找到相关资源" />;
  }
  return (
    <VerticalSafeAreaView style={globalStyle.fwflex1}>
      <NavBar musicList={currentMusics} navTitle="Gitlab" moreMenu={navMenu} />
      <TabView
        lazy
        navigationState={{
          index,
          routes,
        }}
        renderTabBar={TabHeader}
        renderScene={args => <TabBody {...args} key={index} imgs={imgs} emitList={onUpdateList} getFilePath={getFilePath} />}
        onIndexChange={setIndex}
        initialLayout={{ width: vw(100) }}
        swipeEnabled={true}
        animationEnabled={false}
      />
      <MusicBar />
    </VerticalSafeAreaView>
  );
}
