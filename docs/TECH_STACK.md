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

- **PostgreSQL via Supabase.** Reference schema: `supabase-schema.sql` (applied by hand in the Supabase SQL editor — no `supabase/` CLI directory exists in this repo; confirmed absent). Structural changes are now recorded first as a hand-applied migration file under `db/migrations/<NNNN>_<slug>.sql` (`docs/WORKFLOW.md` §1's convention — **confirmed, not changed, by `/architect` on this ticket's first use**, T-001, 2026-09-26), then rolled up into this reference snapshot. `db/migrations/` is plain SQL, applied by hand in the Supabase SQL editor exactly like `supabase-schema.sql` always has been — it is not a `supabase/` CLI project and doesn't introduce one.
- Tables: `jobs`, `submissions`, `media_assets`, `site_settings`, `reports`, `leaders`, **`products`** (new, T-001 — `db/migrations/0001_products-within-category.sql`). All have RLS enabled. `products` carries both an explicit `anon` SELECT policy and an explicit `authenticated` ALL policy from creation (matching the `jobs` table's pattern) — it does **not** repeat the gap described next. See `docs/MEMORY_BANK.md` → Known Traps for a policy-coverage gap affecting the *other five* tables that implementers must know about before treating this file as fully authoritative for those five. That gap is pre-existing and out of T-001's scope — not closed by this ticket, still open (`docs/WORKFLOW.md` §8, row 2).

### Products-within-category schema — `/architect` decision, 2026-09-26 (T-001)

Decided on the record, per T-001's acceptance criteria. Full DDL: `db/migrations/0001_products-within-category.sql` (same rationale repeated there as a header comment, for whoever applies it by hand).

**(a) Storage — new table for products; categories stay in JSONB, unchanged.** Categories (the 8 cards on `/what-we-do`: T-Shirts, Polo Shirts, etc.) continue to live exactly where they do today — `site_settings.business.products` (JSONB), edited by the existing `ObjectListEditor` in `BusinessClient.tsx` — with **zero changes to that editor's UI, fields, or save flow.** `VISION.md` is explicit that category CRUD already works and a design forcing that rebuild "needs a strong reason"; none exists, so no new table was created for categories, and none of their storage changed. Individual **products** (image/name/description, inside a category) get a **new table, `public.products`**, rather than a further-nested array inside each category's JSONB object. Reasons a table wins here: (1) VISION/T-003 describe per-product add/edit/delete/reorder as *single-item* operations, matching the `jobs`/`reports`/`leaders` per-row-CRUD pattern this codebase already uses three times for exactly this shape of problem — not the *whole-blob-Save* pattern the category editor uses. Nesting products under categories would force every single product edit to re-serialize and upsert the *entire* `business` JSONB value (all 8 categories' copy included) — unnecessary write amplification and a real lost-update risk the moment two admin edits overlap (a risk that's low-stakes today because category edits are rare, and would get worse, not better, if frequent per-product edits rode the same single whole-object Save). (2) A table gets a collision-proof primary key (`gen_random_uuid()` on insert) for free; JSONB would need application-managed IDs for the same guarantee. (3) `products` nested under each category would be the *first* doubly-nested array-of-array-of-objects shape ever stored in `SITE_SETTINGS`/`site_settings` — every existing array there is one level deep — and avoiding that novelty keeps `normalizeProducts`-style defensive parsing from growing a second nesting level of "what if this is missing" cases forever.

**(b) Attachment — an application-enforced `slug`, not a database foreign key.** Categories are JSONB array elements, not table rows, so Postgres cannot express a real foreign key from `products` to a "categories table" — there isn't one to reference. Each category object gains exactly one new field, **`slug`** (e.g. `"t-shirts"`) — computed once from its title, the first time it's saved without one, and frozen forever after. Renaming a category's title never changes its slug, so a rename can never orphan its products or change its public URL. `public.products.category_slug` stores that same value; the link is enforced entirely in application code (T-003's write path, contract below), never by the database. `slug` doubles as the public URL segment (`/what-we-do/<slug>`), so **T-005 needs no separate ID scheme.** Two categories can never resolve to the same URL because slug assignment is dedupe-checked at save time: a freshly computed slug that would collide with a sibling category's slug in the *same* save is **rejected outright** — the save fails with a specific, actionable error — never silently suffixed or overwritten. This matches, rather than invents a second style alongside, the "clear blocking message over silent auto-resolution" philosophy `VISION.md` already mandates for the delete-guard in (c). A *read-time-only* fallback (auto-suffixed, e.g. `-2`) computes a display slug for any legacy category that predates this field and hasn't been saved yet under the new code — to be added to `slugify()` / `normalizeProducts()` in `src/lib/site-content.ts` by `/lead-dev`'s types-only step (not yet present as of this decision; exact spec in the T-001 handoff) — but that fallback is never persisted by the read path, only by an actual save.

**(c) Delete guard — application check; a schema constraint is not possible.** Same root cause as (b): there is no category *row* for a `REFERENCES` / `ON DELETE RESTRICT` constraint to attach to — this is a structural fact of decision (a), not a discretionary choice. **Contract for T-003's `business`-settings write path:** before persisting a save, fetch the currently-stored category list; compute which category slugs are present in the old list but absent from the incoming one (a real delete — renames keep their slug, so a rename is never mistaken for one); run one grouped count — `SELECT category_slug, count(*) FROM products WHERE category_slug = ANY($removedSlugs) GROUP BY category_slug` — against exactly those removed slugs; refuse the *entire* save with a specific, named-category error (e.g. "Remove its products first") if any of them is non-zero. The composite index created in `0001` (`products (category_slug, sort_order)`) serves this count query as well as the ordered product listing, via its leftmost column — no second index needed.

**No new package.** Slug generation was evaluated against an npm `slugify`-style package and refused: it's a ~10-line pure function (lowercase, collapse non-alphanumerics to hyphens, trim) with no edge case this project needs that justifies a dependency — fails "does it earn its keep," independent of whether something 80%-there already exists.

**Follow-up, same day — explicit GRANTs added to `0001`.** `/system-architect` correctly flagged that RLS policies only filter rows a role already has table-level privileges for; GRANT is checked first, RLS second, and this project's `supabase-schema.sql` has zero explicit GRANT statements for any of its six existing tables (they work today purely on Supabase's project-level default privileges, which historically auto-grant SELECT/INSERT/UPDATE/DELETE to `anon`/`authenticated`/`service_role` on every new `public` table). That default is being phased out platform-wide: an opt-out toggle ("automatically expose new tables") has existed since 2026-04-28, becomes the default for brand-new projects from 2026-05-30, and is **enforced on existing projects — this one included — from 2026-10-30**, roughly five weeks from this decision. `0001` sits as `PENDING_USER_APPLY` with no fixed apply date, and the project's own toggle state can't be verified from here regardless of that deadline. Added `GRANT SELECT ON TABLE public.products TO anon;` and `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;` — matching Supabase's own documented recommendation verbatim, scoped to exactly what the two RLS policies already intend, no `service_role` grant (this project has no service-role key anywhere in `src/`). `GRANT` is natively idempotent in Postgres (unlike `CREATE POLICY`), so no guard block was needed. Reassurance for the other five tables: `ALTER DEFAULT PRIVILEGES` is create-time-only, so the 2026-10-30 enforcement does not retroactively strip grants already made when those tables were created — only *new* tables (i.e. `products`) are at risk. **Not actioned, flagged only:** backporting explicit grants onto the other five tables as defensive hardening (they're not at risk, but stating their access outright rather than relying on an inferred, soon-to-be-atypical default would be more legible) — a candidate for its own low-priority follow-up ticket, not bundled into `0001`.

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

- **Naming quirk, T-001 (2026-09-26):** `site_settings.business.products` (the JSONB key) and the TypeScript `Product` type in `src/lib/site-content.ts` both hold **categories** (T-Shirts, Polo Shirts, ...), not the new individual catalog items — the name predates this feature and was deliberately left unchanged, to avoid touching `BusinessClient.tsx` / `business/page.tsx` / `what-we-do/page.tsx` (all outside T-001's file list) and to avoid a live-data key rename. The new per-category catalog items — VISION.md's actual "product": image/name/description — are the **`CategoryProduct`** TypeScript type and the new **`products`** SQL table. Do not conflate the two "products." `Product.slug` (T-001's schema decision — not yet in code; `/lead-dev`'s types-only step in this same ticket adds it, spec in the T-001 handoff) is a category's permanent identity and public URL segment; see the Database section above for the full write-path contract T-003 must implement.
- `next.config.ts` defines only `redirects()` — no `images.remotePatterns`. Every Supabase-hosted / user-uploaded image is rendered with a plain `<img>`, never `next/image` (confirmed: the only `next/image` usage in the tree is `BrandLogo.tsx`, pointing at a local file). If you introduce `next/image` for a remote/Supabase URL, it will fail until you add `remotePatterns`.
- `pg` (`^8.19.0`) is a `devDependency` with no matching `import`/`require` anywhere under `src/` — looks unused today; confirm before removing (it may back an uncommitted one-off script).
- No `supabase/` directory (CLI project, migrations) exists — do not assume `supabase db push`/migrations tooling is available for this project. Schema changes go through the SQL editor by hand.
