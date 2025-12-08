enum LocalNameEnum {

  KEY_LAST_URL = '/key/last-url',

  KEY_VERSION = '/key/version',

  KEY_THEME = '/key/theme',

  KEY_SENIOR_SEARCH_VIEW = '/key/senior-search/view',

  KEY_TOKEN = '/key/token',

  KEY_SENIOR_SEARCH_EDITOR = '/key/senior-search/editor',

  KEY_PRIVACY_ENABLE = '/key/privacy/enable',

  KEY_PRIVACY_PLATFORM = '/key/privacy/platform',

  KEY_PRIVACY_SYSTEM = '/key/privacy/system',

  KEY_PRIVACY_ES_VERSION = '/key/privacy/es/version',

  KEY_COLLAPSED = '/key/collapsed',

  DB_URL = '/db/url',

  DB_BASE_SEARCH_HISTORY = '/db/base-search-history',

  /**
   * 设置 - 全局
   */
  SETTING_GLOBAL = '/setting/global',

  /**
   * 设置 - 编辑器
   */
  SETTING_EDITOR = '/setting/editor',

  /**
   * 设置 - 数据浏览
   */
  SETTING_DATA_BROWSE = '/setting/data-browse',

  /**
   * 设置 - 基础搜索
   */
  SETTING_BASE_SEARCH = '/setting/base-search',

  /**
   * 设置 - 高级过滤器
   */
  SETTING_SENIOR_FILTER = '/setting/senior-filter',

  /**
   * 设置 - 备份
   */
  SETTING_BACKUP = '/setting/backup',

  /**
   * 记录 - 高级查询
   * /record/senior-search
   */
  INDEX_SENIOR_SEARCH_HISTORY = '/index/senior-search-history',

  /**
   * 记录 - 高级查询
   * /record/senior-search/${id}
   */
  RECORD_SENIOR_SEARCH_HISTORY = '/record/senior-search-history/',

  /**
   * 数据浏览 - 视图
   * /item/data-browser/view/${urlId}
   */
  ITEM_DATA_BROWSER_VIEW = '/item/data-browser/view',

  /**
   * 数据浏览 - 查询列表
   * /list/data-browser/query/${urlId}
   */
  LIST_DATA_BROWSER_QUERY = '/list/data-browser/query',

  /**
   * 数据浏览 - 查询项
   * /item/data-browser/query/${id}
   */
  ITEM_DATA_BROWSER_QUERY = '/item/data-browser/query',

  /**
   * 页面 - 数据浏览 - 大小
   * /page/data-browser/size
   */
  PAGE_DATA_BROWSER_SIZE = '/page/data-browser/size',

  /**
   * 页面 - 高级查询 - 大小
   * /page/senior-search/size
   */
  PAGE_SENIOR_SEARCH_SIZE = '/page/senior-search/size',

  /**
   * 页面 - 高级查询 - 大小
   * /value/senior-search/split-size'
   * @deprecated 已不再使用，请使用 VALUE_SENIOR_SEARCH_SPLIT_PANEL_SIZE
   */
  VALUE_SENIOR_SEARCH_SPLIT_SIZE = '/value/senior-search/split-size',

  /**
   * 页面 - 高级查询 - 大小
   * /value/senior-search/split-panel-size'
   */
  VALUE_SENIOR_SEARCH_SPLIT_PANEL_SIZE = '/value/senior-search/split-panel-size',

}

export default LocalNameEnum;
