"use client";

import Link from "next/link";
import { Compass, Target, Eye } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PageShell, Container } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";

export function AboutView() {
  const t = useT();
  const a = t.about;
  return (
    <PageShell>
      <section className="border-b border-line">
        <Container narrow className="py-12 sm:py-16">
          <p className="text-sm font-semibold text-primary">{t.nav.about}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">{a.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">{a.lead}</p>
        </Container>
      </section>

      <section className="paper border-b border-line py-12 sm:py-16">
        <Container narrow className="grid gap-6 sm:grid-cols-2">
          <Reveal className="card p-6">
            <Eye className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-bold">{a.vision.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{a.vision.p}</p>
          </Reveal>
          <Reveal delay={80} className="card p-6">
            <Target className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-bold">{a.mission.h}</h2>
            <p className="mt-2 leading-relaxed text-ink-2">{a.mission.p}</p>
          </Reveal>
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container narrow>
          <Reveal>
            <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Compass className="h-5 w-5 text-primary" aria-hidden />
              {a.valuesTitle}
            </h2>
          </Reveal>
          <ul className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
            {a.values.map((v, i) => (
              <Reveal key={v.h} as="li" delay={i * 50} className="border-t border-line pt-4">
                <h3 className="font-semibold">{v.h}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-2">{v.p}</p>
              </Reveal>
            ))}
          </ul>
          <Reveal className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight">{a.storyTitle}</h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-2">{a.story}</p>
          </Reveal>
          <Reveal className="mt-14">
            <h2 className="text-2xl font-bold tracking-tight">{a.contactTitle}</h2>
            <p className="mt-3 text-ink-2">
              {a.contact}{" "}
              <Link href="/impressum" className="font-medium text-primary underline underline-offset-2">
                {t.nav.imprint}
              </Link>
            </p>
          </Reveal>
        </Container>
      </section>
    </PageShell>
  );
}
