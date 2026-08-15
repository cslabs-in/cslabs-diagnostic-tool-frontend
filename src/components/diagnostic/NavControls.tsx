import { Info } from "lucide-react";
import { Button } from "../ui/Button";

/**
 * NavControls -- Back / Skip / Next in one action row (§7.3). Skip sits in
 * the center, highlighted with the amber "skip" palette (bg-skip-bg on
 * text-skip with a skip-line border) so students can see at a glance that
 * skipping is an option -- distinct from the teal primary and the muted
 * outline secondary.
 *
 * Back never resubmits an answer by itself -- only revisits the previous
 * index; re-submission only happens if the student actively changes the
 * answer there (§5's overwrite rule), which QuizPage's state handles, not
 * this component.
 */
export interface NavControlsProps {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  isLast: boolean;
}

export function NavControls({
  onBack,
  onNext,
  onSkip,
  canGoBack,
  isLast,
}: NavControlsProps) {
  return (
    <div className="grid grid-cols-3 items-center">
      <div className="justify-self-start">
        <Button variant="secondary" onClick={onBack} disabled={!canGoBack}>
          Back
        </Button>
      </div>

      <div className="justify-self-center">
        {/* One-off control styled inline (Button's §7.1 variants stay at
            exactly three -- primary/secondary/ghost). */}
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex items-center gap-2 rounded-btn border border-skip-line bg-skip-bg px-4 py-2 text-sm font-medium text-skip transition-shadow duration-150 hover:border-skip hover:bg-skip-line hover:text-[#5d3d1e] dark:hover:text-[#ecd9b8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skip focus-visible:ring-offset-2"
        >
          <Info className="h-4 w-4" aria-hidden="true" />
          Skip question
        </button>
      </div>

      <div className="justify-self-end">
        <Button variant="primary" onClick={onNext}>
          {isLast ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
