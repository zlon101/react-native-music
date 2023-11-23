import React, {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import rpx, {vmax} from '@/utils/rpx';
import {fontSizeConst} from '@/constants/uiConst';
import Button from '@/components/base/button';
import useColors from '@/hooks/useColors';

import ThemeText from '@/components/base/themeText';
import {ScrollView, TextInput} from 'react-native-gesture-handler';
import PanelBase from '../base/panelBase';
import {hidePanel} from '../usePanel';
import Divider from '@/components/base/divider';

interface ISimpleInputProps {
    onOk: (text: string, closePanel: () => void) => void;
    hints?: string[];
    onCancel?: () => void;
    maxLength?: number;
    placeholder?: string;
}

export default function SimpleInput(props: ISimpleInputProps) {
    const {onOk, onCancel, placeholder, maxLength = 80, hints} = props;

    const [input, setInput] = useState('');
    const colors = useColors();

    return (
        <PanelBase
            height={vmax(30)}
            renderBody={() => (
                <>
                    <View style={style.opeartions}>
                        <Button
                            onPress={() => {
                                onCancel?.();
                                hidePanel();
                            }}>
                            取消
                        </Button>
                        <Button
                            onPress={async () => {
                                onOk(input, hidePanel);
                            }}>
                            确认
                        </Button>
                    </View>
                    <Divider />
                    <TextInput
                        value={input}
                        accessible
                        accessibilityLabel="输入框"
                        accessibilityHint={placeholder}
                        onChangeText={_ => {
                            setInput(_);
                        }}
                        style={[
                            style.input,
                            {
                                color: colors.text,
                                backgroundColor: colors.placeholder,
                            },
                        ]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder={placeholder ?? ''}
                        maxLength={maxLength}
                    />
                    <ScrollView>
                        {hints?.length ? (
                            <View style={style.hints}>
                                {hints.map((_, index) => (
                                    <ThemeText
                                        key={`hint-index-${index}`}
                                        style={style.hintLine}
                                        fontSize="subTitle"
                                        fontColor="textSecondary">
                                        ￮ {_}
                                    </ThemeText>
                                ))}
                            </View>
                        ) : null}
                    </ScrollView>
                </>
            )}
        />
    );
}

const style = StyleSheet.create({
    wrapper: {
        width: rpx(750),
    },
    opeartions: {
        width: rpx(750),
        paddingHorizontal: rpx(24),
        flexDirection: 'row',
        height: rpx(100),
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    input: {
        margin: rpx(24),
        borderRadius: rpx(12),
        fontSize: fontSizeConst.content,
        lineHeight: fontSizeConst.content * 1.5,
        padding: rpx(12),
    },
    hints: {
        marginTop: rpx(24),
        paddingHorizontal: rpx(24),
    },
    hintLine: {
        marginBottom: rpx(12),
    },
});
