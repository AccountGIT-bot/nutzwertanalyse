"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, ArrowRight, X, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { parseInput, PRESET_IDS, type ParsedInput, type PresetId } from "@/lib/nwa/parser";
import { analysisFromPreset } from "@/lib/nwa/presets";
import { library } from "@/lib/nwa/library";
import { cn } from "@/lib/utils";

export function SmartStart() {
  const { t } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedInput | null>(null);
  const [presetId, setPresetId] = useState<PresetId>("custom");
  const [title, setTitle] = useState("");
  const [alts, setAlts] = useState<string[]>([]);

  const analyse = (value: string) => {
    const p = parseInput(value);
    setParsed(p);
    setPresetId(p.presetId);
    setTitle(p.title);
    setAlts(p.alternatives);
  };

  const start = () => {
    const a = analysisFromPreset(t, { presetId, title, alternatives: alts.filter((x) => x.trim()), selfName: t.decision.self });
    library.save(a);
    router.push(`/app/analyse?id=${encodeURIComponent(a.id)}`);
  };

  return (
    <div className="card p-4 sm:p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) analyse(text);
        }}
      >
        <label htmlFor="smart-input" className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          {t.landing.smartTitle}
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="smart-input"
            className="input flex-1"
            placeholder={t.landing.smartPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            autoComplete="off"
          />
          <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
            {t.landing.smartButton}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-3">
          <Lock className="h-3 w-3" aria-hidden /> {t.landing.smartHint}
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t.common.example}>
          {t.landing.smartExamples.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                className="badge cursor-pointer hover:bg-surface-3"
                onClick={() => {
                  setText(ex);
                  analyse(ex);
                }}
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </form>

      {parsed && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-primary-soft/40 p-4 fade-up" role="region" aria-label={t.smart.title}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold">{t.smart.title}</h3>
              <span className={cn("badge mt-1", parsed.confidence === "high" ? "badge-good" : parsed.confidence === "medium" ? "badge-warn" : "")}>{t.smart.confidence[parsed.confidence]}</span>
            </div>
            <button type="button" className="btn btn-ghost btn-icon" onClick={() => setParsed(null)} aria-label={t.smart.cancel}>
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="smart-title" className="text-xs font-medium text-ink-2">
                {t.smart.titleLabel}
              </label>
              <input id="smart-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={300} />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="smart-preset" className="text-xs font-medium text-ink-2">
                {t.smart.detected}
              </label>
              <select id="smart-preset" className="input" value={presetId} onChange={(e) => setPresetId(e.target.value as PresetId)}>
                {[...PRESET_IDS, "custom" as const].map((p) => (
                  <option key={p} value={p}>
                    {t.presets[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-xs font-medium text-ink-2">{t.smart.alternativesLabel}</p>
            {alts.length ? (
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {alts.map((a, i) => (
                  <li key={i} className="badge badge-primary">
                    {a}
                    <button type="button" className="ml-1 rounded hover:text-bad" aria-label={`${t.common.remove}: ${a}`} onClick={() => setAlts(alts.filter((_, j) => j !== i))}>
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-ink-3">{t.smart.noAlternatives}</p>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={start} disabled={!title.trim()}>
              {t.smart.start}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setParsed(null)}>
              {t.smart.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
