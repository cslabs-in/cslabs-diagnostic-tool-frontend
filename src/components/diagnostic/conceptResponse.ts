export interface ConceptResponse {
  conceptId: string;
  conceptName: string;
  answeredCount: number;
  skippedCount: number;
  unansweredCount: number;
  totalCount: number;
  order: number;
}

export function getFocusConcepts(concepts: ConceptResponse[]): ConceptResponse[] {
  return concepts
    .filter((concept) => concept.skippedCount + concept.unansweredCount > 0)
    .sort(
      (a, b) =>
        b.unansweredCount - a.unansweredCount ||
        b.skippedCount - a.skippedCount ||
        a.order - b.order,
    );
}
