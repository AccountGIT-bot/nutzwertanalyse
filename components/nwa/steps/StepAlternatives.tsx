"use client";

import { Plus, Trash2, ArrowUp, ArrowDown, Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { StepHeader } from "../Wizard";
import { Switch, Tip } from "@/components/ui/Controls";
import { seriesColor } from "@/components/charts/Charts";
import { cn } from "@/lib/utils";

export function StepAlternatives() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const alts = analysis.alternatives;
  const named = alts.filter((a) => a.name.trim()).length;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card p-5 sm:p-6">
        <StepHeader title={t.alternatives.title} lead={t.alternatives.lead}>
          <button type="button" className="btn btn-primary" onClick={() => dispatch({ type: "addAlternative" })} disabled={alts.length >= 50}>
            <Plus className="h-4 w-4" aria-hidden /> {t.alternatives.add}
          </button>
        </StepHeader>

        {alts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-3">{t.alternatives.minHint}</div>
        ) : (
          <ol className="space-y-3">
            {alts.map((alt, i) => (
              <li key={alt.id} className={cn("rounded-xl border border-line bg-surface-2/40 p-3 sm:p-4", alt.excluded && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <span className="mt-2 h-3 w-3 shrink-0 rounded-full" style={{ background: seriesColor(i) }} aria-hidden />
                  <div className="grid grid-cols-1 flex-1 gap-2 sm:grid-cols-[minmax(0,1fr)_1.4fr]">
                    <div>
                      <label className="sr-only" htmlFor={`alt-name-${alt.id}`}>
                        {t.common.name}
                      </label>
                      <input
                        id={`alt-name-${alt.id}`}
                        className="input font-medium"
                        value={alt.name}
                        maxLength={200}
                        placeholder={t.alternatives.namePlaceholder}
                        onChange={(e) => dispatch({ type: "updateAlternative", id: alt.id, patch: { name: e.target.value } })}
                        autoFocus={!alt.name && i === alts.length - 1}
                      />
                    </div>
                    <div>
                      <label className="sr-only" htmlFor={`alt-desc-${alt.id}`}>
                        {t.common.description}
                      </label>
                      <input
                        id={`alt-desc-${alt.id}`}
                        className="input"
                        value={alt.description ?? ""}
                        maxLength={2000}
                        placeholder={t.alternatives.descriptionPlaceholder}
                        onChange={(e) => dispatch({ type: "updateAlternative", id: alt.id, patch: { description: e.target.value } })}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pl-6">
                  <label className="flex items-center gap-2 text-xs text-ink-2">
                    <Switch checked={!!alt.excluded} onChange={(v) => dispatch({ type: "updateAlternative", id: alt.id, patch: { excluded: v } })} label={t.alternatives.exclude} />
                    {t.alternatives.exclude}
                  </label>
                  <div className="flex items-center gap-1">
                    <button type="button" className="btn btn-ghost btn-icon" disabled={i === 0} onClick={() => dispatch({ type: "moveAlternative", id: alt.id, dir: -1 })} aria-label={t.common.moveUp}>
                      <ArrowUp className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon" disabled={i === alts.length - 1} onClick={() => dispatch({ type: "moveAlternative", id: alt.id, dir: 1 })} aria-label={t.common.moveDown}>
                      <ArrowDown className="h-4 w-4" aria-hidden />
                    </button>
                    <button type="button" className="btn btn-ghost btn-icon text-bad" onClick={() => dispatch({ type: "removeAlternative", id: alt.id })} aria-label={`${t.common.remove}: ${alt.name || t.common.unnamed}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-xs text-ink-3">
          {named < 2 ? t.alternatives.minHint : `${named} ${t.steps.alternatives.label}`} · {t.alternatives.maxHint}
        </p>
      </div>
      <aside>
        <Tip>
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <ul className="space-y-1.5">
              {t.alternatives.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </Tip>
      </aside>
    </div>
  );
}
