"use client";

import { useState, useMemo, useCallback } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { calculateNwa, normalizeWeights } from "@/app/lib/nwa/calculate";

export function SensitivityAnalysis() {
  const { state } = useAnalysis();
  const { alternatives, criteria, ratings, evaluators, results, sensitivityResults, decision } =
    state;

  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);
  const [weightAdjustment, setWeightAdjustment] = useState<number>(0);

  // Calculate "what-if" results with adjusted weights
  const whatIfResults = useMemo(() => {
    if (!selectedCriterion || weightAdjustment === 0) return null;

    // Clone and adjust criteria weights
    const adjustedCriteria = criteria.map((c) => ({
      ...c,
      rawWeight:
        c.id === selectedCriterion
          ? Math.max(0, c.rawWeight * (1 + weightAdjustment / 100))
          : c.rawWeight,
    }));

    const normalized = normalizeWeights(adjustedCriteria);

    return calculateNwa(
      alternatives,
      normalized,
      ratings,
      evaluators.length > 0 ? evaluators : undefined
    );
  }, [selectedCriterion, weightAdjustment, criteria, alternatives, ratings, evaluators]);

  // Compare original vs what-if rankings
  const rankingChanges = useMemo(() => {
    if (!whatIfResults) return [];

    return whatIfResults.map((newResult) => {
      const originalResult = results.find((r) => r.alternativeId === newResult.alternativeId);
      const originalRank = originalResult?.rank || 0;
      const newRank = newResult.rank;
      const rankChange = originalRank - newRank;

      return {
        alternativeId: newResult.alternativeId,
        originalRank,
        newRank,
        rankChange,
        originalScore: originalResult?.totalScore || 0,
        newScore: newResult.totalScore,
      };
    });
  }, [whatIfResults, results]);

  const handleCriterionSelect = useCallback((criterionId: string) => {
    setSelectedCriterion(criterionId === selectedCriterion ? null : criterionId);
    setWeightAdjustment(0);
  }, [selectedCriterion]);

  if (decision.packageLevel === "basic") {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white">Interaktive Sensitivitätsanalyse</h3>
        <p className="mt-1 text-sm text-white/50">
          Testen Sie, wie sich Änderungen der Gewichtung auf das Ergebnis auswirken.
        </p>
      </div>

      {/* Sensitivity overview */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {sensitivityResults.map((sens) => {
          const criterion = criteria.find((c) => c.id === sens.criterionId);
          const isSelected = selectedCriterion === sens.criterionId;
          
          // Skip if criterion not found
          if (!criterion) return null;

          return (
            <button
              key={sens.criterionId}
              onClick={() => handleCriterionSelect(sens.criterionId)}
              className={`rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10"
                  : "border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-white truncate pr-2">
                  {criterion.name}
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
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
              </div>
              <div className="text-xs text-white/50">
                Gewicht: {((criterion.weight || 0) * 100).toFixed(0)}%
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
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
            </button>
          );
        })}
      </div>

      {/* What-if simulator */}
      {selectedCriterion && (
        <div className="rounded-xl border border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium text-white">
                Was-wäre-wenn Simulation
              </div>
              <div className="text-xs text-white/50">
                {criteria.find((c) => c.id === selectedCriterion)?.name}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCriterion(null);
                setWeightAdjustment(0);
              }}
              className="text-white/50 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/50">Gewichtsänderung</span>
              <span className="text-sm font-medium text-[rgb(var(--accent))]">
                {weightAdjustment > 0 ? "+" : ""}
                {weightAdjustment}%
              </span>
            </div>
            <input
              type="range"
              min={-50}
              max={50}
              value={weightAdjustment}
              onChange={(e) => setWeightAdjustment(parseInt(e.target.value))}
              className="w-full accent-[rgb(var(--accent))]"
            />
            <div className="flex justify-between text-xs text-white/40 mt-1">
              <span>-50%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>

          {/* Results comparison */}
          {rankingChanges.length > 0 && weightAdjustment !== 0 && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-white/60 mb-2">
                Auswirkung auf das Ranking
              </div>
              {rankingChanges.map((change) => {
                const alt = alternatives.find((a) => a.id === change.alternativeId);
                return (
                  <div
                    key={change.alternativeId}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <span className="text-sm text-white/50">#{change.originalRank}</span>
                      {change.rankChange !== 0 && (
                        <>
                          <svg
                            className={`h-4 w-4 ${
                              change.rankChange > 0 ? "text-green-400" : "text-red-400"
                            }`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={
                                change.rankChange > 0
                                  ? "M5 15l7-7 7 7"
                                  : "M19 9l-7 7-7-7"
                              }
                            />
                          </svg>
                          <span
                            className={`text-sm font-medium ${
                              change.rankChange > 0 ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            #{change.newRank}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex-1 text-sm text-white truncate">{alt?.name}</div>
                    <div className="text-xs text-white/40">
                      {change.originalScore.toFixed(2)} → {change.newScore.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {weightAdjustment === 0 && (
            <div className="text-center text-sm text-white/40 py-4">
              Bewegen Sie den Regler, um die Auswirkungen zu sehen.
            </div>
          )}
        </div>
      )}

      {/* Explanation */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-medium text-white/70 mb-2">
          Interpretation der Sensitivitätsanalyse
        </div>
        <ul className="text-xs text-white/50 space-y-1">
          <li>
            <span className="inline-block w-16 text-red-400 font-medium">Hoch:</span>
            Kleine Gewichtsänderungen können das Ranking verändern
          </li>
          <li>
            <span className="inline-block w-16 text-yellow-400 font-medium">Mittel:</span>
            Moderate Änderungen beeinflussen das Ergebnis
          </li>
          <li>
            <span className="inline-block w-16 text-green-400 font-medium">Niedrig:</span>
            Das Ergebnis ist robust gegenüber Gewichtsänderungen
          </li>
        </ul>
      </div>
    </div>
  );
}
