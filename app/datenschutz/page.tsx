"use client";

import { useRouter } from "next/navigation";

export default function DatenschutzPage() {
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
                <div className="text-[11px] sm:text-xs text-black/45">
                  Datenschutz (Schweiz / DSG)
                </div>
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
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Datenschutzerklärung
          </h1>
          <p className="mt-3 text-sm sm:text-base text-black/55">
            Diese Vorlage orientiert sich am Schweizer Datenschutzgesetz (DSG). Bitte ergänze
            Anbieterangaben und prüfe die Texte mit deinem Setup (Hosting, Analytics, Payment).
          </p>

          <div className="mt-8 space-y-7 text-sm text-black/65 leading-relaxed">
            <div>
              <div className="font-semibold text-black/80">1. Verantwortliche Stelle</div>
              <div className="mt-2">
                Verantwortlich für die Datenbearbeitung ist:
                <br />
                <span className="font-medium">[Dein Firmenname / Betreiber]</span>,{" "}
                <span className="font-medium">[Adresse, Schweiz]</span>
                <br />
                Kontakt: <span className="font-medium">[E-Mail]</span>
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">2. Grundsätze</div>
              <div className="mt-2">
                Wir bearbeiten Personendaten nach den Grundsätzen von Zweckbindung,
                Verhältnismässigkeit (Datenminimierung), Transparenz und Sicherheit. Wir treffen
                angemessene technische und organisatorische Massnahmen (TOM), um Daten zu schützen.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">3. Welche Daten wir bearbeiten</div>
              <div className="mt-2">
                Je nach Nutzung des Tools können folgende Kategorien betroffen sein:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Account-Daten (z. B. Name, E-Mail, Login-Daten – sofern Registrierung aktiv)</li>
                  <li>Nutzungs-/Technikdaten (z. B. IP-Adresse, Browser, Zeitpunkt, Logdaten)</li>
                  <li>Inhaltsdaten (z. B. Entscheidungsentwürfe, Kriterien, Bewertungen)</li>
                  <li>Zahlungsdaten (bei Abonnements – typischerweise via Zahlungsanbieter)</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">4. Zweck der Bearbeitung</div>
              <div className="mt-2">
                Wir bearbeiten Daten insbesondere zur Bereitstellung des Tools, zur Sicherstellung des
                Betriebs (Security/Logs), zur Verbesserung des Angebots, zur Abwicklung von Zahlungen
                und – falls aktiviert – zum Speichern/Exportieren von Inhalten.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">5. Rechtsgrundlagen (DSG)</div>
              <div className="mt-2">
                Die Bearbeitung erfolgt im Rahmen des DSG, insbesondere:
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>zur Vertragserfüllung (Nutzung des Tools / Abonnement)</li>
                  <li>aufgrund überwiegender Interessen (Sicherheit, Betrieb, Missbrauchsprävention)</li>
                  <li>aufgrund Einwilligung (z. B. optionale Cookies/Analytics, sofern eingesetzt)</li>
                </ul>
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">
                6. Auftragsbearbeiter & Drittanbieter
              </div>
              <div className="mt-2">
                Wir können Dienstleister einsetzen (z. B. Hosting, E-Mail, Monitoring, Payment). Diese
                bearbeiten Daten als Auftragsbearbeiter gemäss DSG und nur nach unseren Weisungen.
                Falls Daten in Länder ausserhalb der Schweiz/des EWR übertragen werden, stellen wir ein
                angemessenes Datenschutzniveau sicher (z. B. Standardvertragsklauseln, wo nötig).
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">7. Speicherdauer</div>
              <div className="mt-2">
                Wir speichern Daten nur so lange, wie dies für die Zwecke erforderlich ist, gesetzliche
                Pflichten bestehen oder berechtigte Interessen (z. B. Sicherheit/Beweissicherung) dies
                verlangen. Inhalte/Entscheidungsdaten können durch Nutzer gelöscht werden, sofern diese
                Funktion angeboten wird.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">8. Datensicherheit</div>
              <div className="mt-2">
                Wir setzen geeignete Massnahmen ein (z. B. Zugriffskontrollen, Verschlüsselung bei
                Übertragung, Protokollierung, Backup-Strategien). Dennoch kann keine absolute Sicherheit
                garantiert werden.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">9. Rechte der betroffenen Personen</div>
              <div className="mt-2">
                Betroffene Personen können nach DSG Auskunft, Berichtigung, Löschung sowie weitere
                Rechte geltend machen, soweit anwendbar. Anfragen bitte an{" "}
                <span className="font-medium">[Kontakt-E-Mail]</span>.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">10. Cookies / Tracking</div>
              <div className="mt-2">
                Falls Cookies oder Analytics eingesetzt werden, informieren wir darüber transparent.
                Notwendige Cookies dienen dem Betrieb/Sicherheit. Optionale Cookies (z. B. Analytics)
                werden – falls eingesetzt – nur nach Einwilligung verwendet.
              </div>
            </div>

            <div>
              <div className="font-semibold text-black/80">11. Änderungen</div>
              <div className="mt-2">
                Diese Datenschutzerklärung kann angepasst werden, wenn sich Funktionen oder rechtliche
                Anforderungen ändern. Es gilt die jeweils aktuelle Version auf dieser Seite.
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm">
            <a
              className="rounded-full px-4 py-2 border border-black/10 bg-white/70 hover:bg-white/85 transition"
              href="/agb"
            >
              AGB
            </a>
            <a
              className="rounded-full px-4 py-2 border border-black/10 bg-white/70 hover:bg-white/85 transition"
              href="/impressum"
            >
              Impressum
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
              <a href="/impressum" className="underline underline-offset-2 decoration-black/20">
                Impressum
              </a>
              <a href="/agb" className="underline underline-offset-2 decoration-black/20">
                AGB
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
