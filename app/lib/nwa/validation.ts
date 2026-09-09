import { z } from "zod";
import type { AnalysisState, AnalysisStep } from "./types";

const id = z.string().min(1).max(120);
const label = z.string().max(200);
const note = z.string().max(10000);
const positive = z.number().finite().min(0).max(100);
const date = z.coerce.date();
export const interpretationSchema = z.object({
  title: label,
  description: note,
  domain: z.enum([
    "supplier",
    "software",
    "investment",
    "machines",
    "vehicle",
    "employee",
    "personal",
    "technology",
    "service",
    "other",
  ]),
  alternatives: z
    .array(z.object({ name: label, description: note.nullable() }))
    .max(10),
  criteria: z
    .array(
      z.object({
        name: label,
        description: note,
        categoryId: z.enum([
          "economic",
          "quality",
          "strategic",
          "risk",
          "other",
        ]),
      }),
    )
    .max(20),
  constraints: note.nullable(),
  confidence: z.enum(["high", "medium", "low"]),
});

const schema = z.object({
  decision: z.object({
    id,
    title: label,
    description: note,
    packageLevel: z.enum(["basic", "advanced", "business"]),
    createdAt: date,
    updatedAt: date,
    preset: label.optional(),
    constraints: note.optional(),
    strategicQuestion: note.optional(),
    aiInterpretation: interpretationSchema.optional(),
    scenarios: z
      .array(
        z.object({
          id,
          name: label,
          description: note,
          probability: z.number().finite().min(0).max(1).optional(),
        }),
      )
      .max(20)
      .optional(),
  }),
  alternatives: z
    .array(
      z.object({
        id,
        name: label,
        description: note.optional(),
        assumptions: z.array(note).max(50).optional(),
        scenarioId: id.optional(),
      }),
    )
    .max(10),
  categories: z
    .array(
      z.object({
        id,
        name: label,
        description: note.optional(),
        order: positive,
      }),
    )
    .max(30),
  criteria: z
    .array(
      z.object({
        id,
        name: label,
        description: note.optional(),
        weight: z.number().finite().min(0).max(1),
        rawWeight: positive,
        categoryId: id.optional(),
        isKnockout: z.boolean().optional(),
        minThreshold: z.number().finite().min(1).max(10).optional(),
        rationale: note.optional(),
        source: note.optional(),
      }),
    )
    .max(20),
  ratings: z
    .array(
      z.object({
        alternativeId: id,
        criterionId: id,
        score: z.number().finite().min(1).max(10),
        comment: note.optional(),
        evaluatorId: id.optional(),
      }),
    )
    .max(2000),
  risks: z
    .array(
      z.object({
        alternativeId: id,
        description: note,
        probability: z.number().finite().min(0).max(1),
        impact: z.number().finite().min(1).max(10),
        mitigation: note.optional(),
      }),
    )
    .max(100),
  evaluators: z
    .array(
      z.object({
        id,
        name: label,
        role: label.optional(),
        weight: positive.optional(),
      }),
    )
    .max(10),
  ahpComparisons: z
    .array(
      z.object({
        criterionId1: id,
        criterionId2: id,
        value: z
          .number()
          .finite()
          .min(1 / 9)
          .max(9),
      }),
    )
    .max(190),
  weightingMethod: z.enum(["simple", "percentage", "ahp-light", "ahp-full"]),
  currentStep: z.enum([
    "decision",
    "alternatives",
    "criteria",
    "weighting",
    "evaluation",
    "results",
  ]),
});

export const ANALYSIS_STEPS: AnalysisStep[] = [
  "decision",
  "alternatives",
  "criteria",
  "weighting",
  "evaluation",
  "results",
];

export function stepIsValid(state: AnalysisState, step: AnalysisStep): boolean {
  const {
    alternatives,
    criteria,
    ratings,
    decision,
    weightingMethod,
    evaluators,
    ahpComparisons,
  } = state;
  switch (step) {
    case "decision":
      return decision.title.trim().length > 0 && decision.title.length <= 200;
    case "alternatives":
      return (
        alternatives.length >= 2 &&
        alternatives.length <= (decision.packageLevel === "basic" ? 5 : 10) &&
        alternatives.every((a) => a.name.trim() && a.name.length <= 200)
      );
    case "criteria":
      return (
        criteria.length >= 2 &&
        criteria.length <= 20 &&
        criteria.every(
          (c) =>
            c.name.trim() &&
            c.name.length <= 200 &&
            (!c.isKnockout ||
              (c.minThreshold !== undefined &&
                c.minThreshold >= 1 &&
                c.minThreshold <= 10)),
        )
      );
    case "weighting": {
      if (weightingMethod.startsWith("ahp"))
        return (
          criteria.length <= 15 &&
          criteria.every((a, i) =>
            criteria
              .slice(i + 1)
              .every((b) =>
                ahpComparisons.some(
                  (c) =>
                    ((c.criterionId1 === a.id && c.criterionId2 === b.id) ||
                      (c.criterionId1 === b.id && c.criterionId2 === a.id)) &&
                    Number.isFinite(c.value) &&
                    c.value >= 1 / 9 &&
                    c.value <= 9,
                ),
              ),
          )
        );
      if (
        !criteria.every(
          (c) =>
            Number.isFinite(c.rawWeight) &&
            c.rawWeight >= 0 &&
            c.rawWeight <= 100,
        )
      )
        return false;
      if (weightingMethod === "simple")
        return criteria.every((c) => c.rawWeight >= 1 && c.rawWeight <= 5);
      return (
        Math.abs(criteria.reduce((n, c) => n + c.rawWeight, 0) - 100) < 0.01
      );
    }
    case "evaluation": {
      const people =
        decision.packageLevel === "business"
          ? evaluators.map((e) => e.id)
          : [undefined];
      return (
        people.length > 0 &&
        (decision.packageLevel !== "business" ||
          evaluators.every((e) => e.name.trim() && (e.weight ?? 1) > 0)) &&
        alternatives.every((a) =>
          criteria.every((c) =>
            people.every((e) =>
              ratings.some(
                (r) =>
                  r.alternativeId === a.id &&
                  r.criterionId === c.id &&
                  r.evaluatorId === e &&
                  Number.isFinite(r.score) &&
                  r.score >= 1 &&
                  r.score <= 10,
              ),
            ),
          ),
        )
      );
    }
    default:
      return true;
  }
}

export function parseAnalysis(value: unknown): AnalysisState | null {
  const parsed = schema.safeParse(value);
  if (!parsed.success) return null;
  const s: AnalysisState = {
    ...parsed.data,
    results: [],
    sensitivityResults: [],
  };
  for (const items of [s.alternatives, s.criteria, s.categories, s.evaluators])
    if (new Set(items.map((x) => x.id)).size !== items.length) return null;
  if (
    s.ratings.some(
      (r) =>
        !s.alternatives.some((a) => a.id === r.alternativeId) ||
        !s.criteria.some((c) => c.id === r.criterionId) ||
        (r.evaluatorId !== undefined &&
          !s.evaluators.some((e) => e.id === r.evaluatorId)),
    )
  )
    return null;
  if (
    new Set(
      s.ratings.map((r) =>
        JSON.stringify([r.alternativeId, r.criterionId, r.evaluatorId]),
      ),
    ).size !== s.ratings.length
  )
    return null;
  const pairs = s.ahpComparisons.map((c) =>
    JSON.stringify([c.criterionId1, c.criterionId2].sort()),
  );
  if (
    new Set(pairs).size !== pairs.length ||
    s.ahpComparisons.some(
      (c) =>
        c.criterionId1 === c.criterionId2 ||
        !s.criteria.some((x) => x.id === c.criterionId1) ||
        !s.criteria.some((x) => x.id === c.criterionId2),
    )
  )
    return null;
  if (
    s.risks.some((r) => !s.alternatives.some((a) => a.id === r.alternativeId))
  )
    return null;
  const requested = ANALYSIS_STEPS.indexOf(s.currentStep);
  const invalid = ANALYSIS_STEPS.slice(0, requested).find(
    (step) => !stepIsValid(s, step),
  );
  if (invalid) s.currentStep = invalid;
  return s;
}
