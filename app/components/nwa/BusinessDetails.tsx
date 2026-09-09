"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useAnalysis } from "../../lib/nwa/analysis-context";
export function BusinessDetails() {
  const { state, dispatch, addRisk } = useAnalysis();
  const [alternativeId, setAlternativeId] = useState(
    state.alternatives[0]?.id || "",
  );
  const [description, setDescription] = useState("");
  const [probability, setProbability] = useState(25);
  const [impact, setImpact] = useState(5);
  const [mitigation, setMitigation] = useState("");
  return (
    <details className="workspace-details">
      <summary>Risiken dokumentieren (optional)</summary>
      <p className="muted">
        Eintrittswahrscheinlichkeit × Auswirkung ergibt den Risikowert. Er wird
        separat ausgewiesen und verändert die Nutzwertrangliste nicht.
      </p>
      {state.risks.map((r, i) => (
        <div className="risk-item" key={`${r.alternativeId}-${i}`}>
          <div>
            <strong>
              {state.alternatives.find((a) => a.id === r.alternativeId)?.name}
            </strong>
            <p>{r.description}</p>
            <small>
              {Math.round(r.probability * 100)} % × {r.impact} ={" "}
              {(r.probability * r.impact).toFixed(2)} / 10
            </small>
            {r.mitigation && <p>Massnahme: {r.mitigation}</p>}
          </div>
          <button
            aria-label={`Risiko ${r.description} entfernen`}
            onClick={() =>
              dispatch({
                type: "REMOVE_RISK",
                payload: {
                  alternativeId: r.alternativeId,
                  description: r.description,
                },
              })
            }
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}
      <form
        className="risk-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (description.trim() && state.risks.length < 100) {
            addRisk({
              alternativeId,
              description: description.trim(),
              probability: probability / 100,
              impact,
              mitigation,
            });
            setDescription("");
            setMitigation("");
          }
        }}
      >
        <label>
          Alternative
          <select
            value={alternativeId}
            onChange={(e) => setAlternativeId(e.target.value)}
          >
            {state.alternatives.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Risiko
          <input
            required
            maxLength={10000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <div className="risk-numbers">
          <label>
            Wahrscheinlichkeit (%)
            <input
              required
              type="number"
              min="0"
              max="100"
              value={probability}
              onChange={(e) => setProbability(Number(e.target.value))}
            />
          </label>
          <label>
            Auswirkung (1–10)
            <input
              required
              type="number"
              min="1"
              max="10"
              value={impact}
              onChange={(e) => setImpact(Number(e.target.value))}
            />
          </label>
        </div>
        <label>
          Gegenmassnahme
          <input
            maxLength={10000}
            value={mitigation}
            onChange={(e) => setMitigation(e.target.value)}
          />
        </label>
        <button
          className="studio-button secondary"
          disabled={!description.trim() || state.risks.length >= 100}
        >
          Risiko hinzufügen
        </button>
      </form>
    </details>
  );
}
