"use client";

import { useState } from "react";
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
  
  const DomainIcon = getDomainIcon(interpretation.domain);
  const domainLabel = getDomainLabel(interpretation.domain);

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
    <div className="w-full max-w-2xl mx-auto">
      {/* Compact Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-11 w-11 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.06)" }}
        >
          <DomainIcon size={22} className="text-black/60" />
        </div>
        <div>
          <div className="text-base font-semibold text-black/85">{domainLabel}</div>
          <div className="text-xs text-black/45">basierend auf Ihrer Eingabe</div>
        </div>
      </div>

      {/* Original Input - minimal */}
      <div className="mb-5 px-3 py-2.5 rounded-lg bg-black/[0.03] border border-black/[0.06]">
        <div className="text-sm text-black/60 italic truncate">{`„${originalInput}"`}</div>
      </div>

      {/* Main Editable Card */}
      <div className="rounded-2xl border border-black/10 bg-white shadow-sm overflow-hidden">
        {/* Title Section */}
        <div className="p-4 border-b border-black/[0.06]">
          <label className="block text-xs font-medium text-black/50 mb-1.5">
            Titel der Entscheidung
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full text-lg font-semibold text-black/90 bg-transparent border-b border-black/20 focus:border-black/40 outline-none pb-1"
              placeholder="Titel eingeben..."
            />
          ) : (
            <div 
              className="text-lg font-semibold text-black/90 cursor-pointer hover:text-black transition"
              onClick={() => setIsEditing(true)}
            >
              {editedTitle}
            </div>
          )}
        </div>

        {/* Alternatives Section */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-medium text-black/50">
              Alternativen zum Vergleich
            </label>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-black/40 hover:text-black/60 transition"
              >
                Bearbeiten
              </button>
            )}
          </div>
          
          <div className="space-y-2">
            {editedAlternatives.map((alt, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-black/[0.04] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-black/50">{index + 1}</span>
                </div>
                {isEditing ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={alt.name}
                      onChange={(e) => updateAlternative(index, e.target.value)}
                      className="flex-1 px-3 py-2 text-sm text-black/80 bg-black/[0.03] rounded-lg border border-transparent focus:border-black/20 outline-none"
                      placeholder={`Alternative ${index + 1}...`}
                    />
                    {editedAlternatives.length > 2 && (
                      <button
                        onClick={() => removeAlternative(index)}
                        className="p-1.5 text-black/30 hover:text-red-500 transition"
                        title="Entfernen"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 px-3 py-2 text-sm font-medium text-black/75 bg-black/[0.03] rounded-lg">
                    {alt.name}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isEditing && editedAlternatives.length < 6 && (
            <button
              onClick={addAlternative}
              className="mt-3 w-full py-2 text-sm text-black/40 hover:text-black/60 border border-dashed border-black/15 hover:border-black/25 rounded-lg transition"
            >
              + Alternative hinzufügen
            </button>
          )}
        </div>

        {/* Criteria Preview - collapsed by default */}
        <details className="border-t border-black/[0.06]">
          <summary className="px-4 py-3 text-xs font-medium text-black/50 cursor-pointer hover:bg-black/[0.02] transition select-none">
            {interpretation.criteria.length} Kriterien vorgeschlagen
          </summary>
          <div className="px-4 pb-4 space-y-1.5">
            {interpretation.criteria.map((crit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-black/60">
                <span className="w-1.5 h-1.5 rounded-full bg-black/20" />
                {crit.name}
              </div>
            ))}
            <div className="text-xs text-black/40 mt-2 pt-2 border-t border-black/[0.06]">
              Kriterien können im nächsten Schritt angepasst werden
            </div>
          </div>
        </details>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleAccept}
          className="w-full px-6 py-3.5 rounded-full text-sm font-semibold text-white transition shadow-lg hover:shadow-xl active:scale-[0.99]"
          style={{ background: "#0b0f14" }}
        >
          Weiter zur Analyse
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={handleEdit}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-medium text-black/60 bg-black/[0.04] hover:bg-black/[0.08] transition"
          >
            Detailliert anpassen
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2.5 rounded-full text-sm font-medium text-black/40 hover:text-black/60 hover:bg-black/[0.04] transition"
          >
            Neu eingeben
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-4 text-center text-xs text-black/40">
        Alle Angaben können jederzeit angepasst werden
      </div>
    </div>
  );
}
