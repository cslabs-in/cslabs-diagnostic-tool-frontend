import { useState, type ReactNode } from "react";
import { cn } from "../lib/cn";

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
 *
 * `autoHide` (QuizPage only): the sidebar normally sits off-screen and
 * slides in when the cursor touches the left edge of the screen, sliding
 * back out when the cursor leaves it. In this mode the sidebar overlays
 * Main (absolute, out of flow) so the quiz content uses the full width
 * while the drawer is closed. `visible` force-opens it without hover --
 * QuizPage keeps it open for the first question only.
 */
export interface SidebarProps {
  children: ReactNode;
  /** Auto-hide mode: hidden by default, slides in on left-edge hover,
   * slides out when the cursor leaves. Overlays Main while closed. */
  autoHide?: boolean;
  /** Force the sidebar open regardless of hover. Only meaningful with
   * `autoHide` (QuizPage shows it on the first question only). */
  visible?: boolean;
}

export function Sidebar({ children, autoHide = false, visible = false }: SidebarProps) {
  const [hovered, setHovered] = useState(false);

  // Default pinned mode -- unchanged from before.
  if (!autoHide) {
    return (
      <aside className="hidden min-[821px]:block w-80 shrink-0 overflow-y-auto bg-page-bg p-6">
        {children}
      </aside>
    );
  }

  const isOpen = visible || hovered;

  return (
    <>
      {/* Invisible hover zone at the left edge -- opens the drawer when the
          cursor touches it. No mouse-leave here: opening stays sticky until
          the cursor actually leaves the drawer itself. */}
      <div
        className="hidden min-[821px]:block absolute inset-y-0 left-0 z-40 w-3"
        onMouseEnter={() => setHovered(true)}
        aria-hidden="true"
      />

      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "hidden min-[821px]:block absolute inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-page-bg p-6 shadow-hover",
          "transition-transform duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </aside>
    </>
  );
}
