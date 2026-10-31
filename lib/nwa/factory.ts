import { uid, nowIso, clamp } from "@/lib/utils";
import {
  CATEGORY_IDS,
  STEPS,
  type Alternative,
  type Analysis,
  type CategoryId,
  type Criterion,
  type Evaluator,
  type RatingMap,
  type ScaleMax,
  type WeightingMethod,
} from "./types";

export const DEFAULT_EVALUATOR_ID = "self";

export function createEvaluator(name: string, weight = 1): Evaluator {
  return { id: uid("ev"), name, weight };
}

export function createAlternative(name = "", description = ""): Alternative {
  return { id: uid("alt"), name, description };
}

export function createCriterion(partial: Partial<Criterion> = {}): Criterion {
  return {
    id: uid("crit"),
    name: "",
    description: "",
    categoryId: "other",
    points: 3,
    percent: 0,
    isKnockout: false,
    minScore: undefined,
    ...partial,
  };
}

export function createAnalysis(partial: Partial<Analysis> = {}, selfName = "Ich"): Analysis {
  const ts = nowIso();
  return {
    schemaVersion: 2,
    id: uid("nwa"),
    title: "",
    description: "",
    goal: "",
    constraints: "",
    presetId: undefined,
    createdAt: ts,
    updatedAt: ts,
    settings: { scale: 10, weighting: "points" },
    alternatives: [],
    criteria: [],
    pairwise: {},
    evaluators: [{ id: DEFAULT_EVALUATOR_ID, name: selfName, weight: 1 }],
    ratings: {},
    step: "decision",
    conclusion: "",
    ...partial,
  };
}

/** Verteilt Prozentgewichte gleichmässig (Summe 100). */
export function equalizePercent(criteria: Criterion[]): Criterion[] {
  const n = criteria.length;
  if (n === 0) return criteria;
  const base = Math.floor(100 / n);
  const rest = 100 - base * n;
  return criteria.map((c, i) => ({ ...c, percent: base + (i < rest ? 1 : 0) }));
}

/** Leitet Prozentgewichte aus Punkten ab (für Methodenwechsel). */
export function percentFromPoints(criteria: Criterion[]): Criterion[] {
  const total = criteria.reduce((s, c) => s + Math.max(0, c.points), 0);
  if (total <= 0) return equalizePercent(criteria);
  const raw = criteria.map((c) => (Math.max(0, c.points) / total) * 100);
  const floored = raw.map((v) => Math.floor(v));
  let rest = 100 - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (const o of order) {
    if (rest <= 0) break;
    floored[o.i] += 1;
    rest -= 1;
  }
  return criteria.map((c, i) => ({ ...c, percent: floored[i] }));
}

/* ---------------- Validierung / Import ---------------- */

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
function bool(v: unknown): boolean {
  return v === true;
}

const SCALES: ScaleMax[] = [5, 10];
const METHODS: WeightingMethod[] = ["points", "percent", "ranking", "pairwise"];

/**
 * Prüft und normalisiert eine importierte Analyse (z. B. aus JSON-Datei oder
 * Freigabe-Link). Unbekannte Felder werden verworfen, fehlende ergänzt.
 * Gibt null zurück, wenn die Struktur unbrauchbar ist.
 */
export function sanitizeAnalysis(input: unknown, selfName = "Ich"): Analysis | null {
  if (typeof input !== "object" || input === null) return null;
  const o = input as Record<string, unknown>;
  if (typeof o.title !== "string" && !Array.isArray(o.alternatives)) return null;

  const base = createAnalysis({}, selfName);
  const scaleRaw = (o.settings as Record<string, unknown> | undefined)?.scale;
  const methodRaw = (o.settings as Record<string, unknown> | undefined)?.weighting;
  const scale: ScaleMax = SCALES.includes(scaleRaw as ScaleMax) ? (scaleRaw as ScaleMax) : 10;
  const weighting: WeightingMethod = METHODS.includes(methodRaw as WeightingMethod) ? (methodRaw as WeightingMethod) : "points";

  const alternatives: Alternative[] = (Array.isArray(o.alternatives) ? o.alternatives : [])
    .filter((a): a is Record<string, unknown> => typeof a === "object" && a !== null)
    .slice(0, 50)
    .map((a) => ({
      id: str(a.id) || uid("alt"),
      name: str(a.name).slice(0, 200),
      description: str(a.description).slice(0, 2000),
      excluded: bool(a.excluded),
    }));

  const criteria: Criterion[] = (Array.isArray(o.criteria) ? o.criteria : [])
    .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .slice(0, 60)
    .map((c) => ({
      id: str(c.id) || uid("crit"),
      name: str(c.name).slice(0, 200),
      description: str(c.description).slice(0, 2000),
      categoryId: CATEGORY_IDS.includes(c.categoryId as CategoryId) ? (c.categoryId as CategoryId) : "other",
      points: clamp(num(c.points, 3), 0, 5),
      percent: clamp(num(c.percent, 0), 0, 100),
      isKnockout: bool(c.isKnockout),
      minScore: typeof c.minScore === "number" ? clamp(c.minScore, 1, scale) : undefined,
      measure: sanitizeMeasure(c.measure),
    }));

  const evaluatorsRaw = (Array.isArray(o.evaluators) ? o.evaluators : [])
    .filter((e): e is Record<string, unknown> => typeof e === "object" && e !== null)
    .slice(0, 20)
    .map((e) => ({ id: str(e.id) || uid("ev"), name: str(e.name, "?").slice(0, 100), weight: clamp(num(e.weight, 1), 0, 10) }));
  const evaluators: Evaluator[] = evaluatorsRaw.length ? evaluatorsRaw : base.evaluators;

  const altIds = new Set(alternatives.map((a) => a.id));
  const critIds = new Set(criteria.map((c) => c.id));
  const evIds = new Set(evaluators.map((e) => e.id));

  const ratings: RatingMap = {};
  if (typeof o.ratings === "object" && o.ratings !== null) {
    for (const [evId, byAlt] of Object.entries(o.ratings as Record<string, unknown>)) {
      if (!evIds.has(evId) || typeof byAlt !== "object" || byAlt === null) continue;
      ratings[evId] = {};
      for (const [altId, byCrit] of Object.entries(byAlt as Record<string, unknown>)) {
        if (!altIds.has(altId) || typeof byCrit !== "object" || byCrit === null) continue;
        ratings[evId][altId] = {};
        for (const [critId, r] of Object.entries(byCrit as Record<string, unknown>)) {
          if (!critIds.has(critId) || typeof r !== "object" || r === null) continue;
          const rr = r as Record<string, unknown>;
          const score = typeof rr.score === "number" && Number.isFinite(rr.score) ? clamp(rr.score, 1, scale) : undefined;
          ratings[evId][altId][critId] = { score, note: str(rr.note).slice(0, 1000) };
        }
      }
    }
  }

  const pairwise: Record<string, number> = {};
  if (typeof o.pairwise === "object" && o.pairwise !== null) {
    for (const [k, v] of Object.entries(o.pairwise as Record<string, unknown>)) {
      const [a, b] = k.split("|");
      if (critIds.has(a) && critIds.has(b) && typeof v === "number" && v > 0 && v <= 9 && v >= 1 / 9) pairwise[k] = v;
    }
  }

  const measures: NonNullable<Analysis["measures"]> = {};
  if (typeof o.measures === "object" && o.measures !== null) {
    for (const [altId, byCrit] of Object.entries(o.measures as Record<string, unknown>)) {
      if (!altIds.has(altId) || typeof byCrit !== "object" || byCrit === null) continue;
      for (const [critId, v] of Object.entries(byCrit as Record<string, unknown>)) {
        if (!critIds.has(critId) || typeof v !== "number" || !Number.isFinite(v)) continue;
        (measures[altId] ??= {})[critId] = v;
      }
    }
  }

  const stepRaw = o.step;
  return {
    ...base,
    id: str(o.id) || base.id,
    title: str(o.title).slice(0, 300),
    description: str(o.description).slice(0, 5000),
    goal: str(o.goal).slice(0, 2000),
    constraints: str(o.constraints).slice(0, 2000),
    presetId: str(o.presetId) || undefined,
    createdAt: str(o.createdAt) || base.createdAt,
    updatedAt: str(o.updatedAt) || base.updatedAt,
    settings: { scale, weighting },
    alternatives,
    criteria,
    pairwise,
    evaluators,
    ratings,
    step: STEPS.includes(stepRaw as Analysis["step"]) ? (stepRaw as Analysis["step"]) : "decision",
    conclusion: str(o.conclusion).slice(0, 5000),
    measures,
  };
}

function sanitizeMeasure(v: unknown): Criterion["measure"] {
  if (typeof v !== "object" || v === null) return undefined;
  const m = v as Record<string, unknown>;
  const finite = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : undefined);
  return {
    unit: str(m.unit).slice(0, 20),
    direction: m.direction === "higher" ? "higher" : "lower",
    worst: finite(m.worst),
    best: finite(m.best),
    limit: finite(m.limit),
  };
}

/** Tiefe Kopie mit neuer ID (Duplizieren) */
export function duplicateAnalysis(a: Analysis, titleSuffix = " (Kopie)"): Analysis {
  const copy = JSON.parse(JSON.stringify(a)) as Analysis;
  copy.id = uid("nwa");
  copy.title = `${a.title}${titleSuffix}`;
  copy.createdAt = nowIso();
  copy.updatedAt = copy.createdAt;
  return copy;
}
