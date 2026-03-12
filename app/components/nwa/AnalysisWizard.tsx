"use client";

import { useEffect, useCallback, useMemo, useState } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { DecisionSetup } from "./DecisionSetup";
import { AlternativesManager } from "./AlternativesManager";
import { CriteriaManager } from "./CriteriaManager";
import { WeightingModule } from "./WeightingModule";
import { EvaluationMatrix } from "./EvaluationMatrix";
import { ResultsDashboard } from "./ResultsDashboard";
import type { AnalysisStep } from "@/app/lib/nwa/types";

const STEPS: { id: AnalysisStep; label: string; shortLabel: string }[] = [
  { id: "decision", label: "Entscheidung", shortLabel: "1. Entscheidung" },
  { id: "alternatives", label: "Alternativen", shortLabel: "2. Alternativen" },
  { id: "criteria", label: "Kriterien", shortLabel: "3. Kriterien" },
  { id: "weighting", label: "Gewichtung", shortLabel: "4. Gewichtung" },
  { id: "evaluation", label: "Bewertung", shortLabel: "5. Bewertung" },
  { id: "results", label: "Ergebnis", shortLabel: "6. Ergebnis" },
];

export function AnalysisWizard() {
  const { state, setStep, calculateResults, canProceedToNext, reset, saveDraft, hasDraft, loadDraft } = useAnalysis();
  const { currentStep, decision } = state;
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((s) => s.id === currentStep),
    [currentStep]
  );

// Calculate results when entering results step
  useEffect(() => {
    if (currentStep === "results") {
      calculateResults();
    }
  }, [currentStep, calculateResults]);

  // Auto-save draft on state changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 2000); // 2 second debounce
    return () => clearTimeout(timeoutId);
  }, [state, saveDraft]);

  // Check for existing draft on mount
  useEffect(() => {
    if (!draftChecked && hasDraft && currentStep === "decision" && !decision.title) {
      setShowDraftPrompt(true);
    }
    setDraftChecked(true);
  }, [draftChecked, hasDraft, currentStep, decision.title]);

  // Handle draft restoration
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
        // Ignore errors
      }
    }
  }, []);

  // Handle reset with confirmation
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

  const goToStep = useCallback((step: AnalysisStep) => {
    const targetIndex = STEPS.findIndex((s) => s.id === step);
    // Only allow going to previous steps or current step
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

  const renderCurrentStep = () => {
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
  };

return (
    <>
      {/* Draft Recovery Prompt */}
      {showDraftPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Entwurf gefunden</h3>
            <p className="mt-2 text-sm text-white/60">
              Es wurde ein gespeicherter Entwurf gefunden. Möchten Sie diesen wiederherstellen?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleDiscardDraft}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/10 hover:bg-white/15 transition"
              >
                Verwerfen
              </button>
              <button
                onClick={handleLoadDraft}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{ background: `rgb(var(--accent))` }}
              >
                Wiederherstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Analyse zurücksetzen?</h3>
            <p className="mt-2 text-sm text-white/60">
              Sind Sie sicher, dass Sie die Analyse zurücksetzen möchten? Alle eingegebenen Daten werden gelöscht.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 bg-white/10 hover:bg-white/15 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-500 transition"
              >
                Zurücksetzen
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-[calc(100vh-76px)] flex flex-col">
        {/* Header with step indicator */}
        <div className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-[76px] z-20">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
            {/* Package indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-sm font-bold"
                  style={{ background: `rgb(var(--accent) / 0.2)`, color: `rgb(var(--accent))` }}
              >
                {decision.packageLevel === "basic"
                  ? "B"
                  : decision.packageLevel === "advanced"
                  ? "A"
                  : "P"}
              </div>
              <div>
                <div className="text-sm font-medium text-white">
                  {decision.title || "Neue Analyse"}
                </div>
                <div className="text-xs text-white/50">
                  {decision.packageLevel === "basic"
                    ? "Basic"
                    : decision.packageLevel === "advanced"
                    ? "Advanced"
: "Business"}{" "}
              Paket
            </div>
          </div>
        </div>
        
        {/* Reset button */}
        <button
          onClick={handleResetClick}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white/70 hover:bg-white/10 transition"
          title="Analyse zurücksetzen"
        >
          Neustart
        </button>
      </div>

{/* Overall progress bar */}
      <div className="mb-3">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentStepIndex + 1) / STEPS.length) * 100}%`,
              background: `rgb(var(--accent))`,
            }}
          />
        </div>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = index < currentStepIndex;
              const isAccessible = index <= currentStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={!isAccessible}
                  className={`flex-1 min-w-0 transition ${
                    isAccessible ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0 transition ${
                        isActive
                          ? "bg-[rgb(var(--accent))] text-white"
                          : isCompleted
                          ? "bg-[rgb(var(--accent))]/30 text-[rgb(var(--accent))]"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    <span
                      className={`text-sm truncate hidden sm:block ${
                        isActive
                          ? "text-white font-medium"
                          : isCompleted
                          ? "text-white/60"
                          : "text-white/40"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {/* Progress line */}
                  {index < STEPS.length - 1 && (
                    <div className="hidden sm:block mt-2 ml-4">
                      <div
                        className={`h-0.5 w-full ${
                          isCompleted ? "bg-[rgb(var(--accent))]" : "bg-white/10"
                        }`}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 mx-auto max-w-5xl w-full px-5 sm:px-6 py-8">
        {renderCurrentStep()}
      </div>

      {/* Navigation footer */}
      <div className="border-t border-white/10 bg-black/20 backdrop-blur-md sticky bottom-0 z-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={currentStepIndex === 0}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                currentStepIndex === 0
                  ? "text-white/30 cursor-not-allowed"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Zurück
            </button>

            <div className="text-sm text-white/40">
              Schritt {currentStepIndex + 1} von {STEPS.length}
            </div>

            {currentStep === "results" ? (
              <button
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition"
                style={{
                  background: `rgb(var(--accent))`,
                  color: "white",
                }}
              >
                Export PDF
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceedToNext}
                className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition ${
                  canProceedToNext
                    ? "hover:brightness-110"
                    : "opacity-50 cursor-not-allowed"
                }`}
                style={{
                  background: canProceedToNext
                    ? `rgb(var(--accent))`
                    : `rgb(var(--accent) / 0.5)`,
                  color: "white",
                }}
              >
                Weiter
              </button>
            )}
</div>
        </div>
      </div>
    </div>
    </>
  );
}
