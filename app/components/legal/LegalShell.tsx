"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Printer, ShieldCheck, FileText, Scale, Cookie, Gavel } from "lucide-react";
import { siteConfig, formatSwissDate, hasIncompleteOperatorData } from "@/app/lib/site-config";

export interface LegalSection {
  id: string;
  title: string;
}

const LEGAL_NAV = [
  { href: "/rechtliches", label: "Übersicht", icon: Scale },
  { href: "/impressum", label: "Impressum", icon: FileText },
  { href: "/datenschutz", label: "Datenschutz", icon: ShieldCheck },
  { href: "/cookies", label: "Cookies", icon: Cookie },
  { href: "/agb", label: "AGB", icon: Gavel },
];

/**
 * Gemeinsames Layout für alle Rechtsseiten: dunkles Premium-Design mit
 * klebrigem Inhaltsverzeichnis, Scroll-Spy und druckoptimierter Ausgabe.
 */
export function LegalShell({
  eyebrow,
  title,
  lead,
  sections,
  currentPath,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  sections: LegalSection[];
  currentPath: string;
  children: React.ReactNode;
}) {
  const activeId = useScrollSpy(sections.map((s) => s.id));
  const incomplete = useMemo(() => hasIncompleteOperatorData(), []);

  return (
    <div className="relative min-h-[100svh] bg-[#07070b] text-white">
      <LegalBackdrop />

      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-black/50 backdrop-blur-2xl print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
          <Link href="/" className="group flex items-center gap-3" aria-label="Zur Startseite">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20">
              <Scale className="h-4 w-4 text-white" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-semibold tracking-tight">
                Nutzwertanalyse<span className="text-white/40">.com</span>
              </span>
              <span className="block text-[11px] text-white/40">{eyebrow}</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white sm:flex"
            >
              <Printer className="h-3.5 w-3.5" />
              Drucken / PDF
            </button>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Startseite
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 pt-12 sm:px-6 sm:pt-16">
        {/* Hero */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/50">
            {eyebrow}
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/55">{lead}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] text-white/40">
            <Badge>Version {siteConfig.legalVersion.version}</Badge>
            <Badge>Stand: {formatSwissDate(siteConfig.legalVersion.lastUpdated)}</Badge>
            <Badge>Schweizer Recht</Badge>
          </div>
        </div>

        {incomplete && (
          <div className="mt-8 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm text-amber-100/80 print:hidden">
            <strong className="font-semibold text-amber-100">Hinweis für den Betreiber:</strong>{" "}
            Die Betreiberangaben sind noch nicht vollständig hinterlegt. Ergänzen Sie diese in{" "}
            <code className="rounded bg-black/30 px-1.5 py-0.5 text-[12px]">app/lib/site-config.ts</code> –
            Impressumsangaben sind nach Art. 3 Abs. 1 lit. s UWG zwingend.
          </div>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
          {/* Inhaltsverzeichnis */}
          <aside className="print:hidden lg:sticky lg:top-24 lg:self-start">
            <nav aria-label="Inhaltsverzeichnis" className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-xl">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                Inhalt
              </div>
              <ul className="space-y-0.5">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={`flex items-start gap-2.5 rounded-xl px-2.5 py-2 text-[13px] leading-snug transition ${
                        activeId === section.id
                          ? "bg-white/[0.07] text-white"
                          : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                      }`}
                    >
                      <span
                        className={`mt-[3px] w-4 flex-shrink-0 text-right text-[11px] tabular-nums ${
                          activeId === section.id ? "text-white/70" : "text-white/25"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Weitere Rechtsseiten" className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 backdrop-blur-xl">
              <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
                Rechtliches
              </div>
              <ul className="space-y-0.5">
                {LEGAL_NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] transition ${
                        currentPath === item.href
                          ? "bg-white/[0.07] text-white"
                          : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                      }`}
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Inhalt */}
          <div className="legal-prose min-w-0">{children}</div>
        </div>
      </div>

      <LegalFooter />
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1">{children}</span>
  );
}

/** Nummerierter Abschnitt mit Anker – wird von allen Rechtsseiten verwendet. */
export function LegalSectionBlock({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-white/[0.06] py-8 first:pt-0 last:border-0">
      <h2 className="flex items-baseline gap-3 text-lg font-semibold tracking-tight text-white sm:text-xl">
        <span className="text-sm font-medium tabular-nums text-white/30">
          {String(index).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-white/60">{children}</div>
    </section>
  );
}

/** Hervorgehobener Hinweiskasten (z. B. Gesetzesverweis). */
export function LegalNote({
  tone = "neutral",
  title,
  children,
}: {
  tone?: "neutral" | "accent" | "warning";
  title?: string;
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.03] text-white/60",
    accent: "border-blue-400/25 bg-blue-400/[0.07] text-blue-50/75",
    warning: "border-amber-400/25 bg-amber-400/[0.07] text-amber-50/80",
  } as const;

  return (
    <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${tones[tone]}`}>
      {title && <div className="mb-1.5 font-semibold text-white/85">{title}</div>}
      {children}
    </div>
  );
}

/** Definitionsliste für Adress- und Kontaktblöcke. */
export function LegalDataList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-[180px_minmax(0,1fr)]">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="text-sm font-medium text-white/40">{item.label}</dt>
          <dd className="text-[15px] text-white/75">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function LegalFooter() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] px-5 py-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
        <div>© {new Date().getFullYear()} {siteConfig.name}</div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGAL_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white/70">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

function LegalBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden print:hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#07070b] via-[#0b1020] to-[#0a0a12]" />
      <div className="absolute -left-[10%] -top-[15%] h-[560px] w-[560px] rounded-full bg-blue-600/12 blur-[130px]" />
      <div className="absolute -right-[8%] top-[35%] h-[460px] w-[460px] rounded-full bg-purple-600/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[25%] h-[420px] w-[420px] rounded-full bg-teal-500/8 blur-[130px]" />
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}

/** Beobachtet, welcher Abschnitt gerade im Viewport liegt. */
function useScrollSpy(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const key = ids.join("|");

  useEffect(() => {
    const sectionIds = key.split("|").filter(Boolean);
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: 0 }
    );

    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [key]);

  return activeId;
}
