import { useImperativeHandle, useState, type ReactNode, type Ref } from "react";
import { Grip, Info } from "lucide-react";
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
 * overlays Main (absolute, out of flow) so the quiz content uses the full
 * width while the drawer is closed. Per designs/images/QuizPage_final.png
 * it opens via an explicit Guide trigger -- a light vertical icon button
 * (info icon + rotated "Guide" label) on a thin, slightly shaded strip at
 * the left edge, with a small gray grip icon just above it. The drawer
 * opens when the cursor is placed on the Guide button and stays open
 * while the cursor remains on the button or the drawer; clicking the
 * button pins it open (click again to unpin). The drawer slides out
 * beside the strip (not under it), so the Guide button stays reachable to
 * close it again.
 *
 * `visible` force-opens the drawer without any trigger -- QuizPage keeps
 * it open for the first question only. The Guide trigger (strip + grip +
 * button) is always rendered, including while `visible` is set; the first
 * click on the Guide button dismisses the force-opened drawer, after which
 * the normal open/hover/pin behavior applies.
 */
/**
 * SidebarHandle -- imperative control for the auto-hide drawer, exposed via
 * `ref` so the page can drive it without reaching into the drawer's
 * internals (QuizPage's "G" shortcut toggles it this way).
 */
export interface SidebarHandle {
  /** Toggle the drawer open/closed. Mirrors the Guide trigger's click:
   * the first press while the page force-opens it (`visible`, Q1)
   * dismisses it; after that it pins/unpins. */
  toggle: () => void;
}

export interface SidebarProps {
  children: ReactNode;
  /** Auto-hide mode: hidden by default, opens when the Guide trigger is
   * hovered (stays open while the cursor is on the button or the drawer)
   * or clicked to pin (click again to unpin). Overlays Main while
   * closed. */
  autoHide?: boolean;
  /** Force the sidebar open regardless of the trigger. Only meaningful
   * with `autoHide` (QuizPage shows it on the first question only). */
  visible?: boolean;
  /** Imperative handle for external control (QuizPage's "G" shortcut). */
  ref?: Ref<SidebarHandle>;
}

export function Sidebar({
  children,
  autoHide = false,
  visible = false,
  ref,
}: SidebarProps) {
  const [open, setOpen] = useState(false);
  // True while the cursor is over the Guide button or the open drawer; the
  // drawer stays open until the cursor leaves both (unless click-pinned).
  const [hovering, setHovering] = useState(false);
  // True once the user has explicitly closed the force-opened drawer
  // (`visible`) with the Guide button. `visible` stops forcing the drawer
  // open after that first click, so the user isn't stuck with it; the
  // dismissal lasts for the session (re-visiting question 1 won't pop it
  // open again over their explicit choice).
  const [dismissed, setDismissed] = useState(false);
  // Detects when the page stops force-opening the drawer (`visible` flips
  // off, QuizPage moving past question 1), so any pin set while it was
  // force-open is reset -- every other question starts with the drawer
  // closed. Adjusted during render (the React docs' "adjust state when a
  // prop changes" pattern) rather than in an effect, per
  // react-hooks/set-state-in-effect.
  const [prevVisible, setPrevVisible] = useState(visible);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible && open) setOpen(false);
  }

  // Shared by the Guide trigger's click and the imperative `toggle` handle
  // (QuizPage's "G" shortcut): the first press while the page force-opens
  // the drawer (`visible`, Q1) dismisses it -- closes it and hands control
  // back to the normal open/pin state; subsequent presses pin/unpin.
  function toggleGuide() {
    if (visible && !dismissed) setDismissed(true);
    else setOpen((o) => !o);
  }

  // Expose the toggle for external callers. Recreated every render so the
  // handle always captures fresh `visible`/`dismissed` state.
  useImperativeHandle(ref, () => ({ toggle: toggleGuide }));

  // Default pinned mode -- unchanged from before. In dark mode the panel
  // gets a lighter neutral surface (same family as the Guide strip) so it
  // stays visible against the page background -- `page-bg` alone and the
  // soft shadow are both near-invisible on dark.
  if (!autoHide) {
    return (
      <aside className="hidden min-[821px]:block w-80 shrink-0 overflow-y-auto bg-page-bg p-6 dark:bg-untested-bg">
        {children}
      </aside>
    );
  }

  const isOpen = (visible && !dismissed) || open || hovering;

  return (
    <>
      {/* Left-edge drawer strip + Guide trigger -- the only way the drawer
          opens. The strip is a thin, slightly shaded vertical bar that
          hints at the drawer behind it; inside it, the small gray grip
          icon sits just above the Guide button -- info icon + rotated
          "Guide" label on a light background -- and the pair is centered
          vertically with a comfortable margin between them. The drawer
          opens on hover over the button and stays open while the cursor
          is on the button or the drawer; clicking pins it open (click
          again to unpin). The strip sits at z-60, above the drawer
          (z-50), so the Guide button stays clickable even while the
          closed drawer's tail still overlaps the strip's column. Always
          rendered -- including while `visible` (QuizPage Q1) force-opens
          the drawer. */}
      <div className="hidden min-[821px]:flex absolute inset-y-0 left-0 z-60 w-14 flex-col items-center border-r border-border bg-untested-bg">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Grip
            className="h-4 w-4 shrink-0 text-ink-faint"
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={toggleGuide}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            aria-expanded={isOpen}
            aria-controls="diagnostic-guide-drawer"
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border py-3 border-border bg-mastered-bg px-2 text-mastered shadow-card",
              "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
              isOpen && "border-mastered-line bg-mastered-bg",
            )}
          >
            <Info className="h-4 w-4 mb-2 shrink-0" aria-hidden="true" />
            {/* Vertical label, read bottom-to-top ("rotated upwards") -- the
                classic vertical-tab look from the design reference.
                `-rotate-90` (stock utility) instead of writing-mode, which
                Tailwind v4.3 doesn't ship. */}
            <span className="-rotate-90 text-xs font-semibold tracking-wide mb-2">
              Guide
            </span>
          </button>
        </div>
      </div>

      {/* Slides out beside the strip (left-14 matches the strip's w-14), so
          the Guide button stays visible and clickable while it's open. The
          drawer stays open while the cursor is on it (or on the Guide
          button); leaving both closes it unless it was click-pinned. */}
      <aside
        id="diagnostic-guide-drawer"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={cn(
          // `page-bg` + the soft shadow separate the drawer in light mode;
          // both are near-invisible on dark, so the drawer surface lifts to
          // the lighter neutral panel token there (same as the strip).
          "hidden min-[821px]:block absolute inset-y-0 left-14 z-50 w-80 overflow-y-auto bg-page-bg p-6 shadow-hover dark:bg-untested-bg",
          "transition-transform duration-200 ease-out motion-reduce:transition-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {children}
      </aside>
    </>
  );
}
