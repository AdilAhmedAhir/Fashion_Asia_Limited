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
