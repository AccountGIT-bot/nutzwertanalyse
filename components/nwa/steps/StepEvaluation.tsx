"use client";

import { useMemo, useState } from "react";
import { Lightbulb, MessageSquare, Eraser } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { StepHeader } from "../Wizard";
import { SegmentedControl, Tip, ProgressBar } from "@/components/ui/Controls";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { seriesColor } from "@/components/charts/Charts";
import { cn, fmt } from "@/lib/utils";

export function StepEvaluation() {
  const { t } = useI18n();
  const { analysis, dispatch } = useAnalysis();
  const scale = analysis.settings.scale;
  const [evaluatorId, setEvaluatorId] = useState(analysis.evaluators[0]?.id);
  const [view, setView] = useState<"matrix" | "cards">(() => (typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches ? "cards" : "matrix"));
  const [noteCell, setNoteCell] = useState<{ altId: string; critId: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const ev = analysis.evaluators.find((e) => e.id === evaluatorId) ?? analysis.evaluators[0];
  const alts = analysis.alternatives.filter((a) => !a.excluded);
  const crits = analysis.criteria;
  const ratings = useMemo(() => analysis.ratings[ev?.id ?? ""] ?? {}, [analysis.ratings, ev?.id]);

  const { done, total } = useMemo(() => {
    let d = 0;
    for (const a of alts) for (const c of crits) if (typeof ratings[a.id]?.[c.id]?.score === "number") d++;
    return { done: d, total: alts.length * crits.length };
  }, [alts, crits, ratings]);

  const setScore = (altId: string, critId: string, score: number | undefined) => dispatch({ type: "setRating", evaluatorId: ev.id, altId, critId, score });
  const legend = t.evaluation.scaleLegend[scale] ?? [];

  if (!ev) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="card p-4 sm:p-6">
        <StepHeader title={t.evaluation.title} lead={fmt(t.evaluation.lead, { min: 1, max: scale })}>
          <SegmentedControl<"matrix" | "cards">
            label={t.evaluation.view}
            value={view}
            onChange={setView}
            size="sm"
            options={[
              { value: "matrix", label: t.evaluation.viewMatrix },
              { value: "cards", label: t.evaluation.viewCards },
            ]}
          />
        </StepHeader>

        {analysis.evaluators.length > 1 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{t.evaluation.evaluator}:</span>
            <div role="tablist" className="flex flex-wrap gap-1">
              {analysis.evaluators.map((e) => (
                <button key={e.id} type="button" role="tab" aria-selected={e.id === ev.id} onClick={() => setEvaluatorId(e.id)} className={cn("badge cursor-pointer", e.id === ev.id ? "badge-primary" : "hover:bg-surface-3")}>
                  {e.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="min-w-[200px] flex-1">
            <ProgressBar value={total ? done / total : 0} label={t.evaluation.progress} />
            <p className="mt-1 text-xs text-ink-3">{fmt(t.evaluation.progress, { done, total })}</p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: "fillRatings", evaluatorId: ev.id, score: Math.ceil(scale / 2) })} disabled={done === total}>
            {fmt(t.evaluation.fillAll, { value: Math.ceil(scale / 2) })}
          </button>
          <button type="button" className="btn btn-ghost btn-sm text-bad" onClick={() => setConfirmClear(true)} disabled={done === 0}>
            <Eraser className="h-3.5 w-3.5" aria-hidden /> {t.evaluation.clearAll}
          </button>
        </div>

        {view === "matrix" ? (
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
              <thead>
                <tr>
                  <th scope="col" className="sticky left-0 z-10 bg-surface py-2 pr-3 text-left text-xs font-semibold text-ink-3">
                    {t.common.criterion}
                  </th>
                  {alts.map((a) => (
                    <th key={a.id} scope="col" className="px-2 py-2 text-left text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: seriesColor(analysis.alternatives.indexOf(a)) }} aria-hidden />
                        <span className="truncate" title={a.name}>
                          {a.name || t.common.unnamed}
                        </span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {crits.map((c) => (
                  <tr key={c.id} className="border-t border-line">
                    <th scope="row" className="sticky left-0 z-10 max-w-[200px] bg-surface py-2 pr-3 text-left align-top font-medium">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="truncate">{c.name || t.common.unnamed}</span>
                        {c.isKnockout && (
                          <span className="badge badge-bad" title={t.criteria.knockoutHint}>
                            {t.evaluation.knockoutBadge} {fmt(t.evaluation.minBadge, { min: c.minScore ?? "" })}
                          </span>
                        )}
                      </div>
                      {c.description && <div className="mt-0.5 text-xs font-normal text-ink-3">{c.description}</div>}
                    </th>
                    {alts.map((a) => {
                      const r = ratings[a.id]?.[c.id];
                      const failed = c.isKnockout && typeof r?.score === "number" && typeof c.minScore === "number" && r.score < c.minScore;
                      return (
                        <td key={a.id} className="px-2 py-2 align-top">
                          <ScorePicker scale={scale} value={r?.score} onChange={(v) => setScore(a.id, c.id, v)} label={`${a.name} – ${c.name}`} failed={failed} />
                          <button
                            type="button"
                            className={cn("mt-1 inline-flex items-center gap-1 rounded px-1 text-[11px]", r?.note ? "text-primary" : "text-ink-3 hover:text-ink")}
                            onClick={() => setNoteCell({ altId: a.id, critId: c.id })}
                            aria-label={`${t.evaluation.note}: ${a.name} – ${c.name}`}
                          >
                            <MessageSquare className="h-3 w-3" aria-hidden />
                            {r?.note ? r.note.slice(0, 24) + (r.note.length > 24 ? "…" : "") : t.evaluation.note}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {alts.map((a) => (
              <section key={a.id} className="rounded-xl border border-line p-4" aria-labelledby={`card-${a.id}`}>
                <h2 id={`card-${a.id}`} className="flex items-center gap-2 text-base font-semibold">
                  <span className="h-3 w-3 rounded-full" style={{ background: seriesColor(analysis.alternatives.indexOf(a)) }} aria-hidden />
                  {a.name || t.common.unnamed}
                </h2>
                <ul className="mt-3 space-y-3">
                  {crits.map((c) => {
                    const r = ratings[a.id]?.[c.id];
                    const failed = c.isKnockout && typeof r?.score === "number" && typeof c.minScore === "number" && r.score < c.minScore;
                    return (
                      <li key={c.id}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-medium">{c.name}</span>
                          {c.isKnockout && <span className="badge badge-bad">{t.evaluation.knockoutBadge}</span>}
                        </div>
                        <div className="mt-1">
                          <ScorePicker scale={scale} value={r?.score} onChange={(v) => setScore(a.id, c.id, v)} label={`${a.name} – ${c.name}`} failed={failed} />
                        </div>
                        <input
                          className="input mt-1.5 text-xs"
                          placeholder={t.evaluation.notePlaceholder}
                          value={r?.note ?? ""}
                          maxLength={1000}
                          onChange={(e) => dispatch({ type: "setRating", evaluatorId: ev.id, altId: a.id, critId: c.id, note: e.target.value })}
                          aria-label={`${t.evaluation.note}: ${a.name} – ${c.name}`}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <div className="card p-5">
          <h2 className="text-sm font-semibold">{t.decision.scale}</h2>
          <ol className="mt-2 grid grid-cols-5 gap-1 text-center text-[11px] text-ink-2">
            {Array.from({ length: scale }, (_, i) => i + 1)
              .filter((v) => legend[v - 1])
              .map((v) => (
                <li key={v}>
                  <div className="font-bold text-ink">{v}</div>
                  <div>{legend[v - 1]}</div>
                </li>
              ))}
          </ol>
        </div>
        <Tip>
          <div className="flex gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <ul className="space-y-1.5">
              {t.evaluation.tips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </Tip>
      </aside>

      {noteCell && (
        <NoteDialog
          value={ratings[noteCell.altId]?.[noteCell.critId]?.note ?? ""}
          title={`${analysis.alternatives.find((a) => a.id === noteCell.altId)?.name} – ${crits.find((c) => c.id === noteCell.critId)?.name}`}
          onClose={() => setNoteCell(null)}
          onSave={(note) => {
            dispatch({ type: "setRating", evaluatorId: ev.id, altId: noteCell.altId, critId: noteCell.critId, note });
            setNoteCell(null);
          }}
        />
      )}
      <ConfirmDialog
        open={confirmClear}
        title={t.evaluation.clearAll}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        danger
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          dispatch({ type: "clearRatings", evaluatorId: ev.id });
          setConfirmClear(false);
        }}
      />
    </div>
  );
}

function ScorePicker({ scale, value, onChange, label, failed }: { scale: number; value: number | undefined; onChange: (v: number | undefined) => void; label: string; failed?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={cn("flex flex-wrap gap-0.5 rounded-lg", failed && "ring-2 ring-bad/50")}>
      {Array.from({ length: scale }, (_, i) => i + 1).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          className={cn("score-btn", scale === 10 ? "min-w-[1.6rem] text-[11px]" : "")}
          onClick={() => onChange(value === v ? undefined : v)}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function NoteDialog({ value, title, onClose, onSave }: { value: string; title: string; onClose: () => void; onSave: (v: string) => void }) {
  const { t } = useI18n();
  const [draft, setDraft] = useState(value);
  return (
    <dialog
      open
      className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-line bg-surface p-5 shadow-lg"
      aria-labelledby="note-title"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <h2 id="note-title" className="text-base font-semibold">
        {t.evaluation.note}
      </h2>
      <p className="mt-0.5 text-xs text-ink-3">{title}</p>
      <textarea className="input mt-3" value={draft} maxLength={1000} onChange={(e) => setDraft(e.target.value)} placeholder={t.evaluation.notePlaceholder} autoFocus />
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          {t.common.cancel}
        </button>
        <button type="button" className="btn btn-primary" onClick={() => onSave(draft)}>
          {t.common.save}
        </button>
      </div>
    </dialog>
  );
}
