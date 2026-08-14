import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, LogOut } from "lucide-react";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Progress } from "../components/ui/Progress";
import { QuestionCard } from "../components/diagnostic/QuestionCard";
import { NavControls } from "../components/diagnostic/NavControls";
import { DiagnosticGuideSidebar } from "../components/diagnostic/DiagnosticGuideSidebar";
import { Button } from "../components/ui/Button";
import { useSession } from "../app/SessionContext";
import { getThemeDisplayName } from "../api/themes";
import type { OptionLetter } from "../types/diagnostic";

const LETTERS: OptionLetter[] = ["A", "B", "C", "D"];

export function QuizPage() {
  const navigate = useNavigate();
  const { theme, questions, answers, currentIndex, goToIndex, setAnswer } = useSession();

  const question = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null,
  ).length;
  const selected = question ? answers[question.questionId]?.selectedOption ?? null : null;

  // --- Engagement state ---
  const [showCompletion, setShowCompletion] = useState(false); // end-of-quiz overlay
  const [showExitConfirm, setShowExitConfirm] = useState(false); // leave-diagnostic dialog
  const completionTimer = useRef<number | null>(null);

  // Keep the latest handlers/state readable from the (once-registered)
  // keydown listener without re-registering it every render. Null when
  // there's no active question, so the listener is a no-op in that case.
  const keyActions = useRef<{
    select: (letter: OptionLetter) => void;
    next: () => void;
    skip: () => void;
    locked: boolean;
  } | null>(null);

  useEffect(() => {
    keyActions.current = question
      ? {
          select: handleSelect,
          next: goToNext,
          skip: handleSkip,
          locked: showCompletion || showExitConfirm,
        }
      : null;
  });

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;

      // Don't hijack keys while the user is focused on an interactive
      // element (Enter on a focused button already clicks it) or typing
      // in an editable field.
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        tag === "BUTTON" ||
        tag === "A" ||
        target?.isContentEditable
      ) {
        return;
      }

      const actions = keyActions.current;
      if (!actions || actions.locked) return;

      const key = e.key;
      if (/^[1-4]$/.test(key)) {
        e.preventDefault();
        actions.select(LETTERS[Number(key) - 1]);
      } else if (/^[a-dA-D]$/.test(key)) {
        e.preventDefault();
        actions.select(key.toUpperCase() as OptionLetter);
      } else if (key === "Enter") {
        e.preventDefault();
        actions.next();
      } else if (key.toLowerCase() === "s") {
        e.preventDefault();
        actions.skip();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Clean up the completion timer if the user navigates away mid-overlay.
  useEffect(
    () => () => {
      if (completionTimer.current) window.clearTimeout(completionTimer.current);
    },
    [],
  );

  // Escape closes the leave-diagnostic dialog.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setShowExitConfirm(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Guarded at the route level by RequireSession (sessionId), but if
  // `questions` is somehow empty with a live session, don't render a
  // broken card.
  if (!question) return null;

  // Number of distinct concepts in the theme, used by the completion
  // overlay's summary line.
  const conceptCount = new Set(questions.map((q) => q.conceptId)).size;

  // --- Handlers ---
  function handleSelect(letter: OptionLetter) {
    void setAnswer(question.questionId, letter);
  }

  function finish() {
    if (showCompletion) return;
    setShowCompletion(true);
    completionTimer.current = window.setTimeout(() => navigate("/review"), 1600);
  }

  function goToNext() {
    if (currentIndex < total - 1) {
      goToIndex(currentIndex + 1);
    } else {
      finish();
    }
  }

  function handleSkip() {
    void setAnswer(question.questionId, null);
    goToNext();
  }

  function handleBack() {
    if (currentIndex > 0) goToIndex(currentIndex - 1);
  }

  function handleExit() {
    setShowExitConfirm(true);
  }

  function confirmExit() {
    setShowExitConfirm(false);
    navigate("/");
  }

  return (
    <DiagnosticLayout
      sidebar={<DiagnosticGuideSidebar />}
      sidebarAutoHide
      sidebarVisible={currentIndex === 0}
      onExit={handleExit}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Progress
          value={answeredCount}
          max={total}
          label={`Question ${currentIndex + 1} of ${total}`}
          ringLabel="Concept Coverage"
        />

        <QuestionCard
          question={question}
          number={currentIndex + 1}
          selected={selected}
          onSelect={handleSelect}
        />

        <NavControls
          onBack={handleBack}
          onNext={goToNext}
          onSkip={handleSkip}
          canGoBack={currentIndex > 0}
          isLast={currentIndex === total - 1}
        />        

        <p className="text-center text-xs text-ink-faint">
          Your progress is auto-saved -- You can safely leave and resume later.
        </p>
      </div>

      {showCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-card-bg/90 animate-overlay-in">
          <div
            role="status"
            className="flex flex-col items-center gap-3 rounded-card border border-border bg-card-bg p-10 text-center shadow-hover animate-question-in"
          >
            <CheckCircle2
              className="h-14 w-14 text-mastered animate-check-pop"
              aria-hidden="true"
            />
            <p className="text-lg font-bold text-ink">You're done!</p>
            <p className="text-sm text-ink-soft">
              You covered {conceptCount} concepts. Taking you to your summary…
            </p>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-card-bg/90 animate-overlay-in"
          onClick={() => setShowExitConfirm(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-dialog-title"
            className="flex flex-col items-center gap-4 rounded-card border border-border bg-card-bg p-10 text-center shadow-hover animate-question-in"
            onClick={(e) => e.stopPropagation()}
          >
            <LogOut className="h-10 w-10 text-attention" aria-hidden="true" />
            <div className="space-y-1">
              <p id="exit-dialog-title" className="text-lg font-bold text-ink">
                Leave diagnostic?
              </p>
              <p className="text-sm text-ink-soft">
                Your progress is saved. You can resume from the start page any
                time.
              </p>
            </div>
            <div className="mt-2 flex gap-3">
              <Button
                variant="primary"
                onClick={() => setShowExitConfirm(false)}
                autoFocus
              >
                Keep going
              </Button>
              {/* One-off destructive action, styled inline with the
                  attention palette (Button's §7.1 variants stay at exactly
                  three -- primary/secondary/ghost). */}
              <button
                type="button"
                onClick={confirmExit}
                className="inline-flex items-center gap-2 rounded-btn border border-attention-line bg-attention-bg px-4 py-2 text-sm font-medium text-attention transition-colors duration-150 hover:bg-attention-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-attention focus-visible:ring-offset-2"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Leave diagnostic
              </button>
            </div>
          </div>
        </div>
      )}
    </DiagnosticLayout>
  );
}
