/**
 * Smart Start: Interpretiert eine Freitext-Eingabe rein lokal (ohne KI-API,
 * ohne Netzwerk) und schlägt Vorlage, Titel und Alternativen vor.
 */

export type PresetId =
  | "supplier"
  | "software"
  | "investment"
  | "machines"
  | "vehicle"
  | "employee"
  | "realEstate"
  | "product"
  | "location"
  | "personal"
  | "custom";

export const PRESET_IDS: PresetId[] = [
  "supplier",
  "software",
  "investment",
  "machines",
  "vehicle",
  "employee",
  "realEstate",
  "product",
  "location",
  "personal",
];

export interface ParsedInput {
  presetId: PresetId;
  title: string;
  alternatives: string[];
  confidence: "high" | "medium" | "low";
}

const KEYWORDS: Record<Exclude<PresetId, "custom">, string[]> = {
  vehicle: [
    "fahrzeug", "auto", "wagen", "pkw", "lieferwagen", "transporter", "lkw", "firmenwagen", "dienstwagen",
    "elektroauto", "e-auto", "verbrenner", "hybrid", "motorrad", "roller", "fuhrpark", "leasing", "leasen",
    "vehicle", "car", "truck", "van", "voiture", "véhicule", "auto", "macchina", "veicolo", "camion",
    "bmw", "audi", "mercedes", "vw", "volkswagen", "ford", "toyota", "tesla", "skoda", "seat", "porsche", "volvo",
    "hyundai", "kia", "honda", "renault", "peugeot", "fiat", "dacia", "mazda", "subaru", "nissan",
  ],
  software: [
    "software", "programm", "app", "anwendung", "plattform", "tool", "crm", "erp", "cms", "saas", "cloud",
    "buchhaltungssoftware", "projektmanagement", "ticketsystem", "salesforce", "hubspot", "sap", "microsoft 365",
    "google workspace", "slack", "notion", "jira", "asana", "trello", "logiciel", "application", "applicazione",
    "bexio", "abacus", "sage", "odoo", "zoho", "pipedrive", "shopify", "wordpress", "framework", "datenbank",
    "hosting", "server", "it-lösung", "it-loesung",
  ],
  supplier: [
    "lieferant", "lieferanten", "zulieferer", "anbieter", "hersteller", "dienstleister", "partner", "agentur",
    "verpackung", "logistik", "spedition", "supplier", "vendor", "provider", "fournisseur", "fornitore",
    "offerte", "angebot", "ausschreibung", "submission", "outsourcing",
  ],
  machines: [
    "maschine", "maschinen", "anlage", "anlagen", "gerät", "geräte", "geraet", "equipment", "fertigung",
    "produktion", "automatisierung", "roboter", "cnc", "fräse", "fraese", "drehmaschine", "drucker", "3d-drucker",
    "machine", "macchina", "machinery", "kompressor", "bagger", "traktor", "stapler",
  ],
  investment: [
    "investition", "investieren", "investment", "kapital", "finanzierung", "rendite", "roi", "projekt",
    "kaufen oder mieten", "mieten oder kaufen", "expansion", "erweiterung", "anlagestrategie", "aktien", "fonds",
    "investissement", "investimento", "budget", "portfolio",
  ],
  employee: [
    "mitarbeiter", "mitarbeiterin", "mitarbeitende", "kandidat", "kandidatin", "kandidaten", "bewerber",
    "bewerberin", "bewerbung", "personal", "stelle", "position", "einstellen", "einstellung", "rekrutierung",
    "recruiting", "candidate", "hire", "hiring", "candidat", "candidato", "team", "nachfolge",
  ],
  realEstate: [
    "immobilie", "immobilien", "wohnung", "haus", "büro", "buero", "bürofläche", "liegenschaft", "grundstück",
    "grundstueck", "miete", "mietwohnung", "kaufen", "eigentum", "eigenheim", "real estate", "apartment", "house",
    "office", "appartement", "maison", "appartamento", "casa", "loft", "gewerbefläche",
  ],
  product: [
    "produkt", "produkte", "modell", "variante", "laptop", "notebook", "handy", "smartphone", "iphone", "samsung",
    "pixel", "tablet", "ipad", "kamera", "fernseher", "tv", "kopfhörer", "kopfhoerer", "monitor", "mac", "pc",
    "product", "produit", "prodotto", "gerät kaufen", "kaufentscheid", "velo", "fahrrad", "e-bike", "bike",
  ],
  location: [
    "standort", "standorte", "ort", "stadt", "region", "niederlassung", "filiale", "lager", "sitz", "location",
    "site", "emplacement", "sede", "umzug", "zürich", "bern", "basel", "genf", "lausanne", "luzern", "wien",
    "berlin", "münchen", "muenchen", "hamburg", "land", "kanton", "gemeinde",
  ],
  personal: [
    "persönlich", "persoenlich", "privat", "familie", "haushalt", "ferien", "urlaub", "reise", "hobby", "freizeit",
    "haustier", "katze", "hund", "studium", "ausbildung", "weiterbildung", "schule", "universität", "uni", "job",
    "karriere", "jobangebot", "stellenangebot", "umziehen", "hochzeit", "heiraten", "beruf", "lehre",
  ],
};

const SPLIT_PATTERNS: RegExp[] = [
  // "Welches CRM: HubSpot, Pipedrive oder Salesforce?" → Teil nach dem Doppelpunkt
  /^[^:]{2,80}:\s*(.+)$/,
  /\b(?:zwischen|between|entre|tra|fra)\s+(.+)$/i,
  /^(?:soll(?:te)?\s+ich|sollen\s+wir|should\s+(?:i|we)|dois-je|devrais-je|dovrei|welche[rsn]?|which|quel(?:le)?|quale)\s+(.+)$/i,
];

const CONNECTOR = /\s*(?:,|;|\/|\boder\b|\bor\b|\bou\b|\boppure\b|\bo\b|\bvs\.?\b|\bversus\b|\bund\b|\band\b|\bet\b|\be\b|&)\s*/i;

const NOISE_PREFIX =
  /^(?:soll(?:te)?\s+ich|sollen\s+wir|ich\s+(?:möchte|moechte|will|muss|soll)|wir\s+(?:möchten|moechten|wollen|müssen|muessen|sollen)|should\s+(?:i|we)|i\s+(?:want|need)\s+to|we\s+(?:want|need)\s+to|entscheiden|entscheidung|wählen|waehlen|auswählen|auswaehlen|vergleich(?:en)?|vergleiche|compare|comparer|confrontare|choose|choisir|scegliere|lieber|eher|besser|welche[rsn]?|which|quel(?:le)?|quale|zwischen|between|entre|tra|fra|das|der|die|den|dem|ein|eine|einen|the|a|an|le|la|les|un|une|il|lo|gli|uno|una)\s+/i;

const NOISE_SUFFIX =
  /\s+(?:kaufen|nehmen|wählen|waehlen|auswählen|auswaehlen|anschaffen|beschaffen|einstellen|einführen|einfuehren|mieten|leasen|buy|choose|pick|take|select|hire|acheter|choisir|prendre|comprare|scegliere|ist\s+besser|is\s+better|wäre\s+besser|waere\s+besser|passt\s+besser|lohnt\s+sich(?:\s+mehr)?|soll\s+ich\s+nehmen|sollen\s+wir\s+nehmen)\s*[?.!]*$/i;

function clean(s: string): string {
  let out = s.trim().replace(/[?.!]+$/g, "").trim();
  for (let i = 0; i < 3; i++) {
    out = out.replace(NOISE_PREFIX, "").trim();
    out = out.replace(NOISE_SUFFIX, "").trim();
  }
  return out;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function detectPreset(text: string): { presetId: PresetId; score: number } {
  const lower = ` ${text.toLowerCase()} `;
  let best: PresetId = "custom";
  let bestScore = 0;
  for (const [preset, words] of Object.entries(KEYWORDS) as [Exclude<PresetId, "custom">, string[]][]) {
    let score = 0;
    for (const w of words) {
      if (lower.includes(` ${w} `) || lower.includes(` ${w}s `) || lower.includes(` ${w}n `) || lower.includes(` ${w}, `)) {
        score += w.length > 5 ? 2 : 1;
      } else if (w.length >= 6 && lower.includes(w)) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = preset;
    }
  }
  return { presetId: best, score: bestScore };
}

export function extractAlternatives(text: string): string[] {
  let candidate = text.trim();
  for (const p of SPLIT_PATTERNS) {
    const m = p.exec(candidate);
    if (m) {
      candidate = m[1];
      break;
    }
  }
  const parts = candidate
    .split(CONNECTOR)
    .map(clean)
    .map(cap)
    .filter((p) => p.length >= 2 && p.length <= 60);
  // Duplikate entfernen
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of parts) {
    const k = p.toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      out.push(p);
    }
  }
  return out.length >= 2 ? out.slice(0, 8) : [];
}

export function parseInput(raw: string): ParsedInput {
  const text = raw.replace(/\s+/g, " ").trim().slice(0, 500);
  const { presetId, score } = detectPreset(text);
  const alternatives = extractAlternatives(text);
  const title = cap(text.replace(/[.!]+$/, "")) || "";
  let confidence: ParsedInput["confidence"] = "low";
  if (alternatives.length >= 2 && score >= 2) confidence = "high";
  else if (alternatives.length >= 2 || score >= 2) confidence = "medium";
  return { presetId, title, alternatives, confidence };
}
