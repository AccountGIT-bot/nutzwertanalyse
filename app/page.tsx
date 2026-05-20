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
import { CategoryBackground } from "@/app/components/CategoryBackgrounds";

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
      supplier: t.presets?.supplier?.label || "Lieferantenauswahl",
      software: t.presets?.software?.label || "Softwarevergleich",
      investment: t.presets?.investment?.label || "Investitionsentscheidung",
      machines: t.presets?.machines?.label || "Maschinenkauf",
      vehicle: t.presets?.vehicle?.label || "Fahrzeugauswahl",
      employee: t.presets?.employee?.label || "Mitarbeiterwahl",
      realEstate: t.presets?.realEstate?.label || "Immobilienbewertung",
      product: t.presets?.product?.label || "Produktvergleich",
      custom: t.presets?.custom?.label || "Eigene Analyse",
    };
    return labels[id] || String(id);
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
          <div className="text-white/50 text-lg">
                {t.landing?.headline?.part1 && t.landing?.headline?.part2 && t.landing?.headline?.part3
                  ? `${t.landing.headline.part1} ${t.landing.headline.part2} ${t.landing.headline.part3}`
                  : "Entscheidungen leicht gemacht"}
              </div>
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
          originalInput={text.trim()}
          onAccept={(acceptedInterpretation) => {
            const params = new URLSearchParams();
            params.set("title", acceptedInterpretation.title || text.trim());
            params.set("package", "standard");
            if (acceptedInterpretation?.domain) params.set("domain", acceptedInterpretation.domain);
            params.set("ai", encodeURIComponent(JSON.stringify(acceptedInterpretation)));
            router.push(`/app?${params.toString()}`);
          }}
          onEdit={(editedInterpretation) => {
            const params = new URLSearchParams();
            params.set("title", editedInterpretation.title || text.trim());
            params.set("package", "standard");
            if (editedInterpretation?.domain) params.set("domain", editedInterpretation.domain);
            params.set("ai", encodeURIComponent(JSON.stringify(editedInterpretation)));
            router.push(`/app?${params.toString()}`);
          }}
          onReject={handleBack}
        />
      </div>
    );
  }

  // Main Landing Page
  return (
    <div className="min-h-[100svh] relative overflow-hidden">
      {/* ===== DYNAMIC BACKGROUND WITH IMAGE & PARTICLES ===== */}
      <div 
        className="fixed inset-0 -z-10 transition-all duration-1000 ease-out"
        style={{ backgroundColor: currentPreset.bgColor }}
      >
        {/* Background Image - higher opacity for visibility */}
        {PRESET_CONFIG.map((preset, idx) => (
          <div
            key={preset.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ 
              opacity: idx === activeIndex ? 0.5 : 0,
              backgroundImage: `url(${preset.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}

        {/* Gradient overlays - lighter for better visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Animated color orbs - Layer 1 (slowest) */}
        <div className="parallax-layer-1 absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-[900px] h-[900px] rounded-full blur-[180px] transition-all duration-1000"
            style={{
              top: '-25%',
              left: '-15%',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.5), transparent 60%)`,
            }}
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-1000"
            style={{
              bottom: '10%',
              right: '5%',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.3), transparent 50%)`,
            }}
          />
        </div>
        
        {/* Layer 2 (medium speed) */}
        <div className="parallax-layer-2 absolute inset-0 pointer-events-none">
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-1000"
            style={{
              bottom: '-20%',
              right: '-10%',
              background: `radial-gradient(circle, rgb(${currentPreset.color} / 0.4), transparent 50%)`,
            }}
          />
        </div>
        
        {/* Layer 3 (fastest) */}
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

        {/* ===== FLOATING PARTICLES ===== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Particle Group 1 - Large slow particles (deterministic values) */}
          {[...Array(8)].map((_, i) => (
            <div
              key={`particle-lg-${i}`}
              className="absolute rounded-full transition-all duration-1000"
              style={{
                width: `${4 + (i * 0.5)}px`,
                height: `${4 + ((i + 2) % 5) * 0.8}px`,
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 3) * 25}%`,
                background: `rgb(${currentPreset.color})`,
                opacity: 0.35 + (i % 4) * 0.08,
                animation: `particleFloat ${15 + i * 3}s ease-in-out infinite`,
                animationDelay: `${i * -2}s`,
              }}
            />
          ))}
          
          {/* Particle Group 2 - Medium particles (deterministic values) */}
          {[...Array(12)].map((_, i) => (
            <div
              key={`particle-md-${i}`}
              className="absolute rounded-full transition-all duration-1000"
              style={{
                width: `${2.5 + (i % 3) * 0.8}px`,
                height: `${2.5 + ((i + 1) % 4) * 0.6}px`,
                left: `${5 + i * 8}%`,
                top: `${20 + (i % 4) * 20}%`,
                background: `rgba(255, 255, 255, ${0.25 + (i % 5) * 0.05})`,
                animation: `particleFloat ${10 + i * 2}s ease-in-out infinite`,
                animationDelay: `${i * -1.5}s`,
              }}
            />
          ))}
          
          {/* Particle Group 3 - Small particles (deterministic values) */}
          {[...Array(20)].map((_, i) => (
            <div
              key={`particle-sm-${i}`}
              className="absolute rounded-full transition-all duration-1000"
              style={{
                width: `${1.5 + (i % 3) * 0.5}px`,
                height: `${1.5 + ((i + 2) % 4) * 0.4}px`,
                left: `${(i * 5) % 100}%`,
                top: `${(i * 7 + 10) % 100}%`,
                background: `rgba(255, 255, 255, ${0.15 + (i % 6) * 0.03})`,
                animation: `particleFloat ${10 + (i % 8) * 2}s ease-in-out infinite`,
                animationDelay: `${(i % 10) * -1}s`,
              }}
            />
          ))}
        </div>

        {/* ===== CATEGORY-SPECIFIC ANIMATED BACKGROUNDS ===== */}
        {PRESET_CONFIG.map((preset, idx) => (
          <div
            key={`cat-bg-${preset.id}`}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: idx === activeIndex ? 1 : 0 }}
          >
            <CategoryBackground
              categoryId={preset.id}
              color={preset.color}
              isActive={idx === activeIndex}
            />
          </div>
        ))}

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 landing-grain opacity-[0.04]" />
        
        {/* Vignette - lighter */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-20 px-5 sm:px-8 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-end">
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.push("/login")}
              className="rounded-full px-6 py-2.5 text-sm font-black tracking-widest uppercase bg-white/10 backdrop-blur-xl text-white border border-white/10 hover:bg-white/20 transition-all duration-300"
            >
              LOGIN
            </button>
          </div>
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100svh-100px)] px-5 pt-0 pb-8">
        
        {/* Centered Brand Title */}
        <div className="text-center mb-8 animate-premium-fade-in-up">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
            Nutzwertanalyse<span className="text-white/40">.com</span>
          </h1>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mb-8 sm:mb-10 animate-premium-fade-in-up stagger-1">
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
                placeholder={t.landing?.searchInputPlaceholder || "Was möchten Sie vergleichen?"}
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
          className="relative w-full max-w-6xl h-[240px] sm:h-[300px] lg:h-[360px] animate-premium-fade-in-up stagger-2"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          ref={carouselRef}
        >
          {/* Navigation Arrows - Dynamic color based on current preset */}
          <button
            onClick={goPrev}
            className="absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-20 group"
            aria-label="Vorheriges Preset"
          >
            <div 
              className="p-3.5 sm:p-4 rounded-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, rgb(${currentPreset.color} / 0.2), rgb(${currentPreset.color} / 0.05))`,
                borderColor: `rgb(${currentPreset.color} / 0.3)`,
                boxShadow: `0 8px 32px rgb(${currentPreset.color} / 0.2), inset 0 0 20px rgb(${currentPreset.color} / 0.1)`,
              }}
            >
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:-translate-x-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ color: `rgb(${currentPreset.color})` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          <button
            onClick={goNext}
            className="absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-20 group"
            aria-label="Naechstes Preset"
          >
            <div 
              className="p-3.5 sm:p-4 rounded-2xl backdrop-blur-2xl border transition-all duration-500 hover:scale-110 active:scale-95"
              style={{
                background: `linear-gradient(135deg, rgb(${currentPreset.color} / 0.2), rgb(${currentPreset.color} / 0.05))`,
                borderColor: `rgb(${currentPreset.color} / 0.3)`,
                boxShadow: `0 8px 32px rgb(${currentPreset.color} / 0.2), inset 0 0 20px rgb(${currentPreset.color} / 0.1)`,
              }}
            >
              <svg 
                className="w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 group-hover:translate-x-0.5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                style={{ color: `rgb(${currentPreset.color})` }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Carousel Items */}
          <div className="relative h-full flex items-center justify-center" style={{ perspective: '1400px' }}>
            {getVisibleItems.map((item) => {
              const isCenter = item.offset === 0;
              const isAdjacent = Math.abs(item.offset) === 1;

              // Responsive translateX values based on screen size via CSS custom properties
              const translateZ = isCenter ? 100 : isAdjacent ? -20 : -100;
              const scale = isCenter ? 1.15 : isAdjacent ? 0.75 : 0.5;
              const opacity = isCenter ? 1 : isAdjacent ? 0.7 : 0.3;
              const rotateY = item.offset * -10;
              // Smaller translateX on mobile for better fit
              const translateX = item.offset * 160;

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
                    "absolute rounded-[24px] sm:rounded-[28px] overflow-hidden",
                    "transition-all ease-out",
                    isCenter 
                      ? "z-30 cursor-pointer w-[160px] sm:w-[220px] lg:w-[280px] h-[200px] sm:h-[260px] lg:h-[320px]" 
                      : "z-10 cursor-pointer w-[120px] sm:w-[160px] lg:w-[220px] h-[160px] sm:h-[200px] lg:h-[260px]",
                  ].join(" ")}
                  style={{
                    transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
                    opacity,
                    transitionDuration: '400ms',
                    transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    willChange: 'transform, opacity',
                    backfaceVisibility: 'hidden',
                    contain: 'layout style paint',
                    boxShadow: isCenter 
                      ? `0 0 0 3px rgb(${item.color} / 0.4), 0 30px 80px -15px rgb(${item.color} / 0.6), 0 0 60px rgb(${item.color} / 0.4)`
                      : `0 15px 40px -10px rgba(0,0,0,0.5)`,
                  }}
                >
                  {/* Background Image - optimized */}
                  <img
                    src={item.image}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ 
                      transform: isCenter ? 'scale(1.02)' : 'scale(1)',
                      transition: 'transform 2s ease-out',
                    }}
                  />

                  {/* Gradient Overlay - Vibrant category color for center, muted for others */}
                  <div 
                    className="absolute inset-0 transition-all duration-700"
                    style={{
                      background: isCenter
                        ? `linear-gradient(to top, rgb(${item.color}) 0%, rgb(${item.color} / 0.7) 35%, rgb(${item.color} / 0.3) 60%, transparent 100%)`
                        : `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgb(${item.color} / 0.15) 50%, transparent 100%)`,
                    }}
                  />
                  
                  {/* Color tint overlay for image */}
                  <div 
                    className="absolute inset-0 mix-blend-overlay transition-opacity duration-700"
                    style={{
                      background: `rgb(${item.color} / ${isCenter ? 0.3 : 0.15})`,
                    }}
                  />

                  {/* ===== PREMIUM LASER GLOW EFFECT FOR CENTER ===== */}
                  {isCenter && (
                    <>
                      {/* Outer glow layer */}
                      <div 
                        className="laser-glow-outer"
                        style={{
                          background: `linear-gradient(135deg, rgb(${item.color} / 0.4), transparent, rgb(${item.color} / 0.4))`,
                          boxShadow: `0 0 40px rgb(${item.color} / 0.5), 0 0 80px rgb(${item.color} / 0.3), 0 0 120px rgb(${item.color} / 0.2)`,
                        }}
                      />
                      
                      {/* Inner intense glow */}
                      <div 
                        className="laser-glow-inner"
                        style={{
                          boxShadow: `inset 0 0 30px rgb(${item.color} / 0.4), 0 0 20px rgb(${item.color} / 0.6)`,
                          border: `2px solid rgb(${item.color} / 0.5)`,
                        }}
                      />
                      
                      {/* Animated corner accents */}
                      <div className="laser-corner laser-corner-tl" style={{ '--laser-color': `rgb(${item.color})` } as React.CSSProperties} />
                      <div className="laser-corner laser-corner-tr" style={{ '--laser-color': `rgb(${item.color})` } as React.CSSProperties} />
                      <div className="laser-corner laser-corner-bl" style={{ '--laser-color': `rgb(${item.color})` } as React.CSSProperties} />
                      <div className="laser-corner laser-corner-br" style={{ '--laser-color': `rgb(${item.color})` } as React.CSSProperties} />
                      
                      {/* Sweeping laser beam */}
                      <div className="absolute inset-0 overflow-hidden rounded-[28px] pointer-events-none">
                        <div 
                          className="laser-beam"
                          style={{ '--laser-color': `rgb(${item.color})` } as React.CSSProperties}
                        />
                      </div>
                    </>
                  )}

                  {/* Content - Better readability */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-4 sm:p-6 z-10">
                    {/* Icon with glow */}
                    <div 
                      className={[
                        "rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-700",
                        isCenter ? "w-14 h-14 sm:w-16 sm:h-16" : "w-10 h-10 sm:w-12 sm:h-12 opacity-60",
                      ].join(" ")}
                      style={{ 
                        background: isCenter 
                          ? `linear-gradient(135deg, rgb(${item.color}), rgb(${item.color} / 0.8))`
                          : 'rgba(255,255,255,0.15)',
                        boxShadow: isCenter 
                          ? `0 12px 40px rgb(${item.color} / 0.6), 0 0 20px rgb(${item.color} / 0.4)`
                          : 'none',
                      }}
                    >
                      <item.Icon className={isCenter ? "w-7 h-7 sm:w-8 sm:h-8 text-white" : "w-5 h-5 sm:w-6 sm:h-6 text-white/80"} />
                    </div>
                    
                    {/* Label with solid background for maximum readability */}
                    <div 
                      className={[
                        "text-center transition-all duration-700",
                        isCenter 
                          ? "px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl backdrop-blur-md" 
                          : "px-2 py-1 rounded-lg opacity-70",
                      ].join(" ")}
                      style={{
                        background: isCenter 
                          ? `linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))`
                          : 'rgba(0,0,0,0.4)',
                        boxShadow: isCenter 
                          ? `0 4px 20px rgba(0,0,0,0.3), inset 0 0 0 1px rgb(${item.color} / 0.3)`
                          : 'none',
                      }}
                    >
                      <span 
                        className={[
                          "font-bold text-white block",
                          isCenter ? "text-base sm:text-lg lg:text-xl" : "text-[10px] sm:text-xs",
                        ].join(" ")}
                        style={{
                          textShadow: `0 1px 2px rgba(0,0,0,0.5)`,
                        }}
                      >
                        {getPresetLabel(item.id)}
                      </span>
                    </div>
                    
                    {/* Call to action for center */}
                    {isCenter && (
                      <div 
                        className="mt-2 sm:mt-3 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-white text-[10px] sm:text-xs font-semibold backdrop-blur-md border transition-all duration-300 hover:scale-105"
                        style={{
                          background: `linear-gradient(135deg, rgb(${item.color} / 0.4), rgb(${item.color} / 0.2))`,
                          borderColor: `rgb(${item.color} / 0.6)`,
                          boxShadow: `0 4px 20px rgb(${item.color} / 0.3), inset 0 0 10px rgb(${item.color} / 0.2)`,
                        }}
                      >
                        Jetzt starten
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dots Indicator - fixed at bottom of carousel */}
        </div>
        
        {/* Dots Navigation - Below carousel with proper spacing */}
        <div className="flex items-center justify-center gap-3 mt-8 animate-premium-fade-in-up stagger-3">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-black/30 backdrop-blur-2xl border border-white/[0.08]">
            {PRESET_CONFIG.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="relative rounded-full transition-all duration-500 hover:scale-110"
                style={{
                  width: idx === activeIndex ? '36px' : '12px',
                  height: '12px',
                  background: idx === activeIndex 
                    ? `rgb(${preset.color})` 
                    : 'rgb(255 255 255 / 0.2)',
                  boxShadow: idx === activeIndex 
                    ? `0 0 24px rgb(${preset.color} / 0.7), 0 0 8px rgb(${preset.color} / 0.5)` 
                    : 'none',
                }}
                aria-label={`Gehe zu ${getPresetLabel(preset.id)}`}
              />
            ))}
          </div>
        </div>

        {/* Quick start text */}
        <div className="mt-6 text-center text-white/30 text-sm">
          Oder wählen Sie eine Vorlage oben
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
            <div className="text-white text-lg font-medium">Analysiere...</div>
          </div>
        </div>
      )}
    </div>
  );
}
