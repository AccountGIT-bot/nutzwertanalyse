"use client";

import { createContext, useContext, type ReactNode } from "react";
import { type Locale } from "./config";
import { de } from "./translations/de";
import { type Translations } from "./translations";

interface I18nContextValue {
  locale: Locale;
  t: Translations;
}

// This release has one complete interface in Swiss Standard German.
// Keep the existing catalogues for a future, fully translated release.
const value: I18nContextValue = { locale: "de", t: de };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
}

export function useTranslations() {
  return useI18n().t;
}
