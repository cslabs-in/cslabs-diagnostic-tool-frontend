# CSLabs Diagnostic Tool — Frontend V1 Build Log

*Started 2026-08-03. Updated 2026-08-06 (Session 2 — sidebars + API integration).
Companion to `frontend-v1-decisions.md`.*

**How the two docs relate:**
- `frontend-v1-decisions.md` = the architecture/design record — what was
  decided and why (stack, folder structure, page specs, design tokens).
  Update it when a *decision* changes.
- **This doc** = the implementation record — what's actually been built,
  where each file lives, what's mock vs. real, and what's confirmed working
  vs. still pending. Update it every time code gets written or tested.
  Use this doc to pick a new chat back up mid-build without re-deriving
  status from scratch.

---

## 1. Environment / setup status

| Item | Status |
|---|---|
| Vite + React + TS scaffolded into `frontend/` | ✅ Done |
| Tailwind v4 wired up | ✅ Done — tokens live in `src/index.css` via `@theme`; `@tailwindcss/vite` plugin in `vite.config.ts`. **Note:** `frontend-v1-decisions.md` §11 still shows an old `tailwind.config.js` example — stale, not yet reconciled in the decisions doc. |
| CORS middleware added to `backend/app/main.py` | ✅ Done — `allow_origins=["http://localhost:5173"]`. **Confirmed working** as of the Session 2 end-to-end smoke test (backend runs at `http://127.0.0.1:8000`, frontend dev server apparently serves at a matching/allowed origin — no CORS failures observed). |
| Both dev servers running together | ✅ Confirmed |
| `react-syntax-highlighter`, `recharts` installed | ✅ Confirmed in use (`ThemeSelector`/`ConceptScoreChart` render without errors) |
| `axios`, `react-router-dom`, `react-hook-form`, `react-hot-toast`, `lucide-react` | ✅ Present in `package.json` (Session 2: `axios` and `react-router-dom` now actually wired in; `react-hot-toast`'s `<Toaster />` now mounted in `app/router.tsx` — previously installed but unused) |

---

## 2. Files built so far

Paths relative to `frontend/src/`. Status: ✅ confirmed working, 🔧 built but
not yet smoke-tested.

### Foundation
| File | Purpose | Status |
|---|---|---|
| `lib/cn.ts` | Classnames helper | ✅ |
| `index.css` | Tailwind v4 `@theme` tokens | ✅ |
| `vite.config.ts` | `@tailwindcss/vite` plugin | ✅ |
| `App.tsx` | **Session 2:** now mounts `<AppRouter />` instead of a single hardcoded page — the old "manually swap pages for smoke testing" workflow (§3.6, original build log) is retired | ✅ |

### `app/` (Session 2 — new folder, first files in it)
| File | Purpose | Status |
|---|---|---|
| `app/SessionContext.tsx` | Single source of truth for the active session: `sessionId`, `theme`, `questions`, `answers`, `currentIndex`, `report`. Replaces each page's local mock state. | ✅ |
| `app/router.tsx` | Routes: `/`, `/quiz`, `/review`, `/report`. `RequireSession` guard redirects to `/` if no active `sessionId`. Mounts `<Toaster />`. | ✅ |

### `api/` (Session 2 — new folder)
| File | Purpose | Status |
|---|---|---|
| `api/client.ts` | Shared axios instance, `baseURL: http://127.0.0.1:8000/api` | ✅ |
| `api/types.ts` | Raw **snake_case** backend DTOs (`RawThemeResponse`, `RawCreateSessionResponse`, `RawReportResponse`, etc.) — private to the api/ layer, never leak past `themes.ts`/`sessions.ts` | ✅ |
| `api/themes.ts` | `getThemeQuestions(theme)` — fetches one theme, maps to `Question[]` + a `conceptId → conceptName` map | ✅ |
| `api/sessions.ts` | `createSession`, `submitAnswer`, `completeSession`, `getReport` — full snake_case → camelCase mapping at the boundary | ✅ |

### `components/ui/`, `layout/`, `types/` — unchanged since original build, still ✅.

### `components/diagnostic/`
| File | Purpose | Status |
|---|---|---|
| `CodeBlock.tsx`, `OptionList.tsx`, `QuestionCard.tsx`, `NavControls.tsx` | Unchanged | ✅ |
| `AnsweredSummaryList.tsx` | Unchanged | ✅ (confirmed via Review smoke test, Session 2) |
| `ThemeSelector.tsx` | **Session 2:** "Both" option **removed** (no combined-theme backend endpoint). Now only Grammar (6) / Data Representation (17). `ThemeId` type now sourced from `api/themes.ts` as single source of truth instead of a locally duplicated type. Stays hardcoded (not backend-driven) until real user testing, per explicit decision. | ✅ |
| `DiagnosticGuideSidebar.tsx` | **New, Session 2.** Static tips + "Remember" callout, per §7.3. No props — pure static copy. | ✅ smoke-tested |
| `ReviewSummarySidebar.tsx` | **New, Session 2.** Total/Answered/Skipped counts, per §7.4. Props-driven. | ✅ smoke-tested |

### `components/report/`
| File | Purpose | Status |
|---|---|---|
| `stateStyles.ts`, `ReportBlock.tsx`, `ConceptScoreChart.tsx` | Unchanged | ✅ |
| `ReportSidebar.tsx` | **New, Session 2.** Mastered/Needs Attention/Untested tallies, reusing `stateStyles.ts` and the same `conceptScores` data `ConceptScoreChart` uses. **Deliberately not** the old §7.5 card-era spec (state counts + a separate correct/wrong/skipped bar) — that section is marked superseded by §12, and the old bar isn't derivable from `concept_scores` without extra plumbing. | ✅ smoke-tested |

### `pages/` — all four rewritten in Session 2 to use `SessionContext` + real API calls instead of mock data
| File | Purpose | Status |
|---|---|---|
| `StartPage.tsx` | Real `startNewSession(theme)` → navigates to `/quiz`. Resume banner still conditional on `localStorage`. Discard confirmation still `window.confirm()` (unresolved open item, see §5). | ✅ end-to-end smoke-tested |
| `QuizPage.tsx` | Reads `questions`/`answers`/`currentIndex` from context; each select/skip calls real `POST /answers`. | ✅ end-to-end smoke-tested |
| `ReviewPage.tsx` | Reads real answers from context; Submit calls `completeAndFetchReport()` (handles a `409` from a double-submit gracefully), then navigates to `/report`. | ✅ end-to-end smoke-tested |
| `ReportPage.tsx` | Reads `report` from context (populated by `ReviewPage`'s submit). Redirects to `/` via `useEffect` if `report` is missing. | ✅ end-to-end smoke-tested, **but see known gap in §4** |

---

## 3. Known assumptions not independently verified

- `ThemeSelector.tsx`'s exact original imports for `Card`/`cn` were inferred
  (`../ui/Card`, `../../lib/cn`) from patterns seen in other components —
  not confirmed against the original file content, since it wasn't shared
  in full. No TypeScript errors reported after the rewrite, so likely
  correct, but flagging since it wasn't a direct verification.
- `types/diagnostic.ts` and `types/report.ts` were never shared in full —
  `api/sessions.ts` and `api/themes.ts` were written against the *shape*
  described in earlier messages (`Question`, `Answer`, `ReportResponse`,
  `ConceptScoreDTO`), not the literal file contents. No compile errors
  reported, so the shapes evidently matched, but this is worth a direct
  diff if anything looks subtly off later.

---

## 4. Known v1 gaps (accepted, documented, not blocking)

These were explicitly discussed and accepted as scope for v1 — not bugs to
silently fix later without revisiting the decision:

1. **Single-theme sessions show the WHOLE concept graph's Untested state in
   the report, not just the selected theme.** Root cause: `complete_session`
   in `sessions.py` always sweeps the *entire* `diagnostic.concepts` /
   `diagnostic.questions` tables (per the design doc's "never trace from a
   single leaf" rule, §5.1) — correct when a student attempts the full
   graph, but misleading when they only did one theme, since every concept
   in the untouched theme reads as "Untested" indistinguishably from
   "genuinely skipped." This affects the chart, the `ReportSidebar` tallies,
   **and** `report_text` itself (e.g. "You skipped X entirely" sentences
   about concepts in the theme the student never selected) — so it isn't
   fixable purely on the frontend without leaving misleading prose in place.
   **Decision: accept as a v1 gap.** Revisit if/when "Both" (whole-graph)
   becomes a real supported flow, which would make this moot, or as a
   small backend filter (`complete_session` scoped to the session's theme)
   if single-theme accuracy becomes a blocker before then.
2. **Resume doesn't survive an actual page reload.** `resumeSession()` only
   restores `sessionId` + last question index from `localStorage` — there's
   no `GET /sessions/{id}` endpoint to rebuild the in-memory question bank
   from a bare `session_id`. `StartPage` detects this (`questions.length ===
   0` after resume) and falls back to a clean start with a toast, rather
   than rendering a broken quiz. Real fix needs a new backend endpoint —
   not built, by choice ("let's not touch the backend").
3. **`StartPage`'s discard-confirmation is `window.confirm()`** — explicit
   placeholder, not a designed interaction. Carried over from before
   Session 2, still open.
4. **Diagnostic Guide sidebar has no mobile fallback** below 820px (sidebar
   hides entirely). Deliberately deferred until after API integration —
   revisit now that API integration is done.
5. **`ThemeSelector` stays hardcoded**, not fetched from the backend. "Both"
   removed since there's no combined endpoint. To be revisited (hardcoding
   removed) after real user testing.
6. **No code-block support in real question data.** `themes.py`'s question
   query has no `code` column — `CodeBlock.tsx` only ever rendered against
   the old mock data, never real content. Not a bug, just means the
   feature is currently dormant.

---

## 5. Open items carried over, still unresolved

- **StartPage's discard-confirmation interaction** — still not designed.
- **Diagnostic Guide mobile fallback (§3.1, original log)** — still open,
  now unblocked (API integration is done) if it should be tackled next.
- **`STATE_HEX` / `index.css` token sync point** — still a manual-sync risk
  in `ConceptScoreChart.tsx`, not urgent.
- **`frontend-v1-decisions.md` needs a reconciliation pass**, covering:
  - §11's stale `tailwind.config.js` example (v4 uses `@theme` instead)
  - §3.1's "narrow, don't stack" sidebar rule superseded by "hide below 820px"
  - §7.5 being superseded by §12 (worth explicitly marking, not just implied)
- **Endpoints 2–6 have only been integration-tested against the
  market-research Supabase project**, not the real `diagnostic` project.

---

## 6. Overall project status (as of end of Session 2)

**Done:**
- Engine (Deliverable 1 & 2) — scoring, traversal, report generation,
  validated against Appendix B fixtures.
- Backend — all 6 endpoints built, integration-tested, CORS added, locked.
- Frontend foundation, UI primitives, layout shell, all four pages, all
  three page-specific sidebars — built and smoke-tested.
- API layer (`client.ts`, `themes.ts`, `sessions.ts`) + `SessionContext` +
  router — built and wired.
- **Full end-to-end smoke test passed against the live local backend:**
  theme select → quiz → review → submit → real report.

**Not yet done (Deliverable 3 → 4 remaining work):**
1. Verify endpoints 2–6 against the **real** `diagnostic` Supabase project
   (only tested against market-research fixture data so far).
2. Resolve the two open UI design items (discard-confirmation, mobile
   fallback) — probably before real students hit them.
3. Deploy backend to Render (gated on frontend stabilizing, which it now
   largely has).
4. Real student end-to-end testing — the actual v1 validation milestone.
5. `frontend-v1-decisions.md` reconciliation pass (see §5 above).

---

## 7. Current file tree (Session 2 snapshot)

```
frontend/src/
├── App.tsx                            (mounts AppRouter)
├── lib/
│   └── cn.ts
├── index.css
├── app/                                ← NEW (Session 2)
│   ├── SessionContext.tsx
│   └── router.tsx
├── api/                                ← NEW (Session 2)
│   ├── client.ts
│   ├── types.ts
│   ├── themes.ts
│   └── sessions.ts
├── layout/
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Footer.tsx
│   └── DiagnosticLayout.tsx
├── types/
│   ├── diagnostic.ts
│   └── report.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Progress.tsx
│   ├── diagnostic/
│   │   ├── CodeBlock.tsx
│   │   ├── OptionList.tsx
│   │   ├── QuestionCard.tsx
│   │   ├── NavControls.tsx
│   │   ├── AnsweredSummaryList.tsx
│   │   ├── ThemeSelector.tsx           (updated Session 2 — "Both" removed)
│   │   ├── DiagnosticGuideSidebar.tsx  ← NEW (Session 2)
│   │   └── ReviewSummarySidebar.tsx    ← NEW (Session 2)
│   └── report/
│       ├── stateStyles.ts
│       ├── ReportBlock.tsx
│       ├── ConceptScoreChart.tsx
│       └── ReportSidebar.tsx           ← NEW (Session 2)
└── pages/
    ├── QuizPage.tsx                    (rewired to SessionContext)
    ├── ReviewPage.tsx                  (rewired to SessionContext)
    ├── ReportPage.tsx                  (rewired to SessionContext)
    └── StartPage.tsx                   (rewired to SessionContext)

NOT YET BUILT:
├── content/             (conceptInsights.json)
├── assets/
```
