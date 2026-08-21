import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, CircleAlert, Info, X } from "lucide-react";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { ReviewQuestionTable } from "../components/diagnostic/ReviewQuestionTable";
import { ReviewOverviewSidebar } from "../components/diagnostic/ReviewOverviewSidebar";
import type { ConceptResponse } from "../components/diagnostic/conceptResponse";
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

const FILTER_LABELS: Record<TabType, string> = {
  all: "All",
  "to-revisit": "To revisit",
  answered: "Answered",
  skipped: "Skipped",
  unanswered: "Unanswered",
};

export function ReviewPage() {
  const navigate = useNavigate();
  const { theme, questions, answers, goToIndex, completeAndFetchReport } = useSession();

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedConceptId, setSelectedConceptId] = useState<string>();
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

  // The response summary is intentionally separate from coverage. Coverage
  // classifies a concept once; this keeps the full response mix for each
  // concept so the student can find questions to revisit without seeing any
  // correctness signal.
  const conceptResponseMap = new Map<string, ConceptResponse>();
  questions.forEach((question, order) => {
    const entry = conceptResponseMap.get(question.conceptId) ?? {
      conceptId: question.conceptId,
      conceptName: question.conceptName,
      answeredCount: 0,
      skippedCount: 0,
      unansweredCount: 0,
      totalCount: 0,
      order,
    };
    entry.totalCount += 1;
    const status = getRowStatus(answers, question.questionId);
    if (status === "answered") entry.answeredCount += 1;
    else if (status === "skipped") entry.skippedCount += 1;
    else entry.unansweredCount += 1;
    conceptResponseMap.set(question.conceptId, entry);
  });
  const conceptResponses = [...conceptResponseMap.values()];

  // When a concept filter is active, scope the pill counts to that
  // concept's questions so the tabs reflect the filtered subset.
  const conceptQuestions = selectedConceptId
    ? questions.filter((q) => q.conceptId === selectedConceptId)
    : questions;
  const countsAll = conceptQuestions.length;
  const countsAnswered = conceptQuestions.filter(
    (q) => answers[q.questionId]?.selectedOption != null,
  ).length;
  const countsSkipped = conceptQuestions.filter(
    (q) => q.questionId in answers && answers[q.questionId]?.selectedOption === null,
  ).length;
  const countsUnanswered = countsAll - countsAnswered - countsSkipped;
  const counts = {
    all: countsAll,
    "to-revisit": countsSkipped + countsUnanswered,
    answered: countsAnswered,
    skipped: countsSkipped,
    unanswered: countsUnanswered,
  };
  const remainingCount = skippedCount + unansweredCount;
  const remainingLabel = `${remainingCount} questions to revisit`;
  // [
  //   skippedCount > 0 && `${skippedCount} skipped`,
  //   unansweredCount > 0 && `${unansweredCount} unanswered`,
  // ].filter(Boolean).join(" and ");

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
      if (selectedConceptId && question.conceptId !== selectedConceptId) {
        return false;
      }
      const status = getRowStatus(answers, question.questionId);
      switch (activeTab) {
        case "all":
          return true;
        case "to-revisit":
          return status !== "answered";
        case "answered":
          return status === "answered";
        case "skipped":
          return status === "skipped";
        case "unanswered":
          return status === "unanswered";
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
    navigate("/quiz", { state: { reviewMode: true } });
  }

  function handleBackToQuestions() {
    goToIndex(Math.max(questions.length - 1, 0));
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
    setActiveTab("to-revisit");
    setSelectedConceptId(undefined);
    setShowSubmitCheck(false);
  }

  function handleStatusFilter(tab: TabType) {
    setActiveTab(tab);
  }

  function handleSelectConcept(conceptId: string) {
    setSelectedConceptId(conceptId);
  }

  function removeStatusFilter() {
    setActiveTab("all");
  }

  function removeConceptFilter() {
    setSelectedConceptId(undefined);
  }

  const selectedConcept = conceptResponses.find(
    (concept) => concept.conceptId === selectedConceptId,
  );

  function handleExit() {
    const confirmed = window.confirm("Exit the diagnostic? Your progress is saved.");
    if (confirmed) navigate("/");
  }

  return (
    <DiagnosticLayout
      sidebar={
        <ReviewOverviewSidebar
          key={conceptResponses.map((concept) => concept.conceptId).join("\u0001")}
          concepts={conceptResponses}
          selectedConceptId={selectedConceptId}
          onSelectConcept={handleSelectConcept}
        />
      }
      sidebarWideOnly
      sidebarHideScrollbar
      sidebarWidthClassName="w-80 xl:w-[26rem] 2xl:w-[28rem]"
      sidebarSurfaceClassName="bg-untested-bg"
      pageContext={
        <ReviewContextStrip
          remainingCount={remainingCount}
          remainingLabel={remainingLabel}
        />
      }
      onExit={handleExit}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
      mainHeader={
        <section className="border-b border-border bg-page-bg px-4 py-3 sm:px-6 lg:px-8" aria-label="Question filters">
          <div className="mx-auto max-w-2xl space-y-3 lg:max-w-3xl xl:max-w-4xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <ReviewTabs
                activeTab={activeTab}
                onTabChange={handleStatusFilter}
                counts={counts}
              />
              <SortSelect value={sortKey} onChange={setSortKey} />
            </div>

            {(activeTab !== "all" || selectedConcept) && (
              <div className="flex flex-wrap items-center gap-2 rounded-btn border border-mastered-line bg-mastered-bg px-3 py-2 text-sm">
                <span className="font-medium text-ink">
                  Showing {filteredRows.length} question{filteredRows.length === 1 ? "" : "s"}
                </span>
                {activeTab !== "all" && (
                  <button
                    type="button"
                    onClick={removeStatusFilter}
                    aria-label={`Remove ${FILTER_LABELS[activeTab]} filter`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-full border border-mastered-line bg-card-bg px-3 text-sm font-medium text-mastered transition-colors hover:bg-mastered-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2"
                  >
                    {FILTER_LABELS[activeTab]}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
                {selectedConcept && (
                  <button
                    type="button"
                    onClick={removeConceptFilter}
                    aria-label={`Remove ${selectedConcept.conceptName} filter`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-full border border-mastered-line bg-card-bg px-3 text-sm font-medium text-mastered transition-colors hover:bg-mastered-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2"
                  >
                    {selectedConcept.conceptName}
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      }
      mainFooter={<ReviewActionBar onBack={handleBackToQuestions} onSubmit={handleSubmitClick} />}
    >
      <div className="mx-auto max-w-2xl lg:max-w-3xl xl:max-w-4xl">
        {/* <ReviewSummaryCards
          total={total}
          answeredCount={answeredCount}
          skippedCount={skippedCount}
          unansweredCount={unansweredCount}
        /> */}

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

interface ReviewContextStripProps {
  remainingCount: number;
  remainingLabel: string;
}

function ReviewContextStrip({ remainingCount}: ReviewContextStripProps) {
  return (
    <section className="shrink-0 border-b border-border bg-card-bg" aria-labelledby="review-page-title">
      <div className="px-4 py-3 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[26rem_minmax(0,1fr)] xl:px-0 2xl:grid-cols-[28rem_minmax(0,1fr)]">
        <div className="xl:px-6">
          <div className="xl:pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-mastered">
              Before your diagnostic report
            </p>
            <h1 id="review-page-title" className="mt-0.5 text-lg font-semibold text-ink sm:text-xl">
              Review your responses
            </h1>
          </div>
        </div>
        <div className="xl:px-8">
          <div className="mx-auto mt-3 max-w-2xl xl:mt-0 lg:max-w-3xl xl:max-w-4xl">
            <div className="flex items-start gap-3 rounded-card border border-mastered-line bg-mastered-bg p-2">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-mastered" aria-hidden="true" />
              <div className="space-y-1 text-sm">
                <p className="font-semibold text-ink">You can submit whenever you feel ready.</p>
                <p className="text-ink-soft">
                  {remainingCount > 0
                    ? `${remainingCount} question${remainingCount === 1 ? " is" : "s are"} still available to revisit. Skipped responses are useful where you are unsure.`
                    : "Every question has a response or intentional skip. You can still revisit any answer."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ReviewActionBarProps {
  onBack: () => void;
  onSubmit: () => void;
}

function ReviewActionBar({
  onBack,
  onSubmit,
}: ReviewActionBarProps) {
  return (
    <section className="border-t-2 border-border bg-card-bg shadow-card" aria-label="Review actions">
      <div className="px-4 py-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-2 lg:max-w-3xl sm:flex-row sm:items-center sm:justify-between xl:max-w-4xl">
          <Button variant="ghost" onClick={onBack} className="min-h-11 w-full justify-start sm:w-auto">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to questions
          </Button>
          <Button variant="primary" onClick={onSubmit} className="min-h-11 w-full sm:w-auto sm:min-w-44">
            Generate Diagnostic Report
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
