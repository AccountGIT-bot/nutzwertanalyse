import {
  Alternative,
  Criterion,
  Rating,
  NwaResult,
  CriterionScore,
  SensitivityResult,
  AHPComparison,
  AHPConsistencyResult,
  Risk,
  Evaluator,
} from "./types";

// Random Index values for AHP consistency check (n = 1 to 15)
const RANDOM_INDEX = [0, 0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49, 1.51, 1.48, 1.56, 1.57, 1.59];

/**
 * Normalize weights to sum to 1
 */
export function normalizeWeights(criteria: Criterion[]): Criterion[] {
  const totalWeight = criteria.reduce((sum, c) => sum + c.rawWeight, 0);
  if (totalWeight === 0) return criteria;
  
  return criteria.map((c) => ({
    ...c,
    weight: c.rawWeight / totalWeight,
  }));
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
  evaluators?: Evaluator[]
): NwaResult[] {
  // Early return for empty inputs
  if (alternatives.length === 0 || criteria.length === 0) {
    return [];
  }

  const normalizedCriteria = normalizeWeights(criteria);
  const results: NwaResult[] = [];

  // Build rating lookup map for O(1) access: Map<altId-critId, Rating[]>
  const ratingMap = new Map<string, Rating[]>();
  for (const r of ratings) {
    const key = `${r.alternativeId}-${r.criterionId}`;
    const existing = ratingMap.get(key);
    if (existing) {
      existing.push(r);
    } else {
      ratingMap.set(key, [r]);
    }
  }

  // Build evaluator lookup map for O(1) access
  const evaluatorMap = new Map<string, number>();
  if (evaluators) {
    for (const e of evaluators) {
      evaluatorMap.set(e.id, e.weight ?? 1);
    }
  }

  for (const alt of alternatives) {
    const criteriaScores: CriterionScore[] = [];
    let total = 0;

    for (const criterion of normalizedCriteria) {
      // O(1) lookup instead of O(n) filter
      const relevantRatings = ratingMap.get(`${alt.id}-${criterion.id}`) || [];

      let avgScore = 0;
      if (relevantRatings.length > 0) {
        if (evaluatorMap.size > 0) {
          // Weighted average by evaluator weight - O(1) lookup
          let weightedSum = 0;
          let totalEvaluatorWeight = 0;
          
          for (const rating of relevantRatings) {
            const evalWeight = rating.evaluatorId ? evaluatorMap.get(rating.evaluatorId) ?? 1 : 1;
            weightedSum += rating.score * evalWeight;
            totalEvaluatorWeight += evalWeight;
          }
          
          avgScore = totalEvaluatorWeight > 0 ? weightedSum / totalEvaluatorWeight : 0;
        } else {
          // Simple average
          avgScore = relevantRatings.reduce((sum, r) => sum + r.score, 0) / relevantRatings.length;
        }
      }

      const weightedScore = avgScore * criterion.weight;
      total += weightedScore;

      criteriaScores.push({
        criterionId: criterion.id,
        weightedScore,
        rawScore: avgScore,
      });
    }

    results.push({
      alternativeId: alt.id,
      totalScore: total,
      normalizedScore: 0, // Will be set after ranking
      rank: 0,
      criteriaScores,
    });
  }

  // Sort and assign ranks
  results.sort((a, b) => b.totalScore - a.totalScore);
  
  // Normalize scores to 0-100 scale
  const maxScore = results[0]?.totalScore || 1;
  const minScore = results[results.length - 1]?.totalScore || 0;
  const range = maxScore - minScore || 1;

  results.forEach((r, idx) => {
    r.rank = idx + 1;
    r.normalizedScore = ((r.totalScore - minScore) / range) * 100;
  });

  return results;
}

/**
 * Calculate risk-adjusted scores
 */
export function calculateRiskAdjustedScores(
  results: NwaResult[],
  risks: Risk[]
): NwaResult[] {
  return results.map((result) => {
    const alternativeRisks = risks.filter((r) => r.alternativeId === result.alternativeId);
    
    // Calculate average risk score (probability × impact)
    const riskScore = alternativeRisks.length > 0
      ? alternativeRisks.reduce((sum, r) => sum + r.probability * r.impact, 0) / alternativeRisks.length
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
export function calculateSensitivity(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[],
  evaluators?: Evaluator[]
): SensitivityResult[] {
  const baseResults = calculateNwa(alternatives, criteria, ratings, evaluators);
  const winner = baseResults[0];
  const runnerUp = baseResults[1];
  
  if (!winner || !runnerUp) {
    return [];
  }

  const results: SensitivityResult[] = [];

  for (const criterion of criteria) {
    // Find the critical weight at which ranking would change
    const winnerScore = winner.criteriaScores.find((cs) => cs.criterionId === criterion.id);
    const runnerUpScore = runnerUp.criteriaScores.find((cs) => cs.criterionId === criterion.id);

    if (!winnerScore || !runnerUpScore) continue;

    const scoreDiff = winnerScore.rawScore - runnerUpScore.rawScore;
    const totalScoreDiff = winner.totalScore - runnerUp.totalScore;

    // Calculate sensitivity metric
    let sensitivity = 0;
    let criticalWeight = criterion.weight;

    if (Math.abs(scoreDiff) > 0.001) {
      // How much weight change needed to flip ranking
      const weightChangeNeeded = totalScoreDiff / Math.abs(scoreDiff);
      criticalWeight = criterion.weight - weightChangeNeeded;
      criticalWeight = Math.max(0, Math.min(1, criticalWeight));
      
      // Sensitivity: higher means more sensitive
      sensitivity = Math.abs(criterion.weight * scoreDiff / totalScoreDiff);
    }

    let impactOnRanking: "low" | "medium" | "high" = "low";
    if (sensitivity > 0.5) impactOnRanking = "high";
    else if (sensitivity > 0.2) impactOnRanking = "medium";

    results.push({
      criterionId: criterion.id,
      originalWeight: criterion.weight,
      criticalWeight,
      sensitivity,
      impactOnRanking,
    });
  }

  return results.sort((a, b) => b.sensitivity - a.sensitivity);
}

/**
 * AHP: Build comparison matrix from pairwise comparisons
 */
export function buildAHPMatrix(
  criteria: Criterion[],
  comparisons: AHPComparison[]
): number[][] {
  const n = criteria.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(1));

  for (const comp of comparisons) {
    const i = criteria.findIndex((c) => c.id === comp.criterionId1);
    const j = criteria.findIndex((c) => c.id === comp.criterionId2);
    
    if (i !== -1 && j !== -1) {
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
  weights: number[]
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
  const ci = (lambdaMax - n) / (n - 1);

  // Get Random Index
  const ri = RANDOM_INDEX[n] || 1.59;

  // Calculate Consistency Ratio
  const cr = ci / ri;

  const isConsistent = cr < 0.1;

  let message = "";
  if (cr < 0.05) {
    message = "Ausgezeichnete Konsistenz - Die Bewertungen sind sehr schlüssig.";
  } else if (cr < 0.1) {
    message = "Akzeptable Konsistenz - Die Bewertungen sind ausreichend schlüssig.";
  } else if (cr < 0.2) {
    message = "Grenzwertige Konsistenz - Überprüfen Sie einige Vergleiche.";
  } else {
    message = "Inkonsistent - Die paarweisen Vergleiche widersprechen sich. Bitte überarbeiten.";
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
  comparisons: AHPComparison[]
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
 *
 * Die eingegebenen Prozentwerte summieren sich nicht zwingend auf 100. Damit
 * die angezeigten Gewichte denjenigen entsprechen, mit denen `calculateNwa`
 * tatsächlich rechnet (dort wird stets über `normalizeWeights` normiert), wird
 * hier ebenfalls auf die Summe normiert statt fix durch 100 geteilt.
 */
export function applyPercentageWeights(criteria: Criterion[]): Criterion[] {
  const totalWeight = criteria.reduce((sum, c) => sum + c.rawWeight, 0);
  if (totalWeight === 0) return criteria;

  return criteria.map((c) => ({
    ...c,
    weight: c.rawWeight / totalWeight,
  }));
}

/**
 * Get decision recommendation based on results
 */
export function getRecommendation(
  results: NwaResult[],
  alternatives: Alternative[]
): {
  recommended: Alternative | null;
  confidence: "high" | "medium" | "low";
  reasoning: string;
} {
  if (results.length === 0) {
    return {
      recommended: null,
      confidence: "low",
      reasoning: "Keine Ergebnisse verfügbar.",
    };
  }

  const winner = results[0];
  const runnerUp = results[1];
  const recommended = alternatives.find((a) => a.id === winner.alternativeId) || null;

  // Calculate confidence based on score difference
  let confidence: "high" | "medium" | "low" = "medium";
  let reasoning = "";

  if (!runnerUp) {
    confidence = "high";
    reasoning = "Nur eine Alternative bewertet.";
  } else {
    const scoreDiffPercent = ((winner.totalScore - runnerUp.totalScore) / winner.totalScore) * 100;
    
    if (scoreDiffPercent > 20) {
      confidence = "high";
      reasoning = `Klarer Vorsprung von ${scoreDiffPercent.toFixed(1)}% gegenüber der zweitbesten Alternative.`;
    } else if (scoreDiffPercent > 10) {
      confidence = "medium";
      reasoning = `Moderater Vorsprung von ${scoreDiffPercent.toFixed(1)}%. Sensitivitätsanalyse empfohlen.`;
    } else {
      confidence = "low";
      reasoning = `Geringer Vorsprung von ${scoreDiffPercent.toFixed(1)}%. Alternativen liegen nah beieinander.`;
    }
  }

  return { recommended, confidence, reasoning };
}

/**
 * Check knockout criteria
 */
export function checkKnockoutCriteria(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[]
): { alternativeId: string; failedCriteria: string[] }[] {
  const knockoutCriteria = criteria.filter((c) => c.isKnockout && c.minThreshold !== undefined);
  const failures: { alternativeId: string; failedCriteria: string[] }[] = [];

  for (const alt of alternatives) {
    const failedCriteria: string[] = [];
    
    for (const criterion of knockoutCriteria) {
      const rating = ratings.find(
        (r) => r.alternativeId === alt.id && r.criterionId === criterion.id
      );
      
      if (rating && criterion.minThreshold !== undefined && rating.score < criterion.minThreshold) {
        failedCriteria.push(criterion.id);
      }
    }

    if (failedCriteria.length > 0) {
      failures.push({ alternativeId: alt.id, failedCriteria });
    }
  }

  return failures;
}

/**
 * Generate unique ID
 * Uses crypto.randomUUID when available (modern browsers)
 * Falls back to performance.now() + random for older environments
 */
let idCounter = 0;
export function generateId(): string {
  // Prefer crypto.randomUUID for cryptographically unique IDs
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  
  // Fallback: use high-resolution time + random + counter for uniqueness
  idCounter += 1;
  const timestamp = typeof performance !== "undefined" 
    ? Math.floor(performance.now() * 1000)
    : idCounter;
  const random = Math.random().toString(36).substring(2, 11);
  return `nwa-${timestamp}-${random}-${idCounter}`;
}
