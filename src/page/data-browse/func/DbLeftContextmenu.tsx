import {TreeNodeModel} from "tdesign-vue-next";
import {CopyIcon} from "tdesign-icons-vue-next";
import Cxt, {type MenuItem} from "@imengyu/vue3-context-menu";
import {useGlobalStore} from "@/store/GlobalStore";
import {copyText} from "@/utils/BrowserUtil";

export function openContextmenu(node: TreeNodeModel, e: PointerEvent) {
  e.preventDefault();
  e.stopPropagation();
  const {isDark} = useGlobalStore();
  const items: MenuItem[] = [];
  Cxt.showContextMenu({
    x: e.x,
    y: e.y,
    theme: isDark ? 'mac dark' : 'mac',
    items: [{
      label: '复制',
      icon: () => <CopyIcon/>,
      onClick: () => {
        node.label && copyText(node.label)
      }
    }]
  })
}