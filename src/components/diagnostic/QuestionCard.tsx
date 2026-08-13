import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { CodeBlock } from "./CodeBlock";
import { OptionList } from "./OptionList";
import type { OptionLetter, Question } from "../../types/diagnostic";

/**
 * QuestionCard -- per §7.3: one question at a time, single card with a
 * concept tag, question stem (bold, prefixed with its "Q{n}." number),
 * options (A-D). The Skip action lives in NavControls, deliberately kept
 * visually separate from Previous/Next.
 *
 * Presentational only -- QuizPage owns the selected-answer state and
 * passes it down, per the "pages own state, components stay
 * presentational" rule (frontend-v1-decisions.md §11).
 */
export interface QuestionCardProps {
  question: Question;
  /** 1-based question number, rendered as the "Q{n}." prefix. */
  number: number;
  selected: OptionLetter | null;
  onSelect: (letter: OptionLetter) => void;
}

export function QuestionCard({
  question,
  number,
  selected,
  onSelect,
}: QuestionCardProps) {
  return (
    <Card className="space-y-5">
      <Badge variant="concept">{question.conceptName}</Badge>

      <p className="text-base font-bold text-ink">
        <span className="text-mastered">Q{number}.</span> {question.stem}
      </p>

      {question.code && <CodeBlock code={question.code} />}

      <OptionList
        options={question.options}
        selected={selected}
        onSelect={onSelect}
      />
    </Card>
  );
}
