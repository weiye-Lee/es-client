<template>
  <div class="display-history">
    <header class="header">
      <t-input clearable v-model="keyword" placeholder="请输入记录名"/>
    </header>
    <t-list>
      <t-list-item v-for="item in results" :key="item.item.id">
        <t-link @click="load(item.item.id)">{{ item.item.name }}</t-link>
        <template #action>
          <div class="flex gap-4px">
            <t-tooltip content="载入">
              <t-button theme="success" shape="square" variant="text" @click="load(item.item.id)" style="border: none;">
                <template #icon>
                  <file-import-icon/>
                </template>
              </t-button>
            </t-tooltip>
            <t-tooltip content="重命名">
              <t-button shape="square" theme="primary" variant="text" @click="rename(item.item.id, item.item.name)">
                <template #icon>
                  <edit-icon/>
                </template>
              </t-button>
            </t-tooltip>
            <t-popconfirm content="是否删除此条记录？" confirm-btn="删除"
                          @confirm="remove(item.item.id)">
              <t-button shape="square" theme="danger" variant="text">
                <template #icon>
                  <delete-icon/>
                </template>
              </t-button>
            </t-popconfirm>
          </div>
        </template>
      </t-list-item>
    </t-list>
  </div>
</template>
<script lang="ts" setup>
import {useSeniorSearchHistoryStore} from "@/store/history/SeniorSearchHistoryStore";
import {useFuse} from "@vueuse/integrations/useFuse";
import {useSeniorSearchStore} from "@/store/components/SeniorSearchStore";
import MessageBoxUtil from "@/utils/model/MessageBoxUtil";
import MessageUtil from "@/utils/model/MessageUtil";
import {DeleteIcon, EditIcon, FileImportIcon} from "tdesign-icons-vue-next";


const keyword = ref('');
const items = computed(() => useSeniorSearchHistoryStore().seniorSearchHistories);
const {results} = useFuse(keyword, items, {
  matchAllWhenSearchEmpty: true,
  fuseOptions: {
    keys: [{
      name: 'name'
    }]
  }
});

const load = (id: number) => useSeniorSearchStore().loadHistory(id);
const rename = (id: number, name: string) => {
  MessageBoxUtil.prompt("请输入新的名称", "重命名", {
    confirmButtonText: "更新",
    inputValue: name
  }).then(text => {
    useSeniorSearchHistoryStore().rename(id, text)
      .then(() => MessageUtil.success("重命名成功"))
      .catch(e => MessageUtil.error("重命名失败", e));
  })
}
const remove = (id: number) => useSeniorSearchHistoryStore().remove(id)
  .then(() => MessageUtil.success("删除成功"))
  .catch(e => MessageUtil.error("删除失败", e));

</script>
<style scoped>
.display-history {
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  padding: 8px;
  overflow: auto;
}
</style>
