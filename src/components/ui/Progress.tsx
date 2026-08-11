import { cn } from "../../lib/cn";

/**
 * Progress -- simple determinate bar, used for the QuizPage question
 * progress and any other "N of M" indicator.
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
  label?: string; // optional visible text, e.g. "Question 3 of 10"
}

export function Progress({ value, max, className, label }: ProgressProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("w-full", className)}>
      {label && <div className="mb-1 text-xs text-ink-soft">{label}</div>}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className="h-2 w-full overflow-hidden rounded-full bg-untested-bg"
      >
        <div
          className="h-full rounded-full bg-mastered transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}