import type { ReactNode } from "react";

/**
 * Sidebar -- structural shell only. What goes INSIDE differs per page
 * (Diagnostic Guide on QuizPage, Summary stats on ReviewPage, aggregate
 * tallies on ReportPage, per §7.3/7.4/7.5) -- those are separate,
 * page-specific components built on top of this, not part of this file.
 *
 * Per §7.1 (updated 2026-08-03 -- see note below):
 *   - Pinned left at all supported widths where it's shown -- never moves
 *     to the top/stacks above Main.
 *   - Below 820px, the sidebar is HIDDEN entirely rather than narrowed --
 *     a narrow column reads as clumsy on real mobile widths. This is a
 *     change from the original "narrow, never hide" rule; the original
 *     rule's actual purpose was avoiding a stacked layout that forces
 *     whole-page scroll, which hiding doesn't reintroduce. Still open:
 *     whether any page's sidebar content (e.g. QuizPage's reassurance
 *     copy, §7.3) needs a compact mobile fallback elsewhere on the page --
 *     to be decided when that content is actually built, not here.
 *   - Scrolls independently if its content overflows; the page itself never
 *     scrolls as a whole.
 */
export interface SidebarProps {
  children: ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <aside className="hidden min-[821px]:block w-72 shrink-0 overflow-y-auto border-r border-border bg-page-bg p-6">
      {children}
    </aside>
  );
}