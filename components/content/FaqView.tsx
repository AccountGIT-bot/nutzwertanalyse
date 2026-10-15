"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { PageShell, Container } from "@/components/layout/PageShell";

export function FaqList({ compact = false }: { compact?: boolean }) {
  const t = useT();
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {t.faq.map((f, i) => (
        <details key={i} className="group px-5 py-4" open={!compact && i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink marker:content-none">
            {f.q}
            <span className="shrink-0 text-ink-3 transition-transform group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-ink-2">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function FaqView() {
  const t = useT();
  return (
    <PageShell>
      <Container narrow className="py-10 sm:py-14">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t.nav.faq}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.landing.faqTitle}</h1>
        </header>
        <FaqList />
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/app/analyse?new=1" className="btn btn-primary">
            {t.nav.start}
          </Link>
          <Link href="/methode" className="btn btn-secondary">
            {t.nav.method}
          </Link>
        </div>
      </Container>
    </PageShell>
  );
}
