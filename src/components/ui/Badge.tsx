import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Badge -- pill-shaped chip. Exactly two color variants are locked in
 * frontend-v1-decisions.md §7.1 -- no blue/purple/pink/orange chips without
 * a documented functional reason added to that doc first.
 *
 *   concept -- teal. Used for concept tags (e.g. "Implicit Type Conversion")
 *              on question cards and report items -- see design reference
 *              §3: the concept graph is the organizing structure, not a
 *              subject/section label.
 *   status  -- gray. Used for answered/skipped/etc. status chips.
 *
 * This is NOT where Strong/Weak/Untested concept-state coloring lives --
 * that's `components/report/stateStyles.ts`, since state chips use a
 * three-way mastered/attention/untested mapping, not this two-way one.
 */
export type BadgeVariant = "concept" | "status";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  concept: "bg-mastered-bg text-mastered border border-mastered-line",
  status: "bg-untested-bg text-ink-soft border border-untested-line",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = "concept", className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
          variantClasses[variant],
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";