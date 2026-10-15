"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n";
import { PageShell, Container } from "@/components/layout/PageShell";

export function MethodView() {
  const t = useT();
  return (
    <PageShell>
      <Container narrow className="py-10 sm:py-14">
        <article className="prose-legal">
          <header className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">{t.nav.method}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{t.method.title}</h1>
            <p className="mt-3 text-base">{t.method.lead}</p>
          </header>
          {t.method.sections.map((s, i) => (
            <section key={i}>
              <h2>{s.h}</h2>
              {s.p.map((p, j) =>
                p.startsWith("Nutzwert(") || p.startsWith("Utility(") || p.startsWith("Valeur d’utilité(") || p.startsWith("Valore d’utilità(") ? (
                  <p key={j} className="rounded-xl border border-line bg-surface-2 px-4 py-3 font-mono text-sm text-ink">
                    {p}
                  </p>
                ) : (
                  <p key={j}>{p}</p>
                ),
              )}
            </section>
          ))}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/app/analyse?new=1" className="btn btn-primary">
              {t.nav.start}
            </Link>
            <Link href="/faq" className="btn btn-secondary">
              {t.nav.faq}
            </Link>
          </div>
        </article>
      </Container>
    </PageShell>
  );
}
