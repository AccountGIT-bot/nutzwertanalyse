/**
 * Lokale Bibliothek gespeicherter Analysen.
 *
 * Sämtliche Daten liegen ausschliesslich im `localStorage` des Browsers.
 * Es findet keine Übertragung an einen Server statt – die Nutzerinnen und
 * Nutzer behalten die volle Kontrolle über ihre Inhalte (Datenschutz durch
 * Technik, Art. 7 DSG).
 */

import { notifyStorageChange } from "@/app/lib/client-state";
import type { AnalysisState, PackageLevel } from "./types";

export const LIBRARY_STORAGE_KEY = "nwa_library";
export const LIBRARY_CHANGE_EVENT = "nwa:library-change";

/** Obergrenze, damit das localStorage-Kontingent nicht gesprengt wird. */
const MAX_ENTRIES = 50;

export interface SavedAnalysisMeta {
  id: string;
  title: string;
  packageLevel: PackageLevel;
  savedAt: string;
  alternativeCount: number;
  criterionCount: number;
  /** Bestplatzierte Alternative, sofern bereits berechnet. */
  topAlternative: string | null;
  /** Nutzwert der bestplatzierten Alternative (Skala 1–10). */
  topScore: number | null;
}

export interface SavedAnalysis extends SavedAnalysisMeta {
  state: AnalysisState;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitChange(): void {
  if (!isBrowser()) return;
  notifyStorageChange();
  window.dispatchEvent(new CustomEvent(LIBRARY_CHANGE_EVENT));
}

function readRaw(): SavedAnalysis[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is SavedAnalysis =>
        !!entry && typeof entry.id === "string" && !!entry.state && !!entry.state.decision
    );
  } catch {
    return [];
  }
}

function writeRaw(entries: SavedAnalysis[]): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(entries));
    emitChange();
    return true;
  } catch {
    // Kontingent erschöpft oder privater Modus.
    return false;
  }
}

function buildMeta(id: string, state: AnalysisState): SavedAnalysisMeta {
  const ranked = [...state.results].sort((a, b) => a.rank - b.rank);
  const best = ranked[0];
  const bestAlternative = best
    ? state.alternatives.find((alternative) => alternative.id === best.alternativeId)
    : undefined;

  return {
    id,
    title: state.decision.title?.trim() || "Ohne Titel",
    packageLevel: state.decision.packageLevel,
    savedAt: new Date().toISOString(),
    alternativeCount: state.alternatives.length,
    criterionCount: state.criteria.length,
    topAlternative: bestAlternative?.name ?? null,
    topScore: best ? best.totalScore : null,
  };
}

/** Metadaten aller gespeicherten Analysen, neueste zuerst. */
export function listAnalyses(): SavedAnalysisMeta[] {
  return readRaw()
    .map(({ state, ...meta }) => {
      void state;
      return meta;
    })
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

/** Lädt eine gespeicherte Analyse. */
export function loadAnalysis(id: string): AnalysisState | null {
  const entry = readRaw().find((item) => item.id === id);
  if (!entry) return null;
  return {
    ...entry.state,
    decision: {
      ...entry.state.decision,
      createdAt: new Date(entry.state.decision.createdAt),
      updatedAt: new Date(entry.state.decision.updatedAt),
    },
  };
}

/**
 * Speichert eine Analyse. Wird `id` übergeben, wird der bestehende Eintrag
 * überschrieben, sonst ein neuer angelegt.
 */
export function saveAnalysis(state: AnalysisState, id?: string): SavedAnalysisMeta | null {
  const entries = readRaw();
  const entryId = id ?? `nwa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const meta = buildMeta(entryId, state);
  const next: SavedAnalysis = { ...meta, state };

  const existingIndex = entries.findIndex((entry) => entry.id === entryId);
  if (existingIndex >= 0) {
    entries[existingIndex] = next;
  } else {
    entries.unshift(next);
  }

  const trimmed = entries
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
    .slice(0, MAX_ENTRIES);

  return writeRaw(trimmed) ? meta : null;
}

/** Benennt eine gespeicherte Analyse um. */
export function renameAnalysis(id: string, title: string): boolean {
  const entries = readRaw();
  const entry = entries.find((item) => item.id === id);
  if (!entry) return false;
  const trimmed = title.trim() || "Ohne Titel";
  entry.title = trimmed;
  entry.state = { ...entry.state, decision: { ...entry.state.decision, title: trimmed } };
  return writeRaw(entries);
}

/** Löscht eine gespeicherte Analyse unwiderruflich. */
export function deleteAnalysis(id: string): boolean {
  const entries = readRaw().filter((entry) => entry.id !== id);
  return writeRaw(entries);
}

/** Löscht die gesamte Bibliothek (Löschungsrecht nach Art. 32 Abs. 2 DSG). */
export function clearLibrary(): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.removeItem(LIBRARY_STORAGE_KEY);
    emitChange();
    return true;
  } catch {
    return false;
  }
}

/** Gesamter Bibliotheksinhalt als JSON – für die Datenherausgabe (Art. 28 DSG). */
export function exportLibrary(): string {
  return JSON.stringify(
    {
      format: "nutzwertanalyse.com/library",
      formatVersion: 1,
      exportedAt: new Date().toISOString(),
      analyses: readRaw(),
    },
    null,
    2
  );
}
