import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Versionssystem: `package.json` ist die einzige Quelle der Versionsnummer, das Änderungsprotokoll
 * führt dieselbe Nummer als obersten Eintrag, Einträge sind streng absteigend und tragen Datum und Release-PR.
 * Regeln in docs/DEVELOPMENT_WORKFLOW.md, Abschnitt «Versionierung und Releases».
 */

const root = join(import.meta.dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { version: string };
const lock = JSON.parse(readFileSync(join(root, "package-lock.json"), "utf8")) as { version: string; packages?: Record<string, { version?: string }> };
const changelog = readFileSync(join(root, "CHANGELOG.md"), "utf8");

const SEMVER = /^(\d+)\.(\d+)\.(\d+)$/;
const HEADING = /^## (\d+\.\d+\.\d+) – (\d{2})\.(\d{2})\.(\d{4})$/;

function parseEntries() {
  const lines = changelog.split("\n");
  const entries: { version: string; date: string; body: string[]; line: number }[] = [];
  let unreleased = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("## ")) {
      if (entries.length) entries[entries.length - 1].body.push(line);
      continue;
    }
    if (line === "## Unveröffentlicht") {
      assert.equal(entries.length, 0, "«Unveröffentlicht» steht nur ganz oben");
      unreleased = true;
      continue;
    }
    const m = HEADING.exec(line);
    assert.ok(m, `Überschrift nicht im Format «## X.Y.Z – TT.MM.JJJJ» (Zeile ${i + 1}): ${line}`);
    entries.push({ version: m[1], date: `${m[4]}-${m[3]}-${m[2]}`, body: [], line: i + 1 });
  }
  return { entries, unreleased };
}

function compare(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

test("package.json trägt eine Version nach MAJOR.MINOR.PATCH", () => {
  assert.match(pkg.version, SEMVER);
});

test("package-lock.json führt dieselbe Version wie package.json", () => {
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages?.[""]?.version, pkg.version);
});

test("oberster Changelog-Eintrag entspricht der Paketversion", () => {
  const { entries } = parseEntries();
  assert.ok(entries.length > 0, "CHANGELOG.md enthält keinen Versionseintrag");
  assert.equal(entries[0].version, pkg.version, `CHANGELOG.md beginnt mit ${entries[0].version}, package.json steht auf ${pkg.version}`);
});

test("Changelog-Versionen sind streng absteigend und eindeutig", () => {
  const { entries } = parseEntries();
  for (let i = 1; i < entries.length; i++) {
    assert.ok(compare(entries[i - 1].version, entries[i].version) > 0, `${entries[i - 1].version} (Zeile ${entries[i - 1].line}) muss grösser sein als ${entries[i].version} (Zeile ${entries[i].line})`);
  }
});

test("jeder Changelog-Eintrag nennt ein gültiges Datum und die Release-PR", () => {
  const { entries } = parseEntries();
  for (const e of entries) {
    const d = new Date(e.date);
    assert.ok(!Number.isNaN(d.getTime()) && d.toISOString().startsWith(e.date), `ungültiges Datum bei ${e.version}`);
    const text = e.body.join("\n");
    assert.match(text, /Release-PR: \[#\d+\]\(https:\/\/github\.com\/[^)]+\/pull\/\d+\)/, `${e.version}: Zeile «Release-PR: [#n](…)» fehlt`);
    assert.ok(e.body.some((l) => l.startsWith("- ")), `${e.version}: keine Änderungen aufgeführt`);
  }
});

test("Datumsreihenfolge passt zur Versionsreihenfolge", () => {
  const { entries } = parseEntries();
  for (let i = 1; i < entries.length; i++) {
    assert.ok(entries[i - 1].date >= entries[i].date, `${entries[i - 1].version} ist älter datiert als ${entries[i].version}`);
  }
});
