import type { ReactNode } from "react";
import { Header, type HeaderProps } from "./Header";
import { Sidebar } from "./Sidebar";
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
  children: ReactNode;
}

export function DiagnosticLayout({
  sidebar,
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

      <div className="flex flex-1 overflow-hidden">
        {sidebar && <Sidebar>{sidebar}</Sidebar>}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>

      <Footer />
    </div>
  );
}