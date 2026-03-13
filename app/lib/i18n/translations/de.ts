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
    add: "Hinzufügen",
    remove: "Entfernen",
    ignore: "Ignorieren",
    useTemplate: "Vorlage nutzen",
    examples: "Beispiele",
    optional: "optional",
  },
  
  // Analysis Steps
  steps: {
    step: "Schritt",
    result: "Ergebnis",
    decision: "Entscheidung",
    alternatives: "Alternativen",
    criteria: "Kriterien",
    weighting: "Gewichtung",
    evaluation: "Bewertung",
    results: "Ergebnis",
  },
  
  // Analysis Wizard
  wizard: {
    resetAnalysis: "Analyse zurücksetzen?",
    resetConfirm: "Sind Sie sicher, dass Sie die Analyse zurücksetzen möchten? Alle eingegebenen Daten werden gelöscht.",
    reset: "Zurücksetzen",
    draftFound: "Es wurde ein gespeicherter Entwurf gefunden. Möchten Sie diesen wiederherstellen?",
    restore: "Wiederherstellen",
    discard: "Verwerfen",
  },
  
  // Decision Setup (Step 1)
  decisionSetup: {
    title: "Entscheidung definieren",
    titleBusiness: "Strategische Entscheidungsfrage",
    description: "Was möchten Sie entscheiden?",
    descriptionAdvanced: "Definieren Sie die Entscheidung und relevante Randbedingungen.",
    descriptionBusiness: "Formulieren Sie die strategische Fragestellung für eine auditfähige Dokumentation.",
    decisionTitle: "Entscheidungstitel",
    strategicQuestion: "Strategische Fragestellung",
    placeholderBasic: "z.B. Welchen Lieferanten soll ich wählen?",
    placeholderBusiness: "z.B. Welcher strategische Partner für die Marktexpansion?",
    descriptionLabel: "Beschreibung / Kontext",
    constraintsLabel: "Randbedingungen & Einschränkungen",
    documentationStandard: "Dokumentationsstandard",
    documentationInfo: "Alle Eingaben werden vollständig dokumentiert und können später für Revisionen, Gremienentscheide oder Compliance-Nachweise verwendet werden.",
    validationError: "Bitte geben Sie einen Titel für die Entscheidung ein.",
  },
  
  // Alternatives (Step 2)
  alternativesSetup: {
    title: "Alternativen definieren",
    description: "Welche Optionen stehen zur Auswahl?",
    descriptionAdvanced: "Sie können auch Annahmen zu jeder Alternative dokumentieren.",
    placeholder: "Name der Alternative...",
    shortDescription: "Kurze Beschreibung (optional)...",
    assumptions: "Annahmen & Voraussetzungen",
    assumptionsPlaceholder: "Eine Annahme pro Zeile...",
    maxReached: "Maximum erreicht",
  },
  
  // Criteria (Step 3)
  criteriaSetup: {
    title: "Kriterien festlegen",
    description: "Definieren Sie die Kriterien, nach denen Sie die Alternativen bewerten möchten.",
    descriptionAdvanced: "Legen Sie Kriterien fest und ordnen Sie diese bei Bedarf Kategorien zu.",
    placeholder: "Name des Kriteriums...",
    selectCategory: "Kategorie wählen...",
    noCategory: "Keine Kategorie",
    templateAvailable: "Vorlage verfügbar",
    templateCriteria: "vordefinierte Kriterien für diesen Anwendungsfall",
    knockout: "K.O.-Kriterium",
    knockoutThreshold: "Min. Schwellenwert",
    description_label: "Beschreibung",
    descriptionPlaceholder: "Beschreibung (optional)...",
    uncategorized: "Nicht kategorisiert",
  },
  
  // Weighting (Step 4)
  weightingSetup: {
    title: "Kriterien gewichten",
    description: "Bestimmen Sie die relative Wichtigkeit der Kriterien.",
    methods: {
      simple: "Einfache Gewichtung",
      simpleDesc: "1-5 Punkte pro Kriterium",
      percentage: "Prozentuale Gewichtung",
      percentageDesc: "Verteilung auf 100%",
      ahpLight: "Einfache AHP",
      ahpLightDesc: "Paarweise Vergleiche",
      ahpFull: "Vollständige AHP",
      ahpFullDesc: "Mit Konsistenzprüfung",
    },
    validation: {
      percentage: "Die Summe der Gewichtungen sollte 100% betragen.",
      general: "Bitte vergeben Sie Gewichtungen für alle Kriterien.",
    },
    total: "Gesamt",
    remaining: "Verbleibend",
    consistency: "Konsistenz",
    consistencyOk: "Konsistenz OK",
    consistencyWarning: "Inkonsistente Bewertungen",
    compare: "Vergleich",
    vs: "vs.",
    equalImportance: "Gleich wichtig",
    moreImportant: "wichtiger",
    lessImportant: "weniger wichtig",
  },
  
  // Evaluation (Step 5)
  evaluationSetup: {
    title: "Alternativen bewerten",
    description: "Bewerten Sie jede Alternative für jedes Kriterium auf einer Skala von 1 bis 10.",
    evaluator: "Bewerter",
    progress: "Bewertungsfortschritt",
    weight: "Gewicht",
    min: "Min",
    knockout: "K.O.",
    scale: {
      1: "Sehr schlecht",
      2: "Schlecht",
      3: "Unterdurchschnittlich",
      4: "Leicht unterdurchschnittlich",
      5: "Durchschnittlich",
      6: "Leicht überdurchschnittlich",
      7: "Überdurchschnittlich",
      8: "Gut",
      9: "Sehr gut",
      10: "Ausgezeichnet",
    },
  },
  
  // Results (Step 6)
  resultsView: {
    title: "Analyse-Ergebnis & Entscheidungsempfehlung",
    recommendation: "Empfehlung",
    noRecommendation: "Keine klare Empfehlung",
    confidence: "Konfidenz",
    confidenceHigh: "Hoch",
    confidenceMedium: "Mittel",
    confidenceLow: "Niedrig",
    ranking: "Ranking",
    score: "Score",
    normalized: "Normalisiert",
    knockoutExcluded: "Ausgeschlossen (K.O.)",
    sensitivity: "Sensitivitätsanalyse",
    sensitivityDesc: "Zeigt, wie empfindlich das Ranking auf Änderungen der Gewichtung reagiert.",
    impact: "Einfluss auf Ranking",
    impactHigh: "Hoch",
    impactMedium: "Mittel",
    impactLow: "Niedrig",
    detailedAnalysis: "Detailanalyse",
    perCriterion: "Pro Kriterium",
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
  
  // Report / PDF Export
  report: {
    exportPDF: "Export PDF",
    generating: "Generiere...",
    title: "Nutzwertanalyse",
    recommendation: "Empfehlung",
    recommendedAlternative: "Empfohlene Alternative",
    ranking: "Ranking",
    rank: "Rang",
    alternative: "Alternative",
    score: "Score",
    normalized: "Normalisiert",
    sensitivity: "Sensitivität",
    sensitivityAnalysis: "Sensitivitätsanalyse",
    criterion: "Kriterium",
    weight: "Gewicht",
    impact: "Einfluss",
    confidence: "Konfidenz",
    high: "Hoch",
    medium: "Mittel",
    low: "Niedrig",
    detailedAnalysis: "Detailanalyse",
    methodology: "Methodik",
    methodologyNotes: "Diese Analyse wurde mit der Nutzwertanalyse-Methode durchgeführt.",
    auditTrail: "Audit-Trail",
    riskAssessment: "Risikobewertung",
    knockoutCriteria: "K.O.-Kriterien",
    excluded: "Ausgeschlossen",
    consistencyCheck: "Konsistenzprüfung",
    consistencyPassed: "Konsistenz OK",
    consistencyFailed: "Inkonsistenzen erkannt",
    generatedBy: "Erstellt mit Nutzwertanalyse.tool",
    generatedOn: "Erstellt am",
    options: {
      title: "Report-Optionen",
      executiveSummary: "Zusammenfassung",
      detailedAnalysis: "Detailanalyse",
      sensitivityAnalysis: "Sensitivitätsanalyse",
      riskAssessment: "Risikobewertung",
      auditTrail: "Audit-Trail",
      methodologyNotes: "Methodik-Hinweise",
    },
  },
  
  // Info Buttons
  info: {
    close: "Schließen",
    learnMore: "Mehr erfahren",
    tip: "Tipp",
    example: "Beispiel",
    why: "Warum?",
  },
  
  // Language
  language: {
    switchLanguage: "Sprache wechseln",
    currentLanguage: "Aktuelle Sprache",
  },
  
  // Categories
  categories: {
    economic: "Wirtschaftlichkeit",
    quality: "Qualität",
    strategic: "Strategie",
    risk: "Risiko",
    other: "Sonstige",
  },
  
  // Errors & Validation
  errors: {
    required: "Dieses Feld ist erforderlich.",
    minLength: "Mindestens {min} Zeichen erforderlich.",
    maxLength: "Maximal {max} Zeichen erlaubt.",
    invalidEmail: "Ungültige E-Mail-Adresse.",
    loadingFailed: "Laden fehlgeschlagen. Bitte versuchen Sie es erneut.",
    saveFailed: "Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.",
    exportFailed: "Export fehlgeschlagen. Bitte versuchen Sie es erneut.",
  },
} as const;

export type Translations = typeof de;
