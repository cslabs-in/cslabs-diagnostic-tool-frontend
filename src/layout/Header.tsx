import type { ReactNode } from "react";
import { Button } from "../components/ui/Button";

/**
 * Header -- per frontend-v1-decisions.md §7.1:
 *   - No user accounts: no name/avatar/profile control, ever.
 *   - At most ONE exit affordance (e.g. "Leave test"), never two.
 *
 * `onExit` is optional -- StartPage has nothing to exit from, so it simply
 * omits this prop rather than the header rendering an empty/disabled button.
 */
export interface HeaderProps {
  title?: string;
  onExit?: () => void;
  exitLabel?: string;
  /** Escape hatch for a page-specific right-side element other than exit
   * (rare -- most pages should just use onExit). Avoid adding a second
   * interactive control here without updating §7.1 first. */
  rightSlot?: ReactNode;
}

export function Header({
  title = "CSLabs Diagnostic",
  onExit,
  exitLabel = "Leave test",
  rightSlot,
}: HeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-border bg-card-bg px-6 py-4">
      <span className="text-base font-semibold text-ink">{title}</span>
      {rightSlot ?? (onExit && (
        <Button variant="ghost" onClick={onExit}>
          {exitLabel}
        </Button>
      ))}
    </header>
  );
}