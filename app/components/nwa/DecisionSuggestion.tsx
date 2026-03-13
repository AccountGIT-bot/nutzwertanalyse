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
  const [editedAlternatives, setEditedAlternatives] = useState(
    interpretation.alternatives.map(a => ({ ...a, name: capitalizeFirst(a.name) }))
  );
  const [isEditing, setIsEditing] = useState(false);
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

  const handleAccept = () => {
    const updated: AIDecisionInterpretation = {
      ...interpretation,
      title: editedTitle,
      alternatives: editedAlternatives,
    };
    onAccept(updated);
  };

  const handleEdit = () => {
    const updated: AIDecisionInterpretation = {
      ...interpretation,
      title: editedTitle,
      alternatives: editedAlternatives,
    };
    onEdit(updated);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Success Badge */}
      <div 
        className={`flex items-center justify-center gap-2 mb-8 transition-all duration-500 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200/60">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-emerald-700">Analyse abgeschlossen</span>
        </div>
      </div>

      {/* Domain Header with Glass Effect */}
      <div 
        className={`relative mb-6 transition-all duration-500 delay-100 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white/60 border border-slate-200/50 backdrop-blur-sm shadow-sm">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl blur-md opacity-20" />
            <div className="relative h-14 w-14 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
              <DomainIcon size={26} className="text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="text-lg font-semibold text-slate-800">{domainLabel}</div>
            <div className="text-sm text-slate-500">Basierend auf Ihrer Eingabe</div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/50">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-600">Bereit</span>
          </div>
        </div>
      </div>

      {/* Original Input Quote */}
      <div 
        className={`mb-6 transition-all duration-500 delay-150 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="relative px-5 py-4 rounded-xl bg-slate-50/50 border border-slate-200/40">
          <div className="absolute top-3 left-3 text-slate-300 text-2xl font-serif">&ldquo;</div>
          <p className="text-sm text-slate-600 italic pl-4 pr-2 line-clamp-2">{originalInput}</p>
        </div>
      </div>

      {/* Main Card with Premium Styling */}
      <div 
        className={`relative transition-all duration-500 delay-200 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Subtle glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-br from-slate-200/40 via-transparent to-slate-200/40 rounded-3xl blur-xl opacity-60" />
        
        <div className="relative rounded-2xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/50 overflow-hidden">
          {/* Title Section */}
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Titel der Entscheidung
              </label>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors"
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
                className="w-full text-xl sm:text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-slate-400 outline-none pb-2 transition-colors"
                placeholder="Titel eingeben..."
                autoFocus
              />
            ) : (
              <h2 className="text-xl sm:text-2xl font-bold text-slate-800 leading-tight">
                {editedTitle}
              </h2>
            )}
          </div>

          {/* Alternatives Section */}
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                Alternativen zum Vergleich
              </label>
              <span className="px-2 py-0.5 text-xs font-semibold text-slate-500 bg-slate-100 rounded-full">
                {editedAlternatives.length}
              </span>
            </div>
            
            <div className="space-y-2.5">
              {editedAlternatives.map((alt, index) => (
                <div 
                  key={index} 
                  className={`group flex items-center gap-3 transition-all duration-300 ${
                    mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${300 + index * 50}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200/60 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:border-slate-300/60 transition-all">
                      <span className="text-sm font-bold text-slate-500">{index + 1}</span>
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={alt.name}
                        onChange={(e) => updateAlternative(index, e.target.value)}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-xl border border-slate-200/60 focus:border-slate-300 focus:bg-white focus:shadow-sm outline-none transition-all"
                        placeholder={`Alternative ${index + 1}...`}
                      />
                      {editedAlternatives.length > 2 && (
                        <button
                          onClick={() => removeAlternative(index)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Entfernen"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-gradient-to-r from-slate-50 to-transparent rounded-xl border border-slate-100 group-hover:border-slate-200 group-hover:from-slate-100/80 transition-all">
                      {alt.name}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isEditing && editedAlternatives.length < 6 && (
              <button
                onClick={addAlternative}
                className="mt-4 w-full py-3 text-sm font-medium text-slate-400 hover:text-slate-600 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl transition-all hover:bg-slate-50/50 group"
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

          {/* Criteria Preview - Expandable */}
          <div className="border-t border-slate-100">
            <button
              onClick={() => setCriteriaOpen(!criteriaOpen)}
              className="w-full px-5 sm:px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700">{interpretation.criteria.length} Kriterien vorgeschlagen</div>
                  <div className="text-xs text-slate-400">Anpassbar im nachsten Schritt</div>
                </div>
              </div>
              <svg 
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${criteriaOpen ? "rotate-180" : ""}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ${criteriaOpen ? "max-h-96" : "max-h-0"}`}>
              <div className="px-5 sm:px-6 pb-5 space-y-2">
                {interpretation.criteria.map((crit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50/50 border border-slate-100"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-sm text-slate-600">{crit.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons with Premium Styling */}
      <div 
        className={`mt-8 space-y-4 transition-all duration-500 delay-400 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Primary CTA */}
        <button
          onClick={handleAccept}
          className="group relative w-full overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 transition-all" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <div className="relative flex items-center justify-center gap-3 px-8 py-4">
            <span className="text-base font-semibold text-white">Weiter zur Analyse</span>
            <svg 
              className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" 
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
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 hover:border-slate-300/60 transition-all hover:shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Detailliert anpassen
          </button>
          <button
            onClick={onReject}
            className="px-5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200/60 transition-all"
          >
            Neu eingeben
          </button>
        </div>
      </div>

      {/* Reassurance Footer */}
      <div 
        className={`mt-6 flex items-center justify-center gap-2 text-xs text-slate-400 transition-all duration-500 delay-500 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Alle Angaben konnen jederzeit angepasst werden
      </div>
    </div>
  );
}
