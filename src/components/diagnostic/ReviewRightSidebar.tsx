import { ConceptCoverage } from "./ConceptCoverage";

/**
 * ReviewRightSidebar
 *
 * The right sidebar on ReviewPage (design reference: ReviewPage_v2.png).
 * Built widget by widget -- currently ships the Concept Coverage donut;
 * Response overview, Question navigator, and Quick jump follow.
 */

export interface ReviewRightSidebarProps {
  answeredCount: number;
  skippedCount: number;
  unansweredCount: number;
}

export function ReviewRightSidebar({
  answeredCount,
  skippedCount,
  unansweredCount,
}: ReviewRightSidebarProps) {
  return (
    <div className="space-y-6">
      <ConceptCoverage
        coveredCount={answeredCount}
        skippedCount={skippedCount}
        uncoveredCount={unansweredCount}
      />
    </div>
  );
}
