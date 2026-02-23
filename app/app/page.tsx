"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Theme = "basic" | "advanced" | "business";
type PackageLevel = "basic" | "advanced" | "business";

const MODELS = [
  {
    id: "basic" as Theme,
    title: "BASIC",
    subtitle: "Klar & schnell",
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
    subtitle: "Analytisch & flexibel",
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
    subtitle: "Strategisch & auditfähig",
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

function getSavedTheme(): Theme {
  try {
    return (localStorage.getItem("nwa_theme") as Theme | null) ?? "basic";
  } catch {
    return "basic";
  }
}

export default function PackageSelect() {
  const router = useRouter();
  const [selected, setSelected] = useState<Theme>("basic");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const saved = getSavedTheme();
    setSelected(saved);
    document.documentElement.dataset.theme = saved;
  }, []);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function preview(theme: Theme) {
    document.documentElement.dataset.theme = theme;
  }

  function restore() {
    document.documentElement.dataset.theme = getSavedTheme();
  }

  function choose(theme: Theme) {
    const packageLevel: PackageLevel = theme;

    setSelected(theme);
    localStorage.setItem("nwa_theme", theme);
    localStorage.setItem("nwa_packageLevel", packageLevel);
    document.documentElement.dataset.theme = theme;

    router.push("/new");
  }

  return (
    <main className="min-h-[100svh] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30">
        <div
          className={[
            "transition-all duration-300",
            scrolled
              ? "bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]"
              : "bg-white/0",
          ].join(" ")}
        >
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Zur Startseite"
              title="Startseite"
            >
              <div className="h-10 w-10 rounded-2xl bg-black/5 border border-black/10 grid place-items-center">
                <span className="text-black/70 text-lg">⌁</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight">
                  Nutzwertanalyse<span className="opacity-60">.tool</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">
                  Modell wählen • gleiche Logik, andere Tiefe
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/login")}
                className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
              >
                Login
              </button>
            </div>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-12">
        <div className="mb-8 sm:mb-10">
          <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
            Pakete • B2C • B2B • Beratung
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
            Wähle die passende Tiefe für deine Analyse
            <span style={{ color: `rgb(var(--accent))` }}>.</span>
          </h1>

          <p className="mt-3 max-w-3xl text-sm sm:text-base text-black/55 leading-relaxed">
            Der Ablauf bleibt gleich: Kriterien definieren, gewichten, bewerten, dokumentieren.
            Die Pakete unterscheiden sich in Tiefe, Methodik und Reportumfang.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {MODELS.map((m) => {
            const active = selected === m.id;

            return (
              <button
                key={m.id}
                onClick={() => choose(m.id)}
                onMouseEnter={() => preview(m.id)}
                onMouseLeave={restore}
                onFocus={() => preview(m.id)}
                onBlur={restore}
                onTouchStart={() => preview(m.id)}
                className={[
                  "group relative overflow-hidden rounded-3xl text-left",
                  "border border-black/10",
                  "bg-white/70 backdrop-blur-md",
                  "shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
                  "p-6 sm:p-7",
                  "transition duration-300 ease-out",
                  "hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.16)]",
                  "active:translate-y-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                ].join(" ")}
              >
                {/* Accent glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                  style={{
                    background: `radial-gradient(700px 260px at 20% 0%, rgb(${m.accent} / 0.16), transparent 60%)`,
                  }}
                />

                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div
                        className="text-xl sm:text-2xl font-semibold tracking-wide"
                        style={{ color: `rgb(${m.accent})` }}
                      >
                        {m.title}
                      </div>
                      <div className="mt-1 text-sm text-black/55">{m.subtitle}</div>
                    </div>

                    {active && (
                      <div
                        className="h-10 w-10 rounded-2xl grid place-items-center"
                        style={{
                          background: `rgb(${m.accent} / 0.10)`,
                          border: `1px solid rgb(${m.accent} / 0.25)`,
                          color: `rgb(${m.accent})`,
                        }}
                        aria-hidden="true"
                      >
                        ✓
                      </div>
                    )}
                  </div>

                  <ul className="mt-5 space-y-2.5 text-sm text-black/70">
                    {m.features.map((f, i) => (
                      <li key={i} className="flex gap-3">
                        <span
                          className="mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ background: `rgb(${m.accent})` }}
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7">
                    <div
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition group-hover:scale-[1.01]"
                      style={{
                        background: `rgb(${m.accent} / 0.12)`,
                        color: `rgb(${m.accent})`,
                        border: `1px solid rgb(${m.accent} / 0.24)`,
                      }}
                    >
                      Analyse starten
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, rgb(${m.accent}), rgb(${m.accent2}))`,
                        }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>

                {active && (
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ boxShadow: `0 0 0 2px rgb(${m.accent} / 0.35)` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 text-[11px] text-black/45">
          Hinweis: Theme-Vorschau wechselt beim Hover/Fokus — Auswahl bleibt gespeichert.
        </div>
      </section>

      <footer className="pb-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.tool</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a href="/impressum" className="underline underline-offset-2 decoration-black/20">
                Impressum
              </a>
              <a href="/agb" className="underline underline-offset-2 decoration-black/20">
                AGB
              </a>
              <a href="/datenschutz" className="underline underline-offset-2 decoration-black/20">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}