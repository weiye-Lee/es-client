/**
 * 表示 Elasticsearch 中的时间值类型。
 * 必须是一个字符串，格式为数字 + 时间单位（如 "30s", "5m", "100ms"）。
 * 不能是纯数字（如 30），也不能是 ISO 8601 时间字符串。
 *
 * 支持的单位包括：
 * - 纳秒: 'nanos', 'nanosecond', 'nanoseconds'
 * - 微秒: 'micros', 'microsecond', 'microseconds'
 * - 毫秒: 'ms', 'millisecond', 'milliseconds'
 * - 秒: 's', 'second', 'seconds'
 * - 分钟: 'm', 'minute', 'minutes'
 * - 小时: 'h', 'hour', 'hours'
 * - 天: 'd', 'day', 'days'
 *
 * 示例有效值: "10s", "2m", "500ms", "1d"
 */
type ElasticsearchTimeValue = string & { readonly __elasticsearchTimeBrand: unique symbol };

// 辅助函数：用于在运行时构造合法的 time 值（可选）
export function createTimeValue(
  value: number,
  unit: "ms" | "s" | "m" | "h" | "d"
): ElasticsearchTimeValue {
  return `${value}${unit}` as ElasticsearchTimeValue;
}

// 使用示例接口
export interface IndexOpenOrCloseProp {
  /**
   * 请求超时时间，默认为 "30s"。
   * 指定等待每个节点响应的最长时间。
   */
  timeout?: ElasticsearchTimeValue;

  /**
   * 主节点超时时间，默认为 "30s"。
   * 指定等待主节点执行操作的最长时间。
   */
  master_timeout?: ElasticsearchTimeValue;

  /**
   * 如果索引不存在是否忽略错误，默认为 false。
   */
  ignore_unavailable?: boolean;

  /**
   * 当使用通配符且未匹配到任何索引时，是否不报错，默认为 true。
   */
  allow_no_indices?: boolean;
}
