import React from 'react';
import {StyleSheet, View} from 'react-native';
import rpx from '@/utils/rpx';
import ThemeText from '@/components/base/themeText';
// import pathConst from '@/constants/pathConst';
import Config from '@/core/config';
// import Color from 'color';
// import {copyFile} from 'react-native-fs';
// import ImageColors from 'react-native-image-colors';
// import {launchImageLibrary} from 'react-native-image-picker';
import ThemeCard from './themeCard';
import {ROUTE_PATH, useNavigate} from '@/entry/router';
import Theme from '@/core/theme';

export default function Background() {
    const theme = Config.useConfig('setting.theme');

    const navigate = useNavigate();

    // const onCustomBgPress = async () => {
    //     try {
    //         const result = await launchImageLibrary({
    //             mediaType: 'photo',
    //         });
    //         const uri = result.assets?.[0].uri;
    //         if (!uri) {
    //             return;
    //         }

    //         const bgPath = `${pathConst.dataPath}background${uri.substring(
    //             uri.lastIndexOf('.'),
    //         )}`;
    //         await copyFile(uri, bgPath);
    //         Config.set(
    //             'setting.theme.background',
    //             `file://${bgPath}#${Date.now()}`,
    //         );

    //         const colorsResult = await ImageColors.getColors(uri, {
    //             fallback: '#ffffff',
    //         });
    //         const colors = {
    //             primary:
    //                 colorsResult.platform === 'android'
    //                     ? colorsResult.dominant
    //                     : colorsResult.platform === 'ios'
    //                     ? colorsResult.primary
    //                     : colorsResult.vibrant,
    //             average:
    //                 colorsResult.platform === 'android'
    //                     ? colorsResult.average
    //                     : colorsResult.platform === 'ios'
    //                     ? colorsResult.detail
    //                     : colorsResult.dominant,
    //             vibrant:
    //                 colorsResult.platform === 'android'
    //                     ? colorsResult.vibrant
    //                     : colorsResult.platform === 'ios'
    //                     ? colorsResult.secondary
    //                     : colorsResult.vibrant,
    //         };
    //         const primaryColor = Color(colors.primary).darken(0.3).toString();
    //         // const secondaryColor = Color(colors.average)
    //         //   .darken(0.3)
    //         //   .toString();
    //         const textHighlight = Color(
    //             0xffffff - Color(primaryColor).rgbNumber(),
    //             'rgb',
    //         )
    //             .saturate(0.5)
    //             .toString();
    //         Config.set('setting.theme.mode', 'custom-dark');
    //         Config.set('setting.theme.colors', {
    //             primary: primaryColor,
    //             textHighlight: textHighlight,
    //             accent: textHighlight,
    //         });
    //     } catch (e) {
    //         console.log(e);
    //     }
    // };

    return (
        <View>
            <ThemeText
                fontSize="subTitle"
                fontWeight="bold"
                style={style.header}>
                主题设置
            </ThemeText>
            <View style={style.sectionWrapper}>
                <ThemeCard
                    preview="#fff"
                    title="浅色模式"
                    selected={theme?.selectedTheme === 'p-light'}
                    onPress={() => {
                        if (theme?.selectedTheme !== 'p-light') {
                            Theme.setTheme('p-light');
                            Config.set('setting.theme.followSystem', false);
                        }
                    }}
                />
                <ThemeCard
                    preview="#131313"
                    title="深色模式"
                    selected={theme?.selectedTheme === 'p-dark'}
                    onPress={() => {
                        if (theme?.selectedTheme !== 'p-dark') {
                            Theme.setTheme('p-dark');
                            Config.set('setting.theme.followSystem', false);
                        }
                    }}
                />

                <ThemeCard
                    title="自定义背景"
                    selected={theme?.selectedTheme === 'custom'}
                    preview={theme?.background}
                    onPress={() => {
                        if (theme?.selectedTheme !== 'custom') {
                            Theme.setTheme('custom');
                            Config.set('setting.theme.followSystem', false);
                        }
                        navigate(ROUTE_PATH.SET_CUSTOM_THEME);
                        // showPanel('ColorPicker');
                    }}
                />

                {/* <ImageCard
                    emptySrc={ImgAsset.backgroundDefault}
                    onPress={() => {
                        Config.set('setting.theme.background', undefined);
                        Config.set('setting.theme.colors', undefined);
                    }}
                />
                <ImageCard
                    uri={theme?.background}
                    emptySrc={ImgAsset.addBackground}
                    onPress={onCustomBgPress}
                /> */}
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    header: {
        marginTop: rpx(36),
        paddingLeft: rpx(24),
    },
    sectionWrapper: {
        marginTop: rpx(28),
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: rpx(24),
    },
});
