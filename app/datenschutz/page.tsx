import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalShell,
  LegalSectionBlock,
  LegalNote,
  LegalDataList,
  type LegalSection,
} from "@/app/components/legal/LegalShell";
import { siteConfig, displayValue, formatSwissDate } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description:
    "Datenschutzerklärung von Nutzwertanalyse.com nach dem revidierten Schweizer Datenschutzgesetz (DSG), der Datenschutzverordnung (DSV) und – soweit anwendbar – der DSGVO.",
  alternates: { canonical: "/datenschutz" },
};

const SECTIONS: LegalSection[] = [
  { id: "verantwortliche", title: "Verantwortliche Stelle" },
  { id: "geltungsbereich", title: "Geltungsbereich und anwendbares Recht" },
  { id: "grundsaetze", title: "Bearbeitungsgrundsätze" },
  { id: "kategorien", title: "Bearbeitete Datenkategorien" },
  { id: "zwecke", title: "Zwecke und Rechtfertigungsgründe" },
  { id: "lokale-speicherung", title: "Lokale Speicherung im Browser" },
  { id: "ki", title: "KI-gestützte Strukturierung" },
  { id: "cookies", title: "Cookies und Tracking" },
  { id: "logfiles", title: "Server-Logfiles und Hosting" },
  { id: "empfaenger", title: "Empfänger und Auftragsbearbeiter" },
  { id: "ausland", title: "Bekanntgabe ins Ausland" },
  { id: "aufbewahrung", title: "Aufbewahrungsdauer" },
  { id: "sicherheit", title: "Datensicherheit und Datenpannen" },
  { id: "rechte", title: "Ihre Rechte nach DSG" },
  { id: "dsgvo", title: "Zusätzliche Rechte nach DSGVO" },
  { id: "automatisiert", title: "Automatisierte Einzelentscheidungen" },
  { id: "minderjaehrige", title: "Minderjährige" },
  { id: "aufsicht", title: "Aufsichtsbehörde und Rechtsweg" },
  { id: "aenderungen", title: "Änderungen dieser Erklärung" },
];

export default function DatenschutzPage() {
  const o = siteConfig.operator;
  const authority = siteConfig.privacy.supervisoryAuthority;

  return (
    <LegalShell
      eyebrow="Datenschutz"
      title="Datenschutzerklärung"
      lead="Diese Erklärung informiert darüber, welche Personendaten beim Besuch und bei der Nutzung von Nutzwertanalyse.com bearbeitet werden, zu welchen Zwecken dies geschieht und welche Rechte Ihnen zustehen. Grundlage sind das revidierte Schweizer Datenschutzgesetz (DSG) und die Datenschutzverordnung (DSV) sowie, soweit anwendbar, die europäische Datenschutz-Grundverordnung (DSGVO)."
      sections={SECTIONS}
      currentPath="/datenschutz"
    >
      <LegalSectionBlock id="verantwortliche" index={1} title="Verantwortliche Stelle">
        <p>
          Verantwortlich für die in dieser Erklärung beschriebenen Datenbearbeitungen im Sinne von{" "}
          <span className="legal-ref">Art. 5 lit. j DSG</span> (und, soweit anwendbar,{" "}
          <span className="legal-ref">Art. 4 Ziff. 7 DSGVO</span>) ist:
        </p>
        <LegalDataList
          items={[
            { label: "Verantwortlicher", value: displayValue(o.legalName) },
            {
              label: "Adresse",
              value: (
                <>
                  {displayValue(o.street)}
                  <br />
                  {displayValue(o.zip)} {displayValue(o.city)}, {o.country}
                </>
              ),
            },
            {
              label: "Datenschutzkontakt",
              value: (
                <a href={`mailto:${o.privacyEmail}`}>{displayValue(o.privacyEmail)}</a>
              ),
            },
            {
              label: "Datenschutzberater",
              value:
                siteConfig.privacy.dataProtectionOfficer ??
                "Es besteht keine gesetzliche Pflicht zur Ernennung; es wurde kein Datenschutzberater nach Art. 10 DSG benannt.",
            },
            {
              label: "Vertretung in der EU",
              value:
                siteConfig.privacy.euRepresentative ??
                "Nicht bestellt; eine Vertretung nach Art. 27 DSGVO wird bestellt, sobald die Voraussetzungen dafür erfüllt sind.",
            },
          ]}
        />
      </LegalSectionBlock>

      <LegalSectionBlock id="geltungsbereich" index={2} title="Geltungsbereich und anwendbares Recht">
        <p>
          Diese Erklärung gilt für die Website <a href={siteConfig.url}>{siteConfig.domain}</a> sowie für
          alle damit verbundenen Funktionen der Anwendung (Assistent zur Nutzwertanalyse, Berichte,
          Export- und Importfunktionen).
        </p>
        <p>
          Primär anwendbar ist das Bundesgesetz über den Datenschutz (
          <span className="legal-ref">DSG</span>, in Kraft seit 1. September 2023) samt der
          Datenschutzverordnung (<span className="legal-ref">DSV</span>). Soweit Personendaten von
          Personen im Europäischen Wirtschaftsraum bearbeitet werden und der räumliche Anwendungsbereich
          nach <span className="legal-ref">Art. 3 Abs. 2 DSGVO</span> eröffnet ist, gilt zusätzlich die
          DSGVO. Wir wenden in diesem Fall das jeweils strengere Schutzniveau an.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="grundsaetze" index={3} title="Bearbeitungsgrundsätze">
        <p>
          Wir bearbeiten Personendaten nach den Grundsätzen von{" "}
          <span className="legal-ref">Art. 6 DSG</span>:
        </p>
        <ul>
          <li>
            <strong>Rechtmässigkeit und Treu und Glauben</strong> – Bearbeitung nur auf zulässiger
            Grundlage und in einer für Sie nachvollziehbaren Weise.
          </li>
          <li>
            <strong>Verhältnismässigkeit / Datenminimierung</strong> – wir erheben nur, was für den
            jeweiligen Zweck tatsächlich erforderlich ist.
          </li>
          <li>
            <strong>Zweckbindung</strong> – Daten werden nur für die bei der Beschaffung angegebenen,
            daraus ersichtlichen oder gesetzlich vorgesehenen Zwecke bearbeitet.
          </li>
          <li>
            <strong>Erkennbarkeit</strong> – die Beschaffung und der Bearbeitungszweck sind aus dieser
            Erklärung ersichtlich (<span className="legal-ref">Art. 19 DSG</span>).
          </li>
          <li>
            <strong>Richtigkeit</strong> – wir treffen angemessene Massnahmen, damit unrichtige Daten
            berichtigt oder gelöscht werden.
          </li>
          <li>
            <strong>Datensicherheit</strong> – angemessene technische und organisatorische Massnahmen
            nach <span className="legal-ref">Art. 8 DSG</span> und{" "}
            <span className="legal-ref">Art. 1–6 DSV</span>.
          </li>
        </ul>
        <p>
          Zusätzlich berücksichtigen wir den Grundsatz des Datenschutzes durch Technik und
          datenschutzfreundliche Voreinstellungen (<span className="legal-ref">Art. 7 DSG</span>): Die
          Anwendung ist so ausgelegt, dass Analysen standardmässig lokal im Browser verbleiben und keine
          Registrierung erforderlich ist.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="kategorien" index={4} title="Bearbeitete Datenkategorien">
        <p>Je nach Nutzung können folgende Kategorien von Personendaten bearbeitet werden:</p>
        <ul>
          <li>
            <strong>Technische Verbindungsdaten</strong>: IP-Adresse, Datum und Uhrzeit des Zugriffs,
            abgerufene Ressource, HTTP-Statuscode, übertragene Datenmenge, Referrer, Browsertyp und
            Betriebssystem.
          </li>
          <li>
            <strong>Inhaltsdaten der Analyse</strong>: Entscheidungsfrage, Alternativen, Kriterien,
            Gewichtungen, Bewertungen, Kommentare und Berichte. Diese werden standardmässig{" "}
            <strong>ausschliesslich lokal in Ihrem Browser</strong> gespeichert (siehe Ziffer 6).
          </li>
          <li>
            <strong>Eingabedaten der KI-Funktion</strong>: der von Ihnen eingegebene Freitext, sofern Sie
            die optionale KI-Strukturierung aktiv auslösen (siehe Ziffer 7).
          </li>
          <li>
            <strong>Kommunikationsdaten</strong>: Name, E-Mail-Adresse und Inhalt Ihrer Nachricht, wenn
            Sie uns kontaktieren.
          </li>
          <li>
            <strong>Einstellungsdaten</strong>: gewählte Sprache, gewähltes Paket, Cookie-Einwilligung.
          </li>
        </ul>
        <p>
          Besonders schützenswerte Personendaten im Sinne von{" "}
          <span className="legal-ref">Art. 5 lit. c DSG</span> werden von uns nicht gezielt erhoben.
          Bitte geben Sie keine solchen Daten (z. B. Gesundheitsdaten, religiöse oder politische
          Ansichten, Daten über administrative oder strafrechtliche Verfolgungen) in Freitextfelder ein.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="zwecke" index={5} title="Zwecke und Rechtfertigungsgründe">
        <p>
          Nach schweizerischem Recht ist die Bearbeitung von Personendaten durch Private grundsätzlich
          zulässig, solange die Grundsätze von <span className="legal-ref">Art. 6 DSG</span> eingehalten
          werden. Eine Persönlichkeitsverletzung ist nach{" "}
          <span className="legal-ref">Art. 31 DSG</span> gerechtfertigt durch Einwilligung, überwiegendes
          privates oder öffentliches Interesse oder durch Gesetz. Wir stützen uns auf:
        </p>
        <ul>
          <li>
            <strong>Vertragserfüllung und vorvertragliche Massnahmen</strong> – Bereitstellung der
            Anwendung und ihrer Funktionen (
            <span className="legal-ref">Art. 31 Abs. 2 lit. a DSG</span>;{" "}
            <span className="legal-ref">Art. 6 Abs. 1 lit. b DSGVO</span>).
          </li>
          <li>
            <strong>Überwiegendes berechtigtes Interesse</strong> – Betriebssicherheit,
            Missbrauchsabwehr, Stabilität und Weiterentwicklung des Angebots (
            <span className="legal-ref">Art. 31 Abs. 1 DSG</span>;{" "}
            <span className="legal-ref">Art. 6 Abs. 1 lit. f DSGVO</span>).
          </li>
          <li>
            <strong>Einwilligung</strong> – optionale Cookies, optionale Analysefunktionen und der
            optionale Versand von Eingaben an den KI-Dienst (
            <span className="legal-ref">Art. 6 Abs. 6 DSG</span>;{" "}
            <span className="legal-ref">Art. 6 Abs. 1 lit. a DSGVO</span>). Eine erteilte Einwilligung
            kann jederzeit mit Wirkung für die Zukunft widerrufen werden.
          </li>
          <li>
            <strong>Gesetzliche Pflichten</strong> – Einhaltung von Aufbewahrungs-, Buchführungs- und
            Auskunftspflichten (<span className="legal-ref">Art. 31 Abs. 1 DSG</span>;{" "}
            <span className="legal-ref">Art. 6 Abs. 1 lit. c DSGVO</span>).
          </li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="lokale-speicherung" index={6} title="Lokale Speicherung im Browser">
        <LegalNote tone="accent" title="Ihre Analysen bleiben bei Ihnen">
          Entscheidungsfragen, Alternativen, Kriterien, Gewichte und Bewertungen werden im{" "}
          <code>localStorage</code> Ihres Browsers gespeichert. Diese Daten werden nicht an unsere Server
          übertragen, ausser Sie lösen ausdrücklich die KI-Funktion aus.
        </LegalNote>
        <p>Konkret werden folgende Schlüssel im lokalen Speicher abgelegt:</p>
        <ul>
          <li>
            <code>nwa_draft_state</code> – aktueller Entwurf der laufenden Analyse (automatische
            Zwischenspeicherung, damit Sie nach einem Seitenwechsel weiterarbeiten können).
          </li>
          <li>
            <code>nwa_library</code> – von Ihnen bewusst gespeicherte Analysen.
          </li>
          <li>
            <code>nwa_theme</code>, <code>nwa_packageLevel</code>, <code>nwa_locale</code> – Ihre
            Oberflächeneinstellungen.
          </li>
          <li>
            <code>nwa_consent</code> – Ihre Cookie-Einwilligung samt Zeitstempel und Version
            (Nachweispflicht).
          </li>
        </ul>
        <p>
          Sie können diese Daten jederzeit selbst löschen: in der Anwendung über „Analyse zurücksetzen“
          bzw. die Verwaltung der gespeicherten Analysen, oder im Browser über das Löschen der
          Website-Daten. Nach dem Löschen sind die Inhalte unwiederbringlich entfernt – wir halten davon
          keine Kopie.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ki" index={7} title="KI-gestützte Strukturierung">
        <p>
          Die Anwendung bietet optional an, eine frei formulierte Entscheidungsfrage automatisch in
          Alternativen und Kriterien zu strukturieren. Diese Funktion wird{" "}
          <strong>nur auf Ihre ausdrückliche Auslösung hin</strong> ausgeführt.
        </p>
        <p>
          Dabei wird der von Ihnen eingegebene Text an unseren Server und von dort an einen externen
          Anbieter eines grossen Sprachmodells übermittelt und dort verarbeitet. Die Verarbeitung kann
          ausserhalb der Schweiz stattfinden (siehe Ziffer 11). Wir übermitteln keine Kontodaten und
          keine IP-Adresse als Inhalt an den KI-Anbieter.
        </p>
        <LegalNote tone="warning" title="Bitte keine vertraulichen Angaben">
          Geben Sie in das Freitextfeld der KI-Funktion keine Geschäftsgeheimnisse, keine
          Personendaten Dritter und keine besonders schützenswerten Daten ein. Für die
          Nutzwertanalyse selbst ist die KI-Funktion nicht erforderlich – Sie können Alternativen und
          Kriterien jederzeit manuell erfassen.
        </LegalNote>
        <p>
          Die Ausgabe des Sprachmodells ist ein Vorschlag, den Sie vollständig bearbeiten, ergänzen oder
          verwerfen können. Es findet keine automatisierte Einzelentscheidung im Sinne von{" "}
          <span className="legal-ref">Art. 21 DSG</span> statt (siehe Ziffer 16).
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="cookies" index={8} title="Cookies und Tracking">
        <p>
          Wir setzen technisch notwendige Speichermechanismen ein, die für den Betrieb der Anwendung
          erforderlich sind. Optionale Cookies – etwa für Reichweitenmessung – werden erst nach Ihrer
          Einwilligung gesetzt.
        </p>
        <p>
          Nach <span className="legal-ref">Art. 45c lit. b FMG</span> ist die Bearbeitung von Daten auf
          fremden Geräten zulässig, wenn die Nutzerinnen und Nutzer über die Bearbeitung und ihren Zweck
          informiert werden und auf die Möglichkeit hingewiesen werden, die Bearbeitung abzulehnen
          (Opt-out). Für Besucherinnen und Besucher aus dem EWR holen wir zusätzlich eine vorgängige
          Einwilligung (Opt-in) ein.
        </p>
        <p>
          Eine detaillierte Aufstellung aller eingesetzten Cookies und lokalen Speichereinträge sowie die
          Möglichkeit, Ihre Einwilligung anzupassen oder zu widerrufen, finden Sie in unserer{" "}
          <Link href="/cookies">Cookie-Richtlinie</Link>.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="logfiles" index={9} title="Server-Logfiles und Hosting">
        <p>
          Beim Aufruf der Website übermittelt Ihr Browser technisch bedingt Daten, die in Logfiles
          gespeichert werden. Diese Bearbeitung ist zur Auslieferung der Website und zur Gewährleistung
          der Systemsicherheit erforderlich und stützt sich auf unser überwiegendes berechtigtes
          Interesse an einem sicheren und stabilen Betrieb.
        </p>
        <p>
          Logfiles werden nach spätestens 90 Tagen gelöscht oder anonymisiert, soweit sie nicht zur
          Abklärung eines konkreten Missbrauchs- oder Sicherheitsvorfalls benötigt werden. Eine
          Zusammenführung dieser Daten mit Inhaltsdaten Ihrer Analysen findet nicht statt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="empfaenger" index={10} title="Empfänger und Auftragsbearbeiter">
        <p>
          Wir geben Personendaten nur weiter, wenn dies zur Erbringung der Leistung erforderlich ist, Sie
          eingewilligt haben oder wir gesetzlich dazu verpflichtet sind. Dienstleister werden als
          Auftragsbearbeiter nach <span className="legal-ref">Art. 9 DSG</span> (bzw.{" "}
          <span className="legal-ref">Art. 28 DSGVO</span>) verpflichtet und dürfen Daten nur nach
          unseren Weisungen und im gleichen Umfang bearbeiten, wie es uns selbst erlaubt ist.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-white/40">
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Empfänger</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Zweck</th>
                <th className="border-b border-white/10 pb-2 font-medium">Standort</th>
              </tr>
            </thead>
            <tbody>
              {siteConfig.dataProcessors.map((processor) => (
                <tr key={processor.name} className="align-top">
                  <td className="border-b border-white/[0.06] py-3 pr-4 text-white/75">
                    {processor.name}
                  </td>
                  <td className="border-b border-white/[0.06] py-3 pr-4 text-white/55">
                    {processor.purpose}
                  </td>
                  <td className="border-b border-white/[0.06] py-3 text-white/55">
                    {processor.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Darüber hinaus können Daten an Behörden, Gerichte oder Rechtsvertreter herausgegeben werden,
          wenn wir dazu gesetzlich verpflichtet oder berechtigt sind. Ein Verkauf von Personendaten
          findet nicht statt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ausland" index={11} title="Bekanntgabe ins Ausland">
        <p>
          Eine Bekanntgabe von Personendaten ins Ausland ist nach{" "}
          <span className="legal-ref">Art. 16 DSG</span> zulässig, wenn der Bundesrat festgestellt hat,
          dass die Gesetzgebung des betreffenden Staates einen angemessenen Schutz gewährleistet (
          <span className="legal-ref">Anhang 1 DSV</span>). Für Staaten ohne solche Feststellung sichern
          wir einen angemessenen Schutz mit geeigneten Garantien nach{" "}
          <span className="legal-ref">Art. 16 Abs. 2 DSG</span> ab – insbesondere durch die vom EDÖB
          anerkannten Standardvertragsklauseln der Europäischen Kommission mit den erforderlichen
          Anpassungen für die Schweiz.
        </p>
        <p>
          Bei Übermittlungen in die Vereinigten Staaten stützen wir uns zusätzlich, soweit der jeweilige
          Anbieter zertifiziert ist, auf das Swiss–U.S. Data Privacy Framework bzw. das
          EU–U.S. Data Privacy Framework. Trotz dieser Garantien kann in Einzelfällen nicht
          ausgeschlossen werden, dass ausländische Behörden auf Daten zugreifen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="aufbewahrung" index={12} title="Aufbewahrungsdauer">
        <p>
          Wir bearbeiten und speichern Personendaten nur so lange, wie es für den jeweiligen Zweck
          erforderlich ist oder wie es gesetzliche Aufbewahrungspflichten verlangen (
          <span className="legal-ref">Art. 6 Abs. 4 DSG</span>). Konkret gilt:
        </p>
        <ul>
          <li>
            <strong>Lokale Analysedaten</strong>: bis Sie sie selbst löschen – wir haben darauf keinen
            Zugriff.
          </li>
          <li>
            <strong>Server-Logfiles</strong>: in der Regel 90 Tage.
          </li>
          <li>
            <strong>KI-Anfragen</strong>: die Verarbeitung erfolgt transient; wir speichern die
            Eingabetexte nicht dauerhaft. Aufbewahrungsfristen des KI-Anbieters richten sich nach dessen
            Auftragsbearbeitungsvertrag.
          </li>
          <li>
            <strong>Kommunikation</strong>: bis zur abschliessenden Bearbeitung Ihres Anliegens, danach
            im Rahmen allfälliger Beweis- und Aufbewahrungsinteressen bis zu zehn Jahre (
            <span className="legal-ref">Art. 958f OR</span>, sofern geschäftsrelevant).
          </li>
          <li>
            <strong>Einwilligungsnachweise</strong>: für die Dauer der Nachweispflicht, längstens jedoch
            bis zum Widerruf zuzüglich der Verjährungsfristen.
          </li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="sicherheit" index={13} title="Datensicherheit und Datenpannen">
        <p>
          Wir treffen angemessene technische und organisatorische Massnahmen nach{" "}
          <span className="legal-ref">Art. 8 DSG</span> in Verbindung mit{" "}
          <span className="legal-ref">Art. 1–6 DSV</span>, um Vertraulichkeit, Integrität und
          Verfügbarkeit sicherzustellen. Dazu gehören namentlich:
        </p>
        <ul>
          <li>Transportverschlüsselung sämtlicher Verbindungen über TLS (HTTPS);</li>
          <li>
            restriktive Sicherheits-Header (unter anderem HSTS, X-Content-Type-Options, Referrer-Policy,
            Permissions-Policy);
          </li>
          <li>Datensparsamkeit durch lokale statt serverseitiger Speicherung der Analysen;</li>
          <li>Zugriffsbeschränkungen und Protokollierung auf Infrastrukturebene;</li>
          <li>Validierung und Bereinigung sämtlicher Eingaben an den Server-Schnittstellen.</li>
        </ul>
        <p>
          Kommt es zu einer Verletzung der Datensicherheit, die voraussichtlich zu einem hohen Risiko für
          die Persönlichkeit oder die Grundrechte der betroffenen Personen führt, melden wir dies dem
          EDÖB so rasch als möglich (<span className="legal-ref">Art. 24 Abs. 1 DSG</span>) und
          informieren die betroffenen Personen, soweit dies zu deren Schutz erforderlich ist oder der
          EDÖB es verlangt (<span className="legal-ref">Art. 24 Abs. 4 DSG</span>). Fällt die Bearbeitung
          unter die DSGVO, erfolgt die Meldung innert 72 Stunden nach{" "}
          <span className="legal-ref">Art. 33 DSGVO</span>.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="rechte" index={14} title="Ihre Rechte nach DSG">
        <p>Als betroffene Person stehen Ihnen insbesondere folgende Rechte zu:</p>
        <ul>
          <li>
            <strong>Auskunft</strong> (<span className="legal-ref">Art. 25 DSG</span>) – Sie können
            Auskunft darüber verlangen, ob und welche Personendaten wir über Sie bearbeiten. Die Auskunft
            ist grundsätzlich kostenlos und wird in der Regel innert 30 Tagen erteilt.
          </li>
          <li>
            <strong>Berichtigung</strong> (<span className="legal-ref">Art. 32 Abs. 1 DSG</span>) –
            unrichtige Daten lassen wir berichtigen.
          </li>
          <li>
            <strong>Löschung und Bearbeitungsverbot</strong> (
            <span className="legal-ref">Art. 32 Abs. 2 DSG</span>) – Sie können verlangen, dass Daten
            gelöscht oder nicht mehr bearbeitet werden bzw. die Bekanntgabe an Dritte unterbleibt.
          </li>
          <li>
            <strong>Datenherausgabe und -übertragung</strong> (
            <span className="legal-ref">Art. 28 DSG</span>) – Herausgabe der von Ihnen bekanntgegebenen
            Daten in einem gängigen elektronischen Format. In der Anwendung können Sie Ihre Analysen
            jederzeit selbst als JSON- oder CSV-Datei exportieren.
          </li>
          <li>
            <strong>Widerspruch</strong> (<span className="legal-ref">Art. 30 Abs. 2 lit. b DSG</span>) –
            Sie können der Bearbeitung widersprechen.
          </li>
          <li>
            <strong>Widerruf der Einwilligung</strong> (
            <span className="legal-ref">Art. 6 Abs. 6 DSG</span>) – jederzeit mit Wirkung für die
            Zukunft, ohne Einfluss auf die Rechtmässigkeit der bisherigen Bearbeitung.
          </li>
        </ul>
        <p>
          Zur Ausübung Ihrer Rechte genügt eine Nachricht an{" "}
          <a href={`mailto:${o.privacyEmail}`}>{displayValue(o.privacyEmail)}</a>. Zum Schutz Ihrer Daten
          müssen wir Ihre Identität in geeigneter Weise überprüfen. Wir können die Auskunft in den in{" "}
          <span className="legal-ref">Art. 26 DSG</span> genannten Fällen einschränken, aufschieben oder
          verweigern; wir begründen dies diesfalls.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="dsgvo" index={15} title="Zusätzliche Rechte nach DSGVO">
        <p>
          Fällt die Bearbeitung in den Anwendungsbereich der DSGVO, stehen Ihnen zusätzlich zu:
        </p>
        <ul>
          <li>Auskunft (<span className="legal-ref">Art. 15 DSGVO</span>);</li>
          <li>Berichtigung (<span className="legal-ref">Art. 16 DSGVO</span>);</li>
          <li>Löschung, „Recht auf Vergessenwerden“ (<span className="legal-ref">Art. 17 DSGVO</span>);</li>
          <li>Einschränkung der Verarbeitung (<span className="legal-ref">Art. 18 DSGVO</span>);</li>
          <li>Datenübertragbarkeit (<span className="legal-ref">Art. 20 DSGVO</span>);</li>
          <li>
            Widerspruch gegen Verarbeitungen auf Grundlage berechtigter Interessen (
            <span className="legal-ref">Art. 21 DSGVO</span>);
          </li>
          <li>
            Beschwerde bei einer Aufsichtsbehörde im Mitgliedstaat Ihres Aufenthaltsorts (
            <span className="legal-ref">Art. 77 DSGVO</span>).
          </li>
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="automatisiert" index={16} title="Automatisierte Einzelentscheidungen">
        <p>
          Wir treffen keine Entscheidungen, die für Sie mit einer Rechtsfolge verbunden sind oder Sie
          erheblich beeinträchtigen und ausschliesslich auf einer automatisierten Bearbeitung beruhen (
          <span className="legal-ref">Art. 21 DSG</span>,{" "}
          <span className="legal-ref">Art. 22 DSGVO</span>).
        </p>
        <p>
          Die Berechnung der Nutzwerte erfolgt zwar automatisiert, beruht aber vollständig auf den von
          Ihnen selbst gesetzten Kriterien, Gewichten und Bewertungen und dient allein Ihrer eigenen
          Entscheidungsvorbereitung. Es findet kein Profiling im Sinne von{" "}
          <span className="legal-ref">Art. 5 lit. f DSG</span> statt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="minderjaehrige" index={17} title="Minderjährige">
        <p>
          Das Angebot richtet sich an urteilsfähige Personen. Personen unter 16 Jahren sollten
          Personendaten nur mit Zustimmung der Inhaberin oder des Inhabers der elterlichen Sorge
          eingeben. Erhalten wir Kenntnis davon, dass wir Daten eines Kindes ohne die erforderliche
          Zustimmung bearbeiten, löschen wir diese unverzüglich.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="aufsicht" index={18} title="Aufsichtsbehörde und Rechtsweg">
        <p>
          Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren. Zuständige
          Behörde in der Schweiz ist:
        </p>
        <LegalDataList
          items={[
            { label: "Behörde", value: authority.name },
            { label: "Adresse", value: authority.address },
            {
              label: "Website",
              value: (
                <a href={authority.url} target="_blank" rel="noopener noreferrer">
                  {authority.url.replace("https://", "")}
                </a>
              ),
            },
          ]}
        />
        <p>
          Unabhängig davon steht Ihnen der Zivilrechtsweg offen (
          <span className="legal-ref">Art. 32 Abs. 2 DSG</span> i. V. m.{" "}
          <span className="legal-ref">Art. 28 ff. ZGB</span>). Personen im EWR können sich zusätzlich an
          die Aufsichtsbehörde ihres Aufenthaltsorts wenden.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="aenderungen" index={19} title="Änderungen dieser Erklärung">
        <p>
          Wir können diese Datenschutzerklärung anpassen, wenn sich unsere Bearbeitungen, die eingesetzten
          Dienste oder die rechtlichen Anforderungen ändern. Massgebend ist die jeweils auf dieser Seite
          veröffentlichte Fassung.
        </p>
        <p className="text-white/40">
          Version {siteConfig.legalVersion.version} – in Kraft seit{" "}
          {formatSwissDate(siteConfig.legalVersion.effectiveDate)}, zuletzt aktualisiert am{" "}
          {formatSwissDate(siteConfig.legalVersion.lastUpdated)}.
        </p>
      </LegalSectionBlock>
    </LegalShell>
  );
}
