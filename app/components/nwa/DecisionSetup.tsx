"use client";

import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getPresetContext } from "@/app/lib/nwa/preset-context";
import { getPresetIcon, getDomainIcon, getDomainLabel, type PresetId } from "@/app/lib/nwa/preset-icons";
import { StepInfoButton } from "./StepInfoButton";
import { useTranslations } from "@/app/lib/i18n";

export function DecisionSetup() {
  const { state, setDecision, canProceedToNext } = useAnalysis();
  const { decision } = state;
  const t = useTranslations();
  const packageLevel = decision.packageLevel;
  
  // Get context-specific content based on preset or AI interpretation
  const hasAIContext = decision.aiInterpretation?.domain;
  const presetContext = getPresetContext(decision.preset);
  const presetKey = (decision.preset || "custom") as PresetId;
  
  // Get translations for this preset (with fallback to custom)
  const presetTranslations = t.presets[presetKey] || t.presets.custom;
  
  // Determine the appropriate icon and label
  const ContextIcon = hasAIContext 
    ? getDomainIcon(decision.aiInterpretation?.domain)
    : decision.preset 
      ? getPresetIcon(decision.preset)
      : null;
  const contextLabel = hasAIContext
    ? getDomainLabel(decision.aiInterpretation?.domain)
    : presetTranslations.label;
  
  // Get context-aware placeholders - prefer translations, fallback to presetContext
  const titlePlaceholder = hasAIContext
    ? decision.aiInterpretation?.title || presetTranslations.titlePlaceholder || presetContext.titlePlaceholder
    : presetTranslations.titlePlaceholder || presetContext.titlePlaceholder;
  
  const descriptionPlaceholder = hasAIContext
    ? decision.aiInterpretation?.description || presetTranslations.descriptionPlaceholder || presetContext.descriptionPlaceholder
    : presetTranslations.descriptionPlaceholder || presetContext.descriptionPlaceholder;
  
  const constraintsPlaceholder = presetTranslations.constraintsPlaceholder || presetContext.constraintsPlaceholder;
  const titleExamples = presetTranslations.titleExamples || presetContext.titleExamples;
  const constraintsExamples = presetTranslations.constraintsExamples || presetContext.constraintsExamples;

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
              {t.categories.other}
              {hasAIContext && (
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60">
                  {t.suggestion.aiAnalysis}
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
          {t.steps.step} 1
          <StepInfoButton stepId="setup" />
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {packageLevel === "business"
            ? t.decisionSetup.titleBusiness
            : t.decisionSetup.title}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {packageLevel === "basic"
            ? t.decisionSetup.description
            : packageLevel === "advanced"
            ? t.decisionSetup.descriptionAdvanced
            : t.decisionSetup.descriptionBusiness}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {packageLevel === "business" ? t.decisionSetup.strategicQuestion : t.decisionSetup.decisionTitle}
          </label>
          <input
            type="text"
            value={decision.title}
            onChange={(e) => setDecision({ title: e.target.value })}
            placeholder={
              packageLevel === "business"
                ? t.decisionSetup.placeholderBusiness
                : titlePlaceholder
            }
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition"
          />
          {/* Example hints based on preset */}
          {titleExamples && titleExamples.length > 0 && !decision.title && (
            <div className="mt-2 text-xs text-white/40">
              <span className="text-white/50">{t.common.examples}: </span>
              {titleExamples.slice(0, 2).join(" | ")}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {t.decisionSetup.descriptionLabel}
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
              {t.decisionSetup.constraintsLabel}
            </label>
            <textarea
              value={decision.constraints || ""}
              onChange={(e) => setDecision({ constraints: e.target.value })}
              placeholder={constraintsPlaceholder}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition resize-none"
            />
            {/* Constraint examples */}
            {constraintsExamples && constraintsExamples.length > 0 && !decision.constraints && (
              <div className="mt-2 text-xs text-white/40">
                <span className="text-white/50">{t.common.examples}: </span>
                {constraintsExamples.slice(0, 2).join(" | ")}
              </div>
            )}
          </div>
        )}

        {packageLevel === "business" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
              {t.decisionSetup.documentationStandard}
            </div>
            <p className="text-sm text-white/50">
              {t.decisionSetup.documentationInfo}
            </p>
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {!canProceedToNext && decision.title.trim().length === 0 && (
        <div className="text-sm text-[rgb(var(--accent))]/80">
          {t.decisionSetup.validationError}
        </div>
      )}
    </div>
  );
}
