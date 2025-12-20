<template>
  <div class="display-record">
    <div class="display-record-head">
      <t-input-group>
        <t-select v-model="urlId" style="width: 200px" placeholder="选择所属链接" allow-clear allow-search>
          <t-option v-for="url in urls" :key="url.id" :value="url.id">{{ url.name }}</t-option>
        </t-select>
        <t-button theme="primary" shape="square" @click="search()">
          <template #icon>
            <search-icon/>
          </template>
        </t-button>
      </t-input-group>
      <t-popconfirm content="此操作将清空全部历史记录，是否继续" confirm-btn="清空" @confirm="clear()">
        <t-button theme="danger" shape="square" :loading="clearLoading">
          <template #icon>
            <delete-icon/>
          </template>
        </t-button>
      </t-popconfirm>
    </div>
    <div class="display-record-body">
      <t-table :data="records" :columns="columns" row-key="id">
        <template #op="{ row }">
          <t-tooltip content="载入">
            <t-button theme="primary" @click="load(row)">
              <template #icon>
                <file-import-icon/>
              </template>
            </t-button>
          </t-tooltip>
          <t-popconfirm content="是否删除此记录？">
            <t-button theme="danger">
              <template #icon>
                <delete-icon/>
              </template>
            </t-button>
          </t-popconfirm>
        </template>
        <template #expandedRow="{ row }">
          <monaco-view :value="row.body" height="400px"/>
        </template>
      </t-table>
      <t-pagination v-model:current="current" v-model:page-size="size" :total="total" style="margin-top: 7px;"/>
    </div>
  </div>

</template>
<script lang="ts" setup>
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import {SeniorSearchRecord} from "@/entity/record/SeniorSearchRecord";
import {seniorSearchRecordService} from "@/global/BeanFactory";
import {useUrlStore} from "@/store";
import MessageUtil from "@/utils/model/MessageUtil";
import MonacoView from "@/components/view/MonacoView/index.vue";
import {DeleteIcon, FileImportIcon, SearchIcon} from "tdesign-icons-vue-next";

const urlId = ref<number | undefined>(useUrlStore().id);
const records = ref(new Array<SeniorSearchRecord>());
const clearLoading = ref(false);

const current = ref(1);
const size = ref(10);
const total = ref(0);

const columns = [
  {colKey: 'method', title: '请求方式', width: 100},
  {colKey: 'link', title: '请求连接', width: 150},
  {colKey: 'op', title: '操作', width: 85, fixed: 'right' as const}
];

watch(() => urlId.value, value => search(value));
watch(() => current.value, () => search());

const urls = computed(() => useUrlStore().urls);

const search = (value?: number) => seniorSearchRecordService.page(current.value, size.value, value || urlId.value)
  .then(res => {
    records.value = res.records;
    total.value = res.total;
  });


function load(record: SeniorSearchRecord) {
  useSeniorSearchStore().loadEvent({
    link: record.link,
    method: record.method as any,
    body: record.body
  }, false);
}

const clear = () => {
  clearLoading.value = true;
  seniorSearchRecordService.clear()
    .then(() => {
      MessageUtil.success("清空成功");
      search();
    })
    .catch(e => MessageUtil.error("清空失败", e))
    .finally(() => clearLoading.value = false);
}

search();
</script>
<style lang="less">
.display-record {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  padding: 8px;

  .display-record-head {
    display: flex;
    justify-content: space-between;
    padding-bottom: 0.55em;
  }

  .display-record-body {
    margin-top: 7px;

  }
}
</style>
