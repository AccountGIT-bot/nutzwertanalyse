"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PageShell, Container } from "@/components/layout/PageShell";
import { ExplainerVideo } from "@/components/content/ExplainerVideo";
import { Reveal } from "@/components/ui/Reveal";

export function HowItWorksView() {
  const t = useT();
  return (
    <PageShell>
      <section className="border-b border-line">
        <Container narrow className="py-12 sm:py-16">
          <p className="text-sm font-semibold text-primary">{t.nav.how}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">{t.how.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">{t.how.lead}</p>
        </Container>
      </section>

      <section className="paper border-b border-line py-12 sm:py-16" aria-labelledby="video-h">
        <Container narrow>
          <h2 id="video-h" className="text-2xl font-bold tracking-tight">
            {t.how.videoTitle}
          </h2>
          <div className="mt-6">
            <ExplainerVideo />
          </div>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container narrow>
          <div className="prose-legal">
            {t.how.sections.map((s, i) => (
              <Reveal key={s.h} as="section" delay={i * 40} className="border-t border-line py-8 first:border-t-0 first:pt-0">
                <h2 className="!mt-0">{s.h}</h2>
                {s.p.map((p, j) =>
                  /^\d\.\s/.test(p) ? (
                    <p key={j} className="flex gap-3">
                      <span className="shrink-0 font-semibold tabular text-primary">{p.slice(0, 2)}</span>
                      <span>{p.slice(3)}</span>
                    </p>
                  ) : (
                    <p key={j}>{p}</p>
                  ),
                )}
              </Reveal>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/app/analyse?new=1" className="btn btn-primary btn-lg">
              {t.how.cta}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
            <Link href="/methode" className="btn btn-secondary btn-lg">
              {t.how.ctaSecondary}
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
