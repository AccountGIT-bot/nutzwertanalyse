"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Lightbulb, LayoutTemplate } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { CATEGORY_IDS, type CategoryId } from "@/lib/nwa/types";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { presetCriteria } from "@/lib/nwa/presets";
import { StepHeader } from "../Wizard";
import { Switch, Tip } from "@/components/ui/Controls";
import { Dialog } from "@/components/ui/Dialog";
import { cn, fmt } from "@/lib/utils";

export function StepCriteria() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [templateId, setTemplateId] = useState(analysis.presetId ?? PRESET_IDS[0]);
  const crits = analysis.criteria;
  const named = crits.filter((c) => c.name.trim()).length;
  const scale = analysis.settings.scale;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card p-5 sm:p-6">
        <StepHeader title={t.criteria.title} lead={t.criteria.lead}>
          <button type="button" className="btn btn-secondary" onClick={() => setTemplateOpen(true)}>
            <LayoutTemplate className="h-4 w-4" aria-hidden /> {t.criteria.fromTemplate}
          </button>
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "addCriterion" })} disabled={crits.length >= 60}>
            <Plus className="h-4 w-4" aria-hidden /> {t.criteria.add}
          </button>
        </StepHeader>

        {crits.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-3">{t.criteria.minHint}</div>
        ) : (
          <ol className="space-y-3">
            {crits.map((c, i) => (
              <li key={c.id} className="rounded-xl border border-line bg-surface-2/40 p-3 sm:p-4">
                <div className="grid gap-2 sm:grid-cols-[1fr_1.2fr_180px]">
                  <div>
                    <label className="sr-only" htmlFor={`crit-name-${c.id}`}>
                      {t.common.name}
                    </label>
                    <input
                      id={`crit-name-${c.id}`}
                      className="input font-medium"
                      value={c.name}
                      maxLength={200}
                      placeholder={t.criteria.namePlaceholder}
                      onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { name: e.target.value } })}
                      autoFocus={!c.name && i === crits.length - 1}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`crit-desc-${c.id}`}>
                      {t.common.description}
                    </label>
                    <input
                      id={`crit-desc-${c.id}`}
                      className="input"
                      value={c.description ?? ""}
                      maxLength={2000}
                      placeholder={t.criteria.descriptionPlaceholder}
                      onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { description: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="sr-only" htmlFor={`crit-cat-${c.id}`}>
                      {t.criteria.category}
                    </label>
                    <select id={`crit-cat-${c.id}`} className="input" value={c.categoryId} onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { categoryId: e.target.value as CategoryId } })}>
                      {CATEGORY_IDS.map((cat) => (
                        <option key={cat} value={cat}>
                          {t.categories[cat]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-ink-2">
                      <Switch
                        checked={c.isKnockout}
                        onChange={(v) => dispatch({ type: "updateCriterion", id: c.id, patch: { isKnockout: v, minScore: v ? (c.minScore ?? Math.ceil(scale / 2)) : c.minScore } })}
                        label={t.criteria.knockout}
                      />
                      <span className={cn(c.isKnockout && "font-semibold text-bad")}>{t.criteria.knockout}</span>
                    </label>
                    {c.isKnockout && (
                      <label className="flex items-center gap-2 text-xs text-ink-2">
                        {t.criteria.minScore}
                        <input
                          type="number"
                          min={1}
                          max={scale}
                          className="input w-20"
                          value={c.minScore ?? ""}
                          onChange={(e) => dispatch({ type: "updateCriterion", id: c.id, patch: { minScore: Math.max(1, Math.min(scale, Number(e.target.value) || 1)) } })}
                        />
                        <span className="text-ink-3">/ {scale}</span>
                      </label>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" className="btn btn-ghost btn-icon" disabled={i === 0} onClick={() => dispatch({ type: "moveCriterion", id: c.id, dir: -1 })} aria-label={t.common.moveUp}>
                      <ArrowUp className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon" disabled={i === crits.length - 1} onClick={() => dispatch({ type: "moveCriterion", id: c.id, dir: 1 })} aria-label={t.common.moveDown}>
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon text-bad" onClick={() => dispatch({ type: "removeCriterion", id: c.id })} aria-label={`${t.common.remove}: ${c.name || t.common.unnamed}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs text-ink-3">
          {named < 2 ? t.criteria.minHint : fmt(t.criteria.count, { count: named })} · {t.criteria.maxHint}
        </p>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card p-5 text-sm">
          <h2 className="text-sm font-semibold">{t.criteria.knockout}</h2>
          <p className="mt-1 text-xs text-ink-2">{t.criteria.knockoutHint}</p>
        </div>
        <Tip>
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <ul className="space-y-1.5">
              {t.criteria.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </Tip>
      </aside>

      <Dialog
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        title={t.criteria.fromTemplate}
        closeLabel={t.common.close}
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setTemplateOpen(false)}>
              {t.common.cancel}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                dispatch({ type: "addCriteria", criteria: presetCriteria(t, templateId) });
                setTemplateOpen(false);
              }}
            >
              {t.common.add}
            </button>
          </>
        }
      >
        <label className="text-sm font-medium" htmlFor="tpl-select">
          {t.decision.preset}
        </label>
        <select id="tpl-select" className="input mt-2" value={templateId} onChange={(e) => setTemplateId(e.target.value)}>
          {PRESET_IDS.map((p) => (
            <option key={p} value={p}>
              {t.presets[p].label}
            </option>
          ))}
        </select>
        <ul className="mt-4 space-y-1.5 text-sm">
          {t.presets[templateId]?.criteria.map((c) => (
            <li key={c.name} className="flex items-start justify-between gap-3 rounded-lg bg-surface-2 px-3 py-2">
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-ink-3">{c.description}</div>
              </div>
              <span className="badge shrink-0">{t.categories[c.categoryId]}</span>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}
