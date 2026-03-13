/**
 * Preset Context Data
 * 
 * Centralized configuration for all preset-specific content including:
 * - Decision title placeholders
 * - Helper texts
 * - Field hints
 * - Suggested alternatives
 * - Suggested criteria
 * - Domain-specific suggestions
 */

import type { PresetId } from "./preset-icons";

// Preset-specific content for the decision setup step
export interface PresetContext {
  id: PresetId;
  label: string;
  
  // Decision title field
  titlePlaceholder: string;
  titleHelperText: string;
  titleExamples: string[];
  
  // Description field
  descriptionPlaceholder: string;
  descriptionHelperText: string;
  
  // Constraints field (Advanced/Business)
  constraintsPlaceholder: string;
  constraintsExamples: string[];
  
  // Suggested alternatives
  alternativePlaceholders: string[];
  alternativeHelperText: string;
  
  // 5 topic-specific suggestions for refining the decision
  suggestions: Array<{
    label: string;
    description: string;
  }>;
  
  // Keywords for domain detection (German and English)
  keywords: string[];
}

// Complete preset context data for all 6 presets
export const PRESET_CONTEXTS: Record<PresetId, PresetContext> = {
  supplier: {
    id: "supplier",
    label: "Lieferantenauswahl",
    
    titlePlaceholder: "z.B. Welcher Lieferant passt am besten zu unseren Anforderungen?",
    titleHelperText: "Beschreiben Sie, welchen Lieferanten oder Partner Sie auswaehlen moechten.",
    titleExamples: [
      "Welchen Verpackungslieferanten sollen wir waehlen?",
      "Welcher IT-Dienstleister passt zu uns?",
      "Auswahl eines neuen Logistikpartners",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den Hintergrund: Warum suchen Sie einen neuen Lieferanten? Welche Produkte/Dienstleistungen werden benoetigt?",
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
      { label: "Preis-Leistung bewerten", description: "Gesamtkosten im Verhaeltnis zur Qualitaet" },
      { label: "Lieferzuverlaessigkeit pruefen", description: "Termintreue und Verfuegbarkeit" },
      { label: "Referenzen einholen", description: "Erfahrungen anderer Kunden" },
      { label: "Qualitaetsstandards vergleichen", description: "Zertifizierungen und QM-Systeme" },
      { label: "Langfristpotenzial einschaetzen", description: "Partnerschaftliche Entwicklung" },
    ],
    
    keywords: [
      "lieferant", "lieferanten", "supplier", "vendor", "anbieter", "partner",
      "dienstleister", "zulieferer", "hersteller", "verpackung", "packaging",
      "logistik", "logistics", "service provider", "outsourcing",
    ],
  },
  
  software: {
    id: "software",
    label: "Softwarevergleich",
    
    titlePlaceholder: "z.B. Welche Software passt am besten zu unserem Unternehmen?",
    titleHelperText: "Beschreiben Sie, welche Software oder welches System Sie auswaehlen moechten.",
    titleExamples: [
      "Welches CRM-System sollen wir einfuehren?",
      "Auswahl einer neuen Buchhaltungssoftware",
      "Welches Projektmanagement-Tool passt zu uns?",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den Anwendungsfall: Welche Prozesse soll die Software unterstuetzen? Wie viele Benutzer werden damit arbeiten?",
    descriptionHelperText: "Definieren Sie die wichtigsten Anforderungen.",
    
    constraintsPlaceholder: "z.B. Budget max. CHF 500/Monat, Cloud-Loesung bevorzugt, DSGVO-konform",
    constraintsExamples: [
      "Integration mit bestehendem ERP",
      "Mobile App erforderlich",
      "Max. 6 Monate Implementierungszeit",
    ],
    
    alternativePlaceholders: ["Software A", "Software B", "Software C"],
    alternativeHelperText: "Geben Sie die Namen der zu vergleichenden Softwareloesungen ein.",
    
    suggestions: [
      { label: "Funktionsumfang pruefen", description: "Abdeckung aller Anforderungen" },
      { label: "Integrationen vergleichen", description: "Anbindung an bestehende Systeme" },
      { label: "Support bewerten", description: "Herstellersupport und Community" },
      { label: "Skalierbarkeit einschaetzen", description: "Wachstumsfaehigkeit der Loesung" },
      { label: "Gesamtkosten berechnen", description: "TCO inkl. Implementierung und Schulung" },
    ],
    
    keywords: [
      "software", "app", "tool", "system", "crm", "erp", "programm", "application",
      "plattform", "platform", "saas", "cloud", "loesung", "solution", "buchhaltung",
      "accounting", "projektmanagement", "project management", "hr", "marketing",
    ],
  },
  
  investment: {
    id: "investment",
    label: "Investitionsentscheid",
    
    titlePlaceholder: "z.B. Welche Investition lohnt sich langfristig am meisten?",
    titleHelperText: "Beschreiben Sie die Investitionsentscheidung, die Sie treffen moechten.",
    titleExamples: [
      "In welches Projekt sollen wir investieren?",
      "Lohnt sich die Erweiterung der Produktionskapazitaet?",
      "Welche Geschaeftsentwicklung priorisieren?",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den strategischen Kontext: Welche Ziele verfolgen Sie? Welcher Zeithorizont ist relevant?",
    descriptionHelperText: "Erklaeren Sie die strategische Bedeutung der Investition.",
    
    constraintsPlaceholder: "z.B. Investitionsbudget max. CHF 2 Mio., Amortisation innerhalb 5 Jahren, min. 12% IRR",
    constraintsExamples: [
      "Eigenkapitalquote mindestens 30%",
      "Umsetzung bis Ende naechsten Jahres",
      "Kein zusaetzlicher Personalbedarf",
    ],
    
    alternativePlaceholders: ["Investition A", "Investition B", "Investition C"],
    alternativeHelperText: "Geben Sie die Investitionsalternativen ein, die Sie vergleichen moechten.",
    
    suggestions: [
      { label: "ROI berechnen", description: "Return on Investment ermitteln" },
      { label: "Risiken bewerten", description: "Potenzielle Gefahren identifizieren" },
      { label: "Strategische Passung pruefen", description: "Alignment mit Unternehmenszielen" },
      { label: "Marktpotenzial analysieren", description: "Wachstums- und Umsatzchancen" },
      { label: "Ressourcenbedarf schaetzen", description: "Personal und Infrastruktur" },
    ],
    
    keywords: [
      "invest", "investition", "investment", "projekt", "project", "kapital", "capital",
      "rendite", "roi", "return", "expansion", "wachstum", "growth", "strategie",
      "strategy", "geschaeftsentwicklung", "business development", "akquisition",
    ],
  },
  
  machines: {
    id: "machines",
    label: "Maschinenkauf",
    
    titlePlaceholder: "z.B. Welche Maschine erfuellt unsere Anforderungen am besten?",
    titleHelperText: "Beschreiben Sie, welche Maschine oder Anlage Sie beschaffen moechten.",
    titleExamples: [
      "Welche Produktionsmaschine sollen wir anschaffen?",
      "Auswahl einer neuen CNC-Fraese",
      "Welche Verpackungsanlage passt zu unseren Anforderungen?",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den Einsatzzweck: Welche Produkte werden gefertigt? Welche Kapazitaet wird benoetigt?",
    descriptionHelperText: "Definieren Sie die technischen Anforderungen.",
    
    constraintsPlaceholder: "z.B. Budget max. CHF 500'000, Stellflaeche max. 50m2, Stromversorgung 400V",
    constraintsExamples: [
      "CE-Kennzeichnung erforderlich",
      "Schulung des Personals inklusive",
      "Wartungsvertrag zwingend",
    ],
    
    alternativePlaceholders: ["Maschine A", "Maschine B", "Maschine C"],
    alternativeHelperText: "Geben Sie die Maschinenmodelle ein, die Sie vergleichen moechten.",
    
    suggestions: [
      { label: "Leistungsdaten vergleichen", description: "Kapazitaet und Praezision" },
      { label: "Betriebskosten berechnen", description: "Energie, Wartung, Verschleiss" },
      { label: "Zuverlaessigkeit pruefen", description: "Ausfallraten und Lebensdauer" },
      { label: "Servicekonzept bewerten", description: "Ersatzteile und Wartung" },
      { label: "Zukunftssicherheit einschaetzen", description: "Erweiterbarkeit und Updates" },
    ],
    
    keywords: [
      "maschine", "machine", "anlage", "equipment", "geraet", "device", "cnc",
      "produktion", "production", "fertigung", "manufacturing", "verpackung",
      "packaging", "automatisierung", "automation", "roboter", "robot",
    ],
  },
  
  vehicle: {
    id: "vehicle",
    label: "Fahrzeuganschaffung",
    
    titlePlaceholder: "z.B. Welches Fahrzeug passt am besten zu unserem Einsatzzweck?",
    titleHelperText: "Beschreiben Sie, welches Fahrzeug Sie anschaffen moechten.",
    titleExamples: [
      "Welches Firmenfahrzeug sollen wir anschaffen?",
      "Elektroauto oder Verbrenner fuer den Aussendienst?",
      "Auswahl eines neuen Lieferwagens",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den Einsatzzweck: Wie viele Kilometer pro Jahr? Welche Ladung/Personen?",
    descriptionHelperText: "Definieren Sie Ihre Mobilitaetsanforderungen.",
    
    constraintsPlaceholder: "z.B. Budget max. CHF 60'000, Mindestreichweite 400km, Anhaengerkupplung erforderlich",
    constraintsExamples: [
      "Mindestens 5 Sitzplaetze",
      "Allradantrieb bevorzugt",
      "Lieferzeit max. 6 Monate",
    ],
    
    alternativePlaceholders: ["Fahrzeug A", "Fahrzeug B", "Fahrzeug C"],
    alternativeHelperText: "Geben Sie die Fahrzeugmodelle ein, die Sie vergleichen moechten.",
    
    suggestions: [
      { label: "Anschaffungskosten vergleichen", description: "Kaufpreis oder Leasingrate" },
      { label: "Unterhaltskosten berechnen", description: "Versicherung, Steuern, Wartung" },
      { label: "Verbrauch bewerten", description: "Kraftstoff- oder Energiekosten" },
      { label: "Zuverlaessigkeit pruefen", description: "Pannenstatistik und Qualitaet" },
      { label: "Wiederverkaufswert einschaetzen", description: "Wertstabilitaet" },
    ],
    
    keywords: [
      "fahrzeug", "vehicle", "auto", "car", "wagen", "pkw", "lieferwagen", "van",
      "transporter", "lkw", "truck", "elektroauto", "electric", "bmw", "audi",
      "mercedes", "vw", "volkswagen", "tesla", "firmenwagen", "company car",
    ],
  },
  
  employee: {
    id: "employee",
    label: "Mitarbeiterwahl",
    
    titlePlaceholder: "z.B. Welche Kandidatin oder welcher Kandidat passt am besten?",
    titleHelperText: "Beschreiben Sie die Personalentscheidung, die Sie treffen moechten.",
    titleExamples: [
      "Wen sollen wir fuer die Stelle als Projektleiter einstellen?",
      "Welcher Bewerber passt am besten ins Team?",
      "Auswahl des neuen Vertriebsleiters",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie die Position: Welche Aufgaben umfasst sie? Welche Qualifikationen sind wichtig?",
    descriptionHelperText: "Definieren Sie das Anforderungsprofil.",
    
    constraintsPlaceholder: "z.B. Gehaltsrahmen 80-100k, Startdatum spaetestens Q2, Berufserfahrung mind. 5 Jahre",
    constraintsExamples: [
      "Fliessende Englischkenntnisse",
      "Fuehrungserfahrung erforderlich",
      "Reisebereitschaft 30%",
    ],
    
    alternativePlaceholders: ["Kandidat A", "Kandidat B", "Kandidat C"],
    alternativeHelperText: "Geben Sie die Kandidaten ein, die Sie vergleichen moechten.",
    
    suggestions: [
      { label: "Fachkompetenz bewerten", description: "Qualifikation und Erfahrung" },
      { label: "Team-Fit pruefen", description: "Passung zur Unternehmenskultur" },
      { label: "Entwicklungspotenzial einschaetzen", description: "Lernbereitschaft und Wachstum" },
      { label: "Erfahrung vergleichen", description: "Relevante Berufserfahrung" },
      { label: "Gehaltsvorstellung abgleichen", description: "Budget-Kompatibilitaet" },
    ],
    
    keywords: [
      "mitarbeiter", "employee", "kandidat", "candidate", "bewerber", "applicant",
      "personal", "staff", "hiring", "einstellen", "recruit", "talent", "team",
      "position", "stelle", "job", "bewerbung", "application", "interview",
    ],
  },
  
  custom: {
    id: "custom",
    label: "Eigene Analyse",
    
    titlePlaceholder: "z.B. Welche Option ist die beste fuer unsere Situation?",
    titleHelperText: "Beschreiben Sie die Entscheidung, die Sie treffen moechten.",
    titleExamples: [
      "Welche Strategie sollen wir verfolgen?",
      "Welche Loesung passt am besten?",
      "Wie sollen wir vorgehen?",
    ],
    
    descriptionPlaceholder: "Beschreiben Sie den Hintergrund und das Ziel dieser Entscheidung...",
    descriptionHelperText: "Je mehr Kontext, desto besser die Analyse.",
    
    constraintsPlaceholder: "z.B. Budget, Zeitrahmen, technische Einschraenkungen",
    constraintsExamples: [
      "Innerhalb des aktuellen Budgets",
      "Umsetzung bis Jahresende",
      "Mit bestehendem Team realisierbar",
    ],
    
    alternativePlaceholders: ["Option A", "Option B", "Option C"],
    alternativeHelperText: "Geben Sie die Alternativen ein, die Sie vergleichen moechten.",
    
    suggestions: [
      { label: "Kosten analysieren", description: "Finanzielle Auswirkungen bewerten" },
      { label: "Nutzen quantifizieren", description: "Erwarteten Mehrwert bestimmen" },
      { label: "Risiken identifizieren", description: "Potenzielle Gefahren erkennen" },
      { label: "Ressourcen pruefen", description: "Verfuegbare Mittel bewerten" },
      { label: "Zeitplan erstellen", description: "Realistische Meilensteine setzen" },
    ],
    
    keywords: [],
  },
};

// Domain-specific suggestions for AI interpretation flow
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
  
  // Additional domains for AI interpretation
  personal: [
    { label: "Kosten abwaegen", description: "Finanzielle Auswirkungen bedenken" },
    { label: "Emotionen beruecksichtigen", description: "Persoenliche Praeferenzen einbeziehen" },
    { label: "Langzeitfolgen bedenken", description: "Auswirkungen auf die Zukunft" },
    { label: "Alternativen pruefen", description: "Weitere Optionen erwaegen" },
    { label: "Prioritaeten klaeren", description: "Was ist wirklich wichtig?" },
  ],
  
  technology: [
    { label: "Kompatibilitaet pruefen", description: "Integration mit bestehenden Systemen" },
    { label: "Zukunftssicherheit bewerten", description: "Langfristige Relevanz" },
    { label: "Lernkurve einschaetzen", description: "Aufwand fuer Einarbeitung" },
    { label: "Community bewerten", description: "Support und Ressourcen" },
    { label: "Kosten vergleichen", description: "Gesamtkosten der Loesung" },
  ],
  
  service: [
    { label: "Servicequalitaet bewerten", description: "Zuverlaessigkeit und Reaktionszeit" },
    { label: "Preis-Leistung vergleichen", description: "Kosten im Verhaeltnis zum Nutzen" },
    { label: "Referenzen pruefen", description: "Erfahrungen anderer Kunden" },
    { label: "Verfuegbarkeit klaeren", description: "Erreichbarkeit und Kapazitaet" },
    { label: "Vertragskonditionen pruefen", description: "Laufzeit und Kuendigung" },
  ],
  
  other: [
    { label: "Kosten analysieren", description: "Finanzielle Auswirkungen" },
    { label: "Nutzen bewerten", description: "Erwarteter Mehrwert" },
    { label: "Risiken identifizieren", description: "Potenzielle Nachteile" },
    { label: "Alternativen vergleichen", description: "Weitere Optionen" },
    { label: "Prioritaeten setzen", description: "Wichtigste Faktoren" },
  ],
};

// Helper function to get preset context by ID
export function getPresetContext(presetId: PresetId | string | undefined): PresetContext {
  if (presetId && presetId in PRESET_CONTEXTS) {
    return PRESET_CONTEXTS[presetId as PresetId];
  }
  return PRESET_CONTEXTS.custom;
}

// Helper function to get domain suggestions
export function getDomainSuggestions(domain: string | undefined): DomainSuggestion[] {
  if (domain && domain in DOMAIN_SUGGESTIONS) {
    return DOMAIN_SUGGESTIONS[domain];
  }
  return DOMAIN_SUGGESTIONS.other;
}

// Helper function to detect preset from keywords
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
