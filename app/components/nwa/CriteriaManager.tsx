"use client";

import { useState } from "react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import { getTemplateByPreset } from "@/app/lib/nwa/templates";
import type { Criterion } from "@/app/lib/nwa/types";
import { StepInfoButton } from "./StepInfoButton";
import { useTranslations } from "@/app/lib/i18n";

export function CriteriaManager() {
  const t = useTranslations();
const {
    state,
    addCriterion,
    updateCriterion,
    removeCriterion,
    duplicateCriterion,
    setCriteriaFromTemplate,
    canProceedToNext,
  } = useAnalysis();
  const { criteria, categories, decision } = state;
  const packageLevel = decision.packageLevel;

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showTemplateHint, setShowTemplateHint] = useState(
    criteria.length === 0 && !!decision.preset
  );

  const template = decision.preset ? getTemplateByPreset(decision.preset) : null;

  const handleAdd = () => {
    if (newName.trim()) {
      addCriterion({
        name: newName.trim(),
        rawWeight: packageLevel === "basic" ? 3 : 10,
        categoryId: newCategory || undefined,
      });
      setNewName("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleUseTemplate = () => {
    if (decision.preset) {
      setCriteriaFromTemplate(decision.preset);
      setShowTemplateHint(false);
    }
  };

  const handleUpdate = (criterion: Criterion, updates: Partial<Criterion>) => {
    updateCriterion({ ...criterion, ...updates });
  };

  // Group criteria by category for Advanced/Business
  type CriteriaGroup = { category: typeof categories[number] | null; criteria: typeof criteria };
  
  const groupedCriteria: CriteriaGroup[] =
    packageLevel !== "basic" && categories.length > 0
      ? categories.map((cat) => ({
          category: cat,
          criteria: criteria.filter((c) => c.categoryId === cat.id),
        }))
      : [{ category: null, criteria }];

  // Add uncategorized group
  const uncategorized = criteria.filter(
    (c) => !c.categoryId || !categories.find((cat) => cat.id === c.categoryId)
  );
  if (uncategorized.length > 0 && packageLevel !== "basic") {
    groupedCriteria.push({ category: null, criteria: uncategorized });
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm text-white/60 flex items-center gap-2">
          {t.steps.step} 3
          <StepInfoButton stepId="criteria" />
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">{t.criteriaSetup.title}</h2>
        <p className="mt-2 text-sm text-white/50">
          {packageLevel === "basic"
            ? t.criteriaSetup.description
            : t.criteriaSetup.descriptionAdvanced}
        </p>
      </div>

      {/* Template suggestion */}
      {showTemplateHint && template && (
        <div className="rounded-xl border border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/10 p-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="font-medium text-white">
                {t.criteriaSetup.templateAvailable}: {template.name}
              </div>
              <div className="text-sm text-white/60 mt-1">
                {template.criteria.length} {t.criteriaSetup.templateCriteria}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowTemplateHint(false)}
                className="px-4 py-2 rounded-lg text-sm text-white/60 hover:text-white transition"
              >
                {t.common.ignore}
              </button>
              <button
                onClick={handleUseTemplate}
                className="px-4 py-2 rounded-lg text-sm font-medium transition"
                style={{
                  background: `rgb(var(--accent))`,
                  color: "white",
                }}
              >
                {t.common.useTemplate}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add new criterion */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.criteriaSetup.placeholder}
          className="flex-1 h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))] focus:ring-2 focus:ring-[rgb(var(--accent))]/20 transition"
        />

        {packageLevel !== "basic" && categories.length > 0 && (
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="h-12 px-4 rounded-xl bg-slate-800 border border-white/10 text-white outline-none focus:border-[rgb(var(--accent))] transition [&>option]:bg-slate-800 [&>option]:text-white"
          >
            <option value="">{t.criteriaSetup.selectCategory}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="h-12 px-6 rounded-xl font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `rgb(var(--accent) / 0.15)`,
            color: `rgb(var(--accent))`,
            border: `1px solid rgb(var(--accent) / 0.3)`,
          }}
        >
          {t.common.add}
        </button>
      </div>

      {/* Criteria list */}
      <div className="space-y-4">
        {groupedCriteria.map(({ category, criteria: groupCriteria }, groupIndex) => (
          <div key={category?.id || "uncategorized"}>
            {category && packageLevel !== "basic" && (
              <div className="mb-3 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-[rgb(var(--accent))]" />
                <div className="text-sm font-medium text-white/70">
                  {category.name}
                </div>
                {category.description && (
                  <div className="text-xs text-white/40">
                    — {category.description}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              {groupCriteria.map((criterion, index) => (
                <div
                  key={criterion.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-[rgb(var(--accent))]/20 flex items-center justify-center text-sm font-semibold text-[rgb(var(--accent))]">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <input
                        type="text"
                        value={criterion.name}
                        onChange={(e) =>
                          handleUpdate(criterion, { name: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white outline-none focus:border-[rgb(var(--accent))]/50"
                      />

                      {packageLevel !== "basic" && (
                        <>
                          <input
                            type="text"
                            value={criterion.description || ""}
                            onChange={(e) =>
                              handleUpdate(criterion, { description: e.target.value })
                            }
                            placeholder="Beschreibung / Definition..."
                            className="w-full h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 placeholder:text-white/30 outline-none focus:border-[rgb(var(--accent))]/50"
                          />

                          <div className="flex items-center gap-4">
                            {/* Category selector */}
                            {categories.length > 0 && (
                              <select
                                value={criterion.categoryId || ""}
                                onChange={(e) =>
                                  handleUpdate(criterion, {
                                    categoryId: e.target.value || undefined,
                                  })
                                }
                                className="h-9 px-3 rounded-lg bg-slate-800 border border-white/10 text-sm text-white/70 outline-none [&>option]:bg-slate-800 [&>option]:text-white"
                              >
                                <option value="">{t.criteriaSetup.noCategory}</option>
                                {categories.map((cat) => (
                                  <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                  </option>
                                ))}
                              </select>
                            )}

                            {/* Knockout toggle */}
                            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={criterion.isKnockout || false}
                                onChange={(e) =>
                                  handleUpdate(criterion, {
                                    isKnockout: e.target.checked,
                                  })
                                }
                                className="rounded border-white/20 bg-white/5 text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]/20"
                              />
                              {t.criteriaSetup.knockout}
                            </label>

                            {criterion.isKnockout && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">{t.criteriaSetup.knockoutThreshold}:</span>
                                <input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={criterion.minThreshold || 5}
                                  onChange={(e) =>
                                    handleUpdate(criterion, {
                                      minThreshold: parseInt(e.target.value) || 5,
                                    })
                                  }
                                  className="w-16 h-8 px-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white text-center outline-none"
                                />
                              </div>
                            )}
                          </div>

                          {/* Business: Governance fields */}
                          {packageLevel === "business" && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <input
                                type="text"
                                value={criterion.rationale || ""}
                                onChange={(e) =>
                                  handleUpdate(criterion, { rationale: e.target.value })
                                }
                                placeholder="Begründung..."
                                className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 placeholder:text-white/30 outline-none"
                              />
                              <input
                                type="text"
                                value={criterion.source || ""}
                                onChange={(e) =>
                                  handleUpdate(criterion, { source: e.target.value })
                                }
                                placeholder="Quelle..."
                                className="h-9 px-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 placeholder:text-white/30 outline-none"
                              />
                            </div>
                          )}
                        </>
                      )}
</div>
              
              <div className="flex gap-2">
                {/* Duplicate button */}
                <button
                  onClick={() => duplicateCriterion(criterion.id)}
                  className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 transition flex items-center justify-center"
                  title={t.criteriaSetup.duplicateCrit}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                
                {/* Delete button */}
                <button
                  onClick={() => removeCriterion(criterion.id)}
                  className="flex-shrink-0 h-8 w-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center"
                  title={t.criteriaSetup.removeCrit}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
            </div>
          </div>
        ))}

        {criteria.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 p-8 text-center">
            <div className="text-white/40">{t.criteriaSetup.noCriteria}</div>
            <div className="text-sm text-white/30 mt-1">
              {t.criteriaSetup.addMinimum}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/50">{t.criteriaSetup.countStatus.replace("{count}", String(criteria.length))}</div>
        {!canProceedToNext && criteria.length < 2 && (
          <div className="text-[rgb(var(--accent))]/80">
            {t.criteriaSetup.minRequired}
          </div>
        )}
      </div>
    </div>
  );
}
