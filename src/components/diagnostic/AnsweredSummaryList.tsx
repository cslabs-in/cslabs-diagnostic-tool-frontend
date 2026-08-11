import { Badge } from "../ui/Badge";
import type { Answer, Question } from "../../types/diagnostic";

/**
 * AnsweredSummaryList -- per §7.4: shows status (answered/skipped), the
 * selected option letter if answered, and the concept tag. NO correctness
 * (right/wrong) anywhere -- the engine doesn't expose per-question
 * correctness at all, only concept-level state, so there's nothing to show
 * even if we wanted to.
 *
 * Clicking a row is meant to route back into the quiz at that question's
 * index (§7.4) -- `onRowClick` is left as a callback here since real
 * routing depends on React Router + session state, not yet wired up.
 */
export interface AnsweredSummaryListProps {
  questions: Question[];
  answers: Record<string, Answer>;
  onRowClick: (index: number) => void;
}

export function AnsweredSummaryList({
  questions,
  answers,
  onRowClick,
}: AnsweredSummaryListProps) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card-bg">
      {questions.map((q, index) => {
        const answer = answers[q.questionId];
        const skipped = answer && answer.selectedOption === null;
        const answered = answer && answer.selectedOption !== null;

        return (
          <li key={q.questionId}>
            <button
              type="button"
              onClick={() => onRowClick(index)}
              className="flex w-full items-center justify-between gap-4 p-4 text-left transition-colors duration-150 hover:bg-page-bg"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-ink-faint">Q{index + 1}</span>
                <Badge variant="concept">{q.conceptName}</Badge>
              </div>
              <div className="flex items-center gap-2">
                {answered && (
                  <span className="text-sm font-medium text-ink">
                    {answer!.selectedOption}
                  </span>
                )}
                <Badge variant="status">
                  {skipped ? "Skipped" : answered ? "Answered" : "Unanswered"}
                </Badge>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}