#!/usr/bin/env node
/**
 * Setzt annotierte Tags `vX.Y.Z` auf die im CHANGELOG.md genannten Merge-Commits (Zeile «Merge-Commit `abc1234`»)
 * und pusht sie mit `--push`. Idempotent: vorhandene Tags bleiben unberührt, Tags werden nie verschoben.
 *
 *   node scripts/release-tags.mjs          nur lokal anlegen
 *   npm run release:tags                   anlegen und nach origin pushen
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const changelog = readFileSync(new URL("../CHANGELOG.md", import.meta.url), "utf8");
const entries = [];
let current = null;
for (const line of changelog.split("\n")) {
  const heading = /^## (\d+\.\d+\.\d+) – /.exec(line);
  if (heading) {
    current = { version: heading[1], sha: null };
    entries.push(current);
    continue;
  }
  const merge = /Merge-Commit `([0-9a-f]{7,40})`/.exec(line);
  if (merge && current && !current.sha) current.sha = merge[1];
}

const sh = (cmd) => execSync(cmd, { stdio: ["ignore", "pipe", "inherit"] }).toString().trim();
sh("git fetch --quiet origin main");
const existing = new Set(sh("git tag -l").split("\n").filter(Boolean));
const tags = [];
for (const e of entries) {
  const tag = `v${e.version}`;
  if (!e.sha) {
    console.log(`${tag}: kein Merge-Commit im Changelog, übersprungen (noch nicht gemergt?)`);
    continue;
  }
  tags.push(tag);
  if (existing.has(tag)) {
    console.log(`${tag}: vorhanden`);
    continue;
  }
  const subject = sh(`git log -1 --format=%s ${e.sha}`);
  sh(`git tag -a ${tag} ${e.sha} -m ${JSON.stringify(subject)}`);
  console.log(`${tag} → ${e.sha} (${subject})`);
}
if (process.argv.includes("--push") && tags.length) {
  sh(`git push origin ${tags.join(" ")}`);
  console.log(`gepusht: ${tags.join(", ")}`);
}
