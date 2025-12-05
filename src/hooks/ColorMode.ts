import LocalNameEnum from "@/enumeration/LocalNameEnum";
import { VxeUI } from "vxe-table";
import type { Ref, ComputedRef } from "vue";

export type ColorModeType = "auto" | "light" | "dark";

interface ColorModeResult {
  colorMode: Ref<ColorModeType>;
  isDark: ComputedRef<boolean>;
}

function isDarkColors(): boolean {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const useColorMode = (): ColorModeResult => {
  const colorMode = useLocalStorage<ColorModeType>(LocalNameEnum.KEY_THEME, "auto");
  const isDark = computed(() => {
    if (colorMode.value === "dark") {
      return true;
    } else if (colorMode.value === "light") {
      return false;
    }
    return isDarkColors();
  });

  function renderColorMode() {
    const htmlElement = document.documentElement;

    if (colorMode.value === "light") {
      htmlElement.setAttribute("theme-mode", "light");
      htmlElement.classList.remove("dark");
      htmlElement.classList.add("light");
      VxeUI.setTheme("light");
    } else if (colorMode.value === "dark") {
      htmlElement.setAttribute("theme-mode", "dark");
      htmlElement.classList.remove("light");
      htmlElement.classList.add("dark");
      VxeUI.setTheme("dark");
    } else {
      const val = isDarkColors() ? "dark" : "light";
      htmlElement.setAttribute("theme-mode", val);
      htmlElement.classList.remove(val === "dark" ? "light" : "dark");
      htmlElement.classList.add(val);
      VxeUI.setTheme(val);
    }
  }

  window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", renderColorMode);

  renderColorMode();

  watch(colorMode, () => renderColorMode());

  return { colorMode, isDark };
};
