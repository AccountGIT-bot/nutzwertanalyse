import Link from "next/link";
import { ChartNoAxesCombined, ArrowUpRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="studio-header">
      <Link
        href="/"
        className="studio-brand"
        aria-label="DecisionStudio – Startseite"
      >
        <span className="studio-mark">
          <ChartNoAxesCombined size={23} strokeWidth={2.5} />
        </span>
        <span>
          Decision<span className="brand-light">Studio</span>
          <small>NUTZWERTANALYSE</small>
        </span>
      </Link>
      <nav aria-label="Hauptnavigation">
        <Link href="/#methodik" className="quiet-link">
          So funktioniert’s
        </Link>
        <Link href="/login" className="quiet-link">
          Konto
        </Link>
        <Link href="/app" className="studio-button compact">
          Zur Analyse <ArrowUpRight size={17} />
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="studio-footer">
      <span>
        DecisionStudio <span aria-hidden="true">/</span> Klar entscheiden.
      </span>
      <nav aria-label="Rechtliches">
        <Link href="/datenschutz">Datenschutz & lokale Daten</Link>
        <Link href="/impressum">Impressum</Link>
        <Link href="/agb">Nutzungsbedingungen</Link>
      </nav>
    </footer>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="legal-page" lang="de-CH">
        <p className="eyebrow">DecisionStudio / Rechtliches</p>
        <h1>{title}</h1>
        <p className="page-intro">{intro}</p>
        <div className="legal-content">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
