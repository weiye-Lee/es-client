export interface TableColumnSortable {
  sortDirections: ("ascend" | "descend")[];
}

export interface TableColumn {
  field: string;
  title: string;
  width?: number;
  fixed?: "left" | "right";
  ellipsis?: boolean;
  tooltip?: boolean | Record<string, any>;
  sortable?: TableColumnSortable;
  cellClass?: string;
  show?: boolean;
}
