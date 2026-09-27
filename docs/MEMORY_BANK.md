# MEMORY_BANK.md

Owner: `/onboard`, `/archivist`. Initial map: 2026-09-26. Every route, model, and table below is greppable in source as of this date.

Legacy, pre-A-Team docs still in `docs/` — not owned by this file, left as-is by this onboarding pass, several sections superseded by the Known Traps below: `docs/PROJECT_STATE.md` (changelog stops at "v1.2.0 — FINAL", written before the site's static rebuild/CMS-restore cycle), `docs/CLIENT_HANDOVER.md` (§1's "6 cinematic video concepts / dropdown switcher" was removed by a later commit — see Known Traps #12), `docs/ENV_SETUP_GUIDE.md` (correct on the two Supabase vars, missing `CRON_SECRET`/`NEXT_PUBLIC_SITE_URL`).

## 1. Product snapshot

Corporate marketing site + client-editable CMS for **Fashion Asia Limited**, a 100%-export-oriented knitwear manufacturer in Sreepur, Gazipur, Bangladesh (sister concern of Northern Tosrifa Group). Public side: a cinematic-motion homepage plus five marketing sub-pages and three lead-capture forms. Admin side: a Supabase-backed `/admin` dashboard where the client edits page copy, the media/news gallery, job postings, reports, leadership profiles, and contact/general settings — without touching code.

## 2. Route map

### Public (`src/app/(website)/...`)

| Route | File | Data source |
|---|---|---|
| `/` | `src/app/(website)/page.tsx` | `getSettings("homepage")` |
| `/who-we-are` | `.../(marketing)/who-we-are/page.tsx` | `getSettings("who_we_are")` + `getLeaders()` |
| `/what-we-do` | `.../(marketing)/what-we-do/page.tsx` | `getSettings("business")` |
| `/global-partner` | `.../(marketing)/global-partner/page.tsx` | `getSettings("who_we_work_with")` |
| `/sustainability` | `.../(marketing)/sustainability/page.tsx` | `getSettings("sustainability")` + `getReports(true)` |
| `/life-at-fashion-asia` | `.../(marketing)/life-at-fashion-asia/page.tsx` | `getSettings("who_we_are")` (culture pillars) + `getMediaAssets()` |
| `/contact` | `.../(forms)/contact/page.tsx` + `ContactForm.tsx` | → `submitContactAction` |
| `/career` | `.../(forms)/career/page.tsx` + `CareerPageClient.tsx`/`JobAccordion.tsx` | `getJobs(true)` → `submitCareerAction` |
| `/grievance` | `.../(forms)/grievance/page.tsx` + `GrievanceForm.tsx` | → `submitGrievanceAction` |
| `/sitemap.xml`, `/robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` | read `NEXT_PUBLIC_SITE_URL` |
| `/layout-preview.html` | static file, `public/layout-preview.html` | not an app route — design/motion R&D comparison page (see Known Traps #13) |
| 404 | `src/app/not-found.tsx` | custom |

Permanent redirects (`next.config.ts`): `/business → /what-we-do`, `/who-we-work-with → /global-partner`, `/media → /life-at-fashion-asia`, `/reports → /sustainability#reports`.

### Admin (`src/app/admin/...`, gated by middleware)

| Route | File | Data source |
|---|---|---|
| `/admin/login` | `admin/login/page.tsx` | → `loginAction` |
| `/admin` | `admin/(dashboard)/page.tsx` + `SeedDefaultsPanel.tsx` | "sync content from code" → `seedSettingsFromDefaults` |
| `/admin/homepage` | `.../homepage/page.tsx` + `HomepageSettingsClient.tsx` | `getSettings("homepage")` |
| `/admin/who-we-are` | `.../who-we-are/page.tsx` + `WhoWeAreClient.tsx` | `getSettings("who_we_are")` + leader CRUD |
| `/admin/business` | `.../business/page.tsx` + `BusinessClient.tsx` | `getSettings("business")`, products use `ImageUploadField` |
| `/admin/who-we-work-with` | `.../who-we-work-with/page.tsx` + `WhoWeWorkWithClient.tsx` | `getSettings("who_we_work_with")` |
| `/admin/sustainability` | `.../sustainability/page.tsx` + `SustainabilityClient.tsx` | `getSettings("sustainability")` + report CRUD |
| `/admin/careers` | `.../careers/page.tsx` + `CareersClient.tsx` | job CRUD (`jobs-actions.ts`) |
| `/admin/reports` | `.../reports/page.tsx` + `ReportsClient.tsx` | report CRUD (`settings-actions.ts`) |
| `/admin/media` | `.../media/page.tsx` + `ImportBuiltInGallery.tsx` | `addMediaAction`/`deleteMediaAction` |
| `/admin/submissions` | `.../submissions/page.tsx` | reads `submissions`, tab per `type` |
| `/admin/settings` | `.../settings/page.tsx` + `ContactSettingsClient.tsx` | `getSettings("contact")`, `getSettings("general")` — **dead editors, see Known Traps #7** |

### API

| Route | Method | Purpose |
|---|---|---|
| `/api/keep-alive` | GET | Cron-only (`vercel.json`, every 4 days). Pings `site_settings` to keep the Supabase project active. Optional `CRON_SECRET` bearer check. Excluded from the auth middleware matcher. |

## 3. Middleware

`src/middleware.ts` — matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `/api/keep-alive`, and static image extensions. Delegates to `src/lib/supabase/middleware.ts::updateSession`, which refreshes the Supabase session cookie and enforces the `/admin` auth gate (see §Route map).

## 4. Server Actions inventory (`src/app/actions/*.ts`, all `"use server"`)

- **auth-actions.ts** — `loginAction`, `logoutAction`.
- **form-actions.ts** — `submitContactAction`, `submitCareerAction`, `submitGrievanceAction`; all funnel through one `submit()` helper that inserts into `submissions` with a `type` discriminator.
- **jobs-actions.ts** — `getJobs`, `createJob`, `updateJob`, `deleteJob` (table `jobs`).
- **media-actions.ts** — `getMediaAssets`, `importBuiltInGallery`, `uploadOptimizedImage` (validated), `addMediaAction` (unvalidated), `deleteMediaAction` (table `media_assets`, storage bucket `media`).
- **settings-actions.ts** — `getSettings`, `updateSettings`, `seedSettingsFromDefaults` (table `site_settings`); `getReports`/`createReport`/`updateReport`/`deleteReport` (table `reports`); `getLeaders`/`createLeader`/`updateLeader`/`deleteLeader` (table `leaders`); `uploadFile` (generic, unvalidated, bucket param — no confirmed caller found in source).

## 5. Data model (Postgres via Supabase)

Reference file: `supabase-schema.sql` (hand-applied in the SQL editor; no CLI migrations directory exists).

| Table | Purpose | RLS: anon | RLS: authenticated |
|---|---|---|---|
| `jobs` | Career postings | SELECT where `is_active` | **ALL** (explicit policy) |
| `submissions` | Contact/career/grievance payloads (JSONB) | INSERT only; SELECT explicitly denied | **none in this file** |
| `media_assets` | Gallery/news | SELECT (all) | **none in this file** |
| `site_settings` | Key/value JSONB CMS content | SELECT (all) | **none in this file** |
| `reports` | Publications | SELECT where `published` | **none in this file** |
| `leaders` | Leadership profiles | SELECT (all) | **none in this file** |

`site_settings.key` values in use: `homepage`, `who_we_are`, `business`, `who_we_work_with`, `sustainability`, `contact`, `general` (old page names deliberately kept — see Known Traps #6).

## 6. Content-defaults / hybrid CMS pattern (observed architectural decision)

`src/lib/site-content.ts` is the single fallback source for all editable copy: a `SITE_SETTINGS` object keyed exactly like the `site_settings` table, plus standalone seed/fallback arrays `JOBS`, `REPORTS`, `LEADERS`, `MEDIA_ASSETS`, and reference data `CLIENT_LOGOS`, `CERTIFICATIONS`, `PRODUCT_IMAGES`.

- `getSettings(key)` always layers the stored row over the code default (`{...defaults, ...stored}`) — a row saved before a redesign still renders correctly because the code fills any field it's missing. Never assume a page shows *only* what's in the DB.
- `getMediaAssets()` appends built-ins from `MEDIA_ASSETS` to whatever is in the table **until any one built-in has been imported as a real row** — at that point the table becomes fully authoritative and built-ins stop appearing. Do not "fix" this into strictly-table-driven; that regression already happened once (per prior-work context) and was reverted.
- `seedSettingsFromDefaults(keys)` — the admin "sync content from code" panel — overwrites only the fields the code defines, preserving any stored field the code doesn't know about.

## 7. Module / shared-code inventory

- `src/lib/site-content.ts` — content defaults / seed data (above).
- `src/lib/upload-limits.ts` — shared upload contract: `MAX_UPLOAD_BYTES` (400 KB), `MAX_UPLOAD_DIMENSION` (2400 px), `sniffImageFormat()` (magic-byte check for WebP/JPEG), used by both the client field and the server action.
- `src/lib/nav.ts` — single source of truth for `MAIN_NAV` + `NAV_CTA`; Header, MobileOverlayMenu, and Footer all read from it.
- `src/lib/utils.ts` — `cn()` (clsx + tailwind-merge).
- `src/lib/supabase/{client,server,middleware}.ts` — `@supabase/ssr` browser/server/middleware clients.
- `src/components/global/*` — Header, MobileOverlayMenu, Footer, Preloader, SmoothScrollProvider (Lenis).
- `src/components/sections/*` — homepage sections (Hero, About, Pillars, Scale, Marquee, Business/Sustainability/Media preview, Contact).
- `src/components/ui/*` — ScrollReveal (Framer Motion), FormInput, SubmitButton, FormStatusMessage, PageHeader, BrandLogo, RichText.
- `src/components/admin/*` — `ImageUploadField.tsx` (validated drag-and-drop upload), `SettingsForm.tsx` (shared admin form primitives: SettingsHeader/SettingsCard/TextInput/TextArea).

## 8. Architectural decisions (observed)

- Two top-level route groups: `(website)` (public — Lenis/Preloader/Header/Footer layout) and `admin` (separate layout, sidebar nav, no cinematic motion stack). A nested `(forms)` group inside `(website)` shares FormInput/SubmitButton/FormStatusMessage and one parameterized `submit()` helper across Contact/Career/Grievance.
- Content-as-code-with-DB-override (§6) was chosen deliberately so a fresh checkout / empty database still renders a fully populated site — `README.md`'s "no config needed" deploy story and the admin "Sync content from code" panel both depend on this.
- The 4-tier motion stack from `docs/PROJECT_STATE.md` is still structurally present, but several fix commits since the "v1.2.0 final" changelog entry scoped Lenis to hover-capable devices and disabled it on touch — "Lenis everywhere" is out of date.

## 9. Known traps / tech debt (durable — cite before changing related code)

1. **Deploy model.** Vercel builds production from GitHub `main`; pushing `main` is a production deploy. This checkout has three git remotes: `origin`, `client`, `staging` (names only, by design — see project instructions). `origin` and `client` are kept at the same commit for production pushes. `staging`'s `main` is currently at a different commit than `origin`/`client` — don't assume it mirrors production without checking first.
2. **Commit authorship.** Every commit after the repo's initial commit is authored under the agency delivery account; the initial commit alone used a different, personal git identity. Not a problem, just don't be surprised by it in `git log --format='%an'`.
3. **Supabase project is client-owned and unreachable from this machine's tooling.** Schema changes are hand-applied in the SQL editor. Local `.env.local` points at the same live project — local writes are live writes.
4. **`/admin` needs the client's own credentials.** Confirmed in `src/lib/supabase/middleware.ts` + `auth-actions.ts`: email/password only, no signup flow in code, no OAuth.
5. **Aug 2026 static-rebuild incident.** Git history carries a tag `pre-static-rebuild-backup` immediately before a gap and a burst of fast-forward merges from `origin/main`, consistent with a rebuild that stripped the CMS and a restore that brought it back (branch `feat/restore-cms`, merged, still present). Both the tag and the branch are the rollback anchors if this ever recurs — never remove the CMS, database, or form handlers without explicit confirmation.
6. **URL rename.** `/business→/what-we-do`, `/who-we-work-with→/global-partner`, `/media→/life-at-fashion-asia`, permanent redirects in `next.config.ts`. `site_settings.key` values were deliberately kept on the old names; admin paths are unchanged. `SETTINGS_ROUTES` in `settings-actions.ts` maps each settings key to the public path `updateSettings()` must revalidate — a `revalidatePath` to a route that no longer exists fails silently, so this map has to track the *public* paths, not the key names.
7. **Two CMS editors are dead.** `/admin/settings` is the *only* place in the codebase that calls `getSettings("contact")` or `getSettings("general")` (confirmed by grep). No public page reads either key: `Footer.tsx`, `ContactSection.tsx`, and `MobileOverlayMenu.tsx` hardcode the contact email/phone/addresses as literals, and root `src/app/layout.tsx` hardcodes all SEO metadata directly. The literals in all of these currently match the corrected address (`admin@fashionasialtd.com` — confirmed via commit `fix: all contact emails → admin@fashionasialtd.com` and a full-tree grep), and `site-content.ts`'s own `contact`/`general` defaults are likewise correct. What's unverifiable from here is the live `site_settings` table row for these two keys — `supabase-schema.sql`'s seed insert still literally contains the *old* placeholder address (`contact@fashionasia.ltd`), so if that script (or `seedSettingsFromDefaults`) were ever rerun against a fresh project, the correct value has to come from `site-content.ts`, not from `supabase-schema.sql`. Either way: editing Contact/General in `/admin` today has **no visible effect** on the public site until someone wires Footer/ContactSection/MobileOverlayMenu/`layout.tsx` to `getSettings`. Whenever a public section is dropped, check whether it just orphaned a CMS field the same way.
8. **Gallery merge logic.** `getMediaAssets()` (§6) intentionally stops appending built-ins once any one has been imported into `media_assets` — this is correct behavior, not a bug to "fix" toward strictly-table-driven.
9. **Upload validation is enforced in exactly one of three upload paths.** `src/lib/upload-limits.ts`'s contract (≤400 KB, ≤2400 px, WebP/JPG only, format sniffed from magic bytes, never re-encoded) is fully enforced only in `uploadOptimizedImage` (`media-actions.ts`), called by `ImageUploadField.tsx` (product/facility card images in the admin Business/Homepage editors). It is **not** enforced in `addMediaAction` (`media-actions.ts` — the Media Center gallery/news publisher, `admin/(dashboard)/media/page.tsx`, which accepts any `image/*` with no size check) or in `uploadFile` (`settings-actions.ts` — generic, no validation, no confirmed caller). Extend validation to all three if this is ever tightened, not just the newest one.
10. **`npm run lint` is broken.** It runs `next lint`, but Next.js 16.1.6 is installed alongside ESLint 9.39.3 and only a legacy `.eslintrc.json` (no flat `eslint.config.*` at the project root) — confirmed structurally by file presence/absence. `npx tsc --noEmit` and `npm run build` are reported to work but were not re-run this session (no shell tool available to this onboarding pass). No unit-test or E2E runner exists.
11. **`.env.example` and `README.md` are both stale in the same direction.** Both describe the site as "fully static, frontend-only — no database, no backend, no environment variables," which was true before the CMS was restored (#5) but isn't true now: the code requires two Supabase env vars, the three forms write to the `submissions` table via server actions (not a `mailto:` link, as `README.md` claims), and there's a protected, database-backed `/admin`. Neither file was edited this pass (out of this task's scope — writable surface was `docs/` only); flag as a follow-up ticket.
12. **`supabase-schema.sql` under-documents live RLS policy coverage.** Of the six tables, only `jobs` has an explicit `TO authenticated` policy in this file. `submissions`, `media_assets`, `site_settings`, `reports`, and `leaders` have *only* `anon`-scoped policies (read-only, or insert-only for `submissions`) — no `authenticated` policy appears for any of them anywhere in the file. Under standard Postgres RLS, that would mean the authenticated admin session can't read `submissions`, write `media_assets`/`site_settings`/`reports`/`leaders`, etc. Since the admin dashboard demonstrably does all of that today, the live database almost certainly carries additional `authenticated`-role policies (added by hand in the SQL editor) that were never backported into this file — this can't be confirmed directly since Supabase isn't reachable from here. **Treat `supabase-schema.sql` as an incomplete snapshot, not the authoritative current policy set.** If this schema is ever replayed from scratch (disaster recovery, new environment), add `authenticated`-role policies for these five tables first — copy the `jobs` table's `FOR ALL TO authenticated USING (true) WITH CHECK (true)` pattern as a starting point, then verify against the live dashboard.
13. **`public/layout-preview.html`** is a standalone static comparison page (recent commits: "serve the layout comparison," "six motion treatments on the layout preview, with phone behaviour") — not part of the Next.js route tree, not linked from any in-app nav. Purpose (design/motion R&D for an unspecified surface) wasn't fully traced this pass; a local git branch `design-preview` also exists (and is on `origin`) with a commit not reachable from `main`'s history — its relationship to this file, and whether it's still needed, wasn't established. Worth a one-line confirmation with whoever's driving the layout work before `/git` prunes it.
14. **Storage bucket policies for `media` are not in `supabase-schema.sql` at all** — the bucket and its public-read/authenticated-write rules exist only in the live Supabase dashboard.

## 10. Required env vars

See `docs/TECH_STACK.md` → "Required env vars" for the full table (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, optional `NEXT_PUBLIC_SITE_URL`, optional `CRON_SECRET`).

## 11. Dependency audit

- **Not run live this session** — no shell/bash tool was available to this onboarding pass, so `npm outdated` / `npm audit` could not be executed. Do not treat the absence of findings here as a clean bill of health; a follow-up pass (or `/devops`) should run both directly.
- By inspection only: `next` (16.1.6), `react`/`react-dom` (19.2.4), `typescript` (5.9.3), `@supabase/supabase-js` (2.98.0), `@supabase/ssr` (0.8.0), and `eslint` (9.39.3) are all current-generation majors with no version mismatch between `package.json`'s range and `package-lock.json`'s resolution for the three checked directly (next/react/typescript).
- `pg` (`^8.19.0`, devDependency) has no matching `import`/`require` under `src/` — looks unused; see `docs/TECH_STACK.md` Notes.

## 12. Completed Work Log

*(No prior entries existed — this is the first log in this file. `docs/PROJECT_STATE.md` carries an earlier, differently-formatted changelog through "v1.2.0 — FINAL"; treat this section as picking up from there rather than duplicating it.)*

### 2026-09-26 — Initial onboarding

Mapped the codebase (routes, server actions, data model, content-default pattern, tooling) into this file and `docs/TECH_STACK.md` — no prior A-Team docs existed. Condensed timeline of what git history shows happened **after** `docs/PROJECT_STATE.md`'s "v1.2.0 — FINAL" entry (oldest → newest; commit subjects lightly grouped, not exhaustive):

- Admin auth hardening: isolated `/admin/login` from the dashboard shell via route group; converted login to `useActionState`.
- ~15 hero-engine performance/UX passes: frame quality/fps tiers, devicePixelRatio-aware canvas, touch-scroll fixes (Lenis disabled on touch, `overscroll-behavior`/`touch-action` tuning), eventual collapse from the 6-video-variant switcher to a single priority-loaded hero video.
- Homepage preview sections added for Business/Sustainability/Media, feeding into their full pages.
- Admin panel expanded to 7 settings pages plus Reports CRUD, Leadership CRUD, and (at the time) a public `/reports` page; all public pages then wired to live Supabase settings + leadership data.
- Branding/footer/domain pass (domain settled on `fashionasialtd.com`), several color/contrast fixes, official logo swap.
- Supabase keep-alive cron job added (`/api/keep-alive`, later set to every 4 days) and excluded from the auth middleware.
- **Gap, then a burst of fast-forward merges from `origin/main`** — the Aug 2026 static-rebuild-and-restore incident (see Known Traps #5); a `pre-static-rebuild-backup` tag marks the last good commit before it.
- Post-restore: two "client feedback" copy rounds, product tiles restyled to photo cards, **URL rename to match menu names** (`/business`, `/who-we-work-with`, `/media` → new paths, with redirects — Known Traps #6) plus editable product descriptions.
- Drag-and-drop, validated image upload for product/facility cards (`ImageUploadField` → `uploadOptimizedImage`, Known Traps #9).
- Admin "layout preview" / motion-treatment R&D (`public/layout-preview.html`, six motion treatments, phone behaviour) and two admin-shell scroll/sticky-sidebar fixes — the current `main` HEAD.

### 2026-09-26T00:00Z — T-002: Recommended image size + non-blocking upload advisory

**What shipped:**
- `src/lib/upload-limits.ts` — added recommended-size constants (1200×900 target, shape bounds 1:1–2:1) + `checkImageSizeAdvisory()`.
- `src/components/admin/ImageUploadField.tsx` — split the old combined hard-block/dimension check apart; added a non-blocking amber "warning" state (`Info` icon, `role="status"`) distinct from the existing red hard-block "error" state (`TriangleAlert` icon, `role="alert"`).

**Source (if marketing-originated):**
- N/A — direct engineering ticket, `docs/VISION.md` MVP Feature 3. This project's marketing lane is inert (no `docs/MARKETING.md` exists yet, `docs/WORKFLOW.md` §10).

**Key decisions:**
- Advisory is computed only after all existing hard checks and the existing `uploadOptimizedImage` call have already succeeded — never short-circuits or replaces a hard check (Why: `docs/VISION.md` anti-goal forbids loosening the existing 400 KB / 2400 px / JPG-WebP-only enforcement).
- `addMediaAction` and the generic `uploadFile` action deliberately left untouched (Why: VISION anti-goal scopes this warning to product/facility-card uploads via `ImageUploadField` only, not the Media Center gallery or the generic upload path).
- No new npm dependency — advisory logic is plain arithmetic on `img.naturalWidth`/`naturalHeight` (Why: consistent with this project's "does it earn its keep" bar for new packages, same bar T-001 later applied to `slugify()`).

**Known traps / debt:**
- WARN-2 — `handleFile` is re-entrant with no guard; rapid double file-picks race, and whichever network round-trip resolves *last* wins, not whichever was picked last (pre-existing pattern; T-002 added a 2nd piece of state riding the same race) (severity: medium) — follow-up **T-009**.
- WARN-4 — `ObjectListEditor` keys rows by array index, not a stable id; reordering/deleting a row hands its sibling a stale warning/error on that sibling's `ImageUploadField` (root cause pre-dates T-002, outside its diff; T-002 just made the consequence more visible) (severity: medium) — follow-up **T-010**.
- WARN-1 — `checkImageSizeAdvisory(0,0)` mis-reports `offProportion:false` via a `NaN` comparison; narrow, likely-unreachable edge case (severity: low) — folded into **T-009**.
- WARN-3 — hand-editing the field's raw path `<input>` doesn't clear a stale warning/error left from a prior upload on the same field instance (severity: low) — folded into **T-009**.
- SEC-MED-1 — `MAX_UPLOAD_DIMENSION` enforced client-side only; a direct authenticated `fetch`/`curl` bypassing `ImageUploadField` can still store a small-bytes/extreme-pixel "pixel bomb" (pre-existing, surfaced during this ticket's CSO bootstrap pass, not introduced by it) (severity: medium) — follow-up **T-007**.
- SEC-MED-2 — no CSP / `X-Frame-Options` / `X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` anywhere on the live site, most notably `/admin/login` (pre-existing, surfaced this pass) (severity: medium) — follow-up **T-008**.
- SEC-HIGH-1 — installed Next.js `16.1.6` sits inside a vulnerable advisory range including a directly-reachable Server Actions null-origin CSRF bypass (`GHSA-mq59-m269-xvcx`); fix is a lockfile-only bump to `16.3.6`+ (pre-existing, surfaced this pass) (severity: high) — follow-up **T-006**; **blocks the next `deploy`**, does not block local merge.
- ui-ux finding, relayed by the orchestrator, not written to a doc ("ui-ux T-002 pass, 2026-09-26") — WCAG AA contrast + keyboard-focus gaps on the `ImageUploadField`/`ObjectListEditor` shared components (severity: low/medium) — follow-up **T-011**.

**Deferred QA findings (🟢):**
- INFO-1 — "smaller than recommended" wording is imprecise at extreme wide aspect ratios (e.g. 2400×100 — width is 2× the recommendation, only height is short); the numbers shown are still accurate. Not worth blocking on — not ticketed.
- INFO-2 — no regression test exists or was added (no test runner installed anywhere in this repo); the hand-verified boundary table (exact 1200×900, both shape bounds, portrait, extreme-wide, 0×0) is a ready-made test-case list for `checkImageSizeAdvisory` — followup: pick up whenever a test runner is chosen.

**Deferred security findings:**
- SEC-INFO-7 — admin-login rate-limit/lockout not confirmed in source — tracked in `docs/SECURITY.md` §5 for the next full `/cso audit`, not a standalone ticket.

**Acceptance evidence:**
- `docs/qa-evidence/T-002/auth-gate/{01-admin-business,02-admin-homepage,03-admin-root,04-admin-login}.log`, `05-admin-login-desktop.png`
- `docs/qa-evidence/T-002/what-we-do-images/{page,image-resolution-check}.log`, `02-desktop-full-page.png`, `02b-desktop-product-grid-crop.png`
- `docs/qa-evidence/T-002/homepage-facility-images/{page,image-resolution-check}.log`, `01-desktop-top-of-page.png`
- Static QA verdict: ✅ (all 5 acceptance criteria verified directly against code; 4 🟡 WARN non-blocking, 0 🔴 CRIT)
- Live QA verdict: ✅ (3/3 flows pass, 0 failed requests; one tooling limitation documented — a full-viewport `h-screen` hero plus an unconditional `Preloader.tsx` `scrollTo(0,0)` defeats headless below-the-fold screenshots — not a code defect)
- CSO sign-off: ✅ 2026-09-26 in `docs/SECURITY.md` ("T-002 verdict: ✅ CLEARED")
- **Manual admin checklist** (`docs/QA_REPORT.md`, "Manual Checklist — T-002") — written, **not yet run by the user** as of this compression (2026-09-27). Agents hold no admin credentials (`docs/WORKFLOW.md` §4/§7); running it is a pre-deploy item.

**Commit(s):** `8030456`

### 2026-09-27T00:00Z — T-001: `public.products` table + category slug groundwork

**What shipped:**
- `db/migrations/0001_products-within-category.sql` (new) — `public.products` table, RLS (`anon` SELECT / `authenticated` ALL, matching the `jobs` precedent), composite index `(category_slug, sort_order)`, explicit `GRANT`s. **`STATUS: APPLIED 2026-09-27`** — user hand-applied against the live Supabase project, per commit `96b6010`.
- `supabase-schema.sql` — rolled-up snapshot updated to match (new §6 Products Table + seed block).
- `docs/TECH_STACK.md` — decision record (a)/(b)/(c) + same-day GRANT follow-up (owned by `/architect`, not this pass).
- `src/lib/site-content.ts` — `slug` field added to the 8 default categories, new `CategoryProduct` type, `slugify()` / `dedupeSlug()`, `normalizeProducts()` slug handling — types and read-time fallback only, no write path yet (that's T-003).

**Source (if marketing-originated):**
- N/A — direct engineering ticket, `docs/VISION.md` "Settled inputs" + MVP Feature 2 (data/backend half).

**Key decisions** (full record: `docs/TECH_STACK.md`, "Products-within-category schema" — not duplicated in full here, only what a fresh session needs to not re-derive):
- (a) New dedicated `public.products` table for individual products; categories stay in `site_settings.business` JSONB, unchanged (Why: per-product CRUD matches the existing `jobs`/`reports`/`leaders` per-row pattern; avoids whole-blob JSONB write amplification and a 2nd JSONB nesting level).
- (b) Attachment via an application-enforced `slug`, not a DB foreign key — computed once from title, frozen forever after; a freshly-computed slug colliding with a sibling is rejected outright, never silently suffixed (Why: categories are JSONB array elements, not table rows — there is no FK target; slug doubles as the public URL segment so T-005 needs no separate ID scheme).
- (c) Delete guard is an application-level count check, not a schema constraint (Why: no category row exists for a `REFERENCES`/`ON DELETE RESTRICT` constraint to attach to).
- Explicit `GRANT`s added same-day, ahead of Supabase's 2026-10-30 platform-wide enforcement of its "auto-expose new tables" deprecation (Why: GRANT is checked before RLS; the other 5 pre-existing tables still rely on an inferred, soon-to-be-atypical default).
- No new npm package for slug generation — `slugify()` is a ~10-line pure function (Why: doesn't "earn its keep" as a dependency).

**Known traps / debt:**
- **`docs/TECH_STACK.md`'s "Notes for implementers" section still says `Product.slug` is "not yet in code" — stale since this ticket shipped it** (and now further out of date given T-003's later `Product.id` addition, see below). Flagged for `/architect` to correct on its next pass; not edited by this compression (writable surface here is `docs/MEMORY_BANK.md` / `docs/ROADMAP.md` only) (severity: low, documentation-accuracy only).
- `normalizeProducts()`'s stored-slug bypass (`storedSlug || dedupeSlug(...)`) skipped dedupe entirely whenever `storedSlug` was truthy — an order-dependent stored-vs-computed collision gap, reachable through ordinary `/admin/business` "move up/down" clicks, not only manual DB editing (QA WARN-1, sharper than CSO's original SEC-MED-3 framing) (severity: medium) — **CLOSED at T-003**, see that entry below.
- The pre-existing, unmodified `/admin/business` Save button could silently freeze an unvalidated `normalizeProducts()`-computed slug the instant *any* admin clicked Save for *any* reason, from **this ticket's own merge** onward — QA's WARN-2 found the real risk window opens here, not at T-003's future write path as CSO's original SEC-MED-4 assumed (severity: medium) — **CLOSED at T-003**.
- `CategoryProduct` type gaps: `id` marked required (unsafe as an insert payload — it's DB-generated), and no `created_at`/`updated_at` fields at all (QA WARN-3) (severity: low) — addressed by T-003 defining its own `Omit<...>`-shaped insert type per its own acceptance criteria.
- `slugify()` drops accents rather than transliterating, mishandles the Turkish dotted `İ`, and an all-non-ASCII-letter title collapses to the same generic `"category"` fallback as an all-symbol title (QA INFO-1) — cosmetic; the client's 8 real category titles are plain ASCII (severity: low, not ticketed).
- SEC-HIGH-2 — "`authenticated`" on this project's Supabase project means *any* Supabase-signed-up identity; safety depends entirely on the Dashboard's "Allow new users to sign up" toggle, which is unverifiable from source (surfaced because T-001 extended the existing `authenticated`-ALL pattern to a new table; pre-existing/systemic, not a T-001 regression) (severity: high) — **not a ticket** — user must confirm this toggle is OFF in the Supabase Dashboard; **blocks the next `deploy`**.

**Deferred QA findings (🟢):**
- INFO-1 — the two narrow Unicode `slugify()` edge cases above — not ticketed, informational.
- INFO-2 — `supabase-schema.sql`'s `products` copy omits the migration's `COMMENT ON TABLE` — cosmetic; backport next time that file is touched, not its own ticket.
- INFO-4 / INFO-5 — no regression test exists (no runner installed repo-wide); the 8-seed-pair + adversarial-Unicode + Order-A/B battery in `docs/QA_REPORT.md` is a ready-made test suite whenever a runner lands. `/qa live`'s read-only DB pass ran as a separate, later step the same day (see Acceptance evidence) — correctly sequenced, not skipped.

**Deferred security findings:**
- SEC-MED-3 / SEC-MED-4 — status update: substantially addressed by T-003's `resolveCategoriesForSave`; the residual gap is tracked separately as SEC-HIGH-3 (closed at T-003, see that entry), not a re-opening of these two.

**Acceptance evidence:**
- `docs/qa-evidence/T-001/db-products-readonly/verify.log`
- `docs/qa-evidence/T-001/what-we-do-regression/{page.log, image-urls-baseline-T-002.txt, image-urls-new.txt, image-url-diff.log, slug-leak-check.log, 01-desktop-top.png, 02-desktop-grid.png}`
- `docs/qa-evidence/T-001/admin-auth-gate-regression/{01-admin-business,02-admin-root,03-admin-login}.log`, `04-admin-login-desktop.png`
- `docs/qa-evidence/T-001/live-slug-collision-check/result.log` — live-confirms 0 of the 8 real categories carried a stored slug as of this ticket; all 8 computed slugs unique and matched real `slugify()` output exactly
- Static QA verdict: ✅ (0 🔴; 3 🟡 WARN, all correctly out of scope for a types/migration-only ticket's own enforcement, folded as named acceptance-criteria bullets into T-003 rather than blocking here)
- Live QA verdict: ✅ (4/4 flows pass, 0 failed requests, fully read-only — no admin write flows in this ticket, so no manual checklist was needed)
- CSO sign-off: ✅ 2026-09-27 in `docs/SECURITY.md` ("T-001 cleared for local merge")

**Commit(s):** `0f42faf` (merge); `96b6010` ("mark migration 0001 applied")

### 2026-09-27T01:00Z — T-003: Products-within-category data layer + category delete-guard (incl. Category identity amendment)

**What shipped:**
- `src/app/actions/products-actions.ts` (new) — `getCategoryProducts`, `createCategoryProduct`, `updateCategoryProduct`, `deleteCategoryProduct`, `reorderCategoryProducts`, every write gated by `requireUser()` / `supabase.auth.getUser()`; `checkCategoryAttachable()` (replaced an earlier `getValidCategorySlugs()`) gates every write on a genuinely-stored `id` + well-formed `slug`.
- `src/app/actions/settings-actions.ts` — `updateSettings` extended: builds `existingById` via `readStoredCategoryIdentities()`, passes it into `resolveCategoriesForSave`; the delete-guard now diffs by `id` (`computeRemovedCategories`), never by slug string.
- `src/lib/site-content.ts` — `Product.id` (new — server-issued, internal-only, never public, never displayed, never written to `public.products`), `isWellFormedSlug()`, `resolveCategoriesForSave` (rewritten), `computeRemovedCategories()`, `readStoredCategoryIdentities()`.

**Source (if marketing-originated):**
- N/A — direct engineering ticket, `docs/VISION.md` MVP Feature 2 (data/backend half).

**Key decisions:**
- **Category identity amendment** (decision (d), `docs/TECH_STACK.md`, 2026-09-27, mid-ticket fix cycle): every category gains a second, purely-internal field, `id` (`crypto.randomUUID()`), assigned the first time a category is saved without one, frozen forever after — mirroring `slug`'s own lifecycle. "Is this the same category" is decided by `id` alone — **never** by slug, **never** by title; an incoming item's own `.slug` field is not read by `resolveCategoriesForSave` at all anymore. (Why: closes both QA's 🔴 CRIT-1 and CSO's 🟠 SEC-HIGH-3 as one mechanism — both traced to the same root cause, bare slug-string membership with no record of which category row actually owns a slug.) No migration/DDL needed — `id` is one more JSONB key, added the same way `slug` was at T-001.
- **Legacy bootstrap requirement** (same-day follow-up to (d)): products may only attach to a category that has survived at least one save under decision (d) — i.e. has a genuine stored `id` + well-formed `slug`. `getValidCategorySlugs()` (which validated against `normalizeProducts()`'s ephemeral read-time display fallback) was removed and replaced by `checkCategoryAttachable()`, which reads only frozen identities. A category that exists but hasn't been saved yet under the new logic returns a distinct `"not_yet_bootstrapped"` error naming the category — never lumped in with "does not exist."
  - **Operationally:** products can only attach to a category once it has a stored `id` + well-formed `slug`, which happens only after that category survives one `/admin/business` Save under this ticket's logic. Because local dev and production share the same live Supabase project (`docs/MEMORY_BANK.md` Known Trap #3), this bootstrap Save can be run **now**, pre-deploy, via `localhost:3000` — this is exactly Step 1 of the T-003 manual checklist below — or, if skipped now, must happen once in production `/admin/business` after this ticket's code is deployed, before T-004's product-adding UI can be used against any of today's 8 legacy categories. **As of this compression (2026-09-27), it has not been run either way — the live `site_settings.business` row still carries 0 stored ids**, confirmed live via `docs/qa-evidence/T-003/live-bootstrap-state-check/result.log`.
- Every write still checks the whole resolved category array for slug collisions in one unified pass, order-independent, rejecting the entire save by name on any hit (unchanged mechanism from T-001's decision (b), now correctly scoped by id first).

**Known traps / debt:**
- 🔴 **CRIT-1 (QA) — CLOSED.** Deleting a category with products, then adding a new, differently-created category with a colliding title in the *same* save (the literal `ObjectListEditor.blank()` shape — no devtools, no crafted call, just ordinary clicks) silently defeated the delete-guard: the guard diffed by slug string, and the new row's freshly-derived slug "refilled" the vacated slug before any removal was detected. Fixed by the Category identity amendment above; re-verified by direct execution (52/52 adversarial assertions), not accepted on the decision record's word alone.
- 🟠 **SEC-HIGH-3 (CSO) — CLOSED**, same fix, same root cause (a crafted direct Server Action call forging a `slug` field to hijack a vacated slug — required bypassing the shipped UI entirely, unlike CRIT-1). Independently re-verified by CSO's own re-review (43/43 assertions) and by QA's re-review (52/52).
- 🟡 **SEC-MED-6 (CSO) — CLOSED**: `resolveCategoriesForSave` now rejects a non-array/missing `products` payload outright with a named error, instead of silently coercing it to zero categories.
- 🟡 **WARN-1 (QA, malformed stored slug carried forward unrevalidated) — CLOSED**: a claimed/renamed row's stored slug is now shape-validated (`isWellFormedSlug`) before reuse; a genuinely-dropped row's malformed slug remains safe as-is (parameterized delete-guard query).
- 🟠 **SEC-HIGH-4 (CSO) — OPEN, PREREQUISITE FOR T-004, does not block T-003's own merge.** `updateSettings` throws plain `Error`s for every guard failure (auth, collision, delete-guard, non-array, duplicate-id-claim, malformed-slug); **zero** of the 7 settings-page clients catch it (`BusinessClient.tsx` included); no `error.tsx`/`global-error.tsx` exists anywhere in `src/app`. Next.js redacts thrown Server Action messages in production, so every one of these guards fails **silently in production**: the Save button just stops spinning, no error text, no toast, nothing. `npm run dev` (what `/qa live` tests against) shows the real message in the dev overlay, which masks how bad this is once deployed. **T-004's own written acceptance criteria ("shows T-003's message in the admin UI itself — not a silent failure") is unbuildable against `updateSettings`'s current throw-based contract, no matter how T-004 itself is built.** Not yet filed as its own ticket — recommend `/pm` fold into T-004 as a blocking prerequisite, or spin a small T-003.1 (severity: high).
- 🟡 WARN-2 (QA) — `reorderCategoryProducts` fully trusts the caller's `orderedIds` (no completeness/uniqueness check against the category's live rows) and doesn't call `revalidateCategory()` on a mid-loop failure (severity: medium, non-blocking, self-heals on the next full-success reorder) — no ticket filed yet, recommend `/pm` fast-follow.
- 🟡 SEC-MED-5 (CSO) — TOCTOU race between the delete-guard's product-count query and the `site_settings` upsert; mirrored by a symmetric window in `checkCategoryAttachable()`'s own read-then-write gap (both share the same accepted rationale: no category *row* exists to lock, and this is a small hand-created admin roster, not concurrent public traffic) (severity: medium, non-blocking) — no ticket filed yet.
- 🟡 SEC-MED-7 (CSO) — `CategoryProductInput.image` (and the pre-existing category-level `Product.image`) accept any string with no scheme allow-list, rendered as a public `<img src>` (bounded impact — browsers don't execute `javascript:`/SVG-`data:` via `<img>`; an attacker-controlled `https://` URL could still render sitewide) (severity: medium, non-blocking) — no ticket filed yet.
- 🟢 SEC-INFO-15 — `name` has no length cap matching `products.name VARCHAR(255)` (trivial fast-follow: `name.slice(0,255)`, same pattern already used for `slug`).
- 🟢 SEC-INFO-16 — `reorderCategoryProducts` issues sequential, non-transactional per-row updates (cosmetic display-order inconsistency only on partial failure — no cross-category corruption).
- **Note routed to `/cso`, not yet adjudicated by any pass:** QA's Live Pass read `origin/main`'s actually-**deployed** `updateSettings` directly (a local git read, no live write) and confirmed it has **no `getUser()`/session check at all today** — it goes straight to the `site_settings` upsert. Whether this is exploitable depends entirely on `site_settings`'s live `anon` RLS policy (documented as SELECT-only in `docs/MEMORY_BANK.md` §5, not independently re-verified from this environment). Not tested by attempting a write. Needs `/cso` to assess with Supabase Dashboard access this environment doesn't have.

**Deferred QA findings (🟢):**
- INFO-1 (first pass) — `sanitizeInput()`'s `sort_order` default (`0`) means a new product with no explicit order lands at the *front* of its category, not the end — a design note for T-004's "Add Product" flow (compute current max + 1 instead), not itself a bug.
- INFO-2 (first pass) — the delete-guard's error message doesn't pluralize when blocking on 2+ categories at once ("its/has/it" stays singular) — cosmetic, internal admin-only string, not public copy.
- INFO-1 (re-review pass) — `id` round-trip through T-004 depends on T-004 preserving unknown object keys when it (re)builds category objects; `ObjectListEditor.update()`/`move()` already do this correctly today (spread-based), but T-004 must not regress it, or every save starts looking like "all categories are new" (no data loss, but a rename's slug-freeze regresses to first-save behavior). Flagged as an explicit T-004 acceptance-criterion candidate for `/pm` to fold in.

**Deferred security findings:**
- SEC-HIGH-1 (Next.js CVE bump) and SEC-HIGH-2 (Supabase signup-toggle) — out of this ticket's own scope, both still open, both still blocking only the next production `deploy`, not local merge. See the T-001/T-002 entries above.

**Acceptance evidence:**
- `docs/qa-evidence/T-003/what-we-do-and-auth-gate-regression/{page,admin-business,admin-root,admin-login,image-url-diff,uuid-leak-check,slug-leak-check}.log`, `01-desktop-top.png`, `02-desktop-grid.png` — confirms the new internal-only `Product.id` never leaks into the DOM or any serialized payload (verified by a UUID-shape grep against the raw response, not just by reading source)
- `docs/qa-evidence/T-003/products-read-path-t005-shape/query-result.log`
- `docs/qa-evidence/T-003/live-bootstrap-state-check/result.log` — live-confirms 0 stored ids today (see bootstrap requirement above)
- Static QA verdict: ❌ Failed first pass (🔴 CRIT-1) → ✅ **Static Pass on re-run** after the Category identity amendment fix (all 11/11 acceptance criteria satisfied; 0 🔴; 2 🟡 non-blocking carried forward — WARN-2, WARN-3/SEC-HIGH-4)
- Live QA verdict: ✅ (3/3 agent-executable flows pass, 0 failed requests)
- CSO sign-off: ✅ 2026-09-27 in `docs/SECURITY.md` — first review ("cleared to proceed to `/qa static`/`/qa live`," SEC-HIGH-3/SEC-HIGH-4 open) and re-review after fix ("SEC-HIGH-3 and SEC-MED-6 closed... 43/43 adversarial assertions")
- **Manual admin checklist** (`docs/QA_REPORT.md`, "Manual Checklist — T-003," 4 steps incl. the one-time bootstrap save + a duplicate-title-save refusal check) — written, **not yet run by the user** as of this compression (2026-09-27). Its Step 1 is the legacy-category bootstrap Save described above.

**Commit(s):** `5984b74` (feat); `ed76507` (merge)

### 2026-09-27 — Standing state carried forward (cross-ticket; not itself a ticket — do not re-archive this heading)

- **Deploy is currently blocked** by all of: SEC-HIGH-1 (ticketed as **T-006**, not yet started), SEC-HIGH-2 (needs the user's own confirmation of a Supabase Dashboard toggle — no code ticket), the T-002 manual admin checklist (`docs/QA_REPORT.md`, not yet run), and the T-003 manual admin checklist (`docs/QA_REPORT.md`, not yet run — see the T-003 entry above for what its Step 1 accomplishes). None of these block local merges, only the next `deploy`.
- **T-004 additionally cannot be built to its own written spec** until SEC-HIGH-4 is resolved (see the T-003 entry above) — not yet filed as its own ticket; recommend folding into T-004 or spinning a small T-003.1.
- **Repo hygiene note** (an observation from this compression pass, not a doc finding): `docs/qa-evidence/<ticket>/` is adding roughly 1.5 MB per ticket to the repo. Not a problem yet — worth a `/devops`/`/git` look if the pace continues across future sprints.

### 2026-09-27T02:00Z — T-005: Public category detail pages under `/what-we-do`

**What shipped:**
- `src/app/(website)/(marketing)/what-we-do/[category]/page.tsx` (new) — dynamic route (`ƒ`, no `generateStaticParams`), `generateMetadata`, page body; renders a category's own products or an honest "Coming Soon" empty state.
- `src/app/(website)/(marketing)/what-we-do/page.tsx` — wraps each category card in `<Link href="/what-we-do/<slug>">`.
- `src/app/actions/settings-actions.ts` — added one `revalidatePath("/sitemap.xml")` line inside `updateSettings`'s existing per-category revalidation loop.
- `src/app/sitemap.ts` — generates one `<url>` entry per live category from `normalizeProducts(business.products)`, no hardcoded literal.

**Source (if marketing-originated):**
- N/A — direct engineering ticket, `docs/VISION.md` MVP Feature 1. This project's marketing lane is still inert (`docs/WORKFLOW.md` §10).

**Key decisions:**
- The route matches the URL param against `normalizeProducts()`'s *normalized* `.slug` via exact `===` only — the raw param and any raw stored slug are never used to construct a path/query/string anywhere (closes `docs/SECURITY.md` SEC-MED-4's T-005 half; defense-in-depth even though no live write path can set an unsafe slug post-T-003).
- Category `Product.id` (decision (d), T-003) is read nowhere in this route or `sitemap.ts` — only `.title`/`.description`/`.slug`. `CategoryProduct.id` (a different type — the DB row's own UUID) is used as a React `key`; judged acceptable since `public.products` is already fully `anon`-readable via T-001's own RLS/GRANT, so this adds zero incremental exposure.
- `revalidatePath("/sitemap.xml")` was added but is a confirmed no-op: `createClient()` unconditionally calls `cookies()`, which forces `sitemap.ts` and the whole `/what-we-do*` tree fully dynamic (`ƒ`, confirmed via `npm run build` output) — there is no cache entry for it, or for any pre-existing `/what-we-do*` `revalidatePath` call, to purge. Kept as harmless, cheap insurance, not because it does anything today.

**Known traps / debt:**
- WARN-3 — renaming a category *before* the one-time `/admin/business` bootstrap Save changes its slug (and therefore its public URL) with **zero redirect** (`next.config.ts` has only 3 hardcoded legacy-path rules). T-005 is what makes this consequential for the first time — before it shipped, `.slug` was inert/unindexed; after, the sitemap actively advertises `/what-we-do/<slug>` to crawlers from the first crawl. **Run the bootstrap Save at/before deploy, before any other `/admin/business` edit and before search engines index the pages.** No manual checklist/runbook item currently states this. (severity: medium)
- WARN-4 — product-photo `<img alt="" aria-hidden="true">` (carried forward from the pre-existing `/what-we-do` teaser card, not introduced here) leaves screen-reader users with zero descriptive content on a populated card whenever `description` is empty — true of every one of today's 8 categories' future products by current default (`site-content.ts`: "Descriptions ship empty on purpose"). A real WCAG 1.1.1 gap for a manufacturer whose catalog page's whole point is showing the garment. Fix both `what-we-do/page.tsx` and `[category]/page.tsx` together, e.g. `alt={product.name}`. (severity: medium)
- WARN-2 — `sitemap.ts` becoming fully dynamic (a side effect of reading live settings) means `lastModified: new Date()` now evaluates fresh on *every* request, sitewide — all 9 pre-existing static entries included, not just the 8 new category ones — so every URL reports "just modified" on every single crawl regardless of whether anything changed. Live-confirmed by two fetches ~2s apart returning different timestamps on all 17 entries. (severity: low-medium)
- WARN-1 — the new `revalidatePath("/sitemap.xml")` call (and every pre-existing `/what-we-do*` `revalidatePath` call in this codebase) is a confirmed no-op per the decision above; its own code comment overstates the benefit and should be corrected to say freshness comes from forced dynamic rendering, not this call. (severity: low)
- **WARN-5 — about 160 failed `/sequence/hero/frame_N.webp` 404 requests fire on every `(website)`-group desktop page load** (0 on mobile) — a dead eager-preload loop, `Preloader.tsx:67`, global to the whole public route group, **100% pre-existing and sitewide, not a T-005 defect**. First actually *measured* this pass (prior Live Passes used a one-shot screenshot flag with no CDP session to observe `Network`; this pass built a raw-DevTools-Protocol screenshot client that also captured console/network). `public/sequence/hero/` contains only `poster.webp` — the numbered frames don't exist. For `/pm`: delete the dead loop (the poster alone already covers `HeroSection.tsx`) or restore the missing frames. (severity: low, perf/cosmetic)

**Deferred QA findings (🟢):**
- SEC-INFO-19 — `normalizeProducts()`'s unvalidated stored `slug` now reaches a new `<Link href>` sink (the `/what-we-do` card) for the first time; no live write path can ever set an unsafe value (`resolveCategoriesForSave` never reads an incoming item's `.slug` at all, post-T-003) — followup ticket: none filed, recommend gating `normalizeProducts()`'s stored-slug branch through `isWellFormedSlug()` whenever `src/lib/site-content.ts` is next touched.
- INFO-2 — OG `images`/`siteName`/`type`/`locale` are dropped on every marketing page's metadata, `[category]` included — confirmed 100% consistent sitewide convention (8/8 sibling pages), not a T-005-specific gap — followup: pick up in a future SEO/OG polish pass.
- INFO-4 — the populated-product-grid's variable-height card behavior (CSS Grid default row-stretch, no `line-clamp`) was reasoned through statically only; `public.products` was still empty at review time — followup: live-verifiable now that T-004 shipped real rows (see T-004 entry below).

**Deferred security findings:**
- SEC-MED-4 (T-005 half) — ✅ closed for T-005's own scope: every named sink (`revalidatePath`, `sitemap.ts`, canonical, OG) uses a validated/resolved slug or a typed, Next-serialized shape, never a raw path-construction input — tracked in `docs/SECURITY.md` §5.
- SEC-HIGH-1 (Next.js CVE / T-006) and SEC-HIGH-2 (Supabase signup-toggle) — untouched by this ticket, both still block only the next production `deploy` — tracked in `docs/SECURITY.md` §5.

**Acceptance evidence:**
- `docs/qa-evidence/T-005/screenshots/{01-what-we-do-grid-desktop-1440,02-category-sportswear-desktop-1440,03-category-sportswear-mobile-360}.png` + matching `.console-network.json` (0 console errors on all 3)
- `docs/qa-evidence/T-005/category-pages/`, `sitemap/`, `not-found-and-variants/`, `leak-checks/` (8/8 category pages pass, sitemap well-formed XML with all 17 entries, 7/7 malformed-slug/traversal variants fail closed, 0 UUID/slug leaks across 9 pages)
- Static QA verdict: ✅ (0 🔴, 4 🟡 WARN all non-blocking, 5 🟢 INFO)
- Live QA verdict: ✅ (7/7 flows pass, 0 failed flows, 0 500s across 20+ HTTP checks)
- CSO sign-off: ✅ 2026-09-27 in `docs/SECURITY.md` (`ticket-review:T-005`, "Cleared")

**Commit(s):** `27660e3` (merge); `d3ac3f5` (feat)

### 2026-09-27T03:00Z — T-012: `updateSettings` result contract — converts throw-based guard failures to `{ok, error}`

**What shipped:**
- `src/app/actions/settings-actions.ts` — `updateSettings` now returns `UpdateSettingsResult = {ok:true} | {ok:false, error:string}` for every guard branch (not-authenticated, existing-row read error, collision/resolution error, delete-guard count error, delete-guard block message, final upsert error); zero `throw` remains in the function body.
- `src/components/admin/SettingsForm.tsx` — `SettingsHeader` gains an `error?: string | null` prop, rendered as `<p role="alert" className="...text-red-400">` with a `TriangleAlert` icon. `ObjectListEditor` deliberately left untouched (see Key decisions).
- Six admin client files wired to check the result — `BusinessClient.tsx`, `HomepageSettingsClient.tsx`, `ContactSettingsClient.tsx` (both its `contact` and `general` call sites), `SustainabilityClient.tsx`, `WhoWeAreClient.tsx`, `WhoWeWorkWithClient.tsx` — each: `setError(null)` → `try { const result = await updateSettings(...); if (!result.ok) setError(result.error); } catch { setError("Something went wrong saving these changes. Check your connection and try again."); }`.

**Source (if marketing-originated):**
- N/A — direct engineering ticket. Closes `docs/SECURITY.md` SEC-HIGH-4 (T-003's throw-based `updateSettings` contract) and `docs/QA_REPORT.md` T-003 Static Pass re-run WARN-3 — both independently named this a **blocking prerequisite for T-004**, not a discretionary fast-follow.

**Key decisions:**
- Failure convention going forward, recorded in `docs/TECH_STACK.md` ("Server Action failure-reporting convention"): a user-facing guard failure is returned as a typed `{ok:false, error}`, never thrown; `throw` is reserved for genuinely unexpected/infrastructure failures. Matches `src/app/actions/products-actions.ts`'s pre-existing shape (T-003) — this ticket brought `settings-actions.ts` in line with an already-established in-repo pattern, not a new one.
- `ObjectListEditor` intentionally did **not** gain an error slot — only `SettingsHeader` did (Why: every settings page has exactly one Save button, so a save failure is always a whole-page outcome; `HomepageSettingsClient` alone has three separate `ObjectListEditor` instances that would each have to guess whether an unrelated failure was "theirs." Independently endorsed by both `/cso` and `/ui-ux`.)
- `ContactSettingsClient`'s two `updateSettings` calls (`contact`, `general`) stay unconditionally independent, not short-circuited by each other's failure — a partial failure names only the side that failed, joined by " · " if both fail.
- Spun as its own ticket rather than folded into T-004 (Why: the fix must land atomically across all six callers regardless of T-004's timeline, and it also repairs five settings pages — homepage, contact, sustainability, who-we-are, who-we-work-with — that have nothing to do with T-004's product editor).

**Known traps / debt:**
- **SEC-HIGH-5 (new, blocks next deploy)** — `ReportsClient.tsx` (`createReport`/`updateReport`/`deleteReport`) and `CareersClient.tsx` (`createJob`/`updateJob`/`deleteJob`) wrap their CRUD calls in **zero** `try`/`catch` — reproducing SEC-HIGH-4's exact pre-fix shape on live, shipped, day-to-day admin surfaces *today*, with no future-ticket precondition needed (unlike SEC-HIGH-4, which was gated behind T-004). Neither page has any error-display slot at all. Not yet filed as a ticket — `/cso` recommends a high-priority fast-follow, same pattern as T-012; joins the pre-deploy blocker list. (severity: high)
- SEC-MED-8 (new) — raw Supabase/Postgres `error.message` strings now reach the browser verbatim from three `updateSettings` branches (existing-row read, delete-guard count, final upsert) — same already-accepted pattern as `products-actions.ts`'s SEC-INFO-15, now a second file. Not yet filed — recommend a consolidated fast-follow (map known error shapes to a generic string, log the raw one server-side only) covering both files. (severity: medium)
- SEC-MED-9 (new) — `addMediaAction`/`deleteMediaAction` (`media-actions.ts`) return `void` and are wired as raw `<form action>` Server Actions with **no client JS wrapper at all** — zero failure signal in *any* environment, not just production (distinct from SEC-HIGH-4/5's "redacted-in-prod-only" shape); `deleteMediaAction`'s own delete error isn't even logged server-side. Needs its own design pass, not a drop-in copy of T-012's pattern (no client awaiter exists to convert). Not yet filed. (severity: medium)
- SEC-MED-10 (new) — 10 write functions with no application-level `getUser()` check, relying solely on RLS: 7 in `settings-actions.ts` (report/leader/job CRUD + `seedSettingsFromDefaults`/`uploadFile` — distinct from `updateSettings` itself, which does check), 2 in `media-actions.ts`, 3 in `jobs-actions.ts`. Not yet filed — recommend batching with SEC-HIGH-5's fix ticket (7 of 10 functions overlap). (severity: medium)
- WARN-1 (wording only) — T-012's own acceptance bullet 3 names both `SettingsHeader` *and* `ObjectListEditor` for the error slot; only `SettingsHeader` got one, deliberately (see Key decisions). Tighten the bullet's wording on a future `/pm` pass. (severity: low)

**Deferred QA findings (🟢):**
- INFO-1 — a narrow edge case in `ContactSettingsClient`: if the `contact` call resolves `{ok:false}` but the second `general` `await` itself throws (transient network only), the specific `"Contact settings: …"` message is replaced by the generic fallback — conservative-safe (never claims success), just less specific — followup: not ticketed, cosmetic.

**Deferred security findings:**
- SEC-HIGH-4 — ✅ closed: zero `throw` remains in `updateSettings`, independently re-verified by both `/cso` and `/qa` via direct line-by-line read of the full function body — tracked in `docs/SECURITY.md` §5.
- SEC-HIGH-1 / SEC-HIGH-2 — untouched, still block only the next `deploy` — tracked in `docs/SECURITY.md` §5.

**Acceptance evidence:**
- `docs/qa-evidence/T-012/production-mode-boot/` — a genuine `next start -p 3001` boot: auth gate + public smoke test pass 12/12, byte-identical to the `:3000` dev-server baseline; production server cleanly stopped afterward, `:3000` confirmed undisturbed (same PID before/after).
- `docs/qa-evidence/T-012/admin-auth-gate-regression/`, `public-regression/` (8/8 and 8/8 pass, 0 failed requests)
- Static QA verdict: ✅ (0 🔴, 1 🟡 WARN wording-only, 2 🟢 INFO)
- Live QA verdict: ✅ (all 3 flows pass, 28 HTTP checks, 0 failures)
- CSO sign-off: ✅ 2026-09-27 in `docs/SECURITY.md` (`ticket-review:T-012`, "Cleared")
- **Manual Checklist — T-012** (`docs/QA_REPORT.md`) — written, 8 steps, run under a production build by the user; **not yet run** as of this compression. Step 2 doubles as T-003's still-outstanding bootstrap-save checklist item — running one satisfies both.

**Commit(s):** `d3e2bd7` (merge); `98b4a83` (fix)

### 2026-09-27T04:00Z — T-004: Products-within-category admin editor on `/admin/business`

**What shipped:**
- `src/components/admin/CategoryProductsManager.tsx` (new) — the "Products Within Each Category" card: category picker, `AddProductForm`, per-row `ProductRow` (inline name/description/image edit-on-blur, delete with `confirm()`, ▲/▼ reorder).
- `src/app/actions/products-actions.ts` — new `getAllCategoryProducts()` (one grouped read for the admin page's initial load); `createCategoryProduct` now computes `sort_order` = current category max + 1 server-side when the caller omits it.
- `src/app/admin/(dashboard)/business/BusinessClient.tsx` — re-reads `getSettings("business")` after every successful Save, piped through `normalizeProducts()`, so a category's `id`/`slug` round-trip correctly into the next save.
- `src/app/admin/(dashboard)/business/page.tsx` — `Promise.all([getSettings("business"), getAllCategoryProducts()])`.
- `src/lib/site-content.ts` — `CategoryProductInput.sort_order` made optional (only content change in this file this ticket).

**Source (if marketing-originated):**
- N/A — direct engineering ticket, `docs/VISION.md` MVP Feature 2 (admin UI half). This is the client's actual requested feature this sprint existed to ship.

**Key decisions:**
- Two independent save models on one page, by design: product Name/Description/Image save immediately per-field on blur/upload (T-003's per-row CRUD actions, `requireUser()`-gated, byte-identical to `main`); the category cards above still require the pre-existing "Save Changes" button (T-001 decision (a)'s whole-blob JSONB model, unchanged). Products never touch `site_settings` at all — confirmed structurally: the new file imports nothing from `settings-actions.ts`.
- `sort_order` computed server-side as current max + 1 at insert time — `AddProductForm` never sends a client-supplied value (closes T-003 QA's first-pass INFO-1: new products land at the **end** of a category, not the front).
- Products may only attach to a category with a genuine, bootstrapped `id`+`slug` (`checkCategoryAttachable()`, never `normalizeProducts()`'s read-time display fallback) — un-bootstrapped categories show a named, title-specific advisory (`Info` icon, `role="status"`) and the add form stays hidden; `CategoryProductsManager` also short-circuits client-side (`bootstrapped = Boolean(selected?.id)`) before ever attempting a write.
- `ProductRow`'s React `key` is `product.id` (stable DB UUID), not array index — deliberately avoids the still-open T-002 WARN-4 / **T-010** index-keying trap that `ObjectListEditor` still has.
- The delete-guard message ("Remove its products first…") is now, for the first time, actually reachable (a category can finally hold products) — traced end-to-end and confirmed the T-012 mechanism holds unchanged: it's a `return`, not a `throw`, so it survives Next.js's production redaction.

**Known traps / debt:**
- **WARN-1 (reachable via ordinary UI, not a crafted call)** — a row's Image-field save and its Name/Description-field save are independent, unguarded requests to the same row: `<ImageUploadField>` has no `disabled` prop wired to the row's `busy` flag (the component's own signature has no such parameter to plumb one into), so an admin can trigger an image upload while a text save for the same row is still in flight. If the earlier (stale) text-save response arrives *after* the image-save response, its own stale snapshot's old image silently overwrites the just-uploaded one on both the DB row and the on-screen preview — both requests report "Saved," **no error shown anywhere**. Not data loss (the new file stays in Storage), recoverable by re-uploading. Fix: add a `disabled` prop to the shared `ImageUploadField` and wire `disabled={busy}`, or a per-row monotonic request-sequence token. (severity: medium)
- **WARN-2 (reachable via ordinary UI)** — `<AddProductForm categorySlug={selected.slug} .../>` carries no `key` prop, so it is not remounted on a category switch — an in-progress draft (name/description/**an already-uploaded image**) silently survives a category change and attaches to whatever category is selected when "Add product" is eventually clicked. No corruption, but content entered for one category can land on another. Fix: `key={selected.slug}`. (severity: medium)
- **WARN-3** — a `getAllCategoryProducts` read failure (`console.error`'d server-side only, returns `{}`) is indistinguishable in the admin UI from a category genuinely having zero products — "No products in this category yet" shows either way. Risks an admin creating a duplicate product during a transient read failure. Fix: discriminated `{ok, data}` return shape. (severity: medium) **QA and `/cso` both recommend picking these three (WARN-1/2/3) up as `/pm` fast-follow tickets.**
- SEC-MED-11 (new, crafted-call only) — `createCategoryProduct`/`updateCategoryProduct` accept an arbitrary finite `sort_order` verbatim when a caller directly supplies one (negative/huge/non-integer) — the max+1 default only fires when omitted/non-finite. Not reachable via the shipped UI. Recommend folding into **T-014**. (severity: medium)
- SEC-MED-12 (new, extends SEC-MED-5) — read-then-insert race in the new max+1 lookup: two concurrent adds to the *same* category can tie on the same computed `sort_order` (no `UNIQUE` constraint); self-corrects on the next reorder. Same accepted TOCTOU class as SEC-MED-5, no new ticket. (severity: medium, non-blocking)
- **SEC-MED-13 (new — reachability correction to the pre-existing SEC-MED-7)** — `ImageUploadField`'s pre-existing hand-editable raw path `<input>` (unchanged by T-004) means the image-scheme-allow-list gap is reachable through **entirely ordinary, shipped-UI staff use — no devtools, no crafted call** — not only via a direct Server Action call as every prior entry on this finding assumed. True for both the pre-existing category-card image field *and* T-004's new product-image fields. Impact ceiling unchanged (bounded — browsers don't execute `javascript:`/SVG-`data:` via `<img src>`; worst case is an attacker- or fat-finger-controlled URL rendering site-wide) — not a merge or deploy blocker by itself, but this is the **second** time `/cso` has recommended elevating **T-014**'s scheduling priority to "practically pre-deploy-required" (first at the T-005 review). (severity: medium)
- `/ui-ux` sitewide finding, not fixed here — `text-black` on `bg-primary` CTAs ≈ **2.77:1**, below the 4.5:1 AA bar, confirmed in **8 files** including `/admin/login`'s own sign-in button (the first control every site user touches), `src/components/ui/SubmitButton.tsx` (shared by all 3 public forms), and `SettingsHeader`'s "Save Changes" button. `AddProductForm`'s new "Add product" button correctly copied this same established (broken) convention for visual consistency rather than inventing a one-off fix. Recommend a dedicated cross-cutting follow-up, bundled with or alongside **T-011**. For `/pm`. (severity: medium, accessibility)

**Deferred QA findings (🟢):**
- INFO-1 — a narrower sibling race: deleting a row while a *different* row's reorder is in flight, followed by that reorder failing and reverting, can briefly resurrect the deleted row client-side; self-heals on any further action (server correctly returns "Product not found") or reload — not filed as its own item.
- INFO-2 — whether a fractional `sort_order` could ever actually reach the `INTEGER NOT NULL` column via the already-accepted SEC-MED-11 crafted-call path is a genuine open question (depends on PostgREST's JSON-to-column binding), not resolved this pass — doesn't change SEC-MED-11's grading either way.
- INFO-4 (from T-005) — the variable-height product-card grid behavior, reasoned through statically at T-005, is now confirmed live-verifiable since T-004 lets real rows exist — pick up on the next page-layout pass.

**Deferred security findings:**
- SEC-INFO-20 — `updateCategoryProduct` can structurally reassign a product to a different, already-attachable category (pre-existing T-003 behavior, soundly gated, crafted-call only — no shipped UI reaches it). No ticket — informational.
- SEC-INFO-21 — `getAllCategoryProducts()` adds no exposure beyond what `getCategoryProducts()` and Supabase's own public REST endpoint already made available (`public.products` has been `anon`-`SELECT` + explicit `GRANT` since T-001). No ticket — informational.
- SEC-INFO-22 — category `id`/`slug` round-trip through `BusinessClient`'s new post-Save re-read confirmed safe by direct execution (18/18 assertions, including a negative control proving the re-read line is load-bearing, not decorative) — closes the T-004 acceptance-criterion risk `docs/TECH_STACK.md`/T-003's entry flagged as open. No ticket — acceptance criterion satisfied.
- SEC-HIGH-1 / SEC-HIGH-2 / SEC-HIGH-5 — untouched by this ticket, all still block only the next `deploy` — tracked in `docs/SECURITY.md` §5.

**Acceptance evidence:**
- `docs/qa-evidence/T-004/production-mode-boot/` — genuine `next start -p 3001` boot, 12/12 pass, byte-identical to the `:3000` baseline.
- `docs/qa-evidence/T-004/admin-auth-gate/`, `public-regression/` (3/3 and 9/9 pass; all 8 category pages still show "Coming Soon" since no product was added by any agent pass, as required)
- `docs/qa-evidence/T-004/ui-ux/contrast-and-methodology.log` — the sitewide `text-black`/`bg-primary` contrast trace.
- Static QA verdict: ✅ (0 🔴, 3 🟡 WARN non-blocking, 4 🟢 INFO — all 11 of T-004's acceptance criteria, including all 5 "Folded in 2026-09-27" bullets, verified directly against the code)
- Live QA verdict: ✅ (all 3 flows pass, 24 HTTP checks, 0 failures)
- CSO sign-off: ✅ 2026-09-27 in `docs/SECURITY.md` (`ticket-review:T-004`, "Cleared" — no 🔴/🟠)
- **Manual Checklist — T-004** (`docs/QA_REPORT.md`) — written, 9 steps (0–8) plus cleanup, run under a production build by the user against the live Sportswear category; **not yet run** as of this compression. **This is the real acceptance test for the client-requested feature**, not a formality — Step 1 also retroactively satisfies T-003's and T-012's own still-outstanding bootstrap/normal-save checklist items.

**Commit(s):** `3c54315` (merge); `1b29887` (feat)

### 2026-09-27T05:00Z — Standing state carried forward (supersedes the 2026-09-27 block above; cross-ticket, not itself a ticket — do not re-archive this heading)

- **Deploy is still blocked**, now by: SEC-HIGH-1 (**T-006**, not started); SEC-HIGH-2 (user must confirm the Supabase Dashboard "Allow new users to sign up" toggle is OFF); **SEC-HIGH-5** (new this run — `ReportsClient`/`CareersClient` have zero try/catch, not yet filed as a ticket); and **all four manual admin checklists — T-002, T-003, T-012, T-004 — not yet run by the user.** T-004's checklist is the real acceptance test for the client's requested feature; running it also retroactively satisfies T-003's and T-012's own outstanding checklist steps.
- **The one-time `/admin/business` bootstrap Save is still not done**: 0 stored category ids live as of the last live check. Every category shows "hasn't been saved yet" in the new product editor until it's run — Step 1 of the T-004 checklist is the path of least resistance to finally close this.
- **Recommended, not blocking, before the next deploy:** elevate **T-014**'s scheduling priority (`/cso` has now recommended this twice — at T-005 and again at T-004 — since T-004 is what first lets an attacker- or fat-finger-influenced image value actually reach a live page); pick up T-004's WARN-1/WARN-2/WARN-3 as `/pm` fast-follow tickets.
- The user still needs to rotate the plaintext GitHub token in local `.git/config` (credential hygiene, not itself in the repo — flagged separately by `/cso` at the T-002 bootstrap pass, `docs/SECURITY.md`, and intentionally not re-examined by any review since).
- **Open process question for the user, unresolved:** `docs/WORKFLOW.md` §2 pins the commit trailer `Co-Authored-By: Claude Opus 5.5`, but every role agent runs on Sonnet 5 (`model: sonnet` in all 20 `.claude/agents/*.md`), and `/git` used `Claude Sonnet 5` on this run's four commits (`98b4a83`, `d3e2bd7`, `1b29887`, `3c54315`) as the truthful attribution instead. Ask the user whether §2 should stay pinned to a specific name or track whatever model actually did the work, then have `/director` update §2 accordingly.
- `docs/qa-evidence/<ticket>/` continues to grow faster than the prior ~1.5 MB/ticket baseline: roughly 4.0 MB (T-005), 2.0 MB (T-012), 2.3 MB (T-004) this run, per the dispatching orchestrator (not independently re-measured by this pass — no shell tool available). Flag for `/devops`/`/git` if the pace continues.
- `docs/ROADMAP.md`'s Dependency Order section still lists T-005/T-012/T-004 (now archived out of that file by this pass) — stale as of this compression; left for `/pm`'s next pass to rewrite, per this role's append-only/prune-only mandate.
