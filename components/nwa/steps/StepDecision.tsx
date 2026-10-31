"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { presetCriteria } from "@/lib/nwa/presets";
import type { ScaleMax } from "@/lib/nwa/types";
import { StepHeader } from "../Wizard";
import { Field, TextInput, TextArea, Select, SegmentedControl, Tip } from "@/components/ui/Controls";
import { ConfirmDialog } from "@/components/ui/Dialog";

export function StepDecision() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const [presetDraft, setPresetDraft] = useState(analysis.presetId ?? "custom");
  const [confirmPreset, setConfirmPreset] = useState(false);
  const preset = t.presets[presetDraft];

  const applyPreset = () => {
    dispatch({ type: "patch", patch: { presetId: presetDraft === "custom" ? undefined : presetDraft } });
    if (presetDraft !== "custom") {
      dispatch({ type: "addCriteria", criteria: presetCriteria(t, presetDraft) });
      const existing = new Set(analysis.alternatives.map((a) => a.name.trim().toLowerCase()));
      for (const name of preset.alternatives) {
        if (!existing.has(name.toLowerCase())) dispatch({ type: "addAlternative", alternative: { name } });
      }
    }
    setConfirmPreset(false);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card p-5 sm:p-6">
        <StepHeader title={t.steps.decision.label} lead={t.steps.decision.description} />
        <div className="grid grid-cols-1 gap-5">
          <Field label={t.decision.title} required>
            {(id) => (
              <TextInput
                id={id}
                value={analysis.title}
                onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })}
                placeholder={preset?.titleExample || t.decision.titlePlaceholder}
                maxLength={300}
                autoFocus={!analysis.title}
              />
            )}
          </Field>
          <Field label={t.decision.description} optional={t.common.optional}>
            {(id) => (
              <TextArea
                id={id}
                value={analysis.description}
                onChange={(e) => dispatch({ type: "patch", patch: { description: e.target.value } })}
                placeholder={preset?.descriptionExample || t.decision.descriptionPlaceholder}
                maxLength={5000}
              />
            )}
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label={t.decision.goal} optional={t.common.optional}>
              {(id) => <TextArea id={id} value={analysis.goal} onChange={(e) => dispatch({ type: "patch", patch: { goal: e.target.value } })} placeholder={t.decision.goalPlaceholder} maxLength={2000} />}
            </Field>
            <Field label={t.decision.constraints} optional={t.common.optional}>
              {(id) => (
                <TextArea id={id} value={analysis.constraints} onChange={(e) => dispatch({ type: "patch", patch: { constraints: e.target.value } })} placeholder={t.decision.constraintsPlaceholder} maxLength={2000} />
              )}
            </Field>
          </div>
        </div>

        <h2 className="mt-8 text-base font-semibold">{t.decision.evaluators}</h2>
        <p className="mt-1 text-sm text-ink-2">{t.decision.evaluatorsHint}</p>
        <ul className="mt-3 space-y-2">
          {analysis.evaluators.map((ev) => (
            <li key={ev.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2/50 p-2.5">
              <label className="sr-only" htmlFor={`ev-name-${ev.id}`}>
                {t.decision.evaluatorName}
              </label>
              <input id={`ev-name-${ev.id}`} className="input flex-1" value={ev.name} maxLength={100} onChange={(e) => dispatch({ type: "updateEvaluator", id: ev.id, patch: { name: e.target.value } })} />
              <label className="flex items-center gap-2 text-xs text-ink-2">
                {t.decision.evaluatorWeight}
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  className="input w-20"
                  value={ev.weight}
                  onChange={(e) => dispatch({ type: "updateEvaluator", id: ev.id, patch: { weight: Math.max(0, Math.min(10, Number(e.target.value) || 0)) } })}
                />
              </label>
              <button type="button" className="btn btn-ghost btn-icon text-bad" disabled={analysis.evaluators.length <= 1} onClick={() => dispatch({ type: "removeEvaluator", id: ev.id })} aria-label={`${t.common.remove}: ${ev.name}`}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => dispatch({ type: "addEvaluator", name: `${t.decision.evaluatorName} ${analysis.evaluators.length + 1}` })} disabled={analysis.evaluators.length >= 20}>
          <Plus className="h-4 w-4" aria-hidden /> {t.decision.addEvaluator}
        </button>
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">{t.decision.preset}</h2>
          <p className="mt-1 text-xs text-ink-3">{t.decision.presetHint}</p>
          <Select className="mt-3" value={presetDraft} onChange={(e) => setPresetDraft(e.target.value)} aria-label={t.decision.preset}>
            {[...PRESET_IDS, "custom"].map((p) => (
              <option key={p} value={p}>
                {t.presets[p].label}
              </option>
            ))}
          </Select>
          <button type="button" className="btn btn-secondary btn-sm mt-3 w-full" onClick={() => setConfirmPreset(true)} disabled={presetDraft === (analysis.presetId ?? "custom") && analysis.criteria.length > 0}>
            {t.decision.applyPreset}
          </button>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-semibold">{t.decision.scale}</h2>
          <p className="mt-1 text-xs text-ink-3">{t.decision.scaleHint}</p>
          <div className="mt-3">
            <SegmentedControl<string>
              label={t.decision.scale}
              value={String(analysis.settings.scale)}
              onChange={(v) => dispatch({ type: "setScale", scale: Number(v) as ScaleMax })}
              options={[
                { value: "5", label: "1–5" },
                { value: "10", label: "1–10" },
              ]}
            />
          </div>
          <p className="mt-2 text-xs text-ink-2">{analysis.settings.scale === 5 ? t.decision.scale5 : t.decision.scale10}</p>
        </div>
        <Tip>
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <ul className="space-y-1.5">
              {t.decision.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </Tip>
        <p className="px-1 text-xs leading-relaxed text-ink-3">
          {t.decision.termsHintBefore}
          <Link href="/agb" className="font-medium text-primary underline underline-offset-2">
            {t.decision.termsHintLink}
          </Link>
          {t.decision.termsHintAfter}
        </p>
      </aside>

      <ConfirmDialog
        open={confirmPreset}
        title={t.decision.applyPreset}
        text={t.decision.applyPresetConfirm}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        onCancel={() => setConfirmPreset(false)}
        onConfirm={applyPreset}
      />
    </div>
  );
}
