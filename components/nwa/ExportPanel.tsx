"use client";

import { useState } from "react";
import { Printer, FileSpreadsheet, FileJson, FileText, Link2, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAnalysis } from "@/lib/nwa/store";
import { encodeShareFragment, toCsv, toExportFile, toMarkdown } from "@/lib/nwa/serialize";
import { library } from "@/lib/nwa/library";
import { copyToClipboard, downloadBlob, fmt, slugify } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

const MAX_URL = 30000;

export function ExportPanel() {
  const { t } = useI18n();
  const { analysis } = useAnalysis();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const base = slugify(analysis.title || "nutzwertanalyse");

  const share = async () => {
    library.save(analysis);
    const frag = await encodeShareFragment(analysis);
    const url = `${window.location.origin}/app/teilen#${frag}`;
    if (url.length > MAX_URL) {
      toast(fmt(t.results.shareTooLong, { size: url.length }), "error");
      return;
    }
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast(t.results.shareCopied, "success");
      window.setTimeout(() => setCopied(false), 3000);
    } else {
      window.prompt(t.results.shareLink, url);
    }
  };

  const openPrint = () => {
    library.save(analysis);
    window.open(`/app/analyse?id=${encodeURIComponent(analysis.id)}&print=1`, "_blank", "noopener");
  };

  const items = [
    { icon: Printer, label: t.results.pdf, hint: t.results.pdfHint, onClick: openPrint },
    {
      icon: FileSpreadsheet,
      label: t.results.csv,
      onClick: () =>
        downloadBlob(`${base}.csv`, toCsv(analysis, { criterion: t.common.criterion, weight: t.common.weight, total: t.common.total, rank: t.common.rank, category: t.common.category }), "text/csv;charset=utf-8"),
    },
    {
      icon: FileText,
      label: t.results.md,
      onClick: () =>
        downloadBlob(
          `${base}.md`,
          toMarkdown(analysis, {
            alternatives: t.common.alternative,
            criteria: t.common.criterion,
            weight: t.common.weight,
            result: t.results.title,
            rank: t.common.rank,
            score: t.common.score,
            description: t.decision.description,
            goal: t.decision.goal,
            constraints: t.decision.constraints,
            conclusion: t.results.conclusion,
            knockedOut: t.results.knockedOut,
          }),
          "text/markdown;charset=utf-8",
        ),
    },
    { icon: FileJson, label: t.results.json, onClick: () => downloadBlob(`${base}.json`, toExportFile([analysis]), "application/json") },
  ];

  return (
    <section className="card p-5" aria-labelledby="export-h">
      <h2 id="export-h" className="text-base font-semibold">
        {t.results.export}
      </h2>
      <p className="mt-1 text-xs text-ink-3">{t.results.exportLead}</p>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {items.map((it) => (
          <li key={it.label}>
            <button type="button" onClick={it.onClick} className="btn btn-secondary w-full justify-start">
              <it.icon className="h-4 w-4 text-primary" aria-hidden />
              <span className="truncate">{it.label}</span>
            </button>
            {it.hint && <p className="mt-1 px-1 text-[11px] text-ink-3">{it.hint}</p>}
          </li>
        ))}
        <li className="sm:col-span-2">
          <button type="button" onClick={share} className="btn btn-primary w-full justify-start">
            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            {copied ? t.common.copied : t.results.shareLink}
          </button>
          <p className="mt-1 px-1 text-[11px] text-ink-3">{t.results.shareHint}</p>
        </li>
      </ul>
    </section>
  );
}
