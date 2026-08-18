import { DonutCard } from "./DonutCard";

/**
 * ResponseOverview -- the "Response overview" widget in the ReviewPage
 * right sidebar (design reference: ReviewPage_v2.png, top-right card).
 * Three segments: Answered (green), Skipped (amber), Unanswered (gray).
 *
 * Delegates rendering to the shared DonutCard component. Unlike
 * ConceptCoverage, no percentage badge is shown beside the title.
 */

const SEGMENT_COLORS = {
  answered: "var(--color-donut-covered, #10b981)",
  skipped: "var(--color-donut-skipped, #f59e0b)",
  unanswered: "var(--color-donut-uncovered, #94a3b8)",
} as const;

export interface ResponseOverviewProps {
  answeredCount: number;
  skippedCount: number;
  unansweredCount: number;
}

export function ResponseOverview({
  answeredCount,
  skippedCount,
  unansweredCount,
}: ResponseOverviewProps) {
  const total = answeredCount + skippedCount + unansweredCount;
  const answeredPercent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
  return (
    <DonutCard
      title="Response overview"
      badge={
        <span className="inline-flex items-center rounded-full bg-mastered-bg px-2 py-0.5 text-xs font-semibold text-mastered">
          {answeredPercent}%
        </span>
      }
      segments={[
        { name: "Answered", value: answeredCount, color: SEGMENT_COLORS.answered },
        { name: "Skipped", value: skippedCount, color: SEGMENT_COLORS.skipped },
        { name: "Unanswered", value: unansweredCount, color: SEGMENT_COLORS.unanswered },
      ]}
    />
  );
}
