import { IndexInfo } from "$/elasticsearch-client/domain";
import { SelectOption } from "$/shared/common";

/**
 * 字段
 *
 * @example value type:field
 */
export interface Field extends SelectOption {
  /**
   * 字段类型
   */
  type: string;
  /**
   * 索引类型
   */
  indexType: string;
}

export interface AllocationID {
  id: string;
}

export interface RecoverySource {
  type: string;
}

export interface UnassignedInfo {
  reason: string;
  at: Date;
  delayed: boolean;
  allocation_status: string;
}

export interface IndexShard {
  state: string;
  primary: boolean;
  node: string;
  relocating_node: null;
  shard: number;
  index: string;
  /**
   * state === 'STARTED' 时有效
   */
  allocation_id?: AllocationID;
  /**
   * state === 'UNASSIGNED' 时有效
   */
  recovery_source?: RecoverySource;
  /**
   * state === 'UNASSIGNED' 时有效
   */
  unassigned_info?: UnassignedInfo;
}

/**
 * 主页索引遍历
 */
export interface IndexItem {
  /**
   * 索引名称
   */
  name: string;

  /**
   * 别名
   */
  alias: Array<string>;

  /**
   * 字段
   */
  fields: Array<Field>;

  /**
   * 为了兼容v6版本，一个索引可以有多个类型，v7之后只会有_doc
   */
  types: Array<string>;

  /**
   * 索引元信息，仅用于展示
   */
  indexInfo: IndexInfo;

  /**
   * 状态
   */
  state?: "open" | "close";

  /**
   * 分片
   */
  shards: Record<string, Array<IndexShard>>;
}

export interface ClusterNode {
  name: string;
}

export interface IndexItemResult {
  masterNode: string;
  /**
   * 节点
   * 节点ID => 节点
   */
  nodes: Record<string, ClusterNode>;
  // 索引
  indices: Array<IndexItem>;
  // 解析错误的索引名称
  errorIndexKeys: Array<string>;
}
