"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PRESET_IDS } from "@/lib/nwa/parser";
import { PageShell, Container } from "@/components/layout/PageShell";
import { PRESET_ILLUSTRATIONS } from "@/components/illustrations/Presets";
import { Reveal } from "@/components/ui/Reveal";

export function UseCasesView() {
  const t = useT();
  return (
    <PageShell>
      <section className="border-b border-line">
        <Container className="py-12 sm:py-16">
          <p className="text-sm font-semibold text-primary">{t.nav.useCases}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-5xl">{t.useCases.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-2">{t.useCases.lead}</p>
        </Container>
      </section>
      <section className="py-12 sm:py-16">
        <Container>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {PRESET_IDS.map((id, i) => {
              const p = t.presets[id];
              const Ill = PRESET_ILLUSTRATIONS[id];
              return (
                <Reveal key={id} as="li" delay={(i % 2) * 60} className="card flex flex-col gap-4 p-6 sm:flex-row">
                  <div className="w-full shrink-0 sm:w-44">
                    <Ill className="h-auto w-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold">{p.label}</h2>
                    <p className="text-sm text-ink-3">{p.hint}</p>
                    <p className="mt-2 text-sm italic text-ink-2">«{p.titleExample}»</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-3">{t.useCases.criteriaLabel}</p>
                    <ul className="mt-1.5 flex flex-wrap gap-1.5">
                      {p.criteria.map((c) => (
                        <li key={c.name} className="badge">
                          {c.name}
                        </li>
                      ))}
                    </ul>
                    <Link href={`/app/analyse?new=1&preset=${id}`} className="btn btn-primary btn-sm mt-4">
                      {t.useCases.start}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </section>
    </PageShell>
  );
}
