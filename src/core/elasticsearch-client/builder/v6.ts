import { ElasticsearchClientCommon } from "$/elasticsearch-client/abs/ElasticsearchClientCommon";
import {
  BaseSearchProp,
  BaseSearchResult,
  DataSearchProp,
  DataSearchResult,
  DevToolProp,
  ElasticsearchClientProp
} from "$/elasticsearch-client";
import { IndexTemplate, IndexTemplateListItem } from "$/elasticsearch-client/domain";
import { IlmExplainResponse } from "$/elasticsearch-client/domain/IlmExplainResponse";
import { buildDataBrowserData } from "$/elasticsearch-client/components/DataBrowserQuery";
import { buildBaseSearchData } from "$/elasticsearch-client/components/BaseSearchQuery";
import { searchResultToTable } from "$/elasticsearch-client/components/SearchResultToTable";
import { parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport } from "$/util";

export class ElasticsearchClientV6 extends ElasticsearchClientCommon {
  constructor(props: ElasticsearchClientProp) {
    super(props, 6);
  }

  // ---------------------------------------- 索引操作 ----------------------------------------

  async deleteBatchIndex(indexIds: Array<string>): Promise<void> {
    try {
      if (!indexIds || indexIds.length === 0) {
        return Promise.reject(new Error("索引ID列表不能为空"));
      }

      const indexNames = indexIds.join(",");

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
      const updateConfig = parseJsonWithBigIntSupport(data);

      // 更新settings（仅动态设置可改）
      if (updateConfig.settings) {
        await this.request({
          method: "PUT",
          url: `/${index}/_settings`,
          data: stringifyJsonWithBigIntSupport({ settings: updateConfig.settings })
        });
      }

      // 更新mappings（v6存在type维度）
      if (updateConfig.mappings) {
        const mappings = updateConfig.mappings;

        let typeName: string | undefined;
        let mappingBody: any = mappings;

        if (mappings && typeof mappings === "object") {
          const keys = Object.keys(mappings);
          if (keys.length === 1 && typeof mappings[keys[0]] === "object") {
            // 推断出type
            typeName = keys[0];
            mappingBody = mappings[typeName];
          }
        }

        const url = typeName ? `/${index}/_mapping/${typeName}` : `/${index}/_mapping`;
        await this.request({
          method: "PUT",
          url,
          data: stringifyJsonWithBigIntSupport(mappingBody)
        });
      }

      // 仅提供properties时（尽力而为，v6通常需要type）
      if (!updateConfig.settings && !updateConfig.mappings && updateConfig.properties) {
        await this.request({
          method: "PUT",
          url: `/${index}/_mapping`,
          data: stringifyJsonWithBigIntSupport({ properties: updateConfig.properties })
        });
      }

      // 原样透传（用户可能已包含type结构）
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

  async insertDoc(index: string, data: string, type?: string): Promise<string> {
    try {
      if (!type) {
        return Promise.reject(new Error("v6版本插入文档必须指定type"));
      }
      const response = await this.request({
        method: "POST",
        url: `/${index}/${type}`,
        data: data
      });

      const result = parseJsonWithBigIntSupport(response);
      return result._id || "";
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`文档数据JSON格式错误: ${error.message}`);
      }
      throw new Error(`插入文档失败: ${error}`);
    }
  }

  async updateDoc(index: string, id: string, data: string, type?: string): Promise<string> {
    try {
      if (!type) {
        return Promise.reject(new Error("v6版本更新文档必须指定type"));
      }

      return await this.request({
        method: "PUT",
        url: `/${index}/${type}/${id}`,
        data: data
      });
    } catch (error) {
      console.error(error);
      throw new Error(`更新文档失败: ${error}`);
    }
  }

  deleteDoc(index: string, docId: string, type?: string): Promise<string> {
    return this.request({
      method: "DELETE",
      url: `/${index}/${type}/${docId}`
    });
  }

  async deleteBatchDoc(index: string, docIds: Array<string>, type?: string): Promise<void> {
    try {
      if (!type) {
        return Promise.reject(new Error("v6版本删除文档必须指定type"));
      }
      if (!docIds || docIds.length === 0) {
        return Promise.reject(new Error("文档ID列表不能为空"));
      }

      const bulkBody: string[] = [];
      docIds.forEach((docId) => {
        bulkBody.push(
          stringifyJsonWithBigIntSupport({
            delete: {
              _index: index,
              _type: type,
              _id: docId
            }
          })
        );
      });

      const bulkData = bulkBody.join("\n") + "\n";

      const response = await this.request({
        method: "POST",
        url: "/_bulk",
        data: bulkData,
        headers: {
          "Content-Type": "application/x-ndjson"
        }
      });

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
      const response = await this.request({
        method: "POST",
        url: `/${index}/_search`,
        data: stringifyJsonWithBigIntSupport(buildDataBrowserData(props, this.versionFirst))
      });
      return searchResultToTable(response);
    } catch (error) {
      throw new Error(`数据搜索失败: ${error}`);
    }
  }

  async baseSearch(props: BaseSearchProp): Promise<BaseSearchResult> {
    const { index } = props;

    const response = await this.request({
      method: "POST",
      url: `/${index}/_search`,
      data: stringifyJsonWithBigIntSupport(buildBaseSearchData(props, this.versionFirst))
    });

    const result = parseJsonWithBigIntSupport(response);

    return {
      total: result.hits.total,
      data: response
    };
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

  indexIlmMove(): Promise<string> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  indexIlmRemove(): Promise<string> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  getIlmStatus(): Promise<IlmExplainResponse> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  listIlmPolicies(): Promise<Record<string, any>> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  createIlmPolicy(): Promise<string> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  deleteIlmPolicy(): Promise<string> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  getIlmIndex(): Promise<Record<string, any>> {
    return Promise.reject(new Error("V6 版本暂不支持"));
  }

  // ---------------------------------------- 模板操作 ----------------------------------------

  templateDelete(name: string): Promise<string> {
    return this.request({
      method: "DELETE",
      url: `/_template/${name}`
    });
  }

  async templateGet(name: string): Promise<IndexTemplate> {
    const resp = await this.request({
      method: "GET",
      url: `/_template/${name}`
    });
    const template = parseJsonWithBigIntSupport(resp)[name];
    if (!template) return Promise.reject(new Error(`模板不存在: ${name}`));
    return {
      name: name,
      // v6使用的是template字段
      indexPatterns: Array.isArray(template.template) ? template.template : [template.template],
      settings: template.settings,
      // v6此处有类型
      mappings: template.mappings,
      aliases: template.aliases,
      priority: template.order || 0,
      version: template.version || 0,
      meta: {},
      composedOf: []
    };
  }

  async templateList(): Promise<Array<IndexTemplateListItem>> {
    const templateStr = await this.request({
      method: "GET",
      url: "/_cat/templates?h=name&format=text"
    });
    return templateStr
      .split("\n")
      .filter((e) => !!e)
      .sort((a, b) => a.localeCompare(b))
      .map((e) => ({
        name: e,
        type: "legacy"
      }));
  }

  templatePut(
    name: string,
    _type: IndexTemplateListItem["type"],
    template: IndexTemplate
  ): Promise<string> {
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
  }
}
