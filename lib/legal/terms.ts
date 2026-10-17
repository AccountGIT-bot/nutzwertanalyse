import type { LegalBlock } from "./types";

/**
 * Struktur der Nutzungsbedingungen.
 *
 * Jede Klausel hat eine Kurzfassung («Kurz gesagt»), Markierungen (Tags) und optional
 * ihre Rechtsgrundlagen. Klauseln mit dem Tag "limit" schränken Rechte der Nutzenden ein
 * und werden auf der Seite hervorgehoben (Ungewöhnlichkeitsregel, BGE 135 III 1).
 *
 * Regeln für Änderungen (siehe AGENTS.md):
 * - Kurzfassungen dürfen nie mehr versprechen oder weniger einschränken als der Klauseltext,
 *   ohne dass dies gewollt ist (bei Abweichung gilt das für Nutzende Günstigere, Ziff. 14.2).
 * - Jede neue Fassung erhält eine Nummer, ein Datum und einen Eintrag in `history`;
 *   die abgelöste Fassung wandert im Wortlaut nach `archive`.
 * - Änderungen zum Nachteil der Nutzenden mindestens 30 Tage vorher ankündigen (Ziff. 12.2).
 */

export type TermsTag = "limit" | "right" | "duty" | "promise" | "info";

export interface TermsItem {
  /** Unterziffer, z. B. "10.2" */
  n: string;
  /** Text mit einfachen Markdown-Links [Text](url) */
  text: string;
  list?: string[];
}

export interface TermsClause {
  n: number;
  title: string;
  tags: TermsTag[];
  /** Kurzfassung in einfacher Sprache */
  short: string;
  items: TermsItem[];
  /** Rechtsgrundlagen, kommasepariert lesbar */
  basis?: string;
}

export interface TermsSummaryItem {
  tag: TermsTag;
  text: string;
  /** Verweise auf Klauselnummern */
  refs: number[];
}

export interface TermsHistoryEntry {
  version: number;
  date: string;
  note: string;
  changes: string[];
}

export interface TermsArchiveEntry {
  version: number;
  date: string;
  intro: string;
  blocks: LegalBlock[];
}

export interface TermsDoc {
  title: string;
  lead: string;
  version: number;
  /** Datum der Fassung (ISO) */
  date: string;
  summary: TermsSummaryItem[];
  clauses: TermsClause[];
  history: TermsHistoryEntry[];
  archive: TermsArchiveEntry[];
}

export const clauseId = (n: number) => `ziffer-${n}`;
