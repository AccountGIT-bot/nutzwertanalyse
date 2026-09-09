import type { AnalysisState, ReportConfig } from "./types";
import { getRecommendation } from "./calculate";

export function escapeHTML(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
const xml = (value: unknown) =>
  escapeHTML(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "–");
export function generateReportHTML(
  state: AnalysisState,
  config: ReportConfig,
): string {
  const { decision, criteria, alternatives, results } = state;
  const recommendation = getRecommendation(results, alternatives);
  const table = (head: string[], rows: unknown[][]) =>
    `<div class="table-wrap"><table><thead><tr>${head.map((h) => `<th>${escapeHTML(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((c) => `<td>${escapeHTML(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const section = (title: string, body: string) =>
    `<section><h2>${escapeHTML(title)}</h2>${body}</section>`;
  let body = `<header><p class="brand">DecisionStudio / ENTSCHEIDUNGSBERICHT</p><h1>${escapeHTML(decision.title)}</h1><p>${escapeHTML(decision.description)}</p><p class="meta">${escapeHTML(decision.packageLevel.toUpperCase())} · ${escapeHTML(new Date().toLocaleDateString("de-CH"))} · ${alternatives.length} Alternativen · ${criteria.length} Kriterien</p></header>`;
  if (decision.constraints)
    body += section(
      "Rahmenbedingungen",
      `<p>${escapeHTML(decision.constraints)}</p>`,
    );
  if (config.includeExecutiveSummary)
    body += section(
      "Ergebnis",
      `<div class="recommendation"><h3>${escapeHTML(recommendation.recommended?.name || "Kein eindeutiger Favorit")}</h3><p>${escapeHTML(recommendation.reasoning)}</p></div>` +
        table(
          ["Rang", "Alternative", "Nutzwert / 10", "Status"],
          results.map((r) => [
            r.excluded ? "–" : r.rank,
            alternatives.find((a) => a.id === r.alternativeId)?.name,
            fmt(r.totalScore),
            r.excluded ? "Durch K.O.-Kriterium ausgeschlossen" : "Zulässig",
          ]),
        ),
    );
  if (config.includeDetailedAnalysis) {
    body += section(
      "Kriterien und Gewichtung",
      table(
        ["Kriterium", "Gewicht (%)", "Definition", "K.O.-Schwelle"],
        criteria.map((c) => [
          c.name,
          fmt(c.weight * 100),
          c.description || "",
          c.isKnockout ? c.minThreshold : "–",
        ]),
      ),
    );
    body += section(
      "Bewertungen",
      table(
        ["Kriterium", ...alternatives.map((a) => a.name)],
        criteria.map((c) => [
          c.name,
          ...alternatives.map((a) =>
            fmt(
              results
                .find((r) => r.alternativeId === a.id)
                ?.criteriaScores.find((s) => s.criterionId === c.id)
                ?.rawScore || 0,
            ),
          ),
        ]),
      ),
    );
    const notes = state.ratings.filter((r) => r.comment);
    if (notes.length)
      body += section(
        "Begründungen",
        table(
          ["Alternative", "Kriterium", "Person", "Notiz"],
          notes.map((r) => [
            alternatives.find((a) => a.id === r.alternativeId)?.name,
            criteria.find((c) => c.id === r.criterionId)?.name,
            state.evaluators.find((e) => e.id === r.evaluatorId)?.name ||
              "Einzelbewertung",
            r.comment,
          ]),
        ),
      );
  }
  if (config.includeSensitivityAnalysis && state.sensitivityResults.length)
    body += section(
      "Sensitivität",
      `<p>Ein Gewicht wird verändert, die übrigen werden proportional angepasst. Angegeben ist der nächste Gleichstand mit einer anderen zulässigen Alternative.</p>` +
        table(
          [
            "Kriterium",
            "Ausgangsgewicht (%)",
            "Gewicht beim nächsten Gleichstand (%)",
          ],
          state.sensitivityResults.map((s) => [
            criteria.find((c) => c.id === s.criterionId)?.name,
            fmt(s.originalWeight * 100),
            s.criticalWeight === null
              ? "Kein Wechsel zwischen 0 und 100 %"
              : fmt(s.criticalWeight * 100),
          ]),
        ),
    );
  if (config.includeRiskAssessment)
    body += section(
      "Risiken",
      state.risks.length
        ? table(
            [
              "Alternative",
              "Risiko",
              "Wahrscheinlichkeit (%)",
              "Auswirkung / 10",
              "Massnahme",
            ],
            state.risks.map((r) => [
              alternatives.find((a) => a.id === r.alternativeId)?.name,
              r.description,
              fmt(r.probability * 100),
              r.impact,
              r.mitigation || "–",
            ]),
          )
        : `<p>Keine Risiken erfasst. Das bedeutet nicht, dass keine Risiken bestehen.</p>`,
    );
  if (config.includeAuditTrail) {
    body += section(
      "Dokumentation",
      table(
        ["Kriterium", "Begründung", "Quelle"],
        criteria.map((c) => [c.name, c.rationale || "–", c.source || "–"]),
      ),
    );
    if (state.evaluators.length)
      body += section(
        "Bewertende",
        table(
          ["Name", "Rolle", "Personengewicht"],
          state.evaluators.map((e) => [e.name, e.role || "–", e.weight ?? 1]),
        ),
      );
    body += `<p class="meta">Erstellt: ${escapeHTML(new Date(decision.createdAt).toLocaleString("de-CH"))} · Zuletzt geändert: ${escapeHTML(new Date(decision.updatedAt).toLocaleString("de-CH"))}. Diese Dokumentation ist kein unveränderbarer Audit-Trail.</p>`;
  }
  if (config.includeMethodologyNotes)
    body += section(
      "Methodik",
      `<p>Gewichtete Nutzwertanalyse: Summe aus Kriteriengewicht × Bewertung. Die Gewichte ergeben 100 %. Bewertungsskala: 1 bis 10, höhere Werte bedeuten eine bessere Eignung. Bei mehreren Bewertenden wird zunächst ihr gewichteter Mittelwert pro Kriterium gebildet. Dieser Mittelwert gilt auch für K.O.-Kriterien. Ausgeschlossene Alternativen erhalten keinen Rang. Risikowerte werden separat ausgewiesen.</p>`,
    );
  if (state.ahpConsistency)
    body += section(
      "AHP-Konsistenz",
      `<p>CR = ${fmt(state.ahpConsistency.consistencyRatio * 100)} %. ${escapeHTML(state.ahpConsistency.message)}</p>`,
    );
  return `<!doctype html><html lang="de-CH"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escapeHTML(decision.title)} – DecisionStudio</title><style>*{box-sizing:border-box}body{font:14px/1.6 Arial,sans-serif;color:#12362e;background:white;margin:0 auto;padding:32px;max-width:1100px}header{border-bottom:3px solid #00736a;margin-bottom:24px}h1{font-size:29px;line-height:1.2;overflow-wrap:anywhere}h2{font-size:19px;margin-top:30px}h3{font-size:19px;margin:0}p{white-space:pre-wrap;overflow-wrap:anywhere}.brand{font-size:12px;letter-spacing:2px}.meta{font-size:11px;color:#526f62}.recommendation{background:#e7f2eb;border-left:5px solid #00736a;padding:20px}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;font-size:12px;margin-top:14px}th,td{text-align:left;vertical-align:top;padding:10px;border-bottom:1px solid #c4d9ce;overflow-wrap:anywhere;white-space:pre-wrap}th{background:#edf4ef}footer{margin-top:35px;border-top:1px solid #c4d9ce;padding-top:15px;font-size:11px}@page{size:A4 landscape;margin:15mm}@media print{body{padding:0;max-width:none}.table-wrap{overflow:visible}thead{display:table-header-group}tr{break-inside:avoid}h2{break-after:avoid}table{font-size:10px}th,td{padding:6px}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body>${body}<footer>DecisionStudio · Die Analyse unterstützt eine menschliche Entscheidung. Prüfe Eingaben, Gewichtungen und Ergebnisse. Eigene Inhalte verbleiben bei den Nutzenden.</footer></body></html>`;
}

type Cell = string | number | null | undefined;
export function workbookRows(
  state: AnalysisState,
): { name: string; rows: Cell[][] }[] {
  const { decision, alternatives, criteria, results } = state;
  return [
    {
      name: "Überblick",
      rows: [
        ["DecisionStudio", "Entscheidungsdokumentation"],
        ["Entscheidung", decision.title],
        ["Beschreibung", decision.description],
        ["Rahmenbedingungen", decision.constraints],
        ["Umfang", decision.packageLevel],
        ["Gewichtungsmethode", state.weightingMethod],
        ["Erstellt", new Date(decision.createdAt).toLocaleString("de-CH")],
        ["Geändert", new Date(decision.updatedAt).toLocaleString("de-CH")],
        ["Ergebnis", getRecommendation(results, alternatives).reasoning],
        [
          "Berechnung",
          "Summe aus Gewicht × Bewertung; Skala 1–10. Risiken werden separat ausgewiesen.",
        ],
      ],
    },
    {
      name: "Alternativen",
      rows: [
        ["Alternative", "Beschreibung", "Annahmen"],
        ...alternatives.map((a) => [
          a.name,
          a.description,
          a.assumptions?.join("; "),
        ]),
      ],
    },
    {
      name: "Kriterien",
      rows: [
        [
          "Kriterium",
          "Beschreibung",
          "Rohgewicht",
          "Gewicht (%)",
          "K.O.-Schwelle",
          "Begründung",
          "Quelle",
        ],
        ...criteria.map((c) => [
          c.name,
          c.description,
          c.rawWeight,
          c.weight * 100,
          c.isKnockout ? c.minThreshold : null,
          c.rationale,
          c.source,
        ]),
      ],
    },
    {
      name: "Bewertungen",
      rows: [
        [
          "Alternative",
          "Kriterium",
          "Bewertung (1–10)",
          "Bewertende Person",
          "Personengewicht",
          "Kommentar",
        ],
        ...state.ratings.map((r) => [
          alternatives.find((a) => a.id === r.alternativeId)?.name,
          criteria.find((c) => c.id === r.criterionId)?.name,
          r.score,
          state.evaluators.find((e) => e.id === r.evaluatorId)?.name ||
            "Einzelbewertung",
          state.evaluators.find((e) => e.id === r.evaluatorId)?.weight ?? 1,
          r.comment,
        ]),
      ],
    },
    {
      name: "Rangliste",
      rows: [
        [
          "Rang",
          "Alternative",
          "Nutzwert (1–10)",
          "Anteil an 10 Punkten (%)",
          "K.O.",
          "Risikowert",
        ],
        ...results.map((r) => [
          r.excluded ? null : r.rank,
          alternatives.find((a) => a.id === r.alternativeId)?.name,
          r.totalScore,
          r.normalizedScore,
          r.excluded ? "Ja" : "Nein",
          r.riskScore,
        ]),
      ],
    },
    {
      name: "Sensitivität",
      rows: [
        ["Kriterium", "Ausgangsgewicht (%)", "Nächster Gleichstand (%)"],
        ...state.sensitivityResults.map((s) => [
          criteria.find((c) => c.id === s.criterionId)?.name,
          s.originalWeight * 100,
          s.criticalWeight === null ? "Kein Wechsel" : s.criticalWeight * 100,
        ]),
      ],
    },
    {
      name: "Risiken",
      rows: [
        [
          "Alternative",
          "Risiko",
          "Wahrscheinlichkeit (%)",
          "Auswirkung (1–10)",
          "Risikowert",
          "Massnahme",
        ],
        ...state.risks.map((r) => [
          alternatives.find((a) => a.id === r.alternativeId)?.name,
          r.description,
          r.probability * 100,
          r.impact,
          r.probability * r.impact,
          r.mitigation,
        ]),
      ],
    },
    {
      name: "Paarvergleiche",
      rows: [
        ["Kriterium 1", "Kriterium 2", "Verhältnis"],
        ...state.ahpComparisons.map((c) => [
          criteria.find((x) => x.id === c.criterionId1)?.name,
          criteria.find((x) => x.id === c.criterionId2)?.name,
          c.value,
        ]),
        [],
        ["Konsistenzverhältnis", state.ahpConsistency?.consistencyRatio],
      ],
    },
  ];
}
function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(
  files: { name: string; content: string }[],
): Uint8Array<ArrayBuffer> {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const directory: Uint8Array[] = [];
  let offset = 0;
  for (const f of files) {
    const name = encoder.encode(f.name),
      data = encoder.encode(f.content),
      crc = crc32(data);
    const local = new Uint8Array(30 + name.length);
    const v = new DataView(local.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);
    v.setUint16(6, 0x800, true);
    v.setUint16(12, 33, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, data.length, true);
    v.setUint32(22, data.length, true);
    v.setUint16(26, name.length, true);
    local.set(name, 30);
    chunks.push(local, data);
    const central = new Uint8Array(46 + name.length);
    const c = new DataView(central.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x800, true);
    c.setUint16(14, 33, true);
    c.setUint32(16, crc, true);
    c.setUint32(20, data.length, true);
    c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.set(name, 46);
    directory.push(central);
    offset += local.length + data.length;
  }
  const length = directory.reduce((n, b) => n + b.length, 0);
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true);
  e.setUint16(10, files.length, true);
  e.setUint32(12, length, true);
  e.setUint32(16, offset, true);
  const output = new Uint8Array(offset + length + end.length);
  let pos = 0;
  for (const chunk of [...chunks, ...directory, end]) {
    output.set(chunk, pos);
    pos += chunk.length;
  }
  return output;
}
export function generateXlsx(state: AnalysisState): Uint8Array<ArrayBuffer> {
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    rel = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const sheets = workbookRows(state);
  const col = (i: number) => {
    let s = "";
    for (let n = i + 1; n; n = Math.floor((n - 1) / 26))
      s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
    return s;
  };
  const files = [
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    },
    {
      name: "xl/workbook.xml",
      content: `<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>${sheets.map((s, i) => `<sheet name="${xml(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
    },
    {
      name: "xl/_rels/workbook.xml.rels",
      content: `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${rel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}<Relationship Id="styles" Type="${rel}/styles" Target="styles.xml"/></Relationships>`,
    },
    {
      name: "xl/styles.xml",
      content: `<styleSheet xmlns="${ns}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF00736A"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="center"/></xf><xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    },
    ...sheets.map((sheet, i) => ({
      name: `xl/worksheets/sheet${i + 1}.xml`,
      content: `<worksheet xmlns="${ns}"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${Array.from({ length: Math.max(...sheet.rows.map((r) => r.length)) }, (_, n) => `<col min="${n + 1}" max="${n + 1}" width="${n === 0 ? 28 : 38}" customWidth="1"/>`).join("")}</cols><sheetData>${sheet.rows.map((row, r) => `<row r="${r + 1}"${r === 0 ? ' ht="32" customHeight="1"' : ""}>${row.map((v, c) => (typeof v === "number" ? `<c r="${col(c)}${r + 1}" s="${r === 0 ? 1 : 2}"><v>${Number.isFinite(v) ? v : 0}</v></c>` : `<c r="${col(c)}${r + 1}" t="inlineStr" s="${r === 0 ? 1 : 0}"><is><t xml:space="preserve">${xml(v ?? "")}</t></is></c>`)).join("")}</row>`).join("")}</sheetData><pageMargins left="0.3" right="0.3" top="0.5" bottom="0.5" header="0.2" footer="0.2"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>`,
    })),
  ];
  return zip(files);
}
