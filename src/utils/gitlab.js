/**
 * 使用 Gitlab api 查询仓库信息
 * API 参考
 * 获取参考文件目录: https://gitlab.com/api/v4/projects/{projectId}/repository/tree?recursive=true&ref=分支名
 * *******/

const baseURL = 'https://gitlab.com/api/v4';
const PRIVATE_TOKEN = 'glpat-imi_R2KcYyFpyeKzj8ze';
const Branch = 'master';
const ProjectId = 48952022;

const cfg = {
  method: 'GET',
  headers: {
    'PRIVATE-TOKEN': PRIVATE_TOKEN,
  },
};

export async function getAllMusic() {
  const param = {
    recursive: false,
    ref: 'master',
    path: 'mp3',
    // 分页配置
    per_page: 300,
  };
  let url = `${baseURL}/projects/${ProjectId}/repository/tree/?${formatQuery(param)}`;
  // gitlab api url 中的 query 必须与文档上的一致
  url = decodeURIComponent(url);
  try {
    const response = await fetch(url, cfg);
    const resJson = await response.json();
    // mp3/xxx  /mp3\//.test(item.path)
    return resJson.filter(item => item.type === 'blob').map(item => ({ ...item, key: item.name }));
  } catch (err) {
    console.error('getAllMusic 错误', err);
  }
}

// 下载单个 raw 文件
export async function downFile(fileName) {
  const FilePath = encodeURIComponent(fileName);
  const url = `${baseURL}/projects/${ProjectId}/repository/files/${FilePath}/raw?ref=${Branch}`;
  try {
    return await fetch(url, cfg);
  } catch (err) {
    console.error('downFile 错误', err);
  }
}

// 获取单个 raw 文件
// 'mp3/少年.mp3'
export function getRawFileSource(fileName) {
  const FilePath = encodeURIComponent(fileName);
  return {
    headers: {
      'PRIVATE-TOKEN': PRIVATE_TOKEN,
      'Access-Control-Allow-Credentials': 'true',
    },
    uri: `${baseURL}/projects/${ProjectId}/repository/files/${FilePath}/raw?ref=${Branch}`,
  };
}

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
    return encodeURIComponent(
      Object.keys(val)
        .map(k => `${k}=${val[k]}`)
        .join('&'),
    );
  }
  return val;
}
