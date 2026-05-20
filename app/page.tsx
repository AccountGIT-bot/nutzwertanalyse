"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
import { 
  Sparkles, 
  FileDown, 
  BarChart3, 
  Users, 
  ArrowRight, 
  CheckCircle2,
  Zap,
  Shield,
  Clock
} from "lucide-react";

type Phase = "landing" | "analyzing" | "suggestion";

// Preset configuration
const PRESET_CONFIG: Array<{
  id: PresetId;
  image: string;
  Icon: typeof SupplierIcon;
  color: string;
}> = [
  { id: "supplier", image: "/images/presets/lieferant.jpg", Icon: SupplierIcon, color: "59, 130, 246" },
  { id: "software", image: "/images/presets/software.jpg", Icon: SoftwareIcon, color: "168, 85, 247" },
  { id: "investment", image: "/images/presets/investition.jpg", Icon: InvestmentIcon, color: "245, 158, 11" },
  { id: "machines", image: "/images/presets/standort.jpg", Icon: MachinesIcon, color: "16, 185, 129" },
  { id: "vehicle", image: "/images/presets/auto.jpg", Icon: VehicleIcon, color: "239, 68, 68" },
  { id: "employee", image: "/images/presets/mitarbeiter.jpg", Icon: EmployeeIcon, color: "6, 182, 212" },
];

// USP Features
const USP_FEATURES = [
  {
    icon: Sparkles,
    title: "KI-gestützte Analyse",
    description: "Intelligente Interpretation Ihrer Entscheidungsfragen mit automatischer Kriterienerstellung.",
    color: "168, 85, 247",
  },
  {
    icon: FileDown,
    title: "Export als PDF & Excel",
    description: "Professionelle Berichte für Präsentationen und Dokumentation.",
    color: "16, 185, 129",
  },
  {
    icon: BarChart3,
    title: "Visuelle Auswertung",
    description: "Übersichtliche Diagramme und Vergleiche für fundierte Entscheidungen.",
    color: "59, 130, 246",
  },
];

// Trust badges
const STATS = [
  { value: "10k+", label: "Analysen erstellt" },
  { value: "98%", label: "Zufriedenheit" },
  { value: "50+", label: "Unternehmen" },
];

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations();
  const [phase, setPhase] = useState<Phase>("landing");
  const [text, setText] = useState("");
  const [interpretation, setInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hoveredPreset, setHoveredPreset] = useState<PresetId | null>(null);

  const getPresetLabel = (id: PresetId) => {
    const labels: Record<PresetId, string> = {
      supplier: "Lieferantenauswahl",
      software: "Softwarevergleich",
      investment: "Investition",
      machines: "Maschinenkauf",
      vehicle: "Fahrzeugauswahl",
      employee: "Mitarbeiterwahl",
      realEstate: "Immobilien",
      product: "Produktvergleich",
      custom: "Eigene Analyse",
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

  // Suggestion Phase
  if (phase === "suggestion" && interpretation) {
    return (
      <div className="min-h-[100svh] bg-[#030712]">
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

  return (
    <div className="min-h-[100svh] bg-[#030712] text-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712] via-[#0a1628] to-[#030712]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-20 px-5 sm:px-8 py-5 border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold">Nutzwertanalyse<span className="text-white/40">.com</span></span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.push("/login")}
              className="hidden sm:block px-4 py-2 text-sm text-white/70 hover:text-white transition"
            >
              Anmelden
            </button>
            <button
              onClick={() => router.push("/app")}
              className="px-4 py-2 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition"
            >
              Kostenlos starten
            </button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-16 sm:pt-24 pb-12 px-5">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>KI-gestützte Entscheidungsfindung</span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Komplexe Entscheidungen
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              einfach analysiert.
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Die professionelle Nutzwertanalyse für Unternehmen. Vergleichen Sie Alternativen systematisch, 
            gewichten Sie Kriterien und treffen Sie fundierte Entscheidungen.
          </p>
          
          {/* Search Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-6">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-20 blur group-hover:opacity-30 transition" />
              <div className="relative flex items-center bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Was möchten Sie vergleichen oder entscheiden?"
                  className="flex-1 px-5 py-4 bg-transparent text-white placeholder:text-white/30 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="m-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2"
                >
                  <span className="hidden sm:inline">Analysieren</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
          
          {/* Quick Examples */}
          <p className="text-sm text-white/40 mb-2">Beispiele:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Welchen CRM anbieter wählen?", "Bester Dienstwagen?", "Neuer Lieferant für Bauteile"].map((example) => (
              <button
                key={example}
                onClick={() => setText(example)}
                className="px-3 py-1.5 text-sm text-white/50 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 hover:text-white/70 transition"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY CARDS ===== */}
      <section className="py-12 px-5">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-sm font-medium text-white/40 uppercase tracking-wider mb-8">
            Oder starten Sie direkt mit einer Vorlage
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {PRESET_CONFIG.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  boxShadow: hoveredPreset === preset.id 
                    ? `0 20px 40px -15px rgb(${preset.color} / 0.3)` 
                    : 'none',
                }}
              >
                {/* Background Image */}
                <img
                  src={preset.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div 
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, rgb(${preset.color} / 0.9) 0%, rgb(${preset.color} / 0.3) 50%, transparent 100%)`,
                  }}
                />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-3 pb-4">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `rgb(${preset.color} / 0.5)` }}
                  >
                    <preset.Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white text-center">
                    {getPresetLabel(preset.id)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT IS IT SECTION ===== */}
      <section className="py-20 px-5 border-t border-white/5">
        <div className="mx-auto max-w-5xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Was ist eine Nutzwertanalyse?
              </h2>
              <p className="text-white/60 text-lg mb-6 leading-relaxed">
                Die Nutzwertanalyse ist eine bewährte Methode zur systematischen Bewertung 
                von Alternativen anhand mehrerer Kriterien. Sie ermöglicht objektive, 
                nachvollziehbare Entscheidungen bei komplexen Fragestellungen.
              </p>
              <ul className="space-y-4">
                {[
                  "Definieren Sie Ihre Bewertungskriterien",
                  "Gewichten Sie nach Wichtigkeit",
                  "Bewerten Sie jede Alternative systematisch",
                  "Erhalten Sie ein klares, fundiertes Ergebnis",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-white/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right: Visual */}
            <div className="relative">
              <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-white/70">Option A</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium text-blue-400">87%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-white/70">Option B</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm font-medium text-purple-400">72%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-white/70">Option C</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-pink-500 rounded-full" />
                      <span className="text-sm font-medium text-pink-400">58%</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-white/50">Empfehlung:</span>
                  <span className="text-sm font-semibold text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Option A
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== USP FEATURES ===== */}
      <section className="py-20 px-5 bg-white/[0.02]">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ihre Vorteile
            </h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Professionelle Entscheidungsfindung mit modernsten Werkzeugen.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {USP_FEATURES.map((feature, i) => (
              <div 
                key={i}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `rgb(${feature.color} / 0.2)` }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: `rgb(${feature.color})` }} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MORE BENEFITS ===== */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-5xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, text: "Sofort einsatzbereit", sub: "Keine Installation" },
              { icon: Shield, text: "DSGVO-konform", sub: "Daten in Deutschland" },
              { icon: Users, text: "Team-fähig", sub: "Kollaboratives Arbeiten" },
              { icon: Clock, text: "Zeit sparen", sub: "Schnelle Ergebnisse" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <div className="font-medium text-sm">{item.text}</div>
                  <div className="text-xs text-white/40">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bereit für bessere Entscheidungen?
          </h2>
          <p className="text-white/60 mb-8">
            Starten Sie jetzt kostenlos und erleben Sie, wie einfach fundierte Entscheidungen sein können.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => router.push("/app")}
              className="px-8 py-3.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2"
            >
              Kostenlos starten
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => inputRef.current?.focus()}
              className="px-8 py-3.5 bg-white/10 text-white font-medium rounded-xl border border-white/20 hover:bg-white/15 transition"
            >
              Mehr erfahren
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 px-5 border-t border-white/5">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="w-3 h-3 text-white" />
            </div>
            <span>© {new Date().getFullYear()} Nutzwertanalyse.com</span>
          </div>
          <div className="flex gap-6">
            <a href="/impressum" className="hover:text-white/70 transition">Impressum</a>
            <a href="/agb" className="hover:text-white/70 transition">AGB</a>
            <a href="/datenschutz" className="hover:text-white/70 transition">Datenschutz</a>
          </div>
        </div>
      </footer>

      {/* Analyzing Overlay */}
      {phase === "analyzing" && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto mb-4" />
            <div className="text-white text-lg font-medium">Analysiere Ihre Anfrage...</div>
          </div>
        </div>
      )}
    </div>
  );
}
