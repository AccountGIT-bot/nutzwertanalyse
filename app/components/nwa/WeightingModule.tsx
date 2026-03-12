"use client";

import { useState, useMemo } from "react";
import { useAnalysis } from "@/app/lib/nwa/store";
import type { WeightingMethod } from "@/app/lib/nwa/types";

const AHP_SCALE = [
  { value: 1 / 9, label: "1/9", desc: "Extrem weniger wichtig" },
  { value: 1 / 7, label: "1/7", desc: "Sehr viel weniger wichtig" },
  { value: 1 / 5, label: "1/5", desc: "Deutlich weniger wichtig" },
  { value: 1 / 3, label: "1/3", desc: "Etwas weniger wichtig" },
  { value: 1, label: "1", desc: "Gleich wichtig" },
  { value: 3, label: "3", desc: "Etwas wichtiger" },
  { value: 5, label: "5", desc: "Deutlich wichtiger" },
  { value: 7, label: "7", desc: "Sehr viel wichtiger" },
  { value: 9, label: "9", desc: "Extrem wichtiger" },
];

export function WeightingModule() {
  const {
    state,
    updateCriterion,
    setWeightingMethod,
    setAHPComparison,
    canProceedToNext,
  } = useAnalysis();
  const { criteria, decision, weightingMethod, ahpComparisons, ahpConsistency } = state;
  const packageLevel = decision.packageLevel;

  const [activeAHPPair, setActiveAHPPair] = useState<[number, number] | null>(null);

  // Calculate total weight for percentage method
  const totalWeight = useMemo(
    () => criteria.reduce((sum, c) => sum + c.rawWeight, 0),
    [criteria]
  );

  // Generate AHP pairs
  const ahpPairs = useMemo(() => {
    const pairs: [number, number][] = [];
    for (let i = 0; i < criteria.length; i++) {
      for (let j = i + 1; j < criteria.length; j++) {
        pairs.push([i, j]);
      }
    }
    return pairs;
  }, [criteria.length]);

  // Get current AHP value for a pair
  const getAHPValue = (i: number, j: number): number => {
    const comp = ahpComparisons.find(
      (c) =>
        (c.criterionId1 === criteria[i]?.id && c.criterionId2 === criteria[j]?.id) ||
        (c.criterionId1 === criteria[j]?.id && c.criterionId2 === criteria[i]?.id)
    );
    if (!comp) return 1;
    if (comp.criterionId1 === criteria[i]?.id) return comp.value;
    return 1 / comp.value;
  };

  // Completed AHP comparisons count
  const completedComparisons = ahpComparisons.length;
  const totalComparisons = ahpPairs.length;

  const handleWeightChange = (criterionId: string, value: number) => {
    const criterion = criteria.find((c) => c.id === criterionId);
    if (criterion) {
      updateCriterion({ ...criterion, rawWeight: value });
    }
  };

  const handleAHPCompare = (i: number, j: number, value: number) => {
    setAHPComparison({
      criterionId1: criteria[i].id,
      criterionId2: criteria[j].id,
      value,
    });
  };

  const renderSimpleWeighting = () => (
    <div className="space-y-4">
      <p className="text-sm text-white/50">
        Bewerten Sie die Wichtigkeit jedes Kriteriums auf einer Skala von 1 bis 5.
      </p>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {criterion.name}
                </div>
                {criterion.description && (
                  <div className="text-sm text-white/50 truncate">
                    {criterion.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    onClick={() => handleWeightChange(criterion.id, val)}
                    className={`h-10 w-10 rounded-lg font-medium transition ${
                      criterion.rawWeight === val
                        ? "bg-[rgb(var(--accent))] text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-xs text-white/40 text-right">
        1 = wenig wichtig, 5 = sehr wichtig
      </div>
    </div>
  );

  const renderPercentageWeighting = () => (
    <div className="space-y-4">
      <p className="text-sm text-white/50">
        Verteilen Sie 100% auf die Kriterien entsprechend ihrer Wichtigkeit.
      </p>
      <div className="space-y-3">
        {criteria.map((criterion) => (
          <div
            key={criterion.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white truncate">
                  {criterion.name}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={criterion.rawWeight}
                  onChange={(e) =>
                    handleWeightChange(criterion.id, parseInt(e.target.value))
                  }
                  className="w-32 accent-[rgb(var(--accent))]"
                />
                <div className="w-16 text-right">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={criterion.rawWeight}
                    onChange={(e) =>
                      handleWeightChange(
                        criterion.id,
                        Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                      )
                    }
                    className="w-full h-9 px-2 rounded-lg bg-white/10 border border-white/10 text-white text-center outline-none"
                  />
                </div>
                <span className="text-white/50 w-6">%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`text-sm text-right ${
          totalWeight === 100 ? "text-green-400" : "text-yellow-400"
        }`}
      >
        Summe: {totalWeight}% {totalWeight !== 100 && "(sollte 100% sein)"}
      </div>
    </div>
  );

  const renderAHPWeighting = () => (
    <div className="space-y-6">
      <p className="text-sm text-white/50">
        Vergleichen Sie jeweils zwei Kriterien paarweise miteinander.
        {packageLevel === "business" && " Die Konsistenz Ihrer Bewertungen wird geprüft."}
      </p>

      {/* Progress */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Fortschritt</span>
          <span className="text-sm font-medium text-white">
            {completedComparisons} / {totalComparisons}
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-[rgb(var(--accent))] transition-all"
            style={{ width: `${(completedComparisons / totalComparisons) * 100}%` }}
          />
        </div>
      </div>

      {/* AHP Matrix */}
      <div className="space-y-2">
        {ahpPairs.map(([i, j], pairIndex) => {
          const value = getAHPValue(i, j);
          const isActive = activeAHPPair?.[0] === i && activeAHPPair?.[1] === j;

          return (
            <div
              key={`${i}-${j}`}
              className={`rounded-xl border p-4 transition ${
                isActive
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex-1 text-sm font-medium text-white">
                  {criteria[i]?.name}
                </div>
                <div className="text-white/40">vs.</div>
                <div className="flex-1 text-sm font-medium text-white text-right">
                  {criteria[j]?.name}
                </div>
              </div>

              <div className="flex items-center justify-center gap-1">
                {AHP_SCALE.map((scale) => {
                  const isSelected = Math.abs(value - scale.value) < 0.01;
                  return (
                    <button
                      key={scale.label}
                      onClick={() => handleAHPCompare(i, j, scale.value)}
                      onMouseEnter={() => setActiveAHPPair([i, j])}
                      onMouseLeave={() => setActiveAHPPair(null)}
                      className={`h-9 px-2 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? "bg-[rgb(var(--accent))] text-white"
                          : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                      title={scale.desc}
                    >
                      {scale.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-center text-xs text-white/40">
                {value < 1
                  ? `${criteria[j]?.name} ist wichtiger`
                  : value > 1
                  ? `${criteria[i]?.name} ist wichtiger`
                  : "Gleich wichtig"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Consistency check (Business) */}
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
              Konsistenzprüfung
            </span>
          </div>
          <p className="text-sm text-white/70">{ahpConsistency.message}</p>
          <div className="mt-2 text-xs text-white/50">
            CR = {(ahpConsistency.consistencyRatio * 100).toFixed(1)}%
            {ahpConsistency.consistencyRatio < 0.1 ? " (akzeptabel < 10%)" : " (sollte < 10% sein)"}
          </div>
        </div>
      )}
    </div>
  );

  // Determine available methods based on package
  const availableMethods: { id: WeightingMethod; label: string; desc: string }[] =
    packageLevel === "basic"
      ? [{ id: "simple", label: "Einfache Gewichtung (1-5)", desc: "Schnell und intuitiv" }]
      : packageLevel === "advanced"
      ? [
          { id: "percentage", label: "Prozentuale Gewichtung", desc: "Verteilung auf 100%" },
          { id: "ahp-light", label: "AHP Light", desc: "Paarweiser Vergleich" },
        ]
      : [
          { id: "percentage", label: "Prozentuale Gewichtung", desc: "Verteilung auf 100%" },
          { id: "ahp-full", label: "Vollständige AHP", desc: "Mit Konsistenzprüfung" },
        ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60">Schritt 4</div>
        <h2 className="mt-1 text-xl font-semibold text-white">Kriterien gewichten</h2>
        <p className="mt-2 text-sm text-white/50">
          Bestimmen Sie die relative Wichtigkeit der Kriterien.
        </p>
      </div>

      {/* Method selector */}
      {availableMethods.length > 1 && (
        <div className="flex gap-2">
          {availableMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setWeightingMethod(method.id)}
              className={`flex-1 rounded-xl p-4 text-left transition ${
                weightingMethod === method.id
                  ? "border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/10 border"
                  : "border border-white/10 bg-white/5 hover:bg-white/10"
              }`}
            >
              <div className="font-medium text-white">{method.label}</div>
              <div className="text-sm text-white/50">{method.desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Weighting interface */}
      {weightingMethod === "simple" && renderSimpleWeighting()}
      {weightingMethod === "percentage" && renderPercentageWeighting()}
      {(weightingMethod === "ahp-light" || weightingMethod === "ahp-full") &&
        renderAHPWeighting()}

      {/* Validation */}
      {!canProceedToNext && (
        <div className="text-sm text-[rgb(var(--accent))]/80">
          {weightingMethod === "percentage" && totalWeight !== 100
            ? "Die Summe der Gewichtungen sollte 100% betragen."
            : "Bitte vergeben Sie Gewichtungen für alle Kriterien."}
        </div>
      )}
    </div>
  );
}
