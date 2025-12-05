export interface ShardInfo {
  index: string;
  shard: string;
  prirep: string;
  state: string;
  docs?: string;
  store?: string;
  ip?: string;
  node?: string;
}
