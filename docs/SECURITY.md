# Security — Fashion Asia Limited

Owner: `/cso`. Bootstrapped: 2026-09-26 (first run — no prior `docs/SECURITY.md` existed; this pass doubles as bootstrap + the dispatched `review T-002`). Sections 1–3 and 6–7 describe current understanding and are *amended* on later runs, never wiped. Section 4 (Findings) and the dated entries within Section 6 are append-only.

Sourced from `docs/TECH_STACK.md`, `docs/WORKFLOW.md`, `docs/MEMORY_BANK.md` (all dated 2026-09-26), plus direct inspection of source, `git diff`, `npm audit`, and live production response headers during this pass. `docs/ANALYTICS_SPEC.md` does not exist yet — no analytics PII surface to review.

## 1. Assets

- **Form submission PII** — `submissions` table (JSONB payload): contact/career/grievance submitter name, email, phone, message/cover-letter text. Anon `INSERT`-only, `SELECT` explicitly denied to anon (per `supabase-schema.sql` as summarized in `docs/MEMORY_BANK.md` §5).
- **Admin credentials** — Supabase Auth, email + password, no OAuth, no self-serve signup. Created by hand in the Supabase dashboard; no agent holds them.
- **Supabase project credentials** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (names only; both `NEXT_PUBLIC_*`, i.e. designed to be client-exposed and safe only insofar as RLS is correct). No service-role key found referenced anywhere in `src/` (confirmed by grep this pass) — the app has no elevated-privilege server credential beyond the anon key, which narrows blast radius if the anon key itself ever leaked (RLS is the real gate, not key secrecy).
- **`CRON_SECRET`** (name only, optional) — bearer check for `/api/keep-alive`; low value target (route only does a `SELECT ... LIMIT 1`).
- **Production access** — Vercel account (client-owned), GitHub repo (`origin`/`client`/`staging` remotes), Supabase dashboard (client-owned).
- **Uploaded media** — Supabase Storage bucket `media` (public-read).

## 2. Threat actors

- Opportunistic crawler / scraper against the public marketing site.
- Spam or automated-abuse bot against the three public forms (contact/career/grievance) — no CAPTCHA or rate-limit confirmed in source this pass.
- Disgruntled ex-admin or a compromised admin credential (single email/password, no MFA confirmed, client-managed).
- Malicious or careless uploader via the admin media/product-image surfaces.
- Supply-chain / framework CVE exploitation (see §4 — this pass found a live one).

## 3. Attack surface

| Surface | Control | Status |
|---|---|---|
| Customer login | N/A — no customer accounts anywhere in this product; public visitors only submit forms. | N/A |
| Admin login | `loginAction` (`auth-actions.ts`) → Supabase `signInWithPassword`; `/admin/*` gated by `src/middleware.ts` → `updateSession`. | Present and correctly redirects unauthenticated → `/admin/login` and authenticated-at-login → `/admin` (read this pass, §5 below). Rate-limit / lockout on repeated failed logins: **not confirmed in source** — open verify item, not this ticket's scope. |
| Database RLS/GRANT (`authenticated`-ALL tables) | RLS + explicit table `GRANT`, scoped `anon` = read-only / `authenticated` = ALL (`USING (true) WITH CHECK (true)`) — established by `jobs` (pre-existing) and extended to **`products`** this ticket (T-001, applied 2026-09-27). Model assumes `authenticated` ⊆ "client-created admin accounts only": no self-serve signup route exists anywhere in `src/` (`auth-actions.ts` exports only `loginAction`/`logoutAction`; re-confirmed by grep this pass — zero hits for `signUp`/`createUser`). | **Unverified precondition** — see SEC-HIGH-2, §4, 2026-09-27. |
| Session cookies | `@supabase/ssr` `createServerClient`, cookie options passed through **unmodified** by app code (no `secure`/`httpOnly`/`sameSite` override found in `src/lib/supabase/`). | Relies entirely on library defaults — not independently verified against the live `Set-Cookie` header this pass (would require an authenticated session, which no agent holds). Open verify item for a future full audit. |
| CSRF | No custom CSRF middleware; relies on Next.js Server Actions' built-in Origin-header check (there is no separate API layer — see `docs/TECH_STACK.md`). | Framework-level protection only — see SEC-HIGH-1 in §4: the installed Next.js version is inside the range for a Server-Actions null-origin CSRF bypass advisory. |
| CSP / security headers | No `headers()` block in `next.config.ts` (only `redirects()` is defined — read in full this pass); no CSP/XFO/XCTO/Referrer-Policy/Permissions-Policy anywhere. | **Missing sitewide**, confirmed by curling live production this pass — see SEC-MED-2 in §4. |
| Webhooks | None exist (`docs/TECH_STACK.md`: "no email provider SDK, no analytics SDK, no payment provider"). | N/A |
| File uploads | `src/lib/upload-limits.ts` contract (≤400 KB, ≤2400 px longest edge, WebP/JPG only via magic-byte sniff) — fully enforced in `uploadOptimizedImage`; **not** enforced in `addMediaAction` / `uploadFile` (pre-existing, `docs/MEMORY_BANK.md` Known Trap #9). | Reviewed this cycle for T-002 (see §4 below) — the refactor itself is clean. Two pre-existing gaps stand: dimension cap is client-only (SEC-MED-1), and the other two upload paths remain unvalidated (tracked already in `MEMORY_BANK.md`, not re-opened here). |
| Analytics events | `docs/ANALYTICS_SPEC.md` does not exist. | N/A — inert until `/analytics` produces a spec. |
| Dependency CVEs | `npm audit --omit=dev` run this pass. | See SEC-HIGH-1 in §4 — action required before next deploy. |

*Amended 2026-09-28 (T-006 CSO review; appended, rows above left as written):*
- **CSRF / Dependency CVEs.** SEC-HIGH-1 is closed in code by T-006 (`next@16.3.6`). `Origin: null` Server Action requests are now rejected, and this app configures no `allowedOrigins`. Production (`e8eace1`) still runs `16.1.6` until the next user-typed deploy. Post-bump `npm audit --omit=dev`: 0 critical, and 9 build/lint-toolchain advisories, none reachable at runtime (SEC-INFO-31).
- **Admin login / Database RLS (SEC-HIGH-2).** The precondition is now observed in the unsafe state: the live project's public `/auth/v1/settings` read `disable_signup: false`. The `/admin` middleware gate, `requireUser()` and `updateSettings` all check only that *some* user exists, so any self-registered identity is an admin. Exploitation is kept from being trivial only because this app has never shipped the anon key to a browser (SEC-INFO-32). That is obscurity, not a control.

*Amended 2026-09-28 (T-015 CSO review; appended, rows above left as written):*
- **Assets / File uploads.** `uploadFile` has a live caller: the Reports modal uploads PDFs to a second public bucket, `reports`. Its `bucket` argument and the file's extension are caller-controlled and reach the Storage request URL unencoded (SEC-INFO-33). The only size bound on it, and on `addMediaAction`, is Next's default 1 MB Server Action body limit (SEC-INFO-35).
- **Admin writes.** Once T-015 merges, every admin write action calls `getUser()` before any read, write or storage call, except `addMediaAction`/`deleteMediaAction` (T-019). It's a session check, not an admin check (SEC-HIGH-2).

*Amended 2026-10-03 (T-025 CSO review; appended, rows above left as written):*
- **Public catalog routes.** `/products` and `/products/<slug>` are new public read surfaces.
  - They read only the anon-readable `products` table and `site_settings.business`.
  - They render per request with `Cache-Control: private, no-store`, and ship no browser-side data fetch.
  - `/what-we-do/<slug>` is now a relative 308 to `/products/<slug>` (`next.config.ts`). It was tested against open-redirect, CRLF and host-poisoning vectors (T-025 entry, item 1).
- **String-built XML.** `/sitemap.xml` is served as `application/xml`, and Next 16.3.6 writes its `<loc>` values unescaped. It's the one public sink where CMS data isn't escaped by React (SEC-MED-15).
- **Session cookies.** The installed `@supabase/ssr` 0.8.0 defaults to `httpOnly: false`, and `src/lib/supabase/` passes no override. This was confirmed from the installed source; the live `Set-Cookie` header is still unverified.
  - So any script running on this origin can read an admin's session.
  - That's why an in-origin script sink outranks defacement here.

*Amended 2026-10-04 (T-026 CSO review; appended, rows above left as written):*
- **Admin surface.** `/admin/products` is a new admin route, behind the same middleware gate (49 anonymous probes, all gated). `src/lib/settings-read.ts` is a server-only editor read; it is not an endpoint.
- **Server Actions.** There are now 34 public exports: `saveCategories` and `saveWhatWeDoText` are new. Both check the session before any table access.
- **The shared `site_settings[key='business']` row** has one writer per field.
  - `saveCategories` writes the categories; `saveWhatWeDoText` and the seed write the 4 text fields.
  - Writes go through a compare-and-swap on `updated_at` that fails closed. How that behaves under the live `site_settings` RLS, which isn't in the repo, is SEC-INFO-38, pending the owner's SQL check.
  - `updateSettings` refuses `business`.
- **Slugs.** `normalizeProducts()` now hands every slug sink only `[a-z0-9-]` slugs, which closes SEC-INFO-19 in code.

*Amended 2026-10-05 (T-016 CSO review; appended, rows above left as written):*
- **Product writes.** `updateCategoryProduct` is now a partial update.
  - It writes only the name, description and image the caller sends, and only own properties holding strings.
  - It never writes `category_slug` or `sort_order`.
  - Its category check runs on the stored slug.
- **The product rule.** On both create and update, the server requires a name and an image with a visible character (`hasVisibleText`).
- **The product read** (`getAllCategoryProducts`) returns `{ ok: true, byCategory: Map } | { ok: false }`, and `ok: false` carries no error text.
  - Visitors see a failed read as an empty catalog (Coming Soon), logged on the server.
  - `/admin/products` fails closed.
  - Every per-category lookup, on the server and in the editor, goes through a `Map`.

*Amended 2026-10-06 (Wave 1 CSO review, T-033 + T-032; appended, rows above left as written):*
- **Settings writes.** `updateSettings` now writes only six rows: `homepage`, `who_we_are`, `who_we_work_with`, `sustainability`, `contact` and `general`. They're matched exactly against a hand-written private `Set`.
  - The check runs after `getUser()` and after `business`'s BUSINESS_MOVED, and before any table access.
  - It limits which rows a signed-in account can write, not who can write them (SEC-HIGH-2 stands).
- **Product writes.** The category check (`checkCategoryAttachable`) reads through `readSettingsForEditor` and fails closed. A failed read refuses the write with fixed copy (CATEGORY_CHECK_FAILED), never database text.
- **The public catalog.** Product rows are narrowed to `name`, `description` and `image` (`toProductCards`) before any component prop. So no row id, category slug, order or timestamp reaches the page payload, in production or in development (SEC-INFO-36).
- **Slugs.** Read time and save time share one 255-character cut, and the alphabet is unchanged.
  - Every slug that reaches a URL, a link or the sitemap matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is at most 255 characters.
  - A new category whose title has no `a-z` or `0-9` is refused, and a title with no visible character refuses the whole save.
- **Endpoints.** There are still 34 public Server Action exports.
  - 24 of their ids appear in the client bundle: the writes client components import, the three public forms and login.
  - The other 10, every read included, appear in none.

*Amended 2026-10-06 (Wave 2a CSO review, T-018 + T-014; appended, rows above left as written):*
- **Action failures.** A database or storage error in `settings-actions.ts`, `products-actions.ts` or `jobs-actions.ts` now returns one of four fixed messages (`actionFailure`, `src/lib/action-errors.ts`). The server logs a fixed label plus the error object. The helper has no imports and isn't a `"use server"` module, so it isn't an endpoint.
- **Product writes.**
  - Create checks its argument's shape and never reads a caller's `sort_order`: it uses the server-read max + 1, and fails closed if that read fails.
  - Create and update refuse a name over 255 code points.
  - Update and delete refuse an id that isn't a string.
- **Image addresses.** A product's image (on create, and on update when one is sent) and every category's image (`resolveCategoriesForSave`) must pass `isAllowedImageUrl`.
  - **Accepted:** a root path, or an `https:` address with a host and no username or password.
  - **Never accepted:** a backslash, whitespace or a control character.
  - **When:** the rule runs before any database read.
  - **Not covered:** the other image and link fields are unchanged (SEC-INFO-44).
  - **Since `732c67e`:** the rule also refuses any other Unicode `C` character (format, surrogate, private-use or unassigned) and any default-ignorable code point. An absolute address must start with a literal `https://`.

*Amended 2026-10-06 (Wave 2b CSO review, T-013; appended, rows above left as written):*
- **Reorder.** `reorderCategoryProducts` reads the category's rows after the session, argument and category checks, and refuses (REORDER_STALE) any list that isn't exactly the stored ids.
  - It writes only the rows that move, one at a time. Each write is filtered by `id` and `category_slug`, and confirmed by the row it returns. On a failure, it puts the written rows back.
  - It never inserts or upserts, and it writes at most one row per stored product. So a crafted list can't create a row, reach another category, or drive an unbounded write loop.
  - It's still not atomic: SEC-INFO-16's accepted residual, and SEC-INFO-45.

*Amended 2026-10-06 (Wave 3a CSO review, T-019 + T-007; appended, rows above left as written):*
- **File uploads:**
  - `uploadOptimizedImage` now re-checks pixel dimensions on the server and fails closed (SEC-MED-1 closed in code).
  - `addMediaAction` still has no size, type or dimension check (Known Trap #9, kept by the Wave 3 contract). Its storage key now takes only a 1–5 character extension from the file name.
  - `uploadFile` is unchanged.
- **Data deletion (new):** deleting a Media Center item now also removes its Storage file, which is irreversible. That happens only when all of these hold:
  - the row delete has already succeeded;
  - the stored URL is exactly the bucket-root public URL of a name that starts with a letter or digit;
  - no `media_assets`, `products`, `leaders` or `reports` address, and no `site_settings` value, mentions it.
  - Any error or doubt keeps the file. The live DELETE policies are untested by agents (owner row O1).


## 4. Findings (append-only, dated)

### 🔒 CSO Audit — 2026-09-26 — bootstrap + ticket-review:T-002

**Scope:** First-ever `docs/SECURITY.md` pass on this repo (bootstrap) + dispatched focused review of **T-002** ("Show a recommended image size and a non-blocking warning on product image uploads"), branch `feat/T-002-image-size-warning`, **uncommitted working tree**. Diffed against `main`: `src/lib/upload-limits.ts`, `src/components/admin/ImageUploadField.tsx`, `docs/ROADMAP.md` (checkbox flip only). Confirmed via `git diff main --stat` that no other file changed — specifically `src/app/actions/media-actions.ts`, `package.json`, and `package-lock.json` are all byte-identical to `main`.

**T-002-specific findings — all informational, all cleared:**

- 🟢 **SEC-INFO-1** — Hard-block sequence is byte-for-byte preserved. Old code: `wrongType(file) ?? tooLarge(file) ?? (await tooBig(file))`, one combined check. New code: `wrongType`/`tooLarge` checked first (returns before any file read), then `readDimensions()` (split out of the old `tooBig`, same `Image()` + `URL.createObjectURL` technique, same `onerror` → "could not be read as an image" message), then an explicit `longest > MAX_UPLOAD_DIMENSION` check with the *same* error string as before. Every branch still `return`s before reaching `uploadOptimizedImage`. No fewer checks, no reordering that lets a later check run before an earlier one, no check made conditional on anything new.
- 🟢 **SEC-INFO-2** — The new advisory (`describeSizeAdvisory` / `checkImageSizeAdvisory`) is computed *after* the `MAX_UPLOAD_DIMENSION` check has already passed, and is only ever written to visible state (`setWarning(advisory)`) *inside* the `result.ok` branch — i.e., strictly after the unchanged `uploadOptimizedImage` server call has already succeeded. It cannot short-circuit, replace, or race any hard check, and it never touches the `FormData` sent to the server (`body.set("file", file)` uses the same untouched `file` object as before — images are still never re-encoded client-side).
- 🟢 **SEC-INFO-3** — No new upload path, no server-action change. `uploadOptimizedImage` in `media-actions.ts` is called exactly once, same call shape, same single `file` field. `git diff main -- src/app/actions/media-actions.ts` is empty — the authenticated-session check, the `file.size > MAX_UPLOAD_BYTES` re-check, and the magic-byte `sniffImageFormat` re-check in that server action are all untouched. `addMediaAction` and `uploadFile` (the two other, pre-existing unvalidated upload paths) are not touched by this diff.
- 🟢 **SEC-INFO-4** — No injectable render surface. The only new rendered values are `width`/`height` — numbers straight from `img.naturalWidth`/`naturalHeight` (not attacker-supplied strings) — interpolated into template-literal strings and rendered as ordinary JSX children (`{warning}`, `{advisory}`-derived text), which React escapes automatically. No `dangerouslySetInnerHTML` appears anywhere in the diff or the surrounding file. `file.name` is read only to extract an extension for the (non-security, UX-only) `wrongType` check and is never rendered.
- 🟢 **SEC-INFO-5** — No new dependency. `Info` is one more named import from `lucide-react`, a package already imported in this same file (`ImageUp`, `Loader2`, `TriangleAlert`). `package.json` / `package-lock.json` diff against `main` is empty.
- 🟢 **SEC-INFO-6** — `npx tsc --noEmit` on the current working tree (including this diff) completes clean, zero errors.

**T-002 verdict: ✅ CLEARED.** The refactor is a faithful reorder/split of existing logic; the new warning is genuinely advisory and cannot affect what reaches storage.

**Pre-existing findings surfaced incidentally during this bootstrap pass — none introduced by T-002, none block T-002:**

- 🟠 **SEC-HIGH-1 — Installed Next.js (`16.1.6`) is inside a vulnerable range for a large rolled-up advisory set, including two CVEs GitHub/npm label critical.** `npm audit --omit=dev` reports `next` range `9.3.4-canary.0 - 16.3.2` (installed: `16.1.6`) as **critical** per the registry's own rollup, bundling ~30 advisories. Two are independently labeled critical by GitHub: unauthenticated RCE via the Image Optimization API when AVIF files are processed (`GHSA-2xp9-vwfh-vxw4`) and unauthenticated RCE on Windows-hosted servers (`GHSA-p293-qw3h-jr36`). **Contextualized for this app** (why I'm grading 🟠 High rather than passing through the raw 🔴 critical label unmodified): hosting is Vercel/Linux (`docs/TECH_STACK.md`) so the Windows-RCE precondition doesn't hold here; `next.config.ts` sets no `images.remotePatterns` and the only `next/image` usage in the tree is one local static PNG logo (`docs/TECH_STACK.md`), so there's no evident path for an attacker to get an AVIF file processed by `/_next/image` today. What *does* remain directly reachable: `GHSA-mq59-m269-xvcx` ("null origin can bypass Server Actions CSRF checks") — and this app's *entire* mutation layer, including `uploadOptimizedImage` itself, is Server Actions with no separate CSRF middleware (`docs/TECH_STACK.md`: "Server Actions… not a separate API layer, for all CMS mutations"). Several high-severity DoS and middleware-bypass advisories in the same bundle are also plausibly reachable. **Fix is essentially free:** `npm view next dist-tags.latest` → `16.3.6`, which already satisfies the existing `package.json` range `^16.1.6` — this is a lockfile-only bump (`npm update next` / reinstall), not a semver-range or major-version change, and does not require `/architect` to approve a *different* package, only to sign off the version bump per the standard flow. **Action:** file a ticket now via `/pm` — sequence `/architect` (confirm the bump, re-run `npm audit --omit=dev` to confirm clean) → `/lead-dev` → `/qa` → `/cso review` — before the next production deploy. Does **not** block T-002's local merge (T-002 touches no dependency; local merge ≠ deploy per `docs/WORKFLOW.md` §6); **does** block the next `deploy` (push) until patched or explicitly risk-accepted by the user.
- 🟡 **SEC-MED-1 — `MAX_UPLOAD_DIMENSION` (2400 px) is enforced client-side only.** `uploadOptimizedImage` (unchanged by T-002) re-checks byte size and format via magic-byte sniff, but never reads pixel dimensions — the file's own code comment (predates this diff) says so explicitly: *"Measured in the browser only; the server cannot cheaply read dimensions."* Any authenticated admin session that calls the server action directly (devtools `fetch`, or `curl` with a valid session cookie), skipping `ImageUploadField`'s browser check entirely, can store a file that is small in bytes but has extreme pixel dimensions (a "pixel-bomb" — high compression ratio, e.g. a mostly-flat-color WebP at 20000×20000 could clear 400 KB easily). Impact is bounded: the site renders all uploaded images via plain `<img>` (never `next/image`, per `docs/TECH_STACK.md`), so the blast radius is client-side decode cost/memory for site visitors wherever that image is placed, not a server-side exploit. Not introduced by T-002 (confirmed: `media-actions.ts` diff against `main` is empty). **Mitigation:** parse width/height straight from the WebP (`VP8`/`VP8L`/`VP8X` chunk) or JPEG (`SOF0`/`SOF2` marker) header bytes already sniffed in `sniffImageFormat` — no new image-processing dependency needed — and reject before the storage write. File as a follow-up ticket; does not block T-002.
- 🟡 **SEC-MED-2 — No CSP, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` anywhere on the live site**, including `/admin/login`. Verified this pass: `curl -sI` against production `/` and `/admin/login` returned only `strict-transport-security: max-age=63072000` (present, but missing `includeSubDomains`) and framework/server headers — no CSP, XFO, XCTO, Referrer-Policy, or Permissions-Policy. `next.config.ts` defines only `redirects()` — no `headers()` block exists in source, so this isn't a live/staging drift, it's simply never been configured. `X-Powered-By: Next.js` is also emitted (framework fingerprinting; `poweredByHeader: false` is not set). Most notable single item: `/admin/login` — the one page where a click matters most — has no clickjacking defense (`X-Frame-Options` / `frame-ancestors`). Pre-existing, sitewide, unrelated to T-002. **Mitigation:** add a `headers()` block in `next.config.ts` (or middleware) — CSP (nonce-based; consider report-only first given zero prior baseline), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`, `includeSubDomains` on the existing HSTS, and `poweredByHeader: false`. File as a follow-up ticket via `/pm` — `/architect` (config) → `/lead-dev` → `/cso review` (it's on my jurisdiction list) → `/qa`.
- 🟢 **SEC-INFO-7** — Admin-login rate-limit/lockout is not confirmed in source (`auth-actions.ts` not re-read line-by-line this pass beyond what `docs/MEMORY_BANK.md` already describes). Not a T-002 concern. Tracked as an open verify item for the next full `/cso audit`, not filed as a standalone ticket yet.

**Secrets hygiene (this pass):** `grep -rEn` for common secret shapes (`ghp_…`, `gho_…`, `sk_live_…`, `AKIA…`, hardcoded `password = "…"`, `SUPABASE_SERVICE_ROLE`) across tracked source, excluding `node_modules`/`.git`/`.next`, returned **zero hits**. `git log --all --full-history` for `.env`/`.env.local`/`.env.production`/`*.pem`/`*.key`/`cookies.txt` returned **zero history** — none of those filenames were ever committed. No service-role key reference found anywhere in `src/`. The known GitHub token in local, untracked `.git/config` reported to the user separately is intentionally **not** re-examined or re-reported here, per this review's explicit scope instruction.

**Dependency audit (this pass):** `npm audit --omit=dev` — 13 advisories total across the tree; the `next` finding is written up as SEC-HIGH-1 above. Also flagged in the same run, all **transitive**, all lower priority than SEC-HIGH-1 and batched rather than immediately ticketed per the Medium-batching rule: `sharp` (pulled in by `next` itself, for the Image Optimization route — this app's only `next/image` use is one local static logo, so exposure is minimal but the transitive fix rides along with the `next` bump above), `postcss`, `picomatch`, `postcss-selector-parser`, `@babel/core`, `browserslist`, `js-yaml`, `nanoid`, `brace-expansion`, `flatted`, `@humanfs/node`, `baseline-browser-mapping` — all dev-toolchain-adjacent or transitive-of-`next`, no direct production code depends on any of them, `npm audit fix` is expected to resolve most once `next` itself is bumped (re-run the audit after that ticket lands, don't hand-patch each one individually first).

**Overall verdict this pass:** ✅ **T-002 cleared.** ⚠️ **Two pre-existing tickets to file** (SEC-MED-1, SEC-MED-2) — no deploy block from either. 🛑 **One pre-existing standing item blocks the *next* production deploy regardless of ticket** (SEC-HIGH-1) until patched or explicitly risk-accepted by the user — this is independent of T-002 and does not block T-002's local merge.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-001

**Scope:** Dispatched focused review of **T-001** ("Design the products-within-category schema and author the migration"), branch `feat/T-001-products-within-category`, rebased onto current `main`. Diffed against `main` (`git diff main --stat`): 5 files — `db/migrations/0001_products-within-category.sql` (new, now `STATUS: APPLIED 2026-09-27` — the user applied it by hand on the client's live Supabase database, confirmed in the dispatch), `supabase-schema.sql` (rolled-up snapshot updated to match), `docs/TECH_STACK.md` (decision record), and, uncommitted in the working tree, `src/lib/site-content.ts` (new `CategoryProduct` type, `slugify()`, `dedupeSlug()`, `normalizeProducts()` slug handling) and `docs/ROADMAP.md` (checkbox only). `package.json`/`package-lock.json`/`.env.example` are all byte-identical to `main` — confirmed by explicit `git diff main -- package.json package-lock.json` (empty) and a direct read of `.env.example` (unchanged, still pre-existing-stale per `docs/MEMORY_BANK.md` Known Trap #11).

**T-001-specific findings — cleared, informational:**

- 🟢 **SEC-INFO-8** — Migration is genuinely idempotent and non-destructive, as claimed in its own header. `CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS` (native Postgres idempotency); the two `CREATE POLICY` statements are each wrapped in a `DO $$ ... IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE ...) THEN CREATE POLICY ... END IF; END $$` guard, correctly working around Postgres having no `CREATE POLICY IF NOT EXISTS`; the two `GRANT` statements need no guard (natively idempotent — re-granting an already-held privilege is a no-op, never an error). Zero `DROP`, zero destructive `ALTER`, and no pre-existing table/column/row is referenced or touched anywhere in the file — the only pre-existing object even mentioned is a read-only `SELECT` against `site_settings` in the file's own verification block (queries 1–6), which is inert. Safe as already run once against production, and safe to re-run.
- 🟢 **SEC-INFO-9** — RLS + GRANT design is least-privilege for this table's actual requirement and matches established precedent exactly. `anon`: `SELECT` only, `USING (true)` — deliberate, not an oversight: unlike `jobs` (`is_active`) or `reports` (`published`), nothing in `docs/VISION.md`'s MVP scope or T-003/T-004's acceptance criteria (`docs/ROADMAP.md`) describes a draft/unpublished product state, so there is no narrower condition to write. `authenticated`: `ALL`, `USING (true) WITH CHECK (true)` — byte-for-byte the same shape as the already-audited `jobs` table policy (`supabase-schema.sql` line 29), the codebase's existing precedent for this exact per-row-CRUD shape. No `service_role` grant — re-confirmed by grep this pass (scoped to this ticket's 5 changed files) that no service-role key or grant reference exists beyond commentary ruling it out.
- 🟢 **SEC-INFO-10** — Explicit `GRANT` statements (added as a same-day follow-up, per `docs/TECH_STACK.md`) are the correct mitigation for the documented 2026-10-30 platform-wide enforcement of Supabase's "automatically expose new tables" default-privilege deprecation, scoped to exactly what the RLS policies already intend. First table in the schema to state its grants outright rather than relying on the (soon-to-be-atypical) project-default auto-grant; the other five pre-existing tables are unaffected by the deadline (`ALTER DEFAULT PRIVILEGES` is create-time-only) but remain implicit — already flagged in `docs/TECH_STACK.md` as a candidate low-priority follow-up, not re-opened here.
- 🟢 **SEC-INFO-11** — No secret, no new dependency, no new env var. `git diff main -- package.json package-lock.json` is empty. `.env.example` is unchanged (still describes the site as static/no-backend — pre-existing staleness, Known Trap #11 — not worsened by this ticket). Targeted secret-shape grep (`ghp_…`, `sk_live_…`, `AKIA…`, `SUPABASE_SERVICE_ROLE`, `service_role`, hardcoded `password = "…"`) against exactly this ticket's 5 changed files returned only three hits, all inside `docs/TECH_STACK.md` / the migration's own header comments *explaining that no service_role grant was made* — the string `service_role` appears only in prose ruling it out, never as a credential or a grant target.
- 🟢 **SEC-INFO-12** — `slugify()` (`src/lib/site-content.ts`) is a pure function whose output is provably confined to `[a-z0-9-]` (lowercase, collapse-to-hyphen, trim, empty-input fallback `"category"`) — any value it produces is inherently safe to place in a URL segment, a `revalidatePath` target, or a sitemap entry. Not itself where risk enters (see SEC-MED-4 below).
- 🟢 **SEC-INFO-13** — `npx tsc --noEmit` on the current working tree (including the uncommitted `site-content.ts` diff) completes clean, zero errors.
- 🟢 **SEC-INFO-14** — `docs/WORKFLOW.md` §5/§7 schema hard-stop is satisfied: migration header reads `STATUS: APPLIED 2026-09-27`; dispatch confirms the user ran it by hand against the client's live Supabase database; branch history shows a dedicated `96b6010 chore(db): mark migration 0001 applied` commit consistent with that confirmation. No code depending on this schema has been `/qa live`-verified yet — correctly still pending, per that same gate.

**Findings requiring action:**

- 🟠 **SEC-HIGH-2 — "`authenticated`" on this project means literally any Supabase-signed-up identity, and that trust boundary now backs two tables' worth of full CRUD (soon to be the whole schema) — its safety depends entirely on a project-level Dashboard toggle this review cannot verify.** No self-serve signup path exists in this app's own code (`src/app/actions/auth-actions.ts` exports only `loginAction`/`logoutAction`; grep for `signUp`/`sign-up`/`createUser` across `src/` returns zero hits). But Supabase Auth is a full backend service reachable directly with the public anon key — which every visitor already holds, by design, as `NEXT_PUBLIC_SUPABASE_ANON_KEY` — independent of this app's UI or server actions entirely. If the client's Supabase project has **Authentication → Settings → "Allow new users to sign up"** (wording varies by dashboard version) turned on, anyone on the internet can call Supabase's own signup endpoint directly, obtain a valid `authenticated`-role session, and then exercise every `USING (true) WITH CHECK (true)` policy in this schema as if they were the client's own admin — no app credential, no admin dashboard access, needed. **Not new risk introduced by T-001** — the identical shape of exposure has existed since the `jobs` table's `FOR ALL TO authenticated USING (true) WITH CHECK (true)` policy was first written (pre-existing, already in `supabase-schema.sql` before this ticket), and per `docs/MEMORY_BANK.md` Known Trap #12 the live database "almost certainly" carries hand-added `authenticated` policies of the same permissive shape on the other five tables too (`submissions`, `media_assets`, `site_settings`, `reports`, `leaders`) — meaning if the toggle is on, the blast radius plausibly already extends to every table in this schema, not just `products`. T-001 is simply the first ticket to extend the identical, already-standing assumption to a new table with full CSO visibility, which is why this is the right moment to name it outright. **Impact if the precondition holds:** defacement of every public-facing CMS surface (products, jobs, homepage/business/sustainability copy via `site_settings`), deletion of `reports`/`leaders`/`media_assets` rows, and — if `submissions`' live `authenticated` policy also grants `SELECT` (unconfirmed, same Known Trap) — exposure of contact/career/grievance submitter PII (name, email, phone, message text). **What the user must check, today, independent of this ticket's merge status:** in the Supabase Dashboard, Authentication → Settings (or Authentication → Providers, depending on version) — confirm "Allow new users to sign up" (or the equivalent email-signup toggle) is **off**. If already off, this finding is moot and the current design (including T-001's new policy) is correctly least-privilege for this app's binary anon/admin threat model — no code change needed. If **on**: treat as live, active exposure right now (not a "next deploy" item) — turn it off immediately (zero code/deploy required), then audit every `authenticated`-ALL table per the new runbook item in §7 below. **Does not block T-001's local merge** (pre-existing/systemic, not a T-001 regression) — **does** block the next production deploy pending the user's explicit confirmation, logged in §5.
- 🟡 **SEC-MED-3 — `normalizeProducts()`'s dedupe logic protects a freshly-*computed* slug against collision with anything already seen, but never checks two already-*stored* slugs against each other.** (`src/lib/site-content.ts`, the `normalizeProducts` object branch.) The relevant line: `const slug = storedSlug || dedupeSlug(slugify(title), seen);` — `dedupeSlug` is only ever invoked on the right-hand side of that `||`, so whenever `storedSlug` is truthy it is used exactly as-is and only *added to* `seen` afterward, never *checked against* it first. If `site_settings.business.products` ever contains two category objects that already carry the identical stored `slug` string (possible today only via manual dashboard/SQL editing, since no shipped write path sets this field yet — see SEC-MED-4; decision (b) in `docs/TECH_STACK.md` promises this is "REJECTED outright... never silently suffixed or overwritten" once T-003 exists), this function — whose own surrounding comments claim exactly this protection — returns **both** categories carrying the same slug, with no error, no log, no visible signal anywhere. Downstream (T-005), whichever category a `.find(c => c.slug === params.category)`-style lookup resolves first would render at `/what-we-do/<slug>`; the other category's products silently vanish from the public site behind a URL that looks like it should show them. **Not exploitable via any live path today** — confirmed this pass that `normalizeProducts` is already wired into both `/what-we-do` (public) and `/admin/business` (`grep -rn normalizeProducts src/`), but the only data it has ever run against is the hand-picked, unique seed slugs in `supabase-schema.sql`, and no shipped code writes a `slug` field yet. This is a latent defect in code landing in *this* diff, not a hypothetical for a future ticket. **Concrete, minimal fix:** route the stored branch through the same `dedupeSlug(storedSlug, seen)` call instead of bypassing it — `dedupeSlug` already no-ops and returns its input unchanged when there's no collision, so this is backward-compatible for every non-colliding row that exists today. Flag to `/lead-dev` as a fast-follow on this same file; does not block T-001.
- 🟡 **SEC-MED-4 — A stored category `slug` is trusted verbatim by `normalizeProducts()` with zero character-class or length validation, and T-003 (not yet built) is the only place that can close this before it reaches T-005's public consumption.** `typeof row.slug === "string" ? row.slug.trim() : ""` is the entire validation — any non-empty string survives, unbounded in length, unrestricted in character set (could contain `/`, `..`, whitespace, control characters, or arbitrary Unicode). Zero live exploit path today — no UI exposes a `slug` field yet (the existing `ObjectListEditor` is explicitly unmodified per decision (a) in `docs/TECH_STACK.md`) — but this is exactly the contract T-003 and T-005 (`docs/ROADMAP.md`) inherit, and neither ticket's current acceptance criteria says so explicitly. Concrete asks, for the record ahead of those tickets starting: **T-003** (the only write path that will ever set a fresh `slug`) must (a) derive every newly-assigned slug through `slugify()` — never accept a client-supplied slug string directly — so nothing enters storage outside that function's proven-safe `[a-z0-9-]` output; (b) enforce the "reject entire save on collision" rule decision (b) already promises, not yet implemented anywhere in shipped code; (c) cap length to 255 to match `products.category_slug VARCHAR(255)` (`db/migrations/0001_products-within-category.sql`) so a category can never be saved with a slug that would then make every product-row insert against it fail with a Postgres "value too long" error. **T-005** (public consumption) should still treat `category.slug` as untrusted when constructing `revalidatePath` targets and `src/app/sitemap.ts` entries even after T-003 ships — both because legacy rows could predate T-003's stricter guard, and because `normalizeProducts()`'s own fallback (this diff) imposes no format constraint on a stored value it accepts — by matching the incoming URL's dynamic-route param against the *normalized* `slug` via exact string equality (never using either as a raw path-construction input) and using Next.js's typed `MetadataRoute.Sitemap` return shape (which Next.js itself serializes/escapes) rather than hand-built XML/HTML strings for canonical/OpenGraph tags. Recommend `/pm` fold both as explicit acceptance-criteria bullets into the existing T-003/T-005 entries in `docs/ROADMAP.md` rather than spawning parallel tickets that could drift out of sync with those tickets' own sequencing.

**Overall verdict this pass:** ✅ **T-001 cleared for local merge.** Schema/migration half: clean, idempotent, correctly least-privilege, matches precedent. Types half: two 🟡 Medium fast-follow items on `normalizeProducts()` (SEC-MED-3, SEC-MED-4) — recommend folding into T-003/T-005's acceptance criteria via `/pm` rather than blocking this ticket. 🟠 **One new standing item (SEC-HIGH-2) requires the user to check a Supabase Dashboard setting** — not blocking T-001's local merge (pre-existing/systemic, not a T-001 regression), but blocking the next production deploy until confirmed, exactly like the still-open SEC-HIGH-1. **SEC-HIGH-1 (Next.js CVE, 2026-09-26 entry above) remains open and unresolved** — this pass's empty `package.json`/`package-lock.json` diff confirms no dependency bump has landed since — so the next production deploy is presently blocked by **two independent open High findings**, not one; both must clear first.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-003

**Scope:** Dispatched focused review of **T-003** ("Build the products-within-category data layer, including the category delete-guard"), branch `feat/T-003-category-products-data-layer`, **uncommitted working tree**. `git diff main --stat`: 3 tracked files (`docs/ROADMAP.md` — checkbox only, `src/app/actions/settings-actions.ts`, `src/lib/site-content.ts`) plus one new untracked file, `src/app/actions/products-actions.ts`. `git diff main -- db/migrations/ supabase-schema.sql src/middleware.ts src/lib/supabase/` is empty — confirmed independently, not taken on the ticket's own "schema-touching: no" flag alone: no RLS/GRANT/auth/middleware file is touched. `package.json`/`package-lock.json` untouched. No `.env*` touched. `npx tsc --noEmit` re-run this pass: clean, exit 0. **No write was issued against the live database by this review** — every check below is a static read of the diff, the full files it lives in, and their real callers — not taken on the ticket's own code comments' word alone.

**Files reviewed:** `src/app/actions/products-actions.ts` (new, full read, all 219 lines), `src/app/actions/settings-actions.ts` (diff + full 324-line file), `src/lib/site-content.ts` (diff — `resolveCategoriesForSave`, `normalizeProducts`, `slugify`, `dedupeSlug`, `CategoryProduct`, `CategoryProductInput`), `db/migrations/0001_products-within-category.sql` (DDL re-read directly from source, not from `docs/QA_REPORT.md`'s quotes of it), `src/app/admin/(dashboard)/business/BusinessClient.tsx`, `src/components/admin/SettingsForm.tsx` (`ObjectListEditor`'s `update`/`move`/`blank`), the other six settings-page clients (`WhoWeWorkWithClient.tsx`, `ContactSettingsClient.tsx`, `HomepageSettingsClient.tsx`, `SustainabilityClient.tsx`, `WhoWeAreClient.tsx`) — checked for try/catch around `updateSettings` and confirmed there is none, in any of the seven — and `src/app/actions/form-actions.ts` (confirmed zero reference to `updateSettings`; the three public contact/career/grievance forms cannot reach this write path). `src/app/actions/media-actions.ts` re-read to confirm the `getUser()` pattern this ticket's own comments cite as precedent is real (`media-actions.ts:43-45`). Confirmed by `find` that no `error.tsx` / `global-error.tsx` exists anywhere under `src/app` — relevant to the error-surfacing finding below.

**Authorization — cleared, and confirmed to actually matter, not just present.** All five write actions this ticket adds or touches call `supabase.auth.getUser()` — never `getSession()`, which would only decode the cookie without round-tripping to Supabase Auth to validate it — and return/throw before any read or write against `products` or `site_settings` if no user is present: `updateSettings` (`settings-actions.ts:51-54`), `createCategoryProduct` / `updateCategoryProduct` / `deleteCategoryProduct` / `reorderCategoryProducts` (all via the shared `requireUser()` helper, `products-actions.ts:34-39`, called as the first line of every function body, before `getValidCategorySlugs()` or any table access). This is the right control, not a redundant one: Next.js Server Actions are invoked by POSTing the action's own ID and are not bound to the route that defines them — `src/middleware.ts`'s `/admin/*` matcher is a page-level, browser-navigation redirect, not a boundary the action itself inherits, so an in-action `getUser()` check is load-bearing here, not belt-and-suspenders. `getCategoryProducts` (the one read function) correctly has **no** auth check, matching "reads stay public" and the table's own pre-existing `anon` SELECT policy. Confirmed by grep that all seven real call sites of `updateSettings` live under `src/app/admin/(dashboard)/**` and that `form-actions.ts` never references it — nothing public reaches this action.

**Direct answer to the dispatch's question — does `resolveCategoriesForSave` + the delete guard close SEC-MED-3/4 and QA WARN-1/2?** Mostly yes, with one real gap (SEC-HIGH-3 below) the existing findings didn't anticipate because it isn't a *collision* at all:
- **"Frozen slugs honoured only when already stored" (SEC-MED-4(a)):** ✅ — `incomingSlug && existingStoredSlugs.has(incomingSlug)` (`site-content.ts:494-496`) never accepts a client-supplied slug on its own say-so; it must independently match a slug this same pass just re-read fresh from the DB. Verified this is not a rubber-stamp: on the very first save after this ticket deploys, `existingStoredSlugs` is empty (QA's T-001 Live Pass confirmed zero live categories carry a stored slug today), so every category's client-echoed `.slug` (attached in memory by `normalizeProducts()` at page load) is **re-derived fresh via `slugify()`, not trusted**, even though it happens to produce an identical string for the happy path.
- **"Collisions reject the whole save regardless of order" (SEC-MED-3, WARN-1):** ✅ closed, including for a duplicate that is *already* sitting silently in storage today with nothing else touching it: `resolveCategoriesForSave` re-validates the **entire** array every single save in one unified pass (`seenSlugs`, checked against every resolved slug, carried or fresh, `site-content.ts:503-511`) — re-traced QA's own Order-A/Order-B repro against this code and confirmed the second item to resolve to a given slug is rejected in both orders, with a named-category error, never a silent suffix. **This also means a pre-existing stored-vs-stored duplicate would surface and block on the very next `/admin/business` save of any kind**, not only one that touches the colliding rows.
- **"Fresh slugs capped at 255" (SEC-MED-4(c)):** ✅ — `slugify(title).slice(0, 255)` (`site-content.ts:496`), matching `category_slug VARCHAR(255)` (re-read directly, `db/migrations/0001_products-within-category.sql:105`).
- **"`revalidatePath` built only from validated slugs" (SEC-MED-4, T-005-forward note):** ✅ for this ticket's own calls — `settings-actions.ts:154-158` iterates `savedCategories`, the *output* of `resolveCategoriesForSave`, never raw client input; `products-actions.ts`'s `revalidateCategory()` (`:53-56`) is only ever called with a slug that already passed `getValidCategorySlugs().has(...)` in every one of its callers.
- **WARN-2 (pre-existing Save button can freeze an unvalidated slug before T-003 exists):** ✅ addressed — every already-stored slug is re-validated for collisions on every save (above), not exempted just because it predates this ticket.
- **The gap neither SEC-MED-3 nor WARN-1 anticipated, because it doesn't produce a collision:** see SEC-HIGH-3.

- 🟠 **SEC-HIGH-3 — A crafted save can reassign an existing category's frozen slug to a *different* surviving category, in the same save that drops the original — this evades both the collision check and the delete guard, letting a category with products vanish with zero error.** `resolveCategoriesForSave`'s slug-trust test (`site-content.ts:494-496`) is bare set-membership — `existingStoredSlugs.has(incomingSlug)` — with no binding to *which* title originally owned that slug (the `titleByStoredSlug` map `updateSettings` builds at `settings-actions.ts:87` for the guard's error message is never passed into or consulted by `resolveCategoriesForSave`). Concretely: given two real stored categories, "T-Shirts" (`slug: "t-shirts"`, has products) and "Polo Shirts" (`slug: "polo-shirts"`, has zero products today), a single hand-crafted `updateSettings("business", …)` call that (a) omits "T-Shirts" entirely from `products` and (b) sends "Polo Shirts"'s item with `slug: "t-shirts"` instead of its own — resolves cleanly: no collision (the victim isn't present to collide with), so `resolveCategoriesForSave` returns `ok: true` with Polo Shirts now claiming `t-shirts`. The delete guard then computes `removedSlugs = existingStoredSlugs \ incomingSlugs` (`settings-actions.ts:107-108`) — and `"t-shirts"` is **still present** in `incomingSlugs` (just under the wrong title now), so it never appears as removed; only `"polo-shirts"` does, and since Polo Shirts has zero products, the count check (`settings-actions.ts:111-114`) finds nothing and the guard never fires. Net result: "T-Shirts" silently disappears from `site_settings.business.products` — with its products still sitting in `public.products` under `category_slug = 't-shirts'`, now mislabeled as "Polo Shirts" the moment any page reads that slug — while the guard this ticket exists to add never saw a removal to check, because the string `"t-shirts"` never left the incoming set. **Not reachable via the shipped browser UI**: traced `ObjectListEditor` end to end (`SettingsForm.tsx:146-158`) — `update()` only ever overwrites `title`/`description`/`image` on an item, never `slug`; `move()` swaps whole objects, so a slug always travels with its own item; `blank()` (the "Add" button) creates an item with no `slug` key at all. `slug` has no editable field anywhere. This requires an authenticated session invoking the Server Action directly (devtools `fetch`, or `curl` with a valid session cookie), bypassing the UI entirely — the same precondition class already named in SEC-HIGH-2, and if that toggle is ever found on, this stops being "trusted-insider-only" and becomes exploitable by any self-registered identity. **Mitigation:** don't trust bare slug-string membership — require the incoming item's slug to match what *this specific stored item* already had. Since categories have no separate immutable ID (decision (b), T-001) and title is intentionally mutable across a rename, the safest fix is for `updateSettings` to pass `titleByStoredSlug` (already computed) into `resolveCategoriesForSave` and refuse — reject the whole save, don't silently re-derive — whenever an incoming item's `title` doesn't match the title on record for the slug it's claiming, *unless* that title is itself absent from every other incoming item too (i.e., distinguishing a genuine rename of the *same* row from a slug being donated to a *different* one is the actual problem to solve; a pure title-equality check alone will reject legitimate renames, so this needs `/architect`'s or `/lead-dev`'s design attention, not a one-line patch). Recommend `/pm` file this now rather than fold it silently into T-004, since it's a defect in T-003's own file, not an admin-UI gap.

- 🟠 **SEC-HIGH-4 — `updateSettings`'s guard failures are thrown, nothing catches them anywhere in the client chain, and Next.js redacts thrown Server Action error messages in production — so the delete guard, the collision guard, and the new auth check all fail *silently* the moment this ships to production, and T-004 cannot meet its own acceptance criteria against `updateSettings`'s current contract no matter how it's built.** Traced the full chain: `updateSettings` throws plain `Error`s for every new guard (`settings-actions.ts:54,72,101,116,121,133`). `BusinessClient.tsx:22-24`'s `save()` does `startTransition(async () => { await updateSettings(...); })` with no `try`/`catch` — and independently confirmed **none of the other six settings-page clients catch it either** (grepped all six; zero `try`/`catch` in any). `SettingsHeader` (`SettingsForm.tsx:11-27`) has no error prop and no error-rendering path at all — only a `saving` boolean that flips a spinner. No `error.tsx`/`global-error.tsx` exists anywhere in `src/app` to catch it at a higher level either. So today, for every one of the seven settings pages, a thrown `updateSettings` error becomes an **unhandled promise rejection** inside a `startTransition` callback: `isPending` still clears (the transition settles either way), the Save button re-enables, and the admin sees **nothing** — no error text, no toast, no indication the save didn't happen. **This is materially worse in production than in local dev**, and that asymmetry is the reason this is High rather than a plain UX nit: Next.js redacts a thrown Server Action's real message in production builds, replacing it with a generic one — but `npm run dev` (what `/qa live` tests against, per `docs/WORKFLOW.md` §4/§7 — there is no staging DB, no separate test environment) shows the real message in the dev overlay. **A bug class that is invisible to this project's entire existing test path (no unit runner, `/qa live` only ever runs against `npm run dev`) and only manifests for real users after a real deploy.** Concretely, for T-003/T-004: `docs/ROADMAP.md` T-004 explicitly requires "Attempting to delete a category that still has ≥1 product shows T-003's 'remove its products first' message in the admin UI itself — not a silent failure, not a generic error" — as written today, **T-004 cannot satisfy this against `updateSettings`'s current throw-based contract in production**, regardless of how carefully `/lead-dev` builds T-004's UI, because the specific string `updateSettings` throws never survives to reach any `catch (e) { e.message }` in production. Beyond the delete-guard message specifically: because ALL of `updateSettings`'s new guards throw before the `site_settings` upsert runs, a routine, unrelated edit (e.g., fixing a typo in one category's description) bundled into the same save as a rejected collision/delete-guard trip is **also** silently discarded in its entirety, with no warning that the admin's actual edit never persisted. **Mitigation:** `updateSettings` should return a `{ok, error}`-shaped result for its known/expected failure modes (not-authenticated, collision, delete-guard) — the same pattern `products-actions.ts`'s four new functions already correctly use — rather than throwing, and every settings-page client needs to actually read and display that result. Recommend `/pm` treat this as a blocking prerequisite for T-004 specifically (fold into T-004's acceptance criteria, or spin a small T-003.1), not a discretionary fast-follow, since T-004 is unbuildable-to-spec without it.

- 🟡 **SEC-MED-5 — Check-then-write race between the delete guard's product count and the `site_settings` upsert.** `settings-actions.ts:110-127`: the guard `SELECT`s a count against `removedSlugs`, and only if it's zero does the code proceed to `upsert` the new `site_settings.business` value several lines later (`:129-131`) — nothing holds a lock across that gap. A concurrent `createCategoryProduct` call (a different admin, a second tab, or a double-submit) landing a new row against one of `removedSlugs` in that window would not be seen by the count that already ran, and the category-delete would still complete — orphaning the just-inserted product. Bounded by this app's own threat model (a small, hand-created admin roster, not concurrent public traffic) and structurally inherent to decision (c)'s already-accepted "application check; a schema constraint is not possible" (there is no row to lock — categories aren't table rows). Not a regression this ticket could reasonably avoid within its own scope; flagging as a real, if low-probability, window. **Mitigation, if ever prioritized:** move the count-check and the upsert into a single Postgres function (RPC) so both run in one transaction — bigger than this ticket; recommend a fast-follow, not a blocker.

- 🟡 **SEC-MED-6 — `resolveCategoriesForSave` treats a missing or non-array `products` field as "zero categories," not as an error — gated only by the delete guard's product-count, not by input-shape validation.** `site-content.ts:458`: `if (!Array.isArray(raw)) return { ok: true, categories: [] };`. Under the shipped UI this is unreachable — `BusinessClient.tsx` always sends its full, array-typed state — but any direct/malformed call to `updateSettings("business", {...})` that omits or mistypes `products` sails through this check silently and proceeds to the delete guard treating *every* currently-stored category as "removed." If every category currently has zero products (a real, live-current state, and the default state for all eight categories until T-004 ships and staff actually populate them), the guard finds nothing to block and the save **wipes every category's title/description/image from `site_settings.business`**, not just structurally-empty ones. This cuts against the surrounding code's own stated philosophy a few lines up ("fail the whole save closed rather than silently treating every category as brand new," `settings-actions.ts:60-65`) — that philosophy was applied to the existing-row-fetch failure, not to a malformed `products` field. **Mitigation:** have `resolveCategoriesForSave` (or its caller) reject the save outright when `products` is present-but-not-an-array or entirely absent from the payload, rather than silently coercing it to empty.

- 🟡 **SEC-MED-7 — `CategoryProductInput.image` (and the pre-existing category-level `Product.image`) accept any string with no scheme allow-list, and it is rendered as a public `<img src>`.** `products-actions.ts:58-64`, `sanitizeInput()`: `image` is `.trim()`-only, no `http(s)://`/relative-path check. T-004's *planned* UI is expected to only ever populate this via `ImageUploadField` → `uploadOptimizedImage` (per `docs/ROADMAP.md` T-004's own acceptance criteria), so the shipped path is expected to be safe — but exactly as SEC-MED-1 already established for `uploadOptimizedImage` itself, a direct authenticated call to `createCategoryProduct`/`updateCategoryProduct` skips that pipeline entirely and can store any string verbatim. Impact is bounded, not zero: `<img src="javascript:...">` does not execute in modern browsers, and `<img>`-loaded SVG `data:` URIs do not execute embedded scripts either (both browser-enforced, not app-enforced) — but an attacker-controlled `https://` URL still gets rendered site-wide as a tracking pixel / defacement / off-brand content, and this is the **same pre-existing pattern** already accepted for the category-level image field (`resolveCategoriesForSave`, same `.trim()`-only treatment, same eventual `<img src>` render on the live `/what-we-do` page today). Not new risk introduced carelessly, but now a second, independent write path inherits it. **Mitigation:** add a scheme allow-list (`^https?://` or a leading `/`) to `sanitizeInput()`'s `image` handling; low cost, non-blocking.

- 🟢 **SEC-INFO-15 — `name` has no length cap matching `products.name VARCHAR(255)`** (re-read directly, `db/migrations/0001_products-within-category.sql:106`). A name over 255 chars fails at the DB layer with a raw Postgres "value too long" message, returned verbatim via `products-actions.ts`'s typed `{ok: false, error: error.message}` — not a security leak (no secret/internal path in that message), just an unfriendly error. Unlike SEC-HIGH-4, this one *does* reach the caller today, since these four functions return rather than throw. Trivial fast-follow: `name.slice(0, 255)`, matching the pattern `resolveCategoriesForSave` already uses for `slug`.
- 🟢 **SEC-INFO-16 — `reorderCategoryProducts` issues its per-row updates sequentially with no transaction (`products-actions.ts:207-215`); a mid-loop failure leaves some rows at their new `sort_order` and others at their old one.** Cosmetic display-order inconsistency only — no cross-category corruption (every update is still scoped by `.eq("category_slug", slug)`), no data loss, no auth/exposure concern. Self-heals on the next successful full reorder. Not blocking; a single batched update (array of `{id, sort_order}`) would close it if ever prioritized.
- 🟢 **SEC-INFO-17 — `getValidCategorySlugs()` inherits the still-dormant `normalizeProducts()` dedupe-fallback behavior (SEC-MED-3/WARN-1's territory) as a live "is this slug attachable" gate.** Since it calls `normalizeProducts()` (the read-time, auto-suffixing function), a product could be attached today to an auto-suffixed transient slug like `t-shirts-2` for a category whose title collision hasn't been resolved by an actual save yet. If that collision is later fixed via a real save (which goes through `resolveCategoriesForSave`, never `dedupeSlug`), `t-shirts-2` stops being produced by any live category, and the product attached to it would be silently orphaned — same shape as SEC-MED-5, narrower trigger. QA's T-001 Live Pass already confirmed this precondition is dormant in live data today (zero stored slugs, zero collisions). Not blocking; noted for whoever eventually looks at `getValidCategorySlugs()` again.
- 🟢 **SEC-INFO-18 — Confirmed clean/correct, not just asserted:** `category_slug` is validated against the live category list (`getValidCategorySlugs()`) in every mutating function that accepts one — never trusted as a bare client string beyond that existence check. Every `id` passed to `.eq("id", …)` goes through Supabase's parameterized query builder, not string concatenation — no injection surface regardless of format; a malformed id simply yields zero matching rows or a Postgres type-cast error, not a query-shape change. `reorderCategoryProducts` double-filters every update by both `id` **and** `category_slug`, so an id belonging to a different category cannot be reassigned or corrupted. `npx tsc --noEmit` clean.

**Overall verdict this pass:** ✅ **T-003 cleared to proceed to `/qa static` / `/qa live`.** The authorization work is correct and load-bearing (every write gated by `getUser()`, independent of middleware); the collision/dedupe closure the dispatch asked me to verify is real and stronger than SEC-MED-3/WARN-1 required (it re-validates the whole array on every save, not just touched rows). Two 🟠 High findings, both new: **SEC-HIGH-3** (slug-hijack bypass of the delete guard — requires an authenticated session bypassing the shipped UI; not reachable by any sequence of ordinary clicks, but a defect in this ticket's own file, not an admin-UI gap) and **SEC-HIGH-4** (silent failure of every new guard in production specifically, invisible to this project's dev-only test path — **blocks T-004 from being buildable to its own written acceptance criteria** until `updateSettings`'s error contract changes). Neither blocks this ticket's **local** merge (consistent with how SEC-HIGH-1/SEC-HIGH-2 were handled for T-001/T-002 — pre-existing-pattern extensions and UI-unreachable-today gaps, not regressions of already-shipped behavior) — both join SEC-HIGH-1/SEC-HIGH-2 on the list that must clear before the **next production deploy**, and **SEC-HIGH-4 additionally must be resolved before or alongside T-004**, independent of deploy timing, since T-004's own acceptance criteria are unmeetable against `updateSettings`'s current contract. Three 🟡 Medium (SEC-MED-5 TOCTOU race, SEC-MED-6 malformed-input full-wipe path, SEC-MED-7 unvalidated image scheme) — none blocking, all recommended as `/pm` fast-follows. Four 🟢 Info/Low items, three genuinely new (SEC-INFO-15/16/17), one a direct confirmation of items the dispatch asked me to check (SEC-INFO-18). `npx tsc --noEmit` clean. No commit made by this pass; no write issued against the live database.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-003 (re-review after fix)

**Scope:** Dispatched re-review of **T-003**, branch `feat/T-003-category-products-data-layer`, **uncommitted working tree**, following `/architect`'s same-day "Category identity amendment" (decision (d), `docs/TECH_STACK.md`) and its "legacy (id-less) categories" follow-up — both written to close QA's 🔴 CRIT-1 (`docs/QA_REPORT.md`, Static Pass — T-003) and this file's own 🟠 SEC-HIGH-3 at their shared root cause: bare slug-string membership with no record of which category row actually owns a given slug. `git diff main --stat` since my first T-003 pass: `src/lib/site-content.ts` (+`id`, `ExistingCategoryRef`, `isWellFormedSlug`, `randomUUID()`, rewritten `resolveCategoriesForSave`, new `computeRemovedCategories`, new `readStoredCategoryIdentities`), `src/app/actions/settings-actions.ts` (`updateSettings` now builds `existingById` via the new helper and passes it into `resolveCategoriesForSave`; delete-guard now diffs by id, not slug), and `src/app/actions/products-actions.ts` (new `checkCategoryAttachable()` replaces the prior pass's `getValidCategorySlugs()`, gating every write on a genuine stored `id` + well-formed `slug`, not the read-time display fallback). Re-confirmed independently, not taken on the dispatch's word: `git diff main -- db/migrations/ supabase-schema.sql src/middleware.ts src/lib/supabase/ package.json package-lock.json` — empty. No `.env*` touched. No new dependency, no new env var name.

**Method.** Static read of every touched file in full (not just hunks), plus direct execution — loaded the real exported functions (`resolveCategoriesForSave`, `computeRemovedCategories`, `readStoredCategoryIdentities`, `isWellFormedSlug`, `normalizeProducts`) from `src/lib/site-content.ts` via Node 25's native TS type-stripping, the same technique `/qa`'s own T-003 pass used — never a hand-copied reimplementation, zero network/Supabase calls. Ran 43 assertions against synthetic data covering every attack vector the dispatch listed, plus the original SEC-HIGH-3 crafted-payload scenario and QA's CRIT-1 repro, replayed verbatim against the new code. All 43 passed. Nothing committed; the script lived only in the session scratchpad, never in this repo. Also independently re-read `src/components/admin/SettingsForm.tsx`'s `ObjectListEditor` (`update`/`move`/`blank`) and `BusinessClient.tsx`'s `fields` array (`title`/`description`/`image` only) to confirm `id` is genuinely not an editable field and `blank()` genuinely produces an item with no `id` key at all — load-bearing for whether the fix holds through the real shipped UI, not just against crafted payloads. `npx tsc --noEmit` re-run: clean, exit 0. Secret-shape grep (`ghp_…`, `sk_live_…`, `AKIA…`, `SUPABASE_SERVICE_ROLE`, `service_role`, hardcoded `password = "…"`) against exactly this pass's 3 touched source files: zero hits.

**1. SEC-HIGH-3 — ✅ CLOSED.** Confirmed by code inspection and by execution: `resolveCategoriesForSave` (`site-content.ts:490-588`) has zero references to `row.slug` anywhere in its body — an incoming item's own `.slug` field isn't merely distrusted, it is never read at all. Every resolved slug now comes from exactly one of two places: a lookup by `id` into `existingById` (itself re-derived fresh from the live stored row on every call, never from client memory or a prior request), or `slugify(title)` for anything not matched by id. Replayed the original SEC-HIGH-3 scenario (two stored categories, "T-Shirts" with products and "Polo Shirts" with none; payload omits "T-Shirts" and sends "Polo Shirts" with a forged `slug: "t-shirts"` field) in both variants — with Polo Shirts's real id attached, and with no id at all: in both, the forged field is silently discarded, Polo Shirts resolves to its own real slug or a title-derived one, and "T-Shirts" is correctly flagged removed by `computeRemovedCategories`'s id-diff regardless of what string any surviving item's slug happens to be. Ran the dispatch's full attack list against the real functions, all defeated:
  - **Forged ids** (an id nobody ever issued) — falls through to the "new category" branch; fresh id, fresh title-derived slug. No escalation — a forged id cannot borrow another row's slug or identity.
  - **Duplicated ids** (two incoming items both claim the same real, existing id) — `claimedIds.has(incomingId)` catches the second claim and rejects the **whole save** by name (`site-content.ts:536-541`) before either is resolved further.
  - **Reused ids** (an id that belonged to a category already deleted in an earlier save) — `existingById` is rebuilt fresh from the *current* stored row on every single call (`settings-actions.ts:94`, reading `existingProductsRaw` freshly fetched moments earlier at `:72-76`); an id no longer present there is simply not found and the item is treated as brand-new. No state leaks across saves.
  - **A new row supplying an existing id** — this is the intended "rename" path by design: the row becomes that category, keeping its frozen slug regardless of title/description/image changes. Not a bypass — the slug/id still come from the server-side lookup, never from the payload, and it's exactly one existing category being edited, not a second one gaining its identity.
  - **Dropping a category while another row claims its id** — structurally can't co-occur: a given existing id is either claimed by exactly one incoming item (a rename — not a drop) or claimed by zero (a genuine drop, correctly caught by `computeRemovedCategories`'s id-diff). There is no third state where both are true, which is precisely what made the old slug-string-membership version exploitable and makes the new id-based version sound.
  - **Ids on string-array items** — a bare string entry (the legacy shape) can never carry an `incomingId`; the code only reads `row.id` inside the object branch, and `incomingId` stays `""` for every string item, so a legacy string item is always treated as new. Confirmed by execution.
  - **Prototype-ish keys** (`id: "__proto__"`, `id: "constructor"`, a JSON payload with a `__proto__` own-property carrying a nested `id`) — `existingById`/`claimedIds`/`seenSlugs` are all `Map`/`Set`, not plain objects, so there is no prototype-chain lookup to poison; a `"__proto__"` string is just an ordinary, non-matching map key, and `JSON.parse`'s own well-documented special-casing of a literal `"__proto__"` key (it becomes an inert own property, never the object's actual prototype) means it never reaches `row.id` either. Confirmed by execution — no crash, no match, no smuggled identity.

**2. SEC-MED-6 — ✅ CLOSED.** `resolveCategoriesForSave`'s first line is now `if (!Array.isArray(raw)) return { ok:false, error:"Categories must be a list of category objects — refusing to save. Reload the page and try again." }` (`site-content.ts:494-499`) — confirmed by execution against `undefined`, `null`, a plain object, and a string: all four now reject the whole save outright rather than silently coercing to zero categories. The old behavior this replaces (`{ok:true, categories:[]}`) is gone entirely from this function; the delete-guard can no longer be handed an empty resolved set by a malformed payload.

**3. QA WARN-1 — ✅ CLOSED (from this review's jurisdiction; `/qa` should confirm in its own re-run).** Every slug reattached via an id lookup is now gated by `isWellFormedSlug(existing.slug)` (`site-content.ts:548-553`) before reuse — a malformed stored slug tied to a row still being claimed now rejects the whole save by name ("needs a developer to fix its stored data") instead of being carried forward silently. Confirmed by execution: a stored slug containing `/`, `..`, spaces, and 300+ characters, attached to a claimed row, blocks the save. The narrower case WARN-1 also named — a malformed slug on a row that's genuinely being *dropped* — is correctly *not* re-validated for shape (there is nothing to carry forward), and is only ever handed to the delete-guard's `.in("category_slug", removedSlugs)` query (`settings-actions.ts:113`), which is parameterized by the Supabase query builder and therefore safe regardless of the string's content; confirmed by execution that this path resolves without error or crash.

**4. New attachment gate (`checkCategoryAttachable`, `products-actions.ts:47-80`) — sound.** Traced every caller: `createCategoryProduct`, `updateCategoryProduct`, and `reorderCategoryProducts` all call `requireUser(supabase)` and return their auth-failure branch **before** `checkCategoryAttachable` is ever invoked (`products-actions.ts:121-127`, `:151-159`, `:234-241`) — the new gate is strictly additive to the existing auth posture, not a substitute for it, and does not weaken it. It cannot be tricked into approving an unsaved or non-existent category: `attachable: true` requires a category whose `id` is present in `readStoredCategoryIdentities(business.products)` — a value read fresh from `getSettings("business")` (a live Supabase read) on every single call, never cached, never taken from the caller's own input — *and* whose slug passes `isWellFormedSlug`. `createCategoryProduct`/`updateCategoryProduct`/`reorderCategoryProducts` accept only `category_slug`/`name`/`description`/`image`/`sort_order` (`CategoryProductInput`) — there is no field through which a caller could inject or influence what the gate reads about the category's own stored state. Isolated the gate's pure decision logic (the id-lookup + fallback-to-display-fallback shape, independent of the Supabase I/O wrapping it) and ran it against four synthetic `business.products` shapes: a legacy id-less category correctly returns `not_yet_bootstrapped` (never `attachable`); a bootstrapped category (real id + well-formed slug) correctly returns `attachable`; an unrelated slug correctly returns `not_found`; and — the case that matters most for this gate's own soundness — a stored row with an `id` but a **malformed** slug (simulating manual DB corruption) correctly still returns *not* attachable, because `isWellFormedSlug` gates the frozen-match too, not just the fresh-derivation path. The `"not_yet_bootstrapped"` message (`"${title}" hasn't been saved yet under the current system. Open /admin/business and click Save once...`) is safe to show: it is only ever returned to an already-authenticated admin caller (never reachable pre-auth), and the category `title` it names is already fully visible to that same admin on `/admin/business` and to the public on `/what-we-do` — no secret, no internal path, no stack trace, nothing beyond what's already non-confidential. **One TOCTOU note, not a new severity item:** `checkCategoryAttachable`'s read and the subsequent `insert`/`update` on `products` are two separate round trips with nothing holding a lock across the gap, so a concurrent `business` save that deletes the same category in that window is theoretically possible — this is the mirror image of the already-filed **SEC-MED-5** (which named the reverse direction: a concurrent product insert landing inside the delete-guard's own count-check window) and shares its exact accepted rationale (decision (c): no category *row* exists to lock; small, hand-created admin roster, not concurrent public traffic). Recording as an explicit extension of SEC-MED-5's already-open scope rather than a new number.

**5. `randomUUID()` (`site-content.ts:462-464`) — cryptographically appropriate, no finding.** `globalThis.crypto.randomUUID()` is the WHATWG Web Crypto API, backed by the runtime's CSPRNG (the same underlying source Node's `node:crypto` module uses — this is not `Math.random()` and not a weaker substitute) — confirmed present and callable in this project's actual Node runtime this pass (`node --version` → v25.9.0; `typeof globalThis.crypto.randomUUID` → `"function"`). It produces a version-4 UUID with 122 bits of randomness, far more entropy than this use case needs: an internal-only field, never public, never a URL segment, distinguishing at most a few dozen category objects over the project's lifetime — collision risk is not a realistic threat here. Using the Web Crypto global rather than importing `node:crypto` also keeps this file import-free (as it was before) and works identically whether the code ever runs under Node's or an Edge runtime (grepped this pass: no `export const runtime = "edge"` anywhere in the touched files, though the choice is correct either way).

**6. Standing findings — confirmed, not re-opened:**
- **SEC-HIGH-4** — confirmed still open and correctly scoped to T-004, unaffected by this diff. `updateSettings` still throws plain `Error`s for every guard failure, including the three new ones this amendment added (non-array rejection, duplicate-id-claim rejection, malformed-slug rejection) — they inherit the identical silent-failure-in-production problem SEC-HIGH-4 already names, which is why that finding's own text already reads "every one of `updateSettings`'s new guards," not an enumerated list that needs updating. `BusinessClient.tsx` and the other six settings clients are untouched by this diff (confirmed via `git diff main --stat`) — still zero `try`/`catch` anywhere in the chain.
- **SEC-MED-5** — confirmed still stands, mechanism unchanged (the TOCTOU window is between the delete-guard's count query and the `site_settings` upsert; this amendment changed *what* is diffed — id instead of slug — not *whether* a lock exists across that gap). See item 4 above for its new, symmetric sibling window in the attachment gate.
- **SEC-MED-7** — confirmed still stands, untouched by this diff. `sanitizeInput()` (`products-actions.ts:87-94`) is byte-for-byte the same `.trim()`-only handling for `image` as my first T-003 pass reviewed.
- **SEC-HIGH-1** (Next.js CVE bump) and **SEC-HIGH-2** (Supabase Dashboard signup-toggle user-check) — out of this dispatch's scope, untouched by this diff, both still open per §5, both still blocking only the *next production deploy*, not local merge.

**Overall verdict this pass:** ✅ **Both findings this dispatch asked about — SEC-HIGH-3 and SEC-MED-6 — are closed**, and QA's own CRIT-1 (a mechanically related but distinct bug this office does not adjudicate) shares the identical id-based fix and was replayed verbatim against the new code with the same clean result — `/qa` should confirm this in its own `/qa static T-003` re-run before that gate flips in `docs/QA_REPORT.md`; nothing here overrides that separate gate. The new attachment gate in `products-actions.ts` is sound: correctly layered behind existing auth, cannot approve an unsaved or non-existent category, and its one user-facing new message discloses nothing an authenticated admin couldn't already see. `randomUUID()`'s source is cryptographically appropriate. SEC-HIGH-4, SEC-MED-5, and SEC-MED-7 all stand exactly as filed, correctly still scoped away from this ticket. No new 🔴/🟠 finding from this pass. `npx tsc --noEmit` clean. No commit made; no write issued against the live database; nothing left on disk outside the session scratchpad.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-005

**Scope:** Dispatched focused review of **T-005** ("Ship public category detail pages under `/what-we-do`, linked and indexed"), branch `feat/T-005-category-detail-pages`, base `34c4af1`, **entirely uncommitted working tree**. `git diff main --stat`: 4 tracked files, 40 insertions / 6 deletions — `docs/ROADMAP.md` (checkbox only, confirmed by direct diff), `src/app/(website)/(marketing)/what-we-do/page.tsx`, `src/app/actions/settings-actions.ts`, `src/app/sitemap.ts` — plus one new untracked file, `src/app/(website)/(marketing)/what-we-do/[category]/page.tsx` (162 lines, full read). Independently confirmed empty — not taken on the dispatch's word — `git diff main -- src/lib/site-content.ts db/migrations supabase-schema.sql package.json package-lock.json .env.example next.config.ts src/middleware.ts src/lib/supabase/`: zero output. No dependency, no env var, no schema, no auth/session/middleware file touched. This is this pass's explicit brief: SEC-MED-4's T-005 half (folded into T-005's own Acceptance list, `docs/ROADMAP.md` line 45), decision (d) `id`-confidentiality (`docs/TECH_STACK.md`), the new `revalidatePath("/sitemap.xml")` line in a writing Server Action, and what the new public route newly exposes.

**Method — static only, per this dispatch's explicit instruction and `docs/WORKFLOW.md` §4.** No dev server was started (none running on :3000), no `npm run dev`/`build`, no request issued against the live Supabase project, no write of any kind. Read every touched/new file in full (not just hunks): the new route, the `what-we-do/page.tsx` diff and its full current file, the `sitemap.ts` diff, the `settings-actions.ts` diff and its full 165-line file (`getSettings`, `updateSettings`, `SETTINGS_ROUTES`), `src/lib/site-content.ts` in full (`Product`, `CategoryProduct`, `normalizeProducts`, `resolveCategoriesForSave`, `isWellFormedSlug`, `readStoredCategoryIdentities`) to independently verify claims rather than trust this diff's own code comments, `src/app/actions/products-actions.ts` in full (`getCategoryProducts`, `checkCategoryAttachable`), `src/lib/supabase/server.ts` (to independently verify the new route's own `cookies()`-forces-dynamic-rendering claim), `src/app/robots.ts` (to independently confirm `/sitemap.xml` is the sitemap's real served path before accepting the new `revalidatePath("/sitemap.xml")` call as correctly targeted), and confirmed `src/app/not-found.tsx` exists (custom global 404 boundary, unmodified by this diff). Ran `npx tsc --noEmit` on the full working tree: clean, exit 0. Ran a secret-shape grep (`ghp_…`/`gho_…`/`ghs_…`/`github_pat_…`, `sk_live_…`, `AKIA…`, `SUPABASE_SERVICE_ROLE`, `service_role`, hardcoded `password = "…"`) against exactly this ticket's 4 changed + 1 new file: zero hits.

**1. SEC-MED-4 (T-005 half) — ✅ satisfied as written; no path where a raw param or a raw stored slug builds a path, query, URL, or string.** Traced every read of `category.slug` / the route param end to end:
- **Route resolution** (`[category]/page.tsx:38-42`, `findCategory`): the raw URL segment (`rawSlug`, from `await params`) is compared against each category's `.slug` — itself computed by `normalizeProducts()` — via plain `===` inside `.find()`. Never concatenated into a path, never interpolated into a filesystem/query string at this step. Confirmed the raw param is used **nowhere else** in the file besides this one equality check — grepped the full 162 lines for `rawSlug`: exactly two occurrences, both inside `findCategory(rawSlug)` call sites (page body and `generateMetadata`), never reflected into an error message, a log, or a rendered string.
- **DB reads:** `category.slug` (matched output, not the raw param) is passed to `getCategoryProducts(category.slug)` (`products-actions.ts:101-117`), which filters via `.eq("category_slug", slug)` — Supabase's parameterized query builder, not string concatenation, so injection-safe regardless of the string's content (same precedent already established for this exact call shape in the T-003 CSO entry, SEC-INFO-18, above). Same for `findCategory`'s own `getSettings("business")` read, which takes no slug-derived input at all.
- **`revalidatePath` targets** (`settings-actions.ts:158-163`): unchanged by this diff — the pre-existing loop (`for (const category of savedCategories) revalidatePath(...)`) already only iterates `resolveCategoriesForSave`'s own *resolved, validated* output (never raw client input — confirmed again this pass, see item 3 below for the one line this diff actually adds here). `savedCategories[].slug` is provably either a frozen, `isWellFormedSlug`-gated lookup or a fresh `slugify(title).slice(0, 255)` value (`site-content.ts:526-566`) — never a client-supplied string, by construction, independent of what any stored row elsewhere might contain.
- **Sitemap entries** (`sitemap.ts`): `categoryEntries` maps `normalizeProducts(business.products)` into `{ url: \`${baseUrl}/what-we-do/${category.slug}\`, ... }`, typed as `MetadataRoute.Sitemap` — Next.js's own sitemap renderer serializes this into XML (escaping reserved characters), not a hand-built XML string. Matches the acceptance criterion's literal text ("typed `MetadataRoute.Sitemap` ... rather than hand-built XML").
- **Canonical / OpenGraph** (`generateMetadata`, `[category]/page.tsx:44-71`): `canonical = \`/what-we-do/${category.slug}\`` is a plain string assigned into a typed `Metadata` object (`alternates.canonical`, `openGraph.url`) — Next.js's metadata renderer emits this as an actual `<link>`/`<meta>` element via its own serialization, not a hand-concatenated HTML string, so standard HTML-attribute escaping applies regardless of the value's content. Matches the acceptance criterion's literal text here too.

**Residual not fully covered by the acceptance criterion's own wording** — surfaced by this pass, not a failure of what was asked for: the criterion names `revalidatePath` targets, `sitemap.ts`, canonical, and OG explicitly, all of which route through either a parameterized query, a validated/resolved value, or a typed-and-Next-serialized shape. It does not name the **`href` attribute on `/what-we-do`'s own category cards** (`what-we-do/page.tsx:130`, `` href={`/what-we-do/${product.slug}`} ``) — new in this diff (the cards were plain, non-linking `<div>`s before T-005) — which reads `product.slug` from the same `normalizeProducts()` call and, unlike the canonical/OG case, places it directly into a `<Link href>` with no server-side value transform. See finding 5 (SEC-INFO-19) below — informational, not a failure of this criterion as written, since the criterion never named this sink.

**Verdict, SEC-MED-4 T-005 half: ✅ Closed for T-005's own scope.** Every sink the acceptance criterion actually named is correctly implemented exactly as specified, including for the legacy-row / `normalizeProducts()`-fallback case the dispatch asked about — the mitigation was never "validate the slug's shape," it was "never treat it as a raw path/query-construction input," and that holds in every named sink.

**2. Decision (d) — category `id` confidentiality — ✅ verified structurally, not just by absence of live data.** The dispatch is right that zero stored ids in the live row means a runtime grep proves nothing — so this was checked by tracing every read of the `category`/`Product` object returned by `findCategory`, not by testing against today's empty state. Result: `category.id` is read **nowhere** in this diff. `generateMetadata` reads `.description`, `.slug`, `.title` only. The page body reads `.title`, `.description`, `.slug` only (`PageHeader` props, the back-link is a static `/what-we-do` literal, `getCategoryProducts(category.slug)`). The whole `category` object is never spread into a prop, never passed to a Client Component (`PageHeader` and `ScrollReveal` each receive only primitive string props — confirmed by reading both component files), and never assigned into the `Metadata` return value wholesale. `sitemap.ts`'s `categoryEntries` map reads `.slug` only — narrower still, not even `.title`. Since an RSC's serialized flight payload contains the rendered element tree (props actually passed to Client Component boundaries, plus JSX text content) and not a Server Component's unused local variables, `category.id` — present in memory inside `findCategory`'s closure — never reaches the DOM, the RSC payload, or any client-visible prop. This is the same guarantee decision (d) requires, verified this pass by exhaustive read of every access to the object, not inferred from today's empty-id live state.

**`CategoryProduct.id` used as a React `key` (`[category]/page.tsx:132`, `key={product.id}`) — judged acceptable, and explicitly not the same question as decision (d).** This is a different type entirely from the category's own `Product.id` (`site-content.ts:346-355` vs. `:323-329`) — it's the DB-generated UUID primary key of an individual row in `public.products`, the same field already used openly throughout `products-actions.ts` for every `.eq("id", …)` mutation, never designed as an internal-only value the way decision (d) explicitly designed the category `id` to be. More to the point: `public.products` carries an unconditional `anon` `SELECT USING (true)` RLS policy plus an explicit `GRANT SELECT ... TO anon` (`docs/TECH_STACK.md`, T-001) — meaning every row's `id`, alongside every other column, is **already fully retrievable by anyone** via a direct, unauthenticated call to Supabase's own auto-generated REST endpoint (`GET {SUPABASE_URL}/rest/v1/products?select=*`) using the public `NEXT_PUBLIC_SUPABASE_ANON_KEY` every visitor's browser already holds by design — independent of this app's UI entirely, and independent of whether T-005 ever shipped. Rendering it as a React key adds zero incremental exposure over what T-001's own RLS/GRANT design already committed to making public; it's also a random v4 UUID (`gen_random_uuid()`), so it carries no sequence/count-leaking structure either. React keys are part of the serialized flight payload (needed for client-side reconciliation), so this value is technically visible in the raw response — but "technically visible in a response" and "already a fully public value by design one ticket ago" are the same fact here, not a new one. **Acceptable, no finding.**

**3. `revalidatePath("/sitemap.xml")` (`settings-actions.ts:162`) — ✅ no effect on auth, validation, or the write path.** This is the entire diff to this file: one line, added after the pre-existing `savedCategories` loop, inside the same `if (savedCategories)` guard that loop already used. Confirmed via the isolated diff (reproduced above in the dispatch and independently re-diffed this pass) that nothing else in this 165-line file changed — the `getUser()` auth check (`:57-60`), the collision/delete-guard logic (`:65-127`), and the `site_settings` upsert (`:129-133`) are all byte-identical to the version the T-003 re-review pass already cleared. The new call: (a) is a hardcoded string literal, not interpolated from any request-derived value, so it carries no injection surface of its own; (b) executes only *after* the upsert has already committed (`:129-133` runs first), so it cannot gate, block, or roll back the write — a hypothetical failure here would leave the save itself already persisted, same as every other `revalidatePath` call already in this function; (c) targets the sitemap's actual served path — independently confirmed via `src/app/robots.ts`, which references `` `${baseUrl}/sitemap.xml` `` as the sitemap's own advertised location, so this isn't a typo'd or mismatched path; (d) is unconditional whenever a `business` save resolves successfully, regardless of whether any category's slug actually changed — over-invalidation, not under-invalidation, the safe direction, and a functional/caching nit at most, not a security concern. No new auth surface, no new validation bypass, no change to who can call `updateSettings` or what it accepts.

**4. What the new public surface exposes — assessed item by item:**
- **Product `image` URLs as `<img src>`** (`[category]/page.tsx:135`): renders `product.image` (a `CategoryProduct.image`) with no scheme validation — the exact gap already tracked as **SEC-MED-7 / T-014** (`sanitizeInput()` in `products-actions.ts` accepts any string, `.trim()`-only). Not a new vulnerability class — T-014 already names this field specifically. What T-005 changes is **reachability timing**, not the defect itself: `public.products` is empty today (T-003/T-004 have never shipped a row), so this is inert right now, but T-005 is the **first live public rendering surface** for this field — previously `getCategoryProducts()` existed (T-003) but had no caller. Once T-004 ships an admin write UI, any value `sanitizeInput()` accepts (including a direct, UI-bypassing Server Action call, the same threat class already accepted for SEC-MED-7's category-level sibling) becomes immediately visible here. **Recommend `/pm` sequence T-014 before or alongside T-004's merge**, not "anytime" as the current Dependency Order has it — the risk itself is unchanged (still 🟡, still bounded: `<img src>` doesn't execute `javascript:`/`data:`-SVG script content, worst case is an attacker-controlled `https://` URL rendering site-wide, per SEC-MED-7's own original text), but T-005 is what turns "will eventually be exposed" into "is exposed the moment T-004 lands." No `openGraph.images` or any other image-in-metadata field is set anywhere in this diff — `generateMetadata` sets only `title`/`description`/`url`, so there is no additional image-in-`<head>` surface to separately assess.
- **`/contact` link in the empty state** (`[category]/page.tsx:116-121`): a static, hardcoded internal `<Link href="/contact">` literal — no user input, no security surface.
- **`notFound()` / error behavior:** correctly distinguishes two different states that the dispatch's own source material (`docs/ROADMAP.md` T-005 Acceptance) also distinguishes — an unmatched slug (`!category`) calls `notFound()`, which resolves to this repo's existing custom `src/app/not-found.tsx` (confirmed present, unmodified by this diff — not Next's raw framework default); a matched category with zero products renders the "Coming Soon" state instead, never `notFound()`. No value is reflected into either path — `notFound()` takes no argument here and the empty-state copy is static except for `category.title` (already fully public, already displayed on `/what-we-do` itself). `getCategoryProducts()`'s own error handling (`products-actions.ts:112-115`, unchanged by this diff) fails closed to `[]` on a DB error rather than throwing — a transient DB error on this route is indistinguishable from "zero products" to a visitor, never surfaces a stack trace or DB error string.
- **Anything cacheable per-user:** no. Independently verified `src/lib/supabase/server.ts`: `createClient()` calls `cookies()` from `next/headers`, which forces this route to render dynamically per-request (same mechanism already relied on, and already reviewed, for the sibling `/what-we-do` page) — there is no shared/static output for this route that could smuggle one visitor's state into another's response. More fundamentally, there is no per-visitor variation in this route's content at all: no auth-gated data, no session-dependent branching, no cookie-derived personalization — every visitor who requests the same slug gets the identical, fully-public response. Nothing here for a shared cache to leak even in the worst case.

**5. New finding — 🟢 SEC-INFO-19 — `normalizeProducts()`'s unvalidated stored `slug` reaches a new sink, `<Link href>`, for the first time; no live exploit path exists to set an unsafe value.** `what-we-do/page.tsx:130`: `` href={`/what-we-do/${product.slug}`} ``, where `product.slug` can, in the narrow legacy-row/manual-DB-edit case `normalizeProducts()` has always accepted verbatim (`site-content.ts:430-431`, `.trim()`-only, no `isWellFormedSlug` gate), be an unvalidated stored string. Unlike SEC-MED-7 (where an authenticated session calling a Server Action *directly* can still set an unsafe `image` value today, because `sanitizeInput()` itself performs no scheme check), **there is no write path of any kind — not even an authenticated session bypassing the shipped UI — that can set an unsafe `slug` value**, at or after this ticket: `resolveCategoriesForSave` never reads an incoming item's `.slug` field under any circumstance (`site-content.ts:490-588`, re-verified this pass, matches the T-003 re-review entry's own exhaustive check above). The only way a stored slug could ever contain something like a `javascript:` scheme is direct SQL/Supabase-dashboard-level manipulation of `site_settings` — a threat tier this document's own §2 already treats as a distinct, higher-privilege actor ("disgruntled ex-admin or a compromised admin credential") capable of far more direct damage than crafting a self-XSS link that only fires for a site *visitor* who clicks a corrupted card, not for the actor themselves. Bounded, no realistic exploit chain, zero live rows affected (today's 8 categories all carry hand-picked, well-formed default slugs — confirmed by reading `SITE_SETTINGS.business.products`, `site-content.ts:210-219`). Graded 🟢 Info rather than 🟡 Medium specifically because it lacks the "authenticated-session-bypassing-the-UI" reachability that every 🟡/🟠 finding naming `normalizeProducts()`/`resolveCategoriesForSave` elsewhere in this document actually has. **Mitigation, low priority, non-blocking:** gate `normalizeProducts()`'s `storedSlug` branch through `isWellFormedSlug()` (falling back to the existing `dedupeSlug(slugify(title), seen)` path on failure, mirroring what `resolveCategoriesForSave` and `checkCategoryAttachable` already do at save-time/attach-time) so the one remaining read-time sink applies the same defense-in-depth the write-time and attach-time paths already have. Recommend `/pm` fold into a small fast-follow on `src/lib/site-content.ts`, or bundle with whichever ticket next touches `normalizeProducts()`.

**6. Standing findings — confirmed, not re-opened, none affected by this diff:**
- **SEC-HIGH-1** (Next.js CVE range / **T-006**) and **SEC-HIGH-2** (Supabase Dashboard signup-toggle user-check) — untouched, `package.json`/`package-lock.json` diff against `main` confirmed empty this pass. Both still block only the next production `deploy`, not this ticket's local merge, unchanged from every prior entry.
- **SEC-HIGH-4** (`updateSettings` throw-based guard failures / **T-012**) — the new `revalidatePath("/sitemap.xml")` line inherits this function's existing throw-based failure characteristic exactly like every other line in it already does; not a new instance, already fully covered by the standing finding and its T-012 fix, unaffected by this diff.
- **SEC-MED-3** (`normalizeProducts()` stored-vs-stored slug dedupe gap) — re-confirmed still dormant: today's 8 live categories all carry unique, hand-picked default slugs (verified by direct read this pass, not assumed), and no live write path can create a stored-slug collision (`resolveCategoriesForSave`'s collision check runs on every save). This entry's own original text specifically predicted T-005's eventual `.find(c => c.slug === params.category)` pattern as the downstream consequence if this gap were ever live — confirmed this pass that the code built matches that exact prediction, and the "not exploitable via any live path today" rationale still holds unchanged.
- **SEC-MED-5** (TOCTOU, delete-guard vs. product-insert) — untouched, out of this diff's files entirely.

**Overall verdict this pass:** ✅ **T-005 cleared.** SEC-MED-4's T-005 half is satisfied exactly as specified — every named sink (`revalidatePath`, `sitemap.ts`, canonical, OG) treats `category.slug` as validated-or-typed-and-escaped, never as raw path-construction input, including correctly for the legacy-row/`normalizeProducts()`-fallback case this dispatch specifically asked about. Decision (d)'s `id`-confidentiality guarantee holds structurally (verified by tracing every access, not by today's empty-id live state) — `category.id` is read nowhere in this diff. `CategoryProduct.id`-as-React-key is judged acceptable: it's a different field than decision (d) protects, and it's already a fully public value under T-001's own `anon`-SELECT RLS/GRANT design, independent of T-005. The new `revalidatePath("/sitemap.xml")` line has no auth, validation, or write-path effect — confirmed the rest of `updateSettings` is byte-identical to the already-cleared T-003 version. No 🔴/🟠 finding. One new 🟢 informational finding (SEC-INFO-19, non-blocking, low-priority fast-follow) and one sequencing recommendation (land T-014 before/alongside T-004, since T-005 is what first makes T-014's underlying gap live-reachable). `npx tsc --noEmit` clean. No commit made, no write issued against the live database, no dev server started.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-005 may proceed to `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` per `docs/WORKFLOW.md` §3's Full-stack feature row. No blocking finding. SEC-INFO-19 and the T-014-sequencing note are recorded in §5 below for `/pm` to pick up as fast-follows; neither gates this ticket's merge.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-012

**Scope:** Dispatched focused review of **T-012** ("Convert `updateSettings` from throw-based to a `{ok, error}` result contract; wire all six settings-page clients to handle it") — this is this office's own **SEC-HIGH-4** closure ticket. Branch `fix/T-012-settings-save-errors`, base `27660e3`, **entirely uncommitted working tree**. `git diff main --stat`: 9 files — `docs/ROADMAP.md` (checkbox only, confirmed by direct diff), `src/app/actions/settings-actions.ts`, `src/components/admin/SettingsForm.tsx`, and six admin client files (`business/BusinessClient.tsx`, `homepage/HomepageSettingsClient.tsx`, `settings/ContactSettingsClient.tsx`, `sustainability/SustainabilityClient.tsx`, `who-we-are/WhoWeAreClient.tsx`, `who-we-work-with/WhoWeWorkWithClient.tsx`). `git status --porcelain` confirms zero untracked files. Independently confirmed empty — not taken on the dispatch's word — `git diff main -- src/lib/site-content.ts src/app/actions/products-actions.ts src/app/actions/jobs-actions.ts src/app/actions/media-actions.ts db/migrations supabase-schema.sql package.json package-lock.json .env.example next.config.ts src/middleware.ts src/lib/supabase/`: zero output. No dependency, no env var, no schema, no auth/session/middleware file touched.

**Method:** Read every touched file in full (not the hunks alone), plus the full current `settings-actions.ts` (347 lines) and `products-actions.ts` (precedent file) to verify claims independently rather than trust the dispatch's or `/lead-dev`'s own description. `npx tsc --noEmit` on the full working tree: **clean, exit 0**. Targeted secret-shape grep (`ghp_…`/`sk_live_…`/`AKIA…`/`SUPABASE_SERVICE_ROLE`/`service_role`/hardcoded `password = "…"`) against exactly this ticket's 9 changed files: zero hits. No write issued against the live Supabase project, no crafted Server Action call against the running dev server, dev server on `:3000` left untouched throughout. Given the diff is a mechanical throw→return conversion (not new business logic like T-003's `resolveCategoriesForSave`), static trace + compiler verification was judged sufficient; synthetic pure-function execution wasn't needed this pass.

**1. SEC-HIGH-4 closure — ✅ CLOSED, verified independently, not taken on trust.** `awk`-scoped search of `updateSettings`'s full body (`settings-actions.ts:65-181`) for the literal token `throw` returns **zero matches** — every one of the six guard `throw`s this finding originally named is now a `return { ok: false, error: … }` at the identical line, in place: not-authenticated (`:75`), existing-row read error (`:93`), collision/resolution error (`:112`), delete-guard count error (`:130`), delete-guard block message (`:136`), final upsert error (`:148`); both success paths also now return `{ ok: true }` explicitly (`:155` for the `general`-key early return, `:180` at function end — previously a bare `return;`). This isn't just a manual read: `updateSettings`'s signature is now `Promise<UpdateSettingsResult>` where `type UpdateSettingsResult = { ok: true } | { ok: false; error: string }` (`:63,65`), and `npx tsc --noEmit` passing clean means the compiler itself refused to compile if any code path could fall through without returning a value matching that union — TypeScript's control-flow exhaustiveness check is doing real work here, not just documentation.
   Seven call sites, verified by grep across the **entire** `src/` tree (`grep -rn "updateSettings(" src/`, not just the six files the dispatch listed) — confirms no eighth call site exists anywhere else in the app: `BusinessClient.tsx:26`, `HomepageSettingsClient.tsx:59`, `ContactSettingsClient.tsx:35` (`contact`) and `:36` (`general`), `SustainabilityClient.tsx:21`, `WhoWeAreClient.tsx:34`, `WhoWeWorkWithClient.tsx:19`. All seven follow the identical pattern: `setError(null)` at the top of the save handler → `try { const result = await updateSettings(...); if (!result.ok) setError(result.error); } catch { setError("Something went wrong saving these changes. Check your connection and try again."); }`. A successful save (`result.ok === true`) never sets `error`, so the banner stays hidden; a guard failure sets the real returned string; an unexpected throw (network failure, etc.) sets a generic fallback — no path shows success for a failure, and no path is left silently unhandled. `ContactSettingsClient.tsx:35-40` is the one two-call-site file: both `updateSettings("contact", …)` and `updateSettings("general", …)` are awaited unconditionally (not short-circuited by the first one's failure — deliberate per its own inline comment, since the two rows don't depend on each other) and both failures are named and joined (`Contact settings: …` / `General settings: …`) if either fails; the one edge case — the first call resolves `{ok:false}` cleanly but the *second* `await` throws — falls into the generic catch-all instead of the two-line partial-failure message, which is a conservative-safe failure mode (never claims success) rather than a security gap, worth a UX nod to `/qa`/`/ui-ux` but not a finding here.
   `SettingsHeader` (`SettingsForm.tsx:21-49`) gained the rendering slot: `error?: string | null` prop, rendered as `<p role="alert" className="...text-red-400">` with a `TriangleAlert` icon (`:44-47`) — plain JSX child interpolation (`{error}`), not `dangerouslySetInnerHTML` (see finding 5). `ObjectListEditor` itself was **not** touched (confirmed: the diff to `SettingsForm.tsx` covers only imports and `SettingsHeader`) — a deliberate, documented design choice (inline comment, `:13-20`: a save failure is a whole-page outcome, and duplicating the message into every nested list editor on a page with several, e.g. Homepage's three, would misattribute it) rather than a gap; this is a UI/UX judgment call outside this office's lane, not a security finding.

**2. Auth ordering — ✅ unchanged; `getUser()` is still the unconditional first line, before any read/count/write.** `settings-actions.ts:72-75` is the first Supabase call `updateSettings` makes after `createClient()` — no table read, no count, no upsert precedes it, identical to the pre-T-012 version this office already reviewed and cleared at T-003. Since `settings-actions.ts` exports `getSettings` too (called by every public page), every export in this file is technically a Server Action endpoint — and per this office's own repeated, standing finding (T-003 entry above: "Next.js Server Actions are invoked by POSTing the action's own ID and are not bound to the route that defines them... an in-action `getUser()` check is load-bearing here, not belt-and-suspenders"), `updateSettings` must be treated as directly reachable by an anonymous caller independent of `src/middleware.ts`'s `/admin/*` page-level gate. That precondition is unchanged by this diff; what changes is only what such a caller now *sees*.
   **What an anonymous caller now learns:** Before T-012, any guard failure — including not-authenticated — was a thrown `Error`, and Next.js redacts a thrown Server Action's message to a generic, non-specific string in production; an anonymous caller and an authenticated admin hitting *any* guard (auth, collision, delete-guard, upsert error) got an indistinguishable, generic response. After T-012, an anonymous caller invoking `updateSettings` directly hits the `if (!user)` branch (`:75`) and receives the literal, un-redacted string `"Your session expired. Sign in again and retry."` as a normal Server Action return value — return values are serialized over the RSC wire protocol as ordinary data, not subject to the thrown-error redaction Next.js applies only to exceptions, so this text is visible in every environment, not just dev. **Assessed acceptable, no finding:** (a) an anonymous caller can *only* ever reach this one branch — every other guard (collision, delete-guard, upsert) sits strictly after the auth check and is structurally unreachable without a valid session, so no raw Postgres/collision/delete-guard detail is exposed to an anonymous caller, only this one generic sentence; (b) the message itself carries no secret, no schema detail, no confirmation/denial of any specific account's existence, and is byte-for-byte identical to the message already used, already reviewed, and already implicitly accepted by this office at T-003 for the equivalent anonymous-reachable check in `products-actions.ts`'s `requireUser()` (`createCategoryProduct`/`updateCategoryProduct`/`deleteCategoryProduct`/`reorderCategoryProducts`, each returning the identical `"Your session expired. Sign in again and retry."` — confirmed by grep, `products-actions.ts:122,152,208,235`); (c) the only thing it confirms — that a protected admin write endpoint exists — is already obvious from the site having a public `/admin/login` page. This is a strict improvement over the pre-T-012 state (which gave zero differentiation between "you're not logged in" and "the database is on fire"), not a regression.

**3. Information disclosure to authenticated admins — new finding, 🟡 SEC-MED-8.** Raw Supabase/Postgres `error.message` strings now reach the browser from three branches inside `updateSettings`, only reachable *after* the auth check passes: the existing-row read (`:93`), the delete-guard's product count (`:130`), and the final `site_settings` upsert (`:148`) — none of these are hand-written app copy, all are whatever string Postgres/PostgREST/Supabase itself produces (constraint names, column names, RLS-denial text, JSONB shape-mismatch messages, etc.), verbatim. This is a real, direct precedent match — `products-actions.ts` already does exactly this (`error: error.message` at four call sites, `:143,194,219,258`) and this office already reviewed and cleared that exact pattern at T-003 as **SEC-INFO-15**, reasoning "not a security leak (no secret/internal path in that message), just an unfriendly error," because the only people who can ever see it are already-authenticated admins. That reasoning holds here too: `site_settings`/`products` carry no PII (the PII table is `submissions`, untouched by this file), the admin roster is small and hand-created (not self-serve), and nothing here grants elevated privilege to whoever reads it — a compromised-or-malicious admin session already has direct table access via other means, so a constraint/column/RLS name in an error string doesn't meaningfully advance that actor's position. **Grading this Medium rather than reusing SEC-INFO-15's Info grade**, for two reasons specific to this instance: this file's three branches carry more surface than SEC-INFO-15's single narrow `name`-too-long case (a `site_settings` JSONB upsert conflict or a cross-table count-query error is more likely to echo internal shape/naming than a simple varchar-length violation), and this is now the **second** file independently establishing the identical "just forward `error.message`" convention — worth formally tracking as a pattern rather than re-describing as a fresh curiosity each time it recurs. **Mitigation, non-blocking:** a small, shared "map known Postgres/Supabase error shapes to a generic admin-facing string, log the raw one server-side only" helper, applied to both `settings-actions.ts` and `products-actions.ts` in one pass rather than patched file-by-file. Recommend `/pm` file as a consolidated fast-follow; does not block this ticket or deploy.

**4. No weakened guard — ✅ confirmed, byte-for-byte behavioral equivalence apart from return-vs-throw.** Re-diffed `settings-actions.ts` against `main` line by line: every hunk is a `throw new Error(X)` → `return { ok: false, error: X }` swap *at the identical source line*, with no line moved, no branch added, no branch removed, no condition altered. `return` and `throw` both unconditionally exit the function at the point they appear, so control flow is unchanged — nothing that previously aborted a save now falls through to the upsert, and nothing that previously reached the upsert is now short-circuited earlier. Specifically verified unchanged: the collision/resolution call (`resolveCategoriesForSave`, `:111`), the id-diff delete-guard (`computeRemovedCategories`, `:121`, and its product-count query `:125-128`), the upsert itself (`:144-146`), and every `revalidatePath` target including T-005's `revalidatePath("/sitemap.xml")` line (`:177`) — this line is untouched context in the diff (no `+`/`-` prefix), confirming it still executes only after a successful upsert, still unconditional-on-slug-change (over-invalidation, the safe direction, already assessed acceptable at the T-005 review). `src/lib/site-content.ts` and `src/app/actions/products-actions.ts` — where `resolveCategoriesForSave`/`computeRemovedCategories`/`checkCategoryAttachable` actually live — are confirmed byte-identical to `main` (empty `git diff`), so none of the SEC-HIGH-3/CRIT-1 closure work from the T-003 re-review is at risk from this ticket.

**5. Client-render surface — ✅ confirmed clean, no new injection sink.** Grepped the full diff for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `new Function(`: zero hits. The only new rendered value is `error` (`SettingsForm.tsx:46`, `{error}` as a plain JSX text child) — React escapes JSX children by default, so even if a raw Postgres error string ever contained HTML metacharacters (SEC-MED-8's concern is disclosure, not injection), it would render as inert escaped text, never execute. Same for the client-side generic fallback string and `ContactSettingsClient`'s joined-failures string — both plain string interpolation into JSX, no raw-HTML sink anywhere in this diff.

**6. Out-of-scope functions flagged by `/lead-dev` — confirmed accurate, plus incidental findings this office is required to surface.** Verified `seedSettingsFromDefaults` (`settings-actions.ts:190-224`), `createReport`/`updateReport`/`deleteReport` (`:239-280`), `createLeader`/`updateLeader`/`deleteLeader` (`:292-326`), `uploadFile` (`:332-346`), `createJob`/`updateJob`/`deleteJob` (`jobs-actions.ts:61-81`), and `importBuiltInGallery` (`media-actions.ts:39-63`) all still `throw new Error(...)` for every guard/DB-error branch — confirmed unchanged (all three files' diffs against `main` are empty). This dispatch's framing ("these still throw the same redacted way") is accurate for all six, but tracing each one's actual client caller — which the dispatch didn't ask for, and which changes the severity picture — surfaced three distinct issues this pass, none introduced by T-012 (none of the files below are touched by this diff), none blocking T-012's own merge:
   - 🟠 **New finding, SEC-HIGH-5 — `ReportsClient.tsx` and `CareersClient.tsx` wrap their CRUD calls in zero `try`/`catch`, reproducing SEC-HIGH-4's exact pre-fix shape on live, day-to-day admin surfaces, today, with no dependency on any future ticket.** `ReportsClient.tsx`: `handleSave` — `startTransition(async () => { if (isNew) { await createReport(fd); } else { await updateReport(modal.id, fd); } setModal(null); window.location.reload(); });` — and `handleDelete` — `startTransition(async () => { await deleteReport(id); window.location.reload(); });` — carry no `try`/`catch` at all. `CareersClient.tsx`'s `handleSave`/`handleDelete` are the identical shape for `createJob`/`updateJob`/`deleteJob`. If any of these six actions throws (a DB constraint, an RLS denial, any transient error), the `await` rejects, the subsequent `setModal(null)`/`window.location.reload()` line never runs, `isPending` still clears when the transition settles, and the admin sees **nothing** — no error text (no error-display slot exists on either page at all, unlike the six T-012-fixed pages), the modal just sits there with no explanation, indistinguishable from the click not having registered. This is not a hypothetical gated behind a future ticket the way SEC-HIGH-4 was gated behind T-004 — `/admin/reports` and `/admin/careers` are shipped, live admin surfaces in production today, edited routinely (job postings, published reports). Same severity as SEC-HIGH-4 for the same reason (a silent-failure bug class invisible to this project's dev-only test path, per `docs/WORKFLOW.md` §4, that "only manifests for real users after a real deploy" and can discard a real edit without warning) — if anything more directly live, since it requires no precondition ticket to be reachable. **Mitigation:** identical pattern to this ticket — convert these six functions to `{ok, error}` returns and wire `ReportsClient`/`CareersClient` the same way T-012 just wired the six settings clients; both pages would need their own error-display slot (neither currently has `SettingsHeader` or any equivalent). Recommend `/pm` file as a high-priority fast-follow, same shape as T-012. Joins SEC-HIGH-1/SEC-HIGH-2/SEC-HIGH-4 on the list that must clear before the *next* production deploy (§5) — does not block T-012's own local merge, since T-012 touches none of these three files.
   - 🟡 **New finding, SEC-MED-9 — `addMediaAction`/`deleteMediaAction` (`media-actions.ts:126-166`) are a distinct, more-silent variant: they don't throw at all, return nothing (`Promise<void>`), and are wired as raw `<form action={...}>` Server Actions with no client-side JS wrapper (`media/page.tsx:27,73-79`) — so there is no possible client-side `catch`, in any environment, ever.** `addMediaAction`'s storage-upload failure is only `console.error`'d server-side (`:145`, invisible to the browser); its `media_assets` insert failure is likewise only `console.error`'d (`:151`), never surfaced to the page. `deleteMediaAction` is worse still: its `.delete()` result isn't even destructured to check `.error` (`:163` region) — a failed delete isn't logged *anywhere*, server or client. Distinct from SEC-HIGH-4/SEC-HIGH-5's "redacted-in-production" shape (which at least shows something in `npm run dev`'s overlay) — this shows nothing in *any* environment, because no exception is ever thrown to catch. Graded Medium rather than High because neither function guards a security-relevant check the way `updateSettings`'s delete-guard does (these are plain CRUD with no collision/delete-guard logic to silently defeat), and because — unlike SEC-HIGH-5 — fixing this needs a different mechanism than T-012's pattern (a return-value convention has nothing to catch when there's no client-side awaiter at all; would need either `useActionState`/`useFormStatus` wiring or a client-component rewrite of the form, a bigger lift `/pm` should scope explicitly rather than assume is a drop-in copy of T-012). Recommend `/pm` file as its own fast-follow, flagged as needing its own design pass rather than bundling with SEC-HIGH-5.
   - 🟡 **New finding, SEC-MED-10 — 10 write functions across 3 files have no application-level `getUser()` check at all, relying solely on RLS — contradicting this codebase's own explicit, in-code-documented convention.** `uploadFile` (`settings-actions.ts:332`), `createReport`/`updateReport`/`deleteReport` (`:239,256,274`), `createLeader`/`updateLeader`/`deleteLeader` (`:292,306,320`), `addMediaAction`/`deleteMediaAction` (`media-actions.ts:126,157`), and all three of `createJob`/`updateJob`/`deleteJob` (`jobs-actions.ts:61,69,77`) — confirmed by direct read, none call `supabase.auth.getUser()`/`getSession()` anywhere in their bodies. This runs directly counter to the rationale this codebase itself writes into the *neighboring* functions in the same two files: `seedSettingsFromDefaults` (same file as 7 of the 10) and `importBuiltInGallery`/`uploadOptimizedImage` (same file as 2 of the 10) both carry the comment "Every write action checks for an authenticated session server-side, in addition to RLS... matches the existing [pattern] in this codebase" — a stated project convention that these 10 functions simply don't follow. Cross-referenced against source, not assumed: `supabase-schema.sql` records an explicit `authenticated`-role `FOR ALL` policy for `jobs` (`:29`) and `products` (`:166`, T-001) — so `jobs-actions.ts`'s gap is at least backed by a source-confirmed RLS policy as the sole remaining gate. `media_assets`, `reports`, and `leaders` are **not** so confirmed: the reference file records only an `anon`-SELECT policy for each (`:59,108,126`) — no `authenticated` policy is present in `supabase-schema.sql` for any of the three, matching the already-open, already-tracked gap at `docs/WORKFLOW.md` §8 row 2 ("supabase-schema.sql is missing authenticated-role RLS policies for 5 of its 6 [original] tables... the live database almost certainly carries hand-added policies never backported to this file"). Net effect: for `addMediaAction`/`deleteMediaAction`/reports-CRUD/leaders-CRUD specifically, the *only* gate protecting these writes — app-level or database-level — is a policy this office cannot independently verify from source at all, only infer must exist because the features visibly work. **Not a new exploit path beyond what's already named:** SEC-HIGH-2 (T-001 entry, still open) already reasons the RLS-permissiveness blast radius "plausibly already extends to every table in this schema, not just `products`" if the Supabase Dashboard signup toggle is ever found on — this finding doesn't expand that scope, it confirms concretely, function-by-function, that these particular 10 write paths have *zero* secondary defense if that precondition is ever violated, unlike `updateSettings`/`products-actions.ts`'s functions which do. Graded Medium, not High: no direct exploit path today assuming SEC-HIGH-2's precondition holds (signup toggle off, per the user's pending confirmation), matching this office's own "defense-in-depth weakness, no direct exploit path" bar. **Mitigation:** add the identical `requireUser()`-style check already used in `products-actions.ts` to all 10 functions. Recommend `/pm` batch this with SEC-HIGH-5's fix ticket, since 7 of the 10 functions are the exact same functions SEC-HIGH-5 already needs touched.

**Overall verdict this pass:** ✅ **T-012 cleared.** SEC-HIGH-4 is genuinely, verifiably closed — zero `throw` remains in `updateSettings`, all seven real call sites (independently enumerated, not taken from the dispatch's list) correctly branch on `.ok` and never show a failure as success, and the fix is compiler-enforced, not just convention. Auth ordering is unchanged and load-bearing; the one new thing an anonymous caller learns (a generic "session expired" string, matching existing `products-actions.ts` precedent verbatim) is acceptable. Behavior is byte-for-byte unchanged apart from return-vs-throw — no weakened guard, no new write on a previously-aborted path. No injection sink introduced. One new Medium finding scoped to this diff itself (SEC-MED-8, raw error strings to authenticated admins, extending already-accepted SEC-INFO-15 precedent to a second file). Three new findings surfaced by tracing the dispatch's own "out of scope" list to its real callers — none introduced by T-012, none blocking T-012's merge, all pre-existing: one High (SEC-HIGH-5 — reports/leaders/jobs CRUD, live and fully silent today, same shape and stakes as SEC-HIGH-4 itself) and two Medium (SEC-MED-9 — media actions' distinct no-signal-anywhere variant; SEC-MED-10 — 10 functions missing the app-level auth check this codebase's own conventions call for). `npx tsc --noEmit` clean. No commit made, no write issued against the live database, no dev-server interaction of any kind.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-012 may proceed to `/ui-ux` → `/qa static` → `/qa live` (including the production-build check T-012's own Acceptance criteria require — `npm run build && npm start`) → `/git Merge` per `docs/WORKFLOW.md` §3's Full-stack feature row. No blocking finding against this ticket's own diff. SEC-MED-8 is recorded in §5 below as a non-blocking fast-follow. SEC-HIGH-5, SEC-MED-9, and SEC-MED-10 are pre-existing, out of this diff entirely, and do not gate T-012's merge — SEC-HIGH-5 joins the standing next-deploy blocker list; SEC-MED-9/SEC-MED-10 are non-blocking fast-follows. Recommend `/pm` pick up all four in `docs/ROADMAP.md` on its next pass.

### 🔒 CSO Audit — 2026-09-27 — ticket-review:T-004

**Scope:** Dispatched focused review of **T-004** ("Add products-within-category management to `/admin/business`"), branch `feat/T-004-admin-category-products`, base `d3e2bd7` (current `main` HEAD — confirms **T-012**, this ticket's own blocking prerequisite per `docs/ROADMAP.md`, is already merged), **entirely uncommitted working tree**. `git diff main --stat`: 4 tracked files, 105 insertions / 9 deletions — `src/app/actions/products-actions.ts`, `src/app/admin/(dashboard)/business/BusinessClient.tsx`, `src/app/admin/(dashboard)/business/page.tsx`, `src/lib/site-content.ts` — plus one new untracked file, `src/components/admin/CategoryProductsManager.tsx` (438 lines, full read). Independently confirmed empty — not taken on the dispatch's word — `git diff main -- package.json package-lock.json .env.example next.config.ts src/middleware.ts src/lib/supabase/ db/migrations supabase-schema.sql`: zero output. No dependency, no env var, no schema, no auth/session/middleware file touched. `src/components/admin/ImageUploadField.tsx`, `src/components/admin/SettingsForm.tsx`, `src/app/actions/settings-actions.ts` confirmed genuinely unchanged (byte-identical to `main`), matching the dispatch's own "Unchanged, per `/lead-dev`" list — re-verified, not assumed.

**Method:** Read every touched/new file in full (not just hunks) — `products-actions.ts` (311 lines), `CategoryProductsManager.tsx` (438 lines, new), the diffs to `BusinessClient.tsx`/`business/page.tsx`/`site-content.ts`, plus `ImageUploadField.tsx` (258 lines) and `normalizeProducts()`/`resolveCategoriesForSave()` in full again despite being unchanged by this diff, to independently verify two specific claims (id round-trip, image-field reachability) rather than trust prior entries' word or this diff's own comments. `npx tsc --noEmit` on the full working tree: clean, exit 0. Targeted secret-shape grep (`ghp_…`/`sk_live_…`/`AKIA…`/`SUPABASE_SERVICE_ROLE`/`service_role`/hardcoded `password = "…"`) against exactly this ticket's 5 changed/new files: zero hits. Extracted and directly executed (Node, synthetic inputs, no network/Supabase calls, script never committed — session scratchpad only) the new `sort_order` resolution logic verbatim from the diff, against 11 edge-case inputs (undefined, `NaN`, negative, fractional, two magnitudes beyond `INTEGER`'s range, zero, ordinary, a malformed string, `null`) — not taken on a read-through alone. No write issued against the live Supabase project, no crafted Server Action call against the running dev server; the dev server on `:3000` was left untouched throughout, per this dispatch's explicit instruction.

**1. Auth on every write — ✅ confirmed, no regression, plus one structural confirmation recorded for the first time.** All four write actions `CategoryProductsManager.tsx` calls — `createCategoryProduct`, `updateCategoryProduct`, `deleteCategoryProduct`, `reorderCategoryProducts` — are **byte-identical to `main`** in this diff (none of their bodies appear in the `git diff` hunks; only `getAllCategoryProducts` is new and `createCategoryProduct`'s insert call gained the `sort_order` computation, see finding 3). Every one still calls the unmodified `requireUser(supabase)` as its unconditional first Supabase call, before any read of `checkCategoryAttachable` or any table access, exactly as the T-003 re-review already verified. The new client file cannot reach around this: its import block (`CategoryProductsManager.tsx:6-11`) pulls in exactly these four functions and nothing else from `products-actions.ts` — no `getCategoryProducts`/`getAllCategoryProducts` import here (the grouped read is fetched once, server-side, in `business/page.tsx`, and handed down as a prop) — so there is no code path in the new UI that reaches a write action's server code without going through the unchanged `requireUser()` gate first.
   🟢 **SEC-INFO-20 (new) — `updateCategoryProduct` structurally *can* reassign a product to a different, already-attachable category; it structurally *cannot* reassign it to a nonexistent or not-yet-bootstrapped one.** This is pre-existing T-003 code (this function has zero diff against `main`), not new to T-004, but this is the first review pass explicitly asked to confirm it, so recording the answer on the record: `updateCategoryProduct` (`products-actions.ts:196-248`) takes `categorySlug` from `input.category_slug` — independent of the row's own stored category — and gates it only via `checkCategoryAttachable(categorySlug)` (`:206`), the same gate `createCategoryProduct` uses and which the T-003 re-review already found sound (cannot approve an unsaved or nonexistent category, reads only server-side state, never the caller's say-so). There is no check binding the incoming `category_slug` to the product row's *existing* one. The function's own pre-existing comment (`:216-219`) already names this precisely: "a product moved to a different category (not exposed by T-004's planned UI, but the type allows it)." Traced T-004's actual shipped UI end to end and confirmed it never exercises this: `ProductRow.persist()` (`CategoryProductsManager.tsx:311-323`) always sends `category_slug: product.category_slug` — the row's own value, read fresh from its prop, never from an editable field — and there is no category-picker anywhere in the row's markup. Reaching a cross-category move requires an authenticated session invoking the Server Action directly (devtools/curl with a valid session cookie), the same precondition class as SEC-HIGH-2/SEC-HIGH-3/SEC-MED-10. No mitigation required for this ticket. If `/architect`/`/lead-dev` ever want to close this off as belt-and-suspenders (impact is bounded to an authenticated admin manually reassigning a product's category via a crafted call — no privilege escalation, no data exposure), the fix is for `updateCategoryProduct` to ignore `input.category_slug` for anything beyond a match-check against the row's own stored value. Low priority, not blocking, not ticketed.

**2. `getAllCategoryProducts()` as a new public Server Action endpoint — ✅ acceptable, no new exposure.**
   🟢 **SEC-INFO-21 (new).** Same shape, same no-auth-needed status, same table, as the already-reviewed `getCategoryProducts()` (T-003, SEC-INFO-18: "no auth check: this is a plain read, gated by the table's own `anon` SELECT policy"). `category_slug` values it groups by are already fully enumerable via the already-public `getSettings("business")` Server Action (T-001/T-003 precedent, re-confirmed this pass — `settings-actions.ts` is untouched by this diff) independent of this new function's existence. More fundamentally — the same reasoning this office already used to clear `CategoryProduct.id`-as-React-key at the T-005 entry — `public.products`' entire column set is, independent of any Server Action at all, already fully retrievable by any anonymous caller directly against Supabase's own REST endpoint (`GET {SUPABASE_URL}/rest/v1/products?select=*`) under the table's existing `anon` SELECT RLS policy plus its explicit `GRANT SELECT ... TO anon` (re-confirmed this pass by re-reading `db/migrations/0001_products-within-category.sql`). `getAllCategoryProducts()` is strictly a server-side query-count optimization for `/admin/business`'s own initial load (one grouped query instead of one per category) — it does not create a new enumeration primitive, does not reveal any category that `getSettings("business")` didn't already reveal, and the table carries no PII (this project's only PII table is `submissions`, untouched by this diff). **Acceptable addition as-is.**

**3. `sort_order = max + 1` — race confirmed (extends SEC-MED-5); arbitrary caller-supplied value confirmed reachable (new, crafted-call-only).**
   🟡 **SEC-MED-11 (new) — a caller-supplied finite `sort_order` (negative, non-integer, or far beyond any sane range) still passes through verbatim; the new max+1 default only fires when the field is omitted or non-finite.** Confirmed by direct execution, not just reading (11 synthetic cases, this pass's scratchpad script): `-500`, `3.5`, `1e15`, and `2147483647` all satisfy `Number.isFinite()` and are written to the insert exactly as supplied, skipping the new max+1 lookup entirely (`products-actions.ts:172-182`); `sanitizeInput()` itself (`:87-94`, unchanged by this diff) still does `sort_order: Number.isFinite(input.sort_order) ? input.sort_order : 0` with no rounding/clamping. `sort_order INTEGER NOT NULL DEFAULT 0` (`db/migrations/0001_products-within-category.sql`) has no `CHECK` constraint — a value beyond `INTEGER`'s range fails at the DB layer with a raw error (the already-accepted SEC-INFO-15/SEC-MED-8 pattern — visible only to an already-authenticated caller), not silently; a value within range succeeds and controls display order only, no auth bypass, no cross-category write (every mutation stays scoped by its own `id`/`category_slug` filters, already reviewed sound). **Not reachable via T-004's shipped UI**: `AddProductForm` never sends `sort_order` at all (`CategoryProductsManager.tsx:204-212`, comment: "sort_order intentionally omitted"), and `ProductRow.persist()` only ever echoes back the product's own already-persisted `sort_order` (`:322`), never a user-typed value. Requires a direct/crafted call — the same precondition class as findings 1 and the already-accepted SEC-MED-7/SEC-HIGH-3 class. **Mitigation, low priority:** clamp/round in `sanitizeInput()` (e.g. `Math.trunc` plus a sane bound) instead of passing a caller-supplied finite value through unchanged. Recommend folding into **T-014**, which already touches this exact function for the `image`/`name` findings, rather than a new ticket.
   🟡 **SEC-MED-12 (new, extends SEC-MED-5) — read-then-insert race in the new max+1 computation.** Two concurrent `createCategoryProduct` calls against the *same* category (two admin tabs, a double-submit, or two staff editing at once) can both read the same current max (`products-actions.ts:173-181`) and both insert at the identical computed `sort_order` — no `UNIQUE` constraint exists on `(category_slug, sort_order)` (confirmed in the DDL, only a plain composite index for query performance), so both inserts succeed; the only consequence is a non-deterministic tie in display order between those two rows (the read query has no secondary tiebreaker column) — not data loss, not corruption, not cross-category leakage. Same TOCTOU shape and same accepted rationale already twice on record for this exact class — **SEC-MED-5** (delete-guard vs. product-count) and its T-003-re-review sibling (attachment-gate vs. delete) — small, hand-created admin roster, not concurrent public traffic; a real fix needs a single-transaction/RPC rewrite, disproportionate to the accepted risk. Recording as a third instance of the same open, accepted class rather than a freestanding new mitigation — no ticket beyond what SEC-MED-5 already implies.

**4. Category identity (decision (d)) — ✅ both halves confirmed, structurally, not by assertion.**
   **(a) Product operations never touch `site_settings`.** Confirmed by reading `CategoryProductsManager.tsx`'s full import block (`:1-12`): only `createCategoryProduct`/`deleteCategoryProduct`/`reorderCategoryProducts`/`updateCategoryProduct` from `products-actions.ts`, plus types from `site-content.ts` — zero import of `updateSettings` or anything from `settings-actions.ts`, anywhere in the new file. This isn't merely convention (the file's own header comment says so, `:22-26`) — there is no code path by which a product add/edit/delete/reorder could reach `site_settings` even by accident, because the module that would need to be imported to do so simply isn't imported.
   **(b) The post-Save `getSettings` re-read (`BusinessClient.tsx:28-40`, new this diff) cannot cause a later Save to drop or re-mint a category `id`.** Traced against `normalizeProducts()`'s actual current source (`site-content.ts:410-450`) — confirmed **untouched** by this diff (the only change to `site-content.ts` in this ticket is `CategoryProductInput.sort_order` becoming optional, `:372-374`) — rather than assumed safe because it "looks like" the existing pattern. `normalizeProducts()` reads `row.id` and passes it through into the returned `Product` verbatim (`:439,445`), exactly the same pass-through treatment already given to `slug` (`:441-442`). So `getSettings("business")` immediately after a successful save, piped through `normalizeProducts(fresh.products)`, correctly carries forward every category's `id` — including one just minted this save for a previously-legacy category — into `BusinessClient`'s `data.products` state; a subsequent Save then sends `resolveCategoriesForSave` an `id` that correctly matches `existingById`, and cannot be mistaken for "new." This is exactly the guarantee `docs/TECH_STACK.md`'s "Client dependency" paragraph and `docs/MEMORY_BANK.md`'s T-003 entry flagged as a T-004 acceptance-criterion candidate ("round-trip `id` ... for any category the admin didn't explicitly delete") — confirmed held here, and via the lowest-risk possible mechanism: reusing the same `normalizeProducts()` function the T-003 re-review already exhaustively exercised (43/43 assertions), rather than any new parsing logic this diff invents. No live re-read-then-resave sequence was run against the dev server to confirm this (out of scope per this dispatch's read-only instruction) — this is a static trace of the actual code path against the actual, unmodified `normalizeProducts()` source.
   🟢 **SEC-INFO-22 (new)** — recording this confirmation on the record, since it closes an acceptance-criterion risk two prior docs entries flagged as open pending T-004's actual implementation.

**5. Image path — SEC-MED-7 reachability correction, and the explicit ruling requested.**
   🟡 **SEC-MED-13 (new) — `ImageUploadField`'s pre-existing hand-editable raw path `<input>` means SEC-MED-7's gap is reachable through entirely ordinary, shipped-UI staff use — no devtools, no crafted call, no malicious intent required — not only through a direct/crafted Server Action call as every prior entry on this finding assumed.** Read `ImageUploadField.tsx` in full this pass (confirmed genuinely unchanged by this diff, matching the dispatch's "Unchanged, per `/lead-dev`" list). Below the upload dropzone sits a second, always-rendered, always-enabled control (`:248-255`): `<input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="/images/client/product-tshirts.webp" .../>`, with its own comment: "Kept editable: the built-in photographs are repo paths, not uploads." This is a deliberate design choice (so the built-in stock-photo paths can be referenced without a real upload) — not a bug in `ImageUploadField` itself — but it means any string a staff member types or pastes there flows straight to `onChange(value)`, which in `AddProductForm`/`ProductRow` (`CategoryProductsManager.tsx:193,208,233,307,321,397`) is the component's `image` state, which reaches `createCategoryProduct`/`updateCategoryProduct`'s `sanitizeInput()` — still `.trim()`-only, no scheme allow-list, unchanged by this diff. **Every prior entry on SEC-MED-7 (T-003 original, T-003 re-review, T-005) explicitly assumed the only way to set an unsafe value was "a direct authenticated call... skips that pipeline entirely" / "an authenticated session bypassing the shipped UI"** — that assumption is corrected here: the shipped UI itself contains the bypass, in plain sight, one field below the uploader, and this is true for the pre-existing category-card image field too (same component), not only T-004's new product-image fields. **Impact ceiling is unchanged, and this is why the grade stays Medium, not High:** browsers do not execute `javascript:` or SVG-`data:` script content via `<img src>` (browser-enforced, not app-enforced — unchanged from SEC-MED-7's original analysis); worst case remains an attacker- or fat-finger-controlled `https://`/`data:`/malformed value rendering site-wide as a broken image, off-brand content, or a tracking pixel — no code execution, no PII (`products` carries none), no privilege change, still bounded to this project's existing authenticated-admin-only trust boundary. **What changes is who can trigger it and how easily** — from "a sophisticated or malicious insider crafting a direct call" to "any staff member, including entirely by accident (a stray paste into the wrong box)" — and **T-004 adds a second, independent write path** (`public.products`, via `createCategoryProduct`/`updateCategoryProduct`) inheriting a gap that, until now, only the category-card field carried.
   **Explicit ruling, as requested:** **Not a merge blocker for T-004.** This finding stays 🟡 Medium under this office's own Decision Rubric (bounded impact ceiling, same authenticated-admin-only trust boundary, no chaining to a worse outcome demonstrated) — Medium's own prescribed action is "file ticket; allow deploy," and this office's Refuse-If list covers weakened auth/RLS/CSP/CSRF, none of which apply here. **Not, by itself, a deploy blocker** — the next production deploy is already blocked by the standing SEC-HIGH-1/SEC-HIGH-2/SEC-HIGH-5 list regardless of this finding. **However:** this is the *second* time this office has recommended prioritizing T-014 ahead of/alongside T-004 (first at the T-005 entry above: "recommend `/pm` sequence T-014 before or alongside T-004's merge, not 'anytime'") — `docs/ROADMAP.md`'s Dependency Order still lists T-014 as "independent... can land anytime," and T-004 has now shipped ahead of it regardless. Given deploy is already gated on other items and T-014's fix is small and already fully scoped (add a scheme allow-list to `sanitizeInput()`, per SEC-MED-7's original mitigation text), **recommend `/pm`/the user treat T-014 as practically pre-deploy-required from here — batched with the standing High list for scheduling purposes even though it is not being reclassified to High** — rather than "anytime." This is a recommendation, not a block; if `/pm`/the user judge the bounded impact doesn't warrant that priority, that is their call to make, not an automatic gate this office is imposing.

**6. Client error text / injection — ✅ no new class, confirmed clean.** Grepped `CategoryProductsManager.tsx` (and read it in full) for `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `new Function(`: zero hits. Every `catch` block (`AddProductForm.handleAdd:222`, `ProductRow.persist:332`, `ProductRow.handleDelete:351`, `moveProduct:98`) sets a fixed `GENERIC_ERROR` constant, never a raw caught exception's message. Every `result.error` surfaced via `setError`/`setReorderError` is the typed `{ok:false, error}` string `products-actions.ts`'s four write functions already returned before this diff — a pattern this office reviewed and accepted at T-003 (SEC-INFO-15) and re-confirmed/extended to a second file at T-012 (SEC-MED-8, which is specifically about `settings-actions.ts::updateSettings`, not this file). `products-actions.ts`'s own `error: error.message` call sites (`:190,241,266,305`) are all **unchanged by this diff** — confirmed none of those lines appear in the `git diff` hunks. T-004 does not add a new instance of the SEC-MED-8 class; it only renders an already-reviewed, already-accepted string shape in a new place. Every error render site (`role="alert"` in all four locations — `CategoryProductsManager.tsx:160,264,431`, plus the not-bootstrapped notice at `:147`) interpolates the string as a plain JSX text child — React-escaped, not a raw-HTML sink.

**7. Confirmation and destructive UX — ✅ no gap.** `confirm()` (`ProductRow.handleDelete:341`) gates the only genuinely irreversible action (delete). Add, inline-edit-on-blur, image-replace, and reorder are all non-destructive and correctable by a further edit — matching this codebase's existing convention everywhere else `ObjectListEditor`/`ImageUploadField` are already used today (no confirmation on any edit anywhere in this admin) — not a new inconsistency introduced by this ticket. (Native `confirm()` versus a styled modal is a `/ui-ux` polish question, not a security one — no finding recorded here.)

**Standing findings — confirmed, not re-opened, status unaffected by this diff:**
- **SEC-HIGH-1** (Next.js CVE / **T-006**) and **SEC-HIGH-2** (Supabase Dashboard signup-toggle) — untouched; `package.json`/`package-lock.json` diff against `main` confirmed empty this pass. Both still block only the next production `deploy`, not this ticket's local merge.
- **SEC-HIGH-5** (`ReportsClient`/`CareersClient` zero try/catch) — untouched, out of this diff's files entirely. Still blocks the next `deploy`.
- **SEC-HIGH-4** — confirmed genuinely closed by T-012 (already merged into this branch's base, `d3e2bd7`); T-004's own delete-guard-message acceptance bullet depends on that closure, which held.
- **SEC-MED-5** — confirmed still stands, mechanism unaffected by this diff beyond gaining SEC-MED-12 as a third sibling instance (finding 3 above).
- **SEC-MED-7 / T-014** — confirmed still open, mechanism in `sanitizeInput()` itself unchanged by this diff; see finding 5/SEC-MED-13 above for the reachability correction.
- **SEC-MED-8** — confirmed not extended by this diff (finding 6 above); `products-actions.ts`'s existing instances of the pattern are unchanged.
- **SEC-MED-10** — untouched, out of this diff's files entirely.

**Overall verdict this pass:** ✅ **T-004 cleared.** Auth posture is unchanged and sound — every write still gated by the unmodified `requireUser()`, confirmed structurally unreachable around. The two questions this dispatch most wanted settled — category-identity round-trip through the new post-Save re-read, and whether product operations can ever touch `site_settings` — both check out clean, traced against actual (mostly unchanged) source rather than accepted on comment text. `getAllCategoryProducts()` is a safe, precedent-matching addition. No 🔴/🟠 finding against this ticket's own diff. Four 🟡 Medium findings: two genuinely new (SEC-MED-11 arbitrary `sort_order`, SEC-MED-12 its TOCTOU sibling — both crafted-call-only, not reachable via the shipped UI) and one reachability correction to an existing finding (SEC-MED-13/SEC-MED-7 — now confirmed reachable via ordinary shipped UI, not only a crafted call; explicit ruling above: does not block this merge or, by itself, the next deploy, but recommend elevating T-014's scheduling priority). Three 🟢 Info confirmations, one of which (SEC-INFO-20, cross-category reassignment) is a first-time structural confirmation of pre-existing T-003 behavior this dispatch specifically asked about. `npx tsc --noEmit` clean. Direct execution (11 synthetic cases) backs the `sort_order` finding rather than resting on a read-through alone. No commit made by this pass; no write issued against the live database; no crafted Server Action call issued against the running dev server; the dev server on `:3000` was not touched.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-004 may proceed to `/ui-ux` → `/qa static` → `/qa live` → the manual admin checklist (per `docs/ROADMAP.md`'s sequence for this ticket) → `/git Merge` per `docs/WORKFLOW.md` §3's Security-sensitive row. No blocking finding against this ticket's own diff. SEC-MED-11, SEC-MED-12, and SEC-MED-13 are recorded in §5 below as non-blocking fast-follows (SEC-MED-11/12 not yet filed, recommend folding into T-014; SEC-MED-13 updates the already-filed T-014's priority — see the explicit ruling above). The standing deploy-blocker list (SEC-HIGH-1, SEC-HIGH-2, SEC-HIGH-5) is unaffected by this ticket and remains open independent of T-004's own merge.

### 🔒 CSO Audit — 2026-09-28 — ticket-review:T-006

**Scope:** Dispatched focused review of **T-006** ("Bump `next` to close SEC-HIGH-1"), this office's own SEC-HIGH-1 closure ticket. Branch `fix/T-006-next-security-bump`, base `d0e655a`, **entirely uncommitted working tree**.
- **The diff under review:**
  - `package-lock.json`: 43 entries.
  - `next.config.ts`: +7 lines, adding `agentRules: false` and `logging: { serverFunctions: false }` with a comment on each.
  - `docs/TECH_STACK.md`: `/architect`'s 2026-09-28 decision, parts (a)–(f).
  - `docs/ROADMAP.md`: the checkbox only.
- **Not reviewed:** `docs/QA_REPORT.md` and `docs/qa-evidence/T-006/`, which `/qa` was writing in parallel. They were neither read nor touched.
- **Independently confirmed, not taken on the dispatch's word:**
  - `package.json` is byte-identical to `HEAD` (sha256 `26068c14…`) and still says `"next": "^16.1.6"`.
  - `git diff HEAD` is empty for `src/`, `tsconfig.json`, `.gitignore`, `vercel.json` and `.claude/launch.json`.
  - `AGENTS.md` matches both `HEAD` and `/lead-dev`'s pre-bump hash (`96aacc61…`), and no root `CLAUDE.md` exists.
- **Production context,** from local tracking refs only (no fetch, no remote touched): `origin/main` and `client/main` are both at `e8eace1`, whose lockfile pins `next@16.1.6`. Since then `main` has gained only `docs/ROADMAP.md` (`b948199`, `d0e655a`).

**Method: static and audit only, per the dispatch.**
- **Nothing started or rebuilt:** no server was started and no request went to `/qa`'s servers on :3000/:3001. No `npm run build`, which would rewrite the `.next/` that `/qa`'s `next start` is serving. No `npm install`, `update` or `ci`, so nothing under `node_modules` was written.
- **Network use was read-only:**
  - the npm registry (`npm audit`, `npm view`, `npm audit signatures` and the bulk advisory endpoint);
  - GitHub's public advisory and release API;
  - `curl` GETs of production: headers, plus 6 public pages and the 21 JS chunks they reference.
- **Type-check:** `npx tsc --noEmit --incremental false` (no `.tsbuildinfo` written) exited 0.
- **Secrets:** `.env*` was never read. Secret names came only from `.env.example` and `docs/TECH_STACK.md`.
- **Scratch files:** scripts and captures live only in the session scratchpad.

**1. `npm audit --omit=dev`, re-run by this office: ✅ `next` is gone.**
- 🟢 **SEC-INFO-23 — the `next` advisory range is cleared.**
  - **Totals:** 13 → 9. Critical 1 → 0, high 8 → 5, moderate 2 → 2, low 2 → 2, matching `/lead-dev`'s numbers exactly.
  - **No trace of the cleared set:** no `next` entry remains. A grep of the JSON report for `"next"`, `mq59-m269-xvcx`, `2xp9-vwfh-vxw4`, `p293-qw3h-jr36` and `vcvr-r3jv-pc5j` returns 0 hits.
  - **Before/after diff:** 39 advisory×package pairs cleared (all 30 of `next`'s, plus `sharp`, `postcss` and `nanoid`), and no advisory appears after the bump that wasn't there before.
  - **Registry cross-check** (the bulk advisory endpoint): `16.1.6` has 30 advisories, including `GHSA-mq59-m269-xvcx` (`>=16.0.1 <16.1.7`). `16.3.2` has 2. `16.3.3`, `16.3.5` and `16.3.6` have none.
  - **GitHub's advisory database agrees:** `GHSA-mq59-m269-xvcx` (CVE-2026-27978) is patched in `16.1.7`. Both critical RCEs named in SEC-HIGH-1 (`2xp9`, `p293`) are patched in `16.3.3`.

**2. Version floor: ✅ exactly `16.3.6`. `/architect`'s `GHSA-vcvr-r3jv-pc5j` claim holds when checked against its source. `next/og` appears nowhere.**
- 🟢 **SEC-INFO-24 — `16.3.6` is installed, and it is the lowest safe version.**
  - **Installed version:**
    - `npm ls next` shows `next@16.3.6`, one copy; `--all` shows no nested `next`.
    - `node_modules/next/package.json` says `16.3.6`.
    - `/lead-dev`'s post-bump build banner reads `Next.js 16.3.6 (Turbopack)`.
    - The one production-mode server running from this checkout during the pass reports `next-server (v16.3.6)`.
  - **No newer patch exists:** `npm view next dist-tags` gives `latest: 16.3.6` (published 2026-09-22). The only newer build is `16.4.0-canary.51`; there is no newer stable 16.x.
  - **The `vcvr` advisory, checked at its source.** `GHSA-vcvr-r3jv-pc5j` exists as a **published repository advisory** on `vercel/next.js`:
    - "Remote Code Execution in next/og ImageResponse", critical, CVE-2026-94545, published 2026-09-22.
    - Vulnerable `>= 16.2.0 < 16.3.6`; patched `16.3.6`.
    - The v16.3.6 release notes name it as that release's security fix.
  - **Why `npm audit` misses it:** it is **not** in GitHub's global advisory database yet (`/advisories/GHSA-vcvr-r3jv-pc5j` returns 404), so npm's feed doesn't carry it either. The bulk endpoint returns 0 advisories for `16.3.3`–`16.3.5`. A clean `npm audit` on those versions would have been a false clean, exactly as `/architect`'s (a) says. `16.3.6` is the lowest version outside both ranges.
  - **This app's exposure to `next/og`: none.**
    - No hits for `next/og`, `@vercel/og` or `ImageResponse` in `src/`, `next.config.ts` or `package.json`.
    - No code-based metadata image route exists; `src/app/icon.png` and `apple-icon.png` are static files.
    - No route handler emits images, and no `.next/server` output references the OG runtime.
  - **Production's position:** `16.1.6` sits below `vcvr`'s range, so that advisory never applied to the live site. It would have applied to any lockfile landing on `16.2.0`–`16.3.5`, which is why the floor matters (SEC-INFO-30).

**3. Lockfile integrity: ✅ clean. Every change traces to `next`, and the install-script surface shrank.**
- 🟢 **SEC-INFO-25 — the lockfile change is complete, registry-verified and scoped to `next`.**
  - **Shape of the diff:** `HEAD`'s lockfile (sha256 `27313b56…`, the same as `/lead-dev`'s `package-lock.pre.json`) against the working tree gives **43 entries: 2 added, 1 removed, 40 changed.** That matches `/lead-dev`'s count. `lockfileVersion` is 3 on both sides, and the root entry is identical.
  - **Registry and integrity:**
    - **Tarball paths:** each of the 42 added or changed entries resolves to `https://registry.npmjs.org/<name>/-/<name>-<version>.tgz`, with the path checked against name and version, not just the host.
    - **Hashes:** each carries a `sha512` integrity, and all 42 are **byte-identical to the registry's current `dist.integrity`**, fetched fresh with `npm view` (0 mismatches). All 42 carry npm provenance attestations on the registry.
    - **Signatures:** `npm audit signatures` found **415/415 installed packages with verified registry signatures, 0 invalid and 0 missing.** 67 packages have verified attestations, including `next@16.3.6`, `sharp@0.35.5`, `postcss@8.5.23`, `nanoid@3.3.19`, `@emnapi/runtime@1.11.3`, `@swc/helpers@0.5.23`, `@next/env` and `@next/swc-darwin-arm64`.
    - **Whole lockfile:** across the *entire* post-bump lockfile there are 0 non-registry `resolved` values and 0 entries without `integrity`.
  - **Install scripts:** entries with `hasInstallScript` went **3 → 2**, because `sharp@0.35.5` no longer has one. The other two, `fsevents` and `unrs-resolver`, are pre-existing and unchanged. None of the 42 manifests has a `preinstall`, `install`, `postinstall` or `prepare` script, or a `gypfile`. Checked twice: against the registry and against the installed `package.json` files.
  - **Every dependency edge traced:**
    - `next@16.3.6` pins `@next/env` and the `@next/swc-*` binaries at `16.3.6`, `@swc/helpers@0.5.23` exactly, and `postcss@8.5.23` exactly. Its old pin, `8.4.31`, was removed and now dedupes with the root copy, still inside the root's `^8.5.6`. It asks for `sharp ^0.35.4`.
    - `sharp@0.35.5` asks for `semver ^7.8.5`, so its nested copy moves `7.7.4 → 7.8.5`. It also asks for the `@img/*@0.35.5` and `@img/sharp-libvips-*@1.3.4` binaries and the two new wrapper packages.
    - `@img/sharp-wasm32@0.35.5` asks for `@emnapi/runtime ^1.11.3` (`1.8.1 → 1.11.3`).
    - `postcss@8.5.23` asks for `nanoid ^3.3.16` (`3.3.11 → 3.3.19`).
    - Nothing outside `next`'s tree moved.
  - **Two corrections to the dispatch's list, neither a concern:**
    - Only 2 entries are genuinely new: `@img/sharp-freebsd-wasm32` (`os: freebsd`) and `@img/sharp-webcontainers-wasm32` (`cpu: wasm32`). Both are platform-gated, so neither is installed here or on Vercel's linux-x64.
    - `@emnapi/runtime` and `sharp`'s nested `semver` are **version changes to entries that already existed**, not new packages.
- 🟢 **SEC-INFO-26 — `@img/sharp-wasm32@0.35.5` dropped its `cpu: ["wasm32"]` restriction; version 0.34.5 had one.**
  - **Why it's installed anyway:** it is now reached only through the two platform-gated wrappers, but npm installs it on platforms that don't match. `npm ls` flags both it and `@emnapi/runtime` as `extraneous`. Both were written to disk at 20:45 by `npm update` (8.9 MB), and `npm ls --all` still exits 0. Vercel's `npm install` should behave the same way.
  - **It doesn't run:** `sharp` 0.35.5 loads the native per-platform binding first, and falls back to `@img/sharp-wasm32` only if that load fails (`node_modules/sharp/dist/sharp.cjs`, lines 38–107). The package comes from the same `@img` publisher scope, is registry-pinned and provenance-attested, and has no install script.
  - **The only effect is size:** the current build's `.next/next-server.js.nft.json` output trace includes it and `@emnapi/runtime`, so functions get larger. That's a note for `/devops`, not a security finding. No action.

**4. `next.config.ts`: ✅ both keys do exactly what they claim, neither changes production behavior, and the redirects are untouched.** Traced through the installed 16.3.6 source, not the docs alone.
- 🟢 **SEC-INFO-27 (a) — `logging: { serverFunctions: false }` completely disables the framework's argument logging.**
  - **Default:** `serverFunctions: true` (`config-shared.js:137`), so on 16.3.6 `next dev` would log every Server Function call if this key were absent.
  - **Producer:** there is exactly one, `server/app-render/action-handler.js:822`. It builds `{functionName, args: boundActionArguments, location}` only when `process.env.NODE_ENV === 'development' && ctx.renderOpts.logServerFunctions`.
  - **Consumer:** there is exactly one, `server/dev/log-requests.js:47-50`, which writes `ƒ name(args)` to stdout.
  - **The switch:** `logServerFunctions` is `Boolean(nextConfig.logging.serverFunctions)` (`base-server.js:424`, `build/templates/app-page-runtime.js:561`), so the key turns it off. The serialized build config shows `logging: {"serverFunctions":false,"browserToTerminal":"warn"}`, so the other defaults survive.
  - **How arguments would print** (measured with Next's own `formatArgs`; no server involved):
    - A `FormData` argument renders as `{}`. `loginAction` and the three public form actions all take `(prevState, FormData)`. So even without the key, 16.3.6 would have printed `ƒ loginAction(null, {})`: no password and no form field.
    - A **plain-object** argument prints its first three keys, sorted alphabetically, verbatim. A test object with `name`, `email`, `phone` and `message` printed `email`, `message` and `name`.
  - **Verdict:** for the password and public-form PII, the key is defense in depth today. It becomes load-bearing if a future patch starts expanding `FormData`, and for any action that takes object arguments. It makes the outcome independent of the formatter, which is what `/architect`'s (c) intended. Keep it.
  - **What no Next flag covers:** see SEC-INFO-29.
- 🟢 **SEC-INFO-27 (b) — `agentRules: false` completely prevents the `AGENTS.md`/`CLAUDE.md` writes.**
  - **One writer:** in the whole `next` package, compiled chunks included, the only code that writes either file is `server/lib/generate-agent-files.js`. No `@next/*` package writes `AGENTS.md`.
  - **One caller, gated twice:** the only call path is `server/lib/start-server.js:418-429` → `app-info-log.ensureAgentRulesForDev()`. That call sits inside both `if (isDev)` and `if (initResult.agentRules !== false)`, and runs after `next.config.ts` has loaded, so it cannot fire before the key is read.
  - **No override:** `initResult.agentRules` is `config.agentRules` passed straight through (`router-server.js:751`), and no environment variable feeds into it.
  - **What it would have done in this repo:** `AGENTS.md` exists without the managed block and there's no root `CLAUDE.md`. The code path would therefore have **appended the block to `AGENTS.md` and skipped `CLAUDE.md`**. It creates `CLAUDE.md` only when neither file exists, so `/architect`'s "also generates a `CLAUDE.md`" doesn't apply here. `/qa`'s check (f)3 covers both files anyway.
  - **Why blocking it matters:** the injected block addresses agents with instructions ("committing it with your work keeps the tree clean"). That's prompt-injection-shaped content entering this repo's governance file, so blocking it is correct.
  - **State at time of check:**
    - `AGENTS.md` matches `HEAD` (mtime 2026-08-10); there's no root `CLAUDE.md` and no `nextjs-agent-rules` marker.
    - The only 16.3.6 process running from this checkout was a production `next-server` on :3001, which never reaches this branch.
    - No agent-started 16.3.6 `next dev` was observed, so the dev-mode empirical confirmation remains `/qa`'s check (f)3.
- 🟢 **SEC-INFO-27 (c) — no production behavior change; the types are clean; the redirects are untouched.**
  - **Dev-only reads:** `agentRules` is read only inside `start-server.js`'s `isDev` branch, and argument logging is hard-gated on `NODE_ENV === 'development'`.
  - **Serialized but inert:** both keys *are* serialized into `.next/required-server-files.json` (`config.agentRules: false`, `config.logging: {…}`). That's a byte-level difference in the manifest only; nothing in `next start` or Vercel's runtime acts on them.
  - **Types:** both keys are declared in 16.3.6's own `NextConfig` type (`config-shared.d.ts:1574`, `:296`), so no cast is needed.
  - **Redirects and routing:**
    - The diff is purely additive, above `async redirects()`, and all four redirect rules are byte-identical.
    - `/lead-dev`'s pre- and post-bump route tables are identical.
    - The built `middleware-manifest.json` still registers the admin-gate middleware with a matcher identical to `src/middleware.ts:10`.
- 🟢 **SEC-INFO-28 — the `GHSA-mq59-m269-xvcx` fix is present and holds for this app, verified statically.**
  - **The check:** `action-handler.js:430` maps `Origin: null` to the literal host `'null'`, which never equals the request host. The request then reaches `isCsrfOriginAllowed('null', allowedOrigins = [])`, which returns `false`, giving "Invalid Server Actions request.": a 500 for fetch-based actions, thrown otherwise.
  - **This app's config:** no `serverActions.allowedOrigins` anywhere, so nothing widens that check.
  - **Live test declined:** `/architect`'s (f) offered an optional live `Origin: null` negative test. This dispatch is static-only, and the code path is unambiguous.
- 🟢 **SEC-INFO-29 (new; pre-existing; not T-006) — an app-authored log line that no Next flag can silence.**
  - **The line:** `src/app/actions/form-actions.ts:27` runs `` console.error(`${type} submission error:`, error) `` on the whole Supabase `PostgrestError`. That prints in `next dev` **and in production**, where it lands in Vercel's runtime logs.
  - **Why it could leak PII:** a Postgres NOT NULL or CHECK violation includes the failing row in its `details` ("Failing row contains (…)"). Here that row includes the `payload` JSONB: the submitter's name, email, phone and message.
  - **Theoretical today:** the reference schema has no CHECK constraint on `submissions`. `type` and `status` are hardcoded, and `payload` is always an object. The realistic failures, RLS denial and network errors, carry no row data. Caveat: the live database may differ from `supabase-schema.sql` (`docs/WORKFLOW.md` §8 row 2).
  - **Mitigation:** log only `error.code` and `error.message`, never `details` or the whole object. Recommend folding into **T-018**, which already builds the "log raw server-side, show generic" helper. T-018 should apply that helper's logging half to this public-form path as well.
  - **Everything else is clean:** no other `console.*` call in `src/` logs request data (the rest log read or upload errors that carry no user input). Client components log nothing, so the `browserToTerminal: 'warn'` default forwards no PII today.

**5. The 9 remaining audit findings: ✅ agree with `/architect`'s (e).** They are not T-006 scope and belong in a separate, low-priority, lockfile-only ticket. They're graded by *this app's* exposure, not by the registry's label.
- 🟢 **SEC-INFO-31 — the 9 toolchain advisories: none reachable at runtime. 4 run at build time on project-controlled input; 5 are lint-only.** Four independent checks:
  - **Import graph:** nothing in `src/` imports any of them. `next`'s runtime `server/` and `client/` code never loads `compiled/browserslist`, which is `next`'s only route to `baseline-browser-mapping`.
  - **Output traces:** none appears in any of the build's 31 `.nft.json` files. The pattern was validated first: it finds `next` in all 31 and `sharp` in 1.
  - **Bundled chunks:** for six of the nine (the four build-time packages plus `js-yaml` and `flatted`), a distinctive source string is absent from all of `.next/server`, middleware and edge output included. Positive control: `supabase-js` was found in 14 files. Each probe string was first confirmed present in its own package.
  - **Lint never runs in the build:** `next build` in 16.3.6 has no ESLint step (none in `build/index.js`, none in `/lead-dev`'s build log), and `npm run lint` is broken anyway (Known Trap #10).

| Package (registry label) | Reached via | Runs where | Graded |
|---|---|---|---|
| `browserslist` 4.28.1 (high) | `autoprefixer`; Babel via ESLint | `next build` (CSS) + lint | 🟢 Low |
| `picomatch` 2.3.1 / 4.0.3 (high) | Tailwind's glob/watch stack; `tinyglobby` via the ESLint resolver | `next build` (CSS) + lint | 🟢 Low |
| `baseline-browser-mapping` 2.10.0 (moderate) | `next` itself (`^2.9.19`, via its compiled browserslist) and `browserslist` | `next build` only | 🟢 Low |
| `postcss-selector-parser` 6.1.2 (low) | Tailwind → `postcss-nested` | `next build` (CSS) | 🟢 Low |
| `brace-expansion` 1.1.12 / 5.0.4 (high) | `minimatch` (ESLint, `typescript-estree`) | lint only | 🟢 Info |
| `flatted` 3.3.3 (high) | ESLint cache (`flat-cache`) | lint only | 🟢 Info |
| `js-yaml` 4.1.1 (high) | `@eslint/eslintrc` | lint only | 🟢 Info |
| `@humanfs/node` 0.16.7 (moderate) | `eslint` | lint only | 🟢 Info |
| `@babel/core` 7.29.0 (low) | `eslint-plugin-react-hooks` | lint only | 🟢 Info |

  - **Why nothing grades above Low:** every build-time input these parsers and globbers see is repo content: CSS, `tailwind.config.ts` globs and the browserslist config. Anyone who can feed them hostile input can already edit `next.config.ts` and run arbitrary code in the build, so these advisories add no reachable risk. The five lint-only packages never run on Vercel at all.
  - **One precision on `/architect`'s table:** `baseline-browser-mapping` is also a direct dependency of `next`, so strictly it sits inside "`next`'s own tree". `npm update next` left it because `2.10.0` already satisfies `^2.9.19`. Deferring it is still right, because its only consumer inside `next` runs at build time.
  - **Why the follow-up shouldn't wait forever:** nine toolchain "highs" in every `npm audit --omit=dev` run is alert fatigue for the pre-deploy audit gate, and a genuine runtime advisory could hide among them.
    - **The lasting fix:** `/architect`'s optional (e) item, moving build-only and lint-only packages to `devDependencies` so that `--omit=dev` reflects the real runtime surface.
    - **Recommendation:** `/pm` includes it in the follow-up, subject to `/architect`'s sign-off.
- 🟢 **SEC-INFO-30 — only the lockfile holds the `16.3.6` floor.**
  - **Why neither the audit nor the range catches a regression:** `vcvr` is not in the audit feed, so a clean `npm audit` does **not** prove the floor. `package.json` still accepts `^16.1.6`, so a lockfile restored below `16.3.6` would install without complaint.
  - **The gap in the current reasoning:** `/architect` rejected raising the range because regenerating the lockfile resolves to the newest `^16`. That covers regeneration, but not the realistic failure: a **bad merge of `package-lock.json`**.
  - **First ticket at risk:** the toolchain follow-up. It is itself lockfile-only, and it will conflict with T-006 if its branch was cut before T-006 merged.
  - **Mitigation:**
    - Every lockfile-touching ticket branches from `main` after T-006 merges.
    - Its review re-runs `npm ls next` and confirms `16.3.6` or higher, alongside the audit, until `vcvr` reaches GitHub's global database.
    - Recommend `/architect` reconsider raising the range to `^16.3.6` inside that same follow-up. Then `npm ci` fails loudly on any lockfile below the floor, turning a silent regression into a broken build. This is a technical call for `/architect`, not a Counter: T-006's decision was scoped to lockfile-only.
  - **Runbook:** item 7 in §7 covers the response.

**6. SEC-HIGH-1: ✅ closed in code. Production stays exposed until the next user-typed deploy.**
- **Both closure conditions are met:**
  - T-006's own acceptance: "`/cso review` re-runs `npm audit --omit=dev` and confirms the SEC-HIGH-1 advisory is gone".
  - `/architect`'s extra condition: `npm ls next` shows exactly `16.3.6`.
- **Production today:** `origin`/`client` sit at `e8eace1` on `next@16.1.6`. That version is inside the full 30-advisory range, including the null-origin Server Actions CSRF bypass that fronts every live Server Action, T-004's product create, update, delete and reorder included. The two critical RCEs are still contextualized as unreachable here, per the 2026-09-26 entry.
- **When it ends:** the exposure lasts until the user types "deploy" and `/git` pushes a `main` that contains the T-006 merge to both remotes (`docs/WORKFLOW.md` §6).
- **What the closure is bound to:** `package-lock.json` sha256 `6a026457868784a9…` and `next.config.ts` sha256 `6bf8389d6804cfc4…`. If `/qa`'s findings force either file to change before merge, the closure lapses until `npm ls next` and `npm audit --omit=dev` are re-run on the new tree.
- **Recorded in §5.**

**7. SEC-HIGH-2: still open. The user-reported fix is not yet effective. It stays 🟠 High, and its precondition is now observed in the unsafe state.**
- **What's recorded:**
  - The user reports turning off "Allow new users to sign up".
  - The orchestrator's read-only check of the live project's public `/auth/v1/settings` (project ref starting `hgrfdzbv…`) still returned **`disable_signup: false` more than 20 minutes later.**
  - This office did **not** re-query the endpoint: that needs the anon key, and `.env*` is never read. No auth action of any kind was attempted.
- **Any user is an admin today.** This pass re-read the admin gate:
  - `src/lib/supabase/middleware.ts:22-28` lets **any** authenticated user into `/admin/*`; there is no role, claim or allowlist check.
  - `requireUser()` and `updateSettings` do the same, with a bare `getUser()`, and 12 other write functions have no check at all (SEC-MED-10).
  - So a self-registered account passes every app-level check. That's also why T-015's `getUser()` additions don't touch this finding.
- **The live grants are likely wider than the reference file:**
  - **Evidence:** `/admin/submissions` (`src/app/admin/(dashboard)/submissions/page.tsx:17-18`) reads `submissions.select("*")` through the session-bound client. For the client's inbox to show any rows, the live database must grant `authenticated` a SELECT on `submissions`. The reference file shows only `anon` policies (`docs/WORKFLOW.md` §8 row 2).
  - **What a self-registered account would get:** full admin UI access, CMS, jobs, reports, leaders and product writes, and very probably upload and delete rights in the public `media` bucket (storage policies aren't in the repo).
  - **And, if the inbox works as shipped:** every contact, career and grievance submission, including grievances the site promises to review "confidentially".
- **Why this is 🟠 and not 🔴:** the missing piece for an outsider is the anon key, and this app has never shipped it to a browser (SEC-INFO-32).
  - **Who can still do it:** exploitation today needs the key from somewhere else, such as an insider, a former contractor, a leaked env file or an agent transcript. That's this rubric's "exploitable with effort", so 🟠 stands.
  - **The ex-admin case:** the §2 "disgruntled ex-admin" already has the key. While signups are open, **deleting that person's account does not lock them out.** They can register a new one.
  - **When it becomes 🔴:** the moment any change ships the anon key to a browser. SEC-INFO-32 records the guardrail.
  - **How long it has been open:** Supabase projects start with signups on, so the window may cover the site's whole life. That's why checking Authentication → Users is not optional.
- **What the user must do now.** It's a dashboard action; no code or deploy is needed.
  1. Open the Supabase project whose dashboard URL contains the ref starting **`hgrfdzbv`**. Changing the setting in a different project is the most likely reason the endpoint didn't change.
  2. Go to Authentication → Sign In / Providers (older dashboards: Authentication → Settings). Turn **off** "Allow new users to sign up", then click **Save**.
  3. **Don't** disable the Email provider itself. The client's admin login is email plus password and would be locked out.
  4. Go to Authentication → Users. Delete any account the client doesn't recognize, noting each one's created-at and last-sign-in times first.
  5. If any unknown account exists, follow §7 runbook item 6 (audit every `authenticated`-writable table for changes since that account was created), and treat `submissions` as potentially read.
  6. The orchestrator then re-reads `/auth/v1/settings`. SEC-HIGH-2 closes only when it returns `disable_signup: true` **and** the Users review is done.
- **Also record on that same read:** `mailer_autoconfirm`, and the `external` block (`email`, `phone`, `anonymous_users`). If **anonymous sign-ins** are on, Supabase issues anonymous users the `authenticated` role, which opens every `USING (true)` policy to them without even an email address. That setting must be off too.
- **Structural fix (recommend `/pm` file it; no such ticket exists in `docs/ROADMAP.md` today):** stop the dashboard toggle from being the single point of failure.
  - **Approach:** scope admin authorization to an explicit admin identity. One option is an `app_metadata.role = 'admin'` claim, which only the dashboard or the service role can set. Another is an allowlist table.
  - **Apply it in three places:**
    - the `/admin` middleware gate;
    - the shared auth helper that write actions use;
    - every `authenticated` RLS policy, replacing `USING (true)` and `WITH CHECK (true)` with a predicate on that identity.
  - **Sequence:** it's schema-touching and sensitive, so `/architect Review schema` → the user applies the SQL → `/lead-dev` → `/cso review` → `/qa`.
  - **Rank:** above T-015 and T-018, because it closes the class of bug rather than one instance.
- 🟢 **SEC-INFO-32 (new) — this app has never shipped the Supabase anon key to a browser. This corrects a premise in this document's earlier entries.**
  - **Where it isn't:**
    - Nothing in `src/` imports the browser client, `src/lib/supabase/client.ts`, which is dead code. No historical commit's client component references `createBrowserClient`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` or that module.
    - Key-shaped strings (HS256-JWT or `sb_publishable_`) appear **nowhere** in the local build's client output (`.next/static`, all chunks including admin), in prerendered HTML or RSC payloads, in `public/`, in tracked files, or anywhere in git history (`git log -S` found 0 commits).
    - Live production matches: 6 public pages (HTML plus inline RSC) and all 21 JS chunks they reference (919 KB) show 0 key-shaped matches, no `apikey` string, and no `supabase.co` host in any JS. The host appears only in one page's HTML, as storage image URLs, so the project ref is public.
    - The value appears only in 5 server-side build files, where `NEXT_PUBLIC_*` values get inlined into server code.
  - **What this corrects:** earlier entries said "every visitor already holds" the key (the T-001 SEC-HIGH-2 text, the T-005 entry's item 2, and the T-004 entry's SEC-INFO-21). Their *conclusions* stand, because they treated the key as non-secret, which remains Supabase's model and the only safe assumption. Their *premise* was factually wrong for this deployment.
  - **The guardrail:** until SEC-HIGH-2 and its structural fix are both closed, **no change may ship the anon key to a browser.** That covers importing `src/lib/supabase/client.ts` into any `"use client"` file, and passing the key as a prop to a client component. Either would make SEC-HIGH-2 exploitable by anyone on the internet at once, which is 🔴.
  - **Where it should be recorded:** recommend `/archivist` add this as a Known Trap in `docs/MEMORY_BANK.md`.

**Standing items (status only):**
- **Untouched by T-006:** SEC-HIGH-5 (T-015) and every open 🟡. T-006's diff contains no application code.
- **SEC-MED-2 (T-008) re-checked against production**, as the self-check requires. `curl -sI` of `/` and `/admin/login` on `www.fashionasialtd.com` still returns only `strict-transport-security: max-age=63072000`: no `includeSubDomains`, no CSP, XFO, XCTO, Referrer-Policy or Permissions-Policy. `/` still sends `x-powered-by: Next.js`. Unchanged since 2026-09-26, still open.

**Secrets hygiene (this pass):**
- **Git history:** no `.env*`, `*.pem`, `*.key`, `.ssh_key_*` or `cookies.txt` file has ever been committed (`git log --all --full-history` is empty).
- **T-006's four changed files:** the secret-shape grep hit only `docs/TECH_STACK.md:158`. That's pre-existing T-001 prose explaining that *no* `service_role` grant was made, and it's outside T-006's hunks.
- **Repo-wide:** the only hits are this file's own `password = "…"` placeholders.
- 🟡 **SEC-MED-14 (new; pre-existing; not T-006; user action) — a plaintext GitHub token sits in local `.git/config`.**
  - **What's there:** a count-only grep found two token-shaped strings. A redacted listing located them without printing any value:
    - an inline `credential.helper` that echoes a hardcoded `ghp_` token for `happierbangladesh`;
    - a remote URL for `github.com/happierbangladesh/Fashion_Asia_Limited.git` with credentials embedded in it.
  - **History:** this is the token reported to the user out of band on 2026-09-26 and scoped out of that review. §6 records no rotation or risk acceptance for it. It isn't committed, so the Refuse-If on committed secrets doesn't apply.
  - **Why it matters:**
    - **Blast radius:** Vercel builds production from GitHub `main`, so anyone holding a push token for `origin` can ship arbitrary code to the live site.
    - **Leak paths:** it can leak without any remote attack. `git config --list` prints the helper, `git remote -v` prints the URL with its credentials, and either command in any agent session copies the token into a stored transcript.
  - **Grade:** 🟡, a defense-in-depth weakness with no direct remote exploit path.
  - **Mitigation (user):**
    - Revoke the token and issue a **fine-grained** PAT limited to this one repository, with Contents read/write only and an expiry.
    - Store it in the macOS Keychain (`credential-osxkeychain`) or through `gh auth setup-git`.
    - Remove the inline helper and strip the credentials from the remote URL.
    - Record the rotation date in §6.
  - **Blocking:** doesn't block T-006's merge or any deploy.

**Doc-owner notes (not security findings):**
- **Stale versions in `docs/TECH_STACK.md`,** for `/architect` or `/onboard`:
  - Line 15 still says "PostCSS 8.5.6", but the lockfile now pins `8.5.23`.
  - Line 139 says `@supabase/supabase-js 2.98.0`. The lockfile has pinned `2.112.2` since `7ac5070` (2026-08-10), and that's what is installed.
- **Erratum, requested by `/pm` (ROADMAP fourth pass):** SEC-MED-10's headline "10 write functions" should read **12**, as its own per-file list (7 + 2 + 3) and its §5 row show. T-015 and T-019 together cover all 12.

**Overall verdict this pass:** ✅ **T-006 cleared. SEC-HIGH-1 is closed in code**, backed by evidence beyond the audit count alone:
- `next` is gone from the audit. This office re-ran it independently and cross-checked it against the registry's own advisory feed.
- `npm ls next` shows exactly `16.3.6`.
- `/architect`'s `vcvr` floor reasoning holds against the source advisory and the release notes, and the app has no `next/og` usage at all.
- All 43 lockfile changes trace to `next`. All 42 non-removals match the registry's hashes, carry provenance and pass signature verification.
- The install-script surface shrank from 3 packages to 2.
- Both `next.config.ts` keys were traced to their only code paths in 16.3.6 and do what they claim, in dev only. Redirects, the route table and the middleware matcher are unchanged.

**Findings tally:**
- **Against T-006's own diff:** no new 🔴 or 🟠.
- **SEC-HIGH-2:** stays 🟠 and open; the user-reported fix is not yet effective. It is independent of T-006 and needs the user's dashboard action now.
- **New 🟡:** SEC-MED-14, pre-existing, user action.
- **New 🟢:** SEC-INFO-23 through SEC-INFO-32.

**Actions taken:** no commit, no source edit, no server started, no remote touched, no auth action, no access to the live database.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-006 may proceed to `/git Merge` once `/qa live` is green: T-006's production-build acceptance plus `/architect`'s (f) checks, above all (f)3 (`AGENTS.md`/`CLAUDE.md` after a dev run) and (f)4 (the unauthenticated admin probes). Two conditions:
- The merged `package-lock.json` and `next.config.ts` must match the sha256 values in item 6.
- The `docs/ROADMAP.md` diff must stay checkbox-only.

**Pre-deploy position, stated now to save a round trip:**
- **What the next deploy contains:** since `e8eace1`, `main` contains only `docs/ROADMAP.md`. After T-006 merges, deploying `main` = `d0e655a` + the T-006 merge (with the hashes above) adds no new sensitive surface and removes the SEC-HIGH-1 range.
- **Cleared from this office without another pass.** The production headers, dependency audit and secrets checks this gate needs were all run in this pass.
- **Not held for SEC-HIGH-2 or SEC-HIGH-5.** Both are 🟠, have been live since before `e8eace1`'s go-live and are not made worse by this release. Holding back a pure security patch would lengthen SEC-HIGH-1's exposure without shortening either of theirs.
- **Recommended order:** the user does the SEC-HIGH-2 dashboard fix **now**; it needs no deploy and takes minutes. Then deploy T-006 at the next user-typed "deploy" (`docs/WORKFLOW.md` §6).

### 🔒 CSO Audit — 2026-09-28 — ticket-review:T-015

**Scope:** Dispatched focused review of **T-015** ("Surface failures from report, job and leader CRUD instead of failing silently, and add the session check those actions skip"). It closes this office's **SEC-HIGH-5** and 10 of **SEC-MED-10**'s 12 functions. Branch `fix/T-015-admin-crud-errors`, base `b637a86` (`main` after T-006), **entirely uncommitted working tree**.
- **The diff under review** (5 files, +495/−117):
  - `src/app/actions/settings-actions.ts` and `src/app/actions/jobs-actions.ts`;
  - `ReportsClient.tsx`, `CareersClient.tsx`, and `WhoWeAreClient.tsx` (leader handlers only).
- **Independently confirmed:**
  - no untracked files;
  - `git diff HEAD` is empty for `package.json`, `package-lock.json`, `next.config.ts`, `src/middleware.ts`, `src/lib/`, `src/components/`, `db/`, `supabase-schema.sql`, `.env.example` and the other four action files;
  - `docs/ROADMAP.md` is untouched.

**Method: static only, per the dispatch.**
- **Read in full, not just the hunks:** all five files, plus:
  - `products-actions.ts` (the cited precedent);
  - the three admin `page.tsx` loaders;
  - `supabase-schema.sql`'s policies;
  - the callers of the two other throwing admin actions.
- **Library behavior traced in installed source, not docs:**
  - `@supabase/postgrest-js` 2.112.2 (`maybeSingle`);
  - `@supabase/storage-js` 2.112.2 (`upload`, `getPublicUrl`);
  - Next 16.3.6 `server/app-render/action-handler.js` (body limit, both multipart parsers) and `client/components/app-router-instance.js` (action queue);
  - React 19.2.4 `useTransition`.
- **One offline experiment** in the session scratchpad: how Node's `Request.formData()` keeps a crafted filename, and where storage-js's URL for it resolves. Placeholder host, no network.
- **Type-check:** `npx tsc --noEmit --incremental false` exited 0.
- **Nothing started or written:** no server, no build, no Supabase request, no auth action, no commit.

**1. SEC-HIGH-5: ✅ closed in code. No `throw` is left, and every call site handles the result.**
- **No throw:** the ten functions contain no `throw` statement. Each returns `ActionResult`, `UploadFileResult` or `JobActionResult`, and `tsc` enforces the return union on every path.
- **Every call site, enumerated by grep across `src/`:** 8 sites, 10 calls (two ternaries call two functions each). All are in the three reviewed clients.

| Call site | Handler | On `ok: false` | On a throw |
|---|---|---|---|
| `ReportsClient.tsx:76` `uploadFile` | `handleFileUpload` | Alert under the upload; file input cleared so the same file can be retried | Generic fallback |
| `ReportsClient.tsx:111` `createReport` / `updateReport` | `handleSave` | Alert above Save; modal stays open, input intact, no reload | Generic fallback |
| `ReportsClient.tsx:131` `deleteReport` | `handleDelete` | Alert in a row under the failed row | Generic fallback |
| `CareersClient.tsx:63` `createJob` / `updateJob` | `handleSave` | Alert above Save; modal stays open, no reload | Generic fallback |
| `CareersClient.tsx:83` `deleteJob` | `handleDelete` | Alert under the failed row | Generic fallback |
| `WhoWeAreClient.tsx:66` `createLeader` | `addLeader` | Alert beside Add Leader | Generic fallback |
| `WhoWeAreClient.tsx:82` `deleteLeader` | `removeLeader` | Alert in that leader's card | Generic fallback |
| `WhoWeAreClient.tsx:102` `updateLeader` | `saveLeader` | Alert in that leader's card (success stays silent, as before) | Generic fallback |

- **Outside the `try`:** only state setters and `confirm()`, neither of which rejects. Nothing that can reject can reach a transition's error path.
- **Correction to SEC-HIGH-5's 2026-09-27 text.** It said the modal "just sits there" after a failure. That's wrong for React 19:
  - In 19.2.4, `useTransition` stores the async callback's promise. `updateTransition` reads it with `useThenable()`, which rethrows a rejection during render into the nearest error boundary.
  - This app has no `error.tsx` or `global-error.tsx` anywhere, so a failed save replaced the admin page with Next's generic error screen, as `/lead-dev` said.
  - The conclusion stands: no actionable reason, and the edit was lost.
- **Leaders are in scope, confirmed.** Before this diff, `WhoWeAreClient`'s three leader handlers had the same unguarded shape, and `saveLeader` gave no signal either way (`/pm`'s ROADMAP note was right).
- **Production:** still affected until a user-typed deploy of a `main` that contains T-015.

**2. SEC-MED-10: ✅ 10 of 12 closed in code. The other two are T-019, and nothing else was missed.**
- **Order, per function** (line of `getUser()` < line of the first data or storage call):

  | Function | `getUser()` | First call |
  |---|---|---|
  | `createReport` | 276 | 285 |
  | `updateReport` | 303 | 314 |
  | `deleteReport` | 328 | 333 |
  | `createLeader` | 355 | 358 |
  | `updateLeader` | 373 | 378 |
  | `deleteLeader` | 394 | 399 |
  | `uploadFile` | 414 | 423 |
  | `createJob` | 90 | 93 |
  | `updateJob` | 108 | 114 |
  | `deleteJob` | 128 | 133 |

  - Only `createClient()` runs before the check, and it makes no request.
  - The "Missing … id." and "No file provided." checks come after it.
- **The helper isn't an endpoint.** `requireUser()` is not exported, so it can't be called as an action.
  - If a later refactor exports it from a `"use server"` file in order to share it, it becomes a callable action.
- **Fails closed.** `getUser()` validates the token with Supabase Auth. A missing, malformed, forged or expired cookie, or a failed refresh, all yield `user = null` and therefore the session-expired result.
  - Neither the pattern nor its string is new: `updateSettings` and `products-actions.ts` have used both in production since the 2026-09-28 deploy.
- **Whole-surface sweep.** All 32 exported functions in the six `"use server"` modules were checked (all are function declarations; no arrow or `const` exports). For each, the line of `getUser()` was compared with the first `.from()` or `.storage` call.
  - **Still unchecked writers:** only `addMediaAction` and `deleteMediaAction`, both in T-019.
  - **The other unchecked exports are public by design:**
    - seven reads gated by `anon` RLS (`getSettings`, `getReports`, `getLeaders`, `getJobs`, `getMediaAssets`, `getCategoryProducts`, `getAllCategoryProducts`);
    - `loginAction` and `logoutAction`;
    - the three public form actions.

**3. `.select("id").maybeSingle()`: ✅ RLS-neutral, as the code comment says. "Not found" only ever means nothing was written.**
- **The SQL.** PostgREST turns `.eq("id", …)` into `WHERE id = $1`. A WHERE that reads a column already requires SELECT, so before T-015 Postgres was already applying the table's SELECT policies to these UPDATEs and DELETEs in two ways:
  - as a filter on existing rows, so an invisible row is skipped rather than raising an error;
  - for UPDATE, as a check on the new row, so a new row that fails it raises "new row violates row-level security policy" and aborts the statement.
  - `RETURNING id` reads the same column, so it requires nothing new.
- **Consequence, under any policy shape.** A row the `authenticated` SELECT policy can't see was never writable, before or after T-015. RETURNING returns exactly the rows written, with no filter afterwards, so a write can never succeed and report "not found". What T-015 changes is only the report: a zero-row write used to return success silently, and now says "not found".
- **Client side (postgrest-js 2.112.2).** `maybeSingle()` sends no singular `Accept` header; it's only a client-side count. Zero rows gives `data: null`, which the code maps to not-found. `id` is the primary key on all three tables, so two rows can't match.
  - **Guardrail:** don't copy this pattern onto a non-unique filter. More than one matched row would commit, then report PGRST116 as an error.
- **The plausible live policy shapes** (Known Trap #12):
  - **`jobs`:** the reference file's anon policy is `TO anon`, so it never applies to `authenticated`. The `authenticated` `FOR ALL USING (true) WITH CHECK (true)` policy sees every row, so closing a job passes the new-row check.
  - **`reports` and `leaders`: live policies unknown.**
    - A `FOR ALL … USING (true)` policy, which Known Trap #12 expects, has no effect.
    - Per-command write policies with no `authenticated` SELECT would leave the admin list itself empty. The list visibly works, so that shape is ruled out.
    - A narrower `authenticated` SELECT (e.g. `USING (published)`) would hide Drafts from the admin list. Editing or deleting one would say "not found", and unpublishing would return the RLS error text. Each accurately reports that nothing was written, and each was already true before T-015, silently.
- 🟢 **SEC-INFO-34 (new)** records this analysis.
- **What `/qa`'s manual checklist must verify.** Use test rows only, clearly named, and delete them in the same sitting. Local runs write to the live database, so anything Published, Active or given a real name is on the live site at once.
  1. `/admin/reports` lists at least one **Draft** row and `/admin/careers` at least one **Closed** row; create test ones if none exist. If they're listed, `authenticated` SELECT covers the rows a narrower policy would hide.
  2. Edit and save a Draft test report, then a Closed test job. Each saves, the page reloads, the change persists, and "not found" never appears.
  3. Toggle the test report Draft → Published → Draft, and the test job Closed → Active → Closed. Every save succeeds. These are the cases a narrower SELECT policy would reject. The report is briefly public between saves.
  4. Leader: edit a test leader's field, keeping the placeholder name so it stays unpublished, and blur. No alert appears, and a reload shows the change. Add Leader works, and deleting the test leader works.
  5. Deleting the Draft test report and the Closed test job both succeed.
  6. **Not found:** open the same test row in two tabs and delete it in tab A. Then save it in tab B (report or job), or blur-edit it (leader). The "… not found. Reload the page…" text appears at the control, the modal stays open with the input intact, and nothing reloads.
  7. **Session expired:** sign out in a second tab. Then save, delete and upload on each page in the first tab. Each shows "Your session expired. Sign in again and retry." with the input intact.
  8. "New row violates row-level security policy" appearing anywhere in steps 2–5 means a live `authenticated` policy is narrower than the write. Record the table and step for `/cso`, and don't widen the policy by hand.

**4. `uploadFile`: T-015 lowers the risk by removing the anonymous path, and changes nothing else. No overwrite is possible, but the request path can be steered.**
- **What T-015 changes.** `uploadFile` used to have no session check. Anyone holding its action ID could upload as `anon` to any bucket whose storage policy allows anon inserts (Known Trap #14: bucket policies aren't in the repo). Now a session is required. The mechanics below are pre-existing.
- **Overwrite: not possible.**
  - storage-js sends `x-upsert: false`, so an existing key fails with 409.
  - The key's `<ms timestamp>_<random>.` prefix is server-generated.
- **Path steering: possible, for authenticated callers.** storage-js builds `${url}/object/${bucket}/${key}` with **no encoding** and passes it to `fetch`. Its WHATWG URL parser resolves `..` and `%2e%2e` segments and starts a query at `?`. Verified offline:
  - `bucket = "../../../rest/v1/x"` sends the upload to `https://<ref>.supabase.co/rest/v1/x/<key>`.
  - `bucket = "media/chosen.html?"` creates an object with a caller-chosen name in another bucket.
  - **Via the extension alone,** it depends on the action path:
    - The fetch-action path parses multipart with busboy, which strips everything up to the last `/` or `\` (Next passes no `preservePath`), so the extension can't carry a path there.
    - The non-fetch (form-post) path uses Node's `Request.formData()`, which keeps the raw filename. There, `file.name = "a.x/%2e%2e/…/rest/v1/x"` reaches `/rest/v1/x` as well, with the bucket left at its default.
  - **Content type** is caller-controlled too, e.g. `text/html` into a public bucket.
- **Impact: bounded.**
  - The request carries only the caller's own JWT plus the anon key that Supabase treats as public.
  - The body is always a storage multipart POST. Going by their documented content types, the PostgREST and Auth endpoints don't accept that body (not tested live), and no route to read data was found.
  - Nothing lands on this app's own origin.
  - Net: an authenticated identity can place files with any name and any content type (≤ 1 MB, SEC-INFO-35) in any bucket its storage policies allow. That's roughly what the same identity could do against Storage directly with the anon key, so there's no escalation.
  - T-015's raw `error.message` forwarding adds a narrow echo of those requests' error text, to authenticated callers only. T-018 removes it.
- 🟢 **SEC-INFO-33 (new; Low; pre-existing).**
  - **Code fix:**
    - pin the bucket server-side (drop the parameter, or allow-list `"reports"`);
    - build the key from no client input (a fixed `.pdf`, after a `%PDF-` magic-byte check);
    - pass an explicit `contentType: "application/pdf"`.
  - **Zero-code complement (user action):** in the Supabase dashboard's bucket settings, restrict the `reports` bucket's allowed MIME types to `application/pdf`, and `media`'s to image types.
  - **Ticket:** nothing covers this today; T-015 and T-019 both leave upload validation out of scope. Recommend `/pm` file one small sensitive ticket for it together with Known Trap #9's type check on `uploadFile`.
  - Not blocking.

**5. Error text: ✅ an anonymous caller gets only the session-expired string. Authenticated callers get the SEC-MED-8 class, which T-018 already covers.**
- **Anonymous callers.** In all ten functions the check comes first, so nothing else is reachable without a session:
  - "Missing … id.", "No file provided." and "… not found. Reload the page…";
  - every DB and storage message.
  - Nothing before the check reads caller input. A malformed argument fails in the framework's decoder, which redacts it.
  - This is T-012's precedent and string (the T-012 entry, item 2).
- **Authenticated callers: the new app copy leaks nothing.**
  - The not-found messages only confirm whether an id is visible to the caller, which that caller can already list via `getReports()`, `getJobs()` and `getLeaders()`.
  - "Missing … id." is reachable only through a crafted call.
- **SEC-MED-8, extended as planned.** The ten functions now return raw Supabase `error.message` to authenticated callers in every environment. Before, it was thrown and redacted in production.
  - T-018's Acceptance already names "the report, leader, upload and job functions T-015 converted", so no new ticket.
  - Only `message` is forwarded, never `details`, `hint` or the whole error object, and nothing new is logged. Postgres puts row data only in `details` ("Failing row contains …"), so SEC-INFO-29's PII concern doesn't arise. These tables hold no PII beyond public leader bios anyway.
  - Storage messages add a bucket- and key-existence echo for a caller-chosen bucket; that's folded into SEC-INFO-33.

**6. Client render surface: ✅ no new sink.**
- **Searched the full text of all three clients** (not just the diff). None of these appear:
  - `dangerouslySetInnerHTML`, `innerHTML`, `eval(`, `new Function`, `document.write` or `srcDoc`;
  - a data-fed `href={…}` or `src={…}`;
  - `window.open` or a `location` assignment.
- Every error string renders as a JSX text child inside `role="alert"`, which React escapes.
- `alert()` is removed.
- No new Server Action import.
- No `createBrowserClient` and no `NEXT_PUBLIC_*`, so the SEC-INFO-32 guardrail holds.
- No debug statements in the diff.

**7. SEC-HIGH-2: unchanged, and not expanded here.**
- A self-registered account passes every check T-015 adds, as `docs/ROADMAP.md` already says.
- **For whoever scopes the structural fix,** there are now eight session checks to convert:
  - three private `requireUser()` copies (`products-actions.ts`, `settings-actions.ts`, `jobs-actions.ts`);
  - four inline `getUser()` calls (`updateSettings`, `seedSettingsFromDefaults`, `importBuiltInGallery`, `uploadOptimizedImage`);
  - the middleware gate.
- T-019 adds two more callers. Recommend the structural-fix ticket first consolidate these into one helper in a plain `server-only` module, never an export of a `"use server"` file.

**Standing items (status only):**
- **Dependency audit:** unchanged by this diff. `npm audit --omit=dev` matches the T-006 baseline exactly: 9 advisories (0 critical, 5 high, 2 moderate, 2 low), the same nine toolchain packages, and no `next`. `npm ls next` shows `next@16.3.6`, so the SEC-INFO-30 floor holds.
- **SEC-MED-2 (T-008), re-checked:** `curl -sI` of production `/` and `/admin/login` still returns only `strict-transport-security: max-age=63072000`, and `/` still sends `x-powered-by: Next.js`.
- **The other two throwing admin actions** (`seedSettingsFromDefaults`, `importBuiltInGallery`): both callers catch the error and show a message, which production redacts to generic text. That isn't the SEC-HIGH-5 class. No action.

**Secrets hygiene (this pass):**
- The secret-shape grep over the five changed files found 0 hits.
- No `.env*`, `*.pem`, `*.key` or `cookies.txt` file appears anywhere in git history.
- `.env*` was never read. Secret names came from `.env.example` (still stale, Known Trap #11) and `docs/TECH_STACK.md`.

**Notes for `/qa` and `/pm`:**
- 🟢 **SEC-INFO-35 (new).** Next's default 1 MB Server Action body limit is the only size bound on `uploadFile` and `addMediaAction`.
  - **Evidence:** `next.config.ts` sets no `serverActions.bodySizeLimit`, and `git log -S` shows it never has. The limit is enforced on both multipart paths in `action-handler.js`.
  - **Guardrail:** raising it requires server-side size and type validation on both upload paths in the same change, plus a `/cso review`.
  - **Not a security finding:**
    - A report PDF over about 1 MB has never been uploadable through `uploadFile`.
    - Under T-015 it's rejected before the action runs, so nothing is written. The admin sees the generic "check your connection" text rather than the real reason, which misses T-015's acceptance bullet on upload failures.
    - `/qa` should record the exact text shown for a >1 MB PDF; the test is safe because nothing is written.
    - If the client needs larger PDFs, a signed-upload-URL design (browser → Storage, with bucket-level MIME and size limits) is safer than raising the cap. That's for `/pm` and `/architect`.
- **Silent click on a hand-edited row (Info only).** `ReportsClient.handleSave` builds its FormData outside the `try`, in pre-existing lines 101–106. A row whose `published` is null would throw in the click handler and fail silently. The column is nullable in the reference schema, but every app write stores a boolean, so only a hand-edited row can trigger this.
- **Failed reads show as empty lists.** The three admin list reads (`getReports`, `getJobs`, `getLeaders`) turn a failed read into an empty list, which can prompt duplicate re-creation. It's the same fail-open class T-016 fixes for products, and out of T-015's scope. `/pm` may want a follow-up.
- **`/ui-ux` nit.** `ReportsClient`'s "Replace" button isn't disabled during an upload, and that branch shows no "Uploading…" state. Next queues Server Action calls one at a time, so a second pick still lands in order.

**Overall verdict this pass:** ✅ **T-015 cleared.**
- **SEC-HIGH-5: closed in code.** No throw remains, and every call site is handled. The error-boundary mechanism the original finding misdescribed is now confirmed from React's source.
- **SEC-MED-10: 10 of 12 closed in code.** The session check comes first in every function, and the remaining two are T-019's.
- **`.select("id").maybeSingle()` is RLS-neutral:** "not found" means nothing was written, under any policy shape.
- **New findings:** no 🔴, 🟠 or 🟡. Three 🟢:
  - SEC-INFO-33 (Low): path steering in `uploadFile`; pre-existing, now authenticated-only;
  - SEC-INFO-34: the RLS analysis above;
  - SEC-INFO-35: the 1 MB upload cap guardrail.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-015 may proceed to `/ui-ux` → `/qa static` → `/qa live` (a production build, per T-015's Acceptance) → the manual checklist, including item 3's eight checks → `/git Merge`. Conditions:
- **Server files are bound by hash.** If either changes before merge, the clearance lapses for that file until `/cso` re-reviews it.
  - `src/app/actions/settings-actions.ts`: sha256 `8df471e36cde848dc33e1fb1d3089ad475cf67be3a4e0832664bdc5bf143526d`
  - `src/app/actions/jobs-actions.ts`: sha256 `628e5e74c4dca9259ef1e5a0d3ef0d0715a70e9c2b207656792a0603ac7f684f`
- **Client files are bound by invariants, not hashes, because `/ui-ux` edits them next.**
  - **Reviewed baseline:**
    - `ReportsClient.tsx` `27fc7aed0c17b8c6…`
    - `CareersClient.tsx` `a68b5f944c28c190…`
    - `WhoWeAreClient.tsx` `550a51260167fa4c…`
  - **After `/ui-ux`, `/qa static` confirms:**
    1. every call to the ten functions stays inside a `try`, branches on `.ok`, and reloads only on success;
    2. error text renders only as JSX text;
    3. no new Server Action import;
    4. no new render sink.
  - Any change beyond className, layout or copy comes back to `/cso`.

**Pre-deploy position, stated now to save a round trip:**
- A `main` holding T-006 and this ticket, at the hashes above, adds no sensitive surface beyond what this pass reviewed, and it ends SEC-HIGH-5's live exposure.
- It needs no further `/cso` pass for T-015's own surface.
- It is not held for SEC-HIGH-2, for the same reasons as T-006.
- Deploying still needs the user's typed "deploy".

**Actions taken:** no commit, no source edit, no server started, no remote touched, no auth action, no access to the live database.

### 🔒 CSO Audit — 2026-10-03 — ticket-review:T-025

**Scope:** Dispatched by `/system-architect` per `docs/WORKFLOW.md` §3, because **T-025** ("Move category pages to `/products/<slug>`, and add the `/products` overview…") touches two writing Server Action files and `next.config.ts`.
- **The diff under review:** `git diff main...t-025-products-routes`, commits `271bdd3` (docs) and `309bc0d` (code). It touches 15 files (+344/−50):
  - `next.config.ts`, `settings-actions.ts`, `products-actions.ts`, `src/lib/nav.ts` and `sitemap.ts`;
  - the new `products/page.tsx`, and `products/[category]/page.tsx`, moved from `what-we-do/[category]` (85% similar);
  - `what-we-do/page.tsx`, the three catalog components and `Footer.tsx`;
  - `site-content.ts` (two message strings) and two docs.
- **The contract:** T-025's Acceptance plus the premortem's MUST-ADD block in `docs/ROADMAP.md`.
- **Independently confirmed:**
  - `package.json`, `package-lock.json`, `src/middleware.ts`, `src/lib/supabase/`, `db/` and `supabase-schema.sql` are untouched.
  - The only dirty file is `.claude/launch.json`, which adds the `prod` launcher for port 3101. It has 0 key-shaped strings.

**Method.**
- **Static:** full reads of every touched source file, plus the producers and callers they depend on:
  - `getAllCategoryProducts`, `normalizeProducts` and `resolveCategoriesForSave`;
  - `ScrollReveal`;
  - the admin business page and `CategoryProductsManager`.
- **Offline execution:** the repo's real `normalizeProducts`, `resolveCategoriesForSave`, `isWellFormedSlug`, `slugify` and `categoryPath` (Node 25 type stripping), together with Next 16.3.6's real `resolveSitemap`. 13/13 assertions passed. The script lives in the session scratchpad, not the repo.
- **One headless-Chrome run** on a local `file://` copy of that serializer's output, with an isolated throwaway profile that was deleted afterwards. No network.
- **Live, read-only:** GET and HEAD with no cookie only.
  - `:3101` serves the production build of `309bc0d`, build id `4N4efaRW60P5y6wGufi3U`. It was written 2 minutes after the commit, and the served HTML carries that id.
  - `:3000` is the dev server.
- **Not done:** no sign-in, no Server Action call, no form submit, no write to the live database, no source edit, no commit. `.env*` was never read.
- **Typecheck:** `npx tsc --noEmit --incremental false` exited 0.

**1. The `/what-we-do/:slug` redirect: ✅ no open redirect, no header injection, no loop, and an additive-only diff.**
- **Why it can't leave the origin.** `Location` is always relative, and it always starts with the fixed `/products/`.
  - A value of `/` followed by a letter is a path-absolute URL, so no captured value can make it protocol-relative or give it a scheme.
  - Next copies the captured segment into `Location` still percent-encoded.
- **Vectors tried** (one hop each, then followed by hand, on-origin only). All ended on this origin, at a 404 under `/products/`:
  - `%2F%2F`, `%2f%2f`, `%5C%5C`, `%5C`, and the double-encoded `%252F%252F`;
  - `http:%2F%2F…`, `https:…`, `javascript:alert(1)`, `@host` and `%40host`;
  - the full-width solidus `%EF%BC%8F%EF%BC%8F`, the ideographic full stop `%E3%80%82`, and the right-to-left override `%E2%80%AE`;
  - `..%2F..%2Fadmin`, `%2e%2e%2f…`, `%3F…`, `%23…`, `%09`, `%00`, `;…` and `<script>`;
  - a 9,000-character slug.
- **Raw `\` and `//` inside the path:** Next's own repeated-slash normalizer collapses them first. That gives 2 hops, still on-origin.
- **`/what-we-do/..` and `%2e%2e`:** these resolve to `/` (the homepage, 200), and the rule never sees them.
- **CRLF** (`%0d%0aSet-Cookie:…`, `%0aX-Injected:…`, and an embedded `Location:`): the CR/LF stay percent-encoded, and no header was injected.
- **A spoofed `Host: evil.example` or `X-Forwarded-Host`:** `Location` is still `/products/t-shirts`.
- **The premortem matrix, all passing:**

  | Request | Result |
  |---|---|
  | `/what-we-do` | 200, no `Location` |
  | `/what-we-do/` | 308 → `/what-we-do` → 200 |
  | each of the 8 old slugs | one 308 → 200 |
  | `/what-we-do/t-shirts/` | 2 hops → 200 |
  | a query string | kept, re-encoded (`next=//x` becomes `next=%2F%2Fx`) |
  | `/what-we-do/no-such-slug` | 308 → 404 |
  | `/what-we-do/t-shirts/extra` | 404 |
  | `/business` | one hop → `/what-we-do` |
  | `/products` and `/products/<slug>` | 200, no redirect |
  | `/products/no-such-slug` | 404 |

  - Source matching is case-insensitive: `/WHAT-WE-DO/t-shirts` → 308 → 200, and `/What-We-Do/T-Shirts` → `/products/T-Shirts` → 404. Neither loops.
- **No interaction with the 4 existing rules.** No existing destination matches the new source, and the new destination matches no source.
- **The `/admin` gate is unchanged.** Redirects run before middleware, and the new source can't match `/admin`. An anonymous GET of `/admin` or `/admin/business` still answers 307 → `/admin/login` on both servers.
- **Additive-only, confirmed:** `next.config.ts` shows +7/−0. `agentRules: false`, `logging: { serverFunctions: false }` and the 4 existing rules are byte-identical.
- **For `/ship`'s live check.** On Vercel, `redirects()` run in the platform's routing layer from the build output, not in `next start`. Add two read-only GETs on production:
  - `/what-we-do/%2F%2Fevil.example`;
  - `/what-we-do/%0d%0aX:1`.

  Each must answer one 308 whose `Location` starts with `/products/`, and the second must carry no `X` header.

**2. Server Actions: ✅ only revalidate targets changed. No new endpoint, and auth still comes first.**
- **Exports.** All six `"use server"` modules have identical export name lists before and after, 32 runtime exports in total.
  - The two new `@/lib/nav` imports add no export.
  - `revalidateCategory()` stays unexported.
- **`getUser()` order is unchanged.** It's the first await after `createClient()` in:
  - `updateSettings` (`:75`);
  - `createCategoryProduct` (`:152`), `updateCategoryProduct` (`:203`), `deleteCategoryProduct` (`:259`) and `reorderCategoryProducts` (`:286`), via `requireUser()`.
  - The diff only touches the post-write revalidate block and the private helper.
- **Every revalidate target is a slug the server resolved, never client input.**
  - **`updateSettings`:** `savedCategories` is the output of `resolveCategoriesForSave`. A frozen slug is re-checked with `isWellFormedSlug`, and a fresh one is `slugify(title)`. It never reads an incoming `.slug` (re-verified by execution).
  - **`revalidateCategory`'s five call sites:** each passes either a slug that passed `checkCategoryAttachable` (a frozen identity plus `isWellFormedSlug`) or the `category_slug` Postgres returned for the row just read or deleted.
- **The premortem's revalidation list is met, by reading the code only:**
  - a business save revalidates `/what-we-do` (via `SETTINGS_ROUTES`), `/products`, each `/products/<slug>` and `/sitemap.xml`;
  - a product write revalidates `/products/<slug>` and `/products`.

**3. `categoryPath()` and `PRODUCTS_PATH`: ✅ no data can turn them into an off-site or protocol-relative URL.**
- **The output** is the constant `/products/` followed by the slug.
- **What a malformed slug could still do:**
  - in a React `href`, move within the origin only (`..`, `?`, `#`, `/`), and React escapes the attribute;
  - in the metadata canonical and `og:url`, nothing more: they're resolved against `metadataBase` and escaped by React;
  - break out of the one sink that isn't escaped, the sitemap. See item 4.
- **The T-024 carry-forward holds.** `CategoryCardGrid`'s runtime check now mirrors its type. It refuses `/\…` and any backslash, so a base can't become protocol-relative.

**4. 🟡 SEC-MED-15 (new; pre-existing since T-005, and not made worse by T-025): a stored-XSS sink in `/sitemap.xml`.**
- **The sink.** Next 16.3.6's `resolveSitemap` concatenates `<loc>${item.url}</loc>` with no escaping (`next/dist/build/webpack/loaders/metadata/resolve-route-data.js:112`), and the route is served as `application/xml`.
- **The source.** `normalizeProducts()` still returns a stored `slug` verbatim, trimmed only (`site-content.ts:441-442`; that's SEC-INFO-19). `sitemap.ts` then builds `${baseUrl}${categoryPath(category.slug)}`.
- **Proved end to end by execution:**
  1. A stored slug `x</loc><x:script xmlns:x="http://www.w3.org/1999/xhtml">…</x:script><loc>y` went through the real `normalizeProducts()`, `categoryPath()` and `resolveSitemap`. It came out as well-formed XML containing an XHTML-namespace `<script>`.
  2. Headless Chrome ran that script: the document root gained `data-poc="script-ran"`.
- **Reachability: not through the app.**
  - `resolveCategoriesForSave` never reads a client `.slug`, and it refuses to carry a malformed stored one forward. Both were re-verified by execution.
  - No other action writes `site_settings.business.products`.
  - Planting the slug therefore takes a direct database write: the Supabase dashboard, or PostgREST with the anon key plus any authenticated session.
  - That second route is SEC-HIGH-2's chain. Sign-ups were still ON on 2026-10-03, per the orchestrator; this office didn't re-probe it, because that needs the key's value.
  - The anon key is still not public (SEC-INFO-32, re-verified this pass).
- **Why it ranks above SEC-INFO-19's link sink.** Every other sink CMS data reaches is escaped by React, so a rogue account can only deface. This one runs script on the site's own origin, which is also `/admin`'s.
  - `@supabase/ssr` 0.8.0 defaults to `httpOnly: false`, so a signed-in admin who opens a link to `https://<site>/sitemap.xml` hands over the session's tokens.
  - That gives persistence beyond deleting a rogue account, and in-origin phishing of visitors.
  - Crawlers would also get a broken sitemap.
- **Erratum.** The T-005 entry's "Sitemap entries" bullet says Next's sitemap renderer serializes the URL "escaping reserved characters". That's false for `<loc>` in 16.3.6. SEC-MED-4's T-005-half closure rested partly on it, so for the sitemap sink it's superseded by this finding.
- **Severity: 🟡 Medium.** There's no direct exploit today: it needs a credential the public doesn't hold, and it sits behind SEC-HIGH-2. **It escalates to 🟠 if the anon key ever reaches a browser**, the same trigger that makes SEC-HIGH-2 🔴.
- **Fix.** Either change alone closes the sitemap sink.
  - **(a) The root cause:** SEC-INFO-19's recommended gate.
    - In `normalizeProducts()`, keep a stored slug only if `isWellFormedSlug()` passes; otherwise fall back to `dedupeSlug(slugify(title), seen)`. This closes every slug sink at once.
    - It's safe: a malformed slug can neither be saved nor have products attached.
    - T-025's contract freezes `site-content.ts`, so this belongs in T-026 (category admin) or a small sensitive ticket, with `/cso review`.
  - **(b) Defense in depth, inside T-025's own helper:** ``return `${PRODUCTS_PATH}/${encodeURIComponent(slug)}`;``. It's the identity on every well-formed slug and encodes `<` and `&` (both verified).
- **Not blocking T-025.** Recommend shipping (a) or (b) before or with the next deploy; either is one line.

**5. Data exposure on the new and moved pages: ✅ only the public tables, with no id, key or browser fetch.**
- **Production HTML:** 0 UUID-shaped strings, 0 JWT-shaped strings, and none of the product-row field names (`category_slug`, `sort_order`, `created_at`, `updated_at`). Checked on `/products`, all 8 `/products/<slug>` pages, `/what-we-do`, `/` and the 404.
- **RSC navigation payloads** (`?_rsc`, `text/x-component`) of `/products` and `/products/t-shirts`: 0 UUIDs.
- **The dev server's** `/products`, `/products/t-shirts` and `/what-we-do`: 0 UUIDs.
- **Honest scope.** The live catalog has no products (`/products` renders its Coming Soon note), so the product-row half of this check is vacuous today. The category `id` is covered by structure instead:
  - `toCategoryCards()` narrows before any prop, and `CategoryCardData`'s `id?: never` makes passing a whole `Product` a type error (tsc exits 0);
  - on the category page, only `title`, `description` and `slug` leave `findCategory`'s result;
  - React keys are `slug-index`, `title-index` and `name-index`, never an id.
- **No browser-side data fetch.**
  - The only client component on these pages is `ScrollReveal`, whose props are `delay`, `className` and children.
  - `@/lib/supabase/client` has 0 importers in `src/`.
  - `.next/static` (48 files) has 0 hits for JWT shapes, `sb_publishable_`/`sb_secret_`, every `stack.json` `secretPatterns` entry, `NEXT_PUBLIC_SUPABASE`, `supabase.co`, `createBrowserClient` and `apikey`. The browser bundle holds no Supabase client at all.
- **What the pages read.** Product data comes only from the anon-readable `products` table (`getAllCategoryProducts()` and `getCategoryProducts()`; SEC-INFO-9, SEC-INFO-21), and categories from `site_settings.business`.
- **No cross-user cache.** These pages render per request (they're absent from the prerender manifest) with `Cache-Control: private, no-cache, no-store`, so one visitor's render is never served to another. Every viewer sees the same rows anyway.
- 🟢 **SEC-INFO-36 (new). A guardrail: `ProductGrid`'s `Pick<…>` narrows the type, not the object.**
  - The full `products` rows (`select("*")`: `id`, `category_slug`, `sort_order` and timestamps) are handed to `ProductGrid` and `ProductCard`.
  - That's safe today only because both are server components. In production they serialize nothing but rendered elements.
  - In dev, React's debug channel can carry server-component props (as `CategoryCardGrid`'s own comment says). None of it was inlined in the dev HTML this pass.
  - If either component ever gains `"use client"`, every row field ships in the production payload.
  - Product ids aren't secret (the table is anon-readable), so this is Info. Mirror `toCategoryCards` with a narrowing mapper plus `id?: never`, in whichever ticket next edits these components (T-016).

**6. Incidental, pre-existing, and not caused by T-025.**
- 🟢 **SEC-INFO-37 (new; Low; availability only). A category whose slug is `constructor` breaks product grouping. It's reachable through the ordinary admin UI.**
  - **Reachable:** `slugify("Constructor")` is `constructor`, and `isWellFormedSlug("constructor")` is true, so it's attachable.
  - **The producer:** `getAllCategoryProducts()` (`products-actions.ts:143-146`) groups into a plain object. `grouped["constructor"] ??= []` finds the inherited `Object` function, so `.push` throws a `TypeError` (verified by execution).
  - **`/products`:** the page catches the error and logs it, then shows the grid with no product section for any category. Its `Object.entries` → `Map` conversion is correct, but it's never reached.
  - **`/admin/business`:** the page fails to load. Its `Promise.all` has no catch, and no `error.tsx` exists.
  - **In the browser, before any product exists:** `CategoryProductsManager.tsx:87` resolves the inherited function (`.length` is 1, `.map` is undefined), so selecting the category throws. The spread at `:106` throws "not iterable" on the first add.
  - **No data is exposed.**
  - **Fix:** a null-prototype object or a `Map` server-side, with `Object.hasOwn` (or a `Map`) at the client lookups; or reserve `Object.prototype` member names when deriving slugs. Route it to T-016 or T-026, both of which edit these files.
- **A note for `/pm` (not a security finding).** `resolveCategoriesForSave` stores `slugify(title).slice(0, 255)`, which can end in `-` for a title of 255 or more characters (verified by execution).
  - That slug fails `isWellFormedSlug`, so the category's next save is refused ("needs a developer to fix its stored data"), and it can never take products.
  - Fix: trim a trailing `-` after the slice.
- **A note for `/qa` (not a security finding).** `getAllCategoryProducts()` turns a Supabase error into `{}`, so a failed product read on `/products` shows the Coming Soon note.
  - The page's own "never claims that no products exist when it couldn't read them" holds only for thrown errors.
  - It's the same fail-open class T-016 fixes. The AC's literal wording is met: the grid still shows, and the error is logged.

**7. As another user: N/A for writes, and the reason.**
- **No authorization surface changed.** T-025 changes no RLS policy, grant, middleware, auth helper or write logic, and it adds no endpoint (the export lists are identical).
- **There's no second user to impersonate.** There's one role (any authenticated account is an admin, R1), and public pages show every viewer the same rows.
- **The owner's law forbids it anyway:** no agent signs in or writes.
- **What was done instead, read-only, as an anonymous visitor with no cookie:**
  - `/admin` and `/admin/business` answered 307 → `/admin/login` on both servers;
  - the catalog pages exposed only public-table fields;
  - per-request renders are `no-store`, so they can't be shared across users.

**Standing items (status only):**
- **SEC-HIGH-2:** unchanged and open. Sign-ups were reported still ON on 2026-10-03. SEC-MED-15 adds a reason to close it.
- **SEC-INFO-32 holds.** No key shape appears anywhere in `.next/static` or in any served HTML or RSC payload checked.
- **Dependencies:**
  - `package.json` and `package-lock.json` are untouched. The lockfile sha256 `6a026457868784a9…` equals T-006's binding, and `npm ls next` shows `next@16.3.6`.
  - `npm audit --omit=dev` now reports **16** advisories (0 critical, 12 high, 2 moderate, 2 low), up from T-015's 9. With the lockfile identical, that's growth in the advisory feed only:
    - a new `braces` advisory (`GHSA-vfj7-8cjw-p6xm`) cascades through `micromatch` → `fast-glob`/`chokidar` → `tailwindcss`, and through `@next/eslint-plugin-next` → `eslint-config-next`;
    - new highs landed on `brace-expansion`, `browserslist`, `flatted`, `js-yaml` and `picomatch`.
  - All of it is build or lint toolchain. `tailwindcss` and `eslint-config-next` are listed under `dependencies`, which is why `--omit=dev` counts them. None runs at request time.
  - This is a status update to SEC-INFO-31, whose lockfile-only ticket and `devDependencies` move now cover 16 packages.

**Secrets hygiene (this pass):**
- **Over the diff:** the `stack.json` `secretPatterns` plus JWT and `sb_` shapes found 0 hits.
- **Added lines:** no `process.env`, `NEXT_PUBLIC_*`, `"use client"`, raw-HTML sink, `fetch(` or debug print. The one `console.error` is the required server-side log of a failed read.
- **`.env*`:** never read. Key names came from `docs/STACK.md` and `.claude/stack.json`.

**Overall verdict this pass:** ✅ **T-025 cleared.**
- **The redirect is safe** against every open-redirect, CRLF and host-poisoning vector tried, and the config diff is additive-only.
- **The Server Actions changed only their revalidate targets.** Those come from server-resolved slugs, there's no new export, and auth still comes first.
- **The pages expose only public-table fields.** There's no id, key or browser fetch, and no key in the bundle.
- **New findings:**
  - one 🟡: SEC-MED-15, a pre-existing sitemap XSS sink that T-025 didn't widen, with a one-line fix either way;
  - two 🟢: SEC-INFO-36 (a narrowing guardrail) and SEC-INFO-37 (the `constructor` slug; availability only).
- **No 🔴 or 🟠 finding.**

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-025 may proceed to `/qa` (the production-build matrix, read-only) → `code-reviewer` → merge. Conditions:
- **Server and config files are bound by sha256 at `309bc0d`.** If one changes before merge, the clearance lapses for that file until `/cso` re-reviews it.
  - `next.config.ts` `a44a56d9f997bb13…`
  - `src/app/actions/settings-actions.ts` `8ca4d1ef35057fbe…`
  - `src/app/actions/products-actions.ts` `bb3ba3e231219a09…`
  - `src/lib/nav.ts` `82e6e75d2f4742f7…`
  - `src/app/sitemap.ts` `105e10253fdd12fb…`
  - `products/page.tsx` `a970fb2cd0f922e2…`
  - `products/[category]/page.tsx` `3e2dca9def343a05…`
- **One change is pre-cleared.** If SEC-MED-15's fix (b) is applied, `nav.ts` may differ from its hash by exactly that one line in `categoryPath()`. `/qa static` confirms the diff is that line and nothing else.
- **Client-facing components are bound by invariants, not hashes.** `CategoryCardGrid`, `ProductGrid`, `ProductCard` and `what-we-do/page.tsx` may change for design, provided they still:
  1. add no `"use client"`;
  2. use no id as a key;
  3. pass no whole `Product` or product row into a client component;
  4. add no raw-HTML sink;
  5. keep the `hrefBase` runtime check.

**Pre-deploy position:**
- A `main` holding T-025 at these hashes adds no sensitive surface beyond what this pass reviewed.
- It isn't held for SEC-HIGH-2 or SEC-MED-15, both of which are pre-existing.
- `/ship`'s live check adds the two encoded-redirect GETs from item 1.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, plus its §3, §5 and §7 rows). No commit.
- Made only GET and HEAD requests, with no cookie, to `:3101` and `:3000`.
- Ran one headless Chrome on a local file, and removed its throwaway profile.
- No sign-in, no Server Action call, no access to the live database beyond those page reads.

### 🔒 CSO Audit — 2026-10-03 — ticket-review:T-025 (re-check of fix commit `f1bd94d`)

**Scope:** Re-check of the clearance conditions above, dispatched by `/system-architect`.
- **The commit:** `f1bd94d` (parent `309bc0d`, branch `t-025-products-routes`, authored `happierbangladesh`). It touches 6 files (+28/−10): the design FIX FIRST items, code-review minors, and SEC-MED-15's fix (b).
- **Verified against** `git diff 309bc0d f1bd94d`. The working tree equals `f1bd94d` for `src/` and `next.config.ts`.

**1. The builder's claims: ✅ all true.**

| Bound file | `309bc0d` | `f1bd94d` | Change |
|---|---|---|---|
| `next.config.ts` | `a44a56d9…` | `a44a56d9…` | none |
| `settings-actions.ts` | `8ca4d1ef…` | `8ca4d1ef…` | none |
| `products-actions.ts` | `bb3ba3e2…` | `bb3ba3e2…` | none |
| `sitemap.ts` | `105e1025…` | `105e1025…` | none |
| `nav.ts` | `82e6e75d…` | `507e5c62…` | +1/−1: exactly the pre-cleared `encodeURIComponent(slug)` line in `categoryPath()` |
| `products/page.tsx` | `a970fb2c…` | `af42e298…` | a type on the grouping callback's parameter, and three reworded comments; the runtime logic is unchanged |
| `products/[category]/page.tsx` | `3e2dca9d…` | `aa384615…` | the `PageHeader` tag literal `"What We Do"` → `"Products"` |

- **Also unchanged:** `site-content.ts` and the four invariant-bound components (`CategoryCardGrid`, `ProductGrid`, `ProductCard`, `what-we-do/page.tsx`) are byte-identical, so their invariants hold trivially.
- **The other three files are UI only:**
  - `Header.tsx` adds a `menuOpen && "bg-background"` class;
  - `MobileOverlayMenu.tsx` adds a `data-lenis-prevent` attribute;
  - `PageHeader.tsx` changes `text-primary` → `text-accent`.

  The two client components among them were already client components; no `"use client"` was added anywhere.
- **Added lines** contain no raw-HTML sink, `process.env`, `NEXT_PUBLIC_*`, client DB import, `fetch(`, new `href` or debug print. Secret patterns: 0 hits.
- **Typecheck:** `npx tsc --noEmit --incremental false` exited 0.

**2. The served build is `f1bd94d`'s code.**
- `:3101` serves build `L3uwd8IEWt6SeramWKAQx`, as the HTML shows. It was written at 19:31:36, 21 s before the commit, so it was built from the working tree.
- The last source edit was 19:31:02 (`MobileOverlayMenu.tsx`), and the build contains it: `data-lenis-prevent` appears in 2 static chunks.
- The encoding `categoryPath` appears in 11 server chunks, and the new tag shows in the served HTML.
- Nothing in `src/` or `next.config.ts` changed after the build, and the tree equals the commit.

**3. Live re-check on `:3101` (read-only, no cookie): ✅ unchanged from `309bc0d`.**
- **The premortem redirect rows all pass again:**
  - 8/8 old slugs give one 308 → 200, and the trailing slash takes 2 hops;
  - the query is kept, and an unknown slug ends in 404;
  - `/business` takes one hop;
  - `/products` pages answer 200, and `/products/no-such-slug` is 404.
- **The eight adversarial vectors re-run** (encoded `//` and `\`, raw `//` and `\`, `http:%2F%2F`, the full-width solidus, `..%2F`, a leading `//host`) all stayed on-origin.
- **CRLF** stayed encoded, and `Host` and `X-Forwarded-Host` spoofing had no effect.
- **The admin gate holds:** `/admin` and `/admin/business` still answer 307 → `/admin/login`.
- **Leaks:**
  - 24 responses (the HTML and `?_rsc` payloads of `/products`, the 8 category pages, `/what-we-do`, `/` and the 404) have 0 UUID-shaped strings, 0 JWT-shaped strings and 0 row-field names;
  - `.next/static` (48 files) has 0 key-pattern or Supabase-client hits.
- **Encoding changed nothing visible:**
  - the 18 sitemap `<loc>` values are byte-identical to the `309bc0d` build;
  - the canonical and `og:url` on all 8 category pages are `https://fashionasialtd.com/products/<slug>`.

**4. SEC-MED-15: ✅ the sitemap sink is closed in code by fix (b).** I re-ran the offline check with the committed `categoryPath()` and Next's real `resolveSitemap`.
- **The planted payload is neutralized:** it leaves no element, there's one `<loc>` per entry, and the `<loc>` text holds no `<` or `&`.
- **All 8 live slugs are unchanged.**
- **16 hostile slugs** each encode to a single segment (no `/ ? # \ < > & "` after `/products/`) that resolves on this origin.
- **Edge case considered:** `encodeURIComponent` throws only on a lone surrogate. Postgres can't store one in UTF-8 text or JSONB, so it can't turn into a sitemap 500.
- **Residual:** the stored slug is still unvalidated at the source. That's SEC-INFO-19, which now reaches only React- and RSC-escaped sinks. The root cause, fix (a), goes to T-026.
- **Production stays exposed** until a user-typed deploy of a `main` containing `f1bd94d`.

**5. Ruling on the builder's open point (the category-card `href`s): React's attribute escaping plus the fixed `/products/` prefix is sufficient. No change is required for T-025.**
- **The question.** `CategoryCardGrid.tsx:75` builds `${base}/${category.slug}` itself, not through `categoryPath()`, so a malformed stored slug would appear unencoded in the card `href`s on `/what-we-do` and `/products`.
- **Why that's safe.** Each point was tested offline with the 16 hostile slugs:
  1. **It can't leave the origin.** The base is fixed and checked at runtime (`normalizeHrefBase`: `^\/[a-z0-9]`, no `//`, no backslash), so every `href` starts with `/products/` and is path-absolute. All 16 resolved on this origin, including `//host`, `\\host`, `/\host`, tab-prefixed, `javascript:` and `http://` forms.
  2. **It can't break out of the attribute.** React 19.2.4 escapes the value: each slug rendered as exactly one `<a href="…">`, with no raw `<`, `>` or `"` inside and nothing injected.
  3. **It can't break out of the RSC inline script.** `next/link` is a client component (`'use client'` in `next/dist/client/app-dir/link.js`), so its `href` is serialized there; live, all 8 card `href`s appear in both the `?_rsc` payload and the HTML. Next's `htmlEscapeJsonString` (`next/dist/shared/lib/htmlescape.js`) escapes `& < > U+2028 U+2029` in that script.
  4. **The worst case is a same-origin GET to an unintended path** (`/products/../../admin` resolves to `/admin`), including `Link`'s prefetch. GETs change nothing, Server Actions need a POST that passes the Origin check, and `/admin` is gated. That's SEC-INFO-19's existing Info-level residual.
- **Why the sitemap was different in kind.** It's XML built from strings with no escaping at all, which is what fix (b) closed. The card `href` goes through the same React and RSC escaping as the category titles and descriptions, which are already free admin-entered text.
- **Root cause → T-026.** Recommend `/pm` add an explicit T-026 AC bullet: `normalizeProducts()` keeps a stored slug only if `isWellFormedSlug()` passes, with `/cso review`. That one change closes, at the source, the card `href`, the section links, the canonical, revalidation and the sitemap. It also closes SEC-INFO-19.
- **Optional consistency, not needed for security.** If T-026 (or T-025, at the builder's choice) wants the card to match `categoryPath()` for a malformed slug:
  - `` href={`${base}/${encodeURIComponent(category.slug)}`} `` is pre-cleared under the invariants in the T-025 sign-off; anything beyond that one expression comes back to `/cso`.
  - This office's advice is to leave it out of T-025: it changes nothing for any slug the app can store, and the root-cause fix makes it moot.

**Re-check verdict: ✅ CLEARED.** The clearance carries to `f1bd94d`.
- **Bound by sha256, unchanged:** `next.config.ts` `a44a56d9f997bb13…`, `settings-actions.ts` `8ca4d1ef35057fbe…`, `products-actions.ts` `bb3ba3e231219a09…`, `sitemap.ts` `105e10253fdd12fb…`.
- **Bound by sha256, new:** `nav.ts` `507e5c62c5f6347f…`, `products/page.tsx` `af42e29862093b8d…`, `products/[category]/page.tsx` `aa3846155de3215c…`.
- **Unchanged:** the invariant conditions and the pre-deploy position in the T-025 sign-off. `/ship`'s live check still adds the two encoded-redirect GETs.
- **Actions taken:**
  - GET and HEAD only to `:3101`, with no cookie;
  - offline scripts in the session scratchpad;
  - this append (and two §5 rows).

  No sign-in, no Server Action call, no write to the live database, no commit.

### 🔒 CSO Audit — 2026-10-04 — ticket-review:T-026

**Scope:** Dispatched by `/system-architect` per `docs/WORKFLOW.md` §3. **T-026** ("A dedicated admin Products page for categories and their products") touches `settings-actions.ts`, `products-actions.ts` and `site-content.ts`, adds a new server read module, and changes the admin UI.
- **The diff under review:** `git diff main...t-026-admin-products` at HEAD `a6ce5f6`. It touches 15 files (+1020/−271) across four commits:
  - `8ee80bf`, the ticket docs;
  - `e050f85`, the server contract;
  - `8d850bd`, the admin UI;
  - `a6ce5f6`, code-review fixes (forward stamps, trimmed long slugs).
- **History:** started 2026-10-03 on `8d850bd`, interrupted by an API usage limit, finished 2026-10-04 on `a6ce5f6`. Every check below was re-run on `a6ce5f6`.
- **The contract:** T-026's Acceptance, the binding `architect-reviewer` contract (items 1–11) and the premortem's MUST-ADDs (`docs/ROADMAP.md`), plus `docs/DECISIONS.md`, 2026-10-03, "T-026 save contract".
- **Independently confirmed untouched:** `src/middleware.ts`, `src/lib/supabase/`, `next.config.ts`, `db/`, `supabase-schema.sql`, `package.json`, `package-lock.json` and `.env.example`.

**Method.**
- **Static:** full reads of every server file this ticket touches, both editor clients and the middleware gate:
  - the branch versions of `settings-actions.ts` and `settings-read.ts`, the two admin loaders, `ProductsClient`, `BusinessClient` and `category-draft.ts`;
  - the diffs of `products-actions.ts`, `site-content.ts`, `SettingsForm.tsx`, `CategoryProductsManager.tsx`, `SeedDefaultsPanel.tsx` and `layout.tsx`.
- **Library behavior, from installed source:**
  - postgrest-js 2.112.2's `eq` and `is` append through `URLSearchParams`. Built offline against a `.invalid` host and never sent, the swap URL keeps the microsecond stamp exact (`+` becomes `%2B`), with `Prefer: return=representation`.
  - V8's `Date.parse` was checked on every stamp shape the code can meet.
- **Offline execution:**
  - **The builder's harness, reviewed first:** `hooks.mjs` refuses every real Supabase or Next module and makes `fetch` throw, and the fake is in-memory. Its suites passed (pure 20/20, actions 33/33), and all 8 current mutants were caught. `m8-slug-revert` is only valid when run through `SITE_CONTENT_PATH`, where it gives 2 + 1 failures.
  - **This office's own 17 adversarial tests** on the same harness, all passing (session scratchpad `cso-t026/cso.test.mjs`).
- **Live, read-only:** GET and HEAD with no cookie, against `:3101` only. It serves build `pNmmCUz8tfce-2qxnT_iu`, written 3 minutes before the `a6ce5f6` commit. It still matches `a6ce5f6`:
  - both of that commit's changes are in its server chunks;
  - no source file is newer than it;
  - the tree equals `a6ce5f6`.
- **Not done:** no sign-in, no Server Action call, no write, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.
- **Typecheck:** `npx tsc --noEmit --incremental false` exited 0.

**1. Public endpoints: ✅ exactly two new, each checking the session first.**
- **Export lists, main → branch.** `settings-actions.ts` goes from 12 to 14 (`+saveCategories`, `+saveWhatWeDoText`). `auth` (2), `form` (3), `jobs` (4), `media` (5) and `products` (6) are identical. That's 34 public Server Action exports in all, up from 32.
- **Not exported:**
  - `writeBusinessFields`, `requireUser` and `isPlainObject`;
  - `SAVE_CONFLICT`, `BUSINESS_MOVED`, `BUSINESS_UNREADABLE` and `SESSION_EXPIRED`;
  - `products-actions.ts`'s `categoryNotSavedYet` and `attachabilityError`.

  `pickWhatWeDoText` lives in `site-content.ts`, which is not a `"use server"` file.
- **`getUser()` comes first, with no table access before it.**
  - `saveCategories` (`settings-actions.ts:378`), `saveWhatWeDoText` (`:452`) and `seedSettingsFromDefaults` (`:120`) go through `requireUser`.
  - `updateSettings` refuses `business` with BUSINESS_MOVED at `:77`, after its own `getUser()` and before any read.
  - **Tested:** anonymous calls to all four return SESSION_EXPIRED with zero table operations and no revalidation. An authenticated `updateSettings("business", …)` returns BUSINESS_MOVED, also with zero table operations.
- **`src/lib/settings-read.ts` is not an endpoint.**
  - It has no `"use server"`, and its only importers are the two admin server pages.
  - It reads only the public `site_settings` row.
  - It imports `next/headers` through `@/lib/supabase/server`, so importing it from a client component fails the build. That indirect import is the only guard: there's no `server-only` package. Add `import "server-only"` if a refactor ever drops it.

**2. The compare-and-swap (`writeBusinessFields`, `settings-actions.ts:275-362`): ✅ every premortem item holds.**
- **One read feeds everything.** A single raw read (`value, updated_at`, `.maybeSingle()`) supplies the merge base, the category ids, the delete guard and the swap. Tested: exactly one `site_settings` read before the update.
- **Bad states fail closed, writing nothing:**
  - a read error returns its message;
  - an existing row whose `value` isn't a plain object, or whose stamp is neither a string nor null, returns BUSINESS_UNREADABLE (the builder's added stop);
  - a refusal from `build` writes nothing.
- **The write condition:** `.eq("key","business")` plus `.eq("updated_at", <raw string>)`, or `.is("updated_at", null)`, then `.select("key")`. Tested: the filter carries the stamp byte-for-byte, microseconds included.
- **Conflicts are reported, never retried:**
  - 0 changed rows → SAVE_CONFLICT, plus a `console.error` with the read, written and current stamps (`:343`);
  - a missing row is inserted, never upserted. `23505` → SAVE_CONFLICT, and an empty insert result → SAVE_CONFLICT;
  - there's no automatic retry, and both callers return `{ok, error}` without throwing (the one theoretical exception is in item 3).
- **`ok: true` follows only a returned changed row.** Both actions revalidate only after that. Tested: no revalidation on any failure.

**How RLS affects the swap.** The live `site_settings` policies aren't in the repo; `supabase-schema.sql` shows only an `anon` SELECT (`TO anon`). The owner's read-only SQL check is the pre-merge HARD STOP.
- **Postgres's documented rules for `UPDATE … WHERE … RETURNING` as `authenticated`:**
  - the existing row must pass the UPDATE policies' USING and, because WHERE and RETURNING read columns, the SELECT policies' USING. A row that fails either is silently skipped;
  - the new row must pass UPDATE WITH CHECK and, for RETURNING, SELECT USING. Postgres adds both as checks that raise an error rather than drop the row;
  - on the insert path, the new row must pass INSERT WITH CHECK and SELECT USING the same way, and the unique violation fires whatever RLS hides.
- **So the swap is safe under every policy shape.**
  - A policy can only turn a save into SAVE_CONFLICT (row skipped) or an RLS error (new row refused).
  - It can never report success without a write, or write without the stamp condition, because RLS only narrows the WHERE.
  - A row hidden from `authenticated` by the SELECT policy would make the editor load defaults. But every save would then hit `23505` → SAVE_CONFLICT, so it can't overwrite; insert-not-upsert carries that.
- **For it to work, the owner's results must show all of the following** (SEC-INFO-38):
  1. RLS is enabled on `public.site_settings`.
  2. PERMISSIVE policies give `authenticated` SELECT and UPDATE with USING true (at least for `key = 'business'`) and WITH CHECK true, plus INSERT WITH CHECK (needed only if the row is ever missing). No RESTRICTIVE policy is one that `authenticated` fails on the business row. `FOR ALL TO authenticated USING (true) WITH CHECK (true)` satisfies all of this.
  3. `anon` has SELECT only: no INSERT, UPDATE, DELETE or ALL policy applies to `anon` or `public`.
  4. `authenticated` has the SELECT, INSERT and UPDATE grants on the table.
  5. No trigger returns NULL on UPDATE or rewrites `value`. A trigger setting `updated_at := now()` is fine.
  6. The table has no rules: `select rulename from pg_rules where tablename = 'site_settings'` returns 0 rows. **This query isn't in the premortem's list; recommend the owner add it.**
  7. `updated_at` is `timestamp with time zone NOT NULL`, and `updated_at::text` for `business` is an ordinary current timestamp (not `infinity`, not a year past 9999).
  8. `key` is the primary key.
- **If any of these differs,** saves fail closed. The server log tells the cases apart: a current stamp equal to the read stamp means the row was blocked, not conflicted. The fix is a reviewed migration, never a policy widened by hand (see §7 item 10).
- **What the swap doesn't cover:** it guards `site_settings` only. A product inserted into a category being deleted, between the delete guard's count and the swap, can still be orphaned. That's SEC-MED-5's accepted window, no wider and no narrower.

**3. `a6ce5f6`'s forward stamp (`settings-actions.ts:305-306`): ✅ it can't weaken the swap or the fail-closed paths.**
- **The filter is unchanged.** It still uses the raw read string; `Date` only computes the value written. Tested:
  - for microsecond, future and Postgres-text stamps, the written stamp is strictly later and the filter stays raw;
  - `infinity`, `-infinity`, garbage and an unsigned 6-digit year fall back to `Date.now()`, which was the pre-fix behavior, without throwing;
  - 50 chained saves never repeat a stamp.

  So stored stamps now strictly increase. That closes the same-millisecond ABA case, which this office had judged negligible.
- 🟢 **SEC-INFO-39 (new; Info). Two edges, neither reachable from a `timestamptz` column.**
  - **A theoretical throw.** `toISOString()` throws `RangeError` only for a stamp that parses to exactly the maximum JS time (`+275760-09-13T00:00:00.000Z`).
    - Postgres never emits that signed form, and its unsigned 6-digit year parses to NaN.
    - Even then, it throws before any write. Tested: nothing written, no revalidation.
    - The admin would see the generic "Save failed" text rather than a returned message.
  - **An offset-less stamp parses as local time.** That matters only if `updated_at` were `timestamp without time zone`, on a server east of UTC (the owner's dev machine is UTC+6), with a stored stamp ahead of that server's clock. Even then, the stamp falls back to `now()`, the pre-fix behavior. Item 7 of the owner's check confirms the column type.
- **The slug trim** (`site-content.ts:588`) is `slugify(title).slice(0, 255).replace(/-+$/, "")`.
  - Tested on 452 long titles: always well-formed, at most 255 characters, never empty.
  - This closes the T-025 entry's `/pm` note: a 255+ character title used to block its own next save.
  - The collision check still runs after the trim.

**4. Integrity: ✅ one writer per field, and every identity rule kept.**
- **`saveCategories` keeps every rule:** `readStoredCategoryIdentities` on the same read, `resolveCategoriesForSave`, `computeRemovedCategories`, and the delete guard ("Remove its products first"). Tested:
  - forged slugs are ignored;
  - extra keys on a category are dropped: stored objects hold exactly `id, title, slug, description, image`;
  - stored text fields are carried through untouched;
  - the delete guard, duplicate ids, a non-array and a `Set` each refuse the save, writing nothing;
  - a `"__proto__"` key arriving over the wire is an own key after JSON parsing, so it can't carry an inherited `id`. Even a real prototype `id` counts as a claim, and a duplicate claim refuses the whole save.
- **`saveWhatWeDoText` can't write `products` or extra keys.** `pickWhatWeDoText` (`site-content.ts:682`) builds a new object from the 4 own properties only. Tested:
  - smuggled `products`, `id`, `slug`, extra keys and a `__proto__` key never reach storage;
  - unknown stored keys are carried through;
  - a Map, a `String` object, a Set, a sparse array, an inherited field or a missing field each refuse the whole save, with nothing written.
- **The seed can't write `business.products`.**
  - `business` goes through `writeBusinessFields` with only the 4 text fields.
  - Prototype-named keys (`constructor`, `__proto__`, `toString`) select nothing and touch no table.
  - A failed read of the other rows now stops the sync instead of dropping their stored-only fields.
  - Tested: stored categories and their ids survive a sync byte-for-byte.
- **SEC-MED-15 and SEC-INFO-19 are closed at the root.** `normalizeProducts()` (`site-content.ts:451`) now keeps a stored slug only if `isWellFormedSlug()` passes.
  - Tested on 22 hostile stored values and a 2,000-case fuzz: every slug it returns matches `^[a-z0-9]+(-[a-z0-9]+)*$`.
  - That's what every downstream slug sink now receives: card and section links, the canonical URL, revalidation, the sitemap and the attachability fallback.
  - A well-formed stored slug still wins after a rename.
  - SEC-INFO-19 is **closed in code, pending merge**.

**5. The admin gate: ✅ 49 anonymous probes against `:3101`, all clean.**
- **Gated.** Every form that resolves to an admin page answers 307 to a relative `/admin/login`, with no `Set-Cookie` and no editor content:
  - the premortem's set: plain, `RSC: 1`, prefetch, `?_rsc`, segment prefetch, `.rsc` and `.segments/_tree.segment.rsc`;
  - `/admin/business` in the same forms;
  - path tricks: `/admin/%70roducts`, `%2F`, `%3B`, `%00`, `%09`, `;x`, `./`, `x/../`, `/admin/login/../products`, `/admin/login/%2e%2e/products`, `/admin/loginx/../products`, `(dashboard)` raw and encoded, and `/index`;
  - bypass headers: `x-middleware-subrequest` in three forms, `x-nextjs-data`, `x-matched-path`, `x-invoke-path`, `x-middleware-prefetch`, `Purpose: prefetch`, and a spoofed `X-Forwarded-Host`.
- **Normalized first.** A trailing slash, `//`, `/\` and `/admin//products` take a 308 to `/admin/products`, then the 307, as the builder saw.
- **No route (404).** `/%61dmin/…`, uppercase forms, `/admin/login%2F..%2Fproducts`, and the image-suffix paths the middleware matcher skips. No admin route has a dynamic segment, so that matcher exclusion can't reach a page.
- **The data route.** `/_next/data/<id>/admin/products.json` answers 307 with `x-nextjs-redirect: /admin/login` and an empty body.
- **Route list.** The builder's build shows `ƒ /admin/products`, and the app-paths manifest lists it.
- **Unchanged design.** No admin layout or page re-checks the session, so the middleware is the only page-render gate. The data itself stays gated by RLS and by the actions' own session checks. Anyone who got past the gate would see only public rows on these pages.

**6. Client side and leaks: ✅**
- **The new editors fail closed.** Without a successful read, `ProductsClient` and the slimmed `BusinessClient` show a `role="alert"` message and no Save button.
- **No new sink.**
  - Every error renders as JSX text.
  - The diff adds no raw-HTML sink, `process.env`, `NEXT_PUBLIC_*`, client Supabase import or debug print.
  - The one new `"use client"` file is `ProductsClient.tsx`.
- **No forbidden imports.** `products/*` and `business/*` don't import each other, and no client component imports `settings-read` or `@/lib/supabase/*`.
- **The draft stays out of the product manager.** `CategoryProductsManager` receives `confirmed`, never `draft`.
- **Nothing leaks into the bundle.** `.next/static` (48 files) has 0 hits for key shapes, the `stack.json` `secretPatterns`, the Supabase client, `writeBusinessFields`, `readSettingsForEditor`, the message constants or table access. The two new actions appear only as `createServerReference` stubs. The diff has 0 secret-pattern hits.
- **Not touched by T-026:** the product read on `/admin/products` (`getAllCategoryProducts`) still shows empty lists when it fails. That's T-016's fail-open class, and it can't cause loss: the delete guard re-reads `products` server-side. Carried to T-016.
- **T-025 carry-over, checked.** Post-review commit `c8d4d85`'s card change is exactly the pre-cleared ``href={`${base}/${encodeURIComponent(category.slug)}`}``.

**7. As another user.**
- **Anonymous vs admin — PASS.**
  - Live: the 49 gate probes above.
  - Offline, on the real action code: anonymous calls to all four business writers return SESSION_EXPIRED before any table access.
  - Server Actions were not called live (owner's law).
- **A second authenticated user — N/A.** There's one role (any signed-in account is an admin, R1 / SEC-HIGH-2), so user B can do everything user A can.
- **RLS for `authenticated`, and the swap under it — not testable without a session.** That is the owner's SQL check (the HARD STOP; item 2's list) and the owner's two-tab checklist.

**Standing items:**
- **SEC-HIGH-2:** unchanged; sign-ups were reported still ON. For the structural fix: T-026 adds 2 session-checked endpoints (34 public exports in all), and `seedSettingsFromDefaults` moves from an inline `getUser()` to `settings-actions.ts`'s `requireUser`.
- **SEC-MED-15:** both fixes are now in code. (b) is merged with T-025, and (a) arrives with T-026. **Production stays exposed** until a deploy of a `main` containing them.
- **Dependencies:** unchanged; the package files are untouched (SEC-INFO-31 as of 2026-10-03).
- **Carried to T-016:**
  - SEC-INFO-37 (`products-actions.ts:157-159`; `CategoryProductsManager.tsx:91,110,117,122,134,146`);
  - SEC-INFO-36 (`ProductGrid.tsx:8`);
  - the fail-open product read (`products-actions.ts:150-155`);
  - and, for context, T-014's image-scheme gap (SEC-MED-7/13), which product images share.

**Overall verdict this pass:** ✅ **T-026 cleared, conditional on the pre-merge HARD STOP**: the owner's read-only SQL results must match item 2's list.
- No 🔴, 🟠 or 🟡 finding.
- Two new 🟢: SEC-INFO-38 (the swap under RLS, and what the owner's results must show) and SEC-INFO-39 (the forward stamp's edges).
- Closed in code, pending merge: SEC-INFO-19, SEC-MED-15's root cause, and the T-025 note about long-title slugs.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-026 may proceed to `/qa` → `code-reviewer` → **the owner's SQL check (HARD STOP)** → merge. Conditions:
- **The owner's SQL results must match item 2's list (1–8).** Anything else comes back to `/cso` before merge: a narrower `authenticated` predicate, any `anon` write, a trigger that cancels updates or rewrites `value`, a rule, or an `updated_at` that isn't `timestamptz`. Never widen a policy by hand.
- **Server files are bound by sha256 at `a6ce5f6`:**
  - `settings-actions.ts` `2785952a83f7616e…`
  - `products-actions.ts` `44b47ada7540a575…`
  - `site-content.ts` `465f6712f28395f5…`
  - `settings-read.ts` `cc5c8a2c06d9acb0…`
  - `admin/(dashboard)/products/page.tsx` `1067bb51b8add066…`
  - `admin/(dashboard)/business/page.tsx` `87071736c1516fcb…`
- **Client files are bound by invariants, not hashes.** `ProductsClient`, `BusinessClient`, `category-draft`, `CategoryProductsManager`, `SettingsForm`, `SeedDefaultsPanel` and `layout.tsx` may change for design if they still:
  1. import no Server Action beyond those they already import;
  2. import nothing from `@/lib/settings-read` or `@/lib/supabase/*`;
  3. render errors only as JSX text;
  4. add no raw-HTML sink;
  5. give `CategoryProductsManager` `confirmed`, never `draft`;
  6. show no Save without a successful load;
  7. keep `products/*` and `business/*` from importing each other.

**Pre-deploy position:**
- A `main` holding T-026 at these hashes adds no sensitive surface beyond this pass.
- It isn't held for SEC-HIGH-2, which predates it.
- `/ship` follows the premortem's release steps, including the live check that `/admin/products` answers 307 to `/admin/login`.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, plus its §3, §5 and §7 rows). Left uncommitted, for the orchestrator.
- Made only GET and HEAD requests, with no cookie, to `:3101`.
- Ran offline tests in the session scratchpad.
- No sign-in, no Server Action call, no write to the live database, no build, no server started or stopped.

### 🔒 CSO Audit — 2026-10-04 — ticket-review:T-026 (the owner's SQL evidence)

**Scope:** The owner ran the expanded read-only SQL check on 2026-10-04. It's the pre-merge HARD STOP.
- The orchestrator relayed the result rows. They're recorded here verbatim and checked against the 8 points in the T-026 entry, item 2.
- This office touched no database.

**The owner's result rows (verbatim):**

| kind | detail |
|---|---|
| rls | enabled=true forced=false |
| policy | Allow public read on site_settings \| PERMISSIVE \| SELECT \| anon \| using: true \| check: - |
| policy | Allow authenticated full access to site_settings \| PERMISSIVE \| ALL \| authenticated \| using: true \| check: true |
| grants | anon \| select=true insert=true update=true delete=true |
| grants | authenticated \| select=true insert=true update=true delete=true |
| column | key \| character varying(100) \| not null=true |
| column | value \| jsonb \| not null=true |
| column | updated_at \| timestamp with time zone \| not null=true |
| primary key | key |
| business updated_at | 2026-08-31 07:10:19.408+00 |

No `trigger` and no `rule` rows came back. The query covered non-internal `pg_trigger` rows and `pg_rules`.

**Point by point: ✅ all 8 match.**
1. **RLS is enabled: match.**
   - `forced=false` exempts only the table's owner. The results don't show the owner; it's expected to be `postgres`, because the table was created in the SQL editor.
   - If the query is ever re-run, add `relowner::regrole`.
2. **Permissive policies give `authenticated` SELECT, UPDATE and INSERT, with USING true, WITH CHECK true and nothing restrictive: match.** There's one PERMISSIVE `ALL` policy with `using: true` and `check: true`, and both policies are permissive.
3. **`anon` can only SELECT: match at the policy level.**
   - The only `anon` policy is SELECT, and the `ALL` policy is `TO authenticated`, not `public`.
   - `anon` still holds Supabase's default write grants, but RLS denies them. Without an `anon` INSERT policy, an insert raises an error. Without `anon` UPDATE or DELETE policies, those commands affect zero rows.
   - So RLS is the only barrier here; see SEC-INFO-40.
4. **`authenticated` has the SELECT, INSERT and UPDATE grants: match** (it has DELETE too).
5. **No trigger cancels updates or rewrites `value`: match.** There are no triggers at all.
   - So `updated_at` stores exactly what the app writes.
   - `a6ce5f6`'s forward stamp (SEC-INFO-39) is therefore the live guarantee against a repeated stamp (ABA). The orchestrator's reading is right.
6. **No rules: match.**
7. **`updated_at` is `timestamptz NOT NULL` and holds an ordinary current value: match** (`2026-08-31 07:10:19.408+00`).
   - The value has millisecond precision, from the previous app writer. PostgREST returns it as `2026-08-31T07:10:19.408+00:00`, which parses, so the next save writes a strictly later stamp.
   - Both of SEC-INFO-39's edges are unreachable: the column is `timestamptz`, and the value is nowhere near the maximum JS time.
   - The date also shows the row hasn't been written since 2026-08-31. The first category save under the id system is still pending, as T-026's checklist expects.
8. **`key` is the primary key: match.**
   - `value` is `jsonb NOT NULL` too, so the code's null-value branch can't occur. BUSINESS_UNREADABLE still covers a value that isn't an object.

**What follows:**
- **The swap works as built under the live policies.**
  - The conditional UPDATE … RETURNING passes USING, WITH CHECK and the SELECT check through the `ALL … true/true` policy.
  - The insert path passes as well, and its `23505` comes from the primary key.
  - SEC-INFO-38 is satisfied: **from the security side, the HARD STOP is met.**
- **SEC-HIGH-2's premise is now evidenced for this table, not just assumed.** Any authenticated identity has full write access to `site_settings` by policy. That changes neither its rating nor its open status.

🟢 **SEC-INFO-40 (new; hardening; not exploitable today).** `anon` holds INSERT, UPDATE and DELETE grants on `site_settings` (Supabase defaults), and RLS alone denies them.
- **The risk:** if RLS were ever disabled on the table, or a permissive write policy were added `TO public`, anyone holding the anon key could write the site's content directly. Revoking the grants means two independent controls would have to fail.
- **Recommendation: a separate `[db]` ticket, not T-026.** A hand-applied migration (`PENDING_USER_APPLY`), reviewed by `architect-reviewer` and `/cso`, then applied by the owner. It should:
  - revoke everything but SELECT from `anon` on `site_settings`. That includes TRUNCATE, REFERENCES and TRIGGER, which the query didn't list. RLS never applies to TRUNCATE, though PostgREST can't issue one;
  - optionally drop DELETE and TRUNCATE from `authenticated`, since the app never deletes a settings row;
  - extend the same explicit grants to the other implicitly granted tables (SEC-INFO-10's follow-up), with one caution: `submissions` needs `anon` INSERT and must not get SELECT.

  This follows the `products` precedent (migration 0001).
- **It doesn't block** T-026 or deploy.

**The coming design round** is className-only: `text-white` → `text-foreground` in `ProductsClient.tsx`, `SettingsForm.tsx` and `CategoryProductsManager.tsx`, plus possibly bolding a phrase in `ProductsClient`'s copy.
- That's within the 7 client invariants of the T-026 sign-off, so it needs no `/cso` re-review.
- `/qa static` confirms the diff is className and copy only, and that the six bound server hashes are unchanged.

**Verdict on the evidence: ✅ all 8 points match.**
- From the security side, T-026's pre-merge HARD STOP is satisfied.
- One new 🟢, SEC-INFO-40, goes to a separate `[db]` ticket.
- The T-026 clearance and its conditions are otherwise unchanged.

**Actions taken:** this append and three §5 rows, left uncommitted. No database access, no request, no build.

### 🔒 CSO Audit — 2026-10-05 — ticket-review:T-016

**Scope:** Dispatched by `/system-architect`. **T-016** ("Fix the product editor's ordinary-use data bugs before staff start using it") touches the product Server Actions, `site-content.ts`, both `products/page.tsx` files, the product editor and `ImageUploadField`.
- **The diff under review:** `git diff main...t-016-product-editor` at HEAD `eabec4b`. It touches 9 files (+845/−228) across three commits:
  - `afb7997`, the contract docs;
  - `44cdfb2`, the partial update, the read that can fail, and the Map;
  - `eabec4b`, one save queue per product, and the opt-in `commitPathOnBlur`.
- **The contract:** items 1–12, amended C1–C6, and the premortem's MUST-ADDs (`docs/ROADMAP.md`), plus the four 2026-10-04 rows in `docs/DECISIONS.md`.
- **This office's scope:** MUST-ADD 11 and the dispatch's items (1)–(7).

**Method.**
- **Static:** full reads of
  - the branch's `products-actions.ts`;
  - the diffs of `site-content.ts`, both page files, `ProductsClient.tsx` and `ImageUploadField.tsx`;
  - `CategoryProductsManager.tsx`'s queue, payload builders, effects, timers and render sinks.
- **The builder's harness (`scratchpad/t-016/harness/`), reviewed first, then run:**
  - **Isolation:** the loader refuses `@/lib/supabase/*` and `@supabase/*`, and no `.env` is read. Chrome runs headless over `--remote-debugging-pipe`: no port, every host mapped to NOTFOUND, every http(s)/ws(s) URL blocked, a throwaway profile. Mutations are swapped in memory; nothing is written to the repo.
  - **Results:** server 117/117, serializer 14/14, `hasVisibleText` 111/111, UI 249/249 (production, and development under StrictMode), and 35/35 mutations caught. No Chrome process was left over, and the repo was untouched.
  - The only working-tree change during the run was a one-line `docs/ROADMAP.md` clarification by another agent. The harness never references `docs/`, and this office didn't touch it.
- **This office's own 9 adversarial tests** on the reviewed T-026 harness, all passing (session scratchpad `cso-t016/cso.test.mjs`). That fake returns an array from `update().maybeSingle()`, so the tests emulate the real one-row-or-null.
- **Live, read-only:** GET and HEAD with no cookie, against `:3101` only. It serves build `so_zCLXv2DgfyR_H5Maaz`, written 14 s before the `eabec4b` commit. It still matches `eabec4b`:
  - no source file is newer than it, and the tree equals `eabec4b`;
  - `eabec4b`'s client markers are in `.next/static`: the path box's `isComposing`/`229` guard and the `hasVisibleText` regex.
- **Not done:** no sign-in, no Server Action call, no write, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.
- **Typecheck:** `npx tsc --noEmit --incremental false` exited 0.

**1. Re-binds by sha256: ✅ all four match the builder's report.**

| File | Before | `eabec4b` |
|---|---|---|
| `src/app/actions/products-actions.ts` | T-026 `44b47ada…` | `6899ea96444a7ea6…` |
| `src/lib/site-content.ts` | T-026 `465f6712…` | `2ae9d3f1782777ff…` |
| `src/app/admin/(dashboard)/products/page.tsx` | T-026 `1067bb51…` | `969a00dea762e782…` |
| `src/app/(website)/(marketing)/products/page.tsx` | T-025 `af42e298…` | `0aec2d4179e84a61…` |

- `site-content.ts` changes only by `CategoryProductPatch` (`:382`), `hasVisibleText` with its private regex (`:389-398`), and the `CategoryProductInput` comment.
- `normalizeProducts`' slug gate (`:474`) and `resolveCategoriesForSave` are unchanged.

**2. The 0-byte list: ✅ byte-identical to `main`.**
- **Every listed path:** `settings-actions.ts`, `settings-read.ts`, `business/page.tsx`, `SettingsForm.tsx`, `category-draft.ts`, `src/components/catalog/*`, `products/[category]/page.tsx`, `media-actions.ts`, `nav.ts`, `src/middleware.ts`, `src/lib/supabase/`, `next.config.ts`, `db/`, `supabase-schema.sql`, `package.json` and `package-lock.json`.
- **T-026's three hash-bound files keep their hashes,** so T-026's server sign-off on them still holds: `settings-actions.ts` `2785952a83f7616e…`, `settings-read.ts` `cc5c8a2c06d9acb0…`, `business/page.tsx` `87071736c1516fcb…`.

**3. Endpoints: ✅ unchanged.**
- **Exports:** `products-actions.ts` exports the same 6 functions plus types. The only new export is the type `AllProductsRead`.
- **Private:** the new constants (`SESSION_EXPIRED`, `PRODUCT_NOT_FOUND`, `PRODUCT_NAME_REQUIRED`, `PRODUCT_IMAGE_REQUIRED`, `NOTHING_TO_SAVE`, `PATCH_FIELDS`) and the new helpers (`takePatchFields`, `productFieldsError`, `groupByCategory`).
- **The other `"use server"` modules are unchanged,** so there are still 34 public exports, as at T-026.
- **`getUser()` is still the first await of every write.** Tested: anonymous calls to all four writes return SESSION_EXPIRED with zero table operations.

**4. The partial update (`updateCategoryProduct`, `products-actions.ts:285-331`): ✅ every step, in the contract's order.**
- **Session first.** `getUser()` is the first await (`:287`), and an empty id gives "Missing product id."
- **Only real fields are taken.** `takePatchFields` (`:142-151`) takes `name`, `description` and `image` only as own properties holding strings, trimmed.
  - Ignored, never turned into "": `null`, numbers, objects, inherited values, a Map, an array, and any other key (`category_slug`, `sort_order`, `id`, `created_at`, a `"__proto__"` key).
  - If nothing usable is left, it returns NOTHING_TO_SAVE.
  - Tested, with zero table operations in each case.
- **Validation runs before any read** (`:298-299`): `hasVisibleText` on whichever of name and image is present.
  - Tested: blank, whitespace, ZWSP/LRM, BOM and U+3164 are refused with zero table operations.
  - A row with an empty image can still have its description saved.
- **The category check runs on the stored slug** (`:305-316`), read by id with `.maybeSingle()`. Tested both ways: a client-sent attachable `category_slug` can't rescue a stored slug that isn't attachable, and a client-sent unknown one changes nothing.
- **The write** (`:318-323`) is only the taken fields plus `updated_at`. Tested: for a name edit, the update's keys are exactly `name` and `updated_at`, and the stored `category_slug` and `sort_order` are untouched.
- **A read or write error is never "not found".**
  - A read error (`:311`) and a write error (`:325`) return their own messages.
  - Only `data === null` gives PRODUCT_NOT_FOUND (`:312`, `:327`).
  - Tested, including a row deleted between the read and the update.
- **Revalidation runs only after a returned row** (`:329`), and only for `/products/<stored slug>` and `/products`. Tested: none on any failure.

**5. The read (`getAllCategoryProducts`, `:208-231`): ✅**
- **Its answers:** `{ ok: true, byCategory: Map }` (`groupByCategory`, `:165-173`) or `{ ok: false }`.
  - A database error is logged and answers `ok: false`.
  - A throw goes to `unstable_rethrow` first, then is logged and answers `ok: false`.
  - `ok: false` carries no error text, and `Object.create(null)` appears nowhere in `src`.
- **Tested:**
  - `constructor` and `__proto__` work as ordinary Map keys.
  - A database error answers exactly `{ ok: false }`, with none of its text.
  - A Next control-flow signal is rethrown untouched.
- **The serializer:** the builder's harness round-trips the Map, with keys `constructor`, `toString` and `t-shirts`, through Next 16.3.6's own compiled serializer, both as a client prop and as an action's return value.
- **The public page** (`(website)/(marketing)/products/page.tsx:54-83`):
  - `ok: true` builds sections with `byCategory.get(slug) ?? []`;
  - `ok: false` shows the category grid plus Coming Soon (DECISIONS 2026-10-04);
  - the `.catch` keeps `unstable_rethrow`, and `Object.entries` is gone.
- **The admin page** passes the result through.
  - A failed product read shows only `PRODUCTS_LOAD_FAILED`, in a `role="alert"`, as fixed copy: no picker, no add form, no rows.
  - A failed category read still turns the whole page off.

**6. The server-side visible-text rule (`hasVisibleText`): ✅**
- **On create,** the check runs after `getUser()` and the slug check, before any read (`:243-245`). `sanitizeInput` turns a non-string into "", which fails. Tested: an invisible name, a whitespace image, a null name and a numeric image are each refused with zero table operations.
- **The regex** is one character class, with no quantifier and no `g` or `y` flag. So it runs in linear time (no ReDoS) and keeps no state between calls. Tested on the premortem's rejects and accepts.
- **The add form's check** in the browser only mirrors the rule; the server decides.

**7. T-026's 7 client invariants, on `ProductsClient` and `CategoryProductsManager`: ✅ all hold.**
1. **No new Server Action import.**
   - `ProductsClient` imports `saveCategories`, plus `import type { AllProductsRead }` (`:6`), which is erased at build time.
   - `CategoryProductsManager` imports the same 4 product actions as `main`.
   - The client bundle ships no reference to `getAllCategoryProducts` or `getCategoryProducts`, so the browser never fetches products directly.
2. **No `@/lib/settings-read` or `@/lib/supabase/*` import** in either file.
3. **Errors render only as JSX text,** in `role="alert"`.
4. **No raw-HTML sink.**
5. **The product manager gets the confirmed list:** `categories={confirmed}`.
6. **Both fail closed:** no editor and no Save without a successful category read (`ProductsClient.tsx:53`), and no product manager without a successful product read (`:168`).
7. **No imports between `products/*` and `business/*`.**

**Also checked in `CategoryProductsManager.tsx`:**
- **Every products-map lookup** is `.get(slug) ?? []`, and every update builds `new Map(prev)` (`:189`, `:205-221`). There's no bracket lookup, `Object.entries` or `JSON.stringify` on a products map. That closes SEC-INFO-37's browser half.
- **A save's payload comes only from `changedFields`** (`:84-90`): an own key for each changed field among name, description and image, always a string, never `category_slug`, `sort_order` or `id`.
- **`updateCategoryProduct` is called only from the queue's `send`/`runSave`** (`:250-270`).
  - The one timer (`:823`) only hides "Saved".
  - The two effects only move focus or run that timer.
  - There's no automatic retry.

**`ImageUploadField.tsx`: ✅ only the opt-in `commitPathOnBlur` prop.**
- The upload path is unchanged: the client checks, then `uploadOptimizedImage`, whose server-side checks live in `media-actions.ts`, which is byte-identical.
- With the prop off, the path box calls `onChange` on every keystroke, exactly as before. Only a product row turns it on.
- The admin preview's `<img src={value}>` predates this ticket (SEC-MED-7/13's class, T-014).

**8. The admin gate and leaks: ✅**
- **49 anonymous probes** against `:3101`, the T-026 set: 40 gave 307 → `/admin/login`, 7 had no route (404), the data route gave `x-nextjs-redirect: /admin/login`, and the login page gave 200. No `Set-Cookie`, and no editor content.
- **`.next/static`** (48 files) has 0 hits for:
  - key shapes, and the `stack.json` `secretPatterns`;
  - the Supabase client, and the read actions' references;
  - the private product messages and helpers, and `products` table access.
- **Public pages:** `/products`, all 8 `/products/<slug>` pages and `/what-we-do`, as HTML and as `?_rsc`, give 20 responses, all 200, with 0 UUID-shaped and 0 JWT-shaped strings. `/products` shows Coming Soon (0 live products).
- **The diff:** 0 secret-pattern hits.

**9. As another user.**
- **Anonymous vs admin — PASS.** Live: the 49 probes. Offline, on the real action code: anonymous calls to all four product writes return SESSION_EXPIRED before any table access.
- **A second authenticated user — N/A.** There's one role (R1 / SEC-HIGH-2).
- **Cross-tab writes by the same role:** the partial update now confines each write to the fields it carries. Two tabs editing different fields keep both edits, and a reorder survives an edit (the builder's UI ordering f).

**Status changes:**
- **SEC-INFO-37: closed in code, both halves, pending merge.** The server groups products into a Map (`products-actions.ts:165-173`), and the editor and the public page look them up through Maps.
- **SEC-INFO-20: closed in code, pending merge.** `updateCategoryProduct` never writes `category_slug`, so an edit can no longer move a product to another category.
- **SEC-MED-11: halved.** The update no longer accepts `sort_order`. Only `createCategoryProduct` still takes a caller's finite value (T-014).
- **SEC-MED-8: extended, as planned (T-018).** `updateCategoryProduct`'s new read-error and write-error branches (`:311`, `:325`) return raw database text to authenticated callers. Nothing is reachable before `getUser()`.
- **SEC-MED-5: unchanged,** deferred by DECISIONS 2026-10-04. A product added during a category delete can be orphaned; it's recoverable.
- **SEC-INFO-36: moved from T-016 to T-033,** by the 2026-10-04 split.

**Carry-overs:**
- **T-014**, now unblocked, since the path box no longer saves on every keystroke: SEC-MED-7/13 (the image URL allow-list), SEC-MED-11 (create's `sort_order`) and SEC-INFO-15 (the 255-character name cap).
- **T-033:** SEC-INFO-36 (the product mapper), and category-title hygiene, including a visible-character check in `resolveCategoriesForSave`.
- **T-018:** SEC-MED-8's raw database text, including the two new branches above.
- **T-010:** the `ObjectListEditor` upload race. It's an integrity issue, not a security one.
- **Backlog:** SEC-MED-5.
- **Still separate:** SEC-INFO-40 (the `[db]` grants hardening) and SEC-HIGH-2.

**Overall verdict this pass:** ✅ **T-016 cleared.**
- No 🔴, 🟠 or 🟡 finding, and no new 🟢.
- Closed in code, pending merge: SEC-INFO-37 and SEC-INFO-20.
- SEC-MED-11 is narrowed.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** T-016 may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **Server files are bound by sha256 at `eabec4b`:** the four re-binds in item 1. The T-026 bindings on `settings-actions.ts`, `settings-read.ts` and `business/page.tsx` stand. If a bound file changes before merge, the clearance lapses for that file until `/cso` re-reviews it.
- **Client files are bound by invariants, not hashes.** `ProductsClient`, `CategoryProductsManager` and `ImageUploadField` may change for design if they still:
  1. keep T-026's 7 client invariants;
  2. build every save payload only from `changedFields`: own string `name`, `description` and `image`, nothing else;
  3. have no timer, effect or render path that calls a Server Action;
  4. keep `commitPathOnBlur` opt-in, with the upload path unchanged;
  5. look up the products map only through `Map.get`.
- **Contract triggers:** any of the contract's re-review triggers (`docs/ROADMAP.md` T-016) also comes back to `/cso`.

**Pre-deploy position:**
- A `main` holding T-016 at these hashes adds no sensitive surface beyond this pass.
- `/ship` follows the premortem's release steps: the staff freeze, the tab reloads, recording Skew Protection, and the live checks, including `/admin/products` → 307.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, plus its §3 and §5 rows). Left uncommitted, for the orchestrator.
- Made only GET and HEAD requests, with no cookie, to `:3101`.
- Ran offline tests in the session scratchpad.
- No sign-in, no Server Action call, no write to the live database, no build, no server started or stopped.

### 🔒 CSO Audit — 2026-10-06 — ticket-review:Wave 1 (T-033 + T-032)

**Scope:** Dispatched by `/system-architect` (the 2026-10-06 autonomous run, Wave 1). It covers two tickets under one binding contract: **T-033** (category-title and slug hygiene, catalog narrowing, admin copy) and **T-032** (category-save and settings-key edge cases).
- **The diff under review:** `git diff main...wave-1-catalog-hygiene` at HEAD `032c8fa`, merge base `95f7ea1` (= `main`). It touches 11 files under `src/` (+285/−90) across three commits:
  - `010939f`, the contract and premortem (docs only);
  - `2aab4d5`, T-033: contract items 1, 2 and 7–11 (11 files, +223/−84);
  - `032c8fa`, T-032: items 3–6 (3 files, +62/−6).
- **The contract:** the Wave 1 binding contract (items 1–13) and the premortem's MUST-ADDs 1–13 at the top of T-033 (`docs/ROADMAP.md`), plus `docs/DECISIONS.md`, 2026-10-06, "Wave 1 contract".
- **Commit names:** all three commits are authored `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.

**Method.**
- **Static:** full reads of the files the contract touches.
  - **On the server:** the branch's `settings-actions.ts` (the allowlist, the Sync result, the delete guard) and `products-actions.ts`, plus `settings-read.ts`, which is unchanged.
  - **Shared and public:** the slug and save functions in `site-content.ts`, both public pages, `ProductGrid.tsx` and `ProductCard.tsx`.
  - **Admin clients:** `BusinessClient.tsx`, `SeedDefaultsPanel.tsx` and `category-draft.ts`, plus the diff of `ImageUploadField.tsx`.
- **Compiled artifacts, read-only:** the server-reference manifest, the server chunks and `.next/static` (48 files) of the build that `:3101` serves.
- **The builder's harness (`scratchpad/wave-1/harness/`), reviewed first, then run from a private copy.** The copy keeps its outputs, and any concurrent run, untouched.
  - **Isolation:**
    - The loader refuses `@/lib/supabase/*` and `@supabase/*`, and mutations and `main`'s copies are swapped in memory.
    - Every `git` call is read-only, every write lands in the harness folder, and no `.env` is read.
    - Chrome runs headless over `--remote-debugging-pipe` (no port), with every host mapped to NOTFOUND and every http(s)/ws(s) URL blocked and counted.
  - **Results (`--stage final`):** 729/729 checks (slug 58, categories 91, sync 57, render 55, types 9, scope 74, UI 175, settings keys 76, attachable 134) and 65/65 mutants killed.
    - Each kill is a named failing assertion, not a crash.
    - The repo stayed clean, and no Chrome process was left.
  - **A first run from the copy failed only in the slug suite.** It reads the baseline capture by a relative path; once that was linked, everything passed. The mutations were re-run too, because a crashing suite would count every mutant it checks as killed.
- **This office's own 38 adversarial tests** on the reviewed loader and fake database, all passing. Seven in-memory one-rule reverts of the security rules were all caught (session scratchpad `cso-wave1/harness/cso/`).
- **Live, read-only:** GET and HEAD with no cookie, against `:3101` only. It serves build `uJ6gQNfbIFf9rjlZy1uyU`:
  - `.next/BUILD_ID` was written at 10:25:19, 22 s after the `032c8fa` commit. No source file is newer, and the tree equals `032c8fa`.
  - The server process started at 10:29:50 from the repo. All 20 live page bodies carry that build id, and none carries `main`'s.
  - `032c8fa`'s client markers are in `.next/static` and its server strings are in the server chunks. The old NOTHING_TO_SAVE wording is in neither.
- **Not done:** no sign-in, no Server Action call against the live database, no write, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.
- **Typecheck:** `npx tsc --noEmit --incremental false` exited 0.

**1. Re-binds by sha256: ✅ all five match the builder's report.** Each `main`-side hash is the sign-off this wave voids.

| File | Before (`main` `95f7ea1`) | `032c8fa` |
|---|---|---|
| `src/lib/site-content.ts` | T-016 `2ae9d3f1782777ff…` | `0f346ee1a57fea1a…` |
| `src/app/actions/settings-actions.ts` | T-026 `2785952a83f7616e…` | `4de7d6a482792281…` |
| `src/app/actions/products-actions.ts` | T-016 `6899ea96444a7ea6…` | `bf86b1dfac9d20ee…` |
| `src/app/(website)/(marketing)/products/page.tsx` | T-016 `0aec2d4179e84a61…` | `238f87491891667b…` |
| `src/app/(website)/(marketing)/products/[category]/page.tsx` | T-025 `aa3846155de3215c…` | `bc243115a2583eba…` |

- **`site-content.ts` changes only by:**
  - the private `MAX_SLUG_LENGTH`, `slugBody` and `cutSlug` (`:403-421`);
  - `slugify` (`:427`), `dedupeSlug`'s fit (`:438-445`) and `isWellFormedSlug`'s named limit (`:515`);
  - the two private messages (`:534`, `:542`) and `resolveCategoriesForSave`'s two refusals (`:610`, `:654`).

  It still has no imports.
- **`settings-actions.ts`** changes only by:
  - the allowlist (`:57`, `:91`);
  - the Sync result (`:121-131`, `:148-196`);
  - `quotedList` and the delete guard's wording (`:399-402`, `:449-455`);
  - the comment block above `writeBusinessFields`.

  **Byte-identical to `main`:** `writeBusinessFields`, `saveWhatWeDoText`, `requireUser`, `isPlainObject` and `getSettings`, comments included. So are SAVE_CONFLICT, BUSINESS_MOVED, BUSINESS_UNREADABLE, SESSION_EXPIRED and Sync's key filter.
- **`products-actions.ts`** changes only by:
  - the import swap (`:21`);
  - NOTHING_TO_SAVE and CATEGORY_CHECK_FAILED (`:54-55`);
  - the `unchecked` reason (`:76`, `:87`) and the read (`:113-115`).

  Create, update, delete and reorder are untouched.
- **The two pages** change only by the `toProductCards` call (`page.tsx:151`, `[category]/page.tsx:88`) and its import.

**2. The unchanged list: ✅ byte-identical to `main`.**
- **Still signed off, with the same hash:**
  - T-026: `settings-read.ts` `cc5c8a2c06d9acb0…` and `business/page.tsx` `87071736c1516fcb…`;
  - T-016: the admin `products/page.tsx` `969a00dea762e782…`;
  - T-025: `nav.ts` `507e5c62c5f6347f…`, `sitemap.ts` `105e10253fdd12fb…` and `next.config.ts` `a44a56d9f997bb13…`.
- **Also 0-byte:**
  - the admin clients: `ProductsClient.tsx`, `CategoryProductsManager.tsx`, `SettingsForm.tsx`, and the six settings clients (and every other importer of `settings-actions.ts`);
  - the public grid `CategoryCardGrid.tsx`, and `media-actions.ts`;
  - the gate and data layer: `src/middleware.ts`, `src/lib/supabase/`, `db/` and `supabase-schema.sql`;
  - `package.json`, `package-lock.json` (`6a026457…`, T-006's) and `.env.example`.
- **Only the contract's 11 files changed under `src/`.** The contract's "Touches (10 source files)" lists 11: the list is right and the count is a typo.
- **The final build's route list** is byte-identical to `main`'s, so there's no new route.

**3. Endpoints: ✅ unchanged, and the new import adds none.**
- **The export lines are byte-identical** in both action files, and every `"use server"` module exports what `main` does: 34 public Server Actions. No constant is exported.
  - The only signature change is the private `SeedResult`: a failure now also carries `seeded`. The contract allows that.
- **`readSettingsForEditor` is not an endpoint, as the build itself shows.** The compiled `server-reference-manifest.json` lists exactly 34 action ids, all exports of the six `"use server"` files. Neither `readSettingsForEditor` nor `checkCategoryAttachable` is among them.
  - `settings-read.ts` has no `"use server"`. Its importers are the two admin server pages and `products-actions.ts`.
  - `ProductsClient` and `CategoryProductsManager` import `products-actions.ts`, but they get server-reference stubs.
  - `.next/static` has 0 hits for `readSettingsForEditor`, `checkCategoryAttachable` or `site_settings`, and none for the Supabase client, REST paths or any private server message.
  - The `next/headers` chain is still `settings-read.ts`'s only guard against a client import (T-026 item 1), and it holds.
- **What an attacker can find in the bundle:**
  - 24 action ids appear in `.next/static`: every write a client component imports, the three public forms and `loginAction`.
  - The other 10 appear nowhere, including every read (`getAllCategoryProducts`, `getCategoryProducts`, `getSettings`, …).
  - Wave 1 changes no client component's action imports, so this set is the same as `main`'s.

**4. The `updateSettings` allowlist (`settings-actions.ts:57`, `:72-115`): ✅ every point in the dispatch holds.**
- **Exactly six hand-written keys.** It's a private `new Set([...])` of the six literals, and the compiled chunk carries the same literal.
  - It isn't derived from `SITE_SETTINGS`. Today it equals `SITE_SETTINGS`' 7 keys minus `business`, and a new default key can't widen it.
- **The order:**
  1. `getUser()` is the first await (`:79-82`).
  2. `business` gets BUSINESS_MOVED, word for word (`:88`).
  3. The allowlist (`:91`).
  4. The unchanged upsert.

  No table is read before the allowlist.
- **Exact match:** `typeof key === "string"` and `Set.prototype.has`. There's no trimming, case folding or coercion, and no prototype lookup.
- **Tested on the real code:**
  - **Anonymous:** 69 keys (the six, `business` and every refused key below) all return SESSION_EXPIRED, with 0 table operations and 0 revalidations.
  - **Signed in, refused with UNKNOWN_SETTINGS_KEY and 0 table operations:** 62 keys:
    - case and padding variants (`Business`, `business `, `homepage\n`, NUL, ZWSP, NBSP);
    - lookalikes (Cyrillic `е`, full-width, combining marks);
    - prototype names (`__proto__`, `constructor`, `toString`, `hasOwnProperty`, `__defineGetter__`);
    - paths and lists (`who_we_are/../general`, `homepage,general`);
    - non-strings: `null`, numbers, `NaN`, booleans, `[]`, `["homepage"]`, `new String("homepage")`, objects with `toString` or `valueOf`, a `Symbol`, a BigInt, a Map, a Set, a Date and a function.
  - **Allowed:** each of the six writes exactly one `site_settings` upsert of that key, and nothing else.
  - **Mutants caught:** trimming with coercion, and a removed check.
- **The message** is a fixed string that names no key and no table.
- **The call sites:** 6 calls in 5 unchanged client files, each with an allowed key. Sync doesn't go through `updateSettings`, and its key filter is byte-identical.

**5. `checkCategoryAttachable` fails closed (`products-actions.ts:112-131`): ✅**
- **It's reached only after the session check.** All three callers (create, update and reorder) call `requireUser` first.
  - Tested: anonymous calls return SESSION_EXPIRED with 0 table operations, and the new read never runs (one `createClient`).
- **A failed read refuses the write with fixed copy.** Tested on all three callers. Each returns CATEGORY_CHECK_FAILED, with 0 product writes, 0 revalidations, and none of the injected database text (`message`, `details`, `hint`) in the result. The failures were:
  - a read error, a read that throws, and a "multiple rows" error;
  - the read's own `createClient` throwing (only the second call);
  - a stored `value` that's `null`, an array, a string, a number or a boolean.
- **Next's own signals pass through.** A `DynamicServerError` or a redirect signal thrown by the read is rethrown as-is, and nothing is written.
- **Every other answer is unchanged.** 132 create and reorder answers are identical to `main`'s, writes included.
  - They span 6 stored states and 11 slugs: `__proto__`, `constructor`, `toString` and `hasOwnProperty`, plus planted `<script>…` and upper-case stored slugs.
  - "Not saved yet" and "does not exist" are byte-identical.
  - A planted malformed slug is never attachable.
- **The order of checks is unchanged.** An invisible name, and a patch with nothing editable (the new NOTHING_TO_SAVE wording), are refused before any `site_settings` read.
- **`settings-read.ts`** is byte-identical (`cc5c8a2c…`). It logs a failed read on the server and returns `{ ok: false }` with no text.

**6. Slug rules: ✅ closed.**
- **No client slug is read.** `resolveCategoriesForSave` reads only `title`, `description`, `image` and `id` from each item.
  - Tested with a counting getter on `slug`, own and inherited, on existing, new and unknown-id rows: 0 reads.
  - Slugs come only from the stored id or the title.
- **`isWellFormedSlug`'s pattern is unchanged.**
  - The regex literal is textually identical to `main`'s, and the limit is the private `MAX_SLUG_LENGTH = 255`.
  - It answers as `main` does on 20,000 random strings (lengths 0–599).
  - The length check still runs before the regex, so the regex never sees more than 255 characters.
- **The 255 cut:** `slugify` is `cutSlug(slugBody(title), 255) || "category"`.
  - **Tested on 30,000 titles over a hostile alphabet:** ASCII punctuation, control characters, the Kelvin and Ohm signs, dotted `İ`, `ſ`, `ß`, `ﬁ`, full-width letters, Cyrillic, Greek, Bengali, Arabic, Hebrew, emoji, ZWJ, RTL override, BOM, U+3164, the soft hyphen, combining marks and tag characters.
    - Every output matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is at most 255 characters.
    - Each one is identical to `main`'s whenever `main`'s is at most 255 characters.
    - All 6,499 over-long slugs from `main` come out cut at 255 and trimmed.
  - **Tested on 37 boundary shapes:** 250 to 260 characters, a dash at the cut, and 1,000,000 characters.
  - **The builder's suite adds** 12,138 titles against `main`, plus the simulated first Save of the 8 live titles.
  - **`dedupeSlug` fits `-N` inside 255:** 300 copies of one long title give 300 distinct, well-formed slugs.
- **No new character set reaches URLs or the sitemap.**
  - Across the fuzz, every output character is in `[a-z0-9-]`.
  - `normalizeProducts` now cuts read-time slugs too. So every slug reaching a link, the canonical URL, revalidation or the sitemap is fully well-formed, length included.
  - `categoryPath()` still encodes (`nav.ts` is unchanged).
  - Live: the sitemap lists the same 18 URLs as the 2026-10-06 baseline, including the same 8 category addresses. Only the per-request `<lastmod>` differs.
- **No ReDoS.** After the first replace, the new code only ever sees single dashes. `slugify` on a 1.1M-character adversarial title takes 1.1 ms, and 10,000 `isWellFormedSlug` calls take 10.9 ms.
- **The two new refusals keep the identity rules:**
  - an existing category renamed to Bengali keeps its frozen slug;
  - a forged, unstored id doesn't bypass the non-Latin refusal, because it counts as a new category;
  - an invisible title refuses the whole save, naming its 1-based row, and is never read as a delete;
  - a category titled "Category" still saves;
  - a markup title saves with a `[a-z0-9-]` slug only.

  The refusals echo only the caller's own title or a row number, which `ProductsClient` renders as JSX text in its `role="alert"`.
- **`MAX_SLUG_LENGTH`, `slugBody` and `cutSlug` stay private.** `package.json` and the lockfile are byte-identical, so there's no slug library.

**7. The product mapper (SEC-INFO-36): ✅ closed in code.**
- **`toProductCards`** (`ProductGrid.tsx:12-14`) builds new objects with exactly the own keys `name`, `description` and `image`, in the same count and order.
  - Tested with sentinels in `id`, `category_slug`, `sort_order`, both timestamps and an unknown column: none survives.
- **The types:** `ProductCardData` (`ProductCard.tsx:12`) is `Pick<…> & { id?: never }`, and both components take it. The builder's tsc guard shows that whole rows, or either page without the call, are type errors.
- **Both public pages narrow before any prop** (`page.tsx:151`, `[category]/page.tsx:88`). On `/products`, `sections[].products` holds whole rows only inside the server function, for `.length` and the narrowing call.
- **Neither component has `"use client"`,** and only the two public server pages import them. React keys stay `${name}-${i}`.
- **No ids or row fields in the flight data:**
  - **This office's render:** both real pages, rendered with sentinel rows through Next 16.3.6's own compiled `react-server-dom-turbopack`, in production and in development.
    - Neither payload carries any sentinel: no row id, category slug, order, timestamp, unknown column or category id.
    - `main`'s `/products` in development does carry them, which is the positive control.
    - A mutant that passes whole rows is caught.
  - **Live:** `/products`, all 8 `/products/<slug>` pages and `/what-we-do`, as HTML and as flight data (`text/x-component`), give 20 responses.
    - All are 200, with no `Set-Cookie`.
    - They hold 0 UUID-shaped strings, 0 JWT-shaped strings, and no `category_slug`, `sort_order`, `created_at` or `updated_at`.
    - The live catalog has 0 products, so the offline render is the real proof.
  - **Against the baseline:** once the build id is normalized, the 10 HTML pages are byte-identical to the 2026-10-06 capture from `main` `95f7ea1`.
- **`ProductCard`'s visible-text rule** (`hasVisibleText`, a single-class regex that runs in linear time) only decides whether a heading, a paragraph or the text block renders. It can't add markup.

**8. T-026's 7 client invariants, on `BusinessClient`, `SeedDefaultsPanel` and `category-draft`: ✅ all hold.**
1. **No new Server Action import.**
   - `BusinessClient` imports `saveWhatWeDoText` and `SeedDefaultsPanel` imports `seedSettingsFromDefaults`, as on `main`.
   - `category-draft.ts` imports no action. Its one new import is `hasVisibleText` from `site-content.ts`, which itself has no imports.
2. **No `@/lib/settings-read` or `@/lib/supabase/*` import** in any of the three.
3. **Errors render only as JSX text:**
   - `BusinessClient`'s go through `SettingsHeader`'s `role="alert"` slot (`SettingsForm.tsx` is unchanged);
   - `SeedDefaultsPanel` renders `{result.message}` in a `role="alert"` or `role="status"` paragraph.
4. **No raw-HTML sink in any of the 11 changed files:** no `dangerouslySetInnerHTML`, `innerHTML`, `srcdoc`, `eval` or `javascript:`. The diff adds no `process.env`, no `NEXT_PUBLIC_*` and no debug print.
5. **`CategoryProductsManager` still gets `confirmed`:** `ProductsClient` is byte-identical.
6. **No Save without a successful load.**
   - When the load fails, `BusinessClient` returns `SettingsLoadError` before `SettingsHeader` (`:53-55`). The builder's UI suite covers it (m7).
   - `SeedDefaultsPanel` has no load, as on `main`, and its mount (`(dashboard)/page.tsx`) is unchanged.
7. **No imports between `products/*` and `business/*`:** `textDiffers` lives in `BusinessClient.tsx`.

- **Also checked:**
  - **`BusinessClient`'s new state is client-only.** The saved snapshot is what was sent, and a `<fieldset disabled>` freezes input during a save. It adds no call, timer or effect.
  - **`SeedDefaultsPanel` shows no raw key.** It maps `seeded` keys to labels through `Object.prototype.hasOwnProperty`, with no `?? key` fallback.
  - **`ImageUploadField.tsx`** changes only its `placeholder` attribute.

**9. The admin gate: ✅ 83 anonymous probes against `:3101`, all clean.**
- **Gated: 70 answer 307 to a relative `/admin/login`,** with no `Set-Cookie` and no editor content. The content marker now also covers the What We Do editor, Sync, `Save Changes` and `Submissions`. The 70 are:
  - **T-026's set, on both `/admin/products` and `/admin/business`:** plain, `RSC: 1`, prefetch, `?_rsc`, segment prefetch, `.rsc` and `.segments/_tree.segment.rsc`;
  - **path tricks:** `%70`, `%2F`, `%3B`, `%00`, `%09`, `;x`, `./`, `x/../`, `login/../`, `login/%2e%2e/`, `loginx/../`, `(dashboard)` raw and encoded, `/index`, and `/admin/PRODUCTS` (the gate catches it before routing);
  - **9 bypass headers, on both pages:** `x-middleware-subrequest` in 3 forms, `x-nextjs-data`, `x-matched-path`, `x-invoke-path`, `x-middleware-prefetch`, `Purpose: prefetch` and a spoofed `X-Forwarded-Host`;
  - **all 10 other admin routes,** plain and with `RSC: 1`.
- **Normalized first:** 5 probes (a trailing slash, a leading `//`, `/\`, and `//` inside the path) take a 308 to the clean path, then the 307.
- **No route (404):** 5 probes (`/%61dmin/…`, `/ADMIN/…`, `login%2F..%2F`, and the image-suffix paths the matcher skips).
- **The data routes** for both pages answer 307 with `x-nextjs-redirect: /admin/login` and an empty body.
- **The login page** gives 200. With `RSC: 1`, it gives Next's own on-origin `?_rsc` cache-busting 307.

**10. As another user.**
- **Anonymous vs admin — PASS.**
  - Live: the 83 gate probes.
  - Offline, on the real code, these return SESSION_EXPIRED before any table access:
    - anonymous `updateSettings` calls, on 69 keys;
    - the three product writes that run the category check;
    - Sync.
- **A public visitor vs a product row's internals — PASS.** Item 7: no row field reaches the payload, in production or in development.
- **A second authenticated user — N/A.** There's one role (R1 / SEC-HIGH-2). The allowlist limits which rows any account can write, not who.
- **RLS:** this wave changes no SQL, table, policy or grant. The 2026-10-04 SQL evidence (SEC-INFO-38) still describes `site_settings`.

**11. Dependencies:** the package files are byte-identical, so Wave 1 changes nothing here.
- **The audit:** a read-only `npm audit --omit=dev` (advisory feed as of 2026-10-06) flags 17 packages: 0 critical, 13 high, 3 moderate, 1 low. On 2026-10-03 it was 16, on the same lockfile.
- **What changed:**
  - `source-map-js` 1.2.1 is new: high, `GHSA-68fv-2mgg-jv7q`, via `postcss`, at build time;
  - `postcss-selector-parser` moved from low to moderate: `GHSA-rj75-hqrm-r3gf`, via Tailwind, at build time;
  - `flatted` has a second advisory, lint-only.
- **None is reachable at runtime.** `next`, `react`, `react-dom` and `@supabase/*` have none. It stays SEC-INFO-31's lockfile-only ticket.
- **Secrets:** the diff has 0 secret-pattern hits (the `stack.json` patterns plus a JWT shape, the docs commit included), and so do the client-reachable globs.

**Status changes:**
- **SEC-INFO-36: closed in code, pending merge.** The mapper and `id?: never` (item 7).
- **SEC-INFO-19 / SEC-MED-15: strengthened.** Read-time slugs are now cut at 255 too, so every slug that reaches a URL sink passes `isWellFormedSlug` in full.
- **The T-016 carry-overs to T-033 are done:** SEC-INFO-36, the visible-character check in `resolveCategoriesForSave`, and the NOTHING_TO_SAVE wording. T-032's fail-closed category check is done too.
- **SEC-MED-8: unchanged.** Wave 1 adds no raw-text branch. Sync's business failure still carries `writeBusinessFields`' reason, now inside a sentence, to authenticated callers only (T-018).
- **SEC-INFO-31: updated** (item 11).

**Carry-overs:**
- **T-018 (Wave 2):** SEC-MED-8, plus the premortem's K4: re-baseline T-018's byte-for-byte list on Wave 1's strings.
- **T-014 (Wave 2):** SEC-MED-7/13, and the rest of SEC-MED-11. The mapper copies `image` verbatim, so the URL allow-list is still T-014's.
- **Still separate:**
  - SEC-HIGH-2: Supabase sign-ups were still reported ON on 2026-10-06;
  - SEC-INFO-40 (T-031);
  - SEC-MED-5.
- **The guardrail stands:** `settings-read.ts` now has a third importer. If a refactor ever drops its `next/headers` chain, add `import "server-only"`.

**Overall verdict this pass:** ✅ **Wave 1 (T-033 + T-032) cleared.**
- No 🔴, 🟠 or 🟡 finding, and no new 🟢.
- Closed in code, pending merge: SEC-INFO-36.
- Both changes narrow a surface: which settings rows a session can write, and product writes when the category read fails.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 1 may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **Server files are bound by sha256 at `1a57cfa`:** the five re-binds in item 1, except that `site-content.ts` is now `eeab383b515b10fa…` (see the re-bind note at the end of this entry). The other four are unchanged since `032c8fa`.
  - The T-026, T-016 and T-025 bindings in item 2 stand.
  - If a bound file changes before merge, the clearance lapses for that file until `/cso` re-reviews it.
- **Client files are bound by invariants, not hashes.** `BusinessClient`, `SeedDefaultsPanel` and `category-draft` must keep T-026's 7 client invariants.
- **The catalog components** (`ProductGrid.tsx` `407c3a38…` and `ProductCard.tsx` `7c2f81e9…` at review) may change for design if they still:
  1. have no `"use client"`, and are imported only by server components;
  2. type their product prop as `ProductCardData` (`id?: never`);
  3. keep `toProductCards` building new objects of exactly `name`, `description` and `image`;
  4. are fed only through `toProductCards` on both public pages, with keys that hold no row id.
- **Contract triggers:** any of Wave 1's re-review triggers (`docs/ROADMAP.md` T-033) also comes back to `/cso`.

**Pre-deploy position:**
- A `main` holding Wave 1 at these hashes adds no sensitive surface beyond this pass.
- It isn't held for SEC-HIGH-2, which predates it; that row's own standing is unchanged.
- `/ship` follows the premortem's additions:
  - check the sitemap against the baseline before the push;
  - check both domains after it;
  - check again after the first Save, and record it in LOG.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, plus its §3, §5 and §7 rows). Left uncommitted, for the orchestrator.
- Made only GET and HEAD requests, with no cookie, to `:3101`.
- Ran offline tests in the session scratchpad, plus one read-only `npm audit`.
- No sign-in, no Server Action call, no write to the live database, no build, no server started or stopped.

**Re-bind, 2026-10-06: fix commit `1a57cfa`.** This is Wave 1's fix round, after this entry cleared `032c8fa`. The same method was re-run on the new tree.
- **The commit:** 3 files, +16/−6, authored `happierbangladesh` with one `Co-Authored-By: Claude Opus 5.5` line.
  - **`site-content.ts`:** a private `defaultCategoryImage(title)` (`:327`) puts an own-key check (`Object.prototype.hasOwnProperty.call`) on the three default-image lookups (`:484`, `:496`, `:620`). The non-Latin refusal now says "a digit from 0 to 9".
  - **`category-draft.ts`:** the header comment only. Its 217 code tokens are identical.
  - **`ImageUploadField.tsx`:** the `placeholder` string only ("Or paste an image path"). Its imports are still `main`'s.
- **Re-bound:** `site-content.ts` `0f346ee1a57fea1a…` → `eeab383b515b10fa…`, matching the builder's report.
- **Unchanged since `032c8fa`:**
  - the other four re-binds: `settings-actions.ts` `4de7d6a4…`, `products-actions.ts` `bf86b1df…`, `products/page.tsx` `238f8749…` and `[category]/page.tsx` `bc243115…`;
  - every binding in item 2;
  - both catalog components (`407c3a38…`, `7c2f81e9…`), `BusinessClient` and `SeedDefaultsPanel`.
- **The guard: ✅ it closes the prototype-key case and changes no real title's image.**
  - **Closed:** all 12 `Object.prototype` names, plain and padded, get the fallback image (a string) on all five read and save paths. `main` gave each one a function or `Object.prototype`, which is the positive control.
  - **No real title changes.** Against `032c8fa`, the 25,145 title-and-path results for every other title are identical, and the refusal differs only in its new wording. Every mapped title keeps its own photograph, and `PRODUCT_IMAGES` is unchanged.
  - **A stored image still wins:** the lookup only fills a blank.
  - **In the build:** the compiled server chunks carry the guard, and no bare `PRODUCT_IMAGES[title]` lookup is left in `src` or the build.
- 🟢 **SEC-INFO-41 (new; Low, availability only; pre-existing, closed in code by `1a57cfa`).** Before the guard, a category with no image of its own took a function or `Object.prototype` as its default image when titled `constructor`, `toString`, `__proto__` or another `Object.prototype` name.
  - **React can't serialize either value.** Rendered offline through Next's compiled serializer, the real `/products` page and the real `/admin/products` page both fail on such a category.
    - So the editor that could fix it goes down with the public page, and only the owner's SQL edit recovers it.
    - `saveCategories`' own result isn't serializable either.
  - **Who could trigger it:** any signed-in account, through the ordinary editor, by mistake or on purpose (R1 / SEC-HIGH-2).
  - **Production is exposed.** The bare lookups date from `ecf6cf6` (2026-08-24) and are live in production (`e8eace1`), whose read layer returns `Object`, `toString` or `Object.prototype` for these titles. It stays exposed until a user-typed deploy of a `main` containing `1a57cfa`.
- **Client invariants: ✅** `category-draft.ts` and `ImageUploadField.tsx` keep T-026's 7 client invariants, and T-016's for the upload field: no new import, no new sink, and the upload path and `commitPathOnBlur` are unchanged.
- **Re-run on `1a57cfa`, all passing:**
  - the builder's harness: 782/782 checks and 67/67 mutants, including the two new guard mutants;
  - this office's 48 tests (10 of them new, on the guard), with all 9 in-memory reverts caught;
  - `npx tsc --noEmit --incremental false`, which exits 0.
- **Live, read-only, on build `i-z7vzG9mnRlAskgJA5jF`:** it was written 2 min 18 s before the commit, from a tree that matches `1a57cfa`, with no file newer than it. The server process started after it, and every live body carries its id.
  - **The gate:** the 83 probes are clean, as in item 9.
  - **The public pages:** the 20 bodies and the sitemap answer 200, with 0 UUID-shaped strings and 0 row fields, and the HTML is identical to the baseline.
  - **The client bundle:** 0 hits for every server-only name and secret pattern, with 34 actions (24 discoverable, as in item 3).
- **Verdict: ✅ still cleared, at `1a57cfa`.** The sign-off above is updated to this hash.

### 🔒 CSO Audit — 2026-10-06 — ticket-review:Wave 2a (T-018 + T-014)

**Scope:** Dispatched by `/system-architect` (the 2026-10-06 run, Wave 2a). It covers two tickets under one binding contract: **T-018** (fixed messages for database errors, plus argument checks on the product writes) and **T-014** (the image address rule, the name cap, and end-of-list create). Wave 2b (T-013, reorder) isn't part of this pass.
- **The diff under review:** `git diff main...wave-2a-write-path` at HEAD `1c3027a`, merge base `30edcb6` (= `main`). It touches 5 files under `src/` (+178/−64) across three commits:
  - `e87f2ab`, the contract and premortem (docs only);
  - `022d5fc`, T-018: the helper, its coverage, the argument checks and the sitemap comment;
  - `1c3027a`, T-014: the image rule, the name cap and end-of-list create.
- **The contract:** the Wave 2 binding contract (items 1–12) and the premortem's MUST-ADDs 1–13 at the top of T-018 (`docs/ROADMAP.md`).
- **Commit names:** all three commits are authored `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.

**Method.**
- **Static:** a full read of the diff of all five files, plus greps over the three action files.
- **The builder's suites (`scratchpad/wave-2/`), run once from a private copy (`scratchpad/cso-w2a/`).** Isolation was reviewed first:
  - the loader refuses `@/lib/supabase/*` and `@supabase/*`, and any package not on its allowlist;
  - every `git` call is read-only (`cat-file`, `diff --quiet` / `--name-only`, `ls-files`, `ls-tree`, `grep`);
  - writes land only inside the copy, and Chrome runs over a pipe.
- **Results:** 2,255/2,255 checks and 146/146 mutants, in 338 s, with no Chrome left and the repo clean.
  - **Wave 2a harness** (`--stage final`): 909/909 checks (helper 30, error branches 309, bad arguments 336, scope 100, T-014 134) and 37/37 mutants.
  - **Wave 1's re-run:** 793/793 and 67/67 mutants.
  - **T-016's re-run:** 553/553 (its UI suite is 311, in production and in dev/StrictMode) and 42/42 mutants.
  - **The item 11 message diff is 0 bytes.**
- **This office's own tests** (session scratchpad `cso-w2a/cso/`):
  - **`probe-image.mjs`: 102/102** on the real `isAllowedImageUrl`. It covers the live images, 60 refused shapes, 7 non-strings and the 9 defaults; the edge shapes, checked against how a browser resolves them; a 200,000-shape fuzz; the regex flags; and a 1 MB timing.
  - **`cso-actions.test.mjs`: 111/111** on the real action modules, through the builder's reviewed loader and fake database.
  - **`positive-control.mjs`:** the same assertions fail on `main`'s four files, swapped in memory. It returns the raw text, stores a caller's `-500`, and accepts both `javascript:` and a 256-emoji name.
- **Live, read-only:** GET only, with no cookie, against `:3101` only.
- **Typecheck:** `npx tsc --noEmit --incremental false` exits 0.
- **Not done:** no sign-in, no Server Action call against the live database, no write, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.

**1. Re-binds by sha256: ✅ all five match the builder's report.** Each `main`-side hash is the sign-off this wave voids.

| File | Before (`main` `30edcb6`) | `1c3027a` |
|---|---|---|
| `src/app/actions/settings-actions.ts` | Wave 1 `4de7d6a482792281…` | `b4c3da2ec3c0a894…` |
| `src/app/actions/products-actions.ts` | Wave 1 `bf86b1dfac9d20ee…` | `b0f31500ebc9eda8…` |
| `src/app/actions/jobs-actions.ts` | T-015 `628e5e74c4dca925…` | `bd4387b1df2eb4c7…` |
| `src/lib/site-content.ts` | Wave 1 `eeab383b515b10fa…` | `79c5ebfd73a30176…` |
| `src/lib/action-errors.ts` | — (new file) | `b0be0a48a81ce6a8…` |

**2. The unchanged list: ✅ byte-identical to `main`.**
- **Same hash as their sign-offs:**
  - `settings-read.ts` `cc5c8a2c06d9acb0…`, `business/page.tsx` `87071736c1516fcb…` and the admin `products/page.tsx` `969a00dea762e782…`;
  - both public products pages: `238f87491891667b…` and `bc243115a2583eba…`;
  - `nav.ts` `507e5c62c5f6347f…`, `sitemap.ts` `105e10253fdd12fb…` and `next.config.ts` `a44a56d9f997bb13…`;
  - `package-lock.json` `6a026457868784a9…`;
  - `ProductGrid.tsx` `407c3a38…` and `ProductCard.tsx` `7c2f81e9…`.
- **Also 0-byte:**
  - `src/middleware.ts`, `src/lib/supabase/`, `db/`, `supabase-schema.sql`, `package.json` and `.env.example`;
  - `media-actions.ts`, `form-actions.ts` and `auth-actions.ts`;
  - all of `src/components/`, and the submissions admin page.
- **Only the contract's five files changed under `src/`,** and none of them is a client file.
- **The three `"use server"` files' `export` lines are identical** to `main`'s.

**3. No raw database text in any result: ✅ SEC-MED-8 is closed in code.**
- **No `.message` is read anywhere** in `settings-actions.ts`, `products-actions.ts` or `jobs-actions.ts`.
- **Every remaining non-literal `error:`** comes from a hand-written builder:
  - `built`, `resolution`, `picked` and `attachabilityError`;
  - the delete guard;
  - `defaults.error`, which is `pickWhatWeDoText`'s message.
- **All 22 sites in the premortem's table, plus create's new position read,** return `actionFailure(kind, "<literal label>", error)`, with the contract's kinds.
- **Unchanged:** the compare-and-swap writer's 23505 → SAVE_CONFLICT branch, its 0-row SAVE_CONFLICT, and BUSINESS_UNREADABLE.
- **Tested by this office on 12 branches:**
  - **The branches:** the job insert, update and delete; the report update; the leader insert and delete; the `uploadFile` upload; the `updateSettings` upsert; create's position read and insert; update's stored-row read; and the product delete.
  - **The hostile error:** marker text in `message`, `code`, `details` and `hint`, plus a lying `toString` and `toJSON`.
  - **The result:** each one deep-equals `{ ok: false, error: <that kind's fixed message> }`, with no marker anywhere.
  - **Positive control:** `main`'s `createJob` returns the marker text.
- **The builder's 309 error-branch checks and mutants C1–C5** cover the rest. Wave 1's re-run sync suite (57/57) covers Sync's wrapper around the What We Do step.

**4. The helper and what it logs: ✅**
- **`src/lib/action-errors.ts`** has no imports and no directive. It has exactly two exports, `actionFailure` and `logActionError`, and the four messages are a private constant.
  - Only the three action files import it.
  - `.next/static` has 0 hits for its messages, its labels, `actionFailure`, `logActionError` or `FAILURE_MESSAGES`.
- **What's logged:** `console.error(context, error)`, once per failure. The label is a literal naming the function and the step, and the error is the database or storage error object.
  - **Tested on all 12 branches:** the one line is (a fixed string, the error object itself), and no log line carries the caller's payload, the user's email or the token.
- **Accepted, no finding:** Postgres `details` can echo the failing row (23502's "Failing row contains (…)"). So a server log line may hold values the caller sent.
  - In these seven tables, that's content the site publishes.
  - The PII path is untouched: `form-actions.ts` (submissions), the submissions page and `media-actions.ts` all have 0-byte diffs.
  - This matches MUST-ADD 9's "the error object (code, message, details, hint)".

**5. The image rule (SEC-MED-7, SEC-MED-13, contract item 5): ✅ closed in code for the product and category paths.**
- **The rule:** `isAllowedImageUrl` (`site-content.ts`). The forbidden class is `/[\\\s\p{Cc}]/u`, with no `g` or `y` flag. A root path must have a second character that's neither `/` nor `\`. Otherwise it must be an `https:` URL with a host and an empty username and password.
- **Where it runs:** before any database read.
  - On create.
  - On update, only when an image is sent. A merged `{ description, image }` is refused as a unit.
  - On every category in `resolveCategoriesForSave`, after the blank-image fallback. Its 9 defaults (`PRODUCT_IMAGES` and the fallback) all pass.
- **The 8 live category images pass,** as does the page's `/logo.png`.
  - **Where they were read:** from a fresh GET of `:3101` `/products`. They're all Supabase Storage `https:` URLs, and none contains whitespace.
  - **Unchanged:** the same set as both baselines (`30edcb6` and `95f7ea1`), so staff haven't edited a category image since. The premortem's "re-check the live images before merge" holds as of this pass.
- **Refused, as the dispatch asked** (60 shapes, all refused):
  - `javascript:`, in mixed case, with a leading space, a tab, a newline, NUL, ZWSP or a BOM, and with `//%0a`;
  - `data:`, `blob:`, `file:`, `ftp:`, `vbscript:`, `about:`, `ws:` and `intent:`;
  - `//host`, `///host`, `/\host`, `\\host`, `/<tab>/host`, `/<LF>/host`, `/<CR>/host`, ` //host` and `<ZWSP>//host`;
  - `http:` in all three forms;
  - userinfo in all five forms (`user:pass@`, `user@`, `:pass@`, `www.fal.com.bd@evil`, `%40`);
  - `https://` with no host or with an empty host, and `https:\\`;
  - relative paths, `C:\…` and `C:/…`, `""` and `/`;
  - every whitespace, C0, DEL and C1 character tried.

  Non-strings are refused too, including an object with a `toString`.
- **Origin invariant:** a 200,000-shape fuzz, with 89,725 values accepted, finds:
  - 0 accepted values that a browser on `https://www.fal.com.bd/…` would load over anything but `https:`;
  - 0 accepted root paths that leave the origin;
  - 0 accepted absolute values that load from a third origin.
- **No ReDoS:** 1 MB values take 7 ms.
- **Every sink is an escaped attribute.** On the public pages, product and category images render only as `<img src={…}>`, in `CategoryCardGrid.tsx:99` and `ProductCard.tsx:60`.
  - There's no `next/image`, CSS `url()` or JSON-LD sink.
  - The only `dangerouslySetInnerHTML` in `src` is MarqueeSection's static keyframes.
  - So accepted markup or CSS characters (`"`, `<`, `)`, `;`) are inert.
- **The refusal shows in the ordinary admin.** In T-016's re-run, the `w2row`, `w2merge`, `w2add` and `w2category` scenarios pass in production and in dev/StrictMode. That meets SEC-MED-13's "visible in the ordinary admin" rule.
- **Ruling on the builder's two flagged acceptances: both are acceptable for Wave 2a, and neither needs fixing now.**
  - 🟢 **SEC-INFO-42 (new; informational) — Unicode format characters (`Cf`) are accepted.** That's because "control" is read as `Cc` only: U+200B, U+202E, U+00AD, U+2066–2069 and U+180E all pass. U+FEFF and U+2028/9 are already refused, because JS `\s` covers them.
    - **They can't defeat the scheme rule.** A format character before or inside a scheme makes `new URL` fail, so it's refused. That covers `<ZWSP>javascript:`, `<BOM>javascript:` and `<ZWSP>//host`.
    - **In a host,** IDNA deletes ZWSP and the soft hyphen, so the address loads the host it visibly shows.
    - **In a path,** browsers percent-encode them, and a root path stays on the origin (the fuzz above).
    - **What's left is display only.** A bidi control can make the stored address read differently in the admin path box than the characters it holds. Only a signed-in account can store one, and under R1 that account can store any `https:` address anyway.
    - **Recommendation:** add `\p{Cf}` to the class the next time `site-content.ts` opens. None of the live or default images contains one. It narrows the rule, so it's no contract trigger, but it re-binds the file.
  - 🟢 **SEC-INFO-43 (new; informational) — `https:` without `//` is accepted.**
    - **What happens:** `new URL("https:host/x")` reads it as `https://host/x`. But a browser on this `https` site resolves `https:host/x` and `https:/host/x` as same-origin relative paths (`https://www.fal.com.bd/products/host/x`), per WHATWG's same-scheme rule. On an `http://localhost` page, it loads `https://host/x`, which is exactly what the rule allowed.
    - **Why it's acceptable:** the difference only ever narrows what loads, so it's not a bypass. The cost is a broken image with no refusal message.
    - **Recommendation:** a later pass may require a literal, case-insensitive `https://` prefix, so the stored text matches what loads.
  - 🟢 **SEC-INFO-44 (new; informational; pre-existing) — the other admin URL fields still accept any string.**
    - **The fields:** `createLeader` and `updateLeader` take `photo_url` straight from the form, as do the report writes with `file_url`. The settings editors' image fields go through `updateSettings` unchecked.
    - **Why it's open:** they were never in SEC-MED-7 or 13, which named the product and category paths. The contract leaves them byte-identical on purpose (premortem MUST-ADD 1). Their render sites weren't reviewed this pass.
    - **Recommendation:** T-039 opens these same functions, so it should apply `isAllowedImageUrl` to the image fields and review the `file_url` link sink.

**6. The name cap and `sort_order`: ✅ SEC-INFO-15 and SEC-MED-11 are closed in code.**
- **The name cap:** a private `MAX_PRODUCT_NAME_LENGTH = 255`, counted as `Array.from(name).length` (code points, as Postgres counts `VARCHAR`). It runs right after PRODUCT_NAME_REQUIRED, on create's trimmed name and on update when a name is sent.
  - **Tested here:** 255 emoji, 254 ASCII plus 1 emoji, and 255 ASCII plus padding are stored unchanged, trimmed.
  - **Refused with PRODUCT_NAME_TOO_LONG, with 0 database queries on create or update:** 256 emoji, 256 Bengali characters, and 255 ASCII characters plus a combining mark.
  - **The builder's table** adds 127 emoji plus a letter, 128 emoji and lone surrogates, and mutants N1–N4 (UTF-16 units, off by one, cutting, order) are all killed.
  - **So the raw "value too long" path is gone,** and any database refusal would now read as fixed copy anyway (item 3).
- **`sort_order`:**
  - It's gone from `CategoryProductInput` and from `sanitizeInput`.
  - The insert is `{ category_slug, ...sanitized, sort_order: <server-read max + 1> }`.
  - A failed position read returns `actionFailure("read", …)`, and nothing is inserted.
  - **Tested here:** six caller values (`-500`, `3.5`, `1e15`, `2147483647`, `"0"`, `null`) and a `__proto__`-smuggled `sort_order` and `id` all land at max + 1, and the insert's keys are exactly `category_slug, description, image, name, sort_order`. On `main`, `-500` is stored (positive control).
  - **Update** has never written it since T-016. **Reorder** writes only array positions, and Wave 2b hardens it.

**7. Bad arguments: ✅ for the product writes, and 🟡 SEC-MED-16 for the rest (T-039).**
- **Signed out, every write answers SESSION_EXPIRED first:**
  - **The builder's suite:** all 18 writes, with their valid arguments and every bad shape, run nothing after `getUser()`.
  - **This office's 20 signed-out calls** include `updateSettings("business", null)`, `uploadFile(null, "private-bucket")` and non-array reorder ids. They made 0 table, storage or refresh operations, and none threw.
- **Signed in, the product writes** (contract item 3) return fixed copy without throwing and without a query. That covers a create input that isn't a plain object, a `category_slug` that isn't a string, a non-string id, and non-array `orderedIds`. This closes QA T-016 I1 in code.
- 🟡 **SEC-MED-16 (new; pre-existing, not introduced by this wave) — the non-product writes don't check their arguments' shapes.** It's pinned in the builder's `args-known-gaps-final.json`, re-run here.
  - **`updateSettings(<allowed key>, value)` stores a value that isn't an object** (`null`, a number, `""` or `[]`) and answers `ok: true`. `null` depends on the column's NOT NULL; the others are valid JSONB.
    - `getSettings` falls back to the code defaults, so the public section quietly shows them and that key's saved content is overwritten.
    - The six writable keys' editors load through the same fallback, so an ordinary Save restores an object. `business` can't be reached (BUSINESS_MOVED).
  - **A non-`FormData` argument throws a `TypeError`** in `createReport`, `updateReport`, `createLeader`, `updateLeader`, `createJob`, `updateJob` and `uploadFile`. It throws before any database call, so nothing is written. Next replaces the message with a digest in production, so nothing leaks.
  - **`uploadFile`'s `bucket` is still caller-chosen.** Recommend that T-019 pins it to a private allowlist, alongside Known Trap #9's size and type checks.
  - **Rating:**
    - **Why 🟡:** this office's precedent for crafted-call-only integrity gaps, SEC-MED-11.
    - **Why not 🟠:** only a signed-in session reaches any of it. Under R1, that session can already overwrite the same content through the ordinary editors, so it gains no capability beyond the role.
  - **Deferring it to T-039 is accepted.** It blocks neither Wave 2a nor deploy.
  - **Suggested shape for T-039:** an own `FormData` check at the top of the six form writes and `uploadFile`, and a plain-object check in `updateSettings` before the upsert, each returning fixed copy.

**8. Endpoints and the client bundle: ✅ unchanged.**
- **The server-reference manifest** of the build `:3101` serves lists 34 action ids, and 24 of them are discoverable in `.next/static`, the same as Wave 1. `isPlainObject` in `products-actions.ts` isn't exported.
- **`.next/static` has 0 hits** for the T-014 messages, `isAllowedImageUrl`, `site_settings`, `service_role`, `SERVICE_ROLE` or `SUPABASE_SERVICE`. So the browser has no image check, as contract item 5 intends.

**9. Live, read-only, on build `t3WHlyYfVkIO2zR9uA4fX`: ✅**
- **It's `1c3027a`'s build.**
  - `.next/BUILD_ID` was written at 15:57:08, 15 min 29 s before the `1c3027a` commit.
  - No file in `src/`, and neither `next.config.ts` nor `package.json`, is newer, and the tree equals `1c3027a`.
  - The server process (pid 5624, cwd the repo) started at 16:13:44.
- **The gate:** 86 unique anonymous probes, which are Wave 1's set plus three lines.
  - Every gated path answers 307 to `/admin/login`, directly or after a 308 normalization. Non-routes give 404 (one mistyped non-admin path, `/dmin/products`, returned no status line), and the login page gives 200.
  - 0 `Set-Cookie` and 0 editor content. The results are identical to Wave 1's, apart from the three added lines.
- **The public pages:** `/products`, the 8 `/products/<slug>` pages and `/what-we-do`, as HTML and as flight data, plus the sitemap.
  - All answer 200, with 0 `Set-Cookie`, 0 UUID- or JWT-shaped strings and 0 row fields. The 8 `/what-we-do/<slug>` pages still 308 to `/products/<slug>`.
  - Byte identity with the baseline is QA's check (MUST-ADD 13); this pass compared the image set only.

**10. As another user.**
- **Anonymous vs admin — PASS.**
  - **Live:** the 86 gate probes.
  - **Offline, on the real code:** the 18 writes return SESSION_EXPIRED, with every bad shape and nothing run after `getUser()`. That's the builder's suite plus this office's 20 calls.
- **A public visitor vs row internals — PASS:** 0 row fields in the live bodies.
- **A second authenticated user — N/A.** There's one role (R1 / SEC-HIGH-2), and this wave limits what a session may store, not who may store it.
- **RLS:** no SQL, table, policy or grant changed.

**11. Dependencies and secrets.**
- **No new audit:** `package.json` and the lockfile are byte-identical, so the Wave 1 audit (the same day, the same lockfile) stands. It's SEC-INFO-31's.
- **Secrets:** 0 secret-pattern hits in the diff's added lines (the `stack.json` patterns plus a JWT shape), and 0 server-only names in `.next/static`.

**Status changes** (all closed in code, pending merge):
- SEC-MED-8;
- SEC-MED-7 and SEC-MED-13, for the product and category paths;
- SEC-MED-11;
- SEC-INFO-15;
- QA T-016 I1.

**Still open:** SEC-INFO-16 stays open for Wave 2b (T-013). **New:** 🟡 SEC-MED-16 (T-039), and 🟢 SEC-INFO-42, 43 and 44.

**Carry-overs:**
- **Wave 2b (T-013):** SEC-INFO-16, with the contract's item 9 under its own `/security-review`.
  - Wave 2b edits `products-actions.ts`, so this pass's binding on it lapses then, as expected.
  - The unbounded `orderedIds` loop (one update per entry, authenticated only) ends with item 9's exact-set check.
- **T-039:** SEC-MED-16, plus SEC-INFO-44 if it takes the other URL fields.
- **T-019:** pin `uploadFile`'s bucket.
- **The next pass that opens `site-content.ts`:** SEC-INFO-42 (`\p{Cf}`), and optionally SEC-INFO-43.
- **Still separate:** SEC-HIGH-2 (keep Supabase sign-ups OFF; the owner's open action), and SEC-MED-5.

**Overall verdict this pass:** ✅ **Wave 2a (T-018 + T-014) cleared.**
- No 🔴 or 🟠. The one 🟡 is pre-existing and deferred to T-039 with this office's agreement.
- Both commits narrow a surface: what a database error can tell a caller, and what a product or category may store as its image, name and position.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 2a may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **Server files are bound by sha256 at `732c67e`:** the five re-binds in item 1, except that `site-content.ts` is now `9939d4f36731bd7f…` and `products-actions.ts` is now `8d716929d62ab7ee…` (see the re-bind note at the end of this entry). The other three are unchanged since `1c3027a`.
  - The unchanged-list hashes in item 2 stand.
  - If a bound file changes before merge, the clearance lapses for that file until `/cso` re-reviews it. Wave 2b's edit to `products-actions.ts` goes through its own review.
- **Contract triggers:** any of the Wave 2 contract's re-review triggers (`docs/ROADMAP.md` T-018) also comes back to `/cso`. That includes a wider image rule or a host allow-list, raw database text in any result, the helper becoming `"use server"` or being imported by a client file, and a caller's `sort_order` being read.

**Pre-deploy position:**
- A `main` holding Wave 2a at these hashes adds no sensitive surface beyond this pass.
- It isn't held for SEC-HIGH-2, which predates it; that row's standing is unchanged.
- `/ship` follows the premortem's additions:
  - before the push, MUST-ADD 2–3's evidence exists;
  - after the deploy, `/what-we-do` and `/products` show the same 8 image URLs and each answers 200;
  - a first Save that never lands is a Wave 2 incident (§7 item 13).
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md`: this entry, plus its §3, §5 and §7 rows. Left uncommitted, for the orchestrator.
- Made only GET requests, with no cookie, to `:3101`.
- Ran offline tests in the session scratchpad, and one typecheck with no emit.
- No sign-in, no Server Action call, no write to the live database, no build, no server started or stopped.

**Re-bind, 2026-10-06: fix commit `732c67e`.** This is Wave 2a's fix round, after this entry cleared `1c3027a`.
- **The commit:** 2 files, +19/−12, authored `happierbangladesh` with one `Co-Authored-By: Claude Opus 5.5` line. Nothing else changed since `1c3027a`, and the working tree's `src/` equals `732c67e`.
  - **`site-content.ts`:**
    - `IMAGE_URL_FORBIDDEN_CHARACTER` becomes `/[\\\s\p{C}\p{Default_Ignorable_Code_Point}]/u`, still with only the `u` flag.
    - `isAllowedImageUrl` now refuses a value before `new URL` if it isn't a root path and doesn't start with a literal, case-insensitive `https://` (`/^https:\/\//i`, no `g` or `y`).
    - The category refusal is reworded. It still echoes only the caller's own title.
  - **`products-actions.ts`:** PRODUCT_IMAGE_INVALID is reworded.
  - **Neither message is on contract item 11's list,** and `/design-review` may tune both. Everything else in the diff is comments; the check order is unchanged.
- **Re-bound:**

| File | `1c3027a` | `732c67e` |
|---|---|---|
| `src/lib/site-content.ts` | `79c5ebfd73a30176…` | `9939d4f36731bd7f…` |
| `src/app/actions/products-actions.ts` | `b0f31500ebc9eda8…` | `8d716929d62ab7ee…` |

- **Unchanged since `1c3027a`:** `settings-actions.ts` `b4c3da2ec3c0a894…`, `jobs-actions.ts` `bd4387b1df2eb4c7…`, `action-errors.ts` `b0be0a48a81ce6a8…`, and every binding in item 2.
- **The rule is strictly narrower: ✅** (`cso-w2a/cso/probe-image-fix.mjs`, 158/159).
  - **The one failure is the probe's own count:** it found 10 `<img>` values because it doesn't unwrap `/_next/image`, and all 10 are accepted. The original probe, which does unwrap them, finds the same 9 and accepts them.
  - **The fuzz:** on 300,000 shapes, nothing the new rule accepts was refused by `1c3027a`'s (0 widened, 74,780 narrowed).
  - **The invariants still hold, and one more now does:** the rule parses every accepted absolute value exactly as a browser on this site loads it (0 differences). That's SEC-INFO-43's closure.
  - **Refused now, in every position tried** (host, path, root path, fragment): 23 invisible code points. They are ZWSP, ZWNJ, ZWJ, LRM, RLO, LRI, PDI, the soft hyphen, U+180E, the word joiner, the BOM, CGJ, three Hangul fillers, VS16, a tag, a variation-selector supplement, both lone surrogates, two private-use points and an unassigned one. That's SEC-INFO-42's closure.
  - **Still accepted:** the 8 live category images and the logo; the 9 defaults; a Storage URL with `?t=1&width=800`; `HTTPS://`; and a Bengali, an emoji and an accented path.
  - **The original 102-check probe still passes,** and every shape it flagged is now refused.
- **The builder's suites, re-run from a fresh private copy (`cso-w2a-fix/`):** 2,266/2,266 checks and 150/150 mutants, in 306 s, with no Chrome left and `src/` clean.
  - **Wave 2a harness:** 920/920 and 41/41 mutants.
  - **Wave 1's re-run:** 793/793 and 67/67.
  - **T-016's re-run:** 553/553 and 42/42.
  - **The item 11 message diff** is still 0 bytes.
  - **This office's 111 action checks** pass against the new wording.
- **Status:** 🟢 SEC-INFO-42 and 🟢 SEC-INFO-43 are closed in code by `732c67e`, pending merge.
- **Verdict: ✅ still cleared, at `732c67e`.** The sign-off above is updated to these hashes.


### 🔒 CSO Audit — 2026-10-06 — ticket-review:Wave 2b (T-013)

**Scope:** Dispatched by `/system-architect` (the 2026-10-06 run, Wave 2b). It covers **T-013**, reorder hardening, under the Wave 2 binding contract's item 9 and premortem MUST-ADD 7 (`docs/ROADMAP.md`, top of T-018).
- **The diff under review:** `git diff main...wave-2b-reorder` at HEAD `48fc3d7`, merge base `3eb2759` (= `main`). It's one commit and one file: `src/app/actions/products-actions.ts` (+95/−15).
  - It changes `reorderCategoryProducts` and adds three private helpers (`isStoredIdSet`, `writeSortOrder`, `writeSortOrders`), the `SortOrderMove` type, three message constants and the `logActionError` import.
- **Commit names:** authored and committed by `happierbangladesh`, with exactly one `Co-Authored-By: Claude Opus 5.5` line.

**Method.**
- **Static:** a full read of the diff, of the helpers the function calls (`requireUser`, `checkCategoryAttachable`, `attachabilityError`, `revalidateCategory`) and of `src/lib/action-errors.ts`, plus greps over the file.
- **The builder's suites (`scratchpad/wave-2b/`), run once from a private copy (`scratchpad/cso-w2b/`).** Isolation was reviewed first:
  - the loader refuses `@/lib/supabase/*` and `@supabase/*`;
  - every `git` call is read-only (`cat-file`, `diff`, `grep`, `ls-files`, `ls-tree`);
  - writes land inside the copy or a temporary Chrome profile, and there's no network, no server and no `.env`.
- **Results:** 1,582/1,582 checks and 101/101 mutants, in 210 s, with no Chrome left and the repo clean.
  - **Wave 2b harness** (`--stage final`): 1,021/1,021 (helper 30, error branches 309, bad arguments 336, scope 100, T-014 146, T-013 100) and 59/59 mutants. Those include T-013's T1–T17 and CR12.
  - **T-016's re-run:** 561/561 (server 117, serializer 14, `hasVisibleText` 111, and UI 319 in production and dev/StrictMode, with the new `w2breorder` scenario) and 42/42 mutants.
- **This office's own probe** (`cso-w2b/cso/probe-reorder.mjs`): **228/228.** It runs the real file through the builder's loader and fake database. Its expected strings are copied from item 9 and `action-errors.ts`, not from the builder's fixtures.
  - **Positive control:** the same probe fails 61 of 200 checks against `main`'s file (`3eb2759`). That file answers `{ ok: true }` to another category's id, a subset, duplicates and non-strings, and writes for each one.
- **Not done:** no sign-in, no Server Action call, no request to any server, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.

**1. Re-binds by sha256: ✅ matches the builder's report.**

| File | Before (`main` `3eb2759`, Wave 2a at `732c67e`) | `48fc3d7` |
|---|---|---|
| `src/app/actions/products-actions.ts` | `8d716929d62ab7ee…` | `7e8a1069828c472e…` |

- **`git diff --name-only main HEAD` lists only that file.** The working tree is clean, and `main`'s `src/` equals `732c67e`'s. So every other Wave 2a binding stands, re-hashed in this pass:
  - `settings-actions.ts` `b4c3da2ec3c0a894…`, `jobs-actions.ts` `bd4387b1df2eb4c7…`, `site-content.ts` `9939d4f36731bd7f…` and `action-errors.ts` `b0be0a48a81ce6a8…`;
  - `settings-read.ts` `cc5c8a2c06d9acb0…`, `business/page.tsx` `87071736c1516fcb…`, the admin `products/page.tsx` `969a00dea762e782…`, and the public products pages `238f87491891667b…` and `bc243115a2583eba…`;
  - `nav.ts` `507e5c62c5f6347f…`, `sitemap.ts` `105e10253fdd12fb…`, `next.config.ts` `a44a56d9f997bb13…`, `package.json` `26068c14d0df4a0c…` and `package-lock.json` `6a026457868784a9…`;
  - `ProductGrid.tsx` `407c3a38fec9b7b2…` and `ProductCard.tsx` `7c2f81e96140ad02…`;
  - and 0 bytes for `middleware.ts`, `src/lib/supabase/*`, `media-actions.ts`, `form-actions.ts`, `auth-actions.ts`, every client component, `db/`, `supabase-schema.sql` and `.env.example`.
- **No new audit:** the lockfile is Wave 1's and Wave 2a's.
- **Secrets:** 0 hits in the added lines for the `stack.json` patterns plus a JWT shape. `products-actions.ts` reads no `process.env`, and only the three action files import `action-errors.ts`.

**2. Authorization and integrity of the reorder: ✅**
- **Order (item 9.1–9.6), confirmed in code and by the probe:**
  - `getUser()` runs first. Signed out, only `createClient` and `getUser` run, with no query.
  - Then the slug and list shapes, then `checkCategoryAttachable` (the category check), and only then the one products read: `select("id, sort_order").eq("category_slug", slug)`.
  - A read error returns `actionFailure("read", …)`.
- **The exact-set check runs before any write.** Every entry must be a string (checked by index, so a hole counts), with no duplicates, the same count, and each one stored.
  - **Refused with REORDER_STALE, zero writes and no refresh:** another category's id swapped in; this category's ids under another slug; an extra id; a subset; duplicates (count kept); a `toString` object; a `String` object; numbers; a hole; `new Array(4)`; and `__proto__` / `constructor` keys.
- **Every write and every put-back** is `update({ sort_order, updated_at }).eq("id", id).eq("category_slug", slug).select("id")`, through the one `writeSortOrder` helper. In every probe scenario, every update carried both filters and wrote only those two columns.
- **No cross-category write.** A row moved to another category mid-reorder matched 0 rows and kept its values.
  - An in-process Proxy that swaps in another category's id after the check is also stopped by the category filter. It isn't reachable over the wire: a decoded Server Action argument is a plain array.
- **No ghost rows.** There's no insert, upsert, delete or RPC on the path; the ops seen were `site_settings:select`, `products:select` and `products:update`. A product deleted mid-reorder was not recreated.
  - Writes are capped at the category's stored row count. That closes Wave 2a's unbounded-loop carry-over: a 1,000,000-entry list is refused by the length check, with no write.
- **Answers.** Put-backs run newest first, and each one is tried even after one fails.
  - Everything put back: REORDER_STALE if a row vanished, REORDER_FAILED after an error. Any put-back failed: REORDER_PARTIAL.
  - A throw still propagates, and the refresh runs after any write attempt (`finally`).
- **No raw database text in any result.** A hostile error (marker text in `message`, `code`, `details` and `hint`) on the read, a write or a put-back gives only the fixed copy. No `.message` is read in the file.
- **Logs carry no ids or request data.** The four new labels are literals. The second argument is either the database error object (the Wave 2a ruling) or `{ changed: <count> }`. No label carries an id or slug, and no log carries the user, the token or the payload.
- **The authorization boundary is unchanged:** the same `getUser()` gate, the same anon-key session client, and no SQL.
  - RLS on `products` is still anon read-only and `authenticated` ALL. A signed-in account could already write any product row directly with its own token.
  - So the filters above are integrity controls. The boundary is SEC-HIGH-2's, which is open and unchanged.

**3. New exports: ✅ none.** The file's `export` lines are byte-identical to `main`'s, and the three helpers and the type are module-private. There are still 34 public Server Actions: products 6, settings 14, media 5, jobs 4, form 3 and auth 2.

**4. SEC-INFO-16: 🟢 narrowed to the contract's accepted residual, not closed.**
- Put-backs now undo the mid-loop failure it names (REORDER_FAILED or REORDER_STALE).
- A mixed order is left only if a write and its put-back both fail, and then REORDER_PARTIAL says so. Only a database function (an owner HARD STOP) makes the reorder all-or-nothing.
- **New 🟢 SEC-INFO-45:** two more edges of the same design. Both are cosmetic and signed-in only, stay within one category, and self-heal at the next successful reorder.
  - **(a)** A write that commits but whose reply is lost is answered REORDER_FAILED ("nothing changed"), though that one row has moved. Only confirmed rows are put back.
  - **(b)** Two reorders of one category at once can interleave, because nothing compares and swaps on `sort_order`. The order can end mixed while both tabs report it saved. This predates Wave 2b.
  - **Optional, without a database function** (for the orchestrator to weigh; it changes item 9's write shape, so it isn't a condition): also put back the failing row after an error, and add `.eq("sort_order", from)` to writes and `.eq("sort_order", to)` to put-backs.

**Notes (no finding):**
- The moves loop reads `orderedIds[i]` again after the check (the Proxy case above). A snapshot copy would be tidier; there's no exposure either way.
- The products read has no limit. If the API's row cap (Supabase's default is 1,000) ever cut it short, every reorder of that category would fail closed with REORDER_STALE.

**Authz-as-other-user:**
- **Signed out:** SESSION_EXPIRED, with no query. Pass (this probe, and the builder's 9.1 three times).
- **Signed in, aiming at another category's rows** (swapped ids, a foreign slug, a mid-reorder move, a Proxy swap): refused, or 0 rows matched, and the other category byte-identical. Pass.
- **Live:** not attempted. Owner law bars sign-in and Server Action calls against the live database, and this diff changes nothing at the data layer.

**Status changes** (in code, pending merge): SEC-INFO-16 narrowed; Wave 2a's unbounded-loop carry-over closed. **New:** 🟢 SEC-INFO-45.

**Overall verdict this pass:** ✅ **Wave 2b (T-013) cleared.**
- No 🔴, 🟠 or 🟡.
- The commit narrows a surface: a stale or crafted list can no longer write a subset, write without bound, or report success after a partial write.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 2b may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **Bound by sha256 at `48fc3d7`:** `products-actions.ts` `7e8a1069828c472ede33b5660f84c1eed8ac620f110be7013b3a79f6427e352c`. Every other binding in item 1 stands.
  - If a bound file changes before merge, the clearance lapses for that file until `/cso` re-reviews it.
- **Contract triggers:** any of the Wave 2 contract's reorder triggers comes back to `/cso`: an upsert or insert, a write without both filters, or dropping the exact-set check. SEC-INFO-45's optional change, if taken, also comes back, because it changes item 9's write shape.

**Pre-deploy position:**
- A `main` holding Wave 2b at this hash adds no sensitive surface beyond this pass.
- SEC-HIGH-2's standing is unchanged. Its §5 row is open and blocks the next deploy pending the owner's confirmation, and the project checkpoint (2026-10-05) still records sign-ups as ON.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md`: this entry, plus its §3, §5 and §7 rows. Left uncommitted, for the orchestrator.
- Ran offline tests in the session scratchpad only.
- No sign-in, no Server Action call, no request to any server, no write to the live database, no build, no server started or stopped.

### 🔒 CSO Audit — 2026-10-06 — ticket-review:Wave 3a (T-019 + T-007)

**Scope:** Dispatched by `/system-architect` (the 2026-10-06 run, Wave 3a). It covers **T-019** (Media Center add and delete: results, the session check, no broken item after a failed upload, and a Storage clean-up on delete) and **T-007** (the server re-checks pixel dimensions), under the Wave 3 binding contract's items 1–6, the architect's C1–C10 amendments and premortem MUST-ADDs 1–3 (`docs/ROADMAP.md`, top of T-019).
- **The diff under review:** `git diff main...wave-3a-media` at HEAD `a42ddcb`, merge base `7edafb0` (= `main`). The code is in `fb34d7d` (T-019: `media-actions.ts`, the new `MediaPublishForm.tsx` and `MediaDeleteButton.tsx`, `media/page.tsx` and `SubmitButton.tsx`) and `a42ddcb` (T-007: `upload-limits.ts` and the check in `uploadOptimizedImage`); `b7a4e8f` is docs only.
- **Commit names:** all three commits authored and committed by `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.

**Method.**
- **Static:** a full read of `media-actions.ts`, the two new components, the page and `SubmitButton` diffs, the reader diff, `action-errors.ts` and `isAllowedImageUrl`.
- **The builder's suites (`scratchpad/wave-3a/`), run once from a private copy (`scratchpad/cso-w3a/suite/`).** Isolation was reviewed first:
  - the global `fetch` is a trap; `@/lib/supabase/server` is stubbed to the real supabase-js 2.112.2 with an injected `fetch`, a dummy origin and a dummy key, and the loader refuses any other `@/lib/supabase/*` or `@supabase/*`;
  - the only child processes are `node`, `sips -g` (read only), headless Chrome over a pipe on `file://`, and read-only `git cat-file`;
  - writes land in the copy's `out/` and a temporary Chrome profile; there's no `.env`, no port and no server.
- **Results:** server 202/202, UI 72/72 (production, and development/StrictMode), T-007 reader and server check 153/153, and 44/44 mutants killed (MA1–7, MD1–12, U1–11, R1–14). There were 0 global-`fetch` attempts, no Chrome was left running, and the repo stayed clean.
  - The first server run scored 135/136: my copy sat one directory deeper, so the baseline path didn't resolve. With a symlink to the same read-only baseline, a re-run of that suite alone passed 202/202, the 22 real URLs included. Its baseline comparison of the public forms' prerendered buttons is guarded by an existence check and may have been skipped in this copy; the builder's own run and `/qa` cover it, and the `SubmitButton` change was read in full (no markup change without the new prop).
- **This office's own probe** (`cso-w3a/cso/probe-w3a.mjs`): **180/180** on HEAD, with expectations written from the contract, not from the builder's fixtures. It runs the real files through the builder's loader and the real supabase-js.
  - **Positive controls:** the same delete checks fail against `main`'s file (121 of 121) and against each of 7 single weakenings: dropping the `site_settings` match, dropping the exact `getPublicUrl` match, reading the browser `url`, admitting a leading `.`/`-`/`_`, skipping the C3 re-read answer, accepting 0 settings rows, and ignoring a positive count. All are killed.
- **Read-only gate probes on `:3101`,** which serves the production build of `a42ddcb` (BUILD_ID `6281u-sw3YUF1H-cEAt0v`, in `.next/BUILD_ID` and in the served HTML).
- **Not done:** no sign-in, no Server Action call, no live Storage call, no write, no build, no server started or stopped, nothing on `:3001`. `.env*` was never read.

**1. Re-binds by sha256: ✅ these match the builder's report.**

| File | `main` `7edafb0` | `a42ddcb` |
|---|---|---|
| `src/app/actions/media-actions.ts` | `36dcce2aa4831ae7…` | `dba76e48cac79f61…` |
| `src/lib/upload-limits.ts` | `8f03c970e6e76c88…` | `265e9a835b03d62e…` |
| `src/app/admin/(dashboard)/media/MediaPublishForm.tsx` | new | `c3a78ff781108702…` |
| `src/app/admin/(dashboard)/media/MediaDeleteButton.tsx` | new | `85fafb072396ee17…` |
| `media/page.tsx` and `SubmitButton.tsx` (recorded, not bound) | `dff651eee713eb4c…`, `d0589387ce75f404…` | `bc0ec56874397b22…`, `2d4b89ea5cc0e4bf…` |

- **`git diff --name-only main HEAD` lists only the six contract files** plus `docs/ROADMAP.md` and `docs/DECISIONS.md`, and the working tree was clean. So every other binding stands, re-hashed in this pass:
  - `products-actions.ts` `7e8a1069828c472e…`, `settings-actions.ts` `b4c3da2ec3c0a894…`, `jobs-actions.ts` `bd4387b1df2eb4c7…`, `site-content.ts` `9939d4f36731bd7f…` and `action-errors.ts` `b0be0a48a81ce6a8…`;
  - `settings-read.ts` `cc5c8a2c06d9acb0…`, `business/page.tsx` `87071736c1516fcb…`, the admin `products/page.tsx` `969a00dea762e782…`, and the public products pages `238f87491891667b…` and `bc243115a2583eba…`;
  - `nav.ts` `507e5c62c5f6347f…`, `sitemap.ts` `105e10253fdd12fb…`, `next.config.ts` `a44a56d9f997bb13…`, `package.json` `26068c14d0df4a0c…` and `package-lock.json` `6a026457868784a9…`;
  - `ProductGrid.tsx` `407c3a38fec9b7b2…` and `ProductCard.tsx` `7c2f81e96140ad02…`;
  - and 0 bytes for `middleware.ts`, `src/lib/supabase/*`, `form-actions.ts`, `auth-actions.ts`, `src/components/admin/*` (`ImageUploadField`, `SettingsForm`, `ImportBuiltInGallery`), the public pages, `db/`, `supabase-schema.sql` and `.env.example`.
- **No new audit:** the lockfile is unchanged.
- **Secrets:** 0 hits in the added `src` lines for the 10 `stack.json` patterns plus a JWT shape, and no `process.env` was added.
  - No Supabase storage URL is hard-coded anywhere in `src/`, so every saved reference to a bucket file is in the database, where the clean-up looks.

**2. Authorization: ✅**
- **`getUser()` is the first await after `createClient()` in both actions** (the `requireUser()` shape), and the argument check follows it. Signed out, the answer is SESSION_EXPIRED, `getUser` is the only call, and 0 requests are made (the builder 3 times, this probe twice).
- **The browser's `url` is never read on delete.** `deleteMediaAction` reads only `id`; the file comes from the row that `delete().select("url")` returns. `MediaDeleteButton` sends only `id`, and the page no longer renders the old hidden `url` input. A planted `url` naming a real, unreferenced key made 0 Storage calls.
- **Exports:** the module's runtime exports are `main`'s five functions, and the only new export is the type `MediaActionResult`. There are still 34 public Server Actions (media 5).
- **The boundary is unchanged:** the same anon-key session client, no service role and no SQL. A signed-in account could already delete rows and objects directly with its own token. So the checks below are integrity controls for the staff path; the boundary is SEC-HIGH-2's.

**3. The irreversible Storage delete: ✅ it fails safe in every case tried.**
- **Order, on the wire for each of the 22 real URLs:** `getUser` → `delete().eq("id").select("url")` → both refreshes → 4 counts and 1 settings read, together → `remove([name])` once.
- **Ours only:** `name` is the last `/`-segment and must match `^[A-Za-z0-9][A-Za-z0-9._-]*$`, and `getPublicUrl(name).data.publicUrl` must equal the stored URL exactly.
  - With every reference removed, so that this check is the last line, 28 hostile stored URLs made 0 Storage calls. They were:
    - a foreign host carrying a real key (as a path and at the root), and a look-alike host suffix;
    - `?width=800`, `#x`, `/render/image/`, a subfolder and a double slash;
    - `.`, `..`, `%2E%2E`, `..%2F<key>`, and a leading `.`, `-` or `_`;
    - `/images/client/…`, a bare key, and a trailing `/`, space or newline;
    - `http://`, upper case, an explicit `:443`, another bucket, `/object/authenticated/` and `/object/sign/…?token=`;
    - `""` and `null`.
- **The live category images are safe.**
  - The 8 category URLs and 14 life-page URLs scraped from the `7edafb0` baseline all count as ours: each is removed exactly once when nothing references it (the positive control).
  - Each was kept when a crafted gallery row carried the exact same URL and the only reference was in `site_settings` (`business.categories[].image` or `homepage.lifeFacilities[].image`).
  - A file was also kept for a reference in `products.image`, `leaders.photo_url`, `reports.file_url` or a second `media_assets` row, in a `/render/image/` form, as a bare-string settings value, and nested deep in one.
- **`site_settings` is read in full** (`select("value")`, no filter) and searched with `JSON.stringify(value).includes(name)` in code. `JSON.stringify` never escapes the characters a name may contain, so a saved reference can't hide. There's no `ilike` on jsonb and no `value->>…`.
- **Any doubt keeps the file:**
  - an error or a `null` count on any of the four;
  - a settings error, 0 settings rows, or a row with no value;
  - a network failure on the counts or on the settings read.
  - In every case: 0 Storage calls, the answer still ok, and no throw.
- **C3, with 0 Storage calls in each case:**
  - an RLS-refused delete (0 rows, the row still there) answers MEDIA_DELETE_REFUSED with no refresh, logged with `{ id }` only;
  - a re-read error, and a delete error, answer the fixed delete text;
  - a row that's already gone answers MEDIA_NOT_FOUND.
- **A `remove` that returns `[]` or an error** is logged, and the answer stays ok because the item is gone (item 3).

**4. Add: ✅**
- **A pasted URL must pass `isAllowedImageUrl` before any call.** `javascript:`, `//host`, `/\host`, `http://`, `https:host`, `https:/host` and `data:` were refused with MEDIA_URL_INVALID, with 0 requests (but see SEC-INFO-46).
- **The key is `<13 digits>_<[a-z0-9]*>` plus a lowercased `\.[A-Za-z0-9]{1,5}$` extension,** and nothing else from the file name.
  - `../../etc/passwd.JPG` and `a.php%00.jpg` give `.jpg`, and `a b/c\d.WebP` gives `.webp`.
  - `.htaccess`, `x.toolongext`, `noext` and a trailing newline give no extension.
  - Every upload sends `x-upsert: false`, and the inserted `url` is the uploaded key's own public URL, never the URL box.
- **Failures:** a failed upload inserts nothing (the fixed upload text). A failed insert removes exactly its own key, once (the fixed save text), and a failed clean-up after that is logged.
- **Known Trap #9 is carried, as the contract states.** There's no size, type or dimension check on this path, the browser's content type is stored, and any 1–5 character extension (`.svg`, `.exe`) is kept. It's signed-in only, it's served from the Supabase storage origin rather than the site's, and it's already in the contract's backlog.

**5. No raw database or storage text, and clean logs: ✅**
- **Every result** is one of the module's private constants or `actionFailure`'s fixed copy. MARKER text planted in every error (the Postgres message, details and hint, the Storage error and message, and the network failure) never reached a result.
- **Logs** carry a literal context label plus the error object, or `{ id }` for C3. The user id, the anon key, `Bearer`, the title and a planted URL never appeared in any captured log, on add or on delete.

**6. T-007: ✅ it fails closed, it's pure, and its message is byte-identical to the browser's.**
- **`readImageDimensions` checks bounds before every read** and always moves forward (at least 2 bytes per segment), so it can't loop.
  - **JPEG:** the first SOFn wins (libjpeg rejects a second). An APP1/EXIF thumbnail is skipped by its length. SOS, EOI or SOI before a frame header, a bad length or a zero side returns null.
  - **WebP:** there's a 30-byte floor, and the VP8, VP8L and VP8X offsets match the format.
- **Fuzz:** 180,000 crafted buffers (JPEG and RIFF prefixes, random tags and lengths) gave 0 throws and 0 out-of-range answers. Five 400 KB worst-case walks (all `FF`, `FF 01`, `FF 00`, zero-length APP0s and RST runs) stay linear.
- **`uploadOptimizedImage`,** with 0 Storage calls on every refusal:
  - an unreadable file returns IMAGE_DIMENSIONS_UNREADABLE;
  - 2401×10, 10×2401, 65535×65535 and a 2²⁴ VP8X canvas are refused;
  - 2400×2400 is accepted.
  - The dimension check runs after the 400 KB and format checks and before the write.
- **`describeDimensionLimit(w, h)` is byte-identical** to `ImageUploadField.tsx`'s literal (4 pairs, compared byte for byte).

**7. Gate probes on `:3101`: ✅**
- **An anonymous `GET /admin/media` answers 307 to `/admin/login`, with no Set-Cookie.** So do the variants: `RSC: 1`, `?_rsc=`, a trailing slash (308 to `/admin/media` first) and four `x-middleware-subrequest` values.
- **`/admin/login`** answers 200 with no Set-Cookie. **`/life-at-fashion-asia`** answers 200 with the same 14 storage URLs as the baseline.

**Findings:**
- 🟢 **SEC-INFO-46 (new) — `isAllowedImageUrl` (Wave 2a, unchanged) admits `"`, `'`, `<`, `>`, `(` and `)` inside an `https://` address.** For example, `https://evil.example/x".jpg` publishes.
  - **No sink today:** every render is a React-escaped attribute, the only `dangerouslySetInnerHTML` in `src/` is `MarqueeSection`'s static `<style>`, and nothing puts an image address into a CSS `url()`.
  - The Media Center now inherits the rule (on `main` it took any string), so this is a narrowing.
  - **Hardening:** if a CSS or raw-HTML sink for image addresses is ever added, forbid those characters first.
- 🟢 **SEC-INFO-47 (new) — the clean-up sees saved references only.** A gallery file can still lose its file if its address sits in an unsaved draft (a category or facility path box in another tab), or is saved in the milliseconds between the checks and `remove`.
  - It takes two staff acting at once, it's signed-in only, and it's recoverable by re-uploading. The harm is a broken image, not a disclosure.
  - Accepted as a residual. An owner checklist line can say: don't reuse a gallery photo's address elsewhere while deleting it.
- **Note (no finding):** `action-errors.ts`'s header still says three files import it; there are now four. C10 keeps that file byte-identical, and STACK §4 and INVENTORY record the fourth at close. Its rule, that no client component imports it, still holds.
- **Not done by this office:** premortem MUST-ADDs 8–10 (the client's 17 live image files through the reader) need those files' bytes, which means a live Storage read. They're `/qa`'s.

**On O1 (the live DELETE policies on `media_assets` and on Storage, untested by agents):**
- **Not a merge or deploy condition from this office.** Agents are barred from exercising an irreversible live delete, and no read-only probe can reveal a policy.
- **Offline, every live state was driven through the real client, and each fails safe:**
  - **No table policy:** 0 rows, then the C3 re-read, then MEDIA_DELETE_REFUSED. The item stays listed, with 0 Storage calls. Today's `main` fails silently in that state, so this is strictly more honest.
  - **No Storage policy:** Storage answers `[]`, which is logged, and the file is kept as an orphan. Nothing in use can be removed.
  - The guarantee against removing the wrong file doesn't depend on any policy.
- **A policy broader than intended** is SEC-HIGH-2's scope (any signed-in account is an admin), and that's unchanged.
- **Recommended:** the owner runs O1 after the deploy, on a ZZ-TEST photo published for it (never a real gallery item), and confirms the item leaves the list and its file leaves the bucket.
  - If MEDIA_DELETE_REFUSED shows instead, the fix is an owner SQL step (a DELETE policy for `authenticated` on `media_assets`), which is a HARD STOP. Record the outcome here.

**Authz-as-other-user:**
- **Signed out** (the only other user this model has; RISKS R1): both actions answer SESSION_EXPIRED, with 0 requests. Pass.
- **Signed in, aiming at files the item doesn't own** (a planted browser URL, crafted row URLs, another surface's file under a shared key): 0 Storage calls. Pass.
- **Live:** not attempted. Owner law bars sign-in, Server Action calls and writes. The data-layer policy is O1.

**Status changes** (in code, pending merge): SEC-MED-1 closed (T-007), SEC-MED-9 closed (T-019), and SEC-MED-10 at 12 of 12 (T-019 closes the last 2). **New:** 🟢 SEC-INFO-46 and SEC-INFO-47.

**Overall verdict this pass:** ✅ **Wave 3a (T-019 + T-007) cleared.**
- No 🔴, 🟠 or 🟡.
- It adds one irreversible surface, the Storage clean-up, and this pass shows it can't remove a file that's foreign, crafted or still in use.
- It closes three open findings.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 3a may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **Bound by sha256 at `a42ddcb`:**
  - `media-actions.ts` `dba76e48cac79f61e0b5d6b2d582552a962c609b75337ac701b2abd2e1b04193`;
  - `upload-limits.ts` `265e9a835b03d62ef6ad4dcd8bd1222b519c89fe99946b7e966e7ed447f7f5d6`;
  - `MediaPublishForm.tsx` `c3a78ff7811087027ad145cba0580efd269c2b2a6b2153dba74633e86c9fd296` (superseded at `4abe008` by `e569e6c0f2bf1ab9…`; see the 2026-10-07 re-bind below);
  - `MediaDeleteButton.tsx` `85fafb072396ee17331ef884375b0ec23e7da83f5eedf4856f8c14b45ef050b7` (superseded at `4abe008` by `e1042edbc5b8ec4d…`; see the 2026-10-07 re-bind below).
- **Every other binding in item 1 stands.** If a bound file changes before merge, the clearance lapses for that file until `/cso` re-reviews it. Wave 3b re-binds `upload-limits.ts` (item 7) under its own review, as the contract says.
- **These come back to `/cso`:**
  - an insert after a failed upload;
  - removing a file before the row delete, by a browser-sent URL, or without item 3's checks;
  - a reference set narrower than the four columns plus `site_settings`, a `site_settings` search other than reading every row and searching `JSON.stringify` in code, or a name rule that admits a leading `.`, `-` or `_`;
  - a zero-row delete answered without the re-read, or raw text in a result;
  - T-007 decoding, byte-scanning or failing open, or a message that differs from the browser's.

**Pre-deploy position:**
- A `main` holding Wave 3a at these hashes adds no authorization surface. Its one irreversible path is proven fail-safe offline.
- SEC-HIGH-2 is unchanged. It still blocks the next deploy until the owner confirms that sign-ups are OFF; the project checkpoint (2026-10-05) still records them as ON.
- **`/ship` additions (from the contract):** an anonymous `/admin/media` answers 307 on both domains, and `/life-at-fashion-asia` answers 200 with the same gallery images. O1 is recommended right after the deploy.
- Deploying still needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md`: this entry, plus its §3, §5 and §7 rows. Left uncommitted, for the orchestrator.
- Ran offline tests in the session scratchpad only, plus read-only GETs on `:3101`.
- No sign-in, no Server Action call, no live Storage call, no write to the live database, no build, no server started or stopped, nothing on `:3001`.


### 🔒 CSO Audit — 2026-10-07 — ticket-review:Wave 3a re-bind (design fix `4abe008`)

**Scope:** the `/design-review` fix commit `4abe008` on `wave-3a-media` ("fix(media): AA status, visible busy delete, focus rings (T-019)"). It's authored and committed by `happierbangladesh`, with exactly one `Co-Authored-By: Claude Opus 5.5` line.

**Result: ✅ class names only.**
- **`git diff --name-only a42ddcb 4abe008`** lists only `MediaPublishForm.tsx` and `MediaDeleteButton.tsx`.
- **With every `className` value blanked, both files are byte-identical to `a42ddcb`'s,** and the number of `className` attributes is unchanged (21 and 3). So no handler, import, prop, text or logic changed.
- **What changed:**
  - "Published." and the file button use `text-accent`.
  - The fields use a `focus-visible` accent ring instead of `focus:border-primary`.
  - The delete wrapper is `opacity-100` while its delete runs, with `motion-safe:transition-opacity`. That's the only new expression, and it reads the existing `isPending`. The button is still `disabled={isPending}`.
  - The delete button gets a `focus-visible` accent ring.
- **`media-actions.ts` and `upload-limits.ts` are unchanged,** so every server-side result in the 2026-10-06 entry stands. The suites weren't re-run: no handler, server or data path changed. The UI harness is `/qa`'s to re-run.

**Re-bound by sha256 at `4abe008`** (replacing the two component bindings above):
- `MediaPublishForm.tsx` `e569e6c0f2bf1ab9b7bf34c4048a5271d15a954d9d1d4650c5d35aab483d03dd`
- `MediaDeleteButton.tsx` `e1042edbc5b8ec4dee0ad8f997cc55659362823eae54ccd46d4b2f23dc5ac1b2`
- **Unchanged:** `media-actions.ts` `dba76e48cac79f61e0b5d6b2d582552a962c609b75337ac701b2abd2e1b04193`, `upload-limits.ts` `265e9a835b03d62ef6ad4dcd8bd1222b519c89fe99946b7e966e7ed447f7f5d6`, and every other binding in the 2026-10-06 entry.

**Verdict:** ✅ **Wave 3a stays cleared at `4abe008`.** There's no new finding. The conditions and the pre-deploy position are unchanged: SEC-HIGH-2 still blocks the deploy, and O1 is recommended right after it.

**Actions taken:** edited only `docs/SECURITY.md` (this entry, plus a pointer on the two binding lines it supersedes), and left it uncommitted. No build, no server, no test run, no request to any server.


### 🔒 CSO Audit — 2026-10-07 — ticket-review:Wave 3b (T-009 + T-010)

**Scope:** Dispatched by `/system-architect` (Wave 3b). It covers `git diff main..367a6ab` on `wave-3b-editors`, merge base `3f3f3c5` (= `main`, which holds Wave 3a).
- **Commits:** `f8e29ed` (T-009) and `367a6ab` (T-010), both authored and committed by `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.
- **Files:** five, all on 3b's list: `upload-limits.ts` (item 7), `ImageUploadField.tsx`, `SettingsForm.tsx` (`ObjectListEditor` only), `ProductsClient.tsx` and `HomepageSettingsClient.tsx`.
- **Method:** static, from the diff and the files at `367a6ab`. No suite was run (a token budget), and there was no build, no server and no request.

**1. `upload-limits.ts` re-bind: ✅**
- **The diff is item 7's five-line guard** in `checkImageSizeAdvisory`: a side that isn't a finite number above 0 returns `{ tooSmall: true, offProportion: true }`.
- **Everything before the advisory section is byte-identical to `main`'s,** including the T-007 block (`readImageDimensions`, `describeDimensionLimit` and their private helpers). The 14 exports are the same, and the file still has no imports.
- **`265e9a835b03d62e…` → `3bff92b6df8f005d6cc8a784bf241b55f533df71240eb55db40baeecaea8989f`.** The advisory is guidance only and never blocks an upload, so this has no security effect: a NaN side now warns instead of passing silently.

**2. Client invariants: ✅ all hold.**
- **Imports and sinks:**
  - The only changed import lines add React hooks (in `ImageUploadField` and `SettingsForm`), plus `describeDimensionLimit` from `@/lib/upload-limits`, a module with no imports.
  - There's no new Server Action, nothing from `@/lib/supabase/*` or `@/lib/settings-read`, and no import between `products/*` and `business/*`.
  - The added lines hold no `dangerouslySetInnerHTML`, `innerHTML`, `insertAdjacentHTML`, `srcdoc`, `eval` or `new Function`.
- **T-016's restated invariant 4 (`ImageUploadField`):**
  - `commitPathOnBlur` still defaults to false, and `onBusyChange` is a new opt-in prop.
  - Each accepted pick (one that passes the type, size and dimension checks) makes exactly one `uploadOptimizedImage` call, with a fresh `FormData` holding one `file` field. A pick refused earlier makes none.
  - `isLatest()` gates every step after an await: the dimension read, the upload, the catch and the finally.
  - Only the latest pick calls `applyUrl`, which is the `onChange` captured at that pick, never a newer one. It still applies after an unmount, as on `main`.
- **T-016's other conditions:**
  - `CategoryProductsManager.tsx` has a 0-byte diff, so product payloads still come only from `changedFields`.
  - The products map is still read only through `Map.get`; no lookup line changed.
  - No timer, effect or render path calls a Server Action. The new effects only update refs, report busy or uploading to a state setter, and restore focus.
  - The one upload call stays in `handleFile`, which runs only from the file input or a drop.
- **T-026's 7 (`SettingsForm`, `ProductsClient`):**
  - 1, 2, 4 and 7 as above.
  - 3: the two new `UPLOAD_IN_PROGRESS` messages are constants, shown as JSX text through the existing error display.
  - 5: `categories={confirmed}` is untouched.
  - 6: the fail-closed load block is untouched. The new Save guard only adds a refusal that sends nothing.
- **T-012's `.ok` rule (`HomepageSettingsClient`):** the save body is only renamed `send`, and its `.ok` branch is outside the diff. The new `save` refuses while an upload runs, and otherwise calls `send`.
- **Saved data:**
  - `ObjectListEditor` keys rows in a per-instance `WeakMap` from item object to key. No item field is read or written for keying.
  - `update` still writes only `{ ...item, [field]: value }`, with `field` taken from the code's field list. So no key ever reaches `site_settings` or a public page.
  - A late upload for a row that has gone is dropped, never written to another row.

**Note (no finding):** a pick that's overtaken still uploads its file, which then sits unused in the public bucket. That's the same kind of orphan an abandoned pick leaves on `main`, and it's signed-in only.

**Bindings:**
- **Re-bound:** `upload-limits.ts` `3bff92b6df8f005d6cc8a784bf241b55f533df71240eb55db40baeecaea8989f`.
- **Bound by the invariants above** (T-016's convention), with hashes recorded only: `ImageUploadField.tsx` `1e71d3d8f00bbfcf…`, `SettingsForm.tsx` `c3f190cbe8e0edaa…`, `ProductsClient.tsx` `514ac971cdf89d59…` and `HomepageSettingsClient.tsx` `01841539c29af401…`.
- **Unchanged:** `git diff --name-only main 367a6ab` lists only the five files. Re-hashed at `367a6ab`, these equal their bindings: `media-actions.ts` `dba76e48…`, `MediaPublishForm.tsx` `e569e6c0…`, `MediaDeleteButton.tsx` `e1042edb…`, `products-actions.ts` `7e8a1069…`, `settings-actions.ts` `b4c3da2e…`, `action-errors.ts` `b0be0a48…` and `site-content.ts` `9939d4f3…`. Every other Wave 2 and 3a binding stands.

**Verdict:** ✅ **Wave 3b (T-009 + T-010) cleared.** No 🔴, 🟠 or 🟡, and no new finding. It changes no server file and no authorization surface.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 3b may proceed to `/qa` → `code-reviewer` → merge. Conditions:
- **`upload-limits.ts`** is bound at `3bff92b6…`. **The four client files** are bound by the invariants in item 2.
- **These come back to `/cso`:** any 3b re-review trigger. That means keys taken from or stored in item fields, the field calling its latest `onChange` or dropping a result on unmount, any change to what a consumer saves, a non-zero diff on `CategoryProductsManager.tsx`, or a change to `ProductsClient`'s draft/confirmed logic or to `commitPathOnBlur`.
- **Pre-deploy position, unchanged:** SEC-HIGH-2 still blocks the deploy until the owner confirms that sign-ups are OFF. O1 is recommended right after the deploy, and deploying needs the owner's typed "deploy".

**Actions taken:** edited only `docs/SECURITY.md` (this entry) and left it uncommitted. No build, no server, no test run and no request to any server.


### 🔒 CSO Audit — 2026-10-07 — ticket-review:Wave 4d (T-030)

**Scope:** Dispatched by the orchestrator (Wave 4d) under the lean protocol (DECISIONS 2026-10-06). It covers `git diff f145abb..a8a3fdd` on `wave-4d-admin-nav`, where `f145abb` is `main` with Wave 4c merged.
- **Commits:** `8b718dd` (the hook) and `a8a3fdd` (the nav), both authored and committed by `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.
- **Files:** exactly 4d's Touches list: the new `src/lib/use-overlay-menu.ts`, the new `"use client"` `src/app/admin/(dashboard)/AdminNav.tsx`, and the rewritten `src/app/admin/(dashboard)/layout.tsx`.
- **Why `/cso` reviews 4d:** the admin shell renders Sign Out (the Wave 4 contract's "Split and reviewers", under T-034).
- **Method:** static, from the diff, the files at `a8a3fdd`, and the builder's build (`BUILD_ID` `QiNB_UVNyAqxfeCyvHZvs`; not rebuilt). That build holds 4d: the client chunk `053hnxw0lo74q.js` carries AdminNav's `admin-menu`, `#admin-main` and `(min-width: 768px)`, and the compiled server layout carries `a8a3fdd`'s exact Sign Out classes.

**1. Client boundary: ✅**
- **`layout.tsx` has no directive, so it's still a server component.**
  - It imports `logoutAction` (its only action, as on `main`), `LogOut` and `./AdminNav`.
  - It builds the Sign Out `<form action={logoutAction}>` itself and hands it to `AdminNav` as the `signOut` ReactNode.
- **`AdminNav.tsx` imports only `react`, `next/link`, `next/navigation`, `lucide-react`, `BrandLogo` and the hook.** The hook imports only `react`. Neither imports a Server Action, `@/lib/supabase/*` or `@/lib/settings-read`.
- **No new module crosses into the client.** `BrandLogo` was already `"use client"`, imports only `next/image`, and already ships with `Header`, `Footer` and the login page.
- **The build agrees:**
  - The AdminNav chunk (35,166 B) has 0 `createServerReference`, `callServer`, `$ACTION`, `fetch(`, cookie or Web Storage access. It holds no "logout" or "Sign Out" text: the form arrives in the RSC payload, not in client code.
  - `logoutAction`'s id (`002412103231…`, from `server-reference-manifest.json`) is in 0 of the 49 static files, so no client module imports it. Its body (`auth.signOut()`, then `redirect("/admin/login")`) exists only in `.next/server/chunks/ssr/_1os_du0._.js`, behind `registerServerReference(…, "002412103231…", null)`.
  - All 49 static files have 0 hits for:
    - the Supabase client: `createBrowserClient`, `createServerClient`, `@supabase`, `supabase.co`/`.in`, `GoTrue`, `/auth/v1`, `/rest/v1`, `/storage/v1` and `x-client-info`;
    - `auth.signOut`, `signInWithPassword`, `readSettingsForEditor` and `site_settings`;
    - `process.env`, and every env var name `src` uses (`CRON_SECRET`, `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_SITE_URL`);
    - JWT shapes, `sb_publishable_`, `sb_secret_`, and every `stack.json` `secretPatterns` entry.
- **The diff's added lines have 0 secret-pattern hits.**

**2. Sign Out: ✅ same mechanism as `main`**
- **One server-built element, placed twice.**
  - The compiled layout is `jsx(AdminNav, { signOut: jsx("form", { action: logoutAction, children: <button type="submit"> }) })`.
  - `AdminNav` places `{signOut}` in the phone panel (`hidden` until opened, and `md:hidden`) and in the sidebar (`hidden md:flex`), so at most one copy shows at any width.
  - Both copies are the same form with the same registered reference, so either posts to `logoutAction` as `main`'s single form did: a POST to the current page carrying Next's action id.
- **No new logout path.** The diff adds no route, endpoint or `GET` handler, and no link or `location` change logs out. `navItems` has no logout entry.
- **CSRF is unchanged.** It's still a POST-only Server Action behind Next's Origin check, and `next.config.ts` (`a44a56d9…`) and `auth-actions.ts` (`b8b822df…`) are both 0-byte.
- **Not a security control, noted for `code-reviewer`:** both copies are real form submits, so T-034's capture-phase `submit` listener on `window` sees either one.

**3. The auth gate: ✅**
- **0-byte against `main`:** `src/middleware.ts`, and `src/lib/supabase/client.ts`, `middleware.ts` and `server.ts` (hashes under Bindings). The matcher still skips only `_next/static`, `_next/image`, `favicon.ico`, `api/keep-alive` and image suffixes, so every `/admin` page still passes through the gate.
- **No page or layout newly re-checks or skips the session.**
  - `layout.tsx` is the only admin file changed. It reads no session (as on `main`) and adds no `dynamic`, `revalidate` or other route export.
  - The middleware stays the only page gate. RLS and the actions' own session checks still gate the data.
- **The nav renders only inside `(dashboard)`.** The prerendered `/admin/login` HTML has 0 hits for `admin-menu`, "Super Admin", "Sign Out" or the logout id.
- **`navItems` is byte-identical to `main`'s:** 32 lines, 12 links, and the same block sha256 (`edb7b9d13cdc11d1…`). No link was added, removed, reordered or relabelled.

**4. No new sink: ✅**
- **The three files have 0 sinks:** no `dangerouslySetInnerHTML`, `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, `new Function`, `srcdoc`, `document.write`, `window.location` or `process.env`.
- **Every `href` is a `navItems` constant.** `usePathname()` is only compared in `isCurrent`. It sets `aria-current="page"` and the current-page classes, and is never written into an attribute or URL.
- **The hook's DOM inputs are constants from `AdminNav`:** the `#admin-main` selector and the `(min-width: 768px)` query.
  - It focuses elements in the panel or the toggle, and sets or clears `inert` only on elements it marked.
  - It adds one `keydown` listener while open.
  - It has no network, storage, timer or navigation.
- **The build's leftovers are the framework's.** Its 2 `dangerouslySetInnerHTML` hits are React DOM runtime chunks, not the AdminNav chunk. The AdminNav chunk's one `location.replace` is `next/link`'s own handler for non-local URLs, and every `href` it receives is a constant `/admin…` path.

**5. T-026's client invariants for `layout.tsx`: ✅ all hold.**
- **1:** no Server Action beyond `logoutAction`, which it already imported. `AdminNav` and the hook import none.
- **2:** nothing from `@/lib/settings-read` or `@/lib/supabase/*`.
- **3:** it renders no error text.
- **4:** no raw-HTML sink.
- **5 to 7:** untouched. The diff doesn't open `CategoryProductsManager`, the editors, or `products/*`/`business/*`.
- **None of the contract's security re-review triggers has fired.**
  - The layout is still a server component, no client file imports an action or Supabase, and the links are unchanged.
  - The hook does item 19's list and nothing more. The scroll lock is `AdminNav`'s own (item 22) and sets only `<html>`'s `overflow`.

**6. As another user: carried over by byte identity.**
- No live test was run: this pass has no sign-in, no server and no request, by the owner's rules.
- The diff changes no gate, action or data path. The last live gate result (T-026's 49 anonymous probes) is bound to `src/middleware.ts` and `src/lib/supabase/*`, which are 0-byte here.
- A second signed-in user is still N/A: there's one role (R1 / SEC-HIGH-2).

**7. New finding**
- 🟢 **SEC-INFO-48 — the admin route map is now in a public static chunk.** Contract item 20 moves `navItems` into a client component. So the 12 admin paths, their labels, and "Super Admin"/"Secure Session" now sit in the AdminNav client chunk (`/_next/static/chunks/053hnxw0lo74q.js` at `a8a3fdd`, `08ttrkoaxemcr.js` at `edff562`; the name changes with each build). `_next/static` is outside the middleware matcher, so anyone who finds the chunk's name can fetch it without a session. No other static chunk carries these paths.
  - **Why it's informational:** these are route names only, with no data, action id or key. Every path stays gated, `robots.ts` already publishes `/admin`, and admin client code (with 24 action ids, per the Wave 1 entry) was already public.
  - **Accepted; no ticket. Guardrail:** nothing secret, user-specific or role-specific goes into `AdminNav` or `navItems`. That means no "unlisted" admin path relied on for obscurity, no signed-in email, and no role flag.

**Bindings (sha256 at `a8a3fdd`):**
- **Newly bound:**
  - `src/app/admin/(dashboard)/layout.tsx` `f59aa5a267c896ce9e74b4457dc42e11cb9ce4da7483e3342be8314df8eb16dc` (`main`: `84da9f73bc5ae833…`; superseded at `edff562` by `817b002d29f68034…`, see the re-bind below). T-026 bound it by invariants only. It now carries the Sign Out wiring, so it's bound by hash too, and it must still keep those invariants.
  - `src/app/admin/(dashboard)/AdminNav.tsx` `a41ecad1cf88032b4599ec9a1b9700ca8954be821476eeabfee1201702d4e620` (superseded at `edff562` by `dd00bffb9aaa484b…`)
  - `src/lib/use-overlay-menu.ts` `eabaca484950644fb9c84204097bdb735d4317e4271a44fc05da735288f1b207` (superseded at `edff562` by `3bbc4bd3bb821ebc…`)
  - **Class-only rule:** a later change to one of these three that alters only class-name strings, shown by blanking them as at `4abe008`, may be re-bound by that check alone. Anything else comes back to `/cso`.
- **Reconciled: `MediaPublishForm.tsx`.**
  - Its Wave 3a re-bind (`e569e6c0…`) lapsed on `main` at 4b's `84e4da3` (T-027). The contract's voided list didn't name it.
  - Checked by the `4abe008` method: byte-identical to `4abe008`'s with every `className` value blanked, with 21 `className` attributes before and after.
  - **Re-bound:** `1402beb299415bbb9368f6f5f175394a5288500fbc441f709c9ed876a2ae55ca`.
- **Noted:**
  - `SubmitButton.tsx` (Wave 3a: recorded, not bound) changed at 4a's `82067bd` (T-020) in its two class strings only. It's now `0e97d9c059750928…`.
  - The public `products/[category]/page.tsx` (Wave 1's `bc243115…`) was voided at 4b, as the contract planned. It's now `b6b09179ca148947…`, 0-byte here; 5a re-binds it.
- **Unchanged.** 105 tracked files were hashed at both `f145abb` and `a8a3fdd`: `src/`, `db/`, `next.config.ts`, `package*.json`, `supabase-schema.sql` and `tailwind.config.ts`. Only the three 4d files differ. Each standing server-file binding re-hashes equal at `a8a3fdd`:
  - **actions:** `settings-actions.ts` `b4c3da2ec3c0a894…`, `jobs-actions.ts` `bd4387b1df2eb4c7…`, `products-actions.ts` `7e8a1069828c472e…` and `media-actions.ts` `dba76e48cac79f61…`;
  - **lib:** `action-errors.ts` `b0be0a48a81ce6a8…`, `site-content.ts` `9939d4f36731bd7f…`, `settings-read.ts` `cc5c8a2c06d9acb0…`, `upload-limits.ts` `3bff92b6df8f005d…` and `nav.ts` `507e5c62c5f6347f…`;
  - **pages:** the admin `products/page.tsx` `969a00dea762e782…` and `business/page.tsx` `87071736c1516fcb…`, and the public `products/page.tsx` `238f87491891667b…`;
  - **components:** `ProductGrid.tsx` `407c3a38fec9b7b2…`, `ProductCard.tsx` `7c2f81e96140ad02…` and `MediaDeleteButton.tsx` `e1042edbc5b8ec4d…`;
  - **config:** `sitemap.ts` `105e10253fdd12fb…`, `next.config.ts` `a44a56d9f997bb13…`, `package.json` `26068c14d0df4a0c…` and `package-lock.json` `6a026457868784a9…`.
- **Recorded for the gate** (0-byte; the first hashes on file):
  - `src/middleware.ts` `6d2c77576d75d3894df3a7b30e9d3bfaa01b3b9bafead451c6100d2c863d61d9`
  - `src/lib/supabase/client.ts` `089fde0659be65810421ede9cec60a72c649d41d27943b351c4ef1444851d730`
  - `src/lib/supabase/middleware.ts` `7693ad81921b0165fbf62cf630eb22dada0c332646eefaf0517b4f86da6aa03e`
  - `src/lib/supabase/server.ts` `e0d8444a65660aefb9dbeac27bfeb49bd001066c026d3b4c247cfe040e144b57`
  - `src/app/actions/auth-actions.ts` `b8b822df5be42905d97e05d7c4fd5a92ae7b3fa3aebd0e26276c35511b774bfe`
  - `src/app/robots.ts` `1c283fdb3e3b24a0…` and `src/app/api/keep-alive/route.ts` `bbba775344720107…`

**Re-bind at `edff562`** (design-review's FIX FIRST: "fix(admin): space the nav groups, 44 px phone targets, close the menu on any route change (T-030)").
- **The commit** is authored and committed by `happierbangladesh`, with exactly one `Co-Authored-By: Claude Opus 5.5` line. It's the only commit after `a8a3fdd`, and it touches only the three bound files; `main..edff562` still lists only those three.
- **`layout.tsx`:** the Sign Out button's classes only.
  - It's byte-identical to `a8a3fdd`'s once every `className` value is blanked, with 4 `className` attributes before and after.
  - `<form action={logoutAction}>`, the `type="submit"` button and the `signOut` prop are unchanged, and it's still a server component.
- **`AdminNav.tsx`:** class tokens, plus a close-on-route-change.
  - **The classes:** `py-3 md:py-2.5` and `motion-safe:transition-colors` in `linkClass`, a `hover:text-foreground`, the group spacing moved from the label to the group's `<div>`, and three `text-white` → `text-foreground`.
  - **The new logic:** `const [menuPath, setMenuPath] = useState(pathname)`, and, when `menuPath !== pathname` during render, `setMenuPath(pathname)` and `setOpen(false)`. It only compares the path and closes the menu. There's no sink, navigation, network or new prop, and the hook's cleanups release `inert` and the listener as before.
- **`use-overlay-menu.ts`:** a JSDoc change only. It's identical to `a8a3fdd`'s once comment lines are dropped.
- **Unchanged in all three:** the imports (3, 6 and 1, byte-identical), the directives, 0 sinks, and `navItems`, which is still byte-identical to `main`'s (`edb7b9d13cdc11d1…`).
- **The rebuilt build agrees** (`BUILD_ID` `Rs8yT2HIl40B3m69x9LwB`, 49 static files):
  - The AdminNav chunk is now `08ttrkoaxemcr.js` (35,266 B), carrying `edff562`'s classes. It has 0 server-action stubs, 0 fetch, cookie or storage access, and no logout text.
  - All 49 static files have 0 hits on item 1's patterns, and `logoutAction`'s id is in none.
  - The compiled server layout is still `signOut: jsx("form", { action: logoutAction, … })`, behind `registerServerReference(…, "002412103231…", null)`.
  - The two `dangerouslySetInnerHTML` hits are the same React DOM runtime chunks.
  - The nav still doesn't render on `/admin/login`.
- **Re-bound at `edff562`** (replacing the three `a8a3fdd` hashes above):
  - `src/app/admin/(dashboard)/layout.tsx` `817b002d29f68034e4f68682e3b9dd251ecfa9006965d7d202ed5ab9a9bb14d2`
  - `src/app/admin/(dashboard)/AdminNav.tsx` `dd00bffb9aaa484be99b70ddceffdabcd9022183ada9b43d248592bd3a197179`
  - `src/lib/use-overlay-menu.ts` `3bbc4bd3bb821ebc06e5e5232f7748886199d8f6456afbb5e063d33a9187c8bc`
- **Every other binding above stands.** `main..edff562` touches no other file.

**Verdict:** ✅ **Wave 4d (T-030) cleared, and it stays cleared at `edff562`.** No 🔴, 🟠 or 🟡, and one new 🟢 (SEC-INFO-48, accepted). The only server file it changes is the admin layout, and only in markup and composition. It changes no authorization surface.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 4d may merge once `code-reviewer` and `design-reviewer` clear and `/qa` has written the owner's manual admin checklist. Conditions:
- **The three 4d files are bound at `edff562`'s hashes (the re-bind above).** A change before merge that goes beyond the class-only rule lapses that file's clearance until `/cso` re-reviews it.
- **These come back to `/cso`:**
  - the layout gaining `"use client"`, a session read or skip, or a route export;
  - Sign Out moving into client code, or gaining a link, a `GET`, a `fetch` or a second action;
  - a nav file importing an action, `@/lib/supabase/*` or `settings-read`;
  - any `navItems` change;
  - anything user- or role-specific rendered by `AdminNav` (SEC-INFO-48's guardrail);
  - the hook doing more than item 19.
- **Pre-deploy position, unchanged:**
  - **SEC-HIGH-2 (🟠) still blocks the deploy.** It closes only when the owner has turned sign-ups OFF, a read-only `GET /auth/v1/settings` reads `disable_signup: true`, and the owner has reviewed Authentication → Users. The latest checkpoint (2026-10-07) still says sign-ups are ON. This pass sent no request to check.
  - **4d doesn't raise it.** SEC-INFO-32's guardrail holds: there's no anon key, JWT shape or Supabase host in any of the 49 static files. So SEC-HIGH-2 stays 🟠, not 🔴.
  - **Production is waiting on it.** Per §5, production (`e8eace1`) still lacks the fixes that are closed in code, including SEC-HIGH-1's `next@16.1.6` and SEC-MED-15, until a deploy. So the owner's sign-up switch now gates all of them.
  - **After the deploy:** O1 is recommended right after it. Deploying needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, including the `edff562` re-bind, and its §5 row, SEC-INFO-48), and left it uncommitted.
- Ran read-only `git`, file reads, and greps over the existing `.next`.
- Did not: build, start a server, sign in, submit Sign Out, call a Server Action, or send any request to the live site or Supabase; nothing on `:3001`.
- Never read `.env*`: env var names came from the `process.env.*` references in `src`.

### 🔒 CSO Audit — 2026-10-08 — ticket-review:Wave 5a (T-008 + T-022 + T-017)

**Scope:** Dispatched by the orchestrator (Wave 5a) under the lean protocol: static, plus the builder's saved evidence. It covers `git diff bb8c29f..2db0af9` on `wave-5a-headers`, where `bb8c29f` is `main` with Wave 4d merged.
- **Commits:** `edd1c6c` (the premortem fold), `b4c01e8` (T-008), `b8558c3` (T-022) and `2db0af9` (T-017). All four are authored and committed by `happierbangladesh`, each with exactly one `Co-Authored-By: Claude Opus 5.5` line.
- **Files:** exactly 5a's Touches list (`next.config.ts`, `src/app/sitemap.ts` and `src/components/global/Preloader.tsx`), plus `docs/ROADMAP.md`, `docs/DECISIONS.md` and `CLIENT_QUESTIONS.md`. Across `src/`, `db/`, `public/`, `next.config.ts`, `package*.json`, `supabase-schema.sql`, `tailwind.config.ts` and `vercel.json`, `git diff --name-status main` lists only those three.
- **Method:**
  - the diff and the files at `2db0af9`;
  - the compiled build on disk (`BUILD_ID` `dlZUFOVTl2TJUgu89DV0F`), built 2026-10-08 00:30 (+0600), after `2db0af9`'s 00:24 commit;
  - the builder's evidence in the session scratchpad (`wave-5a/final/`, `wave-5a/baseline/` and `pm3.mjs`), captured at 00:30:48, after that build.
  - This pass ran no server, build, sign-in or request. `:3101` belongs to `code-reviewer`.

**1. The six values: ✅ byte-exact in source and in the build (PM1, PM2)**
- **Source:** one rule, `source: "/:path*"`, with no `has` or `missing`, and six `{ key, value }` string literals. All six match the contract table byte for byte. The file has no non-ASCII byte, so no curly quote or no-break space can hide inside a keyword.
- **The CSP** is exactly `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`, with every keyword quoted. PM1's grep, plus `nonce`, returns nothing: no fetch directive, no Report-Only and no `preload`.
- **HSTS** is the only conditional, on `process.env.NODE_ENV === "production"`. That's the only `process.env` reference the diff adds. R-3's comment is on the line above it.
- **HSTS scope:** sent from `www`, `includeSubDomains` covers only names under `www.`, and none exist. It can't reach `mail.`, cPanel or a bare domain while the app serves only `www`; PM13's bare-domain STOP guards the rest. R-2's preview case is moot too: `.app` is an HSTS-preloaded TLD, so `*.vercel.app` is HTTPS-only already.
- **`poweredByHeader: false`** is added.
- **The keep flags and `redirects()` are untouched (PM2).** `git diff -U0` removes no line, and lines 1–33 (`agentRules: false`, `logging: { serverFunctions: false }` and all of `redirects()`) are byte-identical to `main`'s (`cmp`).
- **The build agrees.**
  - `.next/routes-manifest.json` has exactly one header rule, `/:path*`, with the six values byte-exact. HSTS is present, as R-2 expects of any `next build`.
  - Its five user redirects are unchanged, and every destination is a same-origin relative path.
  - `required-server-files.json` reads `poweredByHeader: false`, `agentRules: false` and `logging.serverFunctions: false`.

**2. What :3101 sends (the builder's PM3, PM5, PM6 and PM7, re-read): ✅, except the two 308s ruled in item 4**
- **PM3** (`final/pm3-rebuilt.txt` and the raw `headers-rebuilt/*.txt`): 10 of 12 responses carry each of the six exactly once, byte-exact, with no `x-powered-by` and no Report-Only. They are `/`, `/admin/login`, the middleware's `/admin` 307, the `/no-such-page` 404, `/sitemap.xml`, `/robots.txt`, `/logo.png`, `/_next/static/chunks/3s6nzrbk-8mnv.js`, `/videos/hero.mp4` and `/api/keep-alive`. I re-read the raw `/` and `/admin` captures myself.
- **Against the baseline:** `main`'s `/` sends `X-Powered-By: Next.js` and none of the six. None of the 12 rebuilt captures has `x-powered-by`.
- **The two 308s** (`/what-we-do/t-shirts` and `/reports`) carry none of the six. Apart from `Date`, each is identical to its `main` capture (`location` and `Refresh`), so T-025's redirects are unchanged.
- **PM5** (`framing-rebuilt.json`): `/admin/login` was framed from `about:blank` and from `http://localhost:3101/`. Both times it ends on `chrome-error://chromewebdata/` with `unreachableUrl` set, and the console shows the `frame-ancestors 'none'` refusal.
- **PM6 and PM7** (`final/pages.json`): 0 `securitypolicyviolation` events, 0 console errors, and 0 CSP or Permissions-Policy messages on `/`, `/products`, `/contact`, `/career`, `/grievance`, `/admin/login` and `/products/t-shirts`. The DevTools issue counts (14, 0, 4, 4, 2, 2, 0) equal the baseline's page for page, so none is new.

**3. SEC-MED-2: the PM12 agreement for T-008's AC #2. ✅ AGREED: the CSP ships enforcing, and the contract's fallback (dropping the line) is not invoked.**
- **It can't block a resource.** It has no fetch directive, so nothing governs scripts, styles, images, fonts, media or `fetch`. With JavaScript on, every Server Action submit is a `fetch`, which no directive here covers. So Report-Only would teach nothing, and the contract sends it to T-038 anyway.
- **Each directive refuses only something this site doesn't do:**
  - **`frame-ancestors 'none'`** is the same as `X-Frame-Options: DENY`, for browsers that read CSP. Nothing in `src/` or `public/` embeds the site, and the owner default refuses iframes (DECISIONS 2026-10-07, CLIENT_QUESTIONS Q14). PM5 shows it refusing both a cross-origin and a same-origin parent.
  - **`base-uri 'self'`:** there's no `<base>` in `src/` or `public/` (re-grepped this pass), and Next emits none. If HTML is ever injected, it stops a `<base href>` from re-pointing relative script URLs.
  - **`object-src 'none'`:** there's no `<object>` or `<embed>`, and no PDF in `public/` (0 files). Reports are Supabase links opened in a new tab, a top-level navigation that `object-src` doesn't govern.
  - **`form-action 'self'`:** all five Server Action forms post to their own origin, and `src/` has no absolute `action=` and no `.submit(` (re-grepped). Every redirect after a POST stays same-origin, and `auth-actions.ts` (`b8b822df…`) and the middleware are 0-byte. So even a browser that checks `form-action` on each redirect hop stays inside `'self'`. PM6 shows 0 violations on all six pages it loaded.
- **The keywords are quoted** (item 1), so `'self'` and `'none'` can't be read as host names (failure mode 1).
- **The agreement holds while** the CSP has no fetch directive, no page posts a form to or embeds another origin, and no `<base>`, `<object>` or `<embed>` is added. Each of those is already a contract re-review trigger, and it comes back to `/cso` too.
- **The residual is the 5a premortem's owner row O1:** sign in and out on `:3101` with the headers on, saving nothing. Static and headless checks can't do that without a session. It isn't a merge condition here, because every hop on that path is same-origin and unchanged. Run it before the deploy.

**4. Ruling on the two 308s: ✅ ACCEPTED as a Next 16.3.6 limitation under `next start`. No re-review is needed.**
- **The mechanism, verified in the installed 16.3.6:** `next/dist/server/lib/router-utils/resolve-routes.js:524-541` returns `resHeaders: null` for a matched `redirects()` route. `router-server.js:395` applies headers only when `resHeaders !== null`. So the values `headers()` collected for that request are dropped. The middleware's 307 takes a different path and keeps them (item 2).
- **No header's protection is lost.**
  - A 308 with a `Location` never becomes a document, and its body is never used as a resource. Every navigation, `<script>`, `<link>` and `fetch` follows it to the destination. A `redirect: "manual"` fetch gets an opaque response with no readable body.
  - Both destinations, like all five in `redirects()`, are same-origin relative paths whose responses carry all six.
  - Per header:
  - **`X-Frame-Options` and `frame-ancestors`:** a framing check can only refuse. Whatever a browser does on a redirect hop, a frame pointed at `/reports` still ends on `/sustainability`'s 200, which carries both and is refused. The 308 itself renders nothing that could be clickjacked.
  - **`base-uri`, `object-src` and `form-action`:** they apply only to a document, and a redirect response creates none. `form-action`'s check on redirect hops is made by the submitting page's policy, which our 200s carry, not by the 308's. No form posts to these paths.
  - **`X-Content-Type-Options`:** it only governs how a browser reads a body it consumes. No browser consumes a 3xx body that has a `Location`, and the destination's response carries `nosniff`. The body here is only Next's destination string.
  - **`Strict-Transport-Security`:** it's pinned per host, not per URL.
    - Over HTTPS, the 308's destination is on the same host, and its 200 sets the pin in the same navigation.
    - A response without the header doesn't clear a pin; only `max-age=0` does.
    - Plain HTTP is redirected to HTTPS at Vercel's edge, and browsers ignore HSTS over plain HTTP anyway (RFC 6797 §8.1).
    - Only a client that fetches the 308 and never follows it misses the pin. That's a scanner, not a visitor.
  - **`Referrer-Policy`:** it's the one header a redirect response can change in flight (the Fetch standard's HTTP-redirect fetch). Without it, the next hop keeps the referring page's policy. That's ours if the link was on our site, the same `strict-origin-when-cross-origin`. Otherwise it's Chromium's and Firefox's default, which is the same value. Either way the next hop is our own origin, so no third party receives a referrer through these 308s.
  - **`Permissions-Policy`:** it's set on the document made from a response, so it comes from the destination's 200.
- **Why not make the 308s carry them:**
  - It needs `redirects()` or the middleware, which are both re-review triggers. The middleware is the bound auth gate (`6d2c7757…` and `7693ad81…`).
  - T-025's 308s are permanent and cached by browsers, R-4's one-way door.
  - It would close a gap that only a scanner sees.
- **Amendments, for the orchestrator to fold into ROADMAP** (this office writes only `docs/SECURITY.md`):
  - **PM3:** the six-header check applies to every response except a `redirects()` match under `next start`. For each of the two 308s, assert that the status, `location` and `Refresh` equal `main`'s baseline, ignoring `Date`, and that there's no `x-powered-by`. So PM3 passes as 10 of 12, plus 2 ruled N/A (SEC-INFO-49).
  - **The contract's 5a verification line:** for `/what-we-do/t-shirts` (308), "exactly the header set above" reads as "N/A under `next start` (SEC-INFO-49)". It still applies to the middleware's 307.
  - **PM13 (`/ship`):** record what Vercel sends on the two live 308s.
    - The six exactly once: record it.
    - None of them: record it under SEC-INFO-49; the same ruling applies.
    - A partial set, or a doubled line: record it and file a follow-up.
    - None of these is a STOP or a rollback (PM14). PM13's other assertions are unchanged.
- **The ruling holds while** every `redirects()` destination stays a same-origin relative path, and a redirect carries no renderable body. If either changes, it comes back to `/cso`. So does a later Next that applies `headers()` to redirects; 12 of 12 then becomes the bar. Touching `redirects()` is already a re-review trigger.

**5. Sitemap and preloader: ✅ no security effect**
- **`sitemap.ts` (T-022):**
  - The diff removes only the 11 `lastModified: new Date()` lines, and adds one comment line. 0 `lastModified` or `new Date` remain.
  - Every `url`, `changeFrequency` and `priority` is unchanged and in the same order.
  - `normalizeProducts()` (`site-content.ts` `9939d4f3…`) and `categoryPath()` (`nav.ts` `507e5c62…`) still build the category entries, so SEC-INFO-19's slug gate and SEC-MED-15's encoding still apply.
  - **The evidence:** four fetches after 5a (two per build) are byte-identical to each other and to the `lastmod`-stripped `main` baseline (sha256 `30a72399fe4ee271…`). Each has 18 `<url>`, 0 `<lastmod>` and 0 `/admin`. The 18 are the home page, 3 section pages, 8 `/products/<slug>` pages and 6 more public pages, all public.
  - The build still lists `/sitemap.xml` as `ƒ` (dynamic), so the category list isn't frozen (PM8).
- **`Preloader.tsx` (T-017):**
  - The diff deletes `TOTAL_FRAMES`, the 160-image `new Image()` loop and the 2000 ms timer.
  - Every width now runs the former mobile path: one `setTimeout(finishLoading, 1500)` outside any `if`, plus the 8%-per-100 ms interval. The cleanup clears both and resets `body.style.overflow`.
  - Its imports (`react` and `framer-motion`) are unchanged. It has no HTML sink, network, storage, cookie, navigation or `process.env` access.
  - The only thing that leaves is the 160 frame requests per desktop view.

**6. As another user: N/A, by construction.**
- 5a changes no authorization surface: no gate, action, policy, data read or session path.
- The middleware, `src/lib/supabase/*`, every action file and `auth-actions.ts` are 0-byte against `main` (hashes under Bindings). The last live gate result (T-026's 49 anonymous probes) stays bound to those files.
- A second signed-in user is still N/A: there's one role (R1 / SEC-HIGH-2).
- No live test was run, by the owner's rules (no sign-in, no server, no request).

**7. Secrets and the client boundary: ✅**
- **The diff:** its 45 added lines outside `docs/` have 0 hits on the 10 `stack.json` `secretPatterns`. The only `process.env` they add is `NODE_ENV`, in server config.
- **SEC-INFO-32's guardrail holds at this build.** The 49 files in `.next/static` have 0 hits for:
  - a JWT shape (`eyJhbGciOi`), `sb_publishable_` or `sb_secret_`;
  - `supabase.co`, `supabase.in` or `NEXT_PUBLIC_SUPABASE`;
  - `service_role`, `/auth/v1` or `/rest/v1`.
- **SEC-HIGH-1's closure stands.** `next` is `16.3.6` in `node_modules`, and the lockfile is unchanged (`6a026457…`). `npm audit` wasn't re-run this pass (static, no network).

**8. New finding**
- 🟢 **SEC-INFO-49 — under `next start`, `redirects()` 308s carry none of the six headers.** Next 16.3.6 drops `headers()` on a matched redirect (item 4). It affects `/reports`, `/what-we-do/:slug` and the three rename redirects.
  - **Why it's informational:** a browser loses nothing. Each header's effect comes from the same-origin destination or from the per-host HSTS pin, or doesn't apply to a redirect. Only a header scanner pointed at a 308 sees the gap.
  - **Accepted; no ticket.** PM13 records what Vercel sends live. Revisit it under item 4's "holds while" conditions.

**Bindings (sha256 at `2db0af9`):**
- **Re-bound** (voided by the Wave 5 contract or at 4b). All four match the builder's report:
  - `next.config.ts` `d1af850cf9899d4ad78e64844a7e414409581d23ed817ed531273b1b7942521d` (T-025's `a44a56d9f997bb13…`).
  - `src/app/sitemap.ts` `bdfd411287e9f034b4f60a18b711a155564b45d0760f0b1c6936e79a9e02b2fa` (T-025's `105e10253fdd12fb…`).
  - `src/app/(website)/(marketing)/products/[category]/page.tsx` `b6b09179ca14894722359ee38165224e8923af5ed3b9c61ba2e9da75c6c085d3`, 0-byte here.
    - Wave 1 bound it as `bc243115a2583eba…`. Its only change since is 4b's `84e4da3` (T-027).
    - That change is class-only: byte-identical once every `className` value is blanked, with 9 `className` attributes before and after.
  - `src/app/admin/(dashboard)/media/ImportBuiltInGallery.tsx` `acf7a662a24b041ec0e533a932821ceadc2ddd9de3ee51991fb96b0178002466`, 0-byte here.
    - Before 4b it was `b3a7f3ad93ed28a2…`. Its only change since is `84e4da3`.
    - That change is class-only by the same check, with 6 `className` attributes before and after.
- **Recorded, not bound:** `src/components/global/Preloader.tsx` `697c3e0cd80c6698b23dfd80a921680d0f9328af16647b52887e1648e9352f23` (`main`: `2c9881ebdf666f00…`). It isn't sensitive surface, but a network call, storage access or HTML sink added to it comes back to `/cso`.
- **Unchanged.** Each standing binding re-hashes equal at `2db0af9`, and each equals `main`:
  - **actions:** `settings-actions.ts` `b4c3da2ec3c0a894…`, `jobs-actions.ts` `bd4387b1df2eb4c7…`, `products-actions.ts` `7e8a1069828c472e…`, `media-actions.ts` `dba76e48cac79f61…` and `auth-actions.ts` `b8b822df5be42905…`;
  - **lib:** `action-errors.ts` `b0be0a48a81ce6a8…`, `site-content.ts` `9939d4f36731bd7f…`, `settings-read.ts` `cc5c8a2c06d9acb0…`, `upload-limits.ts` `3bff92b6df8f005d…`, `nav.ts` `507e5c62c5f6347f…` and `use-overlay-menu.ts` `3bbc4bd3bb821ebc…`;
  - **pages:** the admin `products/page.tsx` `969a00dea762e782…`, `business/page.tsx` `87071736c1516fcb…` and `(dashboard)/layout.tsx` `817b002d29f68034…`, and the public `products/page.tsx` `238f87491891667b…`;
  - **components:** `AdminNav.tsx` `dd00bffb9aaa484b…`, `ProductGrid.tsx` `407c3a38fec9b7b2…`, `ProductCard.tsx` `7c2f81e96140ad02…`, `MediaDeleteButton.tsx` `e1042edbc5b8ec4d…` and `MediaPublishForm.tsx` `1402beb299415bbb…`;
  - **the gate:** `src/middleware.ts` `6d2c77576d75d389…`, and `src/lib/supabase/client.ts` `089fde0659be6581…`, `middleware.ts` `7693ad81921b0165…` and `server.ts` `e0d8444a65660aef…`; plus `robots.ts` `1c283fdb3e3b24a0…` and `api/keep-alive/route.ts` `bbba775344720107…`;
  - **packages:** `package.json` `26068c14d0df4a0c…` and `package-lock.json` `6a026457868784a9…`.
  - **Noted, unchanged:** `SubmitButton.tsx` `0e97d9c059750928…`.

**Verdict:** ✅ **Wave 5a (T-008, T-022, T-017) cleared at `2db0af9`.** There's no 🔴, 🟠 or 🟡, and one new 🟢 (SEC-INFO-49, accepted). **SEC-MED-2 is closed in code, pending merge.** It closes in production only when PM13 passes.

### Sign-off verdict (ticket-review gate, `docs/WORKFLOW.md` §5)
✅ **Cleared.** Wave 5a may merge once `code-reviewer` clears. Conditions:
- **The four re-bound files are bound at the hashes above.** A change to one before merge lapses that file's clearance until `/cso` re-reviews it.
- **Item 4's 308 amendments are folded** into PM3, the contract's verification line and PM13 before `/ship` runs them. Then a 10-of-12 PM3 isn't read as a failure, and SEC-INFO-49 isn't "fixed" through `redirects()` or the middleware.
- **These come back to `/cso`:**
  - the contract's security re-review triggers:
    - any header or value beyond item 1, a fetch directive, Report-Only, nonces, middleware or `preload`;
    - a bare domain served with `includeSubDomains`;
    - `redirects()` or the two keep flags;
    - `Referrer-Policy: no-referrer` (R-6);
  - any origin added to `frame-ancestors` (O3);
  - loosening or removing a header so that a preview pane works (O2 and R-5: use a top-level tab);
  - item 3's or item 4's "holds while" conditions failing.
- **Pre-deploy position:**
  - **SEC-HIGH-2 (🟠) still blocks the deploy.** It closes only when the owner has turned sign-ups OFF, a read-only `GET /auth/v1/settings` reads `disable_signup: true`, and the owner has reviewed Authentication → Users. The latest checkpoint (2026-10-07) still says sign-ups are ON. This pass sent no request to check.
  - **5a doesn't raise it.** SEC-INFO-32's guardrail holds at this build (item 7), so SEC-HIGH-2 stays 🟠, not 🔴.
  - **What the deploy would close in production:**
    - **Production is still at `e8eace1`,** going by the local `origin/main` and `client/main` (not fetched), and `e8eace1` is an ancestor of `main`. So production lacks all of the fixes below, and each is now on `main`. That was checked with `git merge-base --is-ancestor` for `f1bd94d`, `48fc3d7`, `a42ddcb` and `fb34d7d`, and T-006, T-015, T-018 and T-026 each have their commits on `main`.
    - **SEC-HIGH-1:** `next@16.1.6` to `16.3.6`, by T-006.
    - **SEC-MED-2:** this wave, once PM13 passes. If Vercel's own HSTS line wins or doubles, SEC-MED-2 stays open and a follow-up is filed, with no rollback.
    - **SEC-MED-15:** the sitemap XSS sink, `f1bd94d`.
    - **SEC-INFO-19:** the slug gate, T-026.
    - **SEC-HIGH-5:** T-015.
    - **SEC-MED-8:** T-018.
    - **SEC-MED-1:** T-007, `a42ddcb`.
    - **SEC-MED-9 and SEC-MED-10:** T-019, `fb34d7d`.
    - **T-013 (`48fc3d7`):** the `orderedIds` cap, and SEC-INFO-16 narrowed.
    - **Every other §5 row marked "closed in code, pending merge".**
    - **5a also** ends `X-Powered-By` and the 160 frame 404s per desktop page view.
  - **5a's `/ship` duties** (owner "deploy" only):
    - PM13 on both `www` domains, including the bare-domain STOP that guards `includeSubDomains`, and item 4's 308 row;
    - PM14 and R-4: a rollback is a revert-and-ship to both remotes, never Instant Rollback to `e8eace1` or any build before T-025.
  - **Recommended at `/ship`:** re-run `npm audit --omit=dev`. The lockfile hasn't changed since 2026-09-28, but this pass would miss any advisory published since then.
  - **After the deploy:** Wave 3a's O1 (one live ZZ-TEST publish-and-delete) stays recommended. Deploying needs the owner's typed "deploy".

**Actions taken:**
- Edited only `docs/SECURITY.md` (this entry, plus two §5 rows: the SEC-MED-2 status update and SEC-INFO-49), and left it uncommitted.
- Ran read-only `git` and `shasum`, file reads, and greps over the existing `.next`, `node_modules/next` and the builder's scratchpad evidence.
- Did not:
  - build, or start or query a server (`:3101` belongs to `code-reviewer`, and nothing touched `:3001`);
  - sign in;
  - send any request to the live site or Supabase.
- Never read `.env*`.


### 🔒 CSO Audit — 2026-10-11 — deploy-record: production at `4c10234` (client) and `318e73b` (origin)

**Scope:** The orchestrator dispatched this pass to record the security outcome of the 2026-10-11 production deploy, which the owner ordered by typing "deploy".
- **The live facts** are the orchestrator's own read-only checks (2026-10-11, about 11:00Z), recorded as given.
- **Items marked "verified here"** come from this pass's own checks on local git objects.
- **This pass did not** send any request to the live site or Supabase, build, start a server or sign in. It read no `.env*` file and didn't touch `:3001`.

**1. What shipped**
- **The tips:** `client` main is `4c1023426aea1b838873fac2144c559a3af8a527`, and `origin` main is `318e73bcf51777c2959849a36b4c70e9ad56501b`. Both trees are `eaeca5fa35a395bb9836d2f76e566a95afebc7b9`. Verified here: the two `^{tree}`s are equal, and the local tracking refs `client/main` and `origin/main` hold those ids.
- **What changed:** production moved from `e8eace1` to this tree. Verified here: the lockfile's `next` is `16.1.6` at `e8eace1` and `16.3.6` at `main`, and `src/` changed by 74 files (+4,705/−1,277).
- **The push** was the owner-ordered one-time history rewrite (DECISIONS 2026-10-08), with `--force-with-lease` on exact ids. Verified here: each history has 224 commits, each authored and committed by that repo's one account, with 0 `Co-Authored-By` lines.
- **The rewrite isn't a scrub.** `origin` is public, and GitHub keeps replaced commits fetchable by id. Nothing needed scrubbing (item 7), but no one should count on a rewrite to remove anything (runbook §7 item 5).

**2. The deployed tree carries every reviewed fix (verified here)**
- **All 32 files bound in the Wave 5a sign-off re-hash equal at `main`.**
  - They include the gate (`src/middleware.ts` `6d2c7757…` and `src/lib/supabase/*`), the five action files, the lib files, the bound pages and components, `next.config.ts` `d1af850c…`, `sitemap.ts` `bdfd4112…`, `package.json` `26068c14…` and `package-lock.json` `6a026457…`.
  - The noted `SubmitButton.tsx` re-hashes equal too.
  - `uploadOptimizedImage` (SEC-MED-1) is in `media-actions.ts`, bound at `dba76e48…`.
- **After 5a, Waves 5b (T-028) and 5c (T-029) changed 25 public UI files and added `src/components/ui/AutoplayVideo.tsx`.** None of them is bound.
  - **No risky additions:** every line they add to `src/` has 0 hits for storage, `fetch`, XHR, beacons, WebSockets, `innerHTML`, cookies, absolute URLs, `process.env`, `supabase`, `"use server"`, `target=`, iframes and scripts.
  - **No sink changes:** where a changed line holds an `<img src>`, a `<Link href>` or a `mailto:` or `tel:` link, only its `className` or `aria-label` changed. No `href`, `src`, slug or `categoryPath` expression changed, and no CSS `url()` was added, so SEC-INFO-19's and SEC-INFO-46's conditions hold.
  - **`AutoplayVideo`** passes its caller's `src` and `poster` straight to `<video>`.
  - **`Preloader.tsx`** is now `cfb01f3050c2c5ce…` (+12/−3), and its only imports are still `react` and `framer-motion`. So 5a's return-to-`/cso` condition for it (a network call, storage access or HTML sink) isn't met.
  - **`.claude/stack.json`** changed only its `deployNote`; `secretPatterns` and `clientReachableGlobs` are unchanged. The rest is `.githooks/` and the mirror script, which are tooling.
- So no sensitive surface reached production without a CSO entry.

**3. SEC-HIGH-2: the sign-up flag is off, but the finding isn't closed**
- **The flag:** the orchestrator read `GET /auth/v1/settings` as `disable_signup: true` at 2026-10-11T10:47:01Z and again at 10:59:46Z, with the email provider enabled. It had read `false` on 2026-10-08, at 2026-10-08T18:45Z and at 2026-10-11T05:00Z.
- **The second condition:** this office's closure condition (set 2026-09-28 and restated at 5a) also needs the owner's review of Authentication → Users. Nothing records that review: not the facts given to this pass, and not `docs/LOG.md`, `DECISIONS.md`, `ROADMAP.md`, `QA_REPORT.md`, `CLIENT_QUESTIONS.md` or the checkpoint memory (grepped).
- **Why the review matters:**
  - Every check from 2026-09-28 to 2026-10-11T05:00Z found sign-ups open, probably since the project was created (Supabase's default).
  - Turning them off stops new accounts. It doesn't remove any account made in the meantime, and under R1 such an account is a full admin whose sessions stay valid.
  - SEC-INFO-32 found the anon key in no browser bundle, no production response and no git history, so a stranger's account is unlikely. It's still unverified.
  - The review must happen after 10:47:01Z; an earlier look misses the end of the window.
- **What the owner does:**
  1. List every account in Authentication → Users.
  2. Treat any account the client doesn't recognize under runbook §7 item 6: delete it, then audit writes since its `created_at`.
  3. On the next read-only settings check, also record `external.anonymous_users`. An anonymous sign-in gets an `authenticated` session, which R1 treats as an admin. This office expects `disable_signup` to refuse anonymous sign-ups too, but hasn't verified it.
- **Status:** 🟠, mitigated and still open. Record the review before the next deploy.

**4. SEC-MED-2: PM13 passed, so it's closed in production**
- **The `www` hosts:** on `www.fal.com.bd` and `www.fashionasialtd.com`, `/` and `/admin/login` send each of the six headers exactly once. HSTS is exactly `max-age=63072000; includeSubDomains`, and there's no `x-powered-by`. So Vercel's own HSTS line neither wins nor doubles, which is 5a's condition for closing in production.
- **The bare-domain STOP holds.**
  - `fashionasialtd.com` (307) and `fal.com.bd` (308) redirect to their `www` host with none of our headers.
  - So `includeSubDomains` never reaches a bare domain, and `mail.` and cPanel names stay out of the pin.
  - `next.config.ts:55` records the rule: if the app ever serves a bare domain, `includeSubDomains` goes first, and that comes back to `/cso` (a 5a trigger).
- **The 308 row:** on Vercel, the eight `/what-we-do/<slug>` 308s carry all six headers.
  - So SEC-INFO-49 doesn't arise in production. It stays an accepted note for `next start` only.
  - Headers were recorded only on those eight. `/reports` and the old category URLs take the same `redirects()` path, but only their status was recorded.

**5. SEC-HIGH-1 and the rows 5a said this deploy closes: closed in production**
- **SEC-HIGH-1:** production runs `next` 16.3.6 (the orchestrator). The deployed lockfile is T-006's `6a026457…`, at `16.3.6` (verified here).
- **The rest close on item 2's hash match and the live checks:**
  - **SEC-MED-15 and SEC-INFO-19:** `nav.ts` `507e5c62…` and `site-content.ts` `9939d4f3…`. Live, the sitemap has 18 entries and 0 `<lastmod>`, and an unknown category returns 404.
  - **SEC-HIGH-5 (T-015) and SEC-MED-8 (T-018):** the action files and `action-errors.ts` `b0be0a48…`.
  - **SEC-MED-1 (T-007), SEC-MED-9 and SEC-MED-10 (T-019):** `media-actions.ts` `dba76e48…`, `MediaDeleteButton.tsx` `e1042edb…` and `MediaPublishForm.tsx` `1402beb2…`.
  - **T-013:** `products-actions.ts` `7e8a1069…`. The `orderedIds` cap is closed; SEC-INFO-16 is narrowed, with only its accepted residual left.
  - **Every other "closed in code, pending merge" row:** SEC-MED-7/13, SEC-MED-11, SEC-INFO-15, SEC-INFO-20, SEC-INFO-36, SEC-INFO-37, SEC-INFO-41, SEC-INFO-42, SEC-INFO-43 and QA T-016 I1. Live, `/products` and its 8 category pages return 200, with 0 UUIDs in their HTML.
- **The anonymous gate holds live.** `/admin`, `/admin/products` and `/admin/media` 307 to `/admin/login` on both domains, and `/admin/login` returns 200.
- **The write paths weren't exercised live,** by the owner's no-writes rule. Their production closure rests on tree identity plus each wave's offline verification.
- **Now due on production:**
  - Wave 3a's O1: one ZZ-TEST publish-and-delete, by the owner.
  - 5a's owner row O1: the owner's next sign-in and sign-out, with the headers on.
  - If sign-in fails or loops, the response is PM14's revert-and-ship to both remotes, never Instant Rollback to `e8eace1`.

**6. The Next.js advisories: new 🟡 SEC-MED-17, ticketed as T-044**
- **The finding:** the orchestrator's `npm audit --omit=dev` before the deploy puts `next` 16.3.6 in range of six advisories fixed in 16.3.8:
  - GHSA-cjq9-62q9-8jv4 (high: SSRF in Image Optimization);
  - GHSA-mcj8-r9mp-w47p, GHSA-4jqv-mc3x-m676, GHSA-3w37-wq28-93x7, GHSA-f87g-xv8r-7p7x and GHSA-39w2-rjm5-chcv.
- **The orchestrator's assessment is that none applies.** This pass re-checked the code-side premises at `main`. It didn't read the advisory texts (no network).
  - **cjq9:** `next.config.ts` has no `images` key at all, so there's no `remotePatterns` or `domains` (verified here). The two `src/` files that use `next/image` can only optimize local images.
  - **4jqv** doesn't affect Vercel, where production runs.
  - **mcj8, 3w37 and f87g** need a root catch-all page, `use cache`, `draftMode` or generated icons. Verified here:
    - there's no catch-all route under `src/app`;
    - `src/` has no `use cache`, `draftMode` or `unstable_cache`;
    - the icons are static PNGs (`src/app/icon.png`, `src/app/apple-icon.png` and `public/icon.png`).
  - **39w2 is dev-only, but dev here isn't data-free.**
    - The dev server is wired to the live database (CLAUDE.md).
    - `npm run dev` is plain `next dev`, which listens on every interface unless given `-H`.
    - Until T-044 is live, run it on loopback (`next dev -H 127.0.0.1`), and stop it when it isn't in use.
    - T-044's review confirms what 39w2 reaches.
- **Why 🟡 and not 🟢:** nothing is reachable today, but each advisory is one ordinary change away. Adding `images.remotePatterns` to optimize the Supabase gallery photos is the likeliest; a catch-all page, `use cache`, `draftMode` or a generated icon would do it too.
- **Guardrail:** none of those merges before T-044 is live. Each one comes back to `/cso`.
- **T-044** (filed in ROADMAP) bumps `next` to 16.3.8 and runs `npm audit fix` on the tooling, taking SEC-INFO-31's lockfile ticket with it.
  - The lockfile change voids the `package.json` and `package-lock.json` bindings, so T-044 needs `/security-review`: `npm ls next` must read 16.3.8, and `npm audit --omit=dev` must list no `next` advisory.
  - `package.json` still reads `"next": "^16.1.6"` (verified here), so only the lockfile holds the floor (SEC-INFO-30). T-044 should raise the range to `^16.3.8`.
  - Once T-044 is live, runbook §7 item 7's floor becomes 16.3.8.

**7. Secrets (verified here)**
- **The configured patterns:** the public history (`publish/origin-main`) has 0 hits on the four value-shaped `secretPatterns` (`ghp_`, `github_pat_`, `AKIA` and PEM private keys).
  - The six name patterns hit only bare words, each match exactly as long as its literal. The hits are in docs, in tooling (the pattern lists themselves), and in `db/migrations/0001_products-within-category.sql`, where `service_role` is the Postgres role name.
  - The only env-like file ever committed is `.env.example`.
- **New 🟢 SEC-INFO-50:** the 10 patterns have no value shape for this stack's own keys: a Supabase JWT (`eyJ….eyJ….…`), `sb_secret_…` or `sb_publishable_…`. So each wave's "0 hits on the 10 patterns" couldn't have caught a pasted Supabase key.
  - This pass scanned the public history and every local ref for those three shapes, plus Postgres URLs with a password and Google, Slack and Stripe live keys: 0 hits.
  - Add the three shapes to `stack.json` and the hooks that read it.
- **SEC-MED-14 (count-only; no value printed):** local `.git/config` still has 1 remote URL with embedded credentials and 6 `credential.*` entries. A token that can push to the branch Vercel builds from is a production-deploy credential. The rotation is still with the owner (ROADMAP).

**8. As another user: N/A, by construction**
- This pass records a deploy. It adds no authorization surface, and the gate, actions and policies are byte-identical to what was reviewed (item 2).
- Every signed-in account is an admin (R1), so there's no second-user boundary to test yet. T-023 creates one, and its review is where as-another-user testing starts.
- Live: anonymous requests to `/admin*` get a 307 (item 5). Nothing signed in or wrote, by the owner's rules.

**R1 and T-023: unchanged.**
- Any signed-in account is still an admin.
- Turning sign-ups off narrows who can get an account. It doesn't limit what an account can do, and one dashboard toggle reopens it.
- **T-023** (the admin allowlist) stays open.
- SEC-INFO-32's guardrail stands: nothing may ship the anon key to a browser while T-023 is open.

**Verdict:** ✅ **CLEARED as deployed. There's no 🔴.**
- **Closed in production:** SEC-HIGH-1, SEC-MED-2, SEC-MED-15, SEC-INFO-19, SEC-HIGH-5, SEC-MED-8, SEC-MED-1, SEC-MED-9, SEC-MED-10, T-013's cap, and every "closed in code, pending merge" row.
- **Still open:** SEC-HIGH-2 (🟠, mitigated, waiting on the Users review), R1 with T-023, the new 🟡 SEC-MED-17 (T-044) and the new 🟢 SEC-INFO-50.
- **Before the next deploy:** the owner's Authentication → Users review, recorded here (SEC-HIGH-2). T-044 is the natural content of that deploy, after its own `/security-review`.
- **Owner actions now:** the Users review, the two O1 rows (item 5) and the PAT rotation (SEC-MED-14).

**Actions taken:**
- **Edited:** only `docs/SECURITY.md` (this entry, the §5 rows and a §6 note), left uncommitted.
- **Ran:** read-only `git`, `shasum` and greps, plus two `node` scans over local git objects. The scans printed no matched value.
- **Did not:** send any request, build, start a server or sign in. `.env*` wasn't read, and `:3001` wasn't touched.

## 5. Mitigations / open items

| Finding | Ticket | Status |
|---|---|---|
| SEC-HIGH-1 — bump `next` to `16.3.6`+ | Filed and fixed as **T-006** (branch `fix/T-006-next-security-bump`) | ✅ **Closed in code 2026-09-28.** Verified in the 2026-09-28 T-006 CSO entry: the re-run audit shows no `next` and 0 critical, and `npm ls next` shows exactly `16.3.6`. **Production is still exposed:** `origin`/`client` at `e8eace1` run `next@16.1.6` until the user types "deploy" and `/git` pushes a `main` that contains the T-006 merge. The closure is bound to the reviewed `package-lock.json` (sha256 `6a026457868784a9…`) and `next.config.ts` (`6bf8389d6804cfc4…`). If either changes before merge, the closure is void until `npm ls next` and `npm audit --omit=dev` are re-run. |
| SEC-MED-1 — server-side dimension check on `uploadOptimizedImage` | Not yet filed — recommend `/pm` follow-up | Open — does not block deploy |
| SEC-MED-2 — add security headers (`next.config.ts` `headers()`) | Not yet filed — recommend `/pm` follow-up | Open — does not block deploy |
| SEC-INFO-7 — confirm admin login rate-limit/lockout | Track for next full `/cso audit` | Open — informational |
| SEC-HIGH-2 — user must verify Supabase Dashboard "allow new user signups" is off | User action, not a code ticket — no `/pm` ticket needed | Open — blocks next `deploy` pending user confirmation |
| SEC-MED-3 — `normalizeProducts()` stored-slug-vs-stored-slug dedupe gap | Not yet filed — recommend `/pm` fast-follow on `src/lib/site-content.ts` | Open — does not block deploy |
| SEC-MED-4 — stored `slug` validation contract for T-003/T-005 | Not yet filed — recommend folding into T-003/T-005 acceptance criteria directly | Open — does not block deploy |
| SEC-MED-3 / SEC-MED-4 — status update, 2026-09-27 | Substantially addressed by T-003's `resolveCategoriesForSave` (see 2026-09-27 T-003 CSO entry) — the residual gap is a distinct mechanism, tracked separately as SEC-HIGH-3, not a re-opening of these two | Superseded in part — see SEC-HIGH-3 |
| SEC-HIGH-3 — slug-hijack bypasses the delete guard (`resolveCategoriesForSave` trusts bare slug-string membership, not slug-*and-owner*) | Not yet filed — recommend `/pm` file now against `src/lib/site-content.ts` / `src/app/actions/settings-actions.ts` | ✅ Closed 2026-09-27 — `/architect`'s Category identity amendment (decision (d)); independently re-verified this pass, 43/43 adversarial assertions — see re-review entry above |
| SEC-HIGH-4 — `updateSettings` throws guard failures with no catch anywhere and Next.js redacts them in production; T-004 cannot meet its own acceptance criteria until this changes | Filed and shipped as **T-012** | ✅ Closed 2026-09-27 — zero `throw` remains in `updateSettings`; all 7 real call sites verified independently (see 2026-09-27 T-012 CSO entry) |
| SEC-MED-8 — raw Supabase/Postgres `error.message` strings from `updateSettings` (existing-row read, delete-guard count, final upsert) now reach the browser verbatim, same accepted pattern as SEC-INFO-15 but extended to a second file, three branches | Not yet filed — recommend `/pm` consolidated fast-follow covering both `settings-actions.ts` and `products-actions.ts` (generic-message mapping, log raw error server-side only) | Open — does not block deploy |
| SEC-HIGH-5 — `ReportsClient.tsx` (`createReport`/`updateReport`/`deleteReport`) and `CareersClient.tsx` (`createJob`/`updateJob`/`deleteJob`) have zero `try`/`catch` around their Server Action calls — identical pre-fix shape to SEC-HIGH-4, live on shipped admin surfaces today, no future-ticket precondition needed | Not yet filed — recommend `/pm` high-priority fast-follow, same fix pattern as T-012 (both pages also need a new error-display slot) | Open — blocks next `deploy`, same standing as SEC-HIGH-4 |
| SEC-MED-9 — `addMediaAction`/`deleteMediaAction` (`media-actions.ts`) return void and are wired as raw `<form action>` Server Actions with no client JS wrapper — zero failure signal in any environment, not just production; `deleteMediaAction`'s delete error isn't even logged server-side | Not yet filed — recommend `/pm` file as its own fast-follow; needs a distinct design (no client awaiter exists to convert to a `{ok,error}` check) rather than a copy of T-012's pattern | Open — does not block deploy |
| SEC-MED-10 — 10 write functions across `settings-actions.ts` (7), `media-actions.ts` (2), `jobs-actions.ts` (3) have no application-level `getUser()` check, relying solely on RLS, contrary to this codebase's own documented convention; RLS itself is source-confirmed only for `jobs`, not for `media_assets`/`reports`/`leaders` (`docs/WORKFLOW.md` §8 row 2) | Not yet filed — recommend `/pm` batch with SEC-HIGH-5's fix ticket (7 of 10 functions overlap) | Open — does not block deploy; contingent risk already scoped under SEC-HIGH-2 |
| SEC-MED-5 — TOCTOU race between the delete guard's product count and the `site_settings` upsert | Not yet filed — recommend `/pm` fast-follow | Open — does not block deploy |
| SEC-MED-6 — `resolveCategoriesForSave` treats a missing/non-array `products` field as zero categories instead of rejecting the save | Not yet filed — recommend `/pm` fast-follow on `src/lib/site-content.ts` | ✅ Closed 2026-09-27 — non-array `products` now rejected outright; verified this pass by execution — see re-review entry above |
| SEC-MED-7 — `CategoryProductInput.image` / category `Product.image` accept any string, no scheme allow-list | Filed as **T-014** | Open — does not block deploy. **Sequencing update, 2026-09-27 (T-005 CSO entry):** T-005 is the first live public render surface for `CategoryProduct.image` (`getCategoryProducts` had no caller before T-005; `public.products` is still empty today so still inert) — recommend `/pm` sequence T-014 before or alongside T-004's merge, not "anytime" as currently ordered, since T-004 is what will first let this field hold an attacker-influenced value. |
| SEC-MED-4 — T-005 half (treat `category.slug` as untrusted for `revalidatePath`/sitemap/canonical/OG) — status update, 2026-09-27 | Verified against the real T-005 diff — see 2026-09-27 T-005 CSO entry | ✅ Closed 2026-09-27 for T-005's own scope — every named sink uses a validated/resolved slug or a typed, Next-serialized shape; residual tracked separately as SEC-INFO-19 |
| SEC-INFO-19 — `normalizeProducts()`'s unvalidated stored `slug` now reaches a `<Link href>` sink (`what-we-do/page.tsx`) for the first time; no live write path can set an unsafe value | Not yet filed — recommend `/pm` low-priority fast-follow on `src/lib/site-content.ts` (`normalizeProducts()`), gate the stored-slug branch through `isWellFormedSlug()` matching `resolveCategoriesForSave`/`checkCategoryAttachable` | Open — informational, does not block deploy |
| SEC-MED-7 — status update, 2026-09-27 (T-004 CSO entry) | Reachability corrected — see **SEC-MED-13** below; the already-filed **T-014** ticket now carries this context | Open — see SEC-MED-13 for the explicit merge/deploy ruling |
| SEC-MED-11 — `createCategoryProduct`/`updateCategoryProduct` accept an arbitrary finite `sort_order` verbatim when a caller supplies one (negative/huge/non-integer); the new max+1 default only fires when omitted/non-finite. Crafted-call only — not reachable via T-004's shipped UI | Not yet filed — recommend folding into **T-014** | Open — does not block deploy |
| SEC-MED-12 — read-then-insert race in the new `sort_order = max+1` lookup (two concurrent adds to the same category can land the same `sort_order`); extends SEC-MED-5's already-accepted TOCTOU rationale | No new ticket — same accepted rationale/mitigation as SEC-MED-5 (Postgres RPC/transaction, only if concurrent-admin-editing patterns emerge) | Open — does not block deploy |
| SEC-MED-13 — `ImageUploadField`'s pre-existing hand-editable raw path `<input>` (unchanged by T-004) means SEC-MED-7's gap is reachable via ordinary shipped admin UI, by any staff member, not only a crafted/direct Server Action call as every prior entry on SEC-MED-7 assumed; T-004 adds a second write path (`public.products`) inheriting it | Filed as **T-014** (existing) — recommend elevating scheduling priority to match the standing pre-deploy list; explicit ruling in the 2026-09-27 T-004 CSO entry, not reclassified to High | Open — does not block deploy or T-004's merge |
| SEC-INFO-20 — `updateCategoryProduct` can structurally reassign a product to a different, already-attachable category (pre-existing T-003 behavior, gated soundly, crafted-call only, no shipped UI reaches it) | No ticket — informational | Closed as informational — no action required |
| SEC-INFO-21 — `getAllCategoryProducts()` adds no exposure beyond what `getCategoryProducts()` and Supabase's own public REST endpoint already made available | No ticket — informational | Closed as informational — no action required |
| SEC-INFO-22 — category `id`/`slug` round-trip through `BusinessClient`'s new post-Save re-read confirmed safe, closing the T-004 acceptance-criterion risk `docs/TECH_STACK.md`/`docs/MEMORY_BANK.md` flagged as open | No ticket — informational, acceptance criterion satisfied | Closed as informational — no action required |
| SEC-HIGH-2 — status update, 2026-09-28 (T-006 CSO entry) | User action in the dashboard (steps in the T-006 entry, item 7). The structural fix is the next row | **Open, 🟠 High; user-reported fix not yet effective.** The orchestrator's read-only `GET /auth/v1/settings` (project ref `hgrfdzbv…`) still returned `disable_signup: false` more than 20 minutes after the user reported turning signups off. Closes only when that endpoint reads `true` **and** the user has reviewed Authentication → Users (§7 item 6). Becomes 🔴 if the anon key ever ships to a browser (SEC-INFO-32). |
| SEC-HIGH-2 — structural fix: role-scoped admin authorization (the `/admin` middleware gate, the write-action auth helper, and every `authenticated` RLS policy predicate), so the signup toggle stops being the single point of failure | Not yet filed. Recommend `/pm` file it as schema-touching and sensitive: `/architect Review schema` → the user applies the SQL → `/lead-dev` → `/cso review` → `/qa`. Rank it above T-015/T-018 | Open. Recommended |
| SEC-INFO-23 to SEC-INFO-28 — T-006 verification record: audit cleared; exact `16.3.6` floor with `vcvr` verified at its source; lockfile integrity, provenance and signatures; `sharp-wasm32` inert; both `next.config.ts` keys verified dev-only; null-origin fix present | No ticket; informational | Closed as informational |
| SEC-INFO-29 — `form-actions.ts:27` logs the whole `PostgrestError`, whose `details` could echo `submissions` payload PII on a NOT NULL or CHECK violation. Theoretical under today's schema; logs in dev **and** production | Recommend folding into **T-018** (log only `error.code`/`error.message`) | Open. Informational; does not block deploy |
| SEC-INFO-30 — only the lockfile guards the `16.3.6` floor. `vcvr` is absent from the audit feed and the range stays `^16.1.6`, so a bad lockfile merge would regress silently | Fold into the toolchain follow-up below: branch after T-006 merges, re-confirm `npm ls next`, `/architect` to reconsider a `^16.3.6` range. Runbook §7 item 7 | Open. Informational |
| SEC-INFO-31 — 9 residual toolchain advisories (`browserslist`, `picomatch`, `baseline-browser-mapping`, `postcss-selector-parser`: build-time, 🟢 Low; `brace-expansion`, `flatted`, `js-yaml`, `@humanfs/node`, `@babel/core`: lint-only, 🟢 Info). None is reachable at runtime | Not yet filed. This is `/architect`'s (e) follow-up: recommend `/pm` file a low-priority, lockfile-only ticket cut from `main` after T-006 merges, including the `devDependencies` move pending `/architect` sign-off | Open. Doesn't block deploy or T-006 |
| SEC-INFO-32 — the Supabase anon key is not shipped to browsers (verified against the build, production and git history). This corrects the "every visitor holds it" premise in the T-001, T-004 and T-005 entries | No ticket. Guardrail: nothing may ship the key to a browser while SEC-HIGH-2 or its structural fix is open. Recommend `/archivist` record it as a Known Trap | Open. Guardrail |
| SEC-MED-14 — plaintext GitHub PAT for `happierbangladesh` in local `.git/config` (inline `credential.helper` plus credentials embedded in a remote URL). Not committed; can leak via `git config --list` or `git remote -v` into agent transcripts | User action: revoke it, reissue as a fine-grained single-repo PAT with an expiry, move it to Keychain or `gh auth setup-git`, strip the URL credentials, and log the rotation in §6 | Open. Doesn't block deploy |
| SEC-MED-10 — erratum, 2026-09-28 | Headline count should read **12** write functions (7 + 2 + 3, as the finding's own list states). T-015 plus T-019 cover all 12 | Erratum only; status unchanged |
| SEC-HIGH-5 — status update, 2026-09-28 (T-015 CSO entry) | Fixed by **T-015** (branch `fix/T-015-admin-crud-errors`) | ✅ **Closed in code 2026-09-28, pending merge.** No `throw` is left in the ten actions, and all 8 call sites (10 calls) handle both `ok: false` and a throw. The closure is bound to `settings-actions.ts` sha256 `8df471e3…` and `jobs-actions.ts` `628e5e74…`, plus the client invariants in the T-015 sign-off. Leader CRUD is confirmed in scope. Correction: before the fix, a failure blanked the page through React 19's error-boundary path; it didn't leave a static modal. **Production is still exposed** until a user-typed deploy of a `main` containing T-015 |
| SEC-MED-10 — status update, 2026-09-28 (T-015 CSO entry) | **T-015** (10 functions); **T-019** (`addMediaAction`, `deleteMediaAction`) | 10 of 12 closed in code by T-015; auth-first was verified line by line in each. The remaining 2 are open under T-019. A sweep of all 32 exported actions found no other unchecked writer |
| SEC-MED-8 — status update, 2026-09-28 (T-015 CSO entry) | **T-018**, whose Acceptance already lists the functions T-015 converted | Open, and extended as planned. The ten T-015 functions now return raw `error.message` to authenticated callers; before, it was thrown and redacted in production. Only `message` is forwarded, never `details`. Doesn't block deploy |
| SEC-INFO-33 — `uploadFile`'s caller-controlled `bucket` and client-supplied extension reach the Storage request URL unencoded. An authenticated caller can steer the upload to any path on the Supabase host, or choose any object name in any bucket, with any content type (≤ 1 MB). No overwrite is possible (`x-upsert: false`), and nothing exceeds the caller's own Supabase rights. T-015 removed the anonymous path | Not yet filed. Recommend `/pm` file one small sensitive ticket: pin the bucket server-side, build the key without client input (a fixed `.pdf` after a `%PDF-` check), and pass an explicit `contentType`. User action alongside it: restrict the allowed MIME types of the `reports` bucket (and of `media`) in the Supabase dashboard | Open. 🟢 Low; doesn't block deploy |
| SEC-INFO-34 — `.select("id").maybeSingle()` after an UPDATE or DELETE is RLS-neutral, because the `WHERE id =` filter already applied SELECT policies. "Not found" means zero rows were written, under any policy shape | No ticket. Guardrail: use this pattern only on unique-key filters; in postgrest-js 2.112.2, `maybeSingle()` is only a client-side count | Closed as informational. The `/qa` manual-checklist items are in the T-015 entry, item 3 |
| SEC-INFO-35 — Next's default 1 MB Server Action body limit is the only size bound on `uploadFile` and `addMediaAction`. Report PDFs over about 1 MB can't be uploaded, and the admin sees the generic fallback text | No ticket from this office. Guardrail: any change that raises `serverActions.bodySizeLimit` must add server-side size and type validation to both upload paths in the same change, and needs `/cso review`. Supporting larger PDFs is a product question for `/pm`/`/architect`; signed upload URLs are preferred | Open. Guardrail |
| SEC-HIGH-2 — structural-fix scope note, 2026-09-28 (T-015 CSO entry) | For the role-scoping ticket recommended above | After T-015 there are 8 session-check sites: 3 private `requireUser()` copies, 4 inline `getUser()` calls and the middleware gate. Consolidate them into one `server-only` helper first, and never export it from a `"use server"` file |
| SEC-MED-15 — stored-XSS sink in `/sitemap.xml`. Next 16.3.6 writes `<loc>` unescaped, and `normalizeProducts()` returns a stored slug verbatim; proved by execution and headless Chrome. Pre-existing since T-005; T-025 doesn't widen it. No app write path can plant it: that takes a direct DB write (the dashboard, or the anon key plus any session, i.e. SEC-HIGH-2's chain) | Not yet filed. Recommend (a) the `isWellFormedSlug()` gate in `normalizeProducts()` (SEC-INFO-19's fix), in T-026 or a small sensitive ticket, and/or (b) `encodeURIComponent` in `categoryPath()`, pre-cleared to ride T-025 | Open, 🟡 Medium. Escalates to 🟠 if the anon key ever reaches a browser. Recommend closing it before or with the next deploy. Doesn't block T-025 |
| SEC-INFO-19 — status update, 2026-10-03 (T-025 CSO entry) | Same fix as before; it's now also SEC-MED-15's root cause | Open. Priority raised: the unvalidated stored slug is now known to reach a script-capable sink, not only a same-origin link |
| SEC-MED-4 — erratum, 2026-10-03 (T-025 CSO entry) | The T-005 entry's premise that Next escapes sitemap URLs is false for `<loc>` in 16.3.6 | The T-005-half closure no longer covers the sitemap sink; that's tracked as SEC-MED-15 |
| SEC-INFO-36 — `ProductGrid`'s `Pick<…>` narrows the type, not the runtime object. Full `products` rows reach `ProductGrid` and `ProductCard`, which is safe only while both stay server components | Guardrail. Recommend a narrowing mapper plus `id?: never`, like `toCategoryCards`, in T-016 | Open. Informational |
| SEC-INFO-37 — a category slugged `constructor` makes `getAllCategoryProducts()` throw (the plain-object record finds the inherited `Object` member) and breaks `CategoryProductsManager`'s lookups. `/products` fails soft and shows no product sections; `/admin/business` fails to load. Reachable through ordinary admin UI | Recommend folding into T-016 or T-026: a null-prototype object or `Map` server-side, `Object.hasOwn` or a `Map` at the client lookups, or reserving `Object.prototype` names when deriving slugs | Open. 🟢 Low; availability only. Doesn't block deploy |
| SEC-INFO-31 — status update, 2026-10-03 (T-025 CSO entry) | Same lockfile-only ticket | Open. 16 advisories now (0 critical, 12 high, 2 moderate, 2 low), with the lockfile byte-identical to T-006's (`6a026457…`), so it's advisory-feed growth only, led by `braces` `GHSA-vfj7-8cjw-p6xm` via `tailwindcss` and `eslint-config-next`. All build or lint toolchain; none reachable at runtime |
| SEC-MED-15 — status update, 2026-10-03 (T-025 re-check of `f1bd94d`) | Fix (b) shipped in `f1bd94d`: `categoryPath()` encodes the slug | ✅ **The sitemap sink is closed in code, pending merge.** Verified offline (the planted payload leaves no markup) and live (18/18 sitemap URLs unchanged). Bound to `nav.ts` sha256 `507e5c62…`. **Production is still exposed** until a user-typed deploy of a `main` containing `f1bd94d`. The root cause stays open as SEC-INFO-19, for T-026 |
| SEC-INFO-19 — status update, 2026-10-03 (T-025 re-check) | Recommend `/pm` add it as an explicit T-026 AC bullet (`normalizeProducts()` keeps a stored slug only if `isWellFormedSlug()` passes), with `/cso review` | Open. Informational again: with fix (b) in, every remaining sink (card `href`s, section links, canonical) is React- or RSC-escaped and prefix-confined, verified with 16 hostile slugs. No change is required in `CategoryCardGrid` |
| SEC-INFO-38 — `writeBusinessFields`' compare-and-swap is RLS-safe under any policy shape: RLS can only turn a save into SAVE_CONFLICT or an error, never into a write without the stamp condition or a success without a write. It works only if the owner's SQL results show the 8 items in the 2026-10-04 T-026 entry, item 2 | Owner action: the read-only SQL check (the pre-merge HARD STOP). Recommend adding the `pg_rules` query to it | Open until the owner's results are recorded. A mismatch comes back to `/cso`. Never widen a policy by hand |
| SEC-INFO-39 — `a6ce5f6`'s forward stamp has two edges: `toISOString()` throws only at the maximum JS time (unreachable from `timestamptz`, and nothing is written), and an offset-less stamp parses as local time (matters only if the column isn't `timestamptz`) | No ticket. Item 7 of the owner's SQL check covers the column type | Closed as informational |
| SEC-INFO-19 — status update, 2026-10-04 (T-026 CSO entry) | Fixed by T-026: `normalizeProducts()` keeps a stored slug only if `isWellFormedSlug()` passes (`site-content.ts:451`) | ✅ Closed in code, pending merge. Verified with 22 hostile values and a 2,000-case fuzz. Bound to `site-content.ts` sha256 `465f6712…` |
| SEC-MED-15 — status update, 2026-10-04 (T-026 CSO entry) | Root cause (a) arrives with T-026; (b) is already on `main` (T-025) | ✅ Both fixes in code, pending merge of T-026. Production stays exposed until a user-typed deploy of a `main` containing them |
| SEC-INFO-36 / SEC-INFO-37 — status update, 2026-10-04 (T-026 CSO entry) | T-026 didn't change these lines. Recommend folding both into T-016 (the product editor): SEC-INFO-37 at `products-actions.ts:157-159` and `CategoryProductsManager.tsx:91,110,117,122,134,146`; SEC-INFO-36 at `ProductGrid.tsx:8` | Open. 🟢 |
| SEC-HIGH-2 — structural-fix scope note, 2026-10-04 (T-026 CSO entry) | For the role-scoping ticket | T-026 adds `saveCategories` and `saveWhatWeDoText` (34 public Server Action exports in all), and moves `seedSettingsFromDefaults` from an inline `getUser()` to `settings-actions.ts`'s `requireUser` |
| SEC-INFO-38 — status update, 2026-10-04 (the owner's SQL evidence) | The owner's read-only SQL check, recorded verbatim in the T-026 evidence entry | ✅ Closed. All 8 points match, so the compare-and-swap works under the live policies. From the security side, T-026's pre-merge HARD STOP is satisfied |
| SEC-INFO-39 — status update, 2026-10-04 (the owner's SQL evidence) | No trigger, and `updated_at` is `timestamptz NOT NULL` (current value `2026-08-31 07:10:19.408+00`) | Closed as informational, now confirmed. Both edges are unreachable, and with no `now()` trigger, the app's forward stamp is the live guarantee against a repeated stamp |
| SEC-INFO-40 — `anon` holds INSERT/UPDATE/DELETE grants on `site_settings` (Supabase defaults), and RLS alone denies them | Not yet filed. Recommend a separate `[db]` ticket: a hand-applied migration that revokes all but SELECT from `anon` (TRUNCATE included), optionally drops DELETE/TRUNCATE from `authenticated`, and extends explicit grants to the other implicit tables per SEC-INFO-10, taking care that `submissions` keeps `anon` INSERT and gets no SELECT. `architect-reviewer` + `/cso`; the owner applies | Open. 🟢 Hardening; not exploitable today; doesn't block T-026 or deploy |
| SEC-INFO-37 — status update, 2026-10-05 (T-016 CSO entry) | Fixed by T-016: the server groups products into a Map (`products-actions.ts:165-173`), and the editor's state and the public page look up through `Map.get` | ✅ Closed in code, both halves, pending merge. Tested with `constructor` and `__proto__` keys, and the builder's harness round-trips the Map through Next's own serializer |
| SEC-INFO-20 — status update, 2026-10-05 (T-016 CSO entry) | T-016's partial update never writes `category_slug` | ✅ Closed in code, pending merge. An edit can no longer move a product to another category |
| SEC-MED-11 — status update, 2026-10-05 (T-016 CSO entry) | `updateCategoryProduct` no longer writes `sort_order`. `createCategoryProduct` still takes a caller's finite value | Open, halved. The rest stays in **T-014**, which is now unblocked because the path box saves on blur |
| SEC-MED-8 — status update, 2026-10-05 (T-016 CSO entry) | **T-018** | Open, extended as planned. `updateCategoryProduct`'s read-error and write-error branches (`:311`, `:325`) return raw database text, to authenticated callers only |
| SEC-INFO-36 — status update, 2026-10-05 (T-016 CSO entry) | Moved from T-016 to **T-033** (DECISIONS 2026-10-04, the T-016 split) | Open. 🟢 |
| SEC-INFO-36 — status update, 2026-10-06 (Wave 1 CSO entry) | Fixed by T-033: `toProductCards` and `ProductCardData` (`id?: never`) in `src/components/catalog/`. Both public pages narrow before any prop | ✅ Closed in code, pending merge. Verified by the builder's tsc guard, by this office's flight render of both real pages in production and development with sentinel rows (`main` in development as the positive control), and live (0 UUIDs; there are 0 live products). Bound to the catalog-component invariants in the Wave 1 sign-off |
| SEC-INFO-19 / SEC-MED-15 — status update, 2026-10-06 (Wave 1 CSO entry) | T-033's shared 255 cut (`site-content.ts:403-445`) | Strengthened in code, pending merge. Read-time slugs are now cut at 255 too, so every slug that reaches a URL sink passes `isWellFormedSlug` in full; a 30,000-title fuzz kept the output alphabet within `[a-z0-9-]`. Production stays exposed to SEC-MED-15 until a user-typed deploy of a `main` containing T-025 and T-026 |
| SEC-INFO-31 — status update, 2026-10-06 (Wave 1 CSO entry) | Same lockfile-only ticket | Open. 17 packages are flagged now (0 critical, 13 high, 3 moderate, 1 low), on the same lockfile (`6a026457…`), so it's advisory-feed growth only. `source-map-js` is new (high, via `postcss`, at build time), and `postcss-selector-parser` moved from low to moderate. All are build or lint toolchain; `next`, `react` and `@supabase/*` have none |
| SEC-HIGH-2 — structural-fix scope note, 2026-10-06 (Wave 1 CSO entry) | For the role-scoping ticket (T-023) | `updateSettings` now writes only six hand-written keys, checked after `getUser()`: a limit on which rows, not on who. There are still 34 public Server Action exports. 24 of their ids can be found in the client bundle, and none of those 24 is a read |
| SEC-INFO-41 — before the fix, a category titled with an `Object.prototype` name (`constructor`, `toString`, `__proto__`, …), with no image of its own, took a function or `Object.prototype` as its default image, which React can't serialize. `/products` and `/admin/products` both fail to render, so only a SQL edit recovers it. Any signed-in account could cause it through the ordinary editor. Pre-existing since `ecf6cf6` (2026-08-24) and live in production (`e8eace1`) | Fixed by `1a57cfa` (T-033's fix round): the private `defaultCategoryImage` checks own keys (`site-content.ts:327`) | ✅ Closed in code, pending merge. 🟢 Low, availability only. Verified offline: all 12 `Object.prototype` names get the fallback on every read and save path, both pages render, and no real title's image changes. Production stays exposed until a user-typed deploy of a `main` containing `1a57cfa` |
| SEC-MED-8 — status update, 2026-10-06 (Wave 2a CSO entry) | **T-018** | ✅ **Closed in code, pending merge.** All 22 raw-message sites, plus create's new position read, return one of four fixed messages from `src/lib/action-errors.ts`, and no `.message` is read in the three action files. The raw error is logged on the server under a fixed label. Bound to the Wave 2a sha256s; production stays exposed until a user-typed deploy |
| SEC-MED-7 / SEC-MED-13 — status update, 2026-10-06 (Wave 2a CSO entry) | **T-014** | ✅ **Closed in code, pending merge, for the product and category write paths they name.** `isAllowedImageUrl` (a root path, or `https:` with a host and no userinfo; no backslash, whitespace or control character) runs on create, on update when an image is sent, and on every category save, before any read. The refusal shows in the ordinary admin. The other URL fields were never in scope: see SEC-INFO-44 |
| SEC-MED-11 — status update, 2026-10-06 (Wave 2a CSO entry) | **T-014** | ✅ **Closed in code, pending merge.** Create never reads a caller's `sort_order`. It uses the server-read max + 1, and inserts nothing if that read fails |
| SEC-INFO-15 — status update, 2026-10-06 (Wave 2a CSO entry) | **T-014** | ✅ **Closed in code, pending merge.** A name over 255 code points is refused before any read, on create and update, and is never cut |
| SEC-INFO-16 — status note, 2026-10-06 (Wave 2a CSO entry) | **T-013** (Wave 2b) | Open. Not part of Wave 2a; Wave 2b's own `/security-review` takes it |
| QA T-016 I1 — status update, 2026-10-06 (Wave 2a CSO entry) | **T-018** | ✅ **Closed in code, pending merge.** A malformed argument to a product write returns fixed copy, with no throw and no query |
| SEC-MED-16 — the non-product writes don't check argument shapes. `updateSettings` stores a non-object value for an allowed key (the public section falls back to the defaults, and that key's saved content is overwritten); the six form writes and `uploadFile` throw a `TypeError` on an argument that isn't `FormData` (nothing written, the message redacted in production); `uploadFile`'s bucket is caller-chosen | **T-039** (new); the bucket goes to **T-019** | Open — doesn't block Wave 2a or deploy. Signed-in only (R1): signed out, every write answers SESSION_EXPIRED first. Pre-existing |
| SEC-INFO-42 — `isAllowedImageUrl` accepts Unicode format characters (`Cf`: U+200B, U+202E, U+2066–2069, …) | The next pass that opens `site-content.ts` (add `\p{Cf}`) | Open — informational. Display-only spoofing in the admin path box; no scheme or origin bypass (fuzzed) |
| SEC-INFO-43 — `isAllowedImageUrl` accepts `https:host` without `//`, which a browser on this site resolves as a same-origin path | Same | Open — informational. It fails toward the same origin (a broken image), never toward a new one |
| SEC-INFO-44 — the other admin URL fields (leaders' `photo_url`, the settings images, reports' `file_url`) still accept any string | **T-039** (recommended) | Open — informational, pre-existing. Out of Wave 2a's scope by contract (premortem MUST-ADD 1) |
| SEC-INFO-42 — status update, 2026-10-06 (Wave 2a re-bind, `732c67e`) | **T-014** | ✅ **Closed in code, pending merge.** The forbidden class is now `\p{C}` plus `Default_Ignorable_Code_Point`. All 23 invisible code points tried are refused, in every position tried |
| SEC-INFO-43 — status update, 2026-10-06 (Wave 2a re-bind, `732c67e`) | **T-014** | ✅ **Closed in code, pending merge.** An absolute address must start with a literal `https://`. On 300,000 fuzzed shapes, the rule's parse equals what a browser on this site loads |
| SEC-INFO-16 — status update, 2026-10-06 (Wave 2b CSO entry) | **T-013** (`48fc3d7`) | 🟢 **Narrowed in code, pending merge; open only as the contract's accepted residual.** Put-backs now undo a failed write (REORDER_FAILED or REORDER_STALE). A mixed order is left only if a write and its put-back both fail, and then REORDER_PARTIAL says so. All-or-nothing needs a database function, which waits for the owner. Bound to `products-actions.ts` sha256 `7e8a1069…` |
| SEC-INFO-45 — two more edges of the same non-atomic reorder: (a) a write that commits but whose reply is lost is answered REORDER_FAILED ("nothing changed"), though that row moved, because only confirmed rows are put back; (b) two reorders of one category at once can interleave, with no compare-and-swap on `sort_order`, so the order can end mixed while both tabs report it saved | The owner's database-function follow-up, with SEC-INFO-16. Optional without one: also put back the failing row after an error, and add `.eq("sort_order", from)` to writes and `.eq("sort_order", to)` to put-backs (an item 9 change, back to `/cso`) | Open — informational. One category's display order only, signed-in only (R1), with no cross-category write and no row created. It self-heals at the next successful reorder. (b) predates Wave 2b |
| Wave 2a carry-over: the unbounded `orderedIds` loop — status update, 2026-10-06 (Wave 2b CSO entry) | **T-013** | ✅ **Closed in code, pending merge.** Writes are capped at the category's stored row count. A 1,000,000-entry list is refused by the length check, with no write |
| SEC-MED-1 — status update, 2026-10-06 (Wave 3a CSO entry) | **T-007** (`a42ddcb`) | ✅ **Closed in code, pending merge.** `uploadOptimizedImage` reads width and height from the JPEG or WebP header (no decoding, no dependency). It refuses an unreadable file, and a longest edge over 2400 px, before the Storage write, in the browser's exact words. Residuals accepted by the contract: no pixel-area limit, EXIF orientation isn't applied (C8), and the Media Center path still has no dimension check (Known Trap #9) |
| SEC-MED-9 — status update, 2026-10-06 (Wave 3a CSO entry) | **T-019** (`fb34d7d`) | ✅ **Closed in code, pending merge.** Both actions return `MediaActionResult`. Client wrappers show every failure that leaves the item listed, a throw included, in a `role="alert"`. The delete's error is checked and logged. A clean-up failure after the item is gone is logged only, per the contract |
| SEC-MED-10 — status update, 2026-10-06 (Wave 3a CSO entry) | **T-019** | ✅ **12 of 12 closed in code, pending merge.** `addMediaAction` and `deleteMediaAction` check the session first, and make no table or Storage call when signed out |
| SEC-INFO-46 — `isAllowedImageUrl` admits `"`, `'`, `<`, `>`, `(` and `)` in an `https://` address. No sink today: renders are React-escaped attributes only, and the one `dangerouslySetInnerHTML` is a static style | Not filed — hardening note | Open (info). Revisit if a CSS `url()` or raw-HTML sink for image addresses is added |
| SEC-INFO-47 — the Media Center's Storage clean-up sees saved references only. An address in an unsaved draft, or saved during the gap between the checks and the removal, can lose its file | Not filed — accepted residual | Open (info). It needs concurrent signed-in staff, and it's recoverable by re-uploading |
| O1 — the live DELETE policies on `media_assets` and on Storage have never been exercised by an agent (Wave 3a CSO entry) | Owner row **O1** | Open, not a merge condition. Recommended right after the deploy, on a ZZ-TEST photo. MEDIA_DELETE_REFUSED means an owner SQL step (HARD STOP) |
| SEC-INFO-48 — T-030 (Wave 4 contract item 20) puts `navItems`, the 12 admin paths and their labels, in the public AdminNav client chunk (`08ttrkoaxemcr.js` at `edff562`; the name changes with each build). `_next/static` is outside the middleware matcher (Wave 4d CSO entry) | No ticket; accepted | Open (info). Route names only, with no data, action id or key, and every path stays gated. Guardrail: nothing secret, user-specific or role-specific in `AdminNav`/`navItems`, and no admin path that relies on being unlisted |
| SEC-MED-2 — status update, 2026-10-08 (Wave 5a CSO entry) | **T-008** (`b4c01e8`) | ✅ **Closed in code, pending merge; it closes in production only when PM13 passes.** One `/:path*` rule sends the six byte-exact static values, and `X-Powered-By` is off. PM12 is recorded: the CSP ships enforcing, and the fallback is not invoked. Verified on :3101 for 10 of 12 PM3 responses; the two `redirects()` 308s are ruled N/A (SEC-INFO-49). Bound to `next.config.ts` sha256 `d1af850c…`. **Production is still exposed** until a user-typed deploy. If Vercel's own HSTS line wins or doubles there, SEC-MED-2 stays open and a follow-up is filed, with no rollback (PM13) |
| SEC-INFO-49 — under `next start`, Next 16.3.6 drops `headers()` on a matched `redirects()` route (`resolve-routes.js:524-541` returns `resHeaders: null`), so `/reports`, `/what-we-do/:slug` and the three rename 308s carry none of the six headers (Wave 5a CSO entry) | No ticket; accepted | Open (info). A browser loses nothing: each header's effect comes from the same-origin destination or the per-host HSTS pin, or doesn't apply to a redirect. PM13 records what Vercel sends. Revisit if a `redirects()` destination stops being a same-origin relative path, or if Next starts applying headers to redirects |
| SEC-HIGH-2 — status update, 2026-10-11 (deploy record) | Owner action: review Authentication → Users after 2026-10-11T10:47:01Z, and handle any unrecognized account under runbook §7 item 6. Structural fix: **T-023** | **Mitigated, still open (🟠).** `disable_signup: true` was read twice (10:47:01Z and 10:59:46Z), with the email provider on. The second closure condition, the owner's Users review, isn't recorded anywhere. An account made while sign-ups were open keeps full admin rights (R1). Record the review before the next deploy, and record `external.anonymous_users` on the next settings read |
| SEC-HIGH-2 structural fix (T-023) and R1 — status, 2026-10-11 (deploy record) | **T-023**, the admin allowlist (LAW, `/debate`, hand-applied SQL) | Open, unchanged. Any signed-in account is still an admin. Sign-ups OFF limits who can get an account, not what an account can do, and one dashboard toggle reopens it. SEC-INFO-32's guardrail stands while T-023 is open |
| SEC-HIGH-1 — status update, 2026-10-11 (deploy record) | **T-006**, now live | ✅ **Closed in production.** Production runs `next` 16.3.6, up from 16.1.6 at `e8eace1`. The deployed lockfile is T-006's `6a026457…` (re-hashed at `main`). The 16.3.8 advisories are a new finding (SEC-MED-17), not a reopening |
| SEC-MED-2 — status update, 2026-10-11 (deploy record) | **T-008**, now live | ✅ **Closed in production; PM13 passed.** On both `www` hosts, `/` and `/admin/login` send the six headers exactly once, HSTS is exactly `max-age=63072000; includeSubDomains`, and there's no `x-powered-by`. Both bare domains redirect to `www` with none of our headers, so the bare-domain STOP holds |
| SEC-INFO-49 — status update, 2026-10-11 (deploy record) | No ticket | Doesn't arise in production: on Vercel, the eight `/what-we-do/<slug>` 308s carry all six headers. It stays an accepted note for `next start` only, under 5a's "holds while" conditions |
| SEC-MED-15 / SEC-INFO-19 — status update, 2026-10-11 (deploy record) | T-025, T-026 and T-033's cut, now live | ✅ **Closed in production.** The deployed tree has `nav.ts` `507e5c62…` and `site-content.ts` `9939d4f3…`. Live, the sitemap has 18 entries and 0 `<lastmod>`, and an unknown category returns 404. No post-5a change touches a slug, `href` or `categoryPath` expression |
| SEC-HIGH-5 / SEC-MED-8 / SEC-MED-1 / SEC-MED-9 / SEC-MED-10 — status update, 2026-10-11 (deploy record) | T-015, T-018, T-007 and T-019, now live | ✅ **Closed in production,** by tree identity: every bound action, lib and media file re-hashes equal at `main`. Not exercised live, by the no-writes rule. Wave 3a's O1 (one ZZ-TEST publish-and-delete, by the owner) is now due |
| T-013 items (the `orderedIds` cap; SEC-INFO-16 narrowed) — status update, 2026-10-11 (deploy record) | T-013, now live | ✅ The cap is closed in production (`products-actions.ts` `7e8a1069…`). SEC-INFO-16 and SEC-INFO-45 stay open only as their accepted residual, waiting on the owner's database function |
| Every "closed in code, pending merge" row — status update, 2026-10-11 (deploy record) | T-016 and Waves 1 to 5a, now live | ✅ **Closed in production:** SEC-MED-7/13, SEC-MED-11, SEC-INFO-15, SEC-INFO-20, SEC-INFO-36, SEC-INFO-37, SEC-INFO-41, SEC-INFO-42, SEC-INFO-43 and QA T-016 I1. Live, `/products` and its 8 category pages return 200, with 0 UUIDs in their HTML (SEC-INFO-36) |
| SEC-MED-17 — `next` 16.3.6 is in range of six advisories fixed in 16.3.8: GHSA-cjq9-62q9-8jv4 (high, SSRF in Image Optimization), GHSA-mcj8-r9mp-w47p, GHSA-4jqv-mc3x-m676, GHSA-3w37-wq28-93x7, GHSA-f87g-xv8r-7p7x and GHSA-39w2-rjm5-chcv. None is reachable with today's config (2026-10-11 deploy record, item 6) | **T-044** (filed): bump to 16.3.8, raise the range from `^16.1.6` to `^16.3.8`, run `npm audit fix` on the tooling, then `/security-review` | Open, 🟡; doesn't block. Until T-044 is live, nothing may merge that adds `images.remotePatterns` or `domains`, a catch-all route, `use cache`, `draftMode` or a generated icon. Run `next dev` on loopback (`-H 127.0.0.1`), because it's wired to the live database |
| SEC-INFO-30 / SEC-INFO-31 — status update, 2026-10-11 (deploy record) | Folded into **T-044** | Open until T-044. `package.json` still reads `"next": "^16.1.6"`, so only the lockfile holds the floor. Once T-044 is live, runbook §7 item 7's floor becomes 16.3.8 |
| SEC-INFO-50 — `.claude/stack.json` `secretPatterns` has no value shape for this stack's own keys: a Supabase JWT, `sb_secret_…` or `sb_publishable_…`. So each wave's "0 hits on the 10 patterns" couldn't have caught a pasted Supabase key (2026-10-11 deploy record, item 7) | Not filed. Recommend a small tooling ticket: add the three shapes to `secretPatterns` and the hooks that read them | Open (info). This pass scanned the public history and every local ref for them: 0 hits |
| SEC-MED-14 — status update, 2026-10-11 (deploy record) | Owner action: rotate the token | Open. Count-only check: `.git/config` still has 1 remote URL with embedded credentials and 6 `credential.*` entries. A token that can push to the branch Vercel builds from is a production-deploy credential |
| O1 rows — status, 2026-10-11 (deploy record) | Owner rows | Now due on production. Wave 3a's O1 is one ZZ-TEST publish-and-delete; MEDIA_DELETE_REFUSED there is an owner SQL step (runbook §7 item 15). 5a's O1 is the owner's next sign-in and sign-out; if that fails, the response is PM14's revert-and-ship to both remotes, never Instant Rollback to `e8eace1` |

## 6. Secrets log

| Secret (name only) | Last rotated | Owner |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Not tracked before this bootstrap — unknown | Client (Supabase dashboard) |
| `NEXT_PUBLIC_SUPABASE_URL` | N/A — not a rotatable secret, project identifier | Client |
| `CRON_SECRET` | Not tracked before this bootstrap — unknown; may be unset (optional per `docs/TECH_STACK.md`) | Client (Vercel env) |
| GitHub PAT for `happierbangladesh`: inline `credential.helper` plus credentials embedded in a remote URL, in local `.git/config`. Untracked, and its value is never copied into any doc | Unknown, not tracked. Still present on 2026-09-28 (count-only check) | User (`happierbangladesh` GitHub account). See SEC-MED-14 |

No committed secret was found this pass (see Secrets hygiene above). Nothing here required rotation.

2026-09-28 (T-006 review): added the row for the local `.git/config` PAT (SEC-MED-14). It isn't committed, so the Refuse-If on committed secrets doesn't apply. Recommend rotating it and moving it to a keychain-backed credential helper; record the date here when done.

2026-10-11 (deploy record): a count-only check found the PAT still in local `.git/config`, with 1 remote URL holding embedded credentials and 6 `credential.*` entries, so it hasn't been rotated (SEC-MED-14). The public history and every local ref have 0 hits for Supabase JWT, `sb_secret_`, `sb_publishable_`, GitHub, AWS, Google, Slack, Stripe live, Postgres-password-URL and PEM private-key shapes. The only env-like file ever committed is `.env.example`. Nothing found needs rotating beyond SEC-MED-14's token.

## 7. Incident response runbook

1. **Suspected admin credential compromise.** No agent holds admin credentials — the client rotates the Supabase Auth password directly in the Supabase dashboard immediately. `/cso audit` (next invocation) reviews `submissions`/`media_assets`/`site_settings`/`reports`/`leaders` for writes since the last known-good state. Rotating `NEXT_PUBLIC_SUPABASE_ANON_KEY` is **not** the correct response to a compromised admin session (the anon key is meant to be public; RLS is the actual gate) — only rotate it if RLS itself is suspected bypassed.
2. **Active exploitation of a known dependency CVE (e.g. SEC-HIGH-1).** `/devops` pulls Vercel request logs for the affected route pattern. `/architect` + `/lead-dev` fast-track the patched version out of normal sprint order — do not wait for a scheduled slot. `/cso review` re-checks before that fix redeploys.
3. **Storage bucket abuse** (unfamiliar files appearing via the pre-existing unvalidated `addMediaAction`/`uploadFile` paths). Client reviews `/admin/media` and the Supabase Storage `media` bucket by hand; remove via `deleteMediaAction`. Volume/pattern suggesting automation rather than a human admin acting oddly → treat as path 1 (credential compromise), not as a code bug.
4. **Forms spam/abuse flood** (`submissions` table). Anon `SELECT` is already denied by RLS (per `docs/MEMORY_BANK.md` §5) — a flood is a cost/noise problem, not a data-exposure one. No evidence of active abuse found this pass; if volume becomes a real problem, file a ticket for a Supabase-side rate-limit or a CAPTCHA (e.g. Turnstile) on the three form actions.
5. **A secret is found committed in git history.** Rotate the credential at its provider (Supabase dashboard, GitHub token settings, etc.) **first**. Only scrub git history after rotation — a scrub before rotation just hides an already-compromised secret. Log the rotation date in §6 immediately after. Never write the secret's *value* into any file in this repo, including this one.
6. **An unexpected `authenticated`-role identity is discovered (SEC-HIGH-2, 2026-09-27).** If the Supabase Dashboard signup toggle is found enabled: disable it immediately (zero code/deploy required) — this stops new self-registration; existing sessions/tokens already issued remain valid until they expire or are revoked, so also check Authentication → Users for any account the client doesn't recognize and delete it there. Then audit every `authenticated`-ALL table (`jobs`, `products`, and per Known Trap #12 almost certainly `submissions`/`media_assets`/`site_settings`/`reports`/`leaders`) for rows created/edited/deleted since that account's creation timestamp. Distinct from runbook item 1 (compromise of the client's *own* known admin credential) — here the concern is an *additional, unknown* identity that was never supposed to be able to authenticate at all.
7. **`next` falls below the `16.3.6` floor (SEC-INFO-30, 2026-09-28).** If `npm ls next` on `main`, or on any branch about to merge, shows anything below `16.3.6`, treat SEC-HIGH-1 as reopened.
   - **Likely cause:** a bad `package-lock.json` merge. `npm audit` alone won't catch it while `GHSA-vcvr-r3jv-pc5j` is missing from the advisory feed.
   - **Response:**
     1. Restore T-006's lockfile (`git checkout <T-006 merge commit> -- package-lock.json`), then re-apply the other ticket's intended lockfile changes on top.
     2. Re-run `npm ls next` and `npm audit --omit=dev`.
     3. Hold any deploy until both are clean.
8. **Unfamiliar objects in any storage bucket (SEC-INFO-33, 2026-09-28).** `uploadFile` lets an authenticated caller choose the bucket, the object name and the content type, so item 3's check of `media` alone isn't enough.
   - **Where to look:** every bucket in the Storage dashboard, `reports` above all. Objects from legitimate `uploadFile` use are normally named `<13-digit ms timestamp>_<base36>.pdf` and hold PDFs. Flag anything else, especially `text/html` or `image/svg+xml` content, or names outside that pattern.
   - **Response:**
     1. Note each object's created-at time, then delete it.
     2. Treat the incident as item 6 (an unknown identity) or item 1 (a known admin's session compromised). Once T-015 is deployed, an anonymous caller can't reach `uploadFile`.
9. **Unexpected markup in `/sitemap.xml`, or a category URL that isn't `/products/<a-z0-9->` (SEC-MED-15, 2026-10-03).** No app write path can store such a slug, so it was planted. Treat it as item 6 (an unknown identity) or item 1 (a known admin's credential compromised), never as a content-editing slip.
   - **Where to look:** `site_settings`, key `business`, at each `value.products[].slug`. Anything outside `^[a-z0-9]+(-[a-z0-9]+)*$` is planted.
   - **Response:**
     1. The owner fixes the slug in the Supabase SQL editor, per the hand-applied-SQL rule.
     2. Supabase session cookies here are readable by script. So if an admin may have opened the sitemap since the slug was planted, treat that admin's session as stolen: rotate their password and revoke their sessions.
     3. Review Authentication → Users.
10. **Every category or What We Do save fails with "Another save changed these settings…" (SAVE_CONFLICT), or with a row-level-security error (SEC-INFO-38, 2026-10-04).**
   - **Where to look:** the server log line `writeBusinessFields: the compare-and-swap changed 0 rows`.
     - If `currentStamp` equals `readStamp`, no other save happened: a policy, trigger or rule on `site_settings` blocked the row.
     - If they differ, a real concurrent save got there first. Click Save again.
   - **Response:**
     1. Never widen a `site_settings` policy by hand, and never switch the writer to upsert.
     2. Rerun the owner's read-only SQL check, and compare it with the 8 items in the T-026 entry.
     3. Any fix is a reviewed migration, with `/cso review`.
11. **Every product add, edit or reorder fails with "the category couldn't be checked" (CATEGORY_CHECK_FAILED, Wave 1, 2026-10-06).** The category check now refuses a write whenever it can't read `site_settings.business`.
   - **Where to look:** the server log lines `readSettingsForEditor("business"): the read failed.`, `…: the read threw.` and `…: the stored value is not an object.`
     - **A failed or thrown read** is a network, session or policy problem on `site_settings`.
     - **"Not an object"** means the row was edited directly, because no app path writes that shape. Treat it as item 6 (an unknown identity) or item 1 (a known admin's credential compromised).
   - **Response:**
     1. Never bypass the check, and never point it back at `getSettings`, whose fallback to the code defaults is what this replaced.
     2. Never widen a `site_settings` policy by hand. Rerun the owner's read-only SQL check and compare it with the 8 items in the T-026 entry.
     3. If the value isn't an object, the owner fixes it in the Supabase SQL editor, per the hand-applied-SQL rule.
12. **Staff see "Something went wrong, so nothing was saved / deleted…", "…the saved data couldn't be read…" or "The file couldn't be uploaded…" (T-018, Wave 2a, 2026-10-06).** Every database or storage failure in the three action files now shows one of these four fixed messages.
   - **Where to look:** the server log line that starts with the action's fixed label, for example `createJob: the insert failed.` or `createCategoryProduct: the position read failed.`. It carries the raw error object: `code`, `message`, `details` and `hint`.
     - **`42501` or "row-level security"** is a policy denial. Treat it like item 11's policy case, and never widen a policy by hand.
     - **`23xxx`** is a constraint. The `details` may echo the row.
     - **A network or `fetch` error** is transient.
   - **Response:** never put the raw text back into a result, because SEC-MED-8 would reopen. If a message needs to say more, add a hand-written, fixed message for that case through `/cso review`.
13. **Every category save is refused with "…has an image path that can't be used, so nothing was saved…" (T-014, Wave 2a, 2026-10-06; wording since `732c67e`).** This is the premortem's top failure mode: a refused image locks the first Save, so the category ids never appear.
   - **Where to look:** the category the message names. Its image address is neither a root path nor an address starting with `https://` with no username or password. Or it contains a space, a backslash, or an invisible or control character.
   - **Response:**
     1. Have staff upload that image again, which returns an `https://` Storage address, or paste its full `https://` address. Then save.
     2. Never widen the rule, add a host allow-list, or skip the check. Each is a contract re-review trigger.
     3. If staff report it on images that look valid, read the live category images back read-only and compare them with the 8 URLs in the Wave 2a entry, as a Wave 2 incident.
14. **Staff see "The products in this category changed since the page loaded…", "The new order couldn't be saved, so nothing changed…" or "The new order was only partly saved…" when they move a product (T-013, Wave 2b, 2026-10-06).**
     1. The first means the list on screen no longer matches the stored rows: another tab added, deleted or moved a product. Reload and redo the move. If it repeats on a fresh page with no other tab open, read the category's rows back read-only and compare their ids with the page, as a Wave 2 incident.
     2. The second and third come with a server log line labelled `reorderCategoryProducts: …`. Read the logged error. After the third, reload: the category may show a mixed order until the next successful reorder (SEC-INFO-16's accepted residual).
     3. None of the three can move a product between categories or create one. A product appearing or vanishing on a reorder is a security incident, not this item.
15. **Staff see "This item couldn't be deleted, because the database refused the change…" when they delete a Media Center item (T-019, Wave 3a, 2026-10-06).**
    - **Meaning:** the live `media_assets` table has no DELETE policy for signed-in accounts, so RLS answered 0 rows. Nothing was deleted, and no file was touched. Not a breach.
    - **Response:** an owner SQL step adds the policy (a HARD STOP, through `db/migrations/`). Then retry.
16. **A category, facility, product or leader photo shows as broken after a gallery delete (T-019).**
    - **Meaning:** this shouldn't happen, because the clean-up keeps any file that any saved address mentions. The likeliest cause is an address that was in an unsaved draft, or saved at the same moment (SEC-INFO-47). Otherwise treat it as a defect, and stop gallery deletes.
    - **Response:** re-upload the photo where it broke, and check the server log for `deleteMediaAction:` lines. Storage has no undo.
17. **Staff see "That image's width and height couldn't be read…" on an ordinary photo (T-007).**
    - **Meaning:** the server's header reader refused the file, failing closed. Not a security event.
    - **Response:** export it again as WebP or JPG and upload that. If many photos are refused, report it as a T-007 defect, with a sample file.
