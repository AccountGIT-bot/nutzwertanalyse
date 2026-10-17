export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "note"; text: string };

export interface LegalDoc {
  title: string;
  updated: string;
  intro?: string;
  blocks: LegalBlock[];
}

export type LegalKey = "imprint" | "privacy" | "terms" | "cookies" | "accessibility";

export interface LegalSet {
  bindingNote: string;
  placeholderWarning: string;
  docs: Record<LegalKey, LegalDoc>;
}
