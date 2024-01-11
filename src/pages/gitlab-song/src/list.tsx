import React, { useCallback, useEffect, useMemo, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {StyleSheet} from 'react-native';
import { TabView } from 'react-native-tab-view';
import { Radio } from 'native-base';
import { useImmer } from 'use-immer';
import {useMemoizedFn} from 'ahooks';
import { delFiles, getRepositoryTree, uploadLocalFiles } from "@/plugins/gitlab";
import NoPlugin from '@/components/base/noPlugin';
import VerticalSafeAreaView from '@/components/base/verticalSafeAreaView';
import globalStyle from '@/constants/globalStyle';
import NavBar from '@/components/musicSheetPage/components/navBar';
import { vw } from '@/utils/rpx';
import MusicBar from '@/components/musicBar';
import Loading from '@/components/base/loading';
import ThemeText from '@/components/base/themeText';
import { ROUTE_PATH, useNavigate } from '@/entry/router';
import { trace } from '@/utils/log';
import TabHeader from './tab-header';
import TabBody from './tab-body';
import { GitlabMusicSheetId } from '@/constants/commonConst';
import { hideDialog, showDialog } from "@/components/dialogs/useDialog";
import Toast from "@/utils/toast";

const styles = StyleSheet.create({
  radio: {
    marginBottom: 8,
  }
});

const UploadInput = forwardRef((props: any, ref) => {
  const opts = props.options || [];
  const [value, setValue] = useState('');

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return value;
      }
    };
  });

  return (
    <Radio.Group name="uploadDir" accessibilityLabel="选择将文件上传到哪个目录下"
      value={value}
      onChange={setValue}
    >
      {
        opts.map(item => <Radio style={styles.radio} value={item.filePath} key={item.title}>
          <ThemeText>{item.title}</ThemeText>
        </Radio>)
      }
    </Radio.Group>
  );
});

export default function GitlabPage() {
  const navigate = useNavigate();
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

  const inputRef = useRef<any>(null);
  const onUpload = useMemoizedFn(selectedFiles => {
    return new Promise<boolean>(async (resolve, _) => {
      showDialog('SimpleDialog', {
        title: '输入上传文件目录',
        content: <UploadInput ref={inputRef} options={routes.slice(1)} />,
        onOk: async () => {
          const uploadDir = inputRef.current.getValue();
          if (!uploadDir) {
            Toast.warn('请选择将文件上传到哪个目录');
            resolve(false);
            return;
          }
          try {
            await uploadLocalFiles({files: selectedFiles, dir: 'music-龙'});
            resolve(true);
          } catch (_) {
            resolve(true);
          }
        },
      });
    });
  });

  const navMenu = useMemo(() => {
    return [
      {
        title: '添加歌曲',
        icon: 'square-edit-outline',
        onPress: () => navigate(ROUTE_PATH.Add_Gitlab_Music),
      },
      {
        title: '上传歌曲',
        icon: 'cloud-upload-outline',
        async onPress() {
          navigate(ROUTE_PATH.FILE_SELECTOR, {
            fileType: 'file',
            multi: true,
            actionText: '开始上传',
            onAction: onUpload,
          });
        },
      },
    ];
  }, [onUpload]);

  if (pageState === 'loading') {
    return <Loading />;
  }
  if (pageState === 'empty') {
    return <NoPlugin notSupportType="未找到相关资源" />;
  }
  return (
    <VerticalSafeAreaView style={globalStyle.fwflex1}>
      <NavBar sheetInfo={{id: GitlabMusicSheetId, title: 'Gitlab'}} musicList={currentMusics} navTitle="Gitlab" moreMenu={navMenu} />
      <TabView
        lazy
        navigationState={{
          index,
          routes,
        }}
        renderTabBar={TabHeader}
        renderScene={args => <TabBody {...args} key={index} emitList={onUpdateList} getFilePath={getFilePath} />}
        onIndexChange={setIndex}
        initialLayout={{ width: vw(100) }}
        swipeEnabled={true}
        animationEnabled={false}
      />
      <MusicBar />
    </VerticalSafeAreaView>
  );
}
