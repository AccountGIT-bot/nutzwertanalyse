import { test } from "node:test";
import assert from "node:assert/strict";
import { parseInput, detectPreset, extractAlternatives } from "../lib/nwa/parser";
import { encodeShareFragment, decodeShareFragment, parseImport, toExportFile, toCsv, toMarkdown } from "../lib/nwa/serialize";
import { createAlternative, createAnalysis, createCriterion, DEFAULT_EVALUATOR_ID } from "../lib/nwa/factory";

test("Parser erkennt Vorlage und Alternativen aus Freitext", () => {
  const p = parseInput("Soll ich das Elektroauto von VW oder den Hybrid von Toyota kaufen?");
  assert.equal(p.presetId, "vehicle");
  assert.deepEqual(p.alternatives, ["Elektroauto von VW", "Hybrid von Toyota"]);
  assert.equal(p.confidence, "high");

  const q = parseInput("Welches CRM: HubSpot, Pipedrive oder Salesforce?");
  assert.equal(q.presetId, "software");
  assert.deepEqual(q.alternatives, ["HubSpot", "Pipedrive", "Salesforce"]);

  const r = parseInput("Kandidatin A oder Kandidat B für die Teamleitung?");
  assert.equal(r.presetId, "employee");
  assert.equal(r.alternatives.length, 2);
});

test("Parser liefert ohne Vergleich keine Alternativen und 'custom' ohne Schlüsselwörter", () => {
  assert.deepEqual(extractAlternatives("Lorem ipsum dolor"), []);
  assert.equal(detectPreset("Lorem ipsum dolor").presetId, "custom");
  const p = parseInput("Lorem ipsum dolor");
  assert.equal(p.confidence, "low");
});

function sample() {
  const a = createAnalysis({ title: "Roundtrip \"Test\"; mit Sonderzeichen äöü" });
  a.alternatives = [createAlternative("A"), createAlternative("B;C")];
  a.criteria = [createCriterion({ name: "Preis", points: 5 }), createCriterion({ name: "Qualität", points: 2 })];
  a.ratings[DEFAULT_EVALUATOR_ID] = {
    [a.alternatives[0].id]: { [a.criteria[0].id]: { score: 7, note: "gut" }, [a.criteria[1].id]: { score: 4 } },
    [a.alternatives[1].id]: { [a.criteria[0].id]: { score: 5 }, [a.criteria[1].id]: { score: 9 } },
  };
  return a;
}

test("Freigabe-Link: encode/decode ist verlustfrei und komprimiert", async () => {
  const a = sample();
  const frag = await encodeShareFragment(a);
  assert.ok(frag.startsWith("z.") || frag.startsWith("j."));
  const back = await decodeShareFragment("#" + frag);
  assert.ok(back);
  assert.equal(back!.title, a.title);
  assert.equal(back!.alternatives[1].name, "B;C");
  assert.equal(back!.ratings[DEFAULT_EVALUATOR_ID][a.alternatives[0].id][a.criteria[0].id].note, "gut");
  assert.equal(await decodeShareFragment("#z.not-base64!!"), null);
  assert.equal(await decodeShareFragment("garbage"), null);
});

test("JSON-Export lässt sich wieder importieren", () => {
  const a = sample();
  const file = toExportFile([a]);
  const list = parseImport(file);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, a.id);
  assert.equal(list[0].criteria.length, 2);
  assert.deepEqual(parseImport("{not json"), []);
  assert.deepEqual(parseImport("42"), []);
});

test("CSV und Markdown enthalten Kopf, Werte und maskieren Sonderzeichen", () => {
  const a = sample();
  const csv = toCsv(a, { criterion: "Kriterium", weight: "Gewicht", total: "Gesamt", rank: "Rang", category: "Kategorie" });
  assert.ok(csv.startsWith("﻿Kriterium;Kategorie;Gewicht;A;\"B;C\""));
  assert.ok(csv.includes("Preis;other;71.4;7.00;5.00"));
  const md = toMarkdown(a, {
    alternatives: "Alternative", criteria: "Kriterium", weight: "Gewicht", result: "Ergebnis", rank: "Rang", score: "Nutzwert",
    description: "Beschreibung", goal: "Ziel", constraints: "Rahmen", conclusion: "Fazit", knockedOut: "K.-o.",
  });
  assert.ok(md.includes("| 1 | A |") || md.includes("| 1 | B;C |"));
  assert.ok(md.includes("| Preis | 71.4 % |"));
});
