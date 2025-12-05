import type { Ref } from "vue";
import { EsRequestError } from "$/shared";

export interface UseQueryApiResult {
  data: Ref<string>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  reload: (...args: any[]) => Promise<void>;
}

export function useQueryApi(queryFn: (...args: any[]) => Promise<string>): UseQueryApiResult {
  const data = ref("");
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const reload = async (...args: any[]) => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await queryFn(...args);
    } catch (e) {
      error.value = e as Error;
      if (e instanceof EsRequestError) {
        data.value = e.body;
      }
      throw e;
    } finally {
      loading.value = false;
    }
  };

  reload().then(() => console.debug("初始化查询"));

  return { data, loading, error, reload };
}
