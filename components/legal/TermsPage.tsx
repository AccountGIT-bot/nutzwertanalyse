"use client";

import { useMemo } from "react";
import { AlertTriangle, ArrowRight, Check, Clock, FileText, Link2, Scale, ShieldCheck } from "lucide-react";
import { translations, useI18n } from "@/lib/i18n";
import { legalDe } from "@/lib/legal/de";
import { legalEn } from "@/lib/legal/en";
import { termsDe } from "@/lib/legal/terms-de";
import { termsEn } from "@/lib/legal/terms-en";
import { clauseId, type TermsClause, type TermsDoc, type TermsTag } from "@/lib/legal/terms";
import { operatorHasPlaceholders } from "@/lib/site";
import { cn, fmt } from "@/lib/utils";
import { PageShell, Container } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
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

/**
 * Waage-Video als Bühne des Titelbereichs. Mobil ein Streifen unter dem Text,
 * ab lg die rechte Seite mit Verlauf in die Seitenfarbe. Poster liegt immer darunter;
 * bei «Bewegung reduzieren» wird nur das Video ausgeblendet.
 */
function TermsStage() {
  const pos = "lg:object-[20%_50%]";
  return (
    <div className="no-print relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[60%] xl:w-[64%]" aria-hidden>
      <div className="terms-hero-media absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/video/terms-bg-poster.jpg" alt="" className={cn("absolute inset-0 h-full w-full object-cover", pos)} decoding="async" />
        <video className={cn("terms-video absolute inset-0 h-full w-full object-cover", pos)} autoPlay muted loop playsInline preload="metadata" poster="/video/terms-bg-poster.jpg" tabIndex={-1}>
          {/* Scharfe 1080p-Fassung ab Tablet-Breite, 720p für kleine Bildschirme; Browser ohne media-Auswertung nehmen die erste abspielbare Quelle */}
          <source src="/video/terms-bg.webm" type="video/webm" media="(min-width: 1024px)" />
          <source src="/video/terms-bg.mp4" type="video/mp4" media="(min-width: 1024px)" />
          <source src="/video/terms-bg-720.webm" type="video/webm" />
          <source src="/video/terms-bg-720.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="terms-video-veil absolute inset-0" />
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-bg to-transparent lg:h-24" />
      <div className="absolute inset-0 hidden bg-gradient-to-r from-bg from-[6%] via-bg/75 via-[22%] to-transparent to-[38%] lg:block" />
      <div className="absolute inset-x-0 bottom-0 hidden h-24 bg-gradient-to-t from-bg to-transparent lg:block" />
    </div>
  );
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

  /* Die Dokumentsprache folgt der Sprachwahl der Seite: Englisch zeigt die Übersetzung, alle anderen das verbindliche deutsche Original. */
  const docLang = locale === "en" ? "en" : "de";
  /* Beschriftungen folgen der Dokumentsprache; Datum dem Zahlenformat der Oberfläche. */
  const labels = translations[docLang].termsPage;
  const translationNote = docLang === "en" ? labels.translationNote : locale === "fr" || locale === "it" ? translations[locale].termsPage.translationNote : "";
  const doc = docLang === "en" ? termsEn : termsDe;
  const legal = docLang === "en" ? legalEn : legalDe;
  const minutes = useMemo(() => readingMinutes(doc), [doc]);
  const limitCount = doc.clauses.filter((c) => c.tags.includes("limit")).length;

  return (
    <PageShell>
      <div className="terms-page" lang={docLang}>
        {/* Titelbereich: Text links, Waage-Video rechts mit Verlauf in die Seitenfarbe; mobil liegt das Video unter dem Text */}
        <section className="relative isolate overflow-hidden border-b border-line">
          <Container className="relative z-10">
            <div className="grid py-14 sm:py-20 lg:min-h-[600px] lg:grid-cols-[minmax(0,38rem)_1fr] lg:items-center lg:py-24">
              <Reveal>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  <Scale className="h-4 w-4" aria-hidden />
                  {labels.law}
                </p>
                <h1 className="mt-4 text-[2rem] font-bold leading-[1.05] tracking-tight [overflow-wrap:anywhere] sm:text-5xl lg:text-[3.4rem]">{doc.title}</h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">{doc.lead}</p>
                <ul className="mt-8 flex flex-wrap gap-2 text-sm">
                  <li className="terms-chip">
                    <FileText className="h-3.5 w-3.5" aria-hidden />
                    {fmt(labels.version, { n: doc.version, date: formatDay(doc.date, tag) })}
                  </li>
                  <li className="terms-chip">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    {fmt(labels.readingTime, { min: minutes })}
                  </li>
                  <li className="terms-chip terms-chip-warn">
                    <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                    {fmt(labels.limits, { n: limitCount })}
                  </li>
                </ul>
                {translationNote && <p className="mt-3 max-w-xl text-sm text-ink-3">{translationNote}</p>}
                {operatorHasPlaceholders() && (
                  <div role="alert" className="mt-8 flex max-w-xl gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                    <span>{legal.placeholderWarning}</span>
                  </div>
                )}
              </Reveal>
            </div>
          </Container>
          <TermsStage />
        </section>

        {/* Auf einen Blick: acht Kernpunkte als ruhige Reihe auf Papier */}
        <section id="terms-summary" aria-labelledby="terms-summary-h" className="paper scroll-mt-28 border-b border-line">
          <Container className="py-12 sm:py-16">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <h2 id="terms-summary-h" className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-ink-3">
                {labels.summaryTitle}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-ink-3 sm:text-right">
                {labels.summaryNote} {labels.legendIntro}
              </p>
            </div>
            <ul className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {doc.summary.map((s, i) => (
                <Reveal key={s.text} as="li" delay={Math.min(i, 3) * 70} className="flex gap-3 lg:flex-col">
                  <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full", s.tag === "limit" ? "bg-warn-soft" : "bg-primary-soft")}>
                    <SummaryIcon tag={s.tag} />
                  </span>
                  <div className="min-w-0 leading-snug">
                    <p className="text-[0.95rem] text-ink">{s.text}</p>
                    <p className="mt-2 flex flex-wrap gap-x-3 text-sm">
                      {s.refs.map((r) => (
                        <a key={r} href={`#${clauseId(r)}`} className="inline-flex items-center gap-0.5 font-medium text-primary underline-offset-4 hover:underline">
                          {fmt(labels.clause, { n: r })}
                          <ArrowRight className="h-3 w-3" aria-hidden />
                        </a>
                      ))}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ul>
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
