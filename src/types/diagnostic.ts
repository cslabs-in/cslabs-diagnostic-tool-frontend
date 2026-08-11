export type OptionLetter = "A" | "B" | "C" | "D";

/**
 * Mirrors engine/models.py's Question dataclass (question_id, concept_id,
 * type, stem, options, correct_answer) -- EXCEPT `correct_answer` is
 * deliberately omitted here. The frontend is never sent the correct answer
 * for an unanswered question (no reason to trust the client with it before
 * submission), and per-question correctness is never shown anywhere in the
 * product anyway (frontend-v1-decisions.md §7.4/§7.5).
 *
 * `conceptName` and `code` are NOT part of the engine's raw Question object.
 * conceptName will come from a concept lookup once GET /themes/{theme}/questions
 * is wired up for real -- for now it's included directly on the mock data as
 * a placeholder. `code` represents an optional C source snippet embedded in
 * the stem -- required per §7.3, most Grammar/Data Rep questions have one.
 */
export interface Question {
  questionId: string;
  conceptId: string;
  conceptName: string;
  type: "MCQ";
  stem: string;
  code?: string;
  options: Record<OptionLetter, string>;
}

export interface Answer {
  questionId: string;
  selectedOption: OptionLetter | null;
}