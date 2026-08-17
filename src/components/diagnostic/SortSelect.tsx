import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

/**
 * SortSelect -- the ReviewPage "Sort by" control (design reference: filter
 * tabs bar, right side). A native <select> styled to match the pill/control
 * language of the page: bordered card surface, rounded-btn radius, the
 * locked mastered focus ring, and a chevron-down icon in place of the
 * native arrow (appearance-none). Native select keeps keyboard + screen
 * reader behavior for free.
 *
 * Sort keys map to the table columns: Question order (default), Concept,
 * Response, and Status.
 */
export type SortKey = "question" | "concept" | "response" | "status";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "question", label: "Question order" },
  { value: "concept", label: "Concept" },
  { value: "response", label: "Response" },
  { value: "status", label: "Status" },
];

export interface SortSelectProps {
  value: SortKey;
  onChange: (key: SortKey) => void;
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span className="whitespace-nowrap">Sort by</span>
      <span className="relative inline-flex">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortKey)}
          aria-label="Sort by"
          className={cn(
            "appearance-none rounded-btn border border-border bg-card-bg py-1.5 pl-3 pr-8 text-sm font-medium text-ink transition-colors duration-150",
            "hover:border-mastered-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mastered focus-visible:ring-offset-2",
          )}
        >
          {OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
