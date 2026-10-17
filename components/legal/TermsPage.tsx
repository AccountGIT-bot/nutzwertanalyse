"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, FileText, Hand, Info, Languages, Link2, Scale, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { legalDe } from "@/lib/legal/de";
import { legalEn } from "@/lib/legal/en";
import { termsDe } from "@/lib/legal/terms-de";
import { termsEn } from "@/lib/legal/terms-en";
import { clauseId, type TermsClause, type TermsDoc, type TermsTag } from "@/lib/legal/terms";
import { operatorHasPlaceholders } from "@/lib/site";
import { cn, fmt } from "@/lib/utils";
import { PageShell, Container } from "@/components/layout/PageShell";
import { LegalBlockView, LegalNav, RichText } from "./LegalPage";

const TAG_ORDER: TermsTag[] = ["limit", "right", "duty", "promise", "info"];
const TAG_ICON: Record<TermsTag, typeof Info> = { limit: AlertTriangle, right: Scale, duty: Hand, promise: ShieldCheck, info: Info };

function TagChip({ tag, label }: { tag: TermsTag; label: string }) {
  const Icon = TAG_ICON[tag];
  return (
    <span className={cn("terms-tag", `terms-tag-${tag}`)}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

/** Ungefähre Lesezeit der verbindlichen Texte (200 Wörter pro Minute). */
function readingMinutes(doc: TermsDoc): number {
  const text = [
    ...doc.summary.map((s) => s.text),
    ...doc.clauses.flatMap((c) => [c.title, c.short, ...c.items.flatMap((i) => [i.text, ...(i.list ?? [])])]),
  ].join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

function Clause({ c, hidden, labels }: { c: TermsClause; hidden: boolean; labels: ReturnType<typeof useLabels> }) {
  const limit = c.tags.includes("limit");
  const id = clauseId(c.n);
  return (
    <article id={id} hidden={hidden} aria-labelledby={`${id}-h`} className={cn("terms-clause scroll-mt-24 rounded-2xl border p-5 sm:p-7", limit ? "terms-clause-limit" : "border-line bg-surface")}>
      {limit && (
        <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-warn">
          <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
          {labels.attention}
        </p>
      )}
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <a href={`#${id}`} className="terms-anchor inline-flex items-center gap-1 text-sm font-semibold tabular-nums text-ink-3 hover:text-primary" aria-label={fmt(labels.clauseLink, { n: c.n })}>
            {fmt(labels.clause, { n: c.n })}
            <Link2 className="h-3.5 w-3.5 opacity-0 transition-opacity" aria-hidden />
          </a>
          <h2 id={`${id}-h`} className="mt-0.5 text-xl font-bold tracking-tight text-ink sm:text-2xl">
            {c.title}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {c.tags.map((tg) => (
            <TagChip key={tg} tag={tg} label={labels.tags[tg]} />
          ))}
        </div>
      </header>

      <div className={cn("mt-4 rounded-xl px-4 py-3", limit ? "bg-surface" : "bg-primary-soft")}>
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-primary">{labels.short}</p>
        <p className="mt-1 text-base font-medium leading-relaxed text-ink">{c.short}</p>
      </div>

      <ol className="mt-5 grid gap-3">
        {c.items.map((it) => (
          <li key={it.n} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-2">
            <span className="pt-0.5 text-sm font-medium tabular-nums text-ink-3">{it.n}</span>
            <div className="min-w-0 text-[0.95rem] leading-relaxed text-ink-2">
              <p>
                <RichText text={it.text} />
              </p>
              {it.list && (
                <ul className="mt-2 grid gap-1.5">
                  {it.list.map((li) => (
                    <li key={li} className="flex gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>

      {c.basis && (
        <p className="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-ink-3">
          <span className="font-semibold text-ink-2">{labels.basis}:</span> {c.basis}
        </p>
      )}
    </article>
  );
}

/** Nur das Datum, ohne Uhrzeit. */
function formatDay(iso: string, localeTag: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function useLabels() {
  return useI18n().t.termsPage;
}

export function TermsPage() {
  const { locale, tag } = useI18n();
  const labels = useLabels();
  const [override, setOverride] = useState<"de" | "en" | null>(null);
  const [filter, setFilter] = useState<TermsTag | "all">("all");

  const docLang = override ?? (locale === "en" ? "en" : "de");
  const doc = docLang === "en" ? termsEn : termsDe;
  const legal = docLang === "en" ? legalEn : legalDe;
  const minutes = useMemo(() => readingMinutes(doc), [doc]);
  const counts = useMemo(() => {
    const m = Object.fromEntries(TAG_ORDER.map((tg) => [tg, 0])) as Record<TermsTag, number>;
    for (const c of doc.clauses) for (const tg of c.tags) m[tg] += 1;
    return m;
  }, [doc]);
  const limitClauses = doc.clauses.filter((c) => c.tags.includes("limit"));
  const isVisible = (c: TermsClause) => filter === "all" || c.tags.includes(filter);
  const showAll = () => setFilter("all");

  return (
    <PageShell>
      <div className="terms-page">
        {/* Kopf */}
        <section className="border-b border-line">
          <Container className="py-10 sm:py-14">
            <p className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-primary">
              <Scale className="h-4 w-4" aria-hidden />
              {labels.law}
            </p>
            <h1 className="mt-3 text-[2rem] font-bold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-5xl">{doc.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink-2">{doc.lead}</p>
            <ul className="mt-6 flex flex-wrap gap-2 text-sm">
              <li className="badge">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                {fmt(labels.version, { n: doc.version, date: formatDay(doc.date, tag) })}
              </li>
              <li className="badge">{fmt(labels.readingTime, { min: minutes })}</li>
              <li className="badge">{fmt(labels.clauses, { n: doc.clauses.length })}</li>
              <li className="terms-tag terms-tag-limit">
                <AlertTriangle className="h-3 w-3" aria-hidden />
                {fmt(labels.limits, { n: limitClauses.length })}
              </li>
            </ul>
            <div className="no-print mt-5 flex flex-wrap items-center gap-3">
              {labels.translationNote && <p className="text-sm text-ink-2">{labels.translationNote}</p>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOverride(docLang === "de" ? "en" : "de")}>
                <Languages className="h-4 w-4" aria-hidden />
                {docLang === "de" ? labels.showEnglish : labels.showGerman}
              </button>
            </div>
            {operatorHasPlaceholders() && (
              <div role="alert" className="mt-6 flex gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                <span>{legal.placeholderWarning}</span>
              </div>
            )}
          </Container>
        </section>

        {/* Das Wichtigste */}
        <section className="paper border-b border-line" aria-labelledby="terms-summary-h">
          <Container className="py-10 sm:py-14">
            <h2 id="terms-summary-h" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {labels.summaryTitle}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-ink-2">{labels.summaryNote}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {doc.summary.map((s) => (
                <li key={s.text} className={cn("terms-summary flex flex-col rounded-2xl border p-4", s.tag === "limit" ? "terms-clause-limit" : "border-line bg-surface")}>
                  <TagChip tag={s.tag} label={labels.tags[s.tag]} />
                  <p className="mt-3 flex-1 text-[0.95rem] font-medium leading-snug text-ink">{s.text}</p>
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    {s.refs.map((r) => (
                      <a key={r} href={`#${clauseId(r)}`} onClick={showAll} className="font-medium text-primary underline-offset-4 hover:underline">
                        {fmt(labels.clause, { n: r })} →
                      </a>
                    ))}
                  </p>
                </li>
              ))}
            </ul>

            {/* Legende */}
            <div className="mt-10 grid gap-6 rounded-2xl border border-line bg-surface p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div>
                <h2 className="text-lg font-bold tracking-tight">{labels.legendTitle}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{labels.legendIntro}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{labels.whyMarked}</p>
              </div>
              <ul className="grid content-start gap-2.5">
                {TAG_ORDER.map((tg) => (
                  <li key={tg} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <TagChip tag={tg} label={labels.tags[tg]} />
                    <span className="text-ink-2">{labels.tagHelp[tg]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* Klauseln */}
        <Container className="terms-layout grid gap-10 py-10 sm:py-14 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="no-print hidden lg:block">
            <nav aria-label={labels.toc} className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">{labels.toc}</p>
              <ol className="mt-3 grid gap-0.5 text-sm">
                {doc.clauses.map((c) => (
                  <li key={c.n}>
                    <a
                      href={`#${clauseId(c.n)}`}
                      onClick={() => !isVisible(c) && showAll()}
                      className={cn("flex gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2", !isVisible(c) && "opacity-40")}
                    >
                      <span className="w-5 shrink-0 text-right tabular-nums text-ink-3">{c.n}</span>
                      <span className={cn("min-w-0", c.tags.includes("limit") ? "font-medium text-warn" : "text-ink-2")}>{c.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0">
            <div role="group" aria-label={labels.filterLabel} className="no-print flex flex-wrap gap-2">
              <button type="button" aria-pressed={filter === "all"} onClick={showAll} className={cn("terms-filter", filter === "all" && "is-active")}>
                {labels.filterAll} <span className="tabular-nums opacity-70">{doc.clauses.length}</span>
              </button>
              {TAG_ORDER.map((tg) => (
                <button key={tg} type="button" aria-pressed={filter === tg} onClick={() => setFilter(tg)} className={cn("terms-filter", `terms-filter-${tg}`, filter === tg && "is-active")}>
                  {labels.tags[tg]} <span className="tabular-nums opacity-70">{counts[tg]}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-5">
              {doc.clauses.map((c) => (
                <Clause key={c.n} c={c} hidden={!isVisible(c)} labels={labels} />
              ))}
            </div>

            {/* Fassungen */}
            <section aria-labelledby="terms-history-h" className="mt-14">
              <h2 id="terms-history-h" className="text-2xl font-bold tracking-tight">
                {labels.historyTitle}
              </h2>
              <ol className="mt-5 grid gap-4">
                {doc.history.map((h) => {
                  const archived = doc.archive.find((a) => a.version === h.version);
                  return (
                    <li key={h.version} className="rounded-2xl border border-line bg-surface p-5">
                      <p className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold text-ink">{fmt(labels.version, { n: h.version, date: formatDay(h.date, tag) })}</span>
                        {h.version === doc.version && <span className="terms-tag terms-tag-right">{labels.current}</span>}
                      </p>
                      <p className="mt-2 text-sm text-ink-2">{h.note}</p>
                      {h.changes.length > 0 && (
                        <ul className="mt-3 grid gap-1.5 text-sm text-ink-2">
                          {h.changes.map((ch) => (
                            <li key={ch} className="flex gap-2">
                              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden />
                              <span>{ch}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {archived && (
                        <details className="no-print mt-4 rounded-xl border border-line bg-surface-2 px-4 py-3">
                          <summary className="cursor-pointer text-sm font-medium text-primary">{fmt(labels.showArchive, { n: archived.version })}</summary>
                          <div className="prose-legal mt-3">
                            <p>{archived.intro}</p>
                            {archived.blocks.map((b, i) => (
                              <LegalBlockView key={i} b={b} />
                            ))}
                          </div>
                        </details>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            <p className="mt-8 text-xs text-ink-3">{docLang === "de" ? legalDe.bindingNote : legalEn.bindingNote}</p>
            <LegalNav />
          </div>
        </Container>
      </div>
    </PageShell>
  );
}
