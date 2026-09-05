import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalShell,
  LegalSectionBlock,
  LegalNote,
  LegalDataList,
  type LegalSection,
} from "@/app/components/legal/LegalShell";
import { siteConfig, displayValue } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Impressum",
  description:
    "Impressum und Anbieterkennzeichnung von Nutzwertanalyse.com gemäss Art. 3 Abs. 1 lit. s UWG.",
  alternates: { canonical: "/impressum" },
};

const SECTIONS: LegalSection[] = [
  { id: "anbieter", title: "Anbieter und Kontakt" },
  { id: "vertretung", title: "Vertretungsberechtigte Personen" },
  { id: "register", title: "Register- und Steuerangaben" },
  { id: "verantwortlich", title: "Inhaltliche Verantwortung" },
  { id: "haftung-inhalte", title: "Haftung für Inhalte" },
  { id: "haftung-links", title: "Haftung für Links" },
  { id: "urheberrecht", title: "Urheber- und Kennzeichenrecht" },
  { id: "streitbeilegung", title: "Streitbeilegung" },
  { id: "meldung", title: "Hinweise und Beanstandungen" },
];

export default function ImpressumPage() {
  const o = siteConfig.operator;

  return (
    <LegalShell
      eyebrow="Impressum"
      title="Impressum"
      lead="Anbieterkennzeichnung nach Art. 3 Abs. 1 lit. s des Bundesgesetzes gegen den unlauteren Wettbewerb (UWG). Die nachfolgenden Angaben ermöglichen eine unmittelbare Kontaktaufnahme mit dem Betreiber dieses Angebots."
      sections={SECTIONS}
      currentPath="/impressum"
    >
      <LegalSectionBlock id="anbieter" index={1} title="Anbieter und Kontakt">
        <p>
          Verantwortlich für dieses Online-Angebot und Vertragspartner der Nutzerinnen und Nutzer ist:
        </p>
        <LegalDataList
          items={[
            { label: "Firma / Betreiber", value: displayValue(o.legalName) },
            { label: "Rechtsform", value: displayValue(o.legalForm) },
            {
              label: "Adresse",
              value: (
                <>
                  {displayValue(o.street)}
                  <br />
                  {displayValue(o.zip)} {displayValue(o.city)}
                  <br />
                  {o.country}
                </>
              ),
            },
            {
              label: "E-Mail",
              value: <a href={`mailto:${o.email}`}>{displayValue(o.email)}</a>,
            },
            { label: "Telefon", value: displayValue(o.phone) },
            { label: "Website", value: <a href={siteConfig.url}>{siteConfig.domain}</a> },
          ]}
        />
        <LegalNote tone="accent" title="Rechtsgrundlage">
          Nach <span className="legal-ref">Art. 3 Abs. 1 lit. s UWG</span> müssen Anbieter im
          elektronischen Geschäftsverkehr klare Angaben über ihre Identität und ihre Kontaktadresse –
          einschliesslich einer E-Mail-Adresse – machen. Ein Verstoss stellt unlauteren Wettbewerb dar
          und ist nach <span className="legal-ref">Art. 23 UWG</span> strafbewehrt.
        </LegalNote>
      </LegalSectionBlock>

      <LegalSectionBlock id="vertretung" index={2} title="Vertretungsberechtigte Personen">
        <p>Zeichnungsberechtigt für den Anbieter sind:</p>
        <ul>
          {o.representatives.map((person, index) => (
            <li key={`${person}-${index}`}>{displayValue(person)}</li>
          ))}
        </ul>
      </LegalSectionBlock>

      <LegalSectionBlock id="register" index={3} title="Register- und Steuerangaben">
        <LegalDataList
          items={[
            { label: "Handelsregister", value: displayValue(o.commercialRegister) },
            { label: "UID (Art. 3 UIDG)", value: displayValue(o.uid) },
            { label: "MWST-Nummer", value: displayValue(o.vatId) },
            { label: "Sitz", value: displayValue(o.jurisdiction) },
          ]}
        />
        <p>
          Sofern der Anbieter nicht mehrwertsteuerpflichtig ist (Umsatz unter der Limite von{" "}
          <span className="legal-ref">Art. 10 Abs. 2 lit. a MWSTG</span>), wird keine Mehrwertsteuer
          ausgewiesen und keine MWST-Nummer geführt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="verantwortlich" index={4} title="Inhaltliche Verantwortung">
        <p>
          Verantwortlich für den redaktionellen Inhalt dieser Website ist der unter Ziffer 1 genannte
          Anbieter, vertreten durch die unter Ziffer 2 aufgeführten Personen.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="haftung-inhalte" index={5} title="Haftung für Inhalte">
        <p>
          Die Inhalte dieser Website werden mit grösstmöglicher Sorgfalt erstellt. Der Anbieter
          übernimmt gleichwohl keine Gewähr für Richtigkeit, Vollständigkeit und Aktualität der
          bereitgestellten Informationen.
        </p>
        <p>
          Die angebotene Nutzwertanalyse ist ein methodisches Hilfsmittel zur Strukturierung von
          Entscheidungen. Die Ergebnisse hängen vollständig von den durch die Nutzerinnen und Nutzer
          eingegebenen Kriterien, Gewichten und Bewertungen ab. Sie stellen{" "}
          <strong>keine Rechts-, Steuer-, Finanz-, Anlage- oder medizinische Beratung</strong> dar und
          ersetzen keine fachliche Beurteilung im Einzelfall.
        </p>
        <p>
          Haftungsansprüche gegen den Anbieter wegen Schäden materieller oder immaterieller Art, die aus
          dem Zugriff, der Nutzung oder Nichtnutzung der veröffentlichten Informationen entstanden sind,
          werden – soweit gesetzlich zulässig – ausgeschlossen. Nicht ausgeschlossen wird die Haftung für
          rechtswidrige Absicht und grobe Fahrlässigkeit (
          <span className="legal-ref">Art. 100 Abs. 1 OR</span>) sowie die Haftung nach dem
          Produktehaftpflichtgesetz.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="haftung-links" index={6} title="Haftung für Links">
        <p>
          Verweise und Links auf Websites Dritter liegen ausserhalb des Verantwortungsbereichs des
          Anbieters. Zum Zeitpunkt der Verlinkung waren keine Rechtsverstösse erkennbar. Für Inhalte
          verlinkter Seiten ist ausschliesslich deren Betreiber verantwortlich. Der Zugriff und die
          Nutzung erfolgen auf eigene Verantwortung der Nutzerinnen und Nutzer.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="urheberrecht" index={7} title="Urheber- und Kennzeichenrecht">
        <p>
          Die auf dieser Website veröffentlichten Inhalte, Texte, Grafiken, Layouts, Quellcodes und
          Methodenbeschreibungen sind nach dem Bundesgesetz über das Urheberrecht und verwandte
          Schutzrechte (<span className="legal-ref">URG</span>) geschützt. Jede Vervielfältigung,
          Bearbeitung, Verbreitung oder öffentliche Zugänglichmachung ausserhalb der gesetzlich
          erlaubten Nutzungen (insbesondere <span className="legal-ref">Art. 19 URG</span>,
          Eigengebrauch) bedarf der vorgängigen schriftlichen Zustimmung des Anbieters.
        </p>
        <p>
          Von Nutzerinnen und Nutzern eingegebene Inhalte (Entscheidungsfragen, Kriterien, Bewertungen,
          Berichte) verbleiben in deren Rechtszuständigkeit. Der Anbieter erwirbt daran keine
          Nutzungsrechte über den zur Erbringung der Dienstleistung erforderlichen Umfang hinaus.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="streitbeilegung" index={8} title="Streitbeilegung">
        <p>
          Der Anbieter ist nicht verpflichtet und grundsätzlich nicht bereit, an
          Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen. Die Schweiz
          kennt kein der EU-Online-Streitbeilegungsplattform entsprechendes obligatorisches Verfahren.
        </p>
        <p>
          Für Konsumentinnen und Konsumenten mit Wohnsitz in der Schweiz bleibt der zwingende
          Gerichtsstand nach <span className="legal-ref">Art. 32 ZPO</span> vorbehalten. Weitere
          Einzelheiten regeln die{" "}
          <Link href="/agb">Allgemeinen Geschäftsbedingungen</Link>.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="meldung" index={9} title="Hinweise und Beanstandungen">
        <p>
          Rechtsverletzungen, fehlerhafte Inhalte oder Sicherheitslücken können jederzeit unter{" "}
          <a href={`mailto:${o.email}`}>{displayValue(o.email)}</a> gemeldet werden. Der Anbieter prüft
          eingehende Meldungen zeitnah und entfernt rechtswidrige Inhalte nach Kenntnisnahme.
        </p>
        <p>
          Anliegen zum Datenschutz – insbesondere Auskunfts-, Berichtigungs- und Löschungsbegehren –
          richten Sie bitte an die in der <Link href="/datenschutz">Datenschutzerklärung</Link>{" "}
          genannte Kontaktstelle.
        </p>
      </LegalSectionBlock>
    </LegalShell>
  );
}
