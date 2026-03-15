"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getPresetIcon, getDomainIcon, getDomainLabel } from "@/app/lib/nwa/preset-icons";
import { DecisionSetup } from "./DecisionSetup";
import { AlternativesManager } from "./AlternativesManager";
import { CriteriaManager } from "./CriteriaManager";
import { WeightingModule } from "./WeightingModule";
import { EvaluationMatrix } from "./EvaluationMatrix";
import { ResultsDashboard } from "./ResultsDashboard";
import { useTranslations } from "@/app/lib/i18n";
import type { AnalysisStep } from "@/app/lib/nwa/types";
import { Home } from "lucide-react";

const STEP_IDS: AnalysisStep[] = ["decision", "alternatives", "criteria", "weighting", "evaluation", "results"];

export function AnalysisWizard() {
  const router = useRouter();
  const { state, setStep, calculateResults, canProceedToNext, reset, saveDraft, hasDraft, loadDraft } = useAnalysis();
  const { currentStep, decision } = state;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);
  const t = useTranslations();

  // Dynamic steps with translations
  const STEPS = useMemo(() => [
    { id: "decision" as AnalysisStep, label: t.steps.decision },
    { id: "alternatives" as AnalysisStep, label: t.steps.alternatives },
    { id: "criteria" as AnalysisStep, label: t.steps.criteria },
    { id: "weighting" as AnalysisStep, label: t.steps.weighting },
    { id: "evaluation" as AnalysisStep, label: t.steps.evaluation },
    { id: "results" as AnalysisStep, label: t.steps.results },
  ], [t]);

  const currentStepIndex = useMemo(
    () => STEP_IDS.indexOf(currentStep),
    [currentStep]
  );

  useEffect(() => {
    if (currentStep === "results") {
      calculateResults();
    }
  }, [currentStep, calculateResults]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [state, saveDraft]);

  useEffect(() => {
    if (!draftChecked && hasDraft && currentStep === "decision" && !decision.title) {
      setShowDraftPrompt(true);
    }
    setDraftChecked(true);
  }, [draftChecked, hasDraft, currentStep, decision.title]);

  const handleLoadDraft = useCallback(() => {
    loadDraft();
    setShowDraftPrompt(false);
  }, [loadDraft]);

  const handleDiscardDraft = useCallback(() => {
    setShowDraftPrompt(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("nwa_draft_state");
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleResetClick = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    reset();
    setShowResetConfirm(false);
  }, [reset]);

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  const handleHomeClick = useCallback(() => {
    setShowHomeConfirm(true);
  }, []);

  const handleConfirmHome = useCallback(() => {
    saveDraft();
    setShowHomeConfirm(false);
    router.push("/");
  }, [saveDraft, router]);

  const handleCancelHome = useCallback(() => {
    setShowHomeConfirm(false);
  }, []);

  const goToStep = useCallback((step: AnalysisStep) => {
    const targetIndex = STEPS.findIndex((s) => s.id === step);
    if (targetIndex <= currentStepIndex) {
      setStep(step);
    }
  }, [currentStepIndex, setStep]);

  const goNext = useCallback(() => {
    if (canProceedToNext && currentStepIndex < STEPS.length - 1) {
      setStep(STEPS[currentStepIndex + 1].id);
    }
  }, [canProceedToNext, currentStepIndex, setStep]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1].id);
    }
  }, [currentStepIndex, setStep]);

  const renderCurrentStep = useCallback(() => {
    switch (currentStep) {
      case "decision":
        return <DecisionSetup />;
      case "alternatives":
        return <AlternativesManager />;
      case "criteria":
        return <CriteriaManager />;
      case "weighting":
        return <WeightingModule />;
      case "evaluation":
        return <EvaluationMatrix />;
      case "results":
        return <ResultsDashboard />;
      default:
        return null;
    }
  }, [currentStep]);

  const hasAIContext = decision.aiInterpretation?.domain;
  const ContextIconComponent = hasAIContext 
    ? getDomainIcon(decision.aiInterpretation?.domain) 
    : decision.preset 
      ? getPresetIcon(decision.preset) 
      : null;
  const contextLabel = hasAIContext 
    ? getDomainLabel(decision.aiInterpretation?.domain)
    : null;

  const packageLevelLabel = decision.packageLevel === "basic" 
    ? "Basic" 
    : decision.packageLevel === "advanced" 
      ? "Advanced" 
      : "Business";

  return (
    <div className="wizard-root">
      {showDraftPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{t.wizard.draftFound.split(".")[0]}</h3>
            <p className="mt-2 text-sm text-white/60">
              {t.wizard.draftFound}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/10 hover:bg-white/15 transition"
              >
                {t.wizard.discard}
              </button>
              <button
                onClick={handleLoadDraft}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: "rgb(var(--accent))" }}
              >
                {t.wizard.restore}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{t.wizard.resetAnalysis}</h3>
            <p className="mt-2 text-sm text-white/60">
              {t.wizard.resetConfirm}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/10 hover:bg-white/15 transition"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition"
              >
                {t.wizard.reset}
              </button>
            </div>
          </div>
        </div>
      )}

      {showHomeConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{t.wizard.goHome || "Zur Startseite"}</h3>
            <p className="mt-2 text-sm text-white/60">
              {t.wizard.goHomeConfirm || "Ihr Fortschritt wird automatisch gespeichert. Sie können später fortfahren."}
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelHome}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/10 hover:bg-white/15 transition"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmHome}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: "rgb(var(--accent))" }}
              >
                {t.wizard.goHomeButton || "Zur Startseite"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[calc(100vh-76px)] flex flex-col">
        {/* Premium Step Navigation Header */}
        <div className="border-b border-white/[0.06] bg-gradient-to-b from-black/30 to-black/20 backdrop-blur-xl sticky top-[72px] z-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {ContextIconComponent ? (
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-105"
                    style={{ 
                      background: "rgb(var(--accent) / 0.12)", 
                      color: "rgb(var(--accent))",
                      boxShadow: "0 0 20px rgb(var(--accent) / 0.1)"
                    }}
                  >
                    <ContextIconComponent size={20} />
                  </div>
                ) : (
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold"
                    style={{ 
                      background: "rgb(var(--accent) / 0.15)", 
                      color: "rgb(var(--accent))",
                      boxShadow: "0 0 20px rgb(var(--accent) / 0.1)"
                    }}
                  >
                    {decision.packageLevel === "basic" ? "B" : decision.packageLevel === "advanced" ? "A" : "P"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-none">
                    {decision.title || t.decisionSetup.title}
                  </div>
                  <div className="text-xs text-white/45 flex items-center gap-1.5 mt-0.5">
                    <span>{packageLevelLabel}</span>
                    {contextLabel ? <span className="text-white/25">•</span> : null}
                    {contextLabel ? <span>{contextLabel}</span> : null}
                  </div>
                </div>
              </div>
              <button
                onClick={handleResetClick}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-white/45 hover:text-white/70 hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] transition-all duration-200"
                title={t.wizard.resetAnalysis}
              >
                {t.wizard.reset}
              </button>
            </div>

            {/* Premium Progress Bar */}
            <div className="mb-4">
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
                    background: "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))",
                    boxShadow: "0 0 10px rgb(var(--accent) / 0.3)",
                  }}
                />
              </div>
            </div>

            {/* Premium Step Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < currentStepIndex;
                const isAccessible = index <= currentStepIndex;

                return (
                  <div key={step.id} className="flex-1 min-w-0 flex items-center">
                    <button
                      onClick={() => goToStep(step.id)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 transition-all duration-300 ${isAccessible ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 transition-all duration-300 ${
                          isActive
                            ? "shadow-[0_0_15px_rgb(var(--accent)/0.3)]"
                            : ""
                        }`}
                        style={{
                          background: isActive 
                            ? "rgb(var(--accent))" 
                            : isCompleted 
                              ? "rgb(var(--accent) / 0.2)" 
                              : "rgb(255 255 255 / 0.06)",
                          color: isActive 
                            ? "white" 
                            : isCompleted 
                              ? "rgb(var(--accent))" 
                              : "rgb(255 255 255 / 0.35)",
                          border: isActive ? "none" : "1px solid rgb(255 255 255 / 0.06)",
                        }}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : index + 1}
                      </div>
                      <span
                        className={`text-xs sm:text-sm truncate hidden sm:block transition-colors duration-200 ${
                          isActive ? "text-white font-semibold" : isCompleted ? "text-white/55" : "text-white/35"
                        }`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className="hidden sm:flex flex-1 items-center mx-3">
                        <div 
                          className="h-px w-full transition-all duration-500" 
                          style={{ 
                            background: isCompleted 
                              ? "linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.3))" 
                              : "rgb(255 255 255 / 0.06)" 
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 mx-auto max-w-5xl w-full px-5 sm:px-6 py-8">
          <div key={currentStep} className="animate-premium-fade-in-up">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Premium Footer Navigation */}
        <div className="border-t border-white/[0.06] bg-gradient-to-t from-black/30 to-black/20 backdrop-blur-xl sticky bottom-0 z-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentStepIndex === 0}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentStepIndex === 0 
                    ? "text-white/25 cursor-not-allowed" 
                    : "text-white/60 hover:text-white hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08]"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t.common.back}
              </button>
              <div className="text-xs text-white/35 font-medium">
                {t.steps.step} {currentStepIndex + 1} / {STEPS.length}
              </div>
              {currentStep !== "results" && (
                <button
                  onClick={goNext}
                  disabled={!canProceedToNext}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    canProceedToNext 
                      ? "hover:scale-[1.02] active:scale-[0.98]" 
                      : "opacity-40 cursor-not-allowed"
                  }`}
                  style={{
                    background: canProceedToNext 
                      ? "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.8))" 
                      : "rgb(var(--accent) / 0.3)",
                    boxShadow: canProceedToNext ? "0 4px 15px rgb(var(--accent) / 0.25), inset 0 1px 0 rgb(255 255 255 / 0.1)" : "none",
                    color: "white",
                  }}
                >
                  {t.common.next}
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
