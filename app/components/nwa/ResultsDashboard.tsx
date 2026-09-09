"use client";
import { useAnalysis } from "../../lib/nwa/analysis-context";
import { getRecommendation } from "../../lib/nwa/calculate";
import { useTranslations } from "../../lib/i18n";
import { ReportGenerator } from "./ReportGenerator";
import { SensitivityAnalysis } from "./SensitivityAnalysis";
export function ResultsDashboard() {
  const { state, knockoutFailures } = useAnalysis();
  const t = useTranslations();
  const { results, alternatives, criteria, decision, ahpConsistency } = state;
  if (!results.length)
    return (
      <div role="status">
        Ergebnisse werden berechnet. Falls keine erscheinen, prüfe bitte alle
        Analyseschritte.
      </div>
    );
  const recommendation = getRecommendation(results, alternatives);
  const valid = results.filter((r) => !r.excluded);
  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">06 / {t.steps.results}</p>
        <h2>{t.results.title}</h2>
      </div>
      <div className="result-recommendation">
        <p className="eyebrow">DEIN ERGEBNIS</p>
        <h3>
          {recommendation.recommended?.name || "Kein eindeutiger Favorit"}
        </h3>
        <p>{recommendation.reasoning}</p>
      </div>
      <div className="result-bars">
        <h3>{t.results.ranking}</h3>
        {valid.map((r) => (
          <div key={r.alternativeId} className={r.rank === 1 ? "winner" : ""}>
            <div>
              <span>
                <small>{r.rank.toString().padStart(2, "0")}</small>
                {alternatives.find((a) => a.id === r.alternativeId)?.name}
              </span>
              <b>
                {r.totalScore.toFixed(2)} <small>/ 10</small>
              </b>
            </div>
            <div className="bar-track">
              <span style={{ width: `${r.totalScore * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
      {knockoutFailures.length > 0 && (
        <div className="notice warning">
          <div>
            <strong>Durch K.O.-Kriterien ausgeschlossen</strong>
            {knockoutFailures.map((f) => (
              <p key={f.alternativeId}>
                {alternatives.find((a) => a.id === f.alternativeId)?.name}:{" "}
                {f.failedCriteria
                  .map((id) => criteria.find((c) => c.id === id)?.name)
                  .join(", ")}
              </p>
            ))}
            <p>Diese Alternativen erhalten keinen Rang und keine Empfehlung.</p>
          </div>
        </div>
      )}
      <details className="workspace-details" open>
        <summary>So setzt sich das Ergebnis zusammen</summary>
        <div
          className="table-scroll"
          tabIndex={0}
          aria-label="Detailauswertung, horizontal scrollbar"
        >
          <table className="data-table">
            <thead>
              <tr>
                <th>Kriterium</th>
                <th>Gewicht</th>
                {results.map((r) => (
                  <th key={r.alternativeId}>
                    {alternatives.find((a) => a.id === r.alternativeId)?.name}
                    {r.excluded ? " (K.O.)" : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {criteria.map((c) => (
                <tr key={c.id}>
                  <th scope="row">{c.name}</th>
                  <td>{(c.weight * 100).toFixed(1)} %</td>
                  {results.map((r) => (
                    <td key={r.alternativeId}>
                      {r.criteriaScores
                        .find((s) => s.criterionId === c.id)
                        ?.rawScore.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th>Nutzwert</th>
                <td>100 %</td>
                {results.map((r) => (
                  <td key={r.alternativeId}>
                    <strong>{r.totalScore.toFixed(2)}</strong>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted mt-4">
          Nutzwert = Summe aus Gewicht × Bewertung. Bei mehreren Bewertenden
          wird zuerst pro Kriterium ihr gewichteter Mittelwert gebildet. Die
          Skala bleibt für alle Alternativen gleich.
        </p>
      </details>
      {decision.packageLevel !== "basic" && valid.length > 1 && (
        <SensitivityAnalysis />
      )}
      {ahpConsistency && (
        <div
          className={`notice ${ahpConsistency.isConsistent ? "" : "warning"}`}
        >
          <div>
            <strong>
              AHP-Konsistenz:{" "}
              {(ahpConsistency.consistencyRatio * 100).toFixed(1)} %
            </strong>
            <p>{ahpConsistency.message}</p>
            {!ahpConsistency.isConsistent && (
              <p>
                Überarbeite widersprüchliche Vergleiche vor deinem Entscheid.
              </p>
            )}
          </div>
        </div>
      )}
      {state.risks.length > 0 && (
        <details className="workspace-details">
          <summary>Dokumentierte Risiken</summary>
          {results.map((r) => (
            <p key={r.alternativeId}>
              {alternatives.find((a) => a.id === r.alternativeId)?.name}:
              mittlerer Risikowert {(r.riskScore || 0).toFixed(2)} / 10
            </p>
          ))}
          <p className="muted">
            Die Risikowerte sind separat ausgewiesen und ändern die
            Nutzwertrangliste nicht.
          </p>
        </details>
      )}
      <ReportGenerator />
    </div>
  );
}
