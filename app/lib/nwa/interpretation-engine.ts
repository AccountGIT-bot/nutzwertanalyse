/**
 * Robust Interpretation Engine for Free-Text Input
 * 
 * Handles any user input - doesn't force it into preset categories.
 * Creates a title and alternatives based on what the user actually typed.
 */

import type { AIDecisionInterpretation, AIInterpretedCriterion } from "./types";

// Helper to capitalize first letter properly
function capitalizeFirst(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

// Domain detection keywords
const DOMAIN_KEYWORDS: Record<AIDecisionInterpretation["domain"], string[]> = {
  vehicle: [
    "fahrzeug", "auto", "wagen", "pkw", "lieferwagen", "transporter", "lkw",
    "firmenwagen", "dienstwagen", "elektroauto", "verbrenner", "hybrid",
    "motorrad", "roller", "nutzfahrzeug", "fuhrpark", "vehicle", "car", "truck",
    "bmw", "audi", "mercedes", "vw", "volkswagen", "ford", "toyota", "tesla",
    "opel", "skoda", "seat", "porsche", "volvo", "hyundai", "kia", "honda",
  ],
  software: [
    "software", "programm", "app", "anwendung", "lösung", "plattform", "tool",
    "crm", "erp", "cms", "saas", "cloud", "buchhaltung", "projektmanagement",
    "salesforce", "hubspot", "sap", "oracle", "microsoft", "slack", "notion",
  ],
  supplier: [
    "lieferant", "lieferanten", "zulieferer", "anbieter", "hersteller",
    "dienstleister", "partner", "agentur", "verpackung", "logistik", "spedition",
    "supplier", "vendor", "provider",
  ],
  machines: [
    "maschine", "maschinen", "anlage", "anlagen", "gerät", "geräte", "equipment",
    "fertigung", "produktion", "automatisierung", "roboter", "cnc", "fräse",
  ],
  investment: [
    "investition", "investieren", "kapital", "anlage", "finanzierung", "projekt",
    "rendite", "roi", "kaufen oder mieten", "mieten oder kaufen", "leasen",
  ],
  employee: [
    "mitarbeiter", "mitarbeiterin", "kandidat", "kandidatin", "bewerber",
    "bewerberin", "personal", "stelle", "position", "einstellen", "rekrutierung",
  ],
  personal: [
    "persönlich", "privat", "familie", "haushalt", "urlaub", "reise", "wohnung",
    "haus", "umzug", "hobby", "freizeit", "haustier", "katze", "hund", "tier",
  ],
  technology: [
    "technologie", "it", "digital", "framework", "stack", "infrastruktur",
    "server", "hosting", "datenbank", "api", "react", "angular", "vue",
  ],
  service: [
    "dienstleistung", "service", "beratung", "consulting", "support", "wartung",
  ],
  other: [],
};

// Comparison patterns - expanded to catch more natural language
const COMPARISON_PATTERNS = [
  // Direct comparisons: "X oder Y"
  /^(.+?)\s+(?:oder|vs\.?|versus|oder\s+doch|oder\s+lieber)\s+(.+?)[\?\.\!]?$/i,
  // Question starters: "soll ich X oder Y"
  /^(?:soll\s+ich|sollte\s+ich|sollen\s+wir|welche[rns]?|was\s+ist\s+besser|lieber)\s+(.+?)\s+(?:oder|vs\.?)\s+(.+?)[\?\.\!]?$/i,
  // Comparison with: "X vergleichen mit Y"
  /^(.+?)\s+(?:vergleichen\s+mit|verglichen\s+mit|im\s+vergleich\s+zu)\s+(.+?)[\?\.\!]?$/i,
  // Explicit comparison: "vergleich: X und Y"
  /^vergleich(?:en)?\s*[:\-]?\s*(.+?)\s+(?:und|&|,)\s+(.+?)[\?\.\!]?$/i,
  // English: "X or Y"
  /^(.+?)\s+(?:or|vs\.?|versus)\s+(.+?)[\?\.\!]?$/i,
  // "besser als" pattern: "ob X besser ist als Y"
  /(?:ob|wenn|dass)\s+(?:mein[e]?|dein[e]?|sein[e]?|ihr[e]?|unser[e]?)?\s*(.+?)\s+besser\s+(?:ist|sind|wäre|waere)\s+als\s+(?:der|die|das|den|dem|mein[e]?|dein[e]?|sein[e]?|ihr[e]?|unser[e]?)?\s*(?:alte[nr]?)?\s*(.+?)(?:\s+von|\s*[\?\.\!]|$)/i,
  // "besser als" simpler: "X besser als Y"
  /(.+?)\s+besser\s+(?:ist|sind|wäre|waere)?\s*als\s+(.+?)[\?\.\!]?$/i,
  // "schauen ob" pattern
  /(?:schauen|prüfen|checken|testen)\s+ob\s+(.+?)\s+besser\s+(?:ist|sind)\s+als\s+(.+?)[\?\.\!]?$/i,
  // "entscheiden zwischen" pattern
  /(?:entscheiden|wählen|aussuchen)\s+zwischen\s+(.+?)\s+(?:und|oder|&)\s+(.+?)[\?\.\!]?$/i,
];

// Domain-specific criteria
const DOMAIN_CRITERIA: Record<AIDecisionInterpretation["domain"], AIInterpretedCriterion[]> = {
  vehicle: [
    { name: "Anschaffungskosten", description: "Kaufpreis inkl. Nebenkosten", categoryId: "economic" },
    { name: "Unterhaltskosten", description: "Laufende Kosten pro Jahr", categoryId: "economic" },
    { name: "Zuverlässigkeit", description: "Pannenstatistik und Qualität", categoryId: "quality" },
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
    { name: "Qualität", description: "Produkt- oder Servicequalität", categoryId: "quality" },
    { name: "Lieferzeit", description: "Durchschnittliche Lieferzeit", categoryId: "quality" },
    { name: "Zuverlässigkeit", description: "Termintreue und Verfügbarkeit", categoryId: "risk" },
    { name: "Flexibilität", description: "Anpassungsfähigkeit bei Änderungen", categoryId: "strategic" },
  ],
  machines: [
    { name: "Anschaffungspreis", description: "Kaufpreis inkl. Installation", categoryId: "economic" },
    { name: "Leistung", description: "Technische Leistungsfähigkeit", categoryId: "quality" },
    { name: "Betriebskosten", description: "Energie, Wartung, Verschleiß", categoryId: "economic" },
    { name: "Zuverlässigkeit", description: "Ausfallsicherheit und Lebensdauer", categoryId: "risk" },
    { name: "Produktivität", description: "Output pro Zeiteinheit", categoryId: "quality" },
  ],
  investment: [
    { name: "Kapitalaufwand", description: "Benötigte Investitionssumme", categoryId: "economic" },
    { name: "Renditeerwartung", description: "Erwartete Rendite (ROI)", categoryId: "economic" },
    { name: "Risiko", description: "Verlustrisiko der Investition", categoryId: "risk" },
    { name: "Strategische Passung", description: "Alignment mit Unternehmenszielen", categoryId: "strategic" },
    { name: "Zeithorizont", description: "Amortisationsdauer", categoryId: "strategic" },
  ],
  employee: [
    { name: "Qualifikation", description: "Fachliche Eignung", categoryId: "quality" },
    { name: "Erfahrung", description: "Relevante Berufserfahrung", categoryId: "quality" },
    { name: "Gehaltsvorstellung", description: "Budget-Kompatibilität", categoryId: "economic" },
    { name: "Team-Fit", description: "Passung zur Unternehmenskultur", categoryId: "strategic" },
    { name: "Entwicklungspotenzial", description: "Lernbereitschaft und Wachstum", categoryId: "strategic" },
  ],
  personal: [
    { name: "Kosten", description: "Finanzielle Aufwendungen", categoryId: "economic" },
    { name: "Nutzen", description: "Erwarteter persönlicher Nutzen", categoryId: "quality" },
    { name: "Zeitaufwand", description: "Benötigte Zeit", categoryId: "economic" },
    { name: "Freude", description: "Emotionaler Wert", categoryId: "quality" },
    { name: "Risiko", description: "Mögliche negative Folgen", categoryId: "risk" },
  ],
  technology: [
    { name: "Leistungsfähigkeit", description: "Performance und Skalierbarkeit", categoryId: "quality" },
    { name: "Kosten", description: "Lizenz- und Betriebskosten", categoryId: "economic" },
    { name: "Lernkurve", description: "Einarbeitungsaufwand", categoryId: "quality" },
    { name: "Community", description: "Support und Ressourcen", categoryId: "strategic" },
    { name: "Zukunftssicherheit", description: "Langfristige Relevanz", categoryId: "strategic" },
  ],
  service: [
    { name: "Preis", description: "Kosten der Dienstleistung", categoryId: "economic" },
    { name: "Qualität", description: "Servicequalität", categoryId: "quality" },
    { name: "Reaktionszeit", description: "Schnelligkeit der Reaktion", categoryId: "quality" },
    { name: "Zuverlässigkeit", description: "Konstanz und Termintreue", categoryId: "risk" },
    { name: "Flexibilität", description: "Anpassungsfähigkeit", categoryId: "strategic" },
  ],
  other: [
    { name: "Kosten", description: "Gesamtkosten der Option", categoryId: "economic" },
    { name: "Nutzen", description: "Erwarteter Mehrwert", categoryId: "quality" },
    { name: "Aufwand", description: "Benötigte Ressourcen", categoryId: "economic" },
    { name: "Risiko", description: "Potenzielle Nachteile", categoryId: "risk" },
    { name: "Strategischer Fit", description: "Passung zu langfristigen Zielen", categoryId: "strategic" },
  ],
};

// Domain labels for titles
const DOMAIN_LABELS: Record<AIDecisionInterpretation["domain"], string> = {
  vehicle: "Fahrzeugvergleich",
  software: "Softwarevergleich",
  supplier: "Lieferantenvergleich",
  machines: "Maschinenvergleich",
  investment: "Investitionsentscheidung",
  employee: "Kandidatenvergleich",
  personal: "Persönliche Entscheidung",
  technology: "Technologievergleich",
  service: "Dienstleistervergleich",
  other: "Entscheidung",
};

// Detect domain from input
function detectDomain(input: string): AIDecisionInterpretation["domain"] {
  const normalized = input.toLowerCase();
  
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

// Extract alternatives from comparison patterns
function extractAlternatives(input: string): { alt1: string; alt2: string } | null {
  const trimmed = input.trim();
  
  // First try all the comparison patterns
  for (const pattern of COMPARISON_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match && match[1] && match[2]) {
      // Clean up extracted alternatives
      let alt1 = match[1].trim();
      let alt2 = match[2].trim();
      
      // Remove common prefixes/suffixes
      alt1 = cleanAlternativeName(alt1);
      alt2 = cleanAlternativeName(alt2);
      
      if (alt1 && alt2 && alt1.length > 1 && alt2.length > 1) {
        return {
          alt1: capitalizeFirst(alt1),
          alt2: capitalizeFirst(alt2),
        };
      }
    }
  }
  return null;
}

// Clean up alternative names by removing common filler words
function cleanAlternativeName(name: string): string {
  return name
    .replace(/^(mein[e]?|dein[e]?|sein[e]?|ihr[e]?|unser[e]?|der|die|das|den|dem|ein[e]?|einem?)\s+/i, "")
    .replace(/\s+(von\s+.+)$/i, "") // Remove "von meiner oma" etc.
    .replace(/^(alte[nr]?|neue[nr]?)\s+/i, "") // Remove "alten" etc.
    .trim();
}

// Generate title based on input
function generateTitle(
  input: string,
  domain: AIDecisionInterpretation["domain"],
  alternatives: { alt1: string; alt2: string } | null
): string {
  // If we have clear alternatives, use them in the title
  if (alternatives) {
    return `${alternatives.alt1} vs. ${alternatives.alt2}`;
  }
  
  // Use the original input as title (cleaned up)
  const trimmed = input.trim();
  const cleaned = trimmed
    .replace(/[\?\.\!]+$/, "") // Remove trailing punctuation
    .replace(/^(welche[rns]?|was|soll ich|sollte ich|lieber)\s+/i, ""); // Remove question starters
  
  return capitalizeFirst(cleaned) || `Neue ${DOMAIN_LABELS[domain]}`;
}

// Generate description
function generateDescription(domain: AIDecisionInterpretation["domain"]): string {
  const descriptions: Record<AIDecisionInterpretation["domain"], string> = {
    vehicle: "Systematischer Vergleich von Fahrzeugoptionen",
    software: "Strukturierte Bewertung von Softwarelösungen",
    supplier: "Objektive Analyse von Lieferanten",
    machines: "Technischer und wirtschaftlicher Vergleich",
    investment: "Fundierte Investitionsentscheidung",
    employee: "Faire Kandidatenbewertung",
    personal: "Strukturierte Entscheidungshilfe",
    technology: "Technologievergleich",
    service: "Dienstleisterbewertung",
    other: "Systematische Entscheidungsanalyse",
  };
  return descriptions[domain];
}

/**
 * Main interpretation function - creates interpretation from any input
 * Respects the user's actual input instead of forcing preset categories
 */
export function interpretDecisionInput(input: string): AIDecisionInterpretation {
  const trimmed = input.trim();
  
  if (!trimmed || trimmed.length < 2) {
    return {
      title: "Neue Entscheidung",
      description: "Bitte beschreiben Sie Ihre Entscheidungsfrage.",
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
  
  const domain = detectDomain(trimmed);
  const extractedAlternatives = extractAlternatives(trimmed);
  
  // Build alternatives - capitalize first letter for proper grammar
  const alternatives = extractedAlternatives
    ? [
        { name: extractedAlternatives.alt1, description: null },
        { name: extractedAlternatives.alt2, description: null },
      ]
    : [
        { name: "Option A", description: null },
        { name: "Option B", description: null },
      ];
  
  const title = generateTitle(trimmed, domain, extractedAlternatives);
  const description = generateDescription(domain);
  const criteria = DOMAIN_CRITERIA[domain];
  
  // Determine confidence
  const confidence: "high" | "medium" | "low" = 
    extractedAlternatives && domain !== "other" ? "high" :
    extractedAlternatives || domain !== "other" ? "medium" : "low";
  
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
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 1000);
}
