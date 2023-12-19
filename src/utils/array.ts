export type IOrder = 'asc' | 'des' | 'random';
// 获取下一个数组索引
export function getNextIdx(pre: number, N: number, mode: IOrder = 'asc'): number {
  let next = -1;
  if (mode === 'asc') {
    next = pre + 1;
    return pre < 0 ? 0 : next % N;
  }
  if (mode === 'des') {
    next = (pre - 1) % N;
    return next < 0 ? N + (next % N) : next;
  }
  return generataRandom(0, N - 1) as number;
}

// 混淆
export function confused(arr: any[]) {
  const N = (arr || []).length;
  if (N < 2) {
    return arr;
  }
  return shuffle([...arr]);
}

// 洗牌算法
export function shuffle(arr: any[]) {
  let n = arr.length;
  let random = -1;
  while (0 != n) {
    random = (Math.random() * n--) >>> 0; // 无符号右移位运算符向下取整
    //或者改写成 random = Math.floor(Math.random() * n--)
    [arr[n], arr[random]] = [arr[random], arr[n]]; // ES6的解构赋值实现变量互换
  }
  return arr;
}

// 生成随机数
export function generataRandom(min: number, max: number, num = 1) {
  if (max < min) {
    throw new Error(`min: ${min} and max:${max} 不符合预期`);
  }
  if (max === min) {
    return min;
  }
  const len = max - min + 1;
  const fn = () => Math.floor(Math.random() * len + min);
  if (num < 2) {
    return fn();
  }
  const result = Array(num).fill(0);
  result.forEach((_, idx) => {
    result[idx] = fn();
  });
  return result;
}
