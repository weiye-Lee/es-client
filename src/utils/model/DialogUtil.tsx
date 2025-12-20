import MessageUtil from "@/utils/model/MessageUtil";
import {BrowserWindowType, createDataBrowserWindow} from "@/plugins/native/browser-window";
import {Constant} from "@/global/Constant";
import {formatJsonString, stringifyJsonWithBigIntSupport} from "$/util";
import {DialogInstance, DialogPlugin, TNode} from "tdesign-vue-next";
import i18n from "@/i18n";
import MonacoView from "@/components/view/MonacoView/index.vue";
import {useUrlStore} from "@/store";
import highlight from "highlight.js";
import {useLoading} from "@/hooks/UseLoading";

/**
 * 对话框参数
 */
interface DialogOption {
  width: string;
}

/**
 * 显示json对话框，异步加载数据
 * @param title 对话框标题
 * @param data 数据
 * @param options 操作人
 */
export function showJsonDialogByAsync(
  title: string,
  data: Promise<string>,
  options?: DialogOption
) {
  const loading = useLoading(i18n.global.t('utils.message.loading_data'));
  data
    .then((json) => showJson(title, json, options))
    .catch((e) => MessageUtil.error(i18n.global.t('utils.message.data_fetch_failed'), e))
    .finally(() => loading.close());
}

/**
 * 显示实例信息对话框
 * @param title 对话框标题
 * @param url 数据地址
 * @param options 操作人
 */
export function showInstanceInfoDialog(title: string, url: string, options?: DialogOption) {
  const loading = useLoading(i18n.global.t('utils.message.loading_data'));
  const {client} = useUrlStore();
  if (!client) {
    MessageUtil.error(i18n.global.t('utils.message.select_link'));
    return;
  }
  client.getText(url)
    .then((json) => showJson(title, json, options))
    .catch((e) => MessageUtil.error(i18n.global.t('utils.message.data_fetch_failed'), e))
    .finally(() => loading.close());
}

export function showJson(title: string, json: string, options?: DialogOption) {
  // 原始值
  const value = formatJsonString(json);
  // 创建对话框
  if (Constant.isSupportPin) {
    showDialog(title, () => <MonacoView value={value} height={"calc(100vh - 220px)"}/>, options);
  } else {
    createDataBrowserWindow(BrowserWindowType.JSON, value, value, {
      title: title
    });
  }
}

/**
 * 显示一个对话框
 * @param header 对话框标题
 * @param content 对话框内容
 * @param options 对话框选项
 */
export function showDialog(header: string, content: TNode, options?: DialogOption): DialogInstance {
  // 创建对话框
  return DialogPlugin({
    header: header,
    default: content,
    draggable: true,
    width: options ? options.width : "80vw",
    footer: false,
    className: "es-dialog",
    placement: "center"
  });
}


export function jsonToHtml(json: string | any): { html: string, original: string } {
  // 原始值
  let value: string;
  // 格式化后的值
  let html: string;
  let needPretty = true;
  if (typeof json === 'string') {
    if (/^\s*(\{[\s\S]*}|\[[\s\S]*])\s*$/.test(json)) {
      try {
        value = formatJsonString(json)
      } catch (e) {
        MessageUtil.error(i18n.global.t('utils.message.json_format_failed'), e);
        value = json as string;
        needPretty = false;
      }
    } else {
      value = json as string;
      needPretty = false;
    }
  } else {
    value = stringifyJsonWithBigIntSupport(json);
  }
  // 原始值
  if (needPretty && value !== '') {
    let highlightResult = highlight.highlight(value, {
      language: 'json'
    });
    html = highlightResult.value;
  } else {
    html = value;
  }
  return {html, original: value};
}
