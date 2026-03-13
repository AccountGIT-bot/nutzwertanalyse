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
        {/* Header - Light theme with smooth transition to dark content */}
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
                onClick={() => router.push("/")}
                className="flex items-center gap-3 text-left"
                aria-label="Zur Startseite"
                title="Startseite"
              >
                <div className="h-10 w-10 rounded-2xl overflow-hidden">
                  <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
                </div>
                <div className="leading-tight">
                  <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-800">
                    {t.brand.name}<span className="text-slate-400">{t.brand.domain}</span>
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500">
                    {t.packageSelect.headerSubtitle} • {t.packageSelect.headerSubtitle2}
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

        <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-12">
          <div className="mb-8 sm:mb-10">
            <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-white/45">
              {t.packageSelect.breadcrumb} • B2C • B2B
            </div>

            <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">
              {t.packageSelect.title}
              <span style={{ color: `rgb(var(--accent))` }}>.</span>
            </h1>

            <p className="mt-3 max-w-3xl text-sm sm:text-base text-white/55 leading-relaxed">
              {t.packageSelect.subtitle}
            </p>
            
            {/* Show context: AI interpretation domain takes priority over static preset */}
            {(initialAIInterpretation || initialPreset) && (() => {
              // Use AI interpretation's domain if available, otherwise fall back to preset
              const hasAIContext = initialAIInterpretation?.domain;
              const ContextIcon = hasAIContext 
                ? getDomainIcon(initialAIInterpretation.domain) 
                : getPresetIcon(initialPreset);
              const contextLabel = hasAIContext 
                ? getDomainLabel(initialAIInterpretation.domain) 
                : getPresetLabel(initialPreset);
              const isAIGenerated = !!hasAIContext;
              
              return (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `rgb(var(--accent) / 0.15)`,
                      color: `rgb(var(--accent))`,
                    }}
                  >
                    <ContextIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 flex items-center gap-1.5">
                      {t.packageSelect.applicationArea}
                      {isAIGenerated && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/60">
                          {t.packageSelect.aiDetected}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white font-medium truncate">
                      {contextLabel}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
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
                    "group relative overflow-hidden rounded-3xl text-left",
                    "border border-white/10",
                    "bg-white/5 backdrop-blur-md",
                    "shadow-[0_18px_55px_rgba(0,0,0,0.3)]",
                    "p-6 sm:p-7",
                    "transition duration-300 ease-out",
                    "hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.4)]",
                    "active:translate-y-0",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20",
                  ].join(" ")}
                >
                  {/* Accent glow */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300"
                    style={{
                      background: `radial-gradient(700px 260px at 20% 0%, rgb(${m.accent} / 0.16), transparent 60%)`,
                    }}
                  />

                  <div className="relative">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div
                          className="text-xl sm:text-2xl font-semibold tracking-wide"
                          style={{ color: `rgb(${m.accent})` }}
                        >
                          {m.title}
                        </div>
                        <div className="mt-1 text-sm text-white/55">{m.subtitle}</div>
                      </div>

                      {active && (
                        <div
                          className="h-10 w-10 rounded-2xl grid place-items-center"
                          style={{
                            background: `rgb(${m.accent} / 0.10)`,
                            border: `1px solid rgb(${m.accent} / 0.25)`,
                            color: `rgb(${m.accent})`,
                          }}
                          aria-hidden="true"
                        >
                          ✓
                        </div>
                      )}
                    </div>

                    <ul className="mt-5 space-y-2.5 text-sm text-white/70">
                      {m.features.map((f, i) => (
                        <li key={i} className="flex gap-3">
                          <span
                            className="mt-2 h-1.5 w-1.5 rounded-full"
                            style={{ background: `rgb(${m.accent})` }}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-7">
                      <div
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition group-hover:scale-[1.01]"
                        style={{
                          background: `rgb(${m.accent} / 0.12)`,
                          color: `rgb(${m.accent})`,
                          border: `1px solid rgb(${m.accent} / 0.24)`,
                        }}
                      >
                        {t.packageSelect.startAnalysis}
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            background: `radial-gradient(circle at 30% 30%, rgb(${m.accent}), rgb(${m.accent2}))`,
                          }}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </div>

                  {active && (
                    <div
                      className="absolute inset-0 rounded-3xl pointer-events-none"
                      style={{ boxShadow: `0 0 0 2px rgb(${m.accent} / 0.35)` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-[11px] text-white/45">
            {t.packageSelect.hint}
          </div>
        </section>

        <footer className="pb-6">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <div className="h-px bg-white/10" />
            <div className="pt-3 text-[10px] sm:text-[11px] text-white/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
              <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <a href="/impressum" className="underline underline-offset-2 decoration-white/20">
                  {t.landing.footer.imprint}
                </a>
                <a href="/agb" className="underline underline-offset-2 decoration-white/20">
                  {t.landing.footer.terms}
                </a>
                <a href="/datenschutz" className="underline underline-offset-2 decoration-white/20">
                  {t.landing.footer.privacy}
                </a>
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
        {/* Header - Light theme */}
        <header className="sticky top-0 z-30">
          <div
            className={[
              "transition-all duration-300",
              scrolled
                ? "bg-white/95 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
                : "bg-white/90 backdrop-blur-sm",
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
            <div className="h-px bg-slate-200/60" />
          </div>
        </header>

        <AnalysisWizard />
      </main>
    </AnalysisProvider>
  );
}
