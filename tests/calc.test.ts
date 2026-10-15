import { test } from "node:test";
import assert from "node:assert/strict";
import { ahpConsistency, ahpWeights, computeResults, robustness, rocWeights, sensitivity, resultsWithWeights, isStepComplete } from "../lib/nwa/calc";
import { createAlternative, createAnalysis, createCriterion, DEFAULT_EVALUATOR_ID, sanitizeAnalysis, percentFromPoints } from "../lib/nwa/factory";
import type { Analysis } from "../lib/nwa/types";

function fixture(): Analysis {
  const a = createAnalysis({ title: "Test" });
  a.alternatives = [createAlternative("A"), createAlternative("B"), createAlternative("C")];
  a.criteria = [
    createCriterion({ name: "Preis", points: 5 }),
    createCriterion({ name: "Qualität", points: 3 }),
    createCriterion({ name: "Service", points: 2, isKnockout: true, minScore: 4 }),
  ];
  const scores = [
    [8, 6, 7],
    [5, 9, 8],
    [9, 9, 2],
  ];
  a.ratings[DEFAULT_EVALUATOR_ID] = {};
  a.alternatives.forEach((alt, i) => {
    a.ratings[DEFAULT_EVALUATOR_ID][alt.id] = {};
    a.criteria.forEach((c, j) => {
      a.ratings[DEFAULT_EVALUATOR_ID][alt.id][c.id] = { score: scores[i][j] };
    });
  });
  return a;
}

test("Punktgewichte werden normiert und Nutzwert korrekt berechnet", () => {
  const a = fixture();
  const r = computeResults(a);
  const w = a.criteria.map((c) => r.weights[c.id]);
  assert.ok(Math.abs(w.reduce((s, x) => s + x, 0) - 1) < 1e-9);
  assert.ok(Math.abs(w[0] - 0.5) < 1e-9);
  const altA = r.alternatives[0];
  // 0.5*8 + 0.3*6 + 0.2*7 = 4 + 1.8 + 1.4 = 7.2
  assert.ok(Math.abs(altA.total - 7.2) < 1e-9);
  assert.ok(Math.abs(altA.percent - 72) < 1e-9);
});

test("K.-o.-Kriterium schliesst Alternative aus", () => {
  const a = fixture();
  const r = computeResults(a);
  const altC = r.alternatives[2];
  assert.equal(altC.knockedOut, true);
  assert.equal(altC.rank, 0);
  assert.equal(r.ranking.length, 2);
  assert.equal(r.ranking[0].alternativeId, a.alternatives[0].id);
});

test("Empfehlung und Vollständigkeit", () => {
  const a = fixture();
  const r = computeResults(a);
  assert.equal(r.recommendation.winnerId, a.alternatives[0].id);
  assert.equal(r.completeness, 1);
  // Bewertung entfernen → unvollständig
  delete a.ratings[DEFAULT_EVALUATOR_ID][a.alternatives[0].id][a.criteria[0].id];
  const r2 = computeResults(a);
  assert.ok(r2.completeness < 1);
});

test("Mehrere Bewertende: stimmgewichtetes Mittel", () => {
  const a = fixture();
  a.evaluators.push({ id: "ev2", name: "Zweite", weight: 3 });
  a.ratings.ev2 = { [a.alternatives[0].id]: { [a.criteria[0].id]: { score: 4 } } };
  const r = computeResults(a);
  const contrib = r.alternatives[0].contributions[0];
  // (8*1 + 4*3) / 4 = 5
  assert.ok(Math.abs(contrib.rawScore - 5) < 1e-9);
});

test("ROC-Gewichte summieren sich zu 1 und fallen monoton", () => {
  const w = rocWeights(4);
  assert.ok(Math.abs(w.reduce((s, x) => s + x, 0) - 1) < 1e-9);
  for (let i = 1; i < w.length; i++) assert.ok(w[i] < w[i - 1]);
  assert.ok(Math.abs(w[0] - 0.5208) < 0.001);
});

test("AHP: konsistente Matrix ergibt CR ≈ 0", () => {
  const m = [
    [1, 3, 9],
    [1 / 3, 1, 3],
    [1 / 9, 1 / 3, 1],
  ];
  const w = ahpWeights(m);
  const c = ahpConsistency(m, w);
  assert.ok(c.cr < 0.01);
  assert.ok(w[0] > w[1] && w[1] > w[2]);
});

test("AHP: inkonsistente Matrix wird erkannt", () => {
  const m = [
    [1, 9, 1 / 9],
    [1 / 9, 1, 9],
    [9, 1 / 9, 1],
  ];
  const w = ahpWeights(m);
  const c = ahpConsistency(m, w);
  assert.equal(c.isConsistent, false);
});

test("Sensitivität: Kipppunkt ist korrekt", () => {
  const a = fixture();
  a.criteria[2].isKnockout = false;
  const r = computeResults(a);
  const s = sensitivity(a, r);
  assert.equal(s.length, 3);
  // Verifikation: Am Kipppunkt sind Sieger und Herausforderer gleichauf
  for (const e of s) {
    if (e.flipWeight === null) continue;
    const override: Record<string, number> = {};
    const rest = 1 - e.flipWeight;
    const restSum = a.criteria.filter((c) => c.id !== e.criterionId).reduce((sum, c) => sum + r.weights[c.id], 0);
    for (const c of a.criteria) {
      override[c.id] = c.id === e.criterionId ? e.flipWeight : (r.weights[c.id] / restSum) * rest;
    }
    const rr = resultsWithWeights(a, override);
    const winner = rr.alternatives.find((x) => x.alternativeId === r.ranking[0].alternativeId)!;
    const challenger = rr.alternatives.find((x) => x.alternativeId === e.flipToId)!;
    assert.ok(Math.abs(winner.total - challenger.total) < 1e-6, `Kipppunkt für ${e.criterionId}`);
  }
});

test("Robustheit: Siegquoten summieren sich zu 1", () => {
  const a = fixture();
  const r = computeResults(a);
  const rb = robustness(a, r, { runs: 200 });
  const sum = Object.values(rb.winShare).reduce((s, x) => s + x, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.ok(rb.winShare[a.alternatives[0].id] > 0.5);
});

test("Import-Sanitizer verwirft ungültige Werte", () => {
  const raw = {
    title: "X",
    settings: { scale: 7, weighting: "foo" },
    alternatives: [{ id: "a", name: "A" }, "junk", { id: "b", name: "B", excluded: "yes" }],
    criteria: [{ id: "c", name: "C", points: 99, categoryId: "nope", minScore: 50 }],
    evaluators: [{ id: "e", name: "E", weight: -5 }],
    ratings: { e: { a: { c: { score: 42 } }, zz: { c: { score: 1 } } } },
    pairwise: { "c|c": 3, "c|x": 2 },
  };
  const a = sanitizeAnalysis(raw)!;
  assert.equal(a.settings.scale, 10);
  assert.equal(a.settings.weighting, "points");
  assert.equal(a.alternatives.length, 2);
  assert.equal(a.alternatives[1].excluded, false);
  assert.equal(a.criteria[0].points, 5);
  assert.equal(a.criteria[0].categoryId, "other");
  assert.equal(a.criteria[0].minScore, 10);
  assert.equal(a.evaluators[0].weight, 0);
  assert.equal(a.ratings.e.a.c.score, 10);
  assert.equal(a.ratings.e.zz, undefined);
  assert.equal(Object.keys(a.pairwise).length, 1);
  assert.equal(sanitizeAnalysis("nope"), null);
});

test("Prozent aus Punkten ergibt genau 100", () => {
  const cs = [createCriterion({ points: 1 }), createCriterion({ points: 1 }), createCriterion({ points: 1 })];
  const out = percentFromPoints(cs);
  assert.equal(out.reduce((s, c) => s + c.percent, 0), 100);
});

test("Schrittprüfung", () => {
  const a = fixture();
  assert.equal(isStepComplete(a, "decision"), true);
  assert.equal(isStepComplete(a, "alternatives"), true);
  assert.equal(isStepComplete(a, "evaluation"), true);
  a.settings.weighting = "percent";
  a.criteria[0].percent = 10;
  assert.equal(isStepComplete(a, "weighting"), false);
});
