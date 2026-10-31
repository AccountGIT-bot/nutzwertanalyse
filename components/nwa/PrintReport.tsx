"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  knockoutReasons,
  computeResults,
  robustness,
  sensitivity,
} from "@/lib/nwa/calc";
import { CATEGORY_IDS, type Analysis, type CategoryId } from "@/lib/nwa/types";
import {
  FullCharts,
  HBarChart,
  StackedBarChart,
  RadarChart,
  SensitivityBars,
  seriesColor,
} from "@/components/charts/Charts";
import { cn, fmt, formatDate, formatNumber, listFormat } from "@/lib/utils";

/** Text als CSS-String maskieren (Anführungszeichen, Backslashes, spitze Klammern, Zeilenumbrüche). */
function cssString(s: string): string {
  const escaped = s
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/</g, "\\3C ")
    .replace(/>/g, "\\3E ")
    .replace(/[\r\n]+/g, " ");
  return `"${escaped}"`;
}

/** «Seite {{page}} von {{pages}}» → CSS-content mit Seitenzählern. */
function pageCounterContent(template: string): string {
  return template
    .split(/(\{\{page\}\}|\{\{pages\}\})/)
    .filter(Boolean)
    .map((part) =>
      part === "{{page}}"
        ? "counter(page)"
        : part === "{{pages}}"
          ? "counter(pages)"
          : cssString(part),
    )
    .join(" ");
}

const FOOTER_STYLE =
  'font: 8.5pt/1.3 ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; color: #555;';

type SectionKey =
  | "context"
  | "ranking"
  | "profile"
  | "matrix"
  | "sensitivity"
  | "robustness"
  | "notes"
  | "conclusion";

/**
 * Druckbericht: Deckblatt mit Empfehlung und Inhalt, danach nummerierte Abschnitte im Fluss.
 * Titel, Datum und Seitenzahlen stehen in @page-Randboxen (Chromium-basierte Browser); das Deckblatt bleibt ohne Fusszeile.
 */
export function PrintReport({ analysis }: { analysis: Analysis }) {
  const { t, tag } = useI18n();
  const results = useMemo(() => computeResults(analysis), [analysis]);
  const sens = useMemo(
    () => sensitivity(analysis, results),
    [analysis, results],
  );
  /* Gleiche Durchläufe und gleicher Startwert wie in der App, damit Bericht und Bildschirm übereinstimmen */
  const robust = useMemo(
    () => robustness(analysis, results, { runs: 1000, seed: 1 }),
    [analysis, results],
  );
  const altName = (id: string) =>
    analysis.alternatives.find((a) => a.id === id)?.name || t.common.unnamed;
  const critName = (id: string) =>
    analysis.criteria.find((c) => c.id === id)?.name || t.common.unnamed;
  const altIndex = (id: string) =>
    analysis.alternatives.findIndex((a) => a.id === id);
  const validAlts = analysis.alternatives.filter((a) => !a.excluded);
  const scale = analysis.settings.scale;
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
  const rec = results.recommendation;
  const isTie = rec.confidence === "tie";
  const koLeader = rec.koLeaderId
    ? results.alternatives.find((x) => x.alternativeId === rec.koLeaderId)
    : undefined;
  const now = new Date().toISOString();
  const dateLabel = formatDate(now, tag);
  const title = analysis.title || t.common.untitled;

  useEffect(() => {
    const previous = document.documentElement.getAttribute("data-theme");
    document.documentElement.setAttribute("data-theme", "light");
    const h = window.setTimeout(() => window.print(), 600);
    return () => {
      window.clearTimeout(h);
      if (previous)
        document.documentElement.setAttribute("data-theme", previous);
      else document.documentElement.removeAttribute("data-theme");
    };
  }, []);

  const sortedRanking = results.alternatives
    .slice()
    .sort((a, b) => (a.rank || 99) - (b.rank || 99) || b.total - a.total);
  const rankedValid = sortedRanking.filter((r) => !r.excluded);
  const categories = CATEGORY_IDS.filter((cat) =>
    analysis.criteria.some((c) => c.categoryId === cat),
  );
  const catWeight = (cat: CategoryId) =>
    analysis.criteria
      .filter((c) => c.categoryId === cat)
      .reduce((s, c) => s + (results.weights[c.id] ?? 0), 0);
  const catPercent = (
    byCategory: Partial<Record<CategoryId, number>>,
    cat: CategoryId,
  ) => {
    const w = catWeight(cat);
    return w > 0 ? ((byCategory[cat] ?? 0) / (w * scale)) * 100 : null;
  };
  const bestByCat = Object.fromEntries(
    categories.map((cat) => [
      cat,
      Math.max(...rankedValid.map((r) => catPercent(r.byCategory, cat) ?? -1)),
    ]),
  ) as Record<CategoryId, number>;
  const winnerShare = rec.winnerId ? (robust.winShare[rec.winnerId] ?? 0) : 0;
  const manyAlternatives = validAlts.length > 4;

  /* Begründungen je Alternative, in Rangfolge; Kriterien in Analyse-Reihenfolge */
  const noteGroups = rankedValid
    .map((r) => {
      const a = analysis.alternatives.find((x) => x.id === r.alternativeId)!;
      const items: {
        crit: string;
        score: number | undefined;
        ev: string;
        note: string;
      }[] = [];
      for (const ev of analysis.evaluators) {
        for (const c of analysis.criteria) {
          const rt = analysis.ratings[ev.id]?.[a.id]?.[c.id];
          if (rt?.note)
            items.push({
              crit: c.name || t.common.unnamed,
              score: rt.score,
              ev: ev.name,
              note: rt.note,
            });
        }
      }
      return { alt: a, percent: r.percent, rank: r.rank, items };
    })
    .filter((g) => g.items.length > 0);

  const radarSeries = results.alternatives
    .filter((r) => !r.excluded)
    .map((r) => ({
      label: altName(r.alternativeId),
      values: r.contributions.map((c) => c.rawScore),
    }));
  const hasContext = Boolean(
    analysis.description || analysis.goal || analysis.constraints,
  );
  const showProfile = analysis.criteria.length >= 3 && radarSeries.length > 0;

  /* Abschnitte in Reihenfolge; die Nummerierung folgt daraus und steht auch im Inhalt auf dem Deckblatt */
  const matrixEntry = { key: "matrix", label: t.results.matrix };
  const sections = (
    [
      hasContext && { key: "context", label: t.report.context },
      { key: "ranking", label: t.results.ranking },
      showProfile && { key: "profile", label: t.results.profile },
      !manyAlternatives && matrixEntry,
      sens.length > 0 && { key: "sensitivity", label: t.results.sensitivity },
      robust.runs > 0 && { key: "robustness", label: t.results.robustness },
      noteGroups.length > 0 && { key: "notes", label: t.report.notes },
      Boolean(analysis.conclusion) && {
        key: "conclusion",
        label: t.results.conclusion,
      },
      manyAlternatives && matrixEntry,
    ] as (false | { key: SectionKey; label: string })[]
  ).filter((s): s is { key: SectionKey; label: string } => Boolean(s));
  const no = (key: SectionKey) => sections.findIndex((s) => s.key === key) + 1;

  const keyFigures: [string, string | number][] = [
    [t.report.alternativesCount, validAlts.length],
    [t.report.criteriaCount, analysis.criteria.length],
    [t.report.method, t.weighting.methods[analysis.settings.weighting].label],
    [t.report.scale, `1–${scale}`],
    [t.report.completeness, `${Math.round(results.completeness * 100)} %`],
  ];

  /* Fusszeile über @page-Randboxen: links Titel und Datum, rechts Seitenzahl; das Deckblatt bleibt frei */
  const footerTitle =
    title.length > 60 ? `${title.slice(0, 59).trimEnd()}…` : title;
  const pageCss =
    `@media print{@page{@bottom-left{content:${cssString(`${footerTitle} · ${dateLabel}`)};${FOOTER_STYLE}}` +
    `@bottom-right{content:${pageCounterContent(t.report.pageOf)} " · nutzwertanalyse.com";${FOOTER_STYLE}}}` +
    `@page :first{@bottom-left{content:none}@bottom-right{content:none}}}`;

  /* Bewertungsmatrix: ab fünf Alternativen im Querformat und als Anhang am Ende des Berichts */
  const matrix = (
    <section
      className={cn("report-section", manyAlternatives && "print-landscape")}
      aria-labelledby="rep-matrix"
    >
      <div className="report-keep">
        <h2 id="rep-matrix" className="report-h2">
          <span className="report-num">{no("matrix")}</span> {t.results.matrix}
        </h2>
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-400 text-left text-neutral-600">
              <th className="py-1 pr-2">{t.common.criterion}</th>
              <th className="py-1 pr-2">{t.common.category}</th>
              <th className="py-1 pr-2 text-right">{t.common.weight}</th>
              {validAlts.map((a) => (
                <th key={a.id} className="py-1 pl-2 text-right">
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analysis.criteria.map((c) => {
              const best = Math.max(
                ...validAlts.map(
                  (aa) =>
                    results.alternatives
                      .find((x) => x.alternativeId === aa.id)
                      ?.contributions.find((x) => x.criterionId === c.id)
                      ?.rawScore ?? 0,
                ),
              );
              return (
                <tr key={c.id} className="border-b border-neutral-200">
                  <td className="py-1 pr-2">
                    {c.name}
                    {c.isKnockout
                      ? c.measure
                        ? typeof c.measure.limit === "number"
                          ? ` (${t.evaluation.knockoutBadge} ${fmt(c.measure.direction === "lower" ? t.evaluation.limitMax : t.evaluation.limitMin, { limit: formatNumber(c.measure.limit, tag, 2), unit: c.measure.unit })})`
                          : ` (${t.evaluation.knockoutBadge})`
                        : ` (${t.evaluation.knockoutBadge} ≥ ${c.minScore ?? ""})`
                      : ""}
                    {c.measure ? ` [${c.measure.unit}]` : ""}
                  </td>
                  <td className="py-1 pr-2 text-neutral-600">
                    {t.categories[c.categoryId]}
                  </td>
                  <td className="py-1 pr-2 text-right tabular">
                    {formatNumber((results.weights[c.id] ?? 0) * 100, tag, 1)} %
                  </td>
                  {validAlts.map((a) => {
                    const contrib = results.alternatives
                      .find((x) => x.alternativeId === a.id)
                      ?.contributions.find((x) => x.criterionId === c.id);
                    const isBest =
                      !!contrib?.rated && contrib.rawScore === best && best > 0;
                    return (
                      <td
                        key={a.id}
                        className={cn(
                          "py-1 pl-2 text-right tabular",
                          isBest && "font-semibold",
                        )}
                      >
                        {contrib?.rated
                          ? formatNumber(contrib.rawScore, tag, 1)
                          : "–"}{" "}
                        <span className="text-neutral-500">
                          (
                          {contrib
                            ? formatNumber(contrib.weightedScore, tag, 2)
                            : "–"}
                          )
                        </span>
                        {typeof contrib?.value === "number" && (
                          <span className="block text-[10px] font-normal text-neutral-500">
                            {formatNumber(contrib.value, tag, 2)}{" "}
                            {c.measure?.unit}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr className="border-t-2 border-black font-semibold">
              <td className="py-1 pr-2" colSpan={2}>
                {t.common.total}
              </td>
              <td className="py-1 pr-2 text-right">100 %</td>
              {validAlts.map((a) => (
                <td key={a.id} className="py-1 pl-2 text-right tabular">
                  {formatNumber(
                    results.alternatives.find((x) => x.alternativeId === a.id)
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
  );

  const Dot = ({ id }: { id: string }) => (
    <span
      className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full align-middle"
      style={{ background: seriesColor(altIndex(id)) }}
      aria-hidden
    />
  );

  return (
    <FullCharts>
      <div
        className="report mx-auto max-w-4xl bg-white px-8 py-10 text-black print:px-0 print:py-0"
        style={{ colorScheme: "light" }}
      >
        <style>{pageCss}</style>
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3 text-sm">
          <span className="text-ink-2">{t.report.tipPrint}</span>
          <div className="flex gap-2">
            <Link
              href={`/app/analyse?id=${encodeURIComponent(analysis.id)}`}
              className="btn btn-secondary btn-sm"
            >
              {t.report.backToApp}
            </Link>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" aria-hidden /> {t.report.printNow}
            </button>
          </div>
        </div>

        {/* Deckblatt */}
        <section className="report-cover">
          <header className="border-b-2 border-black pb-4">
            <div className="text-xs uppercase tracking-[0.14em] text-neutral-500">
              {t.report.title}
            </div>
            <h1 className="mt-2 text-[2rem] font-bold leading-tight tracking-tight">
              {title}
            </h1>
            <div className="mt-3 text-xs text-neutral-600">
              {t.report.generated}: {dateLabel} · {t.report.evaluators}:{" "}
              {analysis.evaluators
                .map((e) =>
                  e.weight !== 1 ? `${e.name} (×${e.weight})` : e.name,
                )
                .join(", ")}{" "}
              · nutzwertanalyse.com
            </div>
          </header>

          <dl
            className="mt-6 grid grid-cols-5 gap-3 rounded-lg border border-neutral-300 p-3 text-xs"
            aria-label={t.report.keyFigures}
          >
            {keyFigures.map(([label, value]) => (
              <div key={label} className="flex flex-col justify-between gap-1">
                <dt className="text-neutral-500">{label}</dt>
                <dd className="text-base font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-6" aria-labelledby="rep-rec">
            <h2
              id="rep-rec"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500"
            >
              {t.results.winner}
            </h2>
            {rec.winnerId ? (
              <div className="mt-2 rounded-xl border-2 border-black p-5">
                <p className="text-2xl font-bold leading-snug">
                  {isTie
                    ? fmt(t.results.tieText, {
                        names: listFormat(
                          rec.tiedIds.map((id) => `«${altName(id)}»`),
                          tag,
                        ),
                        percent: formatNumber(
                          results.ranking[0].percent,
                          tag,
                          1,
                        ),
                      })
                    : fmt(t.results.winnerText, {
                        name: altName(rec.winnerId),
                        percent: formatNumber(
                          results.ranking[0].percent,
                          tag,
                          1,
                        ),
                      })}
                </p>
                {!rec.runnerUpId && (
                  <p className="mt-2 text-sm">{t.results.single}</p>
                )}
                {rec.runnerUpId && !isTie && (
                  <p className="mt-2 text-sm">
                    {fmt(t.results.lead_, {
                      points: formatNumber(rec.leadPoints, tag, 1),
                      relative: formatNumber(rec.leadRelative, tag, 1),
                      runnerUp: altName(rec.runnerUpId),
                    })}
                  </p>
                )}
                <p className="mt-1 text-sm text-neutral-700">
                  {t.results.confidence[rec.confidence]}
                </p>
                {koLeader && (
                  <p className="mt-2 text-sm text-neutral-700">
                    {fmt(t.results.koLeader, {
                      name: altName(koLeader.alternativeId),
                      percent: formatNumber(koLeader.percent, tag, 1),
                      criteria: koLeader.failedCriteria
                        .map(critName)
                        .join(", "),
                    })}
                  </p>
                )}
                {robust.runs > 0 && (
                  <p className="mt-3 border-t border-neutral-300 pt-3 text-sm">
                    <span className="font-semibold">
                      {t.results.robustness}:{" "}
                    </span>
                    {fmt(t.report.winShareText, {
                      name: altName(rec.winnerId),
                      percent: formatNumber(winnerShare * 100, tag, 0),
                      runs: robust.runs,
                    })}
                  </p>
                )}
                {results.completeness < 1 && (
                  <p className="mt-2 text-sm text-neutral-700">
                    {fmt(t.results.incomplete, {
                      percent: Math.round(results.completeness * 100),
                    })}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-2 text-sm">
                {t.results.noAlternatives}{" "}
                {results.alternatives.some((r) => r.knockedOut) &&
                  t.results.allKnockedOut}
              </p>
            )}
            {results.alternatives.some((r) => r.knockedOut) && (
              <ul className="mt-2 text-xs text-neutral-700">
                {results.alternatives
                  .filter((r) => r.knockedOut)
                  .map((r) => (
                    <li key={r.alternativeId}>
                      <strong>{altName(r.alternativeId)}</strong> –{" "}
                      {t.results.knockedOut}:{" "}
                      {fmt(t.results.knockedOutText, {
                        criteria: koReasons(r),
                      })}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="mt-6" aria-labelledby="rep-glance">
            <h2
              id="rep-glance"
              className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500"
            >
              {t.report.atAGlance}
            </h2>
            <div className="mt-2">
              <HBarChart
                data={sortedRanking.map((r) => ({
                  label: altName(r.alternativeId),
                  value: r.percent,
                  muted: r.knockedOut || r.excluded,
                  valueLabel: `${formatNumber(r.percent, tag, 1)} %`,
                }))}
                ariaLabel={t.results.ranking}
              />
            </div>
          </section>

          {validAlts.length <= 6 && (
            <nav
              className="mt-8 border-t border-neutral-300 pt-4"
              aria-label={t.report.contents}
            >
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
                {t.report.contents}
              </div>
              <ol className="mt-2 grid grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
                {sections.map((s, i) => (
                  <li key={s.key} className="flex items-baseline gap-2">
                    <span className="w-3 shrink-0 text-right font-semibold tabular text-neutral-500">
                      {i + 1}
                    </span>
                    <span>{s.label}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}
        </section>

        {/* Ausgangslage und Ziel */}
        {hasContext && (
          <section className="report-section" aria-labelledby="rep-context">
            <div className="report-keep">
              <h2 id="rep-context" className="report-h2">
                <span className="report-num">{no("context")}</span>{" "}
                {t.report.context}
              </h2>
              {analysis.description && (
                <div className="mt-3 text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {t.decision.description}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {analysis.description}
                  </p>
                </div>
              )}
            </div>
            <div
              className={cn(
                "report-block mt-4 grid grid-cols-2 gap-x-8 gap-y-4 text-sm",
                !analysis.description && "-mt-1",
              )}
            >
              {analysis.goal && (
                <div className={cn(!analysis.constraints && "col-span-2")}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {t.decision.goal}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {analysis.goal}
                  </p>
                </div>
              )}
              {analysis.constraints && (
                <div className={cn(!analysis.goal && "col-span-2")}>
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    {t.decision.constraints}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap leading-relaxed">
                    {analysis.constraints}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Rangliste und Beiträge */}
        <section className="report-section" aria-labelledby="rep-ranking">
          <div className="report-keep">
            <h2 id="rep-ranking" className="report-h2">
              <span className="report-num">{no("ranking")}</span>{" "}
              {t.results.ranking}
            </h2>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-400 text-left text-xs text-neutral-600">
                  <th className="py-1 pr-2">{t.common.rank}</th>
                  <th className="py-1 pr-2">{t.common.alternative}</th>
                  <th className="py-1 pr-2 text-right">
                    {t.results.weightedPoints}
                  </th>
                  <th className="py-1 text-right">{t.common.score}</th>
                </tr>
              </thead>
              <tbody>
                {sortedRanking.map((r) => (
                  <tr
                    key={r.alternativeId}
                    className={cn(
                      "border-b border-neutral-200",
                      (r.knockedOut || r.excluded) && "text-neutral-500",
                    )}
                  >
                    <td className="py-1.5 pr-2 tabular">{r.rank || "–"}</td>
                    <td className="py-1.5 pr-2">
                      <Dot id={r.alternativeId} />
                      {altName(r.alternativeId)}
                      {r.knockedOut &&
                        ` (${t.results.knockedOut}: ${koReasons(r)})`}
                      {r.excluded && ` (${t.results.excluded})`}
                    </td>
                    <td className="py-1.5 pr-2 text-right tabular">
                      {formatNumber(r.total, tag, 2)} / {scale}
                    </td>
                    <td className="py-1.5 text-right font-semibold tabular">
                      {formatNumber(r.percent, tag, 1)} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="report-block mt-6">
            <h3 className="text-base font-semibold">
              {t.results.contributions}
            </h3>
            <p className="mt-0.5 text-xs text-neutral-600">
              {t.results.contributionsLead}
            </p>
            <div className="mt-3">
              <StackedBarChart
                rows={results.alternatives
                  .filter((r) => !r.excluded)
                  .sort((a, b) => b.total - a.total)
                  .map((r) => ({
                    label: altName(r.alternativeId),
                    muted: r.knockedOut,
                    segments: r.contributions.map((c) => ({
                      key: c.criterionId,
                      value: c.weightedScore,
                    })),
                  }))}
                series={analysis.criteria.map((c) => ({
                  key: c.id,
                  label: c.name,
                }))}
                max={scale}
                ariaLabel={t.results.contributions}
                formatValue={(v) => formatNumber(v, tag, 2)}
              />
            </div>
          </div>
        </section>

        {/* Stärkenprofil */}
        {showProfile && (
          <section className="report-section" aria-labelledby="rep-profile">
            <div className="report-keep">
              <h2 id="rep-profile" className="report-h2">
                <span className="report-num">{no("profile")}</span>{" "}
                {t.results.profile}
              </h2>
              <p className="report-lead mt-1 text-xs text-neutral-600">
                {t.results.profileLead}
              </p>
              <div className="mt-4">
                <RadarChart
                  axes={analysis.criteria.map(
                    (c) => c.name || t.common.unnamed,
                  )}
                  series={radarSeries}
                  max={scale}
                  ariaLabel={t.results.profile}
                  className="max-w-lg"
                />
              </div>
            </div>
            {categories.length >= 2 && (
              <div className="report-block mt-6">
                <h3 className="text-base font-semibold">
                  {t.results.byCategory}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-600">
                  {t.results.byCategoryLead}
                </p>
                <table className="mt-3 w-full text-xs">
                  <thead>
                    <tr className="border-b border-neutral-400 text-left text-neutral-600">
                      <th className="py-1 pr-2 align-bottom">
                        {t.common.alternative}
                      </th>
                      {categories.map((cat) => (
                        <th
                          key={cat}
                          className="py-1 pl-3 text-right align-bottom"
                        >
                          <span className="block">{t.categories[cat]}</span>
                          <span className="block whitespace-nowrap font-normal tabular">
                            {t.common.weight}{" "}
                            {formatNumber(catWeight(cat) * 100, tag, 0)} %
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rankedValid.map((r) => (
                      <tr
                        key={r.alternativeId}
                        className={cn(
                          "border-b border-neutral-200",
                          r.knockedOut && "text-neutral-500",
                        )}
                      >
                        <td className="py-1.5 pr-2">
                          <Dot id={r.alternativeId} />
                          {altName(r.alternativeId)}
                        </td>
                        {categories.map((cat) => {
                          const pct = catPercent(r.byCategory, cat);
                          return (
                            <td
                              key={cat}
                              className={cn(
                                "py-1.5 pl-3 text-right tabular",
                                pct !== null &&
                                  pct === bestByCat[cat] &&
                                  "font-semibold",
                              )}
                            >
                              {pct === null
                                ? "–"
                                : `${formatNumber(pct, tag, 0)} %`}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Bewertungsmatrix: Hochformat an vierter Stelle; im Querformat als Anhang am Ende */}
        {!manyAlternatives && matrix}

        {/* Sensitivität */}
        {sens.length > 0 && (
          <section className="report-section" aria-labelledby="rep-sens">
            <div className="report-keep">
              <h2 id="rep-sens" className="report-h2">
                <span className="report-num">{no("sensitivity")}</span>{" "}
                {t.results.sensitivity}
              </h2>
              <p className="report-lead mt-1 text-xs text-neutral-600">
                {t.results.sensitivityLead}
              </p>
              <div className="mt-3">
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
              </div>
            </div>
            <table className="report-block mt-3 w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-400 text-left text-neutral-600">
                  <th className="py-1 pr-2">{t.common.criterion}</th>
                  <th className="py-1 pr-2 text-right">
                    {t.results.currentWeight}
                  </th>
                  <th className="py-1 pr-2 text-right">
                    {t.results.flipWeight}
                  </th>
                  <th className="py-1 pr-2">{t.results.flipTo}</th>
                  <th className="py-1 text-right">{t.common.status}</th>
                </tr>
              </thead>
              <tbody>
                {sens.map((s) => (
                  <tr
                    key={s.criterionId}
                    className="border-b border-neutral-200"
                  >
                    <td className="py-1 pr-2">{critName(s.criterionId)}</td>
                    <td className="py-1 pr-2 text-right tabular">
                      {formatNumber(s.currentWeight * 100, tag, 1)} %
                    </td>
                    <td className="py-1 pr-2 text-right tabular">
                      {s.flipWeight === null
                        ? "–"
                        : `${formatNumber(s.flipWeight * 100, tag, 1)} %`}
                    </td>
                    <td className="py-1 pr-2">
                      {s.flipToId ? altName(s.flipToId) : "–"}
                    </td>
                    <td className="py-1 text-right">
                      {t.results.impact[s.impact]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Robustheit: Tabelle mit Siegquoten-Balken */}
        {robust.runs > 0 && (
          <section
            className="report-section report-block"
            aria-labelledby="rep-robust"
          >
            <h2 id="rep-robust" className="report-h2">
              <span className="report-num">{no("robustness")}</span>{" "}
              {t.results.robustness}
            </h2>
            <p className="report-lead mt-1 text-xs text-neutral-600">
              {fmt(t.results.robustnessLead, { runs: robust.runs })}
            </p>
            <table className="mt-3 w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-400 text-left text-neutral-600">
                  <th className="py-1 pr-2">{t.common.alternative}</th>
                  <th className="w-[45%] py-1 pl-3">{t.results.winShare}</th>
                  <th className="py-1 pl-3 text-right">{t.results.meanRank}</th>
                </tr>
              </thead>
              <tbody>
                {validAlts
                  .slice()
                  .sort(
                    (x, y) =>
                      (robust.winShare[y.id] ?? 0) -
                        (robust.winShare[x.id] ?? 0) ||
                      (robust.meanRank[x.id] ?? 0) -
                        (robust.meanRank[y.id] ?? 0),
                  )
                  .map((a) => {
                    const share = robust.winShare[a.id] ?? 0;
                    return (
                      <tr key={a.id} className="border-b border-neutral-200">
                        <td className="py-1.5 pr-2">
                          <Dot id={a.id} />
                          {a.name || t.common.unnamed}
                        </td>
                        <td className="py-1.5 pl-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-sm">
                              <svg
                                className="block h-full w-full"
                                viewBox="0 0 100 8"
                                preserveAspectRatio="none"
                                aria-hidden
                              >
                                <rect width="100" height="8" fill="#e5e5e5" />
                                <rect
                                  width={Math.max(
                                    0,
                                    Math.min(100, share * 100),
                                  )}
                                  height="8"
                                  fill="var(--primary)"
                                />
                              </svg>
                            </div>
                            <span className="w-14 shrink-0 text-right tabular">
                              {formatNumber(share * 100, tag, 1)} %
                            </span>
                          </div>
                        </td>
                        <td className="py-1.5 pl-3 text-right tabular">
                          {formatNumber(robust.meanRank[a.id] ?? 0, tag, 2)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        )}

        {/* Begründungen, gruppiert je Alternative */}
        {noteGroups.length > 0 && (
          <section className="report-section" aria-labelledby="rep-notes">
            <div className="mt-0 grid gap-5">
              {noteGroups.map((g, gi) => (
                <section
                  key={g.alt.id}
                  className={cn(
                    "report-notes-group",
                    gi === 0 && "report-keep",
                  )}
                  aria-label={g.alt.name}
                >
                  {gi === 0 && (
                    <>
                      <h2 id="rep-notes" className="report-h2">
                        <span className="report-num">{no("notes")}</span>{" "}
                        {t.report.notes}
                      </h2>
                      <p className="report-lead mt-1 mb-3 text-xs text-neutral-600">
                        {t.report.notesLead}
                      </p>
                    </>
                  )}
                  <h3 className="flex items-baseline gap-2 border-b border-neutral-400 pb-1 text-sm font-semibold">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 self-center rounded-full"
                      style={{ background: seriesColor(altIndex(g.alt.id)) }}
                      aria-hidden
                    />
                    <span>{g.alt.name || t.common.unnamed}</span>
                    <span className="ml-auto text-xs font-normal text-neutral-600">
                      {t.common.rank} {g.rank || "–"} ·{" "}
                      {formatNumber(g.percent, tag, 1)} %
                    </span>
                  </h3>
                  <dl className="mt-1 grid grid-cols-[minmax(10rem,14rem)_minmax(0,1fr)] gap-x-4 text-xs">
                    {g.items.map((it, i) => (
                      <div key={i} className="contents">
                        <dt className="border-b border-neutral-200 py-1 pr-2">
                          {it.crit}
                          {typeof it.score === "number" && (
                            <span className="ml-1.5 font-semibold tabular">
                              {formatNumber(it.score, tag, 0)}
                            </span>
                          )}
                          {analysis.evaluators.length > 1 && (
                            <span className="block text-neutral-500">
                              {it.ev}
                            </span>
                          )}
                        </dt>
                        <dd className="border-b border-neutral-200 py-1 leading-relaxed text-neutral-800">
                          {it.note}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </section>
        )}

        {/* Fazit */}
        {analysis.conclusion && (
          <section
            className="report-section report-block"
            aria-labelledby="rep-conclusion"
          >
            <h2 id="rep-conclusion" className="report-h2">
              <span className="report-num">{no("conclusion")}</span>{" "}
              {t.results.conclusion}
            </h2>
            <div className="mt-3 rounded-xl border-l-4 border-black bg-neutral-50 px-5 py-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysis.conclusion}
              </p>
            </div>
          </section>
        )}

        <footer className="report-block mt-10 border-t border-neutral-300 pt-3 text-[10px] leading-relaxed text-neutral-600">
          <p>
            <strong>{t.results.methodology}:</strong>{" "}
            {t.results.methodologyText}
          </p>
          <p className="mt-1">{t.results.disclaimer}</p>
          <p className="mt-1">{t.report.localNote}</p>
        </footer>

        {manyAlternatives && matrix}
      </div>
    </FullCharts>
  );
}
