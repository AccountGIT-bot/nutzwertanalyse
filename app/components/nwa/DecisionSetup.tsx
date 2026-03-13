"use client";

import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getPresetContext } from "@/app/lib/nwa/preset-context";
import { getPresetIcon, getDomainIcon, getDomainLabel } from "@/app/lib/nwa/preset-icons";
import { StepInfoButton } from "./StepInfoButton";

export function DecisionSetup() {
  const { state, setDecision, canProceedToNext } = useAnalysis();
  const { decision } = state;
  const packageLevel = decision.packageLevel;
  
  // Get context-specific content based on preset or AI interpretation
  const hasAIContext = decision.aiInterpretation?.domain;
  const presetContext = getPresetContext(decision.preset);
  
  // Determine the appropriate icon and label
  const ContextIcon = hasAIContext 
    ? getDomainIcon(decision.aiInterpretation?.domain)
    : decision.preset 
      ? getPresetIcon(decision.preset)
      : null;
  const contextLabel = hasAIContext
    ? getDomainLabel(decision.aiInterpretation?.domain)
    : presetContext.label;
  
  // Get context-aware placeholders
  const titlePlaceholder = hasAIContext
    ? `z.B. ${decision.aiInterpretation?.title || presetContext.titlePlaceholder}`
    : presetContext.titlePlaceholder;
  
  const descriptionPlaceholder = hasAIContext
    ? decision.aiInterpretation?.description || presetContext.descriptionPlaceholder
    : presetContext.descriptionPlaceholder;
  
  const constraintsPlaceholder = presetContext.constraintsPlaceholder;

  return (
    <div className="space-y-6">
      {/* Context indicator */}
      {(decision.preset || hasAIContext) && ContextIcon && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
          <div 
            className="h-9 w-9 rounded-lg flex items-center justify-center"
            style={{ 
              background: "rgb(var(--accent) / 0.15)",
              color: "rgb(var(--accent))",
            }}
          >
            <ContextIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/50 flex items-center gap-1.5">
              Anwendungsbereich
              {hasAIContext && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60">
                  KI-erkannt
                </span>
              )}
            </div>
            <div className="text-sm text-white font-medium truncate">
              {contextLabel}
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="text-sm text-white/60 flex items-center gap-2">
          Schritt 1
          <StepInfoButton stepId="setup" />
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {packageLevel === "business"
            ? "Strategische Entscheidungsfrage"
            : "Entscheidung definieren"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {packageLevel === "basic"
            ? presetContext.titleHelperText
            : packageLevel === "advanced"
            ? "Definieren Sie die Entscheidung und relevante Randbedingungen."
            : "Formulieren Sie die strategische Fragestellung für eine auditfähige Dokumentation."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {packageLevel === "business" ? "Strategische Fragestellung" : "Entscheidungstitel"}
          </label>
          <input
            type="text"
            value={decision.title}
            onChange={(e) => setDecision({ title: e.target.value })}
            placeholder={
              packageLevel === "business"
                ? "z.B. Welcher strategische Partner für die Marktexpansion?"
                : titlePlaceholder
            }
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition"
          />
          {/* Example hints based on preset */}
          {presetContext.titleExamples.length > 0 && !decision.title && (
            <div className="mt-2 text-xs text-white/40">
              <span className="text-white/50">Beispiele: </span>
              {presetContext.titleExamples.slice(0, 2).join(" | ")}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Beschreibung / Kontext
          </label>
          <textarea
            value={decision.description}
            onChange={(e) => setDecision({ description: e.target.value })}
            placeholder={descriptionPlaceholder}
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition resize-none"
          />
        </div>

        {(packageLevel === "advanced" || packageLevel === "business") && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Randbedingungen & Einschränkungen
            </label>
            <textarea
              value={decision.constraints || ""}
              onChange={(e) => setDecision({ constraints: e.target.value })}
              placeholder={constraintsPlaceholder}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition resize-none"
            />
            {/* Constraint examples */}
            {presetContext.constraintsExamples.length > 0 && !decision.constraints && (
              <div className="mt-2 text-xs text-white/40">
                <span className="text-white/50">Beispiele: </span>
                {presetContext.constraintsExamples.slice(0, 2).join(" | ")}
              </div>
            )}
          </div>
        )}

        {packageLevel === "business" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
              Dokumentationsstandard
            </div>
            <p className="text-sm text-white/50">
              Alle Eingaben werden vollständig dokumentiert und können später für 
              Revisionen, Gremienentscheide oder Compliance-Nachweise verwendet werden.
              Formulieren Sie sachlich und nachvollziehbar.
            </p>
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {!canProceedToNext && decision.title.trim().length === 0 && (
        <div className="text-sm text-[rgb(var(--accent))]/80">
          Bitte geben Sie einen Titel für die Entscheidung ein.
        </div>
      )}
    </div>
  );
}
