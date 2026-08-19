import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, CircleAlert, Info } from "lucide-react";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { ReviewQuestionTable } from "../components/diagnostic/ReviewQuestionTable";
import { ReviewSummaryCards } from "../components/diagnostic/ReviewSummaryCards";
import { ReviewRightSidebar } from "../components/diagnostic/ReviewRightSidebar";
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
  const [showSubmitCheck, setShowSubmitCheck] = useState(false);

  const total = questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null,
  ).length;
  const skippedCount = Object.values(answers).filter(
    (a) => a.selectedOption === null,
  ).length;
  const unansweredCount = total - answeredCount - skippedCount;

  // ── Concept-level coverage ────────────────────────────────────────
  // Group questions by conceptId and classify each concept exactly once.
  // Logic mirrors QuizPage's coveredConcepts: a concept counts as
  // covered when at least one of its questions has a real answer
  // (selectedOption != null). Skips alone don't cover a concept.
  const conceptMap = new Map<
    string,
    { answered: boolean; allVisited: boolean }
  >();
  for (const q of questions) {
    const entry = conceptMap.get(q.conceptId);
    if (entry) {
      if (!entry.answered && answers[q.questionId]?.selectedOption != null) {
        entry.answered = true;
      }
      if (entry.allVisited && !(q.questionId in answers)) {
        entry.allVisited = false;
      }
    } else {
      const ans = answers[q.questionId];
      conceptMap.set(q.conceptId, {
        answered: ans?.selectedOption != null,
        allVisited: q.questionId in answers,
      });
    }
  }
  const conceptEntries = [...conceptMap.values()];
  const coveredConceptCount = conceptEntries.filter((c) => c.answered).length;
  const skippedConceptCount = conceptEntries.filter(
    (c) => !c.answered && c.allVisited,
  ).length;
  const uncoveredConceptCount = conceptEntries.filter(
    (c) => !c.answered && !c.allVisited,
  ).length;

  const counts = {
    all: total,
    answered: answeredCount,
    skipped: skippedCount,
    unanswered: unansweredCount,
  };
  const remainingCount = skippedCount + unansweredCount;
  const remainingLabel = [
    skippedCount > 0 && `${skippedCount} skipped`,
    unansweredCount > 0 && `${unansweredCount} unanswered`,
  ].filter(Boolean).join(" and ");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setShowSubmitCheck(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  function handleSubmitClick() {
    if (remainingCount > 0) {
      setShowSubmitCheck(true);
      return;
    }
    void handleSubmit();
  }

  function handleReviewRemaining() {
    setActiveTab(unansweredCount > 0 ? "unanswered" : "skipped");
    setShowSubmitCheck(false);
  }

  function handleExit() {
    const confirmed = window.confirm("Exit the diagnostic? Your progress is saved.");
    if (confirmed) navigate("/");
  }

  return (
    <DiagnosticLayout
      rightSidebar={
        <ReviewRightSidebar
          coveredConceptCount={coveredConceptCount}
          skippedConceptCount={skippedConceptCount}
          uncoveredConceptCount={uncoveredConceptCount}
          answeredCount={answeredCount}
          skippedCount={skippedCount}
          unansweredCount={unansweredCount}
        />
      }
      onExit={handleExit}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
      footer={
        <ReviewActionBar
          remainingCount={remainingCount}
          remainingLabel={remainingLabel}
          onBack={() => navigate("/quiz")}
          onSubmit={handleSubmitClick}
        />
      }
    >
      <div className="mx-auto max-w-2xl space-y-5 pb-4 lg:max-w-3xl xl:max-w-4xl">
        <div>
          <p className="mb-1 text-sm font-medium text-mastered">Before your diagnostic report</p>
          <h1 className="text-xl font-semibold text-ink">Review your responses</h1>
          <p className="text-sm text-ink-soft">
            Take a moment to check what you selected before creating your diagnostic report.
          </p>
        </div>

        <ReviewSummaryCards
          total={total}
          answeredCount={answeredCount}
          skippedCount={skippedCount}
          unansweredCount={unansweredCount}
          activeTab={activeTab}
          onSelect={setActiveTab}
        />

        <div className="flex items-start gap-3 rounded-card border border-mastered-line bg-mastered-bg p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-mastered" aria-hidden="true" />
          <div className="space-y-1 text-sm">
            <p className="font-semibold text-ink">You can submit whenever you feel ready.</p>
            <p className="text-ink-soft">
              {remainingCount > 0
                ? `${remainingLabel} response${remainingCount === 1 ? " is" : "s are"} still visible below. Skipping is useful evidence of where you are unsure.`
                : "Every question has a response or intentional skip. You can still revisit any answer."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
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
      </div>

      {showSubmitCheck && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 animate-overlay-in"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-submit-title"
            className="w-full max-w-md rounded-card border border-border bg-card-bg p-6 shadow-hover animate-question-in"
          >
            <CircleAlert className="h-7 w-7 text-skip" aria-hidden="true" />
            <h2 id="review-submit-title" className="mt-3 text-lg font-semibold text-ink">
              A quick check before submission
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              You have {remainingLabel}. Those responses help the diagnostic understand
              your current starting point. You may submit now or review them once more.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={handleReviewRemaining} className="min-h-11">
                Review remaining
              </Button>
              <Button variant="primary" onClick={() => void handleSubmit()} className="min-h-11">
                Submit diagnostic
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </DiagnosticLayout>
  );
}

interface ReviewActionBarProps {
  remainingCount: number;
  remainingLabel: string;
  onBack: () => void;
  onSubmit: () => void;
}

function ReviewActionBar({
  remainingCount,
  remainingLabel,
  onBack,
  onSubmit,
}: ReviewActionBarProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink-soft">
        {remainingCount > 0
          ? `${remainingLabel} — you can review them now or submit when ready.`
          : "Your progress is saved. You can submit when ready."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="secondary" onClick={onBack} className="min-h-11 sm:min-w-40">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to questions
        </Button>
        <Button variant="primary" onClick={onSubmit} className="min-h-11 sm:min-w-44">
          Submit diagnostic
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
