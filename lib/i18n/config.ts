export const locales = ["de", "en", "fr", "it"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "de";

export const localeNames: Record<Locale, string> = {
  de: "Deutsch",
  en: "English",
  fr: "Français",
  it: "Italiano",
};

/** BCP-47-Tags für Intl-Formatierung (Schweizer Zahlenformat) */
export const localeTags: Record<Locale, string> = {
  de: "de-CH",
  en: "en-GB",
  fr: "fr-CH",
  it: "it-CH",
};

export const LOCALE_KEY = "nwa.locale";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (locales as readonly string[]).includes(v);
}

export function detectBrowserLocale(): Locale {
  if (typeof navigator === "undefined") return defaultLocale;
  const candidates = [...(navigator.languages ?? []), navigator.language].filter(Boolean);
  for (const c of candidates) {
    const short = c.slice(0, 2).toLowerCase();
    if (isLocale(short)) return short;
  }
  return defaultLocale;
}
