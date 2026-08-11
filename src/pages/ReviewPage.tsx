import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { AnsweredSummaryList } from "../components/diagnostic/AnsweredSummaryList";
import { ReviewSummarySidebar } from "../components/diagnostic/ReviewSummarySidebar";
import { useSession } from "../app/SessionContext";

export function ReviewPage() {
  const navigate = useNavigate();
  const { questions, answers, goToIndex, completeAndFetchReport } = useSession();

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
          <Button variant="ghost" onClick={() => navigate("/quiz")}>
            Back to quiz
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit diagnostic
          </Button>
        </div>
      </div>
    </DiagnosticLayout>
  );
}