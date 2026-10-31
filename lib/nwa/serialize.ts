import { computeResults } from "./calc";
import { sanitizeAnalysis } from "./factory";
import type { Analysis } from "./types";

/* ---------------- JSON ---------------- */

export interface ExportFile {
  app: "nutzwertanalyse";
  format: "nwa-json";
  version: 2;
  exportedAt: string;
  analyses: Analysis[];
}

export function toExportFile(analyses: Analysis[]): string {
  const file: ExportFile = {
    app: "nutzwertanalyse",
    format: "nwa-json",
    version: 2,
    exportedAt: new Date().toISOString(),
    analyses,
  };
  return JSON.stringify(file, null, 2);
}

/** Liest Export-Datei oder einzelne Analyse. */
export function parseImport(text: string): Analysis[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return [];
  }
  if (typeof data !== "object" || data === null) return [];
  const o = data as Record<string, unknown>;
  const list: unknown[] = Array.isArray(o.analyses) ? o.analyses : [data];
  return list.map((x) => sanitizeAnalysis(x)).filter((x): x is Analysis => x !== null);
}

/* ---------------- CSV ---------------- */

function csvCell(v: string | number): string {
  const s = String(v);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(a: Analysis, labels: { criterion: string; weight: string; total: string; rank: string; category: string }): string {
  const res = computeResults(a);
  const alts = a.alternatives;
  const sep = ";";
  const rows: string[][] = [];
  rows.push([labels.criterion, labels.category, labels.weight, ...alts.map((x) => x.name)]);
  for (const c of a.criteria) {
    const w = res.weights[c.id] ?? 0;
    rows.push([
      c.name,
      c.categoryId,
      (w * 100).toFixed(1),
      ...alts.map((alt) => {
        const r = res.alternatives.find((x) => x.alternativeId === alt.id);
        const contrib = r?.contributions.find((x) => x.criterionId === c.id);
        return contrib?.rated ? contrib.rawScore.toFixed(2) : "";
      }),
    ]);
  }
  for (const c of a.criteria.filter((x) => x.measure)) {
    rows.push([`${c.name} [${c.measure!.unit}]`, c.categoryId, "", ...alts.map((alt) => {
      const v = a.measures?.[alt.id]?.[c.id];
      return typeof v === "number" ? String(v) : "";
    })]);
  }
  rows.push([labels.total, "", "100", ...alts.map((alt) => (res.alternatives.find((x) => x.alternativeId === alt.id)?.total ?? 0).toFixed(2))]);
  rows.push([labels.rank, "", "", ...alts.map((alt) => String(res.alternatives.find((x) => x.alternativeId === alt.id)?.rank || "-"))]);
  // BOM für Excel
  return "﻿" + rows.map((r) => r.map(csvCell).join(sep)).join("\r\n");
}

/* ---------------- Markdown ---------------- */

export function toMarkdown(
  a: Analysis,
  t: {
    alternatives: string;
    criteria: string;
    weight: string;
    result: string;
    rank: string;
    score: string;
    description: string;
    goal: string;
    constraints: string;
    conclusion: string;
    knockedOut: string;
  },
): string {
  const res = computeResults(a);
  const lines: string[] = [];
  lines.push(`# ${a.title || "Nutzwertanalyse"}`);
  lines.push("");
  if (a.description) lines.push(`**${t.description}:** ${a.description}`, "");
  if (a.goal) lines.push(`**${t.goal}:** ${a.goal}`, "");
  if (a.constraints) lines.push(`**${t.constraints}:** ${a.constraints}`, "");
  lines.push(`## ${t.result}`, "");
  lines.push(`| ${t.rank} | ${t.alternatives} | ${t.score} |`, "|---|---|---|");
  for (const r of res.alternatives.slice().sort((x, y) => (x.rank || 99) - (y.rank || 99))) {
    const alt = a.alternatives.find((x) => x.id === r.alternativeId);
    lines.push(`| ${r.rank || "–"} | ${alt?.name ?? ""}${r.knockedOut ? ` (${t.knockedOut})` : ""} | ${r.percent.toFixed(1)} % |`);
  }
  lines.push("", `## ${t.criteria}`, "");
  const header = `| ${t.criteria} | ${t.weight} | ${a.alternatives.map((x) => x.name).join(" | ")} |`;
  lines.push(header, `|${"---|".repeat(2 + a.alternatives.length)}`);
  for (const c of a.criteria) {
    const cells = a.alternatives.map((alt) => {
      const r = res.alternatives.find((x) => x.alternativeId === alt.id);
      const contrib = r?.contributions.find((x) => x.criterionId === c.id);
      return contrib?.rated ? contrib.rawScore.toFixed(1) : "–";
    });
    lines.push(`| ${c.name} | ${((res.weights[c.id] ?? 0) * 100).toFixed(1)} % | ${cells.join(" | ")} |`);
  }
  if (a.conclusion) lines.push("", `## ${t.conclusion}`, "", a.conclusion);
  lines.push("", `_${new Date().toISOString().slice(0, 10)} · nutzwertanalyse.com_`);
  return lines.join("\n");
}

/* ---------------- Freigabe-Link (URL-Fragment) ---------------- */

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function gzip(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === "undefined") return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

async function gunzip(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof DecompressionStream === "undefined") return null;
  try {
    const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

/** Reduziert die Analyse auf das Nötigste (ohne Notizen zu lange Texte zu kürzen). */
function compactForShare(a: Analysis): Analysis {
  return { ...a, updatedAt: a.updatedAt, createdAt: a.createdAt };
}

/**
 * Erzeugt das URL-Fragment (nach `#`). Das Fragment wird vom Browser NICHT an
 * den Server übertragen – die Daten bleiben auch beim Teilen rein clientseitig.
 */
export async function encodeShareFragment(a: Analysis): Promise<string> {
  const json = JSON.stringify(compactForShare(a));
  const bytes = new TextEncoder().encode(json);
  const packed = await gzip(bytes);
  if (packed && packed.length < bytes.length) return "z." + bytesToBase64Url(packed);
  return "j." + bytesToBase64Url(bytes);
}

export async function decodeShareFragment(fragment: string): Promise<Analysis | null> {
  const f = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  const m = /^(?:d=)?([zj])\.([A-Za-z0-9_-]+)$/.exec(f);
  if (!m) return null;
  try {
    const bytes = base64UrlToBytes(m[2]);
    const raw = m[1] === "z" ? await gunzip(bytes) : bytes;
    if (!raw) return null;
    const json = new TextDecoder().decode(raw);
    return sanitizeAnalysis(JSON.parse(json));
  } catch {
    return null;
  }
}
