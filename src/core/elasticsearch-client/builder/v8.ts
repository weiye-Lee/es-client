import {
  BaseSearchProp,
  BaseSearchResult,
  DataSearchProp,
  DataSearchResult,
  ElasticsearchClientProp,
  DevToolProp
} from "../types";
import { ElasticsearchClientCommon } from "../abs/ElasticsearchClientCommon";
import { IlmExplainResponse } from "$/elasticsearch-client/domain/IlmExplainResponse";
import { IndexTemplate, IndexTemplateListItem } from "$/elasticsearch-client/domain";
import { parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport } from "$/util";
import { buildDataBrowserData } from "$/elasticsearch-client/components/DataBrowserQuery";
import { buildBaseSearchData } from "$/elasticsearch-client/components/BaseSearchQuery";
import { searchResultToTable } from "$/elasticsearch-client/components/SearchResultToTable";

export class ElasticsearchClientV8 extends ElasticsearchClientCommon {
  constructor(props: ElasticsearchClientProp) {
    super(props, 8);
  }

  // ---------------------------------------- 索引操作 ----------------------------------------

  async deleteBatchIndex(indexIds: Array<string>): Promise<void> {
    try {
      if (!indexIds || indexIds.length === 0) {
        return Promise.reject(new Error("索引ID列表不能为空"));
      }

      // 构建批量删除的索引名称字符串
      const indexNames = indexIds.join(",");

      // 发送删除请求
      await this.request({
        method: "DELETE",
        url: `/${indexNames}`
      });
    } catch (error) {
      throw new Error(`批量删除索引失败: ${error}`);
    }
  }

  async updateIndex(index: string, data: string): Promise<void> {
    try {
      // 解析更新配置数据
      const updateConfig = parseJsonWithBigIntSupport(data);

      // 在Elasticsearch 7.x中，索引创建后某些设置不能直接修改
      // 我们需要分别处理settings和mappings的更新

      if (updateConfig.settings) {
        // 更新索引设置（只能更新动态设置）
        await this.request({
          method: "PUT",
          url: `/${index}/_settings`,
          data: stringifyJsonWithBigIntSupport({ settings: updateConfig.settings })
        });
      }

      if (updateConfig.mappings) {
        // 更新映射（在ES 7.x中，只能添加新字段，不能修改现有字段类型）
        await this.request({
          method: "PUT",
          url: `/${index}/_mapping`,
          data: stringifyJsonWithBigIntSupport(updateConfig.mappings)
        });
      }

      // 如果只是普通的映射更新
      if (!updateConfig.settings && !updateConfig.mappings && updateConfig.properties) {
        await this.request({
          method: "PUT",
          url: `/${index}/_mapping`,
          data: stringifyJsonWithBigIntSupport({ properties: updateConfig.properties })
        });
      }

      // 如果是完整的映射结构
      if (!updateConfig.settings && !updateConfig.mappings && !updateConfig.properties) {
        await this.request({
          method: "PUT",
          url: `/${index}/_mapping`,
          data: data
        });
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`索引更新配置JSON格式错误: ${error.message}`);
      }
      throw new Error(`更新索引失败: ${error}`);
    }
  }

  // ---------------------------------------- 文档操作 ----------------------------------------

  async insertDoc(index: string, data: string): Promise<string> {
    try {
      // 发送插入请求
      const response = await this.request({
        method: "POST",
        url: `/${index}/_doc`,
        data: data
      });

      const result = parseJsonWithBigIntSupport(response);

      // 返回文档ID
      return result._id || "";
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`文档数据JSON格式错误: ${error.message}`);
      }
      throw new Error(`插入文档失败: ${error}`);
    }
  }

  async updateDoc(index: string, id: string, data: string): Promise<string> {
    try {
      // 发送更新请求
      return await this.request({
        method: "put",
        url: `/${index}/_doc/${id}`,
        data: data
      });
    } catch (error) {
      console.error(error);
      if (error instanceof SyntaxError) {
        throw new Error(`更新数据JSON格式错误: ${error.message}`);
      }
      throw new Error(`更新文档失败: ${error}`);
    }
  }

  deleteDoc(index: string, docId: string): Promise<string> {
    return this.request({
      method: "DELETE",
      url: `/${index}/_doc/${docId}`
    });
  }

  async deleteBatchDoc(index: string, docIds: Array<string>): Promise<void> {
    try {
      if (!docIds || docIds.length === 0) {
        return Promise.reject(new Error("文档ID列表不能为空"));
      }

      // 构建批量删除请求体
      const bulkBody: string[] = [];

      docIds.forEach((docId) => {
        bulkBody.push(
          stringifyJsonWithBigIntSupport({
            delete: {
              _index: index,
              _id: docId
            }
          })
        );
      });

      // 添加换行符结尾（Elasticsearch bulk API要求）
      const bulkData = bulkBody.join("\n") + "\n";

      // 发送批量删除请求
      const response = await this.request({
        method: "POST",
        url: "/_bulk",
        data: bulkData,
        headers: {
          "Content-Type": "application/x-ndjson"
        }
      });

      // 检查响应中是否有错误
      const result = parseJsonWithBigIntSupport(response);
      if (result.errors) {
        const errorItems = result.items.filter((item: any) => item.delete && item.delete.error);
        if (errorItems.length > 0) {
          return Promise.reject(
            new Error(`批量删除部分失败: ${stringifyJsonWithBigIntSupport(errorItems)}`)
          );
        }
      }
    } catch (error) {
      return Promise.reject(new Error(`批量删除文档失败: ${error}`));
    }
  }

  // ---------------------------------------- 搜索操作 ----------------------------------------

  async dataSearch(props: DataSearchProp): Promise<DataSearchResult> {
    const { index } = props;

    try {
      const data = buildDataBrowserData(props, this.versionFirst);
      const response = await this.request({
        method: "POST",
        url: `/${index}/_search`,
        data: stringifyJsonWithBigIntSupport(data)
      });
      return searchResultToTable(response);
    } catch (error) {
      throw new Error(`数据搜索失败: ${error}`);
    }
  }

  async baseSearch(props: BaseSearchProp): Promise<BaseSearchResult> {
    const { index } = props;

    try {
      const response = await this.request({
        method: "POST",
        url: `/${index}/_search`,
        data: stringifyJsonWithBigIntSupport(buildBaseSearchData(props, this.versionFirst))
      });

      const result = parseJsonWithBigIntSupport(response);

      return {
        total: result.hits.total.value || result.hits.total,
        data: response
      };
    } catch (error) {
      throw new Error(`搜索失败: ${error}`);
    }
  }

  seniorSearch(query: DevToolProp): Promise<string> {
    return this.request({
      method: query.method,
      url: query.url,
      headers: query.headers,
      data: query.body
    });
  }

  // ---------------------------------------- ILM操作 ----------------------------------------

  indexIlmMove(index: string, policy: string): Promise<string> {
    return this.request({
      method: "POST",
      url: `/${index}/_ilm/move`,
      data: {
        policy
      }
    });
  }

  indexIlmRemove(index: string): Promise<string> {
    return this.request({
      method: "POST",
      url: `/${index}/_ilm/remove`
    });
  }

  createIlmPolicy(name: string, data: string): Promise<string> {
    return this.request({
      method: "PUT",
      url: `/_ilm/policy/${name}`,
      data: data
    });
  }

  deleteIlmPolicy(name: string): Promise<string> {
    return this.request({
      method: "DELETE",
      url: `/_ilm/policy/${name}`
    });
  }

  async listIlmPolicies(policy?: string): Promise<Record<string, any>> {
    const rsp = await this.request({
      method: "GET",
      url: policy ? `/_ilm/policy/${policy}` : "/_ilm/policy"
    });
    return parseJsonWithBigIntSupport(rsp);
  }

  /**
   * 查看使用某策略的索引
   * @param policy 策略名称
   */
  async getIlmIndex(policy: string): Promise<Record<string, any>> {
    const rsp = await this.request({
      method: "GET",
      url: "/_ilm/explain",
      params: {
        policy: policy
      }
    });
    return parseJsonWithBigIntSupport(rsp);
  }

  /**
   * 查看所有索引的 ILM 状态
   * @param index 索引名称，如果存在就是单个
   */
  async getIlmStatus(index?: string): Promise<IlmExplainResponse> {
    const rsp = await this.request({
      method: "GET",
      url: `/${index || "*"}/_ilm/explain`
    });
    return parseJsonWithBigIntSupport(rsp);
  }

  // ---------------------------------------- 模板操作 ----------------------------------------

  templateDelete(name: string, type: IndexTemplateListItem["type"]): Promise<string> {
    if (type === "legacy") {
      // 旧的
      return this.request({
        method: "DELETE",
        url: `/_template/${name}`
      });
    } else if (type === "composable") {
      // 新的
      return this.request({
        method: "DELETE",
        url: `/_index_template/${name}`
      });
    } else {
      return Promise.reject(new Error(`不支持的索引模板类型: ${type}`));
    }
  }

  async templateGet(name: string, type: IndexTemplateListItem["type"]): Promise<IndexTemplate> {
    if (type === "legacy") {
      const resp = await this.request({
        method: "GET",
        url: `/_template/${name}`
      });
      const template = parseJsonWithBigIntSupport(resp)[name];
      if (!template) return Promise.reject(new Error(`模板不存在: ${name}`));
      return {
        name: name,
        // v6使用的是template字段
        indexPatterns: Array.isArray(template.index_patterns)
          ? template.index_patterns
          : [template.index_patterns],
        settings: template.settings,
        // v6此处有类型
        mappings:
          template.mappings.properties && typeof template.mappings.properties === "object"
            ? { _doc: template.mappings }
            : template.mappings,
        aliases: template.aliases,
        priority: template.order || 0,
        version: template.version || 0,
        meta: {},
        composedOf: []
      };
    } else if (type === "composable") {
      const resp = await this.request({
        method: "GET",
        url: `/_index_template/${name}`
      });
      const template = parseJsonWithBigIntSupport(resp).index_templates[0];
      const indexTemplate = template["index_template"];
      return {
        name: template.name,
        indexPatterns: indexTemplate.index_patterns,
        settings: indexTemplate.template.settings,
        // 为了兼容旧版本
        mappings: { _doc: indexTemplate.template.mappings },
        aliases: indexTemplate.template.aliases,
        priority: indexTemplate.priority || 0,
        version: indexTemplate.version || 0,
        meta: indexTemplate._meta || {},
        composedOf: indexTemplate.composed_of || []
      };
    } else {
      return Promise.reject(new Error(`不支持的索引模板类型: ${type}`));
    }
  }

  async templateList(): Promise<Array<IndexTemplateListItem>> {
    const items = new Array<IndexTemplateListItem>();
    const templateStr = await this.request({
      method: "GET",
      url: "/_cat/templates?h=name&format=text"
    });

    templateStr
      .split("\n")
      .filter((e) => !!e)
      .sort((a, b) => a.localeCompare(b))
      .forEach((e) => {
        items.push({
          name: e,
          type: "legacy"
        });
      });
    const indexTemplateStr = await this.request({
      method: "GET",
      url: "/_index_template"
    });
    parseJsonWithBigIntSupport(indexTemplateStr)
      .index_templates.map((e) => e.name)
      .sort()
      .forEach((e) => {
        items.push({
          name: e,
          type: "composable"
        });
      });
    return items;
  }

  templatePut(
    name: string,
    type: IndexTemplateListItem["type"],
    template: IndexTemplate
  ): Promise<string> {
    if (type === "legacy") {
      return this.request({
        method: "PUT",
        url: `/_template/${name}`,
        data: {
          template: template.indexPatterns,
          settings: template.settings,
          mappings: template.mappings,
          aliases: template.aliases
        }
      });
    } else {
      return this.request({
        method: "PUT",
        url: `/_index_template/${name}`,
        data: {
          index_template: {
            name: name,
            index_patterns: template.indexPatterns,
            template: {
              settings: template.settings,
              mappings: template.mappings,
              aliases: template.aliases
            },
            priority: template.priority,
            version: template.version,
            _meta: template.meta,
            composed_of: template.composedOf
          }
        }
      });
    }
  }
}
