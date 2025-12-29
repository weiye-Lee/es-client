import {defineStore} from "pinia";
import {getFromOneByAsync, saveOneByAsync} from "@/utils/utools/DbStorageUtil";
import LocalNameEnum from "@/enumeration/LocalNameEnum";

/**
 * 索引使用频率记录
 */
export interface IndexUsageRecord {
  /**
   * 索引名称到使用次数的映射
   */
  usageCount: Record<string, number>;
  
  /**
   * 最后更新时间
   */
  lastUpdated: number;
}

const DEFAULT_USAGE_RECORD: IndexUsageRecord = {
  usageCount: {},
  lastUpdated: Date.now()
};

/**
 * 频繁使用的阈值
 */
export const FREQUENT_USAGE_THRESHOLD = 10;

const useIndexUsageStore = defineStore('index-usage', {
  state: () => ({
    usageRecord: { ...DEFAULT_USAGE_RECORD } as IndexUsageRecord,
    initialized: false
  }),
  
  getters: {
    /**
     * 获取索引使用次数
     */
    getUsageCount: (state) => (indexName: string): number => {
      return state.usageRecord.usageCount[indexName] || 0;
    },
    
    /**
     * 检查索引是否为常用索引
     */
    isFrequentlyUsed: (state) => (indexName: string): boolean => {
      return (state.usageRecord.usageCount[indexName] || 0) >= FREQUENT_USAGE_THRESHOLD;
    },
    
    /**
     * 获取所有使用记录，按使用次数降序排列
     */
    sortedUsageRecords: (state): Array<{ name: string; count: number }> => {
      return Object.entries(state.usageRecord.usageCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
    }
  },
  
  actions: {
    /**
     * 初始化存储
     */
    async init() {
      if (this.initialized) return;
      
      const result = await getFromOneByAsync<IndexUsageRecord>(
        LocalNameEnum.SETTING_INDEX_USAGE,
        { ...DEFAULT_USAGE_RECORD }
      );
      this.usageRecord = result.record;
      this.initialized = true;
    },
    
    /**
     * 记录索引使用
     */
    recordUsage(indexName: string) {
      if (!indexName) return;
      
      const currentCount = this.usageRecord.usageCount[indexName] || 0;
      this.usageRecord.usageCount[indexName] = currentCount + 1;
      this.usageRecord.lastUpdated = Date.now();
      
      this.sync();
    },
    
    /**
     * 批量获取索引的排序权重
     */
    getSortWeight(indexName: string): number {
      return this.usageRecord.usageCount[indexName] || 0;
    },
    
    /**
     * 同步到持久化存储
     */
    async sync() {
      await saveOneByAsync(LocalNameEnum.SETTING_INDEX_USAGE, toRaw(this.usageRecord));
    },
    
    /**
     * 清除使用记录
     */
    async clear() {
      this.usageRecord = { ...DEFAULT_USAGE_RECORD };
      await this.sync();
    }
  }
});

export default useIndexUsageStore;