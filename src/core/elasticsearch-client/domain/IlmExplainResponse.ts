export interface IlmExplainResponse {
  indices: {
    [indexName: string]: IlmExplainIndexInfo;
  };
}

interface IlmExplainIndexInfo {
  index: string;
  managed: boolean;

  // 以下字段仅当 managed === true 时存在
  policy?: string;
  lifecycle_date_millis?: number;
  phase?: string;
  action?: string;
  step?: string;
  phase_time_millis?: number;
  action_time_millis?: number;
  step_time_millis?: number;

  // 可选：错误或步骤详情（取决于版本和状态）
  failed_step?: string;
  step_info?: {
    type?: string;
    message?: string;
    cause?: {
      type: string;
      reason: string;
    };
  };
  // 注意：某些版本可能还会包含 'index_creation_date_millis' 等字段
}
