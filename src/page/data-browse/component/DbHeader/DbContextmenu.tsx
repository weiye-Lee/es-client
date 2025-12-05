import { Button, DialogPlugin } from "tdesign-vue-next";
import MonacoEditor from "@/components/monaco-editor/index.vue";
import { UseDataBrowserInstance } from "@/hooks";
import { useIndexStore } from "@/store";
import MessageUtil from "@/utils/model/MessageUtil";
import { IndexMapping } from "$/shared/elasticsearch";
import { stringifyJsonWithBigIntSupport } from "$/util";

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

/**
 * 执行新增操作
 *
 * @param indexName 索引名称
 * @param instance 当前页面实例
 * @return 数据内容
 */
export function execAdd(indexName: string, instance: UseDataBrowserInstance): Promise<string> {
  const data = ref("{}");
  const { mappingMap } = useIndexStore();
  const { index } = instance;
  const mapping = mappingMap.get(index);
  if (mapping) {
    data.value = dataBuild(mapping);
  } else {
    MessageUtil.warning("获取mapping失败，无法初始化对象");
  }

  return new Promise((resolve) => {
    const modalReturn = DialogPlugin({
      header: `在【${indexName}】中新增数据`,
      width: "80vw",
      placement: "center",
      draggable: true,
      default: () => (
        <MonacoEditor height={"calc(100vh - 280px)"} language="json" v-model={data.value} />
      ),
      footer: () => (
        <>
          <Button theme={"default"} onClick={() => modalReturn.destroy()}>
            取消
          </Button>
          <Button
            theme={"primary"}
            onClick={() => {
              resolve(data.value);
              modalReturn.destroy();
            }}
          >
            新增
          </Button>
        </>
      )
    });
  });
}

interface ExecUpdateResult {
  id: string;
  data: string;
}

export function execUpdate(
  indexName: string,
  id: string,
  initData: string
): Promise<ExecUpdateResult> {
  const data = ref(initData);
  return new Promise((resolve) => {
    const modalReturn = DialogPlugin({
      header: `在【${indexName}】中修改【${id}】数据`,
      width: "80%",
      draggable: true,
      placement: "center",
      default: () => (
        <MonacoEditor height={"calc(100vh - 280px)"} language="json" v-model={data.value} />
      ),
      footer: () => (
        <>
          <Button theme={"default"} onClick={() => modalReturn.destroy()}>
            取消
          </Button>
          <Button
            theme={"primary"}
            onClick={() => {
              resolve({ id, data: data.value });
              modalReturn.destroy();
            }}
          >
            修改
          </Button>
        </>
      )
    });
  });
}
