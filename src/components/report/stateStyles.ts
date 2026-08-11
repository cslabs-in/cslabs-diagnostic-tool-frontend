/**
 * stateStyles.ts
 *
 * The engine's `ConceptState` enum (scoring.py) has three values: "Strong",
 * "Weak", "Untested". frontend-v1-decisions.md §7.1 locks a display-layer
 * rename to reinforce diagnostic framing over pass/fail framing:
 *
 *   Strong   -> "Mastered"
 *   Weak     -> "Needs Attention"
 *   Untested -> "Untested"      (unchanged)
 *
 * This is a DISPLAY-LAYER rename only. Do not rename the type or the API
 * values themselves -- `ConceptScore.state` from the backend keeps sending
 * "Strong" / "Weak" / "Untested" exactly as scoring.py defines them. This
 * file is the single place that maps those engine strings to what the
 * student actually sees (label + color classes). No component should
 * inline this mapping itself -- import from here instead.
 *
 * "Pending" (report-level, a Weak concept blocked on an Untested
 * prerequisite -- see traversal.py's PendingItem) and "Skipped" (a
 * per-question answer status, selected_option: null) are NOT part of this
 * three-way mapping -- they're separate concepts entirely and have their
 * own colors in the token set (skip-*). Don't try to add them here.
 */

// Matches the backend's ConceptScore.state string exactly -- see
// GET /sessions/{id}/report's concept_scores[].state in the report
// endpoint, and scoring.py's ConceptState enum values.
export type EngineConceptState = "Strong" | "Weak" | "Untested";

export interface StateStyle {
  label: string;
  textClass: string;
  bgClass: string;
  lineClass: string;
}

export const STATE_STYLES: Record<EngineConceptState, StateStyle> = {
  Strong: {
    label: "Mastered",
    textClass: "text-mastered",
    bgClass: "bg-mastered-bg",
    lineClass: "border-mastered-line",
  },
  Weak: {
    label: "Needs Attention",
    textClass: "text-attention",
    bgClass: "bg-attention-bg",
    lineClass: "border-attention-line",
  },
  Untested: {
    label: "Untested",
    textClass: "text-untested",
    bgClass: "bg-untested-bg",
    lineClass: "border-untested-line",
  },
};

export function getStateStyle(state: EngineConceptState): StateStyle {
  return STATE_STYLES[state];
}