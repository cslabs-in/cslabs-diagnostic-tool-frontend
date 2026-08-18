import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { type ReactNode } from "react";
import { Card } from "../ui/Card";

/**
 * DonutCard -- shared card layout for donut-chart widgets (ConceptCoverage,
 * ResponseOverview, etc.). Renders a Card with an optional title badge,
 * centred donut chart, and a legend beneath it.
 *
 * Uses recharts (already a project dependency) with CSS-variable fills so
 * the chart follows light/dark themes automatically.
 */

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

export interface DonutCardProps {
  title: string;
  /** Optional badge rendered beside the title (e.g. a percentage chip). */
  badge?: ReactNode;
  segments: DonutSegment[];
}

export function DonutCard({ title, badge, segments }: DonutCardProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-ink">{title}</p>
        {badge}
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

      {/* Legend -- coloured dot + label + percentage + count. */}
      <ul className="mt-2 space-y-1.5">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <li
              key={seg.name}
              className="flex items-center justify-between text-xs"
            >
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
