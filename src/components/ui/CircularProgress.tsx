import { cn } from "../../lib/cn";

/**
 * CircularProgress -- the "X% complete" ring shown on the right side of the
 * QuizPage progress row, per the QuizPage design reference
 * (designs/images/QuizPage.png -- used only to understand how the ring is
 * displayed; the linear bar keeps its existing placement in the content
 * column).
 *
 * Geometry:
 *   - Compact 40px ring (diameter) with a 6px stroke so the row stays close
 *     to the original progress-bar height above the question card.
 *   - light gray track + brand-teal arc (same colors as the linear bar)
 *   - centered percent in dark ink (semibold)
 *   - small gray label centered below the ring
 *
 * The percent is rounded for display (and the arc is drawn from the same
 * rounded value) so the ring never shows long decimals like 33.333333...
 * The arc uses stroke-dasharray on a full circle so 0% and 100% both render
 * cleanly (no degenerate path), and the 300ms transition matches the linear
 * bar's locked §7.1 "progress" animation value.
 *
 * The label is absolutely positioned below the ring so it never contributes
 * to the block height -- the ring (and its centered %) stays on the same
 * vertical centerline as the linear bar and counter.
 */
export interface CircularProgressProps {
  /** Percentage 0-100. */
  percent: number;
  /** Label rendered below the ring. */
  label?: string;
  /** Ring diameter in px. Defaults to 40 (compact, keeps the row height). */
  size?: number;
  /** Ring stroke width in px. Defaults to 6. */
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  percent,
  label,
  size = 45,
  strokeWidth = 6,
  className,
}: CircularProgressProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  // Round for display so 2/6 -> "33%" not "33.333333333333336%".
  const display = Math.round(clamped);
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const dash = (display / 100) * circumference;
  // Centered percent text scales with the ring, with a small floor so it
  // stays legible at compact sizes.
  const fontSize = Math.max(14, Math.round(size * 0.19));

  return (
    <div className={cn("relative flex shrink-0 flex-col items-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={label ? `${display}% ${label}` : `${display}% complete`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-untested-bg"
        />
        {display > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="stroke-mastered transition-all duration-300"
          />
        )}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontSize }}
          className="fill-ink font-semibold"
        >
          {display}%
        </text>
      </svg>
      {label && (
        <p className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-xs leading-none text-ink-soft">
          {label}
        </p>
      )}
    </div>
  );
}
