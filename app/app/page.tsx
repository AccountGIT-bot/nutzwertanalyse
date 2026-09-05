"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProvider } from "@/app/lib/nwa/analysis-context";
import { AnalysisWizard } from "@/app/components/nwa/AnalysisWizard";
import type { PackageLevel, AIDecisionInterpretation } from "@/app/lib/nwa/types";
import { renderPresetIcon, getPresetLabel, renderDomainIcon, getDomainLabel } from "@/app/lib/nwa/preset-icons";
import { useTranslations } from "@/app/lib/i18n";
import { useStoredValue, setStoredValue, removeStoredValue } from "@/app/lib/client-state";
import { LegalLinks } from "@/app/components/LegalLinks";
import { Home } from "lucide-react";

type Theme = "basic" | "advanced" | "business";

const MODEL_ACCENTS = {
  basic: { accent: "37 99 235", accent2: "59 130 246" },
  advanced: { accent: "16 185 129", accent2: "45 212 191" },
  business: { accent: "245 158 11", accent2: "168 85 247" },
};

// Safe localStorage access with SSR guards
const safeLocalStorage = {
  get(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: setStoredValue,
  remove: removeStoredValue,
};





export default function AppPage() {
  const router = useRouter();
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [phase, setPhase] = useState<"select" | "analysis">("select");
  const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);
  const [chosenTheme, setChosenTheme] = useState<Theme | null>(null);

  // Gespeicherte Werte hydrationssicher lesen (serverseitig `null`).
  const storedTheme = useStoredValue("nwa_theme");
  const storedDecision = useStoredValue("nwa_decisionDraft");
  const storedPreset = useStoredValue("nwa_preset");
  const storedInterpretation = useStoredValue("nwa_aiInterpretation");

  const selectedTheme: Theme =
    chosenTheme ??
    (storedTheme === "basic" || storedTheme === "advanced" || storedTheme === "business"
      ? storedTheme
      : "basic");
  const initialDecision = storedDecision ?? "";
  const initialPreset = storedPreset ?? undefined;
  const initialAIInterpretation = useMemo<AIDecisionInterpretation | undefined>(() => {
    if (!storedInterpretation) return undefined;
    try {
      return JSON.parse(storedInterpretation) as AIDecisionInterpretation;
    } catch {
      return undefined;
    }
  }, [storedInterpretation]);

  // Dynamic models with translations
  const MODELS = useMemo(() => [
    {
      id: "basic" as Theme,
      title: t.packageSelect.basic.title,
      subtitle: t.packageSelect.basic.subtitle,
      ...MODEL_ACCENTS.basic,
      features: t.packageSelect.basic.features,
    },
    {
      id: "advanced" as Theme,
      title: t.packageSelect.advanced.title,
      subtitle: t.packageSelect.advanced.subtitle,
      ...MODEL_ACCENTS.advanced,
      features: t.packageSelect.advanced.features,
    },
    {
      id: "business" as Theme,
      title: t.packageSelect.business.title,
      subtitle: t.packageSelect.business.subtitle,
      ...MODEL_ACCENTS.business,
      features: t.packageSelect.business.features,
    },
  ], [t]);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Das Theme wird als Effekt an das DOM gespiegelt – der Render bleibt frei
  // von Seiteneffekten.
  useEffect(() => {
    document.documentElement.dataset.theme = previewTheme ?? selectedTheme;
  }, [previewTheme, selectedTheme]);

  function preview(theme: Theme) {
    setPreviewTheme(theme);
  }

  function restore() {
    setPreviewTheme(null);
  }

  function choose(theme: Theme) {
    setChosenTheme(theme);
    setPreviewTheme(null);
    safeLocalStorage.set("nwa_theme", theme);
    safeLocalStorage.set("nwa_packageLevel", theme);
    setPhase("analysis");
  }

  // Package selection screen
  if (phase === "select") {
    return (
      <main id="main" className="min-h-[100svh] text-white relative overflow-hidden">
        {/* ===== 3D PARALLAX BACKGROUND ===== */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111827] to-[#0f172a]" />
          
          {/* Parallax Layer 1 - Slowest */}
          <div className="parallax-layer-1 absolute inset-0">
            <div 
              className="absolute w-[700px] h-[700px] rounded-full blur-[100px] opacity-20"
              style={{
                top: '5%',
                left: '5%',
                background: `radial-gradient(circle, rgb(var(--accent) / 0.5), transparent 70%)`,
              }}
            />
            <div 
              className="absolute w-[500px] h-[500px] rounded-full blur-[80px] opacity-15"
              style={{
                bottom: '10%',
                right: '10%',
                background: `radial-gradient(circle, rgb(var(--accent-2) / 0.4), transparent 70%)`,
              }}
            />
          </div>

          {/* Parallax Layer 2 - Medium */}
          <div className="parallax-layer-2 absolute inset-0">
            <div 
              className="absolute w-[400px] h-[400px] rounded-full blur-[60px] opacity-25"
              style={{
                top: '40%',
                right: '20%',
                background: `radial-gradient(circle, rgb(var(--accent) / 0.6), transparent 60%)`,
              }}
            />
          </div>

          {/* Parallax Layer 3 - Fastest */}
          <div className="parallax-layer-3 absolute inset-0">
            <div 
              className="absolute w-[250px] h-[250px] rounded-full blur-[40px] opacity-30"
              style={{
                top: '60%',
                left: '30%',
                background: `radial-gradient(circle, rgb(var(--glow) / 0.5), transparent 50%)`,
              }}
            />
          </div>

          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }} />

          {/* Floating shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="floating-shape floating-shape-1" />
            <div className="floating-shape floating-shape-2" />
            <div className="floating-shape floating-shape-3" />
          </div>

          {/* Floating Particles - deterministic values to avoid hydration mismatch */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(15)].map((_, i) => (
              <div
                key={`particle-${i}`}
                className="absolute rounded-full"
                style={{
                  width: `${2 + (i % 4) * 1}px`,
                  height: `${2 + ((i + 2) % 4) * 1}px`,
                  left: `${(i * 7) % 100}%`,
                  top: `${(i * 11 + 5) % 100}%`,
                  background: `rgba(255, 255, 255, ${0.1 + (i % 5) * 0.04})`,
                  animation: `particleFloat ${12 + (i % 5) * 2}s ease-in-out infinite`,
                  animationDelay: `${(i % 8) * -2}s`,
                }}
              />
            ))}
          </div>

          {/* Noise & Vignette */}
          <div className="absolute inset-0 landing-grain opacity-[0.06]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />
        </div>

        {/* Premium Header */}
        <header className="sticky top-0 z-30">
          <div
            className={[
              "transition-all duration-500 relative",
              scrolled
                ? "bg-black/60 backdrop-blur-2xl border-b border-white/[0.06]"
                : "bg-transparent",
            ].join(" ")}
          >
            <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="text-xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity"
                aria-label="Zur Startseite"
              >
                {t.brand.name}<span className="text-white/30">.com</span>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="p-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                  title={t.wizard?.goHome || "Zur Startseite"}
                  aria-label={t.wizard?.goHome || "Zur Startseite"}
                >
                  <Home size={18} />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className={[
                    "rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold",
                    "bg-white text-black",
                    "shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
                    "hover:bg-white/90 hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    "transition-all duration-200",
                  ].join(" ")}
                >
                  {t.packageSelect.login}
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="relative mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-16">
          <div className="mb-10 sm:mb-12 animate-premium-fade-in-up">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl mb-5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-white/40 font-medium">
                {t.packageSelect.breadcrumb} • B2C • B2B
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              {t.packageSelect.title}
              <span style={{ color: `rgb(var(--accent))` }}>.</span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm sm:text-base text-white/50 leading-relaxed">
              {t.packageSelect.subtitle}
            </p>
            
            {/* Premium context card */}
            {(initialAIInterpretation || initialPreset) && (() => {
              const hasAIContext = initialAIInterpretation?.domain;
              const contextIcon = hasAIContext
                ? renderDomainIcon(initialAIInterpretation.domain, { size: 20 })
                : renderPresetIcon(initialPreset, { size: 20 });
              const contextLabel = hasAIContext 
                ? getDomainLabel(initialAIInterpretation.domain) 
                : getPresetLabel(initialPreset);
              const isAIGenerated = !!hasAIContext;
              
              return (
                <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl px-4 py-3 transition-all duration-300 hover:bg-white/[0.06]">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-300 hover:scale-110"
                    style={{
                      background: `rgb(var(--accent) / 0.12)`,
                      color: `rgb(var(--accent))`,
                      boxShadow: `0 0 20px rgb(var(--accent) / 0.1)`,
                    }}
                  >
                    {contextIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/45 flex items-center gap-2">
                      {t.packageSelect.applicationArea}
                      {isAIGenerated && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.08] text-white/50 font-medium">
                          {t.packageSelect.aiDetected}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white font-medium truncate mt-0.5">
                      {contextLabel}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid gap-5 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {MODELS.map((m) => {
              const active = selectedTheme === m.id;

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
                    "group relative overflow-hidden rounded-3xl text-left card-shine",
                    "border border-white/[0.08]",
                    "bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)]",
                    "p-6 sm:p-7",
                    "transition-all duration-500",
                    "hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]",
                    "hover:border-white/[0.12]",
                    "active:translate-y-0 active:scale-[0.99]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                    active ? `ring-2 ring-offset-2 ring-offset-transparent` : "",
                  ].join(" ")}
                  style={active ? { 
                    '--tw-ring-color': `rgb(${m.accent})`,
                    boxShadow: `0 0 40px rgb(${m.accent} / 0.15), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)` 
                  } as React.CSSProperties : {}}
                >
                  {/* Premium accent glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(600px 200px at 30% 0%, rgb(${m.accent} / 0.15), transparent 70%)`,
                    }}
                  />
                  
                  {/* Subtle inner border glow */}
                  <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
                    style={{
                      boxShadow: `inset 0 0 30px rgb(${m.accent} / 0.05)`,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Package level badge */}
                        <div className="mb-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase"
                          style={{
                            background: `rgb(${m.accent} / 0.1)`,
                            color: `rgb(${m.accent})`,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${m.accent})` }} />
                          {m.id === 'basic' ? 'Starter' : m.id === 'advanced' ? 'Professional' : 'Enterprise'}
                        </div>
                        
                        <div
                          className="text-2xl sm:text-3xl font-bold tracking-tight"
                          style={{ color: `rgb(${m.accent})` }}
                        >
                          {m.title}
                        </div>
                        <div className="mt-1.5 text-sm text-white/50">{m.subtitle}</div>
                      </div>

                      {active && (
                        <div
                          className="h-10 w-10 rounded-2xl grid place-items-center flex-shrink-0 transition-transform duration-300 animate-premium-scale-in"
                          style={{
                            background: `rgb(${m.accent} / 0.15)`,
                            border: `1px solid rgb(${m.accent} / 0.3)`,
                            color: `rgb(${m.accent})`,
                            boxShadow: `0 0 20px rgb(${m.accent} / 0.2)`,
                          }}
                          aria-hidden="true"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3 text-sm text-white/65">
                      {m.features.map((f, i) => (
                        <li key={i} className="flex gap-3 items-start">
                          <span
                            className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 transition-transform duration-300 group-hover:scale-125"
                            style={{ background: `rgb(${m.accent})`, boxShadow: `0 0 6px rgb(${m.accent} / 0.5)` }}
                          />
                          <span className="leading-relaxed">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8">
                      <div
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 group-hover:scale-[1.02]"
                        style={{
                          background: `rgb(${m.accent} / 0.12)`,
                          color: `rgb(${m.accent})`,
                          border: `1px solid rgb(${m.accent} / 0.2)`,
                        }}
                      >
                        <span>{t.packageSelect.startAnalysis}</span>
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Active ring */}
                  {active && (
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{ boxShadow: `0 0 0 2px rgb(${m.accent} / 0.4), 0 0 30px rgb(${m.accent} / 0.1)` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-10 text-xs text-white/40 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.packageSelect.hint}
          </div>
        </section>

        <footer className="relative py-8 mt-8">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="h-px bg-white/[0.06]" />
            <div className="pt-4 text-[10px] sm:text-[11px] text-white/30 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
              <LegalLinks linkClassName="hover:text-white/60 transition" />
            </div>
          </div>
        </footer>
      </main>
    );
  }

  // Analysis wizard with provider
  return (
    <AnalysisProvider
      initialPackageLevel={selectedTheme as PackageLevel}
      initialDecision={initialDecision}
      initialPreset={initialPreset}
      initialAIInterpretation={initialAIInterpretation}
    >
      <main id="main" className="min-h-[100svh] text-white">
        <AnalysisWizard
          onBackToPackages={() => {
            // Kontext der Startseite verwerfen und zurück zur Paketauswahl.
            safeLocalStorage.remove("nwa_decisionDraft");
            safeLocalStorage.remove("nwa_preset");
            safeLocalStorage.remove("nwa_aiInterpretation");
            setPhase("select");
          }}
        />
      </main>
    </AnalysisProvider>
  );
}
