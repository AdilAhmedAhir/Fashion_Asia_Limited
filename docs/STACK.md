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
| Framework(s) | Next.js **16.4.3** (App Router; range `^16.4.3`, 16.4.3 is the approved floor since T-044, DECISIONS 2026-10-25), React and react-dom 19.2.4. `npm run dev` binds to `127.0.0.1` (T-044). | `package-lock.json` |
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
| Content defaults + domain types | `src/lib/site-content.ts` | `SITE_SETTINGS` fallbacks, `Product` (= a *category*), `CategoryProduct` (= an *item*), slug and identity helpers (`slugify`, `normalizeProducts`, `resolveCategoriesForSave`, `isWellFormedSlug`, `readStoredCategoryIdentities`), the What We Do page-text picker (`WhatWeDoText`, `pickWhatWeDoText`), the product rules `hasVisibleText` and `CategoryProductPatch` (T-016), `slugify` cut at the schema's 255 (Wave 1), `isAllowedImageUrl` (`https://` or a root path; Wave 2a), and the product photo gallery: `MAX_PRODUCT_GALLERY_PHOTOS`, `normalizeGallery` (any stored value → a clean list), `sameGallery` (compare by value) and `PRODUCT_IMAGE_PATH_INVALID` (the one bad-path message, shared by the server and the admin's "More photos"; T-045) |
| Action errors | `src/lib/action-errors.ts` | `actionFailure(kind, context, error)` and `logActionError`: the three write-action files return fixed save/delete/read/upload messages and log the raw error on the server (Wave 2a, T-018). No imports; not a `"use server"` file. |
| Admin editor reads | `src/lib/settings-read.ts` | `readSettingsForEditor`: the admin pages' settings read, which tells "failed" from "empty" so an editor never opens on defaults. It isn't a Server Action file (T-026). |
| Upload contract | `src/lib/upload-limits.ts` | size, edge and format limits; `sniffImageFormat`; `checkImageSizeAdvisory`; `readImageDimensions` and `describeDimensionLimit`, so the server re-checks pixel dimensions and fails closed (Wave 3a, T-007) |
| Supabase clients | `src/lib/supabase/{server,client,middleware}.ts` | server, browser and middleware clients; `updateSession` runs the `/admin` gate |
| Navigation | `src/lib/nav.ts` | `MAIN_NAV` + `NAV_CTA`, used by the header, mobile menu and footer |
| Overlay menus | `src/lib/use-overlay-menu.ts` | `useOverlayMenu({ open, onClose, toggleRef, panelRef, inertTargets?, closeWhen? })`: focus on open, Escape, Tab wrap, `inert` on the page behind, close on a media query, focus back to the toggle. The admin's `AdminNav` (Wave 4d, T-030) and the public `Header`'s menu (Wave 5c, T-029) both use it unchanged. |
| Server Actions | `src/app/actions/*-actions.ts` | `settings`, `products`, `jobs`, `media`, `form` and `auth`. Every write returns `{ ok, error }` and checks `getUser()` first, media included since Wave 3a (T-019; `MediaActionResult`). The `business` settings row has one writer per field: `saveCategories` (categories) and `saveWhatWeDoText` (page text), both through a private compare-and-swap writer; `updateSettings` refuses `business` (T-026). `getAllCategoryProducts` returns `AllProductsRead` (`{ ok: true, byCategory: Map } | { ok: false }`), and `updateCategoryProduct(id, patch)` is a partial update (T-016). `updateSettings` accepts only six keys (`homepage`, `who_we_are`, `who_we_work_with`, `sustainability`, `contact`, `general`), and the product writes' category check reads through `readSettingsForEditor` and fails closed (Wave 1). |
| Admin primitives | `src/components/admin/*` | `SettingsForm` (`SettingsHeader` with an error slot and an optional `saveLabel`, `SettingsLoadError`, `SettingsCard` (passes its title to the lists inside it, for unique names), `ObjectListEditor`: rows keyed by a per-instance `WeakMap`, edits and uploads land on their own row, opt-in `onUploadingChange`; Wave 3b, T-010), `ImageUploadField` (opt-in `commitPathOnBlur`: the path box saves on blur or Enter; only the latest pick is applied, and opt-in `onBusyChange` reports an upload in flight; Wave 3b, T-009), `CategoryProductsManager` (one save queue per product, T-016; a private leave guard while any save is pending, T-034) |
| Catalog UI | `src/components/catalog/*` | `CategoryCardGrid` (`toCategoryCards`) and `ProductGrid`/`ProductCard` (`toProductCards`, `ProductCardData`), so only the fields a card shows reach the public pages (Wave 1, SEC-INFO-36). Since T-045 a card opens `ProductPreviewDialog`, a native `<dialog>` with the photos, name and description in one of the numbered layouts from `product-preview-layout.ts` (`PRODUCT_PREVIEW_LAYOUT`, live = 1). The hidden, `noindex` page `src/app/(website)/product-preview-samples/page.tsx` shows all four with sample photos so the client can pick; it's in no nav, sitemap or robots entry. |
| Public UI | `src/components/{global,sections,ui}/*` | header, footer, preloader, Lenis provider (`MotionConfig reducedMotion="user"`, no Lenis with reduced motion on); homepage sections; `PageHeader`, `ScrollReveal`, form inputs; `AutoplayVideo` (a looping muted video that holds its poster with reduced motion on; Wave 5b, T-028) |

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
- **Response headers (Wave 5a, T-008):** `next.config.ts` `headers()` sends `nosniff`, `strict-origin-when-cross-origin`, a Permissions-Policy, `X-Frame-Options: DENY` and an enforcing structural CSP on every route, plus HSTS (`includeSubDomains`, no `preload`) in production builds. `poweredByHeader: false`. Next 16 drops these on config redirects. `includeSubDomains` is safe only while both bare domains are Vercel redirects.
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
- **Product photos:** up to 5 extra per product (`MAX_PRODUCT_GALLERY_PHOTOS` in `src/lib/site-content.ts`);
  the pop-up's layout number is `PRODUCT_PREVIEW_LAYOUT` (T-045).
- **All values and their homes:** `docs/DOMAIN.md` §3.

## §7 — Design law pointer
Read `docs/DESIGN.md` before any UI.
- **Semantic Tailwind tokens only:** `background`, `foreground`, `primary`, `accent`,
  `surface`, `bg-scrim` (the photo-card gradient, Wave 4b), fonts `sans` (Inter) and `serif`
  (Playfair). Green text is `text-accent`; text on solid `bg-primary` is `text-foreground`.
- **WCAG AA, visible focus, reduced-motion guards.**
- **UI isn't done from code alone:** it ends at `/design-review` screenshots.

## §8 — External services & integrations

| Service | Detail |
|---|---|
| **Supabase** | Postgres, Auth (email + password only; sign-ups must be OFF) and Storage bucket `media`. Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. The project is client-owned; local `.env.local` points at the **live** project. |
| **Vercel** | Production is built from GitHub `main`. `vercel.json` has a cron on `/api/keep-alive` every 4 days, with optional `CRON_SECRET`. |
| **GitHub** | Remotes `origin` = `AdilAhmedAhir/Fashion_Asia_Limited` (public), `client` = `happierbangladesh/Fashion_Asia_Limited` (private), `staging` = `AdilAhmedAhir/Fashion_Asia_Limited_staging` (never auto-pushed). **Deploy = `/ship`**: both remotes on the owner's "deploy" only. `client` gets `main` (happierbangladesh); `origin` gets its AdilAhmedAhir mirror (`.claude/scripts/mirror-authorship.mjs`), with the same files and different commit ids. |
| **Site URL** | `NEXT_PUBLIC_SITE_URL`, optional, defaults to `https://fashionasialtd.com`. Used for the canonical, metadata base and sitemap. Which domain is primary is CLIENT_QUESTIONS Q01. |
