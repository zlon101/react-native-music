import React, { useState } from 'react';
import useColors from '@/hooks/useColors';
import rpx from '@/utils/rpx';
import { StyleSheet, View } from 'react-native';
import ThemeText from '@/components/base/themeText';
import { ImgAsset } from '@/constants/assetsConst';
import { TouchableOpacity } from 'react-native';
// import {launchImageLibrary} from 'react-native-image-picker';
import pathConst from '@/constants/pathConst';
import Image from '@/components/base/image';
import { copyFile, exists, unlink } from 'react-native-fs';
import MusicSheet from '@/core/musicSheet';
import { addFileScheme, addRandomHash } from '@/utils/fileUtils';
import Toast from '@/utils/toast';
import { hideDialog } from '../useDialog';
import Dialog from './base';
import Input from '@/components/base/input';
import { fontSizeConst } from '@/constants/uiConst';
import Button from '@/components/base/button';

interface IEditSheetDetailProps {
  musicSheet: IMusic.IMusicSheetItem;
}
export default function EditSheetDetailDialog(props: IEditSheetDetailProps) {
  const { musicSheet } = props;
  const colors = useColors();

  const [coverImg, setCoverImg] = useState(musicSheet?.coverImg);
  const [title, setTitle] = useState(musicSheet?.title);

  // onCover

  const onChangeCoverPress = async () => {
    console.log('\n react-native-image-picker');
    // try {
    //   const result = await launchImageLibrary({
    //     mediaType: 'photo',
    //   });
    //   const uri = result.assets?.[0].uri;
    //   if (!uri) {
    //     return;
    //   }
    //   console.log(uri);
    //   setCoverImg(uri);
    // } catch (e) {
    //   console.log(e);
    // }
  };

  function onTitleChange(_: string) {
    setTitle(_);
  }

  async function onConfirm() {
    // 判断是否相同
    if (coverImg === musicSheet?.coverImg && title === musicSheet?.title) {
      hideDialog();
      return;
    }

    let _coverImg = coverImg;
    if (_coverImg && _coverImg !== musicSheet?.coverImg) {
      _coverImg = addFileScheme(
        `${pathConst.dataPath}sheet${musicSheet.id}${_coverImg.substring(_coverImg.lastIndexOf('.'))}`,
      );
      try {
        if (await exists(_coverImg)) {
          await unlink(_coverImg);
        }
        await copyFile(coverImg!, _coverImg);
      } catch (e) {
        console.log(e);
      }
    }
    let _title = title;
    if (!_title?.length) {
      _title = musicSheet.title;
    }
    // 更新歌单信息
    MusicSheet.updateAndSaveSheet(musicSheet.id, {
      basic: {
        coverImg: _coverImg ? addRandomHash(_coverImg) : undefined,
        title: _title,
      },
    }).then(() => {
      Toast.success('更新歌单信息成功~');
    });
    hideDialog();
  }

  return (
    <Dialog onDismiss={hideDialog}>
      <Dialog.Content style={style.content}>
        <View style={style.row}>
          <ThemeText>封面</ThemeText>
          <TouchableOpacity
            onPress={onChangeCoverPress}
            onLongPress={() => {
              setCoverImg(undefined);
            }}>
            <Image style={style.coverImg} uri={coverImg} emptySrc={ImgAsset.albumDefault} />
          </TouchableOpacity>
        </View>
        <View style={style.row}>
          <ThemeText>歌单名</ThemeText>
          <Input
            numberOfLines={1}
            textAlign="right"
            value={title}
            hasHorizonalPadding={false}
            onChangeText={onTitleChange}
            style={{
              height: fontSizeConst.content * 2.5,
              width: '50%',
              borderBottomWidth: 1,
              includeFontPadding: false,
              borderBottomColor: colors.text,
            }}
          />
        </View>
      </Dialog.Content>
      <Dialog.Actions>
        <Button withHorizonalPadding onPress={onConfirm}>
          确认
        </Button>
        <Button withHorizonalPadding onPress={hideDialog}>
          取消
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
}

const style = StyleSheet.create({
  content: {
    height: rpx(450),
  },
  row: {
    marginTop: rpx(28),
    height: rpx(120),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: rpx(12),
  },
  coverImg: {
    width: rpx(100),
    height: rpx(100),
    borderRadius: rpx(28),
  },
});
