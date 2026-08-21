import type { ReactNode } from "react";

/**
 * Footer -- deliberately minimal shell close, per frontend-v1-decisions.md
 * §7.1: a quiet copyright line and nothing else -- no links, no account
 * controls, no secondary navigation.
 *
 * QuizPage passes page-specific content via `children` (the auto-save
 * reassurance and the keyboard-shortcuts legend, per
 * designs/images/QuizPage_final.png). It renders in a main bar at the
 * bottom of the page, with the copyright staying a low-emphasis strip
 * BELOW that bar rather than crowding the legend on the same row. Every
 * other page passes nothing and gets just the copyright line, as before.
 */
export interface FooterProps {
  /** Page-specific footer content (QuizPage: auto-save + shortcuts). */
  children?: ReactNode;
  /** Replaces the default padded top-border treatment for page-specific
   * footer content. Custom content is responsible for its own borders and
   * spacing, such as ReviewPage's full-width action strip. */
  contentClassName?: string;
}

export function Footer({ children, contentClassName }: FooterProps) {
  return (
    <footer className="shrink-0">
      {children && (
        <div className={contentClassName ?? "border-t border-border px-6 py-3"}>{children}</div>
      )}
      <div className={`flex items-center justify-center ${contentClassName ? "" : "border-t border-border"} px-6 py-2 text-xs text-ink-faint`}>
        © 2026 CSLabs. All rights reserved.
      </div>
    </footer>
  );
}
