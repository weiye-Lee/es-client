<template>
  <div class="abs-8 overflow-auto" ref="dataBrowserLeft">
    <t-input placeholder="请输入关键字" clearable></t-input>
    <div class="absolute top-40px left-0 right-0 bottom-0 overflow-auto">
      <t-tree :data activable line :scroll="{
        rowHeight: 34,
        bufferSize: 10,
        threshold: 10,
        type: 'virtual',
      }" :height="height" :actived="actives">
        <template #label="{ node }">
          <div class="flex items-center w-full" @click="onClick(node)" @dblclick="onDbClick(node)">
            <div class="mr-8px">
              <folder-icon v-if="node.value.startsWith('folder-')"/>
              <file-icon v-else />
            </div>
            <div>
              <div class="text-12px">{{ node.label }}</div>
            </div>
          </div>
        </template>
      </t-tree>
    </div>
  </div>
</template>
<script lang="ts" setup>
import {TreeOptionData, TreeNodeModel} from "tdesign-vue-next";
import {useIndexStore} from "@/store";
import {useUrlStore} from "@/store";
import {listDataBrowserViews} from "@/service/DataBrowser/DataBrowserView";
import {FileIcon, FolderIcon} from "tdesign-icons-vue-next";
import {useDataBrowseStore} from "@/store/components/DataBrowseStore";

const dataBrowserLeftRef = useTemplateRef<HTMLDivElement>("dataBrowserLeft");

const elementSize = useElementSize(dataBrowserLeftRef);

const actives = useSessionStorage<Array<string>>("/home/data-browser/left/active-value", []);

const height = computed(() => elementSize.height.value - 40);

const index = computed(() => {
  const {list} = useIndexStore();
  return list.map(e => e.name).sort((a, b) => a.localeCompare(b, 'zh'));
});
const alias = computed(() => {
  const {list} = useIndexStore();
  return Array.from(new Set(list.flatMap(e => e.alias))).sort((a, b) => a.localeCompare(b, 'zh'));
});

const view = computedAsync(async () => {
  const {id} = useUrlStore();
  if (!id) return [];
  const items = await listDataBrowserViews(id);
  return items.map(e => e.pattern).sort((a, b) => a.localeCompare(b, 'zh'));
}, []);
const query = computed(() => ([]));
const data = computed<Array<TreeOptionData>>(() => ([
  {
  label: '索引',
  value: 'folder-index',
  children: index.value.map(e => ({
    label: e,
    value: `index-${e}`
  }))
}, {
  label: '别名',
  value: 'folder-alias',
  children: alias.value.map(e => ({
    label: e,
    value: `alias-${e}`
  }))
}, {
  label: '视图',
  value: 'folder-view',
  children: view.value.map(e => ({
    label: e,
    value: `view-${e}`
  }))
}, {
  label: '查询',
  value: 'folder-query',
  children: query.value.map(e => ({}))
}
]));

function onClick(node: TreeNodeModel) {
  actives.value = [`${node.value}`];
}

function onDbClick(node: TreeNodeModel) {
  actives.value[0] = `${node.value}`;
  useDataBrowseStore().openTab(`${node.value}`, node.label || `${Date.now()}`);
}

</script>
<style scoped lang="less">

</style>
