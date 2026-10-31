"use client";

import { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, CheckCircle2, AlertTriangle, RotateCcw } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { computeWeights, getPairValue } from "@/lib/nwa/calc";
import type { WeightingMethod } from "@/lib/nwa/types";
import { StepHeader } from "../Wizard";
import { cn, fmt, formatNumber } from "@/lib/utils";

const METHODS: WeightingMethod[] = ["points", "percent", "ranking", "pairwise"];
const SAATY_VALUES = [9, 7, 5, 3, 1, 1 / 3, 1 / 5, 1 / 7, 1 / 9];
const SAATY_KEYS = ["9", "7", "5", "3", "1", "1/3", "1/5", "1/7", "1/9"] as const;

export function StepWeighting() {
  const { t, tag } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const method = analysis.settings.weighting;
  const { weights, consistency } = useMemo(() => computeWeights(analysis), [analysis]);
  const crits = analysis.criteria;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card p-5 sm:p-6">
        <StepHeader title={t.weighting.title} lead={t.weighting.lead} />

        <fieldset>
          <legend className="text-sm font-semibold">{t.weighting.method}</legend>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {METHODS.map((m) => (
              <label
                key={m}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                  method === m ? "border-primary bg-primary-soft/50" : "border-line bg-surface hover:bg-surface-2",
                )}
              >
                <input type="radio" name="weighting" value={m} checked={method === m} onChange={() => dispatch({ type: "setWeighting", method: m })} className="mt-1 accent-[var(--primary)]" />
                <span>
                  <span className="block text-sm font-semibold">{t.weighting.methods[m].label}</span>
                  <span className="block text-xs text-ink-2">{t.weighting.methods[m].description}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-3">{t.weighting.switchWarning}</p>
        </fieldset>

        <div className="mt-6">
          {method === "points" && <PointsEditor />}
          {method === "percent" && <PercentEditor />}
          {method === "ranking" && <RankingEditor />}
          {method === "pairwise" && <PairwiseEditor />}
        </div>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">{t.weighting.resultingWeights}</h2>
          <ul className="mt-3 space-y-2">
            {crits.map((c) => {
              const w = weights[c.id] ?? 0;
              return (
                <li key={c.id} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate">{c.name || t.common.unnamed}</span>
                    <span className="tabular text-ink-2">{formatNumber(w * 100, tag, 1)} %</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${w * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        {method === "pairwise" && (
          <div className={cn("card p-5", consistency && consistency.n >= 3 && (consistency.isConsistent ? "border-good/40" : "border-bad/40"))}>
            <h2 className="text-sm font-semibold">{t.weighting.consistency}</h2>
            {consistency && consistency.n >= 3 ? (
              <>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  {consistency.isConsistent ? <CheckCircle2 className="h-4 w-4 text-good" aria-hidden /> : <AlertTriangle className="h-4 w-4 text-bad" aria-hidden />}
                  <span className="tabular">
                    {t.weighting.cr}: {consistency.cr.toFixed(3)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-2">{consistency.isConsistent ? t.weighting.consistent : t.weighting.inconsistent}</p>
              </>
            ) : (
              <p className="mt-1 text-xs text-ink-3">{t.weighting.tooSmall}</p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}

function PointsEditor() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  return (
    <ul className="space-y-3">
      {analysis.criteria.map((c) => (
        <li key={c.id} className="rounded-xl border border-line bg-surface-2/40 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{c.name || t.common.unnamed}</span>
            <span className="text-xs text-ink-3">{t.weighting.pointLabels[Math.max(0, Math.min(4, Math.round(c.points) - 1))]}</span>
          </div>
          <div role="radiogroup" aria-label={c.name} className="mt-2 flex gap-1.5">
            {[1, 2, 3, 4, 5].map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={c.points === p}
                aria-label={`${p} – ${t.weighting.pointLabels[p - 1]}`}
                onClick={() => dispatch({ type: "updateCriterion", id: c.id, patch: { points: p } })}
                className="score-btn flex-1"
              >
                {p}
              </button>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

function PercentEditor() {
  const { t, tag } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const sum = analysis.criteria.reduce((s, c) => s + c.percent, 0);
  const ok = Math.abs(sum - 100) < 0.51;
  return (
    <div>
      <div className={cn("mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm", ok ? "bg-good-soft text-good" : "bg-warn-soft text-warn")}>
        <span className="flex items-center gap-2 font-medium">
          {ok ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <AlertTriangle className="h-4 w-4" aria-hidden />}
          {ok ? t.weighting.sumOk : fmt(t.weighting.sumOff, { sum: formatNumber(sum, tag, 0) })}
        </span>
        <span className="flex gap-1">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "equalizePercent" })}>
            {t.weighting.equalize}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "percentFromPoints" })}>
            {t.weighting.fromPoints}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "normalizePercent" })} disabled={ok}>
            {t.weighting.normalize}
          </button>
        </span>
      </div>
      <ul className="space-y-3">
        {analysis.criteria.map((c) => (
          <li key={c.id} className="rounded-xl border border-line bg-surface-2/40 p-3">
            <div className="flex items-center gap-3">
              <label htmlFor={`pct-${c.id}`} className="flex-1 truncate text-sm font-medium">
                {c.name || t.common.unnamed}
              </label>
              <input
                id={`pct-${c.id}`}
                type="number"
                min={0}
                max={100}
                step={1}
                className="input w-24 text-right tabular"
                value={c.percent}
                onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { percent: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } })}
              />
              <span className="w-5 text-sm text-ink-3">%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={c.percent}
              aria-label={`${c.name} (%)`}
              className="slider mt-3"
              style={{ ["--fill" as string]: `${c.percent}%` }}
              onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { percent: Number(e.target.value) } })}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankingEditor() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const crits = analysis.criteria;
  return (
    <div>
      <p className="mb-3 text-sm text-ink-2">{t.weighting.rankingHint}</p>
      <ol className="space-y-2">
        {crits.map((c, i) => (
          <li key={c.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/40 p-2.5 pl-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-ink">{i + 1}</span>
            <span className="flex-1 truncate text-sm font-medium">{c.name || t.common.unnamed}</span>
            <button type="button" className="btn btn-ghost btn-icon" disabled={i === 0} onClick={() => dispatch({ type: "moveCriterion", id: c.id, dir: -1 })} aria-label={t.common.moveUp}>
              <ArrowUp className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost btn-icon" disabled={i === crits.length - 1} onClick={() => dispatch({ type: "moveCriterion", id: c.id, dir: 1 })} aria-label={t.common.moveDown}>
              <ArrowDown className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PairwiseEditor() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const crits = analysis.criteria;
  const pairs = useMemo(() => {
    const out: [number, number][] = [];
    for (let i = 0; i < crits.length; i++) for (let j = i + 1; j < crits.length; j++) out.push([i, j]);
    return out;
  }, [crits]);
  const [cursor, setCursor] = useState(0);
  const done = pairs.filter(([i, j]) => `${crits[i].id}|${crits[j].id}` in analysis.pairwise || `${crits[j].id}|${crits[i].id}` in analysis.pairwise).length;
  const idx = Math.min(cursor, Math.max(0, pairs.length - 1));
  const pair = pairs[idx];
  if (!pair) return <p className="text-sm text-ink-3">{t.criteria.minHint}</p>;
  const a = crits[pair[0]];
  const b = crits[pair[1]];
  const current = getPairValue(analysis.pairwise, a.id, b.id);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-ink-3">
        <span>{fmt(t.weighting.pairwiseProgress, { done, total: pairs.length })}</span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "resetPairwise" })}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden /> {t.weighting.resetPairwise}
        </button>
      </div>
      <div className="rounded-xl border border-line bg-surface-2/40 p-4">
        <p className="text-center text-sm font-medium">{fmt(t.weighting.pairwiseQuestion, { a: a.name || "A", b: b.name || "B" })}</p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-xs font-semibold">
          <span className="truncate text-right text-primary">A · {a.name}</span>
          <span className="text-ink-3">vs.</span>
          <span className="truncate text-accent">B · {b.name}</span>
        </div>
        <div role="radiogroup" aria-label={`${a.name} vs. ${b.name}`} className="mt-3 grid grid-cols-9 gap-1">
          {SAATY_VALUES.map((v, i) => {
            const selected = Math.abs(current - v) < 1e-6;
            return (
              <button
                key={SAATY_KEYS[i]}
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={t.weighting.saaty[SAATY_KEYS[i]]}
                title={t.weighting.saaty[SAATY_KEYS[i]]}
                className="score-btn h-10 text-[11px]"
                onClick={() => {
                  dispatch({ type: "setPairwise", a: a.id, b: b.id, value: v });
                  if (idx < pairs.length - 1) setCursor(idx + 1);
                }}
              >
                {SAATY_KEYS[i]}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-center text-xs text-ink-2">{t.weighting.saaty[SAATY_KEYS[SAATY_VALUES.findIndex((v) => Math.abs(current - v) < 1e-6)] ?? "1"]}</p>
        <div className="mt-4 flex justify-between">
          <button type="button" className="btn btn-secondary btn-sm" disabled={idx === 0} onClick={() => setCursor(idx - 1)}>
            {t.common.back}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" disabled={idx >= pairs.length - 1} onClick={() => setCursor(idx + 1)}>
            {t.common.next}
          </button>
        </div>
      </div>
      <ol className="mt-4 grid grid-cols-1 gap-1 sm:grid-cols-2">
        {pairs.map(([i, j], k) => {
          const set = `${crits[i].id}|${crits[j].id}` in analysis.pairwise || `${crits[j].id}|${crits[i].id}` in analysis.pairwise;
          return (
            <li key={k}>
              <button
                type="button"
                onClick={() => setCursor(k)}
                className={cn("flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left text-xs", k === idx ? "bg-primary-soft text-ink" : "text-ink-2 hover:bg-surface-2")}
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", set ? "bg-good" : "bg-surface-3")} aria-hidden />
                <span className="truncate">
                  {crits[i].name} ↔ {crits[j].name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
