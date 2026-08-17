import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Info } from "lucide-react";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { ReviewQuestionTable } from "../components/diagnostic/ReviewQuestionTable";
import { ReviewSummarySidebar } from "../components/diagnostic/ReviewSummarySidebar";
import { ReviewTabs, type TabType } from "../components/diagnostic/ReviewTabs";
import { SortSelect, type SortKey } from "../components/diagnostic/SortSelect";
import { useSession } from "../app/SessionContext";
import { getThemeDisplayName } from "../api/themes";
import { getRowStatus } from "../lib/reviewStatus";
import type { RowStatus } from "../lib/reviewStatus";

const STATUS_ORDER: Record<RowStatus, number> = {
  answered: 0,
  skipped: 1,
  unanswered: 2,
};

export function ReviewPage() {
  const navigate = useNavigate();
  const { theme, questions, answers, goToIndex, completeAndFetchReport } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [sortKey, setSortKey] = useState<SortKey>("question");

  const total = questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null,
  ).length;
  const skippedCount = Object.values(answers).filter(
    (a) => a.selectedOption === null,
  ).length;
  const unansweredCount = total - answeredCount - skippedCount;

  const counts = {
    all: total,
    answered: answeredCount,
    skipped: skippedCount,
    unanswered: unansweredCount,
  };

  // Keep the real index alongside each question so filtered tabs (Answered /
  // Skipped / Unanswered) still show stable Q numbers and route row clicks
  // back to the correct question in the full list -- the position within the
  // filtered subset is NOT the question's index in the quiz.
  const filteredRows = questions
    .map((question, index) => ({ question, index }))
    .filter(({ question }) => {
      switch (activeTab) {
        case "all":
          return true;
        case "answered":
          return getRowStatus(answers, question.questionId) === "answered";
        case "skipped":
          return getRowStatus(answers, question.questionId) === "skipped";
        case "unanswered":
          return getRowStatus(answers, question.questionId) === "unanswered";
      }
    });

  // Sort keys mirror the table columns (Question order is the default,
  // per the design reference). Every comparator falls back to question
  // order on ties so sorting is deterministic regardless of the tab filter.
  const sortedRows = [...filteredRows].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "concept":
        cmp = a.question.conceptName.localeCompare(b.question.conceptName);
        break;
      case "response": {
        // Answered rows by option letter (A-D) first, then no-response
        // rows (skipped/unanswered, shown as "—") by question order.
        const ra = answers[a.question.questionId]?.selectedOption ?? null;
        const rb = answers[b.question.questionId]?.selectedOption ?? null;
        if (ra && !rb) cmp = -1;
        else if (!ra && rb) cmp = 1;
        else if (ra && rb) cmp = ra.localeCompare(rb);
        break;
      }
      case "status": {
        const sa = getRowStatus(answers, a.question.questionId);
        const sb = getRowStatus(answers, b.question.questionId);
        cmp = STATUS_ORDER[sa] - STATUS_ORDER[sb];
        break;
      }
      // "question": cmp stays 0, so the index tie-break below keeps
      // natural question order.
    }
    return cmp !== 0 ? cmp : a.index - b.index;
  });

  // Only the Action column's button routes back into the quiz; row clicks
  // themselves are inert (design reference).
  function handleEdit(index: number) {
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
      <div className="mx-auto max-w-2xl space-y-6 lg:max-w-3xl xl:max-w-4xl">
        <div>
          <h1 className="text-lg font-semibold text-ink">Review your answers</h1>
          <p className="text-sm text-ink-soft">
            Tap any question to go back and change your answer.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ReviewTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={counts}
          />
          <SortSelect value={sortKey} onChange={setSortKey} />
        </div>

        <ReviewQuestionTable
          rows={sortedRows}
          answers={answers}
          onEdit={handleEdit}
        />

        {/* Note below the table per the design reference: info icon +
            reassurance that answers can still be edited, in a subtle
            boxed callout (light neutral surface, like the sidebar's
            Remember card but muted). */}
        <div className="flex items-start gap-2.5 rounded-sm border border-untested-line bg-untested-bg p-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
          <p className="text-sm text-ink-soft">
            You can go back to any question to review or change your answer.
          </p>
        </div>

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