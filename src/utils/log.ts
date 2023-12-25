import { logger, fileAsyncTransport, consoleTransport } from 'react-native-logs';
import RNFS, { readDir, readFile } from 'react-native-fs';
import pathConst from '@/constants/pathConst';
import Config from '../core/config';
import { addLog } from '@/lib/react-native-vdebug/src/log';
import { getType } from '@/utils/tool';

const ISDEV = __DEV__; // __DEV__

const colorCfg = {
  info: '#fff',
  warn: 'yellowBright',
  error: 'redBright',
};

const DefaultLogCfg = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: ISDEV ? consoleTransport : fileAsyncTransport,
  stringifyFunc: function(msg: any) {
    if (msg && getType(msg, 'object')) {
      return '\n\n' + JSON.stringify(msg, null, 2);
    }
    return '\n\n' + msg;
  },
  async: true,
  dateFormat: 'local',
  printLevel: false,
  printDate: false,
  enabled: true,
};

const config = {
  ...DefaultLogCfg,
  transport: ISDEV ? consoleTransport : fileAsyncTransport,
  severity: ISDEV ? 'debug' : 'error',
  transportOptions: ISDEV ? {colors: colorCfg} : {
    colors: colorCfg,
    FS: RNFS,
    filePath: pathConst.logPath,
    fileName: `error-log-{date-today}.txt`,
  },
};

const traceConfig = {
  ...DefaultLogCfg,
  transportOptions: ISDEV ? {colors: colorCfg} : {
    colors: colorCfg,
    FS: RNFS,
    filePath: pathConst.logPath,
    fileName: `trace-log.txt`,
  },
};

const log = logger.createLogger(config);
const traceLogger = logger.createLogger(traceConfig);

export async function clearLog() {
  const files = await RNFS.readDir(pathConst.logPath);
  await Promise.all(
    files.map(async file => {
      if (file.isFile()) {
        try {
          await RNFS.unlink(file.path);
        } catch {}
      }
    }),
  );
}

export async function getErrorLogContent() {
  try {
    const files = await readDir(pathConst.logPath);
    const today = new Date();
    // 两天的错误日志
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const todayLog = files.find(
      _ =>
        _.isFile() &&
        _.path.endsWith(`error-log-${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}.log`),
    );
    const yesterdayLog = files.find(
      _ =>
        _.isFile() &&
        _.path.endsWith(`error-log-${yesterday.getDate()}-${yesterday.getMonth() + 1}-${yesterday.getFullYear()}.log`),
    );
    let logContent = '';
    if (todayLog) {
      logContent += await readFile(todayLog.path, 'utf8');
    }
    if (yesterdayLog) {
      logContent += await readFile(yesterdayLog.path, 'utf8');
    }
    return logContent;
  } catch {
    return '';
  }
}

export function trace(desc: string, message?: any, level: 'info' | 'error' = 'info') {
  // 记录详细日志
  if (ISDEV || Config.get('setting.basic.debug.traceLog')) {
    traceLogger[level](message ? {desc, message} : desc);
  }
  devLog(level, desc, message);
}

export function errorLog(desc: string, message: any) {
  // 记录错误日志
  if (ISDEV || Config.get('setting.basic.debug.errorLog')) {
    log.error(message ? {desc, message} : desc);
    trace(desc, message, 'error');
  }
  devLog('error', desc, message);
}

type ILevel = 'log' | 'error' | 'warn' | 'info';
export function devLog(method: ILevel, ...args: any[]) {
  // 调试面板
  if (ISDEV || Config.get('setting.basic.debug.devLog')) {
    addLog(method, args);
  }
}

export { log };
