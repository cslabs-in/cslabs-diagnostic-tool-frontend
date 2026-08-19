import { CheckCircle2, Circle, FileText, Forward, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * ReviewSummaryCards
 *
 * The individual summary stat cards at the top of ReviewPage (design
 * reference: ReviewPage_v2.png -- the row of small cards above the filter
 * tabs). One card per question status, each with its own icon, count, and
 * label. Deliberately individual summaries only: the Concept Coverage
 * progress ring from the design reference is NOT rendered (per the v2
 * scope decision), so there is no consolidated/percent view up here.
 *
 * Status colors and icons mirror the ReviewQuestionTable status column:
 * Answered = green check, Skipped = amber Forward icon, Unanswered = gray
 * empty circle (the table's plain gray dot). Total questions reuses the
 * green accent with a document icon.
 */

interface SummaryCard {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Tint palette -- matches the status color language used elsewhere. */
  tone: "mastered" | "skip" | "untested";
}

export interface ReviewSummaryCardsProps {
  total: number;
  answeredCount: number;
  skippedCount: number;
  unansweredCount: number;
}

const TONE_CLASSES: Record<SummaryCard["tone"], string> = {
  mastered: "bg-mastered-bg text-mastered",
  skip: "bg-skip-bg text-skip",
  untested: "bg-untested-bg text-untested",
};

export function ReviewSummaryCards({
  total,
  answeredCount,
  skippedCount,
  unansweredCount,
}: ReviewSummaryCardsProps) {
  const cards: SummaryCard[] = [
    { label: "Total questions", value: total, icon: FileText, tone: "mastered" },
    { label: "Answered", value: answeredCount, icon: CheckCircle2, tone: "mastered" },
    { label: "Skipped", value: skippedCount, icon: Forward, tone: "skip" },
    { label: "Unanswered", value: unansweredCount, icon: Circle, tone: "untested" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="min-h-28 rounded-card border border-border bg-card-bg p-4 text-left shadow-card"
          >
            <span
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-btn",
                TONE_CLASSES[card.tone],
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-2 text-2xl font-bold text-ink">{card.value}</p>
            <p className="text-xs font-medium text-ink-soft">{card.label}</p>
          </div>
        );
      })}
    </div>
  );
}
