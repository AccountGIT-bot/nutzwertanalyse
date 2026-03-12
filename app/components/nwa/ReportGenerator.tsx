"use client";

import { useState, useCallback } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getRecommendation } from "@/app/lib/nwa/calculate";
import type { AnalysisState, ReportConfig } from "@/app/lib/nwa/types";

const DEFAULT_REPORT_CONFIG: Record<string, ReportConfig> = {
  basic: {
    includeExecutiveSummary: true,
    includeDetailedAnalysis: false,
    includeSensitivityAnalysis: false,
    includeRiskAssessment: false,
    includeAuditTrail: false,
    includeMethodologyNotes: false,
  },
  advanced: {
    includeExecutiveSummary: true,
    includeDetailedAnalysis: true,
    includeSensitivityAnalysis: true,
    includeRiskAssessment: false,
    includeAuditTrail: false,
    includeMethodologyNotes: true,
  },
  business: {
    includeExecutiveSummary: true,
    includeDetailedAnalysis: true,
    includeSensitivityAnalysis: true,
    includeRiskAssessment: true,
    includeAuditTrail: true,
    includeMethodologyNotes: true,
  },
};

function generateReportHTML(state: AnalysisState, config: ReportConfig): string {
  const { decision, alternatives, criteria, results, sensitivityResults, ahpConsistency, knockoutFailures = [] } = state as AnalysisState & { knockoutFailures?: { alternativeId: string; failedCriteria: string[] }[] };
  const recommendation = getRecommendation(results, alternatives);
  const validResults = results.filter(
    (r) => !knockoutFailures.some((f) => f.alternativeId === r.alternativeId)
  );

  const packageLabel = decision.packageLevel === "basic" ? "Basic" : decision.packageLevel === "advanced" ? "Advanced" : "Business";
  const date = new Date().toLocaleDateString("de-CH", { 
    year: "numeric", 
    month: "long", 
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let html = `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nutzwertanalyse Report - ${decision.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      max-width: 900px;
      margin: 0 auto;
    }
    .header { 
      border-bottom: 3px solid #0066cc; 
      padding-bottom: 24px; 
      margin-bottom: 32px;
    }
    .header h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .header .subtitle { color: #666; font-size: 14px; }
    .meta { display: flex; gap: 24px; margin-top: 16px; font-size: 12px; color: #666; }
    .meta-item { display: flex; align-items: center; gap: 6px; }
    .badge { 
      display: inline-block; 
      padding: 4px 12px; 
      border-radius: 4px; 
      font-size: 11px; 
      font-weight: 600; 
      text-transform: uppercase;
      background: #0066cc;
      color: white;
    }
    .section { margin-bottom: 32px; page-break-inside: avoid; }
    .section-title { 
      font-size: 18px; 
      font-weight: 600; 
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    .recommendation-card {
      background: linear-gradient(135deg, #f0f7ff, #e8f4ff);
      border: 1px solid #0066cc;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .recommendation-card h3 { font-size: 14px; color: #666; margin-bottom: 8px; }
    .recommendation-card .winner { font-size: 24px; font-weight: 700; color: #0066cc; }
    .recommendation-card .reasoning { margin-top: 12px; font-size: 14px; color: #444; }
    .confidence { 
      display: flex; 
      align-items: center; 
      gap: 8px; 
      margin-top: 12px;
      font-size: 12px;
      color: #666;
    }
    .confidence-bar { display: flex; gap: 4px; }
    .confidence-bar span { width: 24px; height: 8px; border-radius: 4px; background: #e0e0e0; }
    .confidence-bar span.filled { background: #0066cc; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    th { background: #f8f9fa; font-weight: 600; color: #444; }
    .rank { 
      display: inline-flex; 
      align-items: center; 
      justify-content: center;
      width: 28px; 
      height: 28px; 
      border-radius: 8px; 
      font-weight: 700;
      font-size: 14px;
    }
    .rank-1 { background: #ffd700; color: #1a1a1a; }
    .rank-2 { background: #c0c0c0; color: #1a1a1a; }
    .rank-3 { background: #cd7f32; color: white; }
    .rank-other { background: #e0e0e0; color: #666; }
    .score { font-weight: 600; color: #0066cc; }
    .progress-bar { 
      height: 8px; 
      background: #e0e0e0; 
      border-radius: 4px; 
      overflow: hidden;
      margin-top: 4px;
    }
    .progress-bar-fill { height: 100%; background: #0066cc; border-radius: 4px; }
    .knockout { color: #dc3545; font-weight: 500; }
    .sensitivity-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }
    .sensitivity-high { background: #ffebee; color: #c62828; }
    .sensitivity-medium { background: #fff8e1; color: #f57f17; }
    .sensitivity-low { background: #e8f5e9; color: #2e7d32; }
    .consistency-box {
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    .consistency-pass { background: #e8f5e9; border: 1px solid #4caf50; }
    .consistency-fail { background: #fff8e1; border: 1px solid #ff9800; }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
      font-size: 11px;
      color: #999;
      text-align: center;
    }
    .text-muted { color: #666; }
    .text-small { font-size: 12px; }
    @media print {
      body { padding: 20px; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${decision.title || "Nutzwertanalyse"}</h1>
    <p class="subtitle">${decision.description || "Entscheidungsanalyse"}</p>
    <div class="meta">
      <div class="meta-item">
        <span class="badge">${packageLabel}</span>
      </div>
      <div class="meta-item">Erstellt: ${date}</div>
      <div class="meta-item">${alternatives.length} Alternativen</div>
      <div class="meta-item">${criteria.length} Kriterien</div>
    </div>
  </div>
`;

  // Executive Summary
  if (config.includeExecutiveSummary) {
    const confidenceFilled = recommendation.confidence === "high" ? 3 : recommendation.confidence === "medium" ? 2 : 1;
    html += `
  <div class="section">
    <h2 class="section-title">Zusammenfassung & Empfehlung</h2>
    <div class="recommendation-card">
      <h3>Empfohlene Alternative</h3>
      <div class="winner">${recommendation.recommended?.name || "Keine klare Empfehlung"}</div>
      <div class="reasoning">${recommendation.reasoning}</div>
      <div class="confidence">
        <span>Konfidenz:</span>
        <div class="confidence-bar">
          ${[1, 2, 3].map((i) => `<span class="${i <= confidenceFilled ? "filled" : ""}"></span>`).join("")}
        </div>
        <span>${recommendation.confidence === "high" ? "Hoch" : recommendation.confidence === "medium" ? "Mittel" : "Niedrig"}</span>
      </div>
    </div>
  </div>
`;
  }

  // Ranking Results
  html += `
  <div class="section">
    <h2 class="section-title">Ranking der Alternativen</h2>
    <table>
      <thead>
        <tr>
          <th>Rang</th>
          <th>Alternative</th>
          <th>Gesamtscore</th>
          <th>Normalisiert</th>
        </tr>
      </thead>
      <tbody>
`;

  const maxScore = validResults[0]?.totalScore || 1;
  validResults.forEach((result) => {
    const alt = alternatives.find((a) => a.id === result.alternativeId);
    const rankClass = result.rank <= 3 ? `rank-${result.rank}` : "rank-other";
    const barWidth = (result.totalScore / maxScore) * 100;
    
    html += `
        <tr>
          <td><span class="rank ${rankClass}">${result.rank}</span></td>
          <td>
            <strong>${alt?.name}</strong>
            ${alt?.description ? `<br><span class="text-small text-muted">${alt.description}</span>` : ""}
          </td>
          <td>
            <span class="score">${result.totalScore.toFixed(2)}</span>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: ${barWidth}%"></div>
            </div>
          </td>
          <td>${result.normalizedScore.toFixed(0)}%</td>
        </tr>
`;
  });

  // Knocked out alternatives
  if (knockoutFailures && knockoutFailures.length > 0) {
    knockoutFailures.forEach((failure) => {
      const alt = alternatives.find((a) => a.id === failure.alternativeId);
      const failedCritNames = failure.failedCriteria
        .map((cId: string) => criteria.find((c) => c.id === cId)?.name)
        .filter(Boolean)
        .join(", ");
      
      html += `
        <tr>
          <td><span class="rank rank-other">K.O.</span></td>
          <td>
            <strong class="knockout">${alt?.name}</strong>
            <br><span class="text-small knockout">Nicht bestanden: ${failedCritNames}</span>
          </td>
          <td colspan="2" class="knockout">Ausgeschieden</td>
        </tr>
`;
    });
  }

  html += `
      </tbody>
    </table>
  </div>
`;

  // Detailed Analysis
  if (config.includeDetailedAnalysis) {
    html += `
  <div class="section">
    <h2 class="section-title">Detailanalyse nach Kriterien</h2>
    <table>
      <thead>
        <tr>
          <th>Kriterium</th>
          <th>Gewicht</th>
          ${validResults.slice(0, 5).map((r) => {
            const alt = alternatives.find((a) => a.id === r.alternativeId);
            return `<th>${alt?.name}</th>`;
          }).join("")}
        </tr>
      </thead>
      <tbody>
`;

    criteria.forEach((criterion) => {
      html += `
        <tr>
          <td>
            <strong>${criterion.name}</strong>
            ${criterion.description ? `<br><span class="text-small text-muted">${criterion.description}</span>` : ""}
          </td>
          <td>${(criterion.weight * 100).toFixed(0)}%</td>
`;

      validResults.slice(0, 5).forEach((r) => {
        const criterionScore = r.criteriaScores.find((cs) => cs.criterionId === criterion.id);
        html += `<td>${criterionScore?.rawScore.toFixed(1) || "–"}</td>`;
      });

      html += `</tr>`;
    });

    html += `
        <tr style="background: #f8f9fa; font-weight: 600;">
          <td>Gesamtscore</td>
          <td>100%</td>
          ${validResults.slice(0, 5).map((r) => `<td class="score">${r.totalScore.toFixed(2)}</td>`).join("")}
        </tr>
      </tbody>
    </table>
  </div>
`;
  }

  // Sensitivity Analysis
  if (config.includeSensitivityAnalysis && sensitivityResults.length > 0) {
    html += `
  <div class="section">
    <h2 class="section-title">Sensitivitätsanalyse</h2>
    <p class="text-muted text-small" style="margin-bottom: 16px;">
      Zeigt, wie empfindlich das Ranking auf Änderungen der Gewichtung reagiert.
    </p>
    <table>
      <thead>
        <tr>
          <th>Kriterium</th>
          <th>Aktuelles Gewicht</th>
          <th>Sensitivität</th>
          <th>Einfluss auf Ranking</th>
        </tr>
      </thead>
      <tbody>
`;

    sensitivityResults.forEach((sens) => {
      const criterion = criteria.find((c) => c.id === sens.criterionId);
      const badgeClass = sens.impactOnRanking === "high" ? "sensitivity-high" : sens.impactOnRanking === "medium" ? "sensitivity-medium" : "sensitivity-low";
      const label = sens.impactOnRanking === "high" ? "Hoch" : sens.impactOnRanking === "medium" ? "Mittel" : "Niedrig";
      
      html += `
        <tr>
          <td>${criterion?.name}</td>
          <td>${(sens.originalWeight * 100).toFixed(0)}%</td>
          <td>${(sens.sensitivity * 100).toFixed(0)}%</td>
          <td><span class="sensitivity-badge ${badgeClass}">${label}</span></td>
        </tr>
`;
    });

    html += `
      </tbody>
    </table>
  </div>
`;
  }

  // AHP Consistency (Business)
  if (config.includeAuditTrail && ahpConsistency) {
    const consistencyClass = ahpConsistency.isConsistent ? "consistency-pass" : "consistency-fail";
    html += `
  <div class="section">
    <h2 class="section-title">AHP-Konsistenzprüfung</h2>
    <div class="consistency-box ${consistencyClass}">
      <strong>${ahpConsistency.isConsistent ? "Konsistent" : "Inkonsistent"}</strong>
      <p style="margin-top: 8px;">${ahpConsistency.message}</p>
      <p class="text-small text-muted" style="margin-top: 8px;">
        Konsistenzratio (CR): ${(ahpConsistency.consistencyRatio * 100).toFixed(1)}%
        ${ahpConsistency.consistencyRatio < 0.1 ? "(akzeptabel < 10%)" : "(sollte < 10% sein)"}
      </p>
    </div>
  </div>
`;
  }

  // Methodology Notes
  if (config.includeMethodologyNotes) {
    const weightingMethodLabel = state.weightingMethod === "simple" ? "Einfache Gewichtung (1-5 Skala)" :
      state.weightingMethod === "percentage" ? "Prozentuale Gewichtung (100%)" :
      state.weightingMethod === "ahp-light" ? "AHP Light (Paarweiser Vergleich)" :
      "Vollständige AHP mit Konsistenzprüfung";
    
    html += `
  <div class="section">
    <h2 class="section-title">Methodik</h2>
    <table>
      <tbody>
        <tr>
          <td><strong>Analysemethode</strong></td>
          <td>Nutzwertanalyse (Weighted Scoring Model)</td>
        </tr>
        <tr>
          <td><strong>Gewichtungsmethode</strong></td>
          <td>${weightingMethodLabel}</td>
        </tr>
        <tr>
          <td><strong>Bewertungsskala</strong></td>
          <td>1-10 (1 = sehr schlecht, 10 = sehr gut)</td>
        </tr>
        <tr>
          <td><strong>Berechnungsformel</strong></td>
          <td>Score = Σ (Kriteriengewicht × Alternativenbewertung)</td>
        </tr>
      </tbody>
    </table>
  </div>
`;
  }

  // Footer
  html += `
  <div class="footer">
    <p>Erstellt mit Nutzwertanalyse.tool | ${date}</p>
    <p>Diese Analyse dient als Entscheidungsunterstützung. Die finale Entscheidung liegt beim Anwender.</p>
  </div>
</body>
</html>
`;

  return html;
}

export function ReportGenerator() {
  const { state, knockoutFailures } = useAnalysis();
  const { decision } = state;
  const packageLevel = decision.packageLevel;

  const [isGenerating, setIsGenerating] = useState(false);
  const [config, setConfig] = useState<ReportConfig>(
    DEFAULT_REPORT_CONFIG[packageLevel] || DEFAULT_REPORT_CONFIG.basic
  );

  const handleExportPDF = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // Generate HTML report
      const stateWithKnockouts = { ...state, knockoutFailures };
      const html = generateReportHTML(stateWithKnockouts as AnalysisState & { knockoutFailures: { alternativeId: string; failedCriteria: string[] }[] }, config);
      
      // Create blob and download as HTML (can be opened in browser and printed as PDF)
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          // Auto-trigger print dialog
          setTimeout(() => {
            printWindow.print();
          }, 500);
        };
      }
      
      // Also provide download option
      const downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = `Nutzwertanalyse_${decision.title?.replace(/[^a-zA-Z0-9]/g, "_") || "Report"}_${new Date().toISOString().split("T")[0]}.html`;
      downloadLink.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("[v0] Report generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  }, [state, config, knockoutFailures, decision.title]);

  const toggleConfig = (key: keyof ReportConfig) => {
    setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Report exportieren</h3>
        <p className="mt-1 text-sm text-white/50">
          {packageLevel === "basic"
            ? "Kompakter Entscheidungsreport"
            : packageLevel === "advanced"
            ? "Vollständiger Analysebericht"
            : "Executive Report mit Audit-Dokumentation"}
        </p>
      </div>

      {/* Config options */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-white/70">Report-Inhalt</div>
        
        {[
          { key: "includeExecutiveSummary", label: "Zusammenfassung & Empfehlung", always: true },
          { key: "includeDetailedAnalysis", label: "Detailanalyse nach Kriterien", always: false },
          { key: "includeSensitivityAnalysis", label: "Sensitivitätsanalyse", always: false },
          { key: "includeRiskAssessment", label: "Risikobewertung", always: false },
          { key: "includeAuditTrail", label: "AHP-Konsistenzprüfung", always: false },
          { key: "includeMethodologyNotes", label: "Methodik-Dokumentation", always: false },
        ].map(({ key, label, always }) => {
          const isEnabled = config[key as keyof ReportConfig];
          const isAvailable =
            packageLevel === "business" ||
            (packageLevel === "advanced" && !["includeRiskAssessment", "includeAuditTrail"].includes(key)) ||
            (packageLevel === "basic" && always);

          if (!isAvailable) return null;

          return (
            <label
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${
                isEnabled ? "bg-[rgb(var(--accent))]/10" : "bg-white/5"
              }`}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggleConfig(key as keyof ReportConfig)}
                className="rounded border-white/20 bg-white/5 text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]/20"
              />
              <span className="text-sm text-white/70">{label}</span>
            </label>
          );
        })}
      </div>

      {/* Export button */}
      <button
        onClick={handleExportPDF}
        disabled={isGenerating}
        className="w-full h-12 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          background: `rgb(var(--accent))`,
          color: "white",
        }}
      >
        {isGenerating ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Wird erstellt...
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Report exportieren (PDF/HTML)
          </>
        )}
      </button>

      <div className="text-xs text-white/40 text-center">
        Der Report wird als HTML-Datei generiert und kann direkt als PDF gedruckt werden.
      </div>
    </div>
  );
}
