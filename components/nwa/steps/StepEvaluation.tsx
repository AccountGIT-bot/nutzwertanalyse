"use client";

import { useMemo, useState } from "react";
import {
  Lightbulb,
  MessageSquare,
  Eraser,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { measuredValue, measureScore, violatesLimit } from "@/lib/nwa/calc";
import type { Alternative, Criterion, Analysis } from "@/lib/nwa/types";
import { StepHeader } from "../Wizard";
import { SegmentedControl, Tip, ProgressBar } from "@/components/ui/Controls";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { seriesColor } from "@/components/charts/Charts";
import { cn, fmt, formatNumber } from "@/lib/utils";

type View = "guided" | "matrix";
type Ratings = Analysis["ratings"][string];

export function StepEvaluation() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const scale = analysis.settings.scale;
  const [evaluatorId, setEvaluatorId] = useState(analysis.evaluators[0]?.id);
  /* Geführt ist Standard: ein Kriterium nach dem anderen, alle Alternativen direkt untereinander */
  const [view, setView] = useState<View>("guided");
  const [noteCell, setNoteCell] = useState<{
    altId: string;
    critId: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const ev =
    analysis.evaluators.find((e) => e.id === evaluatorId) ??
    analysis.evaluators[0];
  const alts = analysis.alternatives.filter((a) => !a.excluded);
  const crits = analysis.criteria;
  const ratings: Ratings = useMemo(
    () => analysis.ratings[ev?.id ?? ""] ?? {},
    [analysis.ratings, ev?.id],
  );

  const { done, total } = useMemo(() => {
    let d = 0;
    for (const a of alts)
      for (const c of crits)
        if (cellDone(analysis, ratings, a.id, c)) d++;
    return { done: d, total: alts.length * crits.length };
  }, [alts, crits, ratings, analysis]);
  const preset = analysis.presetId ? t.presets[analysis.presetId] : undefined;

  const setScore = (altId: string, critId: string, score: number | undefined) =>
    dispatch({
      type: "setRating",
      evaluatorId: ev.id,
      altId,
      critId,
      score: score ?? null,
    });
  const setNote = (altId: string, critId: string, note: string) =>
    dispatch({ type: "setRating", evaluatorId: ev.id, altId, critId, note });
  const legend = t.evaluation.scaleLegend[scale] ?? [];

  if (!ev) return null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="card p-4 sm:p-6">
        <StepHeader
          title={t.evaluation.title}
          lead={fmt(t.evaluation.lead, { min: 1, max: scale })}
        >
          <SegmentedControl<View>
            label={t.evaluation.view}
            value={view}
            onChange={setView}
            size="sm"
            options={[
              { value: "guided", label: t.evaluation.viewGuided },
              { value: "matrix", label: t.evaluation.viewMatrix },
            ]}
          />
        </StepHeader>

        {analysis.evaluators.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {t.evaluation.evaluator}:
            </span>
            <div role="tablist" className="flex flex-wrap gap-1">
              {analysis.evaluators.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  role="tab"
                  aria-selected={e.id === ev.id}
                  onClick={() => setEvaluatorId(e.id)}
                  className={cn(
                    "badge cursor-pointer",
                    e.id === ev.id ? "badge-primary" : "hover:bg-surface-3",
                  )}
                >
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <ProgressBar
              value={total ? done / total : 0}
              label={t.evaluation.progress}
            />
            <p className="mt-1 text-xs text-ink-3">
              {fmt(t.evaluation.progress, { done, total })}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() =>
              dispatch({
                type: "fillRatings",
                evaluatorId: ev.id,
                score: Math.ceil(scale / 2),
              })
            }
            disabled={done === total}
          >
            {fmt(t.evaluation.fillAll, { value: Math.ceil(scale / 2) })}
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-bad"
            onClick={() => setConfirmClear(true)}
            disabled={done === 0}
          >
            <Eraser className="h-3.5 w-3.5" aria-hidden />{" "}
            {t.evaluation.clearAll}
          </button>
        </div>

        {done === total && total > 0 && (
          <p
            role="status"
            className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-good-soft px-4 py-3 text-sm text-good"
          >
            <span className="inline-flex items-center gap-2 font-medium">
              <Check className="h-4 w-4" aria-hidden /> {t.evaluation.allRated}
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                dispatch({ type: "setStep", step: "results" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t.wizard.toResults}{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </p>
        )}

        {view === "guided" ? (
          <GuidedView
            analysis={analysis}
            alts={alts}
            crits={crits}
            ratings={ratings}
            scale={scale}
            legend={legend}
            setScore={setScore}
            setNote={setNote}
          />
        ) : (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-surface py-2 pr-3 text-left text-xs font-semibold text-ink-3"
                  >
                    {t.common.criterion}
                  </th>
                  {alts.map((a) => (
                    <th
                      key={a.id}
                      scope="col"
                      className="px-2 py-2 text-left text-xs font-semibold"
                    >
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: seriesColor(
                              analysis.alternatives.indexOf(a),
                            ),
                          }}
                          aria-hidden
                        />
                        <span className="truncate" title={a.name}>
                          {a.name || t.common.unnamed}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crits.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 max-w-[200px] bg-surface py-2 pr-3 text-left align-top font-medium"
                    >
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate">
                          {c.name || t.common.unnamed}
                        </span>
                        {c.isKnockout && (
                          <span
                            className="badge badge-bad"
                            title={t.criteria.knockoutHint}
                          >
                            <KnockoutLabel c={c} />
                          </span>
                        )}
                        {c.measure && (
                          <span className="badge badge-primary">
                            {c.measure.unit || t.evaluation.measureValue}
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <div className="mt-0.5 text-xs font-normal text-ink-3">
                          {c.description}
                        </div>
                      )}
                    </th>
                    {alts.map((a) => {
                      const r = ratings[a.id]?.[c.id];
                      const failed =
                        c.isKnockout &&
                        typeof r?.score === "number" &&
                        typeof c.minScore === "number" &&
                        r.score < c.minScore;
                      return (
                        <td key={a.id} className="px-2 py-2 align-top">
                          {c.measure ? (
                            <MeasureInput analysis={analysis} altId={a.id} crit={c} label={`${a.name} – ${c.name}`} compact />
                          ) : (
                            <ScorePicker
                              scale={scale}
                              value={r?.score}
                              onChange={(v) => setScore(a.id, c.id, v)}
                              label={`${a.name} – ${c.name}`}
                              failed={failed}
                              size={scale === 10 ? "sm" : "md"}
                            />
                          )}
                          <button
                            type="button"
                            className={cn(
                              "mt-1 inline-flex items-center gap-1 rounded px-1 text-[11px]",
                              r?.note
                                ? "text-primary"
                                : "text-ink-3 hover:text-ink",
                            )}
                            onClick={() =>
                              setNoteCell({ altId: a.id, critId: c.id })
                            }
                            aria-label={`${t.evaluation.note}: ${a.name} – ${c.name}`}
                          >
                            <MessageSquare className="h-3 w-3" aria-hidden />
                            {r?.note
                              ? r.note.slice(0, 24) +
                                (r.note.length > 24 ? "…" : "")
                              : t.evaluation.note}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        {preset?.tips && preset.tips.length > 0 && <UseCaseTips title={fmt(t.evaluation.useCaseTips, { label: preset.label })} tips={preset.tips} />}
        <div className="card p-5">
          <h2 className="text-sm font-semibold">{t.decision.scale}</h2>
          <ol className="mt-2 grid grid-cols-5 gap-1 text-center text-[11px] text-ink-2">
            {Array.from({ length: scale }, (_, i) => i + 1)
              .filter((v) => legend[v - 1])
              .map((v) => (
                <li key={v}>
                  <div className="font-bold text-ink">{v}</div>
                  <div>{legend[v - 1]}</div>
                </li>
              ))}
          </ol>
        </div>
        <Tip>
          <div className="flex gap-2">
            <Lightbulb
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden
            />
            <ul className="space-y-1.5">
              {t.evaluation.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </Tip>
      </aside>

      {noteCell && (
        <NoteDialog
          value={ratings[noteCell.altId]?.[noteCell.critId]?.note ?? ""}
          title={`${analysis.alternatives.find((a) => a.id === noteCell.altId)?.name} – ${crits.find((c) => c.id === noteCell.critId)?.name}`}
          onClose={() => setNoteCell(null)}
          onSave={(note) => {
            setNote(noteCell.altId, noteCell.critId, note);
            setNoteCell(null);
          }}
        />
      )}
      <ConfirmDialog
        open={confirmClear}
        title={t.evaluation.clearAll}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          dispatch({ type: "clearRatings", evaluatorId: ev.id });
          setConfirmClear(false);
        }}
      />
    </div>
  );
}

/**
 * Geführte Bewertung: ein Kriterium pro Schritt, alle Alternativen untereinander mit grosser Skala.
 * Startet beim ersten Kriterium mit offenen Feldern.
 */
function GuidedView({
  analysis,
  alts,
  crits,
  ratings,
  scale,
  legend,
  setScore,
  setNote,
}: {
  analysis: Analysis;
  alts: Alternative[];
  crits: Criterion[];
  ratings: Ratings;
  scale: number;
  legend: string[];
  setScore: (altId: string, critId: string, score: number | undefined) => void;
  setNote: (altId: string, critId: string, note: string) => void;
}) {
  const { t } = useI18n();
  const { dispatch } = useAnalysis();
  const ratedCount = (c: Criterion) =>
    alts.filter((a) => cellDone(analysis, ratings, a.id, c)).length;
  const firstOpen = crits.findIndex((c) => ratedCount(c) < alts.length);
  const [idx, setIdx] = useState(Math.max(0, firstOpen));
  const safeIdx = Math.min(idx, Math.max(0, crits.length - 1));
  const c = crits[safeIdx];
  if (!c || alts.length === 0)
    return (
      <p className="text-sm text-ink-3">{t.wizard.missing.alternatives}</p>
    );
  const here = ratedCount(c);
  const complete = here === alts.length;
  const last = safeIdx === crits.length - 1;
  const legendPairs = legend
    .map((l, i) => ({ v: i + 1, l }))
    .filter((x) => x.l);

  return (
    <section
      aria-labelledby="guided-h"
      className="rounded-2xl border border-line bg-surface-2/50 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">
          {fmt(t.evaluation.guidedProgress, {
            current: safeIdx + 1,
            total: crits.length,
          })}
        </p>
        <ol className="flex flex-wrap gap-1" aria-label={t.evaluation.progress}>
          {crits.map((cc, i) => (
            <li key={cc.id}>
              <button
                type="button"
                onClick={() => setIdx(i)}
                aria-current={i === safeIdx ? "step" : undefined}
                aria-label={`${i + 1}. ${cc.name || t.common.unnamed}`}
                title={cc.name || t.common.unnamed}
                className={cn(
                  "block h-2 w-5 rounded-full transition-colors",
                  i === safeIdx
                    ? "bg-primary"
                    : ratedCount(cc) === alts.length
                      ? "bg-good"
                      : ratedCount(cc) > 0
                        ? "bg-warn/70"
                        : "bg-surface-3",
                )}
              />
            </li>
          ))}
        </ol>
      </div>
      <h2
        id="guided-h"
        className="mt-2 flex flex-wrap items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
      >
        {c.name || t.common.unnamed}
        {c.isKnockout && (
          <span className="badge badge-bad" title={t.criteria.knockoutHint}>
            <KnockoutLabel c={c} />
          </span>
        )}
        {c.measure && <span className="badge badge-primary">{c.measure.unit || t.evaluation.measureValue}</span>}
      </h2>
      {c.description && (
        <p className="mt-1 text-sm text-ink-2">{c.description}</p>
      )}
      {c.measure ? (
        <p className="mt-3 text-xs text-ink-3">
          {fmt(c.measure.direction === "lower" ? t.evaluation.ruleLower : t.evaluation.ruleHigher, { max: scale })} {t.evaluation.measureShared}
        </p>
      ) : (
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-3">
          {legendPairs.map((x) => (
            <span key={x.v}>
              <span className="font-semibold text-ink-2">{x.v}</span> {x.l}
            </span>
          ))}
        </p>
      )}

      <ul className="mt-4 space-y-3">
        {alts.map((a) => {
          const r = ratings[a.id]?.[c.id];
          const failed =
            c.isKnockout &&
            typeof r?.score === "number" &&
            typeof c.minScore === "number" &&
            r.score < c.minScore;
          return (
            <li
              key={a.id}
              className={cn(
                "rounded-xl border bg-surface p-3 sm:p-4",
                cellDone(analysis, ratings, a.id, c)
                  ? "border-line"
                  : "border-dashed border-line-strong",
              )}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
                <span className="flex min-w-0 items-center gap-2 font-semibold md:w-52 md:shrink-0">
                  <span
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      background: seriesColor(analysis.alternatives.indexOf(a)),
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 break-words leading-snug">{a.name || t.common.unnamed}</span>
                </span>
                {c.measure ? (
                  <MeasureInput analysis={analysis} altId={a.id} crit={c} label={`${a.name} – ${c.name}`} />
                ) : (
                  <ScorePicker
                    scale={scale}
                    value={r?.score}
                    onChange={(v) => setScore(a.id, c.id, v)}
                    label={`${a.name} – ${c.name}`}
                    failed={failed}
                    size="lg"
                  />
                )}
              </div>
              <input
                className="input mt-2 text-sm"
                placeholder={t.evaluation.notePlaceholder}
                value={r?.note ?? ""}
                maxLength={1000}
                onChange={(e) => setNote(a.id, c.id, e.target.value)}
                aria-label={`${t.evaluation.note}: ${a.name} – ${c.name}`}
              />
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={safeIdx === 0}
          onClick={() => setIdx(safeIdx - 1)}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />{" "}
          {t.evaluation.prevCriterion}
        </button>
        <span className={cn("text-xs", complete ? "text-good" : "text-ink-3")}>
          {fmt(t.evaluation.ratedOf, { done: here, total: alts.length })}
        </span>
        {last ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              dispatch({ type: "setStep", step: "results" });
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            {t.wizard.toResults} <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            className={cn("btn", complete ? "btn-primary" : "btn-secondary")}
            onClick={() => setIdx(safeIdx + 1)}
          >
            {t.evaluation.nextCriterion}{" "}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        )}
      </div>
      {firstOpen >= 0 && firstOpen !== safeIdx && (
        <p className="mt-3 text-right text-xs">
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => setIdx(firstOpen)}
          >
            {t.evaluation.jumpOpen}
          </button>
        </p>
      )}
    </section>
  );
}

/** Skala als Reihe: Gewählter Wert gefüllt, darunterliegende Werte leicht getönt, so liest sich die Zeile wie ein Balken. */
function ScorePicker({
  scale,
  value,
  onChange,
  label,
  failed,
  size = "md",
}: {
  scale: number;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  label: string;
  failed?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("score-row rounded-lg", failed && "ring-2 ring-bad/50")}
    >
      {Array.from({ length: scale }, (_, i) => i + 1).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={cn(
            "score-btn",
            size === "sm" && "score-btn-sm",
            size === "lg" && "score-btn-lg",
            typeof value === "number" && v < value && "is-below",
          )}
          onClick={() => onChange(value === v ? undefined : v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function NoteDialog({
  value,
  title,
  onClose,
  onSave,
}: {
  value: string;
  title: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(value);
  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-5 shadow-lg"
      aria-labelledby="note-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <h2 id="note-title" className="text-base font-semibold">
        {t.evaluation.note}
      </h2>
      <p className="mt-0.5 text-xs text-ink-3">{title}</p>
      <textarea
        className="input mt-3"
        value={draft}
        maxLength={1000}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={t.evaluation.notePlaceholder}
        autoFocus
      />
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t.common.cancel}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onSave(draft)}
        >
          {t.common.save}
        </button>
      </div>
    </dialog>
  );
}

/** Erfasst? Messwert-Kriterien über den Messwert, sonst über die Punktzahl der aktuellen Bewertenden */
function cellDone(analysis: Analysis, ratings: Ratings, altId: string, c: Criterion): boolean {
  return c.measure ? measuredValue(analysis, altId, c.id) !== null : typeof ratings[altId]?.[c.id]?.score === "number";
}

/** «K.-o. ≥ 6» bzw. bei Messwerten «K.-o. max. 400 000 CHF» */
function KnockoutLabel({ c }: { c: Criterion }) {
  const { t, tag } = useI18n();
  if (c.measure) {
    if (typeof c.measure.limit !== "number") return <>{t.evaluation.knockoutBadge}</>;
    return (
      <>
        {t.evaluation.knockoutBadge}{" "}
        {fmt(c.measure.direction === "lower" ? t.evaluation.limitMax : t.evaluation.limitMin, {
          limit: formatNumber(c.measure.limit, tag, 2),
          unit: c.measure.unit,
        })}
      </>
    );
  }
  return (
    <>
      {t.evaluation.knockoutBadge} {fmt(t.evaluation.minBadge, { min: c.minScore ?? "" })}
    </>
  );
}

/** Zahl in Schweizer oder internationaler Schreibweise lesen: 100'000, 100 000, 12,5, 12.5 */
export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/['’\s  ]/g, "").replace(",", ".");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Messwert-Eingabe mit Einheit und errechneten Punkten */
function MeasureInput({ analysis, altId, crit, label, compact }: { analysis: Analysis; altId: string; crit: Criterion; label: string; compact?: boolean }) {
  const { t, tag } = useI18n();
  const { dispatch } = useAnalysis();
  const value = measuredValue(analysis, altId, crit.id);
  const formatted = value === null ? "" : formatNumber(value, tag, 2);
  const [draft, setDraft] = useState(formatted);
  const [focused, setFocused] = useState(false);
  /* Beim Fokus bleibt der angezeigte Text gleich, sonst ginge die Markierung verloren und neue Eingaben würden angehängt */
  const shown = focused ? draft : formatted;
  const score = value === null ? null : measureScore(analysis, crit, value);
  const out = violatesLimit(crit, value);
  return (
    <div className={cn("flex min-w-0 flex-1 flex-wrap items-center gap-2", compact && "min-w-[9rem]")}>
      <div className="relative min-w-0 flex-1">
        <input
          className={cn("input tabular", crit.measure?.unit ? "pr-20" : "", compact && "py-1.5 text-sm", out && "border-bad ring-1 ring-bad/40")}
          type="text"
          inputMode="decimal"
          aria-label={`${label} (${crit.measure?.unit || t.evaluation.measureValue})`}
          placeholder={t.evaluation.measurePlaceholder}
          value={shown}
          onFocus={() => {
            setDraft(formatted);
            setFocused(true);
          }}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            setDraft(e.target.value);
            dispatch({ type: "setMeasure", altId, critId: crit.id, value: parseNumber(e.target.value) });
          }}
        />
        {crit.measure?.unit && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-ink-3">{crit.measure.unit}</span>
        )}
      </div>
      <span
        className={cn(
          "inline-flex min-w-[4.5rem] justify-center rounded-lg px-2 py-1 text-xs font-semibold tabular",
          score === null ? "bg-surface-2 text-ink-3" : out ? "bg-bad-soft text-bad" : "bg-primary-soft text-primary",
        )}
        aria-live="polite"
      >
        {score === null ? "–" : fmt(t.evaluation.measurePoints, { score: formatNumber(score, tag, 1) })}
      </span>
    </div>
  );
}

/** Fallspezifische Tipps der gewählten Vorlage */
export function UseCaseTips({ title, tips }: { title: string; tips: string[] }) {
  return (
    <div className="card border-primary/25 p-5 text-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="h-4 w-4 text-primary" aria-hidden /> {title}
      </h2>
      <ul className="mt-2 list-disc space-y-1.5 pl-4 text-ink-2">
        {tips.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </div>
  );
}
