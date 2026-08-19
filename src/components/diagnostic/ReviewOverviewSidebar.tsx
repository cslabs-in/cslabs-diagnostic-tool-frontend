import { useState } from "react";
import { cn } from "../../lib/cn";
import { Card } from "../ui/Card";
import type { ConceptResponse } from "./conceptResponse";

export interface ReviewOverviewSidebarProps {
  concepts: ConceptResponse[];
  selectedConceptId?: string;
  onSelectConcept: (conceptId: string) => void;
}

const PAGE_SIZE = 10;

interface ConceptGroup {
  key: string;
  label: string;
  concepts: ConceptResponse[];
}

/** Wide-screen orientation only. The compact rows preserve the central grid
 * as the detailed review surface, while still allowing a direct concept jump. */
export function ReviewOverviewSidebar({
  concepts,
  selectedConceptId,
  onSelectConcept,
}: ReviewOverviewSidebarProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const orderedConcepts = [...concepts].sort(compareConcepts);
  const visibleConcepts = orderedConcepts.slice(0, visibleCount);
  const visibleGroups = groupVisibleConcepts(visibleConcepts);

  return (
    <Card className="p-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mastered">
          Concept filter
        </p>
        <h2 className="mt-1 text-sm font-semibold text-ink">Filter by concept</h2>
        <p className="mt-1 text-xs text-ink-soft">Select one to filter questions.</p>
      </div>
      {visibleGroups.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-soft">No concepts available.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {visibleGroups.map((group) => (
            <section key={group.key} aria-label={group.label}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
                {group.label} answered
              </p>
              <div className="mt-2 border-t border-border" />
              <ul className="divide-y divide-border">
                {group.concepts.map((concept) => (
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
                      <AnsweredProgressRail
                        answeredCount={concept.answeredCount}
                        totalCount={concept.totalCount}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      {visibleCount < orderedConcepts.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, orderedConcepts.length))}
          className="mt-4 inline-flex min-h-9 text-xs font-semibold text-mastered underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2"
        >
          Show {Math.min(PAGE_SIZE, orderedConcepts.length - visibleCount)} more
        </button>
      )}
    </Card>
  );
}

function compareConcepts(a: ConceptResponse, b: ConceptResponse): number {
  const aRatio = a.totalCount > 0 ? a.answeredCount / a.totalCount : 0;
  const bRatio = b.totalCount > 0 ? b.answeredCount / b.totalCount : 0;
  if (aRatio !== bRatio) return aRatio - bRatio;
  if (a.answeredCount !== b.answeredCount) return a.answeredCount - b.answeredCount;
  if (a.totalCount !== b.totalCount) return a.totalCount - b.totalCount;

  const aComplete = a.answeredCount === a.totalCount;
  const bComplete = b.answeredCount === b.totalCount;
  if (aComplete && bComplete) return a.order - b.order;

  const aPriority = a.unansweredCount > 0 ? 0 : a.skippedCount > 0 ? 1 : 2;
  const bPriority = b.unansweredCount > 0 ? 0 : b.skippedCount > 0 ? 1 : 2;
  return aPriority - bPriority || a.order - b.order;
}

function groupVisibleConcepts(concepts: ConceptResponse[]): ConceptGroup[] {
  const groups = new Map<string, ConceptGroup>();
  for (const concept of concepts) {
    const key = `${concept.answeredCount}/${concept.totalCount}`;
    const existing = groups.get(key);
    if (existing) existing.concepts.push(concept);
    else {
      groups.set(key, {
        key,
        label: `${concept.answeredCount} / ${concept.totalCount}`,
        concepts: [concept],
      });
    }
  }
  return [...groups.values()];
}

function AnsweredProgressRail({
  answeredCount,
  totalCount,
}: {
  answeredCount: number;
  totalCount: number;
}) {
  const percent = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
  return (
    <span
      role="progressbar"
      aria-label={`${answeredCount} of ${totalCount} questions answered`}
      aria-valuemin={0}
      aria-valuemax={totalCount}
      aria-valuenow={answeredCount}
      className="relative mt-1.5 block h-2"
    >
      <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-untested-line" aria-hidden="true" />
      <span
        className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-mastered transition-all duration-150 motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      />
    </span>
  );
}
