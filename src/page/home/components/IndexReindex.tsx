import {useIndexStore} from "@/store";
import {Alert, Button, Form, FormItem, DialogPlugin, DialogInstance, Option, Select, Switch} from "tdesign-vue-next";
import MessageUtil from "@/utils/model/MessageUtil";
import {useEsRequest} from "@/plugins/native/axios";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import AppLink from "@/components/AppLink/AppLink.vue";
import {IndexItem} from "$/elasticsearch-client";
import {useLoading} from "@/hooks/UseLoading";
import i18n from "@/i18n";

interface Config {
  index: string;
  async: boolean;
}

/**
 * 索引迁移，从一个索引转到另一个索引
 * @param index
 */
export function indexReindex(index: string) {
  // 全部的索引
  const indices: Array<IndexItem> = useIndexStore().list;
  const config = ref<Config>({
    index: '',
    async: false
  });

  let modalReturn = DialogPlugin({
    // TODO: 此处bete
    header: i18n.global.t('home.index_reindex.title', {index}),
    default: () => <>
      <Alert title={i18n.global.t('home.index_reindex.visualize')}>
        <span>{i18n.global.t('home.index_reindex.coming_soon_pre')}</span>
        <AppLink event="Reindex"/>
        <span>{i18n.global.t('home.index_reindex.coming_soon_mid')}</span>
        <strong>{i18n.global.t('home.index_reindex.coming_soon_bold')}</strong>
        <span>{i18n.global.t('home.index_reindex.coming_soon_post')}</span>
      </Alert>
      <div style="margin: 8px 0;">
        {i18n.global.t('home.index_reindex.desc')}
      </div>
      <Form data={config.value} layout="vertical">
        <FormItem label={i18n.global.t('home.index_reindex.target_index')}>
          <Select v-model={config.value.index} filterable clearable>
            {indices.map(item =>
              <Option key={item.name} value={item.name} label={item.name}
                      disabled={item.name === index}>{item.name}</Option>)}
          </Select>
        </FormItem>
        <FormItem label={i18n.global.t('home.index_reindex.async')}>
          {{
            default: () => <Switch v-model={config.value.async} />,
            help: () => <span>{i18n.global.t('home.index_reindex.async_help')}</span>
          }}
        </FormItem>
      </Form>
    </>,
    footer: () => <>
      <Button variant="text" theme={"primary"} onClick={() => jumpTo(index, config, modalReturn)}>{i18n.global.t('home.index_reindex.jump_to_senior_search')}</Button>
      <Button onClick={() => modalReturn.destroy()}>{i18n.global.t('home.index_reindex.cancel')}</Button>
      <Button theme="primary" onClick={() => onOk(index, config, modalReturn)}>{i18n.global.t('home.index_reindex.execute')}</Button>
    </>,
    draggable: true,
  });
}

function jumpTo(index: string, config: Ref<Config>, modalReturn: DialogInstance) {
  useSeniorSearchStore().loadEvent({
    method: 'POST',
    link: '_reindex' + (config.value.async ? '?wait_for_completion=false' : ''),
    body: `{
    "source": {"index": "${index}",
    "dest": {"index": "${config.value.index}"}
}`
  });
  modalReturn.destroy();
}

function onOk(index: string, config: Ref<Config>, modalReturn: DialogInstance) {
  if (config.value.index == '') {
    MessageUtil.warning(i18n.global.t('home.index_reindex.select_target_index'));
    return;
  }
  const loading = useLoading(i18n.global.t('home.index_reindex.starting'));
  useEsRequest({
    url: '_reindex' + (config.value.async ? '?wait_for_completion=false' : ''),
    method: 'POST',
    data: {
      source: {index: index},
      dest: {index: config.value.index}
    },
  }).then(res => MessageUtil.success(res))
    .catch(e => MessageUtil.error(i18n.global.t('home.index_reindex.failed'), e))
    .finally(() => {
      loading.close();
      modalReturn.destroy();
    })
}
