import { IndexMapping } from "$/shared/elasticsearch";
import {formatJsonString, stringifyJsonWithBigIntSupport} from "$/util";
import i18n from "@/i18n";

const t = (key: string, params?: any) => i18n.global.t(key, params);

export function dataBuild(mapping: IndexMapping): string {
  const buildDefaultValue = (prop: any): any => {
    if (!prop || typeof prop !== "object") return null;

    const type: string | undefined = prop.type;
    const children = prop.properties;

    // 处理对象/嵌套类型（递归）
    if (children && typeof children === "object") {
      const childObj: Record<string, any> = {};
      for (const key in children) {
        childObj[key] = buildDefaultValue(children[key]);
      }
      // nested 默认是对象数组
      if (type === "nested") {
        return [childObj];
      }
      return childObj; // object 或未显式声明 type 的对象
    }

    // 标量类型默认值
    switch (type) {
      case "text":
      case "keyword":
        return "";
      case "long":
      case "integer":
      case "short":
      case "byte":
        return 0;
      case "double":
      case "float":
        return 0.0;
      case "boolean":
        return false;
      case "date": {
        // 使用 ISO 时间，兼容 strict_date_optional_time
        return new Date().toISOString();
      }
      case "ip":
        return "127.0.0.1";
      case "geo_point":
        return { lat: 0, lon: 0 };
      case "flattened":
        return {}; // 扁平对象，给空对象
      default:
        // 未识别类型，给 null 以提示用户填充
        return null;
    }
  };

  const doc: Record<string, any> = {};
  const props = mapping?.properties;
  if (props && typeof props === "object") {
    for (const field in props) {
      doc[field] = buildDefaultValue(props[field]);
    }
  }
  return stringifyJsonWithBigIntSupport(doc);
}

