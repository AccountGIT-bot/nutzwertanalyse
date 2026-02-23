"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Phase = "intro" | "landing";

type PresetId =
  | "supplier"
  | "software"
  | "investment"
  | "machines"
  | "vehicle"
  | "employee";

const PRESETS: Array<{
  id: PresetId;
  label: string;
  hint: string;
  image: string;
}> = [
  {
    id: "supplier",
    label: "Lieferantenauswahl",
    hint: "Partner objektiv vergleichen",
    image: "/presets/Startseite_Lieferantenauswahl_komprimiert.jpg",
  },
  {
    id: "software",
    label: "Softwarevergleich",
    hint: "Tools effizient bewerten",
    image: "/presets/Startseite_Softwarevergleich_komprimiert.jpg",
  },
  {
    id: "investment",
    label: "Investitionsentscheid",
    hint: "Chancen & Risiken abwägen",
    image: "/presets/Startseite_Investitionsentscheid_komprimiert.jpg",
  },
  {
    id: "machines",
    label: "Maschinenkauf",
    hint: "Leistung & Wirtschaftlichkeit",
    image: "/presets/Startseite_Maschinenkauf_komprimiert.jpg",
  },
  {
    id: "vehicle",
    label: "Fahrzeuganschaffung",
    hint: "Anschaffung & Nutzen",
    image: "/presets/Startseite_Fahrzeugauswahl_komprimiert.jpg",
  },
  {
    id: "employee",
    label: "Mitarbeiterwahl",
    hint: "Bewerber fair vergleichen",
    image: "/presets/Startseite_Mitarbeiterwahl_komprimiert.jpg",
  },
];

export default function LandingWithIntro() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Startseiten-Fog: soll lange genug bleiben, damit man Intro lesen kann
  const [fogVisible, setFogVisible] = useState(true);
  const [fogSoftHide, setFogSoftHide] = useState(false);
  const fogTimer = useRef<number | null>(null);

  // Header reacts to scroll (professional feel)
  const [scrolled, setScrolled] = useState(false);

  const canStart = useMemo(() => text.trim().length > 0, [text]);
  const placeholderText = "WELCHE ENTSCHEIDUNG SOLL HEUTE STRUKTURIERT WERDEN?";

  useEffect(() => {
    // Intro: 3 Sekunden sichtbar
    const t = window.setTimeout(() => setPhase("landing"), 3000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    // Fog-Handling NUR auf Startseite:
    // - Fog bleibt während Intro vollständig aktiv
    // - Danach noch kurz "soft" stehen lassen und erst dann ausblenden
    if (fogTimer.current) window.clearTimeout(fogTimer.current);

    if (phase === "intro") {
      setFogVisible(true);
      setFogSoftHide(false);
      return;
    }

    // landing: fog bleibt noch etwas, dann fade-out
    setFogVisible(true);
    setFogSoftHide(false);
    fogTimer.current = window.setTimeout(() => {
      setFogSoftHide(true); // startet fade-out
      // nach fade-out ganz aus
      window.setTimeout(() => setFogVisible(false), 650);
    }, 550);

    return () => {
      if (fogTimer.current) window.clearTimeout(fogTimer.current);
    };
  }, [phase]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function goToApp(payload: { draft: string; preset?: PresetId }) {
    try {
      localStorage.setItem("nwa_decisionDraft", payload.draft);
      if (payload.preset) localStorage.setItem("nwa_preset", payload.preset);
    } catch {}
    router.push("/app");
  }

  function startFromInput() {
    const draft = text.trim();
    if (!draft) return;
    goToApp({ draft });
  }

  function startFromPreset(p: PresetId) {
    const draft =
      text.trim() ||
      `Vorlage: ${PRESETS.find((x) => x.id === p)?.label ?? "Auswahl"}`;
    goToApp({ draft, preset: p });
  }

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-x-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] via-[#f3f6f6] to-[#eef2f2]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 18% 18%, rgba(0,0,0,0.05), transparent 62%), radial-gradient(850px 600px at 85% 40%, rgba(0,0,0,0.035), transparent 62%), radial-gradient(900px 700px at 50% 115%, rgba(0,0,0,0.07), transparent 72%)",
          }}
        />
        <div className="absolute inset-0 landing-grain opacity-[0.18]" />
        <div className="absolute inset-0 landing-sheen2 opacity-[0.60]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
      </div>

      {/* Fog Overlay (nur Startseite, länger) */}
      {fogVisible && (
        <div
          className={[
            "fixed inset-0 z-40 pointer-events-none",
            "transition-opacity duration-700 ease-out",
            fogSoftHide ? "opacity-0" : "opacity-100",
          ].join(" ")}
          style={{
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.28)",
          }}
        />
      )}

      {/* INTRO OVERLAY */}
      <div
        className={[
          "fixed inset-0 z-50 grid place-items-center",
          "transition-all duration-700 ease-out",
          phase === "intro" ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "text-center transition-all duration-700 ease-out",
            phase === "intro"
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-[0.98] opacity-0",
          ].join(" ")}
        >
          <div className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
            Nutzwertanalyse<span className="opacity-70">.</span>
          </div>
          <div className="mt-4 text-sm text-black/45">
            Entscheidungen nachvollziehbar begründen
          </div>
        </div>
      </div>

      <div className="relative min-h-[100svh] flex flex-col">
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
                  <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                    Nutzwertanalyse<span className="opacity-60">.tool</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-black/45">
                    Decision documentation • Governance-ready
                  </div>
                </div>
              </button>

              <nav className="hidden lg:flex items-center gap-6 text-sm text-black/55">
                <a className="hover:text-black/80 transition" href="#principles">
                  Prinzipien
                </a>
                <a className="hover:text-black/80 transition" href="#framework">
                  Framework
                </a>
                <a className="hover:text-black/80 transition" href="/datenschutz">
                  Datenschutz
                </a>
              </nav>

              <button
                onClick={() => router.push("/login")}
                className={[
                  "rounded-full px-4 py-2 text-sm font-semibold",
                  "border border-black/10",
                  "bg-white/70 backdrop-blur-md",
                  "hover:bg-white/85 transition",
                ].join(" ")}
              >
                Login
              </button>
            </div>
            <div className="h-px bg-black/10" />
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 min-h-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-full flex flex-col">
            <div className="pt-5 sm:pt-7">
              <div className="max-w-3xl">
                <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                  Nutzwertanalyse • Dokumentation • Vergleichbarkeit
                </div>

                <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">
                  Entscheidungen dokumentieren.{" "}
                  <span className="opacity-70">Sauber begründet.</span>
                </h1>

                <p className="mt-3 text-sm sm:text-base text-black/55 leading-relaxed">
                  Starte mit einer Entscheidung oder einer Vorlage. Du erhältst
                  einen strukturierten Bewertungsprozess (Kriterien, Gewichtung,
                  Bewertung) und eine nachvollziehbare Dokumentation – für Team,
                  Management und Compliance.
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="mt-5 sm:mt-6">
              <div className="w-full max-w-4xl">
                <div className="relative rounded-[999px] bg-white/74 border border-black/10 shadow-[0_26px_72px_rgba(0,0,0,0.10)] backdrop-blur-md px-3 sm:px-4 py-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className="h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(0,0,0,0.04)",
                        border: "1px solid rgba(0,0,0,0.10)",
                      }}
                      aria-hidden="true"
                    >
                      <span className="text-black/60" style={{ fontSize: 18 }}>
                        ⌁
                      </span>
                    </div>

                    <div className="relative w-full">
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") startFromInput();
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={[
                          "w-full bg-transparent outline-none font-medium tracking-wide",
                          "text-sm sm:text-base",
                          "placeholder:text-transparent",
                          "pr-2",
                        ].join(" ")}
                        placeholder={placeholderText}
                        aria-label="Entscheidung eingeben"
                      />

                      {!text && !isFocused && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 hidden sm:flex items-center">
                          <span className="text-black/55 text-sm sm:text-base font-semibold tracking-[0.12em] uppercase">
                            {placeholderText}
                          </span>
                        </div>
                      )}

                      {!text && !isFocused && (
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex sm:hidden items-center w-full overflow-hidden">
                          <div className="w-full landing-marquee-mask">
                            <div className="landing-marquee text-black/55 text-sm font-semibold tracking-[0.12em] uppercase whitespace-nowrap">
                              {placeholderText}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                              {placeholderText}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={startFromInput}
                      disabled={!canStart}
                      className={[
                        "shrink-0 rounded-full px-6 sm:px-8 py-2.5",
                        "text-sm sm:text-base font-semibold",
                        "transition-all duration-200",
                        "shadow-[0_16px_34px_rgba(0,0,0,0.10)]",
                        "active:scale-[0.99]",
                        canStart
                          ? "hover:brightness-[1.04]"
                          : "opacity-65 cursor-not-allowed",
                      ].join(" ")}
                      style={{ background: "#0b0f14", color: "white" }}
                      aria-label="Start"
                      title="Start"
                    >
                      Start
                    </button>
                  </div>
                </div>

                <div className="mt-2 text-xs sm:text-sm text-black/45">
                  Ohne Login starten – Account erst für Speichern/Export.
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="mt-5 sm:mt-6 flex-1 min-h-0">
              <div className="h-full flex flex-col">
                <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-3">
                  {PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => startFromPreset(p.id)}
                      className={[
                        "group relative overflow-hidden rounded-3xl text-left",
                        "border border-black/10",
                        "shadow-[0_16px_42px_rgba(0,0,0,0.12)]",
                        "transition duration-300 ease-out",
                        "hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(0,0,0,0.16)]",
                        "active:translate-y-0",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                        "h-[clamp(132px,18.5vh,182px)]",
                      ].join(" ")}
                    >
                      <div className="absolute inset-0">
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                          className="object-cover object-[74%_50%] scale-[1.10] transition-transform duration-500 ease-out group-hover:scale-[1.14]"
                          priority={p.id === "supplier"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/16 to-black/0" />
                        <div className="absolute inset-0 bg-[radial-gradient(900px_280px_at_20%_100%,rgba(0,0,0,0.35),transparent_65%)]" />
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 landing-card-sheen" />
                      </div>

                      <div className="relative z-10 p-3 sm:p-4">
                        <div
                          className="inline-flex flex-col gap-1 rounded-2xl px-3.5 py-2.5 backdrop-blur-md"
                          style={{
                            background: "rgba(0,0,0,0.34)",
                            border: "1px solid rgba(255,255,255,0.14)",
                          }}
                        >
                          <div className="text-sm sm:text-base font-semibold text-white leading-tight">
                            {p.label}
                          </div>
                          <div className="text-[11px] sm:text-xs text-white/80">
                            {p.hint}
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-3 right-3 z-10">
                        <div
                          className={[
                            "h-9 w-9 rounded-full grid place-items-center",
                            "backdrop-blur-md border border-white/15",
                            "bg-black/22",
                            "opacity-0 group-hover:opacity-100 transition duration-300",
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          <span className="text-white/85 text-lg">→</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 hidden sm:grid grid-cols-3 gap-3 text-[11px] text-black/45">
                  <div
                    id="principles"
                    className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3"
                  >
                    <div className="font-semibold text-black/70">Prinzipien</div>
                    <div className="mt-1">
                      Transparenz, Fairness, Nachvollziehbarkeit – klare Kriterien statt Bauchgefühl.
                    </div>
                  </div>

                  <div
                    id="framework"
                    className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3"
                  >
                    <div className="font-semibold text-black/70">Framework</div>
                    <div className="mt-1">
                      Kriterien • Gewichtung • Bewertung • Sensitivität – dokumentiert & vergleichbar.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3">
                    <div className="font-semibold text-black/70">Recht</div>
                    <div className="mt-1">
                      <a className="underline underline-offset-2 decoration-black/20" href="/datenschutz">
                        Datenschutz (DSG)
                      </a>{" "}
                      •{" "}
                      <a className="underline underline-offset-2 decoration-black/20" href="/agb">
                        AGB
                      </a>{" "}
                      •{" "}
                      <a className="underline underline-offset-2 decoration-black/20" href="/impressum">
                        Impressum
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="mt-4 pb-4 sm:pb-5">
              <div className="h-px bg-black/10" />
              <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div>
                  © {new Date().getFullYear()} Nutzwertanalyse.tool • Draft-first
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a
                    href="/impressum"
                    className="underline underline-offset-2 decoration-black/20"
                  >
                    Impressum
                  </a>
                  <a
                    href="/agb"
                    className="underline underline-offset-2 decoration-black/20"
                  >
                    AGB
                  </a>
                  <a
                    href="/datenschutz"
                    className="underline underline-offset-2 decoration-black/20"
                  >
                    Datenschutz
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </section>
      </div>

      <style jsx global>{`
        .landing-sheen2 {
          background: radial-gradient(
            800px 420px at 22% 18%,
            rgba(255, 255, 255, 0.55),
            transparent 62%
          );
          animation: sheenMove2 12s ease-in-out infinite;
        }
        @keyframes sheenMove2 {
          0% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(2%, -1%, 0);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.55;
          }
        }
        .landing-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
        }
        .landing-card-sheen {
          background: linear-gradient(
            120deg,
            rgba(255, 255, 255, 0.04),
            rgba(255, 255, 255, 0.14),
            rgba(255, 255, 255, 0.04)
          );
          mix-blend-mode: overlay;
        }
        .landing-marquee-mask {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 12%,
            black 88%,
            transparent
          );
        }
        .landing-marquee {
          display: inline-block;
          animation: marquee 8s linear infinite;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </main>
  );
}