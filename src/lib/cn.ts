/**
 * Minimal classnames helper -- joins truthy class strings with a space.
 * Deliberately not pulling in `clsx` or `class-variance-authority`: at this
 * component count, a one-line helper is enough, and it keeps the dependency
 * list matching what's locked in frontend-v1-decisions.md §10.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}