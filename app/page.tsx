"use client";

import { useEffect, useMemo, useState } from "react";
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
  emoji: string;
  hint: string;
  accent: string; // rgb string like "0 115 106"
  image: string;  // path in /public
}> = [
  {
    id: "supplier",
    label: "Lieferant",
    emoji: "🤝",
    hint: "Partner objektiv vergleichen",
    accent: "37 99 235", // Blau
    image: "/presets/Startseite_Lieferantenauswahl_komprimiert.jpg",
  },
  {
    id: "software",
    label: "Software",
    emoji: "💻",
    hint: "Tools effizient bewerten",
    accent: "45 212 191", // Türkis
    image: "/presets/Startseite_Softwarevergleich_komprimiert.jpg",
  },
  {
    id: "investment",
    label: "Investition",
    emoji: "📈",
    hint: "Chancen & Risiken abwägen",
    accent: "16 185 129", // Grün
    image: "/presets/Startseite_Investitionsentscheid_komprimiert.jpg",
  },
  {
    id: "machines",
    label: "Maschinen",
    emoji: "⚙",
    hint: "Leistung & Wirtschaftlichkeit",
    accent: "148 163 184", // Metall / Grau
    image: "/presets/Startseite_Maschinenkauf_komprimiert.jpg",
  },
  {
    id: "vehicle",
    label: "Fahrzeug",
    emoji: "🚗",
    hint: "Anschaffung & Nutzen",
    accent: "217 119 6", // warm neutral (amber)
    image: "/presets/Startseite_Fahrzeugauswahl_komprimiert.jpg",
  },
  {
    id: "employee",
    label: "Mitarbeiter",
    emoji: "👤✔",
    hint: "Bewerber fair vergleichen",
    accent: "15 23 42", // Navy
    image: "/presets/Startseite_Mitarbeiterwahl_komprimiert.jpg",
  },
];

export default function LandingWithIntro() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const canStart = useMemo(() => text.trim().length > 0, [text]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("landing"), 3000);
    return () => clearTimeout(t);
  }, []);

  function goToApp(payload: { draft: string; preset?: PresetId }) {
    try {
      localStorage.setItem("nwa_decisionDraft", payload.draft);
      if (payload.preset) localStorage.setItem("nwa_preset", payload.preset);
    } catch {}
    router.push("/app"); // ✅ führt zu app/app/page.tsx
  }

  function startFromInput() {
    const draft = text.trim();
    if (!draft) return;
    goToApp({ draft });
  }

  function startFromPreset(p: PresetId) {
    // Wenn Nutzer nichts schreibt, setzen wir einen sinnvollen Draft
    const draft =
      text.trim() ||
      `Vorlage: ${PRESETS.find((x) => x.id === p)?.label ?? "Auswahl"}`;
    goToApp({ draft, preset: p });
  }

  const placeholderText = "WELCHE ENTSCHEIDUNG STEHT HEUTE AN...?";

  return (
    <main className="relative min-h-screen text-slate-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] to-[#eef1f1]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 20% 15%, rgba(0,115,106,0.26), transparent 58%), radial-gradient(700px 520px at 85% 45%, rgba(0,115,106,0.12), transparent 62%)",
          }}
        />
        <div className="absolute inset-0 landing-sheen" />
        <div className="absolute inset-0 landing-hex opacity-[0.12]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_35%,transparent_55%,rgba(0,0,0,0.06)_100%)]" />
      </div>

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
          <div
            className="text-5xl md:text-6xl font-semibold tracking-tight"
            style={{ color: "#00736a" }}
          >
            Nutzwertanalyse<span className="opacity-90">.</span>
          </div>
          <div className="mt-4 text-sm text-black/45">
            Entscheidungen strukturiert treffen
          </div>
        </div>
      </div>

      {/* LANDING CONTENT */}
      <div
        className={[
          "mx-auto max-w-6xl px-5 sm:px-6",
          "py-10 sm:py-14 md:py-16",
          "transition-all duration-700 ease-out",
          phase === "landing"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Headline */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
            <span style={{ color: "#00736a" }}>Nutzwertanalyse</span>
            <span style={{ color: "#00736a" }}>.</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-black/45">
            Starte mit einer Entscheidung oder wähle eine Vorlage – Login kommt
            später.
          </p>
        </div>

        {/* Search + Start */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative rounded-[999px] bg-white/70 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* icon bubble */}
                <div
                  className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(0,115,106,0.12)",
                    border: "1px solid rgba(0,115,106,0.20)",
                  }}
                  aria-hidden="true"
                >
                  <span style={{ color: "#00736a", fontSize: 18 }}>⌁</span>
                </div>

                {/* input with animated placeholder overlay */}
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
                    aria-label="Welche Entscheidung steht heute an?"
                  />

                  {/* Desktop placeholder (static) */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden sm:flex items-center">
                      <span className="text-[#00736a]/75 text-sm sm:text-base font-semibold tracking-[0.18em] uppercase">
                        {placeholderText}
                      </span>
                    </div>
                  )}

                  {/* Mobile placeholder (marquee) */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex sm:hidden items-center w-full overflow-hidden">
                      <div className="w-full landing-marquee-mask">
                        <div className="landing-marquee text-[#00736a]/75 text-sm font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
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
                    "shrink-0 rounded-full px-6 sm:px-9 py-3 sm:py-3.5",
                    "text-sm sm:text-base font-semibold",
                    "transition-all duration-200",
                    "shadow-[0_18px_40px_rgba(0,0,0,0.10)]",
                    "active:scale-[0.99]",
                    canStart
                      ? "hover:brightness-[1.04]"
                      : "opacity-70 cursor-not-allowed",
                  ].join(" ")}
                  style={{
                    background: "#00736a",
                    color: "white",
                  }}
                  aria-label="Start"
                  title="Start"
                >
                  START
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs sm:text-sm text-black/45">
              Tipp: Du kannst ohne Login starten – Login kommt erst später, wenn
              du wirklich weitermachst.
            </div>
          </div>
        </div>

        {/* 6 Presets */}
        <div className="mt-8 sm:mt-10 flex justify-center">
          <div className="w-full max-w-5xl">
            <div className="grid gap-4 sm:gap-5 grid-cols-2 md:grid-cols-3">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startFromPreset(p.id)}
                  className={[
                    "group relative overflow-hidden rounded-2xl",
                    "border border-black/10 bg-white/55 backdrop-blur-md",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.10)]",
                    "p-4 sm:p-5 text-left",
                    "transition duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.12)]",
                    "active:translate-y-0",
                  ].join(" ")}
                >
                  {/* Accent glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                    style={{
                      background: `radial-gradient(700px 260px at 15% 0%, rgb(${p.accent} / 0.22), transparent 62%)`,
                    }}
                  />

                  {/* Background image */}
<div className="absolute inset-0">
  <Image
    src={p.image}
    alt=""
    fill
    sizes="(max-width: 768px) 50vw, 33vw"
    className="object-cover"
    priority={p.id === "supplier"} // nur 1 preset priorisieren
  />
  {/* dunkle/helle Lesbarkeits-Layer */}
  <div className="absolute inset-0 bg-white/55" />
  <div
    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
    style={{
      background: `radial-gradient(700px 260px at 15% 0%, rgb(${p.accent} / 0.22), transparent 62%)`,
    }}
  />
</div>

                  <div className="relative flex items-start gap-3">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: `rgb(${p.accent} / 0.10)`,
                        border: `1px solid rgb(${p.accent} / 0.18)`,
                      }}
                      aria-hidden="true"
                    >
                      <span className="text-xl">{p.emoji}</span>
                    </div>

                    <div className="min-w-0">
                      <div
                        className="font-semibold tracking-tight"
                        style={{ color: `rgb(${p.accent})` }}
                      >
                        {p.label}
                      </div>
                      <div className="mt-1 text-xs sm:text-sm text-black/55">
                        {p.hint}
                      </div>
                      <div className="mt-3 text-[11px] text-black/40">
                        Klick → Vorlage starten
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center text-xs text-black/35">
              Login wird erst relevant, wenn du wirklich speichern / exportieren
              / Abo nutzen willst.
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS (landing only) */}
      <style jsx global>{`
        .landing-sheen {
          opacity: 0.55;
          background: radial-gradient(
            900px 500px at 10% 30%,
            rgba(0, 115, 106, 0.14),
            transparent 60%
          );
          animation: sheenMove 10s ease-in-out infinite;
        }
        @keyframes sheenMove {
          0% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.45;
          }
          50% {
            transform: translate3d(2%, -1%, 0);
            opacity: 0.65;
          }
          100% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.45;
          }
        }
        .landing-hex {
          background-image: linear-gradient(
              30deg,
              rgba(0, 0, 0, 0.08) 12%,
              transparent 12.5%,
              transparent 87%,
              rgba(0, 0, 0, 0.08) 87.5%,
              rgba(0, 0, 0, 0.08)
            ),
            linear-gradient(
              150deg,
              rgba(0, 0, 0, 0.08) 12%,
              transparent 12.5%,
              transparent 87%,
              rgba(0, 0, 0, 0.08) 87.5%,
              rgba(0, 0, 0, 0.08)
            ),
            linear-gradient(
              90deg,
              rgba(0, 0, 0, 0.06) 2%,
              transparent 2.5%,
              transparent 97%,
              rgba(0, 0, 0, 0.06) 97.5%,
              rgba(0, 0, 0, 0.06)
            );
          background-size: 120px 208px;
          mask-image: radial-gradient(
            900px 600px at 78% 35%,
            black 55%,
            transparent 78%
          );
          -webkit-mask-image: radial-gradient(
            900px 600px at 78% 35%,
            black 55%,
            transparent 78%
          );
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