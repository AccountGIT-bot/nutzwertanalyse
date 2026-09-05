import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalShell,
  LegalSectionBlock,
  LegalNote,
  type LegalSection,
} from "@/app/components/legal/LegalShell";
import { ConsentSettingsButton } from "@/app/components/CookieConsent";
import { siteConfig, displayValue } from "@/app/lib/site-config";

export const metadata: Metadata = {
  title: "Cookie-Richtlinie",
  description:
    "Übersicht über alle von Nutzwertanalyse.com verwendeten Cookies und lokalen Speichereinträge sowie Informationen zur Einwilligung nach Art. 45c lit. b FMG.",
  alternates: { canonical: "/cookies" },
};

const SECTIONS: LegalSection[] = [
  { id: "grundlagen", title: "Rechtliche Grundlagen" },
  { id: "was-wir-nutzen", title: "Was wir tatsächlich einsetzen" },
  { id: "uebersicht", title: "Übersicht der Speichereinträge" },
  { id: "kategorien", title: "Kategorien und Einwilligung" },
  { id: "verwalten", title: "Einwilligung verwalten und widerrufen" },
  { id: "browser", title: "Einstellungen im Browser" },
  { id: "drittanbieter", title: "Drittanbieter" },
];

interface StorageEntry {
  key: string;
  type: "localStorage" | "Cookie";
  category: "Notwendig" | "Komfort" | "Statistik";
  purpose: string;
  duration: string;
}

const STORAGE_ENTRIES: StorageEntry[] = [
  {
    key: "nwa_consent",
    type: "localStorage",
    category: "Notwendig",
    purpose:
      "Speichert Ihre Datenschutz-Einstellungen samt Zeitstempel und Version – dient dem Nachweis der Einwilligung.",
    duration: "Bis zum Widerruf bzw. bis zum Löschen der Website-Daten",
  },
  {
    key: "nwa_draft_state",
    type: "localStorage",
    category: "Notwendig",
    purpose:
      "Automatische Zwischenspeicherung der laufenden Analyse, damit Ihre Eingaben bei einem Seitenwechsel oder Neuladen nicht verloren gehen.",
    duration: "Bis Sie die Analyse zurücksetzen oder die Website-Daten löschen",
  },
  {
    key: "nwa_locale",
    type: "localStorage",
    category: "Notwendig",
    purpose: "Merkt sich die von Ihnen gewählte Sprache der Oberfläche.",
    duration: "Unbefristet bis zum Löschen der Website-Daten",
  },
  {
    key: "nwa_theme",
    type: "localStorage",
    category: "Komfort",
    purpose: "Merkt sich das zuletzt gewählte Analysepaket und das zugehörige Farbschema.",
    duration: "Unbefristet bis zum Löschen der Website-Daten",
  },
  {
    key: "nwa_packageLevel",
    type: "localStorage",
    category: "Komfort",
    purpose: "Vorauswahl der Analysetiefe (Basic, Advanced, Business) beim nächsten Besuch.",
    duration: "Unbefristet bis zum Löschen der Website-Daten",
  },
  {
    key: "nwa_library",
    type: "localStorage",
    category: "Komfort",
    purpose:
      "Ihre bewusst gespeicherten Analysen. Die Inhalte verbleiben ausschliesslich in Ihrem Browser.",
    duration: "Bis Sie die jeweilige Analyse löschen",
  },
  {
    key: "nwa_decisionDraft, nwa_preset, nwa_aiInterpretation",
    type: "localStorage",
    category: "Komfort",
    purpose:
      "Übergabe Ihrer Eingabe von der Startseite an den Analyse-Assistenten (Entscheidungsfrage, gewählte Vorlage, KI-Vorschlag).",
    duration: "Bis zum Start der Analyse bzw. bis zum Löschen der Website-Daten",
  },
];

export default function CookiesPage() {
  return (
    <LegalShell
      eyebrow="Cookies"
      title="Cookie-Richtlinie"
      lead="Diese Seite listet vollständig auf, welche Cookies und lokalen Speichereinträge Nutzwertanalyse.com verwendet, wozu sie dienen und wie lange sie bestehen bleiben. Sie können Ihre Einwilligung jederzeit anpassen oder widerrufen."
      sections={SECTIONS}
      currentPath="/cookies"
    >
      <LegalSectionBlock id="grundlagen" index={1} title="Rechtliche Grundlagen">
        <p>
          Das Speichern und Auslesen von Informationen auf Ihrem Endgerät ist in der Schweiz in{" "}
          <span className="legal-ref">Art. 45c lit. b FMG</span> geregelt. Zulässig ist die Bearbeitung,
          wenn die Nutzerinnen und Nutzer über die Bearbeitung und ihren Zweck informiert werden und auf
          die Möglichkeit hingewiesen werden, die Bearbeitung abzulehnen. Das schweizerische Recht folgt
          damit einem Opt-out-Modell.
        </p>
        <p>
          Werden dabei Personendaten bearbeitet, gelten zusätzlich die Grundsätze des{" "}
          <span className="legal-ref">DSG</span>. Für Besucherinnen und Besucher aus dem Europäischen
          Wirtschaftsraum wenden wir das strengere Opt-in-Modell nach{" "}
          <span className="legal-ref">Art. 5 Abs. 3 ePrivacy-Richtlinie</span> und{" "}
          <span className="legal-ref">Art. 6 Abs. 1 lit. a DSGVO</span> an: Nicht notwendige Einträge
          werden erst nach ausdrücklicher Einwilligung gesetzt.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="was-wir-nutzen" index={2} title="Was wir tatsächlich einsetzen">
        <LegalNote tone="accent" title="Keine Tracking-Cookies">
          Wir setzen <strong>keine Werbe-, Marketing- oder Tracking-Cookies</strong> ein, binden keine
          Social-Media-Plugins ein und geben keine Daten zu Werbezwecken an Dritte weiter. Es sind
          derzeit auch keine Analyse- oder Reichweitenmessdienste aktiv.
        </LegalNote>
        <p>
          Technisch verwenden wir ausschliesslich den lokalen Speicher des Browsers (
          <code>localStorage</code>) und keine klassischen HTTP-Cookies. Der lokale Speicher wird –
          anders als Cookies – nicht bei jeder Anfrage an den Server übermittelt. Ihre Analysedaten
          verlassen Ihren Browser dadurch nicht.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="uebersicht" index={3} title="Übersicht der Speichereinträge">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-white/40">
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Bezeichnung</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Art</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Kategorie</th>
                <th className="border-b border-white/10 pb-2 pr-4 font-medium">Zweck</th>
                <th className="border-b border-white/10 pb-2 font-medium">Dauer</th>
              </tr>
            </thead>
            <tbody>
              {STORAGE_ENTRIES.map((entry) => (
                <tr key={entry.key} className="align-top">
                  <td className="border-b border-white/[0.06] py-3 pr-4">
                    <code className="text-[12px] text-white/75">{entry.key}</code>
                  </td>
                  <td className="border-b border-white/[0.06] py-3 pr-4 text-white/55">{entry.type}</td>
                  <td className="border-b border-white/[0.06] py-3 pr-4">
                    <span className="legal-ref">{entry.category}</span>
                  </td>
                  <td className="border-b border-white/[0.06] py-3 pr-4 text-white/55">
                    {entry.purpose}
                  </td>
                  <td className="border-b border-white/[0.06] py-3 text-white/55">{entry.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSectionBlock>

      <LegalSectionBlock id="kategorien" index={4} title="Kategorien und Einwilligung">
        <p>
          <strong>Notwendig</strong> – ohne diese Einträge lässt sich die Anwendung nicht
          bestimmungsgemäss betreiben. Sie speichern insbesondere Ihre Datenschutz-Entscheidung selbst
          sowie den aktuellen Stand Ihrer Analyse. Sie beruhen auf unserem überwiegenden berechtigten
          Interesse an einem funktionsfähigen Dienst und sind nicht abwählbar.
        </p>
        <p>
          <strong>Komfort</strong> – verbessern die Nutzung, sind aber nicht zwingend. Sie werden nur
          gesetzt, wenn Sie zustimmen. Ohne Zustimmung funktioniert die Anwendung weiterhin; gespeicherte
          Analysen und Voreinstellungen stehen dann jedoch beim nächsten Besuch nicht zur Verfügung.
        </p>
        <p>
          <strong>Statistik</strong> – anonymisierte Reichweitenmessung. Diese Kategorie ist aktuell nicht
          belegt; sollte künftig ein Dienst eingebunden werden, wird er hier vorgängig ausgewiesen und
          erst nach Ihrer Einwilligung aktiviert.
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="verwalten" index={5} title="Einwilligung verwalten und widerrufen">
        <p>
          Sie können Ihre Auswahl jederzeit mit Wirkung für die Zukunft ändern oder vollständig
          widerrufen (<span className="legal-ref">Art. 6 Abs. 6 DSG</span>). Die Rechtmässigkeit der
          bisherigen Bearbeitung bleibt davon unberührt.
        </p>
        <p>
          <ConsentSettingsButton className="inline-flex items-center rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.02]" />
        </p>
      </LegalSectionBlock>

      <LegalSectionBlock id="browser" index={6} title="Einstellungen im Browser">
        <p>
          Unabhängig von unserem Einwilligungsdialog können Sie Cookies und lokalen Speicher jederzeit
          über die Einstellungen Ihres Browsers löschen oder blockieren. Die entsprechenden Anleitungen
          finden Sie in der Hilfe Ihres Browsers unter Stichworten wie „Website-Daten löschen“ oder
          „Cookies verwalten“.
        </p>
        <LegalNote tone="warning">
          Wird der lokale Speicher gelöscht oder blockiert, gehen Ihre gespeicherten Analysen
          unwiederbringlich verloren. Wir halten davon keine Kopie. Exportieren Sie wichtige Analysen
          deshalb vorgängig als JSON- oder CSV-Datei.
        </LegalNote>
      </LegalSectionBlock>

      <LegalSectionBlock id="drittanbieter" index={7} title="Drittanbieter">
        <p>
          Beim Betrieb der Website sind die in der{" "}
          <Link href="/datenschutz">Datenschutzerklärung</Link> aufgeführten Auftragsbearbeiter
          beteiligt. Diese setzen im Rahmen unserer Website keine eigenen Marketing-Cookies. Fragen zu
          dieser Richtlinie richten Sie bitte an{" "}
          <a href={`mailto:${siteConfig.operator.privacyEmail}`}>
            {displayValue(siteConfig.operator.privacyEmail)}
          </a>
          .
        </p>
      </LegalSectionBlock>
    </LegalShell>
  );
}
