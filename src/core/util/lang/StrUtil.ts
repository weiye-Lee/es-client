/**
 * 仅替换字符串开头的指定子串
 * @param source 原始字符串
 * @param search 要查找的子串（仅匹配开头）
 * @param replacement 替换为的子串
 * @returns 替换后的字符串
 */
export function replaceStart(source: string, search: string, replacement: string): string {
  if (source.startsWith(search)) {
    return replacement + source.slice(search.length);
  }
  return source;
}

/**
 * 比较两个语义化版本号
 * @param v1 第一个版本号（如 "1.10.5"）
 * @param v2 第二个版本号（如 "1.9.0"）
 * @returns 若 v1 > v2 返回 1；v1 < v2 返回 -1；相等返回 0
 */
export function compareVersion(v1: string, v2: string): number {
  // 移除可能的前导/尾随空格，并按 '.' 拆分
  const parts1 = v1.trim().split(".").map(Number);
  const parts2 = v2.trim().split(".").map(Number);

  // 获取最大长度，用于补齐较短的版本号
  const len = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < len; i++) {
    // 如果某一段不存在，默认为 0（例如 1.9 等价于 1.9.0）
    const num1 = i < parts1.length ? parts1[i] : 0;
    const num2 = i < parts2.length ? parts2[i] : 0;

    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }

  return 0; // 所有段都相等
}
