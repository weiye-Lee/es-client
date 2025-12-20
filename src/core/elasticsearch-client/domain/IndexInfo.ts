import { IndexMapping, IndexSettings } from "$/shared/elasticsearch";

export interface IndexInfo {
  /**
   * 状态
   */
  state: "open" | "close";

  /**
   * 别名
   */
  aliases: Array<string>;

  /**
   * 映射，类型 => mapping，对于v7及以上，只有一个，且为_doc
   */
  mappings: Record<string, IndexMapping> | IndexMapping;

  /**
   * 设置
   */
  settings: SettingInfo;
}

export interface SettingInfo extends IndexSettings {
  /**
   * 创建日期，时间戳
   */
  creation_date: string;

  /**
   * UUID
   */
  uuid: string;

  /**
   * 版本
   */
  version: {
    created: string;
  };

  /**
   * 名字
   */
  provided_name: string;
}
