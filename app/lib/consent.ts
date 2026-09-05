/**
 * Einwilligungsverwaltung für Cookies und vergleichbare Technologien.
 *
 * Rechtlicher Rahmen:
 *  - Art. 45c lit. b FMG: Bearbeitung von Daten auf fremden Geräten ist zulässig,
 *    wenn transparent informiert und auf die Ablehnungsmöglichkeit hingewiesen wird.
 *  - Art. 6 Abs. 6 DSG / Art. 6 Abs. 1 lit. a DSGVO: Einwilligung muss freiwillig,
 *    für bestimmte Bearbeitungen und nach angemessener Information erfolgen und
 *    jederzeit widerrufbar sein.
 *
 * Der Nachweis wird mit Zeitstempel und Version lokal abgelegt; es werden keine
 * Einwilligungsdaten an den Server übermittelt.
 */

import { notifyStorageChange } from "@/app/lib/client-state";

export const CONSENT_STORAGE_KEY = "nwa_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_CHANGE_EVENT = "nwa:consent-change";
export const CONSENT_OPEN_EVENT = "nwa:consent-open";

export type ConsentCategory = "necessary" | "preferences" | "statistics";

export interface ConsentState {
  version: number;
  /** ISO-Zeitstempel der Einwilligung – dient dem Nachweis. */
  timestamp: string;
  categories: Record<ConsentCategory, boolean>;
}

export const CONSENT_CATEGORIES: {
  id: ConsentCategory;
  label: string;
  description: string;
  required: boolean;
}[] = [
  {
    id: "necessary",
    label: "Notwendig",
    description:
      "Erforderlich für den Betrieb der Anwendung: Speicherung Ihrer Einwilligung, Sprachwahl, Paketwahl sowie die lokale Zwischenspeicherung Ihrer laufenden Analyse. Ohne diese Einträge funktioniert die Anwendung nicht.",
    required: true,
  },
  {
    id: "preferences",
    label: "Komfort",
    description:
      "Speichert freiwillige Komforteinstellungen wie das zuletzt genutzte Paket, gespeicherte Analysen in Ihrer lokalen Bibliothek und ausgeblendete Hinweise.",
    required: false,
  },
  {
    id: "statistics",
    label: "Statistik",
    description:
      "Anonymisierte Reichweitenmessung, um Nutzung und Stabilität der Anwendung zu verbessern. Wird ausschliesslich nach Ihrer Einwilligung aktiviert; aktuell ist kein Analysedienst eingebunden.",
    required: false,
  },
];

export const DEFAULT_CONSENT: Record<ConsentCategory, boolean> = {
  necessary: true,
  preferences: false,
  statistics: false,
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Liest die gespeicherte Einwilligung; `null`, wenn noch keine erteilt wurde. */
export function readConsent(): ConsentState | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (!parsed || typeof parsed !== "object") return null;
    if (parsed.version !== CONSENT_VERSION) return null; // Neue Version => erneut fragen
    return {
      version: CONSENT_VERSION,
      timestamp: typeof parsed.timestamp === "string" ? parsed.timestamp : new Date().toISOString(),
      categories: {
        necessary: true,
        preferences: parsed.categories?.preferences === true,
        statistics: parsed.categories?.statistics === true,
      },
    };
  } catch {
    return null;
  }
}

/** Speichert die Einwilligung und informiert die Anwendung über das Ergebnis. */
export function writeConsent(categories: Record<ConsentCategory, boolean>): ConsentState {
  const state: ConsentState = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: { ...categories, necessary: true },
  };

  if (isBrowser()) {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Speicherung kann im privaten Modus fehlschlagen – Einwilligung gilt dann nur für die Sitzung.
    }
    notifyStorageChange();
    window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_CHANGE_EVENT, { detail: state }));
  }

  return state;
}

/** Widerruft die Einwilligung vollständig (Art. 6 Abs. 6 DSG). */
export function revokeConsent(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch {
    // ignorieren
  }
  notifyStorageChange();
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT, { detail: null }));
}

/** Öffnet den Einstellungsdialog – von überall aufrufbar (z. B. Footer, Cookie-Seite). */
export function openConsentSettings(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

/** Prüft, ob eine Kategorie freigegeben ist. */
export function hasConsent(category: ConsentCategory): boolean {
  if (category === "necessary") return true;
  return readConsent()?.categories[category] === true;
}
