<template>
  <div class="home">
    <!-- 上面的搜索条件 -->
    <div class="home-option">
      <t-input-group>
        <!-- 输入框 -->
        <t-input v-model="keyword" placeholder="请输入索引名称" style="width: 45vw;height: 32px;" clearable/>
        <t-popup trigger="click" show-arrow>
          <t-button theme="default" shape="square" variant="outline">
            <template #icon>
              <icon-more/>
            </template>
          </t-button>
          <template #content>
            <t-descriptions class="home-query-status">
              <t-descriptions-item label="状态">
                <t-radio-group v-model="status" type="button">
                  <t-radio :value="Status.NONE">忽略</t-radio>
                  <t-radio :value="Status.OPEN">开启</t-radio>
                  <t-radio :value="Status.CLOSE">关闭</t-radio>
                </t-radio-group>
              </t-descriptions-item>
            </t-descriptions>
          </template>
        </t-popup>
        <t-select v-model="order" placeholder="索引排序" style="width: 120px;margin-left: 7px;">
          <t-option :value="OrderType.NAME_ASC" label="名称正序"/>
          <t-option :value="OrderType.NAME_DESC" label="名称倒序"/>
        </t-select>
      </t-input-group>
      <!-- 新增索引 -->
      <t-button theme="primary" style="margin-left: 10px" @click="indexAdd()" :disabled="!url">
        新建
      </t-button>
    </div>
    <!-- 索引容器 -->
    <div class="home-container" ref="homeContainer">
      <a-list class="home-index-items" :data="items" :virtual-list-props="virtualListProps"
              :scrollbar="true"
              :bordered="false" :split="false">
        <template #item="{ item }">
          <a-list-item :key="item.name">
            <index-item :index="item"/>
          </a-list-item>
        </template>
        <template #empty>
          <empty-result title="空空如也"/>
        </template>
      </a-list>
      <t-back-top container=".home-container .arco-scrollbar-container"/>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {useIndexStore, useUrlStore} from '@/store';
import IndexItem from "./components/index-item.vue";
import {useFuse} from "@vueuse/integrations/useFuse";
import {OrderType, Status, useHomeStore} from "@/store/components/HomeStore";
import {indexAdd} from "@/page/home/components/IndexAdd";


const size = useWindowSize();

const keyword = useHomeStore().keyword;
const order = useHomeStore().order;
const status = useHomeStore().status;

const url = computed(() => useUrlStore().url);
const virtualListProps = computed(() => ({
  height: size.height.value - 40 - 15 - 42
}))
const indices = computed(() => {
  useIndexStore().sort(order.value);
  let indices = useIndexStore().indices;
  // 状态
  if (status.value !== Status.NONE) {
    if (status.value === Status.OPEN) {
      indices = indices.filter(index => index.state === 'open');
    } else if (status.value === Status.CLOSE) {
      indices = indices.filter(index => index.state === 'close');
    }
  }
  // 排序
  return indices;
});


const {results} = useFuse(keyword, indices, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [{
      name: 'name'
    }, {
      name: 'alias'
    }]
  }
});

const items = computed(() => {
  return results.value.map(result => result.item)
})
</script>

<style lang="less">
@import url(./index.less);
</style>
