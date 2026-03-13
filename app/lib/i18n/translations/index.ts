import { de } from "./de";
import { en } from "./en";
import { fr } from "./fr";
import { it } from "./it";
import { pt } from "./pt";
import { es } from "./es";
import type { Locale } from "../config";

// Use a recursive type to convert all literal string types to string
type DeepStringify<T> = T extends string
  ? string
  : T extends object
  ? { [K in keyof T]: DeepStringify<T[K]> }
  : T;

export type Translations = DeepStringify<typeof de>;

export const translations: Record<Locale, Translations> = {
  de,
  en,
  fr,
  it,
  pt,
  es,
};
