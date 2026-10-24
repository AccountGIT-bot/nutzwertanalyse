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
import { FeatureTour } from "@/components/content/landing/FeatureTour";
import { StepsTimeline } from "@/components/content/landing/StepsTimeline";
import { SectionNav } from "@/components/content/landing/SectionNav";
import { StatStrip } from "@/components/content/landing/StatStrip";
import { DataFlow } from "@/components/content/landing/DataFlow";
import { ExpertiseSection } from "@/components/content/landing/ExpertiseSection";
import { VoicesSection } from "@/components/content/landing/VoicesSection";
import { HeroStage } from "@/components/content/landing/HeroStage";

const SECTION_IDS = ["hero", "funktionen", "ablauf", "vertrauen", "video", "anwendungsfaelle", "stimmen", "datenschutz"];

export function LandingView() {
  const t = useT();
  const x = t.landingExtra;
  const sections = SECTION_IDS.map((id, i) => ({ id, label: x.sectionNav[i] }));

  return (
    <PageShell>
      <SectionNav sections={sections} />

      {/* Hero: Text links, animierte Matrix als Karte über einem cinematischen Clip (ab lg) */}
      <section id="hero" className="relative isolate overflow-hidden border-b border-line scroll-mt-20">
        <Container className="relative z-10 grid items-center gap-12 py-16 sm:py-24 lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
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
          <div className="hero-card fade-up lg:justify-self-end" style={{ animationDelay: "120ms" }}>
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
        <HeroStage />
      </section>

      {/* Kennzahlen */}
      <section className="paper border-b border-line" aria-label={x.includedTitle}>
        <Container className="py-10 sm:py-12">
          <StatStrip />
        </Container>
      </section>

      {/* Funktionen: Scroll-Tour */}
      <section id="funktionen" className="py-16 scroll-mt-20 sm:py-24" aria-labelledby="included-h">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 id="included-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {x.includedTitle}
            </h2>
            <p className="mt-3 text-ink-2">{x.includedLead}</p>
          </Reveal>
          <div className="mt-12">
            <FeatureTour />
          </div>
        </Container>
      </section>

      {/* Ablauf: Timeline */}
      <section id="ablauf" className="paper border-y border-line py-16 scroll-mt-20 sm:py-24" aria-labelledby="how-h">
        <Container>
          <Reveal className="max-w-2xl">
            <h2 id="how-h" className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howTitle}
            </h2>
            <p className="mt-3 text-ink-2">{t.landing.howLead}</p>
          </Reveal>
          <div className="mt-12">
            <StepsTimeline />
          </div>
          <Reveal className="mt-10">
            <Link href="/so-funktionierts" className="btn btn-secondary">
              {x.stepsCta}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Reveal>
        </Container>
      </section>

      {/* Vertrauen: Text links, Bild rechts mit Verlauf */}
      <section id="vertrauen" className="border-b border-line scroll-mt-20" aria-labelledby="expertise-h">
        <ExpertiseSection />
      </section>

      {/* Video */}
      <section id="video" className="py-16 scroll-mt-20 sm:py-24" aria-labelledby="video-h">
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
      <section id="anwendungsfaelle" className="paper border-y border-line py-16 scroll-mt-20 sm:py-24" aria-labelledby="usecases-h">
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
                  <Link
                    href={`/app/analyse?new=1&preset=${id}`}
                    className="usecase-card card group flex h-full flex-col p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md"
                  >
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

      {/* Stimmen: vollflächiger, weichgezeichneter Hintergrund */}
      <section id="stimmen" className="scroll-mt-20" aria-labelledby="voices-h">
        <VoicesSection />
      </section>

      {/* Datenschutz + CTA */}
      <section id="datenschutz" className="py-16 scroll-mt-20 sm:py-24" aria-labelledby="privacy-h">
        <Container className="grid items-center gap-10 lg:grid-cols-2">
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
          <Reveal delay={100}>
            <DataFlow />
          </Reveal>
        </Container>
        <Container className="mt-16">
          <Reveal className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-ink sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.landing.finalTitle}</h2>
            <p className="mt-2 opacity-90">{t.landing.finalText}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/app/analyse?new=1" className="btn btn-lg bg-white text-primary-strong hover:bg-white/90">
                {t.landing.ctaPrimary}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/faq" className="btn btn-lg border border-white/30 text-primary-ink hover:bg-white/10">
                {t.nav.faq}
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
