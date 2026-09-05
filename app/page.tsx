"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { removeStoredValue, setStoredValue } from "@/app/lib/client-state";
import { 
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
import { ConsentSettingsButton } from "@/app/components/CookieConsent";
import {
  AlertTriangle,
  FileDown,
  BarChart3,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Clock,
  Brain,
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
    icon: Brain,
    title: "GPT-4 Powered",
    description: "Modernste KI analysiert Ihre Eingabe und generiert automatisch passende Kriterien, Alternativen und Bewertungsrahmen.",
    color: "168, 85, 247",
  },
  {
    icon: FileDown,
    title: "Export als PDF & Excel",
    description: "Professionelle Berichte für Präsentationen, Dokumentation und Entscheidungsvorlagen.",
    color: "16, 185, 129",
  },
  {
    icon: BarChart3,
    title: "Visuelle Auswertung",
    description: "Interaktive Diagramme, Gewichtungsvisualisierung und Sensitivitaetsanalysen.",
    color: "59, 130, 246",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const t = useTranslations();
  const [phase, setPhase] = useState<Phase>("landing");
  const [text, setText] = useState("");
  const [interpretation, setInterpretation] = useState<AIDecisionInterpretation | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }
    const safe = sanitizeInput(trimmed);
    setPhase("analyzing");
    setAiError(null);
    
    try {
      // Call the real AI API
      const response = await fetch("/api/interpret-decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: safe, packageLevel: "advanced" }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "AI request failed");
      }
      
      if (data.interpretation) {
        // Map API response to AIDecisionInterpretation format
        const aiResult: AIDecisionInterpretation = {
          title: data.interpretation.title,
          description: data.interpretation.description,
          domain: data.interpretation.domain,
          alternatives: data.interpretation.alternatives,
          criteria: data.interpretation.criteria,
          constraints: data.interpretation.constraints,
          confidence: data.interpretation.confidence,
        };
          setInterpretation(aiResult);
        setPhase("suggestion");
      } else {
        throw new Error("No interpretation returned");
      }
    } catch (error) {
      console.error("[v0] AI interpretation error:", error);
      // Fallback to local interpretation
      const fallbackResult = interpretDecisionInput(safe);
      setInterpretation(fallbackResult);
      setAiError("KI-Analyse nicht verfügbar – es wird eine lokal erzeugte Struktur verwendet. Sie können alle Vorschläge frei anpassen.");
      setPhase("suggestion");
    }
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
    // /app liest den Kontext aus dem lokalen Speicher – so überlebt er auch
    // einen Reload und verlässt nie den Browser.
    setStoredValue("nwa_preset", presetId);
    removeStoredValue("nwa_aiInterpretation");
    removeStoredValue("nwa_decisionDraft");
    router.push("/app");
  };

  const startAnalysis = (result: AIDecisionInterpretation) => {
    setStoredValue("nwa_aiInterpretation", JSON.stringify(result));
    setStoredValue("nwa_decisionDraft", result.title || text.trim());
    removeStoredValue("nwa_preset");
    router.push("/app");
  };

  // Suggestion Phase
  if (phase === "suggestion" && interpretation) {
    return (
      <div className="min-h-[100svh] bg-[#030712]">
        {aiError && (
          <div className="mx-auto max-w-3xl px-5 pt-5">
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-400/25 bg-amber-400/[0.08] p-3.5 text-sm text-amber-100/85">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{aiError}</span>
            </div>
          </div>
        )}
        <DecisionSuggestion
          interpretation={interpretation}
          originalInput={text.trim()}
          onAccept={startAnalysis}
          onEdit={startAnalysis}
          onReject={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#030712] text-white overflow-x-hidden">
      {/* Dynamic Colorful Gradient Background */}
      <div className="fixed inset-0 -z-10">
        {/* Base dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#030712] via-[#0a0f1a] to-[#030712]" />
        
        {/* Animated color orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-blue-600/30 via-blue-500/20 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[10%] right-[-5%] w-[500px] h-[500px] bg-gradient-to-bl from-purple-600/25 via-purple-500/15 to-transparent rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[500px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/15 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gradient-to-tl from-amber-500/20 via-orange-500/10 to-transparent rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '9s', animationDelay: '0.5s' }} />
        <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-gradient-to-br from-pink-500/15 via-rose-500/10 to-transparent rounded-full blur-[60px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '3s' }} />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        
        {/* Top gradient fade for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* ===== HEADER - Liquid Glass ===== */}
      <header className="relative z-20 px-5 sm:px-8 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] shadow-lg shadow-black/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <BarChart3 className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">Nutzwertanalyse<span className="text-white/30">.com</span></span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => router.push("/login")}
                className="hidden sm:block px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                {t.brand.login}
              </button>
              <button
                onClick={() => router.push("/app")}
                className="px-4 py-2.5 text-sm font-semibold bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all shadow-lg shadow-white/10"
              >
                {t.brand.startFree}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-12 sm:pt-20 pb-8 px-5">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge - Liquid Glass with AI indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] backdrop-blur-xl border border-white/[0.1] text-sm text-white/80 mb-8 shadow-lg shadow-black/5">
            <Brain className="w-4 h-4 text-blue-400" />
            <span>Powered by GPT-4</span>
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse" />
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-white drop-shadow-lg">{t.landing.headline.part1}</span>{" "}
            <span className="text-white drop-shadow-lg">{t.landing.headline.part2}</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
              {t.landing.headline.part3}
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t.landing.description}
          </p>
          
          {/* Search Input - Liquid Glass Style */}
          <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto mb-8">
            <div className="relative group">
              {/* Animated glow border */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-500" />
              
              {/* Glass container */}
              <div className="relative flex items-center bg-white/[0.07] backdrop-blur-2xl rounded-2xl border border-white/[0.15] overflow-hidden shadow-2xl shadow-black/20">
                <input
                  ref={inputRef}
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.landing.searchPlaceholder}
                  aria-label={t.landing.searchInputAriaLabel}
                  className="flex-1 px-6 py-5 bg-transparent text-white text-lg placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!text.trim()}
                  className="m-2.5 px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 flex items-center gap-2"
                >
                  <span className="hidden sm:inline">{t.landing.startButton}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
          
          {/* Quick Examples - Pills */}
          <div className="flex flex-wrap justify-center gap-2">
            {["Welchen CRM Anbieter wählen?", "Bester Dienstwagen?", "Neuer Lieferant für Bauteile"].map((example) => (
              <button
                key={example}
                onClick={() => setText(example)}
                className="px-4 py-2 text-sm text-white/60 bg-white/[0.05] backdrop-blur-sm rounded-full border border-white/[0.1] hover:bg-white/[0.1] hover:text-white hover:border-white/20 transition-all duration-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY CARDS - Liquid Glass with Images ===== */}
      <section className="py-12 px-5">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-sm font-semibold text-white/50 uppercase tracking-widest mb-10">
            {t.landing.orChooseTemplate}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {PRESET_CONFIG.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset.id)}
                onMouseEnter={() => setHoveredPreset(preset.id)}
                onMouseLeave={() => setHoveredPreset(null)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.03]"
                style={{
                  boxShadow: hoveredPreset === preset.id 
                    ? `0 25px 50px -12px rgb(${preset.color} / 0.5), 0 0 0 1px rgb(${preset.color} / 0.3), inset 0 1px 0 rgba(255,255,255,0.1)` 
                    : '0 10px 40px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                {/* Background Image */}
                <Image
                  src={preset.image}
                  alt={getPresetLabel(preset.id)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Color Gradient Overlay matching preset color */}
                <div 
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(to top, rgb(${preset.color}) 0%, rgb(${preset.color} / 0.7) 30%, rgb(${preset.color} / 0.2) 60%, transparent 100%)`,
                    opacity: hoveredPreset === preset.id ? 0.95 : 0.85,
                  }}
                />
                
                {/* Liquid Glass overlay on hover */}
                <div 
                  className="absolute inset-0 backdrop-blur-[2px] transition-opacity duration-500"
                  style={{ opacity: hoveredPreset === preset.id ? 0.3 : 0 }}
                />
                
                {/* Inner glow border */}
                <div 
                  className="absolute inset-0 rounded-2xl transition-opacity duration-500"
                  style={{
                    boxShadow: `inset 0 0 30px rgb(${preset.color} / 0.3)`,
                    opacity: hoveredPreset === preset.id ? 1 : 0,
                  }}
                />
                
                {/* Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-4 pb-5">
                  {/* Icon with glass effect */}
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 backdrop-blur-md border border-white/20 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                    style={{ 
                      background: `rgba(255,255,255,0.15)`,
                      boxShadow: hoveredPreset === preset.id ? `0 8px 32px rgb(${preset.color} / 0.4)` : 'none',
                    }}
                  >
                    <preset.Icon className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <span className="text-sm font-bold text-white text-center drop-shadow-lg tracking-wide">
                    {getPresetLabel(preset.id)}
                  </span>
                </div>
                
                {/* Shine effect on hover */}
                <div 
                  className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
                    opacity: hoveredPreset === preset.id ? 1 : 0,
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHAT IS IT SECTION - Liquid Glass ===== */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 mb-6">
                <BarChart3 className="w-4 h-4" />
                <span>Methodik</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
                Was ist eine <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Nutzwertanalyse</span>?
              </h2>
              <p className="text-white/60 text-lg mb-8 leading-relaxed">
                Die Nutzwertanalyse ist eine bewaehrte Methode zur systematischen Bewertung 
                von Alternativen anhand mehrerer Kriterien. Sie ermoeglicht objektive, 
                nachvollziehbare Entscheidungen bei komplexen Fragestellungen.
              </p>
              <ul className="space-y-4">
                {[
                  { text: "Definieren Sie Ihre Bewertungskriterien", color: "blue" },
                  { text: "Gewichten Sie nach Wichtigkeit", color: "purple" },
                  { text: "Bewerten Sie jede Alternative systematisch", color: "pink" },
                  { text: "Erhalten Sie ein klares, fundiertes Ergebnis", color: "emerald" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 group">
                    <div className={`w-8 h-8 rounded-lg bg-${item.color}-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <CheckCircle2 className={`w-4 h-4 text-${item.color}-400`} />
                    </div>
                    <span className="text-white/80 pt-1">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right: Visual - Liquid Glass Card */}
            <div className="relative">
              {/* Glow effect behind */}
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-pink-500/20 rounded-3xl blur-2xl" />
              
              {/* Glass card */}
              <div className="relative bg-white/[0.03] backdrop-blur-2xl rounded-3xl border border-white/[0.1] p-6 shadow-2xl shadow-black/20">
                {/* Window controls */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/30" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg shadow-yellow-500/30" />
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/30" />
                  <span className="ml-3 text-xs text-white/30 font-mono">Ergebnis-Vorschau</span>
                </div>
                
                {/* Results visualization */}
                <div className="space-y-4">
                  {[
                    { name: "Option A", score: 87, color: "from-blue-500 to-cyan-500" },
                    { name: "Option B", score: 72, color: "from-purple-500 to-pink-500" },
                    { name: "Option C", score: 58, color: "from-amber-500 to-orange-500" },
                  ].map((option, i) => (
                    <div key={i} className="group p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-white/80">{option.name}</span>
                        <span className={`text-sm font-bold bg-gradient-to-r ${option.color} bg-clip-text text-transparent`}>{option.score}%</span>
                      </div>
                      <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${option.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${option.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Recommendation */}
                <div className="mt-5 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                  <span className="text-sm text-white/40">Empfehlung:</span>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">Option A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== USP FEATURES - Liquid Glass Cards ===== */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ihre <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Vorteile</span>
            </h2>
            <p className="text-white/50 max-w-2xl mx-auto text-lg">
              Professionelle Entscheidungsfindung mit modernsten Werkzeugen.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {USP_FEATURES.map((feature, i) => (
              <div 
                key={i}
                className="group relative p-8 rounded-3xl transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 30px 60px -15px rgb(${feature.color} / 0.3), 0 0 0 1px rgb(${feature.color} / 0.2)`;
                  e.currentTarget.style.borderColor = `rgb(${feature.color} / 0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {/* Gradient glow on hover */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                  style={{ background: `radial-gradient(circle at 50% 0%, rgb(${feature.color} / 0.15) 0%, transparent 70%)` }}
                />
                
                {/* Icon */}
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ 
                    background: `rgb(${feature.color} / 0.15)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                >
                  <feature.icon className="w-7 h-7" style={{ color: `rgb(${feature.color})` }} />
                </div>
                
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== MORE BENEFITS - Compact Glass Pills ===== */}
      <section className="py-16 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, text: "Sofort einsatzbereit", sub: "Keine Installation", color: "245, 158, 11" },
              { icon: Shield, text: "DSGVO-konform", sub: "Daten in Deutschland", color: "16, 185, 129" },
              { icon: Users, text: "Team-faehig", sub: "Kollaboratives Arbeiten", color: "59, 130, 246" },
              { icon: Clock, text: "Zeit sparen", sub: "Schnelle Ergebnisse", color: "168, 85, 247" },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `rgb(${item.color} / 0.15)` }}
                >
                  <item.icon className="w-5 h-5" style={{ color: `rgb(${item.color})` }} />
                </div>
                <div>
                  <div className="font-semibold text-white">{item.text}</div>
                  <div className="text-sm text-white/40">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION - Liquid Glass ===== */}
      <section className="py-20 px-5">
        <div className="mx-auto max-w-4xl">
          {/* Glass card */}
          <div className="relative p-10 sm:p-14 rounded-3xl text-center overflow-hidden">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20" />
            <div className="absolute inset-0 backdrop-blur-3xl" />
            <div className="absolute inset-0 border border-white/[0.1] rounded-3xl" />
            
            {/* Floating orbs */}
            <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
                Bereit für <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">bessere Entscheidungen</span>?
              </h2>
              <p className="text-white/60 mb-10 text-lg max-w-xl mx-auto">
                Starten Sie jetzt kostenlos und erleben Sie, wie einfach fundierte Entscheidungen sein können.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => router.push("/app")}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] flex items-center gap-3"
                >
                  <span className="text-lg">{t.brand.startFree}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => {
                    const el = document.querySelector('section:nth-of-type(3)');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-8 py-4 bg-white/[0.05] backdrop-blur-xl text-white font-semibold rounded-2xl border border-white/[0.15] hover:bg-white/[0.1] hover:border-white/[0.25] transition-all duration-300"
                >
                  {t.brand.learnMore}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER - Clean Glass ===== */}
      <footer className="py-10 px-5 border-t border-white/[0.05]">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-white/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium">&copy; {new Date().getFullYear()} Nutzwertanalyse.com</span>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <a href="/rechtliches" className="hover:text-white/70 transition-colors">
                {t.landing.footer.legal}
              </a>
              <a href="/impressum" className="hover:text-white/70 transition-colors">
                {t.landing.footer.imprint}
              </a>
              <a href="/datenschutz" className="hover:text-white/70 transition-colors">
                {t.landing.footer.privacy}
              </a>
              <a href="/cookies" className="hover:text-white/70 transition-colors">
                Cookies
              </a>
              <a href="/agb" className="hover:text-white/70 transition-colors">
                {t.landing.footer.terms}
              </a>
              <ConsentSettingsButton className="hover:text-white/70 transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      {/* Analyzing Overlay - Premium Glass with AI branding */}
      {phase === "analyzing" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-2xl flex items-center justify-center">
          <div className="text-center p-10 rounded-3xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-xl max-w-md">
            {/* AI Brain Icon with animated rings */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-white/10" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-purple-500 animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-pink-500 border-l-cyan-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
              </div>
            </div>
            
            <div className="text-white text-xl font-semibold mb-2">GPT-4 analysiert Ihre Anfrage</div>
            <div className="text-white/50 text-sm mb-4">Generiere Kriterien und Alternativen...</div>
            
            {/* Animated progress indicators */}
            <div className="flex justify-center gap-2">
              {["Verstehen", "Strukturieren", "Optimieren"].map((step, i) => (
                <div 
                  key={step}
                  className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
