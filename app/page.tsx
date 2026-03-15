"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  gradient: string;
}> = [
  {
    id: "supplier",
    image: "/presets/Startseite_Lieferantenauswahl_komprimiert.jpg",
    Icon: SupplierIcon,
    color: "59, 130, 246",
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
  },
  {
    id: "software",
    image: "/presets/Startseite_Softwarevergleich_komprimiert.jpg",
    Icon: SoftwareIcon,
    color: "168, 85, 247",
    gradient: "from-purple-600 via-violet-500 to-fuchsia-400",
  },
  {
    id: "investment",
    image: "/presets/Startseite_Investitionsentscheid_komprimiert.jpg",
    Icon: InvestmentIcon,
    color: "245, 158, 11",
    gradient: "from-amber-500 via-orange-500 to-yellow-400",
  },
  {
    id: "machines",
    image: "/presets/Startseite_Maschinenkauf_komprimiert.jpg",
    Icon: MachinesIcon,
    color: "16, 185, 129",
    gradient: "from-emerald-600 via-green-500 to-teal-400",
  },
  {
    id: "vehicle",
    image: "/presets/Startseite_Fahrzeugauswahl_komprimiert.jpg",
    Icon: VehicleIcon,
    color: "239, 68, 68",
    gradient: "from-red-600 via-rose-500 to-pink-400",
  },
  {
    id: "employee",
    image: "/presets/Startseite_Mitarbeiterwahl_komprimiert.jpg",
    Icon: EmployeeIcon,
    color: "6, 182, 212",
    gradient: "from-cyan-500 via-sky-500 to-blue-400",
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInterpretation, setAiInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Carousel state
  const [activeIndex, setActiveIndex] = useState(Math.floor(PRESET_CONFIG.length / 2));
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const canStart = useMemo(() => text.trim().length > 0, [text]);
  const placeholderText = t.landing.searchInputPlaceholder;

  // Get active preset color
  const activePreset = PRESET_CONFIG[activeIndex];
  const activeColor = activePreset?.color || "59, 130, 246";
  const activeGradient = activePreset?.gradient || "from-blue-600 to-cyan-400";

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

  // Carousel navigation
  const goToSlide = (index: number) => {
    if (index < 0) index = PRESET_CONFIG.length - 1;
    if (index >= PRESET_CONFIG.length) index = 0;
    setActiveIndex(index);
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        goToSlide(activeIndex - 1);
      } else {
        goToSlide(activeIndex + 1);
      }
    }
    setTranslateX(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== "landing") return;
      if (e.key === "ArrowLeft") goToSlide(activeIndex - 1);
      if (e.key === "ArrowRight") goToSlide(activeIndex + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, phase]);

  return (
    <main className="relative min-h-[100svh] overflow-hidden">
      {/* Construction Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{t.constructionBanner.text}</span>
        </div>
      </div>
      
      {/* ===== DYNAMIC FULLSCREEN BACKGROUND ===== */}
      <div className="fixed inset-0 -z-10 overflow-hidden transition-all duration-1000">
        {/* Base - Deep dark */}
        <div className="absolute inset-0 bg-[#050508]" />
        
        {/* Active preset background image with blur */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: 0.15 }}
        >
          <img 
            src={activePreset?.image} 
            alt="" 
            className="w-full h-full object-cover scale-110 blur-xl"
          />
        </div>
        
        {/* Intense color layers - Layer 1 (Slowest, largest) */}
        <div className="parallax-layer-1 absolute inset-0">
          <div 
            className="absolute w-[1000px] h-[1000px] rounded-full blur-[150px] transition-all duration-1000"
            style={{
              top: '-20%',
              left: '-10%',
              background: `radial-gradient(circle, rgb(${activeColor}), transparent 60%)`,
              opacity: 0.4,
            }}
          />
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-1000"
            style={{
              bottom: '-30%',
              right: '-15%',
              background: `radial-gradient(circle, rgb(${activeColor} / 0.8), transparent 50%)`,
              opacity: 0.3,
              animation: 'parallaxFloat1 35s ease-in-out infinite',
            }}
          />
        </div>

        {/* Layer 2 (Medium) */}
        <div className="parallax-layer-2 absolute inset-0">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-700"
            style={{
              top: '20%',
              right: '10%',
              background: `radial-gradient(circle, rgb(${activeColor}), transparent 50%)`,
              opacity: 0.5,
              animation: 'parallaxFloat2 25s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[80px] transition-all duration-700"
            style={{
              bottom: '10%',
              left: '20%',
              background: `radial-gradient(circle, rgb(${activeColor} / 0.9), transparent 50%)`,
              opacity: 0.35,
              animation: 'parallaxFloat3 20s ease-in-out infinite',
            }}
          />
        </div>

        {/* Layer 3 (Fastest, closest) */}
        <div className="parallax-layer-3 absolute inset-0">
          <div 
            className="absolute w-[400px] h-[400px] rounded-full blur-[60px] transition-all duration-500"
            style={{
              top: '40%',
              left: '35%',
              background: `radial-gradient(circle, rgb(${activeColor}), transparent 40%)`,
              opacity: 0.6,
              animation: 'parallaxPulse 6s ease-in-out infinite',
            }}
          />
        </div>

        {/* Light streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-[2px] h-[300px] blur-[2px] transition-all duration-1000"
            style={{
              top: '10%',
              left: '25%',
              background: `linear-gradient(to bottom, transparent, rgb(${activeColor}), transparent)`,
              opacity: 0.3,
              transform: 'rotate(15deg)',
              animation: 'parallaxDrift1 20s ease-in-out infinite',
            }}
          />
          <div 
            className="absolute w-[2px] h-[400px] blur-[3px] transition-all duration-1000"
            style={{
              top: '5%',
              right: '30%',
              background: `linear-gradient(to bottom, transparent, rgb(${activeColor}), transparent)`,
              opacity: 0.25,
              transform: 'rotate(-10deg)',
              animation: 'parallaxDrift2 25s ease-in-out infinite',
            }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full transition-all duration-1000"
              style={{
                width: `${3 + Math.random() * 4}px`,
                height: `${3 + Math.random() * 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                background: `rgb(${activeColor})`,
                opacity: 0.3 + Math.random() * 0.3,
                animation: `floatShape${(i % 4) + 1} ${15 + Math.random() * 10}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Noise */}
        <div className="absolute inset-0 landing-grain opacity-[0.06]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* Fog Overlay for intro */}
      {shouldIntro && fogVisible && (
        <div
          className={[
            "fixed inset-0 z-40 pointer-events-none transition-opacity duration-700 ease-out",
            fogSoftHide ? "opacity-0" : "opacity-100",
          ].join(" ")}
          style={{ backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.7)" }}
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
      <div className="relative min-h-[100svh] flex flex-col pt-[52px]">
        {/* Header */}
        <header className="fixed top-[40px] left-0 right-0 z-30 px-5">
          <div className="mx-auto max-w-6xl flex items-center justify-between py-4">
            <button
              onClick={() => router.push("/")}
              className="group flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-white/10 transition-all duration-300 group-hover:ring-white/20">
                <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-semibold text-white">
                  {t.brand.name}<span className="text-white/40">{t.brand.domain}</span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => router.push("/login")}
                className="px-5 py-2.5 rounded-full text-sm font-semibold bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 transition-all duration-300"
              >
                Login
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
          
          {/* Analyzing Phase */}
          {phase === "analyzing" && (
            <div className="text-center animate-premium-fade-in-up">
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                <div 
                  className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                  style={{ 
                    borderTopColor: `rgb(${activeColor})`,
                    animationDuration: "1s" 
                  }}
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

          {/* Normal Landing Phase */}
          {(phase === "landing" || phase === "intro") && (
            <div className="w-full flex flex-col items-center">
              {/* Minimal Hero */}
              <div className="text-center mb-8 animate-premium-fade-in-up">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.1]">
                  {t.landing.headline.part1}
                  <br />
                  <span className="text-white/30">{t.landing.headline.part2}</span>
                </h1>
                <p className="mt-4 text-sm sm:text-base text-white/40 max-w-md mx-auto">
                  {t.landing.description}
                </p>
              </div>

              {/* Centered Search */}
              <div className="w-full max-w-xl mb-12 animate-premium-fade-in-up stagger-1">
                <div 
                  className={[
                    "relative rounded-2xl",
                    "bg-white/[0.06] backdrop-blur-2xl",
                    "border transition-all duration-500",
                    isFocused 
                      ? "border-white/20 shadow-[0_0_80px_rgba(255,255,255,0.1)]" 
                      : "border-white/[0.08]",
                    "p-2",
                  ].join(" ")}
                  style={isFocused ? {
                    boxShadow: `0 0 60px rgb(${activeColor} / 0.2)`
                  } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-500"
                      style={{
                        background: `rgba(${activeColor}, 0.15)`,
                      }}
                    >
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
                          ? "bg-white text-black hover:scale-[1.02] active:scale-[0.98]"
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
              </div>

              {/* ===== 3D CAROUSEL ===== */}
              <div className="w-full max-w-5xl animate-premium-fade-in-up stagger-2">
                <div className="text-center mb-6">
                  <div className="text-xs uppercase tracking-[0.2em] text-white/30 font-medium">
                    {t.landing.quickTemplates || "Schnellstart-Vorlagen"}
                  </div>
                </div>

                <div 
                  ref={carouselRef}
                  className="relative h-[220px] sm:h-[260px] perspective-[1200px] select-none"
                  onMouseDown={handleDragStart}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={handleDragStart}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {/* Navigation Arrows */}
                  <button
                    onClick={() => goToSlide(activeIndex - 1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => goToSlide(activeIndex + 1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Carousel Items */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {PRESET_CONFIG.map((preset, index) => {
                      const presetTranslations = t.presets[preset.id as keyof typeof t.presets];
                      const offset = index - activeIndex;
                      const absOffset = Math.abs(offset);
                      
                      // Calculate 3D transforms
                      const translateXVal = offset * 180 + translateX * 0.3;
                      const scale = absOffset === 0 ? 1 : absOffset === 1 ? 0.75 : 0.55;
                      const opacity = absOffset > 2 ? 0 : absOffset === 0 ? 1 : absOffset === 1 ? 0.6 : 0.3;
                      const zIndex = 10 - absOffset;
                      const rotateY = offset * -15;
                      
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            if (absOffset === 0) {
                              startFromPreset(preset.id);
                            } else {
                              goToSlide(index);
                            }
                          }}
                          className={[
                            "absolute transition-all duration-500 ease-out",
                            "rounded-2xl overflow-hidden",
                            absOffset === 0 ? "cursor-pointer" : "cursor-pointer",
                          ].join(" ")}
                          style={{
                            width: absOffset === 0 ? '280px' : '200px',
                            height: absOffset === 0 ? '180px' : '140px',
                            transform: `translateX(${translateXVal}px) scale(${scale}) rotateY(${rotateY}deg)`,
                            opacity,
                            zIndex,
                            transformStyle: 'preserve-3d',
                          }}
                        >
                          {/* Card background image */}
                          <div className="absolute inset-0">
                            <img 
                              src={preset.image} 
                              alt="" 
                              className="w-full h-full object-cover"
                            />
                            <div 
                              className="absolute inset-0 transition-all duration-500"
                              style={{
                                background: absOffset === 0 
                                  ? `linear-gradient(135deg, rgb(${preset.color} / 0.7), rgb(${preset.color} / 0.3))`
                                  : `linear-gradient(135deg, rgb(${preset.color} / 0.85), rgb(${preset.color} / 0.6))`,
                              }}
                            />
                          </div>
                          
                          {/* Card content */}
                          <div className="relative h-full flex flex-col items-center justify-center p-5 text-white">
                            <div 
                              className={[
                                "rounded-2xl flex items-center justify-center mb-3 transition-all duration-300",
                                absOffset === 0 ? "h-14 w-14" : "h-10 w-10",
                              ].join(" ")}
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(8px)',
                              }}
                            >
                              <preset.Icon size={absOffset === 0 ? 28 : 20} />
                            </div>
                            <div className={[
                              "font-bold text-center transition-all duration-300",
                              absOffset === 0 ? "text-lg" : "text-sm",
                            ].join(" ")}>
                              {presetTranslations.label}
                            </div>
                            {absOffset === 0 && (
                              <div className="text-xs text-white/70 mt-1 text-center max-w-[200px]">
                                {presetTranslations.hint}
                              </div>
                            )}
                          </div>

                          {/* Glow for active */}
                          {absOffset === 0 && (
                            <div 
                              className="absolute -inset-1 rounded-2xl opacity-50 -z-10 blur-xl"
                              style={{
                                background: `rgb(${preset.color})`,
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dots indicator */}
                <div className="flex justify-center gap-2 mt-6">
                  {PRESET_CONFIG.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={[
                        "rounded-full transition-all duration-300",
                        index === activeIndex 
                          ? "w-8 h-2" 
                          : "w-2 h-2 hover:bg-white/40",
                      ].join(" ")}
                      style={{
                        background: index === activeIndex 
                          ? `rgb(${activeColor})` 
                          : 'rgba(255,255,255,0.2)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-16 text-xs text-white/20 text-center animate-premium-fade-in-up stagger-3">
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/datenschutz" className="hover:text-white/40 transition-colors">{t.landing.footer.privacy}</a>
                  <span>·</span>
                  <a href="/agb" className="hover:text-white/40 transition-colors">{t.landing.footer.terms}</a>
                  <span>·</span>
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
    </main>
  );
}
