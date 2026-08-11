import type { ReactElement } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { StartPage } from "../pages/StartPage";
import { QuizPage } from "../pages/QuizPage";
import { ReviewPage } from "../pages/ReviewPage";
import { ReportPage } from "../pages/ReportPage";
import { SessionProvider, useSession } from "./SessionContext";

/**
 * Guards /quiz, /review, /report from loading with no active session in
 * context -- e.g. a hard refresh. resumeSession() only restores the
 * session_id, not the in-memory question bank (see SessionContext), so a
 * genuinely broken mid-quiz state is possible; this guard at least
 * prevents rendering it and bounces back to "/start" instead.
 *
 * NOTE: bounces to "/start", not "/" -- "/" is no longer part of this
 * router at all. It's served by the static marketing landing page
 * (landing/landing.html) before the React app ever mounts. See
 * vite.config.ts and frontend-v1-decisions.md §6/§9 (amended) for context.
 */
function RequireSession({ children }: { children: ReactElement }) {
  const { sessionId } = useSession();
  if (!sessionId) return <Navigate to="/start" replace />;
  return children;
}

const router = createBrowserRouter([
  { path: "/start", element: <StartPage /> },
  {
    path: "/quiz",
    element: (
      <RequireSession>
        <QuizPage />
      </RequireSession>
    ),
  },
  {
    path: "/review",
    element: (
      <RequireSession>
        <ReviewPage />
      </RequireSession>
    ),
  },
  {
    path: "/report",
    element: (
      <RequireSession>
        <ReportPage />
      </RequireSession>
    ),
  },
  // Fallback: anyone who lands inside the React app bundle at an unknown
  // path (including "/", if the hosting rewrite ever misses) goes to /start
  // rather than a blank router error.
  { path: "*", element: <Navigate to="/start" replace /> },
]);

export function AppRouter() {
  return (
    <SessionProvider>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </SessionProvider>
  );
}