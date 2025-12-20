import {
  BaseSearchProp,
  BaseSearchResult,
  ClusterHealth,
  DataSearchProp,
  DataSearchResult,
  IndexItem,
  IndexItemResult,
  Overview,
  DevToolProp,
  ElasticsearchClientProp,
  AllocationExplainBody,
  AllocationExplainResult
} from "./types";
import type {
  Analyze,
  IndexOpenOrCloseProp,
  IndexTemplate,
  IndexTemplateListItem
} from "$/elasticsearch-client/domain";
import type { IlmExplainResponse } from "$/elasticsearch-client/domain/IlmExplainResponse";
import type { IndexAliasAtomOptions } from "$/shared/elasticsearch";
import type { AxiosRequestConfig } from "axios";
import {
  BulkAction,
  BulkRequestOptions,
  BulkResult
} from "$/elasticsearch-client/types/BulkAction";

export interface ElasticsearchClient {
  props: ElasticsearchClientProp;
  // 当前版本
  version: string;
  // 大版本
  versionFirst: number;

  /**
   * 执行一个请求
   * @param config 请求配置
   */
  request(config: AxiosRequestConfig): Promise<string>;

  // ---------------------------------------- 实例操作 ----------------------------------------

  /**
   * 获取状态信息，用于展示
   * @param url 链接
   */
  getText: (url: string) => Promise<string>;

  /**
   * 获取状态信息，用于展示
   * @param url 链接
   */
  getJson: (url: string) => Promise<Record<string, any>>;

  /**
   * 集群健康状态
   */
  clusterHealth: () => Promise<ClusterHealth>;

  /**
   * 获取节点基础信息
   */
  info: () => Promise<Overview>;

  /**
   * /_cluster/allocation/explain 是 Elasticsearch 提供的诊断级 API，
   * 用于解释某个分片当前为什么没有被分配（unassigned），或者为什么一直被“钉”在某个节点而未被 rebalance。
   * 它把集群内部 Allocation Deciders 的决策过程逐条展示出来，
   * 从而快速定位“RED 分片”“磁盘不均”“过滤规则冲突”等常见问题。
   * @param body
   */
  explainAllocation: (body: AllocationExplainBody) => Promise<AllocationExplainResult>;

  // ---------------------------------------- 索引操作 ----------------------------------------

  /**
   * 获取全部的索引
   */
  indices: () => Promise<IndexItemResult>;

  /**
   * 获取一个索引信息
   * @param index
   */
  getIndex: (index: string) => Promise<IndexItem>;

  /**
   * 创建一个索引结构
   */
  createIndex: (index: string, data: string) => Promise<string>;

  /**
   * 更新一个索引结构
   */
  updateIndex: (index: string, data: string) => Promise<void>;

  /**
   * 删除多个索引
   */
  deleteBatchIndex: (indexIds: Array<string>) => Promise<void>;

  /**
   * 索引别名操作
   * @param aliases 别名信息
   */
  indexAlias: (aliases: Array<IndexAliasAtomOptions>) => Promise<string>;

  /**
   * 索引分析
   * @param index 索引名称
   * @param data 分析数据
   */
  indexAnalyze: (index: string, field: string, text: string) => Promise<Analyze>;

  /**
   * 索引打开
   * @param index 索引
   * @param props 参数
   */
  indexOpen: (index: string, props?: Partial<IndexOpenOrCloseProp>) => Promise<string>;

  /**
   * 索引关闭
   * @param index 索引
   * @param props 参数
   */
  indexClose: (index: string, props?: Partial<IndexOpenOrCloseProp>) => Promise<string>;

  // ---------------------------------------- ILM操作 ----------------------------------------

  /**
   * 索引 ILM 迁移
   * @param index 索引名称
   * @param policy 策略名称
   */
  indexIlmMove: (index: string, policy: string) => Promise<string>;

  /**
   * 删除索引 ILM
   * @param index 索引名称
   */
  indexIlmRemove: (index: string) => Promise<string>;

  /**
   * 创建ILM策略
   * @param name 策略名称
   * @param data 策略数据
   */
  createIlmPolicy: (name: string, data: string) => Promise<string>;

  /**
   * 删除一个ILM策略
   * @param name 策略名称
   */
  deleteIlmPolicy: (name: string) => Promise<string>;

  /**
   * 列出ILM策略
   * @param name 策略名称，如果存在就是单个
   */
  listIlmPolicies: (name?: string) => Promise<Record<string, any>>;

  /**
   * 查看所有索引的 ILM 状态
   * @param index 索引名称，如果存在就是单个
   */
  getIlmStatus: (index?: string) => Promise<IlmExplainResponse>;

  /**
   * 查看使用某策略的索引
   * @param policy 策略名称
   */
  getIlmIndex: (policy: string) => Promise<Record<string, any>>;

  // ---------------------------------------- 模板操作 ----------------------------------------

  /**
   * 获取模板列表
   */
  templateList: () => Promise<Array<IndexTemplateListItem>>;

  /**
   * 获取模板详情
   * @param name 模板名称
   */
  templateGet: (name: string, type: IndexTemplateListItem["type"]) => Promise<IndexTemplate>;

  /**
   * 创建/更新模板
   * @param name 模板名称
   * @param data 模板数据
   */
  templatePut: (
    name: string,
    type: IndexTemplateListItem["type"],
    template: IndexTemplate
  ) => Promise<string>;

  /**
   * 删除模板
   * @param name 模板名称
   */
  templateDelete: (name: string, type: IndexTemplateListItem["type"]) => Promise<string>;

  // ---------------------------------------- 文档操作 ----------------------------------------

  /**
   * 插入一个文档
   *
   * @param index 文档所在索引
   * @param data 文档数据
   * @param type 对于低版本，需要传递类型，否则会报错
   */
  insertDoc: (index: string, data: string, type?: string) => Promise<string>;

  /**
   * 更新一个文档
   * @param index 文档所在索引
   * @param id 文档ID
   * @param data 文档数据
   * @param type 对于低版本，需要传递类型，否则会报错
   */
  updateDoc: (index: string, id: string, data: string, type?: string) => Promise<string>;

  /**
   * 删除索引
   * @param index 文档所在索引
   * @param docId 文档ID
   * @param type 对于低版本，需要传递类型，否则会报错
   */
  deleteDoc: (index: string, docId: string, type?: string) => Promise<string>;

  /**
   * 删除多个索引
   * @param index 文档所在索引
   * @param docIds 文档ID
   * @param type 对于低版本，需要传递类型，否则会报错
   */
  deleteBatchDoc: (index: string, docIds: Array<string>, type?: string) => Promise<void>;

  /**
   * 批量操作文档
   * @param actions 动作
   * @param option 参数
   */
  bulkDoc: (actions: Array<BulkAction>, option: Partial<BulkRequestOptions>) => Promise<BulkResult>;

  // ---------------------------------------- 搜索操作 ----------------------------------------

  /**
   * 数据搜索
   *
   * @param props 参数
   * @returns 搜索结果
   */
  dataSearch: (props: DataSearchProp) => Promise<DataSearchResult>;

  /**
   * 基础搜索
   * @param prpps 参数
   * @returns 搜索结果
   */
  baseSearch: (props: BaseSearchProp) => Promise<BaseSearchResult>;

  /**
   * 高级搜索
   * @param props 查询语句
   * @returns 搜索结果
   */
  seniorSearch: (props: DevToolProp) => Promise<string>;
}
