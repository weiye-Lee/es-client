import { useDevToolFileItemStore, useUrlStore } from "@/store";
import {Form, FormItem, Input, TreeSelect, TreeOptionData, DialogPlugin} from "tdesign-vue-next";
import MessageUtil from "@/utils/model/MessageUtil";
import { listToTree } from "@/page/dev-tool/func";
import { cloneDeep } from "es-toolkit";
import {DevToolFileCreateProp} from "@/entity";
import {devToolFileList} from "@/api/DevToolFileService";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

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
    header: devTool.value.folder ? t('dev_tool.new_folder') : t('dev_tool.new_file'),
    placement: "center",
    confirmBtn: t('dev_tool.create'),
    cancelBtn: t('dev_tool.cancel'),
    onConfirm: async () => {
      dp.update({
        confirmLoading: true
      });
      await useDevToolFileItemStore()
        .add(cloneDeep(devTool.value))
        .then(() => {
          dp.destroy();
          MessageUtil.success(t('dev_tool.create_success'));
        });
    },
    default: () => (
      <Form data={devTool.value}>
        <FormItem label={devTool.value.folder ? t('dev_tool.folder_name') : t('dev_tool.file_name')}>
          <Input v-model={devTool.value.name} clearable autofocus={true} />
        </FormItem>
        <FormItem label={t('dev_tool.parent_folder')}>
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
