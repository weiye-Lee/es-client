import { AxiosRequestConfig } from "axios";
import { Url } from "$/entity";

export interface ElasticsearchClientProp extends Url {
  /**
   * 请求适配器
   * @param config 请求参数
   */
  adapter: (config: AxiosRequestConfig) => Promise<string>;
}
