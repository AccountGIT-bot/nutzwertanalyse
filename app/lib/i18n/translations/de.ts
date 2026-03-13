export const de = {
  // Meta
  meta: {
    title: "Nutzwertanalyse.tool",
    description: "Entscheidungen strukturiert treffen – mit Nutzwertanalyse. Kriterien definieren, gewichten, bewerten und dokumentieren.",
  },
  
  // Construction Banner
  constructionBanner: {
    text: "Diese Website befindet sich noch im Aufbau – einige Funktionen sind in Entwicklung",
  },
  
  // Landing Page
  landing: {
    headline: {
      part1: "Entscheidungen.",
      part2: "Strukturiert.",
      part3: "Begründet.",
    },
    description: "Beschreibe deine Entscheidung in eigenen Worten. Unsere KI analysiert deinen Text und erstellt automatisch passende Alternativen und Bewertungskriterien – keine Vorlage nötig, funktioniert mit jedem Thema.",
    searchPlaceholder: "Beschreibe deine Entscheidung...",
    searchHint: "Sofort starten – KI analysiert und strukturiert deine Eingabe automatisch",
    orChooseTemplate: "Oder wähle eine Vorlage",
    footer: {
      principles: "Prinzipien",
      principlesText: "Transparenz, Fairness, Nachvollziehbarkeit – klare Kriterien statt Bauchgefühl.",
      framework: "Framework",
      frameworkText: "Kriterien – Gewichtung – Bewertung – Sensitivität – dokumentiert & vergleichbar.",
      legal: "Rechtliches",
      imprint: "Impressum",
      privacy: "Datenschutz",
      terms: "AGB",
    },
  },
  
  // Presets
  presets: {
    supplier: {
      label: "Lieferantenauswahl",
      hint: "Partner objektiv vergleichen",
    },
    software: {
      label: "Softwarevergleich",
      hint: "Tools systematisch bewerten",
    },
    investment: {
      label: "Investitionsentscheid",
      hint: "Rendite & Risiken abwägen",
    },
    machines: {
      label: "Maschinenkauf",
      hint: "Leistung & Wirtschaftlichkeit",
    },
    vehicle: {
      label: "Fahrzeuganschaffung",
      hint: "Kosten & Nutzen optimieren",
    },
    employee: {
      label: "Mitarbeiterwahl",
      hint: "Kandidaten fair vergleichen",
    },
  },
  
  // Common
  common: {
    back: "Zurück",
    next: "Weiter",
    cancel: "Abbrechen",
    save: "Speichern",
    delete: "Löschen",
    edit: "Bearbeiten",
    close: "Schließen",
    loading: "Lädt...",
    error: "Fehler",
    success: "Erfolgreich",
    yes: "Ja",
    no: "Nein",
    or: "oder",
    and: "und",
  },
  
  // Analysis Wizard
  wizard: {
    step1: "Schritt 1",
    step2: "Schritt 2",
    step3: "Schritt 3",
    step4: "Schritt 4",
    step5: "Schritt 5",
    step6: "Schritt 6",
    result: "Ergebnis",
    defineDecision: "Entscheidung definieren",
    strategicQuestion: "Strategische Entscheidungsfrage",
    defineAlternatives: "Alternativen definieren",
    defineCriteria: "Kriterien definieren",
    weightCriteria: "Kriterien gewichten",
    rateAlternatives: "Alternativen bewerten",
    analysisResult: "Analyse-Ergebnis & Entscheidungsempfehlung",
    resetAnalysis: "Analyse zurücksetzen?",
    resetConfirm: "Sind Sie sicher, dass Sie die Analyse zurücksetzen möchten? Alle eingegebenen Daten werden gelöscht.",
    reset: "Zurücksetzen",
    draftFound: "Es wurde ein gespeicherter Entwurf gefunden. Möchten Sie diesen wiederherstellen?",
    restore: "Wiederherstellen",
    discard: "Verwerfen",
  },
  
  // Decision Suggestion
  suggestion: {
    aiAnalysis: "KI-Analyse",
    interpretedAs: "Wir haben deine Eingabe interpretiert als:",
    editTitle: "Titel bearbeiten",
    alternatives: "Alternativen",
    criteria: "Kriterien",
    lookingGood: "Sieht gut aus",
    startAnalysis: "Analyse starten",
    customize: "Anpassen",
  },
  
  // Packages
  packages: {
    basic: "Basic",
    advanced: "Advanced",
    business: "Business",
    choosePackage: "Paket wählen",
    basicDesc: "Einfache Nutzwertanalyse für schnelle Entscheidungen",
    advancedDesc: "Erweiterte Analyse mit Kategorien und Sensitivität",
    businessDesc: "Professionelle Analyse für Unternehmen mit Compliance",
  },
  
  // Report
  report: {
    exportPDF: "Export PDF",
    generating: "Generiere...",
    recommendation: "Empfehlung",
    ranking: "Ranking",
    sensitivity: "Sensitivität",
    confidence: "Konfidenz",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
  },
  
  // Info Buttons
  info: {
    close: "Schließen",
  },
  
  // Language
  language: {
    switchLanguage: "Sprache wechseln",
    currentLanguage: "Aktuelle Sprache",
  },
} as const;

export type Translations = typeof de;
