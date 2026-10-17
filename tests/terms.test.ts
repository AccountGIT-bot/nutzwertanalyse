import { test } from "node:test";
import assert from "node:assert/strict";
import { termsDe } from "../lib/legal/terms-de";
import { termsEn } from "../lib/legal/terms-en";
import type { TermsDoc } from "../lib/legal/terms";

const shape = (d: TermsDoc) => ({
  version: d.version,
  date: d.date,
  clauses: d.clauses.map((c) => ({ n: c.n, tags: c.tags, items: c.items.map((i) => [i.n, i.list?.length ?? 0]), basis: Boolean(c.basis) })),
  summary: d.summary.map((s) => [s.tag, s.refs]),
  history: d.history.map((h) => [h.version, h.date, h.changes.length]),
  archive: d.archive.map((a) => a.version),
});

test("Nutzungsbedingungen: Übersetzung hat dieselbe Struktur wie die verbindliche deutsche Fassung", () => {
  assert.deepEqual(shape(termsEn), shape(termsDe));
});

for (const doc of [termsDe, termsEn]) {
  test(`Nutzungsbedingungen (${doc.title}): Nummern, Verweise und Fassungen sind konsistent`, () => {
    doc.clauses.forEach((c, i) => {
      assert.equal(c.n, i + 1, "Klauseln fortlaufend nummeriert");
      c.items.forEach((it, j) => assert.equal(it.n, `${c.n}.${j + 1}`, "Unterziffern fortlaufend"));
      assert.ok(c.tags.length > 0 && c.short.trim().length > 0, "jede Klausel hat Markierung und Kurzfassung");
    });
    const numbers = new Set(doc.clauses.map((c) => c.n));
    for (const s of doc.summary) for (const r of s.refs) assert.ok(numbers.has(r), `Übersicht verweist auf bestehende Ziffer ${r}`);
    // Querverweise im Text («Ziff. 9.3» / «section 9.3») müssen existieren
    const items = new Set(doc.clauses.flatMap((c) => c.items.map((i) => i.n)));
    const all = doc.clauses.flatMap((c) => c.items.flatMap((i) => [i.text, ...(i.list ?? [])])).join(" ");
    for (const m of all.matchAll(/(?:Ziff\.|sections?)\s+(\d+\.\d+)(?:\s+(?:und|and)\s+(\d+\.\d+))?/g)) {
      for (const ref of [m[1], m[2]].filter(Boolean)) assert.ok(items.has(ref!), `Querverweis ${ref} existiert`);
    }
    assert.equal(doc.history[0].version, doc.version, "aktuelle Fassung steht zuoberst in der Historie");
    for (const a of doc.archive) assert.ok(a.version < doc.version && a.blocks.length > 0, "archivierte Fassungen sind älter und vollständig");
  });
}
