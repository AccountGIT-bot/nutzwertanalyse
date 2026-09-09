"use client";
import { useMemo, useState } from "react";
import { useAnalysis } from "../../lib/nwa/analysis-context";
import {
  calculateNwa,
  reweightCriterion,
  getRecommendation,
} from "../../lib/nwa/calculate";
export function SensitivityAnalysis() {
  const { state } = useAnalysis();
  const [criterionId, setCriterionId] = useState(state.criteria[0]?.id || "");
  const original =
    state.criteria.find((c) => c.id === criterionId) || state.criteria[0];
  const [value, setValue] = useState<number | null>(null);
  const weight = value ?? (original?.weight || 0) * 100;
  const simulated = useMemo(
    () =>
      calculateNwa(
        state.alternatives,
        reweightCriterion(state.criteria, original?.id || "", weight / 100),
        state.ratings,
        state.evaluators.length ? state.evaluators : undefined,
      ),
    [state, original?.id, weight],
  );
  const recommendation = getRecommendation(simulated, state.alternatives);
  return (
    <div className="sensitivity-tool">
      <h3>Was verändert deine Entscheidung?</h3>
      <p className="muted">
        Verändere ein Gewicht. Die übrigen Gewichte werden proportional
        angepasst. Deine Ausgangsanalyse bleibt erhalten.
      </p>
      <div className="sensitivity-controls">
        <label>
          Kriterium
          <select
            value={original?.id}
            onChange={(e) => {
              setCriterionId(e.target.value);
              setValue(null);
            }}
          >
            {state.criteria.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Gewicht: {weight.toFixed(1)} %
          <input
            aria-label="Gewicht in der Sensitivitätsanalyse"
            type="range"
            min="0"
            max="100"
            step="1"
            value={weight}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="notice">
        {recommendation.recommended
          ? `Vorne liegt: ${recommendation.recommended.name}`
          : recommendation.reasoning}
      </p>
      <div className="result-bars">
        {simulated
          .filter((r) => !r.excluded)
          .map((r) => (
            <div key={r.alternativeId}>
              <div>
                <span>
                  {
                    state.alternatives.find((a) => a.id === r.alternativeId)
                      ?.name
                  }
                </span>
                <b>{r.totalScore.toFixed(2)} / 10</b>
              </div>
              <div className="bar-track">
                <span style={{ width: `${r.totalScore * 10}%` }} />
              </div>
            </div>
          ))}
      </div>
      <button
        className="studio-button secondary"
        onClick={() => setValue(null)}
      >
        Originalgewicht wiederherstellen
      </button>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kriterium</th>
              <th>Ausgangsgewicht</th>
              <th>Nächster Gleichstand an der Spitze</th>
            </tr>
          </thead>
          <tbody>
            {state.sensitivityResults.map((s) => (
              <tr key={s.criterionId}>
                <td>
                  {state.criteria.find((c) => c.id === s.criterionId)?.name}
                </td>
                <td>{(s.originalWeight * 100).toFixed(1)} %</td>
                <td>
                  {s.criticalWeight === null
                    ? "Kein Wechsel zwischen 0 und 100 %"
                    : `${(s.criticalWeight * 100).toFixed(1)} %`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
