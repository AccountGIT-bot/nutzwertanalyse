/**
 * Robust Interpretation Engine for Free-Text Input
 * 
 * This module provides intelligent parsing and interpretation of user input
 * for the decision support system. It handles:
 * - German and English inputs
 * - Short and long inputs
 * - Missing punctuation
 * - Various comparison patterns (X oder Y, X vs Y, etc.)
 * - Domain detection from keywords
 * - Dynamic title and criteria generation
 */

import type { AIDecisionInterpretation, AIInterpretedCriterion } from "./types";
import { PRESET_CONTEXTS, getDomainSuggestions } from "./preset-context";

// Domain detection keywords (German and English)
const DOMAIN_KEYWORDS: Record<AIDecisionInterpretation["domain"], string[]> = {
  vehicle: [
    // German
    "fahrzeug", "auto", "wagen", "pkw", "lieferwagen", "transporter", "lkw",
    "firmenwagen", "dienstwagen", "elektroauto", "verbrenner", "hybrid",
    "motorrad", "roller", "nutzfahrzeug", "fuhrpark",
    // English
    "vehicle", "car", "truck", "van", "fleet", "electric car", "ev",
    // Brands
    "bmw", "audi", "mercedes", "vw", "volkswagen", "ford", "toyota", "tesla",
    "opel", "skoda", "seat", "porsche", "volvo", "hyundai", "kia", "honda",
    "nissan", "mazda", "fiat", "renault", "peugeot", "citroen",
  ],
  
  software: [
    // German
    "software", "programm", "app", "anwendung", "loesung", "plattform",
    "buchhaltung", "fakturierung", "warenwirtschaft", "webshop",
    // English
    "tool", "application", "platform", "solution", "system",
    // Specific types
    "crm", "erp", "cms", "saas", "cloud", "hr", "projektmanagement",
    "project management", "accounting", "marketing", "analytics",
    "salesforce", "hubspot", "sap", "oracle", "microsoft", "slack",
    "notion", "asana", "monday", "jira", "confluence", "trello",
  ],
  
  supplier: [
    // German
    "lieferant", "lieferanten", "zulieferer", "anbieter", "hersteller",
    "dienstleister", "partner", "agentur", "verpackung", "logistik",
    "spedition", "catering", "reinigung", "wartung", "outsourcing",
    // English
    "supplier", "vendor", "provider", "manufacturer", "partner",
    "agency", "packaging", "logistics", "service provider",
  ],
  
  machines: [
    // German
    "maschine", "maschinen", "anlage", "anlagen", "geraet", "geraete",
    "equipment", "fertigung", "produktion", "automatisierung", "roboter",
    "cnc", "fraese", "drehbank", "druckmaschine", "verpackungsanlage",
    "foerderband", "kompressor", "schweissgeraet",
    // English
    "machine", "equipment", "manufacturing", "automation", "robot",
    "production line", "assembly",
  ],
  
  investment: [
    // German
    "investition", "investieren", "kapital", "anlage", "finanzierung",
    "projekt", "expansion", "wachstum", "rendite", "roi", "amortisation",
    "akquisition", "uebernahme", "geschaeftsentwicklung", "strategie",
    "kaufen oder mieten", "mieten oder kaufen", "leasen",
    // English  
    "investment", "invest", "capital", "project", "expansion", "growth",
    "return", "acquisition", "strategy", "buy or rent", "lease",
  ],
  
  employee: [
    // German
    "mitarbeiter", "mitarbeiterin", "kandidat", "kandidatin", "bewerber",
    "bewerberin", "personal", "stelle", "position", "einstellen",
    "rekrutierung", "talent", "team", "bewerbung", "interview",
    "fuehrungskraft", "manager", "leiter", "leiterin",
    // English
    "employee", "candidate", "applicant", "staff", "position", "hire",
    "hiring", "recruit", "recruitment", "talent", "team", "interview",
    "manager", "leader",
  ],
  
  personal: [
    // German
    "persoenlich", "privat", "familie", "haushalt", "urlaub", "reise",
    "wohnung", "haus", "umzug", "hobby", "freizeit", "haustier",
    "katze", "hund", "tier", "geschenk", "feier", "hochzeit",
    // English
    "personal", "private", "family", "vacation", "travel", "apartment",
    "house", "moving", "hobby", "pet", "cat", "dog", "gift", "wedding",
  ],
  
  technology: [
    // German
    "technologie", "it", "digital", "framework", "sprache", "stack",
    "infrastruktur", "server", "hosting", "datenbank", "api",
    // English
    "technology", "tech", "digital", "framework", "language", "stack",
    "infrastructure", "server", "hosting", "database", "api",
    "react", "angular", "vue", "node", "python", "java", "aws", "azure",
  ],
  
  service: [
    // German
    "dienstleistung", "service", "beratung", "consulting", "support",
    "wartung", "schulung", "training", "coaching",
    // English
    "service", "consulting", "support", "maintenance", "training",
    "coaching", "advisory",
  ],
  
  other: [],
};

// Comparison pattern matchers
const COMPARISON_PATTERNS = [
  // German patterns
  /^(.+?)\s+(?:oder|vs\.?|versus|oder\s+doch|oder\s+lieber)\s+(.+?)[\?\.\!]?$/i,
  /^(?:soll\s+ich|sollte\s+ich|sollen\s+wir|welche[rns]?|was\s+(?:soll|ist\s+besser)|lieber)\s+(.+?)\s+(?:oder|vs\.?)\s+(.+?)[\?\.\!]?$/i,
  /^(.+?)\s+(?:vergleichen\s+mit|verglichen\s+mit|im\s+vergleich\s+zu)\s+(.+?)[\?\.\!]?$/i,
  /^vergleich(?:en)?\s*[:\-]?\s*(.+?)\s+(?:und|&|,)\s+(.+?)[\?\.\!]?$/i,
  
  // English patterns
  /^(.+?)\s+(?:or|vs\.?|versus)\s+(.+?)[\?\.\!]?$/i,
  /^(?:should\s+(?:i|we)|which|what(?:'s|\s+is)\s+better)\s+(.+?)\s+(?:or|vs\.?)\s+(.+?)[\?\.\!]?$/i,
  /^compare\s+(.+?)\s+(?:and|&|with|to)\s+(.+?)[\?\.\!]?$/i,
  /^(.+?)\s+(?:compared\s+to|comparison\s+with)\s+(.+?)[\?\.\!]?$/i,
];

// Question patterns that indicate a decision context
const QUESTION_PATTERNS = [
  // German
  /^(?:welche[rns]?|was|wie|wer|wo|wann|warum|soll(?:en)?|sollte[n]?|koennen|wuerde[n]?|moechte[n]?)/i,
  // English  
  /^(?:which|what|how|who|where|when|why|should|could|would|can)/i,
];

// Domain-specific criteria templates
const DOMAIN_CRITERIA: Record<AIDecisionInterpretation["domain"], AIInterpretedCriterion[]> = {
  vehicle: [
    { name: "Anschaffungskosten", description: "Kaufpreis inkl. Nebenkosten", categoryId: "economic" },
    { name: "Unterhaltskosten", description: "Laufende Kosten pro Jahr", categoryId: "economic" },
    { name: "Zuverlaessigkeit", description: "Pannenstatistik und Qualitaet", categoryId: "quality" },
    { name: "Komfort", description: "Fahrkomfort und Ausstattung", categoryId: "quality" },
    { name: "Verbrauch", description: "Kraftstoff- oder Energieverbrauch", categoryId: "economic" },
  ],
  software: [
    { name: "Lizenzkosten", description: "Einmalige und laufende Kosten", categoryId: "economic" },
    { name: "Funktionsumfang", description: "Abdeckung der Anforderungen", categoryId: "quality" },
    { name: "Benutzerfreundlichkeit", description: "UX und Erlernbarkeit", categoryId: "quality" },
    { name: "Integration", description: "Anbindung an bestehende Systeme", categoryId: "strategic" },
    { name: "Support", description: "Herstellersupport und Community", categoryId: "quality" },
  ],
  supplier: [
    { name: "Preis", description: "Gesamtkosten des Angebots", categoryId: "economic" },
    { name: "Qualitaet", description: "Produkt- oder Servicequalitaet", categoryId: "quality" },
    { name: "Lieferzeit", description: "Durchschnittliche Lieferzeit", categoryId: "quality" },
    { name: "Zuverlaessigkeit", description: "Termintreue und Verfuegbarkeit", categoryId: "risk" },
    { name: "Flexibilitaet", description: "Anpassungsfaehigkeit bei Aenderungen", categoryId: "strategic" },
  ],
  machines: [
    { name: "Anschaffungspreis", description: "Kaufpreis inkl. Installation", categoryId: "economic" },
    { name: "Leistung", description: "Technische Leistungsfaehigkeit", categoryId: "quality" },
    { name: "Betriebskosten", description: "Energie, Wartung, Verschleiss", categoryId: "economic" },
    { name: "Zuverlaessigkeit", description: "Ausfallsicherheit und Lebensdauer", categoryId: "risk" },
    { name: "Produktivitaet", description: "Output pro Zeiteinheit", categoryId: "quality" },
  ],
  investment: [
    { name: "Kapitalaufwand", description: "Benoetigte Investitionssumme", categoryId: "economic" },
    { name: "Renditeerwartung", description: "Erwartete Rendite (ROI)", categoryId: "economic" },
    { name: "Risiko", description: "Verlustrisiko der Investition", categoryId: "risk" },
    { name: "Strategische Passung", description: "Alignment mit Unternehmenszielen", categoryId: "strategic" },
    { name: "Zeithorizont", description: "Amortisationsdauer", categoryId: "strategic" },
  ],
  employee: [
    { name: "Qualifikation", description: "Fachliche Eignung", categoryId: "quality" },
    { name: "Erfahrung", description: "Relevante Berufserfahrung", categoryId: "quality" },
    { name: "Gehaltsvorstellung", description: "Budget-Kompatibilitaet", categoryId: "economic" },
    { name: "Team-Fit", description: "Passung zur Unternehmenskultur", categoryId: "strategic" },
    { name: "Entwicklungspotenzial", description: "Lernbereitschaft und Wachstum", categoryId: "strategic" },
  ],
  personal: [
    { name: "Kosten", description: "Finanzielle Aufwendungen", categoryId: "economic" },
    { name: "Nutzen", description: "Erwarteter persoenlicher Nutzen", categoryId: "quality" },
    { name: "Zeitaufwand", description: "Benoetigte Zeit", categoryId: "economic" },
    { name: "Freude", description: "Emotionaler Wert", categoryId: "quality" },
    { name: "Risiko", description: "Moegliche negative Folgen", categoryId: "risk" },
  ],
  technology: [
    { name: "Leistungsfaehigkeit", description: "Performance und Skalierbarkeit", categoryId: "quality" },
    { name: "Kosten", description: "Lizenz- und Betriebskosten", categoryId: "economic" },
    { name: "Lernkurve", description: "Einarbeitungsaufwand", categoryId: "quality" },
    { name: "Community", description: "Support und Ressourcen", categoryId: "strategic" },
    { name: "Zukunftssicherheit", description: "Langfristige Relevanz", categoryId: "strategic" },
  ],
  service: [
    { name: "Preis", description: "Kosten der Dienstleistung", categoryId: "economic" },
    { name: "Qualitaet", description: "Servicequalitaet", categoryId: "quality" },
    { name: "Reaktionszeit", description: "Schnelligkeit der Reaktion", categoryId: "quality" },
    { name: "Zuverlaessigkeit", description: "Konstanz und Termintreue", categoryId: "risk" },
    { name: "Flexibilitaet", description: "Anpassungsfaehigkeit", categoryId: "strategic" },
  ],
  other: [
    { name: "Kosten", description: "Gesamtkosten der Option", categoryId: "economic" },
    { name: "Nutzen", description: "Erwarteter Mehrwert", categoryId: "quality" },
    { name: "Aufwand", description: "Benoetigte Ressourcen", categoryId: "economic" },
    { name: "Risiko", description: "Potenzielle Nachteile", categoryId: "risk" },
    { name: "Strategischer Fit", description: "Passung zu langfristigen Zielen", categoryId: "strategic" },
  ],
};

// Domain-specific title prefixes
const DOMAIN_TITLE_PREFIXES: Record<AIDecisionInterpretation["domain"], string> = {
  vehicle: "Fahrzeugvergleich",
  software: "Softwarevergleich",
  supplier: "Lieferantenvergleich",
  machines: "Maschinenvergleich",
  investment: "Investitionsentscheidung",
  employee: "Kandidatenvergleich",
  personal: "Persoenliche Entscheidung",
  technology: "Technologievergleich",
  service: "Dienstleistervergleich",
  other: "Entscheidungsanalyse",
};

/**
 * Detect the domain from input text based on keywords
 */
function detectDomain(input: string): AIDecisionInterpretation["domain"] {
  const normalized = input.toLowerCase();
  
  // Check each domain's keywords
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (domain === "other") continue;
    
    for (const keyword of keywords) {
      if (normalized.includes(keyword)) {
        return domain as AIDecisionInterpretation["domain"];
      }
    }
  }
  
  return "other";
}

/**
 * Extract comparison alternatives from input
 */
function extractAlternatives(input: string): { alt1: string; alt2: string } | null {
  const trimmed = input.trim();
  
  for (const pattern of COMPARISON_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[2]) {
      return {
        alt1: match[1].trim(),
        alt2: match[2].trim(),
      };
    }
  }
  
  return null;
}

/**
 * Generate an improved title based on domain and alternatives
 */
function generateTitle(
  input: string,
  domain: AIDecisionInterpretation["domain"],
  alternatives: { alt1: string; alt2: string } | null
): string {
  const prefix = DOMAIN_TITLE_PREFIXES[domain];
  
  if (alternatives) {
    return `${prefix}: ${alternatives.alt1} vs. ${alternatives.alt2}`;
  }
  
  // Check if input is already a good title
  const trimmed = input.trim();
  if (trimmed.length > 10 && trimmed.length < 100) {
    // Capitalize first letter and ensure proper ending
    const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    return capitalized.replace(/[\?\.\!]$/, "");
  }
  
  return `${prefix}: ${trimmed}`;
}

/**
 * Generate a description based on the input and domain
 */
function generateDescription(
  input: string,
  domain: AIDecisionInterpretation["domain"]
): string {
  const domainDescriptions: Record<AIDecisionInterpretation["domain"], string> = {
    vehicle: "Systematischer Vergleich von Fahrzeugoptionen anhand relevanter Kriterien",
    software: "Strukturierte Bewertung von Softwareloesungen fuer Ihre Anforderungen",
    supplier: "Objektive Analyse von Lieferanten zur optimalen Partnerauswahl",
    machines: "Technischer und wirtschaftlicher Vergleich von Maschinen",
    investment: "Fundierte Investitionsentscheidung basierend auf ROI und Risiko",
    employee: "Faire und nachvollziehbare Kandidatenbewertung",
    personal: "Strukturierte Entscheidungshilfe fuer Ihre persoenliche Wahl",
    technology: "Technologievergleich anhand von Leistung und Zukunftssicherheit",
    service: "Dienstleisterbewertung nach Qualitaet und Preis-Leistung",
    other: "Systematische Entscheidungsanalyse fuer Ihre Fragestellung",
  };
  
  return domainDescriptions[domain];
}

/**
 * Determine confidence level based on input quality
 */
function determineConfidence(
  input: string,
  domain: AIDecisionInterpretation["domain"],
  hasAlternatives: boolean
): "high" | "medium" | "low" {
  const length = input.trim().length;
  
  // High confidence: clear alternatives, known domain, reasonable length
  if (hasAlternatives && domain !== "other" && length > 10) {
    return "high";
  }
  
  // Medium confidence: either alternatives or domain detected
  if (hasAlternatives || domain !== "other") {
    return "medium";
  }
  
  // Low confidence: no clear signals
  return "low";
}

/**
 * Main interpretation function - creates a complete interpretation from any input
 */
export function interpretDecisionInput(input: string): AIDecisionInterpretation {
  const trimmed = input.trim();
  
  // Handle empty or very short input
  if (!trimmed || trimmed.length < 2) {
    return {
      title: "Neue Entscheidung",
      description: "Bitte beschreiben Sie Ihre Entscheidungsfrage genauer.",
      domain: "other",
      alternatives: [
        { name: "Option A", description: null },
        { name: "Option B", description: null },
      ],
      criteria: DOMAIN_CRITERIA.other,
      constraints: null,
      confidence: "low",
    };
  }
  
  // Detect domain
  const domain = detectDomain(trimmed);
  
  // Extract alternatives
  const extractedAlternatives = extractAlternatives(trimmed);
  
  // Build alternatives array
  const alternatives = extractedAlternatives
    ? [
        { name: extractedAlternatives.alt1, description: null },
        { name: extractedAlternatives.alt2, description: null },
      ]
    : [
        { name: "Option A", description: null },
        { name: "Option B", description: null },
      ];
  
  // Generate title
  const title = generateTitle(trimmed, domain, extractedAlternatives);
  
  // Generate description
  const description = generateDescription(trimmed, domain);
  
  // Get domain-specific criteria
  const criteria = DOMAIN_CRITERIA[domain];
  
  // Determine confidence
  const confidence = determineConfidence(trimmed, domain, !!extractedAlternatives);
  
  return {
    title,
    description,
    domain,
    alternatives,
    criteria,
    constraints: null,
    confidence,
  };
}

/**
 * Get 5 relevant suggestions for a domain
 */
export function getInterpretationSuggestions(domain: AIDecisionInterpretation["domain"]): Array<{
  label: string;
  description: string;
}> {
  return getDomainSuggestions(domain);
}

/**
 * Validate and sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // Remove potentially dangerous characters
    .replace(/[<>]/g, "")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    // Limit length
    .slice(0, 1000);
}

/**
 * Check if input looks like a decision question
 */
export function isDecisionQuestion(input: string): boolean {
  const trimmed = input.trim().toLowerCase();
  
  // Check for comparison patterns
  for (const pattern of COMPARISON_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  // Check for question patterns
  for (const pattern of QUESTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return true;
    }
  }
  
  // Check for domain keywords
  const domain = detectDomain(trimmed);
  if (domain !== "other") {
    return true;
  }
  
  return false;
}
