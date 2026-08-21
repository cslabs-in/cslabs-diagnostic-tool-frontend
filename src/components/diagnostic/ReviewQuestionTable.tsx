import { useState, type KeyboardEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Forward,
} from "lucide-react";
import { Badge } from "../ui/Badge";
import { cn } from "../../lib/cn";
import { getRowStatus } from "../../lib/reviewStatus";
import type { RowStatus } from "../../lib/reviewStatus";
import type { Answer, Question } from "../../types/diagnostic";

/**
 * ReviewQuestionTable -- a dense table from md upward and calm answer cards
 * on phones. Each row/card routes back into the quiz so reviewing a response
 * is direct and the chevron remains a quiet directional cue.
 *
 * Paginates when the row count exceeds `pageSize` (default 20 -- the
 * current 12-question themes stay on a single page, matching the design
 * reference, while 100s-scale question banks get a footer bar with a
 * "Showing X-Y of Z" count, a per-page selector (20/50/100), and
 * windowed page buttons). Switching tabs (a different question set)
 * resets to page 1; changing the sort keeps the page position since the
 * same questions are just reordered. Changing the page size preserves
 * the first visible row across the resize.
 *
 * Status visuals follow the design reference: Answered = green check pill,
 * Skipped = amber forward (skip) icon pill, Unanswered = gray Circle icon +
 * plain text (the same icon as the ReviewSummaryCards stat, so the two
 * stay consistent). NO correctness (right/wrong) anywhere -- the engine
 * doesn't expose per-question correctness, only concept-level state.
 */
export interface ReviewQuestionTableProps {
  /** Question plus its index in the FULL question list -- filtered tabs
   * (Answered/Skipped/Unanswered) must keep the real index so Q numbers
   * stay stable and the Action button routes back to the right question. */
  rows: Array<{ question: Question; index: number }>;
  answers: Record<string, Answer>;
  onEdit: (index: number) => void;
  /** Rows per page. Defaults to 20. */
  pageSize?: number;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

/** Windowed page list -- 1 … 4 5 6 … 12 for large page counts, every page
 * number when there are few. -1 marks an ellipsis gap. */
function getPageItems(page: number, totalPages: number): (number | -1)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const wanted = new Set([1, 2, page - 1, page, page + 1, totalPages - 1, totalPages]);
  const nums = [...wanted]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);
  const items: (number | -1)[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) items.push(-1);
    items.push(n);
    prev = n;
  }
  return items;
}

export function ReviewQuestionTable({
  rows,
  answers,
  onEdit,
  pageSize = 20,
}: ReviewQuestionTableProps) {
  // Page state is keyed to the question SET (order-independent), so a tab
  // switch -- a different set -- implicitly falls back to page 1 without an
  // effect, while changing the sort keeps the page position since the same
  // questions are just reordered. Clamping covers the case where the set
  // shrinks to fewer pages.
  const questionSetKey = [...new Set(rows.map((r) => r.question.questionId))]
    .sort()
    .join(",");
  const [pageState, setPageState] = useState({ key: questionSetKey, page: 1 });
  const [pageSizeState, setPageSizeState] = useState(pageSize);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSizeState));
  const requestedPage = pageState.key === questionSetKey ? pageState.page : 1;
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * pageSizeState;

  function goToPage(p: number) {
    setPageState({ key: questionSetKey, page: p });
  }

  function changePageSize(newSize: number) {
    // Keep the first visible row in view across the resize: e.g. viewing
    // rows 21-40 at 20/page and switching to 50/page lands on page 1.
    const firstVisible = (currentPage - 1) * pageSizeState;
    setPageSizeState(newSize);
    setPageState({ key: questionSetKey, page: Math.floor(firstVisible / newSize) + 1 });
  }

  function handleRowKeyDown(event: KeyboardEvent, index: number) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onEdit(index);
    }
  }
  const visibleRows = rows.slice(start, start + pageSizeState);
  // Keep the bar visible once the user opts into a non-default page size,
  // even if everything fits on one page -- otherwise the per-page selector
  // (and the way back to the default) would disappear. Untouched views
  // keep the design's clean single-page look with no footer at all.
  const showPagination = rows.length > pageSizeState || pageSizeState !== pageSize;

  const iconButtonClasses = cn(
    "inline-flex h-8 w-8 items-center justify-center rounded-btn border border-border text-ink-soft transition-colors duration-150",
    "hover:border-mastered-line hover:bg-mastered-bg hover:text-mastered",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
  );

  return (
    <div className="overflow-hidden rounded-card border border-border bg-card-bg">
      <div className="hidden md:block">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-semibold uppercase tracking-wide text-ink-faint">
            <th scope="col" className="px-4 py-3 font-semibold">
              Question
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Concept
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Your response
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">
              <span className="sr-only">Review</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-sm text-ink-soft"
              >
                No questions in this view.
              </td>
            </tr>
          ) : (
            visibleRows.map(({ question, index }) => {
              const status = getRowStatus(answers, question.questionId);
              return (
                <tr
                  key={question.questionId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Review question Q${index + 1}`}
                  onClick={() => onEdit(index)}
                  onKeyDown={(event) => handleRowKeyDown(event, index)}
                  className="group cursor-pointer transition-colors duration-150 hover:bg-page-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mastered"
                >
                  <td className="px-4 py-3 text-xs font-bold text-ink-soft">
                    Q{index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="concept">{question.conceptName}</Badge>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink">
                    {status === "answered"
                      ? answers[question.questionId]!.selectedOption
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusCell status={status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight
                      className="ml-auto h-5 w-5 text-ink-faint transition-transform duration-150 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      </div>

      <div className="divide-y divide-border md:hidden">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-ink-soft">
            No questions in this view.
          </p>
        ) : (
          visibleRows.map(({ question, index }) => {
            const status = getRowStatus(answers, question.questionId);
            const response = status === "answered"
              ? answers[question.questionId]!.selectedOption
              : "No response selected";
            return (
              <article
                key={question.questionId}
                role="button"
                tabIndex={0}
                aria-label={`Review question Q${index + 1}`}
                onClick={() => onEdit(index)}
                onKeyDown={(event) => handleRowKeyDown(event, index)}
                className="cursor-pointer space-y-3 p-4 transition-colors duration-150 hover:bg-page-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-mastered"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">Question {index + 1}</p>
                    <div className="mt-2"><Badge variant="concept">{question.conceptName}</Badge></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusCell status={status} />
                    <ChevronRight className="h-5 w-5 shrink-0 text-ink-faint" aria-hidden="true" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-btn bg-page-bg px-3 py-2 text-sm">
                  <span className="text-ink-soft">Your response</span>
                  <span className="font-semibold text-ink">{response}</span>
                </div>
              </article>
            );
          })
        )}
      </div>

      {showPagination && rows.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-xs text-ink-soft">
              Showing {start + 1}–{Math.min(start + pageSizeState, rows.length)} of{" "}
              {rows.length}
            </p>
            <label className="inline-flex items-center gap-2 text-xs text-ink-soft">
              <span className="whitespace-nowrap">Per page</span>
              <span className="relative inline-flex">
                <select
                  value={pageSizeState}
                  onChange={(e) => changePageSize(Number(e.target.value))}
                  aria-label="Rows per page"
                  className={cn(
                    "appearance-none rounded-btn border border-border bg-card-bg py-1 pl-2.5 pr-7 text-xs font-medium text-ink transition-colors duration-150",
                    "hover:border-mastered-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
                  )}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint"
                  aria-hidden="true"
                />
              </span>
            </label>
          </div>
          <nav className="flex items-center gap-1" aria-label="Pagination">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className={iconButtonClasses}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {getPageItems(currentPage, totalPages).map((item, i) =>
              item === -1 ? (
                <span
                  key={`gap-${i}`}
                  className="px-1 text-xs text-ink-faint"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => goToPage(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={cn(
                    "h-8 min-w-8 rounded-btn border px-2 text-xs font-semibold transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
                    item === currentPage
                      ? "border-mastered bg-mastered text-white"
                      : "border-border bg-card-bg text-ink-soft hover:border-mastered-line hover:bg-mastered-bg hover:text-mastered",
                  )}
                >
                  {item}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className={iconButtonClasses}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

/** Status cell per the design reference: colored pills for Answered and
 * Skipped, a gray Circle icon + label for Unanswered (matching the
 * ReviewSummaryCards stat). */
function StatusCell({ status }: { status: RowStatus }) {
  if (status === "answered") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-mastered-line bg-mastered-bg px-2.5 py-1 text-xs font-medium text-mastered">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
        Answered
      </span>
    );
  }
  if (status === "skipped") {
    // Forward (fast-forward) icon in the skip palette -- reads as "moved
    // past this one", distinct from Answered's check and Unanswered's dot.
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-skip-line bg-skip-bg px-2.5 py-1 text-xs font-medium text-skip">
        <Forward className="h-3.5 w-3.5" aria-hidden="true" />
        Skipped
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <Circle className="h-3.5 w-3.5 text-untested" aria-hidden="true" />
      Unanswered
    </span>
  );
}
