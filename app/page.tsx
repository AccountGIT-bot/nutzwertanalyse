"use client";

import { useEffect, useState } from "react";

type Theme = "basic" | "advanced" | "business";

const MODELS = [
  {
    id: "basic" as Theme,
    title: "BASIC",
    subtitle: "Klar, strukturiert",
    accent: "37 99 235",
    accent2: "59 130 246",
    features: [
      "Klare Zielformulierung",
      "2–5 Alternativen",
      "Erprobte Kriterien-Sets",
      "Einfache Gewichtung (1–5)",
      "Intuitive Bewertungsskala",
      "Kompakter Entscheidungsreport (PDF)",
    ],
  },
  {
    id: "advanced" as Theme,
    title: "ADVANCED",
    subtitle: "Dynamisch, analytisch",
    accent: "16 185 129",
    accent2: "45 212 191",
    features: [
      "Ziel + Randbedingungen",
      "Alternativen mit Annahmen",
      "Kriterien + Kategorien + Definitionen",
      "100%-Methode oder AHP light",
      "Sensitivitätsanalyse",
      "Vollständiger Analysebericht",
    ],
  },
  {
    id: "business" as Theme,
    title: "BUSINESS",
    subtitle: "High-End, strategisch",
    accent: "245 158 11",
    accent2: "168 85 247",
    features: [
      "Strategische Entscheidungsfrage",
      "Szenarien & Varianten",
      "Governance-konforme Kriterien",
      "Vollständige AHP + Konsistenzprüfung",
      "Mehrpersonen-Bewertung",
      "Executive Report + Audit-Dokumentation",
    ],
  },
];

export default function Home() {
  const [selected, setSelected] = useState<Theme>("basic");

  useEffect(() => {
    const saved = (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";
    setSelected(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function preview(theme: Theme) {
    document.documentElement.dataset.theme = theme;
  }

  function restore() {
    const saved = (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";
    document.documentElement.dataset.theme = saved;
  }

  function choose(theme: Theme) {
    setSelected(theme);
    localStorage.setItem("nwa_theme", theme);
    document.documentElement.dataset.theme = theme;
    window.location.href = "/new";
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 text-white">
      {/* Header */}
      <div className="mb-14 text-center">
        <h1 className="text-5xl font-semibold tracking-tight">
          Nutzwertanalyse
          <span style={{ color: `rgb(var(--accent))` }}>.</span>
        </h1>

        <p className="mt-6 max-w-3xl mx-auto text-white/70 text-lg leading-relaxed">
          Skalierbares Modell: Der Ablauf bleibt immer gleich – nur Tiefe,
          KI-Unterstützung, Visualisierung und Reportumfang unterscheiden sich.
          Damit funktioniert es als B2C-Tool, B2B-Standard und Beratungsbasis.
        </p>

        <div className="mt-8 mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: `rgb(var(--accent))` }}
          />
          Eine Methode – drei Tiefen
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-8 md:grid-cols-3">
        {MODELS.map((m) => {
          const active = selected === m.id;

          return (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              onMouseEnter={() => preview(m.id)}
              onMouseLeave={restore}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 text-left transition duration-300 hover:bg-white/10"
            >
              {/* Subtiler Card-Glow (nur optisch, nicht Theme-abhängig) */}
              <div
                className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(700px 260px at 20% 0%, rgb(${m.accent} / 0.18), transparent 60%)`,
                }}
              />

              <div className="relative">
                <div
                  className="text-2xl font-semibold tracking-wide"
                  style={{ color: `rgb(${m.accent})` }}
                >
                  {m.title}
                </div>

                <div className="mt-2 text-sm text-white/75">{m.subtitle}</div>

                <ul className="mt-6 space-y-3 text-sm text-white/80">
                  {m.features.map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="mt-1.5 h-2 w-2 rounded-full"
                        style={{ background: `rgb(${m.accent})` }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-10">
                  <div
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition"
                    style={{
                      background: `rgb(${m.accent} / 0.15)`,
                      color: `rgb(${m.accent})`,
                      border: `1px solid rgb(${m.accent} / 0.3)`,
                    }}
                  >
                    Analyse starten
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, rgb(${m.accent}), rgb(${m.accent2}))`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Active Ring */}
              {active && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: `0 0 0 2px rgb(${m.accent} / 0.45)`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
