import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "../ui/Card";
import { STATE_STYLES, type EngineConceptState } from "./stateStyles";
import type { ConceptScoreDTO } from "../../types/report";

/**
 * ConceptScoreChart -- per §12: one aggregate chart alongside the prose
 * ReportBlock, both sourced from the same GET /report response (no new
 * endpoint). Colored by engine state, using the SAME three-way
 * Mastered/Needs Attention/Untested mapping as stateStyles.ts. Colors are
 * referenced via the semantic CSS variables (with the light values as
 * fallbacks) so the chart follows the active theme automatically, staying
 * in sync with the `mastered`/`attention`/`untested` tokens in index.css.
 */
const STATE_HEX: Record<EngineConceptState, string> = {
  Strong: "var(--color-mastered, #3f6f5e)",
  Weak: "var(--color-attention, #b5482f)",
  Untested: "var(--color-untested, #6b7280)",
};

// Recharts renders these as SVG attributes / inline styles, which resolve
// CSS variables in modern browsers; the light values are fallbacks.
const AXIS_TICK_FILL = "var(--color-ink-soft, #5c6570)";
const GRID_STROKE = "var(--color-border, #e3e6e9)";
const TOOLTIP_STYLE = {
  background: "var(--color-card-bg, #ffffff)",
  border: "1px solid var(--color-border, #e3e6e9)",
  borderRadius: 8,
  fontSize: 12,
  color: "var(--color-ink, #1c2024)",
} as const;

export interface ConceptScoreChartProps {
  scores: ConceptScoreDTO[];
}

export function ConceptScoreChart({ scores }: ConceptScoreChartProps) {
  const data = scores.map((s) => ({
    name: s.conceptName,
    score: Math.round(s.scorePercent),
    state: s.state,
  }));

  return (
    <Card>
      <p className="mb-4 text-sm font-medium text-ink">Concept scores</p>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: AXIS_TICK_FILL }}
              angle={-35}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: AXIS_TICK_FILL }}
              domain={[Math.min(0, ...data.map((d) => d.score)), 100]}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              itemStyle={{ color: "var(--color-ink, #1c2024)" }}
              formatter={(value, _name, item) => [
                `${Number(value ?? 0)}%`,
                STATE_STYLES[item.payload.state as EngineConceptState].label,
              ]}
            />
            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={STATE_HEX[entry.state]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-soft">
        {(Object.keys(STATE_HEX) as EngineConceptState[]).map((state) => (
          <span key={state} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATE_HEX[state] }}
            />
            {STATE_STYLES[state].label}
          </span>
        ))}
      </div>
    </Card>
  );
}