/**
 * 获取一个随机整数(包含 min,max)
 */
export function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
