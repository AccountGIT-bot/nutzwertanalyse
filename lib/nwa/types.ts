/**
 * Domänenmodell der Nutzwertanalyse.
 *
 * Alle Daten leben ausschliesslich im Browser der Nutzerin / des Nutzers
 * (In-Memory bzw. – mit Einwilligung – localStorage). Es gibt kein Backend.
 */

export type Id = string;

/** Bewertungsskala: 1–5 oder 1–10 Punkte */
export type ScaleMax = 5 | 10;

/**
 * Gewichtungsmethoden
 * - points:   Punkte 1–5 je Kriterium (einfach)
 * - percent:  Prozentverteilung (Summe 100 %)
 * - ranking:  Rangfolge der Kriterien → Rank-Order-Centroid-Gewichte
 * - pairwise: Paarvergleich (AHP-Light, Saaty-Skala) mit Konsistenzprüfung
 */
export type WeightingMethod = "points" | "percent" | "ranking" | "pairwise";

export type CategoryId = "economic" | "quality" | "strategic" | "risk" | "social" | "other";

export const CATEGORY_IDS: CategoryId[] = ["economic", "quality", "strategic", "risk", "social", "other"];

export type Step = "decision" | "alternatives" | "criteria" | "weighting" | "evaluation" | "results";

export const STEPS: Step[] = ["decision", "alternatives", "criteria", "weighting", "evaluation", "results"];

export interface Alternative {
  id: Id;
  name: string;
  description?: string;
  /** Aus der Bewertung ausgeschlossen (z. B. nach manuellem Entscheid) */
  excluded?: boolean;
}

/** Messwert-Kriterium: echte Zahl je Alternative, die App rechnet sie in Punkte um */
export type MeasureDirection = "lower" | "higher";

export interface Measure {
  /** Einheit zur Anzeige, z. B. «CHF», «Tage», «%» */
  unit: string;
  /** lower = weniger ist besser (Preis, Lieferzeit), higher = mehr ist besser (Rendite, Reichweite) */
  direction: MeasureDirection;
  /** Optionaler Wert, der 1 Punkt ergibt (zusammen mit best); ohne Grenzen: im Verhältnis zum besten Wert */
  worst?: number;
  /** Optionaler Wert, der die volle Punktzahl ergibt */
  best?: number;
  /** K.-o.-Grenze als Messwert: bei lower ein Höchstwert (Budget), bei higher ein Mindestwert */
  limit?: number;
}

export interface Criterion {
  id: Id;
  name: string;
  description?: string;
  categoryId: CategoryId;
  /** Gewicht bei Methode "points" (1–5) */
  points: number;
  /** Gewicht bei Methode "percent" (0–100) */
  percent: number;
  /** K.-o.-Kriterium: Alternative scheidet aus, wenn Mindestpunktzahl unterschritten wird */
  isKnockout: boolean;
  /** Mindestpunktzahl (auf der Bewertungsskala) für K.-o.-Kriterien */
  minScore?: number;
  /** Gesetzt = Messwert-Kriterium (Werte in Analysis.measures, Punkte werden berechnet) */
  measure?: Measure;
}

export interface Evaluator {
  id: Id;
  name: string;
  /** Relative Stimmgewichtung (Standard 1) */
  weight: number;
}

export interface Rating {
  /** Punktzahl auf der Skala 1..scaleMax; undefined = noch nicht bewertet */
  score?: number;
  note?: string;
}

/** ratings[evaluatorId][alternativeId][criterionId] */
export type RatingMap = Record<Id, Record<Id, Record<Id, Rating>>>;

/**
 * Paarvergleiche: Schlüssel `${idA}|${idB}` → Wert nach Saaty.
 * Wert > 1: A wichtiger als B; Wert < 1: B wichtiger als A.
 */
export type PairwiseMap = Record<string, number>;

export interface AnalysisSettings {
  scale: ScaleMax;
  weighting: WeightingMethod;
}

export interface Analysis {
  schemaVersion: 2;
  id: Id;
  title: string;
  description: string;
  goal: string;
  constraints: string;
  presetId?: string;
  createdAt: string;
  updatedAt: string;
  settings: AnalysisSettings;
  alternatives: Alternative[];
  criteria: Criterion[];
  pairwise: PairwiseMap;
  evaluators: Evaluator[];
  ratings: RatingMap;
  step: Step;
  /** Freitext: Fazit / Entscheidungsnotiz */
  conclusion: string;
  /** Messwerte measures[alternativeId][criterionId]; gelten für alle Bewertenden */
  measures?: Record<Id, Record<Id, number>>;
}

/* ---------- Ergebnisse ---------- */

export interface Contribution {
  criterionId: Id;
  /** Normiertes Gewicht 0..1 */
  weight: number;
  /** Mittlere Punktzahl über alle Bewertenden (Skala) */
  rawScore: number;
  /** weight × rawScore */
  weightedScore: number;
  rated: boolean;
  /** Erfasster Messwert (nur bei Messwert-Kriterien) */
  value?: number;
}

export interface AlternativeResult {
  alternativeId: Id;
  /** Gewichteter Nutzwert in Skalenpunkten (0..scaleMax) */
  total: number;
  /** Nutzwert in Prozent des Maximums (0..100) */
  percent: number;
  rank: number;
  contributions: Contribution[];
  byCategory: Partial<Record<CategoryId, number>>;
  knockedOut: boolean;
  failedCriteria: Id[];
  /** Anteil bewerteter Zellen 0..1 */
  completeness: number;
  excluded: boolean;
}

/** single = nur eine gültige Alternative, tie = Gleichstand an der Spitze */
export type Confidence = "high" | "medium" | "low" | "none" | "single" | "tie";

export interface Recommendation {
  winnerId: Id | null;
  runnerUpId: Id | null;
  confidence: Confidence;
  /** Vorsprung in Prozentpunkten */
  leadPoints: number;
  /** Vorsprung relativ zum Sieger in Prozent */
  leadRelative: number;
  /** Alle Alternativen mit gleichem Höchstwert (bei Gleichstand ≥ 2, sonst nur der Sieger) */
  tiedIds: Id[];
  /** Per K.-o. ausgeschiedene Alternative mit höherem Nutzwert als der Sieger (null, wenn keine) */
  koLeaderId: Id | null;
}

export interface AhpConsistency {
  n: number;
  lambdaMax: number;
  ci: number;
  ri: number;
  cr: number;
  isConsistent: boolean;
}

export interface Results {
  weights: Record<Id, number>;
  alternatives: AlternativeResult[];
  /** Rangliste der gültigen (nicht ausgeschlossenen, nicht ausgeschiedenen) Alternativen */
  ranking: AlternativeResult[];
  recommendation: Recommendation;
  consistency: AhpConsistency | null;
  completeness: number;
  scale: ScaleMax;
}

export interface SensitivityEntry {
  criterionId: Id;
  currentWeight: number;
  /**
   * Gewicht, ab dem die Spitzenposition wechselt (null = kein Wechsel im Bereich 0..1).
   */
  flipWeight: number | null;
  /** Alternative, die bei flipWeight die Führung übernimmt */
  flipToId: Id | null;
  /** Abstand zwischen aktuellem Gewicht und Kipppunkt (0..1), null = robust */
  margin: number | null;
  impact: "high" | "medium" | "low" | "none";
}

export interface RobustnessResult {
  runs: number;
  /** Anteil der Simulationen, in denen die Alternative auf Rang 1 landet */
  winShare: Record<Id, number>;
  /** Mittlerer Rang je Alternative */
  meanRank: Record<Id, number>;
}
