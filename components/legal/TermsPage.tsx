"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Languages, Link2, Scale, ShieldCheck } from "lucide-react";
import { translations, useI18n } from "@/lib/i18n";
import { legalDe } from "@/lib/legal/de";
import { legalEn } from "@/lib/legal/en";
import { termsDe } from "@/lib/legal/terms-de";
import { termsEn } from "@/lib/legal/terms-en";
import { clauseId, type TermsClause, type TermsDoc, type TermsTag } from "@/lib/legal/terms";
import { operatorHasPlaceholders } from "@/lib/site";
import { cn, fmt } from "@/lib/utils";
import { PageShell, Container } from "@/components/layout/PageShell";
import { LegalBlockView, LegalNav, RichText } from "./LegalPage";

/** Ungefähre Lesezeit der verbindlichen Texte (200 Wörter pro Minute). */
function readingMinutes(doc: TermsDoc): number {
  const text = doc.clauses.flatMap((c) => [c.title, c.short, ...c.items.flatMap((i) => [i.text, ...(i.list ?? [])])]).join(" ");
  return Math.max(1, Math.round(text.split(/\s+/).length / 200));
}

/** Nur das Datum, ohne Uhrzeit. */
function formatDay(iso: string, localeTag: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" });
}

function SummaryIcon({ tag }: { tag: TermsTag }) {
  if (tag === "limit") return <AlertTriangle className="h-4 w-4 text-warn" aria-hidden />;
  if (tag === "promise") return <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />;
  return <Check className="h-4 w-4 text-primary" aria-hidden />;
}

function Clause({ c, labels }: { c: TermsClause; labels: Labels }) {
  const limit = c.tags.includes("limit");
  const id = clauseId(c.n);
  return (
    <article id={id} aria-labelledby={`${id}-h`} className={cn("terms-clause scroll-mt-28", limit ? "terms-clause-limit rounded-2xl px-6 py-6 sm:px-8 sm:py-8" : "border-t border-line pt-10")}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h2 id={`${id}-h`} className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
          <a href={`#${id}`} className="group inline-flex items-baseline gap-2" aria-label={fmt(labels.clauseLink, { n: c.n })}>
            <span className="tabular-nums text-ink-3">{c.n}.</span>
            <span>{c.title}</span>
            <Link2 className="h-4 w-4 self-center text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
          </a>
        </h2>
        {limit && (
          <span className="terms-tag terms-tag-limit">
            <AlertTriangle className="h-3 w-3" aria-hidden />
            {labels.tags.limit}
          </span>
        )}
      </header>

      <p className="mt-4 text-base font-medium leading-relaxed text-ink sm:text-[1.05rem]">
        <span className="text-primary">{labels.short}:</span> {c.short}
      </p>

      <ol className="mt-6 grid gap-4">
        {c.items.map((it) => (
          <li key={it.n} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-2">
            <span className="pt-0.5 text-sm tabular-nums text-ink-3">{it.n}</span>
            <div className="min-w-0 text-[0.95rem] leading-relaxed text-ink-2">
              <p>
                <RichText text={it.text} />
              </p>
              {it.list && (
                <ul className="mt-2 grid gap-1.5">
                  {it.list.map((li) => (
                    <li key={li} className="flex gap-2">
                      <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-ink-3" aria-hidden />
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
        <>
          <details className="no-print mt-5 text-xs text-ink-3">
            <summary className="cursor-pointer select-none font-medium text-ink-2 hover:text-primary">{labels.basis}</summary>
            <p className="mt-1.5 leading-relaxed">{c.basis}</p>
          </details>
          <p className="print-only mt-4 text-xs leading-relaxed text-ink-3">
            <span className="font-medium">{labels.basis}:</span> {c.basis}
          </p>
        </>
      )}
    </article>
  );
}

type Labels = (typeof translations)["de"]["termsPage"];

export function TermsPage() {
  const { locale, tag } = useI18n();
  const [override, setOverride] = useState<"de" | "en" | null>(null);

  const docLang = override ?? (locale === "en" ? "en" : "de");
  /* Beschriftungen folgen der Dokumentsprache; Datum dem Zahlenformat der Oberfläche. */
  const labels = translations[docLang].termsPage;
  const doc = docLang === "en" ? termsEn : termsDe;
  const legal = docLang === "en" ? legalEn : legalDe;
  const minutes = useMemo(() => readingMinutes(doc), [doc]);
  const limitCount = doc.clauses.filter((c) => c.tags.includes("limit")).length;

  return (
    <PageShell>
      <div className="terms-page" lang={docLang}>
        {/* Kopf, weiss, viel Luft */}
        <section className="border-b border-line">
          <Container className="py-14 sm:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                <Scale className="h-4 w-4" aria-hidden />
                {labels.law}
              </p>
              <h1 className="mt-4 text-[2rem] font-bold leading-tight tracking-tight [overflow-wrap:anywhere] sm:text-5xl">{doc.title}</h1>
              <p className="mt-5 text-lg leading-relaxed text-ink-2">{doc.lead}</p>
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-3">
                <span>{fmt(labels.version, { n: doc.version, date: formatDay(doc.date, tag) })}</span>
                <span aria-hidden>·</span>
                <span>{fmt(labels.readingTime, { min: minutes })}</span>
                <span aria-hidden>·</span>
                <span>{fmt(labels.limits, { n: limitCount })}</span>
                <span className="no-print" aria-hidden>
                  ·
                </span>
                <button type="button" className="no-print inline-flex items-center gap-1 font-medium text-primary hover:underline" onClick={() => setOverride(docLang === "de" ? "en" : "de")}>
                  <Languages className="h-3.5 w-3.5" aria-hidden />
                  {docLang === "de" ? labels.showEnglish : labels.showGerman}
                </button>
              </p>
              {docLang === "de" && (locale === "fr" || locale === "it") && <p className="mt-2 text-sm text-ink-3">{translations[locale].termsPage.translationNote}</p>}
              {operatorHasPlaceholders() && (
                <div role="alert" className="mt-8 flex gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                  <span>{legal.placeholderWarning}</span>
                </div>
              )}
            </div>
          </Container>
        </section>

        {/* Das Wichtigste: weisse Karte auf weichgezeichneter Videoschleife */}
        <section id="terms-summary" aria-labelledby="terms-summary-h" className="relative isolate scroll-mt-28 overflow-hidden border-b border-line">
          <div className="no-print absolute inset-0" aria-hidden>
            {/* Poster liegt immer darunter; bei «Bewegung reduzieren» wird nur das Video ausgeblendet */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/video/terms-bg-poster.jpg" alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            <video className="terms-video absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" poster="/video/terms-bg-poster.jpg" tabIndex={-1}>
              <source src="/video/terms-bg.webm" type="video/webm" />
              <source src="/video/terms-bg.mp4" type="video/mp4" />
            </video>
            <div className="terms-video-veil absolute inset-0" />
          </div>
          <Container className="relative py-12 sm:py-16">
            <div className="card mx-auto max-w-4xl p-6 shadow-lg sm:p-10">
              <h2 id="terms-summary-h" className="text-2xl font-bold tracking-tight sm:text-3xl">
                {labels.summaryTitle}
              </h2>
              <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {doc.summary.map((s) => (
                  <li key={s.text} className="flex gap-3">
                    <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", s.tag === "limit" ? "bg-warn-soft" : "bg-primary-soft")}>
                      <SummaryIcon tag={s.tag} />
                    </span>
                    <div className="min-w-0 leading-snug">
                      <p className="text-ink">{s.text}</p>
                      <p className="mt-1.5 flex flex-wrap gap-x-3 text-sm">
                        {s.refs.map((r) => (
                          <a key={r} href={`#${clauseId(r)}`} className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline">
                            {fmt(labels.clause, { n: r })}
                            <ArrowRight className="h-3 w-3" aria-hidden />
                          </a>
                        ))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-8 border-t border-line pt-5 text-sm leading-relaxed text-ink-3">
                {labels.summaryNote} {labels.legendIntro}
              </p>
            </div>
          </Container>
        </section>

        {/* Klauseln, weiss, mit Inhaltsverzeichnis */}
        <Container className="terms-layout grid gap-x-12 py-14 sm:py-20 lg:grid-cols-[13rem_minmax(0,1fr)]">
          <aside className="no-print hidden lg:block">
            <nav aria-label={labels.toc} className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-3">{labels.toc}</p>
              <ol className="mt-3 grid gap-0.5 text-sm">
                <li>
                  <a href="#terms-summary" className="flex gap-2 rounded-lg px-2 py-1.5 font-medium text-ink hover:bg-surface-2">
                    <span className="w-4 shrink-0" />
                    {labels.summaryTitle}
                  </a>
                </li>
                {doc.clauses.map((c) => (
                  <li key={c.n}>
                    <a href={`#${clauseId(c.n)}`} className="flex gap-2 rounded-lg px-2 py-1.5 text-ink-2 hover:bg-surface-2">
                      <span className="w-4 shrink-0 text-right tabular-nums text-ink-3">{c.n}</span>
                      <span className={cn("min-w-0", c.tags.includes("limit") && "font-medium text-warn")}>{c.title}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="min-w-0 max-w-3xl">
            <div className="grid gap-10">
              {doc.clauses.map((c) => (
                <Clause key={c.n} c={c} labels={labels} />
              ))}
            </div>

            {/* Fassungen */}
            <section aria-labelledby="terms-history-h" className="mt-16 border-t border-line pt-10">
              <h2 id="terms-history-h" className="text-xl font-bold tracking-tight">
                {labels.historyTitle}
              </h2>
              <ol className="mt-5 grid gap-3">
                {doc.history.map((h) => {
                  const archived = doc.archive.find((a) => a.version === h.version);
                  return (
                    <li key={h.version} className="text-sm">
                      <details className="rounded-xl border border-line bg-surface px-4 py-3">
                        <summary className="flex cursor-pointer flex-wrap items-center gap-2 font-medium text-ink">
                          {fmt(labels.version, { n: h.version, date: formatDay(h.date, tag) })}
                          {h.version === doc.version && <span className="badge badge-good">{labels.current}</span>}
                          <span className="ml-auto font-normal text-ink-3">{h.note}</span>
                        </summary>
                        <ul className="mt-3 grid gap-1.5 text-ink-2">
                          {h.changes.map((ch) => (
                            <li key={ch} className="flex gap-2">
                              <span className="mt-[0.6rem] h-1 w-1 shrink-0 rounded-full bg-ink-3" aria-hidden />
                              <span>{ch}</span>
                            </li>
                          ))}
                        </ul>
                        {archived && (
                          <details className="no-print mt-3 rounded-lg bg-surface-2 px-3 py-2">
                            <summary className="cursor-pointer font-medium text-primary">{fmt(labels.showArchive, { n: archived.version })}</summary>
                            <div className="prose-legal mt-3">
                              <p>{archived.intro}</p>
                              {archived.blocks.map((b, i) => (
                                <LegalBlockView key={i} b={b} />
                              ))}
                            </div>
                          </details>
                        )}
                      </details>
                    </li>
                  );
                })}
              </ol>
            </section>

            <p className="mt-8 text-xs text-ink-3">{legal.bindingNote}</p>
            <LegalNav />
          </div>
        </Container>
      </div>
    </PageShell>
  );
}
