import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { CodeBlock } from "./CodeBlock";
import { OptionList } from "./OptionList";
import type { OptionLetter, Question } from "../../types/diagnostic";

/**
 * QuestionCard -- per §7.3: one question at a time, single card with a
 * concept tag, question stem, options (A-D), and an explicit Skip action
 * kept visually separate from Previous/Next (NavControls). The skip
 * button carries a short reassurance note rather than looking like a
 * punitive fallback.
 *
 * Presentational only -- QuizPage owns the selected-answer state and
 * passes it down, per the "pages own state, components stay
 * presentational" rule (frontend-v1-decisions.md §11).
 */
export interface QuestionCardProps {
  question: Question;
  selected: OptionLetter | null;
  onSelect: (letter: OptionLetter) => void;
  onSkip: () => void;
}

export function QuestionCard({
  question,
  selected,
  onSelect,
  onSkip,
}: QuestionCardProps) {
  return (
    <Card className="space-y-5">
      <Badge variant="concept">{question.conceptName}</Badge>

      <p className="text-base text-ink">{question.stem}</p>

      {question.code && <CodeBlock code={question.code} />}

      <OptionList
        options={question.options}
        selected={selected}
        onSelect={onSelect}
      />

      <div className="border-t border-border pt-4">
        <Button variant="ghost" onClick={onSkip}>
          Skip this question
        </Button>
        <p className="mt-1 text-xs text-ink-faint">
          Skipping is fine and still useful -- it just means we need a bit
          more data on this concept.
        </p>
      </div>
    </Card>
  );
}