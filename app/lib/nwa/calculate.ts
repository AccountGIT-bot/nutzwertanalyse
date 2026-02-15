import { Alternative, Criterion, Rating, NwaResult } from "./types";

export function calculateNwa(
  alternatives: Alternative[],
  criteria: Criterion[],
  ratings: Rating[]
): NwaResult[] {
  const results: NwaResult[] = [];

  for (const alt of alternatives) {
    let total = 0;

    for (const criterion of criteria) {
      const rating = ratings.find(
        (r) =>
          r.alternativeId === alt.id &&
          r.criterionId === criterion.id
      );

      if (rating) {
        total += rating.score * criterion.weight;
      }
    }

    results.push({
      alternativeId: alt.id,
      totalScore: total,
    });
  }

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
