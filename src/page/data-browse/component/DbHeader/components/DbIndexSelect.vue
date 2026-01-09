<template>
    <a-trigger position="top" auto-fit-position :unmount-on-close="false" trigger="click" v-model:popup-visible="show"
               :popup-offset="2">
        <a-button type="text" size="mini" @click="showIndex()">
            <a-space>
                <icon-up style="margin: 5px;" v-if="show"/>
                <icon-down style="margin: 5px;" v-else/>
                <span v-if="name === ''" style="user-select: none;">未选择索引</span>
                <span v-else style="user-select: none;">{{ name }}</span>
                <a-tag v-if="isCurrentFrequent" color="arcoblue" size="small" class="frequent-tag-inline">常用</a-tag>
            </a-space>
        </a-button>
        <template #content>
            <div class="data-browse-pull-down-panel">
                <a-empty v-if="indices.length === 0" description="请选择链接" style="padding-top: 150px"/>
                <div class="data-browse-pull-down-index" v-else>
                    <a-input v-model="keyword" class="data-browse-pull-down-search" ref="dataBrowsePullDownSearch"
                             allow-clear placeholder="搜索索引..."/>
                    <a-scrollbar style="height: 358px" class="data-browse-pull-down-data">
                        <div>
                            <div v-if="input" class="data-browse-list-item"
                                 :class="input.name === name ? 'data-browse-list-item-this' : ''"
                                 @click="indexChange(input?.name, input?.type)">
                                <span class="item-name">{{ input.name }}</span>
                                <div class="item-tags">
                                    <a-tag color="orange" size="small">自定义</a-tag>
                                </div>
                            </div>
                            <div v-for="item in items" :key="item.name" class="data-browse-list-item"
                                 :class="item.name === name ? 'data-browse-list-item-this' : ''"
                                 @click="indexChange(item.name, item.type, item.index)">
                                <span class="item-name">{{ item.name }}</span>
                                <div class="item-tags">
                                    <a-tag v-if="isFrequentlyUsed(item.name)" color="arcoblue" size="small" class="frequent-tag">
                                        <icon-fire /> 常用
                                    </a-tag>
                                    <a-tag color="blue" size="small" v-if="item.type === 'index'">索引</a-tag>
                                    <a-tag color="green" size="small" v-else-if="item.type === 'alias'">别名</a-tag>
                                    <span v-if="getUsageCount(item.name) > 0" class="usage-count">
                                        {{ getUsageCount(item.name) }}次
                                    </span>
                                </div>
                            </div>
                        </div>
                    </a-scrollbar>
                </div>
            </div>
        </template>
    </a-trigger>
</template>
<script lang="ts" setup>
// import IndexView from "@/view/index/IndexView";
import { useIndexStore } from "@/store/IndexStore";
import {useDataBrowseStore} from "@/store/components/DataBrowseStore";
import useIndexUsageStore, {FREQUENT_USAGE_THRESHOLD} from "@/store/IndexUsageStore";
import {useFuse} from "@vueuse/integrations/useFuse";


interface Item {

    name: string;

    type: 'index' | 'alias' | 'custom';

    index?: any; // IndexView | undefined;
    
    usageCount?: number;

}


const keyword = ref('');
const show = ref(false);
const dataBrowsePullDownSearch = ref<HTMLDivElement | null>(null);
const input = ref<Item>()

const indexUsageStore = useIndexUsageStore();

// 初始化索引使用存储
onMounted(() => {
    indexUsageStore.init();
});

// const name = computed(() => useDataBrowseStore().name);

const name = ref('');

// 检查当前选中的索引是否为常用索引
const isCurrentFrequent = computed(() => {
    if (!name.value) return false;
    return indexUsageStore.isFrequentlyUsed(name.value);
});

// 获取索引使用次数
const getUsageCount = (indexName: string): number => {
    return indexUsageStore.getUsageCount(indexName);
};

// 检查索引是否为常用索引
const isFrequentlyUsed = (indexName: string): boolean => {
    return indexUsageStore.isFrequentlyUsed(indexName);
};

const indices = computed<Array<Item>>(() => {
    let items = new Set<Item>();
    let names = new Set<string>();
    let indices = useIndexStore().list;
    if (indices.length === 0) {
        return Array.from(items);
    }
    for (let index of indices) {
        // 索引不会重名
        items.add({
            name: index.name,
            type: 'index',
            index,
            usageCount: indexUsageStore.getUsageCount(index.name)
        });
        if (index.alias) {
            for (let alias of index.alias) {
                // 别名可能重复
                if (!names.has(alias)) {
                    names.add(alias);
                    items.add({
                        name: alias,
                        type: 'alias',
                        index,
                        usageCount: indexUsageStore.getUsageCount(alias)
                    });
                }
            }
        }
    }
    // 按使用频率排序（降序），使用次数相同则按名称排序
    return Array.from(items).sort((e1, e2) => {
        const count1 = e1.usageCount || 0;
        const count2 = e2.usageCount || 0;
        
        // 首先按使用次数降序排列
        if (count2 !== count1) {
            return count2 - count1;
        }
        
        // 使用次数相同，按名称字母顺序排列
        return e1.name.localeCompare(e2.name, 'zh');
    });
});

const {results} = useFuse(keyword, indices, {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
        keys: [{
            name: 'name'
        }]
    }
});

// 保持搜索结果也按使用频率排序
const items = computed(() => {
    const searchResults = results.value.map(e => e.item);
    // 如果有搜索关键词，保持搜索相关性排序；否则按使用频率排序
    if (keyword.value.trim()) {
        return searchResults;
    }
    return searchResults.sort((e1, e2) => {
        const count1 = e1.usageCount || 0;
        const count2 = e2.usageCount || 0;
        if (count2 !== count1) {
            return count2 - count1;
        }
        return e1.name.localeCompare(e2.name, 'zh');
    });
});

watch(keyword,  value =>  {
    if (value === '') {
        input.value = undefined;
        return;
    }
    if (indices.value.some(e => e.name.includes(value))) {
        // 存在索引包含关键字
        input.value = undefined;
        return;
    }
    input.value =  {
        name: value,
        type: 'custom'
    }
})


function showIndex() {
    show.value = !show.value;
    if (show.value) {
        // 聚焦
        nextTick(() => {
            if (dataBrowsePullDownSearch.value) {
                dataBrowsePullDownSearch.value.focus();
            }
            nextTick(() => {
                let element = document.querySelector('.data-browse-list-item-this');
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth'
                    })
                }
            })
        });
    }
}

function indexChange(name: string, type: string, index?: any) {
    show.value = false;
    // useDataBrowseStore().indexChange({
    //     name,
    //     type,
    //     index
    // })
}


</script>
<style lang="less">
// 下拉列表

.frequent-tag-inline {
    margin-left: 4px;
    font-size: 10px;
    padding: 0 4px;
    height: 16px;
    line-height: 16px;
}

.data-browse-pull-down-panel {
    width: 420px;
    height: 400px;
    background-color: var(--color-bg-1);
    border-radius: 5px;
    box-shadow: 0 0 6px var(--color-border-2);

    .data-browse-pull-down-index {
        width: 420px;
        height: 400px;

        .data-browse-pull-down-search {
            width: 410px;
            margin-left: 5px;
        }

        .data-browse-pull-down-data {
            height: 358px;
            width: 420px;
            margin-top: 5px;
            overflow: auto;
            color: var(--color-text-1)
        }
    }

    .data-browse-list-item {
        width: 420px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 40px;
        padding: 8px 16px 8px 16px;
        border-bottom: 1px solid var(--color-border-2);
        cursor: pointer;
        overflow: hidden;
        box-sizing: border-box;

        &:hover {
            background-color: var(--color-fill-2);
        }
        
        .item-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            margin-right: 8px;
        }
        
        .item-tags {
            display: flex;
            align-items: center;
            gap: 4px;
            flex-shrink: 0;
            
            .arco-tag {
                margin: 0;
            }
            
            .frequent-tag {
                display: flex;
                align-items: center;
                gap: 2px;
                
                .arco-icon {
                    font-size: 10px;
                }
            }
            
            .usage-count {
                font-size: 11px;
                color: var(--color-text-3);
                margin-left: 4px;
            }
        }
    }

    .data-browse-list-item-this {
        color: rgb(var(--arcoblue-6));
        background-color: var(--color-fill-2);
    }
}
</style>
