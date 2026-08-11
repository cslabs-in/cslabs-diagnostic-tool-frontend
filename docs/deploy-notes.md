# Landing page + app routing — Vercel / monorepo notes

## Layout (updated)

```
frontend/
├── index.html          <- landing page (marketing). Root entry.
│                           Vercel serves dist/index.html at "/" automatically
│                           -- no rewrite needed for "/".
├── landing/
│   └── landing.css
├── app/
│   └── index.html      <- React SPA shell (was frontend/index.html before
│                           this change). Builds to dist/app/index.html.
├── vercel.json          <- rewrites /start, /quiz, /review, /report to
│                           dist/app/index.html
├── vite.config.ts       <- registers both HTML files as build entries,
│                           plus a dev-only middleware for local URL parity
└── src/                 <- unchanged, still the React app's source
```

## Vercel project settings (monorepo)

Since backend + engine live in the same repo, set the Vercel project's
**Root Directory** to `frontend/` (Project Settings → General → Root
Directory). This means:
- `vercel.json` above lives at `frontend/vercel.json`, not the repo root.
- Vercel's build command / output directory stay at their defaults
  (`npm run build` / `dist`) relative to `frontend/`.
- Backend and engine are unaffected — they're simply outside what Vercel
  builds, deployed however they already are (per
  `frontend-v1-decisions.md` §1, backend isn't on Vercel at all).

## Why no rewrite for "/"

Vercel's static file serving checks the build output for a literal file
match before applying `rewrites`. Since `index.html` (the landing page) now
builds to `dist/index.html`, requests to `/` are served directly — adding
a `{ "source": "/", ... }` rewrite would be redundant and, in some
configurations, can conflict with that default resolution. Only paths that
have **no matching file** (`/start`, `/quiz`, `/review`, `/report`) need an
explicit rewrite, pointing them at `dist/app/index.html` so React Router
takes over client-side from there.

## Local dev parity

`vite dev` doesn't read `vercel.json`. The `devAppRouteRewrite` plugin in
`vite.config.ts` replicates the same four rewrites locally, so
`http://localhost:5173/start` (etc.) behaves the same in dev as it will on
Vercel. `http://localhost:5173/` serves the landing page directly, same as
prod, since it's now the literal project-root `index.html`.

## Adding JavaScript to the landing page later

Not planned yet, but if it happens:

1. Create `landing/landing.js` as a plain ES module.
2. Reference it from `index.html`:
   ```html
   <script type="module" src="./landing/landing.js"></script>
   ```
3. No `vite.config.ts` change needed — `index.html` is already a registered
   build entry, so Vite auto-discovers and bundles any
   `<script type="module">` it references (minified + content-hashed in
   the Vercel build, hot-reloaded in dev), the same way it already handles
   `app/index.html` → `src/main.tsx`. `npm install`-ed packages can be
   `import`-ed normally.
4. Keep it vanilla TS/JS rather than JSX/React unless this page eventually
   gets folded fully into the SPA — mixing React components into a page
   `main.tsx` never mounts would need its own `createRoot()` call and
   starts to blur the static/SPA line this setup keeps clean on purpose.