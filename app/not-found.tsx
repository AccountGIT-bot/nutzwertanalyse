import Link from "next/link";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="page-shell">
        <p className="eyebrow">404 / SEITE NICHT GEFUNDEN</p>
        <h1>Hier geht es nicht weiter.</h1>
        <p className="page-intro">
          Dein lokaler Entwurf bleibt erhalten. Kehre zur Analyse zurück oder
          starte auf der Übersicht.
        </p>
        <div className="action-row">
          <Link className="studio-button" href="/app">
            Zur Analyse
          </Link>
          <Link className="studio-button secondary" href="/">
            Zur Startseite
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
