import * as monaco from "monaco-editor";
import {language} from "@/components/RestClientEditor/language";
import configuration from "@/components/RestClientEditor/configuration";
import provider from "@/components/RestClientEditor/provider";
import {restFoldingRangeProvider} from "@/components/RestClientEditor/foldingRange";

export {default as RestClientEditor} from "./index.vue";

export function registerLanguageForHttp() {
  monaco.languages.register({id: 'http'});
  // 语法高亮
  monaco.languages.setMonarchTokensProvider('http', language);
  // 语言括号配置
  monaco.languages.setLanguageConfiguration('http', configuration);
  // 语法提示
  monaco.languages.registerCompletionItemProvider('http', provider);
  // 代码折叠
  monaco.languages.registerFoldingRangeProvider('http', restFoldingRangeProvider)
}