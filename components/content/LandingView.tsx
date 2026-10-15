"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck, UserX, HardDrive, EyeOff, Scale, GitBranch, Activity, Users, Ban, FileDown, Lock } from "lucide-react";
import { useT } from "@/lib/i18n";
import { PageShell, Container } from "@/components/layout/PageShell";
import { SmartStart } from "@/components/nwa/SmartStart";
import { PresetGrid } from "@/components/nwa/PresetGrid";
import { FaqList } from "@/components/content/FaqView";

const TRUST_ICONS = [UserX, HardDrive, EyeOff, ShieldCheck];
const FEATURE_ICONS = [Scale, GitBranch, Activity, Users, Ban, FileDown];

export function LandingView() {
  const t = useT();
  return (
    <PageShell>
      {/* Hero */}
      <section className="hero-bg relative overflow-hidden">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <Container className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="badge badge-primary">{t.landing.eyebrow}</span>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
              {t.landing.h1a} <span className="text-primary">{t.landing.h1b}</span> {t.landing.h1c}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">{t.landing.lead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/app/analyse?new=1" className="btn btn-primary btn-lg">
                {t.landing.ctaPrimary}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <a href="#how" className="btn btn-secondary btn-lg">
                {t.landing.ctaSecondary}
              </a>
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-3xl">
            <SmartStart />
          </div>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.landing.trust.map((item, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-surface/70 p-3.5 backdrop-blur">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-ink-2">{item.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Presets */}
      <section className="py-16 sm:py-20" aria-labelledby="presets-h">
        <Container>
          <div className="max-w-2xl">
            <h2 id="presets-h" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t.landing.presetsTitle}
            </h2>
            <p className="mt-2 text-ink-2">{t.landing.presetsLead}</p>
          </div>
          <div className="mt-8">
            <PresetGrid />
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-line bg-surface py-16 sm:py-20" aria-labelledby="how-h">
        <Container>
          <div className="max-w-2xl">
            <h2 id="how-h" className="text-2xl font-bold tracking-tight sm:text-3xl">
              {t.landing.howTitle}
            </h2>
            <p className="mt-2 text-ink-2">{t.landing.howLead}</p>
          </div>
          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.landing.how.map((s, i) => (
              <li key={i} className="relative rounded-2xl border border-line bg-bg p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-ink">{i + 1}</span>
                <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{s.text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20" aria-labelledby="features-h">
        <Container>
          <h2 id="features-h" className="max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
            {t.landing.featuresTitle}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.landing.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <li key={i} className="card p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{f.text}</p>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Privacy */}
      <section className="border-y border-line bg-surface py-16 sm:py-20" aria-labelledby="privacy-h">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="badge badge-primary">
                <Lock className="h-3 w-3" aria-hidden /> Privacy by Design
              </span>
              <h2 id="privacy-h" className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                {t.landing.privacyTitle}
              </h2>
              <p className="mt-3 leading-relaxed text-ink-2">{t.landing.privacyText}</p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                {t.landing.privacyPoints.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-good" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <Link href="/datenschutz" className="badge hover:bg-surface-3">
                  {t.nav.privacy}
                </Link>
                <Link href="/cookies" className="badge hover:bg-surface-3">
                  {t.nav.cookies}
                </Link>
              </div>
            </div>
            <DataFlowDiagram />
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20" aria-labelledby="faq-h">
        <Container narrow>
          <h2 id="faq-h" className="text-2xl font-bold tracking-tight sm:text-3xl">
            {t.landing.faqTitle}
          </h2>
          <div className="mt-8">
            <FaqList compact />
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-20">
        <Container>
          <div className="rounded-3xl bg-primary px-6 py-12 text-center text-primary-ink sm:px-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{t.landing.finalTitle}</h2>
            <p className="mt-2 opacity-90">{t.landing.finalText}</p>
            <Link href="/app/analyse?new=1" className="btn btn-lg mt-6 bg-white text-primary-strong hover:bg-white/90">
              {t.landing.ctaPrimary}
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}

/** Kleines Schema: Browser ⇄ (kein Server) */
function DataFlowDiagram() {
  const t = useT();
  return (
    <figure className="card p-6">
      <svg viewBox="0 0 420 220" role="img" aria-label={t.landing.privacyTitle} className="w-full text-ink">
        <rect x="20" y="40" width="180" height="140" rx="14" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
        <text x="110" y="70" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">
          Browser
        </text>
        {["Analysen", "Berechnung", "Export", "localStorage"].map((l, i) => (
          <g key={l}>
            <rect x="40" y={82 + i * 24} width="140" height="18" rx="5" fill="var(--surface)" stroke="var(--line)" />
            <text x="110" y={95 + i * 24} textAnchor="middle" fontSize="10" fill="var(--ink-2)">
              {l}
            </text>
          </g>
        ))}
        <line x1="200" y1="110" x2="260" y2="110" stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="6 5" />
        <text x="230" y="100" textAnchor="middle" fontSize="18" fill="var(--bad)" fontWeight="700">
          ×
        </text>
        <rect x="260" y="70" width="140" height="80" rx="14" fill="var(--surface-2)" stroke="var(--line)" strokeDasharray="5 4" />
        <text x="330" y="105" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink-3)">
          Server / Cloud
        </text>
        <text x="330" y="124" textAnchor="middle" fontSize="10" fill="var(--ink-3)">
          —
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-ink-3">{t.settings.privacyShort}</figcaption>
    </figure>
  );
}
