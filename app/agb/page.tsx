import type { Metadata } from "next";
import { LegalPage } from "../components/SiteChrome";
export const metadata: Metadata = { title: "Nutzungsbedingungen" };
export default function Terms() {
  return (
    <LegalPage
      title="Nutzungsbedingungen"
      intro="Für die kostenlose lokale Version von DecisionStudio. Stand: 6. September 2026."
    >
      <h2>1. Umfang des Angebots</h2>
      <p>
        DecisionStudio unterstützt die strukturierte Bewertung von Alternativen.
        Basic, Advanced und Business bezeichnen unterschiedliche Analyseumfänge.
        Ihre Nutzung ist in dieser Version kostenlos; es entstehen keine
        Abonnements, Zahlungsansprüche oder automatischen Verlängerungen.
        Anbieterangaben stehen im <a href="/impressum">Impressum</a>.
      </p>
      <h2>2. Verantwortung für Eingaben und Entscheidungen</h2>
      <p>
        Du legst Alternativen, Kriterien, Gewichtungen und Bewertungen fest.
        Überprüfe deren Eignung und Richtigkeit. Ergebnisse sind
        nachvollziehbare Berechnungen deiner Eingaben und keine Zusicherung,
        dass eine Alternative objektiv oder für jeden Zweck die beste ist.
        Notwendige rechtliche, finanzielle oder fachliche Beratung wird nicht
        ersetzt.
      </p>
      <h2>3. Daten und Sicherungen</h2>
      <p>
        Die Analyse wird im Browser verarbeitet. Der lokale Entwurf kann durch
        Löschen der Browserdaten, technische Probleme oder die Nutzung eines
        anderen Geräts fehlen. Sichere wichtige Arbeiten mit dem JSON-Export;
        der Excel- und Druckexport dienen der Dokumentation. Eine
        Online-Synchronisierung oder unveränderbare Protokollierung wird nicht
        angeboten.
      </p>
      <h2>4. Zulässige Nutzung</h2>
      <p>
        Verwende das Tool unter Beachtung der Rechte anderer und der anwendbaren
        Gesetze. Insbesondere dürfen Daten über Personen nur für einen
        zulässigen Zweck und in erforderlichem Umfang eingegeben werden. Bei der
        Personalauswahl sind arbeitsbezogene Kriterien zu verwenden und
        diskriminierende Auswahlpraktiken zu vermeiden.
      </p>
      <h2>5. Rechte an Inhalten</h2>
      <p>
        Deine eigenen Eingaben und die daraus erzeugten Exporte bleiben dir
        zugeordnet. Mit der Nutzung räumst du dem Betreiber kein Recht ein,
        diese Inhalte zu veröffentlichen oder zu vermarkten. Rechte an der
        Software und an verwendeten Komponenten richten sich nach den jeweiligen
        Lizenzen.
      </p>
      <h2>6. Betrieb und Haftung</h2>
      <p>
        Das Tool wird sorgfältig weiterentwickelt. Eine ununterbrochene
        Verfügbarkeit und Fehlerfreiheit wird nicht zugesichert. Die Haftung
        richtet sich nach den anwendbaren gesetzlichen Bestimmungen; zwingende
        Ansprüche werden durch diese Bedingungen nicht ausgeschlossen.
      </p>
      <h2>7. Datenschutz</h2>
      <p>
        Einzelheiten zur lokalen Speicherung, zum Hosting und zu deinen Rechten
        stehen in der <a href="/datenschutz">Datenschutzerklärung</a>.
      </p>
      <h2>8. Anwendbares Recht</h2>
      <p>
        Es gilt schweizerisches Recht unter Vorbehalt zwingender gesetzlicher
        Regelungen. Gesetzliche Gerichtsstände, insbesondere für Konsumentinnen
        und Konsumenten, bleiben gewahrt.
      </p>
    </LegalPage>
  );
}
