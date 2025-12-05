// 单个 Bulk 操作的通用接口
import { stringifyJsonWithBigIntSupport } from "$/util";

interface BulkOperation {
  action: "index" | "create" | "update" | "delete";
  index: string;
  id?: string; // 可选，ES 可自动生成
  routing?: string; // 可选，用于分片路由
  version?: number; // 可选，用于乐观锁
  versionType?: "internal" | "external"; // 可选
}

// 不同操作的具体类型（用 discriminated union）
interface IndexOperation extends BulkOperation {
  action: "index" | "create";
  document: Record<string, any>; // 要写入的文档
}

interface UpdateOperation extends BulkOperation {
  action: "update";
  doc?: Record<string, any>; // partial update
  docAsUpsert?: boolean;
  script?: {
    source: string;
    params?: Record<string, any>;
  };
}

interface DeleteOperation extends BulkOperation {
  action: "delete";
  // 无 document
}

export type BulkAction = IndexOperation | UpdateOperation | DeleteOperation;

export interface BulkRequestOptions {
  /**
   * 是否立即刷新（是数据可见）
   * @example false
   */
  refresh?: boolean;
  /**
   * 批量操作超时
   * @example 1m
   */
  timeout?: string;
  /**
   * 6.x可用
   */
  consistency?: string;
  /**
   * Ingest pipeline 名称
   */
  pipeline?: string;

  /**
   * v6.x 兼容
   */
  type?: string;
}

export interface BulkResult {
  took: number;
  errors: boolean;
  items: BulkResultItem[];
}

interface BulkResultItem {
  index?: Index;
  create?: Index;
  update?: Index;
  delete?: Index;
}

interface Index {
  _index: string;
  _id: string;
  status: number;
  result: string;
  error?: any;
}

export function serializeBulkBody(
  actions: BulkAction[],
  prop: { type?: string } // 用于兼容 _type
): string {
  const lines: string[] = [];

  for (const op of actions) {
    // 第一步：构造 metadata 行
    const meta: Record<string, any> = {
      _index: op.index
    };

    if (op.id !== undefined) meta._id = op.id;
    if (op.routing !== undefined) meta.routing = op.routing;
    if (op.version !== undefined) meta.version = op.version;
    if (op.versionType !== undefined) meta.version_type = op.versionType;

    // 如果传递了type
    if (prop.type) {
      meta._type = prop.type; // 或从配置读取
    }

    // 第二步：根据 action 写入指令行 + 数据行
    if (op.action === "index" || op.action === "create") {
      lines.push(stringifyJsonWithBigIntSupport({ [op.action]: meta }));
      lines.push(stringifyJsonWithBigIntSupport(op.document));
    } else if (op.action === "update") {
      lines.push(stringifyJsonWithBigIntSupport({ update: meta }));
      const updatePayload: Record<string, any> = {};
      if (op.doc !== undefined) updatePayload.doc = op.doc;
      if (op.docAsUpsert) updatePayload.doc_as_upsert = true;
      if (op.script) updatePayload.script = op.script;
      lines.push(stringifyJsonWithBigIntSupport(updatePayload));
    } else if (op.action === "delete") {
      lines.push(stringifyJsonWithBigIntSupport({ delete: meta }));
      // delete 没有数据行！
    }
  }

  // 必须以换行符结尾（ES 要求）
  return lines.join("\n") + "\n";
}
