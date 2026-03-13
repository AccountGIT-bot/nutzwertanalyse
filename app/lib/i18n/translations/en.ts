export const en = {
  // Meta
  meta: {
    title: "Utility Analysis Tool",
    description: "Make structured decisions – with utility analysis. Define criteria, weight, evaluate, and document.",
  },
  
  // Construction Banner
  constructionBanner: {
    text: "This website is under construction – some features are still in development",
  },
  
  // Landing Page
  landing: {
    headline: {
      part1: "Decisions.",
      part2: "Structured.",
      part3: "Justified.",
    },
    description: "Describe your decision in your own words. Our AI analyzes your text and automatically creates matching alternatives and evaluation criteria – no template needed, works with any topic.",
    searchPlaceholder: "Describe your decision...",
    searchHint: "Start immediately – AI analyzes and structures your input automatically",
    orChooseTemplate: "Or choose a template",
    footer: {
      principles: "Principles",
      principlesText: "Transparency, fairness, traceability – clear criteria instead of gut feeling.",
      framework: "Framework",
      frameworkText: "Criteria – Weighting – Evaluation – Sensitivity – documented & comparable.",
      legal: "Legal",
      imprint: "Imprint",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
    },
  },
  
  // Presets
  presets: {
    supplier: {
      label: "Supplier Selection",
      hint: "Compare partners objectively",
    },
    software: {
      label: "Software Comparison",
      hint: "Evaluate tools systematically",
    },
    investment: {
      label: "Investment Decision",
      hint: "Weigh returns & risks",
    },
    machines: {
      label: "Machine Purchase",
      hint: "Performance & efficiency",
    },
    vehicle: {
      label: "Vehicle Acquisition",
      hint: "Optimize costs & benefits",
    },
    employee: {
      label: "Employee Selection",
      hint: "Compare candidates fairly",
    },
  },
  
  // Common
  common: {
    back: "Back",
    next: "Next",
    cancel: "Cancel",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    close: "Close",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    yes: "Yes",
    no: "No",
    or: "or",
    and: "and",
    add: "Add",
    remove: "Remove",
    ignore: "Ignore",
    useTemplate: "Use template",
    examples: "Examples",
    optional: "optional",
  },
  
  // Analysis Steps
  steps: {
    step: "Step",
    result: "Result",
    decision: "Decision",
    alternatives: "Alternatives",
    criteria: "Criteria",
    weighting: "Weighting",
    evaluation: "Evaluation",
    results: "Results",
  },
  
  // Analysis Wizard
  wizard: {
    resetAnalysis: "Reset analysis?",
    resetConfirm: "Are you sure you want to reset the analysis? All entered data will be deleted.",
    reset: "Reset",
    draftFound: "A saved draft was found. Would you like to restore it?",
    restore: "Restore",
    discard: "Discard",
  },
  
  // Decision Setup (Step 1)
  decisionSetup: {
    title: "Define Decision",
    titleBusiness: "Strategic Decision Question",
    description: "What do you want to decide?",
    descriptionAdvanced: "Define the decision and relevant constraints.",
    descriptionBusiness: "Formulate the strategic question for audit-ready documentation.",
    decisionTitle: "Decision Title",
    strategicQuestion: "Strategic Question",
    placeholderBasic: "e.g. Which supplier should I choose?",
    placeholderBusiness: "e.g. Which strategic partner for market expansion?",
    descriptionLabel: "Description / Context",
    constraintsLabel: "Constraints & Limitations",
    documentationStandard: "Documentation Standard",
    documentationInfo: "All inputs are fully documented and can be used later for revisions, committee decisions, or compliance evidence.",
    validationError: "Please enter a title for the decision.",
  },
  
  // Alternatives (Step 2)
  alternativesSetup: {
    title: "Define Alternatives",
    description: "What options are available?",
    descriptionAdvanced: "You can also document assumptions for each alternative.",
    placeholder: "Alternative name...",
    shortDescription: "Short description (optional)...",
    assumptions: "Assumptions & Prerequisites",
    assumptionsPlaceholder: "One assumption per line...",
    maxReached: "Maximum reached",
  },
  
  // Criteria (Step 3)
  criteriaSetup: {
    title: "Define Criteria",
    description: "Define the criteria by which you want to evaluate the alternatives.",
    descriptionAdvanced: "Define criteria and assign them to categories if needed.",
    placeholder: "Criterion name...",
    selectCategory: "Select category...",
    noCategory: "No category",
    templateAvailable: "Template available",
    templateCriteria: "predefined criteria for this use case",
    knockout: "Knockout criterion",
    knockoutThreshold: "Min. threshold",
    description_label: "Description",
    descriptionPlaceholder: "Description (optional)...",
    uncategorized: "Uncategorized",
  },
  
  // Weighting (Step 4)
  weightingSetup: {
    title: "Weight Criteria",
    description: "Determine the relative importance of the criteria.",
    methods: {
      simple: "Simple Weighting",
      simpleDesc: "1-5 points per criterion",
      percentage: "Percentage Weighting",
      percentageDesc: "Distribute to 100%",
      ahpLight: "Simple AHP",
      ahpLightDesc: "Pairwise comparisons",
      ahpFull: "Full AHP",
      ahpFullDesc: "With consistency check",
    },
    validation: {
      percentage: "The sum of weightings should be 100%.",
      general: "Please assign weights to all criteria.",
    },
    total: "Total",
    remaining: "Remaining",
    consistency: "Consistency",
    consistencyOk: "Consistency OK",
    consistencyWarning: "Inconsistent ratings",
    compare: "Compare",
    vs: "vs.",
    equalImportance: "Equally important",
    moreImportant: "more important",
    lessImportant: "less important",
  },
  
  // Evaluation (Step 5)
  evaluationSetup: {
    title: "Evaluate Alternatives",
    description: "Rate each alternative for each criterion on a scale of 1 to 10.",
    descriptionAdvanced: "and document your reasoning",
    evaluator: "Evaluator",
    progress: "Evaluation progress",
    weight: "Weight",
    min: "Min",
    knockout: "K.O.",
    knockoutFailed: "Knockout criteria not met",
    scale: "1 = very poor, 10 = excellent",
    validation: "Please rate all alternatives for all criteria.",
    legend: {
      notRated: "Not rated",
      rated: "Rated",
      knockoutFailed: "K.O. failed",
    },
  },
  
  // Results (Step 6)
  results: {
    title: "Analysis Results & Decision Recommendation",
    noResults: "No results available",
    completeSteps: "Please complete all previous steps.",
    recommendation: "Recommendation",
    noRecommendation: "No clear recommendation",
    confidence: "Confidence",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    ranking: "Ranking",
    normalized: "Normalized",
    riskScore: "Risk score",
    eliminated: "Eliminated (Knockout criteria)",
    notPassed: "Not passed",
    detailAnalysis: "Detailed analysis by criteria",
    criterion: "Criterion",
    totalScore: "Total score",
    sensitivityAnalysis: "Sensitivity Analysis",
    sensitivityDescription: "Shows how sensitive the ranking is to changes in weighting.",
    ahpConsistency: "AHP Consistency Check",
    consistencyRatio: "Consistency Ratio (CR)",
    exportReport: "Export Report",
    exportBasic: "Compact decision report",
    exportAdvanced: "Complete analysis report",
    exportBusiness: "Executive report with audit documentation",
  },

  // Results View (legacy compatibility)
  resultsView: {
    title: "Analysis Results & Decision Recommendation",
    recommendation: "Recommendation",
    noRecommendation: "No clear recommendation",
    confidence: "Confidence",
    confidenceHigh: "High",
    confidenceMedium: "Medium",
    confidenceLow: "Low",
    ranking: "Ranking",
    score: "Score",
    normalized: "Normalized",
    knockoutExcluded: "Excluded (K.O.)",
    sensitivity: "Sensitivity Analysis",
    sensitivityDesc: "Shows how sensitive the ranking is to changes in weighting.",
    impact: "Impact on ranking",
    impactHigh: "High",
    impactMedium: "Medium",
    impactLow: "Low",
    detailedAnalysis: "Detailed Analysis",
    perCriterion: "Per criterion",
  },
  
  // Decision Suggestion
  suggestion: {
    aiAnalysis: "AI Analysis",
    interpretedAs: "We interpreted your input as:",
    editTitle: "Edit title",
    alternatives: "Alternatives",
    criteria: "Criteria",
    lookingGood: "Looks good",
    startAnalysis: "Start analysis",
    customize: "Customize",
  },
  
  // Packages
  packages: {
    basic: "Basic",
    advanced: "Advanced",
    business: "Business",
    choosePackage: "Choose package",
    basicDesc: "Simple utility analysis for quick decisions",
    advancedDesc: "Extended analysis with categories and sensitivity",
    businessDesc: "Professional analysis for businesses with compliance",
  },
  
  // Report / PDF Export
  report: {
    exportPDF: "Export PDF",
    generating: "Generating...",
    title: "Utility Analysis",
    recommendation: "Recommendation",
    recommendedAlternative: "Recommended Alternative",
    ranking: "Ranking",
    rank: "Rank",
    alternative: "Alternative",
    score: "Score",
    normalized: "Normalized",
    sensitivity: "Sensitivity",
    sensitivityAnalysis: "Sensitivity Analysis",
    criterion: "Criterion",
    weight: "Weight",
    impact: "Impact",
    confidence: "Confidence",
    high: "High",
    medium: "Medium",
    low: "Low",
    detailedAnalysis: "Detailed Analysis",
    methodology: "Methodology",
    methodologyNotes: "This analysis was conducted using the utility analysis method.",
    auditTrail: "Audit Trail",
    riskAssessment: "Risk Assessment",
    knockoutCriteria: "Knockout Criteria",
    excluded: "Excluded",
    consistencyCheck: "Consistency Check",
    consistencyPassed: "Consistency OK",
    consistencyFailed: "Inconsistencies detected",
    generatedBy: "Generated with Utility Analysis Tool",
    generatedOn: "Generated on",
    options: {
      title: "Report Options",
      executiveSummary: "Executive Summary",
      detailedAnalysis: "Detailed Analysis",
      sensitivityAnalysis: "Sensitivity Analysis",
      riskAssessment: "Risk Assessment",
      auditTrail: "Audit Trail",
      methodologyNotes: "Methodology Notes",
    },
  },
  
  // Info Buttons
  info: {
    close: "Close",
    learnMore: "Learn more",
    tip: "Tip",
    example: "Example",
    why: "Why?",
  },
  
  // Language
  language: {
    switchLanguage: "Switch language",
    currentLanguage: "Current language",
  },
  
  // Categories
  categories: {
    economic: "Economic",
    quality: "Quality",
    strategic: "Strategic",
    risk: "Risk",
    other: "Other",
  },
  
  // Errors & Validation
  errors: {
    required: "This field is required.",
    minLength: "At least {min} characters required.",
    maxLength: "Maximum {max} characters allowed.",
    invalidEmail: "Invalid email address.",
    loadingFailed: "Loading failed. Please try again.",
    saveFailed: "Save failed. Please try again.",
    exportFailed: "Export failed. Please try again.",
  },
} as const;
