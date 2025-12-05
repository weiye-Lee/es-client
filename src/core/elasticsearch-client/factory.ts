import { ElasticsearchClientProp } from "./types";
import { ElasticsearchClientV6 } from "./builder/v6";
import { ElasticsearchClientV7 } from "./builder/v7";
import { ElasticsearchClientV8 } from "./builder/v8";
import { ElasticsearchClient } from "./client";
import { compareVersion } from "$/util";

export function createElasticsearchClient(props: ElasticsearchClientProp): ElasticsearchClient {
  const { version } = props;
  if (/^7\.\d+\.\d+/.test(version)) {
    // V7
    return new ElasticsearchClientV7(props);
  } else if (/^6\.\d+\.\d+/.test(version)) {
    // V6
    return new ElasticsearchClientV6(props);
  } else if (/^8\.\d+\.\d+/.test(version)) {
    // V6
    return new ElasticsearchClientV8(props);
  } else if (compareVersion(version, "6.0.0") < 0) {
    return new ElasticsearchClientV6(props);
  } else if (compareVersion(version, "9.0.0") >= 0) {
    return new ElasticsearchClientV8(props);
  }

  // 默认返回v7版本
  return new ElasticsearchClientV7(props);
}
