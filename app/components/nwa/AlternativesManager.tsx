"use client";

import { useState } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import type { Alternative } from "@/app/lib/nwa/types";
import { getPresetContext } from "@/app/lib/nwa/preset-context";
import { StepInfoButton } from "./StepInfoButton";

export function AlternativesManager() {
  const { state, addAlternative, updateAlternative, removeAlternative, duplicateAlternative, canProceedToNext } = useAnalysis();
  const { alternatives, decision } = state;
  const packageLevel = decision.packageLevel;
  
  // Get context-specific content
  const presetContext = getPresetContext(decision.preset);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const minAlts = 2;
  const maxAlts = packageLevel === "basic" ? 5 : 10;
  
  // Dynamic placeholder based on preset and current count
  const getPlaceholder = () => {
    const placeholders = presetContext.alternativePlaceholders;
    const index = alternatives.length % placeholders.length;
    return placeholders[index] || "Name der Alternative...";
  };

  const handleAdd = () => {
    if (newName.trim() && alternatives.length < maxAlts) {
      addAlternative({ name: newName.trim() });
      setNewName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleUpdate = (alt: Alternative, updates: Partial<Alternative>) => {
    updateAlternative({ ...alt, ...updates });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60 flex items-center gap-2">
          Schritt 2
          <StepInfoButton stepId="alternatives" />
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">Alternativen definieren</h2>
        <p className="mt-2 text-sm text-white/50">
          {presetContext.alternativeHelperText}
          {packageLevel !== "basic" && " Sie können auch Annahmen zu jeder Alternative dokumentieren."}
        </p>
      </div>

      {/* Add new alternative */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder()}
          className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition"
          disabled={alternatives.length >= maxAlts}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim() || alternatives.length >= maxAlts}
          className="h-12 px-6 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `rgb(var(--accent) / 0.15)`,
            color: `rgb(var(--accent))`,
            border: `1px solid rgb(var(--accent) / 0.3)`,
          }}
        >
          Hinzufügen
        </button>
      </div>

      {/* Alternatives list */}
      <div className="space-y-3">
        {alternatives.map((alt, index) => (
          <div
            key={alt.id}
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[rgb(var(--accent))]/20 flex items-center justify-center text-sm font-semibold text-[rgb(var(--accent))]">
                {index + 1}
              </div>
              
              <div className="flex-1 min-w-0">
                {editingId === alt.id ? (
                  <input
                    type="text"
                    value={alt.name}
                    onChange={(e) => handleUpdate(alt, { name: e.target.value })}
                    onBlur={() => setEditingId(null)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setEditingId(null);
                    }}
                    autoFocus
                    className="w-full h-10 px-3 rounded-lg bg-white/10 border border-white/20 text-white outline-none focus:border-[rgb(var(--accent))]"
                  />
                ) : (
                  <div
                    className="font-medium text-white cursor-pointer hover:text-[rgb(var(--accent))] transition"
                    onClick={() => setEditingId(alt.id)}
                  >
                    {alt.name}
                  </div>
                )}

                {/* Description */}
                <textarea
                  value={alt.description || ""}
                  onChange={(e) => handleUpdate(alt, { description: e.target.value })}
                  placeholder="Kurze Beschreibung (optional)..."
                  rows={1}
                  className="mt-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))]/50 transition resize-none"
                />

                {/* Assumptions (Advanced/Business) */}
                {packageLevel !== "basic" && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-white/50 mb-2">
                      Annahmen & Voraussetzungen
                    </div>
                    <textarea
                      value={alt.assumptions?.join("\n") || ""}
                      onChange={(e) =>
                        handleUpdate(alt, {
                          assumptions: e.target.value.split("\n").filter(Boolean),
                        })
                      }
                      placeholder="Eine Annahme pro Zeile..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))]/50 transition resize-none"
                    />
                  </div>
                )}
</div>
              
              <div className="flex gap-2">
                {/* Duplicate button */}
                <button
                  onClick={() => duplicateAlternative(alt.id)}
                  disabled={alternatives.length >= maxAlts}
                  className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Alternative duplizieren"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Delete button */}
                <button
                  onClick={() => removeAlternative(alt.id)}
                  className="flex-shrink-0 h-8 w-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center"
                  title="Alternative entfernen"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {alternatives.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
            <div className="text-white/40">Noch keine Alternativen hinzugefügt</div>
            <div className="text-sm text-white/30 mt-1">
              Fügen Sie mindestens {minAlts} Alternativen hinzu
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/50">
          {alternatives.length} von {maxAlts} Alternativen
        </div>
        {!canProceedToNext && (
          <div className="text-[rgb(var(--accent))]/80">
            Mindestens {minAlts} Alternativen erforderlich
          </div>
        )}
      </div>
    </div>
  );
}
