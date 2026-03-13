import { de, type Translations } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { it } from "./it";
import { pt } from "./pt";
import { es } from "./es";
import type { Locale } from "../config";

export const translations: Record<Locale, Translations> = {
  de,
  en,
  fr,
  it,
  pt,
  es,
};

export type { Translations };
