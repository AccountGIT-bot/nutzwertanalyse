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
  hint: string;
  image: string; // path in /public
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

  const canStart = useMemo(() => text.trim().length > 0, [text]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("landing"), 2600);
    return () => clearTimeout(t);
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

  const placeholderText = "WELCHE ENTSCHEIDUNG STEHT HEUTE AN...?";

  return (
    <main className="relative min-h-screen text-slate-900 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] via-[#f3f6f6] to-[#eef2f2]" />

        {/* Soft spotlights */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 18% 18%, rgba(0,0,0,0.05), transparent 62%), radial-gradient(850px 600px at 85% 40%, rgba(0,0,0,0.035), transparent 62%), radial-gradient(900px 700px at 50% 110%, rgba(0,0,0,0.06), transparent 70%)",
          }}
        />

        {/* Subtle grain + sheen */}
        <div className="absolute inset-0 landing-grain opacity-[0.20]" />
        <div className="absolute inset-0 landing-sheen2 opacity-[0.65]" />

        {/* “Premium” vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
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
          <div className="text-5xl md:text-6xl font-semibold tracking-tight text-slate-900">
            Nutzwertanalyse<span className="opacity-70">.</span>
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
        {/* Header (oben links) */}
        <div className="flex items-start justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-3">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
                Nutzwertanalyse<span className="opacity-70">.</span>
              </h1>

              {/* tiny premium divider */}
              <div className="hidden sm:block h-[28px] w-px bg-black/10" />
              <div className="hidden sm:block text-xs tracking-[0.28em] uppercase text-black/40">
                Decision Studio
              </div>
            </div>

            <p className="mt-3 text-sm sm:text-base text-black/50 leading-relaxed">
              Starte direkt mit deiner Entscheidung oder wähle eine Vorlage.
              <span className="text-black/40">
                {" "}
                Speichern/Export/Account erst später.
              </span>
            </p>
          </div>

          {/* optional empty right space for future (login etc.) */}
          <div className="hidden md:block" />
        </div>

        {/* Search + Start */}
        <div className="mt-8 sm:mt-10 md:mt-12">
          <div className="w-full max-w-4xl">
            <div className="relative rounded-[999px] bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* icon bubble (neutral, no color) */}
                <div
                  className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full flex items-center justify-center"
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

                {/* input with placeholder overlay */}
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

                  {/* Desktop placeholder */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden sm:flex items-center">
                      <span className="text-black/55 text-sm sm:text-base font-semibold tracking-[0.18em] uppercase">
                        {placeholderText}
                      </span>
                    </div>
                  )}

                  {/* Mobile placeholder marquee */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex sm:hidden items-center w-full overflow-hidden">
                      <div className="w-full landing-marquee-mask">
                        <div className="landing-marquee text-black/55 text-sm font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
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
                      : "opacity-65 cursor-not-allowed",
                  ].join(" ")}
                  style={{
                    background: "#0b0f14",
                    color: "white",
                  }}
                  aria-label="Start"
                  title="Start"
                >
                  START
                </button>
              </div>
            </div>

            <div className="mt-3 text-xs sm:text-sm text-black/45">
              Ohne Login starten – Login wird erst fürs Speichern/Export relevant.
            </div>
          </div>
        </div>

        {/* 6 Presets */}
        <div className="mt-8 sm:mt-10">
          <div className="w-full max-w-5xl">
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => startFromPreset(p.id)}
                  className={[
                    "group relative overflow-hidden rounded-3xl text-left",
                    "border border-black/10",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.12)]",
                    "transition duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.16)]",
                    "active:translate-y-0",
                    "h-[190px] sm:h-[235px] lg:h-[275px]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                  ].join(" ")}
                >
                  {/* Background image */}
                  <div className="absolute inset-0">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      // ✅ “breiter / mehr rechts sehen”: right-centered + slight zoom
                      className="object-cover object-[72%_50%] scale-[1.08] transition-transform duration-500 ease-out group-hover:scale-[1.12]"
                      priority={p.id === "supplier"}
                    />

                    {/* readability layers */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/18 to-black/0" />
                    <div className="absolute inset-0 bg-[radial-gradient(900px_280px_at_20%_100%,rgba(0,0,0,0.35),transparent_65%)]" />

                    {/* premium glass sheen on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 landing-card-sheen" />
                  </div>

                  {/* Label oben links (statt unten) */}
                  <div className="relative z-10 p-4 sm:p-5">
                    <div
                      className="inline-flex flex-col gap-1 rounded-2xl px-4 py-3 backdrop-blur-md"
                      style={{
                        background: "rgba(0,0,0,0.38)",
                        border: "1px solid rgba(255,255,255,0.16)",
                      }}
                    >
                      <div className="text-base font-semibold text-white leading-tight">
                        {p.label}
                      </div>
                      <div className="text-xs text-white/80">{p.hint}</div>
                    </div>
                  </div>

                  {/* Click affordance (subtle) */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <div
                      className={[
                        "h-10 w-10 rounded-full grid place-items-center",
                        "backdrop-blur-md border border-white/15",
                        "bg-black/25",
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

            <div className="mt-6 text-center text-xs text-black/35">
              Login wird erst relevant, wenn du speichern / exportieren / Abo
              nutzen willst.
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS (landing only) */}
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

        /* subtle film grain */
        .landing-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
        }

        /* premium sheen for preset cards */
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