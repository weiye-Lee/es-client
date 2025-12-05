import { IndexMapping } from "$/shared/elasticsearch";

/**
 * 索引类型构造器，将索引类型扁平化
 * 至少存在一个_doc的类型
 *
 * @param mappings 索引映射
 * @param version 当前版本
 */
export const indexTypeBuild = (
  mappings: Record<string, IndexMapping> | IndexMapping,
  version: number
): Array<string> => {
  if (version <= 6) {
    // es版本小于6.0.0，则一定有类型
    // 全部类型
    return Object.keys(mappings);
  } else if (version >= 8) {
    return ["_doc"];
  } else {
    if (mappings.properties && typeof mappings.properties === "object") {
      return Object.keys(mappings);
    } else {
      return ["_doc"];
    }
  }
};
