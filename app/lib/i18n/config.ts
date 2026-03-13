export const locales = ["de", "en", "fr", "it", "pt", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  es: "Español",
};

export const localeFlags: Record<Locale, string> = {
  de: "🇩🇪",
  en: "🇬🇧",
  fr: "🇫🇷",
  it: "🇮🇹",
  pt: "🇵🇹",
  es: "🇪🇸",
};

// Short codes for display
export const localeCodes: Record<Locale, string> = {
  de: "DE",
  en: "EN",
  fr: "FR",
  it: "IT",
  pt: "PT",
  es: "ES",
};
