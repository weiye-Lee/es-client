import { IndexAliasOptions, IndexMapping, IndexSettings } from "$/shared/elasticsearch";

export interface IndexTemplateListItem {
  name: string;
  type: "legacy" | "composable";
}

export interface IndexTemplate {
  /**
   * 索引模板名称
   */
  name: string;

  /**
   * 索引模式
   */
  indexPatterns: string[];

  /**
   * 设置
   */
  settings: { index: IndexSettings };

  /**
   * 映射，默认是_doc，为了兼容v7一下版本，如果是v7以上，直接就是_doc即可，内部会自适应实现
   *
   * 类型 => 映射
   */
  mappings: Record<string, IndexMapping>;

  /**
   * 别名
   */
  aliases: Record<string, IndexAliasOptions>;

  /**
   * 优先级
   */
  priority: number;

  /**
   * 版本
   */
  version: number;

  // ------------------------------------- 仅v7.8以上有效 -------------------------------------

  /**
   * 元数据
   */
  meta: Record<string, string>;

  /**
   * 引用的组件模板
   */
  composedOf: Array<string>;
}
