"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  getPresetIcon, 
  type PresetId,
  SupplierIcon,
  SoftwareIcon,
  InvestmentIcon,
  MachinesIcon,
  VehicleIcon,
  EmployeeIcon,
} from "@/app/lib/nwa/preset-icons";
import { DecisionSuggestion } from "@/app/components/nwa/DecisionSuggestion";
import type { AIDecisionInterpretation } from "@/app/lib/nwa/types";
import { interpretDecisionInput, sanitizeInput } from "@/app/lib/nwa/interpretation-engine";
import { useTranslations } from "@/app/lib/i18n";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";

type Phase = "intro" | "landing" | "analyzing" | "suggestion";

const PRESET_CONFIG: Array<{
  id: PresetId;
  image: string;
  Icon: typeof SupplierIcon;
}> = [
  {
    id: "supplier",
    image: "/presets/Startseite_Lieferantenauswahl_komprimiert.jpg",
    Icon: SupplierIcon,
  },
  {
    id: "software",
    image: "/presets/Startseite_Softwarevergleich_komprimiert.jpg",
    Icon: SoftwareIcon,
  },
  {
    id: "investment",
    image: "/presets/Startseite_Investitionsentscheid_komprimiert.jpg",
    Icon: InvestmentIcon,
  },
  {
    id: "machines",
    image: "/presets/Startseite_Maschinenkauf_komprimiert.jpg",
    Icon: MachinesIcon,
  },
  {
    id: "vehicle",
    image: "/presets/Startseite_Fahrzeugauswahl_komprimiert.jpg",
    Icon: VehicleIcon,
  },
  {
    id: "employee",
    image: "/presets/Startseite_Mitarbeiterwahl_komprimiert.jpg",
    Icon: EmployeeIcon,
  },
];

const INTRO_COOLDOWN_MS = 3 * 60 * 1000; // 3 Minuten
const INTRO_KEY = "nwa_intro_lastShownAt";

// Safe localStorage access - only call on client side
function shouldShowIntroNow(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(localStorage.getItem(INTRO_KEY) || "0");
    return !last || Date.now() - last > INTRO_COOLDOWN_MS;
  } catch {
    return true;
  }
}

function markIntroShownNow(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(INTRO_KEY, String(Date.now()));
  } catch {
    // Silent fail for localStorage errors
  }
}

export default function LandingWithIntro() {
  const router = useRouter();
  const t = useTranslations();

  // Determine intro on client to avoid SSR mismatch
  const [phase, setPhase] = useState<Phase>("landing");
  const [shouldIntro, setShouldIntro] = useState(false);

  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Fog on startseite only, tied to intro
  const [fogVisible, setFogVisible] = useState(false);
  const [fogSoftHide, setFogSoftHide] = useState(false);
  const fogTimer = useRef<number | null>(null);

  const [scrolled, setScrolled] = useState(false);

  // AI interpretation state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const canStart = useMemo(() => text.trim().length > 0, [text]);
  const placeholderText = "WELCHE ENTSCHEIDUNG SOLL HEUTE STRUKTURIERT WERDEN?";

  useEffect(() => {
    // Decide intro only once on mount
    const show = shouldShowIntroNow();
    setShouldIntro(show);

    if (show) {
      setPhase("intro");
      setFogVisible(true);
      setFogSoftHide(false);

      // after 3s -> landing
      const t = window.setTimeout(() => {
        setPhase("landing");
        markIntroShownNow();
      }, 3000);

      return () => window.clearTimeout(t);
    } else {
      // no intro, no fog
      setPhase("landing");
      setFogVisible(false);
      setFogSoftHide(false);
    }
  }, []);

  useEffect(() => {
    // Fog fade-out only if intro was shown
    if (!shouldIntro) return;

    if (fogTimer.current) window.clearTimeout(fogTimer.current);

    if (phase === "intro") {
      setFogVisible(true);
      setFogSoftHide(false);
      return;
    }

    // landing: keep fog slightly, then fade
    setFogVisible(true);
    setFogSoftHide(false);
    fogTimer.current = window.setTimeout(() => {
      setFogSoftHide(true);
      window.setTimeout(() => setFogVisible(false), 650);
    }, 550);

    return () => {
      if (fogTimer.current) window.clearTimeout(fogTimer.current);
    };
  }, [phase, shouldIntro]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goToApp = useCallback((payload: { 
    draft: string; 
    preset?: PresetId;
    interpretation?: AIDecisionInterpretation;
  }) => {
    if (typeof window !== "undefined") {
      try {
        // Clear previous values first to avoid mixing old and new data
        localStorage.removeItem("nwa_decisionDraft");
        localStorage.removeItem("nwa_preset");
        localStorage.removeItem("nwa_aiInterpretation");
        
        // Set new values
        localStorage.setItem("nwa_decisionDraft", payload.draft);
        if (payload.preset) {
          localStorage.setItem("nwa_preset", payload.preset);
        }
        if (payload.interpretation) {
          localStorage.setItem("nwa_aiInterpretation", JSON.stringify(payload.interpretation));
        }
      } catch {
        // Silent fail for localStorage errors
      }
    }
    router.push("/app");
  }, [router]);

  // Analyze user input with AI - with robust fallback using interpretation engine
  const analyzeInput = useCallback(async () => {
    const draft = sanitizeInput(text);
    if (!draft || draft.length < 3) return;

    setIsAnalyzing(true);
    setAiError(null);
    setPhase("analyzing");

    try {
      const response = await fetch("/api/interpret-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: draft }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze decision");
      }

      const data = await response.json();
      if (data.interpretation) {
        setAiInterpretation(data.interpretation);
        setPhase("suggestion");
      } else {
        throw new Error("No interpretation returned");
      }
    } catch (err) {
      // Use robust client-side interpretation engine as fallback
      const fallback = interpretDecisionInput(draft);
      setAiInterpretation(fallback);
      setPhase("suggestion");
      // Show subtle notice that local interpretation was used
      if (fallback.confidence === "low") {
        setAiError("Automatische Interpretation wurde verwendet. Sie können alle Felder anpassen.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  // Start from input - triggers AI analysis or uses local interpretation for simple inputs
  const startFromInput = useCallback(() => {
    const draft = sanitizeInput(text);
    if (!draft) return;
    
    // For very short inputs (< 6 chars), use local interpretation immediately
    if (draft.length < 6) {
      const interpretation = interpretDecisionInput(draft);
      setAiInterpretation(interpretation);
      setPhase("suggestion");
      return;
    }
    
    // Trigger AI analysis (which has robust fallback on error)
    analyzeInput();
  }, [text, analyzeInput]);

  // Handle AI suggestion acceptance
  const handleAcceptSuggestion = useCallback((interpretation: AIDecisionInterpretation) => {
    goToApp({ 
      draft: interpretation.title, 
      interpretation,
    });
  }, [goToApp]);

  // Handle AI suggestion edit
  const handleEditSuggestion = useCallback((interpretation: AIDecisionInterpretation) => {
    // Go to app with interpretation but allow editing
    goToApp({ 
      draft: text.trim(), 
      interpretation,
    });
  }, [goToApp, text]);

  // Handle AI suggestion rejection
  const handleRejectSuggestion = useCallback(() => {
    setAiInterpretation(null);
    setPhase("landing");
    // Focus on input
  }, []);

  const startFromPreset = useCallback((p: PresetId) => {
    // Use user input if available, otherwise leave empty - the preset context is shown via icon
    const draft = text.trim();
    goToApp({ draft, preset: p });
  }, [text, goToApp]);

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-x-hidden pt-11">
      {/* Construction Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{t.constructionBanner.text}</span>
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        </div>
      </div>
      
      {/* Premium Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Base gradient - warm to cool */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf9f7] via-[#f5f3f0] to-[#eff2f4]" />
        
        {/* Static subtle color accents - no animations to avoid hydration issues */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(800px 600px at 12% 15%, rgba(59, 130, 246, 0.07), transparent 55%),
              radial-gradient(600px 500px at 88% 25%, rgba(168, 85, 247, 0.05), transparent 50%),
              radial-gradient(900px 600px at 45% 105%, rgba(16, 185, 129, 0.06), transparent 60%)
            `,
          }}
        />
        
        {/* Depth gradients */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 18% 18%, rgba(0,0,0,0.04), transparent 62%), radial-gradient(850px 600px at 85% 40%, rgba(0,0,0,0.025), transparent 62%)",
          }}
        />
        
        <div className="absolute inset-0 landing-grain opacity-[0.12]" />
        <div className="absolute inset-0 landing-sheen2 opacity-[0.55]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.08)_100%)]" />
      </div>

      {/* Fog Overlay only when intro is active/just ended */}
      {shouldIntro && fogVisible && (
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
      {shouldIntro && (
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
      )}

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
                  {t.landing.footer.principles}
                </a>
                <a className="hover:text-black/80 transition" href="#framework">
                  {t.landing.footer.framework}
                </a>
                <a className="hover:text-black/80 transition" href="/datenschutz">
                  {t.landing.footer.privacy}
                </a>
              </nav>

              <div className="flex items-center gap-3">
                <LanguageSwitcher />
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
            </div>
            <div className="h-px bg-black/10" />
          </div>
        </header>

        {/* Content */}
        <section className="flex-1 min-h-0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-full flex flex-col">
            {/* Analyzing Phase */}
            {phase === "analyzing" && (
              <div className="flex-1 flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="relative mx-auto w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-black/10" />
                    <div 
                      className="absolute inset-0 rounded-full border-2 border-transparent border-t-black/60 animate-spin"
                      style={{ animationDuration: "1s" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-black/60 text-xl">⌁</span>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Analysiere Ihre Entscheidung...
                  </h2>
                  <p className="text-sm text-black/50 max-w-md mx-auto">
                    Wir interpretieren Ihre Eingabe und generieren passende Alternativen und Kriterien.
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-xl bg-black/5 inline-block">
                    <div className="text-sm text-black/60 italic">{`"${text}"`}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion Phase */}
            {phase === "suggestion" && aiInterpretation && (
              <div className="flex-1 py-8 overflow-y-auto">
                {/* Warning if fallback was used */}
                {aiError && (
                  <div className="max-w-4xl mx-auto mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 flex items-center gap-2">
                    <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{aiError}</span>
                    <button
                      onClick={() => setAiError(null)}
                      className="ml-auto text-amber-600 hover:text-amber-800 font-medium"
                    >
                      OK
                    </button>
                  </div>
                )}
                <DecisionSuggestion
                  interpretation={aiInterpretation}
                  originalInput={text}
                  onAccept={handleAcceptSuggestion}
                  onEdit={handleEditSuggestion}
                  onReject={handleRejectSuggestion}
                />
              </div>
            )}

            {/* Normal Landing Phase */}
            {(phase === "landing" || phase === "intro") && (
              <>
                <div className="pt-5 sm:pt-7">
                  <div className="max-w-3xl">
                    <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                      Nutzwertanalyse • Dokumentation • Vergleichbarkeit
                    </div>

                    <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">
                      <span className="inline-block animate-fade-in-up">{t.landing.headline.part1}</span>{" "}
                      <span className="inline-block animate-fade-in-up animation-delay-100 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">{t.landing.headline.part2}</span>{" "}
                      <span className="inline-block animate-fade-in-up animation-delay-200 opacity-60">{t.landing.headline.part3}</span>
                    </h1>

                    <p className="mt-4 text-sm sm:text-base text-black/55 leading-relaxed max-w-2xl">
                      {t.landing.description}
                    </p>
                  </div>
                </div>

                {/* AI Error Message */}
                {aiError && (
                  <div className="mt-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
                    {aiError}
                    <button
                      onClick={() => setAiError(null)}
                      className="ml-2 text-red-500 hover:text-red-700 font-medium"
                    >
                      Schliessen
                    </button>
                  </div>
                )}

                {/* Search */}
                <div className="mt-5 sm:mt-6">
                  <div className="w-full max-w-4xl">
                    <div className="relative rounded-2xl sm:rounded-[999px] bg-white/74 border border-black/10 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:shadow-[0_26px_72px_rgba(0,0,0,0.10)] backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div
                          className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 rounded-full flex items-center justify-center"
                          style={{
                            background: "rgba(0,0,0,0.04)",
                            border: "1px solid rgba(0,0,0,0.10)",
                          }}
                          aria-hidden="true"
                        >
                          <span className="text-black/60 text-sm sm:text-lg">
                            ⌁
                          </span>
                        </div>

                        <div className="relative w-full min-w-0">
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
                              "text-xs sm:text-base",
                              "placeholder:text-transparent",
                              "pr-1 sm:pr-2",
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
                                <div className="landing-marquee text-black/55 text-xs font-semibold tracking-[0.08em] uppercase whitespace-nowrap">
                                  {placeholderText}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                                  {placeholderText}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          onClick={startFromInput}
                          disabled={!canStart || isAnalyzing}
                          className={[
                            "shrink-0 rounded-full px-4 sm:px-8 py-2 sm:py-2.5",
                            "text-xs sm:text-base font-semibold",
                            "transition-all duration-200",
                            "shadow-[0_8px_20px_rgba(0,0,0,0.08)] sm:shadow-[0_16px_34px_rgba(0,0,0,0.10)]",
                            "active:scale-[0.99]",
                            canStart && !isAnalyzing
                              ? "hover:brightness-[1.04]"
                              : "opacity-65 cursor-not-allowed",
                          ].join(" ")}
                          style={{ background: "#0b0f14", color: "white" }}
                          aria-label="Start"
                          title="Start"
                        >
                          {isAnalyzing ? "..." : "Start"}
                        </button>
                      </div>
                    </div>

                    <div className="mt-2 text-xs sm:text-sm text-black/45 flex items-center gap-2">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      {t.landing.searchHint}
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="mt-5 sm:mt-6 flex-1 min-h-0">
                  <div className="h-full flex flex-col">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                      {PRESET_CONFIG.map((p) => {
                        const presetTranslations = t.presets[p.id as keyof typeof t.presets];
                        return (
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
                                className="inline-flex items-start gap-3 rounded-2xl px-3.5 py-2.5 backdrop-blur-md"
                                style={{
                                  background: "rgba(0,0,0,0.34)",
                                  border: "1px solid rgba(255,255,255,0.14)",
                                }}
                              >
                                <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/10 flex-shrink-0 mt-0.5">
                                  <p.Icon size={18} className="text-white/90" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                  <div className="text-sm sm:text-base font-semibold text-white leading-tight">
                                    {presetTranslations.label}
                                  </div>
                                  <div className="text-[11px] sm:text-xs text-white/80">
                                    {presetTranslations.hint}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 hidden sm:grid grid-cols-3 gap-3 text-[11px] text-black/45">
                      <div
                        id="principles"
                        className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3"
                      >
                        <div className="font-semibold text-black/70">{t.landing.footer.principles}</div>
                        <div className="mt-1">
                          {t.landing.footer.principlesText}
                        </div>
                      </div>

                      <div
                        id="framework"
                        className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3"
                      >
                        <div className="font-semibold text-black/70">{t.landing.footer.framework}</div>
                        <div className="mt-1">
                          {t.landing.footer.frameworkText}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md px-4 py-3">
                        <div className="font-semibold text-black/70">{t.landing.footer.legal}</div>
                        <div className="mt-1">
                          <a className="underline underline-offset-2 decoration-black/20" href="/datenschutz">
                            {t.landing.footer.privacy}
                          </a>{" "}
                          -{" "}
                          <a className="underline underline-offset-2 decoration-black/20" href="/agb">
                            {t.landing.footer.terms}
                          </a>{" "}
                          -{" "}
                          <a className="underline underline-offset-2 decoration-black/20" href="/impressum">
                            {t.landing.footer.imprint}
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
                  <div>© {new Date().getFullYear()} Nutzwertanalyse.com • Decision Studio</div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1">
                    <a href="/impressum" className="underline underline-offset-2 decoration-black/20">
                      {t.landing.footer.imprint}
                    </a>
                    <a href="/agb" className="underline underline-offset-2 decoration-black/20">
                      {t.landing.footer.terms}
                    </a>
                    <a href="/datenschutz" className="underline underline-offset-2 decoration-black/20">
                      {t.landing.footer.privacy}
                    </a>
                  </div>
                </div>
              </footer>
            </>
            )}
          </div>
        </section>
      </div>

      
    </main>
  );
}
