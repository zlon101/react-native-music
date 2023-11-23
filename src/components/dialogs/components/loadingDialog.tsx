import React, {useEffect} from 'react';
import Loading from '@/components/base/loading';
import rpx from '@/utils/rpx';
import {StyleSheet} from 'react-native';
import {hideDialog} from '../useDialog';
import Dialog from './base';

interface ILoadingDialogProps<T extends any = any> {
    promise: Promise<T>;
    title: string;
    onResolve?: (data: T, hideDialog: () => void) => void;
    onReject?: (reason: any, hideDialog: () => void) => void;
    onCancel?: (hideDialog: () => void) => void;
}
export default function LoadingDialog(props: ILoadingDialogProps) {
    const {title, onResolve, onReject, promise, onCancel} = props;

    useEffect(() => {
        promise
            ?.then(data => {
                onResolve?.(data, hideDialog);
            })
            .catch(e => {
                onReject?.(e, hideDialog);
            });
    }, []);

    return (
        <Dialog onDismiss={hideDialog}>
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Content style={style.content}>
                <Loading text="扫描中..." />
            </Dialog.Content>
            <Dialog.Actions
                actions={[
                    {
                        title: '取消',
                        onPress() {
                            onCancel?.(hideDialog);
                        },
                    },
                ]}
            />
        </Dialog>
    );
}

const style = StyleSheet.create({
    content: {
        height: rpx(280),
    },
    cancelBtn: {
        marginRight: rpx(12),
        marginBottom: rpx(4),
    },
});
