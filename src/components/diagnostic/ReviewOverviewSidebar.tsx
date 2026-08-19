import { useState } from "react";
import { cn } from "../../lib/cn";
import { getFocusConcepts, type ConceptResponse } from "./conceptResponse";

export interface ReviewOverviewSidebarProps {
  concepts: ConceptResponse[];
  remainingCount: number;
  selectedConceptId?: string;
  onSelectConcept: (conceptId: string) => void;
}

const PAGE_SIZE = 10;

/** Wide-screen orientation only. The compact rows preserve the central grid
 * as the detailed review surface, while still allowing a direct concept jump. */
export function ReviewOverviewSidebar({
  concepts,
  remainingCount,
  selectedConceptId,
  onSelectConcept,
}: ReviewOverviewSidebarProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const focusConcepts = getFocusConcepts(concepts);
  const completedConcepts = concepts
    .filter((concept) => concept.skippedCount + concept.unansweredCount === 0)
    .sort((a, b) => a.order - b.order);
  const orderedConcepts = [...focusConcepts, ...completedConcepts];
  const visibleConcepts = orderedConcepts.slice(0, visibleCount);
  const conceptsToRevisit = focusConcepts.length;

  return (
    <div className="space-y-5">
      <section className="rounded-card border border-skip-line bg-skip-bg/35 p-4 text-sm">
        <p className="font-semibold text-ink">Review overview</p>
        <p className="mt-1.5 leading-5 text-ink-soft">
          {remainingCount > 0
            ? `You may want to revisit ${remainingCount} question${remainingCount === 1 ? "" : "s"} across ${conceptsToRevisit} concept${conceptsToRevisit === 1 ? "" : "s"}.`
            : "Every question has a response or intentional skip."}
        </p>
      </section>

      <section className="rounded-card border border-border bg-card-bg p-4 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-ink">Filter by concept</h2>
            <p className="mt-1 text-xs text-ink-soft">Select one to filter questions.</p>
          </div>
      
        </div>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {visibleConcepts.map((concept) => (
            <li key={concept.conceptId}>
              <button
                type="button"
                onClick={() => onSelectConcept(concept.conceptId)}
                aria-label={`Filter questions by ${concept.conceptName}: ${concept.answeredCount} answered of ${concept.totalCount}`}
                aria-pressed={selectedConceptId === concept.conceptId}
                className={cn(
                  "w-full py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-inset",
                  selectedConceptId === concept.conceptId && "bg-mastered-bg/60",
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{concept.conceptName}</span>
                  <span className="shrink-0 text-[11px] text-ink-soft">{concept.answeredCount}/{concept.totalCount}</span>                  
                </div>
              </button>
            </li>
          ))}
        </ul>
        {visibleCount < orderedConcepts.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, orderedConcepts.length))}
            className="mt-3 inline-flex min-h-9 text-xs font-semibold text-mastered underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2"
          >
            Show {Math.min(PAGE_SIZE, orderedConcepts.length - visibleCount)} more
          </button>
        )}
      </section>
    </div>
  );
}
