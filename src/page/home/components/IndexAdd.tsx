import {
  Button,
  DialogInstance,
  DialogPlugin,
  Form,
  FormItem,
  Input,
  InputNumber,
  LoadingPlugin,
  Option,
  Select,
  TabPanel,
  Tabs
} from "tdesign-vue-next";
import {IndexCreate} from "@/domain/es/IndexCreate";
import {getDefaultIndexInstance, IndexInstance} from "@/domain/IndexInstance";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import MessageUtil from "@/utils/model/MessageUtil";
import {useIndexStore, useUrlStore} from "@/store";
import MonacoEditor from "@/components/monaco-editor/index.vue";
import {formatJsonString, parseJsonWithBigIntSupport, stringifyJsonWithBigIntSupport} from "$/util";
import {copyText} from "@/utils/BrowserUtil";
import AlertExtend from "@/components/AppExtend/AlertExtend.vue";
import i18n from "@/i18n";

/**
 * 索引创建
 *
 * 名字限制
 * - 不能是大写。
 * - 不能包含 \，/，*，?，"，<，>，|，(空格)，,，#等字符。
 * - 7.0 之后的版本不能再包含 : （冒号）字符了。
 * - 不能以 -，_，+ 开头。名字不能是 . 或者 ..。
 * - 不能长于 255 字节。需要注意的是某些字符是需要多个字节来表示的。
 */
export function indexAdd(): void {
  const index: Ref<IndexInstance> = ref<IndexInstance>(getDefaultIndexInstance());
  // 名字是否正确
  const nameError = ref(0);
  const activeKey = ref("1");
  const fromIndex = ref<string | undefined>();

  const indices = computed(() => useIndexStore().list);
  const disabled = computed(() => !fromIndex.value);

  watch(() => index.value.name, value => {

    if (value.trim() === '') {
      nameError.value = 0;
      return;
    }

    if (/[A-Z]+/.test(value)) {
      nameError.value = 1;
      return;
    }

    if (/[\\\/*?"<>|\s#]+/.test(value)) {
      nameError.value = 2;
      return;
    }
    if (/^[_\-+]+/.test(value)) {
      nameError.value = 3;
      return;
    }
    nameError.value = 0;
  });


  function copy() {
    if (fromIndex.value) {
      const sourceIndex = useIndexStore().indicesMap.get(fromIndex.value);
      if (!sourceIndex) {
        MessageUtil.warning(i18n.global.t('home.index_add.source_index_not_found'));
        return;
      }
      index.value = {
        name: index.value.name,
        settings: index.value.settings,
        mappings: formatJsonString(stringifyJsonWithBigIntSupport(sourceIndex.indexInfo.mappings))
      };
    }
  }

  let modalReturn = DialogPlugin({
    header: i18n.global.t('home.index_add.title'),
    width: "850px",
    draggable: true,
    dialogClassName: "home-index-add",
    placement: "center",
    default: () => <>
      <Form data={index.value}>
        <AlertExtend title={i18n.global.t('home.index_add.manual_trouble')} content={i18n.global.t('home.index_add.wizard_desc')}
                     event={"create-index"}/>
        <FormItem label={i18n.global.t('home.index_add.name')} labelAlign={"top"}>
          {{
            default: () => <Input v-model={index.value.name} style="width: 300px;" maxlength={255}
                                  clearable/>,
            help: () => {
              if (nameError.value === 1) {
                return <span>{i18n.global.t('home.index_add.name_cannot_be_uppercase')}</span>
              } else if (nameError.value === 2) {
                return <span>{i18n.global.t('home.index_add.name_invalid_chars')}</span>
              } else if (nameError.value === 3) {
                return <span>{i18n.global.t('home.index_add.name_start_invalid')}</span>
              }
            }
          }}
        </FormItem>
      </Form>
      <Tabs v-model={activeKey.value}>
        {{
          default: () => <>
            <TabPanel label={i18n.global.t('home.index_add.settings')} value="1">
              <Form data={index.value.settings} layout="vertical" class={"mt-8px"}>
                <FormItem label={i18n.global.t('home.index_add.shards')}>
                  <InputNumber v-model={index.value.settings.number_of_shards}/>
                </FormItem>
                <FormItem label={i18n.global.t('home.index_add.replicas')}>
                  <InputNumber v-model={index.value.settings.number_of_replicas}/>
                </FormItem>
              </Form>
            </TabPanel>
            <TabPanel label={i18n.global.t('home.index_add.mapping_settings')} value="2">
              <MonacoEditor v-model={index.value.mappings} language="json"
                            height={'calc(80vh - 336px)'} class={"mt-8px"}/>
            </TabPanel>
          </>,
          action: () => activeKey.value == "2" && <>
            <Select clearable filterable v-model={fromIndex.value}>
              {indices.value.map(idx =>
                <Option value={idx.name}>{idx.name}</Option>)}
            </Select>
            <Button variant="text" theme={"primary"} disabled={disabled.value} onClick={copy}>{i18n.global.t('home.index_add.copy_mapper')}</Button>
          </>
        }}
      </Tabs>
    </>,
    footer: () => <>
      <Button variant="text" theme={"primary"}
              onClick={() => jumpToSeniorSearch(index, modalReturn)}>{i18n.global.t('home.index_add.jump_to_senior_search')}</Button>
      <Button variant="text" theme={"primary"} onClick={() => copyIndex(index, modalReturn)}>{i18n.global.t('home.index_add.copy_to_clipboard')}</Button>
      <Button theme="default" onClick={() => modalReturn.destroy()}>{i18n.global.t('home.index_add.cancel')}</Button>
      <Button theme="primary" onClick={() => addIndex(index, modalReturn)}>{i18n.global.t('home.index_add.create')}</Button>
    </>,
  });
}

function jumpToSeniorSearch(index: Ref<IndexInstance>, modalReturn: DialogInstance) {
  // 构建数据
  // 高级查询数据填充
  useSeniorSearchStore().loadEvent({
    link: '/' + index.value.name,
    method: 'PUT',
    body: stringifyJsonWithBigIntSupport(getIndexCreate(index))
  });
  modalReturn.destroy();
}

function copyIndex(index: Ref<IndexInstance>, modalReturn: DialogInstance) {
  // 执行拷贝
  copyText(stringifyJsonWithBigIntSupport(getIndexCreate(index)));
  MessageUtil.success(i18n.global.t('home.index_add.copy_success'));
  modalReturn.destroy();
}

function addIndex(index: Ref<IndexInstance>, modalReturn: DialogInstance) {
  const {client} = useUrlStore();
  if (!client) return MessageUtil.error(i18n.global.t('home.index_add.select_link'));
  const instance = LoadingPlugin({text: i18n.global.t('home.index_add.creating')});
  // 新增
  client.createIndex(index.value.name, stringifyJsonWithBigIntSupport(getIndexCreate(index)))
    .then(res => {
      MessageUtil.success(res);
      useIndexStore().refreshIndex(index.value.name).catch(e => MessageUtil.error(i18n.global.t('home.index_add.refresh_error'), e));
    })
    .catch(e => MessageUtil.error(i18n.global.t('home.index_add.create_error'), e))
    .finally(() => instance.hide());
  modalReturn.destroy()
}


function getIndexCreate(index: Ref<IndexInstance>): IndexCreate {
  return {
    settings: index.value.settings,
    mappings: parseJsonWithBigIntSupport(index.value.mappings)
  };
}
