import {ElasticsearchClientHttp} from "./ElasticsearchClientHttp";
import {
  AllocationExplainBody,
  AllocationExplainResult,
  ClusterHealth,
  ClusterNode,
  ElasticsearchClientProp,
  IndexItem,
  IndexItemResult,
  Overview
} from "../types";
import {Analyze, ClusterState, IndexOpenOrCloseProp} from "../domain";
import {IndexFieldBuild} from "../components/IndexFieldBuild";
import {parseJsonWithBigIntSupport} from "$/util";
import {indexTypeBuild} from "$/elasticsearch-client/components/IndexTypeBuild";
import {IndexAliasAtomOptions} from "$/shared/elasticsearch";
import {
  BulkAction,
  BulkRequestOptions,
  BulkResult,
  serializeBulkBody
} from "$/elasticsearch-client/types/BulkAction";

export abstract class ElasticsearchClientCommon extends ElasticsearchClientHttp {
  protected constructor(props: ElasticsearchClientProp, versionFirst: number) {
    super(props, versionFirst);
  }

  // ---------------------------------------- 实例操作 ----------------------------------------

  async indices(): Promise<IndexItemResult> {
    const indices = new Array<IndexItem>();

    const clusterStatsStr = await this.request({
      method: "GET",
      url: "/_cluster/state"
    });
    const cluster_stats = parseJsonWithBigIntSupport<ClusterState>(clusterStatsStr);

    const metaIndices = cluster_stats.metadata.indices;
    const cluster_indices = cluster_stats.routing_table.indices;
    const errorIndexKeys = new Array<string>();
    for (const key in metaIndices) {
      try {
        const indexInfo = metaIndices[key];
        const state = metaIndices[key].state;

        indices.push({
          name: key,
          alias: indexInfo.aliases,
          fields: IndexFieldBuild(indexInfo.mappings, this.versionFirst),
          types: indexTypeBuild(indexInfo.mappings, this.versionFirst),
          indexInfo: indexInfo,
          state: state,
          // 可能存在关闭的索引
          shards: cluster_indices[key] ? cluster_indices[key].shards : {}
        });
      } catch (e) {
        console.error(e);
        errorIndexKeys.push(key);
      }
    }
    // `加载索引时发生错误，共${errorIndexKeys.length}个索引加载失败：[${errorIndexKeys.join(",")}]`
    const nodes: Record<string, ClusterNode> = {};
    for (const key of Object.keys(cluster_stats.nodes)) {
      const node = cluster_stats.nodes[key];
      nodes[key] = {
        name: node.name
      };
    }
    return {
      nodes: nodes,
      masterNode: cluster_stats.master_node,
      indices: indices,
      errorIndexKeys: errorIndexKeys
    };
  }

  async getIndex(index: string): Promise<IndexItem> {
    // 并发拉取：
    // 1) 单索引的集群状态（仅 metadata + routing_table）
    // 2) 单索引的统计信息（docs & store）
    const clusterStateStr = await this.request({
      method: "GET",
      url: `/_cluster/state/metadata,routing_table/${index}`
    });

    const clusterState = parseJsonWithBigIntSupport<ClusterState>(clusterStateStr);

    // 获取索引元信息（metadata）
    const metaIndices = clusterState.metadata.indices;
    const indexInfoRaw = metaIndices[index];
    if (!indexInfoRaw) {
      throw new Error(`索引不存在或不可用: ${index}`);
    }

    // 别名转换为数组（兼容对象/数组两种形态）
    const aliases: Array<string> = Array.isArray((indexInfoRaw as any).aliases)
      ? ((indexInfoRaw as any).aliases as Array<string>)
      : Object.keys((indexInfoRaw as any).aliases || {});

    // 分片信息（关闭索引可能没有分片）
    const routingIndices = clusterState.routing_table.indices;
    const shards = routingIndices[index] ? routingIndices[index].shards : {};

    // 字段/类型构建
    const fields = IndexFieldBuild(indexInfoRaw.mappings, this.versionFirst);
    const types = indexTypeBuild(indexInfoRaw.mappings, this.versionFirst);

    // 组装返回
    return {
      name: index,
      alias: aliases,
      fields: fields,
      types: types,
      indexInfo: {
        state: (indexInfoRaw as any).state,
        aliases: aliases,
        mappings: indexInfoRaw.mappings,
        settings: (indexInfoRaw as any).settings
      },
      state: (indexInfoRaw as any).state,
      shards: shards
    };
  }

  async clusterHealth(): Promise<ClusterHealth> {
    const rsp = await this.request({method: "GET", url: "/_cluster/health"});
    return parseJsonWithBigIntSupport<ClusterHealth>(rsp);
  }

  getText(url: string): Promise<string> {
    return this.request({
      url,
      method: "GET"
    });
  }

  async getJson<T extends Record<string, any>>(url: string): Promise<T> {
    const resp = await this.request({
      url,
      method: "GET"
    });
    return parseJsonWithBigIntSupport<T>(resp);
  }

  async info(): Promise<Overview> {
    const rsp = await this.request({method: "GET", url: "/"});
    return parseJsonWithBigIntSupport<Overview>(rsp);
  }

  async explainAllocation(body: AllocationExplainBody): Promise<AllocationExplainResult> {
    const rsp = await this.request({
      method: "POST",
      url: "/_cluster/allocation/explain",
      data: body
    });
    return parseJsonWithBigIntSupport<AllocationExplainResult>(rsp);
  }

  // ---------------------------------------- 索引操作 ----------------------------------------

  async createIndex(index: string, data: string): Promise<string> {
    try {
      return await this.request({
        method: "PUT",
        url: `/${index}`,
        data: data
      });
    } catch (error) {
      throw new Error(`创建索引失败: ${error}`);
    }
  }

  indexAlias(aliases: Array<IndexAliasAtomOptions>): Promise<string> {
    return this.request({
      method: "POST",
      url: "/_aliases",
      data: {actions: aliases}
    });
  }

  async indexAnalyze(index: string, field: string, text: string): Promise<Analyze> {
    const rsp = await this.request({
      url: `/${index}/_analyze`,
      method: "POST",
      data: {text, field}
    });
    return parseJsonWithBigIntSupport<Analyze>(rsp);
  }

  indexClose(index: string, props: Partial<IndexOpenOrCloseProp> | undefined): Promise<string> {
    return this.request({
      method: "POST",
      url: `/${index}/_close`,
      data: props
    });
  }

  indexOpen(index: string, props: Partial<IndexOpenOrCloseProp> | undefined): Promise<string> {
    return this.request({
      method: "POST",
      url: `/${index}/_open`,
      data: props
    });
  }

  // ---------------------------------------- 文档操作 ----------------------------------------

  async bulkDoc(
    actions: Array<BulkAction>,
    option: Partial<BulkRequestOptions> = {}
  ): Promise<BulkResult> {
    if (!actions || actions.length === 0) {
      return Promise.reject(new Error("Bulk actions 不能为空"));
    }

    try {
      const {type, ...requestOptions} = option;
      const body = serializeBulkBody(actions, {type});

      const params: Record<string, string> = {};
      if (requestOptions.refresh !== undefined) {
        params.refresh = String(requestOptions.refresh);
      }
      if (requestOptions.timeout) {
        params.timeout = requestOptions.timeout;
      }
      if (requestOptions.consistency) {
        params.consistency = requestOptions.consistency;
      }
      if (requestOptions.pipeline) {
        params.pipeline = requestOptions.pipeline;
      }

      const response = await this.request({
        method: "POST",
        url: "/_bulk",
        data: body,
        params: Object.keys(params).length ? params : undefined,
        headers: {
          "Content-Type": "application/x-ndjson"
        }
      });

      return parseJsonWithBigIntSupport<BulkResult>(response);
    } catch (error) {
      throw new Error(`批量操作文档失败: ${error}`);
    }
  }
}
