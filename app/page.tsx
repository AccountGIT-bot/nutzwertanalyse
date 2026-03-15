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

// Preset configuration with custom images
const PRESET_CONFIG: Array<{
  id: PresetId;
  image: string;
  Icon: typeof SupplierIcon;
  color: string;
  bgColor: string;
}> = [
  {
    id: "supplier",
    image: "/images/presets/lieferant.jpg",
    Icon: SupplierIcon,
    color: "59, 130, 246",
    bgColor: "#1e3a5f",
  },
  {
    id: "software",
    image: "/images/presets/software.jpg",
    Icon: SoftwareIcon,
    color: "168, 85, 247",
    bgColor: "#2d1b4e",
  },
  {
    id: "investment",
    image: "/images/presets/investition.jpg",
    Icon: InvestmentIcon,
    color: "245, 158, 11",
    bgColor: "#3d2a0a",
  },
  {
    id: "machines",
    image: "/images/presets/standort.jpg",
    Icon: MachinesIcon,
    color: "16, 185, 129",
    bgColor: "#0d3325",
  },
  {
    id: "vehicle",
    image: "/images/presets/auto.jpg",
    Icon: VehicleIcon,
    color: "239, 68, 68",
    bgColor: "#3d1515",
  },
  {
    id: "employee",
    image: "/images/presets/mitarbeiter.jpg",
    Icon: EmployeeIcon,
    color: "6, 182, 212",
    bgColor: "#0c3544",
  },
  {
    id: "realEstate",
    image: "/images/presets/immobilien.jpg",
    Icon: SupplierIcon,
    color: "234, 179, 8",
    bgColor: "#3a2f0c",
  },
  {
    id: "product",
    image: "/images/presets/produkt.jpg",
    Icon: SoftwareIcon,
    color: "236, 72, 153",
    bgColor: "#3d1530",
  },
];

const INTRO_COOLDOWN_MS = 10 * 60 * 1000;
const INTRO_KEY = "nwa_intro_lastShownAt";
const AUTO_ROTATE_INTERVAL = 4000;

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
  const [interpretation, setInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Infinite carousel state
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Get current preset
  const currentPreset = PRESET_CONFIG[activeIndex];

  useEffect(() => {
    setIsClient(true);
    const intro = shouldShowIntroNow();
    setShouldIntro(intro);
    if (intro) {
      setPhase("intro");
      markIntroShownNow();
    }
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    if (phase !== "landing" || isPaused) return;

    autoRotateRef.current = setInterval(() => {
      setIsTransitioning(true);
      setActiveIndex((prev) => (prev + 1) % PRESET_CONFIG.length);
      setTimeout(() => setIsTransitioning(false), 600);
    }, AUTO_ROTATE_INTERVAL);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [phase, isPaused]);

  // Navigate carousel
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [isTransitioning]);

  const goNext = useCallback(() => {
    goToSlide((activeIndex + 1) % PRESET_CONFIG.length);
  }, [activeIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((activeIndex - 1 + PRESET_CONFIG.length) % PRESET_CONFIG.length);
  }, [activeIndex, goToSlide]);

  // Get visible items for carousel (5 items: -2, -1, center, +1, +2)
  const getVisibleItems = useMemo(() => {
    const items = [];
    for (let i = -2; i <= 2; i++) {
      const index = (activeIndex + i + PRESET_CONFIG.length) % PRESET_CONFIG.length;
      items.push({
        ...PRESET_CONFIG[index],
        offset: i,
        realIndex: index,
      });
    }
    return items;
  }, [activeIndex]);

  const getPresetLabel = (id: PresetId) => {
    const labels: Record<PresetId, string> = {
      supplier: t.presets?.supplier || "Lieferantenauswahl",
      software: t.presets?.software || "Softwarevergleich",
      investment: t.presets?.investment || "Investitionsentscheidung",
      machines: t.presets?.machines || "Maschinenkauf",
      vehicle: t.presets?.vehicle || "Fahrzeugauswahl",
      employee: t.presets?.employee || "Mitarbeiterwahl",
      realEstate: t.presets?.realEstate || "Immobilienbewertung",
      product: t.presets?.product || "Produktvergleich",
    };
    return labels[id] || id;
  };

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    const safe = sanitizeInput(trimmed);
    setPhase("analyzing");
    requestAnimationFrame(() => {
      const result = interpretDecisionInput(safe);
      setInterpretation(result);
      setPhase("suggestion");
    });
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleBack = () => {
    setPhase("landing");
    setInterpretation(null);
    setText("");
  };

  const handlePresetClick = (presetId: PresetId) => {
    router.push(`/app?preset=${presetId}`);
  };

  // Intro Animation Phase
  if (phase === "intro") {
    return (
      <div className="min-h-[100svh] relative overflow-hidden bg-black flex items-center justify-center">
        <div className="text-center animate-premium-fade-in-up">
          <div className="text-4xl sm:text-6xl font-bold text-white mb-4">
            {t.brand?.name || "Nutzwertanalyse"}
            <span className="text-white/40">.com</span>
          </div>
          <div className="text-white/50 text-lg">{t.landing?.headline || "Entscheidungen leicht gemacht"}</div>
        </div>
        <button
          onClick={() => setPhase("landing")}
          className="absolute bottom-10 text-white/30 text-sm hover:text-white/60 transition"
        >
          Weiter
        </button>
      </div>
    );
  }

  // Suggestion Phase
  if (phase === "suggestion" && interpretation) {
    return (
      <div className="min-h-[100svh] bg-[#0a0a0b]">
        <DecisionSuggestion
          interpretation={interpretation}
          onBack={handleBack}
          onProceed={(level) => {
            const params = new URLSearchParams();
            params.set("title", text.trim());
            params.set("package", level);
            if (interpretation?.domain) params.set("domain", interpretation.domain);
            params.set("ai", encodeURIComponent(JSON.stringify(interpretation)));
            router.push(`/app?${params.toString()}`);
          }}
        />
      </div>
    );
  }

  // Main Landing Page
  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      {/* ===== DYNAMIC BACKGROUND WITH IMAGE ===== */}
      <div 
        className="fixed inset-0 -z-10 transition-all duration-1000 ease-out"
        style={{ backgroundColor: currentPreset.bgColor }}
      >
        {/* Background Image */}
        {PRESET_CONFIG.map((preset, idx) => (
          <div
            key={preset.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ 
              opacity: idx === activeIndex ? 0.4 : 0,
              backgroundImage: `url(${preset.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Animated color orbs */}
        <div className="parallax-layer-1 absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-[800px] h-[800px] rounded-full blur-[150px] transition-all duration-1000"
            style={{
              top: '-20%',
              left: '-10%',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.6), transparent 60%)`,
            }}
          />
        </div>
        <div className="parallax-layer-2 absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000"
            style={{
              bottom: '-15%',
              right: '-5%',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.4), transparent 50%)`,
            }}
          />
        </div>
        <div className="parallax-layer-3 absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-[400px] h-[400px] rounded-full blur-[80px] transition-all duration-1000"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.3), transparent 40%)`,
            }}
          />
        </div>

        {/* Noise texture */}
        <div className="absolute inset-0 landing-grain opacity-[0.04]" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-20 px-5 sm:px-8 py-5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl overflow-hidden ring-2 ring-white/10">
              <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-semibold text-white">
                {t.brand?.name || "Nutzwertanalyse"}<span className="text-white/30">.com</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.push("/login")}
              className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white/10 backdrop-blur-xl text-white border border-white/10 hover:bg-white/20 transition-all duration-300"
            >
              {t.packageSelect?.login || "Anmelden"}
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100svh-160px)] px-5">
        
        {/* Headline */}
        <div className="text-center mb-8 animate-premium-fade-in-up">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-3">
            {t.landing?.headline || "Entscheidungen leicht gemacht"}
          </h1>
          <p className="text-white/40 text-base sm:text-lg max-w-xl mx-auto">
            {t.landing?.subheadline || "Systematisch vergleichen, fundiert entscheiden"}
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-12 animate-premium-fade-in-up stagger-1">
          <div 
            className="relative group"
            style={{
              boxShadow: `0 0 80px rgb(${currentPreset.color} / 0.2), 0 25px 50px -12px rgba(0, 0, 0, 0.5)`,
            }}
          >
            <div 
              className="absolute -inset-1 rounded-3xl opacity-50 blur-xl transition-all duration-500"
              style={{ background: `rgb(${currentPreset.color} / 0.3)` }}
            />
            <div className="relative bg-white/[0.08] backdrop-blur-2xl rounded-2xl border border-white/[0.12] overflow-hidden">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.landing?.inputPlaceholder || "Was möchten Sie vergleichen?"}
                className="w-full px-6 py-5 bg-transparent text-white text-lg placeholder:text-white/30 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!text.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all duration-300 disabled:opacity-30"
                style={{ 
                  background: text.trim() ? `rgb(${currentPreset.color})` : 'rgb(255 255 255 / 0.1)',
                }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </form>

        {/* ===== INFINITE 3D CAROUSEL ===== */}
        <div 
          className="relative w-full max-w-6xl h-[280px] sm:h-[320px] animate-premium-fade-in-up stagger-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={carouselRef}
        >
          {/* Navigation Arrows */}
          <button
            onClick={goPrev}
            className="absolute left-0 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white/60 hover:text-white hover:bg-black/60 transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Carousel Items */}
          <div className="relative h-full flex items-center justify-center perspective-[1200px]">
            {getVisibleItems.map((item) => {
              const isCenter = item.offset === 0;
              const isAdjacent = Math.abs(item.offset) === 1;
              const isEdge = Math.abs(item.offset) === 2;

              // Calculate transform based on position
              let translateX = item.offset * 180;
              let translateZ = isCenter ? 100 : isAdjacent ? 0 : -100;
              let scale = isCenter ? 1.15 : isAdjacent ? 0.85 : 0.65;
              let opacity = isCenter ? 1 : isAdjacent ? 0.7 : 0.4;
              let rotateY = item.offset * -8;

              return (
                <button
                  key={`${item.id}-${item.offset}`}
                  onClick={() => {
                    if (isCenter) {
                      handlePresetClick(item.id);
                    } else {
                      goToSlide(item.realIndex);
                    }
                  }}
                  className={[
                    "absolute w-[200px] sm:w-[240px] h-[240px] sm:h-[280px] rounded-3xl overflow-hidden",
                    "transition-all duration-600 ease-out",
                    isCenter ? "z-30 cursor-pointer" : "z-10 cursor-pointer",
                  ].join(" ")}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    boxShadow: isCenter 
                      ? `0 25px 80px -10px rgb(${item.color} / 0.5), 0 0 60px rgb(${item.color} / 0.3), inset 0 0 80px rgb(${item.color} / 0.1)`
                      : `0 15px 40px -10px rgba(0,0,0,0.4)`,
                  }}
                >
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500"
                    style={{ 
                      backgroundImage: `url(${item.image})`,
                      transform: isCenter ? 'scale(1.05)' : 'scale(1)',
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div 
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: isCenter
                        ? `linear-gradient(to top, rgb(${item.color} / 0.9) 0%, rgb(${item.color} / 0.4) 50%, transparent 100%)`
                        : 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%)',
                    }}
                  />

                  {/* Glow border for center */}
                  {isCenter && (
                    <div 
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{
                        boxShadow: `inset 0 0 0 2px rgb(${item.color} / 0.5), inset 0 0 40px rgb(${item.color} / 0.2)`,
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-6">
                    <div 
                      className={[
                        "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500",
                        isCenter ? "scale-110" : "scale-90 opacity-70",
                      ].join(" ")}
                      style={{ 
                        background: isCenter ? `rgb(${item.color})` : 'rgba(255,255,255,0.1)',
                        boxShadow: isCenter ? `0 8px 30px rgb(${item.color} / 0.5)` : 'none',
                      }}
                    >
                      <item.Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className={[
                      "text-white font-semibold text-center transition-all duration-500",
                      isCenter ? "text-lg" : "text-sm opacity-70",
                    ].join(" ")}>
                      {getPresetLabel(item.id)}
                    </div>
                    {isCenter && (
                      <div className="mt-2 text-white/50 text-xs">
                        Klicken zum Starten
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dots Indicator */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {PRESET_CONFIG.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={[
                  "rounded-full transition-all duration-300",
                  idx === activeIndex 
                    ? "w-8 h-2" 
                    : "w-2 h-2 hover:bg-white/40",
                ].join(" ")}
                style={{
                  background: idx === activeIndex 
                    ? `rgb(${currentPreset.color})` 
                    : 'rgb(255 255 255 / 0.2)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Quick start text */}
        <div className="mt-10 text-center text-white/30 text-sm animate-premium-fade-in-up stagger-3">
          {t.landing?.quickStart || "Oder wählen Sie eine Vorlage oben"}
        </div>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 py-6 px-5">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/25">
          <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
          <div className="flex gap-4">
            <a href="/impressum" className="hover:text-white/50 transition">{t.landing?.footer?.imprint || "Impressum"}</a>
            <a href="/agb" className="hover:text-white/50 transition">{t.landing?.footer?.terms || "AGB"}</a>
            <a href="/datenschutz" className="hover:text-white/50 transition">{t.landing?.footer?.privacy || "Datenschutz"}</a>
          </div>
        </div>
      </footer>

      {/* Analyzing Overlay */}
      {phase === "analyzing" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-4"
              style={{ borderColor: `rgb(${currentPreset.color})`, borderTopColor: 'transparent' }}
            />
            <div className="text-white text-lg font-medium">{t.landing?.analyzing || "Analysiere..."}</div>
          </div>
        </div>
      )}
    </div>
  );
}
