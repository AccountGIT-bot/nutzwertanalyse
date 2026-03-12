"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import {
  AnalysisState,
  AnalysisStep,
  Alternative,
  Criterion,
  CriteriaCategory,
  Rating,
  Risk,
  Evaluator,
  AHPComparison,
  PackageLevel,
  WeightingMethod,
  DecisionContext,
  Scenario,
} from "./types";
import {
  generateId,
  calculateNwa,
  calculateSensitivity,
  applyAHPWeights,
  applySimpleWeights,
  applyPercentageWeights,
  calculateRiskAdjustedScores,
  checkKnockoutCriteria,
} from "./calculate";
import { getTemplateByPreset, DEFAULT_CATEGORIES, getDefaultTemplate } from "./templates";

// Initial state factory
function createInitialState(packageLevel: PackageLevel = "basic"): AnalysisState {
  return {
    decision: {
      id: generateId(),
      title: "",
      description: "",
      packageLevel,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    alternatives: [],
    categories: packageLevel === "basic" ? [] : [...DEFAULT_CATEGORIES],
    criteria: [],
    ratings: [],
    risks: [],
    evaluators: packageLevel === "business" ? [{ id: generateId(), name: "Hauptbewerter", weight: 1 }] : [],
    ahpComparisons: [],
    weightingMethod: packageLevel === "basic" ? "simple" : packageLevel === "advanced" ? "percentage" : "ahp-full",
    results: [],
    sensitivityResults: [],
    currentStep: "decision",
  };
}

// Action types
type Action =
  | { type: "SET_PACKAGE_LEVEL"; payload: PackageLevel }
  | { type: "SET_DECISION"; payload: Partial<DecisionContext> }
  | { type: "SET_PRESET"; payload: string }
  | { type: "ADD_ALTERNATIVE"; payload: Omit<Alternative, "id"> }
  | { type: "UPDATE_ALTERNATIVE"; payload: Alternative }
  | { type: "REMOVE_ALTERNATIVE"; payload: string }
  | { type: "ADD_CRITERION"; payload: Omit<Criterion, "id" | "weight"> }
  | { type: "UPDATE_CRITERION"; payload: Criterion }
  | { type: "REMOVE_CRITERION"; payload: string }
  | { type: "SET_CRITERIA_FROM_TEMPLATE"; payload: string }
  | { type: "ADD_CATEGORY"; payload: Omit<CriteriaCategory, "id"> }
  | { type: "UPDATE_CATEGORY"; payload: CriteriaCategory }
  | { type: "REMOVE_CATEGORY"; payload: string }
  | { type: "SET_RATING"; payload: Rating }
  | { type: "SET_RATINGS_BATCH"; payload: Rating[] }
  | { type: "SET_WEIGHTING_METHOD"; payload: WeightingMethod }
  | { type: "SET_AHP_COMPARISON"; payload: AHPComparison }
  | { type: "SET_AHP_COMPARISONS_BATCH"; payload: AHPComparison[] }
  | { type: "ADD_RISK"; payload: Omit<Risk, "id"> & { id?: string } }
  | { type: "UPDATE_RISK"; payload: Risk }
  | { type: "REMOVE_RISK"; payload: { alternativeId: string; description: string } }
  | { type: "ADD_EVALUATOR"; payload: Omit<Evaluator, "id"> }
  | { type: "UPDATE_EVALUATOR"; payload: Evaluator }
  | { type: "REMOVE_EVALUATOR"; payload: string }
  | { type: "ADD_SCENARIO"; payload: Omit<Scenario, "id"> }
  | { type: "UPDATE_SCENARIO"; payload: Scenario }
  | { type: "REMOVE_SCENARIO"; payload: string }
  | { type: "SET_STEP"; payload: AnalysisStep }
  | { type: "CALCULATE_RESULTS" }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; payload: AnalysisState };

// Reducer
function analysisReducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case "SET_PACKAGE_LEVEL": {
      const newState = createInitialState(action.payload);
      return {
        ...newState,
        decision: {
          ...newState.decision,
          title: state.decision.title,
          description: state.decision.description,
        },
      };
    }

    case "SET_DECISION":
      return {
        ...state,
        decision: {
          ...state.decision,
          ...action.payload,
          updatedAt: new Date(),
        },
      };

    case "SET_PRESET":
      return {
        ...state,
        decision: {
          ...state.decision,
          preset: action.payload,
          updatedAt: new Date(),
        },
      };

    case "ADD_ALTERNATIVE":
      return {
        ...state,
        alternatives: [
          ...state.alternatives,
          { ...action.payload, id: generateId() },
        ],
      };

    case "UPDATE_ALTERNATIVE":
      return {
        ...state,
        alternatives: state.alternatives.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "REMOVE_ALTERNATIVE":
      return {
        ...state,
        alternatives: state.alternatives.filter((a) => a.id !== action.payload),
        ratings: state.ratings.filter((r) => r.alternativeId !== action.payload),
        risks: state.risks.filter((r) => r.alternativeId !== action.payload),
      };

    case "ADD_CRITERION": {
      const newCriterion: Criterion = {
        ...action.payload,
        id: generateId(),
        weight: 0,
        rawWeight: action.payload.rawWeight ?? (state.decision.packageLevel === "basic" ? 3 : 10),
      };
      return {
        ...state,
        criteria: [...state.criteria, newCriterion],
      };
    }

    case "UPDATE_CRITERION":
      return {
        ...state,
        criteria: state.criteria.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case "REMOVE_CRITERION":
      return {
        ...state,
        criteria: state.criteria.filter((c) => c.id !== action.payload),
        ratings: state.ratings.filter((r) => r.criterionId !== action.payload),
        ahpComparisons: state.ahpComparisons.filter(
          (comp) => comp.criterionId1 !== action.payload && comp.criterionId2 !== action.payload
        ),
      };

    case "SET_CRITERIA_FROM_TEMPLATE": {
      const template = getTemplateByPreset(action.payload) || getDefaultTemplate();
      const defaultWeight = state.decision.packageLevel === "basic" ? 3 : 10;
      const newCriteria: Criterion[] = template.criteria.map((c) => ({
        ...c,
        id: generateId(),
        weight: 0,
        rawWeight: defaultWeight,
      }));
      return {
        ...state,
        criteria: newCriteria,
      };
    }

    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [
          ...state.categories,
          { ...action.payload, id: generateId() },
        ],
      };

    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };

    case "REMOVE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        criteria: state.criteria.map((c) =>
          c.categoryId === action.payload ? { ...c, categoryId: undefined } : c
        ),
      };

    case "SET_RATING": {
      const existingIndex = state.ratings.findIndex(
        (r) =>
          r.alternativeId === action.payload.alternativeId &&
          r.criterionId === action.payload.criterionId &&
          r.evaluatorId === action.payload.evaluatorId
      );
      if (existingIndex >= 0) {
        const newRatings = [...state.ratings];
        newRatings[existingIndex] = action.payload;
        return { ...state, ratings: newRatings };
      }
      return { ...state, ratings: [...state.ratings, action.payload] };
    }

    case "SET_RATINGS_BATCH":
      return { ...state, ratings: action.payload };

    case "SET_WEIGHTING_METHOD":
      return { ...state, weightingMethod: action.payload };

    case "SET_AHP_COMPARISON": {
      const existingIndex = state.ahpComparisons.findIndex(
        (c) =>
          (c.criterionId1 === action.payload.criterionId1 &&
            c.criterionId2 === action.payload.criterionId2) ||
          (c.criterionId1 === action.payload.criterionId2 &&
            c.criterionId2 === action.payload.criterionId1)
      );
      if (existingIndex >= 0) {
        const newComparisons = [...state.ahpComparisons];
        newComparisons[existingIndex] = action.payload;
        return { ...state, ahpComparisons: newComparisons };
      }
      return { ...state, ahpComparisons: [...state.ahpComparisons, action.payload] };
    }

    case "SET_AHP_COMPARISONS_BATCH":
      return { ...state, ahpComparisons: action.payload };

    case "ADD_RISK":
      return {
        ...state,
        risks: [...state.risks, { ...action.payload, id: action.payload.id || generateId() } as Risk],
      };

    case "UPDATE_RISK":
      return {
        ...state,
        risks: state.risks.map((r) =>
          r.alternativeId === action.payload.alternativeId &&
          r.description === action.payload.description
            ? action.payload
            : r
        ),
      };

    case "REMOVE_RISK":
      return {
        ...state,
        risks: state.risks.filter(
          (r) =>
            !(r.alternativeId === action.payload.alternativeId &&
              r.description === action.payload.description)
        ),
      };

    case "ADD_EVALUATOR":
      return {
        ...state,
        evaluators: [...state.evaluators, { ...action.payload, id: generateId() }],
      };

    case "UPDATE_EVALUATOR":
      return {
        ...state,
        evaluators: state.evaluators.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };

    case "REMOVE_EVALUATOR":
      return {
        ...state,
        evaluators: state.evaluators.filter((e) => e.id !== action.payload),
        ratings: state.ratings.filter((r) => r.evaluatorId !== action.payload),
      };

    case "ADD_SCENARIO":
      return {
        ...state,
        decision: {
          ...state.decision,
          scenarios: [...(state.decision.scenarios || []), { ...action.payload, id: generateId() }],
        },
      };

    case "UPDATE_SCENARIO":
      return {
        ...state,
        decision: {
          ...state.decision,
          scenarios: (state.decision.scenarios || []).map((s) =>
            s.id === action.payload.id ? action.payload : s
          ),
        },
      };

    case "REMOVE_SCENARIO":
      return {
        ...state,
        decision: {
          ...state.decision,
          scenarios: (state.decision.scenarios || []).filter((s) => s.id !== action.payload),
        },
        alternatives: state.alternatives.filter((a) => a.scenarioId !== action.payload),
      };

    case "SET_STEP":
      return { ...state, currentStep: action.payload };

    case "CALCULATE_RESULTS": {
      // Apply weights based on method
      let weightedCriteria = state.criteria;
      let ahpConsistency = state.ahpConsistency;

      switch (state.weightingMethod) {
        case "simple":
          weightedCriteria = applySimpleWeights(state.criteria);
          break;
        case "percentage":
          weightedCriteria = applyPercentageWeights(state.criteria);
          break;
        case "ahp-light":
        case "ahp-full":
          const ahpResult = applyAHPWeights(state.criteria, state.ahpComparisons);
          weightedCriteria = ahpResult.criteria;
          ahpConsistency = ahpResult.consistency;
          break;
      }

      // Calculate base results
      let results = calculateNwa(
        state.alternatives,
        weightedCriteria,
        state.ratings,
        state.evaluators.length > 0 ? state.evaluators : undefined
      );

      // Add risk scores if risks exist
      if (state.risks.length > 0) {
        results = calculateRiskAdjustedScores(results, state.risks);
      }

      // Calculate sensitivity
      const sensitivityResults = calculateSensitivity(
        state.alternatives,
        weightedCriteria,
        state.ratings,
        state.evaluators.length > 0 ? state.evaluators : undefined
      );

      return {
        ...state,
        criteria: weightedCriteria,
        results,
        sensitivityResults,
        ahpConsistency,
      };
    }

    case "RESET":
      return createInitialState(state.decision.packageLevel);

    case "LOAD_STATE":
      return action.payload;

    default:
      return state;
  }
}

// Context
interface AnalysisContextType {
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
  // Helper actions
  setPackageLevel: (level: PackageLevel) => void;
  setDecision: (decision: Partial<DecisionContext>) => void;
  addAlternative: (alt: Omit<Alternative, "id">) => void;
  updateAlternative: (alt: Alternative) => void;
  removeAlternative: (id: string) => void;
  addCriterion: (criterion: Omit<Criterion, "id" | "weight">) => void;
  updateCriterion: (criterion: Criterion) => void;
  removeCriterion: (id: string) => void;
  setCriteriaFromTemplate: (presetId: string) => void;
  setRating: (rating: Rating) => void;
  setWeightingMethod: (method: WeightingMethod) => void;
  setAHPComparison: (comparison: AHPComparison) => void;
  addRisk: (risk: Omit<Risk, "id"> & { id?: string }) => void;
  addEvaluator: (evaluator: Omit<Evaluator, "id">) => void;
  updateEvaluator: (evaluator: Evaluator) => void;
  removeEvaluator: (id: string) => void;
  setStep: (step: AnalysisStep) => void;
  calculateResults: () => void;
  reset: () => void;
  // Computed values
  canProceedToNext: boolean;
  knockoutFailures: { alternativeId: string; failedCriteria: string[] }[];
}

const AnalysisContext = createContext<AnalysisContextType | null>(null);

// Provider
export function AnalysisProvider({
  children,
  initialPackageLevel = "basic",
  initialDecision,
  initialPreset,
}: {
  children: ReactNode;
  initialPackageLevel?: PackageLevel;
  initialDecision?: string;
  initialPreset?: string;
}) {
  const [state, dispatch] = useReducer(analysisReducer, null, () => {
    const initialState = createInitialState(initialPackageLevel);
    if (initialDecision) {
      initialState.decision.title = initialDecision;
    }
    if (initialPreset) {
      initialState.decision.preset = initialPreset;
    }
    return initialState;
  });

  // Helper actions
  const setPackageLevel = useCallback((level: PackageLevel) => {
    dispatch({ type: "SET_PACKAGE_LEVEL", payload: level });
  }, []);

  const setDecision = useCallback((decision: Partial<DecisionContext>) => {
    dispatch({ type: "SET_DECISION", payload: decision });
  }, []);

  const addAlternative = useCallback((alt: Omit<Alternative, "id">) => {
    dispatch({ type: "ADD_ALTERNATIVE", payload: alt });
  }, []);

  const updateAlternative = useCallback((alt: Alternative) => {
    dispatch({ type: "UPDATE_ALTERNATIVE", payload: alt });
  }, []);

  const removeAlternative = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ALTERNATIVE", payload: id });
  }, []);

  const addCriterion = useCallback((criterion: Omit<Criterion, "id" | "weight">) => {
    dispatch({ type: "ADD_CRITERION", payload: criterion });
  }, []);

  const updateCriterion = useCallback((criterion: Criterion) => {
    dispatch({ type: "UPDATE_CRITERION", payload: criterion });
  }, []);

  const removeCriterion = useCallback((id: string) => {
    dispatch({ type: "REMOVE_CRITERION", payload: id });
  }, []);

  const setCriteriaFromTemplate = useCallback((presetId: string) => {
    dispatch({ type: "SET_CRITERIA_FROM_TEMPLATE", payload: presetId });
  }, []);

  const setRating = useCallback((rating: Rating) => {
    dispatch({ type: "SET_RATING", payload: rating });
  }, []);

  const setWeightingMethod = useCallback((method: WeightingMethod) => {
    dispatch({ type: "SET_WEIGHTING_METHOD", payload: method });
  }, []);

  const setAHPComparison = useCallback((comparison: AHPComparison) => {
    dispatch({ type: "SET_AHP_COMPARISON", payload: comparison });
  }, []);

  const addRisk = useCallback((risk: Omit<Risk, "id"> & { id?: string }) => {
    dispatch({ type: "ADD_RISK", payload: risk });
  }, []);

  const addEvaluator = useCallback((evaluator: Omit<Evaluator, "id">) => {
    dispatch({ type: "ADD_EVALUATOR", payload: evaluator });
  }, []);

  const updateEvaluator = useCallback((evaluator: Evaluator) => {
    dispatch({ type: "UPDATE_EVALUATOR", payload: evaluator });
  }, []);

  const removeEvaluator = useCallback((id: string) => {
    dispatch({ type: "REMOVE_EVALUATOR", payload: id });
  }, []);

  const setStep = useCallback((step: AnalysisStep) => {
    dispatch({ type: "SET_STEP", payload: step });
  }, []);

  const calculateResults = useCallback(() => {
    dispatch({ type: "CALCULATE_RESULTS" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // Computed values
  const canProceedToNext = useMemo(() => {
    const { currentStep, decision, alternatives, criteria, ratings } = state;
    
    switch (currentStep) {
      case "decision":
        return decision.title.trim().length > 0;
      case "alternatives":
        const minAlts = decision.packageLevel === "basic" ? 2 : 2;
        const maxAlts = decision.packageLevel === "basic" ? 5 : 10;
        return alternatives.length >= minAlts && alternatives.length <= maxAlts;
      case "criteria":
        return criteria.length >= 2;
      case "weighting":
        const totalWeight = criteria.reduce((sum, c) => sum + c.rawWeight, 0);
        return totalWeight > 0;
      case "evaluation":
        // Check if all alternatives have been rated for all criteria
        const requiredRatings = alternatives.length * criteria.length;
        const uniqueRatings = new Set(
          ratings.map((r) => `${r.alternativeId}-${r.criterionId}`)
        );
        return uniqueRatings.size >= requiredRatings;
      case "results":
        return true;
      default:
        return false;
    }
  }, [state]);

  const knockoutFailures = useMemo(() => {
    return checkKnockoutCriteria(state.alternatives, state.criteria, state.ratings);
  }, [state.alternatives, state.criteria, state.ratings]);

  // Stable actions object - these callbacks never change due to useCallback
  const actions = useMemo(
    () => ({
      setPackageLevel,
      setDecision,
      addAlternative,
      updateAlternative,
      removeAlternative,
      addCriterion,
      updateCriterion,
      removeCriterion,
      setCriteriaFromTemplate,
      setRating,
      setWeightingMethod,
      setAHPComparison,
      addRisk,
      addEvaluator,
      updateEvaluator,
      removeEvaluator,
      setStep,
      calculateResults,
      reset,
    }),
    [
      setPackageLevel, setDecision, addAlternative, updateAlternative, removeAlternative,
      addCriterion, updateCriterion, removeCriterion, setCriteriaFromTemplate,
      setRating, setWeightingMethod, setAHPComparison, addRisk,
      addEvaluator, updateEvaluator, removeEvaluator, setStep, calculateResults, reset,
    ]
  );

  const value = useMemo(
    () => ({
      state,
      dispatch,
      ...actions,
      canProceedToNext,
      knockoutFailures,
    }),
    [state, actions, canProceedToNext, knockoutFailures]
  );

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
}

// Hook
export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
