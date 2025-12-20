import ConditionExportEvent, {
  ApiType,
  ExportConfig,
  ExportMode,
  ExportScope,
  ExportSource,
  ExportType
} from "@/components/DataExport/domain";
import {
  Alert,
  DrawerPlugin,
  Form,
  FormItem,
  Input,
  InputGroup,
  InputNumber,
  Option,
  Radio,
  RadioGroup,
  Select
} from "tdesign-vue-next";
import {exportData} from "@/components/DataExport/func";
import MessageUtil from "@/utils/model/MessageUtil";
import AppLink from "@/components/AppLink/AppLink.vue";
import {useLoading} from "@/hooks/UseLoading";
import i18n from "@/i18n";

const t = (key: string) => i18n.global.t(key);

const allowExportTypes: Array<ExportType> = [ExportType.JSON];

/**
 * 显示导出组件
 * @param config 配置项
 */
export function showDataExportDrawer(config: ConditionExportEvent) {

  const instance: Ref<ExportConfig> = ref<ExportConfig>(getDefaultConfig(config));

  // 显示对话框
  DrawerPlugin({
    header: t('module.data_export.title'),
    size: "600px",
    default: () => <Form data={instance.value}>
      <Alert title={t('module.data_export.tips.title')}>
        <span>{t('module.data_export.tips.content_pre')}</span>
        <AppLink event="导出"/>
        <span>{t('module.data_export.tips.content_post')}</span>
      </Alert>
      <FormItem label={t('module.data_export.form.filename')} labelAlign={"top"}>
        <Input v-model={instance.value.name}/>
      </FormItem>
      <FormItem label={t('module.data_export.form.file_type')} labelAlign={"top"}>
        <Select v-model={instance.value.type}>
          <Option value={ExportType.JSON} label={t('module.data_export.options.file_type.json')}>{t('module.data_export.options.file_type.json')}</Option>
          <Option value={ExportType.XLSX} label={t('module.data_export.options.file_type.xlsx')}>{t('module.data_export.options.file_type.xlsx')}</Option>
          <Option value={ExportType.CSV} label={t('module.data_export.options.file_type.csv')}>{t('module.data_export.options.file_type.csv')}</Option>
          <Option value={ExportType.TSV} label={t('module.data_export.options.file_type.tsv')}>{t('module.data_export.options.file_type.tsv')}</Option>
          <Option value={ExportType.TXT} label={t('module.data_export.options.file_type.txt')}>{t('module.data_export.options.file_type.txt')}</Option>
        </Select>
      </FormItem>
      {isText(instance)}
      <FormItem label={t('module.data_export.form.export_scope')} labelAlign={"top"}>
        <Select v-model={instance.value.scope}>
          <Option value={ExportScope.CURRENT} label={t('module.data_export.options.scope.current_page')}>{t('module.data_export.options.scope.current_page')}</Option>
          <Option value={ExportScope.ALL} label={t('module.data_export.options.scope.all')}>{t('module.data_export.options.scope.all')}</Option>
          <Option value={ExportScope.CUSTOM} label={t('module.data_export.options.scope.custom')}>{t('module.data_export.options.scope.custom')}</Option>
        </Select>
      </FormItem>
      {isCustom(instance)}
      {isCurrent(instance)}
      <FormItem label={t('module.data_export.form.source')} labelAlign={"top"}>
        <Select v-model={instance.value.source}>
          <Option value={ExportSource.ALL} label={t('module.data_export.options.source.all')}
                  disabled={!allowExportTypes.includes(instance.value.type)}>{t('module.data_export.options.source.all')}
          </Option>
          <Option value={ExportSource.HIT} label={t('module.data_export.options.source.hit')}>{t('module.data_export.options.source.hit')}</Option>
          <Option value={ExportSource.SOURCE} label={t('module.data_export.options.source.source')}>{t('module.data_export.options.source.source')}</Option>
        </Select>
      </FormItem>
      <FormItem label={t('module.data_export.form.api_type')} labelAlign={"top"}>
        {{
          default: () => <RadioGroup v-model={instance.value.apiType} theme="button"
                                     disabled={instance.value.scope != ExportScope.ALL}>
            <Radio value={ApiType.BASE}>{t('module.data_export.options.api_type.base')}</Radio>
            <Radio value={ApiType.SCROLL}>{t('module.data_export.options.api_type.scroll')}</Radio>
          </RadioGroup>,
          help: () => {
            if (instance.value.scope != ExportScope.ALL) {
              return <span>{t('module.data_export.help.api_scope')}</span>
            } else if (instance.value.apiType === ApiType.BASE) {
              return <span>{t('module.data_export.help.api_base')}</span>
            } else if (instance.value.apiType === ApiType.SCROLL) {
              return <span>{t('module.data_export.help.api_scroll')}</span>
            }
          }
        }}
      </FormItem>
      {isScroll(instance)}
    </Form>,
    onConfirm() {
      // 打开
      const loading = useLoading(t('module.data_export.message.start_export'));
      exportData(instance.value)
        .then(() => MessageUtil.success(t('module.data_export.message.export_success')))
        .catch(e => MessageUtil.error(t('module.data_export.message.export_failed'), e))
        .finally(() => loading.close());
    }
  });
}

function getDefaultConfig(config: ConditionExportEvent): ExportConfig {
  return {
    name: config.name,
    type: ExportType.JSON,
    separator: '',
    scope: ExportScope.CURRENT,
    customStart: 1,
    customEnd: 2,
    source: ExportSource.ALL,
    fields: [],
    size: 1000,
    mode: ExportMode.DOWNLOAD,
    search: config.search,
    index: config.index,
    apiType: ApiType.BASE,
    scrollTime: "1m"
  }
}

function isText(instance: Ref<ExportConfig>) {
  if (instance.value.type === ExportType.TXT) {
    return <FormItem label={t('module.data_export.form.separator')} labelAlign={"top"}>
      <Input v-model={instance.value.separator}/>
    </FormItem>;
  }
}

function isCustom(instance: Ref<ExportConfig>) {
  if (instance.value.scope === ExportScope.CUSTOM) {
    return <FormItem label={t('module.data_export.form.range')} labelAlign={"top"}>
      <InputGroup>
        <InputNumber v-model={instance.value.customStart} min={1}/>
        <span> - </span>
        <InputNumber v-model={instance.value.customEnd} min={instance.value.customStart}/>
      </InputGroup>
    </FormItem>;
  }
}

function isCurrent(instance: Ref<ExportConfig>) {
  if (instance.value.scope !== ExportScope.CURRENT) {
    return <FormItem label={t('module.data_export.form.page_size')} labelAlign={"top"}>
      <InputNumber v-model={instance.value.size} min={1}/>
    </FormItem>
  }
}

function isScroll(instance: Ref<ExportConfig>) {
  if (instance.value.apiType === ApiType.SCROLL) {
    return <FormItem label={t('module.data_export.form.scroll_time')} labelAlign={"top"}>
      {{
        default: () => <Input v-model={instance.value.scrollTime}/>,
        help: () => {
          return <span>{t('module.data_export.help.scroll_error')}</span>
        }
      }}
    </FormItem>
  }
}
