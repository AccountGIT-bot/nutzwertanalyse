"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from "react";
import { nowIso, clamp } from "@/lib/utils";
import { createAlternative, createCriterion, createEvaluator, equalizePercent, percentFromPoints } from "./factory";
import { library } from "./library";
import type { Alternative, Analysis, Criterion, Evaluator, Id, ScaleMax, Step, WeightingMethod } from "./types";

/* ---------------- Actions ---------------- */

type Action =
  | { type: "replace"; analysis: Analysis }
  | { type: "patch"; patch: Partial<Pick<Analysis, "title" | "description" | "goal" | "constraints" | "conclusion" | "presetId">> }
  | { type: "setStep"; step: Step }
  | { type: "setScale"; scale: ScaleMax }
  | { type: "setWeighting"; method: WeightingMethod }
  | { type: "addAlternative"; alternative?: Partial<Alternative> }
  | { type: "updateAlternative"; id: Id; patch: Partial<Alternative> }
  | { type: "removeAlternative"; id: Id }
  | { type: "moveAlternative"; id: Id; dir: -1 | 1 }
  | { type: "addCriterion"; criterion?: Partial<Criterion> }
  | { type: "addCriteria"; criteria: Partial<Criterion>[] }
  | { type: "updateCriterion"; id: Id; patch: Partial<Criterion> }
  | { type: "removeCriterion"; id: Id }
  | { type: "moveCriterion"; id: Id; dir: -1 | 1 }
  | { type: "setCriteriaOrder"; ids: Id[] }
  | { type: "equalizePercent" }
  | { type: "percentFromPoints" }
  | { type: "normalizePercent" }
  | { type: "setPairwise"; a: Id; b: Id; value: number }
  | { type: "resetPairwise" }
  | { type: "addEvaluator"; name: string }
  | { type: "updateEvaluator"; id: Id; patch: Partial<Evaluator> }
  | { type: "removeEvaluator"; id: Id }
  | { type: "setRating"; evaluatorId: Id; altId: Id; critId: Id; score?: number | null; note?: string }
  | { type: "fillRatings"; evaluatorId: Id; score: number }
  | { type: "setMeasure"; altId: Id; critId: Id; value: number | null }
  | { type: "clearRatings"; evaluatorId: Id }
  | { type: "applyWeights"; weights: Record<Id, number> }
  | { type: "undo" }
  | { type: "redo" };

interface HistoryState {
  present: Analysis;
  past: Analysis[];
  future: Analysis[];
}

const MAX_HISTORY = 60;
/** Aktionen, die keinen Undo-Eintrag erzeugen */
const NON_UNDOABLE = new Set<Action["type"]>(["setStep", "replace", "undo", "redo"]);

function move<T extends { id: Id }>(list: T[], id: Id, dir: -1 | 1): T[] {
  const i = list.findIndex((x) => x.id === id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= list.length) return list;
  const copy = list.slice();
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
}

function reduceAnalysis(a: Analysis, action: Action): Analysis {
  switch (action.type) {
    case "replace":
      return action.analysis;
    case "patch":
      return { ...a, ...action.patch };
    case "setStep":
      return { ...a, step: action.step };
    case "setScale": {
      if (action.scale === a.settings.scale) return a;
      const factor = action.scale / a.settings.scale;
      // Bewertungen proportional umrechnen
      const ratings: Analysis["ratings"] = {};
      for (const [ev, byAlt] of Object.entries(a.ratings)) {
        ratings[ev] = {};
        for (const [alt, byCrit] of Object.entries(byAlt)) {
          ratings[ev][alt] = {};
          for (const [crit, r] of Object.entries(byCrit)) {
            ratings[ev][alt][crit] = {
              ...r,
              score: typeof r.score === "number" ? clamp(Math.round(r.score * factor), 1, action.scale) : undefined,
            };
          }
        }
      }
      const criteria = a.criteria.map((c) => ({
        ...c,
        minScore: typeof c.minScore === "number" ? clamp(Math.round(c.minScore * factor), 1, action.scale) : undefined,
      }));
      return { ...a, settings: { ...a.settings, scale: action.scale }, ratings, criteria };
    }
    case "setWeighting": {
      let criteria = a.criteria;
      if (action.method === "percent" && a.settings.weighting !== "percent") {
        const sum = criteria.reduce((s, c) => s + c.percent, 0);
        if (Math.abs(sum - 100) > 0.5) criteria = percentFromPoints(criteria);
      }
      return { ...a, criteria, settings: { ...a.settings, weighting: action.method } };
    }
    case "addAlternative": {
      if (a.alternatives.length >= 50) return a;
      const alt = { ...createAlternative(), ...action.alternative };
      return { ...a, alternatives: [...a.alternatives, alt] };
    }
    case "updateAlternative":
      return { ...a, alternatives: a.alternatives.map((x) => (x.id === action.id ? { ...x, ...action.patch } : x)) };
    case "removeAlternative": {
      const ratings: Analysis["ratings"] = {};
      for (const [ev, byAlt] of Object.entries(a.ratings)) {
        const copy = { ...byAlt };
        delete copy[action.id];
        ratings[ev] = copy;
      }
      const measures = { ...(a.measures ?? {}) };
      delete measures[action.id];
      return { ...a, alternatives: a.alternatives.filter((x) => x.id !== action.id), ratings, measures };
    }
    case "moveAlternative":
      return { ...a, alternatives: move(a.alternatives, action.id, action.dir) };
    case "addCriterion": {
      if (a.criteria.length >= 60) return a;
      return { ...a, criteria: [...a.criteria, { ...createCriterion(), ...action.criterion }] };
    }
    case "addCriteria": {
      const existing = new Set(a.criteria.map((c) => c.name.trim().toLowerCase()));
      const fresh = action.criteria
        .filter((c) => c.name && !existing.has(c.name.trim().toLowerCase()))
        .map((c) => ({ ...createCriterion(), ...c }));
      const criteria = [...a.criteria, ...fresh].slice(0, 60);
      return { ...a, criteria: a.settings.weighting === "percent" ? percentFromPoints(criteria) : criteria };
    }
    case "updateCriterion":
      return { ...a, criteria: a.criteria.map((x) => (x.id === action.id ? { ...x, ...action.patch } : x)) };
    case "removeCriterion": {
      const ratings: Analysis["ratings"] = {};
      for (const [ev, byAlt] of Object.entries(a.ratings)) {
        ratings[ev] = {};
        for (const [alt, byCrit] of Object.entries(byAlt)) {
          const copy = { ...byCrit };
          delete copy[action.id];
          ratings[ev][alt] = copy;
        }
      }
      const pairwise: Analysis["pairwise"] = {};
      for (const [k, v] of Object.entries(a.pairwise)) {
        if (!k.split("|").includes(action.id)) pairwise[k] = v;
      }
      const measures: NonNullable<Analysis["measures"]> = {};
      for (const [alt, byCrit] of Object.entries(a.measures ?? {})) {
        const copy = { ...byCrit };
        delete copy[action.id];
        measures[alt] = copy;
      }
      return { ...a, criteria: a.criteria.filter((x) => x.id !== action.id), ratings, pairwise, measures };
    }
    case "moveCriterion":
      return { ...a, criteria: move(a.criteria, action.id, action.dir) };
    case "setCriteriaOrder": {
      const byId = new Map(a.criteria.map((c) => [c.id, c]));
      const ordered = action.ids.map((id) => byId.get(id)).filter((c): c is Criterion => !!c);
      if (ordered.length !== a.criteria.length) return a;
      return { ...a, criteria: ordered };
    }
    case "equalizePercent":
      return { ...a, criteria: equalizePercent(a.criteria) };
    case "percentFromPoints":
      return { ...a, criteria: percentFromPoints(a.criteria) };
    case "normalizePercent": {
      const sum = a.criteria.reduce((s, c) => s + Math.max(0, c.percent), 0);
      if (sum <= 0) return { ...a, criteria: equalizePercent(a.criteria) };
      const scaled = a.criteria.map((c) => ({ ...c, points: c.points, percent: (Math.max(0, c.percent) / sum) * 100 }));
      // Auf ganze Zahlen runden, Rest verteilen
      const floored = scaled.map((c) => Math.floor(c.percent));
      let rest = 100 - floored.reduce((x, y) => x + y, 0);
      const order = scaled.map((c, i) => ({ i, frac: c.percent - Math.floor(c.percent) })).sort((x, y) => y.frac - x.frac);
      for (const o of order) {
        if (rest <= 0) break;
        floored[o.i] += 1;
        rest -= 1;
      }
      return { ...a, criteria: scaled.map((c, i) => ({ ...c, percent: floored[i] })) };
    }
    case "setPairwise": {
      const pairwise = { ...a.pairwise };
      delete pairwise[`${action.b}|${action.a}`];
      pairwise[`${action.a}|${action.b}`] = action.value;
      return { ...a, pairwise };
    }
    case "resetPairwise":
      return { ...a, pairwise: {} };
    case "addEvaluator":
      if (a.evaluators.length >= 20) return a;
      return { ...a, evaluators: [...a.evaluators, createEvaluator(action.name)] };
    case "updateEvaluator":
      return { ...a, evaluators: a.evaluators.map((e) => (e.id === action.id ? { ...e, ...action.patch } : e)) };
    case "removeEvaluator": {
      if (a.evaluators.length <= 1) return a;
      const ratings = { ...a.ratings };
      delete ratings[action.id];
      return { ...a, evaluators: a.evaluators.filter((e) => e.id !== action.id), ratings };
    }
    case "setRating": {
      const byAlt = { ...(a.ratings[action.evaluatorId] ?? {}) };
      const byCrit = { ...(byAlt[action.altId] ?? {}) };
      const prev = byCrit[action.critId] ?? {};
      // score: undefined = unverändert, null = löschen, Zahl = setzen
      const score = action.score === undefined ? prev.score : action.score === null ? undefined : action.score;
      const note = action.note === undefined ? prev.note : action.note;
      byCrit[action.critId] = { score, note };
      byAlt[action.altId] = byCrit;
      return { ...a, ratings: { ...a.ratings, [action.evaluatorId]: byAlt } };
    }
    case "fillRatings": {
      const byAlt = { ...(a.ratings[action.evaluatorId] ?? {}) };
      for (const alt of a.alternatives) {
        const byCrit = { ...(byAlt[alt.id] ?? {}) };
        for (const c of a.criteria) {
          if (c.measure) continue; // Messwerte werden erfasst, nicht vorbelegt
          const prev = byCrit[c.id];
          if (!prev || typeof prev.score !== "number") byCrit[c.id] = { ...prev, score: action.score };
        }
        byAlt[alt.id] = byCrit;
      }
      return { ...a, ratings: { ...a.ratings, [action.evaluatorId]: byAlt } };
    }
    case "setMeasure": {
      const byCrit = { ...(a.measures?.[action.altId] ?? {}) };
      if (action.value === null || !Number.isFinite(action.value)) delete byCrit[action.critId];
      else byCrit[action.critId] = action.value;
      return { ...a, measures: { ...(a.measures ?? {}), [action.altId]: byCrit } };
    }
    case "clearRatings": {
      const ratings = { ...a.ratings };
      delete ratings[action.evaluatorId];
      return { ...a, ratings };
    }
    case "applyWeights": {
      const total = a.criteria.reduce((s, c) => s + Math.max(0, action.weights[c.id] ?? 0), 0);
      if (total <= 0) return a;
      const criteria = a.criteria.map((c) => ({ ...c, percent: ((action.weights[c.id] ?? 0) / total) * 100 }));
      const floored = criteria.map((c) => Math.floor(c.percent));
      let rest = 100 - floored.reduce((x, y) => x + y, 0);
      const order = criteria.map((c, i) => ({ i, frac: c.percent - Math.floor(c.percent) })).sort((x, y) => y.frac - x.frac);
      for (const o of order) {
        if (rest <= 0) break;
        floored[o.i] += 1;
        rest -= 1;
      }
      return { ...a, criteria: criteria.map((c, i) => ({ ...c, percent: floored[i] })), settings: { ...a.settings, weighting: "percent" } };
    }
    default:
      return a;
  }
}

function reducer(state: HistoryState, action: Action): HistoryState {
  if (action.type === "undo") {
    const prev = state.past[state.past.length - 1];
    if (!prev) return state;
    return { present: { ...prev, step: state.present.step }, past: state.past.slice(0, -1), future: [state.present, ...state.future] };
  }
  if (action.type === "redo") {
    const next = state.future[0];
    if (!next) return state;
    return { present: { ...next, step: state.present.step }, past: [...state.past, state.present], future: state.future.slice(1) };
  }
  const next = reduceAnalysis(state.present, action);
  if (next === state.present) return state;
  const stamped = NON_UNDOABLE.has(action.type) ? next : { ...next, updatedAt: nowIso() };
  if (NON_UNDOABLE.has(action.type)) {
    return { ...state, present: stamped };
  }
  return {
    present: stamped,
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    future: [],
  };
}

/** Analyse ohne jegliche Nutzereingabe (wird beim Verlassen automatisch verworfen) */
export function isPristine(a: Analysis): boolean {
  return (
    a.title.trim() === "" &&
    a.description.trim() === "" &&
    a.goal.trim() === "" &&
    a.constraints.trim() === "" &&
    a.conclusion.trim() === "" &&
    a.alternatives.every((x) => x.name.trim() === "") &&
    a.criteria.every((x) => x.name.trim() === "") &&
    Object.keys(a.ratings).length === 0
  );
}

/* ---------------- Context ---------------- */

interface StoreValue {
  analysis: Analysis;
  dispatch: (a: Action) => void;
  canUndo: boolean;
  canRedo: boolean;
}

const StoreContext = createContext<StoreValue | null>(null);

export function AnalysisProvider({ initial, children }: { initial: Analysis; children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { present: initial, past: [], future: [] });
  const lastSaved = useRef<Analysis>(initial);

  const latest = useRef(state.present);

  // Autosave (entprellt) in die Bibliothek – nie eine bereits gelöschte Analyse wiederbeleben
  useEffect(() => {
    latest.current = state.present;
    if (state.present === lastSaved.current) return;
    const h = window.setTimeout(() => {
      if (!library.get(state.present.id)) return;
      library.save(state.present);
      lastSaved.current = state.present;
    }, 400);
    return () => window.clearTimeout(h);
  }, [state.present]);

  // Beim Verlassen sofort sichern; unberührte leere Analysen werden beim Schliessen des Editors verworfen
  useEffect(() => {
    const flush = () => {
      const current = latest.current;
      if (!library.get(current.id)) return;
      if (current !== lastSaved.current) {
        library.save(current);
        lastSaved.current = current;
      }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", flush);
      const current = latest.current;
      if (library.get(current.id) && isPristine(current)) {
        library.remove(current.id);
        return;
      }
      flush();
    };
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ analysis: state.present, dispatch, canUndo: state.past.length > 0, canRedo: state.future.length > 0 }),
    [state],
  );
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAnalysis(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

export function useAnalysisActions() {
  const { dispatch } = useAnalysis();
  return useMemo(
    () => ({
      patch: (patch: Extract<Action, { type: "patch" }>["patch"]) => dispatch({ type: "patch", patch }),
      setStep: (step: Step) => dispatch({ type: "setStep", step }),
      undo: () => dispatch({ type: "undo" }),
      redo: () => dispatch({ type: "redo" }),
    }),
    [dispatch],
  );
}

/** Hook: Tastaturkürzel für Undo/Redo */
export function useUndoShortcuts() {
  const { dispatch } = useAnalysis();
  const cb = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const editing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (editing) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      }
    },
    [dispatch],
  );
  useEffect(() => {
    window.addEventListener("keydown", cb);
    return () => window.removeEventListener("keydown", cb);
  }, [cb]);
}

export type { Action };
