/**
 * Zentrale Site-Konfiguration.
 *
 * WICHTIG: Die Felder unter `operator` müssen vor dem Produktivbetrieb mit den
 * echten Angaben des Betreibers befüllt werden (Impressumspflicht / Angaben
 * zur verantwortlichen Stelle nach DSG und DSGVO). Werte in eckigen Klammern
 * werden auf den Rechtsseiten automatisch als "noch auszufüllen" markiert.
 */
import pkg from "../package.json";

/** Anwendungsversion, einzige Quelle ist `package.json` (CHANGELOG führt dieselbe Nummer). */
export const appVersion: string = pkg.version;

export const site = {
  name: "Nutzwertanalyse",
  domain: "nutzwertanalyse.com",
  url: "https://nutzwertanalyse.com",
  /** Version der Rechtstexte / des Einwilligungsdialogs */
  legalVersion: "2026-10-17",
  consentVersion: 2,
  operator: {
    name: "[Firmenname / Name des Betreibers]",
    legalForm: "[z. B. Einzelunternehmen / GmbH / AG]",
    street: "[Strasse und Hausnummer]",
    zipCity: "[PLZ Ort]",
    country: "Schweiz",
    email: "[kontakt@nutzwertanalyse.com]",
    phone: "[+41 ...]",
    /** Unternehmens-Identifikationsnummer, falls vorhanden */
    uid: "[CHE-...]",
    /** Vertretungsberechtigte Person(en) */
    representative: "[Vorname Name, Funktion]",
    /** EU-Vertreter nach Art. 27 DSGVO, falls erforderlich (sonst leer lassen) */
    euRepresentative: "",
    /** Datenschutzberater:in / DPO, falls bestellt (sonst leer lassen) */
    dpo: "",
    /** Gerichtsstand */
    venue: "[Ort, Kanton]",
  },
  hosting: {
    provider: "Vercel Inc.",
    address: "440 N Barranca Ave #4133, Covina, CA 91723, USA",
    privacyUrl: "https://vercel.com/legal/privacy-policy",
    /** Speicherdauer der Server-Logs beim Hoster (Angabe gemäss Anbieter prüfen) */
    logRetention: "max. 30 Tage",
  },
  /** Quellcode-Repository (optional, für Transparenz) */
  repoUrl: "",
} as const;

export type SiteConfig = typeof site;

/** true, wenn ein Konfigurationswert noch ein Platzhalter ist */
export function isPlaceholder(value: string): boolean {
  return /^\[.*\]$/.test(value.trim());
}

export function operatorHasPlaceholders(): boolean {
  const o = site.operator;
  return [o.name, o.street, o.zipCity, o.email].some(isPlaceholder);
}
