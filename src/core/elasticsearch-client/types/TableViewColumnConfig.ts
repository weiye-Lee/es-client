export interface TableViewSortable {
  sortDirections: ("ascend" | "descend")[];
}

/**
 * 表格视图列配置
 */
export interface TableViewColumnConfig {
  field: string;
  title: string;
  width: number;
  fixed?: "left" | "right";
  ellipsis: boolean;
  tooltip?: boolean | Record<string, any>;
  sortable?: TableViewSortable;
  cellClass: string;
  show: boolean;
}
