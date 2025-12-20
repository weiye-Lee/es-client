import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite';
import {TDesignResolver} from '@tdesign-vue-next/auto-import-resolver';
import path from 'path'
import UnoCSS from 'unocss/vite'

function _resolve(...dir: Array<string>) {
  return path.resolve(__dirname, ...dir);
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  let outDir = "dist";
  switch (mode) {
    case "edge":
      outDir = "src-edge/es-client";
      break;
    case "chrome":
      outDir = "src-chrome/es-client";
      break;
    case "firefox":
      outDir = "src-firefox/es-client";
      break;
  }
  return {
    resolve: {
      alias: {
        '@': _resolve('src'),
        "$": _resolve('src', 'core'),
      }
    },
    plugins: [
      vue(), VueJsx(),
      AutoImport({
        resolvers: [TDesignResolver({
          library: 'vue-next'
        })],
        imports: ['vue', '@vueuse/core', 'vue-router']
      }),
      Components({
        resolvers: [
          TDesignResolver({
            library: 'vue-next'
          })
        ]
      }),
      UnoCSS()
    ],
    base: './',
    build: {
      outDir: outDir,
    },
    server: {
      port: 7743,
      proxy: {
        '/es': "http://10.20.30.2:9200"
      }
    },
    // 强制预构建插件包
    optimizeDeps: {
      include: [
        // `monaco-editor/esm/vs/language/typescript/ts.worker`,
        `monaco-editor/esm/vs/language/json/json.worker`,
        `monaco-editor/esm/vs/editor/editor.worker`
      ],
    },
    envDir: 'env'
  }
})
