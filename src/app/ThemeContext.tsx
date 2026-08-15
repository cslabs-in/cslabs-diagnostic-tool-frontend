/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * ThemeContext -- app-wide theme state.
 *
 * The user picks a preference from the Start page's toggle (the only page
 * that shows it):
 *   - "light" / "dark" -- an explicit override, persisted in localStorage.
 *   - "system" -- follow the OS `prefers-color-scheme`, live (no stored
 *     value; the app keeps tracking the media query).
 *
 * `theme` is the EFFECTIVE theme (preference resolved against the OS), and
 * `preference` is what the user actually chose. The effective theme is
 * applied by toggling the `.dark` class on <html> (see index.css), which
 * remaps the semantic color tokens. A pre-paint script in app/index.html
 * applies the same class before the bundle loads so there's no light-flash
 * on dark systems.
 */
export type Theme = "light" | "dark";
export type ThemePreference = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "cslabs_theme";

interface ThemeContextValue {
  /** The user's chosen preference ("system" follows the OS). */
  preference: ThemePreference;
  /** The effective theme (preference resolved against the OS). */
  theme: Theme;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemIsDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/** Returns the stored preference, or null when none was chosen (system). */
function storedPreference(): ThemePreference | null {
  const value = localStorage.getItem(THEME_STORAGE_KEY);
  return value === "light" || value === "dark" || value === "system"
    ? value
    : null;
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    () => storedPreference() ?? "system",
  );
  const [systemDark, setSystemDark] = useState<boolean>(() => systemIsDark());

  // Track the OS preference so "system" keeps following it live. setState
  // happens in the media-query callback (an external-system subscription),
  // never synchronously in the effect body.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const theme: Theme =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;

  // Apply to <html> whenever the effective theme changes. Also re-affirms
  // the pre-paint script's class once React mounts.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setPreference = useCallback((next: ThemePreference) => {
    localStorage.setItem(THEME_STORAGE_KEY, next);
    setPreferenceState(next);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ preference, theme, setPreference }),
    [preference, theme, setPreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
