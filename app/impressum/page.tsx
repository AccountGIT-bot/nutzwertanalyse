import type { Metadata } from "next";
import { LegalPage } from "../components/SiteChrome";
import { OperatorDetails } from "../components/OperatorDetails";
export const metadata: Metadata = { title: "Impressum" };
export default function Imprint() {
  return (
    <LegalPage
      title="Impressum"
      intro="Angaben zum Betreiber von DecisionStudio."
    >
      <h2>Betreiber und Kontakt</h2>
      <OperatorDetails />
      <h2>Das Angebot</h2>
      <p>
        DecisionStudio ist ein Werkzeug zur Nutzwertanalyse. In dieser Version
        stehen die Analyseumfänge Basic, Advanced und Business kostenlos zur
        Verfügung. Konten, Abonnements, Zahlungen und Online-Zusammenarbeit
        werden nicht angeboten.
      </p>
      <h2>Verantwortung für Entscheidungen</h2>
      <p>
        Eine Nutzwertanalyse beruht auf den eingegebenen Kriterien, Gewichtungen
        und Bewertungen. Sie ist eine Entscheidungshilfe und ersetzt weder die
        Prüfung der Ausgangsdaten noch eine notwendige fachliche Beratung. Eine
        automatische Entscheidung über Personen wird durch das Tool nicht
        getroffen.
      </p>
      <h2>Eigene Inhalte und Quellen</h2>
      <p>
        Die Rechte an deinen Analyseinhalten verbleiben bei dir. Vorlagen und
        Beispieldaten dienen der Veranschaulichung. Verlinkte
        Informationsangebote werden von den jeweiligen Anbietern verantwortet.
      </p>
      <h2>Weitere Informationen</h2>
      <p>
        <a href="/datenschutz">Datenschutz und lokale Speicherung</a> ·{" "}
        <a href="/agb">Nutzungsbedingungen</a>
      </p>
    </LegalPage>
  );
}
