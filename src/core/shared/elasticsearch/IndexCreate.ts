import { IndexAliasOptions, IndexMapping, IndexSettings } from "$/shared/elasticsearch";

/**
 * 索引创建参数
 */
export interface IndexCreate {
  settings: IndexSettings;

  mappings: IndexMapping;

  aliases: Record<string, IndexAliasOptions>;
}
