import React, {memo} from 'react';
import rpx from '@/utils/rpx';
import searchResultStore, {ISearchLyricResult} from './searchResultStore';
import Empty from '@/components/base/empty';
import {EDeviceEvents, RequestStateCode} from '@/constants/commonConst';
import Loading from '@/components/base/loading';
import LyricItem from '@/components/mediaItem/LyricItem';
import ListReachEnd from '@/components/base/listReachEnd';
import {FlatList} from 'react-native-gesture-handler';
import Toast from '@/utils/toast';
import {associateLrc} from '@/utils/mediaItem';
import MusicQueue from '@/core/musicQueue';
import {hidePanel} from '../../usePanel';
import {DeviceEventEmitter} from 'react-native';

interface ILyricListWrapperProps {
    route: {
        key: string;
        title: string;
    };
}
export default function LyricListWrapper(props: ILyricListWrapperProps) {
    const hash = props.route.key;
    const dataStore = searchResultStore.useValue();
    return <LyricList data={dataStore.data[hash]} />;
}

interface ILyricListProps {
    data: ISearchLyricResult;
}

const ITEM_HEIGHT = rpx(120);
function LyricListImpl(props: ILyricListProps) {
    const data = props.data;
    const searchState = data?.state ?? RequestStateCode.IDLE;

    return searchState === RequestStateCode.PENDING_FP ? (
        <Loading />
    ) : (
        <FlatList
            getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
            })}
            renderItem={({item}) => (
                <LyricItem
                    lyricItem={item}
                    onPress={async () => {
                        try {
                            await associateLrc(
                                MusicQueue.getCurrentMusicItem(),
                                item,
                            );
                            DeviceEventEmitter.emit(
                                EDeviceEvents.REFRESH_LYRIC,
                            );
                            Toast.success('设置成功~');
                            hidePanel();
                            // 触发刷新歌词
                        } catch {
                            Toast.warn('设置失败!');
                        }
                    }}
                />
            )}
            ListEmptyComponent={<Empty />}
            ListFooterComponent={() => (
                // searchState === RequestStateCode.PENDING ? (
                //     <ListLoading />
                // ) : searchState === RequestStateCode.FINISHED ? (
                //     <ListReachEnd />
                // ) : (
                //     <></>
                // )
                <ListReachEnd />
            )}
            data={data?.data}
        />
    );
}

const LyricList = memo(LyricListImpl, (prev, curr) => prev.data === curr.data);
