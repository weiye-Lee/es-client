import {Button, DialogPlugin, Form, FormItem, Input, InputNumber, Option, Select, Switch} from "tdesign-vue-next";
import useEditorSettingStore from "@/store/setting/EditorSettingStore";
import MessageUtil from "@/utils/model/MessageUtil";

export function useSeniorSearchSetting() {
  const instance = ref(useEditorSettingStore().getSetting);

  function save() {
    useEditorSettingStore().save(instance.value).then(() => {
      MessageUtil.success('保存成功，重启插件后生效');
      modalReturn.destroy();
    });
  }

  const modalReturn = DialogPlugin({
    header: "编辑器设置",
    placement: "center",
    width: 600,
    footer: false,
    default: () => <Form data={instance.value} layout="vertical">
      <FormItem label="字体大小" labelAlign={"top"}>
        <InputNumber v-model={instance.value.fontSize} min={8} max={100} step={1} style="width: 100px"/>
      </FormItem>
      <FormItem label="显示小地图" labelAlign={"top"}>
        <Switch v-model={instance.value.minimap}>
          {{
            label: (check: { value: boolean }) => <span>{check.value ? '显示' : '隐藏'}</span>,
          }}
        </Switch>
      </FormItem>
      <FormItem label="换行" labelAlign={"top"}>
        <Select v-model={instance.value.wordWrap} style="width: 200px">
          <Option label="启用" value="on"/>
          <Option label="禁用" value="off"/>
          <Option label="单词处换行" value="wordWrapColumn"/>
          <Option label="最小值换行" value="bounded"/>
        </Select>
      </FormItem>
      <FormItem label="运行 - 字体颜色" labelAlign={"top"}>
        <Input v-model={instance.value.runColor} placeholder="颜色，十六进制"/>
      </FormItem>
      <div style="text-align: right;margin-top: 18px">
        <Button onClick={() => modalReturn.destroy()}>取消</Button>
        <Button onClick={save} theme="primary">保存</Button>
      </div>
    </Form>
  });
}
