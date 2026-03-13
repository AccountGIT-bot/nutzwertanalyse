"use client";

import { useState, useMemo } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";

type PackageLevel = "basic" | "advanced" | "business";

interface StepInfo {
  title: string;
  content: string;
  example?: string;
  tip?: string;
  advanced?: string;
}

// Info content adapted to each package level
const STEP_INFO: Record<string, Record<PackageLevel, StepInfo>> = {
  setup: {
    basic: {
      title: "Warum eine klare Fragestellung?",
      content: "Eine präzise Frage hilft Ihnen, den Fokus zu behalten. Am Ende können Sie prüfen: Beantwortet meine Wahl wirklich diese Frage?",
      example: "Statt 'Neues Auto' besser: 'Welches Fahrzeug passt am besten für den Außendienst?'",
    },
    advanced: {
      title: "Strategische Fragestellung",
      content: "Die Fragestellung definiert den Scope Ihrer Analyse. Eine gut formulierte Frage macht die Entscheidung später nachvollziehbar und dokumentierbar.",
      tip: "Vermeiden Sie zu breite Fragen. 'Welches CRM?' ist besser als 'Wie verbessern wir den Vertrieb?'",
    },
    business: {
      title: "Auditfähige Entscheidungsfrage",
      content: "Für Compliance und Revision muss die Fragestellung präzise den Entscheidungsgegenstand abgrenzen. Sie bildet die Grundlage für die spätere Dokumentation.",
      tip: "Referenzieren Sie relevante Beschlussvorlagen oder Projektcodes.",
      advanced: "Die Fragestellung sollte SMART-Kriterien folgen: Spezifisch, Messbar, Akzeptiert, Realistisch, Terminiert.",
    },
  },
  alternatives: {
    basic: {
      title: "Was sind Alternativen?",
      content: "Alternativen sind die Optionen, zwischen denen Sie wählen. Mindestens zwei brauchen Sie für einen echten Vergleich.",
      example: "Laptop A, Laptop B, gebrauchtes Gerät, oder: Kaufen vs. Leasen",
    },
    advanced: {
      title: "Alternativen strukturieren",
      content: "Definieren Sie alle realistischen Optionen. Vergessen Sie nicht die 'Null-Option' (Status quo beibehalten) – manchmal ist Nicht-Handeln die beste Wahl.",
      tip: "Alternativen sollten sich gegenseitig ausschließen und zusammen alle Möglichkeiten abdecken.",
    },
    business: {
      title: "Alternativenmatrix",
      content: "Für eine valide Nutzwertanalyse müssen Alternativen vergleichbar sein. Dokumentieren Sie auch verworfene Optionen mit Begründung.",
      advanced: "MECE-Prinzip: Mutually Exclusive, Collectively Exhaustive – keine Überlappungen, keine Lücken.",
    },
  },
  criteria: {
    basic: {
      title: "Was sind Kriterien?",
      content: "Kriterien sind die Maßstäbe, nach denen Sie bewerten. Sie beantworten: 'Was ist mir bei dieser Entscheidung wichtig?'",
      example: "Preis, Qualität, Lieferzeit, Garantie, Design – je nachdem was Ihnen wichtig ist.",
    },
    advanced: {
      title: "Kriterienkatalog erstellen",
      content: "Gute Kriterien sind messbar oder zumindest vergleichbar. Vermeiden Sie Überschneidungen – 'Qualität' und 'Verarbeitung' messen oft dasselbe.",
      tip: "Gruppieren Sie Kriterien in Kategorien: Wirtschaftlich, Qualitativ, Strategisch, Risiko.",
    },
    business: {
      title: "Kriteriensystem & K.O.-Kriterien",
      content: "Definieren Sie harte Ausschlusskriterien (K.O.) und weiche Bewertungskriterien. K.O.-Kriterien führen zum sofortigen Ausschluss bei Nichterfüllung.",
      advanced: "Achten Sie auf Kriterienunabhängigkeit (keine Doppelzählung) und Vollständigkeit (alle relevanten Aspekte abgedeckt).",
    },
  },
  weighting: {
    basic: {
      title: "Warum Gewichtung?",
      content: "Nicht alles ist gleich wichtig! Die Gewichtung zeigt, WIE wichtig jedes Kriterium für Sie ist. Ein Kriterium mit 20% zählt doppelt so viel wie eines mit 10%.",
      example: "Wenn Ihnen der Preis sehr wichtig ist: 30%. Wenn Design weniger wichtig ist: 10%.",
    },
    advanced: {
      title: "Gewichtungsverteilung",
      content: "Die Summe aller Gewichte muss 100% ergeben. Vermeiden Sie Gleichverteilung – wenn alles gleich wichtig ist, brauchen Sie keine Nutzwertanalyse.",
      tip: "Fragen Sie sich: 'Würde ich für +20% bei Kriterium A auf -20% bei Kriterium B verzichten?' Das zeigt relative Wichtigkeit.",
    },
    business: {
      title: "Gewichtungsmethodik",
      content: "Verwenden Sie bei wichtigen Entscheidungen den Paarweisen Vergleich (AHP) statt direkter Gewichtung. Dies reduziert subjektive Verzerrungen.",
      advanced: "Der Konsistenzindex prüft, ob Ihre Gewichtungen logisch zusammenpassen. Inkonsistenz > 0.1 deutet auf widersprüchliche Präferenzen hin.",
    },
  },
  rating: {
    basic: {
      title: "Wie bewerte ich?",
      content: "Bewerten Sie jede Alternative für jedes Kriterium auf einer Skala von 1-10. 1 = sehr schlecht, 10 = sehr gut, 5 = mittelmäßig.",
      example: "Laptop A: Preis 8/10 (günstig), Leistung 6/10 (okay). Laptop B: Preis 4/10 (teuer), Leistung 9/10 (top).",
    },
    advanced: {
      title: "Objektive Bewertung",
      content: "Bewerten Sie relativ zueinander: Die beste Alternative bei einem Kriterium bekommt die höchste Note, die schlechteste die niedrigste.",
      tip: "Dokumentieren Sie Ihre Bewertungsgründe – das macht die Entscheidung später nachvollziehbar.",
    },
    business: {
      title: "Bewertungsmatrix",
      content: "Nutzen Sie definierte Bewertungsskalen mit klaren Ankerpunkten. Bei Teamentscheidungen: Erst einzeln bewerten, dann Diskrepanzen diskutieren.",
      advanced: "Sensitivitätsanalyse zeigt, welche Bewertungen das Ergebnis am stärksten beeinflussen – dort lohnt sich genaues Hinschauen.",
    },
  },
  results: {
    basic: {
      title: "Was bedeutet das Ergebnis?",
      content: "Der Score zeigt, wie gut jede Alternative Ihre gewichteten Anforderungen erfüllt. Die höchste Zahl gewinnt – aber schauen Sie auch auf die Einzelwerte!",
      example: "Score 7.2 bedeutet: Diese Alternative erreicht 72% des theoretischen Maximums.",
    },
    advanced: {
      title: "Ergebnisinterpretation",
      content: "Neben dem Gesamtscore zeigt die Sensitivitätsanalyse, wie stabil das Ergebnis ist. Kleine Unterschiede (< 5%) sind oft nicht signifikant.",
      tip: "Prüfen Sie die Stärken/Schwächen-Profile – der Gesamtsieger ist nicht automatisch in allem der Beste.",
    },
    business: {
      title: "Entscheidungsempfehlung",
      content: "Das Ranking ist eine Empfehlung, keine automatische Entscheidung. Dokumentieren Sie Ihre finale Entscheidung mit Begründung – auch wenn Sie vom Ranking abweichen.",
      advanced: "Der Export enthält alle Daten für Gremienvorlagen und Revisionen. Archivieren Sie den Report für spätere Nachvollziehbarkeit.",
    },
  },
};

export function StepInfoButton({ stepId }: { stepId: string }) {
  const { state } = useAnalysis();
  const [isOpen, setIsOpen] = useState(false);
  
  const packageLevel = state.decision.packageLevel;
  const info = useMemo(() => STEP_INFO[stepId]?.[packageLevel], [stepId, packageLevel]);
  
  if (!info) return null;

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 transition text-white/50 hover:text-white"
        title="Info"
        aria-label="Erklärung anzeigen"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="relative bg-[#1a1a1a] rounded-2xl p-5 max-w-md w-full border border-white/10 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgb(var(--accent) / 0.2)" }}
                >
                  <svg className="w-4.5 h-4.5" style={{ color: "rgb(var(--accent))" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-white">{info.title}</h3>
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

            {/* Main Content */}
            <p className="text-white/70 text-sm leading-relaxed">
              {info.content}
            </p>

            {/* Example - only for Basic */}
            {info.example && packageLevel === "basic" && (
              <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
                <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Beispiel</div>
                <p className="text-white/60 text-sm italic">
                  {info.example}
                </p>
              </div>
            )}

            {/* Tip - for Advanced and Business */}
            {info.tip && (packageLevel === "advanced" || packageLevel === "business") && (
              <div className="mt-3 bg-amber-500/10 rounded-xl p-3 border border-amber-500/20">
                <div className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Tipp</div>
                <p className="text-amber-100/70 text-sm">
                  {info.tip}
                </p>
              </div>
            )}

            {/* Advanced Info - only for Business */}
            {info.advanced && packageLevel === "business" && (
              <div className="mt-3 bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                <div className="text-xs text-blue-400/70 uppercase tracking-wider mb-1">Für Experten</div>
                <p className="text-blue-100/70 text-sm">
                  {info.advanced}
                </p>
              </div>
            )}

            {/* Package indicator */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-white/30">
                {packageLevel === "basic" ? "Basic" : packageLevel === "advanced" ? "Advanced" : "Business"} Paket
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition"
              >
                Verstanden
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
