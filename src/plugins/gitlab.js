/**
 * 使用 Gitlab api 查询仓库信息
 * API 参考: https://docs.gitlab.com/ee/api/repositories.html
 * 获取参考文件目录: https://gitlab.com/api/v4/projects/{projectId}/repository/tree?recursive=true&ref=分支名
 * gitlab api url 中的 query 必须与文档上的一致，不能随意使用 encodeURIComponent
 * *******/

import { readDir, downloadFile, unlink, exists, mkdir, stopDownload, readFile } from 'react-native-fs';
import { PERMISSIONS, check } from 'react-native-permissions';
import CustomPath from '@/constants/pathConst';
import { supportLocalMediaType } from '@/constants/commonConst';
import { trace } from '@/utils/log';
import Toast from '@/utils/toast';
import { showDialog } from "@/components/dialogs/useDialog";

const baseURL = 'https://gitlab.com/api/v4';
const PRIVATE_TOKEN = '';

const ProjectCfg = {
  projectId: 52878930,
  branch: 'main',
  rootDir: 'music-琳',
};

const ReqHeader = {
  'PRIVATE-TOKEN': PRIVATE_TOKEN,
  // 'Access-Control-Allow-Credentials': 'true',
};

const RequestCfg = {
  method: 'GET',
};

const ReqParam = {
  private_token: PRIVATE_TOKEN,
  ref: ProjectCfg.branch,
};

const regStr = supportLocalMediaType.map(it => it.slice(1)).join('|');
export const MusicFileReg = new RegExp(`\\.(${regStr})$`, 'i'); // /\.(mp3|m3u8)$/

// 获取仓库目录结构
export const getRepositoryTree = async () => {
  const param = {
    ...ReqParam,
    recursive: false,
  };
  const url = `${baseURL}/projects/${ProjectCfg.projectId}/repository/tree/?${formatQuery(param)}`;
  try {
    const response = await fetch(url, RequestCfg);
    return await response.json();
  } catch (err) {
    trace('getRepositoryTree 错误', err, 'error');
  }
};

/**
 * 获取音乐列表
 * 手机屏幕一屏显示15个
 * 接口响应
 *   "id": "bd5f98e9cde2eed45b255c3cd42da4f57f0a88d1",
 *   "name": "faded.mp3",
 *   "type": "blob",
 *   "path": "all/faded.mp3",
 *   "mode": "100644"
 * **/
export async function getMusicList(page = 1, path) {
  const param = {
    ...ReqParam,
    // 是否递归查询
    recursive: false,
    path: path || ProjectCfg.rootDir,
    // 分页配置
    page,
    per_page: 30,
  };
  const url = `${baseURL}/projects/${ProjectCfg.projectId}/repository/tree/?${formatQuery(param)}`;
  try {
    const response = await fetch(url, RequestCfg);
    const resJson = await response.json();
    return resJson.filter(item => MusicFileReg.test(item.name));
  } catch (err) {
    trace('getAllMusic 错误', err, 'error');
  }
}

/**
 * 获取图像列表
 * **/
export async function getImageList(page = 1) {
  const param = {
    ...ReqParam,
    recursive: false,
    path: 'images',
    page,
    per_page: 300,
  };
  const url = `${baseURL}/projects/${ProjectCfg.projectId}/repository/tree/?${formatQuery(param)}`;
  try {
    const response = await fetch(url, RequestCfg);
    const resJson = await response.json();
    return resJson.filter(item => /\.(jpg|png|jpeg)$/i.test(item.name));
  } catch (err) {
    trace('getImageList 错误', err, 'error');
  }
}

/**
 * 下载单个 raw 文件
 * **/
export async function downFile(filePath, pId = ProjectCfg.projectId, ref = ReqParam.ref) {
  filePath = encodeURIComponent(filePath);
  const url = `${baseURL}/projects/${pId}/repository/files/${filePath}/raw?${formatQuery({ ...ReqParam, ref })}`;
  try {
    const response = await fetch(url, RequestCfg);
    return await response.json();
  } catch (err) {
    trace('downFile 错误', err, 'error');
  }
}

/**
 * 获取单个 raw 文件
 * @fileName: mp3/少年.mp3
 * https://gitlab.com/api/v4/projects/52878930/repository/files/images%2FWechatIMG29.jpg/raw?private_token=xxx&ref=main
 * **/
export function getFileUrl(filePath, projectId = ProjectCfg.projectId, ref = ProjectCfg.branch) {
  if (!filePath) return undefined;
  filePath = encodeURIComponent(filePath);
  return `${baseURL}/projects/${projectId}/repository/files/${filePath}/raw?${formatQuery({ ...ReqParam, ref })}`;
}

/**
 * 创建一个commit: https://docs.gitlab.com/ee/api/commits.html#create-a-commit-with-multiple-files-and-actions
 * ********/
async function createCommit(actions, commitMsg, pId = ProjectCfg.projectId, ref = ProjectCfg.branch) {
  const param = { ...ReqParam, ref };
  const url = `${baseURL}/projects/${pId}/repository/commits`;
  const body = JSON.stringify({
    branch: param.ref,
    commit_message: commitMsg,
    id: pId,
    actions,
  });
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { ...ReqHeader, 'Content-Type': 'application/json' },
      body,
    });
    return await response.json();
  } catch (err) {
    trace('createCommit 错误', err, 'error');
  }
}

/**
 * 上传文件
 * type IFiles = {path: string, type: "folder" | "file"}[];
 * *****/
export async function uploadLocalFiles(param) {
  let {files, dir, pId, ref} = param;
  files = files.filter(item => item.type === 'file');
  if (!files || !files.length) return Promise.resolve(true);

  const promises = Promise.all(files.map(fileItem => {
    return new Promise(async (resolve, reject) => {
      try {
        const str = await readFile(fileItem.path, 'base64');
        resolve(str);
      } catch (e) {
        reject(e);
      }
    });
  }));

  const promise= new Promise(async (resolve, reject) => {
    try {
      const fileContents = await promises;
      const fileNames = files.map(item => item.path.split('/').pop());
      const actions = fileContents.map((content, idx) => ({
        file_path: `${dir}/${fileNames[idx]}`,
        action: 'create',
        encoding: 'base64',
        content,
      }));
      // 上传
      await createCommit(actions, `上传 ${fileNames.join('、')}`, pId, ref);
      Toast.error(`成功上传${fileNames.join('、')}`);
      resolve();
    } catch (e) {
      trace('uploadLocalFiles 失败', e, 'error');
      Toast.error('上传失败');
      reject(e);
    }
  });

  return new Promise(resolve => {
    showDialog('LoadingDialog', {
      title: '上传本地文件',
      desc: '上传中...',
      promise,
      onResolve(data, hideDialog) {
        Toast.success('~ 上传成功 ~');
        hideDialog();
        resolve(true);
      },
      onCancel(hideDialog) {
        hideDialog();
        resolve(true);
      },
    });
  });
}

// 更新文件
export async function updateFile(filePath, content, pId = ProjectCfg.projectId, ref = ProjectCfg.branch) {
  filePath = encodeURIComponent(filePath);
  const param = {
    ...ReqParam,
    ref,
  };
  const url = `${baseURL}/projects/${pId}/repository/files/${filePath}?${formatQuery(param)}`;
  if (!content) {
    content = '';
  } else if (typeof content === 'object') {
    content = JSON.stringify(content, null, 2);
  }
  const body = JSON.stringify({
    branch: param.ref,
    commit_message: 'update todo-add.json',
    content,
    file_path: filePath,
    id: pId,
  });
  try {
    return await fetch(url, {
      method: 'PUT',
      headers: {
        ...ReqHeader,
        'Content-Type': 'application/json',
      },
      body,
    });
  } catch (err) {
    trace('updateFile 错误', err, 'error');
  }
}

// 删除文件
export async function delFiles(filePath, pId = ProjectCfg.projectId, ref = ProjectCfg.branch) {
  if (!filePath || !filePath?.length) return;
  if (!Array.isArray(filePath)) {
    filePath = [filePath];
  }
  const actions = filePath.map(s => ({
    file_path: s,
    action: 'delete',
  }));
  const names = filePath.map(item => item.split('/').pop());
  return createCommit(actions, `删除 ${names.join('、')}`, pId, ref);
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

/**
 * 文件缓存管理
 * ****************/
const BuffDir = CustomPath.localTmpBuff;

class GitlabBuffClass {
  constructor() {
    // 缓存目录是否存在
    this.buffDirExist = false;
    // 缓存目录中存在的文件名（含后缀）
    this.buffNames = new Set();
    // 正在下载的队列 Object<name, jobId>
    this.downloadQueue = [];
    // 是否有写文件权限
    this.writePermission = null;
  }
  has(name) {
    return this.buffNames.has(name);
  }
  async checkPermission() {
    if (this.writePermission !== null) {
      return this.writePermission;
    }
    const perm = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
    this.writePermission = perm === 'granted';
    return this.writePermission;
  }
  /**
   * get a list of files and directories in the main bundle
   * On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
   * **/
  async read() {
    await this.createDir();
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
      // trace('读取缓存 musicFiles:\n', musicFiles);
      return musicFiles;
    } catch (e) {
      trace(`读取 ${BuffDir} 失败`, e, 'error');
      throw e;
    }
  }
  /**
   * @fileName: xxx.mp3
   * ***/
  async write(filePath) {
    const fileName = filePath.split('/')[1];
    if (this.has(fileName) || this.downloadQueue.some(_it => _it.name === fileName)) {
      return;
    }
    let errMsg = '';
    const N = this.downloadQueue.length;
    if (N > 3) {
      errMsg = '下载队列超过3个，稍后重试！';
      for (let i = 0; i < N - 1; i++) {
        stopDownload(this.downloadQueue[i].jobId);
      }
      // Toast.warn(errMsg);
      // throw new Error(errMsg);
    }

    // 检查权限
    if (!(await this.checkPermission())) {
      errMsg = '权限不足，请检查是否授予写入文件的权限';
      Toast.warn(errMsg);
      throw new Error(errMsg);
    }

    const musicPath = encodeURIComponent(filePath);
    const fromUrl = `${baseURL}/projects/${ProjectCfg.projectId}/repository/files/${musicPath}/raw?${formatQuery(
      ReqParam,
    )}`;
    await this.createDir();
    const { jobId, promise } = downloadFile({
      fromUrl,
      toFile: BuffDir + fileName,
      begin: arg => {},
      progress: arg => {},
    });
    this.downloadQueue.push({ name: fileName, jobId });
    try {
      await promise;
      this.buffNames.add(fileName);
    } catch (e) {
      trace(`下载 ${fileName} 失败，error`, e, 'error');
    }
    this.downloadQueue = this.downloadQueue.filter(t => t.name !== fileName);
  }
  // 创建缓存目录
  async createDir() {
    if (this.buffDirExist) {
      return;
    }
    this.buffDirExist = await exists(BuffDir);
    if (!this.buffDirExist) {
      await mkdir(BuffDir);
    }
  }
  /**
   * 清空缓存目录中的文件
   * ***/
  async clear() {
    if (!(await this.checkPermission())) {
      Toast.warn('权限不足，请检查是否授予写入文件的权限');
      return;
    }
    try {
      await unlink(BuffDir);
      this.buffDirExist = false;
      await this.createDir();
    } catch (e) {
      trace(`删除 ${BuffDir} 失败`, e, 'error');
    }
  }
}

export const GitlabBuff = new GitlabBuffClass();

export const GitlabPlugin = {
  methods: {
    getMediaSource(musicIten, quality) {
      const name = typeof musicIten === 'string' ? musicIten : musicIten.name;
      // const FilePath = encodeURIComponent(`${ProjectCfg.rootDir}/${name}`);
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
