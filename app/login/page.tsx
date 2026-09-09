import Link from "next/link";
import type { Metadata } from "next";
import { UserRound, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "../components/SiteChrome";
export const metadata: Metadata = { title: "Konto" };
export default function Login() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <div className="account-card">
          <UserRound size={35} color="#65d3be" />
          <p className="eyebrow">KONTO / NOCH NICHT VERFÜGBAR</p>
          <h1>Deine Analyse braucht kein Login.</h1>
          <p>
            Konten und Cloudspeicherung sind noch nicht eingerichtet. Alle
            Analysefunktionen kannst du bereits kostenlos auf diesem Gerät
            nutzen. Es werden keine Anmeldedaten erfasst.
          </p>
          <Link href="/app" className="studio-button">
            Ohne Konto weiter <ArrowRight size={17} />
          </Link>
          <p className="muted">
            Sichere deinen Entwurf regelmässig über den Download in der Analyse.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
