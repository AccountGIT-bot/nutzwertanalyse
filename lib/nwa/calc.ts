import {
  type AhpConsistency,
  type Alternative,
  type AlternativeResult,
  type Analysis,
  type CategoryId,
  type Confidence,
  type Contribution,
  type Criterion,
  type Id,
  type Recommendation,
  type Results,
  type RobustnessResult,
  type SensitivityEntry,
} from "./types";

/* =====================================================================
   Gewichtung
   ===================================================================== */

/** Rank-Order-Centroid-Gewichte für n Kriterien (Rang 1 = wichtigstes) */
export function rocWeights(n: number): number[] {
  if (n <= 0) return [];
  const out: number[] = [];
  for (let i = 1; i <= n; i++) {
    let s = 0;
    for (let k = i; k <= n; k++) s += 1 / k;
    out.push(s / n);
  }
  return out;
}

/** Random-Index-Werte nach Saaty für n = 1..15 */
const RANDOM_INDEX = [0, 0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57, 1.59];

export function pairKey(a: Id, b: Id): string {
  return `${a}|${b}`;
}

/** Liest den Paarvergleichswert A gegenüber B (1 = gleich wichtig), beide Richtungen. */
export function getPairValue(pairwise: Record<string, number>, a: Id, b: Id): number {
  if (a === b) return 1;
  const direct = pairwise[pairKey(a, b)];
  if (typeof direct === "number" && direct > 0) return direct;
  const inverse = pairwise[pairKey(b, a)];
  if (typeof inverse === "number" && inverse > 0) return 1 / inverse;
  return 1;
}

export function buildPairwiseMatrix(criteria: Criterion[], pairwise: Record<string, number>): number[][] {
  return criteria.map((ci) => criteria.map((cj) => getPairValue(pairwise, ci.id, cj.id)));
}

/** Gewichte aus Paarvergleichsmatrix (geometrisches Zeilenmittel) */
export function ahpWeights(matrix: number[][]): number[] {
  const n = matrix.length;
  if (n === 0) return [];
  const gm = matrix.map((row) => Math.pow(row.reduce((p, v) => p * v, 1), 1 / n));
  const sum = gm.reduce((a, b) => a + b, 0);
  return gm.map((g) => (sum > 0 ? g / sum : 1 / n));
}

export function ahpConsistency(matrix: number[][], weights: number[]): AhpConsistency {
  const n = matrix.length;
  if (n < 3) {
    return { n, lambdaMax: n, ci: 0, ri: 0, cr: 0, isConsistent: true };
  }
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) rowSum += matrix[i][j] * weights[j];
    lambdaMax += weights[i] > 0 ? rowSum / weights[i] : 0;
  }
  lambdaMax /= n;
  const ci = (lambdaMax - n) / (n - 1);
  const ri = RANDOM_INDEX[n] ?? 1.59;
  const cr = ri > 0 ? ci / ri : 0;
  return { n, lambdaMax, ci, ri, cr, isConsistent: cr < 0.1 };
}

/**
 * Normierte Gewichte (Summe 1) gemäss gewählter Methode.
 */
export function computeWeights(analysis: Analysis): { weights: Record<Id, number>; consistency: AhpConsistency | null } {
  const { criteria, settings, pairwise } = analysis;
  const weights: Record<Id, number> = {};
  let consistency: AhpConsistency | null = null;
  if (criteria.length === 0) return { weights, consistency };

  switch (settings.weighting) {
    case "points": {
      const total = criteria.reduce((s, c) => s + Math.max(0, c.points), 0);
      criteria.forEach((c) => {
        weights[c.id] = total > 0 ? Math.max(0, c.points) / total : 1 / criteria.length;
      });
      break;
    }
    case "percent": {
      const total = criteria.reduce((s, c) => s + Math.max(0, c.percent), 0);
      criteria.forEach((c) => {
        weights[c.id] = total > 0 ? Math.max(0, c.percent) / total : 1 / criteria.length;
      });
      break;
    }
    case "ranking": {
      const roc = rocWeights(criteria.length);
      criteria.forEach((c, i) => {
        weights[c.id] = roc[i];
      });
      break;
    }
    case "pairwise": {
      const matrix = buildPairwiseMatrix(criteria, pairwise);
      const w = ahpWeights(matrix);
      criteria.forEach((c, i) => {
        weights[c.id] = w[i];
      });
      consistency = ahpConsistency(matrix, w);
      break;
    }
  }
  return { weights, consistency };
}

/* =====================================================================
   Bewertung
   ===================================================================== */

/**
 * Mittlere Punktzahl einer Alternative bei einem Kriterium über alle Bewertenden
 * (stimmgewichtet). Gibt null zurück, wenn niemand bewertet hat.
 */
export function averageScore(analysis: Analysis, altId: Id, critId: Id): number | null {
  const crit = analysis.criteria.find((c) => c.id === critId);
  if (crit?.measure) {
    const v = measuredValue(analysis, altId, critId);
    return v === null ? null : measureScore(analysis, crit, v);
  }
  let sum = 0;
  let wsum = 0;
  for (const ev of analysis.evaluators) {
    const r = analysis.ratings[ev.id]?.[altId]?.[critId];
    if (r && typeof r.score === "number" && Number.isFinite(r.score)) {
      const w = ev.weight > 0 ? ev.weight : 0;
      sum += r.score * w;
      wsum += w;
    }
  }
  if (wsum === 0) return null;
  return sum / wsum;
}

/* ---------------- Messwerte ---------------- */

/** Erfasster Messwert einer Alternative bei einem Kriterium (null = nicht erfasst) */
export function measuredValue(analysis: Analysis, altId: Id, critId: Id): number | null {
  const v = analysis.measures?.[altId]?.[critId];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/**
 * Rechnet einen Messwert in Punkte (1..Skala) um.
 * - Mit Grenzen (worst/best): linear zwischen «1 Punkt bei» und «volle Punktzahl bei».
 * - Ohne Grenzen und nur positive Werte: im Verhältnis zum besten Wert (bester = volle Punktzahl).
 *   So werden kleine Unterschiede nicht aufgebläht (100 000 vs. 101 000 CHF ergibt 10 vs. 9.9).
 * - Sonst (Nullen, negative Werte): linear zwischen schlechtestem und bestem erfassten Wert.
 * Ergebnis auf eine Nachkommastelle gerundet.
 */
export function measureScore(analysis: Analysis, crit: Criterion, value: number): number {
  const scale = analysis.settings.scale;
  const m = crit.measure!;
  const lower = m.direction === "lower";
  const clampScore = (x: number) => Math.round(Math.min(scale, Math.max(1, x)) * 10) / 10;
  if (typeof m.worst === "number" && typeof m.best === "number" && m.worst !== m.best) {
    const t = (value - m.worst) / (m.best - m.worst);
    return clampScore(1 + Math.min(1, Math.max(0, t)) * (scale - 1));
  }
  const values = analysis.alternatives
    .filter((a) => !a.excluded)
    .map((a) => measuredValue(analysis, a.id, crit.id))
    .filter((v): v is number => v !== null);
  if (values.length === 0) return scale;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return scale;
  if (min > 0) return clampScore(lower ? (scale * min) / value : (scale * value) / max);
  const t = lower ? (max - value) / (max - min) : (value - min) / (max - min);
  return clampScore(1 + t * (scale - 1));
}

/** Verletzt der Messwert die K.-o.-Grenze? (lower: über dem Höchstwert, higher: unter dem Mindestwert) */
export function violatesLimit(crit: Criterion, value: number | null): boolean {
  const m = crit.measure;
  if (!m || typeof m.limit !== "number" || value === null) return false;
  return m.direction === "lower" ? value > m.limit : value < m.limit;
}

function scoreAlternative(
  analysis: Analysis,
  alt: Alternative,
  weights: Record<Id, number>,
  scoreOverride?: (altId: Id, critId: Id) => number | null,
): AlternativeResult {
  const { criteria, settings } = analysis;
  const contributions: Contribution[] = [];
  const byCategory: Partial<Record<CategoryId, number>> = {};
  const failed: Id[] = [];
  let total = 0;
  let ratedCount = 0;

  for (const c of criteria) {
    const w = weights[c.id] ?? 0;
    const avg = scoreOverride ? scoreOverride(alt.id, c.id) : averageScore(analysis, alt.id, c.id);
    const rated = avg !== null;
    const raw = avg ?? 0;
    if (rated) ratedCount++;
    const weighted = w * raw;
    total += weighted;
    byCategory[c.categoryId] = (byCategory[c.categoryId] ?? 0) + weighted;
    const value = c.measure ? measuredValue(analysis, alt.id, c.id) : null;
    contributions.push({ criterionId: c.id, weight: w, rawScore: raw, weightedScore: weighted, rated, ...(value !== null ? { value } : {}) });
    if (c.isKnockout) {
      /* Messwert-Kriterien: K.-o. über die Grenze im Messwert (z. B. Budget), sonst über die Mindestpunktzahl */
      const out = c.measure ? violatesLimit(c, value) : rated && typeof c.minScore === "number" && raw < c.minScore;
      if (out) failed.push(c.id);
    }
  }

  return {
    alternativeId: alt.id,
    total,
    percent: settings.scale > 0 ? (total / settings.scale) * 100 : 0,
    rank: 0,
    contributions,
    byCategory,
    knockedOut: failed.length > 0,
    failedCriteria: failed,
    completeness: criteria.length > 0 ? ratedCount / criteria.length : 0,
    excluded: !!alt.excluded,
  };
}

/** Gleichstand: Nutzwerte, die sich nur durch Rundungsrauschen unterscheiden */
const TIE_EPS = 1e-9;

function rankResults(results: AlternativeResult[]): AlternativeResult[] {
  const valid = results.filter((r) => !r.excluded && !r.knockedOut).sort((a, b) => b.total - a.total);
  /* Wettkampf-Rangfolge: gleiche Nutzwerte teilen den Rang (1, 1, 3) */
  valid.forEach((r, i) => {
    r.rank = i > 0 && Math.abs(valid[i - 1].total - r.total) <= TIE_EPS ? valid[i - 1].rank : i + 1;
  });
  results.filter((r) => r.excluded || r.knockedOut).forEach((r) => {
    r.rank = 0;
  });
  return valid;
}

export function recommendation(ranking: AlternativeResult[], all: AlternativeResult[] = ranking): Recommendation {
  if (ranking.length === 0) {
    return { winnerId: null, runnerUpId: null, confidence: "none", leadPoints: 0, leadRelative: 0, tiedIds: [], koLeaderId: null };
  }
  const w = ranking[0];
  /* Beste per K.-o. ausgeschiedene Alternative, die ohne K.-o. vorne läge */
  const koLeader = all.filter((x) => x.knockedOut && !x.excluded && x.total > w.total + TIE_EPS).sort((a, b) => b.total - a.total)[0];
  const koLeaderId = koLeader ? koLeader.alternativeId : null;
  const r = ranking[1];
  if (!r) {
    return { winnerId: w.alternativeId, runnerUpId: null, confidence: "single", leadPoints: 0, leadRelative: 0, tiedIds: [w.alternativeId], koLeaderId };
  }
  const tiedIds = ranking.filter((x) => Math.abs(x.total - w.total) <= TIE_EPS).map((x) => x.alternativeId);
  if (tiedIds.length > 1) {
    return { winnerId: w.alternativeId, runnerUpId: r.alternativeId, confidence: "tie", leadPoints: 0, leadRelative: 0, tiedIds, koLeaderId };
  }
  const leadPoints = w.percent - r.percent;
  const leadRelative = w.percent > 0 ? (leadPoints / w.percent) * 100 : 0;
  let confidence: Confidence = "low";
  if (leadRelative >= 15) confidence = "high";
  else if (leadRelative >= 6) confidence = "medium";
  return { winnerId: w.alternativeId, runnerUpId: r.alternativeId, confidence, leadPoints, leadRelative, tiedIds, koLeaderId };
}

export function computeResults(analysis: Analysis): Results {
  const { weights, consistency } = computeWeights(analysis);
  const results = analysis.alternatives.map((a) => scoreAlternative(analysis, a, weights));
  const ranking = rankResults(results);
  const cells = analysis.alternatives.filter((a) => !a.excluded).length * analysis.criteria.length;
  let rated = 0;
  for (const r of results) {
    if (r.excluded) continue;
    rated += r.contributions.filter((c) => c.rated).length;
  }
  return {
    weights,
    alternatives: results,
    ranking,
    recommendation: recommendation(ranking, results),
    consistency,
    completeness: cells > 0 ? rated / cells : 0,
    scale: analysis.settings.scale,
  };
}

/* =====================================================================
   Sensitivitätsanalyse
   ===================================================================== */

/**
 * Für jedes Kriterium k: Das Gewicht w_k wird von 0 bis 1 variiert, die übrigen
 * Gewichte werden proportional skaliert. Der Nutzwert einer Alternative ist dann
 *   U_i(w) = w · r_ik + (1 − w) · R_i
 * mit R_i = gewichteter Mittelwert der übrigen Kriterien. Der Kipppunkt
 * zwischen Sieger s und Herausforderer j löst U_s(w) = U_j(w).
 */
export function sensitivity(analysis: Analysis, results: Results): SensitivityEntry[] {
  const ranking = results.ranking;
  if (ranking.length < 2 || analysis.criteria.length < 2) return [];
  const winner = ranking[0];
  const entries: SensitivityEntry[] = [];

  for (const c of analysis.criteria) {
    const wk = results.weights[c.id] ?? 0;
    const rest = 1 - wk;

    const restScore = (r: AlternativeResult) => {
      if (rest <= 1e-9) {
        // Alle anderen Gewichte sind 0 → Mittelwert der anderen Rohwerte
        const others = r.contributions.filter((x) => x.criterionId !== c.id);
        return others.length ? others.reduce((s, x) => s + x.rawScore, 0) / others.length : 0;
      }
      return r.contributions.filter((x) => x.criterionId !== c.id).reduce((s, x) => s + x.weightedScore, 0) / rest;
    };

    const rs = winner.contributions.find((x) => x.criterionId === c.id)?.rawScore ?? 0;
    const Rs = restScore(winner);

    let bestFlip: number | null = null;
    let flipTo: Id | null = null;

    for (const ch of ranking.slice(1)) {
      const rj = ch.contributions.find((x) => x.criterionId === c.id)?.rawScore ?? 0;
      const Rj = restScore(ch);
      // U_s(w) - U_j(w) = (Rs - Rj) + w * ((rs - Rs) - (rj - Rj)) = 0
      const a = Rs - Rj;
      const b = rs - Rs - (rj - Rj);
      if (Math.abs(b) < 1e-9) continue;
      const w = -a / b;
      if (w < 0 || w > 1) continue;
      if (Math.abs(w - wk) < 1e-9) continue;
      if (bestFlip === null || Math.abs(w - wk) < Math.abs(bestFlip - wk)) {
        bestFlip = w;
        flipTo = ch.alternativeId;
      }
    }

    const margin = bestFlip === null ? null : Math.abs(bestFlip - wk);
    let impact: SensitivityEntry["impact"] = "none";
    if (margin !== null) {
      if (margin < 0.05) impact = "high";
      else if (margin < 0.15) impact = "medium";
      else impact = "low";
    }
    entries.push({ criterionId: c.id, currentWeight: wk, flipWeight: bestFlip, flipToId: flipTo, margin, impact });
  }

  return entries.sort((a, b) => {
    const ma = a.margin ?? Infinity;
    const mb = b.margin ?? Infinity;
    return ma - mb;
  });
}

/**
 * Ergebnis bei veränderten Gewichten (Was-wäre-wenn). Übergebene Gewichte
 * werden normiert.
 */
export function resultsWithWeights(analysis: Analysis, override: Record<Id, number>): Results {
  const total = analysis.criteria.reduce((s, c) => s + Math.max(0, override[c.id] ?? 0), 0);
  const weights: Record<Id, number> = {};
  analysis.criteria.forEach((c) => {
    weights[c.id] = total > 0 ? Math.max(0, override[c.id] ?? 0) / total : 1 / analysis.criteria.length;
  });
  const results = analysis.alternatives.map((a) => scoreAlternative(analysis, a, weights));
  const ranking = rankResults(results);
  const base = computeResults(analysis);
  return { ...base, weights, alternatives: results, ranking, recommendation: recommendation(ranking, results) };
}

/* =====================================================================
   Robustheit (Monte-Carlo)
   ===================================================================== */

/** Deterministischer Pseudozufallsgenerator (Mulberry32) für reproduzierbare Simulationen */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function robustness(
  analysis: Analysis,
  results: Results,
  options: { runs?: number; weightNoise?: number; scoreNoise?: number; seed?: number } = {},
): RobustnessResult {
  const runs = options.runs ?? 1000;
  const weightNoise = options.weightNoise ?? 0.3;
  const scoreNoise = options.scoreNoise ?? 0.5;
  const rnd = mulberry32(options.seed ?? 42);
  const wins: Record<Id, number> = {};
  const rankSum: Record<Id, number> = {};
  const candidates = analysis.alternatives.filter((a) => !a.excluded);
  for (const a of candidates) {
    wins[a.id] = 0;
    rankSum[a.id] = 0;
  }
  if (candidates.length === 0 || analysis.criteria.length === 0) {
    return { runs: 0, winShare: {}, meanRank: {} };
  }

  const baseScores = new Map<string, number | null>();
  for (const a of candidates) {
    for (const c of analysis.criteria) {
      baseScores.set(`${a.id}|${c.id}`, averageScore(analysis, a.id, c.id));
    }
  }
  const scale = analysis.settings.scale;

  for (let run = 0; run < runs; run++) {
    const w: Record<Id, number> = {};
    let wsum = 0;
    for (const c of analysis.criteria) {
      // Multiplikatives Rauschen, symmetrisch um 1
      const factor = Math.exp((rnd() * 2 - 1) * weightNoise);
      w[c.id] = (results.weights[c.id] ?? 0) * factor;
      wsum += w[c.id];
    }
    for (const c of analysis.criteria) w[c.id] = wsum > 0 ? w[c.id] / wsum : 1 / analysis.criteria.length;

    const jitter = (altId: Id, critId: Id): number | null => {
      const base = baseScores.get(`${altId}|${critId}`);
      if (base === null || base === undefined) return null;
      const v = base + (rnd() * 2 - 1) * scoreNoise;
      return Math.min(scale, Math.max(1, v));
    };

    const simulated = candidates.map((a) => scoreAlternative(analysis, a, w, jitter));
    const ranking = rankResults(simulated);
    ranking.forEach((r, i) => {
      rankSum[r.alternativeId] += i + 1;
      if (i === 0) wins[r.alternativeId] += 1;
    });
    // Ausgeschiedene erhalten letzten Rang
    simulated.filter((r) => r.knockedOut).forEach((r) => {
      rankSum[r.alternativeId] += candidates.length;
    });
  }

  const winShare: Record<Id, number> = {};
  const meanRank: Record<Id, number> = {};
  for (const a of candidates) {
    winShare[a.id] = wins[a.id] / runs;
    meanRank[a.id] = rankSum[a.id] / runs;
  }
  return { runs, winShare, meanRank };
}

/* =====================================================================
   Hilfsfunktionen
   ===================================================================== */

export function isStepComplete(analysis: Analysis, step: Analysis["step"]): boolean {
  switch (step) {
    case "decision":
      return analysis.title.trim().length > 0;
    case "alternatives":
      return analysis.alternatives.filter((a) => a.name.trim()).length >= 2;
    case "criteria":
      return analysis.criteria.filter((c) => c.name.trim()).length >= 2;
    case "weighting": {
      if (analysis.criteria.length === 0) return false;
      if (analysis.settings.weighting === "percent") {
        const sum = analysis.criteria.reduce((s, c) => s + c.percent, 0);
        return Math.abs(sum - 100) < 0.51;
      }
      return true;
    }
    case "evaluation": {
      const alts = analysis.alternatives.filter((a) => !a.excluded);
      if (alts.length === 0 || analysis.criteria.length === 0) return false;
      for (const a of alts) {
        for (const c of analysis.criteria) {
          if (averageScore(analysis, a.id, c.id) === null) return false;
        }
      }
      return true;
    }
    case "results":
      return true;
  }
}

export function progress(analysis: Analysis): number {
  const steps: Analysis["step"][] = ["decision", "alternatives", "criteria", "weighting", "evaluation"];
  const done = steps.filter((s) => isStepComplete(analysis, s)).length;
  return done / steps.length;
}

/** Grund des Ausscheidens je Kriterium; bei Messwerten mit Wert und Grenze («Preis: 72 000 CHF, max. 60 000 CHF») */
export function knockoutReasons(
  analysis: Analysis,
  result: AlternativeResult,
  fmtNumber: (n: number) => string,
  labels: { unnamed: string; limitMax: string; limitMin: string },
): string[] {
  return result.failedCriteria.map((id) => {
    const c = analysis.criteria.find((x) => x.id === id);
    if (!c) return labels.unnamed;
    const name = c.name || labels.unnamed;
    const v = measuredValue(analysis, result.alternativeId, id);
    if (!c.measure || v === null || typeof c.measure.limit !== "number") return name;
    const limit = (c.measure.direction === "lower" ? labels.limitMax : labels.limitMin)
      .replace("{{limit}}", fmtNumber(c.measure.limit))
      .replace("{{unit}}", c.measure.unit)
      .trim();
    return `${name} (${fmtNumber(v)} ${c.measure.unit}, ${limit})`.replace(/\s+\)/, ")");
  });
}
