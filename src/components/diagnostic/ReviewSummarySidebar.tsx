/**
 * ReviewSummarySidebar
 *
 * ReviewPage's sidebar, per decisions doc §7.4. Replaces the Diagnostic
 * Guide's tips with a live count -- more useful once the student is done
 * answering. Takes plain counts as props rather than the raw answers map,
 * so the page owns the derivation and this stays presentational.
 */

export interface ReviewSummarySidebarProps {
  total: number;
  answeredCount: number;
  skippedCount: number;
}

export function ReviewSummarySidebar({
  total,
  answeredCount,
  skippedCount,
}: ReviewSummarySidebarProps) {
  const rows: Array<{ label: string; value: number }> = [
    { label: "Total questions", value: total },
    { label: "Answered", value: answeredCount },
    { label: "Skipped", value: skippedCount },
  ];

  return (
    <div className="space-y-3 text-sm text-ink-soft">
      <p className="font-medium text-ink">Summary</p>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span>{row.label}</span>
            <span className="font-medium text-ink">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}