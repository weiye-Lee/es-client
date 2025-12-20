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

let _colorMode: Ref<ColorModeType> | null = null;
let _isDark: ComputedRef<boolean> | null = null;
let _initialized = false;

export const useColorMode = (): ColorModeResult => {
  if (!_colorMode || !_isDark) {
    const storage = useLocalStorage<ColorModeType | number>(LocalNameEnum.KEY_THEME, "auto");
    if (typeof storage.value === "number") {
      const map: Record<number, ColorModeType> = { 1: "light", 2: "dark", 3: "auto" };
      storage.value = map[storage.value] || "auto";
    }
    _colorMode = storage as Ref<ColorModeType>;
    _isDark = computed(() => {
      if (_colorMode!.value === "dark") {
        return true;
      } else if (_colorMode!.value === "light") {
        return false;
      }
      return isDarkColors();
    });

    function renderColorMode() {
      const htmlElement = document.documentElement;
      const mode = _colorMode!.value;

      if (mode === "light") {
        htmlElement.setAttribute("theme-mode", "light");
        htmlElement.classList.remove("dark");
        htmlElement.classList.add("light");
        VxeUI.setTheme("light");
      } else if (mode === "dark") {
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

    if (!_initialized) {
      window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", renderColorMode);
      renderColorMode();
      watch(_colorMode, () => renderColorMode());
      _initialized = true;
    }
  }
  return { colorMode: _colorMode!, isDark: _isDark! };
};
