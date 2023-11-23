import React, {useMemo, useRef, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import rpx from '@/utils/rpx';
import PanelBase from '../base/panelBase';
import LinearGradient from 'react-native-linear-gradient';
import Color from 'color';
import ThemeText from '@/components/base/themeText';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Button from '@/components/base/button';
import {hidePanel} from '../usePanel';
import Divider from '@/components/base/divider';
import {ImgAsset} from '@/constants/assetsConst';

interface IColorPickerProps {
    defaultColor?: string;
    onSelected?: (color: Color) => void;
    closePanelWhenSelected?: boolean;
}

const areaSize = rpx(420);

export default function ColorPicker(props: IColorPickerProps) {
    const {
        onSelected,
        defaultColor = '#66ccff',
        closePanelWhenSelected = true,
    } = props;

    const [currentHue, setCurrentHue] = useState(Color(defaultColor).hue());
    const [currentSaturation, setCurrentSaturation] = useState(
        Color(defaultColor).saturationl(),
    );
    const [currentLightness, setCurrentLightness] = useState(
        Color(defaultColor).lightness(),
    );
    const [currentAlpha, setCurrentAlpha] = useState(
        Color(defaultColor).alpha(),
    );

    const currentColor = useMemo(
        () => Color.hsl(currentHue, currentSaturation, currentLightness),
        [currentHue, currentSaturation, currentLightness],
    );

    const currentColorWithAlpha = useMemo(
        () => currentColor.alpha(currentAlpha),
        [currentColor, currentAlpha],
    );

    const slTap = Gesture.Tap()
        .onStart(event => {
            const {x, y} = event;

            const xRate = Math.min(1, Math.max(0, x / areaSize));
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentSaturation(xRate * 100);
            setCurrentLightness((1 - yRate) * 100);
        })
        .runOnJS(true);

    const lastTimestampRef = useRef(Date.now());
    const slPan = Gesture.Pan()
        .onUpdate(event => {
            const newTimeStamp = Date.now();
            if (newTimeStamp - lastTimestampRef.current > 33) {
                lastTimestampRef.current = newTimeStamp;
            } else {
                return;
            }
            const {x, y} = event;

            const xRate = Math.min(1, Math.max(0, x / areaSize));
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentSaturation(xRate * 100);
            setCurrentLightness((1 - yRate) * 100);
        })
        .runOnJS(true);

    const slComposed = Gesture.Race(slTap, slPan);

    const hueTap = Gesture.Tap()
        .onStart(event => {
            const {y} = event;
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentHue(yRate * 360);
        })
        .runOnJS(true);

    const huePan = Gesture.Pan()
        .onUpdate(event => {
            const {y} = event;
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentHue(yRate * 360);
        })
        .runOnJS(true);

    const hueComposed = Gesture.Race(hueTap, huePan);

    const alphaTap = Gesture.Tap()
        .onStart(event => {
            const {y} = event;
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentAlpha(1 - yRate);
        })
        .runOnJS(true);

    const alphaPan = Gesture.Pan()
        .onUpdate(event => {
            const {y} = event;
            const yRate = Math.min(1, Math.max(0, y / areaSize));
            setCurrentAlpha(1 - yRate);
        })
        .runOnJS(true);

    const alphaComposed = Gesture.Race(alphaTap, alphaPan);

    return (
        <PanelBase
            height={rpx(750)}
            renderBody={() => (
                <>
                    <View style={styles.opeartions}>
                        <Button
                            onPress={() => {
                                hidePanel();
                            }}>
                            取消
                        </Button>
                        <Button
                            onPress={async () => {
                                await onSelected?.(currentColorWithAlpha);
                                if (closePanelWhenSelected) {
                                    hidePanel();
                                }
                            }}>
                            确认
                        </Button>
                    </View>
                    <Divider />
                    <View style={styles.container}>
                        <GestureDetector gesture={slComposed}>
                            <View
                                style={[
                                    styles.slContainer,
                                    {
                                        backgroundColor: Color.hsl(
                                            currentHue,
                                            100,
                                            50,
                                        ).toString(),
                                    },
                                ]}>
                                <LinearGradient
                                    start={{x: 0, y: 0}}
                                    end={{x: 1, y: 0}}
                                    colors={['#808080', 'rgba(0,0,0,0)']}
                                    style={[styles.slContainer, styles.layer1]}
                                />
                                <LinearGradient
                                    start={{x: 0, y: 0}}
                                    end={{x: 0, y: 1}}
                                    colors={['#fff', 'rgba(0,0,0,0)', '#000']}
                                    style={[styles.slContainer, styles.layer2]}
                                />
                                <View
                                    style={[
                                        styles.slThumb,
                                        {
                                            left:
                                                -rpx(15) +
                                                (currentSaturation / 100) *
                                                    areaSize,
                                            bottom:
                                                -rpx(15) +
                                                (currentLightness / 100) *
                                                    areaSize,
                                            backgroundColor:
                                                currentColor.toString(),
                                        },
                                    ]}
                                />
                            </View>
                        </GestureDetector>
                        <GestureDetector gesture={hueComposed}>
                            <LinearGradient
                                start={{
                                    x: 0,
                                    y: 0,
                                }}
                                end={{
                                    x: 0,
                                    y: 1,
                                }}
                                colors={[
                                    '#f00',
                                    '#ff0',
                                    '#0f0',
                                    '#0ff',
                                    '#00f',
                                    '#f0f',
                                    '#f00',
                                ]}
                                style={styles.hueContainer}>
                                <View
                                    style={[
                                        styles.hueThumb,
                                        {
                                            top:
                                                -rpx(7) +
                                                (currentHue / 360) * areaSize,
                                        },
                                    ]}
                                />
                            </LinearGradient>
                        </GestureDetector>
                        <GestureDetector gesture={alphaComposed}>
                            <LinearGradient
                                start={{
                                    x: 0,
                                    y: 0,
                                }}
                                end={{
                                    x: 0,
                                    y: 1,
                                }}
                                colors={[
                                    currentColor.toString(),
                                    currentColor.alpha(0).toString(),
                                ]}
                                style={[
                                    styles.hueContainer,
                                    styles.alphaContainer,
                                ]}>
                                <View
                                    style={[
                                        styles.hueThumb,
                                        {
                                            top:
                                                -rpx(7) +
                                                (1 - currentAlpha) * areaSize,
                                        },
                                    ]}
                                />
                                <Image
                                    resizeMode="repeat"
                                    source={ImgAsset.transparentBg}
                                    style={styles.transparentBg}
                                />
                            </LinearGradient>
                        </GestureDetector>
                    </View>
                    <View style={styles.showArea}>
                        <View style={[styles.showBar]}>
                            <Image
                                resizeMode="repeat"
                                source={ImgAsset.transparentBg}
                                style={styles.transparentBg}
                            />
                            <View
                                style={[
                                    styles.showBarContent,
                                    {
                                        backgroundColor:
                                            currentColorWithAlpha.toString(),
                                    },
                                ]}
                            />
                        </View>
                        <ThemeText style={styles.colorStr}>
                            {currentColorWithAlpha.rgb().hexa().toString()}
                        </ThemeText>
                    </View>
                </>
            )}
        />
    );
}

const styles = StyleSheet.create({
    opeartions: {
        width: '100%',
        paddingHorizontal: rpx(36),
        flexDirection: 'row',
        height: rpx(100),
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    container: {
        width: '100%',
        paddingHorizontal: rpx(48),
        paddingTop: rpx(36),
        flexDirection: 'row',
    },
    slContainer: {
        width: areaSize,
        height: areaSize,
    },
    layer1: {
        position: 'absolute',
        zIndex: 1,
        left: 0,
        top: 0,
    },
    layer2: {
        position: 'absolute',
        zIndex: 2,
        left: 0,
        top: 0,
    },
    hueContainer: {
        width: rpx(48),
        height: areaSize,
        marginLeft: rpx(90),
    },
    alphaContainer: {
        marginLeft: rpx(48),
    },
    slThumb: {
        position: 'absolute',
        width: rpx(24),
        height: rpx(24),
        borderRadius: rpx(12),
        borderWidth: rpx(3),
        borderStyle: 'solid',
        borderColor: '#ccc',
        zIndex: 3,
    },
    hueThumb: {
        position: 'absolute',
        width: rpx(56),
        height: rpx(8),
        left: -rpx(4),
        top: 0,
        borderWidth: rpx(3),
        borderStyle: 'solid',
        borderColor: '#ccc',
    },
    showBar: {
        width: rpx(76),
        height: rpx(50),
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: '#ccc',
    },
    showBarContent: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
    },
    showArea: {
        width: '100%',
        marginTop: rpx(36),
        paddingHorizontal: rpx(48),
        flexDirection: 'row',
        alignItems: 'center',
    },
    colorStr: {
        marginLeft: rpx(24),
    },
    transparentBg: {
        position: 'absolute',
        zIndex: -1,
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
    },
});
