import {
  BookOpen,
  Lightbulb,
  ListChecks,
  Target,
  ClipboardCheck,
  Star,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

/**
 * ReviewGuideSidebar
 *
 * Left sidebar for ReviewPage, replacing the former summary stats
 * (which are already shown in the top summary cards). Provides a
 * concise review guide with tips and a reassurance callout, using
 * the same Card-based layout as DiagnosticGuideSidebar.
 */

interface Tip {
  title: string;
  body: string;
  icon: LucideIcon;
}

const TIPS: Tip[] = [
  {
    title: "You're almost done!",
    body: "Review your responses before finishing your diagnostic.",
    icon: ListChecks,
  },
  {
    title: "Review your answers",
    body: "Tap any question to go back and change your answer.",
    icon: ClipboardCheck,
  },
  {
    title: "Skipped is okay",
    body: "Skipped questions help us understand what you're unsure about.",
    icon: Star,
  },
  {
    title: "No right or wrong here",
    body: "This is a diagnostic, not a test. Be honest with your current knowledge.",
    icon: CheckCircle2,
  },
  {
    title: "Change anytime",
    body: "You can edit any answered question before finishing.",
    icon: Pencil,
  },
];

export function ReviewGuideSidebar() {
  return (
    <div className="space-y-6 text-sm text-ink-soft">
      <Card className="space-y-4">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <BookOpen
            className="h-5 w-5 shrink-0 text-mastered"
            aria-hidden="true"
          />
          Review Guide
        </p>
        <ul className="space-y-4">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <li key={tip.title} className="space-y-1">
                <p className="flex items-start gap-2">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-mastered"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-ink">{tip.title}</span>
                </p>
                <p className="pl-7">{tip.body}</p>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* "Remember" reassurance callout */}
      <div className="rounded-sm border border-mastered-line bg-mastered-bg p-4">
        <p className="flex items-center gap-2 font-semibold text-mastered">
          <Lightbulb className="h-5 w-5 shrink-0" aria-hidden="true" />
          Remember
        </p>
        <p className="mt-2 flex items-start gap-2">
          <Target
            className="mt-0.5 h-4 w-4 shrink-0 text-mastered"
            aria-hidden="true"
          />
          <span>
            Skipped questions help us understand your focus areas and where you
            are unsure.
          </span>
        </p>
      </div>
    </div>
  );
}
