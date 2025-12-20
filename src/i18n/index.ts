import { createI18n } from 'vue-i18n'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'
import de from './locales/de'

const i18n = createI18n({
  legacy: true, // support Options API
  allowComposition: true, // support Composition API
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en': en,
    'ja': ja,
    'de': de,
  },
})

export default i18n
