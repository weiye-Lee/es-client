import { Field } from "../types";
import { IndexMapping, IndexMappingFieldMapping } from "$/shared/elasticsearch";

/**
 * 索引字段映射
 * @param mappings 映射
 * @param version 大版本
 * @returns  字段
 */
export function IndexFieldBuild(
  mappings: Record<string, IndexMapping> | IndexMapping,
  version: number
): Array<Field> {
  const fields = new Array<Field>();

  if (version <= 6) {
    // es版本小于6.0.0，则一定有类型
    // 全部类型
    const types = Object.keys(mappings);
    for (const type of types) {
      const mapping = (mappings as Record<string, IndexMapping>)[type];
      const properties = mapping.properties;
      const prefix = "";
      if (properties) {
        for (const key in properties) {
          buildField(key, properties[key], fields, prefix);
        }
      }
    }
  } else {
    // es版本是v7，则可能有，也可能没有
    // 情况 1: 直接有 properties → 无 type（v7 默认 / v8）
    if (mappings.properties && typeof mappings.properties === "object") {
      const properties = (mappings as IndexMapping).properties;
      const prefix = "";
      if (properties) {
        for (const key in properties) {
          buildField(key, properties[key], fields, prefix);
        }
      }
    }
    // 情况 2: 顶层是 type 名（如 _doc）→ 有 type（v6 / v7 兼容模式）
    else {
      const topLevelKeys = Object.keys(mappings);
      // 找第一个值包含 properties 的 key（v7 只有一个 type）
      for (const type of topLevelKeys) {
        const typeMapping = (mappings as Record<string, IndexMapping>)[type];
        if (typeMapping && typeMapping.properties && typeof typeMapping.properties === "object") {
          const properties = typeMapping.properties;
          const prefix = "";
          if (properties) {
            for (const key in properties) {
              buildField(key, properties[key], fields, prefix);
            }
          }
        }
      }
    }
  }

  return fields;
}

/**
 * 构建字段
 * @param name 字段名字
 * @param field 字段映射
 * @param fields 全部字段
 * @param prefix 前缀
 */
function buildField(
  name: string,
  field: IndexMappingFieldMapping,
  fields: Array<Field>,
  prefix: string
): void {
  // 实际的字段名
  let realName = name;
  if (prefix !== "") {
    realName = prefix + "." + name;
  }

  if ((!field.type || field.type === "object" || field.type === "nested") && field.properties) {
    // 如果是对象类型，构造下一代
    for (const key in field.properties) {
      buildField(key, field.properties[key], fields, realName);
    }
    return;
  }
  fields.push({
    // 值
    value: realName,
    // 显示标签
    label: realName,
    type: field.type
  });

  if (field.fields) {
    // 如果存在`fields`字段，则处理子字段
    for (const key in field.fields) {
      buildField(key, field.fields[key], fields, realName);
    }
  }
}
