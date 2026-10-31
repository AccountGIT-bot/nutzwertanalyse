import type { Translations } from "@/lib/i18n/de";
import type { PresetId } from "./parser";
import { createAlternative, createAnalysis, createCriterion, DEFAULT_EVALUATOR_ID, percentFromPoints } from "./factory";
import type { Analysis, Criterion } from "./types";

export function presetCriteria(t: Translations, presetId: string): Partial<Criterion>[] {
  const p = t.presets[presetId];
  if (!p) return [];
  return p.criteria.map((c) => ({ name: c.name, description: c.description, categoryId: c.categoryId, points: 3, ...(c.measure ? { measure: { unit: c.measure.unit, direction: c.measure.direction } } : {}) }));
}

export interface NewAnalysisOptions {
  presetId?: PresetId | string;
  title?: string;
  alternatives?: string[];
  selfName: string;
}

/** Erstellt eine neue Analyse auf Basis einer Vorlage (lokalisiert). */
export function analysisFromPreset(t: Translations, opts: NewAnalysisOptions): Analysis {
  const presetId = opts.presetId && t.presets[opts.presetId] ? opts.presetId : "custom";
  const preset = t.presets[presetId];
  const altNames = opts.alternatives && opts.alternatives.length >= 2 ? opts.alternatives : preset.alternatives;
  const a = createAnalysis(
    {
      title: opts.title ?? "",
      presetId: presetId === "custom" ? undefined : presetId,
      alternatives: altNames.map((n) => createAlternative(n)),
      criteria: presetCriteria(t, presetId).map((c) => createCriterion(c)),
    },
    opts.selfName,
  );
  a.criteria = percentFromPoints(a.criteria);
  return a;
}

/** Vollständige Beispiel-Analyse (CRM-Auswahl) mit Bewertungen. */
export function demoAnalysis(t: Translations): Analysis {
  const a = createAnalysis(
    {
      title: t.demo.title,
      description: t.demo.description,
      goal: t.demo.goal,
      constraints: t.demo.constraints,
      presetId: "software",
      step: "results",
    },
    t.decision.self,
  );
  const sw = t.presets.software;
  a.alternatives = [
    createAlternative("CloudCRM Pro", "SaaS, EU-Hosting, 15 Lizenzen"),
    createAlternative("SalesSuite", "SaaS, US-Hosting, umfangreiche Automatisierung"),
    createAlternative("OpenCRM (self-hosted)", "Open Source, eigener Server, Partner für Betrieb"),
  ];
  const points = [5, 4, 3, 3, 4, 5, 2, 3];
  a.criteria = sw.criteria.map((c, i) =>
    createCriterion({
      name: c.name,
      description: c.description,
      categoryId: c.categoryId,
      points: points[i] ?? 3,
      isKnockout: i === 5,
      minScore: i === 5 ? 6 : undefined,
    }),
  );
  a.criteria = percentFromPoints(a.criteria);
  const scores: number[][] = [
    // Funktionsumfang, Benutzerfreundlichkeit, Kosten, Einführungsaufwand, Integration, Datenschutz, Skalierbarkeit, Support
    [8, 9, 6, 8, 7, 9, 7, 8],
    [9, 7, 5, 6, 9, 5, 9, 9],
    [6, 6, 9, 4, 6, 10, 6, 5],
  ];
  const ev = DEFAULT_EVALUATOR_ID;
  a.ratings[ev] = {};
  a.alternatives.forEach((alt, ai) => {
    a.ratings[ev][alt.id] = {};
    a.criteria.forEach((c, ci) => {
      a.ratings[ev][alt.id][c.id] = { score: scores[ai][ci] };
    });
  });
  return a;
}
