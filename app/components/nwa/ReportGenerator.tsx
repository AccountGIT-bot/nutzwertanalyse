"use client";
import { useMemo, useRef, useState } from "react";
import { FileSpreadsheet, Printer, Download } from "lucide-react";
import { useAnalysis } from "../../lib/nwa/analysis-context";
import { generateReportHTML, generateXlsx } from "../../lib/nwa/export";
import { downloadFile } from "../../lib/nwa/local-data";
import type { ReportConfig } from "../../lib/nwa/types";
export function ReportGenerator() {
  const { state } = useAnalysis();
  const iframe = useRef<HTMLIFrameElement>(null);
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [config, setConfig] = useState<ReportConfig>({
    includeExecutiveSummary: true,
    includeDetailedAnalysis: true,
    includeSensitivityAnalysis: true,
    includeRiskAssessment: true,
    includeAuditTrail: true,
    includeMethodologyNotes: true,
  });
  const html = useMemo(
    () => generateReportHTML(state, config),
    [state, config],
  );
  const name = `DecisionStudio-${state.decision.title.replace(/[^\p{L}\p{N}_-]/gu, "-").slice(0, 70) || "Analyse"}`;
  const options: { key: keyof ReportConfig; label: string }[] = [
    { key: "includeExecutiveSummary", label: "Ergebnis & Rangliste" },
    { key: "includeDetailedAnalysis", label: "Kriterien & Bewertungen" },
    { key: "includeSensitivityAnalysis", label: "Sensitivität" },
    { key: "includeRiskAssessment", label: "Risiken" },
    { key: "includeAuditTrail", label: "Quellen & Bewertende" },
    { key: "includeMethodologyNotes", label: "Methodik" },
  ];
  function excel() {
    try {
      downloadFile(
        generateXlsx(state),
        name + ".xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      setError("");
    } catch {
      setError(
        "Der Excel-Export konnte nicht erstellt werden. Bitte versuche es erneut.",
      );
    }
  }
  return (
    <section className="export-panel">
      <p className="eyebrow">DEIN ERGEBNIS ZUM MITNEHMEN</p>
      <h3>Entscheidung dokumentieren.</h3>
      <p className="muted">
        Excel enthält alle Daten. Für den Druckbericht wählst du die gewünschten
        Kapitel.
      </p>
      <div className="report-options">
        {options.map((o) => (
          <label key={o.key}>
            <input
              type="checkbox"
              checked={config[o.key]}
              onChange={() => {
                setReady(false);
                setConfig((c) => ({ ...c, [o.key]: !c[o.key] }));
              }}
            />
            {o.label}
          </label>
        ))}
      </div>
      <div className="action-row">
        <button className="studio-button" onClick={excel}>
          <FileSpreadsheet size={18} />
          Excel herunterladen
        </button>
        <button
          className="studio-button secondary"
          onClick={() => {
            if (!show) setReady(false);
            setShow(!show);
          }}
        >
          <Printer size={18} />
          {show ? "Bericht schliessen" : "Bericht öffnen"}
        </button>
        <button
          className="studio-button secondary"
          onClick={() =>
            downloadFile(html, name + ".html", "text/html;charset=utf-8")
          }
        >
          <Download size={17} />
          HTML-Bericht
        </button>
      </div>
      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}
      {show && (
        <div className="report-preview">
          <div className="action-row">
            <button
              className="studio-button"
              disabled={!ready}
              onClick={() => {
                try {
                  iframe.current?.contentWindow?.focus();
                  iframe.current?.contentWindow?.print();
                } catch {
                  setError(
                    "Öffne den heruntergeladenen HTML-Bericht und wähle dort Drucken.",
                  );
                }
              }}
            >
              <Printer size={18} />
              Drucken / PDF
            </button>
            <p className="muted">Wähle im Druckdialog «Als PDF speichern».</p>
          </div>
          <iframe
            ref={iframe}
            title="Druckvorschau des Entscheidungsberichts"
            sandbox="allow-same-origin allow-modals"
            srcDoc={html}
            onLoad={() => setReady(true)}
          />
        </div>
      )}
    </section>
  );
}
