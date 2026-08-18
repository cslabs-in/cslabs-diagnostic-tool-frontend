import { ConceptCoverage } from "./ConceptCoverage";
import { ResponseOverview } from "./ResponseOverview";
import { QuickJump } from "./QuickJump";

/**
 * ReviewRightSidebar
 *
 * The right sidebar on ReviewPage (design reference: ReviewPage_v2.png).
 * Built widget by widget -- currently ships Concept Coverage + Response
 * overview + Quick jump.
 *
 * ConceptCoverage receives concept-level counts (grouped by conceptId)
 * while ResponseOverview receives question-level answer counts.
 * QuickJump allows direct navigation to any question.
 */

export interface ReviewRightSidebarProps {
  /** Concept-level counts (derived from grouping questions by conceptId). */
  coveredConceptCount: number;
  skippedConceptCount: number;
  uncoveredConceptCount: number;
  /** Question-level counts (individual question answer statuses). */
  answeredCount: number;
  skippedCount: number;
  unansweredCount: number;
  /** Questions for the Quick Jump dropdown. */
  questions: { questionId: string; conceptName: string }[];
  /** Callback to jump to a specific question index. */
  onJumpToQuestion: (index: number) => void;
}

export function ReviewRightSidebar({
  coveredConceptCount,
  skippedConceptCount,
  uncoveredConceptCount,
  answeredCount,
  skippedCount,
  unansweredCount,
  questions,
  onJumpToQuestion,
}: ReviewRightSidebarProps) {
  return (
    <div className="space-y-6">
      <ConceptCoverage
        coveredCount={coveredConceptCount}
        skippedCount={skippedConceptCount}
        uncoveredCount={uncoveredConceptCount}
      />
      <ResponseOverview
        answeredCount={answeredCount}
        skippedCount={skippedCount}
        unansweredCount={unansweredCount}
      />
      <QuickJump questions={questions} onJump={onJumpToQuestion} />
    </div>
  );
}
