import { STATE_STYLES, type EngineConceptState } from "./stateStyles";
import type { ConceptScoreDTO } from "../../types/report";

/**
 * ReportSidebar
 *
 * ReportPage's sidebar. NOT the §7.5 card-era spec (state counts + a
 * separate correct/wrong/skipped question bar) -- that section is marked
 * superseded by §12, and the correct/wrong/skipped bar isn't naturally
 * derivable from `concept_scores` without extra client-side computation,
 * which would undercut §12's "zero new data plumbing" point.
 *
 * This is a fresh, minimal design: just a Mastered / Needs Attention /
 * Untested breakdown, reusing the exact same `conceptScores` data and the
 * exact same `stateStyles.ts` label/color mapping that `ConceptScoreChart`
 * already uses -- so the sidebar and chart never disagree on labels or
 * colors.
 */

export interface ReportSidebarProps {
  scores: ConceptScoreDTO[];
}

const STATE_ORDER: EngineConceptState[] = ["Strong", "Weak", "Untested"];

export function ReportSidebar({ scores }: ReportSidebarProps) {
  const counts: Record<EngineConceptState, number> = {
    Strong: 0,
    Weak: 0,
    Untested: 0,
  };
  for (const s of scores) {
    counts[s.state] += 1;
  }

  return (
    <div className="space-y-3 text-sm text-ink-soft">
      <p className="font-medium text-ink">At a glance</p>
      <div className="space-y-2">
        {STATE_ORDER.map((state) => {
          const style = STATE_STYLES[state];
          return (
            <div key={state} className="flex items-center justify-between">
              <span className={`font-medium ${style.textClass}`}>
                {style.label}
              </span>
              <span className="text-ink">{counts[state]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}