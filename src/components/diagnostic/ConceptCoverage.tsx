import { DonutCard } from "./DonutCard";

/**
 * ConceptCoverage -- the donut chart + legend in the ReviewPage right
 * sidebar (design reference: QuizPage_v1.png "Concept Coverage" widget).
 * Three segments: Covered (green / mastered), Skipped (amber / skip),
 * Uncovered (gray / untested). The covered percentage is shown as a
 * small badge next to the title.
 *
 * Delegates rendering to the shared DonutCard component.
 */

const SEGMENT_COLORS = {
  covered: "var(--color-donut-covered, #10b981)",
  skipped: "var(--color-donut-skipped, #f59e0b)",
  uncovered: "var(--color-donut-uncovered, #94a3b8)",
} as const;

export interface ConceptCoverageProps {
  coveredCount: number;
  skippedCount: number;
  uncoveredCount: number;
}

export function ConceptCoverage({
  coveredCount,
  skippedCount,
  uncoveredCount,
}: ConceptCoverageProps) {
  const total = coveredCount + skippedCount + uncoveredCount;
  const coveredPercent = total > 0 ? Math.round((coveredCount / total) * 100) : 0;

  return (
    <DonutCard
      title="Concept Coverage"
      badge={
        <span className="inline-flex items-center rounded-full bg-mastered-bg px-2 py-0.5 text-xs font-semibold text-mastered">
          {coveredPercent}%
        </span>
      }
      segments={[
        { name: "Covered", value: coveredCount, color: SEGMENT_COLORS.covered },
        { name: "Skipped", value: skippedCount, color: SEGMENT_COLORS.skipped },
        { name: "Uncovered", value: uncoveredCount, color: SEGMENT_COLORS.uncovered },
      ]}
    />
  );
}
