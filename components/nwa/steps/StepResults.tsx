"use client";

import { useMemo, useState } from "react";
import {
  Trophy,
  AlertTriangle,
  Ban,
  Info,
  RotateCcw,
  Check,
  ArrowRight,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import {
  knockoutReasons,
  computeResults,
  resultsWithWeights,
  robustness,
  sensitivity,
} from "@/lib/nwa/calc";
import {
  CATEGORY_IDS,
  type Results,
  type RobustnessResult,
} from "@/lib/nwa/types";
import { StepHeader } from "../Wizard";
import { ExportPanel } from "../ExportPanel";
import {
  HBarChart,
  StackedBarChart,
  RadarChart,
  SensitivityBars,
  seriesColor,
} from "@/components/charts/Charts";
import { cn, fmt, formatNumber, listFormat } from "@/lib/utils";

export function StepResults() {
  const { t, tag } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const results = useMemo(() => computeResults(analysis), [analysis]);
  const sens = useMemo(
    () => sensitivity(analysis, results),
    [analysis, results],
  );
  const robust: RobustnessResult = useMemo(
    () => robustness(analysis, results, { runs: 1000, seed: 1 }),
    [analysis, results],
  );
  const [whatIf, setWhatIf] = useState<Record<string, number> | null>(null);
  type Tab = "overview" | "details" | "robustness" | "report";
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: Tab[] = ["overview", "details", "robustness", "report"];

  const shown: Results = useMemo(
    () => (whatIf ? resultsWithWeights(analysis, whatIf) : results),
    [analysis, results, whatIf],
  );
  const altName = (id: string) =>
    analysis.alternatives.find((a) => a.id === id)?.name || t.common.unnamed;
  const critName = (id: string) =>
    analysis.criteria.find((c) => c.id === id)?.name || t.common.unnamed;
  const koReasons = (r: { alternativeId: string; failedCriteria: string[] }) =>
    knockoutReasons(
      analysis,
      r as Parameters<typeof knockoutReasons>[1],
      (n) => formatNumber(n, tag, 2),
      {
        unnamed: t.common.unnamed,
        limitMax: t.evaluation.limitMax,
        limitMin: t.evaluation.limitMin,
      },
    ).join(", ");
  const rec = shown.recommendation;
  const winner = rec.winnerId ? altName(rec.winnerId) : null;
  const isTie = rec.confidence === "tie";
  const koLeader = rec.koLeaderId
    ? shown.alternatives.find((x) => x.alternativeId === rec.koLeaderId)
    : undefined;
  const scale = analysis.settings.scale;
  const validAlts = analysis.alternatives.filter((a) => !a.excluded);

  const rankingRows = shown.alternatives
    .slice()
    .sort((a, b) => (a.rank || 99) - (b.rank || 99) || b.total - a.total)
    .map((r) => ({
      label: altName(r.alternativeId),
      value: r.percent,
      muted: r.knockedOut || r.excluded,
      valueLabel: `${formatNumber(r.percent, tag, 1)} %`,
    }));

  const stackedRows = shown.alternatives
    .filter((r) => !r.excluded)
    .slice()
    .sort((a, b) => b.total - a.total)
    .map((r) => ({
      label: altName(r.alternativeId),
      muted: r.knockedOut,
      segments: r.contributions.map((c) => ({
        key: c.criterionId,
        value: c.weightedScore,
      })),
    }));

  const radarSeries = shown.alternatives
    .filter((r) => !r.excluded)
    .map((r) => ({
      label: altName(r.alternativeId),
      values: r.contributions.map((c) => c.rawScore),
    }));

  const categories = CATEGORY_IDS.filter((cat) =>
    analysis.criteria.some((c) => c.categoryId === cat),
  );

  return (
    <div className="space-y-6">
      <StepHeader title={t.results.title} lead={t.results.lead} />

      {/* Empfehlung */}
      <section
        className={cn(
          "card border-2 p-5 sm:p-6",
          rec.confidence === "high"
            ? "border-good/50"
            : rec.confidence === "medium"
              ? "border-warn/50"
              : "border-line",
        )}
        aria-labelledby="rec-h"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Trophy className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h2
              id="rec-h"
              className="text-xs font-semibold uppercase tracking-wider text-ink-3"
            >
              {t.results.winner}
            </h2>
            {winner && rec.winnerId ? (
              <>
                <p className="mt-1 text-xl font-bold sm:text-2xl">
                  {isTie
                    ? fmt(t.results.tieText, {
                        names: listFormat(
                          rec.tiedIds.map((id) => `«${altName(id)}»`),
                          tag,
                        ),
                        percent: formatNumber(shown.ranking[0].percent, tag, 1),
                      })
                    : fmt(t.results.winnerText, {
                        name: winner,
                        percent: formatNumber(shown.ranking[0].percent, tag, 1),
                      })}
                </p>
                {isTie ? null : rec.runnerUpId ? (
                  <p className="mt-1 text-sm text-ink-2">
                    {fmt(t.results.lead_, {
                      points: formatNumber(rec.leadPoints, tag, 1),
                      relative: formatNumber(rec.leadRelative, tag, 1),
                      runnerUp: altName(rec.runnerUpId),
                    })}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-ink-2">{t.results.single}</p>
                )}
                <p
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium",
                    rec.confidence === "high"
                      ? "bg-good-soft text-good"
                      : rec.confidence === "medium"
                        ? "bg-warn-soft text-warn"
                        : "bg-surface-2 text-ink-2",
                  )}
                >
                  {rec.confidence === "high" ? (
                    <Check className="h-4 w-4" aria-hidden />
                  ) : (
                    <Info className="h-4 w-4" aria-hidden />
                  )}
                  {t.results.confidence[rec.confidence]}
                </p>
                {koLeader && (
                  <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-2">
                    <Info
                      className="mt-0.5 h-4 w-4 shrink-0 text-warn"
                      aria-hidden
                    />
                    <span>
                      {fmt(t.results.koLeader, {
                        name: altName(koLeader.alternativeId),
                        percent: formatNumber(koLeader.percent, tag, 1),
                        criteria: koReasons(koLeader),
                      })}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-semibold">
                  {t.results.noAlternatives}
                </p>
                {shown.alternatives.some((r) => r.knockedOut) && (
                  <p className="mt-1 text-sm text-ink-2">
                    {t.results.allKnockedOut}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        {shown.completeness < 1 && (
          <div
            role="status"
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink"
          >
            <span className="flex min-w-0 items-start gap-2">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0 text-warn"
                aria-hidden
              />
              <span>
                <strong className="block">{t.results.incompleteTitle}</strong>
                {fmt(t.results.incomplete, {
                  percent: Math.round(shown.completeness * 100),
                })}
              </span>
            </span>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                dispatch({ type: "setStep", step: "evaluation" });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              {t.results.continueRating}{" "}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        )}
        {shown.alternatives.some((r) => r.knockedOut) && (
          <ul className="mt-3 space-y-1">
            {shown.alternatives
              .filter((r) => r.knockedOut)
              .map((r) => (
                <li
                  key={r.alternativeId}
                  className="flex items-center gap-2 rounded-lg bg-bad-soft px-3 py-2 text-sm"
                >
                  <Ban className="h-4 w-4 shrink-0 text-bad" aria-hidden />
                  <span>
                    <strong>{altName(r.alternativeId)}</strong> –{" "}
                    {t.results.knockedOut}:{" "}
                    {fmt(t.results.knockedOutText, {
                      criteria: koReasons(r),
                    })}
                  </span>
                </li>
              ))}
          </ul>
        )}
      </section>

      <p className="text-sm text-ink-3">{t.results.readingHelp}</p>

      {/* Reiter: Überblick, Stärken & Details, Robustheit, Bericht */}
      <div
        role="tablist"
        aria-label={t.results.title}
        className="rtabs -mx-4 px-4 sm:mx-0 sm:px-0"
      >
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`rtab-${id}`}
            aria-selected={tab === id}
            aria-controls={`rpanel-${id}`}
            className="rtab"
            onClick={() => setTab(id)}
          >
            {t.results.tabs[id]}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id="rpanel-overview"
        aria-labelledby="rtab-overview"
        hidden={tab !== "overview"}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Rangliste */}
        <section className="card p-5" aria-labelledby="rank-h">
          <h2 id="rank-h" className="text-base font-semibold">
            {t.results.ranking}
          </h2>
          <div className="mt-4">
            <HBarChart data={rankingRows} ariaLabel={t.results.ranking} />
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink-3">
                <th className="py-1 pr-2 font-medium">{t.common.rank}</th>
                <th className="py-1 pr-2 font-medium">
                  {t.common.alternative}
                </th>
                <th className="py-1 pr-2 text-right font-medium">
                  {t.results.weightedPoints}
                </th>
                <th className="py-1 text-right font-medium">
                  {t.common.score}
                </th>
              </tr>
            </thead>
            <tbody>
              {shown.alternatives
                .slice()
                .sort(
                  (a, b) =>
                    (a.rank || 99) - (b.rank || 99) || b.total - a.total,
                )
                .map((r) => (
                  <tr
                    key={r.alternativeId}
                    className={cn(
                      "border-t border-line",
                      (r.knockedOut || r.excluded) && "text-ink-3",
                    )}
                  >
                    <td className="py-1.5 pr-2 tabular">{r.rank || "–"}</td>
                    <td className="py-1.5 pr-2">
                      <span className="flex items-center gap-1.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            background: seriesColor(
                              analysis.alternatives.findIndex(
                                (a) => a.id === r.alternativeId,
                              ),
                            ),
                          }}
                          aria-hidden
                        />
                        {altName(r.alternativeId)}
                        {r.knockedOut && (
                          <span className="badge badge-bad">
                            {t.results.knockedOut}
                          </span>
                        )}
                        {r.excluded && (
                          <span className="badge">{t.results.excluded}</span>
                        )}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-1.5 pr-2 text-right tabular">
                      {formatNumber(r.total, tag, 2)} / {scale}
                    </td>
                    <td className="whitespace-nowrap py-1.5 text-right font-semibold tabular">
                      {formatNumber(r.percent, tag, 1)} %
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Beiträge */}
        <section className="card p-5" aria-labelledby="contrib-h">
          <h2 id="contrib-h" className="text-base font-semibold">
            {t.results.contributions}
          </h2>
          <p className="mt-1 text-xs text-ink-3">
            {t.results.contributionsLead}
          </p>
          <div className="mt-4">
            <StackedBarChart
              rows={stackedRows}
              series={analysis.criteria.map((c) => ({
                key: c.id,
                label: c.name || t.common.unnamed,
              }))}
              max={scale}
              ariaLabel={t.results.contributions}
              formatValue={(v) => formatNumber(v, tag, 2)}
            />
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id="rpanel-details"
        aria-labelledby="rtab-details"
        hidden={tab !== "details"}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        {/* Profil */}
        {analysis.criteria.length >= 3 && (
          <section className="card p-5" aria-labelledby="profile-h">
            <h2 id="profile-h" className="text-base font-semibold">
              {t.results.profile}
            </h2>
            <p className="mt-1 text-xs text-ink-3">{t.results.profileLead}</p>
            <div className="mt-4">
              <RadarChart
                axes={analysis.criteria.map((c) => c.name || t.common.unnamed)}
                series={radarSeries}
                max={scale}
                ariaLabel={t.results.profile}
              />
            </div>
          </section>
        )}

        {/* Nach Kategorie */}
        {categories.length >= 2 && (
          <section className="card p-5" aria-labelledby="cat-h">
            <h2 id="cat-h" className="text-base font-semibold">
              {t.results.byCategory}
            </h2>
            <p className="mt-1 text-xs text-ink-3">
              {t.results.byCategoryLead}
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-3">
                    <th className="py-1 pr-2 font-medium">
                      {t.common.category}
                    </th>
                    <th className="py-1 pr-2 text-right font-medium">
                      {t.common.weight}
                    </th>
                    {validAlts.map((a) => (
                      <th
                        key={a.id}
                        className="py-1 pl-2 text-right font-medium"
                      >
                        {a.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => {
                    const w = analysis.criteria
                      .filter((c) => c.categoryId === cat)
                      .reduce((s, c) => s + (shown.weights[c.id] ?? 0), 0);
                    return (
                      <tr key={cat} className="border-t border-line">
                        <td className="py-1.5 pr-2">{t.categories[cat]}</td>
                        <td className="py-1.5 pr-2 text-right tabular text-ink-2">
                          {formatNumber(w * 100, tag, 0)} %
                        </td>
                        {validAlts.map((a) => {
                          const r = shown.alternatives.find(
                            (x) => x.alternativeId === a.id,
                          );
                          const v = r?.byCategory[cat] ?? 0;
                          return (
                            <td
                              key={a.id}
                              className="py-1.5 pl-2 text-right tabular"
                            >
                              {w > 0
                                ? `${formatNumber((v / (w * scale)) * 100, tag, 0)} %`
                                : "–"}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Bewertungsmatrix */}
        <section className="card p-5 lg:col-span-2" aria-labelledby="matrix-h">
          <h2 id="matrix-h" className="text-base font-semibold">
            {t.results.matrix}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="text-left text-xs text-ink-3">
                  <th className="py-1 pr-2 font-medium">
                    {t.common.criterion}
                  </th>
                  <th className="py-1 pr-2 text-right font-medium">
                    {t.common.weight}
                  </th>
                  {validAlts.map((a) => (
                    <th key={a.id} className="py-1 pl-2 text-right font-medium">
                      {a.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {analysis.criteria.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <td className="py-1.5 pr-2">
                      {c.name}
                      {c.isKnockout && (
                        <span className="badge badge-bad ml-1.5">K.-o.</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular text-ink-2">
                      {formatNumber((shown.weights[c.id] ?? 0) * 100, tag, 1)} %
                    </td>
                    {validAlts.map((a) => {
                      const r = shown.alternatives.find(
                        (x) => x.alternativeId === a.id,
                      );
                      const contrib = r?.contributions.find(
                        (x) => x.criterionId === c.id,
                      );
                      const best = Math.max(
                        ...validAlts.map(
                          (aa) =>
                            shown.alternatives
                              .find((x) => x.alternativeId === aa.id)
                              ?.contributions.find(
                                (x) => x.criterionId === c.id,
                              )?.rawScore ?? 0,
                        ),
                      );
                      return (
                        <td
                          key={a.id}
                          className={cn(
                            "py-1.5 pl-2 text-right tabular",
                            contrib?.rated &&
                              contrib.rawScore === best &&
                              best > 0 &&
                              "font-semibold text-good",
                          )}
                        >
                          {contrib?.rated ? (
                            formatNumber(contrib.rawScore, tag, 1)
                          ) : (
                            <span className="text-ink-3">–</span>
                          )}
                          {typeof contrib?.value === "number" && (
                            <span className="block text-[11px] font-normal text-ink-3">
                              {formatNumber(contrib.value, tag, 2)}{" "}
                              {c.measure?.unit}
                            </span>
                          )}
                          <span className="ml-1 text-[11px] text-ink-3">
                            (
                            {contrib
                              ? formatNumber(contrib.weightedScore, tag, 2)
                              : "–"}
                            )
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="border-t-2 border-line-strong font-semibold">
                  <td className="py-1.5 pr-2">{t.common.total}</td>
                  <td className="whitespace-nowrap py-1.5 pr-2 text-right tabular">
                    100 %
                  </td>
                  {validAlts.map((a) => (
                    <td key={a.id} className="py-1.5 pl-2 text-right tabular">
                      {formatNumber(
                        shown.alternatives.find((x) => x.alternativeId === a.id)
                          ?.total ?? 0,
                        tag,
                        2,
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id="rpanel-robustness"
        aria-labelledby="rtab-robustness"
        hidden={tab !== "robustness"}
        className="space-y-6"
      >
        {/* Sensitivität */}
        <section className="card p-5" aria-labelledby="sens-h">
          <h2 id="sens-h" className="text-base font-semibold">
            {t.results.sensitivity}
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-ink-3">
            {t.results.sensitivityLead}
          </p>
          {sens.length === 0 ? (
            <p className="mt-4 text-sm text-ink-3">
              {t.results.sensitivityNone}
            </p>
          ) : (
            <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <SensitivityBars
                rows={sens.map((s) => ({
                  label: critName(s.criterionId),
                  current: s.currentWeight,
                  flip: s.flipWeight,
                  impact: s.impact,
                }))}
                ariaLabel={t.results.sensitivity}
                robustLabel={t.results.robust}
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-3">
                      <th className="py-1 pr-2 font-medium">
                        {t.common.criterion}
                      </th>
                      <th className="py-1 pr-2 text-right font-medium">
                        {t.results.currentWeight}
                      </th>
                      <th className="py-1 pr-2 text-right font-medium">
                        {t.results.flipWeight}
                      </th>
                      <th className="py-1 pr-2 font-medium">
                        {t.results.flipTo}
                      </th>
                      <th className="py-1 text-right font-medium">
                        {t.common.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sens.map((s) => (
                      <tr key={s.criterionId} className="border-t border-line">
                        <td className="py-1.5 pr-2">
                          {critName(s.criterionId)}
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-2 text-right tabular">
                          {formatNumber(s.currentWeight * 100, tag, 1)} %
                        </td>
                        <td className="whitespace-nowrap py-1.5 pr-2 text-right tabular">
                          {s.flipWeight === null
                            ? "–"
                            : `${formatNumber(s.flipWeight * 100, tag, 1)} %`}
                        </td>
                        <td className="py-1.5 pr-2">
                          {s.flipToId ? altName(s.flipToId) : "–"}
                        </td>
                        <td className="py-1.5 text-right">
                          <span
                            className={cn(
                              "badge",
                              s.impact === "high"
                                ? "badge-bad"
                                : s.impact === "medium"
                                  ? "badge-warn"
                                  : "badge-good",
                            )}
                          >
                            {t.results.impact[s.impact]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {/* Was-wäre-wenn */}
        {analysis.criteria.length >= 2 && (
          <section className="card p-5" aria-labelledby="whatif-h">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 id="whatif-h" className="text-base font-semibold">
                  {t.results.whatIf}
                </h2>
                <p className="mt-1 max-w-2xl text-xs text-ink-3">
                  {t.results.whatIfLead}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={!whatIf}
                  onClick={() => setWhatIf(null)}
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden />{" "}
                  {t.results.whatIfReset}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={!whatIf}
                  onClick={() => {
                    if (whatIf)
                      dispatch({ type: "applyWeights", weights: whatIf });
                    setWhatIf(null);
                  }}
                >
                  {t.results.whatIfApply}
                </button>
              </div>
            </div>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {analysis.criteria.map((c) => {
                const base = results.weights[c.id] ?? 0;
                const v = whatIf ? whatIf[c.id] : base;
                const normalized = shown.weights[c.id] ?? 0;
                return (
                  <li key={c.id}>
                    <div className="flex items-center justify-between text-sm">
                      <label
                        htmlFor={`wi-${c.id}`}
                        className="truncate font-medium"
                      >
                        {c.name || t.common.unnamed}
                      </label>
                      <span className="tabular text-ink-2">
                        {formatNumber(normalized * 100, tag, 1)} %
                      </span>
                    </div>
                    <input
                      id={`wi-${c.id}`}
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round(v * 100)}
                      className="slider mt-1.5"
                      style={{ ["--fill" as string]: `${v * 100}%` }}
                      onChange={(e) => {
                        const next = {
                          ...(whatIf ??
                            Object.fromEntries(
                              analysis.criteria.map((x) => [
                                x.id,
                                results.weights[x.id] ?? 0,
                              ]),
                            )),
                        };
                        next[c.id] = Number(e.target.value) / 100;
                        setWhatIf(next);
                      }}
                    />
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Robustheit */}
        <section className="card p-5" aria-labelledby="robust-h">
          <h2 id="robust-h" className="text-base font-semibold">
            {t.results.robustness}
          </h2>
          <p className="mt-1 max-w-3xl text-xs text-ink-3">
            {fmt(t.results.robustnessLead, { runs: robust.runs || 1000 })}
          </p>
          {robust.runs > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <HBarChart
                data={validAlts
                  .map((a) => ({
                    label: a.name,
                    value: (robust.winShare[a.id] ?? 0) * 100,
                    valueLabel: `${formatNumber((robust.winShare[a.id] ?? 0) * 100, tag, 0)} %`,
                  }))
                  .sort((x, y) => y.value - x.value)}
                ariaLabel={t.results.winShare}
              />
              <table className="w-full self-start text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-3">
                    <th className="py-1 pr-2 font-medium">
                      {t.common.alternative}
                    </th>
                    <th className="py-1 pr-2 text-right font-medium">
                      {t.results.winShare}
                    </th>
                    <th className="py-1 text-right font-medium">
                      {t.results.meanRank}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {validAlts
                    .slice()
                    .sort(
                      (x, y) =>
                        (robust.winShare[y.id] ?? 0) -
                        (robust.winShare[x.id] ?? 0),
                    )
                    .map((a) => (
                      <tr key={a.id} className="border-t border-line">
                        <td className="py-1.5 pr-2">{a.name}</td>
                        <td className="whitespace-nowrap py-1.5 pr-2 text-right tabular">
                          {formatNumber(
                            (robust.winShare[a.id] ?? 0) * 100,
                            tag,
                            1,
                          )}{" "}
                          %
                        </td>
                        <td className="py-1.5 text-right tabular">
                          {formatNumber(robust.meanRank[a.id] ?? 0, tag, 2)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-3">
              {t.results.noAlternatives}
            </p>
          )}
        </section>
      </div>

      {/* Fazit + Export */}
      <div
        role="tabpanel"
        id="rpanel-report"
        aria-labelledby="rtab-report"
        hidden={tab !== "report"}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
      >
        <section className="card p-5" aria-labelledby="concl-h">
          <h2 id="concl-h" className="text-base font-semibold">
            {t.results.conclusion}
          </h2>
          <textarea
            className="input mt-3 min-h-[160px]"
            value={analysis.conclusion}
            maxLength={5000}
            placeholder={t.results.conclusionPlaceholder}
            onChange={(e) =>
              dispatch({ type: "patch", patch: { conclusion: e.target.value } })
            }
            aria-label={t.results.conclusion}
          />
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer font-medium text-ink-2">
              {t.results.methodology}
            </summary>
            <p className="mt-2 text-xs leading-relaxed text-ink-2">
              {t.results.methodologyText}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-3">
              {t.results.disclaimer}
            </p>
          </details>
        </section>
        <ExportPanel />
      </div>
    </div>
  );
}
