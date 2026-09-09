import {
  Alternative,
  Criterion,
  Rating,
  NwaResult,
  SensitivityResult,
  AHPComparison,
  AHPConsistencyResult,
  Risk,
  Evaluator,
} from "./types";

// Random Index values for AHP consistency check (n = 1 to 15)
const RANDOM_INDEX = [
  0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57,
  1.59,
];

/**
 * Normalize weights to sum to 1
 */
export function normalizeWeights(criteria: Criterion[]): Criterion[] {
  const safe = criteria.map((c) => ({
    ...c,
    rawWeight: Number.isFinite(c.rawWeight) ? Math.max(0, c.rawWeight) : 0,
  }));
  const total = safe.reduce((sum, c) => sum + c.rawWeight, 0);
  return safe.map((c) => ({
    ...c,
    weight: total > 0 ? c.rawWeight / total : 0,
  }));
}

function averageRating(
  ratings: Rating[],
  alternativeId: string,
  criterionId: string,
  evaluators?: Evaluator[],
): number {
  const relevant = ratings.filter(
    (r) =>
      r.alternativeId === alternativeId &&
      r.criterionId === criterionId &&
      Number.isFinite(r.score) &&
      r.score >= 1 &&
      r.score <= 10,
  );
  let sum = 0,
    weight = 0;
  for (const r of relevant) {
    const person = evaluators?.find((e) => e.id === r.evaluatorId);
    const w = evaluators?.length
      ? person
        ? Math.max(0, person.weight ?? 1)
        : 0
      : 1;
    sum += r.score * w;
    weight += w;
  }
  return weight > 0 ? sum / weight : 0;
}

/**
 * Calculate NWA scores for all alternatives
 * Score = Σ (criterion weight × alternative rating)
 * Optimized with lookup maps for O(1) access instead of O(n) filters
 */
export function calculateNwa(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[],
  evaluators?: Evaluator[],
): NwaResult[] {
  if (!alternatives.length || !criteria.length) return [];
  const normalized = normalizeWeights(criteria);
  if (!normalized.some((c) => c.weight > 0)) return [];
  const failed = new Set(
    checkKnockoutCriteria(alternatives, criteria, ratings, evaluators).map(
      (f) => f.alternativeId,
    ),
  );
  const results = alternatives
    .map((alt) => {
      const criteriaScores = normalized.map((c) => {
        const rawScore = averageRating(ratings, alt.id, c.id, evaluators);
        return {
          criterionId: c.id,
          rawScore,
          weightedScore: rawScore * c.weight,
        };
      });
      const totalScore = criteriaScores.reduce(
        (sum, c) => sum + c.weightedScore,
        0,
      );
      return {
        alternativeId: alt.id,
        totalScore,
        normalizedScore: totalScore * 10,
        rank: 0,
        criteriaScores,
        excluded: failed.has(alt.id),
      };
    })
    .sort(
      (a, b) =>
        Number(a.excluded) - Number(b.excluded) || b.totalScore - a.totalScore,
    );
  results.forEach((r, i) => {
    r.rank = r.excluded
      ? 0
      : i > 0 &&
          !results[i - 1].excluded &&
          Math.abs(r.totalScore - results[i - 1].totalScore) < 1e-9
        ? results[i - 1].rank
        : i + 1;
  });
  return results;
}

/**
 * Calculate risk-adjusted scores
 */
export function calculateRiskAdjustedScores(
  results: NwaResult[],
  risks: Risk[],
): NwaResult[] {
  return results.map((result) => {
    const alternativeRisks = risks.filter(
      (r) => r.alternativeId === result.alternativeId,
    );

    // Calculate average risk score (probability × impact)
    const riskScore =
      alternativeRisks.length > 0
        ? alternativeRisks.reduce(
            (sum, r) => sum + r.probability * r.impact,
            0,
          ) / alternativeRisks.length
        : 0;

    return {
      ...result,
      riskScore,
    };
  });
}

/**
 * Sensitivity Analysis: Determine how sensitive the ranking is to weight changes
 */
export function reweightCriterion(
  criteria: Criterion[],
  criterionId: string,
  newWeight: number,
): Criterion[] {
  const normalized = normalizeWeights(criteria);
  const target = normalized.find((c) => c.id === criterionId);
  if (!target || criteria.length < 2) return normalized;
  const weight = Math.min(1, Math.max(0, newWeight));
  const rest = 1 - target.weight;
  return normalized.map((c) => {
    const next =
      c.id === criterionId
        ? weight
        : rest > 1e-12
          ? (c.weight / rest) * (1 - weight)
          : (1 - weight) / (criteria.length - 1);
    return { ...c, weight: next, rawWeight: next * 100 };
  });
}

export function calculateSensitivity(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[],
  evaluators?: Evaluator[],
): SensitivityResult[] {
  const normalized = normalizeWeights(criteria);
  const base = calculateNwa(
    alternatives,
    normalized,
    ratings,
    evaluators,
  ).filter((r) => !r.excluded);
  if (base.length < 2) return [];
  const winner = base[0];
  return normalized
    .map((c) => {
      let criticalWeight: number | null = null;
      for (const opponent of base.slice(1)) {
        const diff = winner.totalScore - opponent.totalScore;
        const focal =
          winner.criteriaScores.find((x) => x.criterionId === c.id)!.rawScore -
          opponent.criteriaScores.find((x) => x.criterionId === c.id)!.rawScore;
        const rest = 1 - c.weight;
        const other =
          rest > 1e-12
            ? (diff - c.weight * focal) / rest
            : normalized
                .filter((x) => x.id !== c.id)
                .reduce(
                  (sum, x) =>
                    sum +
                    winner.criteriaScores.find((y) => y.criterionId === x.id)!
                      .rawScore -
                    opponent.criteriaScores.find((y) => y.criterionId === x.id)!
                      .rawScore,
                  0,
                ) /
              (normalized.length - 1);
        const denominator = focal - other;
        if (Math.abs(diff) < 1e-9) {
          criticalWeight = c.weight;
          break;
        }
        if (Math.abs(denominator) < 1e-12) continue;
        const crossing = -other / denominator;
        if (
          crossing >= 0 &&
          crossing <= 1 &&
          (criticalWeight === null ||
            Math.abs(crossing - c.weight) < Math.abs(criticalWeight - c.weight))
        )
          criticalWeight = crossing;
      }
      const distance =
        criticalWeight === null ? 1 : Math.abs(criticalWeight - c.weight);
      const sensitivity = criticalWeight === null ? 0 : 1 - distance;
      return {
        criterionId: c.id,
        originalWeight: c.weight,
        criticalWeight,
        sensitivity,
        impactOnRanking: (criticalWeight !== null && distance <= 0.05
          ? "high"
          : criticalWeight !== null && distance <= 0.15
            ? "medium"
            : "low") as "high" | "medium" | "low",
      };
    })
    .sort((a, b) => b.sensitivity - a.sensitivity);
}

/**
 * AHP: Build comparison matrix from pairwise comparisons
 */
export function buildAHPMatrix(
  criteria: Criterion[],
  comparisons: AHPComparison[],
): number[][] {
  const n = criteria.length;
  const matrix: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(1));

  for (const comp of comparisons) {
    const i = criteria.findIndex((c) => c.id === comp.criterionId1);
    const j = criteria.findIndex((c) => c.id === comp.criterionId2);

    if (
      i !== -1 &&
      j !== -1 &&
      i !== j &&
      Number.isFinite(comp.value) &&
      comp.value >= 1 / 9 &&
      comp.value <= 9
    ) {
      matrix[i][j] = comp.value;
      matrix[j][i] = 1 / comp.value;
    }
  }

  return matrix;
}

/**
 * AHP: Calculate weights from comparison matrix using geometric mean method
 */
export function calculateAHPWeights(matrix: number[][]): number[] {
  const n = matrix.length;
  const weights: number[] = [];

  // Calculate geometric mean for each row
  for (let i = 0; i < n; i++) {
    let product = 1;
    for (let j = 0; j < n; j++) {
      product *= matrix[i][j];
    }
    weights.push(Math.pow(product, 1 / n));
  }

  // Normalize
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / sum);
}

/**
 * AHP: Check consistency of comparison matrix
 */
export function checkAHPConsistency(
  matrix: number[][],
  weights: number[],
): AHPConsistencyResult {
  const n = matrix.length;

  if (n < 3) {
    return {
      consistencyIndex: 0,
      randomIndex: 0,
      consistencyRatio: 0,
      isConsistent: true,
      message: "Matrix zu klein für Konsistenzprüfung.",
    };
  }

  // Calculate λmax (principal eigenvalue)
  let lambdaMax = 0;
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j] * weights[j];
    }
    lambdaMax += rowSum / weights[i];
  }
  lambdaMax /= n;

  // Calculate Consistency Index
  const ci = Math.max(0, (lambdaMax - n) / (n - 1));

  // Get Random Index
  const ri = RANDOM_INDEX[n - 1] || 1.59;

  // Calculate Consistency Ratio
  const cr = ci / ri;

  const isConsistent = cr < 0.1;

  let message = "";
  if (cr < 0.05) {
    message =
      "Ausgezeichnete Konsistenz - Die Bewertungen sind sehr schlüssig.";
  } else if (cr < 0.1) {
    message =
      "Akzeptable Konsistenz - Die Bewertungen sind ausreichend schlüssig.";
  } else if (cr < 0.2) {
    message = "Grenzwertige Konsistenz - Überprüfen Sie einige Vergleiche.";
  } else {
    message =
      "Inkonsistent - Die paarweisen Vergleiche widersprechen sich. Bitte überarbeiten.";
  }

  return {
    consistencyIndex: ci,
    randomIndex: ri,
    consistencyRatio: cr,
    isConsistent,
    message,
  };
}

/**
 * Apply AHP weights to criteria
 */
export function applyAHPWeights(
  criteria: Criterion[],
  comparisons: AHPComparison[],
): { criteria: Criterion[]; consistency: AHPConsistencyResult } {
  const matrix = buildAHPMatrix(criteria, comparisons);
  const weights = calculateAHPWeights(matrix);
  const consistency = checkAHPConsistency(matrix, weights);

  const updatedCriteria = criteria.map((c, i) => ({
    ...c,
    rawWeight: weights[i] * 100, // Store as percentage
    weight: weights[i],
  }));

  return { criteria: updatedCriteria, consistency };
}

/**
 * Simple weighting: Convert 1-5 scale to normalized weights
 */
export function applySimpleWeights(criteria: Criterion[]): Criterion[] {
  const totalWeight = criteria.reduce((sum, c) => sum + c.rawWeight, 0);
  if (totalWeight === 0) return criteria;

  return criteria.map((c) => ({
    ...c,
    weight: c.rawWeight / totalWeight,
  }));
}

/**
 * Percentage weighting: Ensure weights sum to 100%
 */
export function applyPercentageWeights(criteria: Criterion[]): Criterion[] {
  return normalizeWeights(criteria);
}

/**
 * Get decision recommendation based on results
 */
export function getRecommendation(
  results: NwaResult[],
  alternatives: Alternative[],
): {
  recommended: Alternative | null;
  confidence: "high" | "medium" | "low";
  reasoning: string;
} {
  const eligible = results.filter((r) => !r.excluded);
  const winner = eligible[0],
    runner = eligible[1];
  if (!winner)
    return {
      recommended: null,
      confidence: "low",
      reasoning:
        "Keine zulässige Alternative. Prüfe die K.O.-Kriterien und Bewertungen.",
    };
  if (runner && Math.abs(winner.totalScore - runner.totalScore) < 1e-9)
    return {
      recommended: null,
      confidence: "low",
      reasoning:
        "Gleichstand an der Spitze. Die Bewertung liefert keinen eindeutigen Favoriten.",
    };
  const recommended =
    alternatives.find((a) => a.id === winner.alternativeId) || null;
  if (!runner)
    return {
      recommended,
      confidence: "low",
      reasoning:
        "Nur eine zulässige Alternative. Ein belastbarer Vergleich ist nicht möglich.",
    };
  const gap = winner.totalScore - runner.totalScore;
  return {
    recommended,
    confidence: gap >= 2 ? "high" : gap >= 1 ? "medium" : "low",
    reasoning: `Vorsprung von ${gap.toLocaleString("de-CH", { maximumFractionDigits: 2 })} Punkten auf einer Skala von 1 bis 10. Der Abstand beschreibt deine Bewertung, keine statistische Sicherheit.`,
  };
}

/**
 * Check knockout criteria
 */
export function checkKnockoutCriteria(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[],
  evaluators?: Evaluator[],
): { alternativeId: string; failedCriteria: string[] }[] {
  return alternatives
    .map((a) => ({
      alternativeId: a.id,
      failedCriteria: criteria
        .filter(
          (c) =>
            c.isKnockout &&
            c.minThreshold !== undefined &&
            ratings.some(
              (r) => r.alternativeId === a.id && r.criterionId === c.id,
            ) &&
            averageRating(ratings, a.id, c.id, evaluators) < c.minThreshold,
        )
        .map((c) => c.id),
    }))
    .filter((f) => f.failedCriteria.length > 0);
}

/**
 * Generate unique ID
 * Uses crypto.randomUUID when available (modern browsers)
 * Falls back to performance.now() + random for older environments
 */
let idCounter = 0;
export function generateId(): string {
  // Prefer crypto.randomUUID for cryptographically unique IDs
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback: use high-resolution time + random + counter for uniqueness
  idCounter += 1;
  const timestamp =
    typeof performance !== "undefined"
      ? Math.floor(performance.now() * 1000)
      : idCounter;
  const random = Math.random().toString(36).substring(2, 11);
  return `nwa-${timestamp}-${random}-${idCounter}`;
}
