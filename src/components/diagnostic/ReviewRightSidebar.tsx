import { ConceptCoverage } from "./ConceptCoverage";
import { ResponseOverview } from "./ResponseOverview";

/**
 * ReviewRightSidebar
 *
 * The right sidebar on ReviewPage (design reference: ReviewPage_v2.png).
 * It is deliberately a quiet read-only overview: direct question navigation
 * lives beside each answer in the main review list, where the student has
 * enough context to make a calm choice.
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
}

export function ReviewRightSidebar({
  coveredConceptCount,
  skippedConceptCount,
  uncoveredConceptCount,
  answeredCount,
  skippedCount,
  unansweredCount,
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
    </div>
  );
}
