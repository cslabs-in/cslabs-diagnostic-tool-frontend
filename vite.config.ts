import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

/**
 * Dev-only parity shim: mirrors vercel.json's rewrites so that hitting
 * /start, /quiz, /review, or /report in `vite dev` serves the React app's
 * shell (app/index.html), same as production does. Without this, local
 * dev would only be able to reach the app at /app/index.html directly,
 * while prod serves it at /start etc. -- this closes that gap.
 * Does nothing in production builds (build output is static files served
 * by Vercel; this plugin's configureServer hook never runs there).
 */
function devAppRouteRewrite(): Plugin {
  const appRoutes = ['/start', '/quiz', '/review', '/report']
  return {
    name: 'dev-app-route-rewrite',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url && appRoutes.some((r) => req.url === r || req.url!.startsWith(r + '/'))) {
          req.url = '/app/index.html'
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devAppRouteRewrite()],
  build: {
    rollupOptions: {
      input: {
        // Landing page -- this IS frontend/index.html now, so it builds to
        // dist/index.html and Vercel serves it at "/" with no rewrite rule.
        landing: resolve(__dirname, 'index.html'),
        // React SPA shell -- moved to app/index.html, builds to
        // dist/app/index.html. vercel.json rewrites /start, /quiz,
        // /review, /report to this file.
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
})