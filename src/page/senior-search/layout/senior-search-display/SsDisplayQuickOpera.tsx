import {Method} from "axios";
import {DrawerPlugin, Form, FormItem, Input, Radio, RadioGroup, Textarea} from "tdesign-vue-next";
import {createSeniorSearchRequestContent} from "@/entity/history/SeniorSearchRequest";
import {useSeniorSearchRequestStore} from "@/store/history/SeniorSearchRequestStore";
import MessageUtil from "@/utils/model/MessageUtil";
import MonacoEditor from "@/components/monaco-editor/index.vue";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";

const {post, remove, getById} = useSeniorSearchRequestStore();

export function openQuickAdd(sourceId?: number) {
  const okText = sourceId ? '修改' : '新增';

  const data = ref(createSeniorSearchRequestContent());
  let contentRev: string | undefined = undefined;
  if (sourceId) {
    getById(sourceId).then((result) => {
      data.value = result.record;
      contentRev = result.rev;
    }).catch((e) => {
      MessageUtil.error("获取快捷命令失败", e);
    })
  }

  const p = DrawerPlugin({
    header: okText + '快捷命令',
    default: () => <Form data={data.value} layout={'vertical'}>
      <FormItem label={'名称'} name={'name'} labelAlign={"top"}>
        <Input v-model={data.value.name} clearable placeholder={'请输入名称'} maxlength={64}/>
      </FormItem>
      <FormItem label={'描述'} name={'description'} labelAlign={"top"}>
        <Textarea v-model={data.value.description} placeholder={'请输入描述'} maxlength={255}/>
      </FormItem>
      <FormItem label={'请求方式'} name={'method'} labelAlign={"top"}>
        <RadioGroup v-model={data.value.method}>
          <Radio value={'GET'}>GET</Radio>
          <Radio value={'POST'}>POST</Radio>
          <Radio value={'PUT'}>PUT</Radio>
          <Radio value={'DELETE'}>DELETE</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label={'请求地址'} name={'url'} labelAlign={"top"}>
        <Input v-model={data.value.name} clearable placeholder={'请输入请求地址'} maxlength={255}/>
      </FormItem>
      <FormItem label={'请求体'} name={'body'} labelAlign={"top"}>
        <MonacoEditor v-model={data.value.body} language={'json'} height={'200px'}/>
      </FormItem>
    </Form>,
    size: '600px',
    confirmBtn: okText,
    async onConfirm() {
      try {
        await post(data.value);
        MessageUtil.success(okText + '成功');
        p.destroy?.();
        return true;
      } catch (e) {
        MessageUtil.error(okText + "新增失败", e);
        return false;
      }
    }
  })
}

export function openQuickDelete(sourceId: number) {
  remove(sourceId)
    .then(() => {
      MessageUtil.success("删除成功");
    })
    .catch(e => {
      MessageUtil.error("删除失败", e);
    })
}

export function loadQuickOpera(sourceId: number) {
  getById(sourceId).then((result) => {
    const {record} = result;
    useSeniorSearchStore().loadEvent({
      link: record.url,
      method: record.method as Method,
      body: record.body
    }, false);

  }).catch((e) => {
    MessageUtil.error("获取快捷命令失败", e);
  })
}
