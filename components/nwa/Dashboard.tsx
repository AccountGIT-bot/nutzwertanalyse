"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Plus, Upload, Download, Trash2, Copy, FolderOpen, Sparkles, AlertTriangle, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useConsent } from "@/lib/consent/ConsentProvider";
import { library, type LibraryEntry } from "@/lib/nwa/library";
import { demoAnalysis } from "@/lib/nwa/presets";
import { duplicateAnalysis } from "@/lib/nwa/factory";
import { parseImport, toExportFile } from "@/lib/nwa/serialize";
import { progress } from "@/lib/nwa/calc";
import { downloadBlob, fmt, formatDate } from "@/lib/utils";
import { PageShell, Container } from "@/components/layout/PageShell";
import { ProgressBar } from "@/components/ui/Controls";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { SmartStart } from "./SmartStart";
import { PresetGrid } from "./PresetGrid";

export function Dashboard() {
  const { t, tag } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const { functional, loading, openDialog } = useConsent();
  const entries = useSyncExternalStore(
    (cb) => library.subscribe(cb),
    () => library.list(),
    () => [] as LibraryEntry[],
  );
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<{ type: "one"; id: string } | { type: "all" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? entries.filter((e) => e.title.toLowerCase().includes(q)) : entries;
  }, [entries, query]);

  const loadDemo = () => {
    const a = demoAnalysis(t);
    library.save(a);
    router.push(`/app/analyse?id=${encodeURIComponent(a.id)}`);
  };

  const onImport = async (file: File) => {
    try {
      const text = await file.text();
      const list = parseImport(text);
      if (!list.length) {
        toast(t.dashboard.importFailed, "error");
        return;
      }
      for (const a of list) {
        // ID-Kollision vermeiden
        const exists = library.get(a.id);
        library.save(exists ? duplicateAnalysis(a, "") : a);
      }
      toast(fmt(t.dashboard.imported, { count: list.length }), "success");
    } catch {
      toast(t.dashboard.importFailed, "error");
    }
  };

  return (
    <PageShell>
      <Container className="py-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h1>
            <p className="mt-1 text-sm text-ink-2">{t.dashboard.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/app/analyse?new=1" className="btn btn-primary">
              <Plus className="h-4 w-4" aria-hidden /> {t.dashboard.new}
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" aria-hidden /> {t.dashboard.import}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              aria-label={t.dashboard.importHint}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImport(f);
                e.target.value = "";
              }}
            />
            <button type="button" className="btn btn-secondary" onClick={loadDemo}>
              <Sparkles className="h-4 w-4" aria-hidden /> {t.dashboard.example}
            </button>
          </div>
        </div>

        <div className="mt-8">
          <SmartStart />
        </div>

        {!loading && !functional && (
          <div role="status" className="mt-6 flex flex-col gap-3 rounded-xl border border-warn/40 bg-warn-soft p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
              <div>
                <div className="font-semibold">{t.dashboard.storageOff}</div>
                <p className="mt-0.5 text-ink-2">{t.dashboard.storageOffText}</p>
              </div>
            </div>
            <button type="button" className="btn btn-secondary shrink-0" onClick={openDialog}>
              {t.dashboard.enableStorage}
            </button>
          </div>
        )}

        {entries.length > 0 && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="relative block w-full sm:max-w-xs">
              <span className="sr-only">{t.dashboard.search}</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
              <input className="input pl-9" placeholder={t.dashboard.search} value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => downloadBlob(`nutzwertanalyse-export-${new Date().toISOString().slice(0, 10)}.json`, toExportFile(library.exportAll()), "application/json")}
              >
                <Download className="h-4 w-4" aria-hidden /> {t.dashboard.exportAll}
              </button>
              <button type="button" className="btn btn-ghost btn-sm text-bad" onClick={() => setConfirm({ type: "all" })}>
                <Trash2 className="h-4 w-4" aria-hidden /> {t.dashboard.deleteAll}
              </button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="card mt-6 flex flex-col items-center px-6 py-16 text-center">
            <FolderOpen className="h-10 w-10 text-ink-3" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold">{t.dashboard.empty}</h2>
            <p className="mt-1 max-w-md text-sm text-ink-2">{t.dashboard.emptyText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Link href="/app/analyse?new=1" className="btn btn-primary">
                <Plus className="h-4 w-4" aria-hidden /> {t.dashboard.new}
              </Link>
              <button type="button" className="btn btn-secondary" onClick={loadDemo}>
                <Sparkles className="h-4 w-4" aria-hidden /> {t.dashboard.example}
              </button>
            </div>
          </div>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <AnalysisCard
                key={e.id}
                entry={e}
                dateLabel={formatDate(e.updatedAt, tag)}
                onDuplicate={() => {
                  const a = library.get(e.id);
                  if (a) library.save(duplicateAnalysis(a, " (2)"));
                }}
                onDelete={() => setConfirm({ type: "one", id: e.id })}
              />
            ))}
          </ul>
        )}

        <section className="mt-12" aria-labelledby="presets-h">
          <h2 id="presets-h" className="text-lg font-semibold">
            {t.landing.presetsTitle}
          </h2>
          <p className="mt-1 text-sm text-ink-2">{t.landing.presetsLead}</p>
          <div className="mt-4">
            <PresetGrid />
          </div>
        </section>

        <ConfirmDialog
          open={confirm !== null}
          title={confirm?.type === "all" ? t.dashboard.deleteAll : t.wizard.deleteAnalysis}
          text={confirm?.type === "all" ? t.dashboard.confirmDeleteAll : t.dashboard.confirmDelete}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          danger
          onCancel={() => setConfirm(null)}
          onConfirm={() => {
            if (confirm?.type === "one") library.remove(confirm.id);
            if (confirm?.type === "all") library.clear();
            setConfirm(null);
          }}
        />
      </Container>
    </PageShell>
  );
}

function AnalysisCard({ entry, dateLabel, onDuplicate, onDelete }: { entry: LibraryEntry; dateLabel: string; onDuplicate: () => void; onDelete: () => void }) {
  const { t } = useI18n();
  const a = library.get(entry.id);
  const prog = a ? progress(a) : 0;
  const preset = entry.presetId ? t.presets[entry.presetId]?.label : undefined;
  return (
    <li className="card flex flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/app/analyse?id=${encodeURIComponent(entry.id)}`} className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold hover:text-primary">{entry.title || t.common.untitled}</h2>
          <p className="mt-0.5 text-xs text-ink-3">
            {t.dashboard.updated}: {dateLabel}
          </p>
        </Link>
        {preset && <span className="badge shrink-0">{preset}</span>}
      </div>
      <dl className="mt-3 flex gap-4 text-xs text-ink-2">
        <div>
          <dt className="sr-only">{t.steps.alternatives.label}</dt>
          <dd>
            {entry.alternatives} {t.steps.alternatives.label}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t.steps.criteria.label}</dt>
          <dd>
            {entry.criteria} {t.steps.criteria.label}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t.dashboard.stepLabel}</dt>
          <dd>{t.steps[entry.step].short}</dd>
        </div>
      </dl>
      <div className="mt-3 flex items-center gap-2">
        <ProgressBar value={prog} label={t.dashboard.progress} className="flex-1" />
        <span className="text-xs tabular text-ink-3">{Math.round(prog * 100)} %</span>
      </div>
      <div className="mt-4 flex items-center gap-1 border-t border-line pt-3">
        <Link href={`/app/analyse?id=${encodeURIComponent(entry.id)}`} className="btn btn-primary btn-sm">
          {t.common.open}
        </Link>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onDuplicate}>
          <Copy className="h-3.5 w-3.5" aria-hidden /> {t.common.duplicate}
        </button>
        <button type="button" className="btn btn-ghost btn-sm ml-auto text-bad" onClick={onDelete} aria-label={`${t.common.delete}: ${entry.title}`}>
          <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </li>
  );
}
