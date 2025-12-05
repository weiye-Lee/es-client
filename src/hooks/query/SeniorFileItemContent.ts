import type { Ref } from "vue";
import { parseRestRequests } from "$/util";
import { useUrlStore } from "@/store";
import { useQueryApi } from "@/hooks";
import MessageUtil from "@/utils/model/MessageUtil";

export interface UseSeniorFileItemContent {
  id: string;
  /**
   * 编辑器宽度
   */
  size: Ref<number>;
  /**
   * 脚本内容
   */
  content: Ref<string>;
  /**
   * 是否已经完成初始化
   */
  init: Ref<boolean>;
  /**
   * 加载中
   */
  loading: Ref<boolean>;
  /**
   * 查询结果
   */
  data: Ref<string | undefined>;
  /**
   * 保存操作
   */
  // save: () => Promise<void>;

  /**
   * 执行查询
   */
  run: (index: number) => void;
}

export const useSeniorFileItemContent = (id: string): UseSeniorFileItemContent => {
  const content = ref("");
  const size = ref(50);
  const init = ref(false);

  const { reload, data, loading } = useQueryApi((index: number) => {
    const requests = parseRestRequests(content.value);
    const request = requests[index];
    if (!request) {
      return Promise.reject(new Error("请求块无法识别"));
    }
    const { client } = useUrlStore();
    if (!client) return Promise.reject(new Error("请选择链接"));
    return client.seniorSearch(request);
  });

  return {
    id,
    content,
    init,
    loading,
    size,
    data,
    run: (index: number) => {
      reload(index).then(() => MessageUtil.success("执行成功"));
    }
  };
};
