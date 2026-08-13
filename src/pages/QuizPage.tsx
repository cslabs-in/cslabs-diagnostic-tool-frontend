import { useNavigate } from "react-router-dom";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Progress } from "../components/ui/Progress";
import { QuestionCard } from "../components/diagnostic/QuestionCard";
import { NavControls } from "../components/diagnostic/NavControls";
import { DiagnosticGuideSidebar } from "../components/diagnostic/DiagnosticGuideSidebar";
import { useSession } from "../app/SessionContext";
import { getThemeDisplayName } from "../api/themes";
import type { OptionLetter } from "../types/diagnostic";

export function QuizPage() {
  const navigate = useNavigate();
  const { theme, questions, answers, currentIndex, goToIndex, setAnswer } = useSession();

  const question = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.values(answers).filter(
    (a) => a.selectedOption !== null,
  ).length;
  const selected = question ? answers[question.questionId]?.selectedOption ?? null : null;

  // Guarded at the route level by RequireSession (sessionId), but if
  // `questions` is somehow empty with a live session, don't render a
  // broken card.
  if (!question) return null;

  function handleSelect(letter: OptionLetter) {
    void setAnswer(question.questionId, letter);
  }

  function goToNext() {
    if (currentIndex < total - 1) {
      goToIndex(currentIndex + 1);
    } else {
      navigate("/review");
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
    const confirmed = window.confirm(
      "Exit the diagnostic? Your progress is saved, but you'll need to resume from the start page.",
    );
    if (confirmed) navigate("/");
  }

  const percent = Math.round((answeredCount / total) * 100);

  return (
    <DiagnosticLayout
      sidebar={<DiagnosticGuideSidebar />}
      onExit={handleExit}
      themeName={theme ? getThemeDisplayName(theme) : undefined}
      questionCount={questions.length}
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Progress
          value={answeredCount}
          max={total}
          label={`Question ${currentIndex + 1} of ${total} · ${percent}% complete`}
        />

        <QuestionCard
          question={question}
          selected={selected}
          onSelect={handleSelect}
          onSkip={handleSkip}
        />

        <NavControls
          onBack={handleBack}
          onNext={goToNext}
          canGoBack={currentIndex > 0}
          isLast={currentIndex === total - 1}
        />

        <p className="text-center text-xs text-ink-faint">
          Your progress is saved -- it's safe to close this tab.
        </p>
      </div>
    </DiagnosticLayout>
  );
}