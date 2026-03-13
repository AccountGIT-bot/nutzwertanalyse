import { CriteriaTemplate, CriteriaCategory } from "./types";

export const DEFAULT_CATEGORIES: CriteriaCategory[] = [
  { id: "economic", name: "Wirtschaftlichkeit", description: "Kosten- und finanzbezogene Kriterien", order: 1 },
  { id: "quality", name: "Qualität", description: "Qualitäts- und Leistungskriterien", order: 2 },
  { id: "strategic", name: "Strategie", description: "Strategische und langfristige Kriterien", order: 3 },
  { id: "risk", name: "Risiko", description: "Risiko- und Sicherheitskriterien", order: 4 },
  { id: "other", name: "Sonstige", description: "Weitere Kriterien", order: 5 },
];

// Default alternatives for each preset
export const DEFAULT_ALTERNATIVES: Record<string, { name: string; description?: string }[]> = {
  supplier: [
    { name: "Lieferant A", description: "Aktueller Hauptlieferant" },
    { name: "Lieferant B", description: "Neuer Anbieter" },
    { name: "Lieferant C", description: "Alternativer Anbieter" },
  ],
  software: [
    { name: "Software A", description: "Marktführer-Lösung" },
    { name: "Software B", description: "Alternative Lösung" },
    { name: "Eigenentwicklung", description: "Inhouse-Entwicklung" },
  ],
  investment: [
    { name: "Investition A", description: "Hauptoption" },
    { name: "Investition B", description: "Alternative" },
    { name: "Status Quo", description: "Keine Investition" },
  ],
  machines: [
    { name: "Maschine A", description: "Premiummodell" },
    { name: "Maschine B", description: "Standardmodell" },
    { name: "Gebrauchtmaschine", description: "Gebraucht kaufen" },
  ],
  vehicle: [
    { name: "Fahrzeug A", description: "Option 1" },
    { name: "Fahrzeug B", description: "Option 2" },
    { name: "Leasing", description: "Leasing statt Kauf" },
  ],
  employee: [
    { name: "Kandidat A", description: "Erster Bewerber" },
    { name: "Kandidat B", description: "Zweiter Bewerber" },
    { name: "Kandidat C", description: "Dritter Bewerber" },
  ],
};

export const CRITERIA_TEMPLATES: CriteriaTemplate[] = [
  {
    id: "supplier",
    name: "Lieferantenauswahl",
    presetId: "supplier",
    criteria: [
      { name: "Preis/Kosten", description: "Gesamtkosten inkl. Nebenkosten", categoryId: "economic" },
      { name: "Qualität", description: "Produkt-/Dienstleistungsqualität", categoryId: "quality" },
      { name: "Lieferzeit", description: "Durchschnittliche Lieferzeit", categoryId: "quality" },
      { name: "Zuverlässigkeit", description: "Termintreue und Verfügbarkeit", categoryId: "quality" },
      { name: "Flexibilität", description: "Anpassungsfähigkeit bei Änderungen", categoryId: "strategic" },
      { name: "Service & Support", description: "After-Sales Support", categoryId: "quality" },
      { name: "Referenzen", description: "Erfahrung und Reputation", categoryId: "strategic" },
      { name: "Finanzielle Stabilität", description: "Bonität und Unternehmensgröße", categoryId: "risk" },
    ],
  },
  {
    id: "software",
    name: "Softwarevergleich",
    presetId: "software",
    criteria: [
      { name: "Funktionsumfang", description: "Abdeckung der Anforderungen", categoryId: "quality" },
      { name: "Benutzerfreundlichkeit", description: "UX und Erlernbarkeit", categoryId: "quality" },
      { name: "Lizenzkosten", description: "Einmalige und laufende Kosten", categoryId: "economic" },
      { name: "Implementierungsaufwand", description: "Zeit und Ressourcen für Einführung", categoryId: "economic" },
      { name: "Integration", description: "Anbindung an bestehende Systeme", categoryId: "strategic" },
      { name: "Support & Updates", description: "Herstellersupport und Weiterentwicklung", categoryId: "quality" },
      { name: "Skalierbarkeit", description: "Wachstumsfähigkeit der Lösung", categoryId: "strategic" },
      { name: "Datensicherheit", description: "Sicherheitsstandards und Compliance", categoryId: "risk" },
    ],
  },
  {
    id: "investment",
    name: "Investitionsentscheid",
    presetId: "investment",
    criteria: [
      { name: "ROI", description: "Return on Investment", categoryId: "economic" },
      { name: "Amortisationszeit", description: "Zeitraum bis zur Kostendeckung", categoryId: "economic" },
      { name: "Strategische Relevanz", description: "Beitrag zur Unternehmensstrategie", categoryId: "strategic" },
      { name: "Marktpotenzial", description: "Wachstums- und Umsatzpotenzial", categoryId: "strategic" },
      { name: "Technologierisiko", description: "Risiko technischer Veralterung", categoryId: "risk" },
      { name: "Wettbewerbsvorteil", description: "Differenzierung im Markt", categoryId: "strategic" },
      { name: "Ressourcenbedarf", description: "Personal und Infrastruktur", categoryId: "economic" },
      { name: "Umsetzungsrisiko", description: "Komplexität der Implementierung", categoryId: "risk" },
    ],
  },
  {
    id: "machines",
    name: "Maschinenkauf",
    presetId: "machines",
    criteria: [
      { name: "Anschaffungskosten", description: "Kaufpreis inkl. Nebenkosten", categoryId: "economic" },
      { name: "Betriebskosten", description: "Laufende Kosten (Energie, Wartung)", categoryId: "economic" },
      { name: "Leistung/Kapazität", description: "Produktionskapazität", categoryId: "quality" },
      { name: "Qualität der Produktion", description: "Präzision und Ausschussrate", categoryId: "quality" },
      { name: "Verfügbarkeit/Lieferzeit", description: "Lieferfähigkeit und -zeit", categoryId: "quality" },
      { name: "Wartungsfreundlichkeit", description: "Serviceintervalle und Ersatzteile", categoryId: "quality" },
      { name: "Zukunftssicherheit", description: "Erweiterbarkeit und Updates", categoryId: "strategic" },
      { name: "Sicherheitsstandards", description: "Arbeitsschutz und Zertifizierungen", categoryId: "risk" },
    ],
  },
  {
    id: "vehicle",
    name: "Fahrzeuganschaffung",
    presetId: "vehicle",
    criteria: [
      { name: "Anschaffungspreis", description: "Kaufpreis oder Leasingrate", categoryId: "economic" },
      { name: "Betriebskosten", description: "Kraftstoff, Versicherung, Steuern", categoryId: "economic" },
      { name: "Nutzwert", description: "Passend für Einsatzzweck", categoryId: "quality" },
      { name: "Zuverlässigkeit", description: "Pannenstatistik und Qualität", categoryId: "quality" },
      { name: "Wiederverkaufswert", description: "Wertstabilität", categoryId: "economic" },
      { name: "Umweltfreundlichkeit", description: "Emissionen und Nachhaltigkeit", categoryId: "strategic" },
      { name: "Komfort & Ausstattung", description: "Fahrkomfort und Features", categoryId: "quality" },
      { name: "Service & Garantie", description: "Werkstattnetz und Garantieleistungen", categoryId: "quality" },
    ],
  },
  {
    id: "employee",
    name: "Mitarbeiterwahl",
    presetId: "employee",
    criteria: [
      { name: "Fachkompetenz", description: "Qualifikation und Erfahrung", categoryId: "quality" },
      { name: "Soft Skills", description: "Kommunikation und Teamfähigkeit", categoryId: "quality" },
      { name: "Motivation", description: "Engagement und Eigeninitiative", categoryId: "quality" },
      { name: "Kulturelle Passung", description: "Fit mit Unternehmenskultur", categoryId: "strategic" },
      { name: "Entwicklungspotenzial", description: "Lernbereitschaft und Wachstum", categoryId: "strategic" },
      { name: "Gehaltsvorstellung", description: "Budget-Kompatibilität", categoryId: "economic" },
      { name: "Verfügbarkeit", description: "Eintrittstermin", categoryId: "quality" },
      { name: "Referenzen", description: "Bisherige Arbeitszeugnisse", categoryId: "quality" },
    ],
  },
];

export function getTemplateByPreset(presetId: string): CriteriaTemplate | undefined {
  return CRITERIA_TEMPLATES.find((t) => t.presetId === presetId);
}

export function getDefaultTemplate(): CriteriaTemplate {
  return {
    id: "custom",
    name: "Eigene Kriterien",
    presetId: "custom",
    criteria: [
      { name: "Kriterium 1", description: "Beschreibung hinzufügen", categoryId: "other" },
      { name: "Kriterium 2", description: "Beschreibung hinzufügen", categoryId: "other" },
      { name: "Kriterium 3", description: "Beschreibung hinzufügen", categoryId: "other" },
    ],
  };
}
