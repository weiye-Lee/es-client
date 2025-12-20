import {createI18n} from 'vue-i18n'
import zhCN from './locales/zh-CN'
import zhTW from './locales/zh-TW'
import en from './locales/en'
import ja from './locales/ja'
import de from './locales/de'
import LocalNameEnum from "@/enumeration/LocalNameEnum";

const SUPPORT_LANGUAGE = ['zh-CN', 'zh-TW', 'en', 'ja', 'de'];

let initialLocale = localStorage.getItem(LocalNameEnum.KEY_LOCAL);

// 没有设置语言，尝试获取 chrome 的语言
if (window.chrome && !initialLocale) {
  const chromeLanguage = chrome.i18n.getUILanguage();
  if (SUPPORT_LANGUAGE.includes(chromeLanguage)) {
    initialLocale = chromeLanguage;
  }
}


const i18n = createI18n({
  legacy: true, // support Options API
  allowComposition: true, // support Composition API
  locale: (initialLocale && SUPPORT_LANGUAGE.includes(initialLocale)) ? initialLocale : "zh-CN",
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    'en': en,
    'ja': ja,
    'de': de,
  },
});


// chrome.i18n.getMessage("language")

export default i18n
