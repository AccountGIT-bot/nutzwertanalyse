"use client";

import { useState } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";

// Info content for each step - explains WHY we do this in the Nutzwertanalyse
const STEP_INFO: Record<string, { title: string; content: string; example?: string }> = {
  setup: {
    title: "Warum eine klare Fragestellung?",
    content: "Eine präzise Fragestellung ist das Fundament jeder guten Entscheidung. Sie hilft Ihnen, den Fokus zu behalten und später zu prüfen, ob die gewählte Alternative wirklich zur ursprünglichen Frage passt.",
    example: "Statt 'Neues Auto kaufen' besser: 'Welches Fahrzeug erfüllt unsere Anforderungen für den Außendienst am besten?'",
  },
  alternatives: {
    title: "Warum Alternativen definieren?",
    content: "Nur wenn Sie mindestens zwei Optionen vergleichen, können Sie eine fundierte Entscheidung treffen. Definieren Sie alle realistischen Möglichkeiten – auch 'nichts tun' kann eine Option sein.",
    example: "Bei einem Softwarevergleich: Tool A, Tool B, Eigenentwicklung, Status quo beibehalten",
  },
  criteria: {
    title: "Warum Bewertungskriterien?",
    content: "Kriterien machen Ihre Entscheidung nachvollziehbar und objektiv. Sie definieren, WAS Ihnen wichtig ist. Gute Kriterien sind messbar oder zumindest vergleichbar.",
    example: "Preis, Qualität, Lieferzeit, Service, Nachhaltigkeit – je nach Kontext",
  },
  weighting: {
    title: "Warum Gewichtung?",
    content: "Nicht alle Kriterien sind gleich wichtig. Die Gewichtung drückt aus, WIE wichtig jedes Kriterium für Sie ist. Ein Kriterium mit 20% Gewicht beeinflusst das Ergebnis doppelt so stark wie eines mit 10%.",
    example: "Wenn der Preis sehr wichtig ist, geben Sie ihm z.B. 30%. Ist Service weniger wichtig, vielleicht nur 10%.",
  },
  rating: {
    title: "Warum bewerten?",
    content: "Hier beurteilen Sie, wie gut jede Alternative jedes Kriterium erfüllt. Die Skala von 1-10 ermöglicht eine differenzierte Einschätzung. 1 = sehr schlecht, 10 = sehr gut.",
    example: "Alternative A hat einen guten Preis (8/10), aber mäßigen Service (5/10). Alternative B ist teurer (4/10), aber hat exzellenten Service (9/10).",
  },
  results: {
    title: "Wie lese ich die Ergebnisse?",
    content: "Der Gesamtscore berechnet sich aus: Σ (Kriteriengewicht × Bewertung). Die Alternative mit dem höchsten Score erfüllt Ihre gewichteten Anforderungen am besten. Prüfen Sie auch die Einzelwerte – der Gesamtsieger ist nicht in allem der Beste.",
    example: "Score 7.2 bedeutet: Im gewichteten Durchschnitt erreicht diese Alternative 72% des Maximums.",
  },
};

export function StepInfoButton({ stepId }: { stepId: string }) {
  const { state } = useAnalysis();
  const [isOpen, setIsOpen] = useState(false);
  
  // Only show in Basic package
  if (state.decision.packageLevel !== "basic") {
    return null;
  }
  
  const info = STEP_INFO[stepId];
  if (!info) return null;

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 transition text-white/60 hover:text-white"
        title="Was bedeutet das?"
        aria-label="Erklärung anzeigen"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Content */}
          <div className="relative bg-[#1a1a1a] rounded-2xl p-6 max-w-md w-full border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[rgb(var(--accent))]/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[rgb(var(--accent))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">{info.title}</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/40 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <p className="text-white/70 text-sm leading-relaxed mb-4">
              {info.content}
            </p>

            {/* Example */}
            {info.example && (
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Beispiel</div>
                <p className="text-white/60 text-sm italic">
                  {info.example}
                </p>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
            >
              Verstanden
            </button>
          </div>
        </div>
      )}
    </>
  );
}
