/**
 * 使用 Gitlab api 查询仓库信息
 * API 参考: https://docs.gitlab.com/ee/api/repositories.html
 * 获取参考文件目录: https://gitlab.com/api/v4/projects/{projectId}/repository/tree?recursive=true&ref=分支名
 * gitlab api url 中的 query 必须与文档上的一致，不能随意使用 encodeURIComponent
 * *******/

import { readDir, downloadFile } from 'react-native-fs';
import CustomPath from '@/constants/pathConst';
import { Log } from '@/utils/tool';

const baseURL = 'https://gitlab.com/api/v4';
const PRIVATE_TOKEN = 'glpat-4jvu2R5etMDtVXJsDx33';

const ProjectCfg = {
  projectId: 52878930,
  branch: 'main',
  rootDir: 'all',
};

const ReqHeader = {
  'PRIVATE-TOKEN': PRIVATE_TOKEN,
  'Access-Control-Allow-Credentials': 'true',
};

const RequestCfg = {
  method: 'GET',
};

const ReqParam = {
  private_token: PRIVATE_TOKEN,
  ref: ProjectCfg.branch,
};

/** 接口响应
"id": "bd5f98e9cde2eed45b255c3cd42da4f57f0a88d1",
"name": "faded.mp3",
"type": "blob",
"path": "all/faded.mp3",
"mode": "100644"
 **/

const MusicFileReg = /\.(mp3|m3u8)$/;

export async function getMusicList() {
  const param = {
    ...ReqParam,
    recursive: false,
    path: ProjectCfg.rootDir,
    // 分页配置
    per_page: 15,
  };
  const url = `${baseURL}/projects/${ProjectCfg.projectId}/repository/tree/?${formatQuery(param)}`;
  try {
    const response = await fetch(url, RequestCfg);
    const resJson = await response.json();
    return resJson.filter(item => /\.(mp3|m3u8)$/.test(item.name));
  } catch (err) {
    console.error('getAllMusic 错误', err);
  }
}

// 获取远程url
export function getRemoteUrl(musicName) {
  const musicPath = encodeURIComponent(`${ProjectCfg.rootDir}/${musicName}`);
  return `${baseURL}/projects/${ProjectCfg.projectId}/repository/files/${musicPath}/raw?${formatQuery(ReqParam)}`;
}

/**
 * ******************************
 * 对接插件管理
 * ***************************/

/****
interface IBuffFile {
  name: string; // 带有文件后缀
  path: string; // /storage/xxx/xxx.mp3
  size: number;
  isFile: () => boolean;
  isDirectory: () => boolean;
}**/

const BuffDir = CustomPath.downloadMusicPath;

class GitlabBuffClass {
  constructor() {
    // 缓存目录中存在的文件名（含后缀）
    this.buffNames = new Set();
  }

  has(name) {
    return this.buffNames.has(name);
  }
  // get a list of files and directories in the main bundle
  // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
  async read() {
    const musicFiles = [];
    try {
      const list = await readDir(BuffDir);
      list.forEach(item => {
        if (item.isFile()) {
          musicFiles.push({
            name: item.name,
            localPath: item.path,
          });
          this.buffNames.add(item.name);
        }
      });
      // Log('读取缓存 musicFiles:\n', musicFiles);
      return musicFiles;
    } catch (e) {
      Log(`读取 ${BuffDir} 失败：`, e);
      throw e;
    }
  }
  // fileName: xxx.mp3
  async write(fileName) {
    if (this.has(fileName)) return;

    const { promise } = downloadFile({
      fromUrl: getRemoteUrl(fileName),
      toFile: BuffDir + fileName,
      begin: arg => {},
      progress: arg => {},
    });
    try {
      await promise;
      // Log(`GitlabBuff.write(${fileName}) then`);
      this.buffNames.add(fileName);
    } catch (e) {
      Log(`下载 ${fileName} 失败，error:\n`, e);
    }
  }
}

export const GitlabBuff = new GitlabBuffClass();

export const GitlabPlugin = {
  methods: {
    getMediaSource(musicIten, quality) {
      const name = typeof musicIten === 'string' ? musicIten : musicIten.name;
      const FilePath = encodeURIComponent(`${ProjectCfg.rootDir}/${name}`);
      return {
        // url: `${baseURL}/projects/${ProjectCfg.projectId}/repository/files/${FilePath}/raw?${formatQuery(ReqParam)}`,
        url: BuffDir + name,
      };
    },
  },
};

// ========== 工具函数 =============
function formatQuery(val) {
  if (typeof val === 'string') {
    val = decodeURIComponent(val);
    return val.split('&').reduce((acc, itemStr) => {
      let [k, v] = itemStr.split('=');
      v = Number.isNaN(Number(v)) ? v : Number(v);
      acc[k] = v;
      return acc;
    }, {});
  }
  if (typeof val === 'object') {
    return Object.keys(val)
      .map(k => `${k}=${val[k]}`)
      .join('&');
  }
  return val;
}

// 下载单个 raw 文件
export async function downFile(fileName) {
  const FilePath = encodeURIComponent(fileName);
  const url = `${baseURL}/projects/${ProjectCfg.projectId}/repository/files/${FilePath}/raw?${formatQuery(ReqParam)}`;
  try {
    return await fetch(url, RequestCfg);
  } catch (err) {
    console.error('downFile 错误', err);
  }
}

// 获取单个 raw 文件
// 'mp3/少年.mp3'
export function getRawFileSource(fileName) {
  const FilePath = encodeURIComponent(fileName);
  return {
    headers: ReqHeader,
    uri: `${baseURL}/projects/${ProjectCfg.projectId}/repository/files/${FilePath}/raw?${formatQuery(ReqParam)}`,
  };
}
