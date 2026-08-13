/**
 * Footer -- deliberately minimal. A quiet copyright line and nothing else:
 * no links, no account controls, no secondary navigation. The "progress is
 * auto-saved" reassurance lives on the QuizPage under the action bar where
 * it is actually noticed; the footer stays a low-emphasis close to the
 * shell (frontend-v1-decisions.md §7.1).
 */
export function Footer() {
  return (
    <footer className="flex shrink-0 items-center justify-center border-t border-border px-6 py-3 text-xs text-ink-faint">
      © 2026 CSLabs. All rights reserved.
    </footer>
  );
}
