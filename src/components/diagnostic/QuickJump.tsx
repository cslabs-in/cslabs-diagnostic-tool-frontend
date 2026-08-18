import { ChevronDown } from "lucide-react";
import { Card } from "../ui/Card";

/**
 * QuickJump -- the "Quick jump" widget in the ReviewPage right sidebar.
 * Allows users to jump directly to any question by selecting from a
 * dropdown. Shows question number and concept name for easy identification.
 *
 * Design reference: ReviewPage_v2.png (bottom-right card).
 */

export interface QuickJumpProps {
  questions: { questionId: string; conceptName: string }[];
  onJump: (index: number) => void;
}

export function QuickJump({ questions, onJump }: QuickJumpProps) {
  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx)) {
      onJump(idx);
      // Reset to placeholder after navigation
      e.target.value = "";
    }
  }

  return (
    <Card>
      <h3 className="mb-1 text-sm font-semibold text-ink">Quick jump</h3>
      <p className="mb-3 text-xs text-ink-soft">Jump to any question</p>
      <div className="relative">
        <select
          defaultValue=""
          onChange={handleChange}
          className="w-full appearance-none rounded-btn border border-border bg-card-bg px-3 py-2 pr-8 text-sm text-ink shadow-none transition-colors hover:border-ink-soft focus:border-mastered focus:outline-none focus:ring-1 focus:ring-mastered"
        >
          <option value="" disabled>
            Select question...
          </option>
          {questions.map((q, idx) => (
            <option key={q.questionId} value={idx}>
              Q{idx + 1} — {q.conceptName}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
          aria-hidden="true"
        />
      </div>
    </Card>
  );
}
