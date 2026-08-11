/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createSession,
  submitAnswer as apiSubmitAnswer,
  completeSession as apiCompleteSession,
  getReport as apiGetReport,
} from "../api/sessions";
import { getThemeQuestions, type ThemeId } from "../api/themes";
import type { Answer, OptionLetter, Question } from "../types/diagnostic";
import type { ReportResponse } from "../types/report";

const SESSION_STORAGE_KEY = "cslabs_session_id";
const SESSION_INDEX_STORAGE_KEY = "cslabs_session_last_index";

interface SessionContextValue {
  sessionId: string | null;
  theme: ThemeId | null;
  questions: Question[];
  answers: Record<string, Answer>;
  currentIndex: number;
  report: ReportResponse | null;
  isLoading: boolean;
  error: string | null;

  startNewSession: (theme: ThemeId) => Promise<void>;
  /** Restores session_id + last index from localStorage. Does NOT
   * rehydrate `questions` -- there's no GET /sessions/{id} endpoint to
   * rebuild the question bank from a bare session_id, so this only helps
   * if `questions` is still populated in memory (e.g. nav away and back
   * within the same load, not an actual page reload). Returns whether a
   * stored session_id existed at all. */
  resumeSession: () => boolean;
  discardSession: () => void;
  setAnswer: (questionId: string, selectedOption: OptionLetter | null) => Promise<void>;
  goToIndex: (index: number) => void;
  completeAndFetchReport: () => Promise<ReportResponse>;
  hasStoredSession: () => boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [conceptNames, setConceptNames] = useState<Record<string, string>>({});
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasStoredSession = useCallback(() => {
    return localStorage.getItem(SESSION_STORAGE_KEY) !== null;
  }, []);

  const startNewSession = useCallback(async (newTheme: ThemeId) => {
    setIsLoading(true);
    setError(null);
    try {
      const [session, themeResult] = await Promise.all([
        createSession(),
        getThemeQuestions(newTheme),
      ]);
      setSessionId(session.sessionId);
      setTheme(newTheme);
      setQuestions(themeResult.questions);
      setConceptNames(themeResult.conceptNames);
      setAnswers({});
      setCurrentIndex(0);
      setReport(null);
      localStorage.setItem(SESSION_STORAGE_KEY, session.sessionId);
      localStorage.setItem(SESSION_INDEX_STORAGE_KEY, "0");
    } catch (err) {
      setError("Could not start a new diagnostic. Please try again.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resumeSession = useCallback(() => {
    const storedId = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedId) return false;
    const storedIndex = Number(localStorage.getItem(SESSION_INDEX_STORAGE_KEY) ?? "0");
    setSessionId(storedId);
    setCurrentIndex(Number.isFinite(storedIndex) ? storedIndex : 0);
    return true;
  }, []);

  const discardSession = useCallback(() => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_INDEX_STORAGE_KEY);
    setSessionId(null);
    setTheme(null);
    setQuestions([]);
    setConceptNames({});
    setAnswers({});
    setCurrentIndex(0);
    setReport(null);
  }, []);

  const setAnswer = useCallback(
    async (questionId: string, selectedOption: OptionLetter | null) => {
      if (!sessionId) return;
      setAnswers((prev) => ({ ...prev, [questionId]: { questionId, selectedOption } }));
      await apiSubmitAnswer(sessionId, questionId, selectedOption);
    },
    [sessionId],
  );

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    localStorage.setItem(SESSION_INDEX_STORAGE_KEY, String(index));
  }, []);

  const completeAndFetchReport = useCallback(async (): Promise<ReportResponse> => {
    if (!sessionId) throw new Error("No active session to complete.");
    try {
      await apiCompleteSession(sessionId);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      // 409 = already completed (e.g. a double-submit) -- safe to proceed
      // straight to fetching the already-generated report.
      if (status !== 409) throw err;
    }
    const result = await apiGetReport(sessionId, conceptNames);
    setReport(result);
    // Clear only the *resume* pointers, not sessionId in context -- a
    // completed session shouldn't be offered as "resume" on next visit to
    // StartPage, but ReportPage still needs sessionId in context to pass
    // the route guard.
    localStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_INDEX_STORAGE_KEY);
    return result;
  }, [sessionId, conceptNames]);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessionId,
      theme,
      questions,
      answers,
      currentIndex,
      report,
      isLoading,
      error,
      startNewSession,
      resumeSession,
      discardSession,
      setAnswer,
      goToIndex,
      completeAndFetchReport,
      hasStoredSession,
    }),
    [
      sessionId,
      theme,
      questions,
      answers,
      currentIndex,
      report,
      isLoading,
      error,
      startNewSession,
      resumeSession,
      discardSession,
      setAnswer,
      goToIndex,
      completeAndFetchReport,
      hasStoredSession,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}