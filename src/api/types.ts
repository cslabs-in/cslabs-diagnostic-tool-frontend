/**
 * Raw backend response shapes -- snake_case, matching sessions.py and
 * themes.py exactly. Not exported past the api/ layer; themes.ts and
 * sessions.ts map these into the frontend's camelCase types before
 * anything else in the app sees them.
 */

export interface RawThemeQuestion {
  question_id: string;
  stem: string;
  options: Record<"A" | "B" | "C" | "D", string>;
}

export interface RawThemeConcept {
  id: string;
  name: string;
  learning_objective: string;
  difficulty: string;
  min_questions: number;
  questions: RawThemeQuestion[];
}

export interface RawThemeResponse {
  theme: string;
  concepts: RawThemeConcept[];
}

export interface RawCreateSessionResponse {
  session_id: string;
  started_at: string;
}

export interface RawCompleteSessionResponse {
  session_id: string;
  report_text: string;
}

export interface RawConceptScore {
  concept_id: string;
  score_percent: number;
  state: "Strong" | "Weak" | "Untested";
  num_answered: number;
}

export interface RawReportResponse {
  session_id: string;
  completed_at: string;
  report_text: string;
  concept_scores: RawConceptScore[];
}