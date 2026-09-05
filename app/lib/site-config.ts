/**
 * Zentrale Konfiguration für Betreiber-, Kontakt- und Rechtsangaben.
 *
 * WICHTIG: Alle Angaben, die mit `PLACEHOLDER_` markiert sind bzw. in
 * `eckigen Klammern` stehen, müssen vor dem produktiven Betrieb durch die
 * echten Unternehmensdaten ersetzt werden. Das Impressum ist in der Schweiz
 * nach Art. 3 Abs. 1 lit. s UWG zwingend und muss Name, Adresse und eine
 * elektronische Kontaktmöglichkeit enthalten.
 *
 * Ebenso müssen die Angaben in `dataProcessors` mit den tatsächlich
 * eingesetzten Dienstleistern übereinstimmen (Art. 9 DSG – Auftragsbearbeitung).
 */

export const PLACEHOLDER = "[bitte ergänzen]";

export interface Processor {
  name: string;
  purpose: string;
  location: string;
  /** Adäquanz-Grundlage bei Auslandtransfer (Art. 16/17 DSG) */
  transferBasis?: string;
  privacyUrl?: string;
}

export const siteConfig = {
  name: "Nutzwertanalyse.com",
  shortName: "Nutzwertanalyse",
  domain: "nutzwertanalyse.com",
  url: "https://nutzwertanalyse.com",
  locale: "de-CH",
  description:
    "Entscheidungen strukturiert treffen – mit der Nutzwertanalyse. Kriterien definieren, gewichten, bewerten, Sensitivität prüfen und revisionssicher dokumentieren.",

  /** Betreiberangaben gemäss Art. 3 Abs. 1 lit. s UWG */
  operator: {
    legalName: PLACEHOLDER, // z. B. "Muster Analytics GmbH"
    legalForm: PLACEHOLDER, // z. B. "GmbH", "AG", "Einzelunternehmen"
    street: PLACEHOLDER, // z. B. "Bahnhofstrasse 1"
    zip: PLACEHOLDER, // z. B. "8001"
    city: PLACEHOLDER, // z. B. "Zürich"
    country: "Schweiz",
    email: PLACEHOLDER, // z. B. "kontakt@nutzwertanalyse.com"
    privacyEmail: PLACEHOLDER, // Kontakt für Betroffenenrechte (Art. 25 ff. DSG)
    phone: PLACEHOLDER, // z. B. "+41 44 000 00 00"
    /** Unternehmens-Identifikationsnummer, Art. 3 UIDG */
    uid: PLACEHOLDER, // z. B. "CHE-123.456.789"
    /** MWST-Nummer, sofern steuerpflichtig (Art. 10 MWSTG) */
    vatId: PLACEHOLDER, // z. B. "CHE-123.456.789 MWST"
    /** Handelsregistereintrag, sofern vorhanden */
    commercialRegister: PLACEHOLDER, // z. B. "Handelsregisteramt des Kantons Zürich"
    representatives: [PLACEHOLDER] as string[], // vertretungsberechtigte Personen
    /** Sitz des Anbieters – massgeblich für den Gerichtsstand */
    jurisdiction: PLACEHOLDER, // z. B. "Zürich"
  },

  /**
   * Datenschutzberater / Vertretung.
   * Eine DSG-Vertretung in der Schweiz (Art. 14 DSG) braucht es nur für
   * Verantwortliche mit Sitz im Ausland. Eine EU-Vertretung (Art. 27 DSGVO)
   * kann nötig sein, wenn die Bearbeitung in den räumlichen Anwendungsbereich
   * der DSGVO fällt (Art. 3 Abs. 2 DSGVO).
   */
  privacy: {
    dataProtectionOfficer: null as string | null,
    euRepresentative: null as string | null,
    /** Aufsichtsbehörde Schweiz */
    supervisoryAuthority: {
      name: "Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)",
      address: "Feldeggweg 1, 3003 Bern",
      url: "https://www.edoeb.admin.ch",
    },
  },

  /** Stand der Rechtstexte – wird auf den Rechtsseiten ausgewiesen. */
  legalVersion: {
    version: "1.0",
    effectiveDate: "2026-01-01",
    lastUpdated: "2026-01-01",
  },

  /**
   * Eingesetzte Auftragsbearbeiter (Art. 9 DSG / Art. 28 DSGVO).
   * Diese Liste muss dem tatsächlichen Deployment entsprechen.
   */
  dataProcessors: [
    {
      name: "Hosting-Anbieter",
      purpose: "Betrieb der Website, Auslieferung der Inhalte, Server-Logfiles",
      location: PLACEHOLDER,
      transferBasis:
        "Standardvertragsklauseln bzw. Angemessenheitsbeschluss, sofern Bearbeitung ausserhalb der Schweiz/des EWR",
    },
    {
      name: "KI-Anbieter (Sprachmodell)",
      purpose:
        "Optionale KI-gestützte Strukturierung der Entscheidungsfrage (nur bei aktiver Nutzung der Funktion)",
      location: PLACEHOLDER,
      transferBasis: "Standardvertragsklauseln (Art. 16 Abs. 2 lit. b DSG)",
    },
  ] as Processor[],

  /** Wird das Angebot entgeltlich vertrieben? Steuert AGB-Passagen. */
  commerce: {
    paidPlansAvailable: false,
    currency: "CHF",
    pricesIncludeVat: true,
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Formatierte Postadresse des Betreibers. */
export function operatorAddress(): string {
  const o = siteConfig.operator;
  return [o.street, `${o.zip} ${o.city}`.trim(), o.country]
    .filter((part) => part && !part.includes(PLACEHOLDER))
    .join(", ");
}

/** True, sobald mindestens eine Pflichtangabe im Impressum noch fehlt. */
export function hasIncompleteOperatorData(): boolean {
  const o = siteConfig.operator;
  return [o.legalName, o.street, o.zip, o.city, o.email].some(
    (value) => !value || value === PLACEHOLDER
  );
}

/** Anzeigewert – gibt einen neutralen Platzhalter zurück, wenn nichts gesetzt ist. */
export function displayValue(value: string | null | undefined): string {
  if (!value || value === PLACEHOLDER) return PLACEHOLDER;
  return value;
}

/** Datum im Schweizer Format (TT.MM.JJJJ). */
export function formatSwissDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}.${month}.${year}`;
}
