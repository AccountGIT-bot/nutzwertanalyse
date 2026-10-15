/**
 * Bibliothek gespeicherter Analysen.
 *
 * Persistenz nur im localStorage des Browsers und nur mit Einwilligung in die
 * Kategorie "funktional". Ohne Einwilligung werden Analysen ausschliesslich im
 * Arbeitsspeicher gehalten (gehen beim Schliessen des Tabs verloren).
 */

import { readConsent, STORAGE_PREFIX } from "@/lib/consent/consent";
import { sanitizeAnalysis } from "./factory";
import type { Analysis, Id } from "./types";

const INDEX_KEY = `${STORAGE_PREFIX}library.index`;
const ITEM_PREFIX = `${STORAGE_PREFIX}analysis.`;
export const MAX_ANALYSES = 100;

export interface LibraryEntry {
  id: Id;
  title: string;
  updatedAt: string;
  createdAt: string;
  presetId?: string;
  alternatives: number;
  criteria: number;
  step: Analysis["step"];
}

type Listener = () => void;

class Library {
  private memory = new Map<Id, Analysis>();
  private listeners = new Set<Listener>();
  private cache: LibraryEntry[] | null = null;
  private hydrated = false;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key && e.key.startsWith(STORAGE_PREFIX)) {
          this.cache = null;
          this.emit();
        }
      });
    }
  }

  private canPersist(): boolean {
    return readConsent()?.functional === true;
  }

  private emit() {
    this.listeners.forEach((l) => l());
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  }

  /** Beim ersten Zugriff gespeicherte Analysen in den Arbeitsspeicher laden */
  private hydrate() {
    if (this.hydrated || typeof window === "undefined") return;
    this.hydrated = true;
    if (!this.canPersist()) return;
    try {
      const raw = window.localStorage.getItem(INDEX_KEY);
      const ids: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(ids)) return;
      for (const id of ids) {
        if (typeof id !== "string") continue;
        const item = window.localStorage.getItem(ITEM_PREFIX + id);
        if (!item) continue;
        const parsed = sanitizeAnalysis(JSON.parse(item));
        if (parsed) this.memory.set(parsed.id, parsed);
      }
    } catch {
      /* defekte Daten ignorieren */
    }
  }

  private persist(a: Analysis) {
    if (!this.canPersist()) return;
    try {
      window.localStorage.setItem(ITEM_PREFIX + a.id, JSON.stringify(a));
      this.persistIndex();
    } catch {
      /* Quota überschritten o. ä. – Daten bleiben im Arbeitsspeicher */
    }
  }

  private persistIndex() {
    if (!this.canPersist()) return;
    try {
      window.localStorage.setItem(INDEX_KEY, JSON.stringify([...this.memory.keys()]));
    } catch {
      /* ignore */
    }
  }

  /** Nach Erteilung der Einwilligung: alles aus dem Arbeitsspeicher sichern */
  flushToStorage() {
    if (!this.canPersist()) return;
    this.hydrate();
    for (const a of this.memory.values()) this.persist(a);
    this.cache = null;
    this.emit();
  }

  list(): LibraryEntry[] {
    this.hydrate();
    if (this.cache) return this.cache;
    this.cache = [...this.memory.values()]
      .map((a) => ({
        id: a.id,
        title: a.title,
        updatedAt: a.updatedAt,
        createdAt: a.createdAt,
        presetId: a.presetId,
        alternatives: a.alternatives.length,
        criteria: a.criteria.length,
        step: a.step,
      }))
      .sort((x, y) => (x.updatedAt < y.updatedAt ? 1 : -1));
    return this.cache;
  }

  get(id: Id): Analysis | null {
    this.hydrate();
    return this.memory.get(id) ?? null;
  }

  save(a: Analysis) {
    this.hydrate();
    if (!this.memory.has(a.id) && this.memory.size >= MAX_ANALYSES) {
      // Älteste entfernen
      const oldest = [...this.memory.values()].sort((x, y) => (x.updatedAt < y.updatedAt ? -1 : 1))[0];
      if (oldest) this.remove(oldest.id);
    }
    this.memory.set(a.id, a);
    this.persist(a);
    this.cache = null;
    this.emit();
  }

  remove(id: Id) {
    this.hydrate();
    this.memory.delete(id);
    try {
      window.localStorage.removeItem(ITEM_PREFIX + id);
    } catch {
      /* ignore */
    }
    this.persistIndex();
    this.cache = null;
    this.emit();
  }

  clear() {
    this.hydrate();
    for (const id of [...this.memory.keys()]) this.remove(id);
  }

  exportAll(): Analysis[] {
    this.hydrate();
    return [...this.memory.values()];
  }
}

export const library = new Library();
