import type { EngineConceptState } from "../components/report/stateStyles";

/**
 * Mirrors GET /sessions/{session_id}/report's actual response shape
 * (see the real endpoint code in frontend-v1-decisions.md §12):
 *   { session_id, completed_at, report_text, concept_scores: [...] }
 *
 * concept_scores items mirror session_concept_scores columns:
 *   concept_id, score_percent, state, num_answered
 */
export interface ConceptScoreDTO {
  conceptId: string;
  conceptName: string; // not on the raw DB row -- joined client-side from a
  // concept lookup once that exists; included directly on mock data for now
  scorePercent: number;
  state: EngineConceptState;
  numAnswered: number;
}

export interface ReportResponse {
  sessionId: string;
  completedAt: string;
  reportText: string;
  conceptScores: ConceptScoreDTO[];
}