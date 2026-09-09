import { test } from "node:test";
import assert from "node:assert/strict";
import { writeFileSync, mkdirSync } from "node:fs";
import { createDemo } from "../app/lib/nwa/demo";
import {
  calculateNwa,
  calculateSensitivity,
  reweightCriterion,
  getRecommendation,
  applyAHPWeights,
  checkKnockoutCriteria,
  normalizeWeights,
} from "../app/lib/nwa/calculate";
import { analysisReducer } from "../app/lib/nwa/analysis-context";
import { parseAnalysis, stepIsValid } from "../app/lib/nwa/validation";
import { generateReportHTML, generateXlsx } from "../app/lib/nwa/export";
import type { ReportConfig } from "../app/lib/nwa/types";
const full: ReportConfig = {
  includeExecutiveSummary: true,
  includeDetailedAnalysis: true,
  includeSensitivityAnalysis: true,
  includeRiskAssessment: true,
  includeAuditTrail: true,
  includeMethodologyNotes: true,
};
const ready = () =>
  analysisReducer(createDemo(), { type: "CALCULATE_RESULTS" });
const near = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test("documented software example yields 8.3, 7.4 and 6.8 on an absolute ten-point scale", () => {
  const s = ready();
  assert.deepEqual(
    s.results.map((r) => r.alternativeId),
    ["b", "a", "c"],
  );
  [8.3, 7.4, 6.8].forEach((n, i) => near(s.results[i].totalScore, n));
  near(s.results[0].normalizedScore, 83);
  assert.equal(s.results[0].rank, 1);
});
test("equal scores share rank and never invent a winner", () => {
  const s = createDemo();
  s.ratings = s.ratings.map((r) => ({ ...r, score: 7 }));
  const r = calculateNwa(s.alternatives, s.criteria, s.ratings);
  assert.deepEqual(
    r.map((r) => r.rank),
    [1, 1, 1],
  );
  assert.equal(getRecommendation(r, s.alternatives).recommended, null);
  near(r[0].normalizedScore, 70);
});
test("a higher scoring knocked-out option is never recommended or ranked", () => {
  const s = createDemo();
  s.criteria[1] = { ...s.criteria[1], isKnockout: true, minThreshold: 9 };
  const r = calculateNwa(s.alternatives, s.criteria, s.ratings);
  assert.ok(r.every((r) => r.excluded && r.rank === 0));
  assert.equal(getRecommendation(r, s.alternatives).recommended, null);
  s.criteria[1].minThreshold = 7;
  const r2 = calculateNwa(s.alternatives, s.criteria, s.ratings);
  assert.equal(r2.find((r) => r.alternativeId === "c")?.rank, 0);
});
test("knockout checks and scoring use the same weighted person average", () => {
  const s = createDemo();
  s.evaluators = [
    { id: "e1", name: "A", weight: 1 },
    { id: "e2", name: "B", weight: 3 },
  ];
  s.criteria[0] = { ...s.criteria[0], isKnockout: true, minThreshold: 7 };
  s.ratings = s.ratings.flatMap((r) => [
    { ...r, evaluatorId: "e1", score: 2 },
    { ...r, evaluatorId: "e2", score: 9 },
  ]);
  const r = calculateNwa(s.alternatives, s.criteria, s.ratings, s.evaluators);
  near(r[0].totalScore, 7.25);
  assert.equal(
    checkKnockoutCriteria(s.alternatives, s.criteria, s.ratings, s.evaluators)
      .length,
    0,
  );
});
test("zero and nonfinite weights do not retain stale normalized weights", () => {
  const c = createDemo().criteria.map((c) => ({
    ...c,
    rawWeight: 0,
    weight: 0.25,
  }));
  assert.ok(normalizeWeights(c).every((c) => c.weight === 0));
  c[0].rawWeight = NaN;
  assert.ok(normalizeWeights(c).every((c) => Number.isFinite(c.weight)));
});
test("percentage weights must total 100; every AHP pair needs an explicit comparison", () => {
  const s = createDemo();
  s.criteria[0].rawWeight = 20;
  assert.equal(stepIsValid(s, "weighting"), false);
  s.weightingMethod = "ahp-full";
  assert.equal(stepIsValid(s, "weighting"), false);
  s.criteria.forEach((a, i) =>
    s.criteria.slice(i + 1).forEach((b) =>
      s.ahpComparisons.push({
        criterionId1: a.id,
        criterionId2: b.id,
        value: 1,
      }),
    ),
  );
  assert.equal(stepIsValid(s, "weighting"), true);
});
test("AHP uses RI 0.58 for three criteria and recovers a consistent known vector", () => {
  const c = createDemo().criteria.slice(0, 3);
  const r = applyAHPWeights(c, [
    { criterionId1: c[0].id, criterionId2: c[1].id, value: 2 },
    { criterionId1: c[0].id, criterionId2: c[2].id, value: 6 },
    { criterionId1: c[1].id, criterionId2: c[2].id, value: 3 },
  ]);
  assert.equal(r.consistency.randomIndex, 0.58);
  [0.6, 0.3, 0.1].forEach((n, i) => near(r.criteria[i].weight, n));
  near(r.consistency.consistencyRatio, 0);
});
test("sensitivity crossing is mathematically consistent with proportional redistribution", () => {
  const s = createDemo();
  const sensitivity = calculateSensitivity(
    s.alternatives,
    s.criteria,
    s.ratings,
  );
  for (const v of sensitivity) {
    if (v.criticalWeight === null) continue;
    const changed = reweightCriterion(
      s.criteria,
      v.criterionId,
      v.criticalWeight,
    );
    near(
      changed.reduce((n, c) => n + c.weight, 0),
      1,
    );
    const r = calculateNwa(s.alternatives, changed, s.ratings);
    near(r[0].totalScore, r[1].totalScore);
  }
});
test("sensitivity considers a challenger outside the initial top two", () => {
  const s = createDemo();
  s.criteria = s.criteria.slice(0, 2).map((c, i) => ({
    ...c,
    weight: i === 0 ? 0.2 : 0.8,
    rawWeight: i === 0 ? 20 : 80,
  }));
  const scores = [
    [7, 9],
    [6, 8],
    [10, 5],
  ];
  s.ratings = s.alternatives.flatMap((a, i) =>
    s.criteria.map((c, j) => ({
      alternativeId: a.id,
      criterionId: c.id,
      score: scores[i][j],
    })),
  );
  const result = calculateSensitivity(
    s.alternatives,
    s.criteria,
    s.ratings,
  ).find((r) => r.criterionId === s.criteria[0].id)!;
  near(result.criticalWeight!, 4 / 7);
});
test("multi-person progression requires all ratings from every person", () => {
  const s = createDemo();
  s.decision.packageLevel = "business";
  s.evaluators = [
    { id: "one", name: "One" },
    { id: "two", name: "Two" },
  ];
  s.ratings = s.ratings.map((r) => ({ ...r, evaluatorId: "one" }));
  assert.equal(stepIsValid(s, "evaluation"), false);
  s.ratings.push(...s.ratings.map((r) => ({ ...r, evaluatorId: "two" })));
  assert.equal(stepIsValid(s, "evaluation"), true);
});
test("import restores dates, ignores cached results, and rejects corrupted or duplicate records", () => {
  const s = ready();
  const imported = parseAnalysis(JSON.parse(JSON.stringify(s)));
  assert.ok(imported?.decision.createdAt instanceof Date);
  assert.deepEqual(imported?.results, []);
  assert.equal(parseAnalysis({ decision: { title: "broken" } }), null);
  const dupe = createDemo();
  dupe.ratings.push(dupe.ratings[0]);
  assert.equal(parseAnalysis(dupe), null);
  const alien = createDemo();
  alien.ratings[0].criterionId = "unrelated";
  assert.equal(parseAnalysis(alien), null);
});
test("import cannot skip incomplete steps", () => {
  const s = createDemo();
  s.ratings = [];
  assert.equal(parseAnalysis(s)?.currentStep, "evaluation");
  s.decision.title = "";
  assert.equal(parseAnalysis(s)?.currentStep, "decision");
});
test("reimporting a result while already viewing results recalculates immediately", () => {
  const s = ready();
  const other = createDemo();
  other.ratings = other.ratings.map((r) => ({ ...r, score: 4 }));
  const loaded = analysisReducer(s, { type: "LOAD_STATE", payload: other });
  assert.equal(loaded.currentStep, "results");
  near(loaded.results[0].totalScore, 4);
});
test("editing weights updates displayed normalized weights before evaluation", () => {
  let s = ready();
  s = analysisReducer(s, { type: "SET_STEP", payload: "weighting" });
  s = analysisReducer(s, {
    type: "UPDATE_CRITERION",
    payload: { ...s.criteria[0], rawWeight: 60 },
  });
  near(s.criteria[0].weight, 60 / 130);
  assert.deepEqual(s.results, []);
});
test("replacing criteria clears ratings and pair comparisons from the old template", () => {
  const s = analysisReducer(ready(), {
    type: "SET_CRITERIA_FROM_TEMPLATE",
    payload: "vehicle",
  });
  assert.equal(s.ratings.length, 0);
  assert.equal(s.ahpComparisons.length, 0);
});
test("reports escape all user HTML and spreadsheet strings stay text", () => {
  const s = ready();
  s.decision.title = '<img src=x onerror="alert(1)">';
  s.alternatives[0].name = '=HYPERLINK("https://evil.invalid","x")';
  s.criteria[0].description = "<script>alert(1)</script>";
  const html = generateReportHTML(s, full);
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  const zip = generateXlsx(s);
  assert.deepEqual([...zip.slice(0, 4)], [80, 75, 3, 4]);
  mkdirSync(".test-build/artifacts", { recursive: true });
  writeFileSync(".test-build/artifacts/report.xlsx", zip);
  writeFileSync(".test-build/artifacts/report.html", html);
});
test("minimal report actually omits deselected sections", () => {
  const html = generateReportHTML(ready(), {
    ...full,
    includeExecutiveSummary: false,
    includeDetailedAnalysis: false,
    includeSensitivityAnalysis: false,
    includeAuditTrail: false,
    includeRiskAssessment: false,
  });
  assert.ok(!html.includes("<h2>Ergebnis</h2>"));
  assert.ok(!html.includes("<h2>Kriterien und Gewichtung</h2>"));
  assert.ok(html.includes("<h2>Methodik</h2>"));
});
