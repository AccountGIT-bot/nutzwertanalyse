import type { AnalysisState } from "./types";
export function createDemo(): AnalysisState {
  const criteria = [
    { name: "Funktionsumfang", score: [8, 9, 8], weight: 30 },
    { name: "Bedienbarkeit", score: [8, 8, 6], weight: 30 },
    { name: "Gesamtkosten", score: [6, 8, 7], weight: 20 },
    { name: "Einführungsaufwand", score: [7, 8, 6], weight: 20 },
  ];
  return {
    decision: {
      id: "demo-software",
      title: "Welche Software passt zu uns?",
      description:
        "Fiktives Beispiel. Alle Angaben und Bewertungen sind frei erfunden und dienen nur der Demonstration.",
      packageLevel: "advanced",
      createdAt: new Date(),
      updatedAt: new Date(),
      preset: "software",
    },
    alternatives: [
      { id: "a", name: "Software A" },
      { id: "b", name: "Software B" },
      { id: "c", name: "Eigenentwicklung" },
    ],
    categories: [],
    criteria: criteria.map((c, i) => ({
      id: `c${i}`,
      name: c.name,
      description:
        "10 = sehr gut geeignet, 1 = schlecht geeignet; bei Kosten und Aufwand bedeutet ein tieferer Wert eine bessere Bewertung.",
      weight: c.weight / 100,
      rawWeight: c.weight,
    })),
    ratings: ["a", "b", "c"].flatMap((id, i) =>
      criteria.map((c, j) => ({
        alternativeId: id,
        criterionId: `c${j}`,
        score: c.score[i],
      })),
    ),
    risks: [],
    evaluators: [],
    ahpComparisons: [],
    weightingMethod: "percentage",
    results: [],
    sensitivityResults: [],
    currentStep: "results",
  };
}
