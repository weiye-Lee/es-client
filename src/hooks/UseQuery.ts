import type { Ref } from "vue";

export interface UseQueryResult<T> {
  data: Ref<T>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  reload: (...args: any[]) => void;
}

export function useQuery<T>(
  defaultValue: T,
  queryFn: (...args: any[]) => Promise<T>
): UseQueryResult<T> {
  const data = ref<T>(defaultValue) as Ref<T>;
  const loading = ref(true);
  const error = ref<Error | null>(null);

  const reload = async (...args: any[]) => {
    loading.value = true;
    error.value = null;
    try {
      data.value = await queryFn(...args);
    } catch (e) {
      error.value = e as Error;
    }
    loading.value = false;
  };

  reload().then(() => console.debug("初始化查询"));

  return { data, loading, error, reload };
}
