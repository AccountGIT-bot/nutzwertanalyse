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
        <div className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-[76px] z-20 shadow-sm">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {ContextIconComponent ? (
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ background: "rgb(var(--accent) / 0.15)", color: "rgb(var(--accent))" }}
                  >
                    <ContextIconComponent size={20} />
                  </div>
                ) : (
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold"
                    style={{ background: "rgb(var(--accent) / 0.2)", color: "rgb(var(--accent))" }}
                  >
                    {decision.packageLevel === "basic" ? "B" : decision.packageLevel === "advanced" ? "A" : "P"}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-800 truncate max-w-[200px] sm:max-w-none">
                    {decision.title || t.decisionSetup.title}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span>{packageLevelLabel}</span>
                    {contextLabel ? <span className="text-slate-300">-</span> : null}
                    {contextLabel ? <span>{contextLabel}</span> : null}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleHomeClick}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title={t.wizard.goHome || "Zur Startseite"}
                  aria-label={t.wizard.goHome || "Zur Startseite"}
                >
                  <Home size={18} />
                </button>
                <button
                  onClick={handleResetClick}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title={t.wizard.resetAnalysis}
                >
                  {t.wizard.reset}
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
                    background: "rgb(var(--accent))",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {STEPS.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = index < currentStepIndex;
                const isAccessible = index <= currentStepIndex;

                return (
                  <div key={step.id} className="flex-1 min-w-0 flex items-center text-slate-600">
                    <button
                      onClick={() => goToStep(step.id)}
                      disabled={!isAccessible}
                      className={`flex items-center gap-2 transition ${isAccessible ? "cursor-pointer" : "cursor-not-allowed"}`}
                    >
                      <div
className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 transition ${
                        isActive
                          ? "bg-[rgb(var(--accent))] text-white"
                          : isCompleted
                            ? "bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))]"
                            : "bg-slate-200 text-slate-400"
                      }`}
                      >
                        {isCompleted ? "\u2713" : index + 1}
                      </div>
                      <span
className={`text-sm truncate hidden sm:block ${
                        isActive ? "text-slate-800 font-medium" : isCompleted ? "text-slate-600" : "text-slate-400"
                      }`}
                      >
                        {step.label}
                      </span>
                    </button>
                    {index < STEPS.length - 1 && (
                      <div className="hidden sm:flex flex-1 items-center mx-2">
                        <div className={`h-0.5 w-full ${isCompleted ? "bg-[rgb(var(--accent))]" : "bg-white/10"}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 mx-auto max-w-5xl w-full px-5 sm:px-6 py-8">
          <div key={currentStep} className="animate-in fade-in slide-in-from-right-2 duration-300">
            {renderCurrentStep()}
          </div>
        </div>

        <div className="border-t border-white/10 bg-black/20 backdrop-blur-md sticky bottom-0 z-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={goBack}
                disabled={currentStepIndex === 0}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                  currentStepIndex === 0 ? "text-slate-300 cursor-not-allowed" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                {t.common.back}
              </button>
<div className="text-sm text-slate-400">
                  {t.steps.step} {currentStepIndex + 1} / {STEPS.length}
                </div>
              {currentStep !== "results" && (
                <button
                  onClick={goNext}
                  disabled={!canProceedToNext}
                  className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                    canProceedToNext ? "hover:brightness-110" : "opacity-50 cursor-not-allowed"
                  }`}
                  style={{
                    background: canProceedToNext ? "rgb(var(--accent))" : "rgb(var(--accent) / 0.5)",
                    color: "white",
                  }}
                >
                  {t.common.next}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
