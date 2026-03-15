"use client";

import { useMemo, useState } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getRecommendation } from "@/app/lib/nwa/calculate";
import { ReportGenerator } from "./ReportGenerator";
import { StepInfoButton } from "./StepInfoButton";
import { useTranslations } from "@/app/lib/i18n";

export function ResultsDashboard() {
  const { state, knockoutFailures } = useAnalysis();
  const { alternatives, criteria, results, sensitivityResults, decision, ahpConsistency } = state;
  const packageLevel = decision.packageLevel;
  const [showExport, setShowExport] = useState(false);
  const t = useTranslations();

  // Get recommendation
  const recommendation = useMemo(
    () => getRecommendation(results, alternatives),
    [results, alternatives]
  );

  // Filter out knockout failures from results
  const validResults = useMemo(() => {
    const knockoutIds = new Set(knockoutFailures.map((f) => f.alternativeId));
    return results.filter((r) => !knockoutIds.has(r.alternativeId));
  }, [results, knockoutFailures]);

  const maxScore = validResults[0]?.totalScore || 1;

  if (results.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-white/40 font-medium">{t.results.noResults}</div>
        <div className="text-sm text-white/25 mt-1">
          {t.results.completeSteps}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Premium Header */}
      <div className="animate-premium-fade-in-up">
        <div className="text-xs text-white/45 flex items-center gap-2 font-medium tracking-wide uppercase">
          {t.steps.step} 6 – {t.steps.results}
          <StepInfoButton stepId="results" />
        </div>
        <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {t.results.title}
        </h2>
      </div>

      {/* Premium Recommendation Card */}
      <div
        className="rounded-3xl border p-6 sm:p-8 relative overflow-hidden animate-premium-fade-in-up stagger-1"
        style={{
          borderColor: `rgb(var(--accent) / 0.2)`,
          background: `linear-gradient(135deg, rgb(var(--accent) / 0.08), rgb(var(--accent-2) / 0.03))`,
          boxShadow: `0 0 60px rgb(var(--accent) / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.05)`,
        }}
      >
        {/* Subtle glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-30" style={{ background: `radial-gradient(circle, rgb(var(--accent) / 0.3), transparent 70%)` }} />
        
        <div className="relative flex items-start gap-5">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 hover:scale-105"
            style={{ 
              background: `rgb(var(--accent) / 0.15)`,
              boxShadow: `0 0 30px rgb(var(--accent) / 0.15)`,
            }}
          >
            {recommendation.confidence === "high" ? (
              <svg className="w-7 h-7" style={{ color: `rgb(var(--accent))` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : recommendation.confidence === "medium" ? (
              <svg className="w-7 h-7" style={{ color: `rgb(var(--accent))` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-7 h-7" style={{ color: `rgb(var(--accent))` }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-white/50 mb-1.5 font-medium tracking-wide uppercase">{t.results.recommendation}</div>
            <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {recommendation.recommended?.name || t.results.noRecommendation}
            </div>
            <div className="text-sm text-white/55 mt-3 leading-relaxed">{recommendation.reasoning}</div>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-xs text-white/40 font-medium">{t.results.confidence}:</span>
              <div className="flex gap-1.5">
                {["high", "medium", "low"].map((level, i) => (
                  <div
                    key={level}
                    className={`h-2 w-8 rounded-full transition-all duration-300 ${
                      recommendation.confidence === "high"
                        ? "bg-emerald-400"
                        : recommendation.confidence === "medium" && i < 2
                        ? "bg-amber-400"
                        : recommendation.confidence === "low" && i === 0
                        ? "bg-red-400"
                        : "bg-white/[0.08]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/50 font-medium">
                {recommendation.confidence === "high"
                  ? t.results.confidenceHigh
                  : recommendation.confidence === "medium"
                  ? t.results.confidenceMedium
                  : t.results.confidenceLow}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Rankings */}
      <div className="space-y-4 animate-premium-fade-in-up stagger-2">
        <div className="text-sm font-semibold text-white/60 tracking-wide">{t.results.ranking}</div>
        {validResults.map((result, index) => {
          const alt = alternatives.find((a) => a.id === result.alternativeId);
          const barWidth = (result.totalScore / maxScore) * 100;
          const isWinner = index === 0;

          return (
            <div
              key={result.alternativeId}
              className={`rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.01] ${
                isWinner
                  ? "border-[rgb(var(--accent))]/30 bg-gradient-to-br from-[rgb(var(--accent))]/10 to-transparent"
                  : "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05]"
              }`}
              style={isWinner ? { boxShadow: `0 0 40px rgb(var(--accent) / 0.1)` } : {}}
            >
              <div className="flex items-center gap-5">
                <div
                  className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold transition-transform duration-300 ${
                    isWinner ? "scale-110" : ""
                  }`}
                  style={{
                    background: isWinner ? `rgb(var(--accent))` : `rgb(255 255 255 / 0.06)`,
                    color: isWinner ? 'white' : `rgb(255 255 255 / 0.5)`,
                    boxShadow: isWinner ? `0 4px 20px rgb(var(--accent) / 0.3)` : 'none',
                  }}
                >
                  {result.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-white truncate text-lg">{alt?.name}</div>
                    <div 
                      className="text-base font-bold px-3 py-1 rounded-full"
                      style={{ 
                        background: `rgb(var(--accent) / 0.1)`,
                        color: `rgb(var(--accent))`,
                      }}
                    >
                      {result.totalScore.toFixed(2)}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${barWidth}%`,
                        background: isWinner 
                          ? `linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))` 
                          : `rgb(var(--accent) / 0.4)`,
                        boxShadow: isWinner ? `0 0 10px rgb(var(--accent) / 0.3)` : 'none',
                      }}
                    />
                  </div>
                  <div className="text-xs text-white/35 mt-2 flex items-center gap-4">
                    <span>{t.results.normalized}: {result.normalizedScore.toFixed(0)}%</span>
                    {result.riskScore !== undefined && (
                      <span>{t.results.riskScore}: {result.riskScore.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Premium Knocked out alternatives */}
        {knockoutFailures.length > 0 && (
          <div className="mt-6">
            <div className="text-sm font-semibold text-red-400/60 mb-3 tracking-wide">
              {t.results.eliminated}
            </div>
            {knockoutFailures.map((failure) => {
              const alt = alternatives.find((a) => a.id === failure.alternativeId);
              const failedCritNames = failure.failedCriteria
                .map((cId) => criteria.find((c) => c.id === cId)?.name)
                .filter(Boolean);

              return (
                <div
                  key={failure.alternativeId}
                  className="rounded-2xl border border-red-500/15 bg-red-500/[0.04] p-5 mb-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl flex items-center justify-center bg-red-500/15 text-red-400">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-white/55">{alt?.name}</div>
                      <div className="text-xs text-red-400/60 mt-0.5">
                        {t.results.notPassed}: {failedCritNames.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Criteria breakdown */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6 animate-premium-fade-in-up stagger-3">
        <div className="text-sm font-semibold text-white/60 mb-5 tracking-wide">
          {t.results.detailAnalysis}
        </div>
        <div className="overflow-x-auto -mx-2 px-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-3 pr-4 text-white/45 font-semibold text-xs tracking-wide uppercase">
                  {t.results.criterion}
                </th>
                <th className="text-left py-3 pr-4 text-white/45 font-semibold text-xs tracking-wide uppercase">
                  {t.evaluationSetup.weight}
                </th>
                {validResults.slice(0, 5).map((r) => {
                  const alt = alternatives.find((a) => a.id === r.alternativeId);
                  return (
                    <th
                      key={r.alternativeId}
                      className="text-center py-3 px-3 text-white/45 font-semibold text-xs tracking-wide"
                    >
                      {alt?.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 pr-4 text-white/60">{criterion.name}</td>
                  <td className="py-3 pr-4 text-white/40">
                    {(criterion.weight * 100).toFixed(0)}%
                  </td>
                  {validResults.slice(0, 5).map((r) => {
                    const criterionScore = r.criteriaScores.find(
                      (cs) => cs.criterionId === criterion.id
                    );
                    return (
                      <td
                        key={r.alternativeId}
                        className="py-3 px-3 text-center text-white/55"
                      >
                        {criterionScore?.rawScore.toFixed(1) || "–"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-4 pr-4 text-white">{t.results.totalScore}</td>
                <td className="py-4 pr-4 text-white/45">100%</td>
                {validResults.slice(0, 5).map((r) => (
                  <td
                    key={r.alternativeId}
                    className="py-4 px-3 text-center"
                    style={{ color: `rgb(var(--accent))` }}
                  >
                    {r.totalScore.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Premium Sensitivity Analysis (Advanced/Business) */}
      {packageLevel !== "basic" && sensitivityResults.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 sm:p-6">
          <div className="text-sm font-semibold text-white/60 mb-2 tracking-wide">
            {t.results.sensitivityAnalysis}
          </div>
          <p className="text-xs text-white/40 mb-5 leading-relaxed">
            {t.results.sensitivityDescription}
          </p>
          <div className="space-y-4">
            {sensitivityResults.slice(0, 5).map((sens) => {
              const criterion = criteria.find((c) => c.id === sens.criterionId);
              return (
                <div key={sens.criterionId} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/60 truncate font-medium">
                      {criterion?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sens.impactOnRanking === "high"
                          ? "bg-red-500/15 text-red-400"
                          : sens.impactOnRanking === "medium"
                          ? "bg-amber-500/15 text-amber-400"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}
                    >
                      {sens.impactOnRanking === "high"
                        ? t.results.confidenceHigh
                        : sens.impactOnRanking === "medium"
                        ? t.results.confidenceMedium
                        : t.results.confidenceLow}
                    </div>
                    <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          sens.impactOnRanking === "high"
                            ? "bg-red-400"
                            : sens.impactOnRanking === "medium"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(sens.sensitivity * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Premium AHP Consistency (Business) */}
      {packageLevel === "business" && ahpConsistency && (
        <div
          className={`rounded-2xl border p-5 ${
            ahpConsistency.isConsistent
              ? "border-emerald-500/20 bg-emerald-500/[0.06]"
              : "border-amber-500/20 bg-amber-500/[0.06]"
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                ahpConsistency.isConsistent ? "bg-emerald-500/15" : "bg-amber-500/15"
              }`}
            >
              {ahpConsistency.isConsistent ? (
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>
            <span
              className={`text-sm font-semibold ${
                ahpConsistency.isConsistent ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {t.results.ahpConsistency}
            </span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{ahpConsistency.message}</p>
          <div className="mt-3 text-xs text-white/40 font-medium">
            {t.results.consistencyRatio}: {(ahpConsistency.consistencyRatio * 100).toFixed(1)}%
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-4">
        <button
          onClick={() => setShowExport(!showExport)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <div className="text-sm font-medium text-white/70">{t.results.exportReport}</div>
            <div className="text-xs text-white/50 mt-1">
              {packageLevel === "basic"
                ? t.results.exportBasic
                : packageLevel === "advanced"
                ? t.results.exportAdvanced
                : t.results.exportBusiness}
            </div>
          </div>
          <div
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition ${
              showExport
                ? "bg-[rgb(var(--accent))] text-white"
                : "bg-white/10 text-white/60"
            }`}
          >
            <svg
              className={`h-4 w-4 transition-transform ${showExport ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {showExport && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <ReportGenerator />
          </div>
        )}
      </div>
    </div>
  );
}
