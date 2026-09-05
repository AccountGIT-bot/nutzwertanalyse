import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalShell,
  LegalSectionBlock,
  LegalNote,
  type LegalSection,
} from "@/app/components/legal/LegalShell";
import { siteConfig, displayValue, formatSwissDate } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Allgemeine Geschäftsbedingungen",
  description:
    "Allgemeine Geschäftsbedingungen (AGB) für die Nutzung von Nutzwertanalyse.com nach schweizerischem Recht.",
  alternates: { canonical: "/agb" },
};

const SECTIONS: LegalSection[] = [
  { id: "geltungsbereich", title: "Geltungsbereich und Vertragsparteien" },
  { id: "vertragsschluss", title: "Vertragsschluss" },
  { id: "leistungen", title: "Leistungsbeschreibung" },
  { id: "entgelt", title: "Entgelt, Preise und Mehrwertsteuer" },
  { id: "laufzeit", title: "Laufzeit und Beendigung" },
  { id: "widerruf", title: "Widerrufsrecht" },
  { id: "konto", title: "Konto und Zugangsdaten" },
  { id: "pflichten", title: "Pflichten der Nutzerinnen und Nutzer" },
  { id: "verfuegbarkeit", title: "Verfügbarkeit und Änderungen" },
  { id: "inhalte", title: "Rechte an Nutzerinhalten" },
  { id: "lizenz", title: "Nutzungsrecht an der Software" },
  { id: "ki", title: "KI-gestützte Funktionen" },
  { id: "gewaehrleistung", title: "Gewährleistung" },
  { id: "haftung", title: "Haftung" },
  { id: "datenschutz", title: "Datenschutz" },
  { id: "hoehere-gewalt", title: "Höhere Gewalt" },
  { id: "abtretung", title: "Abtretung und Übertragung" },
  { id: "aenderungen", title: "Änderungen dieser AGB" },
  { id: "schlussbestimmungen", title: "Schlussbestimmungen" },
  { id: "recht", title: "Anwendbares Recht und Gerichtsstand" },
];

export default function AgbPage() {
  const o = siteConfig.operator;

  return (
    <LegalShell
      eyebrow="AGB"
      title="Allgemeine Geschäftsbedingungen"
      lead="Diese Bedingungen regeln die Nutzung der Web-Anwendung Nutzwertanalyse.com. Sie beruhen auf schweizerischem Recht, insbesondere dem Obligationenrecht (OR), und gelten für sämtliche Nutzerinnen und Nutzer des Angebots."
      sections={SECTIONS}
      currentPath="/agb"
    >
      <LegalSectionBlock id="geltungsbereich" index={1} title="Geltungsbereich und Vertragsparteien">
        <p>
          <strong>1.1</strong> Diese Allgemeinen Geschäftsbedingungen („AGB“) regeln das
          Vertragsverhältnis zwischen {displayValue(o.legalName)}, {displayValue(o.zip)}{" "}
          {displayValue(o.city)} („Anbieter“) und den Nutzerinnen und Nutzern („Nutzer“) der unter{" "}
          <a href={siteConfig.url}>{siteConfig.domain}</a> zugänglichen Web-Anwendung („Dienst“).
        </p>
        <p>
          <strong>1.2</strong> Mit dem Aufruf und der Nutzung des Dienstes erklären sich die Nutzer mit
          diesen AGB einverstanden. Abweichende oder entgegenstehende Bedingungen der Nutzer gelten nur,
          wenn der Anbieter ihnen ausdrücklich und in Textform zugestimmt hat.
        </p>
        <p>
          <strong>1.3</strong> Nutzer, die als Konsumentinnen oder Konsumenten handeln, geniessen die
          zwingenden Schutzbestimmungen des schweizerischen Rechts; diese gehen abweichenden Regelungen
          in diesen AGB vor.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="vertragsschluss" index={2} title="Vertragsschluss">
        <p>
          <strong>2.1</strong> Die Darstellung des Dienstes stellt kein bindendes Angebot dar, sondern
          eine Einladung zur Offertstellung.
        </p>
        <p>
          <strong>2.2</strong> Für die unentgeltliche Nutzung kommt der Vertrag mit der erstmaligen
          Nutzung des Dienstes zustande. Für kostenpflichtige Leistungen kommt der Vertrag mit der
          Bestätigung der Bestellung durch den Anbieter zustande.
        </p>
        <p>
          <strong>2.3</strong> Der Vertragstext wird vom Anbieter nicht gesondert gespeichert. Die
          jeweils geltende Fassung dieser AGB kann jederzeit auf dieser Seite abgerufen, gespeichert und
          ausgedruckt werden.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="leistungen" index={3} title="Leistungsbeschreibung">
        <p>
          <strong>3.1</strong> Der Dienst stellt ein methodisches Werkzeug zur strukturierten
          Entscheidungsfindung nach dem Verfahren der Nutzwertanalyse zur Verfügung. Er unterstützt
          namentlich bei der Erfassung von Alternativen und Kriterien, deren Gewichtung (einschliesslich
          paarweiser Vergleiche nach dem Analytic-Hierarchy-Process-Verfahren), der Bewertung, der
          Sensitivitätsanalyse sowie der Erstellung von Berichten.
        </p>
        <p>
          <strong>3.2</strong> Der Anbieter schuldet die sorgfältige Bereitstellung des Dienstes, nicht
          jedoch einen bestimmten Erfolg. Das Vertragsverhältnis untersteht in dieser Hinsicht den Regeln
          über den Auftrag (<span className="legal-ref">Art. 394 ff. OR</span>).
        </p>
        <p>
          <strong>3.3</strong> Die Ergebnisse des Dienstes beruhen ausschliesslich auf den durch die
          Nutzer eingegebenen Daten. Sie stellen <strong>keine Rechts-, Steuer-, Finanz-, Anlage- oder
          Unternehmensberatung</strong> dar und ersetzen keine fachliche Beurteilung im Einzelfall. Die
          Verantwortung für die getroffene Entscheidung verbleibt vollumfänglich bei den Nutzern.
        </p>
        <p>
          <strong>3.4</strong> Analysedaten werden standardmässig ausschliesslich lokal im Browser der
          Nutzer gespeichert. Der Anbieter führt insoweit keine Sicherung durch; die Nutzer sind für den
          Export und die Archivierung ihrer Daten selbst verantwortlich.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="entgelt" index={4} title="Entgelt, Preise und Mehrwertsteuer">
        <p>
          <strong>4.1</strong> Der Grundfunktionsumfang des Dienstes wird unentgeltlich zur Verfügung
          gestellt. Der Anbieter behält sich vor, einzelne Funktionen künftig kostenpflichtig
          auszugestalten; bestehende unentgeltliche Nutzungen werden dadurch nicht rückwirkend
          entgeltlich.
        </p>
        <p>
          <strong>4.2</strong> Für kostenpflichtige Leistungen gelten die im Zeitpunkt der Bestellung im
          Dienst ausgewiesenen Preise. Preise gegenüber Konsumentinnen und Konsumenten verstehen sich als
          tatsächlich zu bezahlende Preise in Schweizer Franken einschliesslich Mehrwertsteuer und
          allfälliger weiterer Abgaben (<span className="legal-ref">Art. 3 und 4 PBV</span>).
        </p>
        <p>
          <strong>4.3</strong> Rechnungen sind innert 30 Tagen ab Rechnungsdatum ohne Abzug zahlbar. Nach
          Ablauf der Zahlungsfrist gerät der Nutzer nach{" "}
          <span className="legal-ref">Art. 102 Abs. 2 OR</span> in Verzug; es gilt ein Verzugszins von 5 %
          (<span className="legal-ref">Art. 104 Abs. 1 OR</span>).
        </p>
        <p>
          <strong>4.4</strong> Eine Verrechnung mit Gegenforderungen ist nur zulässig, wenn diese
          unbestritten oder rechtskräftig festgestellt sind.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="laufzeit" index={5} title="Laufzeit und Beendigung">
        <p>
          <strong>5.1</strong> Die unentgeltliche Nutzung kann von beiden Seiten jederzeit ohne Einhaltung
          einer Frist beendet werden. Für die Nutzer geschieht dies durch Einstellung der Nutzung und
          Löschung der lokal gespeicherten Daten.
        </p>
        <p>
          <strong>5.2</strong> Kostenpflichtige Abonnements laufen für die vereinbarte Dauer und
          verlängern sich jeweils um dieselbe Periode, sofern sie nicht bis 30 Tage vor Ablauf gekündigt
          werden. Die Kündigung bedarf der Textform (E-Mail genügt).
        </p>
        <p>
          <strong>5.3</strong> Das Recht zur Kündigung aus wichtigem Grund bleibt beiden Parteien
          vorbehalten. Ein wichtiger Grund liegt für den Anbieter namentlich vor bei schwerwiegender oder
          wiederholter Verletzung von Ziffer 8 dieser AGB.
        </p>
        <p>
          <strong>5.4</strong> Der Anbieter kann den Zugang bei begründetem Verdacht auf missbräuchliche
          Nutzung, Rechtsverletzungen oder Gefährdung der Systemsicherheit vorsorglich sperren. Die Nutzer
          werden – soweit möglich und zulässig – vorgängig informiert.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="widerruf" index={6} title="Widerrufsrecht">
        <LegalNote tone="neutral">
          Das schweizerische Recht kennt kein allgemeines Widerrufsrecht für online abgeschlossene
          Verträge. Ein Widerrufsrecht nach{" "}
          <span className="legal-ref">Art. 40a ff. OR</span> besteht nur bei Haustürgeschäften und
          ähnlichen Verträgen sowie beim telefonisch angebahnten Vertragsschluss – nicht bei Verträgen,
          die die Nutzer von sich aus über eine Website abschliessen.
        </LegalNote>
        <p>
          Nutzer mit Wohnsitz im Europäischen Wirtschaftsraum, denen nach dem Recht ihres Wohnsitzstaates
          zwingend ein Widerrufsrecht zusteht, können dieses innert 14 Tagen durch formlose Mitteilung an{" "}
          <a href={`mailto:${o.email}`}>{displayValue(o.email)}</a> ausüben. Bei ausdrücklich verlangtem
          vorzeitigem Beginn der Leistung kann das Widerrufsrecht vorzeitig erlöschen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="konto" index={7} title="Konto und Zugangsdaten">
        <p>
          <strong>7.1</strong> Der Grundfunktionsumfang steht ohne Registrierung zur Verfügung. Für
          einzelne Funktionen kann ein Nutzerkonto erforderlich sein.
        </p>
        <p>
          <strong>7.2</strong> Die Nutzer sind verpflichtet, bei der Registrierung wahrheitsgetreue
          Angaben zu machen, ihre Zugangsdaten vertraulich zu behandeln und sie nicht an Dritte
          weiterzugeben. Ein Verdacht auf Missbrauch ist dem Anbieter unverzüglich zu melden.
        </p>
        <p>
          <strong>7.3</strong> Die Nutzer haften für sämtliche Handlungen, die über ihr Konto vorgenommen
          werden, es sei denn, sie haben den Missbrauch nicht zu vertreten.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="pflichten" index={8} title="Pflichten der Nutzerinnen und Nutzer">
        <p>Die Nutzer verpflichten sich insbesondere,</p>
        <ul>
          <li>den Dienst ausschliesslich im Rahmen der geltenden Rechtsordnung zu nutzen;</li>
          <li>
            keine rechtswidrigen, persönlichkeitsverletzenden, diskriminierenden oder strafbaren Inhalte
            einzugeben oder zu verbreiten;
          </li>
          <li>
            keine Personendaten Dritter ohne die erforderliche Berechtigung und keine besonders
            schützenswerten Personendaten einzugeben;
          </li>
          <li>
            keine Sicherheitsmechanismen zu umgehen, keine Schadsoftware einzuschleusen und keine
            Massnahmen zu treffen, die die Infrastruktur übermässig belasten;
          </li>
          <li>
            keine automatisierten Abfragen (Scraping, Bots) durchzuführen, die über eine übliche Nutzung
            hinausgehen;
          </li>
          <li>
            den Dienst nicht zurückzuentwickeln, zu dekompilieren oder nachzubilden, soweit dies nicht
            zwingend gesetzlich erlaubt ist (<span className="legal-ref">Art. 21 URG</span>).
          </li>
        </ul>
        <p>
          Bei Verletzung dieser Pflichten haften die Nutzer für den daraus entstehenden Schaden und
          stellen den Anbieter von Ansprüchen Dritter frei.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="verfuegbarkeit" index={9} title="Verfügbarkeit und Änderungen">
        <p>
          <strong>9.1</strong> Der Anbieter bemüht sich um eine möglichst hohe Verfügbarkeit, schuldet
          jedoch keine bestimmte Verfügbarkeitsquote, soweit nicht ausdrücklich ein Service-Level
          vereinbart ist.
        </p>
        <p>
          <strong>9.2</strong> Unterbrüche infolge Wartung, Aktualisierungen, Störungen bei
          Drittanbietern oder Umständen ausserhalb des Einflussbereichs des Anbieters sind möglich.
          Geplante Wartungsarbeiten werden nach Möglichkeit angekündigt.
        </p>
        <p>
          <strong>9.3</strong> Der Anbieter darf den Funktionsumfang weiterentwickeln und anpassen, sofern
          der vertragsgemässe Nutzungszweck dadurch nicht wesentlich beeinträchtigt wird. Wesentliche
          Einschränkungen kostenpflichtiger Leistungen berechtigen die Nutzer zur ausserordentlichen
          Kündigung.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="inhalte" index={10} title="Rechte an Nutzerinhalten">
        <p>
          <strong>10.1</strong> Sämtliche von den Nutzern eingegebenen Inhalte – insbesondere
          Entscheidungsfragen, Alternativen, Kriterien, Gewichtungen, Bewertungen und Berichte –
          verbleiben in deren alleiniger Rechtszuständigkeit.
        </p>
        <p>
          <strong>10.2</strong> Der Anbieter erhält an diesen Inhalten kein Nutzungsrecht, das über das
          zur technischen Erbringung der Leistung Erforderliche hinausgeht. Eine Auswertung zu
          Werbezwecken oder zum Training von KI-Modellen findet nicht statt.
        </p>
        <p>
          <strong>10.3</strong> Die Nutzer sichern zu, über die erforderlichen Rechte an den von ihnen
          eingegebenen Inhalten zu verfügen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="lizenz" index={11} title="Nutzungsrecht an der Software">
        <p>
          <strong>11.1</strong> Software, Gestaltung, Texte, Grafiken, Methodenbeschreibungen und
          Vorlagen des Dienstes sind urheberrechtlich geschützt (<span className="legal-ref">URG</span>)
          und verbleiben beim Anbieter bzw. den jeweiligen Rechtsinhabern.
        </p>
        <p>
          <strong>11.2</strong> Die Nutzer erhalten für die Dauer des Vertrags ein einfaches, nicht
          ausschliessliches, nicht übertragbares und nicht unterlizenzierbares Recht, den Dienst
          bestimmungsgemäss zu nutzen.
        </p>
        <p>
          <strong>11.3</strong> Aus dem Dienst exportierte Berichte dürfen frei für eigene Zwecke sowie
          im Rahmen der beruflichen Tätigkeit verwendet, weitergegeben und veröffentlicht werden.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="ki" index={12} title="KI-gestützte Funktionen">
        <p>
          <strong>12.1</strong> Der Dienst kann optionale Funktionen enthalten, die auf grossen
          Sprachmodellen beruhen und Vorschläge für Alternativen und Kriterien erzeugen. Diese Funktionen
          werden nur auf ausdrückliche Auslösung durch die Nutzer ausgeführt.
        </p>
        <p>
          <strong>12.2</strong> Von KI erzeugte Vorschläge können unvollständig, unzutreffend oder
          unpassend sein. Sie sind vor der Verwendung von den Nutzern zu prüfen und zu verantworten. Der
          Anbieter übernimmt keine Gewähr für Richtigkeit, Vollständigkeit oder Eignung solcher
          Vorschläge.
        </p>
        <p>
          <strong>12.3</strong> Bei Nutzung dieser Funktion werden die eingegebenen Texte an einen
          externen Anbieter übermittelt. Einzelheiten regelt die{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link>. Die Nutzer verzichten darauf,
          Geschäftsgeheimnisse oder Personendaten Dritter in diese Funktion einzugeben.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="gewaehrleistung" index={13} title="Gewährleistung">
        <p>
          <strong>13.1</strong> Der Anbieter erbringt seine Leistungen sorgfältig und fachgerecht nach dem
          jeweiligen Stand der Technik.
        </p>
        <p>
          <strong>13.2</strong> Der Dienst wird im Übrigen „wie besehen“ zur Verfügung gestellt. Der
          Anbieter gewährleistet insbesondere nicht, dass der Dienst ununterbrochen, fehlerfrei oder für
          einen bestimmten Zweck der Nutzer geeignet ist.
        </p>
        <p>
          <strong>13.3</strong> Mängel sind dem Anbieter unverzüglich und mit nachvollziehbarer
          Beschreibung anzuzeigen. Der Anbieter behebt gemeldete Mängel innert angemessener Frist, soweit
          dies mit verhältnismässigem Aufwand möglich ist.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="haftung" index={14} title="Haftung">
        <p>
          <strong>14.1</strong> Der Anbieter haftet für Schäden, die er rechtswidrig, absichtlich oder
          grobfahrlässig verursacht hat. Eine weitergehende Haftung – insbesondere für leichte
          Fahrlässigkeit – wird im gesetzlich zulässigen Umfang wegbedungen.
        </p>
        <p>
          <strong>14.2</strong> Ausgeschlossen ist, soweit gesetzlich zulässig, die Haftung für
          indirekte Schäden, Mangelfolgeschäden, entgangenen Gewinn, nicht realisierte Einsparungen,
          Datenverlust sowie Ansprüche Dritter.
        </p>
        <p>
          <strong>14.3</strong> Der Anbieter haftet nicht für Entscheidungen, welche die Nutzer gestützt
          auf Ergebnisse des Dienstes treffen, und nicht für die Richtigkeit der von den Nutzern
          eingegebenen Daten.
        </p>
        <p>
          <strong>14.4</strong> Die Haftung für Hilfspersonen wird im Rahmen von{" "}
          <span className="legal-ref">Art. 101 OR</span> wegbedungen. Vorbehalten bleiben zwingende
          gesetzliche Bestimmungen, namentlich{" "}
          <span className="legal-ref">Art. 100 Abs. 1 OR</span> (Nichtigkeit einer zum Voraus getroffenen
          Wegbedingung der Haftung für rechtswidrige Absicht oder grobe Fahrlässigkeit), die Haftung für
          Personenschäden sowie die Haftung nach dem Produktehaftpflichtgesetz.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="datenschutz" index={15} title="Datenschutz">
        <p>
          Die Bearbeitung von Personendaten richtet sich nach der{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link> und den Vorgaben des schweizerischen
          Datenschutzgesetzes (DSG) sowie – soweit anwendbar – der DSGVO. Die eingesetzten Cookies sind in
          der <Link href="/cookies">Cookie-Richtlinie</Link> aufgeführt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="hoehere-gewalt" index={16} title="Höhere Gewalt">
        <p>
          Ereignisse höherer Gewalt, die dem Anbieter die Leistungserbringung wesentlich erschweren oder
          unmöglich machen – namentlich Naturereignisse, Epidemien, behördliche Anordnungen, Streiks,
          Ausfälle von Telekommunikationsnetzen sowie grossflächige Cyberangriffe – befreien den Anbieter
          für die Dauer der Störung von seinen Leistungspflichten. Dauert die Störung länger als 60 Tage,
          können beide Parteien vom Vertrag zurücktreten.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="abtretung" index={17} title="Abtretung und Übertragung">
        <p>
          Die Nutzer dürfen Rechte und Pflichten aus diesem Vertrag nur mit vorgängiger schriftlicher
          Zustimmung des Anbieters auf Dritte übertragen (<span className="legal-ref">Art. 164 OR</span>).
          Der Anbieter ist berechtigt, das Vertragsverhältnis im Rahmen einer Unternehmensübertragung auf
          einen Rechtsnachfolger zu übertragen; die Nutzer werden darüber vorgängig informiert und können
          den Vertrag diesfalls fristlos kündigen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="aenderungen" index={18} title="Änderungen dieser AGB">
        <p>
          <strong>18.1</strong> Der Anbieter kann diese AGB anpassen, wenn dies aufgrund geänderter
          Rechtslage, technischer Entwicklungen oder Änderungen des Leistungsangebots erforderlich ist.
        </p>
        <p>
          <strong>18.2</strong> Wesentliche Änderungen werden mindestens 30 Tage vor Inkrafttreten in
          geeigneter Form angekündigt. Widersprechen die Nutzer nicht bis zum Inkrafttreten oder nutzen
          sie den Dienst danach weiter, gelten die geänderten Bedingungen als angenommen. Im Falle eines
          Widerspruchs kann jede Partei den Vertrag auf den Zeitpunkt des Inkrafttretens kündigen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="schlussbestimmungen" index={19} title="Schlussbestimmungen">
        <p>
          <strong>19.1</strong> Sollten einzelne Bestimmungen dieser AGB unwirksam oder undurchführbar
          sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Die unwirksame Bestimmung ist
          durch eine wirksame zu ersetzen, die dem wirtschaftlichen Zweck am nächsten kommt.
        </p>
        <p>
          <strong>19.2</strong> Änderungen und Ergänzungen des Vertrags bedürfen der Textform. Dies gilt
          auch für die Aufhebung dieses Formerfordernisses.
        </p>
        <p>
          <strong>19.3</strong> Massgebend ist die deutsche Fassung dieser AGB. Übersetzungen dienen
          ausschliesslich der Verständlichkeit.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="recht" index={20} title="Anwendbares Recht und Gerichtsstand">
        <p>
          <strong>20.1</strong> Auf das Vertragsverhältnis ist ausschliesslich schweizerisches materielles
          Recht anwendbar, unter Ausschluss der Kollisionsnormen und des Übereinkommens der Vereinten
          Nationen über Verträge über den internationalen Warenkauf (CISG).
        </p>
        <p>
          <strong>20.2</strong> Ausschliesslicher Gerichtsstand ist der Sitz des Anbieters (
          {displayValue(o.jurisdiction)}), soweit nicht zwingende gesetzliche Gerichtsstände entgegenstehen.
        </p>
        <p>
          <strong>20.3</strong> Für Konsumentinnen und Konsumenten bleibt der zwingende Gerichtsstand nach{" "}
          <span className="legal-ref">Art. 32 ZPO</span> (Wohnsitz der Konsumentin oder des Konsumenten
          bzw. Sitz des Anbieters) ausdrücklich vorbehalten; auf diesen Gerichtsstand kann nicht zum
          Voraus verzichtet werden.
        </p>
        <p className="text-white/40">
          Fassung {siteConfig.legalVersion.version}, in Kraft seit{" "}
          {formatSwissDate(siteConfig.legalVersion.effectiveDate)}.
        </p>
      </LegalSectionBlock>
    </LegalShell>
  );
}
