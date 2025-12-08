import {defineStore} from "pinia";
import {DataBrowserQueryItem,} from "@/entity/DataBrowser/DataBrowserQuery";
import MessageUtil from "@/utils/model/MessageUtil";
import {DialogPlugin, FormItem, Input,} from "tdesign-vue-next";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import {
  addDataBrowserQuery,
  deleteDataBrowserQuery,
  listDataBrowserQuery,
  renameDataBrowserQuery,
} from "@/service/DataBrowser/DataBrwoserQueryService";

export const useDataBrowserQueryStore = defineStore("dataBrowserQuery", () => {
  const urlId = ref<number>();
  const query = ref<Array<DataBrowserQueryItem>>([]);

  async function fetchData() {
    if (!urlId.value) {
      query.value = [];
      return;
    }
    const items = await listDataBrowserQuery(urlId.value);
    query.value = items.sort((a, b) => a.name.localeCompare(b.name, "zh"));
  }

  const init = async (id?: number) => {
    if (id === urlId.value) return;
    urlId.value = id;
    await fetchData();
  };

  const add = async () => {
    const name = ref("");
    const dialog = DialogPlugin({
      default: () => (
        <div>
          <FormItem label={"文件名"}>
            <Input type="text" v-model={name.value} autofocus/>
          </FormItem>
        </div>
      ),
      header: "新增查询",
      placement: "center",
      confirmBtn: "新增",
      onConfirm: () => {
        dialog.setConfirmLoading(true);
        addDataBrowserQuery(urlId.value!, {
          name: name.value,
          id: Date.now(),
          createTime: Date.now(),
          updateTime: Date.now(),
        })
          .then(() => {
            MessageUtil.success("新增成功");
            dialog.destroy();
            fetchData();
          })
          .catch((e) => {
            MessageUtil.error("新增失败", e);
          })
          .finally(() => {
            dialog.setConfirmLoading(false);
          });
      },
    });
  };

  const remove = async (id: number, label: string) => {
    MessageBoxUtil.alert(`是否删除查询「${label}」`, "确认删除").then(() => {
      deleteDataBrowserQuery(urlId.value!, id)
        .then(() => {
          MessageUtil.success("删除成功");
          fetchData();
        })
        .catch((e) => {
          MessageUtil.error("删除失败", e);
        });
    });
  };

  const rename = async (id: number, name: string) => {
    MessageBoxUtil.prompt(`请输入新的查询名称`, "重命名查询", {
      inputValue: name,
      confirmButtonText: "重命名",
    }).then((newName) => {
      if (!newName) return MessageUtil.error("请输入新的查询名称");
      renameDataBrowserQuery(urlId.value!, id, newName)
        .then(() => {
          MessageUtil.success("重命名成功");
          fetchData();
        })
        .catch((e) => {
          MessageUtil.error("重命名失败", e);
        });
    });
  };

  return {
    query,
    init,
    add,
    rename,
    remove,
  };
});
