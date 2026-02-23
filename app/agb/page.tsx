"use client";

import { useRouter } from "next/navigation";

export default function AgbPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] via-[#f3f6f6] to-[#eef2f2]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
      </div>

      <header className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-4xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Zur Startseite"
            >
              <div className="h-10 w-10 rounded-2xl bg-black/5 border border-black/10 grid place-items-center">
                <span className="text-black/70 text-lg">⌁</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                  Nutzwertanalyse<span className="opacity-60">.tool</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">AGB</div>
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

      <section className="mx-auto max-w-4xl px-5 sm:px-6 py-10 sm:py-12">
        <div className="rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Allgemeine Geschäftsbedingungen (AGB)
          </h1>
          <p className="mt-3 text-sm sm:text-base text-black/55">
            Muster-AGB für eine typische SaaS-Anwendung in der Schweiz. Bitte juristisch prüfen lassen
            und mit deinen Daten ergänzen.
          </p>

          <div className="mt-8 space-y-7 text-sm text-black/65 leading-relaxed">
            <div>
              <div className="font-semibold text-black/80">1. Geltungsbereich</div>
              <div className="mt-2">
                Diese AGB regeln die Nutzung der SaaS-Plattform <span className="font-medium">Nutzwertanalyse.tool</span>
                (nachfolgend „Tool“) durch Kundinnen und Kunden („Nutzer“). Abweichende Bedingungen
                finden nur Anwendung, wenn sie schriftlich bestätigt wurden.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">2. Leistungen</div>
              <div className="mt-2">
                Das Tool unterstützt die strukturierte Entscheidungsfindung (z. B. Kriterien, Gewichtung,
                Bewertung, Reports). Der Anbieter schuldet keine bestimmte Entscheidung oder einen
                bestimmten Erfolg. Inhalte stellen keine Rechts-, Steuer- oder Finanzberatung dar.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">3. Registrierung / Account</div>
              <div className="mt-2">
                Bestimmte Funktionen (Speichern, Export, Abonnements) können eine Registrierung erfordern.
                Der Nutzer ist verpflichtet, Zugangsdaten vertraulich zu behandeln. Der Anbieter kann
                Accounts bei Missbrauch, Rechtsverstössen oder Sicherheitsrisiken sperren.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">4. Preise / Abonnements</div>
              <div className="mt-2">
                Preise und Leistungsumfang ergeben sich aus der aktuellen Preisliste im Tool bzw. der
                Produktbeschreibung. Abonnements verlängern sich automatisch, sofern nicht fristgerecht
                gekündigt. Details zu Kündigungsfristen und Abrechnungsrhythmus sind im jeweiligen Plan
                definiert.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">5. Verfügbarkeit</div>
              <div className="mt-2">
                Der Anbieter bemüht sich um hohe Verfügbarkeit, kann diese aber nicht garantieren.
                Unterbrüche aufgrund Wartung, Updates oder Störungen (inkl. Drittanbieter-Services)
                sind möglich. Wartungen können ohne Vorankündigung erfolgen, sofern dies notwendig ist.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">6. Pflichten der Nutzer</div>
              <div className="mt-2">
                Nutzer dürfen das Tool nicht missbräuchlich verwenden, insbesondere keine rechtswidrigen
                Inhalte eingeben, keine Sicherheitsmechanismen umgehen und keine automatisierten Zugriffe
                durchführen, die den Betrieb beeinträchtigen.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">7. Daten / Export</div>
              <div className="mt-2">
                Nutzer bleiben Eigentümer ihrer eingegebenen Inhalte. Sofern Exportfunktionen angeboten
                werden, trägt der Nutzer die Verantwortung für Archivierung und Weiterverwendung der
                exportierten Daten.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">8. Geistiges Eigentum</div>
              <div className="mt-2">
                Das Tool, die Software, Templates und Designs sind urheberrechtlich geschützt.
                Der Nutzer erhält ein nicht exklusives, nicht übertragbares Nutzungsrecht für die Dauer
                des Vertrags.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">9. Haftung</div>
              <div className="mt-2">
                Der Anbieter haftet nur für Vorsatz und grobe Fahrlässigkeit, soweit gesetzlich zulässig.
                Die Haftung für indirekte Schäden, Folgeschäden, entgangenen Gewinn sowie Datenverlust
                ist – soweit gesetzlich zulässig – ausgeschlossen. Der Nutzer ist verantwortlich für die
                sachliche Richtigkeit der eingegebenen Daten und die daraus abgeleiteten Entscheidungen.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">10. Datenschutz</div>
              <div className="mt-2">
                Es gilt die Datenschutzerklärung unter <a className="underline underline-offset-2 decoration-black/20" href="/datenschutz">/datenschutz</a>.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">11. Änderungen</div>
              <div className="mt-2">
                Der Anbieter kann diese AGB anpassen. Wesentliche Änderungen werden in geeigneter Form
                kommuniziert. Sofern der Nutzer nicht widerspricht, gelten die neuen Bedingungen ab dem
                angegebenen Zeitpunkt.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">12. Anwendbares Recht / Gerichtsstand</div>
              <div className="mt-2">
                Es gilt schweizerisches Recht. Gerichtsstand ist – soweit zulässig – der Sitz des Anbieters.
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
              href="/impressum"
            >
              Impressum
            </a>
            <button
              onClick={() => router.push("/")}
              className="rounded-full px-4 py-2 border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Startseite
            </button>
          </div>
        </div>
      </section>

      <footer className="pb-6">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 text-[11px] text-black/40">
          © {new Date().getFullYear()} Nutzwertanalyse.tool
        </div>
      </footer>
    </main>
  );
}