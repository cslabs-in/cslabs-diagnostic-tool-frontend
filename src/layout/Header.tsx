import type { ReactNode } from "react";
import { Brain, LogOut } from "lucide-react";

/**
 * Header -- per frontend-v1-decisions.md §7.1:
 *   - No user accounts: no name/avatar/profile control, ever.
 *   - At most ONE exit affordance (e.g. "Leave Diagnostic"), never two.
 *
 * Layout follows the QuizPage design reference (designs/images/QuizPage.png):
 *   - Left: brand block -- brain logo, "CSLabs | Veridex Diagnostic", and
 *     the "Know yourself. Plan better." tagline. "Diagnostic" is set one
 *     weight lighter so the brand reads "CSLabs | Veridex" first.
 *   - Beside the brand, set off by a light vertical rule: the current-theme
 *     summary (label + theme name + question count), left-aligned, shown
 *     once a theme is active (themeName/questionCount provided).
 *   - Right: the single exit affordance (teal ghost-style button with a
 *     LogOut icon), or a page-specific rightSlot escape hatch.
 */
export interface HeaderProps {
  /** Display name of the active theme (e.g. "Data Representation"). */
  themeName?: string;
  /** Question count for the active theme. */
  questionCount?: number;
  onExit?: () => void;
  exitLabel?: string;
  /** Escape hatch for a page-specific right-side element other than exit
   * (rare -- most pages should just use onExit). Avoid adding a second
   * interactive control here without updating §7.1 first. */
  rightSlot?: ReactNode;
}

export function Header({
  themeName,
  questionCount,
  onExit,
  exitLabel = "Leave Diagnostic",
  rightSlot,
}: HeaderProps) {
  return (
    <header className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-border bg-card-bg px-4 py-3 sm:px-6 sm:py-4">
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 shrink-0 text-mastered sm:h-10 sm:w-10" aria-hidden="true" />
        <div className="leading-tight">
          <p className="text-sm font-semibold text-ink sm:text-base">
            CSLabs | Veridex <span className="font-medium">Diagnostic</span>
          </p>
          <p className="hidden text-xs text-ink-soft min-[420px]:block">Know yourself. Plan better.</p>
        </div>
      </div>

      {themeName && (
        <div className="order-3 basis-full border-t border-border pt-2 leading-tight sm:order-none sm:ml-6 sm:basis-auto sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
          <p className="text-xs text-ink-faint">Current Theme</p>
          <p className="text-sm font-semibold text-ink">{themeName}</p>
          <p className="text-xs text-ink-faint">{questionCount} questions</p>
        </div>
      )}

      <div className="ml-auto">
        {rightSlot ?? (onExit && (
          // Mirrors Button's ghost variant but in the brand teal (a one-off
          // control, so it stays inline rather than adding a 4th Button
          // variant -- decisions doc §7.1 locks exactly three).
          <button
            type="button"
            onClick={onExit}
            aria-label={exitLabel}
            className="inline-flex min-h-11 items-center gap-2 rounded-btn px-3 py-1.5 text-sm font-semibold text-mastered transition-colors duration-150 hover:bg-mastered-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2 sm:px-4"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
            <span className="hidden sm:inline">{exitLabel}</span>
          </button>
        ))}
      </div>
    </header>
  );
}
