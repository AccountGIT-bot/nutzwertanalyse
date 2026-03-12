"use client";

import { useState, useCallback } from "react";
import type { AIDecisionInterpretation } from "@/app/lib/nwa/types";
import { getPresetIcon } from "@/app/lib/nwa/preset-icons";

interface DecisionSuggestionProps {
  interpretation: AIDecisionInterpretation;
  originalInput: string;
  onAccept: (interpretation: AIDecisionInterpretation) => void;
  onEdit: (interpretation: AIDecisionInterpretation) => void;
  onReject: () => void;
}

// Map AI domains to preset icons
const DOMAIN_TO_PRESET: Record<AIDecisionInterpretation["domain"], string> = {
  supplier: "supplier",
  software: "software",
  investment: "investment",
  machines: "machines",
  vehicle: "vehicle",
  employee: "employee",
  personal: "investment",
  technology: "software",
  service: "supplier",
  other: "investment",
};

const CATEGORY_LABELS: Record<string, string> = {
  economic: "Wirtschaftlichkeit",
  quality: "Qualitat",
  strategic: "Strategie",
  risk: "Risiko",
  other: "Sonstige",
};

const CONFIDENCE_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Hohe Konfidenz", color: "rgb(16, 185, 129)" },
  medium: { label: "Mittlere Konfidenz", color: "rgb(245, 158, 11)" },
  low: { label: "Niedrige Konfidenz", color: "rgb(239, 68, 68)" },
};

export function DecisionSuggestion({
  interpretation,
  originalInput,
  onAccept,
  onEdit,
  onReject,
}: DecisionSuggestionProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("title");
  
  const PresetIcon = getPresetIcon(DOMAIN_TO_PRESET[interpretation.domain]);
  const confidenceInfo = CONFIDENCE_LABELS[interpretation.confidence];

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header with confidence indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.08)" }}
          >
            <PresetIcon size={22} className="text-black/60" />
          </div>
          <div>
            <div className="text-xs text-black/50">KI-Interpretation</div>
            <div className="text-sm font-medium text-black/80">
              Ihre Entscheidung wurde analysiert
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: `${confidenceInfo.color}15`,
            color: confidenceInfo.color,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: confidenceInfo.color }}
          />
          {confidenceInfo.label}
        </div>
      </div>

      {/* Original input reference */}
      <div className="mb-4 px-4 py-3 rounded-xl bg-black/5 border border-black/10">
        <div className="text-[11px] text-black/50 mb-1">Ihre Eingabe</div>
        <div className="text-sm text-black/70 italic">{`"${originalInput}"`}</div>
      </div>

      {/* Suggestion sections */}
      <div className="space-y-3">
        {/* Title & Description */}
        <div className="rounded-2xl border border-black/10 bg-white/80 overflow-hidden">
          <button
            onClick={() => toggleSection("title")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-black/80">Entscheidungstitel</div>
                <div className="text-xs text-black/50">Verbesserte Formulierung</div>
              </div>
            </div>
            <svg
              className={`h-5 w-5 text-black/40 transition-transform ${
                expandedSection === "title" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSection === "title" && (
            <div className="px-4 pb-4 border-t border-black/10">
              <div className="pt-3 space-y-3">
                <div>
                  <div className="text-xs text-black/50 mb-1">Titel</div>
                  <div className="text-base font-semibold text-black/90">{interpretation.title}</div>
                </div>
                <div>
                  <div className="text-xs text-black/50 mb-1">Beschreibung</div>
                  <div className="text-sm text-black/70">{interpretation.description}</div>
                </div>
                {interpretation.constraints && (
                  <div>
                    <div className="text-xs text-black/50 mb-1">Erkannte Randbedingungen</div>
                    <div className="text-sm text-black/60 italic">{interpretation.constraints}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Alternatives */}
        <div className="rounded-2xl border border-black/10 bg-white/80 overflow-hidden">
          <button
            onClick={() => toggleSection("alternatives")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-black/80">
                  {interpretation.alternatives.length} Alternativen vorgeschlagen
                </div>
                <div className="text-xs text-black/50">Entscheidungsoptionen</div>
              </div>
            </div>
            <svg
              className={`h-5 w-5 text-black/40 transition-transform ${
                expandedSection === "alternatives" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSection === "alternatives" && (
            <div className="px-4 pb-4 border-t border-black/10">
              <div className="pt-3 space-y-2">
                {interpretation.alternatives.map((alt, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-black/5"
                  >
                    <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-green-700">{index + 1}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black/80">{alt.name}</div>
                      {alt.description && (
                        <div className="text-xs text-black/50 mt-0.5">{alt.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Criteria */}
        <div className="rounded-2xl border border-black/10 bg-white/80 overflow-hidden">
          <button
            onClick={() => toggleSection("criteria")}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-black/5 transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-medium text-black/80">
                  {interpretation.criteria.length} Kriterien vorgeschlagen
                </div>
                <div className="text-xs text-black/50">Bewertungsmerkmale</div>
              </div>
            </div>
            <svg
              className={`h-5 w-5 text-black/40 transition-transform ${
                expandedSection === "criteria" ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSection === "criteria" && (
            <div className="px-4 pb-4 border-t border-black/10">
              <div className="pt-3 space-y-2">
                {interpretation.criteria.map((crit, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl bg-black/5"
                  >
                    <div
                      className="h-6 px-2 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-medium"
                      style={{
                        background:
                          crit.categoryId === "economic"
                            ? "rgba(59, 130, 246, 0.15)"
                            : crit.categoryId === "quality"
                            ? "rgba(16, 185, 129, 0.15)"
                            : crit.categoryId === "strategic"
                            ? "rgba(168, 85, 247, 0.15)"
                            : crit.categoryId === "risk"
                            ? "rgba(239, 68, 68, 0.15)"
                            : "rgba(107, 114, 128, 0.15)",
                        color:
                          crit.categoryId === "economic"
                            ? "rgb(59, 130, 246)"
                            : crit.categoryId === "quality"
                            ? "rgb(16, 185, 129)"
                            : crit.categoryId === "strategic"
                            ? "rgb(168, 85, 247)"
                            : crit.categoryId === "risk"
                            ? "rgb(239, 68, 68)"
                            : "rgb(107, 114, 128)",
                      }}
                    >
                      {CATEGORY_LABELS[crit.categoryId]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-black/80">{crit.name}</div>
                      <div className="text-xs text-black/50 mt-0.5">{crit.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onAccept(interpretation)}
          className="flex-1 px-6 py-3 rounded-full text-sm font-semibold text-white transition shadow-lg hover:shadow-xl active:scale-[0.99]"
          style={{ background: "#0b0f14" }}
        >
          Vorschlage ubernehmen
        </button>
        <button
          onClick={() => onEdit(interpretation)}
          className="flex-1 px-6 py-3 rounded-full text-sm font-semibold text-black/70 bg-black/5 border border-black/10 hover:bg-black/10 transition"
        >
          Anpassen & Starten
        </button>
        <button
          onClick={onReject}
          className="px-4 py-3 rounded-full text-sm font-medium text-black/50 hover:text-black/70 hover:bg-black/5 transition"
        >
          Neu eingeben
        </button>
      </div>

      {/* Hint */}
      <div className="mt-4 text-center text-xs text-black/45">
        Sie konnen alle Vorschlage im nachsten Schritt anpassen oder erweitern.
      </div>
    </div>
  );
}
