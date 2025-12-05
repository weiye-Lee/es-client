// 预定义分析器（如 "standard", "keyword", "whitespace"）
type PredefinedAnalyzer = string;

// 自定义分析器
export interface CustomAnalyzer {
  type: "custom";
  tokenizer: string;
  filter?: string[];
  char_filter?: string[];
  position_increment_gap?: number;
}

// normalizer（用于 keyword 字段）
export interface CustomNormalizer {
  type: "custom";
  filter: string[];
}

/**
 * Elasticsearch 索引 Settings 的完整 TypeScript 类型定义
 * 覆盖 ES 7.x / 8.x 主流配置，标注静态/动态、版本差异和用途说明
 */
export interface IndexSettings {
  // =============================
  // 🔹 1. 索引结构（静态设置 - 创建后不可修改）
  // =============================

  /**
   * 主分片数量（静态）
   * - ES 6 默认: 5
   * - ES 7+ 默认: 1
   * - 创建后不可更改
   */
  number_of_shards?: number;

  /**
   * 路由分区大小（静态）
   * 仅在使用自定义 _routing 时有效，必须 <= number_of_shards
   */
  routing_partition_size?: number;

  /**
   * 存储编解码器（静态）
   * - `default`: 使用 LZ4 压缩（推荐）
   * - `best_compression`: 更高压缩率（写入慢）
   */
  codec?: "default" | "best_compression";

  /**
   * 是否预加载 bitset 过滤器（静态）
   * 适用于频繁使用 exists / missing 查询的场景
   */
  load_fixed_bitset_filters_eagerly?: boolean;

  /**
   * 索引模式（ES 8.8+，静态）
   * - `time_series`: 启用时间序列数据库功能（TSDB）
   * - `logs`, `metrics`: 未来可能扩展
   */
  mode?: "time_series" | "logs" | "metrics";

  /**
   * 是否为隐藏索引（ES 7.7+，静态）
   * 隐藏索引在 `GET /_cat/indices` 等 API 中默认不显示
   */
  hidden?: boolean;

  // =============================
  // 🔹 2. 副本与分配（动态）
  // =============================

  /**
   * 副本分片数量（动态）
   * 可随时修改，影响高可用性和读吞吐
   */
  number_of_replicas?: number;

  /**
   * 分片分配规则（动态）
   * 控制分片分配到哪些节点
   * 示例: { "require": { "_name": "node-1" } }
   */
  "routing.allocation"?: {
    /**
     * 必须满足的属性（如 _name, _ip, custom_attr）
     */
    require?: Record<string, string>;
    /**
     * 可选满足的属性
     */
    include?: Record<string, string>;
    /**
     * 排除的节点属性
     */
    exclude?: Record<string, string>;
    /**
     * 分配超时（如 "1m"）
     */
    total_shards_per_node?: number;
    /**
     * 等待超时（如 "10m"）
     */
    disk?: {
      watermark_low?: string;
      watermark_high?: string;
      watermark_flood_stage?: string;
    };
  };

  /**
   * 分片延迟分配时间（动态）
   * 节点离线后，多久才开始重新分配分片（避免抖动）
   * 默认: "1m"
   */
  "unassigned.node_left.delayed_timeout"?: string;

  // =============================
  // 🔹 3. 刷新与写入性能（动态）
  // =============================

  /**
   * 刷新间隔（动态）
   * - "1s": 默认，每秒使新数据可搜
   * - "-1": 禁用自动刷新（批量导入时使用）
   */
  refresh_interval?: string;

  /**
   * Translog 持久化策略（动态）
   * - "request": 每次请求都 fsync（安全，默认）
   * - "async": 异步刷盘（性能高，可能丢数据）
   */
  "translog.durability"?: "request" | "async";

  /**
   * Translog 异步刷盘间隔（动态）
   * 仅当 durability=async 时有效
   */
  "translog.sync_interval"?: string;

  /**
   * Translog 触发 flush 的大小阈值（动态）
   * 默认: "512mb"
   */
  "translog.flush_threshold_size"?: string;

  /**
   * 最大 translog 文件数量（动态）
   * 默认: 无限制（由 size 和 age 控制）
   */
  "translog.retention.size"?: string;
  "translog.retention.age"?: string;

  // =============================
  // 🔹 4. 缓存（动态）
  // =============================

  /**
   * 是否启用请求缓存（动态）
   * 缓存 size=0 或聚合查询结果
   * 默认: true
   */
  "requests.cache.enable"?: boolean;

  /**
   * 查询缓存（⚠️ 已废弃）
   * - ES 7 及以前: 支持
   * - ES 8+: **完全移除**
   */
  "queries.cache.enabled"?: boolean; // ⚠️ ES 8 不支持

  // =============================
  // 🔹 5. 分析器定义（静态）
  // =============================

  /**
   * 自定义分析器、分词器、过滤器（静态）
   * 必须在索引创建时定义，无法动态更新
   */
  analysis?: {
    analyzer?: Record<string, CustomAnalyzer | PredefinedAnalyzer | CustomNormalizer>;
    tokenizer?: Record<string, any>;
    filter?: Record<string, any>;
    char_filter?: Record<string, any>;
    normalizer?: Record<string, any>;
  };

  // =============================
  // 🔹 6. 生命周期与 ILM（动态）
  // =============================

  /**
   * 关联的 ILM 策略名称（动态）
   */
  "lifecycle.name"?: string;

  /**
   * 滚动更新时使用的别名（动态）
   */
  "lifecycle.rollover_alias"?: string;

  /**
   * ILM 执行间隔（集群级，默认 10m）
   * 通常不在索引设置中指定
   */

  // =============================
  // 🔹 7. Ingest Pipeline（动态）
  // =============================

  /**
   * 默认 ingest pipeline（动态）
   * 所有写入请求若未指定 pipeline，将使用此 pipeline
   */
  default_pipeline?: string;

  /**
   * 最终 ingest pipeline（动态）
   * 在用户指定 pipeline 之后执行
   */
  final_pipeline?: string;

  // =============================
  // 🔹 8. 时间序列专用（ES 8.8+，静态）
  // =============================

  /**
   * 时间序列维度字段（静态）
   * 仅在 mode=time_series 时有效
   * 示例: ["host", "region"]
   */
  "time_series.dimensions"?: string[];

  /**
   * 时间字段名（静态）
   * 默认: "@timestamp"
   */
  "time_series.timestamp_field"?: string;

  // =============================
  // 🔹 9. 其他高级设置
  // =============================

  /**
   * 高亮最大分析字符偏移量（动态）
   * 防止高亮大文本导致 OOM
   * 默认: 1000000
   */
  "highlight.max_analyzed_offset"?: number;

  /**
   * 脚本字段最大文档数（动态）
   * 用于 script_fields 限制
   */
  max_script_fields?: number;

  /**
   * 查询最大字段数限制（动态）
   * 防止 wildcard 查询爆炸
   * 默认: 1024
   */
  "query.default_field"?: string | string[];
  "mapping.total_fields.limit"?: number;
  "mapping.depth.limit"?: number;
  "mapping.nested_fields.limit"?: number;
  "mapping.nested_objects.limit"?: number;
}
