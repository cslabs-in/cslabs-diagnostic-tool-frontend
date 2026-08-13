import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { ReportBlock } from "../components/report/ReportBlock";
import { ConceptScoreChart } from "../components/report/ConceptScoreChart";
// import { ConceptGraph } from "../components/report/ConceptGraph";
import { ReportSidebar } from "../components/report/ReportSidebar";
import { useSession } from "../app/SessionContext";
import { getThemeDisplayName } from "../api/themes";

export function ReportPage() {
  const navigate = useNavigate();
  const { theme, questions, report } = useSession();

  // Guarded at the route level by RequireSession (sessionId), but sessionId
  // alone doesn't guarantee `report` is populated (e.g. some future nav
  // path lands here before completeAndFetchReport ran). If there's nothing
  // to show, bounce back to start rather than rendering an empty report.
  useEffect(() => {
    if (!report) navigate("/");
  }, [report, navigate]);

  if (!report) return null;

  return (
    <DiagnosticLayout
      sidebar={<ReportSidebar scores={report.conceptScores} />}
      onExit={() => navigate("/")}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-ink">Your diagnostic report</h1>
          <p className="text-sm text-ink-soft">
            Completed {new Date(report.completedAt).toLocaleDateString()}
          </p>
        </div>

        <ConceptScoreChart scores={report.conceptScores} />
        {/* <ConceptGraph conceptScores={report.conceptScores} activeTheme={theme} /> */}
        <ReportBlock reportText={report.reportText} />
      </div>
    </DiagnosticLayout>
  );
}