export interface AllocationExplainBody {
  index: string;
  shard: number;
  primary: boolean;
}

export interface AllocationExplainResult {
  index: string;
  shard: number;
  primary: boolean;
  current_state: string;
  unassigned_info?: {
    reason: string;
    at: string;
    last_allocation_status: string;
  };
  can_allocate: "yes" | "no" | "throttled";
  // ⬇️ 正确字段名是 allocate_explanation，不是 explanation！
  allocate_explanation?: string;

  node_allocation_decisions?: Array<{
    node_id: string;
    node_name: string;
    transport_address: string;
    node_attributes: Record<string, string>;
    node_decision: "yes" | "no" | "throttled";
    deciders?: Array<{
      decider: string;
      decision: string;
      explanation: string; // 节点级解释
    }>;
  }>;
}
