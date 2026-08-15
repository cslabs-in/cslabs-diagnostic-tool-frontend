import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/cn";

/**
 * Button -- exactly three variants, per frontend-v1-decisions.md §7.1.
 * No other variants should be added without updating that doc first.
 *
 *   primary   -- filled, accent color. The default action on a page.
 *   secondary -- outline. A visible but non-default action.
 *   ghost     -- text only, no border/fill. Low-emphasis / tertiary action.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2 " +
  "text-sm font-medium transition-shadow duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2 " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  // In dark mode `mastered` is a lighter teal (reads as accent text on dark
  // surfaces), so the solid primary fill switches to dark text to keep
  // contrast -- see index.css's dark palette note.
  primary:
    "bg-mastered text-white shadow-card hover:shadow-hover dark:text-[#0d1f18]",
  secondary:
    "bg-transparent text-mastered border border-mastered-line hover:bg-mastered-bg",
  ghost: "bg-transparent text-ink-soft hover:bg-untested-bg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(base, variantClasses[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";