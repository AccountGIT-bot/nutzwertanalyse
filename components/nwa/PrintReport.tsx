"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { computeResults, robustness, sensitivity } from "@/lib/nwa/calc";
import { CATEGORY_IDS, type Analysis } from "@/lib/nwa/types";
import { HBarChart, StackedBarChart } from "@/components/charts/Charts";
import { cn, fmt, formatDate, formatNumber } from "@/lib/utils";

export function PrintReport({ analysis }: { analysis: Analysis }) {
  const { t, tag } = useI18n();
  const results = useMemo(() => computeResults(analysis), [analysis]);
  const sens = useMemo(() => sensitivity(analysis, results), [analysis, results]);
  const robust = useMemo(() => robustness(analysis, results, { runs: 500 }), [analysis, results]);
  const altName = (id: string) => analysis.alternatives.find((a) => a.id === id)?.name || t.common.unnamed;
  const critName = (id: string) => analysis.criteria.find((c) => c.id === id)?.name || t.common.unnamed;
  const validAlts = analysis.alternatives.filter((a) => !a.excluded);
  const scale = analysis.settings.scale;
  const rec = results.recommendation;
  const now = new Date().toISOString();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "light");
    const h = window.setTimeout(() => window.print(), 600);
    return () => window.clearTimeout(h);
  }, []);

  const notes: { alt: string; crit: string; ev: string; note: string }[] = [];
  for (const ev of analysis.evaluators) {
    for (const a of validAlts) {
      for (const c of analysis.criteria) {
        const n = analysis.ratings[ev.id]?.[a.id]?.[c.id]?.note;
        if (n) notes.push({ alt: a.name, crit: c.name, ev: ev.name, note: n });
      }
    }
  }

  const sortedRanking = results.alternatives.slice().sort((a, b) => (a.rank || 99) - (b.rank || 99) || b.total - a.total);
  const categories = CATEGORY_IDS.filter((cat) => analysis.criteria.some((c) => c.categoryId === cat));

  return (
    <div className="mx-auto max-w-4xl bg-white px-8 py-10 text-black print:px-0 print:py-0" style={{ colorScheme: "light" }}>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 p-3 text-sm">
        <span className="text-ink-2">{t.report.tipPrint}</span>
        <div className="flex gap-2">
          <Link href={`/app/analyse?id=${encodeURIComponent(analysis.id)}`} className="btn btn-secondary btn-sm">
            {t.report.backToApp}
          </Link>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4" aria-hidden /> {t.report.printNow}
          </button>
        </div>
      </div>

      <header className="border-b-2 border-black pb-4">
        <div className="text-xs uppercase tracking-wider text-neutral-500">{t.report.title}</div>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{analysis.title || t.common.untitled}</h1>
        <div className="mt-2 text-xs text-neutral-600">
          {t.report.generated}: {formatDate(now, tag)} · nutzwertanalyse.com
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        {analysis.description && (
          <div className="col-span-2">
            <div className="text-xs font-semibold uppercase text-neutral-500">{t.decision.description}</div>
            <p className="mt-0.5 whitespace-pre-wrap">{analysis.description}</p>
          </div>
        )}
        {analysis.goal && (
          <div>
            <div className="text-xs font-semibold uppercase text-neutral-500">{t.decision.goal}</div>
            <p className="mt-0.5 whitespace-pre-wrap">{analysis.goal}</p>
          </div>
        )}
        {analysis.constraints && (
          <div>
            <div className="text-xs font-semibold uppercase text-neutral-500">{t.decision.constraints}</div>
            <p className="mt-0.5 whitespace-pre-wrap">{analysis.constraints}</p>
          </div>
        )}
        <div className="col-span-2 mt-2 grid grid-cols-4 gap-2 rounded-lg border border-neutral-300 p-3 text-xs">
          <div>
            <div className="text-neutral-500">{t.report.alternativesCount}</div>
            <div className="font-semibold">{validAlts.length}</div>
          </div>
          <div>
            <div className="text-neutral-500">{t.report.criteriaCount}</div>
            <div className="font-semibold">{analysis.criteria.length}</div>
          </div>
          <div>
            <div className="text-neutral-500">{t.report.method}</div>
            <div className="font-semibold">{t.weighting.methods[analysis.settings.weighting].label}</div>
          </div>
          <div>
            <div className="text-neutral-500">{t.report.scale}</div>
            <div className="font-semibold">1–{scale}</div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t.results.winner}</h2>
        {rec.winnerId ? (
          <div className="mt-2 rounded-lg border-2 border-black p-4">
            <p className="text-xl font-bold">{fmt(t.results.winnerText, { name: altName(rec.winnerId), percent: formatNumber(results.ranking[0].percent, tag, 1) })}</p>
            {rec.runnerUpId && <p className="mt-1 text-sm">{fmt(t.results.lead_, { points: formatNumber(rec.leadPoints, tag, 1), relative: formatNumber(rec.leadRelative, tag, 1), runnerUp: altName(rec.runnerUpId) })}</p>}
            <p className="mt-1 text-sm text-neutral-700">{t.results.confidence[rec.confidence]}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm">{t.results.noAlternatives}</p>
        )}
        {results.completeness < 1 && <p className="mt-2 text-sm text-neutral-700">{fmt(t.results.incomplete, { percent: Math.round(results.completeness * 100) })}</p>}
      </section>

      <section className="mt-8 break-inside-avoid">
        <h2 className="text-lg font-bold">{t.results.ranking}</h2>
        <div className="mt-3">
          <HBarChart data={sortedRanking.map((r) => ({ label: altName(r.alternativeId), value: r.percent, muted: r.knockedOut || r.excluded, valueLabel: `${formatNumber(r.percent, tag, 1)} %` }))} ariaLabel={t.results.ranking} />
        </div>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-400 text-left text-xs text-neutral-600">
              <th className="py-1 pr-2">{t.common.rank}</th>
              <th className="py-1 pr-2">{t.common.alternative}</th>
              <th className="py-1 pr-2 text-right">{t.results.weightedPoints}</th>
              <th className="py-1 text-right">{t.common.score}</th>
            </tr>
          </thead>
          <tbody>
            {sortedRanking.map((r) => (
              <tr key={r.alternativeId} className={cn("border-b border-neutral-200", (r.knockedOut || r.excluded) && "text-neutral-500")}>
                <td className="py-1 pr-2">{r.rank || "–"}</td>
                <td className="py-1 pr-2">
                  {altName(r.alternativeId)}
                  {r.knockedOut && ` (${t.results.knockedOut}: ${r.failedCriteria.map(critName).join(", ")})`}
                  {r.excluded && ` (${t.results.excluded})`}
                </td>
                <td className="py-1 pr-2 text-right tabular">
                  {formatNumber(r.total, tag, 2)} / {scale}
                </td>
                <td className="py-1 text-right font-semibold tabular">{formatNumber(r.percent, tag, 1)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mt-8 break-inside-avoid">
        <h2 className="text-lg font-bold">{t.results.contributions}</h2>
        <div className="mt-3">
          <StackedBarChart
            rows={results.alternatives.filter((r) => !r.excluded).sort((a, b) => b.total - a.total).map((r) => ({ label: altName(r.alternativeId), muted: r.knockedOut, segments: r.contributions.map((c) => ({ key: c.criterionId, value: c.weightedScore })) }))}
            series={analysis.criteria.map((c) => ({ key: c.id, label: c.name }))}
            max={scale}
            ariaLabel={t.results.contributions}
            formatValue={(v) => formatNumber(v, tag, 2)}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold">{t.results.matrix}</h2>
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
            {analysis.criteria.map((c) => (
              <tr key={c.id} className="border-b border-neutral-200">
                <td className="py-1 pr-2">
                  {c.name}
                  {c.isKnockout ? ` (K.-o. ≥ ${c.minScore})` : ""}
                </td>
                <td className="py-1 pr-2 text-neutral-600">{t.categories[c.categoryId]}</td>
                <td className="py-1 pr-2 text-right tabular">{formatNumber((results.weights[c.id] ?? 0) * 100, tag, 1)} %</td>
                {validAlts.map((a) => {
                  const contrib = results.alternatives.find((x) => x.alternativeId === a.id)?.contributions.find((x) => x.criterionId === c.id);
                  return (
                    <td key={a.id} className="py-1 pl-2 text-right tabular">
                      {contrib?.rated ? formatNumber(contrib.rawScore, tag, 1) : "–"} <span className="text-neutral-500">({contrib ? formatNumber(contrib.weightedScore, tag, 2) : "–"})</span>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t-2 border-black font-semibold">
              <td className="py-1 pr-2" colSpan={2}>
                {t.common.total}
              </td>
              <td className="py-1 pr-2 text-right">100 %</td>
              {validAlts.map((a) => (
                <td key={a.id} className="py-1 pl-2 text-right tabular">
                  {formatNumber(results.alternatives.find((x) => x.alternativeId === a.id)?.total ?? 0, tag, 2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        {categories.length >= 2 && (
          <table className="mt-4 w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-400 text-left text-neutral-600">
                <th className="py-1 pr-2">{t.results.byCategory}</th>
                <th className="py-1 pr-2 text-right">{t.common.weight}</th>
                {validAlts.map((a) => (
                  <th key={a.id} className="py-1 pl-2 text-right">
                    {a.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => {
                const w = analysis.criteria.filter((c) => c.categoryId === cat).reduce((s, c) => s + (results.weights[c.id] ?? 0), 0);
                return (
                  <tr key={cat} className="border-b border-neutral-200">
                    <td className="py-1 pr-2">{t.categories[cat]}</td>
                    <td className="py-1 pr-2 text-right tabular">{formatNumber(w * 100, tag, 0)} %</td>
                    {validAlts.map((a) => {
                      const v = results.alternatives.find((x) => x.alternativeId === a.id)?.byCategory[cat] ?? 0;
                      return (
                        <td key={a.id} className="py-1 pl-2 text-right tabular">
                          {w > 0 ? `${formatNumber((v / (w * scale)) * 100, tag, 0)} %` : "–"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {sens.length > 0 && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">{t.results.sensitivity}</h2>
          <p className="mt-1 text-xs text-neutral-600">{t.results.sensitivityLead}</p>
          <table className="mt-3 w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-400 text-left text-neutral-600">
                <th className="py-1 pr-2">{t.common.criterion}</th>
                <th className="py-1 pr-2 text-right">{t.results.currentWeight}</th>
                <th className="py-1 pr-2 text-right">{t.results.flipWeight}</th>
                <th className="py-1 pr-2">{t.results.flipTo}</th>
                <th className="py-1 text-right">{t.common.status}</th>
              </tr>
            </thead>
            <tbody>
              {sens.map((s) => (
                <tr key={s.criterionId} className="border-b border-neutral-200">
                  <td className="py-1 pr-2">{critName(s.criterionId)}</td>
                  <td className="py-1 pr-2 text-right tabular">{formatNumber(s.currentWeight * 100, tag, 1)} %</td>
                  <td className="py-1 pr-2 text-right tabular">{s.flipWeight === null ? "–" : `${formatNumber(s.flipWeight * 100, tag, 1)} %`}</td>
                  <td className="py-1 pr-2">{s.flipToId ? altName(s.flipToId) : "–"}</td>
                  <td className="py-1 text-right">{t.results.impact[s.impact]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {robust.runs > 0 && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">{t.results.robustness}</h2>
          <p className="mt-1 text-xs text-neutral-600">{fmt(t.results.robustnessLead, { runs: robust.runs })}</p>
          <table className="mt-3 w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-400 text-left text-neutral-600">
                <th className="py-1 pr-2">{t.common.alternative}</th>
                <th className="py-1 pr-2 text-right">{t.results.winShare}</th>
                <th className="py-1 text-right">{t.results.meanRank}</th>
              </tr>
            </thead>
            <tbody>
              {validAlts
                .slice()
                .sort((x, y) => (robust.winShare[y.id] ?? 0) - (robust.winShare[x.id] ?? 0))
                .map((a) => (
                  <tr key={a.id} className="border-b border-neutral-200">
                    <td className="py-1 pr-2">{a.name}</td>
                    <td className="py-1 pr-2 text-right tabular">{formatNumber((robust.winShare[a.id] ?? 0) * 100, tag, 1)} %</td>
                    <td className="py-1 text-right tabular">{formatNumber(robust.meanRank[a.id] ?? 0, tag, 2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>
      )}

      {notes.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold">{t.report.notes}</h2>
          <ul className="mt-2 space-y-1 text-xs">
            {notes.map((n, i) => (
              <li key={i} className="border-b border-neutral-200 py-1">
                <span className="font-semibold">{n.alt}</span> · {n.crit}
                {analysis.evaluators.length > 1 ? ` · ${n.ev}` : ""}: {n.note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {analysis.conclusion && (
        <section className="mt-8 break-inside-avoid">
          <h2 className="text-lg font-bold">{t.results.conclusion}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{analysis.conclusion}</p>
        </section>
      )}

      <footer className="mt-10 border-t border-neutral-300 pt-3 text-[10px] text-neutral-600">
        <p>
          <strong>{t.results.methodology}:</strong> {t.results.methodologyText}
        </p>
        <p className="mt-1">{t.results.disclaimer}</p>
        {analysis.evaluators.length > 1 && (
          <p className="mt-1">
            {t.report.evaluators}: {analysis.evaluators.map((e) => `${e.name} (×${e.weight})`).join(", ")}
          </p>
        )}
      </footer>
    </div>
  );
}
