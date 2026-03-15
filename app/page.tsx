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
  color: string;
}> = [
  {
    id: "supplier",
    image: "/presets/Startseite_Lieferantenauswahl_komprimiert.jpg",
    Icon: SupplierIcon,
    color: "59, 130, 246", // blue
  },
  {
    id: "software",
    image: "/presets/Startseite_Softwarevergleich_komprimiert.jpg",
    Icon: SoftwareIcon,
    color: "168, 85, 247", // purple
  },
  {
    id: "investment",
    image: "/presets/Startseite_Investitionsentscheid_komprimiert.jpg",
    Icon: InvestmentIcon,
    color: "245, 158, 11", // amber
  },
  {
    id: "machines",
    image: "/presets/Startseite_Maschinenkauf_komprimiert.jpg",
    Icon: MachinesIcon,
    color: "16, 185, 129", // emerald
  },
  {
    id: "vehicle",
    image: "/presets/Startseite_Fahrzeugauswahl_komprimiert.jpg",
    Icon: VehicleIcon,
    color: "239, 68, 68", // red
  },
  {
    id: "employee",
    image: "/presets/Startseite_Mitarbeiterwahl_komprimiert.jpg",
    Icon: EmployeeIcon,
    color: "6, 182, 212", // cyan
  },
];

const INTRO_COOLDOWN_MS = 10 * 60 * 1000;
const INTRO_KEY = "nwa_intro_lastShownAt";

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
  } catch {}
}

export default function LandingWithIntro() {
  const router = useRouter();
  const t = useTranslations();

  const [phase, setPhase] = useState<Phase>("landing");
  const [shouldIntro, setShouldIntro] = useState(false);
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [fogVisible, setFogVisible] = useState(false);
  const [fogSoftHide, setFogSoftHide] = useState(false);
  const fogTimer = useRef<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hoveredPreset, setHoveredPreset] = useState<PresetId | null>(null);
  const [mouseY, setMouseY] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const canStart = useMemo(() => text.trim().length > 0, [text]);
  const placeholderText = t.landing.searchInputPlaceholder;

  // Parallax mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseY(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const show = shouldShowIntroNow();
    setShouldIntro(show);

    if (show) {
      setPhase("intro");
      setFogVisible(true);
      setFogSoftHide(false);
      const t = window.setTimeout(() => {
        setPhase("landing");
        markIntroShownNow();
      }, 3000);
      return () => window.clearTimeout(t);
    } else {
      setPhase("landing");
      setFogVisible(false);
      setFogSoftHide(false);
    }
  }, []);

  useEffect(() => {
    if (!shouldIntro) return;
    if (fogTimer.current) window.clearTimeout(fogTimer.current);

    if (phase === "intro") {
      setFogVisible(true);
      setFogSoftHide(false);
      return;
    }

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
        localStorage.removeItem("nwa_decisionDraft");
        localStorage.removeItem("nwa_preset");
        localStorage.removeItem("nwa_aiInterpretation");
        localStorage.setItem("nwa_decisionDraft", payload.draft);
        if (payload.preset) localStorage.setItem("nwa_preset", payload.preset);
        if (payload.interpretation) localStorage.setItem("nwa_aiInterpretation", JSON.stringify(payload.interpretation));
      } catch {}
    }
    router.push("/app");
  }, [router]);

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

      if (!response.ok) throw new Error("Failed to analyze decision");

      const data = await response.json();
      if (data.interpretation) {
        setAiInterpretation(data.interpretation);
        setPhase("suggestion");
      } else {
        throw new Error("No interpretation returned");
      }
    } catch {
      const fallback = interpretDecisionInput(draft);
      setAiInterpretation(fallback);
      setPhase("suggestion");
      if (fallback.confidence === "low") {
        setAiError("Automatische Interpretation wurde verwendet. Sie können alle Felder anpassen.");
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [text]);

  const startFromInput = useCallback(() => {
    const draft = sanitizeInput(text);
    if (!draft) return;
    
    if (draft.length < 6) {
      const interpretation = interpretDecisionInput(draft);
      setAiInterpretation(interpretation);
      setPhase("suggestion");
      return;
    }
    
    analyzeInput();
  }, [text, analyzeInput]);

  const handleAcceptSuggestion = useCallback((interpretation: AIDecisionInterpretation) => {
    goToApp({ draft: interpretation.title, interpretation });
  }, [goToApp]);

  const handleEditSuggestion = useCallback((interpretation: AIDecisionInterpretation) => {
    goToApp({ draft: text.trim(), interpretation });
  }, [goToApp, text]);

  const handleRejectSuggestion = useCallback(() => {
    setAiInterpretation(null);
    setPhase("landing");
  }, []);

  const startFromPreset = useCallback((p: PresetId) => {
    const draft = text.trim();
    goToApp({ draft, preset: p });
  }, [text, goToApp]);

  // Get dynamic background color based on hovered preset
  const activeColor = hoveredPreset 
    ? PRESET_CONFIG.find(p => p.id === hoveredPreset)?.color || "59, 130, 246"
    : "59, 130, 246";

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-hidden">
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
      
      {/* ===== IMMERSIVE 3D PARALLAX BACKGROUND ===== */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Base gradient - adapts to theme */}
        <div 
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `linear-gradient(135deg, #0a0a0a 0%, #111827 50%, #0f172a 100%)`,
          }}
        />
        
        {/* Layer 1 - Slowest (Far background) */}
        <div 
          className="parallax-layer-1 absolute inset-0"
          style={{
            transform: `translateY(${mouseY * 20}px)`,
          }}
        >
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 transition-all duration-1000"
            style={{
              top: '10%',
              left: '10%',
              background: `radial-gradient(circle, rgb(${activeColor} / 0.4), transparent 70%)`,
            }}
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-15"
            style={{
              bottom: '20%',
              right: '15%',
              background: `radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%)`,
              animation: 'parallaxFloat1 30s ease-in-out infinite',
            }}
          />
        </div>

        {/* Layer 2 - Medium speed */}
        <div 
          className="parallax-layer-2 absolute inset-0"
          style={{
            transform: `translateY(${mouseY * 40}px)`,
          }}
        >
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-25 transition-all duration-700"
            style={{
              top: '30%',
              right: '20%',
              background: `radial-gradient(circle, rgb(${activeColor} / 0.5), transparent 60%)`,
              animation: 'parallaxFloat2 25s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute w-[400px] h-[400px] rounded-full blur-[70px] opacity-20"
            style={{
              bottom: '30%',
              left: '25%',
              background: `radial-gradient(circle, rgba(16, 185, 129, 0.4), transparent 60%)`,
              animation: 'parallaxFloat3 20s ease-in-out infinite',
            }}
          />
        </div>

        {/* Layer 3 - Faster (Closer elements) */}
        <div 
          className="parallax-layer-3 absolute inset-0"
          style={{
            transform: `translateY(${mouseY * 60}px)`,
          }}
        >
          <div 
            className="absolute w-[300px] h-[300px] rounded-full blur-[50px] opacity-30 transition-all duration-500"
            style={{
              top: '50%',
              left: '40%',
              background: `radial-gradient(circle, rgb(${activeColor} / 0.6), transparent 50%)`,
              animation: 'parallaxPulse 8s ease-in-out infinite',
            }}
          />
        </div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="floating-shape floating-shape-1" />
          <div className="floating-shape floating-shape-2" />
          <div className="floating-shape floating-shape-3" />
          <div className="floating-shape floating-shape-4" />
        </div>

        {/* Grid overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 landing-grain opacity-[0.08]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {/* Fog Overlay for intro */}
      {shouldIntro && fogVisible && (
        <div
          className={[
            "fixed inset-0 z-40 pointer-events-none transition-opacity duration-700 ease-out",
            fogSoftHide ? "opacity-0" : "opacity-100",
          ].join(" ")}
          style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.6)" }}
        />
      )}

      {/* INTRO OVERLAY */}
      {shouldIntro && (
        <div
          className={[
            "fixed inset-0 z-50 grid place-items-center transition-all duration-700 ease-out",
            phase === "intro" ? "opacity-100" : "opacity-0 pointer-events-none",
          ].join(" ")}
        >
          <div
            className={[
              "text-center transition-all duration-700 ease-out",
              phase === "intro" ? "translate-y-0 scale-100 opacity-100" : "-translate-y-3 scale-[0.98] opacity-0",
            ].join(" ")}
          >
            <div className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Nutzwertanalyse<span className="opacity-40">.</span>
            </div>
            <div className="mt-4 text-base text-white/50">
              Entscheidungen nachvollziehbar begründen
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative min-h-[100svh] flex">
        {/* Dynamic Sidebar - Left */}
        <aside 
          className={[
            "fixed left-0 top-0 h-full z-30 transition-all duration-500 ease-out",
            "w-[280px] lg:w-[320px]",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          ].join(" ")}
        >
          <div className="h-full pt-[52px] flex flex-col bg-black/40 backdrop-blur-2xl border-r border-white/[0.06]">
            {/* Sidebar Header */}
            <div className="px-5 py-6 border-b border-white/[0.06]">
              <button
                onClick={() => router.push("/")}
                className="group flex items-center gap-3"
              >
                <div className="h-11 w-11 rounded-2xl overflow-hidden ring-2 ring-white/10 transition-all duration-300 group-hover:ring-white/20 group-hover:scale-105">
                  <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="text-base font-semibold text-white">
                    {t.brand.name}<span className="text-white/40">{t.brand.domain}</span>
                  </div>
                  <div className="text-[11px] text-white/40">
                    {t.brand.tagline}
                  </div>
                </div>
              </button>
            </div>

            {/* Preset Items */}
            <div className="flex-1 overflow-y-auto py-4 px-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 px-3 mb-3">
                Schnellstart
              </div>
              <div className="space-y-1">
                {PRESET_CONFIG.map((p, index) => {
                  const presetTranslations = t.presets[p.id as keyof typeof t.presets];
                  const isHovered = hoveredPreset === p.id;
                  
                  return (
                    <button
                      key={p.id}
                      onClick={() => startFromPreset(p.id)}
                      onMouseEnter={() => setHoveredPreset(p.id)}
                      onMouseLeave={() => setHoveredPreset(null)}
                      className={[
                        "group w-full flex items-center gap-3 px-3 py-3 rounded-xl",
                        "transition-all duration-300",
                        isHovered 
                          ? "bg-white/[0.08] scale-[1.02]" 
                          : "hover:bg-white/[0.04]",
                      ].join(" ")}
                      style={{
                        animationDelay: `${index * 0.1}s`,
                      }}
                    >
                      <div 
                        className={[
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                          isHovered ? "scale-110" : "",
                        ].join(" ")}
                        style={{
                          background: `rgba(${p.color}, ${isHovered ? 0.25 : 0.15})`,
                          boxShadow: isHovered ? `0 0 20px rgba(${p.color}, 0.3)` : 'none',
                        }}
                      >
                        <p.Icon size={20} className="text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium text-white/90">
                          {presetTranslations.label}
                        </div>
                        <div className="text-[11px] text-white/40">
                          {presetTranslations.hint}
                        </div>
                      </div>
                      <svg 
                        className={[
                          "w-4 h-4 text-white/30 transition-all duration-300",
                          isHovered ? "translate-x-1 text-white/60" : "",
                        ].join(" ")} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="px-5 py-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <button
                  onClick={() => router.push("/login")}
                  className="px-4 py-2 rounded-full text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-4 bottom-4 z-40 h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-[320px] pt-[52px]">
          <div className="min-h-[calc(100svh-52px)] flex flex-col items-center justify-center px-6 py-12">
            
            {/* Analyzing Phase */}
            {phase === "analyzing" && (
              <div className="text-center animate-premium-fade-in-up">
                <div className="relative mx-auto w-20 h-20 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                  <div 
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/60 animate-spin"
                    style={{ animationDuration: "1s" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-white mb-3">
                  Analysiere Ihre Entscheidung...
                </h2>
                <p className="text-sm text-white/40 max-w-md mx-auto">
                  Wir interpretieren Ihre Eingabe und generieren passende Alternativen und Kriterien.
                </p>
                <div className="mt-6 px-5 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] inline-block">
                  <div className="text-sm text-white/60 italic">{`"${text}"`}</div>
                </div>
              </div>
            )}

            {/* Suggestion Phase */}
            {phase === "suggestion" && aiInterpretation && (
              <div className="w-full max-w-4xl animate-premium-fade-in-up">
                {aiError && (
                  <div className="mb-6 px-5 py-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-200 flex items-center gap-3">
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{aiError}</span>
                    <button onClick={() => setAiError(null)} className="ml-auto text-amber-300 hover:text-amber-100 font-medium">OK</button>
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

            {/* Normal Landing Phase - Centered Search */}
            {(phase === "landing" || phase === "intro") && (
              <div className="w-full max-w-2xl text-center">
                {/* Minimal Hero Text */}
                <div className="mb-10 animate-premium-fade-in-up">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                    {t.landing.headline.part1}
                    <br />
                    <span className="text-white/40">{t.landing.headline.part2}</span>
                  </h1>
                  <p className="mt-5 text-base text-white/40 max-w-lg mx-auto">
                    {t.landing.description}
                  </p>
                </div>

                {/* AI Error */}
                {aiError && (
                  <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                    {aiError}
                    <button onClick={() => setAiError(null)} className="ml-2 text-red-200 hover:text-white font-medium">Schliessen</button>
                  </div>
                )}

                {/* Centered Search Input */}
                <div className="animate-premium-fade-in-up stagger-2">
                  <div 
                    className={[
                      "relative rounded-2xl",
                      "bg-white/[0.06] backdrop-blur-2xl",
                      "border transition-all duration-500",
                      isFocused 
                        ? "border-white/20 shadow-[0_0_60px_rgba(255,255,255,0.1)]" 
                        : "border-white/[0.08]",
                      "p-2",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center bg-white/[0.06]">
                        <img src="/images/logo.webp" alt="" className="h-6 w-6 object-contain" />
                      </div>

                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") startFromInput(); }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="flex-1 bg-transparent outline-none text-white text-base placeholder:text-white/30 py-3"
                        placeholder={placeholderText}
                        aria-label={t.landing.searchInputAriaLabel}
                      />

                      <button
                        onClick={startFromInput}
                        disabled={!canStart || isAnalyzing}
                        className={[
                          "shrink-0 rounded-xl px-6 py-3",
                          "text-sm font-semibold",
                          "transition-all duration-300",
                          canStart && !isAnalyzing
                            ? "bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
                            : "bg-white/10 text-white/30 cursor-not-allowed",
                        ].join(" ")}
                      >
                        {isAnalyzing ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : t.landing.startButton}
                      </button>
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="mt-4 text-sm text-white/30 flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    {t.landing.searchHint}
                  </div>
                </div>

                {/* Quick preset pills - mobile only */}
                <div className="mt-8 lg:hidden flex flex-wrap justify-center gap-2 animate-premium-fade-in-up stagger-3">
                  {PRESET_CONFIG.slice(0, 4).map((p) => {
                    const presetTranslations = t.presets[p.id as keyof typeof t.presets];
                    return (
                      <button
                        key={p.id}
                        onClick={() => startFromPreset(p.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 hover:bg-white/[0.1] hover:text-white transition-all duration-300"
                      >
                        <p.Icon size={16} />
                        <span>{presetTranslations.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-16 text-xs text-white/20 animate-premium-fade-in-up stagger-4">
                  <div className="flex flex-wrap justify-center gap-4">
                    <a href="/datenschutz" className="hover:text-white/40 transition-colors">{t.landing.footer.privacy}</a>
                    <span>•</span>
                    <a href="/agb" className="hover:text-white/40 transition-colors">{t.landing.footer.terms}</a>
                    <span>•</span>
                    <a href="/impressum" className="hover:text-white/40 transition-colors">{t.landing.footer.imprint}</a>
                  </div>
                  <div className="mt-3">
                    © {new Date().getFullYear()} Nutzwertanalyse.com
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
