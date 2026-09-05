"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { useStoredValue } from "@/app/lib/client-state";
import { type Locale, defaultLocale, locales } from "./config";
import { translations, type Translations } from "./translations";

const LOCALE_STORAGE_KEY = "nwa_locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  // Gespeicherte Sprache hydrationssicher lesen: serverseitig `null`,
  // nach der Hydration der echte Wert.
  const storedLocale = useStoredValue(LOCALE_STORAGE_KEY);
  const [overrideLocale, setOverrideLocale] = useState<Locale | null>(null);

  const locale = useMemo<Locale>(() => {
    if (overrideLocale) return overrideLocale;
    if (storedLocale && locales.includes(storedLocale as Locale)) {
      return storedLocale as Locale;
    }
    return defaultLocale;
  }, [overrideLocale, storedLocale]);

  // Sprache am <html>-Element spiegeln (externes System).
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setOverrideLocale(newLocale);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    } catch {
      // localStorage not available
    }
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, t: translations[locale] }),
    [locale, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

// Hook for just translations (convenience)
export function useTranslations() {
  const { t } = useI18n();
  return t;
}
