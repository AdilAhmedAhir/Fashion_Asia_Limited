# STACK.md — The Architecture Memory Map

> **The single most-read file in the framework.** It's the map every role loads instead of
> scanning the repo. Written by `/adapt` on 2026-09-28 from the real manifests; the machine
> twin is `.claude/stack.json`. Change the stack via `/stack-change`. Deeper maps:
> `docs/ARCHITECTURE.md` (topology, auth) and `docs/DATA_MODEL.md` (tables, RLS).

## §1 — Identity
- **Project:** Fashion Asia Limited: corporate site plus CMS.
- **Domain:** see `docs/DOMAIN.md`.
- **Status:** **in production**. It's live on `www.fal.com.bd` and `www.fashionasialtd.com`,
  which are the same Vercel deployment. The last deploy was `e8eace1` on 2026-09-28.
- **One-line what-it-is:** FAL's buyer-facing marketing site with a category catalog, plus a
  Supabase-backed `/admin` where FAL staff edit pages, products, jobs, reports, leaders and
  the gallery, and read form submissions.

## §2 — Stack (quoted from `package.json` and `package-lock.json`, never guessed)

| Layer | Choice | Source of truth |
|---|---|---|
| Language(s) | TypeScript 5.9.3, strict | `tsconfig.json` |
| Package manager | npm | `package-lock.json` |
| Repo shape | single package | `package.json` |
| Framework(s) | Next.js **16.3.6** (App Router; range `^16.1.6`, 16.3.6 is the approved floor), React and react-dom 19.2.4 | `package-lock.json` |
| Motion / UI libs | framer-motion 12.34.3 · gsap 3.14.2 + @gsap/react 2.1.2 · lenis 1.3.17 · lucide-react 0.575.0 · clsx 2.1.1 + tailwind-merge 3.5.0 | `package-lock.json` |
| Database | Supabase Postgres + Auth + Storage (@supabase/supabase-js 2.112.2, @supabase/ssr 0.8.0) | `package-lock.json`, `supabase-schema.sql` |
| Authorization model | **RLS**, plus an app-layer `getUser()` check in every writing Server Action | see §5 |
| Deploy target | Vercel, building production from GitHub `main` | see §8 |
| Design system | Tailwind CSS 3.4.19 (+ PostCSS 8.5.23, autoprefixer) with custom tokens; no component library | `tailwind.config.ts` |

## §3 — Gates (the hard chain; run in this order)
1. **lint:** **suspended.** `npm run lint` runs `next lint`, which Next 16 no longer provides,
   and there's only a legacy `.eslintrc.json` (`docs/WORKFLOW.md` §7 #1).
2. **typecheck:** `npx tsc --noEmit`
3. **test:** none. No test runner is installed; adding one needs `architect-reviewer`.
4. **build:** `npm run build` (Turbopack). It's safe to run beside `next dev`.
5. **e2e:** none. `/qa live` uses read-only `curl` plus headless Chrome over CDP, with
   scripts kept in the session scratchpad, never in the repo.

- **Production-only checks:** `npm run build && npm start -- -p 3101`. This is the `prod` entry in `.claude/launch.json`. Port 3001 is used by another local project; changed 2026-10-03.
- **Filter one unit:** n/a (single package).
- **The dev server is the LIVE database** (§5). Gates and QA never write.

## §4 — The reuse surface (search `docs/INVENTORY.md` before writing anything new)

| Unit | Path | Purpose |
|---|---|---|
| Content defaults + domain types | `src/lib/site-content.ts` | `SITE_SETTINGS` fallbacks, `Product` (= a *category*), `CategoryProduct` (= an *item*), slug and identity helpers (`slugify`, `normalizeProducts`, `resolveCategoriesForSave`, `isWellFormedSlug`, `readStoredCategoryIdentities`), the What We Do page-text picker (`WhatWeDoText`, `pickWhatWeDoText`), the product rules `hasVisibleText` and `CategoryProductPatch` (T-016), and `slugify` cut at the schema's 255 (Wave 1) |
| Admin editor reads | `src/lib/settings-read.ts` | `readSettingsForEditor`: the admin pages' settings read, which tells "failed" from "empty" so an editor never opens on defaults. It isn't a Server Action file (T-026). |
| Upload contract | `src/lib/upload-limits.ts` | size, edge and format limits; `sniffImageFormat`; `checkImageSizeAdvisory` |
| Supabase clients | `src/lib/supabase/{server,client,middleware}.ts` | server, browser and middleware clients; `updateSession` runs the `/admin` gate |
| Navigation | `src/lib/nav.ts` | `MAIN_NAV` + `NAV_CTA`, used by the header, mobile menu and footer |
| Server Actions | `src/app/actions/*-actions.ts` | `settings`, `products`, `jobs`, `media`, `form` and `auth`. Every write returns `{ ok, error }` and checks `getUser()` first, except media (T-019). The `business` settings row has one writer per field: `saveCategories` (categories) and `saveWhatWeDoText` (page text), both through a private compare-and-swap writer; `updateSettings` refuses `business` (T-026). `getAllCategoryProducts` returns `AllProductsRead` (`{ ok: true, byCategory: Map } | { ok: false }`), and `updateCategoryProduct(id, patch)` is a partial update (T-016). `updateSettings` accepts only six keys (`homepage`, `who_we_are`, `who_we_work_with`, `sustainability`, `contact`, `general`), and the product writes' category check reads through `readSettingsForEditor` and fails closed (Wave 1). |
| Admin primitives | `src/components/admin/*` | `SettingsForm` (`SettingsHeader` with an error slot and an optional `saveLabel`, `SettingsLoadError`, `SettingsCard`, `ObjectListEditor`), `ImageUploadField` (opt-in `commitPathOnBlur`: the path box saves on blur or Enter), `CategoryProductsManager` (one save queue per product, T-016) |
| Catalog UI | `src/components/catalog/*` | `CategoryCardGrid` (`toCategoryCards`) and `ProductGrid`/`ProductCard` (`toProductCards`, `ProductCardData`), so only the fields a card shows reach the public pages (Wave 1, SEC-INFO-36) |
| Public UI | `src/components/{global,sections,ui}/*` | header, footer, preloader, Lenis provider; homepage sections; `PageHeader`, `ScrollReveal`, form inputs |

- **Scan roots:** `src`.
- **Rule:** shared logic lives in `src/lib`. Components never duplicate Server Action logic.

## §5 — Data & authorization (the security boundary)
- **DB kind:** Supabase Postgres. Tables: `site_settings`, `products`, `jobs`, `reports`,
  `leaders`, `media_assets` and `submissions`. The Storage bucket is `media`. Full detail is
  in `docs/DATA_MODEL.md`.
- **Schema-change flow (no CLI):**
  1. Write `db/migrations/<NNNN>_<slug>.sql` with a `-- STATUS: PENDING_USER_APPLY` header.
  2. `architect-reviewer` reviews it.
  3. **The owner applies it in the Supabase SQL editor. This is a HARD STOP until the owner
     confirms.**
  4. Flip the header to `-- STATUS: APPLIED <date>`.
  5. Update `supabase-schema.sql`.
  6. There's no type generation: update the hand-written types in `src/lib/site-content.ts` or
     the action file.
- **Authorization is enforced in the database (RLS) plus the server layer, never the UI.**
  - `anon` gets SELECT on public tables and INSERT on `submissions`. `authenticated` gets
    ALL, following the `jobs` pattern.
  - Every writing Server Action calls `supabase.auth.getUser()` before any read or write.
  - **There's no admin role: any authenticated account is an admin (RISKS R1).** Supabase
    sign-ups must stay OFF.
  - `supabase-schema.sql` under-documents the live policies (`docs/WORKFLOW.md` §7 #2).
  - Test access *as another user*, read-only. Admin flows are verified from the owner's
    manual checklist.
- **Every `"use server"` export is an anonymously reachable endpoint.** `settings-actions.ts`
  is imported by public pages, so every write must check the session itself.
- **Secrets that must never reach a client bundle:** any Supabase service-role key. None
  exists in the repo today. `NEXT_PUBLIC_SUPABASE_ANON_KEY` is only used server-side
  (SEC-INFO-32), so don't import `src/lib/supabase/client.ts` into a client component without
  `/security-review`. This is guarded by `.claude/hooks/post-edit.sh` using the
  `stack.json` patterns.

## §6 — Policy-as-config (no magic numbers)
- **Image limits:** 400 KB, 2400 px, JPG or WebP; the recommended size is 1200×900. They
  live in `src/lib/upload-limits.ts`.
- **Server Action body limit:** 1 MB, the framework default (`docs/DOMAIN.md` §3, Q08).
- **Marketing revalidation:** 60 s.
- **All values and their homes:** `docs/DOMAIN.md` §3.

## §7 — Design law pointer
Read `docs/DESIGN.md` before any UI.
- **Semantic Tailwind tokens only:** `background`, `foreground`, `primary`, `accent`,
  `surface`, fonts `sans` (Inter) and `serif` (Playfair).
- **WCAG AA, visible focus, reduced-motion guards.**
- **UI isn't done from code alone:** it ends at `/design-review` screenshots.

## §8 — External services & integrations

| Service | Detail |
|---|---|
| **Supabase** | Postgres, Auth (email + password only; sign-ups must be OFF) and Storage bucket `media`. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The project is client-owned; local `.env.local` points at the **live** project. |
| **Vercel** | Production is built from GitHub `main`. `vercel.json` has a cron on `/api/keep-alive` every 4 days, with optional `CRON_SECRET`. |
| **GitHub** | Remotes `origin` = `AdilAhmedAhir/Fashion_Asia_Limited` (public), `client` = `happierbangladesh/Fashion_Asia_Limited` (private), `staging` = `AdilAhmedAhir/Fashion_Asia_Limited_staging` (never auto-pushed). **Deploy = `/ship`**: both remotes, same commit, owner's "deploy" only. |
| **Site URL** | `NEXT_PUBLIC_SITE_URL`, optional, defaults to `https://fashionasialtd.com`. Used for the canonical, metadata base and sitemap. Which domain is primary is CLIENT_QUESTIONS Q01. |
