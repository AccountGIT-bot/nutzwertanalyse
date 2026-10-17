"use client";

import Link from "next/link";
import { ArrowRight, Check, PlayCircle, ShieldCheck } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { PageShell, Container } from "@/components/layout/PageShell";
import { HeroVisual } from "@/components/illustrations/HeroVisual";
import { PRESET_ILLUSTRATIONS } from "@/components/illustrations/Presets";
import { Reveal } from "@/components/ui/Reveal";
import { ExplainerVideo } from "@/components/content/ExplainerVideo";

export function LandingView() {
  const t = useT();
  const x = t.landingExtra;
  return (
    <PageShell>
      {/* Hero */}
      <section className="border-b border-line">
        <Container className="grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.05fr_1fr]">
          <div className="fade-up">
            <p className="text-sm font-semibold text-primary">{t.landing.eyebrow}</p>
            <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t.landing.h1a} {t.landing.h1b} {t.landing.h1c}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{t.landing.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/app/analyse?new=1" className="btn btn-primary btn-lg">
                {t.landing.ctaPrimary}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/so-funktionierts" className="btn btn-secondary btn-lg">
                <PlayCircle className="h-5 w-5" aria-hidden />
                {t.landing.ctaSecondary}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
              {t.landing.trust.map((item) => (
                <li key={item.title} className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" aria-hidden />
                  {item.title}
                </li>
              ))}
            </ul>
          </div>
          <div className="fade-up" style={{ animationDelay: "120ms" }}>
            <HeroVisual
              labels={{
                criteria: t.presets.software.criteria.slice(0, 3).map((c) => c.name),
                alternatives: ["A", "B", "C"],
                result: t.results.winner,
                weight: t.steps.weighting.label,
              }}
            />
          </div>
        </Container>
      </section>

      {/* Was dazugehört */}
      <section className="py-16 sm:py-24" aria-labelledby="included-h">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 id="included-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {x.includedTitle}
            </h2>
            <p className="mt-3 text-ink-2">{x.includedLead}</p>
          </Reveal>
          <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {x.included.map((item, i) => (
              <Reveal key={item.title} as="li" delay={i * 50} className="flex gap-4 border-t border-line pt-5">
                <span className="w-8 shrink-0 text-sm font-semibold tabular text-primary">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-2">{item.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </section>

      {/* Ablauf */}
      <section className="paper border-y border-line py-16 sm:py-24" aria-labelledby="how-h">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 id="how-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howTitle}
            </h2>
            <p className="mt-3 text-ink-2">{t.landing.howLead}</p>
          </Reveal>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.landing.how.map((s, i) => (
              <Reveal key={s.title} as="li" delay={i * 60} className="card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-ink">{i + 1}</span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8">
            <Link href="/so-funktionierts" className="btn btn-secondary">
              {x.stepsCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Video */}
      <section className="py-16 sm:py-24" aria-labelledby="video-h">
        <Container className="grid items-center gap-10 lg:grid-cols-[1fr_1.3fr]">
          <Reveal>
            <h2 id="video-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {x.videoTitle}
            </h2>
            <p className="mt-3 text-ink-2">{x.videoText}</p>
            <Link href="/so-funktionierts" className="btn btn-primary mt-6">
              <PlayCircle className="h-5 w-5" aria-hidden />
              {x.videoCta}
            </Link>
          </Reveal>
          <Reveal delay={100}>
            <ExplainerVideo />
          </Reveal>
        </Container>
      </section>

      {/* Anwendungsfälle */}
      <section className="paper border-y border-line py-16 sm:py-24" aria-labelledby="usecases-h">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h2 id="usecases-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
                {x.useCasesTitle}
              </h2>
              <p className="mt-3 text-ink-2">{x.useCasesLead}</p>
            </div>
            <Link href="/anwendungsfaelle" className="btn btn-ghost">
              {x.allUseCases}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {PRESET_IDS.map((id, i) => {
              const Ill = PRESET_ILLUSTRATIONS[id];
              return (
                <Reveal key={id} as="li" delay={i * 40}>
                  <Link href={`/app/analyse?new=1&preset=${id}`} className="card group flex h-full flex-col p-4 transition-colors hover:border-primary">
                    <Ill className="h-auto w-full" />
                    <span className="mt-3 text-sm font-semibold group-hover:text-primary">{t.presets[id].label}</span>
                    <span className="text-xs text-ink-3">{t.presets[id].hint}</span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Datenschutz + CTA */}
      <section className="py-16 sm:py-24" aria-labelledby="privacy-h">
        <Container className="grid items-start gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Privacy by Design
            </div>
            <h2 id="privacy-h" className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.privacyTitle}
            </h2>
            <p className="mt-3 leading-relaxed text-ink-2">{t.landing.privacyText}</p>
            <ul className="mt-5 grid gap-2 sm:grid-cols-2">
              {t.landing.privacyPoints.map((p) => (
                <li key={p} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {p}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="rounded-2xl border border-line bg-surface p-8">
            <h3 className="text-2xl font-bold tracking-tight">{t.landing.finalTitle}</h3>
            <p className="mt-2 text-ink-2">{t.landing.finalText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/app/analyse?new=1" className="btn btn-primary btn-lg">
                {t.landing.ctaPrimary}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/faq" className="btn btn-ghost btn-lg">
                {t.nav.faq}
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
