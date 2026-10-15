"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Undo2, Redo2, Trash2, Cloud, CloudOff, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis, useUndoShortcuts } from "@/lib/nwa/store";
import { isStepComplete } from "@/lib/nwa/calc";
import { STEPS, type Step } from "@/lib/nwa/types";
import { library } from "@/lib/nwa/library";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { cn, fmt } from "@/lib/utils";
import { Container } from "@/components/layout/PageShell";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { StepDecision } from "./steps/StepDecision";
import { StepAlternatives } from "./steps/StepAlternatives";
import { StepCriteria } from "./steps/StepCriteria";
import { StepWeighting } from "./steps/StepWeighting";
import { StepEvaluation } from "./steps/StepEvaluation";
import { StepResults } from "./steps/StepResults";

export function Wizard() {
  const { t } = useI18n();
  const router = useRouter();
  const { analysis, dispatch, canUndo, canRedo } = useAnalysis();
  const { functional } = useConsent();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showIncomplete, setShowIncomplete] = useState(false);
  useUndoShortcuts();

  const step = analysis.step;
  const index = STEPS.indexOf(step);
  const complete = useMemo(() => Object.fromEntries(STEPS.map((s) => [s, isStepComplete(analysis, s)])) as Record<Step, boolean>, [analysis]);

  const go = (s: Step) => {
    setShowIncomplete(false);
    dispatch({ type: "setStep", step: s });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (index >= STEPS.length - 1) return;
    if (!complete[step] && !showIncomplete) {
      setShowIncomplete(true);
      return;
    }
    go(STEPS[index + 1]);
  };
  const back = () => index > 0 && go(STEPS[index - 1]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (index < STEPS.length - 1) go(STEPS[index + 1]);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div className="pb-24">
      {/* Werkzeugleiste */}
      <div className="border-b border-line bg-surface">
        <Container className="flex flex-wrap items-center gap-2 py-2.5">
          <Link href="/app" className="btn btn-ghost btn-sm">
            <ChevronLeft className="h-4 w-4" aria-hidden /> {t.wizard.backToList}
          </Link>
          <div className="min-w-0 flex-1 truncate text-sm font-semibold" title={analysis.title}>
            {analysis.title || t.common.untitled}
          </div>
          <span className={cn("hidden items-center gap-1 text-xs sm:inline-flex", functional ? "text-ink-3" : "text-warn")} title={functional ? t.wizard.savedLocal : t.wizard.unsaved}>
            {functional ? <Cloud className="h-3.5 w-3.5" aria-hidden /> : <CloudOff className="h-3.5 w-3.5" aria-hidden />}
            {functional ? t.wizard.savedLocal : t.wizard.unsaved}
          </span>
          <div className="flex items-center gap-1">
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => dispatch({ type: "undo" })} disabled={!canUndo} aria-label={t.common.undo} title={`${t.common.undo} (Ctrl+Z)`}>
              <Undo2 className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => dispatch({ type: "redo" })} disabled={!canRedo} aria-label={t.common.redo} title={`${t.common.redo} (Ctrl+Shift+Z)`}>
              <Redo2 className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-icon text-bad" onClick={() => setConfirmDelete(true)} aria-label={t.wizard.deleteAnalysis} title={t.wizard.deleteAnalysis}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </Container>
      </div>

      {/* Stepper */}
      <Container className="pt-6">
        <nav aria-label={fmt(t.wizard.stepOf, { current: index + 1, total: STEPS.length })}>
          <ol className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:gap-2 sm:px-0">
            {STEPS.map((s, i) => {
              const active = s === step;
              const done = complete[s] && i < index;
              return (
                <li key={s} className="min-w-[132px] flex-1 sm:min-w-0">
                  <button
                    type="button"
                    onClick={() => go(s)}
                    aria-current={active ? "step" : undefined}
                    className={cn(
                      "flex w-full flex-col gap-1.5 rounded-xl border px-2 py-2 text-left transition-colors sm:px-3",
                      active ? "border-primary bg-primary-soft/60" : "border-line bg-surface hover:bg-surface-2",
                    )}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                          done ? "bg-good text-white" : active ? "bg-primary text-primary-ink" : "bg-surface-3 text-ink-2",
                        )}
                      >
                        {done ? <Check className="h-3 w-3" aria-hidden /> : i + 1}
                      </span>
                      <span className={cn("truncate text-xs font-semibold sm:text-sm", active ? "text-ink" : "text-ink-2")}>{t.steps[s].short}</span>
                    </span>
                    <span className="hidden truncate text-[11px] text-ink-3 lg:block">{t.steps[s].description}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>

      {/* Schritt */}
      <Container className="pt-6">
        <div key={step} className="fade-up">
          {step === "decision" && <StepDecision />}
          {step === "alternatives" && <StepAlternatives />}
          {step === "criteria" && <StepCriteria />}
          {step === "weighting" && <StepWeighting />}
          {step === "evaluation" && <StepEvaluation />}
          {step === "results" && <StepResults />}
        </div>
      </Container>

      {/* Navigation unten (sticky) */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 backdrop-blur">
        <Container className="flex items-center justify-between gap-3 py-3">
          <button type="button" className="btn btn-secondary" onClick={back} disabled={index === 0}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> {t.common.back}
          </button>
          <div className="hidden text-xs text-ink-3 md:block">
            {fmt(t.wizard.stepOf, { current: index + 1, total: STEPS.length })} · {t.wizard.keyboardHint}
          </div>
          {showIncomplete && !complete[step] ? (
            <div className="flex items-center gap-2" role="alert">
              <span className="hidden items-center gap-1 text-xs text-warn sm:inline-flex">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden /> {t.wizard.missing[step]}
              </span>
              <button type="button" className="btn btn-secondary" onClick={() => go(STEPS[index + 1])}>
                {t.wizard.continueAnyway}
              </button>
            </div>
          ) : index < STEPS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={next}>
              {index === STEPS.length - 2 ? t.wizard.toResults : t.common.next} <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          ) : (
            <Link href="/app" className="btn btn-primary">
              {t.wizard.backToList}
            </Link>
          )}
        </Container>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={t.wizard.deleteAnalysis}
        text={t.dashboard.confirmDelete}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        danger
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          library.remove(analysis.id);
          router.replace("/app");
        }}
      />
    </div>
  );
}

/** Gemeinsamer Kopf eines Schritts */
export function StepHeader({ title, lead, children }: { title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {lead && <p className="mt-1 max-w-2xl text-sm text-ink-2">{lead}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}
