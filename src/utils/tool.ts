export function Log(...args: any[]) {
  if (__DEV__) {
    console.log('\n\n🔥 ==========================================================');
    console.log(...args);
    console.log('\n\n');
  }
}

export function getType(val: any, expectType?: string): string | boolean {
  const reaType = Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
  if (expectType) {
    return expectType === reaType;
  }
  return reaType;
}
