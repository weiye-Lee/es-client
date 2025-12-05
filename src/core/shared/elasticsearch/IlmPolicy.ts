/**
 * Elasticsearch ILM（Index Lifecycle Management）策略类型定义
 * 基线版本：6.7（ILM 正式发布）
 * 扩展功能按版本标注（如 7.9、7.10、8.5 等）
 * 严格遵循官方 API：https://www.elastic.co/guide/en/elasticsearch/reference/current/ilm.html
 */

/**
 * ILM 策略顶层结构（用于 PUT /_ilm/policy/{name}）
 */
export interface IlmPolicy {
  /**
   * 可选的元数据，供用户自定义（如描述、所有者等）
   * ILM 引擎不会使用此字段
   */
  metadata?: Record<string, unknown>;

  /**
   * 生命周期各阶段定义
   */
  phases: IlmPhases;
}

/**
 * 所有生命周期阶段
 */
export interface IlmPhases {
  /**
   * Hot 阶段：活跃写入
   * 支持版本：6.7+
   */
  hot?: IlmHotPhase;

  /**
   * Warm 阶段：停止写入，仍可查询
   * 支持版本：6.7+
   */
  warm?: IlmWarmPhase;

  /**
   * Cold 阶段：极少查询，保留可搜索性
   * 注意：虽然 `cold` 阶段在 7.0+ 才被官方命名，
   * 但在 6.7+ 中可通过自定义阶段名 + actions 实现类似行为。
   * 为类型一致性，此处按 7.0+ 语义提供。
   * 实际在 6.7–6.8 中，用户通常只用 hot + delete。
   */
  cold?: IlmColdPhase;

  /**
   * Delete 阶段：删除索引
   * 支持版本：6.7+
   */
  delete?: IlmDeletePhase;
}

// =============================================================================
// 各阶段定义（按最小支持版本设计）
// =============================================================================

export interface IlmHotPhase {
  /**
   * 进入 hot 阶段的最小索引年龄（如 "0ms"）
   */
  min_age: string;
  /**
   * 阶段操作，内容可选
   */
  actions: Partial<IlmHotActions>;
}

export interface IlmWarmPhase {
  min_age: string;
  actions: IlmWarmActions;
}

export interface IlmColdPhase {
  min_age: string;
  actions: IlmColdActions;
}

export interface IlmDeletePhase {
  min_age: string;
  actions: IlmDeleteActions;
}

// =============================================================================
// 各阶段操作集合（严格按版本和阶段限制）
// =============================================================================

/**
 * Hot 阶段操作（6.7+）
 */
export interface IlmHotActions {
  /**
   * 触发索引滚动
   * 支持版本：6.7+
   */
  rollover: IlmRolloverAction;

  /**
   * 设置恢复优先级
   * 支持版本：6.7+
   */
  set_priority: IlmSetPriorityAction;

  /**
   * 停止跨集群跟随（CCR）
   * 支持版本：7.0+
   */
  unfollow: IlmUnfollowAction;
}

/**
 * Warm 阶段操作（6.7+）
 */
export type IlmWarmActions = Partial<{
  /**
   * 控制索引分配（副本数、节点属性）
   * 支持版本：6.7+
   */
  allocate: IlmAllocateAction;

  /**
   * 设为只读
   * 支持版本：6.7+
   */
  readonly: IlmReadonlyAction;

  /**
   * 缩小分片数
   * 支持版本：6.7+
   */
  shrink: IlmShrinkAction;

  /**
   * 强制段合并
   * 支持版本：6.7+
   */
  forcemerge: IlmForceMergeAction;

  /**
   * 设置优先级
   * 支持版本：6.7+
   */
  set_priority: IlmSetPriorityAction;

  /**
   * 停止 CCR 跟随
   * 支持版本：7.0+
   */
  unfollow: IlmUnfollowAction;

  /**
   * 自动迁移到 warm 数据层
   * 支持版本：7.10+
   */
  migrate: IlmMigrateAction;

  /**
   * 转换为可搜索快照
   * 支持版本：7.10+
   */
  searchable_snapshot: IlmSearchableSnapshotAction;
}>;

/**
 * Cold 阶段操作
 */
export type IlmColdActions = Partial<{
  /**
   * 控制分配
   * 支持版本：7.0+（6.7 无 cold 阶段概念，但 allocate 本身 6.7+ 支持）
   */
  allocate: IlmAllocateAction;

  /**
   * 冻结索引（大幅降低内存）
   * 支持版本：7.10+
   */
  freeze: IlmFreezeAction;

  /**
   * 可搜索快照
   * 支持版本：7.10+
   */
  searchable_snapshot: IlmSearchableSnapshotAction;

  /**
   * 设置优先级
   * 支持版本：7.0+
   */
  set_priority: IlmSetPriorityAction;

  /**
   * 停止 CCR
   * 支持版本：7.0+
   */
  unfollow: IlmUnfollowAction;

  /**
   * 迁移到 cold/frozen 层
   * 支持版本：7.10+
   */
  migrate: IlmMigrateAction;
}>;

/**
 * Delete 阶段操作
 */
export type IlmDeleteActions = Partial<{
  /**
   * 删除索引
   * 支持版本：6.7+
   */
  delete: IlmDeleteAction;

  /**
   * 删除前等待 SLM 快照完成
   * 支持版本：7.9+
   * 注意：7.9 以前无 SLM，此操作不存在
   */
  wait_for_snapshot: IlmWaitForSnapshotAction;
}>;

// =============================================================================
// 操作参数定义（带版本说明）
// =============================================================================

export interface IlmRolloverAction {
  /**
   * 最大索引总大小（主分片 + 副本）
   * 示例："50gb"
   * 支持版本：6.7+
   */
  max_size?: string;

  /**
   * 最大索引年龄
   * 示例："7d"
   * 支持版本：6.7+
   */
  max_age?: string;

  /**
   * 最大文档数
   * 示例：1000000
   * 支持版本：6.7+
   */
  max_docs?: number;

  /**
   * 最大主分片大小（更精确控制）
   * 示例："50gb"
   * 支持版本：8.5+
   */
  max_primary_shard_size?: string;
}

export interface IlmSetPriorityAction {
  /**
   * 恢复优先级（整数）
   * 支持版本：6.7+
   */
  priority: number;
}

export interface IlmAllocateAction {
  /**
   * 副本数量
   * 支持版本：6.7+
   */
  number_of_replicas?: number;

  /**
   * 节点包含规则
   * 示例：{ "data": "warm" }
   * 注意：6.7–7.x 常用 "box_type"，8.x 推荐 "data"
   * 支持版本：6.7+
   */
  include?: Record<string, string>;

  /**
   * 节点排除规则
   * 支持版本：6.7+
   */
  exclude?: Record<string, string>;

  /**
   * 节点强制要求
   * 支持版本：6.7+
   */
  require?: Record<string, string>;
}

export interface IlmReadonlyAction {}
export interface IlmDeleteAction {}
export interface IlmUnfollowAction {}
export interface IlmFreezeAction {}

export interface IlmShrinkAction {
  /**
   * 缩小后的主分片数（必须是原分片数的因数）
   * 支持版本：6.7+
   */
  number_of_shards: number;
}

export interface IlmForceMergeAction {
  /**
   * 合并后最大段数（通常为 1）
   * 支持版本：6.7+
   */
  max_num_segments: number;
}

export interface IlmSearchableSnapshotAction {
  /**
   * 快照仓库名称
   * 支持版本：7.10+
   */
  snapshot_repository: string;

  /**
   * 是否强制合并后再快照
   * 默认：true
   * 支持版本：7.10+
   */
  force_merge_index?: boolean;
}

export interface IlmWaitForSnapshotAction {
  /**
   * SLM 策略名称
   * 支持版本：7.9+
   */
  policy: string;
}

export interface IlmMigrateAction {
  /**
   * 是否启用自动迁移（默认 true）
   * 支持版本：7.10+
   */
  enabled?: boolean;
}

/**
 * 生命周期策略详情
 */
export interface IlmPolicyInfo {
  version: number;
  modified_date: string;
  policy: IlmPolicy;
}
