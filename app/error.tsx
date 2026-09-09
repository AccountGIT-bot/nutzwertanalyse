"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="page-shell">
      <p className="eyebrow">ETWAS IST SCHIEFGELAUFEN</p>
      <h1>Bitte versuche es nochmals.</h1>
      <p className="page-intro">
        Ein bereits gespeicherter Entwurf bleibt im Browser erhalten.
      </p>
      <div className="action-row">
        <button className="studio-button" onClick={reset}>
          Erneut versuchen
        </button>
        <Link className="studio-button secondary" href="/">
          Zur Startseite
        </Link>
      </div>
    </main>
  );
}
