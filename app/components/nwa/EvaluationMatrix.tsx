"use client";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useAnalysis } from "../../lib/nwa/analysis-context";
import { useTranslations } from "../../lib/i18n";
import { BusinessDetails } from "./BusinessDetails";
export function EvaluationMatrix() {
  const {
    state,
    setRating,
    addEvaluator,
    updateEvaluator,
    removeEvaluator,
    knockoutFailures,
  } = useAnalysis();
  const { alternatives, criteria, ratings, evaluators, decision } = state;
  const t = useTranslations();
  const [selected, setSelected] = useState(evaluators[0]?.id);
  const [name, setName] = useState("");
  const business = decision.packageLevel === "business";
  const person = business
    ? evaluators.some((e) => e.id === selected)
      ? selected
      : evaluators[0]?.id
    : undefined;
  const completed = ratings.filter(
    (r) =>
      r.evaluatorId === person &&
      alternatives.some((a) => a.id === r.alternativeId) &&
      criteria.some((c) => c.id === r.criterionId),
  ).length;
  const total = alternatives.length * criteria.length;
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">05 / {t.steps.evaluation}</p>
        <h2>{t.evaluationSetup.title}</h2>
        <p className="muted mt-3">
          1 = schlecht geeignet, 10 = sehr gut geeignet. Bei Kosten, Lieferzeit
          und Risiko gilt: ein tieferer tatsächlicher Wert erhält eine höhere
          Bewertung.
        </p>
      </div>
      {business && (
        <details className="workspace-details" open>
          <summary>Bewertende · {evaluators.length}</summary>
          <p className="muted">
            Bewertungen werden nacheinander auf diesem Gerät erfasst. Das
            Personengewicht bestimmt den Anteil am Mittelwert.
          </p>
          <div className="people-list">
            {evaluators.map((e) => (
              <div key={e.id}>
                <label>
                  Name
                  <input
                    aria-label="Name der bewertenden Person"
                    maxLength={200}
                    value={e.name}
                    onChange={(x) =>
                      updateEvaluator({ ...e, name: x.target.value })
                    }
                  />
                </label>
                <label>
                  Gewicht
                  <input
                    aria-label={`Personengewicht ${e.name}`}
                    type="number"
                    min="1"
                    max="100"
                    value={e.weight ?? 1}
                    onChange={(x) =>
                      updateEvaluator({
                        ...e,
                        weight: Math.max(
                          1,
                          Math.min(100, Number(x.target.value) || 1),
                        ),
                      })
                    }
                  />
                </label>
                <button
                  aria-label={`${e.name} entfernen`}
                  disabled={evaluators.length <= 1}
                  onClick={() => removeEvaluator(e.id)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            ))}
          </div>
          <form
            className="action-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) {
                addEvaluator({ name: name.trim(), weight: 1 });
                setName("");
              }
            }}
          >
            <input
              aria-label="Weitere bewertende Person"
              placeholder="Weitere Person"
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="studio-button secondary"
              disabled={!name.trim() || evaluators.length >= 10}
            >
              <Plus size={17} />
              Hinzufügen
            </button>
          </form>
        </details>
      )}
      {business && (
        <label className="field-label">
          Bewertung erfassen für
          <select value={person} onChange={(e) => setSelected(e.target.value)}>
            {evaluators.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name || "Unbenannt"}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="rating-progress">
        <span>
          {completed} von {total} Bewertungen
          {business ? " für diese Person" : ""}
        </span>
        <strong>{Math.round((completed / Math.max(1, total)) * 100)} %</strong>
      </div>
      <div
        className="table-scroll rating-table"
        tabIndex={0}
        aria-label="Bewertungstabelle, horizontal scrollbar"
      >
        <table>
          <caption className="sr-only">
            Bewertungen von 1 bis 10 für jede Alternative und jedes Kriterium
          </caption>
          <thead>
            <tr>
              <th scope="col">Kriterium</th>
              {alternatives.map((a) => (
                <th scope="col" key={a.id}>
                  {a.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((c) => (
              <tr key={c.id}>
                <th scope="row">
                  <span>{c.name}</span>
                  <small>
                    {(c.weight * 100).toFixed(1)} % Gewicht
                    {c.isKnockout ? ` · K.O. unter ${c.minThreshold}` : ""}
                  </small>
                </th>
                {alternatives.map((a) => {
                  const r = ratings.find(
                    (r) =>
                      r.alternativeId === a.id &&
                      r.criterionId === c.id &&
                      r.evaluatorId === person,
                  );
                  return (
                    <td key={a.id}>
                      <select
                        aria-label={`${a.name}: ${c.name}`}
                        value={r?.score ?? ""}
                        onChange={(e) =>
                          setRating({
                            ...r,
                            alternativeId: a.id,
                            criterionId: c.id,
                            evaluatorId: person,
                            score: Number(e.target.value),
                          })
                        }
                      >
                        <option value="" disabled>
                          Bewerten
                        </option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      {decision.packageLevel !== "basic" && (
                        <details>
                          <summary className="rating-note">Notiz</summary>
                          <textarea
                            aria-label={`Begründung ${a.name}: ${c.name}`}
                            rows={2}
                            maxLength={10000}
                            value={r?.comment || ""}
                            disabled={!r}
                            placeholder={
                              r ? "Begründung oder Quelle" : "Zuerst bewerten"
                            }
                            onChange={(e) =>
                              r && setRating({ ...r, comment: e.target.value })
                            }
                          />
                        </details>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {knockoutFailures.length > 0 && (
        <div className="notice warning">
          <div>
            <strong>K.O.-Kriterien unterschritten</strong>
            <p>
              {knockoutFailures
                .map(
                  (f) =>
                    `${alternatives.find((a) => a.id === f.alternativeId)?.name}: ${f.failedCriteria.map((id) => criteria.find((c) => c.id === id)?.name).join(", ")}`,
                )
                .join("; ")}
            </p>
            <p>
              Bei mehreren Bewertenden gilt ihr gewichteter Mittelwert.
              Unvollständige Bewertungen können den Status noch verändern.
            </p>
          </div>
        </div>
      )}
      {business && <BusinessDetails />}
    </div>
  );
}
