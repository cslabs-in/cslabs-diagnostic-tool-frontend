# CSLabs Diagnostic Tool — Frontend V1: Locked Decisions

*Written after Deliverable 3 (engine + backend) was complete and integration-tested,
and updated after the visual design phase (all four V1 pages sketched and reviewed:
StartPage, QuizPage, ReviewPage, ReportPage). Reconciled 2026-08-06 against what was
actually built during frontend implementation (sidebars + API integration) — see
inline "updated 2026-08-06" notes for the handful of specs that changed once real
code was written; everything else below still held. This document is the source of
truth for frontend V1 scope, architecture, and visual-design decisions. It does not
override `docs/design-reference-v4.md` (engine/report behavior) or the Deliverable 3
handoff doc (backend/db state) — it sits alongside them, scoped to frontend only.
Paste this into a fresh chat to continue frontend work without re-deriving these
decisions.*

**Mockups referenced below** (static HTML, not wired to real data):
`start-page-v1.html`, `quiz-page-v1-final.html`, `review-page-v1.html`, `report-page-v1.html`.

---

## 1. Deployment sequencing (locked)

**Decision: build frontend against the local backend first. Do not deploy to Render yet.**

Reasoning:
- Backend is only proven against the market-research Supabase project; the real
  project is unverified beyond `/health`. Deploying now stacks an unverified
  Render environment on top of that.
- No `CORSMiddleware` is configured yet — deploying before adding it just guarantees
  a CORS failure as the first frontend bug.
- Render free tier has cold starts; bad feedback loop for iterative UI dev vs.
  `uvicorn --reload` locally.
- No third Supabase slot exists, so deploying doesn't buy a clean staging setup anyway.

**Before frontend dev starts:**
1. Add `CORSMiddleware` to `backend/app/main.py`, allow the local frontend dev origin.
2. Live-test endpoints 2–6 against the *real* diagnostic project (curl/Postman) —
   currently only `/health` is confirmed live there. Cheap to close out now while
   it's still isolated from frontend work.

**Deploy to Render only after** the frontend has a working end-to-end flow locally
(per Deliverable 3 handoff §7, step 3).

---

## 2. Data source for frontend dev (locked)

**Decision: frontend development runs against the market-research project's seeded
fixture data (Appendix B, 9-concept graph), not the real diagnostic project.**

Reasoning: fixture data has known, deterministic expected outputs (Students A–D,
already validated in `test_stage2_students_ab.py` / `test_stage3_students_cd.py`),
so UI can be built and visually checked against known-correct report text. Also
keeps write traffic (sessions/answers/scores rows) out of the real project during
active frontend iteration.

Local backend `.env` during frontend dev should point at the market-research
`diagnostic` schema (same connection pattern already used by `backend/tests/.env.test`),
not `backend/.env`'s real-project value. Switch back to the real project only when
deploying / doing final real-data checks.

---

## 3. Question flow UX (locked)

- **One question at a time**, not all-on-one-page. Each answer (or skip) is
  submitted incrementally via `POST /api/sessions/{id}/answers` as the student
  advances — not batched at the end.
- **Skipping is explicit and first-class.** A dedicated "Skip" action submits
  `selected_option: null` for that question, matching the engine's treatment of
  skipped == unattempted (relevant to Untested-state resolution). Skipping is not
  "leave the radio buttons blank and move on silently."
- **Back navigation revisits, doesn't resubmit** — going back to a previous
  question shows what was previously selected without firing a duplicate POST
  unless the student actively changes the answer (see §5, overwrite behavior).

---

## 4. Progress persistence / resume (locked)

**Decision: local-only resume via localStorage.** No backend endpoint for
"answers submitted so far" is being added for V1.

- On `StartPage`, before creating a new session, check localStorage for an
  existing `session_id`. If found, offer an explicit **"Resume" vs "Start new"**
  choice — never silently reuse a stale session (could be days old or already
  completed).
- `QuizPage` rehydrates in-progress answers and last question index from
  localStorage on mount via a `useSessionResume(sessionId)` hook.
- **Known limitation, accepted for V1:** resume does not work across devices/
  browsers, since progress isn't fetched from the server. If this becomes a real
  problem post-launch, it needs a new backend read endpoint — not a frontend-only
  fix.

---

## 5. Answer overwrite behavior (locked)

**Decision: re-answering a question overwrites the previous answer for that
question within the same session**, consistent with the engine's existing
dedupe rule (`scoring.py::_dedupe_answers` — last submitted answer for a
`question_id` wins). This applies whether the student changes an answer via
Back-navigation in the quiz flow or via the review screen.

No new backend logic is implied by this — `POST /api/sessions/{id}/answers`
already accepts repeat submissions per the engine's last-write-wins design;
this decision just confirms the frontend is allowed to rely on that and expose
editing in the UI.

---

## 6. Page / component tree (locked as V1 scope)

```
App
├── Router (updated 2026-08-06 — flat paths, not per-session URLs; see note)
│   ├── /        → StartPage
│   ├── /quiz    → QuizPage    (RequireSession guard: redirects to / if no
│   ├── /review  → ReviewPage   active sessionId in SessionContext)
│   └── /report  → ReportPage
│
├── StartPage
│   ├── ThemeSelector               (Grammar / Data Rep / Both)
│   └── StartButton
│       → checks localStorage for existing session_id first
│       → POST /api/sessions (if starting new)
│       → store session_id (localStorage + URL)
│       → navigate to /quiz
│
├── QuizPage
│   ├── useSessionResume(sessionId)      # rehydrates in-progress answers +
│   │                                     # last question index from localStorage
│   ├── ProgressBar                      (X of N answered)
│   ├── QuestionCard
│   │   ├── QuestionStem
│   │   ├── OptionList (A–D, radio)
│   │   └── SkipButton                   (submits selected_option: null)
│   ├── NavControls
│   │   ├── BackButton                   (revisit previous question, no resubmit
│   │   │                                 unless answer is actively changed)
│   │   └── NextButton
│   │       → POST /api/sessions/{id}/answers
│   │       → advance local index, persist to localStorage
│   │       → on last question → navigate to /review
│   └── ExitSaveNotice                   ("progress is saved, safe to close")
│
├── ReviewPage
│   ├── AnsweredSummaryList              (question → selected option / "Skipped",
│   │                                     editable — re-POST overwrites per §5)
│   ├── ConfirmCompleteButton
│   │   → POST /api/sessions/{id}/complete
│   │   → handle 409 (already completed) → navigate straight to report
│   │   → navigate to /report
│   └── BackToQuizLink
│
├── ReportPage
│   ├── useReportFetch(sessionId)
│   │   → GET /api/sessions/{id}/report
│   │   → handle 404 / 409 (not completed yet) → redirect to quiz or review
│   ├── SummarySection
│   ├── RootCauseList
│   ├── PendingItemsList
│   ├── InconsistencyFlagList
│   └── SkippedLeafNotesList
│
└── shared/
    ├── api/ (sessions.ts, themes.ts — thin fetch wrappers, one per endpoint)
    ├── SessionContext                   (sessionId, currently-persisted answers)
    └── ErrorBoundary / ToastOnApiError
```

---

## 7. Visual design (locked)

All four V1 pages went through iterative review against reference images before
being finalized. The result is one shared shell and visual language, plus a few
per-page decisions layered on top.

### 7.1 Shared app shell (locked)

- **Fixed-height layout, no whole-page scroll.** `.shell` is locked to `100vh`.
  Header and any status/progress row are `flex-shrink: 0`; only specific inner
  regions (a sidebar, a card body, an answer list) scroll independently if their
  content overflows. This was a direct fix after an early QuizPage draft used a
  responsive breakpoint that stacked the sidebar above the question card on
  narrower viewports, forcing page-level scroll — that breakpoint pattern is
  rejected going forward (see §8).
- **Sidebar stays pinned left at supported widths; hides entirely below
  820px** (updated 2026-08-06 — the original plan below still holds for
  ≥820px, but "narrow the sidebar" was replaced with "hide it" once a real
  screenshot showed a narrowed sidebar looking cramped on mobile widths; a
  hidden sidebar still satisfies the actual goal — no page-level scroll from
  a stacked layout — without the cramped-narrow look. **Still open:**
  whether the Diagnostic Guide's reassurance copy needs a compact mobile
  fallback elsewhere on the page now that it's hidden outright below 820px —
  see §8.)
- **No timer, anywhere, on any page.** Reinforces the "diagnostic, not test"
  framing from design reference §2. StartPage's copy leads with this directly
  ("This isn't a test — there's no time limit").
- **No user accounts.** No name, avatar, or profile control in any header —
  consistent with the anonymous `session_id`-based flow. Each page's header has
  at most one exit affordance (e.g. "Leave test"), never two.
- **Design tokens** (consistent across all four mockups; expanded and locked
  2026-08-03 — see rationale note at the end of this list):
  - Ink: `#1c2024` (primary text), `#5c6570` (soft/secondary), `#8a929b` (faint)
  - Accent (Mastered/positive/primary action): `#3f6f5e`, soft bg `#eaf1ee`, line `#cfe0d9`
  - Needs Attention (formerly "Weak"): `#b5482f`, soft bg `#fbeeeb`, line `#f0c9bf`
  - Skip/neutral-caution (per-question skip status, distinct from concept state): `#9a6b3f`, soft bg `#f7f0e6`, line `#e3cfa8`
  - Untested/neutral: `#6b7280`, soft bg `#f0f1f2`, line `#d9dce0`
  - Border/line: `#e3e6e9`; page background: `#f7f8f8`; card background: `#ffffff`
  - Font: system UI stack (Segoe UI / -apple-system), monospace for code blocks
    and answer-option text where content is code-like.
  - **Concept-state terminology:** the engine's three `ConceptState` values
    (`Strong`, `Weak`, `Untested`) are display-labeled as **Mastered**,
    **Needs Attention**, and **Untested** everywhere in the UI — reinforces
    diagnostic framing over pass/fail framing (§2). This is a display-layer
    rename only: API payloads, TypeScript types, and internal variable names
    keep the engine's original `Strong`/`Weak`/`Untested` values unchanged,
    mapped to display labels only at render time (e.g. a `stateLabels` lookup
    object, not a rename of the type itself). "Pending" (report-level,
    blocked-on-untested-prerequisite, per `traversal.py`'s `PendingItem`) and
    "Skipped" (per-question answer status, `selected_option: null`) are
    distinct from concept state and are **not** part of this three-way
    label/color mapping — don't try to fold them in.
  - **Spacing scale:** Tailwind's default scale only — `4px, 8px, 12px, 16px,
    24px, 32px, 48px, 64px` (i.e. `p-1, p-2, p-3, p-4, p-6, p-8, p-12, p-16`
    and their `m-`/`gap-` equivalents). No arbitrary values (`p-[17px]`, etc.)
    anywhere in the codebase — this requires zero config, just discipline.
  - **Border radius** (custom keys, added under `theme.extend.borderRadius`
    in `tailwind.config.js` — see §11's implementation note):
    - Small elements: `8px`
    - Cards: `12px`
    - Buttons: `10px`
    - Pills/chips: `999px` (Tailwind's stock `rounded-full` already covers this)
  - **Shadows** (custom keys, added under `theme.extend.boxShadow`):
    - Card (resting): `0 1px 2px rgba(0,0,0,.05)`
    - Hover: `0 6px 16px rgba(0,0,0,.08)`
    - No other shadow values used anywhere in the product — heavy shadows
      don't fit this product's visual language.
  - **Animation durations:** Tailwind's default `duration-150` (hover),
    `duration-200` (page fade), `duration-300` (progress bar) only — zero
    config needed. No `duration-500`+ transitions, no custom easing curves;
    predictable over flashy, consistent with the "only hover / focus /
    loading" motion rule already locked above.
  - **Icons:** Lucide React, outline style only. No filled icons, no mixed
    icon sets/styles anywhere in the product.
  - **Button variants — exactly three, no others:**
    - Primary: filled (accent color)
    - Secondary: outline
    - Ghost: text-only, no border/fill
  - **Chip colors — exactly two, no others:**
    - Concept tag chips: teal (accent)
    - Status chips (answered/skipped/etc.): gray
    - No blue, purple, pink, or orange chips without a specific, documented
      functional reason at the point of use.
  - **Report colors — identical mapping used everywhere** results appear
    (ReportPage now; Dashboard, Knowledge Graph, and Learning Path later):
    - Mastered → accent teal
    - Needs Attention → muted terracotta (`#b5482f` family)
    - Untested → gray (`#6b7280` family)
    - (Pending and Skipped keep their own existing colors above — they are
      not part of this three-way concept-state mapping, per the terminology
      note.)

  > **Rationale note:** spacing, radius, shadow, animation, icon-style, button-
  > variant, chip-color, and cross-surface report-color rules were reviewed
  > and locked together as one pass, on top of the color palette and
  > typography that were already frozen. Spacing and animation durations use
  > Tailwind's own default scale as-is (no new tokens to invent — just a rule
  > never to deviate from it with arbitrary values); radius and shadows need
  > small custom `theme.extend` entries since the exact values here aren't
  > all stock Tailwind steps. See §11 for where these live in
  > `tailwind.config.js`.
- **Concept tags** (small pill labels, e.g. "Implicit Type Conversion") appear
  wherever a question or result ties back to a specific concept — used instead
  of a subject/section label, since the concept graph is the actual organizing
  structure of the tool, not GATE-style syllabus sections.

### 7.2 StartPage (locked)

- Theme selector shows real concept counts from the design reference: Grammar
  (6), Data Representation (17) — not placeholder numbers. **"Both" removed
  2026-08-06:** the backend only has `GET /themes/{theme}/questions` for a
  single theme, with no combined-theme endpoint, and merging two theme
  responses client-side was deferred rather than built speculatively. Only
  the two real, individually-fetchable themes are offered for now. Known,
  accepted side effect: a single-theme session's report shows the *entire*
  concept graph's Untested state, not just the selected theme, since
  `complete_session` always sweeps the full graph server-side (§1 doesn't
  cover this — see `frontend-v1-build-log.md` §4 for the full root-cause
  writeup and why it's accepted as a v1 gap rather than fixed now).
- **Resume banner is conditional**, shown only when `localStorage` has an
  existing `session_id` on page load. First-time visitors see the theme selector
  directly with no banner.
- **"Start new" requires a confirmation step** before discarding an existing
  in-progress session — never silently reuse *or* silently discard a stale
  session_id (extends §4's resume decision). **Open item:** the confirmation
  interaction itself (modal vs. inline expand vs. separate step) has not been
  designed yet — only the entry point (two buttons: "Start new" / "Resume") is
  mocked.
- Start button should disable while `POST /api/sessions` is in flight, to
  prevent a double-click from creating two sessions (not enforced in the static
  mockup, but required in the real build).
- Copy leads with "this isn't a test" before the student picks anything.

### 7.3 QuizPage (locked)

- One question at a time (per §3), rendered as a single card with a concept tag,
  question stem, options (A–D), and an explicit Skip action separate from
  Previous/Next.
- **Code block rendering is required**, not optional — most Grammar/Data
  Representation questions include C source snippets, which the earlier draft
  missed. Rendered as a distinct monospace block with line numbers, separate
  from the question stem.
- Skip button carries a short reassurance note near it ("skipping is fine and
  still useful") rather than looking like a punitive fallback.
- **Diagnostic Guide sidebar** (one question at a time / answer honestly / skip
  if unsure / can change answer) plus a **"Remember" callout** ("don't worry
  about your score") — both reinforce the non-exam framing at the point the
  student is most likely to feel test anxiety.
- **Single progress indicator** — one bar plus one percentage, both driven by
  the same answered-count. No duplicate/redundant progress widgets.
- No question palette/jump-navigation grid, no sections, no "Marked for Review"
  status — all explicitly out of scope (see §8).

### 7.4 ReviewPage (locked)

- Same shell as QuizPage. Sidebar swaps from the Diagnostic Guide to a
  **Summary stat block** (total / answered / skipped counts) — the answering
  tips aren't relevant once the student is done, a live count is more useful.
- Full list of questions, each showing status (answered/skipped), the selected
  option letter if answered, and its concept tag. **No correctness (right/wrong)
  is shown anywhere on this page** — matches design reference §2's framing and
  the fact the engine doesn't expose per-question correctness at all, only
  concept-level state.
- **Clicking a row routes back into the quiz** at that specific question index
  (`/quiz`, pre-loaded, reading the target index from SessionContext), rather than an inline editor — re-answering
  there overwrites the stored answer per §5's dedupe/overwrite decision. No
  separate edit UI or edit-specific backend logic needed.
- Submit action reads **"Submit diagnostic,"** not "Submit test" — consistent
  copy choice with the non-exam framing.
- Submitting triggers `POST /api/sessions/{id}/complete`; a 409 (already
  completed) routes straight to `/report` rather than showing an
  error.

### 7.5 ReportPage (locked — superseded 2026-08-03, see §12)

> **Note:** the card-based layout described below (from the original visual
> design pass) is **deferred to v1.5**. §12 documents the V1 decision: render
> `report_text` as styled prose in a single `ReportBlock`, plus one aggregate
> `ConceptScoreChart`. The content below is kept for record and as the starting
> point for the v1.5 card rework — it is not what V1 builds.

- **Grouped by concept**, ordered exactly per design reference §7: root
  cause(s) → pending/needs-more-data → inconsistency flags →
  skipped-but-harmless. Concepts that are Strong with no findings are collapsed
  into compact chips at the end rather than given full cards, since there's
  nothing actionable to say about them.
- **Correct/wrong/skipped shown as a per-concept rollup, not per-question**
  (e.g. "0 correct, 2 wrong, 0 skipped" on a concept card). This was an explicit
  decision after weighing two options — see the decision note below. Rollup
  numbers are derived from `ConceptScore` fields the engine already computes
  (`marks_obtained`, `num_answered` vs. total); no new backend endpoint is
  needed. Per-question correctness is never shown anywhere in the frontend.
- Sidebar shows two aggregate tallies: concept-state counts (Strong/Weak/
  Untested) and an overall correct/wrong/skipped question bar — both aggregates,
  never tied back to a specific question.
- Card reasoning text is the actual `report.py`-generated sentences (root cause
  framing, pending explanation, inconsistency flag wording), just re-laid-out
  into cards instead of the plain-text block the CLI produces — the underlying
  report copy logic doesn't need to change for this UI.
- A root-cause card's "Also explains" line surfaces `downstream_weak_concepts`
  so the fan-out logic (one root explaining several weak concepts) is visible
  without exposing raw concept IDs.
- **Not yet validated:** the card layout was mocked against Student C's data
  pattern (single root cause + one inconsistency flag) plus one synthetic
  pending example. It has **not** been checked against Student D's actual
  output, which has *multiple* pending items sharing one blocker grouped into a
  single sentence (per `report.py`'s `blocker_to_blocked` grouping) — worth a
  pass before treating this layout as fully validated against real report text.

> **Decision note — why per-concept rollup over per-question ✓/✗:**
> Two options were on the table: (a) a per-question correct/wrong list, or (b)
> per-concept rollup counts. (a) would have been new scope requiring a new data
> pull (answers + question bank + correct-answer comparison) beyond what
> `GET /api/sessions/{id}/report` currently returns, and would have directly
> contradicted the already-locked "no per-question correctness, ever" rule from
> ReviewPage. (b) uses data the engine already computes and keeps the framing
> concept-level throughout the product. (b) was chosen. **This reasoning still
> holds under the V1 prose+chart approach in §12** — the chart uses `ConceptScore`
> rollups, never per-question data.

---

## 8. Open items — not yet decided, flag if they come up

~~Tooling choice for frontend~~ — **resolved, see §10.**
~~Styling approach and state management library~~ — **resolved, see §10.**
~~Whether `report.py`'s plain-text output needs structural change for the
frontend~~ — **resolved, see §12: no backend change, V1 renders prose + chart
from data the `/report` endpoint already returns.**

Still open:
- Whether `ReviewPage`'s edit capability needs any backend confirmation beyond
  the dedupe logic already validated in `scoring.py` (assumed fine per §5, but
  hasn't been exercised via a live "edit then complete" integration test yet).
~~CORS origin value(s) to allow~~ — **resolved.** `allow_origins=
["http://localhost:5173"]` added to `backend/app/main.py`; confirmed working
via the Session 2 end-to-end smoke test (theme select → quiz → review →
submit → report against the live local backend, no CORS failures observed).
- **StartPage's "discard existing session" confirmation interaction** — not yet
  designed (modal, inline expand, or separate step all still on the table).
- **ReportPage's card-based concept layout (§7.5) has only been checked against
  Student C's pattern** — deferred to v1.5 along with the card rework itself
  (§12); revisit against Student D's real output (multiple pending items
  grouped under one shared blocker) when that work picks back up.
- **Diagnostic Guide mobile fallback** — the sidebar hides entirely below
  820px (§7.1); whether the reassurance copy needs a compact fallback
  elsewhere on the page at that width is still undecided. Deliberately
  deferred until after API integration, which is now done — open to be
  picked up next.
- **Single-theme sessions and the full-graph report sweep** — `complete_session`
  always scores/traverses the entire concept graph, not just the session's
  selected theme, so a single-theme report currently shows every concept in
  the *other* theme as Untested, indistinguishably from a genuinely-skipped
  concept — including in `report_text` itself, not just the chart. Accepted
  as a v1 gap for now (see §7.2's note and `frontend-v1-build-log.md` §4 for
  the full writeup); would need a small, scoped backend change if it becomes
  a blocker before "Both" (whole-graph) becomes a real supported flow.

---

## 9. Explicitly rejected / not doing for V1

- Cross-device/cross-browser resume via a server-fetched "answers so far" endpoint.
- Batching all answers into one submission at quiz end.
- Silent blank-answer-as-skip (skip is an explicit UI action).
- Deploying backend to Render before frontend has a working local end-to-end flow.
- Building frontend against the real diagnostic project's data.
- Per-question correct/wrong display anywhere in the frontend, including on the
  report page — only per-concept rollups and concept-level state are shown.
- A countdown timer or any time-pressure UI, on any page.
- A question palette / jump-to-any-question grid, exam-style sections, or a
  "Marked for Review" status — all rejected as out of scope for the linear,
  single-theme V1 flow.
- Responsive breakpoints that stack the sidebar above main content — the
  sidebar hides below 820px instead (updated 2026-08-06, see §7.1), so the
  page never needs to scroll vertically as a whole.
- User accounts, login, or any per-user identity in the UI.
- `/dashboard` and `/profile` routes/pages — not part of the diagnostic tool's
  V1 scope, even though the sibling learning-platform codebase has both. Only
  the four routes in §6 exist for V1.
- Card-based ReportPage layout (§7.5) for V1 — the visual design work there is
  kept as a reference for v1.5, not built now. See §12.
- Any new backend endpoint or schema change for the frontend build — the
  backend is locked (per project-level decisions); the report-rendering
  approach in §12 was chosen specifically because it needs zero backend changes.
- A `styles/colors.ts` / `spacing.ts` / etc. parallel design-token system —
  `tailwind.config` is the single source of design tokens (see §10).
- A `features/` folder split (feature-based architecture) for V1 — see §11.
  Revisit only if/when the frontend grows past the current four-page flow.
- Redux, or any state library beyond React Context + `useReducer`, for V1.

---

## 10. Tech stack (locked — 2026-08-03)

**Decision: reuse the learning platform's stack exactly**, rather than
introducing a second frontend ecosystem for one small tool.

```
Build tool:      Vite
Framework:       React
Language:        TypeScript
Styling:         Tailwind CSS
Routing:         React Router
API client:      Axios
State:           React Context + useReducer  (Zustand only if this
                 genuinely becomes insufficient — not Redux)
Forms:           React Hook Form
Icons:           Lucide React
Notifications:   React Hot Toast
Code display:    react-syntax-highlighter   (required — most Grammar/Data
                 Representation questions include C source snippets, per §7.3)
Charts:          Recharts — ReportPage only, see §12
```

Reasoning: the learning platform already uses Vite + React; matching it means
one stack for the team to know, shared design tokens/components become
possible later, and there's no real benefit to a second framework (Next, Vue)
for what is fundamentally an SPA against a FastAPI backend. TypeScript is
worth using from day one specifically because the backend already has
well-defined shapes (`Session`, `ConceptScore`, report response) — matching
those in `types/` catches integration bugs at compile time instead of at
runtime against a real session.

**Rejected for V1:** Redux (Context + useReducer is enough at this scale);
Bootstrap/Material UI (imposes a visual identity that conflicts with the
locked design tokens in §7.1); Next.js/Vue (no benefit over Vite + React for
a pure SPA).

---

## 11. Folder structure (locked — 2026-08-03)

**Decision: flat structure — `pages/` + `components/{ui,diagnostic,report}/` +
a single `api/` layer. No `features/` split for V1.**

A feature-sliced architecture (each of session/quiz/review/report/resume
owning its own components/hooks/api/types) was considered and rejected for
now — it earns its keep with multiple teams or multiple variants of a flow;
V1 has one linear flow and four pages, so it would be structural overhead
without payoff. Revisit post-pilot if the frontend genuinely outgrows this.

```
frontend/src/
├── app/               # entry point, router config — routes per §6
├── layout/            # DiagnosticLayout, Header, Sidebar, Footer (shared
│                       # shell per §7.1 — fixed 100vh, sidebar pinned left)
├── pages/
│   ├── StartPage.tsx
│   ├── QuizPage.tsx
│   ├── ReviewPage.tsx
│   └── ReportPage.tsx
├── components/
│   ├── ui/            # Button, Card, Badge, Progress, Tabs, Modal, Spinner
│   ├── diagnostic/    # QuestionCard, OptionList, CodeBlock, ConceptInsight,
│   │                   # DiagnosticGuide
│   └── report/        # ReportBlock (prose, §12), ConceptScoreChart (§12)
├── api/
│   ├── client.ts       # single Axios instance — no component calls fetch/
│   │                    # axios directly, everything goes through here
│   ├── sessions.ts      # create/answer/complete/get-report calls
│   └── themes.ts
├── content/
│   └── conceptInsights.json   # per §8 of the earlier discussion — sourced
│                                # data, not hardcoded per-component text
├── assets/
│   ├── icons/
│   ├── illustrations/
│   └── logos/
├── styles/             # Tailwind config only — this *is* the design-token
│                        # system (§7.1's ink/accent/weak/skip/untested
│                        # palette lives here); no parallel colors.ts etc.
└── types/              # Session, Question, Concept, Report — mirrors backend
                         # shapes loosely (see §10 on why TS was chosen)
```

Pages own state and pass props down; `components/` stay presentational
(no component calls its own API — everything routes through `api/`, per the
centralized-API-layer rule).

**Implementation note — corrected 2026-08-03 during scaffolding:** the
`tailwind.config.js` approach below was the original plan, but the project
scaffolded onto **Tailwind v4**, which has no `tailwind.config.js` at all.
Spacing and animation durations still need zero config either way — same
reasoning, just use the stock utilities. Colors, radius, and shadows below
are defined via the `@theme` directive directly in `src/index.css` instead
of a JS config file; the token values and names are unchanged from the
original plan, only the file/mechanism differs:

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-ink: #1c2024;
  --color-ink-soft: #5c6570;
  --color-ink-faint: #8a929b;

  --color-mastered: #3f6f5e;
  --color-mastered-bg: #eaf1ee;
  --color-mastered-line: #cfe0d9;

  --color-attention: #b5482f;
  --color-attention-bg: #fbeeeb;
  --color-attention-line: #f0c9bf;

  --color-skip: #9a6b3f;
  --color-skip-bg: #f7f0e6;
  --color-skip-line: #e3cfa8;

  --color-untested: #6b7280;
  --color-untested-bg: #f0f1f2;
  --color-untested-line: #d9dce0;

  --color-border: #e3e6e9;
  --color-page-bg: #f7f8f8;
  --color-card-bg: #ffffff;

  --radius-sm: 8px;
  --radius-card: 12px;
  --radius-btn: 10px;

  --shadow-card: 0 1px 2px rgba(0,0,0,.05);
  --shadow-hover: 0 6px 16px rgba(0,0,0,.08);
}
```

`@tailwindcss/vite` plugin added to `vite.config.ts` to enable this. Class
names read the same either way (`text-mastered`, `bg-attention-bg`, etc.) —
this only changes where the tokens are declared, not how they're used.

`ink`/`mastered`/`attention`/`skip`/`untested` are named for the display-layer
terminology in §7.1 (not `strong`/`weak`), so class names in components read
as `text-mastered`, `bg-attention-bg`, etc. — the *mapping* from engine state
strings (`"Strong"`, `"Weak"`, `"Untested"`) to these class names happens once,
in a single lookup (e.g. `components/report/stateStyles.ts`), never inline
per-component.

---

## 12. Report rendering approach for V1 (locked — 2026-08-03)

**Decision: ReportPage renders `report_text` as styled prose in a single
`ReportBlock`, plus one `ConceptScoreChart` (Recharts bar chart, one bar per
concept, colored by state) — both sourced from the existing
`GET /sessions/{session_id}/report` endpoint. No backend changes.**

This endpoint already returns everything needed:
```json
{
  "session_id": ...,
  "completed_at": ...,
  "report_text": "...",           // full generate_report() prose output
  "concept_scores": [
    {"concept_id": ..., "score_percent": ..., "state": ..., "num_answered": ...}
  ]
}
```
`report_text` feeds `ReportBlock`; `concept_scores` feeds `ConceptScoreChart`.
Both were already being persisted at session-completion time (`report_text`
and `session_concept_scores` rows) — this is existing data, not new scope.

This resolves the tension between the earlier card-based visual design (§7.5)
and the "don't reopen the backend" constraint: card rendering would need
either a new structured-report endpoint or fragile client-side parsing of the
prose string, neither of which is worth it before real student feedback exists
on whether the report is even useful in its current form. Prose + one chart is
zero-backend-risk and ships within the 4-day window; the §7.5 card design is
kept as the v1.5 starting point once there's real usage data to justify it.

---

## 13. Post-frontend roadmap (locked — 2026-08-03)

```
Backend Frozen → Frontend Complete → Internal Testing = RC cut
→ Student Pilot (5–10 students) → Bug Fixes → V1 Release
```

Internal Testing and Release Candidate are combined into one step (not two
sequential ones) to fit the timeline — the RC is tagged in git at that point,
so pilot bug fixes patch a known point rather than a moving target.

**Pilot feedback — asked in-app, immediately after the student views their
report** (not a follow-up message; both honesty and response rate drop once
the tab is closed):

1. Was it clear what the diagnostic was trying to achieve?
2. Was any step confusing?
3. Approximately how long did it take?
4. Did the report feel useful?
5. Do you trust these results enough to act on the top recommendation?
6. What would you improve first?

Patterns from these answers — not further internal discussion — decide what
gets fixed before V1 release and what moves to the v1.5 backlog (which already
includes the card-based ReportPage per §12, plus the architecture suggestions
logged separately for v1.5/v2).
