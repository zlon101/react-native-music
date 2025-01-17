import ArtistDetail from '@/pages/artistDetail';
import Downloading from '@/pages/downloading';
import FileSelector from '@/pages/fileSelector';
import LocalMusic from '@/pages/localMusic';
import MusicListEditor from '@/pages/musicListEditor';
import SearchMusicList from '@/pages/searchMusicList';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCallback } from 'react';
import AlbumDetail from '../pages/albumDetail';
import Home from '../pages/home';
import MusicDetail from '../pages/musicDetail';
import SearchPage from '../pages/searchPage';
import Setting from '../pages/setting';
import SheetDetail from '../pages/sheetDetail';
import { LogBox } from 'react-native';
import TopList from '@/pages/topList';
import TopListDetail from '@/pages/topListDetail';
import RecommendSheets from '@/pages/recommendSheets';
import PluginSheetDetail from '@/pages/pluginSheetDetail';
import History from '@/pages/history';
import SetCustomTheme from '@/pages/setCustomTheme';
import {GitlabMusicList, GitlabTodoAdd} from '@/pages/gitlab-song';

LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

/** 路由key */
export const ROUTE_PATH = {
  /** 主页 */
  HOME: 'home',
  /** 音乐播放页 */
  MUSIC_DETAIL: 'music-detail',
  /** 搜索页 */
  SEARCH_PAGE: 'search-page',
  /** 本地歌单页 */
  LOCAL_SHEET_DETAIL: 'local-sheet-detail',
  /** 专辑页 */
  ALBUM_DETAIL: 'album-detail',
  /** 歌手页 */
  ARTIST_DETAIL: 'artist-detail',
  /** 榜单页 */
  TOP_LIST: 'top-list',
  /** 榜单详情页 */
  TOP_LIST_DETAIL: 'top-list-detail',
  /** 设置页 */
  SETTING: 'setting',
  /** 本地音乐 */
  LOCAL: 'local',
  /** 正在下载 */
  DOWNLOADING: 'downloading',
  /** 从歌曲列表中搜索 */
  SEARCH_MUSIC_LIST: 'search-music-list',
  /** 批量编辑 */
  MUSIC_LIST_EDITOR: 'music-list-editor',
  /** 选择文件夹 */
  FILE_SELECTOR: 'file-selector',
  /** 推荐歌单 */
  RECOMMEND_SHEETS: 'recommend-sheets',
  /** 歌单详情 */
  PLUGIN_SHEET_DETAIL: 'plugin-sheet-detail',
  /** 历史记录 */
  HISTORY: 'history',
  /** 自定义主题 */
  SET_CUSTOM_THEME: 'set-custom-theme',
  /** Gitlab自建源 */
  Gitlab_List: 'gitlab-list',
  Add_Gitlab_Music: 'gitlab-add',
} as const;

type Valueof<T> = T[keyof T];
type RoutePaths = Valueof<typeof ROUTE_PATH>;

type IRoutes = {
  path: RoutePaths;
  component: (...args: any[]) => JSX.Element;
};

export const routes: Array<IRoutes> = [
  {
    path: ROUTE_PATH.HOME,
    component: Home,
  },
  {
    path: ROUTE_PATH.MUSIC_DETAIL,
    component: MusicDetail,
  },
  {
    path: ROUTE_PATH.TOP_LIST,
    component: TopList,
  },
  {
    path: ROUTE_PATH.TOP_LIST_DETAIL,
    component: TopListDetail,
  },
  {
    path: ROUTE_PATH.SEARCH_PAGE,
    component: SearchPage,
  },
  {
    path: ROUTE_PATH.LOCAL_SHEET_DETAIL,
    component: SheetDetail,
  },
  {
    path: ROUTE_PATH.ALBUM_DETAIL,
    component: AlbumDetail,
  },
  {
    path: ROUTE_PATH.ARTIST_DETAIL,
    component: ArtistDetail,
  },
  {
    path: ROUTE_PATH.SETTING,
    component: Setting,
  },
  {
    path: ROUTE_PATH.LOCAL,
    component: LocalMusic,
  },
  {
    path: ROUTE_PATH.DOWNLOADING,
    component: Downloading,
  },
  {
    path: ROUTE_PATH.SEARCH_MUSIC_LIST,
    component: SearchMusicList,
  },
  {
    path: ROUTE_PATH.MUSIC_LIST_EDITOR,
    component: MusicListEditor,
  },
  {
    path: ROUTE_PATH.FILE_SELECTOR,
    component: FileSelector,
  },
  {
    path: ROUTE_PATH.RECOMMEND_SHEETS,
    component: RecommendSheets,
  },
  {
    path: ROUTE_PATH.PLUGIN_SHEET_DETAIL,
    component: PluginSheetDetail,
  },
  {
    path: ROUTE_PATH.HISTORY,
    component: History,
  },
  {
    path: ROUTE_PATH.SET_CUSTOM_THEME,
    component: SetCustomTheme,
  },
  {
    path: ROUTE_PATH.Gitlab_List,
    component: GitlabMusicList,
  },
  {
    path: ROUTE_PATH.Add_Gitlab_Music,
    component: GitlabTodoAdd,
  },
];

type RouterParamsBase = Record<RoutePaths, any>;
/** 路由参数 */
interface RouterParams extends RouterParamsBase {
  home: undefined;
  'music-detail': undefined;
  'search-page': undefined;
  'local-sheet-detail': {
    id: string;
  };
  'album-detail': {
    albumItem: IAlbum.IAlbumItem;
  };
  'artist-detail': {
    artistItem: IArtist.IArtistItem;
    pluginHash: string;
  };
  setting: {
    type: string;
  };
  local: undefined;
  downloading: undefined;
  'search-music-list': {
    musicList: IMusic.IMusicItem[] | null;
    musicSheet?: IMusic.IMusicSheetItem;
  };
  'music-list-editor': {
    musicSheet?: Partial<IMusic.IMusicSheetItem>;
    musicList: IMusic.IMusicItem[] | null;
  };
  'file-selector': {
    fileType?: 'folder' | 'file' | 'file-and-folder'; // 10: folder 11: file and folder,
    multi?: boolean; // 是否多选
    actionText?: string; // 底部行动点的文本
    actionIcon?: string; // 底部行动点的图标
    onAction?: (
      selectedFiles: {
        path: string;
        type: 'file' | 'folder';
      }[],
    ) => Promise<boolean>; // true会自动关闭，false会停在当前页面
    matchExtension?: (path: string) => boolean;
  };
  'top-list-detail': {
    pluginHash: string;
    topList: IMusic.IMusicSheetItemBase;
  };
  'plugin-sheet-detail': {
    pluginHash: string;
    sheetInfo: IMusic.IMusicSheetItemBase;
  };
}

/** 路由参数Hook */
export function useParams<T extends RoutePaths>(): RouterParams[T] {
  const route = useRoute<any>();
  return route?.params as RouterParams[T];
}

/** 导航 */
export function useNavigate() {
  const navigation = useNavigation<any>();

  const navigate = useCallback(function <T extends RoutePaths>(route: T, params?: RouterParams[T]) {
    navigation.navigate(route, params);
  }, []);

  return navigate;
}
