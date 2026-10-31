import { test } from "node:test";
import assert from "node:assert/strict";
import { computeResults, measureScore, robustness, sensitivity, violatesLimit } from "../lib/nwa/calc";
import { createAlternative, createAnalysis, createCriterion, DEFAULT_EVALUATOR_ID, sanitizeAnalysis } from "../lib/nwa/factory";
import { analysisFromPreset } from "../lib/nwa/presets";
import { PRESET_IDS } from "../lib/nwa/parser";
import { de } from "../lib/i18n/de";
import { en } from "../lib/i18n/en";
import { fr } from "../lib/i18n/fr";
import { it as itLang } from "../lib/i18n/it";
import type { Analysis } from "../lib/nwa/types";

function base(names: string[], crits = 2): Analysis {
  const a = createAnalysis({ title: "T" });
  a.alternatives = names.map((n) => createAlternative(n));
  a.criteria = Array.from({ length: crits }, (_, i) => createCriterion({ name: `K${i}`, points: 3 }));
  a.ratings[DEFAULT_EVALUATOR_ID] = {};
  return a;
}
function rate(a: Analysis, scores: number[][]) {
  a.alternatives.forEach((alt, i) => {
    a.ratings[DEFAULT_EVALUATOR_ID][alt.id] = {};
    a.criteria.forEach((c, j) => {
      if (c.measure) return;
      a.ratings[DEFAULT_EVALUATOR_ID][alt.id][c.id] = { score: scores[i][j] };
    });
  });
}

test("Gleichstand: gleicher Rang, Konfidenz tie, alle Gleichplatzierten genannt", () => {
  const a = base(["A", "B", "C"]);
  rate(a, [[8, 6], [8, 6], [5, 5]]);
  const r = computeResults(a);
  assert.equal(r.recommendation.confidence, "tie");
  assert.equal(r.recommendation.tiedIds.length, 2);
  assert.deepEqual(r.ranking.map((x) => x.rank), [1, 1, 3]);
});

test("Nur eine gültige Alternative: Konfidenz single statt high", () => {
  const a = base(["A", "B"]);
  rate(a, [[8, 8], [3, 3]]);
  a.alternatives[1].excluded = true;
  assert.equal(computeResults(a).recommendation.confidence, "single");
});

test("K.-o.-Hinweis: ausgeschiedene Alternative mit höherem Nutzwert wird gemeldet", () => {
  const a = base(["A", "B"]);
  a.criteria[0].isKnockout = true;
  a.criteria[0].minScore = 6;
  rate(a, [[5, 10], [6, 4]]);
  const r = computeResults(a);
  assert.equal(r.recommendation.winnerId, a.alternatives[1].id);
  assert.equal(r.recommendation.koLeaderId, a.alternatives[0].id);
});

test("Messwert ohne Grenzen, positive Werte: Punkte im Verhältnis zum besten Wert", () => {
  const a = base(["A", "B"], 1);
  a.criteria[0].measure = { unit: "CHF", direction: "lower" };
  a.measures = { [a.alternatives[0].id]: { [a.criteria[0].id]: 100000 }, [a.alternatives[1].id]: { [a.criteria[0].id]: 101000 } };
  assert.equal(measureScore(a, a.criteria[0], 100000), 10);
  assert.equal(measureScore(a, a.criteria[0], 101000), 9.9);
  a.criteria[0].measure = { unit: "%", direction: "higher" };
  assert.equal(measureScore(a, a.criteria[0], 101000), 10);
});

test("Messwert mit Grenzen: linear, ausserhalb begrenzt; mit Nullwerten linear min–max", () => {
  const a = base(["A", "B"], 1);
  a.settings.scale = 10;
  a.criteria[0].measure = { unit: "Tage", direction: "lower", worst: 30, best: 10 };
  assert.equal(measureScore(a, a.criteria[0], 10), 10);
  assert.equal(measureScore(a, a.criteria[0], 30), 1);
  assert.equal(measureScore(a, a.criteria[0], 20), 5.5);
  assert.equal(measureScore(a, a.criteria[0], 50), 1);
  a.criteria[0].measure = { unit: "%", direction: "higher" };
  a.measures = { [a.alternatives[0].id]: { [a.criteria[0].id]: -2 }, [a.alternatives[1].id]: { [a.criteria[0].id]: 8 } };
  assert.equal(measureScore(a, a.criteria[0], -2), 1);
  assert.equal(measureScore(a, a.criteria[0], 8), 10);
});

test("Messwert fliesst ins Ergebnis, Budget-Grenze scheidet aus", () => {
  const a = base(["Günstig", "Teuer"], 2);
  a.criteria[0].measure = { unit: "CHF", direction: "lower", limit: 400000 };
  a.criteria[0].isKnockout = true;
  a.measures = { [a.alternatives[0].id]: { [a.criteria[0].id]: 350000 }, [a.alternatives[1].id]: { [a.criteria[0].id]: 420000 } };
  rate(a, [[0, 5], [0, 9]]);
  const r = computeResults(a);
  assert.equal(r.completeness, 1);
  const teuer = r.alternatives.find((x) => x.alternativeId === a.alternatives[1].id)!;
  assert.equal(teuer.knockedOut, true);
  assert.equal(violatesLimit(a.criteria[0], 420000), true);
  assert.equal(violatesLimit(a.criteria[0], 400000), false);
  const cheap = r.alternatives.find((x) => x.alternativeId === a.alternatives[0].id)!;
  assert.equal(cheap.contributions[0].value, 350000);
  assert.ok(sensitivity(a, r).every((s) => s.flipWeight === null || (s.flipWeight >= 0 && s.flipWeight <= 1)));
  assert.equal(robustness(a, r, { runs: 50, seed: 1 }).winShare[a.alternatives[1].id], 0);
});

test("Import behält Messwert-Einstellungen und Werte, verwirft ungültige", () => {
  const a = base(["A", "B"], 1);
  a.criteria[0].measure = { unit: "CHF", direction: "lower", limit: 5 };
  a.measures = { [a.alternatives[0].id]: { [a.criteria[0].id]: 3, unbekannt: 7 } };
  const raw = JSON.parse(JSON.stringify(a));
  raw.measures[a.alternatives[1].id] = { [a.criteria[0].id]: "x" };
  const s = sanitizeAnalysis(raw)!;
  assert.deepEqual(s.criteria[0].measure, { unit: "CHF", direction: "lower", worst: undefined, best: undefined, limit: 5 });
  assert.deepEqual(s.measures, { [a.alternatives[0].id]: { [a.criteria[0].id]: 3 } });
});

test("Vorlagen: Messwert-Kriterien und Tipps in allen vier Sprachen deckungsgleich", () => {
  for (const id of PRESET_IDS) {
    const shape = (t: typeof de) => t.presets[id].criteria.map((c) => c.measure?.direction ?? "-").join(",");
    for (const t of [en, fr, itLang]) {
      assert.equal(shape(t as typeof de), shape(de), `${id}: Messwerte weichen ab`);
      assert.equal(t.presets[id].tips?.length, de.presets[id].tips?.length, `${id}: Tipps fehlen`);
    }
    const a = analysisFromPreset(de, { presetId: id, selfName: "Ich" });
    assert.equal(a.criteria.filter((c) => c.measure).length, de.presets[id].criteria.filter((c) => c.measure).length);
  }
});
