"use client";

import { useState, useEffect } from "react";
import type { AIDecisionInterpretation } from "@/app/lib/nwa/types";
import { getDomainIcon, getDomainLabel } from "@/app/lib/nwa/preset-icons";

interface DecisionSuggestionProps {
  interpretation: AIDecisionInterpretation;
  originalInput: string;
  onAccept: (interpretation: AIDecisionInterpretation) => void;
  onEdit: (interpretation: AIDecisionInterpretation) => void;
  onReject: () => void;
}

// Helper to capitalize first letter of each word
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function DecisionSuggestion({
  interpretation,
  originalInput,
  onAccept,
  onEdit,
  onReject,
}: DecisionSuggestionProps) {
  const [editedTitle, setEditedTitle] = useState(interpretation.title);
  const [editedDescription, setEditedDescription] = useState(interpretation.description || "");
  const [editedAlternatives, setEditedAlternatives] = useState(
    interpretation.alternatives.map(a => ({ ...a, name: capitalizeFirst(a.name) }))
  );
  const [editedCriteria, setEditedCriteria] = useState(
    interpretation.criteria.map(c => ({ ...c }))
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  
  const DomainIcon = getDomainIcon(interpretation.domain);
  const domainLabel = getDomainLabel(interpretation.domain);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const updateAlternative = (index: number, name: string) => {
    const updated = [...editedAlternatives];
    updated[index] = { ...updated[index], name: capitalizeFirst(name) };
    setEditedAlternatives(updated);
  };

  const addAlternative = () => {
    if (editedAlternatives.length < 6) {
      setEditedAlternatives([...editedAlternatives, { name: `Option ${editedAlternatives.length + 1}`, description: null }]);
    }
  };

  const removeAlternative = (index: number) => {
    if (editedAlternatives.length > 2) {
      setEditedAlternatives(editedAlternatives.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, name: string) => {
    const updated = [...editedCriteria];
    updated[index] = { ...updated[index], name };
    setEditedCriteria(updated);
  };

  const addCriterion = () => {
    if (editedCriteria.length < 10) {
      setEditedCriteria([...editedCriteria, { name: "", description: "", categoryId: "other" as const }]);
    }
  };

  const removeCriterion = (index: number) => {
    if (editedCriteria.length > 2) {
      setEditedCriteria(editedCriteria.filter((_, i) => i !== index));
    }
  };

  const enterDetailedMode = () => {
    setIsDetailedMode(true);
    setIsEditing(true);
    setCriteriaOpen(true);
  };

  const handleAccept = () => {
    const updated: AIDecisionInterpretation = {
      ...interpretation,
      title: editedTitle,
      description: editedDescription || interpretation.description,
      alternatives: editedAlternatives,
      criteria: editedCriteria.filter(c => c.name.trim() !== ""),
    };
    onAccept(updated);
  };

  const handleDetailedAccept = () => {
    const updated: AIDecisionInterpretation = {
      ...interpretation,
      title: editedTitle,
      description: editedDescription || interpretation.description,
      alternatives: editedAlternatives,
      criteria: editedCriteria.filter(c => c.name.trim() !== ""),
    };
    onEdit(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0b] via-[#0d1117] to-[#0a0a0b] relative overflow-hidden">
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-pulse"
            style={{
              width: `${3 + i % 3}px`,
              height: `${3 + i % 3}px`,
              left: `${10 + i * 12}%`,
              top: `${15 + (i % 4) * 20}%`,
              background: 'rgba(255, 255, 255, 0.15)',
              animationDuration: `${3 + i}s`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
        
        {/* Noise overlay */}
        <div className="absolute inset-0 landing-grain opacity-[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Success Badge - Cinematic */}
        <div 
          className={`flex items-center justify-center gap-2 mb-8 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse" style={{ animationDuration: '2s' }}>
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-emerald-400">Analyse abgeschlossen</span>
          </div>
        </div>

        {/* Domain Header - Glass Morphism Dark */}
        <div 
          className={`relative mb-6 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative flex items-center gap-4 p-5 rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] shadow-2xl">
            {/* Glow effect behind icon */}
            <div className="absolute left-5 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 blur-2xl" />
            
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-lg">
                <DomainIcon size={26} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold text-white">{domainLabel}</div>
              <div className="text-sm text-white/50">Basierend auf Ihrer Eingabe</div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/[0.05] border border-white/[0.08]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-white/60">Bereit</span>
            </div>
          </div>
        </div>

      {/* Original Input Quote - Dark */}
        <div 
          className={`mb-6 transition-all duration-700 delay-150 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="relative px-5 py-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="absolute top-3 left-3 text-white/20 text-2xl font-serif">&ldquo;</div>
            <p className="text-sm text-white/60 italic pl-4 pr-2 line-clamp-2">{originalInput}</p>
          </div>
        </div>

        {/* Main Card with Premium Dark Styling */}
        <div 
          className={`relative transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {/* Cinematic glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-br from-white/5 via-transparent to-white/5 rounded-3xl blur-2xl" />
          
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Title Section - Dark */}
            <div className="p-5 sm:p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Titel der Entscheidung
                </label>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Bearbeiten
                  </button>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full text-xl sm:text-2xl font-bold text-white bg-transparent border-b-2 border-white/20 focus:border-white/40 outline-none pb-2 transition-colors placeholder:text-white/30"
                  placeholder="Titel eingeben..."
                  autoFocus
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
                  {editedTitle}
                </h2>
              )}

            {/* Description - only in detailed mode - Dark */}
              {isDetailedMode && (
                <div className="mt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Beschreibung (optional)
                  </label>
                  <textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 text-sm text-white/80 bg-white/[0.03] rounded-xl border border-white/[0.08] focus:border-white/20 focus:bg-white/[0.05] outline-none transition-all resize-none placeholder:text-white/30"
                    placeholder="Kurze Beschreibung der Entscheidungssituation..."
                  />
                </div>
              )}
            </div>

          {/* Alternatives Section - Dark */}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Alternativen zum Vergleich
                </label>
                <span className="px-2.5 py-0.5 text-xs font-semibold text-white/60 bg-white/[0.08] rounded-full">
                  {editedAlternatives.length}
                </span>
              </div>
              
              <div className="space-y-2.5">
                {editedAlternatives.map((alt, index) => (
                  <div 
                    key={index} 
                    className={`group flex items-center gap-3 transition-all duration-500 ${
                      mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                    }`}
                    style={{ transitionDelay: `${300 + index * 80}ms` }}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="h-9 w-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-all">
                        <span className="text-sm font-bold text-white/50">{index + 1}</span>
                      </div>
                    </div>
                    {isEditing ? (
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          type="text"
                          value={alt.name}
                          onChange={(e) => updateAlternative(index, e.target.value)}
                          className="flex-1 px-4 py-2.5 text-sm font-medium text-white/90 bg-white/[0.03] rounded-xl border border-white/[0.08] focus:border-white/20 outline-none transition-all placeholder:text-white/30"
                          placeholder={`Alternative ${index + 1}...`}
                        />
                        {editedAlternatives.length > 2 && (
                          <button
                            onClick={() => removeAlternative(index)}
                            className="p-2 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Entfernen"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 px-4 py-2.5 text-sm font-medium text-white/70 bg-white/[0.02] rounded-xl border border-white/[0.06] group-hover:border-white/10 transition-all">
                        {alt.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && editedAlternatives.length < 6 && (
                <button
                  onClick={addAlternative}
                  className="mt-4 w-full py-3 text-sm font-medium text-white/40 hover:text-white/70 border-2 border-dashed border-white/[0.08] hover:border-white/15 rounded-xl transition-all hover:bg-white/[0.02] group"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Alternative hinzufugen
                  </span>
                </button>
              )}
            </div>

          {/* Criteria Section - Dark */}
            <div className="border-t border-white/[0.06]">
              <button
                onClick={() => setCriteriaOpen(!criteriaOpen)}
                className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDetailedMode 
                      ? "bg-blue-500/10 border border-blue-500/20" 
                      : "bg-amber-500/10 border border-amber-500/20"
                  }`}>
                    <svg className={`w-4 h-4 ${isDetailedMode ? "text-blue-400" : "text-amber-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white/80">
                      {editedCriteria.length} Kriterien {isDetailedMode ? "bearbeiten" : "vorgeschlagen"}
                    </div>
                    <div className="text-xs text-white/40">
                      {isDetailedMode ? "Klicken zum Ein-/Ausklappen" : "Anpassbar im nachsten Schritt"}
                    </div>
                  </div>
                </div>
                <svg 
                  className={`w-5 h-5 text-white/40 transition-transform duration-300 ${criteriaOpen ? "rotate-180" : ""}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${criteriaOpen ? "max-h-[600px]" : "max-h-0"}`}>
                <div className="px-5 sm:px-6 pb-5 space-y-2">
                  {isDetailedMode ? (
                    <>
                      {editedCriteria.map((crit, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-400">{index + 1}</span>
                          </div>
                          <input
                            type="text"
                            value={crit.name}
                            onChange={(e) => updateCriterion(index, e.target.value)}
                            className="flex-1 px-3 py-2 text-sm text-white/90 bg-white/[0.03] rounded-lg border border-white/[0.08] focus:border-blue-500/30 outline-none transition-all placeholder:text-white/30"
                            placeholder={`Kriterium ${index + 1}...`}
                          />
                          {editedCriteria.length > 2 && (
                            <button
                              onClick={() => removeCriterion(index)}
                              className="p-1.5 text-white/30 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                              title="Entfernen"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      {editedCriteria.length < 10 && (
                        <button
                          onClick={addCriterion}
                          className="mt-2 w-full py-2.5 text-sm font-medium text-white/40 hover:text-white/70 border-2 border-dashed border-white/[0.08] hover:border-white/15 rounded-lg transition-all hover:bg-white/[0.02] group"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                            Kriterium hinzufugen
                          </span>
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {editedCriteria.map((crit, index) => (
                        <div key={index} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-sm text-white/60">{crit.name}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

{/* Action Buttons - Cinematic Dark */}
        <div
          className={`mt-8 space-y-4 transition-all duration-700 delay-400 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          {isDetailedMode ? (
            <>
              {/* Detailed Mode Header */}
              <div className="flex items-center gap-2 px-1 mb-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-sm font-medium text-blue-400">Detaillierter Bearbeitungsmodus</span>
              </div>
              
              {/* Primary CTA for detailed mode */}
              <button
                onClick={handleDetailedAccept}
                className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-3 px-8 py-4">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base font-semibold text-white">Anpassungen ubernehmen</span>
                </div>
              </button>
              
              {/* Back to simple mode */}
              <button
                onClick={() => {
                  setIsDetailedMode(false);
                  setIsEditing(false);
                  setCriteriaOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zuruck zur Ubersicht
              </button>
            </>
          ) : (
            <>
              {/* Primary CTA - Cinematic Glow */}
              <button
                onClick={handleAccept}
                className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 via-white/20 to-emerald-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white transition-all" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center justify-center gap-3 px-8 py-4">
                  <span className="text-base font-bold text-black">Weiter zur Analyse</span>
                  <svg
                    className="w-5 h-5 text-black/70 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </button>
              
              {/* Secondary Actions */}
              <div className="flex gap-3">
                <button
                  onClick={enterDetailedMode}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white/70 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/15 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Detailliert anpassen
                </button>
                <button
                  onClick={onReject}
                  className="px-5 py-3 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08] transition-all"
                >
                  Neu eingeben
                </button>
              </div>
            </>
          )}
        </div>

        {/* Reassurance Footer */}
        <div 
          className={`mt-6 pb-8 flex items-center justify-center gap-2 text-xs text-white/40 transition-all duration-500 delay-500 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Alle Angaben konnen jederzeit angepasst werden
        </div>
      </div>
    </div>
  );
}
