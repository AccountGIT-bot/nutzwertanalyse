"use client";

import { useState, useMemo, useCallback } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { StepInfoButton } from "./StepInfoButton";
import { useTranslations } from "@/app/lib/i18n";

export function EvaluationMatrix() {
  const { state, setRating, canProceedToNext, knockoutFailures } = useAnalysis();
  const { alternatives, criteria, ratings, evaluators, decision } = state;
  const packageLevel = decision.packageLevel;
  const t = useTranslations();

  const [selectedEvaluator, setSelectedEvaluator] = useState(
    evaluators[0]?.id || undefined
  );
  const [hoveredCell, setHoveredCell] = useState<{
    altId: string;
    critId: string;
  } | null>(null);

  // Get rating value for a cell
  const getRating = (altId: string, critId: string): number => {
    const rating = ratings.find(
      (r) =>
        r.alternativeId === altId &&
        r.criterionId === critId &&
        (packageLevel !== "business" || r.evaluatorId === selectedEvaluator)
    );
    return rating?.score || 0;
  };

  // Calculate completion percentage
  const completionPercent = useMemo(() => {
    const total = alternatives.length * criteria.length;
    const completed = new Set(
      ratings
        .filter(
          (r) =>
            r.score > 0 &&
            (packageLevel !== "business" || r.evaluatorId === selectedEvaluator)
        )
        .map((r) => `${r.alternativeId}-${r.criterionId}`)
    ).size;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [alternatives, criteria, ratings, packageLevel, selectedEvaluator]);

  const handleRating = useCallback((altId: string, critId: string, score: number) => {
    setRating({
      alternativeId: altId,
      criterionId: critId,
      score,
      evaluatorId: packageLevel === "business" ? selectedEvaluator : undefined,
    });
  }, [setRating, packageLevel, selectedEvaluator]);

  // Memoized knockout lookup map for O(1) access
  const knockoutMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const f of knockoutFailures) {
      map.set(f.alternativeId, f.failedCriteria);
    }
    return map;
  }, [knockoutFailures]);

  // Check if alternative failed knockout criteria - O(1) with map
  const isKnockout = useCallback((altId: string): boolean => {
    return knockoutMap.has(altId);
  }, [knockoutMap]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60 flex items-center gap-2">
          {t.steps.step} 5
          <StepInfoButton stepId="rating" />
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {t.evaluationSetup.title}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {t.evaluationSetup.description}
        </p>
      </div>

      {/* Evaluator selector (Business) */}
      {packageLevel === "business" && evaluators.length > 1 && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60">{t.evaluationSetup.evaluator}:</span>
          <div className="flex gap-2">
            {evaluators.map((evaluator) => (
              <button
                key={evaluator.id}
                onClick={() => setSelectedEvaluator(evaluator.id)}
                className={`px-4 py-2 rounded-lg text-sm transition ${
                  selectedEvaluator === evaluator.id
                    ? "bg-[rgb(var(--accent))] text-white"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
              >
                {evaluator.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">{t.evaluationSetup.progress}</span>
          <span className="text-sm font-medium text-white">{completionPercent}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[rgb(var(--accent))] transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Evaluation Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Header */}
          <div className="flex gap-2 mb-3">
            <div className="w-40 flex-shrink-0" />
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className={`flex-1 text-center text-sm font-medium truncate px-2 ${
                  isKnockout(alt.id) ? "text-red-400" : "text-white"
                }`}
                title={alt.name}
              >
                {alt.name}
                {isKnockout(alt.id) && (
                  <div className="text-xs text-red-400/70 font-normal">K.O.</div>
                )}
              </div>
            ))}
          </div>

          {/* Criteria rows */}
          <div className="space-y-2">
            {criteria.map((criterion) => {
              const failedAlternatives = knockoutFailures
                .filter((f) => f.failedCriteria.includes(criterion.id))
                .map((f) => f.alternativeId);

              return (
                <div
                  key={criterion.id}
                  className="flex gap-2 items-center rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  {/* Criterion label */}
                  <div className="w-40 flex-shrink-0">
                    <div className="text-sm font-medium text-white truncate">
                      {criterion.name}
                    </div>
                    <div className="text-xs text-white/40">
                      {t.evaluationSetup.weight}: {(criterion.weight * 100).toFixed(0)}%
                      {criterion.isKnockout && (
                        <span className="ml-2 text-yellow-400">
                          {t.criteriaSetup.knockoutThreshold}: {criterion.minThreshold}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating cells */}
                  {alternatives.map((alt) => {
                    const rating = getRating(alt.id, criterion.id);
                    const isHovered =
                      hoveredCell?.altId === alt.id &&
                      hoveredCell?.critId === criterion.id;
                    const isFailed = failedAlternatives.includes(alt.id);

                    return (
                      <div
                        key={alt.id}
                        className="flex-1"
                        onMouseEnter={() =>
                          setHoveredCell({ altId: alt.id, critId: criterion.id })
                        }
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {isHovered ? (
                          // Expanded rating buttons
                          <div className="flex gap-0.5 justify-center">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                              <button
                                key={score}
                                onClick={() => handleRating(alt.id, criterion.id, score)}
                                className={`h-8 w-6 rounded text-xs font-medium transition ${
                                  rating === score
                                    ? "bg-[rgb(var(--accent))] text-white"
                                    : "bg-white/10 text-white/60 hover:bg-white/20"
                                }`}
                              >
                                {score}
                              </button>
                            ))}
                          </div>
                        ) : (
                          // Compact view
                          <div
                            className={`h-10 rounded-lg flex items-center justify-center cursor-pointer transition ${
                              isFailed
                                ? "bg-red-500/20 border border-red-500/30"
                                : rating > 0
                                ? "bg-[rgb(var(--accent))]/20"
                                : "bg-white/10 hover:bg-white/15"
                            }`}
                          >
                            {rating > 0 ? (
                              <span
                                className={`text-lg font-semibold ${
                                  isFailed ? "text-red-400" : "text-[rgb(var(--accent))]"
                                }`}
                              >
                                {rating}
                              </span>
                            ) : (
                              <span className="text-white/30 text-sm">—</span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Knockout warnings */}
      {knockoutFailures.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-2 w-2 rounded-full bg-red-400" />
            <span className="text-sm font-medium text-red-400">
              {t.evaluationSetup.knockoutFailed}
            </span>
          </div>
          <div className="space-y-1">
            {knockoutFailures.map((failure) => {
              const alt = alternatives.find((a) => a.id === failure.alternativeId);
              const failedCritNames = failure.failedCriteria
                .map((cId) => criteria.find((c) => c.id === cId)?.name)
                .filter(Boolean);
              return (
                <div key={failure.alternativeId} className="text-sm text-white/70">
                  <span className="font-medium">{alt?.name}</span>: {failedCritNames.join(", ")}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs text-white/40">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-white/10" />
          <span>{t.evaluationSetup.legend.notRated}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-[rgb(var(--accent))]/20" />
          <span>{t.evaluationSetup.legend.rated}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded bg-red-500/20 border border-red-500/30" />
          <span>{t.evaluationSetup.legend.knockoutFailed}</span>
        </div>
        <div className="ml-auto">{t.evaluationSetup.scale}</div>
      </div>

      {/* Validation */}
      {!canProceedToNext && (
        <div className="text-sm text-[rgb(var(--accent))]/80">
          {t.evaluationSetup.validation}
        </div>
      )}
    </div>
  );
}
