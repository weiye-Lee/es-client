import { DataSearchOrderItem, DataSearchQueryItem } from "$/elasticsearch-client";

interface ValueTypeResult {
  value: string;
  valueType: "string" | "number" | "boolean";
}

/**
 * 根据原始字符串值（可能带引号）解析出实际值和类型
 * @param rawValue 原始值字符串（如 "123", "'hello'", "true", "'true'"）
 * @returns 解析后的 { value: string, valueType: "string" | "number" | "boolean" }
 */
export function parseValueWithType(rawValue: string): ValueTypeResult {
  let value = rawValue;
  let valueType: "string" | "number" | "boolean";

  // 1. 如果是带单引号的字符串（包括空字符串 ''）
  if (value.startsWith("'") && value.endsWith("'")) {
    // 去除外层单引号（注意：内部的 '' 被视为转义，但此处仅做基础处理）
    value = value.slice(1, -1);
    valueType = "string";
  } else {
    // 2. 无引号：尝试推断类型
    if (value === "true" || value === "false") {
      valueType = "boolean";
      // value 保持为 "true" 或 "false" 字符串
    } else if (/^-?\d+(\.\d+)?$/.test(value)) {
      // 纯数字：整数或浮点数（支持负数）
      valueType = "number";
    } else {
      // 其他情况：视为字符串（即使没引号，如 abc、2025-01-01 等）
      valueType = "string";
    }
  }

  return { value, valueType };
}

/**
 * 条件构建方法
 * @param condition 条件字符串，例如：id = 1 ,name match '张三' , age >= 23
 * @returns 解析后的条件数组
 */
export function conditionBuild(condition: string): Array<DataSearchQueryItem> {
  if (!condition?.trim()) {
    return [];
  }

  // 按逗号分割条件项（允许逗号后有空格）
  const parts = condition.split(/,\s*/);

  const result: DataSearchQueryItem[] = [];

  for (const part of parts) {
    // 1) 支持的操作符：=, !=, >, >=, <, <=, eq, ne, gt, gte, lt, lte, term, match, like, in, exists, missing
    // 2) exists 和 missing 可不带值；其它操作符必须带值
    const fullMatch = part.match(
      /^\s*(\S+)\s+(=|!=|>=|<=|>|<|eq|ne|gt|gte|lt|lte|term|match|like|in|exists|missing)(?:\s+(.+?))?\s*$/
    );
    if (!fullMatch) {
      console.warn(`无法解析条件片段: "${part}"`);
      continue;
    }

    const [, field, operator, rawValue = ""] = fullMatch;

    if ((operator === "exists" || operator === "missing") && rawValue === "") {
      // exists / missing 不需要值
      result.push({ field, operator, value: "", valueType: "string" });
      continue;
    }

    if (rawValue === "" && operator !== "exists" && operator !== "missing") {
      console.warn(`操作符 \"${operator}\" 需要值: "${part}"`);
      continue;
    }

    const { value, valueType } = parseValueWithType(rawValue);
    result.push({ field, operator, value, valueType });
  }

  return result;
}

/**
 * 将条件数组转换为字符串表示
 * @param conditions 条件项数组
 * @returns 条件字符串，例如 "id = 1, name match '张三', active = true"
 */
export function conditionToString(conditions: DataSearchQueryItem[]): string {
  if (!conditions || conditions.length === 0) {
    return "";
  }

  const parts = conditions.map((item) => {
    const { field, operator, value, valueType } = item;

    // exists / missing 不带值
    if (operator === "exists" || operator === "missing") {
      return `${field} ${operator}`;
    }

    let formattedValue: string;

    if (valueType === "string") {
      // in 场景：值是逗号分隔列表，直接输出
      if (operator === "in") {
        formattedValue = value;
      } else {
        // 其他字符串类型：用单引号包裹（并转义内部单引号）
        formattedValue = `'${value.replace(/'/g, "''")}'`;
      }
    } else {
      // number 或 boolean：直接输出字面量（不加引号）
      formattedValue = value;
    }

    return `${field} ${operator} ${formattedValue}`;
  });

  return parts.join(", ");
}

/**
 * 排序条件构建方法
 * @param condition 排序字符串，例如："name asc, age desc"
 * @returns 解析后的排序项数组
 */
export function orderBuild(condition: string): Array<DataSearchOrderItem> {
  if (!condition?.trim()) {
    return [];
  }

  const parts = condition.split(/,\s*/);
  const result: DataSearchOrderItem[] = [];

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // 匹配字段和排序方向（不区分大小写）
    const match = trimmed.match(/^(\S+)\s+(asc|desc)$/i);
    if (!match) {
      console.warn(`无法解析排序片段: "${part}"，应为 "field asc" 或 "field desc"`);
      continue;
    }

    const field = match[1];
    const operator = match[2].toLowerCase() as "asc" | "desc";

    result.push({ field, operator });
  }

  return result;
}

/**
 * 将排序数组转换为字符串表示
 * @param orders 排序项数组
 * @returns 排序字符串，例如 "name asc, age desc"
 */
export function orderToString(orders: DataSearchOrderItem[]): string {
  if (!orders || orders.length === 0) {
    return "";
  }

  const parts = orders.map((item) => {
    return `${item.field} ${item.operator}`;
  });

  return parts.join(", ");
}

export function removeCondition(condition: string, field: string): string {
  return conditionToString(conditionBuild(condition).filter((item) => item.field !== field));
}

export function removeOrder(condition: string, field: string): string {
  return orderToString(orderBuild(condition).filter((item) => item.field !== field));
}

export function addCondition(condition: string, field: string, operator: string, value: string) {
  return conditionToString([
    ...conditionBuild(condition),
    { field, operator, ...parseValueWithType(value) }
  ]);
}

export function addOrder(condition: string, field: string, type: "asc" | "desc") {
  return orderToString([...orderBuild(condition), { field, operator: type }]);
}
