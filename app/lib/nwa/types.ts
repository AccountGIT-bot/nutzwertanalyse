export type PackageLevel = "basic" | "advanced" | "business";

export interface DecisionContext {
  title: string;
  description: string;
  packageLevel: PackageLevel;
}

export interface Alternative {
  id: string;
  name: string;
  description?: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number; // z.B. 0-100 oder 1-5
  category?: string;
  knockout?: boolean;
}

export interface Rating {
  alternativeId: string;
  criterionId: string;
  score: number; // z.B. 1-10
}

export interface Risk {
  alternativeId: string;
  probability: number;
  impact: number;
}

export interface NwaResult {
  alternativeId: string;
  totalScore: number;
}
