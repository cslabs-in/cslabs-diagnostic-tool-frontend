import type { ThemeId } from "../../api/themes";
import { Card } from "../ui/Card";
import { cn } from "../../lib/cn";

/**
 * Real concept counts from the design reference §8 -- NOT placeholders.
 * "Both" removed per Atul's call: the backend has no combined-theme
 * endpoint, so only the two real, individually-fetchable themes are
 * offered. This list stays hardcoded (not fetched from the backend) until
 * real user testing, per the earlier decision to defer that.
 */
const THEMES: { id: ThemeId; label: string; count: number }[] = [
  { id: "grammar", label: "Grammar", count: 6 },
  { id: "data_representation", label: "Data Representation", count: 17 },
];

export interface ThemeSelectorProps {
  selected: ThemeId | null;
  onSelect: (id: ThemeId) => void;
}

export function ThemeSelector({ selected, onSelect }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {THEMES.map((theme) => {
        const isSelected = selected === theme.id;
        return (
          <Card
            key={theme.id}
            hover
            onClick={() => onSelect(theme.id)}
            className={cn(
              "cursor-pointer text-center transition-colors duration-150",
              isSelected && "border-mastered-line bg-mastered-bg",
            )}
          >
            <p className="text-base font-semibold text-ink">{theme.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{theme.count} concepts</p>
          </Card>
        );
      })}
    </div>
  );
}