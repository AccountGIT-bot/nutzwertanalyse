"use client";

import { useEffect, useState } from "react";

type Theme = "basic" | "pro" | "premium";

const MODELS: Array<{
  id: Theme;
  title: string;
  subtitle: string;
  accentLabel: string;
  vibe: string;
}> = [
  { id: "basic", title: "Modell 1 – Basic", subtitle: "Klar, strukturiert", accentLabel: "Blau", vibe: "Sehr ruhig, kaum Bewegung" },
  { id: "pro", title: "Modell 2 – Pro", subtitle: "Dynamisch, analytisch", accentLabel: "Türkis/Grün", vibe: "Leichte Gradient-Bewegung" },
  { id: "premium", title: "Modell 3 – Premium", subtitle: "High-End, strategisch", accentLabel: "Gold/Violett", vibe: "Subtile Partikel / Glow" },
];

export default function Home() {
  const [selected, setSelected] = useState<Theme>("basic");

  useEffect(() => {
    const saved = (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";
    setSelected(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  function choose(theme: Theme) {
    setSelected(theme);
    localStorage.setItem("nwa_theme", theme);
    document.documentElement.dataset.theme = theme;
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-14">
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full" style={{ background: `rgb(var(--accent))` }} />
          Theme-System aktiv (CSS Custom Properties)
        </div>

        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">
          Nutzwertanalyse<span style={{ color: `rgb(var(--accent))` }}>.</span>
        </h1>

        <p className="mt-3 max-w-2xl text-white/70">
          Wähle dein Modell. Layout bleibt identisch – nur Akzentfarbe & subtiler Background ändern sich.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {MODELS.map((m) => {
          const active = selected === m.id;
          return (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              className={[
                "group relative overflow-hidden rounded-2xl border p-5 text-left transition",
                "border-white/10 bg-white/5 hover:bg-white/7",
                active ? "ring-2 ring-white/20" : "",
              ].join(" ")}
            >
              <div
                className="absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background: `radial-gradient(600px 240px at 20% 0%, rgb(var(--accent)/0.22), transparent 60%)`,
                }}
              />

              <div className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{m.title}</div>
                    <div className="mt-1 text-sm text-white/70">{m.subtitle}</div>
                  </div>

                  <span
                    className="shrink-0 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: `rgb(var(--accent)/0.18)`,
                      color: `rgb(var(--accent))`,
                      border: "1px solid rgb(var(--accent)/0.25)",
                    }}
                  >
                    {m.accentLabel}
                  </span>
                </div>

                <div className="mt-4 text-sm text-white/70">
                  <div className="mb-1 text-white/60">Background-Feeling</div>
                  <div className="text-white/80">{m.vibe}</div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xs text-white/60">Klick setzt Theme & speichert Auswahl</div>
                  <div
                    className="h-8 w-8 rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, rgb(var(--accent)), rgb(var(--accent-2)))`,
                      boxShadow: active ? `0 0 0 6px rgb(var(--accent)/0.12)` : "none",
                    }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
        <div className="text-sm">
          Nächster Schritt: Wir leiten nach der Auswahl zur Analyse-Maske weiter (Projektname, Optionen, Kriterien).
          Login kommt später – ohne Stress.
        </div>
      </div>
    </main>
  );
}
