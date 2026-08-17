import { CheckCircle2, ChevronRight, Forward } from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";
import { getRowStatus } from "../../lib/reviewStatus";
import type { RowStatus } from "../../lib/reviewStatus";
import type { Answer, Question } from "../../types/diagnostic";

/**
 * ReviewQuestionTable -- the tabular layout on ReviewPage (design reference:
 * Question | Concept | Your response | Status | Action). Replaces the old
 * whole-row-click list: rows themselves are inert; only the Action button
 * (chevron) routes back into the quiz at that question's index (§7.4).
 *
 * Status visuals follow the design reference: Answered = green check pill,
 * Skipped = amber forward (skip) icon pill, Unanswered = gray dot + plain
 * text. NO correctness (right/wrong) anywhere -- the engine doesn't
 * expose per-question correctness, only concept-level state.
 */
export interface ReviewQuestionTableProps {
  /** Question plus its index in the FULL question list -- filtered tabs
   * (Answered/Skipped/Unanswered) must keep the real index so Q numbers
   * stay stable and the Action button routes back to the right question. */
  rows: Array<{ question: Question; index: number }>;
  answers: Record<string, Answer>;
  onEdit: (index: number) => void;
}

export function ReviewQuestionTable({
  rows,
  answers,
  onEdit,
}: ReviewQuestionTableProps) {
  return (
    <div className="overflow-hidden rounded-card border border-border bg-card-bg">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <th scope="col" className="px-4 py-3 font-semibold">
              Question
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Concept
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Your response
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-sm text-ink-soft"
              >
                No questions in this view.
              </td>
            </tr>
          ) : (
            rows.map(({ question, index }) => {
              const status = getRowStatus(answers, question.questionId);
              return (
                <tr
                  key={question.questionId}
                  className="transition-colors duration-150 hover:bg-page-bg"
                >
                  <td className="px-4 py-3 text-xs font-bold text-ink-soft">
                    Q{index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="concept">{question.conceptName}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {status === "answered"
                      ? answers[question.questionId]!.selectedOption
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell status={status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => onEdit(index)}
                      aria-label={`Edit question Q${index + 1}`}
                      title={`Go to question Q${index + 1}`}
                      className={cn(
                        "inline-flex h-8 w-8 items-center justify-center rounded-btn border border-border text-ink-soft transition-colors duration-150",
                        "hover:border-mastered-line hover:bg-mastered-bg hover:text-mastered focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
                      )}
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/** Status cell per the design reference: colored pills for Answered and
 * Skipped, a plain gray dot + label for Unanswered. */
function StatusCell({ status }: { status: RowStatus }) {
  if (status === "answered") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-mastered-line bg-mastered-bg px-2.5 py-1 text-xs font-medium text-mastered">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Answered
      </span>
    );
  }
  if (status === "skipped") {
    // Forward (fast-forward) icon in the skip palette -- reads as "moved
    // past this one", distinct from Answered's check and Unanswered's dot.
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-skip-line bg-skip-bg px-2.5 py-1 text-xs font-medium text-skip">
        <Forward className="h-3.5 w-3.5" aria-hidden="true" />
        Skipped
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <span className="h-2 w-2 rounded-full bg-untested" aria-hidden="true" />
      Unanswered
    </span>
  );
}
