"use client";

import { useRouter } from "next/navigation";

export default function ImpressumPage() {
  const router = useRouter();

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-hidden">
      <header className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Zur Startseite"
              title="Startseite"
            >
              <div className="h-10 w-10 rounded-2xl bg-black/5 border border-black/10 grid place-items-center">
                <span className="text-black/70 text-lg">⌁</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                  Nutzwertanalyse<span className="opacity-60">.tool</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">Impressum</div>
              </div>
            </button>

            <button
              onClick={() => router.back()}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Zurück
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-4xl px-5 sm:px-6 py-10 sm:py-12">
        <div className="rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Impressum</h1>
          <p className="mt-3 text-sm sm:text-base text-black/55">
            Musterangaben – bitte mit deinen echten Unternehmensdaten ersetzen.
          </p>

          <div className="mt-8 grid gap-6">
            <div>
              <div className="text-sm font-semibold text-black/75">Anbieter / Betreiber</div>
              <div className="mt-2 text-sm text-black/60 leading-relaxed">
                Firmenname / Betreiber: <span className="font-medium">[Dein Firmenname]</span>
                <br />
                Rechtsform: <span className="font-medium">[GmbH / AG / Einzelfirma]</span>
                <br />
                Adresse: <span className="font-medium">[Strasse, Nr., PLZ Ort, Schweiz]</span>
                <br />
                E-Mail: <span className="font-medium">[info@domain.ch]</span>
                <br />
                Telefon: <span className="font-medium">[+41 …]</span>
                <br />
                UID: <span className="font-medium">[CHE-…]</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-black/75">
                Vertretungsberechtigte Person(en)
              </div>
              <div className="mt-2 text-sm text-black/60 leading-relaxed">
                <span className="font-medium">[Name, Funktion]</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-black/75">Haftungsausschluss</div>
              <div className="mt-2 text-sm text-black/60 leading-relaxed">
                Inhalte dieser Website werden mit Sorgfalt erstellt. Für Richtigkeit, Vollständigkeit
                und Aktualität kann jedoch keine Gewähr übernommen werden. Das Tool unterstützt
                Entscheidungsprozesse, ersetzt jedoch keine rechtliche, steuerliche oder finanzielle
                Beratung.
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-black/75">Haftung für Links</div>
              <div className="mt-2 text-sm text-black/60 leading-relaxed">
                Verweise und Links auf Websites Dritter liegen ausserhalb unseres Verantwortungsbereichs.
                Der Zugriff und die Nutzung erfolgen auf eigene Gefahr.
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-black/75">Urheberrechte</div>
              <div className="mt-2 text-sm text-black/60 leading-relaxed">
                Die Inhalte, Struktur und Gestaltung dieser Website sind urheberrechtlich geschützt.
                Jede Vervielfältigung, Bearbeitung oder Verbreitung bedarf der vorherigen schriftlichen
                Zustimmung.
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <a
              className="rounded-full px-4 py-2 border border-black/10 bg-white/70 hover:bg-white/85 transition"
              href="/datenschutz"
            >
              Datenschutz
            </a>
            <a
              className="rounded-full px-4 py-2 border border-black/10 bg-white/70 hover:bg-white/85 transition"
              href="/agb"
            >
              AGB
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 pb-6">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <a href="/agb" className="underline underline-offset-2 decoration-black/20">
                AGB
              </a>
              <a href="/datenschutz" className="underline underline-offset-2 decoration-black/20">
                Datenschutz
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
