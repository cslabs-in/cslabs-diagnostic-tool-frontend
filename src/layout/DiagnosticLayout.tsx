import type { ReactNode, Ref } from "react";
import { Header, type HeaderProps } from "./Header";
import { Sidebar, type SidebarHandle } from "./Sidebar";
import { Footer } from "./Footer";

/**
 * DiagnosticLayout -- the shared shell for all four V1 pages, per
 * frontend-v1-decisions.md §7.1:
 *
 *   - Fixed 100vh, no whole-page scroll. Header and Footer never scroll;
 *     Sidebar and Main scroll independently if their own content overflows.
 *   - Sidebar content is page-specific and passed in via the `sidebar` prop
 *     (Diagnostic Guide on QuizPage, Summary stats on ReviewPage, aggregate
 *     tallies on ReportPage -- see §7.3/7.4/7.5). StartPage passes no
 *     sidebar at all, in which case Main simply takes the full width rather
 *     than leaving an empty column.
 *
 * Usage:
 *   <DiagnosticLayout sidebar={<DiagnosticGuideSidebar />} onExit={...}>
 *     <QuestionCard ... />
 *   </DiagnosticLayout>
 *
 *   <DiagnosticLayout>          // StartPage -- no sidebar
 *     <ThemeSelector ... />
 *   </DiagnosticLayout>
 */
export interface DiagnosticLayoutProps
  extends Pick<HeaderProps, "themeName" | "questionCount" | "onExit" | "exitLabel" | "rightSlot"> {
  sidebar?: ReactNode;
  /** Show the pinned sidebar only on wide desktop layouts. ReviewPage uses
   * this so the question grid stays primary on tablet widths. */
  sidebarWideOnly?: boolean;
  /** Hide the pinned sidebar's native scrollbar while keeping it scrollable.
   * ReviewPage uses this for its compact desktop overview. */
  sidebarHideScrollbar?: boolean;
  /** Override the default w-80 sidebar width with responsive classes. */
  sidebarWidthClassName?: string;
  /** Optional page-level context rendered below the app header and above the
   * independently scrollable workspace. */
  pageContext?: ReactNode;
  /** Optional right sidebar, rendered as a supporting column on wide
   * screens. ReviewPage keeps its primary work area readable on tablets, so
   * this panel intentionally appears only from the xl layout upward. */
  rightSidebar?: ReactNode;
  /** Auto-hide the sidebar (QuizPage only): hidden by default, slides in
   * when the cursor touches the left edge of the screen. */
  sidebarAutoHide?: boolean;
  /** Force the sidebar open without hover (QuizPage: first question only). */
  sidebarVisible?: boolean;
  /** Imperative handle into the sidebar (QuizPage's "G" shortcut toggles
   * the auto-hide drawer through this). */
  sidebarRef?: Ref<SidebarHandle>;
  /** Page-specific footer content (QuizPage: auto-save reassurance +
   * keyboard-shortcuts legend), rendered above the copyright strip. */
  footer?: ReactNode;
  children: ReactNode;
}

export function DiagnosticLayout({
  sidebar,
  sidebarWideOnly = false,
  sidebarHideScrollbar = false,
  sidebarWidthClassName,
  pageContext,
  rightSidebar,
  sidebarAutoHide = false,
  sidebarVisible = false,
  sidebarRef,
  footer,
  children,
  themeName,
  questionCount,
  onExit,
  exitLabel,
  rightSlot,
}: DiagnosticLayoutProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-page-bg">
      <Header
        themeName={themeName}
        questionCount={questionCount}
        onExit={onExit}
        exitLabel={exitLabel}
        rightSlot={rightSlot}
      />

      {pageContext}

      <div className="relative flex flex-1 overflow-hidden">
        {sidebar && (
          <Sidebar
            ref={sidebarRef}
            wideOnly={sidebarWideOnly}
            hideScrollbar={sidebarHideScrollbar}
            autoHide={sidebarAutoHide}
            visible={sidebarVisible}
            widthClassName={sidebarWidthClassName}
          >
            {sidebar}
          </Sidebar>
        )}
        <main className="no-scrollbar flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>

        {rightSidebar && (
          <aside className="hidden xl:block w-80 shrink-0 overflow-y-auto bg-page-bg p-6 dark:bg-untested-bg">
            {rightSidebar}
          </aside>
        )}
      </div>

      <Footer>{footer}</Footer>
    </div>
  );
}
