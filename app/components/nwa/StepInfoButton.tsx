"use client";

import { useRef, useId } from "react";
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
      content:
        "Eine präzise Frage hilft Ihnen, den Fokus zu behalten. Am Ende können Sie prüfen: Beantwortet meine Wahl wirklich diese Frage?",
      example:
        "Statt 'Neues Auto' besser: 'Welches Fahrzeug passt am besten für den Aussendienst?'",
    },
    advanced: {
      title: "Strategische Fragestellung",
      content:
        "Die Fragestellung definiert den Scope Ihrer Analyse. Eine gut formulierte Frage macht die Entscheidung später nachvollziehbar und dokumentierbar.",
      tip: "Vermeiden Sie zu breite Fragen. 'Welches CRM?' ist besser als 'Wie verbessern wir den Vertrieb?'",
    },
    business: {
      title: "Nachvollziehbare Entscheidungsfrage",
      content:
        "Grenzen Sie präzise ab, was entschieden werden soll. Halten Sie Annahmen und Zuständigkeiten fest, damit andere die Analyse nachvollziehen können.",
      tip: "Referenzieren Sie relevante Beschlussvorlagen oder Projektcodes.",
      advanced:
        "Die Fragestellung sollte SMART-Kriterien folgen: Spezifisch, Messbar, Akzeptiert, Realistisch, Terminiert.",
    },
  },
  alternatives: {
    basic: {
      title: "Was sind Alternativen?",
      content:
        "Alternativen sind die Optionen, zwischen denen Sie wählen. Mindestens zwei brauchen Sie für einen echten Vergleich.",
      example: "Laptop A, Laptop B, gebrauchtes Gerät, oder: Kaufen vs. Leasen",
    },
    advanced: {
      title: "Alternativen strukturieren",
      content:
        "Definieren Sie alle realistischen Optionen. Vergessen Sie nicht die 'Null-Option' (Status quo beibehalten) – manchmal ist Nicht-Handeln die beste Wahl.",
      tip: "Alternativen sollten sich gegenseitig ausschliessen und zusammen alle Möglichkeiten abdecken.",
    },
    business: {
      title: "Alternativenmatrix",
      content:
        "Für eine valide Nutzwertanalyse müssen Alternativen vergleichbar sein. Dokumentieren Sie auch verworfene Optionen mit Begründung.",
      advanced:
        "MECE-Prinzip: Mutually Exclusive, Collectively Exhaustive – keine Überlappungen, keine Lücken.",
    },
  },
  criteria: {
    basic: {
      title: "Was sind Kriterien?",
      content:
        "Kriterien sind die Massstäbe, nach denen Sie bewerten. Sie beantworten: 'Was ist mir bei dieser Entscheidung wichtig?'",
      example:
        "Preis, Qualität, Lieferzeit, Garantie, Design – je nachdem was Ihnen wichtig ist.",
    },
    advanced: {
      title: "Kriterienkatalog erstellen",
      content:
        "Gute Kriterien sind messbar oder zumindest vergleichbar. Vermeiden Sie Überschneidungen – 'Qualität' und 'Verarbeitung' messen oft dasselbe.",
      tip: "Gruppieren Sie Kriterien in Kategorien: Wirtschaftlich, Qualitativ, Strategisch, Risiko.",
    },
    business: {
      title: "Kriteriensystem & K.O.-Kriterien",
      content:
        "Definieren Sie harte Ausschlusskriterien (K.O.) und weiche Bewertungskriterien. K.O.-Kriterien führen zum sofortigen Ausschluss bei Nichterfüllung.",
      advanced:
        "Achten Sie auf Kriterienunabhängigkeit (keine Doppelzählung) und Vollständigkeit (alle relevanten Aspekte abgedeckt).",
    },
  },
  weighting: {
    basic: {
      title: "Warum Gewichtung?",
      content:
        "Nicht alles ist gleich wichtig! Die Gewichtung zeigt, WIE wichtig jedes Kriterium für Sie ist. Ein Kriterium mit 20% zählt doppelt so viel wie eines mit 10%.",
      example:
        "Wenn Ihnen der Preis sehr wichtig ist: 30%. Wenn Design weniger wichtig ist: 10%.",
    },
    advanced: {
      title: "Gewichtungsverteilung",
      content:
        "Bei Prozentgewichten muss die Summe 100 % ergeben. Eine Gleichverteilung ist sinnvoll, wenn alle Kriterien für diese Entscheidung gleich wichtig sind.",
      tip: "Fragen Sie sich: 'Würde ich für +20% bei Kriterium A auf -20% bei Kriterium B verzichten?' Das zeigt relative Wichtigkeit.",
    },
    business: {
      title: "Gewichtungsmethodik",
      content:
        "Prozentgewichte und paarweiser Vergleich (AHP) bilden Ihre Präferenzen unterschiedlich ab. AHP hilft, die relative Wichtigkeit systematisch zu vergleichen; beide Verfahren bleiben von Ihren Einschätzungen abhängig.",
      advanced:
        "Das Konsistenzverhältnis (CR) prüft die Widerspruchsfreiheit der Paarvergleiche. Werte über 0,10 sind ein Hinweis, die Vergleiche zu überprüfen.",
    },
  },
  rating: {
    basic: {
      title: "Wie bewerte ich?",
      content:
        "Bewerten Sie jede Alternative für jedes Kriterium auf einer Skala von 1-10. 1 = sehr schlecht, 10 = sehr gut, 5 = mittelmässig.",
      example:
        "Laptop A: Preis 8/10 (günstig), Leistung 6/10 (okay). Laptop B: Preis 4/10 (teuer), Leistung 9/10 (top).",
    },
    advanced: {
      title: "Objektive Bewertung",
      content:
        "Definieren Sie pro Kriterium feste Bewertungsanker von 1 bis 10 und wenden Sie dieselbe Skala auf alle Alternativen an. Auch die beste verfügbare Alternative muss nicht die volle Punktzahl erreichen.",
      tip: "Dokumentieren Sie Ihre Bewertungsgründe – das macht die Entscheidung später nachvollziehbar.",
    },
    business: {
      title: "Bewertungsmatrix",
      content:
        "Nutzen Sie definierte Bewertungsskalen mit klaren Ankerpunkten. Bei Teamentscheidungen: Erst einzeln bewerten, dann Diskrepanzen diskutieren.",
      advanced:
        "Die Sensitivitätsanalyse variiert die Kriteriengewichte bei unveränderten Bewertungen. Sie zeigt, wann sich die Rangfolge zulässiger Alternativen ändert.",
    },
  },
  results: {
    basic: {
      title: "Was bedeutet das Ergebnis?",
      content:
        "Der Nutzwert fasst Ihre gewichteten Bewertungen zusammen. K.O.-Kriterien können Alternativen unabhängig davon ausschliessen. Prüfen Sie deshalb auch die Einzelwerte.",
      example:
        "Score 7.2 bedeutet: Diese Alternative erreicht 72% des theoretischen Maximums.",
    },
    advanced: {
      title: "Ergebnisinterpretation",
      content:
        "Neben dem Nutzwert zeigt die Sensitivitätsanalyse, wie sich die Rangfolge bei veränderten Gewichten verhält. Kleine Abstände sollten Sie kritisch prüfen; das Tool berechnet keine statistische Signifikanz.",
      tip: "Prüfen Sie die Stärken/Schwächen-Profile – der Gesamtsieger ist nicht automatisch in allem der Beste.",
    },
    business: {
      title: "Entscheidungsempfehlung",
      content:
        "Das Ranking ist eine Empfehlung, keine automatische Entscheidung. Dokumentieren Sie Ihre finale Entscheidung mit Begründung – auch wenn Sie vom Ranking abweichen.",
      advanced:
        "Der Export dokumentiert den aktuellen Stand und die ausgewählten Kapitel. Sichern Sie zusätzlich die JSON-Datei für eine spätere Bearbeitung.",
    },
  },
};

export function StepInfoButton({ stepId }: { stepId: string }) {
  const { state } = useAnalysis();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const packageLevel = state.decision.packageLevel;
  const info = STEP_INFO[stepId]?.[packageLevel];
  if (!info) return null;

  return (
    <>
      <button
        type="button"
        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Erklärung anzeigen"
        aria-haspopup="dialog"
      >
        <span aria-hidden="true">i</span>
      </button>
      <dialog
        ref={dialogRef}
        className="studio-dialog"
        aria-labelledby={titleId}
      >
        <h2 id={titleId}>{info.title}</h2>
        <p>{info.content}</p>
        {info.example && packageLevel === "basic" && (
          <p>
            <strong>Beispiel: </strong>
            {info.example}
          </p>
        )}
        {info.tip && packageLevel !== "basic" && (
          <p>
            <strong>Tipp: </strong>
            {info.tip}
          </p>
        )}
        {info.advanced && packageLevel === "business" && <p>{info.advanced}</p>}
        <div className="action-row">
          <button
            type="button"
            className="btn-primary"
            onClick={() => dialogRef.current?.close()}
          >
            Verstanden
          </button>
        </div>
      </dialog>
    </>
  );
}
