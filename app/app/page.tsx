"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Check, Download, SlidersHorizontal } from "lucide-react";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
import { AnalysisProvider } from "../lib/nwa/analysis-context";
import { AnalysisWizard } from "../components/nwa/AnalysisWizard";
import {
  readDraft,
  readStart,
  START_KEY,
  downloadFile,
  type StartData,
} from "../lib/nwa/local-data";
import { createDemo } from "../lib/nwa/demo";
import type { AnalysisState, PackageLevel } from "../lib/nwa/types";

const modes: {
  id: PackageLevel;
  name: string;
  tag: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "basic",
    name: "Basic",
    tag: "Der schnelle Überblick",
    description: "Für alltägliche Entscheidungen mit klaren Prioritäten.",
    features: [
      "2–5 Alternativen vergleichen",
      "Wichtigkeit auf einer Skala von 1–5",
      "Rangliste, Excel & Druckbericht",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    tag: "Mehr Tiefe",
    description: "Für Entscheidungen, bei denen du genauer abwägen möchtest.",
    features: [
      "Bis zu 10 Alternativen",
      "Prozentgewichte oder paarweiser Vergleich",
      "K.O.-Kriterien & Sensitivitätsanalyse",
    ],
  },
  {
    id: "business",
    name: "Business",
    tag: "Gemeinsam begründen",
    description: "Für dokumentierte Entscheidungen mit mehreren Perspektiven.",
    features: [
      "Mehrere Bewertende auf einem Gerät",
      "AHP mit Konsistenzprüfung",
      "Risiken, Quellen & ausführlicher Bericht",
    ],
  },
];
const subscribeClient = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function loadingView() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell" role="status">
        Analyse wird geöffnet …
      </main>
      <SiteFooter />
    </>
  );
}

export default function AppPage() {
  const hydrated = useSyncExternalStore(
    subscribeClient,
    clientSnapshot,
    serverSnapshot,
  );
  return hydrated ? <AnalysisSession /> : loadingView();
}

function readBootstrap() {
  const params = new URLSearchParams(window.location.search);
  const draft = readDraft();
  const preset = params.get("preset");
  const validPreset =
    preset &&
    [
      "supplier",
      "software",
      "investment",
      "machines",
      "vehicle",
      "employee",
    ].includes(preset)
      ? preset
      : undefined;
  const fresh = params.has("new") || !!validPreset || params.has("demo");
  let initial: AnalysisState | null = null;
  let mode: PackageLevel | null = null;
  let start: StartData = {};
  if (params.has("demo")) {
    initial = createDemo();
    mode = "advanced";
  } else if (!fresh && draft) {
    initial = draft;
    mode = draft.decision.packageLevel;
  } else {
    start = validPreset
      ? { preset: validPreset }
      : params.has("new") && params.get("new") !== "blank"
        ? readStart() || {}
        : {};
  }
  return { initial, mode, start, saved: draft, replace: !!draft && fresh };
}

function AnalysisSession() {
  const [bootstrap] = useState(readBootstrap);
  const saved = bootstrap.saved;
  const [initial, setInitial] = useState(bootstrap.initial);
  const start = bootstrap.start;
  const [mode, setMode] = useState(bootstrap.mode);
  const [replace, setReplace] = useState(bootstrap.replace);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (
      params.has("demo") ||
      params.has("preset") ||
      params.get("new") === "blank"
    ) {
      try {
        sessionStorage.removeItem(START_KEY);
      } catch {}
    }
    // Legacy links may contain analysis text: remove it from the address bar.
    if (params.has("title") || params.has("ai") || params.has("demo")) {
      window.history.replaceState(null, "", "/app");
    }
  }, []);
  function choose(value: PackageLevel) {
    setMode(value);
    try {
      sessionStorage.removeItem(START_KEY);
    } catch {}
    window.history.replaceState(null, "", "/app");
  }
  if (replace)
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="page-shell narrow">
          <p className="eyebrow">DEIN ENTWURF</p>
          <h1>Etwas Neues beginnen?</h1>
          <p className="page-intro">
            Auf diesem Gerät liegt bereits «
            {saved?.decision.title || "Unbenannte Analyse"}». Sichere den
            Entwurf, bevor du ihn durch eine neue Analyse ersetzt.
          </p>
          <div className="action-row">
            <button
              className="studio-button secondary"
              onClick={() =>
                saved &&
                downloadFile(
                  JSON.stringify(saved, null, 2),
                  "DecisionStudio-Sicherung.json",
                  "application/json",
                )
              }
            >
              <Download size={17} /> Entwurf sichern
            </button>
            <Link
              className="studio-button secondary"
              href="/app"
              onClick={() => {
                setReplace(false);
                setInitial(saved);
                setMode(saved?.decision.packageLevel || "basic");
              }}
            >
              Entwurf fortsetzen
            </Link>
            <button className="studio-button" onClick={() => setReplace(false)}>
              Neue Analyse beginnen <ArrowRight size={17} />
            </button>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  if (!mode)
    return (
      <>
        <SiteHeader />
        <main id="main-content" className="page-shell">
          <p className="eyebrow">DEIN ANALYSEUMFANG</p>
          <h1>So viel Tiefe, wie du brauchst.</h1>
          <p className="page-intro">
            Alle Umfänge sind kostenlos. Wähle die passende Methode für deine
            Entscheidung.
          </p>
          {(start.title || start.preset) && (
            <div className="notice">
              <SlidersHorizontal size={19} />
              <span>
                {start.title || "Deine gewählte Vorlage wird übernommen."}
              </span>
            </div>
          )}
          <div className="mode-grid">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => choose(m.id)}
                className={`mode-card ${m.id === "advanced" ? "featured" : ""}`}
              >
                <span className="eyebrow">{m.tag}</span>
                <h2>{m.name}</h2>
                <p>{m.description}</p>
                <ul>
                  {m.features.map((f) => (
                    <li key={f}>
                      <Check size={16} />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="mode-cta">
                  Analyse starten <ArrowRight size={18} />
                </span>
              </button>
            ))}
          </div>
          <p className="muted">
            Die Vorschläge sind ein Ausgangspunkt. Namen, Kriterien und Gewichte
            kannst du jederzeit bearbeiten.
          </p>
        </main>
        <SiteFooter />
      </>
    );
  return (
    <AnalysisProvider
      initialPackageLevel={mode}
      initialDecision={start.title}
      initialPreset={start.preset}
      initialAIInterpretation={start.interpretation}
      initialState={initial || undefined}
    >
      <SiteHeader />
      <AnalysisWizard />
      <SiteFooter />
    </AnalysisProvider>
  );
}
