import type { Answer } from "../types/diagnostic";

/** One of the three review statuses a question can be in. */
export type RowStatus = "answered" | "skipped" | "unanswered";

/** Single source of truth for the review status of a question, shared by
 * the tab filter, the Status sort, and the Status column: answered =
 * answer with a selected option; skipped = answer record with null (the
 * quiz stores a skip as an answer entry with selectedOption null);
 * unanswered = no answer record at all. */
export function getRowStatus(
  answers: Record<string, Answer>,
  questionId: string,
): RowStatus {
  const answer = answers[questionId];
  if (answer && answer.selectedOption !== null) return "answered";
  if (answer && answer.selectedOption === null) return "skipped";
  return "unanswered";
}
