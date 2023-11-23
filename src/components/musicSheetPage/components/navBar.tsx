import React from 'react';

import {ROUTE_PATH, useNavigate} from '@/entry/router';
import AppBar from '@/components/base/appBar';

interface INavBarProps {
    navTitle: string;
    musicList: IMusic.IMusicItem[] | null;
}

export default function (props: INavBarProps) {
    const navigate = useNavigate();
    const {navTitle, musicList = []} = props;

    return (
        <AppBar
            actions={[
                {
                    icon: 'magnify',
                    onPress() {
                        navigate(ROUTE_PATH.SEARCH_MUSIC_LIST, {
                            musicList: musicList,
                        });
                    },
                },
            ]}
            menu={[
                {
                    icon: 'playlist-edit',
                    title: '批量编辑',
                    onPress() {
                        navigate(ROUTE_PATH.MUSIC_LIST_EDITOR, {
                            musicList: musicList,
                            musicSheet: {
                                title: navTitle,
                            },
                        });
                    },
                },
            ]}>
            {navTitle}
        </AppBar>
    );
}
