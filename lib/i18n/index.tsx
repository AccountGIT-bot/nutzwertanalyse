"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { de, type Translations } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { it } from "./it";
import { defaultLocale, detectBrowserLocale, isLocale, LOCALE_KEY, localeTags, type Locale } from "./config";
import { readConsent } from "@/lib/consent/consent";
import { createClientStore } from "@/lib/clientStore";

export const translations: Record<Locale, Translations> = { de, en, fr, it };

const localeStore = createClientStore<Locale>(() => {
  try {
    const saved = window.localStorage.getItem(LOCALE_KEY);
    if (isLocale(saved)) return saved;
  } catch {
    /* ignore */
  }
  return detectBrowserLocale();
}, defaultLocale);

interface I18nValue {
  locale: Locale;
  tag: string;
  t: Translations;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(localeStore.subscribe, localeStore.get, localeStore.getServer);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    localeStore.set(l);
    if (readConsent()?.functional) {
      try {
        window.localStorage.setItem(LOCALE_KEY, l);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({ locale, tag: localeTags[locale], t: translations[locale], setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export function useT(): Translations {
  return useI18n().t;
}

export type { Translations, Locale };
