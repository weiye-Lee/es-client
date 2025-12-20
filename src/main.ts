import AppInstance from './App.vue';
import router from "@/plugins/router";
import {createPinia} from "pinia";
import "@/assets/less"
import VxeUIBase from 'vxe-pc-ui'
import 'vxe-pc-ui/es/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/es/style.css'
import 'virtual:uno.css'
import {registerLanguageForSql} from "@/components/SqlEditor";
import {registerLanguageForHttp} from "@/components/RestClientEditor";
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'
import i18n from '@/i18n'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
// @ts-ignore: worker 导入方式可以参考vite官网 https://cn.vitejs.dev/guide/features.html#web-workers
self.MonacoEnvironment = { // 提供一个定义worker路径的全局变量
  getWorker(_: string, label: string) {
    if (label === 'json') {
      return new JsonWorker()
    }
    return new EditorWorker()
  }
};

// 注册语言服务器
registerLanguageForHttp();
registerLanguageForSql();


// 插件
createApp(AppInstance)
  .use(createPinia())
  .use(router)
  .use(i18n)
  .use(VxeUIBase).use(VxeUITable)
  .mount('#app');

// 变量挂载
window.mode = import.meta.env.VITE_MODE;
window.referrer = import.meta.env.VITE_REFERRER;
