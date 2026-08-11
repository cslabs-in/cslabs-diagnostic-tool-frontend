/**
 * DiagnosticGuideSidebar
 *
 * QuizPage's sidebar, per decisions doc §7.3. Static copy only -- no props,
 * no data dependency. Reinforces the "diagnostic, not test" framing at the
 * point students are most likely to feel test anxiety.
 *
 * Mobile (<820px) fallback is an open item (build log §3.1) -- deliberately
 * not addressed here. This component only renders inside the desktop
 * Sidebar shell for now.
 */

const TIPS: string[] = [
  "One question at a time -- no need to plan ahead.",
  "Answer honestly. This isn't a test.",
  "Not sure? Skip it -- that's useful information too.",
  "You can change your answer later, from the review screen.",
];

export function DiagnosticGuideSidebar() {
  return (
    <div className="space-y-6 text-sm text-ink-soft">
      <div className="space-y-3">
        <p className="font-medium text-ink">Diagnostic Guide</p>
        <ul className="space-y-2">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-0.5 text-mastered">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-sm border border-border bg-card-bg p-4">
        <p className="font-medium text-ink">Remember</p>
        <p className="mt-1">
          Don't worry about your score -- this is about figuring out where
          to focus next, not passing or failing.
        </p>
      </div>
    </div>
  );
}