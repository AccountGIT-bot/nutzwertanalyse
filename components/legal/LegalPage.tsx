"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { legalDe } from "@/lib/legal/de";
import { legalEn } from "@/lib/legal/en";
import type { LegalBlock, LegalKey } from "@/lib/legal/types";
import { operatorHasPlaceholders } from "@/lib/site";
import { PageShell, Container } from "@/components/layout/PageShell";

const BINDING_NOTE: Record<string, string> = {
  fr: "La version allemande de ces textes juridiques fait foi. Une traduction anglaise est disponible ci-dessous.",
  it: "Fa fede la versione tedesca di questi testi legali. Una traduzione inglese è disponibile qui sotto.",
};

/** Rendert Text mit einfachen Markdown-Links [Text](url) */
function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const href = m[2];
    if (href.startsWith("/")) {
      parts.push(
        <Link key={i++} href={href}>
          {m[1]}
        </Link>,
      );
    } else {
      parts.push(
        <a key={i++} href={href} target="_blank" rel="noopener noreferrer">
          {m[1]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function Block({ b }: { b: LegalBlock }) {
  switch (b.type) {
    case "h2":
      return <h2>{b.text}</h2>;
    case "h3":
      return <h3>{b.text}</h3>;
    case "p":
      return (
        <p>
          <RichText text={b.text} />
        </p>
      );
    case "note":
      return <p className="rounded-lg bg-surface-2 px-3 py-2 text-sm">{b.text}</p>;
    case "ul":
      return (
        <ul>
          {b.items.map((it, i) => (
            <li key={i}>
              <RichText text={it} />
            </li>
          ))}
        </ul>
      );
    case "table":
      return (
        <table>
          {b.head.some((x) => x) && (
            <thead>
              <tr>
                {b.head.map((hd, i) => (
                  <th key={i}>{hd}</th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {b.rows.map((r, i) => (
              <tr key={i}>
                {r.map((c, j) => (
                  <td key={j} className={j === 0 && !b.head.some((x) => x) ? "font-medium text-ink" : undefined}>
                    <RichText text={c} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

export function LegalPage({ docKey }: { docKey: LegalKey }) {
  const { locale, t } = useI18n();
  const set = locale === "en" ? legalEn : legalDe;
  const doc = set.docs[docKey];
  const note = locale === "de" ? null : locale === "en" ? legalEn.bindingNote : BINDING_NOTE[locale];
  const showPlaceholderWarning = operatorHasPlaceholders();

  return (
    <PageShell>
      <Container narrow className="py-10 sm:py-14">
        <article className="prose-legal">
          <header className="mb-6 border-b border-line pb-6">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{doc.title}</h1>
            {doc.intro && <p className="mt-3 text-base">{doc.intro}</p>}
            <p className="mt-3 text-xs text-ink-3">
              {locale === "en" ? "Last updated" : locale === "fr" ? "Dernière mise à jour" : locale === "it" ? "Ultimo aggiornamento" : "Stand"}: {doc.updated}
            </p>
            {note && <p className="mt-3 rounded-lg border border-line bg-surface-2 px-3 py-2 text-xs text-ink-2">{note}</p>}
          </header>
          {showPlaceholderWarning && (
            <div role="alert" className="mb-6 flex gap-3 rounded-xl border border-warn/40 bg-warn-soft px-4 py-3 text-sm text-ink">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
              <span>{set.placeholderWarning}</span>
            </div>
          )}
          {doc.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}
          <nav aria-label={t.nav.legal} className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6 text-sm">
            {(
              [
                ["/impressum", t.nav.imprint],
                ["/datenschutz", t.nav.privacy],
                ["/agb", t.nav.terms],
                ["/cookies", t.nav.cookies],
                ["/barrierefreiheit", t.nav.accessibility],
              ] as const
            ).map(([href, label]) => (
              <Link key={href} href={href} className="badge hover:bg-surface-3">
                {label}
              </Link>
            ))}
          </nav>
        </article>
      </Container>
    </PageShell>
  );
}
