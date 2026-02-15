"use client";

import { useEffect, useState } from "react";

type Theme = "basic" | "advanced" | "business";

const MODELS = [
  {
    id: "basic" as Theme,
    title: "BASIC",
    subtitle: "Klar, strukturiert",
    accentLabel: "Blau",
    accent: "37 99 235",
    accent2: "59 130 246",
  },
  {
    id: "advanced" as Theme,
    title: "ADVANCED",
    subtitle: "Dynamisch, analytisch",
    accentLabel: "Türkis/Grün",
    accent: "16 185 129",
    accent2: "45 212 191",
  },
  {
    id: "business" as Theme,
    title: "BUSINESS",
    subtitle: "High-End, strategisch",
    accentLabel: "Gold/Violett",
    accent: "245 158 11",
    accent2: "168 85 247",
  },
];

export default function Home() {
  const [selected, setSelected] = useState<Theme>("basic");

  // Default sauber setzen
  useEffect(() => {
    const saved =
      (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";

    setSelected(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function preview(theme: Theme) {
    document.documentElement.dataset.theme = theme;
  }

  function restore() {
    const saved =
      (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";

    document.documentElement.dataset.theme = saved;
  }

  function choose(theme: Theme) {
    setSelected(theme);
    localStorage.setItem("nwa_theme", theme);
    document.documentElement.dataset.theme = theme;
    window.location.href = "/new";
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-14 text-white">
      <div className="mb-10">
        <h1 className="text-4xl font-semibold tracking-tight">
          Nutzwertanalyse
          <span style={{ color: "rgb(37 99 235)" }}>.</span>
        </h1>

        <p className="mt-3 max-w-2xl text-white/70">
          Eine Methode – drei Tiefen. Nur Präzision, Visualisierung und
          Dokumentation skalieren.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {MODELS.map((m) => {
          const active = selected === m.id;

          return (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              onMouseEnter={() => preview(m.id)}
              onMouseLeave={restore}
              className="relative rounded-2xl border border-white/10 bg-white/5 p-6 text-left transition duration-300 hover:bg-white/10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-xl font-semibold tracking-wide"
                    style={{ color: `rgb(${m.accent})` }}
                  >
                    {m.title}
                  </div>

                  <div className="mt-2 text-sm text-white/70">
                    {m.subtitle}
                  </div>
                </div>

                <span
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{
                    background: `rgb(${m.accent} / 0.18)`,
                    color: `rgb(${m.accent})`,
                    border: `1px solid rgb(${m.accent} / 0.25)`,
                  }}
                >
                  {m.accentLabel}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-xs text-white/60">
                  Hover = Background Preview · Klick = Auswahl
                </div>

                <div
                  className="h-9 w-9 rounded-full"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgb(${m.accent}), rgb(${m.accent2}))`,
                    boxShadow: active
                      ? `0 0 0 6px rgb(${m.accent} / 0.15)`
                      : "none",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
