/**
 * components/report/ConceptGraph.tsx
 *
 * Scoped-down v1 (pre-pilot) concept graph view for ReportPage. Renders the
 * static 23-concept structure from content/conceptGraph.ts, colored by this
 * session's per-concept state.
 *
 * VISIBILITY RULE: when `activeTheme` is set, only two kinds of nodes show:
 *   1. Every concept in the tested theme.
 *   2. "Bridge" concepts -- concepts in the OTHER theme that are directly
 *      listed as a prerequisite of something in the tested theme (e.g.
 *      GR02/GR04 when activeTheme is data-representation, since DT02/DT07/
 *      DT14 require them). Rendered faded.
 * Everything else (a same-theme-as-the-bridge concept that ISN'T itself a
 * prerequisite of anything tested, e.g. GR01/GR03/GR05/GR06 in that same
 * example) is not rendered at all. This keeps the cross-theme prerequisite
 * story intact (design doc §3: cross-theme edges are "expected, not
 * exceptional") without dumping the full other-theme subgraph on screen.
 *
 * A bridge concept's OWN further-upstream prerequisites (e.g. GR02's own
 * prerequisite GR01) are pruned too -- that grandparent concept isn't shown,
 * so drawing or depth-calculating against it would either error or point
 * at nothing. See getVisibleGraph().
 *
 * Deliberately OUT of scope for this pass (candidates for the next
 * iteration, after pilot feedback):
 *   - Click-to-select side panel (Concept Details / Prerequisites / Related
 *     Concepts) -- native <title> hover tooltip stands in for now.
 *   - Highlighting root-cause nodes / dashed pending-blocker edges.
 *   - Pan/zoom controls.
 *
 * ASSUMPTION TO VERIFY: `ConceptScoreLite` below assumes api/sessions.ts
 * maps the backend's snake_case concept_scores into camelCase
 * (conceptId/state/numAnswered), per the build log's stated boundary
 * convention. If your real `ConceptScoreDTO` type uses different field
 * names, adjust the prop type below (and the two `.` accesses in
 * `resolveDisplayState`) to match -- nothing else in this file depends on
 * the exact shape beyond those three fields.
 */

import { useMemo, useState } from "react";
import {
  CONCEPT_GRAPH,
  computeDepths,
  type ConceptGraphNode,
} from "../../content/conceptGraph";
import type { ThemeId } from "../../api/themes";

export interface ConceptScoreLite {
  conceptId: string;
  state: "Strong" | "Weak" | "Untested";
  numAnswered: number;
}

interface ConceptGraphProps {
  conceptScores: ConceptScoreLite[];
  /** The theme this session tested. Omit or pass null to render everything, undimmed. */
  activeTheme?: ThemeId | null;
}

type DisplayState = "mastered" | "attention" | "partial" | "notAttempted";

const DISPLAY_STYLES: Record<
  DisplayState,
  { fill: string; stroke: string; label: string }
> = {
  mastered: { fill: "var(--color-mastered-bg)", stroke: "var(--color-mastered)", label: "Strong" },
  attention: { fill: "var(--color-attention-bg)", stroke: "var(--color-attention)", label: "Weak" },
  // NOTE: --color-partial{,-bg} are NOT yet defined in index.css (§11).
  // Add alongside the existing mastered/attention/skip/untested tokens,
  // e.g.: --color-partial: #b8860b; --color-partial-bg: #faf3e0;
  partial: { fill: "var(--color-partial-bg, #faf3e0)", stroke: "var(--color-partial, #b8860b)", label: "Needs More Data" },
  notAttempted: { fill: "var(--color-untested-bg)", stroke: "var(--color-untested)", label: "Not Attempted" },
};

function resolveDisplayState(score: ConceptScoreLite | undefined): DisplayState {
  if (!score) return "notAttempted";
  if (score.state === "Strong") return "mastered";
  if (score.state === "Weak") return "attention";
  return score.numAnswered > 0 ? "partial" : "notAttempted";
}

/**
 * Greedy word-wrap into up to `maxLines` lines that fit `maxWidth` at
 * `fontSize`, for native SVG <text>/<tspan> (which doesn't auto-wrap).
 * Uses an average-character-width estimate rather than real text
 * measurement -- fine for this UI's short concept names, cheap, no
 * layout-thrashing getBBox() calls during render.
 */
function wrapLabel(text: string, maxWidth: number, fontSize: number, maxLines = 3): string[] {
  const avgCharW = fontSize * 0.56;
  const maxChars = Math.max(4, Math.floor(maxWidth / avgCharW));
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[maxLines - 1] = truncated[maxLines - 1].replace(/.{0,3}$/, "…");
    return truncated;
  }
  return lines;
}

/**
 * Returns only the nodes that should render for this theme, with each
 * node's `prerequisites` pruned down to ids that are ALSO in the visible
 * set -- so depth calculation and edge-drawing never reference a hidden
 * node.
 */
function getVisibleGraph(activeTheme?: ThemeId | null): ConceptGraphNode[] {
  if (!activeTheme) return CONCEPT_GRAPH;

  const inTheme = CONCEPT_GRAPH.filter((n) => n.theme === activeTheme);
  const inThemeIds = new Set(inTheme.map((n) => n.id));

  const bridgeIds = new Set<string>();
  for (const n of inTheme) {
    for (const p of n.prerequisites) {
      if (!inThemeIds.has(p)) bridgeIds.add(p);
    }
  }

  const visibleIds = new Set([...inThemeIds, ...bridgeIds]);

  return CONCEPT_GRAPH.filter((n) => visibleIds.has(n.id)).map((n) => ({
    ...n,
    prerequisites: n.prerequisites.filter((p) => visibleIds.has(p)),
  }));
}

// --- Layout constants ---
const NODE_W_MAX = 168;
const NODE_H = 54;
const NODE_GAP_MIN = 16;
const ROW_GAP = 118;
const TOP_MARGIN = 46;
const SIDE_MARGIN = 40;
const CANVAS_W = 1280;

interface PositionedNode extends ConceptGraphNode {
  x: number;
  y: number;
  width: number;
}

function layoutGraph(nodes: ConceptGraphNode[]): PositionedNode[] {
  const depths = computeDepths(nodes);
  const maxDepth = Math.max(...depths.values());

  const rows: string[][] = Array.from({ length: maxDepth + 1 }, () => []);
  for (const n of nodes) rows[depths.get(n.id)!].push(n.id);

  const positioned: PositionedNode[] = [];
  const usableW = CANVAS_W - SIDE_MARGIN * 2;

  rows.forEach((rowIds, rowIndex) => {
    const y = TOP_MARGIN + rowIndex * ROW_GAP + NODE_H / 2;
    const count = rowIds.length;
    if (count === 0) return;

    // Shrink node width (never below a readable floor) so a crowded row
    // never overlaps; sparse rows keep full-size nodes and center as a
    // cluster instead of stretching edge-to-edge.
    const naturalWidth = Math.min(
      NODE_W_MAX,
      (usableW - (count - 1) * NODE_GAP_MIN) / count
    );
    const width = Math.max(naturalWidth, 84);
    const rowWidth = count * width + (count - 1) * NODE_GAP_MIN;
    const startX = (CANVAS_W - rowWidth) / 2 + width / 2;

    rowIds.forEach((id, i) => {
      const x = startX + i * (width + NODE_GAP_MIN);
      const node = nodes.find((n) => n.id === id)!;
      positioned.push({ ...node, x, y, width });
    });
  });

  return positioned;
}

export function ConceptGraph({ conceptScores, activeTheme }: ConceptGraphProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const visibleGraph = useMemo(() => getVisibleGraph(activeTheme), [activeTheme]);
  const positioned = useMemo(() => layoutGraph(visibleGraph), [visibleGraph]);
  const byId = useMemo(() => new Map(positioned.map((n) => [n.id, n])), [positioned]);
  const scoresById = useMemo(
    () => new Map(conceptScores.map((s) => [s.conceptId, s])),
    [conceptScores]
  );

  const maxY = Math.max(...positioned.map((n) => n.y));
  const canvasH = maxY + TOP_MARGIN + NODE_H;

  const edges = positioned.flatMap((node) =>
    node.prerequisites
      .map((prereqId) => {
        const from = byId.get(prereqId);
        if (!from) return null;
        return { from, to: node, key: `${prereqId}->${node.id}` };
      })
      .filter(Boolean) as { from: PositionedNode; to: PositionedNode; key: string }[]
  );

  const isDimmed = (node: ConceptGraphNode) =>
    activeTheme != null && node.theme !== activeTheme;

  const hasDimmedNodes = positioned.some(isDimmed);

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "12px", fontSize: "13px" }}>
        {(Object.keys(DISPLAY_STYLES) as DisplayState[]).map((key) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: DISPLAY_STYLES[key].stroke,
                display: "inline-block",
              }}
            />
            <span className="text-ink-soft">{DISPLAY_STYLES[key].label}</span>
          </div>
        ))}
        {hasDimmedNodes && (
          <span className="text-ink-faint" style={{ fontSize: "12px" }}>
            (Faded nodes are prerequisites from your other theme -- not tested this session)
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${CANVAS_W} ${canvasH}`}
        width="100%"
        role="img"
        aria-label="Concept prerequisite graph, colored by mastery state"
      >
        {edges.map(({ from, to, key }) => {
          const dimmed = isDimmed(from) || isDimmed(to);
          return (
            <line
              key={key}
              x1={from.x}
              y1={from.y + NODE_H / 2}
              x2={to.x}
              y2={to.y - NODE_H / 2}
              stroke="var(--color-border)"
              strokeWidth={1.5}
              opacity={dimmed ? 0.3 : 0.6}
            />
          );
        })}

        {positioned.map((node) => {
          const score = scoresById.get(node.id);
          const displayState = resolveDisplayState(score);
          const style = DISPLAY_STYLES[displayState];
          const dimmed = isDimmed(node);
          const isHovered = hoveredId === node.id;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x - node.width / 2}, ${node.y - NODE_H / 2})`}
              opacity={dimmed ? 0.45 : 1}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId((cur) => (cur === node.id ? null : cur))}
              style={{ cursor: "default" }}
            >
              <title>
                {node.name}
                {score ? ` — ${style.label} (${score.numAnswered} answered)` : ` — ${style.label}`}
                {dimmed ? " — prerequisite from your other theme, not tested" : ""}
              </title>
              <rect
                width={node.width}
                height={NODE_H}
                rx={10}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isHovered ? 2.5 : 1.5}
              />
              {(() => {
                const fontSize = node.width < 120 ? 9.5 : 11;
                const lines = wrapLabel(node.name, node.width - 10, fontSize);
                const lineHeight = fontSize * 1.25;
                const centerX = node.width / 2;
                const totalHeight = lines.length * lineHeight;
                const firstLineY = NODE_H / 2 - totalHeight / 2 + lineHeight * 0.78;
                return lines.map((line, i) => (
                  <text
                    key={i}
                    x={centerX}
                    y={firstLineY + i * lineHeight}
                    textAnchor="middle"
                    fontSize={fontSize}
                    fontWeight={500}
                    fill="var(--color-ink, #1c2024)"
                  >
                    {line}
                  </text>
                ));
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}