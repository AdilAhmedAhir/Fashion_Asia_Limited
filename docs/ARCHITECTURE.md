# ARCHITECTURE.md — Topology & Boundaries

> GENESIS Phase 2, 2026-09-28. This maps the existing system. Nothing here is a
> redesign: the stack stays as it is, per the idea lock.

## §1 — Topology
- **One Next.js 16 App Router app** on Vercel. It uses two top-level route groups:

| Route group | What it serves |
|---|---|
| `(website)` | The public site: Lenis smooth scroll, preloader, header and footer. It includes the marketing pages, the `/products` overview, the dynamic `/products/[category]` route and the `(forms)` group (contact, career, grievance). Since T-025 (2026-10-03), `/what-we-do/<slug>` 308-redirects to `/products/<slug>` (`next.config.ts`). |
| `admin` | `/admin/login` plus the `(dashboard)` editors, all behind the middleware gate. |

- **Data:** one Supabase project, owned by the client. It serves production **and** local
  dev; there's no staging database.
- **Rendering:** marketing pages read `getSettings()`, which calls `cookies()`, so they
  render dynamically on each request (`revalidate = 60` is declared but moot). Writes call
  `revalidatePath` on the affected public paths.
- **Other routes:** `sitemap.ts` and `robots.ts`. There's also `/api/keep-alive`, a Vercel
  cron every 4 days that stops the Supabase project pausing.

## §2 — The reuse surface
It mirrors `docs/STACK.md` §4:
- shared logic goes in `src/lib/*`;
- Server Actions go in `src/app/actions/*` (one file per domain);
- admin primitives go in `src/components/admin/*`.

The generated index is `docs/INVENTORY.md`.

## §3 — Identity & roles
- **Auth:** Supabase Auth, **email + password only**. There's no sign-up UI, no OAuth and
  no magic link.
- **Sessions:** `@supabase/ssr` cookies, refreshed in `src/middleware.ts` →
  `src/lib/supabase/middleware.ts` (`updateSession`).
- **Gate:** `/admin/*`, except `/admin/login`, redirects with a 307 to `/admin/login` when
  there's no user. Next 16 flags the middleware file convention as deprecated in favour of
  `proxy.ts`. Don't move it without its own ticket, because Proxy runs on Node.js, not Edge.
- **Roles:** there is only one, "signed in". **Any authenticated account is a full admin**,
  including access to the submissions inbox and its personal data. That makes the Supabase
  "Allow new users to sign up" toggle the single point of failure (RISKS R1, SEC-HIGH-2).
  Planned fix: an explicit admin allowlist checked in the middleware, in every writing
  action, and in RLS.

## §4 — Authorization model
- **In the database:** RLS on every table (see `docs/DATA_MODEL.md` §3).
- **On the server:** every writing Server Action calls `getUser()` before any read or
  write. The two exceptions, `addMediaAction` and `deleteMediaAction`, are covered by T-019.
- **Result contract:** actions return `{ ok, error }` for every expected failure and never
  throw. Next.js redacts thrown messages in production, which is the lesson of SEC-HIGH-4
  and SEC-HIGH-5.
- **Every `"use server"` export is a public endpoint.** `settings-actions.ts` is imported by
  public pages, so an action must never rely on the admin UI to protect it.
- **Testing:** read-only, as another user (anonymous probes of every gate). Admin writes are
  verified by the owner from `/qa` checklists.

## §5 — Storage & external services
- **Supabase Storage:** bucket `media` holds images, uploaded through
  `uploadOptimizedImage`, which enforces the `upload-limits.ts` checks. Bucket `reports`
  holds PDFs, through `uploadFile`.
  - The Media Center's `addMediaAction` **isn't validated** (T-019).
  - Server Action bodies are capped at 1 MB.
- **No email, SMS, payments or analytics.** Form submissions land only in the admin inbox
  (Q07).

## §6 — Deploy
- **Target:** Vercel builds production from GitHub `main`. There's no preview-promote step
  in this workflow.
- **Remotes:** `origin` (`AdilAhmedAhir/Fashion_Asia_Limited`) and `client`
  (`happierbangladesh/Fashion_Asia_Limited`) must always hold the same `main` commit.
  `staging` is separate and never auto-pushed.
- **Release:** only `/ship`, only on the owner's "deploy". It runs the gates, checks commit
  names, pushes both remotes and verifies both domains live (`docs/WORKFLOW.md` §6).
- **Commit names:** enforced by `.githooks/`.
