import { ConceptCoverage } from "./ConceptCoverage";
import { ResponseOverview } from "./ResponseOverview";

/**
 * ReviewRightSidebar
 *
 * The right sidebar on ReviewPage (design reference: ReviewPage_v2.png).
 * Built widget by widget -- currently ships Concept Coverage + Response
 * overview; Question navigator and Quick jump follow.
 *
 * ConceptCoverage receives concept-level counts (grouped by conceptId)
 * while ResponseOverview receives question-level answer counts.
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
