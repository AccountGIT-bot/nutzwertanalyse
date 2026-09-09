import type { Metadata } from "next";
import { LegalPage } from "../components/SiteChrome";
import { OperatorDetails } from "../components/OperatorDetails";
import { LocalDataControls } from "../components/LocalDataControls";
import config from "../../site-config.json";
export const metadata: Metadata = { title: "Datenschutz" };
export default function Privacy() {
  return (
    <LegalPage
      title="Datenschutz"
      intro="Was mit deinen Daten geschieht. Stand: 6. September 2026."
    >
      <h2>Das Wichtigste vorweg</h2>
      <ul>
        <li>
          Die Analyse und die Textvorschläge werden direkt in deinem Browser
          berechnet.
        </li>
        <li>
          Entscheidungstexte, Kriterien und Bewertungen werden vom
          Anwendungscode nicht an einen Server oder einen KI-Anbieter
          übermittelt.
        </li>
        <li>
          Dein Entwurf wird auf diesem Gerät gespeichert. Es gibt keine
          Cloud-Synchronisierung und kein Benutzerkonto.
        </li>
        <li>
          Die Anwendung bindet keine Werbetracker, Webanalyse, externen
          Schriftarten oder Social-Media-Inhalte ein.
        </li>
      </ul>
      <h2>Verantwortlich</h2>
      <OperatorDetails />
      <h2>Lokale Verarbeitung</h2>
      <p>
        Das Tool verarbeitet die Inhalte, die du selbst eingibst:
        Entscheidungstitel, Alternativen, Kriterien, Gewichte, Bewertungen,
        Notizen sowie im Business-Umfang Namen der Bewertenden und dokumentierte
        Risiken. Die Daten dienen ausschliesslich der von dir gewünschten
        Analyse und dem Export.
      </p>
      <p>
        Verwende bei Personalauswahl nach Möglichkeit Pseudonyme. Erfasse nur
        Angaben, die für die Eignung für die konkrete Stelle relevant sind.
        Vertrauliche oder besonders schützenswerte Daten gehören nicht auf
        gemeinsam genutzte oder ungeschützte Geräte.
      </p>
      <h2>Speicherung auf deinem Gerät</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Ablage</th>
              <th>Zweck</th>
              <th>Dauer</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>nwa_draft_state (localStorage)</td>
              <td>Dein aktueller Analyseentwurf</td>
              <td>
                Bis du ihn ersetzt, zurücksetzt oder die lokalen Daten löschst.
                Keine automatische Cloud-Sicherung.
              </td>
            </tr>
            <tr>
              <td>decisionstudio_start (sessionStorage)</td>
              <td>
                Übergabe deiner Angaben von der Startseite an die Analyse, ohne
                Inhalte in der URL
              </td>
              <td>
                Bis zum Start der Analyse oder zum Ende der Browsersitzung
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Diese Speicherung ist funktional. Du kannst sie über die
        Browsereinstellungen verhindern; dann stehen Wiederaufnahme und die
        Übergabe zwischen Seiten nur eingeschränkt zur Verfügung. Die lokale
        Speicherung ist keine Verschlüsselung: Andere Personen mit Zugriff auf
        dein Browserprofil können die Daten einsehen. Beim Löschen der
        Browserdaten kann dein Entwurf verloren gehen.
      </p>
      <LocalDataControls />
      <h2>Hosting und technische Verbindungsdaten</h2>
      <p>
        Beim Aufrufen der Website erhält der Hostinganbieter{" "}
        {config.hostingProvider} technisch notwendige Verbindungsdaten,
        insbesondere die IP-Adresse, den Zeitpunkt, die angeforderte Adresse und
        Angaben zum Browser. Diese Verarbeitung ist vom lokalen Analyseinhalt
        getrennt und dient der Auslieferung und dem sicheren Betrieb der
        Website.
      </p>
      {config.hostingCountries &&
      config.hostingLogRetention &&
      config.internationalTransferSafeguards ? (
        <>
          <p>Bearbeitungsländer: {config.hostingCountries}</p>
          <p>
            Aufbewahrung technischer Protokolle: {config.hostingLogRetention}
          </p>
          <p>
            Absicherung von Auslandbekanntgaben:{" "}
            {config.internationalTransferSafeguards}
          </p>
        </>
      ) : (
        <div className="notice warning">
          <p>
            Vor Veröffentlichung sind die konkret eingesetzten Hostingregionen,
            die Aufbewahrung technischer Protokolle und die Absicherung von
            Auslandbekanntgaben anhand des Hostingvertrags zu bestätigen. Eine
            ausschliessliche Datenbearbeitung in der Schweiz wird nicht
            zugesichert.
          </p>
        </div>
      )}
      <p>
        Informationen des Hostinganbieters:{" "}
        <a
          href="https://vercel.com/legal/privacy-notice"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vercel Privacy Notice
        </a>{" "}
        und{" "}
        <a
          href="https://vercel.com/legal/dpa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Data Processing Addendum
        </a>
        . Ein separater Zugriffsschutz einer Hosting-Vorschau unterliegt
        zusätzlich den Hinweisen des Hostinganbieters.
      </p>
      <h2>Exporte</h2>
      <p>
        Excel-, HTML- und JSON-Dateien werden lokal erstellt. Beim Drucken
        beziehungsweise Speichern als PDF übernimmt dein Browser die Ausgabe.
        Entscheide selbst, wo du die Dateien aufbewahrst und wem du sie
        weitergibst. Das Löschen des Entwurfs entfernt diese Dateien nicht.
      </p>
      <h2>Deine Rechte</h2>
      <p>
        Nach dem schweizerischen Datenschutzgesetz kannst du insbesondere
        Auskunft sowie Berichtigung oder Löschung verlangen; weitere Rechte wie
        die Datenherausgabe gelten, soweit die gesetzlichen Voraussetzungen
        erfüllt sind. Wende dich an die oben angegebene Kontaktadresse. Auf
        ausschliesslich in deinem Browser gespeicherte Entwürfe hat der
        Betreiber keinen Zugriff; du kannst sie selbst exportieren oder löschen.
      </p>
      <p>
        Informationen und Kontakt zur Aufsichtsbehörde findest du beim{" "}
        <a
          href="https://www.edoeb.admin.ch/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB)
        </a>
        .
      </p>
      <h2>Geltungsbereich und Änderungen</h2>
      <p>
        Diese Erklärung beschreibt die aktuelle Version ohne Konto, Zahlung,
        Cloudspeicherung und KI-Dienst. Vor der Einführung weiterer
        Datenbearbeitungen werden die Datenschutzhinweise und die erforderlichen
        technischen Einstellungen angepasst. Das schweizerische DSG gilt;
        weitere zwingende Datenschutzvorschriften bleiben vorbehalten.
      </p>
    </LegalPage>
  );
}
