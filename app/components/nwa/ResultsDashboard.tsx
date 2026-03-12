"use client";

import { useMemo } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getRecommendation } from "@/app/lib/nwa/calculate";

export function ResultsDashboard() {
  const { state, knockoutFailures } = useAnalysis();
  const { alternatives, criteria, results, sensitivityResults, decision, ahpConsistency } = state;
  const packageLevel = decision.packageLevel;

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
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
        <div className="text-white/40">Keine Ergebnisse verfügbar</div>
        <div className="text-sm text-white/30 mt-1">
          Bitte vervollständigen Sie alle vorherigen Schritte.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60">Ergebnis</div>
        <h2 className="mt-1 text-xl font-semibold text-white">
          Analyse-Ergebnis & Entscheidungsempfehlung
        </h2>
      </div>

      {/* Recommendation card */}
      <div
        className="rounded-2xl border p-6"
        style={{
          borderColor: `rgb(var(--accent) / 0.3)`,
          background: `linear-gradient(135deg, rgb(var(--accent) / 0.1), rgb(var(--accent-2) / 0.05))`,
        }}
      >
        <div className="flex items-start gap-4">
          <div
            className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: `rgb(var(--accent) / 0.2)` }}
          >
            {recommendation.confidence === "high"
              ? "✓"
              : recommendation.confidence === "medium"
              ? "~"
              : "?"}
          </div>
          <div className="flex-1">
            <div className="text-sm text-white/60 mb-1">Empfehlung</div>
            <div className="text-xl font-semibold text-white">
              {recommendation.recommended?.name || "Keine klare Empfehlung"}
            </div>
            <div className="text-sm text-white/60 mt-2">{recommendation.reasoning}</div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-white/50">Konfidenz:</span>
              <div className="flex gap-1">
                {["high", "medium", "low"].map((level, i) => (
                  <div
                    key={level}
                    className={`h-2 w-6 rounded-full ${
                      recommendation.confidence === "high"
                        ? "bg-green-400"
                        : recommendation.confidence === "medium" && i < 2
                        ? "bg-yellow-400"
                        : recommendation.confidence === "low" && i === 0
                        ? "bg-red-400"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-white/50 capitalize">
                {recommendation.confidence === "high"
                  ? "Hoch"
                  : recommendation.confidence === "medium"
                  ? "Mittel"
                  : "Niedrig"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings */}
      <div className="space-y-3">
        <div className="text-sm font-medium text-white/70">Ranking</div>
        {validResults.map((result, index) => {
          const alt = alternatives.find((a) => a.id === result.alternativeId);
          const barWidth = (result.totalScore / maxScore) * 100;
          const isWinner = index === 0;

          return (
            <div
              key={result.alternativeId}
              className={`rounded-xl border p-4 ${
                isWinner
                  ? "border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                    isWinner
                      ? "bg-[rgb(var(--accent))] text-white"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {result.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-white truncate">{alt?.name}</div>
                    <div className="text-sm font-semibold text-[rgb(var(--accent))]">
                      {result.totalScore.toFixed(2)}
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isWinner
                          ? "bg-[rgb(var(--accent))]"
                          : "bg-[rgb(var(--accent))]/50"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    Normalisiert: {result.normalizedScore.toFixed(0)}%
                    {result.riskScore !== undefined && (
                      <span className="ml-4">Risiko-Score: {result.riskScore.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Knocked out alternatives */}
        {knockoutFailures.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-red-400/70 mb-2">
              Ausgeschieden (K.O.-Kriterien)
            </div>
            {knockoutFailures.map((failure) => {
              const alt = alternatives.find((a) => a.id === failure.alternativeId);
              const failedCritNames = failure.failedCriteria
                .map((cId) => criteria.find((c) => c.id === cId)?.name)
                .filter(Boolean);

              return (
                <div
                  key={failure.alternativeId}
                  className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 mb-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center text-lg bg-red-500/20 text-red-400">
                      ✕
                    </div>
                    <div>
                      <div className="font-medium text-white/60">{alt?.name}</div>
                      <div className="text-xs text-red-400/70">
                        Nicht bestanden: {failedCritNames.join(", ")}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Criteria breakdown */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-white/70 mb-4">
          Detailanalyse nach Kriterien
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 pr-4 text-white/50 font-medium">
                  Kriterium
                </th>
                <th className="text-left py-2 pr-4 text-white/50 font-medium">
                  Gewicht
                </th>
                {validResults.slice(0, 5).map((r) => {
                  const alt = alternatives.find((a) => a.id === r.alternativeId);
                  return (
                    <th
                      key={r.alternativeId}
                      className="text-center py-2 px-2 text-white/50 font-medium"
                    >
                      {alt?.name}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion) => (
                <tr key={criterion.id} className="border-b border-white/5">
                  <td className="py-2 pr-4 text-white/70">{criterion.name}</td>
                  <td className="py-2 pr-4 text-white/50">
                    {(criterion.weight * 100).toFixed(0)}%
                  </td>
                  {validResults.slice(0, 5).map((r) => {
                    const criterionScore = r.criteriaScores.find(
                      (cs) => cs.criterionId === criterion.id
                    );
                    return (
                      <td
                        key={r.alternativeId}
                        className="py-2 px-2 text-center text-white/60"
                      >
                        {criterionScore?.rawScore.toFixed(1) || "–"}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="font-semibold">
                <td className="py-3 pr-4 text-white">Gesamtscore</td>
                <td className="py-3 pr-4 text-white/50">100%</td>
                {validResults.slice(0, 5).map((r) => (
                  <td
                    key={r.alternativeId}
                    className="py-3 px-2 text-center text-[rgb(var(--accent))]"
                  >
                    {r.totalScore.toFixed(2)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Sensitivity Analysis (Advanced/Business) */}
      {packageLevel !== "basic" && sensitivityResults.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-medium text-white/70 mb-4">
            Sensitivitätsanalyse
          </div>
          <p className="text-xs text-white/50 mb-4">
            Zeigt, wie empfindlich das Ranking auf Änderungen der Gewichtung reagiert.
          </p>
          <div className="space-y-3">
            {sensitivityResults.slice(0, 5).map((sens) => {
              const criterion = criteria.find((c) => c.id === sens.criterionId);
              return (
                <div key={sens.criterionId} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white/70 truncate">
                      {criterion?.name}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        sens.impactOnRanking === "high"
                          ? "bg-red-500/20 text-red-400"
                          : sens.impactOnRanking === "medium"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-green-500/20 text-green-400"
                      }`}
                    >
                      {sens.impactOnRanking === "high"
                        ? "Hoch"
                        : sens.impactOnRanking === "medium"
                        ? "Mittel"
                        : "Niedrig"}
                    </div>
                    <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sens.impactOnRanking === "high"
                            ? "bg-red-400"
                            : sens.impactOnRanking === "medium"
                            ? "bg-yellow-400"
                            : "bg-green-400"
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

      {/* AHP Consistency (Business) */}
      {packageLevel === "business" && ahpConsistency && (
        <div
          className={`rounded-xl border p-4 ${
            ahpConsistency.isConsistent
              ? "border-green-500/30 bg-green-500/10"
              : "border-yellow-500/30 bg-yellow-500/10"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`h-2 w-2 rounded-full ${
                ahpConsistency.isConsistent ? "bg-green-400" : "bg-yellow-400"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                ahpConsistency.isConsistent ? "text-green-400" : "text-yellow-400"
              }`}
            >
              AHP-Konsistenzprüfung
            </span>
          </div>
          <p className="text-sm text-white/70">{ahpConsistency.message}</p>
          <div className="mt-2 text-xs text-white/50">
            Konsistenzratio (CR): {(ahpConsistency.consistencyRatio * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}
