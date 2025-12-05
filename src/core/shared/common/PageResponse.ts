export interface PageResponse<T> {
  total: number;
  records: Array<T>;
  pageNum: number;
  pageSize: number;
}
