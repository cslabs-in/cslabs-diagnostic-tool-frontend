import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card } from "../ui/Card";

/**
 * ConceptCoverage -- the donut chart + legend in the ReviewPage right
 * sidebar (design reference: QuizPage_v1.png "Concept Coverage" widget).
 * Three segments: Covered (green / mastered), Skipped (amber / skip),
 * Uncovered (gray / untested). The covered percentage is shown as a
 * small badge next to the title.
 *
 * Uses recharts (already a project dependency, see ConceptScoreChart)
 * with CSS-variable fills so the chart follows light/dark themes
 * automatically. No additional libraries needed.
 */

const SEGMENT_COLORS = {
  covered: "var(--color-donut-covered, #10b981)",
  skipped: "var(--color-donut-skipped, #f59e0b)",
  uncovered: "var(--color-donut-uncovered, #94a3b8)",
} as const;

interface Segment {
  name: string;
  value: number;
  color: string;
}

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

  const segments: Segment[] = [
    { name: "Covered", value: coveredCount, color: SEGMENT_COLORS.covered },
    { name: "Skipped", value: skippedCount, color: SEGMENT_COLORS.skipped },
    { name: "Uncovered", value: uncoveredCount, color: SEGMENT_COLORS.uncovered },
  ];

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Concept Coverage</p>
        <span className="inline-flex items-center rounded-full bg-mastered-bg px-2 py-0.5 text-xs font-semibold text-mastered">
          {coveredPercent}%
        </span>
      </div>

      {/* Donut chart -- ResponsiveContainer keeps the SVG centred and
          sized to its parent; Pie with innerRadius creates the ring. */}
      <div className="mx-auto mt-4 h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              strokeWidth={0}
              startAngle={90}
              endAngle={-270}
            >
              {segments.map((seg) => (
                <Cell key={seg.name} fill={seg.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend -- coloured dot + label + percentage + count, matching
          the QuizPage design reference layout. */}
      <ul className="mt-2 space-y-1.5">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <li key={seg.name} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: seg.color }}
                  aria-hidden="true"
                />
                <span className="text-ink-soft">{seg.name}</span>
              </span>
              <span className="font-medium text-ink">
                {pct}%{" "}
                <span className="text-ink-faint">({seg.value})</span>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
