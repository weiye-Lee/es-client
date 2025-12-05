import type { Ref } from "vue";

type UseStateReturn<T> = [state: Ref<T>, setState: (newState: T) => void];

export const useState = <T = any>(initialState: T): UseStateReturn<T> => {
  const state = ref<T>(initialState) as Ref<T>;
  return [
    state,
    (newState: T) => {
      state.value = newState;
    }
  ] as const;
};
