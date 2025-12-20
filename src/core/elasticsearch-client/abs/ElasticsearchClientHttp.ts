import type { ElasticsearchClient } from "../client";
import {
  BaseSearchProp,
  BaseSearchResult,
  ClusterHealth,
  DataSearchProp,
  DataSearchResult,
  ElasticsearchClientProp,
  IndexItem,
  IndexItemResult,
  Overview,
  DevToolProp,
  AllocationExplainBody,
  AllocationExplainResult
} from "../types";
import { AxiosError, AxiosRequestConfig } from "axios";
import {
  Analyze,
  IndexTemplate,
  IndexTemplateListItem,
  IndexOpenOrCloseProp
} from "$/elasticsearch-client/domain";
import { IlmExplainResponse } from "$/elasticsearch-client/domain/IlmExplainResponse";
import { IndexAliasAtomOptions } from "$/shared/elasticsearch";
import { parseJsonWithBigIntSupport } from "$/util";
import {
  BulkAction,
  BulkRequestOptions,
  BulkResult
} from "$/elasticsearch-client/types/BulkAction";
import { EsRequestError } from "$/shared";

export abstract class ElasticsearchClientHttp implements ElasticsearchClient {
  public readonly props: ElasticsearchClientProp;
  public readonly versionFirst: number;
  public readonly version: string;

  protected constructor(props: ElasticsearchClientProp, versionFirst: number) {
    this.props = props;
    this.version = props.version;
    this.versionFirst = versionFirst;
  }

  async request(config: AxiosRequestConfig) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json; charset=utf-8"
    };
    if (this.props.is_auth) {
      if (this.props.auth_type === 2) {
        headers[this.props.auth_user] = this.props.auth_password;
      }
      if (this.props.auth_type === 3) {
        headers["Cookie"] = this.props.auth_password;
      } else {
        config.auth = {
          username: this.props.auth_user,
          password: this.props.auth_password
        };
      }
    }
    try {
      return await this.props.adapter({
        ...config,
        baseURL: this.props.value,
        headers: {
          ...headers,
          ...config.headers
        },
        responseEncoding: "utf-8",
        responseType: "text"
      });
    } catch (e) {
      if (e instanceof AxiosError) {
        const data = e.response?.data;
        if (data) {
          return Promise.reject(
            new EsRequestError(parseJsonWithBigIntSupport(data).error.reason, data || "")
          );
        }
      }
      return Promise.reject(e);
    }
  }

  // ---------------------------------------- 实例操作 ----------------------------------------

  abstract clusterHealth(): Promise<ClusterHealth>;

  abstract getText(url: string): Promise<string>;

  abstract getJson(url: string): Promise<Record<string, any>>;

  abstract info(): Promise<Overview>;

  abstract explainAllocation(body: AllocationExplainBody): Promise<AllocationExplainResult>;

  // ---------------------------------------- 索引操作 ----------------------------------------

  abstract indices(): Promise<IndexItemResult>;

  abstract getIndex(index: string): Promise<IndexItem>;

  abstract createIndex(index: string, data: string): Promise<string>;

  abstract updateIndex(index: string, data: string): Promise<void>;

  abstract deleteBatchIndex(indexIds: Array<string>): Promise<void>;

  abstract indexIlmMove(index: string, policy: string): Promise<string>;

  abstract indexIlmRemove(index: string): Promise<string>;

  abstract indexAnalyze(index: string, field: string, text: string): Promise<Analyze>;

  abstract indexClose(
    index: string,
    props: Partial<IndexOpenOrCloseProp> | undefined
  ): Promise<string>;

  abstract indexOpen(
    index: string,
    props: Partial<IndexOpenOrCloseProp> | undefined
  ): Promise<string>;

  // ---------------------------------------- 索引模板操作 ----------------------------------------

  abstract templateDelete(name: string, type: IndexTemplateListItem["type"]): Promise<string>;

  abstract templateGet(name: string, type: IndexTemplateListItem["type"]): Promise<IndexTemplate>;

  abstract templateList(): Promise<Array<IndexTemplateListItem>>;

  abstract templatePut(
    name: string,
    type: IndexTemplateListItem["type"],
    template: IndexTemplate
  ): Promise<string>;

  // ---------------------------------------- 文档操作 ----------------------------------------

  abstract insertDoc(index: string, data: string, type?: string): Promise<string>;

  abstract updateDoc(index: string, id: string, data: string, type?: string): Promise<string>;

  abstract deleteDoc(index: string, docId: string, type: string | undefined): Promise<string>;

  abstract deleteBatchDoc(index: string, docIds: Array<string>, type?: string): Promise<void>;

  abstract bulkDoc(
    actions: Array<BulkAction>,
    option: Partial<BulkRequestOptions>
  ): Promise<BulkResult>;

  // ---------------------------------------- 搜索操作 ----------------------------------------

  abstract baseSearch(props: BaseSearchProp): Promise<BaseSearchResult>;

  abstract dataSearch(props: DataSearchProp): Promise<DataSearchResult>;

  abstract seniorSearch(props: DevToolProp): Promise<string>;

  // ---------------------------------------- ILM操作 ----------------------------------------

  abstract createIlmPolicy(name: string, data: string): Promise<string>;

  abstract deleteIlmPolicy(name: string): Promise<string>;

  abstract getIlmIndex(policy: string): Promise<Record<string, any>>;

  abstract getIlmStatus(index: string | undefined): Promise<IlmExplainResponse>;

  abstract listIlmPolicies(name: string | undefined): Promise<Record<string, any>>;

  abstract indexAlias(aliases: Array<IndexAliasAtomOptions>): Promise<string>;
}
