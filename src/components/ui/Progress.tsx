import { cn } from "../../lib/cn";
import { CircularProgress } from "./CircularProgress";

/**
 * Progress -- the question-progress row at the top of the QuizPage content
 * column. Three elements, vertically centered, left to right:
 *
 *   - Left:  bold "Question X of Y" counter (dark ink)
 *   - Middle: linear bar (flex-fills the space) -- light track, teal fill
 *   - Right:  circular "Z% complete" ring with a small label below
 *
 * The linear bar keeps its existing placement (inside the content column,
 * not a full-width strip); the circular ring on the right follows the
 * QuizPage design reference (designs/images/QuizPage.png) for its display.
 *
 * No timer/countdown semantics here (design reference §2 / §7.1: no timer
 * anywhere in the product) -- this only ever represents count-based
 * progress (e.g. question 3 of 10), never elapsed or remaining time.
 *
 * Transition duration is the locked 300ms "progress" animation value from
 * §7.1 -- do not change independently of that doc.
 */
export interface ProgressProps {
  value: number; // current step, e.g. 3
  max: number; // total steps, e.g. 10
  className?: string;
  /** Optional visible counter, e.g. "Question 3 of 10" -- rendered bold on the left. */
  label?: string;
  /** Label under the circular ring. Defaults to "Overall Progress". */
  ringLabel?: string;
}

export function Progress({
  value,
  max,
  className,
  label,
  ringLabel = "Overall Progress",
}: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("flex items-center gap-8", className)}>
      {label && <p className="shrink-0 text-sm font-bold text-ink">{label}</p>}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 flex-1 overflow-hidden rounded-full bg-untested-bg"
      >
        <div
          className="h-full rounded-full bg-mastered transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>

      <CircularProgress percent={percent} label={ringLabel} />
    </div>
  );
}
