"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AnalysisProvider } from "@/app/lib/nwa/analysis-context";
import { AnalysisWizard } from "@/app/components/nwa/AnalysisWizard";
import type { PackageLevel, AIDecisionInterpretation } from "@/app/lib/nwa/types";
import { getPresetIcon, getPresetLabel, getDomainIcon, getDomainLabel } from "@/app/lib/nwa/preset-icons";
import { useTranslations } from "@/app/lib/i18n";
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
  set(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silent fail for localStorage errors (quota, private browsing)
    }
  },
  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {
      // Silent fail
    }
  },
};

function getSavedTheme(): Theme {
  const saved = safeLocalStorage.get("nwa_theme");
  return (saved === "basic" || saved === "advanced" || saved === "business") ? saved : "basic";
}

function getSavedDecision(): string {
  return safeLocalStorage.get("nwa_decisionDraft") || "";
}

function getSavedPreset(): string | undefined {
  return safeLocalStorage.get("nwa_preset") || undefined;
}

function getSavedAIInterpretation(): AIDecisionInterpretation | undefined {
  const saved = safeLocalStorage.get("nwa_aiInterpretation");
  if (!saved) return undefined;
  try {
    return JSON.parse(saved);
  } catch {
    return undefined;
  }
}

export default function AppPage() {
  const router = useRouter();
  const t = useTranslations();
  const [scrolled, setScrolled] = useState(false);
  const [phase, setPhase] = useState<"select" | "analysis">("select");
  const [selectedTheme, setSelectedTheme] = useState<Theme>("basic");
  const [initialDecision, setInitialDecision] = useState("");
  const [initialPreset, setInitialPreset] = useState<string | undefined>();
  const [initialAIInterpretation, setInitialAIInterpretation] = useState<AIDecisionInterpretation | undefined>();

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
    const saved = getSavedTheme();
    setSelectedTheme(saved);
    document.documentElement.dataset.theme = saved;
    
    const decision = getSavedDecision();
    const preset = getSavedPreset();
    const aiInterpretation = getSavedAIInterpretation();
    setInitialDecision(decision);
    setInitialPreset(preset);
    setInitialAIInterpretation(aiInterpretation);
    
    // Note: Even if coming from landing with a decision/preset,
    // we always start with package selection so the user can
    // consciously choose the intensity level (Basic/Advanced/Business).
    // The preset only determines the use case context, not the package level.
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
    document.documentElement.dataset.theme = selectedTheme;
  }

  function choose(theme: Theme) {
    setSelectedTheme(theme);
    safeLocalStorage.set("nwa_theme", theme);
    safeLocalStorage.set("nwa_packageLevel", theme);
    document.documentElement.dataset.theme = theme;
    setPhase("analysis");
  }

  // Package selection screen
  if (phase === "select") {
    return (
      <main className="min-h-[100svh] text-white">
        {/* Premium Header */}
        <header className="sticky top-0 z-30">
          <div
            className={[
              "transition-all duration-500 relative",
              scrolled
                ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
                : "bg-white",
            ].join(" ")}
          >
            <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[64px] sm:h-[72px] flex items-center justify-between">
              <button
                onClick={() => router.push("/")}
                className="group flex items-center gap-3 text-left"
                aria-label="Zur Startseite"
                title="Startseite"
              >
                <div className="h-10 w-10 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/[0.04] transition-transform duration-300 group-hover:scale-105">
                  <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-800">
                    {t.brand.name}<span className="text-slate-400">{t.brand.domain}</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    {t.packageSelect.headerSubtitle} • {t.packageSelect.headerSubtitle2}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => router.push("/")}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
                  title={t.wizard?.goHome || "Zur Startseite"}
                  aria-label={t.wizard?.goHome || "Zur Startseite"}
                >
                  <Home size={18} />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className={[
                    "rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold",
                    "bg-slate-900 text-white",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.1)]",
                    "hover:bg-slate-800 hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
                    "active:scale-[0.98]",
                    "transition-all duration-200",
                  ].join(" ")}
                >
                  {t.packageSelect.login}
                </button>
              </div>
            </div>
            {/* Premium gradient fade */}
            <div className="absolute left-0 right-0 top-full h-12 bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-5 sm:px-6 py-8 sm:py-12">
          <div className="mb-8 sm:mb-10 animate-premium-fade-in-up">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm mb-4">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs tracking-[0.15em] uppercase text-white/50 font-medium">
                {t.packageSelect.breadcrumb} • B2C • B2B
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight leading-[1.1]">
              {t.packageSelect.title}
              <span style={{ color: `rgb(var(--accent))` }}>.</span>
            </h1>

            <p className="mt-4 max-w-3xl text-sm sm:text-base text-white/50 leading-relaxed">
              {t.packageSelect.subtitle}
            </p>
            
            {/* Premium context card */}
            {(initialAIInterpretation || initialPreset) && (() => {
              const hasAIContext = initialAIInterpretation?.domain;
              const ContextIcon = hasAIContext 
                ? getDomainIcon(initialAIInterpretation.domain) 
                : getPresetIcon(initialPreset);
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
                    <ContextIcon size={20} />
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
            {MODELS.map((m, index) => {
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
                    active ? "ring-2 ring-offset-2 ring-offset-transparent" : "",
                  ].join(" ")}
                  style={active ? { 
                    ringColor: `rgb(${m.accent})`,
                    boxShadow: `0 0 40px rgb(${m.accent} / 0.15), 0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)` 
                  } : {}}
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

        <footer className="relative pb-6">
          {/* Gradient fade from content to footer */}
          <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-b from-transparent via-white/20 to-white/60 pointer-events-none" />
          <div className="relative bg-white/60 backdrop-blur-sm pt-4 rounded-t-3xl mx-4 sm:mx-6">
            <div className="mx-auto max-w-6xl px-5 sm:px-6">
              <div className="h-px bg-slate-200/60" />
              <div className="pt-3 pb-2 text-[10px] sm:text-[11px] text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  <a href="/impressum" className="underline underline-offset-2 decoration-slate-300 hover:text-slate-700 transition">
                    {t.landing.footer.imprint}
                  </a>
                  <a href="/agb" className="underline underline-offset-2 decoration-slate-300 hover:text-slate-700 transition">
                    {t.landing.footer.terms}
                  </a>
                  <a href="/datenschutz" className="underline underline-offset-2 decoration-slate-300 hover:text-slate-700 transition">
                    {t.landing.footer.privacy}
                  </a>
                </div>
              </div>
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
      <main className="min-h-[100svh] text-white">
        {/* Header - Light theme with smooth transition */}
        <header className="sticky top-0 z-30">
          <div
            className={[
              "transition-all duration-300 relative",
              scrolled
                ? "bg-white shadow-[0_4px_30px_rgba(0,0,0,0.15)]"
                : "bg-white",
            ].join(" ")}
          >
            <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
              <button
                onClick={() => {
                  // Clear stored decision and go back to selection
                  safeLocalStorage.remove("nwa_decisionDraft");
                  safeLocalStorage.remove("nwa_preset");
                  setInitialDecision("");
                  setInitialPreset(undefined);
                  setPhase("select");
                }}
                className="flex items-center gap-3 text-left"
                aria-label={t.packageSelect.backToSelection}
                title={t.packageSelect.backToSelection}
              >
                <div className="h-10 w-10 rounded-2xl overflow-hidden">
                  <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-800">
                    {t.brand.name}<span className="text-slate-400">{t.brand.domain}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500">
                    {t.packageSelect.backToSelection}
                  </div>
                </div>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push("/")}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                  title={t.wizard?.goHome || "Zur Startseite"}
                  aria-label={t.wizard?.goHome || "Zur Startseite"}
                >
                  <Home size={18} />
                </button>
                <button
                  onClick={() => router.push("/login")}
                  className="rounded-full px-4 py-2 text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition shadow-sm"
                >
                  {t.packageSelect.login}
                </button>
              </div>
            </div>
            {/* Gradient fade from white to transparent for smooth transition */}
            <div className="absolute left-0 right-0 top-full h-8 bg-gradient-to-b from-white/80 via-white/40 to-transparent pointer-events-none" />
          </div>
        </header>

        <AnalysisWizard />
      </main>
    </AnalysisProvider>
  );
}
