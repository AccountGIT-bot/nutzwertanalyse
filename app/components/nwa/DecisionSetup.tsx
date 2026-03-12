"use client";

import { useAnalysis } from "@/app/lib/nwa/store";

export function DecisionSetup() {
  const { state, setDecision, canProceedToNext } = useAnalysis();
  const { decision } = state;
  const packageLevel = decision.packageLevel;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60">Schritt 1</div>
        <h2 className="mt-1 text-xl font-semibold text-white">
          {packageLevel === "business"
            ? "Strategische Entscheidungsfrage"
            : "Entscheidung definieren"}
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {packageLevel === "basic"
            ? "Beschreiben Sie kurz, welche Entscheidung Sie treffen möchten."
            : packageLevel === "advanced"
            ? "Definieren Sie die Entscheidung und relevante Randbedingungen."
            : "Formulieren Sie die strategische Fragestellung für eine auditfähige Dokumentation."}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            {packageLevel === "business" ? "Strategische Fragestellung" : "Entscheidungstitel"}
          </label>
          <input
            type="text"
            value={decision.title}
            onChange={(e) => setDecision({ title: e.target.value })}
            placeholder={
              packageLevel === "business"
                ? "z.B. Welcher strategische Partner für die Marktexpansion?"
                : "z.B. Welchen Lieferanten wählen?"
            }
            className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Beschreibung / Kontext
          </label>
          <textarea
            value={decision.description}
            onChange={(e) => setDecision({ description: e.target.value })}
            placeholder="Beschreiben Sie den Hintergrund und das Ziel dieser Entscheidung..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition resize-none"
          />
        </div>

        {(packageLevel === "advanced" || packageLevel === "business") && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Randbedingungen & Einschränkungen
            </label>
            <textarea
              value={decision.constraints || ""}
              onChange={(e) => setDecision({ constraints: e.target.value })}
              placeholder="z.B. Budget max. 50.000 EUR, Umsetzung bis Q3, etc."
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition resize-none"
            />
          </div>
        )}

        {packageLevel === "business" && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
              <span className="h-2 w-2 rounded-full bg-[rgb(var(--accent))]" />
              Governance-Hinweis
            </div>
            <p className="text-sm text-white/50">
              Im Business-Paket werden alle Eingaben für eine auditfähige
              Dokumentation erfasst. Formulieren Sie präzise und nachvollziehbar.
            </p>
          </div>
        )}
      </div>

      {/* Validation feedback */}
      {!canProceedToNext && decision.title.trim().length === 0 && (
        <div className="text-sm text-[rgb(var(--accent))]/80">
          Bitte geben Sie einen Titel für die Entscheidung ein.
        </div>
      )}
    </div>
  );
}
