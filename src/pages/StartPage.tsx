import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { DiagnosticLayout } from "../layout/DiagnosticLayout";
import { Button } from "../components/ui/Button";
import { ThemeSelector } from "../components/diagnostic/ThemeSelector";
import type { ThemeId } from "../api/themes";
import { useSession } from "../app/SessionContext";

/**
 * StartPage -- per §7.2:
 *   - Resume banner is conditional, shown only if localStorage already has
 *     a session_id.
 *   - "Start new" requires a confirmation step before discarding an
 *     existing session -- the confirmation INTERACTION itself is still an
 *     open item (§8); window.confirm is an explicit placeholder, not a
 *     final UI choice.
 *   - KNOWN V1 GAP: Resume only works if `questions` survived in memory
 *     (e.g. client-side nav away and back). A real page reload loses the
 *     in-memory question bank -- there's no GET /sessions/{id} endpoint to
 *     rebuild it from a bare session_id. If that happens, Resume falls
 *     back to a clean start with a toast, rather than rendering a broken
 *     quiz.
 */
export function StartPage() {
  const navigate = useNavigate();
  const { startNewSession, resumeSession, discardSession, hasStoredSession, questions, isLoading } =
    useSession();
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);
  const [hasExisting, setHasExisting] = useState(() => hasStoredSession());

  function handleResume() {
    const resumed = resumeSession();
    if (resumed && questions.length > 0) {
      navigate("/quiz");
      return;
    }
    toast.error("Couldn't restore your previous session -- starting fresh.");
    discardSession();
    setHasExisting(false);
  }

  function handleStartNew() {
    const confirmed = window.confirm(
      "Starting a new diagnostic will discard your in-progress session. Continue?",
    );
    if (!confirmed) return;
    discardSession();
    setHasExisting(false);
  }

  async function handleStart() {
    if (!selectedTheme) return;
    try {
      await startNewSession(selectedTheme);
      navigate("/quiz");
    } catch {
      toast.error("Could not start the diagnostic. Please try again.");
    }
  }

  return (
    <DiagnosticLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-ink">
            CSLabs C Programming Diagnostic
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            This isn't a test -- there's no time limit, and nothing here
            affects any grade. It's just here to help you see what to focus
            on next.
          </p>
        </div>

        {hasExisting && (
          <div className="flex items-center justify-between rounded-card border border-mastered-line bg-mastered-bg p-4">
            <p className="text-sm text-ink">
              You have a diagnostic in progress. Pick up where you left off?
            </p>
            <div className="flex shrink-0 gap-2">
              <Button variant="ghost" onClick={handleStartNew}>
                Start new
              </Button>
              <Button variant="primary" onClick={handleResume}>
                Resume
              </Button>
            </div>
          </div>
        )}

        {!hasExisting && (
          <>
            <ThemeSelector selected={selectedTheme} onSelect={setSelectedTheme} />
            <div className="flex justify-center">
              <Button
                variant="primary"
                onClick={handleStart}
                disabled={!selectedTheme || isLoading}
              >
                {isLoading ? "Starting..." : "Start diagnostic"}
              </Button>
            </div>
          </>
        )}
      </div>
    </DiagnosticLayout>
  );
}