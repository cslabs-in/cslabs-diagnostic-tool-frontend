import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Card -- the base surface used across QuestionCard, ReportBlock, concept
 * chips' containers, etc. Uses the locked `card` radius/shadow tokens from
 * frontend-v1-decisions.md §7.1 -- never a one-off radius or shadow value.
 *
 * `hover` adds the locked hover-shadow transition (150ms), for cards that
 * are themselves clickable (e.g. a theme-selection card on StartPage).
 * Leave it off for static cards (e.g. a question card body).
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-card border border-border bg-card-bg p-6 shadow-card",
          hover && "transition-shadow duration-150 hover:shadow-hover",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";