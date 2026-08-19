import { cn } from "../../lib/cn";

export type TabType = "all" | "answered" | "skipped" | "unanswered";

export interface ReviewTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    all: number;
    answered: number;
    skipped: number;
    unanswered: number;
  };
}

const tabs: { id: TabType; label: string }[] = [
  { id: "all", label: "All" },
  { id: "answered", label: "Answered" },
  { id: "skipped", label: "Skipped" },
  { id: "unanswered", label: "Unanswered" },
];

export function ReviewTabs({ activeTab, onTabChange, counts }: ReviewTabsProps) {
  return (
    <div className="no-scrollbar -mx-1 flex max-w-full items-center gap-2 overflow-x-auto px-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
            activeTab === tab.id
              ? "border-mastered bg-mastered-bg text-mastered"
              : "border-border bg-card-bg text-ink-soft hover:border-mastered-line hover:bg-mastered-bg/50"
          )}
        >
          <span>{tab.label}</span>
          <span
            className={cn(
              "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold",
              activeTab === tab.id
                ? "bg-mastered text-white"
                : "bg-untested-bg text-ink-soft"
            )}
          >
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
