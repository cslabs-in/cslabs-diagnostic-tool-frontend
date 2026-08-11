import { apiClient } from "./client";
import type {
  RawCreateSessionResponse,
  RawCompleteSessionResponse,
  RawReportResponse,
} from "./types";
import type { OptionLetter } from "../types/diagnostic";
import type { ReportResponse, ConceptScoreDTO } from "../types/report";

export interface CreateSessionResult {
  sessionId: string;
  startedAt: string;
}

export async function createSession(): Promise<CreateSessionResult> {
  const { data } = await apiClient.post<RawCreateSessionResponse>("/sessions");
  return { sessionId: data.session_id, startedAt: data.started_at };
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  selectedOption: OptionLetter | null,
): Promise<void> {
  await apiClient.post(`/sessions/${sessionId}/answers`, {
    question_id: questionId,
    selected_option: selectedOption,
  });
}

export async function completeSession(sessionId: string): Promise<RawCompleteSessionResponse> {
  const { data } = await apiClient.post<RawCompleteSessionResponse>(
    `/sessions/${sessionId}/complete`,
  );
  return data;
}

/**
 * GET /report doesn't return concept names (see sessions.py's get_report --
 * only concept_id). `conceptNames` is the map SessionContext captured at
 * theme-fetch time (per the decision not to touch the backend for this).
 * If that map is empty -- e.g. a hard refresh landed directly on the report
 * page with no live session context -- scores fall back to showing the raw
 * concept_id as the name. Known v1 gap, not a bug.
 */
export async function getReport(
  sessionId: string,
  conceptNames: Record<string, string>,
): Promise<ReportResponse> {
  const { data } = await apiClient.get<RawReportResponse>(`/sessions/${sessionId}/report`);

  const conceptScores: ConceptScoreDTO[] = data.concept_scores.map((s) => ({
    conceptId: s.concept_id,
    conceptName: conceptNames[s.concept_id] ?? s.concept_id,
    scorePercent: s.score_percent,
    state: s.state,
    numAnswered: s.num_answered,
  }));

  return {
    sessionId: data.session_id,
    completedAt: data.completed_at,
    reportText: data.report_text,
    conceptScores,
  };
}