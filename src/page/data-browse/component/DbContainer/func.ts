import { VxeTableEvents, VxeTableInstance } from "vxe-table";
import type { Ref } from "vue";
import MessageUtil from "@/utils/model/MessageUtil";
import { execUpdate } from "@/page/data-browse/component/DbHeader/DbContextmenu";
import { UseDataBrowserInstance } from "@/hooks";
import {
  addCondition,
  addOrder,
  removeCondition,
  removeOrder
} from "@/utils/convert/data-browser-condition";
import { useUmami } from "@/plugins/umami";
import { formatJsonString } from '$/util'

export function buildContextMenuClickEvent(
  instance: Ref<VxeTableInstance | null>,
  tab: UseDataBrowserInstance
): VxeTableEvents.MenuClick {
  return ({ menu, row, column }) => {
    const $table = instance.value;
    const field = column.field;
    useUmami.track("func_data_browser", "使用右键菜单");
    const { index, must, should, mustNot, order, update, remove, run } = tab;
    switch (menu.code) {
      case "copy":
        // 示例
        if (row && column) {
          window.preload.copyText(row[column.field]);
          MessageUtil.info("已复制到剪贴板！");
        }
        break;
      case "copy-row":
        if (row) {
          window.preload.copyText(row._source);
          MessageUtil.info("已复制到剪贴板！");
        }
        break;
      case "operation-edit":
        execUpdate(index, row["_id"], formatJsonString(row["_source"])).then(({ id, data }) =>
          update(id, data, row["_source"])
        );
        break;
      case "operation-delete":
        remove(row["_id"], row["_source"]);
        break;
      case "expand":
        if ($table) {
          $table.toggleRowExpand(row).then(() => console.log("切换行展收状态成功"));
        }
        break;
      case "must-clear": {
        must.value = removeCondition(must.value, field);
        run();
        break;
      }
      case "should-clear": {
        should.value = removeCondition(should.value, field);
        run();
        break;
      }
      case "must_not-clear": {
        mustNot.value = removeCondition(mustNot.value, field);
        run();
        break;
      }
      case "sort-clear": {
        order.value = removeOrder(order.value, field);
        run();
        break;
      }
      case "must-term": {
        must.value = addCondition(must.value, field, "term", row[field]);
        run();
        break;
      }
      case "must-match": {
        must.value = addCondition(must.value, field, "match", row[field]);
        run();
        break;
      }
      case "should-term": {
        should.value = addCondition(should.value, field, "term", row[field]);
        run();
        break;
      }
      case "should-match": {
        should.value = addCondition(should.value, field, "match", row[field]);
        run();
        break;
      }
      case "must_not-term": {
        mustNot.value = addCondition(mustNot.value, field, "term", row[field]);
        run();
        break;
      }
      case "must_not-match": {
        mustNot.value = addCondition(mustNot.value, field, "match", row[field]);
        run();
        break;
      }
      case "sort-asc": {
        order.value = addOrder(order.value, field, "asc");
        run();
        break;
      }
      case "sort-desc": {
        order.value = addOrder(order.value, field, "desc");
        run();
        break;
      }
      default:
        MessageUtil.info(`点击了 ${menu.name} 选项`);
    }
  };
}
