import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { I18nManager, Platform } from "react-native";
import { reloadAppAsync } from "expo";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { format, strings, type Strings } from "./strings";

export type Language = "ar" | "en";

export function deviceLanguage(): Language {
  const code = getLocales()[0]?.languageCode;
  return code === "en" ? "en" : "ar";
}

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: deviceLanguage(),
      setLanguage: (language) => set({ language }),
    }),
    { name: "malaab:language", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function useI18n() {
  const language = useLanguageStore((s) => s.language);
  const s: Strings = strings[language];
  return { language, s, t: format, isRTL: language === "ar" };
}

/**
 * Switches language. On web the root `dir` updates instantly; on iOS/Android
 * React Native needs a reload to flip the layout direction.
 */
export async function changeLanguage(language: Language) {
  useLanguageStore.getState().setLanguage(language);
  const rtl = language === "ar";
  if (Platform.OS !== "web" && I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
    // Give the persisted language a moment to reach storage before reloading.
    await new Promise((resolve) => setTimeout(resolve, 150));
    await reloadAppAsync("Layout direction changed");
  }
}
