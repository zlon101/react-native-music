import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import ToastMsg from 'react-native-toast-message';
import ThemeText from '@/components/base/themeText';
import VerticalSafeAreaView from '@/components/base/verticalSafeAreaView';
import AppBar from '@/components/base/appBar';
import globalStyle from '@/constants/globalStyle';
import { showDialog, hideDialog } from '@/components/dialogs/useDialog';
import { downFile, updateFile } from '@/plugins/gitlab';
import Icon from 'react-native-vector-icons/AntDesign';
import { colorMap } from '@/constants/uiConst';
import useColors from '@/hooks/useColors';
import Toast from '@/utils/toast';
import { trace } from '@/utils/log';
import rpx from '@/utils/rpx';

const FilePath = 'todo-add.json';

interface IPropsItem {
  item: string;
  index: number;
  onDel: (item: string, idx: number) => void;
}

const Item = (propsItem: IPropsItem) => {
  const { item, index, onDel } = propsItem;
  const colors = useColors();
  const size = rpx(36);

  return (
    <View style={styles.item}>
      <ThemeText style={styles.itemText}>
        {index}. {item}
      </ThemeText>
      <Icon name="delete" size={size} color={colors[colorMap.normal]} style={[{ minWidth: size }]} onPress={onDel} />
    </View>
  );
};

export default () => {
  // const navigate = useNavigate();
  const [list, setList] = useState<string[]>([]);
  const [updateDate, setUpdateDate] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const dialogOk = useCallback(
    async (musicName: string) => {
      if (loading || list.includes(musicName)) return;

      setLoading(true);
      hideDialog();
      ToastMsg.show({
        type: 'info',
        text1: '添加中...',
      });

      const _names = musicName.split('、').map(_n => _n.trim());
      const _newList = [...new Set(_names.concat(list))];
      // 没有新增的name
      if (_newList.length === list.length) {
        Toast.success('歌曲已存在');
        setLoading(false);
        ToastMsg.hide();
        return;
      }
      const obj = {
        date: new Date().toLocaleString(),
        list: _newList,
      };
      const res = await updateFile(FilePath, obj);
      if (res && res.status === 200) {
        getList();
        Toast.success('添加成功');
      } else {
        trace('添加失败', res, 'error');
      }
      setLoading(false);
      ToastMsg.hide();
    },
    [list],
  );

  const actions = useMemo(() => {
    return [
      {
        icon: 'playlist-plus',
        onPress() {
          showDialog('AddGitlabMusicDialog', {
            onOk: dialogOk,
          });
        },
      },
    ];
  }, [dialogOk]);

  const getList = useCallback(() => {
    downFile(FilePath).then((res: any) => {
      setList(res.list || []);
      setUpdateDate(res.date);
    });
  }, []);

  const rendItem = useCallback(
    (_p: any) => {
      return (
        <Item
          item={_p.item}
          index={_p.index}
          onDel={async () => {
            if (loading) return;

            setLoading(true);
            ToastMsg.show({
              type: 'info',
              text1: '删除中...',
            });
            const nContent = {
              list: list.filter(s => s !== _p.item),
              date: new Date().toLocaleString(),
            };
            const res = await updateFile(FilePath, nContent);
            if (res && res.status === 200) {
              Toast.success('删除成功');
              getList();
            } else {
              Toast.warn('删除失败');
            }
            setLoading(false);
            ToastMsg.hide();
          }}
        />
      );
    },
    [getList, list],
  );

  useEffect(() => {
    getList();
  }, []);

  return (
    <VerticalSafeAreaView style={globalStyle.fwflex1}>
      <AppBar actions={actions}>待添加歌曲</AppBar>
      <ThemeText style={styles.head}>下列歌曲请等待管理员添加，添加后自动删除，点击右上角图标可添加歌曲名称</ThemeText>
      <ThemeText style={[styles.head, {textAlign: 'right'}]}>{updateDate}</ThemeText>
      <View style={styles.listWrap}>
        {list.length ? (
          <FlatList data={list} renderItem={rendItem} keyExtractor={item => item} />
        ) : (
          <ThemeText style={styles.empty}>--- 列表为空 ---</ThemeText>
        )}
      </View>
    </VerticalSafeAreaView>
  );
};

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
  head: {
    textAlign: 'left',
    fontSize: rpx(24),
    marginBottom: rpx(10),
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: rpx(20),
    paddingHorizontal: rpx(16),
    borderBottomColor: '#fff',
    borderBottomWidth: rpx(1),
  },
  itemText: {
    fontSize: rpx(32),
  },
  empty: {
    textAlign: 'center',
    marginTop: rpx(40),
    fontSize: rpx(40),
  },
  loading: {
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
    position: 'absolute',
    zIndex: 999999999,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
