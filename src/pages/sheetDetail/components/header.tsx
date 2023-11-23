import React from 'react';
import {StyleSheet, View} from 'react-native';
import rpx from '@/utils/rpx';
import MusicSheet from '@/core/musicSheet';
import ThemeText from '@/components/base/themeText';
import {ImgAsset} from '@/constants/assetsConst';
import FastImage from '@/components/base/fastImage';
import {useParams} from '@/entry/router';
import PlayAllBar from '@/components/base/playAllBar';
import useColors from '@/hooks/useColors';

export default function Header() {
    const {id = 'favorite'} = useParams<'local-sheet-detail'>();
    const sheet = MusicSheet.useSheets(id);
    const colors = useColors();

    return (
        <View style={{backgroundColor: colors.card}}>
            <View style={style.content}>
                <FastImage
                    style={style.coverImg}
                    uri={sheet?.coverImg}
                    emptySrc={ImgAsset.albumDefault}
                />
                <View style={style.details}>
                    <ThemeText fontSize="title">{sheet?.title}</ThemeText>
                    <ThemeText fontColor="textSecondary" fontSize="subTitle">
                        共{sheet?.musicList.length ?? 0}首
                    </ThemeText>
                </View>
            </View>
            <PlayAllBar musicList={sheet.musicList} sheetName={sheet.title} />
        </View>
    );
}

const style = StyleSheet.create({
    content: {
        width: '100%',
        height: rpx(300),
        paddingHorizontal: rpx(24),
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    coverImg: {
        width: rpx(210),
        height: rpx(210),
        borderRadius: rpx(24),
    },
    details: {
        paddingHorizontal: rpx(36),
        flex: 1,
        height: rpx(140),
        justifyContent: 'space-between',
    },
});
