import { Button } from "../ui/Button";

/**
 * NavControls -- Back/Next, deliberately separate from QuestionCard's Skip
 * action (§7.3). Back never resubmits an answer by itself -- only revisits
 * the previous index; re-submission only happens if the student actively
 * changes the answer there (§5's overwrite rule), which QuizPage's state
 * handles, not this component.
 */
export interface NavControlsProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  isLast: boolean;
}

export function NavControls({
  onBack,
  onNext,
  canGoBack,
  isLast,
}: NavControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <Button variant="secondary" onClick={onBack} disabled={!canGoBack}>
        Back
      </Button>
      <Button variant="primary" onClick={onNext}>
        {isLast ? "Finish" : "Next"}
      </Button>
    </div>
  );
}