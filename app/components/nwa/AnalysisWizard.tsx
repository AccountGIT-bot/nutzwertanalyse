"use client";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Upload,
  RotateCcw,
  Check,
  HardDrive,
  X,
} from "lucide-react";
import { useAnalysis } from "../../lib/nwa/analysis-context";
import {
  ANALYSIS_STEPS,
  parseAnalysis,
  stepIsValid,
} from "../../lib/nwa/validation";
import { downloadFile } from "../../lib/nwa/local-data";
import type { AnalysisState } from "../../lib/nwa/types";
import { useTranslations } from "../../lib/i18n";
import { DecisionSetup } from "./DecisionSetup";
import { AlternativesManager } from "./AlternativesManager";
import { CriteriaManager } from "./CriteriaManager";
import { WeightingModule } from "./WeightingModule";
import { EvaluationMatrix } from "./EvaluationMatrix";
import { ResultsDashboard } from "./ResultsDashboard";

export function AnalysisWizard() {
  const {
    state,
    dispatch,
    setStep,
    saveDraft,
    reset,
    canProceedToNext,
    storageStatus,
  } = useAnalysis();
  const t = useTranslations();
  const index = ANALYSIS_STEPS.indexOf(state.currentStep);
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState<"reset" | "import" | null>(null);
  const [imported, setImported] = useState<AnalysisState | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const previousStep = useRef(state.currentStep);
  useEffect(() => {
    const timer = setTimeout(() => saveDraft(), 450);
    const flush = () => saveDraft();
    const hidden = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [saveDraft]);
  useEffect(() => {
    if (previousStep.current !== state.currentStep) {
      stageRef.current?.focus();
      previousStep.current = state.currentStep;
    }
  }, [state.currentStep]);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (confirm && !dialog?.open) dialog?.showModal();
    if (!confirm && dialog?.open) dialog.close();
  }, [confirm]);
  const labels = [
    t.steps.decision,
    t.steps.alternatives,
    t.steps.criteria,
    t.steps.weighting,
    t.steps.evaluation,
    t.steps.results,
  ];
  const components = [
    <DecisionSetup key="decision" />,
    <AlternativesManager key="alternatives" />,
    <CriteriaManager key="criteria" />,
    <WeightingModule key="weighting" />,
    <EvaluationMatrix key="evaluation" />,
    <ResultsDashboard key="results" />,
  ];
  function backup() {
    downloadFile(
      JSON.stringify(state, null, 2),
      "DecisionStudio-Sicherung.json",
      "application/json",
    );
    setMessage(
      "Sicherung erstellt. Bewahre die Datei an einem sicheren Ort auf.",
    );
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 2_000_000)
        throw new Error("Die Datei ist zu gross (maximal 2 MB).");
      const parsed = parseAnalysis(JSON.parse(await file.text()));
      if (!parsed)
        throw new Error(
          "Die Datei enthält keine gültige DecisionStudio-Analyse.",
        );
      setImported(parsed);
      setConfirm("import");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Die Datei konnte nicht gelesen werden.",
      );
    }
    if (fileRef.current) fileRef.current.value = "";
  }
  const hints: Record<string, string> = {
    decision: "Gib deiner Entscheidung einen Titel.",
    alternatives:
      "Erfasse mindestens zwei benannte Alternativen (Basic: maximal 5, sonst 10).",
    criteria:
      "Erfasse mindestens zwei benannte Kriterien und gültige K.O.-Schwellen.",
    weighting: state.weightingMethod.startsWith("ahp")
      ? "Bestätige jeden paarweisen Vergleich, auch bei gleicher Wichtigkeit."
      : state.weightingMethod === "percentage"
        ? "Die Gewichte müssen zusammen 100 % ergeben."
        : "Wähle für jedes Kriterium eine Wichtigkeit von 1 bis 5.",
    evaluation:
      "Bewerte jede Alternative bei jedem Kriterium. Im Business-Umfang gilt das für alle Bewertenden.",
  };
  return (
    <main id="main-content" className="wizard-shell">
      <div className="wizard-top">
        <div>
          <p className="eyebrow">
            DEIN ENTSCHEIDUNGSRAUM / {state.decision.packageLevel.toUpperCase()}
          </p>
          <h1>{state.decision.title || "Neue Analyse"}</h1>
        </div>
        <div className="wizard-tools">
          <button
            onClick={backup}
            title="Sicherung herunterladen"
            aria-label="Sicherung herunterladen"
          >
            <Download size={19} />
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            title="Sicherung importieren"
            aria-label="Sicherung importieren"
          >
            <Upload size={19} />
          </button>
          <button
            onClick={() => setConfirm("reset")}
            title="Analyse zurücksetzen"
            aria-label="Analyse zurücksetzen"
          >
            <RotateCcw size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => importFile(e.target.files?.[0])}
          />
        </div>
      </div>
      <div className="save-status" role="status">
        <HardDrive size={15} />
        {storageStatus === "error"
          ? "Speichern nicht möglich: Der Entwurf wurde in einem anderen Fenster geändert oder der Browser blockiert die Ablage. Bitte exportieren."
          : storageStatus === "saved"
            ? "Entwurf lokal gespeichert · nur auf diesem Gerät"
            : "Lokaler Entwurf · gib einen Titel ein, um ihn zu speichern"}
      </div>
      {message && (
        <div className="notice" role="status">
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            aria-label="Hinweis schliessen"
          >
            <X size={17} />
          </button>
        </div>
      )}
      <div className="wizard-grid">
        <nav className="wizard-steps" aria-label="Analyseschritte">
          <ol>
            {ANALYSIS_STEPS.map((step, i) => {
              const accessible = ANALYSIS_STEPS.slice(0, i).every((s) =>
                stepIsValid(state, s),
              );
              const complete = i < index && stepIsValid(state, step);
              return (
                <li key={step}>
                  <button
                    onClick={() => setStep(step)}
                    disabled={!accessible}
                    aria-current={i === index ? "step" : undefined}
                  >
                    <span className="step-number">
                      {complete ? (
                        <Check size={17} />
                      ) : (
                        String(i + 1).padStart(2, "0")
                      )}
                    </span>
                    <span>{labels[i]}</span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="workspace-note">
            <strong>Deine Prioritäten zählen.</strong>
            <p>
              Nutze für alle Optionen denselben Massstab. Höhere Bewertungen
              bedeuten immer eine bessere Eignung.
            </p>
          </div>
        </nav>
        <section className="wizard-stage">
          <div ref={stageRef} tabIndex={-1} className="stage-content">
            {components[index]}
          </div>
          <div className="wizard-next">
            <button
              className="studio-button secondary"
              onClick={() => setStep(ANALYSIS_STEPS[index - 1])}
              disabled={index === 0}
            >
              <ArrowLeft size={16} />
              {t.common.back}
            </button>
            <span>{index + 1} / 6</span>
            {index < 5 ? (
              <button
                className="studio-button"
                onClick={() => setStep(ANALYSIS_STEPS[index + 1])}
                disabled={!canProceedToNext}
              >
                {index === 4 ? "Auswerten" : t.common.next}
                <ArrowRight size={17} />
              </button>
            ) : (
              <button className="studio-button secondary" onClick={backup}>
                <Download size={17} /> Sichern
              </button>
            )}
          </div>
          {!canProceedToNext && (
            <p className="step-hint">{hints[state.currentStep]}</p>
          )}
        </section>
      </div>
      <dialog
        ref={dialogRef}
        className="studio-dialog"
        onCancel={() => setConfirm(null)}
        onClose={() => setConfirm(null)}
        aria-labelledby="confirm-title"
      >
        <h2 id="confirm-title">
          {confirm === "reset"
            ? "Analyse zurücksetzen?"
            : "Sicherung übernehmen?"}
        </h2>
        <p>
          Die aktuelle Analyse wird ersetzt. Lade zuerst eine Sicherung
          herunter, wenn du sie behalten möchtest.
        </p>
        <div className="action-row">
          <button
            className="studio-button secondary"
            onClick={() => setConfirm(null)}
            autoFocus
          >
            Abbrechen
          </button>
          <button className="studio-button secondary" onClick={backup}>
            Sicherung laden
          </button>
          <button
            className="studio-button"
            onClick={() => {
              if (confirm === "reset") {
                reset();
                setMessage("Analyse zurückgesetzt.");
              } else if (imported) {
                dispatch({ type: "LOAD_STATE", payload: imported });
                setMessage("Analyse importiert.");
              }
              setConfirm(null);
            }}
          >
            {confirm === "reset" ? "Zurücksetzen" : "Übernehmen"}
          </button>
        </div>
      </dialog>
    </main>
  );
}
