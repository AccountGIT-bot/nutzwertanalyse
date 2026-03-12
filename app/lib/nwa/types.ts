export type PackageLevel = "basic" | "advanced" | "business";

// Decision Context
export interface DecisionContext {
  id: string;
  title: string;
  description: string;
  packageLevel: PackageLevel;
  createdAt: Date;
  updatedAt: Date;
  preset?: string;
  // Advanced/Business fields
  constraints?: string;
  strategicQuestion?: string;
  scenarios?: Scenario[];
}

// Scenarios (Business package)
export interface Scenario {
  id: string;
  name: string;
  description: string;
  probability?: number;
}

// Alternatives
export interface Alternative {
  id: string;
  name: string;
  description?: string;
  // Advanced/Business fields
  assumptions?: string[];
  scenarioId?: string;
}

// Criteria Categories (Advanced/Business)
export interface CriteriaCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
}

// Criteria
export interface Criterion {
  id: string;
  name: string;
  description?: string;
  weight: number; // Normalized 0-1
  rawWeight: number; // Original input weight
  categoryId?: string;
  isKnockout?: boolean;
  minThreshold?: number;
  // Business: governance documentation
  rationale?: string;
  source?: string;
}

// Rating
export interface Rating {
  alternativeId: string;
  criterionId: string;
  score: number; // 1-10 scale
  comment?: string;
  // Business: multi-person scoring
  evaluatorId?: string;
}

// AHP Pairwise Comparison
export interface AHPComparison {
  criterionId1: string;
  criterionId2: string;
  value: number; // 1/9 to 9 scale
}

// Risk Assessment
export interface Risk {
  alternativeId: string;
  description: string;
  probability: number; // 0-1
  impact: number; // 1-10
  mitigation?: string;
}

// Evaluator (Business multi-person)
export interface Evaluator {
  id: string;
  name: string;
  role?: string;
  weight?: number; // Evaluator importance weight
}

// Results
export interface NwaResult {
  alternativeId: string;
  totalScore: number;
  normalizedScore: number; // 0-100 scale
  rank: number;
  criteriaScores: CriterionScore[];
  riskScore?: number;
}

export interface CriterionScore {
  criterionId: string;
  weightedScore: number;
  rawScore: number;
}

// Sensitivity Analysis
export interface SensitivityResult {
  criterionId: string;
  originalWeight: number;
  criticalWeight: number; // Weight at which ranking changes
  sensitivity: number; // How sensitive is ranking to this criterion
  impactOnRanking: "low" | "medium" | "high";
}

// AHP Consistency
export interface AHPConsistencyResult {
  consistencyIndex: number;
  randomIndex: number;
  consistencyRatio: number;
  isConsistent: boolean;
  message: string;
}

// Weighting Method
export type WeightingMethod = "simple" | "percentage" | "ahp-light" | "ahp-full";

// Analysis State (main data model)
export interface AnalysisState {
  decision: DecisionContext;
  alternatives: Alternative[];
  categories: CriteriaCategory[];
  criteria: Criterion[];
  ratings: Rating[];
  risks: Risk[];
  evaluators: Evaluator[];
  ahpComparisons: AHPComparison[];
  weightingMethod: WeightingMethod;
  results: NwaResult[];
  sensitivityResults: SensitivityResult[];
  ahpConsistency?: AHPConsistencyResult;
  currentStep: AnalysisStep;
}

export type AnalysisStep =
  | "decision"
  | "alternatives"
  | "criteria"
  | "weighting"
  | "evaluation"
  | "results";

// Predefined Criteria Templates
export interface CriteriaTemplate {
  id: string;
  name: string;
  presetId: string;
  criteria: Omit<Criterion, "id" | "weight" | "rawWeight">[];
}

// Export Report Config
export interface ReportConfig {
  includeExecutiveSummary: boolean;
  includeDetailedAnalysis: boolean;
  includeSensitivityAnalysis: boolean;
  includeRiskAssessment: boolean;
  includeAuditTrail: boolean;
  includeMethodologyNotes: boolean;
}
