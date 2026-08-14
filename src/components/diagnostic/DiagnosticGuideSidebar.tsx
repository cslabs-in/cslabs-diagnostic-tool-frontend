import { BookOpen, Forward, Heart, Keyboard, Lightbulb, Pencil, Target, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "../ui/Card";

/**
 * DiagnosticGuideSidebar
 *
 * QuizPage's sidebar, per decisions doc §7.3. Static copy only -- no props,
 * no data dependency. Reinforces the "diagnostic, not test" framing at the
 * point students are most likely to feel test anxiety.
 *
 * Structure and styling follow the QuizPage design reference
 * (designs/images/QuizPage.png): the whole guide sits inside the standard
 * Card surface, headed by an open-book icon + "Diagnostic Guide" (bold ink
 * text). Each tip is a teal lucide icon matched to the tip's meaning + bold
 * title, with the description on the next line, indented to align under the
 * title text (gray ink-soft).
 *
 * Below the guide, a "Remember" reassurance callout (light teal surface,
 * heading icon + an icon per line) keeps the non-exam framing going -- see
 * §7.3. The design reference's concept-specific "Concept Insight" card is
 * deliberately NOT built for v1: its copy depends on per-concept data
 * (what the question evaluates, prerequisite links) that the frontend API
 * doesn't expose yet.
 *
 * Mobile (<820px) fallback is an open item (build log §3.1) -- deliberately
 * not addressed here. This component only renders inside the desktop
 * Sidebar shell for now.
 */

interface Tip {
  title: string;
  body: string;
  icon: LucideIcon;
}

/** Small key-cap chip for the keyboard-shortcuts list. */
function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded-sm border border-border bg-untested-bg px-1.5 py-0.5 font-mono text-xs font-medium text-ink">
      {children}
    </kbd>
  );
}

const SHORTCUTS: Array<{ keys: string[]; action: string }> = [
  { keys: ["1–4", "A–D"], action: "Answer" },
  { keys: ["Enter"], action: "Next question" },
  { keys: ["S"], action: "Skip question" },
];

const TIPS: Tip[] = [
  {
    title: "One question at a time",
    body: "Focus on the current concept to understand it better.",
    icon: Lightbulb,
  },
  {
    title: "Answer honestly",
    body: "The goal is to identify your strengths and weak areas.",
    icon: User,
  },
  {
    title: "Skip if unsure",
    body: "Skipped questions help us give you better insights.",
    icon: Forward,
  },
  {
    title: "You can change your answer",
    body: "Go back and update a response any time before moving on.",
    icon: Pencil,
  },
];

export function DiagnosticGuideSidebar() {
  return (
    <div className="space-y-6 text-sm text-ink-soft">
      <Card className="space-y-4">
        <p className="flex items-center gap-2 font-semibold text-ink">
          <BookOpen className="h-5 w-5 shrink-0 text-mastered" aria-hidden="true" />
          Diagnostic Guide
        </p>
        <ul className="space-y-4">
          {TIPS.map((tip) => {
            const Icon = tip.icon;
            return (
              <li key={tip.title} className="space-y-1">
                <p className="flex items-start gap-2">
                  <Icon
                    className="mt-0.5 h-5 w-5 shrink-0 text-mastered"
                    aria-hidden="true" />
                  <span className="font-semibold text-ink">{tip.title}</span>
                </p>
                <p className="pl-7">{tip.body}</p>
              </li>
            );
          })}
        </ul>

        {/* Keyboard shortcuts, kept permanently visible in the sidebar so
            the student can check them at any point -- complements the
            transient tip shown on the first question. */}
        <div className="border-t border-border pt-4">
          <p className="flex items-center gap-2 font-semibold text-ink">
            <Keyboard className="h-5 w-5 shrink-0 text-mastered" aria-hidden="true" />
            Keyboard shortcuts
          </p>
          <ul className="mt-3 space-y-2">
            {SHORTCUTS.map((row) => (
              <li key={row.action} className="flex items-center justify-between gap-2">
                <span className="text-ink-soft">{row.action}</span>
                <span className="flex items-center gap-1.5">
                  {row.keys.map((key, i) => (
                    <span key={key} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-xs text-ink-faint">or</span>}
                      <Kbd>{key}</Kbd>
                    </span>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* "Remember" reassurance callout, styled after the Concept Insight
          card in the design reference: a light teal surface so it reads as
          a distinct element from the rest of the sidebar, with a heading
          icon and an icon per line. The insight card itself is deferred
          (see file header -- needs per-concept API data); this keeps the
          same visual treatment for v1. */}
      <div className="rounded-sm border border-mastered-line bg-mastered-bg p-4">
        <p className="flex items-center gap-2 font-semibold text-mastered">
          <Lightbulb className="h-5 w-5 shrink-0" aria-hidden="true" />
          Remember
        </p>
        <ul className="mt-2 space-y-2">
          <li className="flex items-start gap-2">
            <Heart className="mt-0.5 h-4 w-4 shrink-0 text-mastered" aria-hidden="true" />
            <span>Don't worry about your score.</span>
          </li>
          <li className="flex items-start gap-2">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-mastered" aria-hidden="true" />
            <span>
              It's about figuring out where to focus next -- not passing or
              failing.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
