# TECH_STACK.md

Owner: `/onboard` (refreshed by `/architect` on live decisions). Initial map: 2026-09-26.
Every version below is quoted from `package.json` / `package-lock.json`; every behavior is quoted from the source file named next to it.

## Language

- **TypeScript 5.9.3** (`typescript: "^5.9.3"`, resolved `5.9.3`). `strict: true`, `noEmit: true`, `target: "ES2017"`, `moduleResolution: "bundler"`, path alias `@/* → src/*` (`tsconfig.json`).
- No `engines` field in `package.json` — no Node.js version is pinned; Vercel uses its default Next-compatible runtime.

## Frontend

- **Next.js 16.1.6** (`next: "^16.1.6"`, resolved `16.1.6`), App Router, React Server Components by default (`docs/PROJECT_STATE.md` §1, still current).
- **React 19.2.4 / react-dom 19.2.4** (both resolved exactly to `19.2.4`).
- **Tailwind CSS 3.4.19** + **PostCSS 8.5.6** + **autoprefixer 10.4.27**. Theme in `tailwind.config.ts`: colors `background #1a1f1a`, `foreground #f5faf5`, `primary #016138`, `secondary #02894f`, `accent #0EC97A`, `surface #0a0a0a`; fonts `Inter` (sans) and `Playfair Display` (serif) loaded via `next/font/google` in `src/app/layout.tsx`.
- **clsx 2.1.1** + **tailwind-merge 3.5.0** → `cn()` helper in `src/lib/utils.ts`.
- **lucide-react 0.575.0** — icon set used throughout admin and marketing UI.
- Motion stack (4-tier, per `docs/PROJECT_STATE.md`, still structurally present in source):
  - **lenis 1.3.17** — smooth scroll (`src/components/global/SmoothScrollProvider.tsx`). Later commits scoped/disabled it on touch devices — do not assume it runs everywhere.
  - **gsap 3.14.2** + **@gsap/react 2.1.2** — canvas/scroll-driven animation.
  - **framer-motion 12.34.3** — `src/components/ui/ScrollReveal.tsx`.
  - CSS micro-interactions via Tailwind utility classes.
- `next/image` is used in exactly one place (`src/components/ui/BrandLogo.tsx`, for local `/logo.png`). No other component uses it — see Notes below.

## Backend / CMS

- **Server Actions** (`"use server"`), not a separate API layer, for all CMS mutations: `src/app/actions/{auth,form,jobs,media,settings}-actions.ts`.
- One real API route: `GET /api/keep-alive` (`src/app/api/keep-alive/route.ts`) — a cron target, not client-facing.
- **@supabase/supabase-js 2.98.0** + **@supabase/ssr 0.8.0** — browser client (`src/lib/supabase/client.ts`), server client (`src/lib/supabase/server.ts`, cookie-based), and middleware session refresh (`src/lib/supabase/middleware.ts`).

## Database

- **PostgreSQL via Supabase.** Reference schema: `supabase-schema.sql` (applied by hand in the Supabase SQL editor — no `supabase/` CLI/migrations directory exists in this repo; confirmed absent).
- Tables: `jobs`, `submissions`, `media_assets`, `site_settings`, `reports`, `leaders`. All have RLS enabled. See `docs/MEMORY_BANK.md` → Known Traps for a policy-coverage gap in this file that implementers must know about before treating it as authoritative.

## Auth

- **Supabase Auth, email + password only.** `src/app/actions/auth-actions.ts` calls `supabase.auth.signInWithPassword` / `signOut` — no OAuth provider, no self-serve signup in code. Admin accounts are created by hand in the Supabase dashboard (`docs/CLIENT_HANDOVER.md` §2).
- Session cookies refreshed in `src/middleware.ts` → `src/lib/supabase/middleware.ts`, which redirects unauthenticated visitors on any `/admin/*` path (except `/admin/login`) to `/admin/login`, and redirects an authenticated session away from `/admin/login` to `/admin`.

## Storage / External services

- **Supabase Storage**, bucket `media` (public). Admin uploads write to the bucket root (see `docs/MEMORY_BANK.md` Known Traps for why, and for the fact that bucket-level storage policies are not captured anywhere in `supabase-schema.sql`).
- **Vercel Cron** (`vercel.json`): `GET /api/keep-alive` every 4 days (`0 0 */4 * *`), pings `site_settings` to stop the Supabase free-tier project from auto-pausing.
- No other third-party integrations found (no email provider SDK, no analytics SDK, no payment provider).

## Dev tools

- **ESLint 9.39.3** + **eslint-config-next 16.1.6**, but the only config file is the legacy `.eslintrc.json` (`{"extends": "next/core-web-vitals"}`) — no flat `eslint.config.*` exists at the project root (confirmed by glob). `npm run lint` runs `next lint`, which Next.js 16 no longer ships cleanly — see `docs/MEMORY_BANK.md` Known Traps. Treat `npm run lint` as broken until that's fixed.
- Type-checking: `npx tsc --noEmit` (not re-run this session — no shell tool was available to this onboarding pass; carried forward from prior-work context, not independently re-verified).
- Package manager: **npm** (`package-lock.json` present; no `pnpm-lock.yaml` / `yarn.lock`).

## Testing framework

- **None installed.** No Jest, Vitest, Playwright, Cypress, or Testing Library in `package.json`. No test script exists beyond the placeholder-free `scripts` block (`dev`, `build`, `start`, `lint`).

## Hosting / CI

- **Vercel**, building production from the GitHub `main` branch (no separate CI config file — e.g. no `.github/workflows/` found). Pushing `main` is a production deploy.
- Git remotes configured in this checkout: `origin`, `client`, and `staging` (names only — see `docs/MEMORY_BANK.md` Known Traps for what's notable about each; URLs are intentionally not reproduced here).

## Required env vars (names only — see source cited, never read `.env*`)

| Variable | Where read | Required? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `src/lib/supabase/{client,server,middleware}.ts`, `src/app/api/keep-alive/route.ts` | Yes — build/runtime fails without it |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same files | Yes |
| `NEXT_PUBLIC_SITE_URL` | `src/app/layout.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts` | No — defaults to `https://fashionasialtd.com` in code |
| `CRON_SECRET` | `src/app/api/keep-alive/route.ts` | No — if unset, the keep-alive route has no bearer-token check (open endpoint, low-risk since it only does a `SELECT ... LIMIT 1`) |

`.env.example` at the repo root does **not** list the Supabase variables (it still describes a static, no-backend site — stale, see `docs/MEMORY_BANK.md` Known Traps). `docs/ENV_SETUP_GUIDE.md` lists the two Supabase variables correctly but is missing `CRON_SECRET` and `NEXT_PUBLIC_SITE_URL`. Use the table above, not either file, as the current source of truth.

## Notes for implementers

- `next.config.ts` defines only `redirects()` — no `images.remotePatterns`. Every Supabase-hosted / user-uploaded image is rendered with a plain `<img>`, never `next/image` (confirmed: the only `next/image` usage in the tree is `BrandLogo.tsx`, pointing at a local file). If you introduce `next/image` for a remote/Supabase URL, it will fail until you add `remotePatterns`.
- `pg` (`^8.19.0`) is a `devDependency` with no matching `import`/`require` anywhere under `src/` — looks unused today; confirm before removing (it may back an uncommitted one-off script).
- No `supabase/` directory (CLI project, migrations) exists — do not assume `supabase db push`/migrations tooling is available for this project. Schema changes go through the SQL editor by hand.
