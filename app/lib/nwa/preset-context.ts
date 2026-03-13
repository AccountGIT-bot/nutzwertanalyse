/**
 * Preset Context Data - with proper German umlauts (ü, ö, ä)
 */

import type { PresetId } from "./preset-icons";

export interface PresetContext {
  id: PresetId;
  label: string;
  titlePlaceholder: string;
  titleHelperText: string;
  titleExamples: string[];
  descriptionPlaceholder: string;
  descriptionHelperText: string;
  constraintsPlaceholder: string;
  constraintsExamples: string[];
  alternativePlaceholders: string[];
  alternativeHelperText: string;
  suggestions: Array<{ label: string; description: string }>;
  keywords: string[];
}

export const PRESET_CONTEXTS: Record<PresetId, PresetContext> = {
  supplier: {
    id: "supplier",
    label: "Lieferantenauswahl",
    titlePlaceholder: "z.B. Welcher Lieferant passt am besten zu unseren Anforderungen?",
    titleHelperText: "Beschreiben Sie, welchen Lieferanten oder Partner Sie auswählen möchten.",
    titleExamples: [
      "Welchen Verpackungslieferanten sollen wir wählen?",
      "Welcher IT-Dienstleister passt zu uns?",
      "Auswahl eines neuen Logistikpartners",
    ],
    descriptionPlaceholder: "Beschreiben Sie den Hintergrund: Warum suchen Sie einen neuen Lieferanten? Welche Produkte/Dienstleistungen werden benötigt?",
    descriptionHelperText: "Je mehr Kontext, desto besser die Analyse.",
    constraintsPlaceholder: "z.B. Budget max. CHF 50'000/Jahr, Lieferzeit max. 5 Tage, ISO-Zertifizierung erforderlich",
    constraintsExamples: [
      "Mindestens 3 Jahre Markterfahrung",
      "Standort in der DACH-Region",
      "24/7 Support erforderlich",
    ],
    alternativePlaceholders: ["Lieferant A", "Lieferant B", "Lieferant C"],
    alternativeHelperText: "Geben Sie die Namen der zu vergleichenden Lieferanten ein.",
    suggestions: [
      { label: "Preis-Leistung bewerten", description: "Gesamtkosten im Verhältnis zur Qualität" },
      { label: "Lieferzuverlässigkeit prüfen", description: "Termintreue und Verfügbarkeit" },
      { label: "Referenzen einholen", description: "Erfahrungen anderer Kunden" },
      { label: "Qualitätsstandards vergleichen", description: "Zertifizierungen und QM-Systeme" },
      { label: "Langfristpotenzial einschätzen", description: "Partnerschaftliche Entwicklung" },
    ],
    keywords: ["lieferant", "supplier", "vendor", "anbieter", "partner", "dienstleister"],
  },
  
  software: {
    id: "software",
    label: "Softwarevergleich",
    titlePlaceholder: "z.B. Welche Software passt am besten zu unserem Unternehmen?",
    titleHelperText: "Beschreiben Sie, welche Software oder welches System Sie auswählen möchten.",
    titleExamples: [
      "Welches CRM-System sollen wir einführen?",
      "Auswahl einer neuen Buchhaltungssoftware",
      "Welches Projektmanagement-Tool passt zu uns?",
    ],
    descriptionPlaceholder: "Beschreiben Sie den Anwendungsfall: Welche Prozesse soll die Software unterstützen? Wie viele Benutzer werden damit arbeiten?",
    descriptionHelperText: "Definieren Sie die wichtigsten Anforderungen.",
    constraintsPlaceholder: "z.B. Budget max. CHF 500/Monat, Cloud-Lösung bevorzugt, DSGVO-konform",
    constraintsExamples: [
      "Integration mit bestehendem ERP",
      "Mobile App erforderlich",
      "Max. 6 Monate Implementierungszeit",
    ],
    alternativePlaceholders: ["Software A", "Software B", "Software C"],
    alternativeHelperText: "Geben Sie die Namen der zu vergleichenden Softwarelösungen ein.",
    suggestions: [
      { label: "Funktionsumfang prüfen", description: "Abdeckung aller Anforderungen" },
      { label: "Integrationen vergleichen", description: "Anbindung an bestehende Systeme" },
      { label: "Support bewerten", description: "Herstellersupport und Community" },
      { label: "Skalierbarkeit einschätzen", description: "Wachstumsfähigkeit der Lösung" },
      { label: "Gesamtkosten berechnen", description: "TCO inkl. Implementierung und Schulung" },
    ],
    keywords: ["software", "app", "tool", "crm", "erp", "programm", "platform"],
  },
  
  investment: {
    id: "investment",
    label: "Investitionsentscheid",
    titlePlaceholder: "z.B. Welche Investition lohnt sich langfristig am meisten?",
    titleHelperText: "Beschreiben Sie die Investitionsentscheidung, die Sie treffen möchten.",
    titleExamples: [
      "In welches Projekt sollen wir investieren?",
      "Lohnt sich die Erweiterung der Produktionskapazität?",
      "Welche Geschäftsentwicklung priorisieren?",
    ],
    descriptionPlaceholder: "Beschreiben Sie den strategischen Kontext: Welche Ziele verfolgen Sie? Welcher Zeithorizont ist relevant?",
    descriptionHelperText: "Erklären Sie die strategische Bedeutung der Investition.",
    constraintsPlaceholder: "z.B. Investitionsbudget max. CHF 2 Mio., Amortisation innerhalb 5 Jahren, min. 12% IRR",
    constraintsExamples: [
      "Eigenkapitalquote mindestens 30%",
      "Umsetzung bis Ende nächsten Jahres",
      "Kein zusätzlicher Personalbedarf",
    ],
    alternativePlaceholders: ["Investition A", "Investition B", "Investition C"],
    alternativeHelperText: "Geben Sie die Investitionsalternativen ein, die Sie vergleichen möchten.",
    suggestions: [
      { label: "ROI berechnen", description: "Return on Investment ermitteln" },
      { label: "Risiken bewerten", description: "Potenzielle Gefahren identifizieren" },
      { label: "Strategische Passung prüfen", description: "Alignment mit Unternehmenszielen" },
      { label: "Marktpotenzial analysieren", description: "Wachstums- und Umsatzchancen" },
      { label: "Ressourcenbedarf schätzen", description: "Personal und Infrastruktur" },
    ],
    keywords: ["investition", "invest", "projekt", "kapital", "rendite", "roi"],
  },
  
  machines: {
    id: "machines",
    label: "Maschinenkauf",
    titlePlaceholder: "z.B. Welche Maschine erfüllt unsere Anforderungen am besten?",
    titleHelperText: "Beschreiben Sie, welche Maschine oder Anlage Sie beschaffen möchten.",
    titleExamples: [
      "Welche Produktionsmaschine sollen wir anschaffen?",
      "Auswahl einer neuen CNC-Fräse",
      "Welche Verpackungsanlage passt zu unseren Anforderungen?",
    ],
    descriptionPlaceholder: "Beschreiben Sie den Einsatzzweck: Welche Produkte werden gefertigt? Welche Kapazität wird benötigt?",
    descriptionHelperText: "Definieren Sie die technischen Anforderungen.",
    constraintsPlaceholder: "z.B. Budget max. CHF 500'000, Stellfläche max. 50m², Stromversorgung 400V",
    constraintsExamples: [
      "CE-Kennzeichnung erforderlich",
      "Schulung des Personals inklusive",
      "Wartungsvertrag zwingend",
    ],
    alternativePlaceholders: ["Maschine A", "Maschine B", "Maschine C"],
    alternativeHelperText: "Geben Sie die Maschinenmodelle ein, die Sie vergleichen möchten.",
    suggestions: [
      { label: "Leistungsdaten vergleichen", description: "Kapazität und Präzision" },
      { label: "Betriebskosten berechnen", description: "Energie, Wartung, Verschleiß" },
      { label: "Zuverlässigkeit prüfen", description: "Ausfallraten und Lebensdauer" },
      { label: "Servicekonzept bewerten", description: "Ersatzteile und Wartung" },
      { label: "Zukunftssicherheit einschätzen", description: "Erweiterbarkeit und Updates" },
    ],
    keywords: ["maschine", "machine", "anlage", "equipment", "gerät", "cnc", "produktion"],
  },
  
  vehicle: {
    id: "vehicle",
    label: "Fahrzeuganschaffung",
    titlePlaceholder: "z.B. Welches Fahrzeug passt am besten zu unserem Einsatzzweck?",
    titleHelperText: "Beschreiben Sie, welches Fahrzeug Sie anschaffen möchten.",
    titleExamples: [
      "Welches Firmenfahrzeug sollen wir anschaffen?",
      "Elektroauto oder Verbrenner für den Außendienst?",
      "Auswahl eines neuen Lieferwagens",
    ],
    descriptionPlaceholder: "Beschreiben Sie den Einsatzzweck: Wie viele Kilometer pro Jahr? Welche Ladung/Personen?",
    descriptionHelperText: "Definieren Sie Ihre Mobilitätsanforderungen.",
    constraintsPlaceholder: "z.B. Budget max. CHF 60'000, Mindestreichweite 400km, Anhängerkupplung erforderlich",
    constraintsExamples: [
      "Mindestens 5 Sitzplätze",
      "Allradantrieb bevorzugt",
      "Lieferzeit max. 6 Monate",
    ],
    alternativePlaceholders: ["Fahrzeug A", "Fahrzeug B", "Fahrzeug C"],
    alternativeHelperText: "Geben Sie die Fahrzeugmodelle ein, die Sie vergleichen möchten.",
    suggestions: [
      { label: "Anschaffungskosten vergleichen", description: "Kaufpreis oder Leasingrate" },
      { label: "Unterhaltskosten berechnen", description: "Versicherung, Steuern, Wartung" },
      { label: "Verbrauch bewerten", description: "Kraftstoff- oder Energiekosten" },
      { label: "Zuverlässigkeit prüfen", description: "Pannenstatistik und Qualität" },
      { label: "Wiederverkaufswert einschätzen", description: "Wertstabilität" },
    ],
    keywords: ["fahrzeug", "vehicle", "auto", "car", "wagen", "pkw", "bmw", "audi", "mercedes", "vw"],
  },
  
  employee: {
    id: "employee",
    label: "Mitarbeiterwahl",
    titlePlaceholder: "z.B. Welche Kandidatin oder welcher Kandidat passt am besten?",
    titleHelperText: "Beschreiben Sie die Personalentscheidung, die Sie treffen möchten.",
    titleExamples: [
      "Wen sollen wir für die Stelle als Projektleiter einstellen?",
      "Welcher Bewerber passt am besten ins Team?",
      "Auswahl des neuen Vertriebsleiters",
    ],
    descriptionPlaceholder: "Beschreiben Sie die Position: Welche Aufgaben umfasst sie? Welche Qualifikationen sind wichtig?",
    descriptionHelperText: "Definieren Sie das Anforderungsprofil.",
    constraintsPlaceholder: "z.B. Gehaltsrahmen 80-100k, Startdatum spätestens Q2, Berufserfahrung mind. 5 Jahre",
    constraintsExamples: [
      "Fließende Englischkenntnisse",
      "Führungserfahrung erforderlich",
      "Reisebereitschaft 30%",
    ],
    alternativePlaceholders: ["Kandidat A", "Kandidat B", "Kandidat C"],
    alternativeHelperText: "Geben Sie die Kandidaten ein, die Sie vergleichen möchten.",
    suggestions: [
      { label: "Fachkompetenz bewerten", description: "Qualifikation und Erfahrung" },
      { label: "Team-Fit prüfen", description: "Passung zur Unternehmenskultur" },
      { label: "Entwicklungspotenzial einschätzen", description: "Lernbereitschaft und Wachstum" },
      { label: "Erfahrung vergleichen", description: "Relevante Berufserfahrung" },
      { label: "Gehaltsvorstellung abgleichen", description: "Budget-Kompatibilität" },
    ],
    keywords: ["mitarbeiter", "employee", "kandidat", "candidate", "bewerber", "personal", "hiring"],
  },
  
  custom: {
    id: "custom",
    label: "Eigene Analyse",
    titlePlaceholder: "z.B. Welche Option ist die beste für unsere Situation?",
    titleHelperText: "Beschreiben Sie die Entscheidung, die Sie treffen möchten.",
    titleExamples: [
      "Welche Strategie sollen wir verfolgen?",
      "Welche Lösung passt am besten?",
      "Wie sollen wir vorgehen?",
    ],
    descriptionPlaceholder: "Beschreiben Sie den Hintergrund und das Ziel dieser Entscheidung...",
    descriptionHelperText: "Je mehr Kontext, desto besser die Analyse.",
    constraintsPlaceholder: "z.B. Budget, Zeitrahmen, technische Einschränkungen",
    constraintsExamples: [
      "Innerhalb des aktuellen Budgets",
      "Umsetzung bis Jahresende",
      "Mit bestehendem Team realisierbar",
    ],
    alternativePlaceholders: ["Option A", "Option B", "Option C"],
    alternativeHelperText: "Geben Sie die Alternativen ein, die Sie vergleichen möchten.",
    suggestions: [
      { label: "Kosten analysieren", description: "Finanzielle Auswirkungen bewerten" },
      { label: "Nutzen quantifizieren", description: "Erwarteten Mehrwert bestimmen" },
      { label: "Risiken identifizieren", description: "Potenzielle Gefahren erkennen" },
      { label: "Ressourcen prüfen", description: "Verfügbare Mittel bewerten" },
      { label: "Zeitplan erstellen", description: "Realistische Meilensteine setzen" },
    ],
    keywords: [],
  },
};

// Domain suggestions for AI interpretation
export interface DomainSuggestion {
  label: string;
  description: string;
}

export const DOMAIN_SUGGESTIONS: Record<string, DomainSuggestion[]> = {
  supplier: PRESET_CONTEXTS.supplier.suggestions,
  software: PRESET_CONTEXTS.software.suggestions,
  investment: PRESET_CONTEXTS.investment.suggestions,
  machines: PRESET_CONTEXTS.machines.suggestions,
  vehicle: PRESET_CONTEXTS.vehicle.suggestions,
  employee: PRESET_CONTEXTS.employee.suggestions,
  personal: [
    { label: "Kosten abwägen", description: "Finanzielle Auswirkungen bedenken" },
    { label: "Emotionen berücksichtigen", description: "Persönliche Präferenzen einbeziehen" },
    { label: "Langzeitfolgen bedenken", description: "Auswirkungen auf die Zukunft" },
    { label: "Alternativen prüfen", description: "Weitere Optionen erwägen" },
    { label: "Prioritäten klären", description: "Was ist wirklich wichtig?" },
  ],
  technology: [
    { label: "Kompatibilität prüfen", description: "Integration mit bestehenden Systemen" },
    { label: "Zukunftssicherheit bewerten", description: "Langfristige Relevanz" },
    { label: "Lernkurve einschätzen", description: "Aufwand für Einarbeitung" },
    { label: "Community bewerten", description: "Support und Ressourcen" },
    { label: "Kosten vergleichen", description: "Gesamtkosten der Lösung" },
  ],
  service: [
    { label: "Servicequalität bewerten", description: "Zuverlässigkeit und Reaktionszeit" },
    { label: "Preis-Leistung vergleichen", description: "Kosten im Verhältnis zum Nutzen" },
    { label: "Referenzen prüfen", description: "Erfahrungen anderer Kunden" },
    { label: "Verfügbarkeit klären", description: "Erreichbarkeit und Kapazität" },
    { label: "Vertragskonditionen prüfen", description: "Laufzeit und Kündigung" },
  ],
  other: [
    { label: "Kosten analysieren", description: "Finanzielle Auswirkungen" },
    { label: "Nutzen bewerten", description: "Erwarteter Mehrwert" },
    { label: "Risiken identifizieren", description: "Potenzielle Nachteile" },
    { label: "Alternativen vergleichen", description: "Weitere Optionen" },
    { label: "Prioritäten setzen", description: "Wichtigste Faktoren" },
  ],
};

export function getPresetContext(presetId: PresetId | string | undefined): PresetContext {
  if (presetId && presetId in PRESET_CONTEXTS) {
    return PRESET_CONTEXTS[presetId as PresetId];
  }
  return PRESET_CONTEXTS.custom;
}

export function getDomainSuggestions(domain: string | undefined): DomainSuggestion[] {
  if (domain && domain in DOMAIN_SUGGESTIONS) {
    return DOMAIN_SUGGESTIONS[domain];
  }
  return DOMAIN_SUGGESTIONS.other;
}

export function detectPresetFromKeywords(input: string): PresetId | null {
  const normalized = input.toLowerCase();
  
  for (const [presetId, context] of Object.entries(PRESET_CONTEXTS)) {
    if (presetId === "custom") continue;
    for (const keyword of context.keywords) {
      if (normalized.includes(keyword)) {
        return presetId as PresetId;
      }
    }
  }
  return null;
}
