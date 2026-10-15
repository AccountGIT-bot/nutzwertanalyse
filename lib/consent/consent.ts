/**
 * Einwilligungs- und Speicherverwaltung (Cookie-/Storage-Consent).
 *
 * Rechtlicher Hintergrund:
 * - Schweiz: Art. 45c FMG (Information über Speicherung auf fremden Geräten),
 *   DSG (revidiert, in Kraft seit 1.9.2023).
 * - EU: Art. 5 Abs. 3 ePrivacy-Richtlinie 2002/58/EG, DSGVO (Art. 6, 7, 13).
 *
 * Diese Website setzt keine Cookies. Sie verwendet ausschliesslich den
 * localStorage des Browsers – und zwar nur für Zwecke, die die Nutzerin / der
 * Nutzer selbst auslöst. Es gibt keine Analyse-, Tracking- oder Marketing-Tools
 * und keine Drittanbieter-Skripte.
 *
 * Kategorien:
 * - essential:   Speicherung der Einwilligungsentscheidung selbst (immer aktiv,
 *                technisch notwendig, Art. 5 Abs. 3 Satz 2 ePrivacy-RL).
 * - functional:  Speichern von Analysen/Entwürfen und Einstellungen (Sprache,
 *                Design) im Browser. Ohne diese Kategorie arbeitet die App rein
 *                im Arbeitsspeicher (Daten gehen beim Schliessen verloren).
 * - analytics:   NICHT eingesetzt (nur zur Transparenz aufgeführt).
 * - marketing:   NICHT eingesetzt (nur zur Transparenz aufgeführt).
 */

import { site } from "@/lib/site";

export type ConsentCategory = "essential" | "functional" | "analytics" | "marketing";

export interface ConsentState {
  version: number;
  decidedAt: string;
  functional: boolean;
  /** Immer false – zur Dokumentation der Entscheidung */
  analytics: false;
  marketing: false;
}

export const CONSENT_KEY = "nwa.consent";
export const STORAGE_PREFIX = "nwa.";

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed !== "object" || parsed === null) return null;
    if (parsed.version !== site.consentVersion) return null; // erneut fragen nach Änderung der Rechtstexte
    return {
      version: site.consentVersion,
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
      functional: parsed.functional === true,
      analytics: false,
      marketing: false,
    };
  } catch {
    return null;
  }
}

export function writeConsent(functional: boolean): ConsentState {
  const state: ConsentState = {
    version: site.consentVersion,
    decidedAt: new Date().toISOString(),
    functional,
    analytics: false,
    marketing: false,
  };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
  } catch {
    /* Speicher nicht verfügbar (z. B. privater Modus) */
  }
  if (!functional) purgeFunctionalStorage();
  return state;
}

/** Löscht alle funktionalen Daten (Analysen, Einstellungen) aus dem localStorage. */
export function purgeFunctionalStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX) && k !== CONSENT_KEY) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

/** Löscht wirklich alles inkl. Einwilligung (Recht auf Löschung / Widerruf). */
export function purgeAllStorage(): void {
  purgeFunctionalStorage();
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
}

/** Global Privacy Control / Do Not Track wird respektiert (nur informativ, da ohnehin kein Tracking). */
export function privacySignalActive(): boolean {
  if (typeof navigator === "undefined") return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.globalPrivacyControl === true || navigator.doNotTrack === "1";
}

/** Geschätzte Grösse der gespeicherten Daten in Bytes */
export function storageFootprint(): number {
  if (typeof window === "undefined") return 0;
  try {
    let bytes = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(STORAGE_PREFIX)) continue;
      bytes += (k.length + (window.localStorage.getItem(k)?.length ?? 0)) * 2;
    }
    return bytes;
  } catch {
    return 0;
  }
}
