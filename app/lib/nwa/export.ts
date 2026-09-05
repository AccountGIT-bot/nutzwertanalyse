/**
 * Export- und Importfunktionen für Analysen.
 *
 * Der JSON-Export dient zugleich der Datenherausgabe und -übertragung nach
 * Art. 28 DSG bzw. Art. 20 DSGVO: Er enthält sämtliche von der Nutzerin oder
 * dem Nutzer eingegebenen Daten in einem gängigen, maschinenlesbaren Format.
 */

import type { AnalysisState, NwaResult } from "./types";

export const EXPORT_FORMAT_VERSION = 1;

export interface AnalysisExport {
  format: "nutzwertanalyse.com";
  formatVersion: number;
  exportedAt: string;
  analysis: AnalysisState;
}

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

/** Erzeugt einen dateisystemtauglichen Namen aus dem Analysetitel. */
export function buildFileName(title: string, extension: string): string {
  const base =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "Nutzwertanalyse";
  const date = new Date().toISOString().slice(0, 10);
  return `Nutzwertanalyse_${base}_${date}.${extension}`;
}

/** Löst einen Download im Browser aus. */
export function downloadFile(content: string, fileName: string, mimeType: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Freigabe erst nach dem Start des Downloads.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Maskiert einen Wert für CSV (RFC 4180). */
function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function csvRow(cells: unknown[]): string {
  return cells.map(csvCell).join(";");
}

function formatNumber(value: number, digits = 2): string {
  return value.toFixed(digits).replace(".", ",");
}

/* ------------------------------------------------------------------ */
/* JSON                                                                */
/* ------------------------------------------------------------------ */

export function toJson(state: AnalysisState): string {
  const payload: AnalysisExport = {
    format: "nutzwertanalyse.com",
    formatVersion: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    analysis: state,
  };
  return JSON.stringify(payload, null, 2);
}

export interface ImportResult {
  ok: boolean;
  state?: AnalysisState;
  error?: string;
}

/**
 * Liest eine zuvor exportierte Analyse ein und prüft die Struktur.
 * Akzeptiert sowohl das Exportformat als auch einen rohen AnalysisState.
 */
export function fromJson(raw: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "Die Datei enthält kein gültiges JSON." };
  }

  if (!parsed || typeof parsed !== "object") {
    return { ok: false, error: "Die Datei hat kein erwartetes Format." };
  }

  const container = parsed as Partial<AnalysisExport> & Partial<AnalysisState>;
  const candidate = (container.analysis ?? container) as Partial<AnalysisState>;

  if (
    !candidate.decision ||
    typeof candidate.decision !== "object" ||
    !Array.isArray(candidate.alternatives) ||
    !Array.isArray(candidate.criteria) ||
    !Array.isArray(candidate.ratings)
  ) {
    return {
      ok: false,
      error: "Die Datei enthält keine vollständige Analyse (Entscheidung, Alternativen, Kriterien).",
    };
  }

  if (
    typeof container.formatVersion === "number" &&
    container.formatVersion > EXPORT_FORMAT_VERSION
  ) {
    return {
      ok: false,
      error: "Die Datei wurde mit einer neueren Version erstellt und kann nicht gelesen werden.",
    };
  }

  // Fehlende optionale Felder auffüllen, damit der Reducer stabil bleibt.
  const state: AnalysisState = {
    decision: {
      ...candidate.decision,
      createdAt: new Date(candidate.decision.createdAt ?? Date.now()),
      updatedAt: new Date(candidate.decision.updatedAt ?? Date.now()),
    },
    alternatives: candidate.alternatives,
    categories: candidate.categories ?? [],
    criteria: candidate.criteria,
    ratings: candidate.ratings,
    risks: candidate.risks ?? [],
    evaluators: candidate.evaluators ?? [],
    ahpComparisons: candidate.ahpComparisons ?? [],
    weightingMethod: candidate.weightingMethod ?? "simple",
    results: candidate.results ?? [],
    sensitivityResults: candidate.sensitivityResults ?? [],
    ahpConsistency: candidate.ahpConsistency,
    currentStep: candidate.currentStep ?? "decision",
  } as AnalysisState;

  return { ok: true, state };
}

/* ------------------------------------------------------------------ */
/* CSV                                                                 */
/* ------------------------------------------------------------------ */

/**
 * Erzeugt eine CSV-Datei mit Bewertungsmatrix, Gewichten und Rangliste.
 * Trennzeichen ist das Semikolon – so öffnet Excel in der Schweiz die Datei
 * direkt in Spalten. Ein BOM sorgt für korrekte Umlaute.
 */
export function toCsv(state: AnalysisState): string {
  const { decision, alternatives, criteria, ratings, results } = state;
  const lines: string[] = [];

  lines.push(csvRow(["Nutzwertanalyse"]));
  lines.push(csvRow(["Titel", decision.title]));
  if (decision.description) lines.push(csvRow(["Beschreibung", decision.description]));
  lines.push(csvRow(["Paket", decision.packageLevel]));
  lines.push(csvRow(["Gewichtungsmethode", state.weightingMethod]));
  lines.push(csvRow(["Exportiert am", new Date().toLocaleString("de-CH")]));
  lines.push("");

  // Bewertungsmatrix
  lines.push(csvRow(["Bewertungsmatrix (Punkte 1-10)"]));
  lines.push(
    csvRow([
      "Kriterium",
      "Gewicht (%)",
      ...alternatives.map((alternative) => alternative.name),
    ])
  );

  for (const criterion of criteria) {
    const cells = alternatives.map((alternative) => {
      const rating = ratings.find(
        (entry) => entry.alternativeId === alternative.id && entry.criterionId === criterion.id
      );
      return rating ? formatNumber(rating.score, 1) : "";
    });
    lines.push(csvRow([criterion.name, formatNumber(criterion.weight * 100, 1), ...cells]));
  }
  lines.push("");

  // Gewichtete Teilnutzen
  lines.push(csvRow(["Gewichtete Teilnutzen"]));
  lines.push(csvRow(["Kriterium", ...alternatives.map((alternative) => alternative.name)]));
  for (const criterion of criteria) {
    const cells = alternatives.map((alternative) => {
      const result = results.find((entry) => entry.alternativeId === alternative.id);
      const score = result?.criteriaScores.find((entry) => entry.criterionId === criterion.id);
      return score ? formatNumber(score.weightedScore) : "";
    });
    lines.push(csvRow([criterion.name, ...cells]));
  }
  lines.push("");

  // Rangliste
  lines.push(csvRow(["Ergebnis"]));
  lines.push(csvRow(["Rang", "Alternative", "Nutzwert", "Erfüllungsgrad (%)"]));
  const ranked = [...results].sort((a, b) => a.rank - b.rank);
  for (const result of ranked) {
    const alternative = alternatives.find((entry) => entry.id === result.alternativeId);
    lines.push(
      csvRow([
        result.rank,
        alternative?.name ?? result.alternativeId,
        formatNumber(result.totalScore),
        formatNumber(result.normalizedScore, 1),
      ])
    );
  }

  // Sensitivität
  if (state.sensitivityResults.length > 0) {
    lines.push("");
    lines.push(csvRow(["Sensitivitätsanalyse"]));
    lines.push(csvRow(["Kriterium", "Gewicht (%)", "Kritisches Gewicht (%)", "Einfluss"]));
    for (const sensitivity of state.sensitivityResults) {
      const criterion = criteria.find((entry) => entry.id === sensitivity.criterionId);
      lines.push(
        csvRow([
          criterion?.name ?? sensitivity.criterionId,
          formatNumber(sensitivity.originalWeight * 100, 1),
          sensitivity.criticalWeight >= 0
            ? formatNumber(sensitivity.criticalWeight * 100, 1)
            : "nicht kippbar",
          sensitivity.impactOnRanking,
        ])
      );
    }
  }

  // BOM für Excel
  return `\uFEFF${lines.join("\r\n")}`;
}

/* ------------------------------------------------------------------ */
/* Markdown                                                            */
/* ------------------------------------------------------------------ */

export function toMarkdown(state: AnalysisState): string {
  const { decision, alternatives, criteria, ratings, results } = state;
  const ranked = [...results].sort((a, b) => a.rank - b.rank);
  const winner = ranked[0]
    ? alternatives.find((entry) => entry.id === ranked[0].alternativeId)
    : undefined;

  const lines: string[] = [];
  lines.push(`# Nutzwertanalyse: ${decision.title || "Ohne Titel"}`);
  lines.push("");
  if (decision.description) {
    lines.push(decision.description);
    lines.push("");
  }
  lines.push(`_Erstellt am ${new Date().toLocaleDateString("de-CH")} mit Nutzwertanalyse.com_`);
  lines.push("");

  if (winner && ranked[0]) {
    lines.push("## Empfehlung");
    lines.push("");
    lines.push(
      `**${winner.name}** erreicht mit ${ranked[0].totalScore.toFixed(2)} Punkten ` +
        `(${ranked[0].normalizedScore.toFixed(1)} % Erfüllungsgrad) den höchsten Nutzwert.`
    );
    if (ranked[1]) {
      const runnerUp = alternatives.find((entry) => entry.id === ranked[1].alternativeId);
      const gap = ranked[0].normalizedScore - ranked[1].normalizedScore;
      lines.push("");
      lines.push(
        `Der Vorsprung gegenüber ${runnerUp?.name ?? "der zweitplatzierten Alternative"} ` +
          `beträgt ${gap.toFixed(1)} Prozentpunkte.`
      );
    }
    lines.push("");
  }

  lines.push("## Rangliste");
  lines.push("");
  lines.push("| Rang | Alternative | Nutzwert | Erfüllungsgrad |");
  lines.push("| ---: | --- | ---: | ---: |");
  for (const result of ranked) {
    const alternative = alternatives.find((entry) => entry.id === result.alternativeId);
    lines.push(
      `| ${result.rank} | ${alternative?.name ?? "–"} | ${result.totalScore.toFixed(2)} | ` +
        `${result.normalizedScore.toFixed(1)} % |`
    );
  }
  lines.push("");

  lines.push("## Kriterien und Gewichtung");
  lines.push("");
  lines.push("| Kriterium | Gewicht | Beschreibung |");
  lines.push("| --- | ---: | --- |");
  for (const criterion of criteria) {
    lines.push(
      `| ${criterion.name} | ${(criterion.weight * 100).toFixed(1)} % | ${criterion.description ?? ""} |`
    );
  }
  lines.push("");

  lines.push("## Bewertungsmatrix");
  lines.push("");
  lines.push(`| Kriterium | ${alternatives.map((entry) => entry.name).join(" | ")} |`);
  lines.push(`| --- | ${alternatives.map(() => "---:").join(" | ")} |`);
  for (const criterion of criteria) {
    const cells = alternatives.map((alternative) => {
      const rating = ratings.find(
        (entry) => entry.alternativeId === alternative.id && entry.criterionId === criterion.id
      );
      return rating ? rating.score.toFixed(1) : "–";
    });
    lines.push(`| ${criterion.name} | ${cells.join(" | ")} |`);
  }
  lines.push("");

  lines.push("## Methodik");
  lines.push("");
  lines.push(
    "Der Nutzwert einer Alternative ergibt sich als Summe der mit dem jeweiligen " +
      "Kriteriengewicht multiplizierten Einzelbewertungen. Die Gewichte sind auf 100 % " +
      "normiert, die Bewertungen erfolgen auf einer Skala von 1 bis 10."
  );
  lines.push("");
  lines.push(
    "> Die Ergebnisse beruhen vollständig auf den eingegebenen Kriterien, Gewichten und " +
      "Bewertungen. Sie stellen keine Rechts-, Steuer- oder Finanzberatung dar."
  );

  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Zusammenfassung für die Zwischenablage                              */
/* ------------------------------------------------------------------ */

export function toSummaryText(state: AnalysisState): string {
  const ranked = [...state.results].sort((a, b) => a.rank - b.rank);
  const nameOf = (result: NwaResult) =>
    state.alternatives.find((entry) => entry.id === result.alternativeId)?.name ?? "–";

  const lines = [
    `Nutzwertanalyse: ${state.decision.title || "Ohne Titel"}`,
    "",
    ...ranked.map(
      (result) =>
        `${result.rank}. ${nameOf(result)} – ${result.totalScore.toFixed(2)} Punkte ` +
        `(${result.normalizedScore.toFixed(1)} %)`
    ),
    "",
    `Kriterien: ${state.criteria.length} · Alternativen: ${state.alternatives.length}`,
    `Erstellt mit Nutzwertanalyse.com am ${new Date().toLocaleDateString("de-CH")}`,
  ];
  return lines.join("\n");
}
