import { cn } from "../../lib/cn";
import type { OptionLetter, Question } from "../../types/diagnostic";

/**
 * OptionList -- purely presentational selection UI. Deliberately has NO
 * concept of "correct" -- the frontend never receives or displays
 * correctness for any option, per §7.4/§7.5's "no per-question correctness
 * shown anywhere" rule. Selected state is the only visual state besides
 * default/hover.
 *
 * Visual treatment (per 2026-08-14 revision): roomier vertical padding
 * (py-5) so options feel effortless to click over long sessions; a subtle
 * hover (bg lift + a whisper of the accent in the border, both easing via
 * a slow color transition); and the selected state stays on the existing
 * mastered tokens -- accent border #3f6f5e on a #eaf1ee fill -- with no
 * shadows anywhere.
 */
export interface OptionListProps {
  options: Question["options"];
  selected: OptionLetter | null;
  onSelect: (letter: OptionLetter) => void;
}

const LETTERS: OptionLetter[] = ["A", "B", "C", "D"];

export function OptionList({ options, selected, onSelect }: OptionListProps) {
  return (
    <div className="space-y-3" role="radiogroup">
      {LETTERS.map((letter) => {
        const isSelected = selected === letter;
        return (
          <button
            key={letter}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(letter)}
            className={cn(
              "flex w-full items-center gap-3 rounded-sm border px-4 py-5 text-left text-sm transition-colors duration-200",
              isSelected
                ? "border-mastered bg-mastered-bg text-ink"
                : "border-border bg-card-bg text-ink hover:border-mastered-line hover:bg-untested-bg",
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                isSelected
                  ? "border-mastered bg-mastered text-white"
                  : "border-border text-ink-soft",
              )}
            >
              {letter}
            </span>
            <span>{options[letter]}</span>
          </button>
        );
      })}
    </div>
  );
}