import {defineStore} from "pinia";
import {DataBrowserView} from "@/entity/DataBrowser/DataBrowserView";
import {
  addDataBrowserView,
  deleteDataBrowserView,
  listDataBrowserViews
} from "@/service/DataBrowser/DataBrowserViewService";
import MessageUtil from "@/utils/model/MessageUtil";
import {DialogPlugin, FormItem, Input, Paragraph, Text} from "tdesign-vue-next";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import {useSnowflake} from "$/util";

export const useDataBrowserViewStore = defineStore('dataBrowserView', () => {

  const urlId = ref<number>();
  const views = ref<Array<DataBrowserView>>([]);

  async function fetchData() {
    if (!urlId.value) {
      views.value = [];
      return;
    }
    const items = await listDataBrowserViews(urlId.value);
    views.value = items.sort((a, b) => a.pattern.localeCompare(b.pattern, 'zh'));
  }

  const init = async (id?: number) => {
    if (id === urlId.value) return;
    urlId.value = id;
    await fetchData();
  };

  const add = async () => {
    const pattern = ref("");
    const dialog = DialogPlugin({
      default: () => <div>
        <FormItem label={"匹配模式"}>
          <Input type="text" v-model={pattern.value} autofocus/>
        </FormItem>
        <div style={{
          border: "2px solid var(--td-border-level-1-color)",
          padding: '8px',
          borderRadius: "var(--td-radius-medium)"
        }}>
          <Paragraph>
            在本客户端中，“视图”是一种通过 索引名称的通配符模式（如 <Text code>logs-*</Text>）来动态匹配多个 Elasticsearch
            索引的方式。
          </Paragraph>
          <Paragraph>
            <ul>
              <li>例如：输入 <Text code>logs-*</Text> 将自动包含所有以 <Text code>logs-</Text> 开头的索引（如 <Text
                code>logs-2025-12-01</Text>、<Text code>logs-app-prod</Text> 等）。
              </li>
              <li>
                支持的通配符：
                <ul>
                  <li><Text code>*</Text>：匹配任意字符（包括空字符），例如 <Text code>app-*-prod</Text></li>
                  <li><Text code>?</Text>：匹配单个任意字符，例如 <Text code>log-2025-12-??</Text></li>
                </ul>
              </li>
              <li>视图不会创建新索引，仅用于查询、聚合或监控时 逻辑上组合多个已有索引。</li>
            </ul>
          </Paragraph>
          <Paragraph>
            ⚠️ 注意：确保通配符模式能匹配到实际存在的索引，否则查询可能返回空结果或报错。
          </Paragraph>
        </div>
      </div>,
      header: "新增视图",
      placement: "center",
      confirmBtn: "新增",
      onConfirm: () => {
        dialog.setConfirmLoading(true);
        addDataBrowserView(urlId.value!, {
          pattern: pattern.value,
          id: useSnowflake().nextId(),
          createTime: Date.now(),
          updateTime: Date.now(),
        }).then(() => {
          MessageUtil.success("新增成功");
          dialog.destroy()
          fetchData();
        }).catch(e => {
          MessageUtil.error("新增失败", e);
        }).finally(() => {
          dialog.setConfirmLoading(false);
        })
      },
    })
  }

  const remove = async (id: string, label: string) => {
    MessageBoxUtil.alert(`是否删除视图「${label}」`, "确认删除")
      .then(() => {
        deleteDataBrowserView(urlId.value!, id).then(() => {
          MessageUtil.success("删除成功");
          fetchData();
        }).catch(e => {
          MessageUtil.error("删除失败", e);
        })
      })
  }

  return {
    views,
    init,
    add,
    remove
  };


});