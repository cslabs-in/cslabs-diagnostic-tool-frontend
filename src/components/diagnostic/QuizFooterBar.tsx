import { CircleCheckBig, Keyboard } from "lucide-react";

/**
 * QuizFooterBar -- QuizPage's footer-bar content, per the QuizPage design
 * reference (designs/images/QuizPage_final.png): the auto-save reassurance
 * on the left and the keyboard-shortcuts legend on the right. The shared
 * Footer shell renders it in the main footer bar, above the copyright
 * strip, so the shortcuts sit in the bottom-right corner of the page.
 *
 * The legend mirrors the keydown handling in QuizPage (1-4 or A-D selects
 * an option, Left Arrow goes back, Enter goes next, S skips, G toggles the
 * guide) -- both the number keys and the letter keys are listed for
 * Answer, since the handler accepts either.
 */
function Kbd({ children }: { children: string }) {
  return (
    <kbd className="rounded-sm border border-border bg-untested-bg px-1.5 py-0.5 font-mono text-xs font-medium text-ink">
      {children}
    </kbd>
  );
}

const SHORTCUTS: Array<{ keys: string[]; action: string }> = [
  { keys: ["1–4", "A–D"], action: "Answer" },
  { keys: ["←"], action: "Previous" },
  { keys: ["Enter"], action: "Next" },
  { keys: ["S"], action: "Skip" },
  { keys: ["G"], action: "Guide" },
];

export function QuizFooterBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <CircleCheckBig
          className="h-4 w-4 shrink-0 text-mastered"
          aria-hidden="true"
        />
        <div className="text-xs leading-tight">
          <p className="font-bold text-ink-soft">Your progress is auto-saved.</p>
          <p className="text-ink-faint">You can safely leave and resume later.</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-soft">
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <Keyboard className="h-4 w-4 shrink-0 text-mastered" aria-hidden="true" />
          Shortcuts
        </span>
        <span className="h-4 w-px bg-border" aria-hidden="true" />
        {SHORTCUTS.map((row) => (
          <span key={row.action} className="flex items-center gap-1.5">
            {row.keys.map((key, i) => (
              <span key={key} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-xs text-ink-faint">or</span>}
                <Kbd>{key}</Kbd>
              </span>
            ))}
            <span className="text-ink-faint">{row.action}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
