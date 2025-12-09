import { Url } from "$/entity";
import {RequestConfig} from "@/plugins/native/axios";

export interface ElasticsearchClientProp extends Url {
  /**
   * 请求适配器
   * @param config 请求参数
   */
  adapter: (config: RequestConfig) => Promise<string>;
}
