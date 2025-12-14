import { useDevToolFileItemStore, useUrlStore } from "@/store";
import {Form, FormItem, Input, TreeSelect, TreeOptionData, DialogPlugin} from "tdesign-vue-next";
import MessageUtil from "@/utils/model/MessageUtil";
import { listToTree } from "@/page/dev-tool/func";
import { cloneDeep } from "es-toolkit";
import {DevToolFileCreateProp} from "@/entity";
import {devToolFileList} from "@/service/DevToolFileService";



export async function createDevTool(props?: Partial<DevToolFileCreateProp>) {
  const { id } = useUrlStore();
  if (!id) return;
  const data = ref<Array<TreeOptionData>>([]);
  const folderLoading = ref(true);
  const devTool = ref<DevToolFileCreateProp>({
    folder: false,
    name: "",
    parentId: '0'
  });

  Object.assign(devTool.value, props);

  devToolFileList(id).then(res => data.value = listToTree(res)).finally(() => folderLoading.value = false)

  const dp = DialogPlugin({
    header: "新增文件" + (devTool.value.folder ? "夹" : ""),
    placement: "center",
    confirmBtn: "新增",
    cancelBtn: "取消",
    onConfirm: async () => {
      dp.update({
        confirmLoading: true
      });
      await useDevToolFileItemStore()
        .add(cloneDeep(devTool.value))
        .then(() => {
          dp.destroy();
          MessageUtil.success("新增成功");
        });
    },
    default: () => (
      <Form data={devTool.value}>
        <FormItem label={"文件" + (devTool.value.folder ? "夹" : "") + "名称"}>
          <Input v-model={devTool.value.name} clearable autofocus={true} />
        </FormItem>
        <FormItem label={"父级文件夹"}>
          <TreeSelect
            v-model={devTool.value.parentId}
            data={data.value}
            loading={folderLoading.value}
          />
        </FormItem>
      </Form>
    )
  });
}
