import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { AnsweredSummaryList } from "../components/diagnostic/AnsweredSummaryList";
import { ReviewSummarySidebar } from "../components/diagnostic/ReviewSummarySidebar";
import { useSession } from "../app/SessionContext";
import { getThemeDisplayName } from "../api/themes";

export function ReviewPage() {
  const navigate = useNavigate();
  const { theme, questions, answers, goToIndex, completeAndFetchReport } = useSession();

  const total = questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null,
  ).length;
  const skippedCount = total - answeredCount;

  function handleRowClick(index: number) {
    goToIndex(index);
    navigate("/quiz");
  }

  async function handleSubmit() {
    try {
      await completeAndFetchReport();
      navigate("/report");
    } catch {
      toast.error("Could not submit your diagnostic. Please try again.");
    }
  }

  function handleExit() {
    const confirmed = window.confirm("Exit the diagnostic? Your progress is saved.");
    if (confirmed) navigate("/");
  }

  return (
    <DiagnosticLayout
      sidebar={
        <ReviewSummarySidebar
          total={total}
          answeredCount={answeredCount}
          skippedCount={skippedCount}
        />
      }
      onExit={handleExit}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-ink">Review your answers</h1>
          <p className="text-sm text-ink-soft">
            Tap any question to go back and change your answer.
          </p>
        </div>

        <AnsweredSummaryList
          questions={questions}
          answers={answers}
          onRowClick={handleRowClick}
        />

        <div className="flex items-center justify-between">
          {/* One-off outline control styled inline per the ReviewPage design
              reference (white fill + dark green border + leading arrow icon);
              Button's §7.1 variants stay at exactly three. */}
          <button
            type="button"
            onClick={() => navigate("/quiz")}
            className="inline-flex items-center gap-2 rounded-btn border border-mastered bg-card-bg px-4 py-2 text-sm font-medium text-mastered transition-shadow duration-150 hover:bg-mastered-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to quiz
          </button>

          {/* Primary action per the design: solid dark green with the
              checkmark-in-circle icon trailing the label. */}
          <Button variant="primary" onClick={handleSubmit}>
            Submit diagnostic
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </DiagnosticLayout>
  );
}