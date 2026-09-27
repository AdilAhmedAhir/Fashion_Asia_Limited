# ROADMAP.md

Owner: `/pm`. Last updated: 2026-09-27.

Status: first `/pm` pass on this repo. No prior `ROADMAP.md` entries exist to amend. `docs/QA_REPORT.md` and `docs/SECURITY.md` do not exist yet, so there are no open 🔴/🟡 or SEC-CRIT/SEC-HIGH findings to convert ahead of feature work. `docs/MARKETING.md` does not exist, WORKFLOW §10 is inert, and no marketing-originated drafts (`SEO_REPORT.md`, `CRO_PLAN.md`, `ANALYTICS_SPEC.md`, `GROWTH_PLAN.md`, `docs/copy/`) exist to ticket this pass. `docs/DECISIONS.md` has no open Counters. Scope is exactly the three MVP features in `docs/VISION.md`; nothing from its Cut / Anti-Goals list is ticketed here — including the homepage "Business Preview" strip, which `VISION.md`'s Scope Ruling explicitly keeps as-is for this sprint.

**Second pass — 2026-09-27, dispatched by `/system-architect` mid-sprint (amend, not replace).** T-001 and T-002 are now `[x]`, merged into local `main` (not deployed — nothing pushed to `origin`/`client`). `docs/QA_REPORT.md` and `docs/SECURITY.md` now exist and were both read in full this pass. Their findings against T-001/T-002 are handled two ways, per each reviewer's own recommendation: `/cso`'s SEC-MED-3/SEC-MED-4 and `/qa`'s T-001 WARN-1/WARN-2/WARN-3 are folded directly into T-003's and T-005's existing **Acceptance** lists below as new bullets (nothing already there is removed or reworded) rather than spawned as parallel tickets; `/cso`'s SEC-HIGH-1 (Next.js CVE range; fix = lockfile bump to `16.3.6`) becomes **T-006** and blocks the next `deploy`. `/cso`'s SEC-HIGH-2 (a Supabase Dashboard "allow new signups" toggle) is **not** a ticket — `docs/SECURITY.md` §5 itself calls it "user action, not a code ticket" — but it also blocks the next `deploy`, pending the user's own confirmation. `/cso`'s SEC-MED-1/SEC-MED-2 become standalone follow-ups **T-007**/**T-008**. `/qa`'s T-002 WARN-1–WARN-4 become follow-up tickets **T-009** (WARN-1/2/3 — `ImageUploadField` advisory/error-state hardening) and **T-010** (WARN-4 — stale state leaking across a reordered/deleted `ObjectListEditor` row). A `/ui-ux` finding relayed by the orchestrator (not written to a doc — cited as "ui-ux T-002 pass, 2026-09-26") becomes **T-011** (contrast + keyboard-focus fixes on the same two shared admin components). None of T-006–T-011 blocks T-003, T-004, T-005, or displaces this sprint's stated goal (the client feature) — see the rewritten Dependency Order at the bottom.

## 📊 PM Sprint Plan — 2026-09-26
### Sprint 1: Ship the three MVP features from VISION.md — category detail pages, products-within-category admin management, and the image-size warning

- [ ] **T-004** — Add products-within-category management to `/admin/business`
  - **Source:** direct — `docs/VISION.md` MVP Feature 2 (admin UI half)
  - **Files:** `src/app/admin/(dashboard)/business/BusinessClient.tsx`, `src/app/admin/(dashboard)/business/page.tsx`, a new nested list-editor component under `src/components/admin/` (exact name at `/lead-dev`'s discretion — the existing `ObjectListEditor` in `src/components/admin/SettingsForm.tsx` is flat-only and doesn't support a nested per-category product list), `src/components/admin/ImageUploadField.tsx` (reused, not modified further beyond T-002)
  - **Flags:** schema-touching: **no** (built on T-001/T-003) · sensitive: **yes** (`src/app/admin/**`, writes) · UI: **yes**
  - **Acceptance:**
    - From `/admin/business`, staff can add a product to a selected category, entering exactly image, name, and description — no "type" or other field.
    - Product images uploaded here go through the existing validated path (`ImageUploadField` → `uploadOptimizedImage`) only — never a new upload control, never `addMediaAction` or the unvalidated `uploadFile` action (`docs/MEMORY_BANK.md` Known Trap #9).
    - Staff can edit a product's name/description/image, delete a product, and reorder products within a category, using T-003's actions.
    - Staff adds a product to "Sportswear" in `/admin`; it appears on the public Sportswear category page (T-005) without developer involvement (VISION Feature 2's stated acceptance test).
    - Attempting to delete a category that still has ≥1 product shows T-003's "remove its products first" message in the admin UI itself — not a silent failure, not a generic error.
    - No admin route path or `site_settings` key is renamed.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/ui-ux` → `/qa static` → `/qa live` (manual checklist — `/admin` requires the client's own credentials, which no agent holds; `/qa` hands the user a checklist per `WORKFLOW.md` §4/§7) → `/git Merge`
  - **Notes:** Depends on T-001 (SQL applied) and T-003 (actions). If the nested-editor UI turns out to be bigger than one PR, split via a follow-up `/pm` ticket rather than force-fitting it here.

- [ ] **T-005** — Ship public category detail pages under `/what-we-do`, linked and indexed
  - **Source:** direct — `docs/VISION.md` MVP Feature 1
  - **Files:** new dynamic route `src/app/(website)/(marketing)/what-we-do/[category]/page.tsx` (exact segment name follows T-001's identifier scheme), `src/app/(website)/(marketing)/what-we-do/page.tsx` (wrap each category card in a link to its detail page), `src/app/sitemap.ts` (generate one entry per category from the live category list, not a hardcoded literal)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes**
  - **Acceptance:**
    - Every category card on `/what-we-do` — 8 today, any count later — is a real link to its own page under `/what-we-do/<id-or-slug>`; no card is a dead click.
    - Each category page renders only that category's own products (image, name, description) in the site's existing photo-card style (same visual language as the current `/what-we-do` product grid).
    - A category with zero products shows an honest "coming soon" empty state — never a 404, never an invented placeholder product.
    - Each category page has its own `metadata` (title, description, self-referencing canonical, OpenGraph) following the pattern already used on `/what-we-do` — not inherited from the homepage.
    - `src/app/sitemap.ts` includes an entry for every category page, generated from the live category list, so adding/removing a category in `/admin` changes the sitemap without a code change.
    - Product/category edits made through T-003's actions are visible on the corresponding category page without a redeploy (confirms T-003's `revalidatePath` targets resolve end-to-end).
    - The URL sits under the existing "What We Do" menu path (`/what-we-do/…`), matching the site's menu-name URL convention (`docs/MEMORY_BANK.md` Known Trap #6) — no new top-level route.
    - **(Folded in 2026-09-27, per `/cso` recommendation, not a separate ticket)** `category.slug` is treated as untrusted when constructing `revalidatePath` targets and `src/app/sitemap.ts` entries, even after T-003 ships — both because legacy rows could predate T-003's stricter save-time guard, and because `normalizeProducts()`'s own read-time fallback imposes no format constraint on a stored value it accepts. Concretely: the dynamic route matches the incoming URL param against the *normalized* `slug` via exact string equality only, never using the raw param or a raw stored value as a path-construction input; sitemap/canonical/OpenGraph entries use Next.js's typed `MetadataRoute.Sitemap` / `Metadata` return shapes (which Next.js itself serializes/escapes) rather than hand-built XML/HTML strings (`docs/SECURITY.md` SEC-MED-4, T-005 half, 2026-09-27).
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge`
  - **Notes:** Depends on T-001 (identifier scheme) and T-003 (read function + revalidation). Per `WORKFLOW.md` §5's hard stop, not `/qa live`-verified or merged until T-001's SQL is confirmed applied. **Update, 2026-09-27:** T-001's SQL-applied confirmation has landed; T-005 remains correctly blocked on T-003 itself (not yet built), independent of that hard stop.

## 📊 PM Sprint Plan — 2026-09-27
### Sprint 2: Close `/cso` + `/qa` fast-follow findings from T-001/T-002 without displacing the client feature (T-003 → T-005) as the sprint's primary thread

- [ ] **T-006** — Bump `next` to close SEC-HIGH-1 (Server Actions CSRF bypass + rolled-up CVE range)
  - **Source:** `docs/SECURITY.md` SEC-HIGH-1, 2026-09-26 (reconfirmed still open in the 2026-09-27 T-001 CSO entry: "SEC-HIGH-1 ... remains open and unresolved")
  - **Files:** `package.json`, `package-lock.json`
  - **Flags:** schema-touching: **no** · sensitive: **yes** (framework version underpinning every Server Action mutation in the app) · UI: **no**
  - **Acceptance:**
    - `next` resolves to `16.3.6` or later — still satisfying the existing `package.json` range `^16.1.6` (a lockfile-only bump, not a semver-range or major-version change).
    - `npm audit --omit=dev` no longer reports the `next` advisory range (`9.3.4-canary.0 - 16.3.2`, installed `16.1.6`) as present, including the directly-reachable null-origin Server Actions CSRF bypass (`GHSA-mq59-m269-xvcx`).
    - No dependency other than `next` and its own transitive tree (e.g. `sharp`, expected to clear as a side effect per `docs/SECURITY.md`'s own note) is bumped as a separate, unrelated change.
    - `npx tsc --noEmit` and `npm run build` both stay clean after the bump.
    - `/cso review` re-runs `npm audit --omit=dev` and confirms the SEC-HIGH-1 advisory is gone before this ticket is treated as closing that finding.
  - **Sequence:** `/git Start` → `/architect` (confirm the version target; flag any 16.1.6→16.3.6 breaking changes) → `/lead-dev` → `/qa static` → `/qa live` → `/cso review` → `/git Merge` (order per `docs/SECURITY.md` SEC-HIGH-1's own prescribed sequence)
  - **Notes:** Blocks the next `deploy` (push to `origin`/`client`) per `docs/SECURITY.md` §5 and `docs/WORKFLOW.md` §6 — does **not** block any local `/git Merge`, including this sprint's. Independent of T-003/T-004/T-005; can run in parallel with the feature chain at any point before the next `deploy`. `docs/SECURITY.md` SEC-HIGH-2 (Supabase Dashboard "allow new user signups" toggle) also blocks the next deploy but is explicitly **not** a ticket — it's a Dashboard setting only the user can check (`docs/SECURITY.md` §5: "User action, not a code ticket — no `/pm` ticket needed").

- [ ] **T-007** — Add a server-side pixel-dimension re-check to `uploadOptimizedImage`
  - **Source:** `docs/SECURITY.md` SEC-MED-1, 2026-09-26
  - **Files:** `src/lib/upload-limits.ts` (header-based width/height reader for the already-sniffed WebP/JPEG bytes), `src/app/actions/media-actions.ts` (`uploadOptimizedImage` — call the new check, reject before the storage write)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (server action, upload path) · UI: **no**
  - **Acceptance:**
    - `uploadOptimizedImage` rejects a file whose longest edge exceeds `MAX_UPLOAD_DIMENSION` (2400px) even when the request bypasses `ImageUploadField`'s browser check entirely (e.g. a direct authenticated `fetch`/`curl` call with a valid session cookie) — closing the gap SEC-MED-1 names ("measured in the browser only; the server cannot cheaply read dimensions").
    - Dimensions are parsed from the WebP (`VP8`/`VP8L`/`VP8X` chunk) or JPEG (`SOF0`/`SOF2` marker) header bytes already read by `sniffImageFormat` — no new image-processing dependency, no re-encoding (matches `docs/VISION.md`'s anti-goal against server-side re-encoding — this is a header read, not a decode/re-encode).
    - A file that already clears today's server-side checks (format sniff, byte size) and is within 2400px on both axes still uploads successfully — no regression for legitimate uploads.
    - T-002's client-side advisory/hard-block UX is unchanged by this ticket — this is a second, authoritative check added only at the server action.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` (read-only) → `/git Merge`
  - **Notes:** Independent of T-003/T-004/T-005. Does not block `deploy` — 🟡 Medium, non-blocking per `docs/SECURITY.md` §5.

- [ ] **T-008** — Add sitewide security headers (`next.config.ts`)
  - **Source:** `docs/SECURITY.md` SEC-MED-2, 2026-09-26
  - **Files:** `next.config.ts` (new `headers()` block, `poweredByHeader: false`)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (`/cso`'s own jurisdiction per SEC-MED-2's mitigation note) · UI: **no**
  - **Acceptance:**
    - Every response — public and `/admin/*` — sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a `Permissions-Policy`, clickjacking defense (`X-Frame-Options: DENY` or CSP `frame-ancestors 'none'`), and the existing HSTS gains `includeSubDomains` alongside its current `max-age=63072000`.
    - A Content-Security-Policy is added; given zero prior baseline, ships as `Content-Security-Policy-Report-Only` first unless `/architect` and `/cso` explicitly agree (logged in `docs/SECURITY.md` or `docs/DECISIONS.md`) to go straight to enforcing mode.
    - `poweredByHeader: false` is set, removing the `X-Powered-By: Next.js` header.
    - `/admin/login` specifically is confirmed (via `/qa live` curl headers) to carry the new clickjacking defense — `docs/SECURITY.md` calls this out as the single most notable missing case today.
    - The existing `redirects()` block in `next.config.ts` is untouched.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/architect` (confirm CSP shape: report-only vs. enforcing) → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` → `/git Merge` (order per `docs/SECURITY.md` SEC-MED-2's own mitigation note)
  - **Notes:** Independent of T-003/T-004/T-005. Does not block `deploy` — 🟡 Medium, non-blocking per `docs/SECURITY.md` §5 — but good hygiene to land before the next production push given SEC-HIGH-1/2 are already being addressed this cycle.

- [ ] **T-009** — Harden `ImageUploadField`'s advisory/error state: 0×0 NaN guard, re-entrant upload race, stale warning after manual path edit
  - **Source:** `docs/QA_REPORT.md` T-002 Static Pass WARN-1, WARN-2, WARN-3, 2026-09-26
  - **Files:** `src/lib/upload-limits.ts` (`checkImageSizeAdvisory` — guard the divide-by-zero), `src/components/admin/ImageUploadField.tsx` (`handleFile` re-entrancy guard; the path `<input>`'s `onChange` clears stale `error`/`warning`)
  - **Flags:** schema-touching: **no** · sensitive: **no** (matches T-002's own classification of this file) · UI: **yes**
  - **Acceptance:**
    - WARN-1: `checkImageSizeAdvisory(0, 0)` (or any zero-height input) no longer returns `offProportion: false` from a `NaN` comparison — e.g. short-circuits to `{ tooSmall: true, offProportion: true }` whenever `width <= 0 || height <= 0`.
    - WARN-2: picking a second file while a first file's upload is still in flight no longer lets the earlier request's resolution silently overwrite the later pick's displayed result — via a disabled input/dropzone while `busy`, and/or a monotonic "latest pick" token that causes a stale resolution to be ignored. Both files still separately land in storage exactly as today — only the field's *displayed* final state changes.
    - WARN-3: editing the field's raw path `<input>` by hand clears any stale `error`/`warning` left over from a previous upload attempt on that same field instance.
    - T-002's hard-block behavior (messages, order, trigger conditions) is byte-for-byte unchanged — this ticket only touches the advisory/warning and re-entrancy paths.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/qa static` → `/qa live` → `/git Merge`
  - **Notes:** All three are pre-existing patterns T-002 extended rather than originated (per `/qa`'s own framing) — this is the fast-follow `/qa` recommended, not a re-open of T-002.

- [ ] **T-010** — Stop a reordered/deleted `ObjectListEditor` row from inheriting a sibling's stale upload warning/error
  - **Source:** `docs/QA_REPORT.md` T-002 Static Pass WARN-4, 2026-09-26
  - **Files:** `src/components/admin/SettingsForm.tsx` (`ObjectListEditor`), `src/components/admin/ImageUploadField.tsx` (interim fix — reset local `error`/`warning` when its `value` prop changes for a reason other than its own completed `handleFile` call)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes**
  - **Acceptance:**
    - Repro-then-fix: a warning shown for one product/facility card's image no longer reappears, describing the wrong item, on a *different* row's `ImageUploadField` after that row is moved (up/down) or after a preceding row is deleted.
    - Fix matches `/qa`'s own minimal recommendation: `ImageUploadField` distinguishes an externally-driven `value` change (reorder, delete, a sibling's edit) from its own successful upload's `onChange` call, and clears local `error`/`warning` only for the former.
    - Explicitly deferred, not required by this ticket: rekeying `ObjectListEditor`'s rows by a stable per-item id instead of array index. Categories now carry `.slug` (T-001) but facility-photo items still carry no stable id — a full rekey is separately-scoped and not required to close WARN-4, since the interim fix above closes the actually-observed defect.
    - Verified on both known consumers — `/admin/business` "Product Cards" and `/admin/homepage` "Facility photo" — via `/qa live`'s manual checklist (admin write actions can't be automated per `docs/WORKFLOW.md` §4/§7).
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/qa static` → `/qa live` (manual checklist handed to the user for the reorder/delete repro itself) → `/git Merge`
  - **Notes:** Root cause (index-keyed list rows) predates T-002; T-002 made the consequence more visible by adding a second piece of per-row transient state. Not a hard dependency for T-004 — T-004's per-category product editor is a new, dedicated component per its own file list (this doc, T-004), not necessarily a reuse of `ObjectListEditor` itself — but landing this fix first is recommended if T-004 ends up extending `ObjectListEditor` directly.

- [ ] **T-011** — Fix WCAG AA contrast and keyboard-focus visibility in shared admin upload/list components
  - **Source:** ui-ux T-002 pass, 2026-09-26 (relayed by `/system-architect` — reported directly to `/pm`, not written to a doc)
  - **Files:** `src/components/admin/ImageUploadField.tsx` (label, currently `text-white/30`), `src/components/admin/SettingsForm.tsx` (`ObjectListEditor`'s `#{i+1}` row micro-label and per-field micro-labels, currently `text-white/30`)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes**
  - **Acceptance:**
    - The `ImageUploadField` label and `ObjectListEditor`'s micro-labels meet WCAG AA (≥4.5:1) contrast on the nested dark panel backgrounds they actually render on — matching the fix pattern T-002's own `/ui-ux` pass already applied elsewhere in this same file (`text-white/30` → `text-white/50`, confirmed ~5.3:1 on this component's backgrounds per the code comment at `ImageUploadField.tsx:185-189`) rather than inventing a new ratio.
    - The `<input type="file">` (`sr-only`, keyboard-focusable) gains a visible focus indicator reachable by keyboard Tab — e.g. a `focus-visible` ring rendered on its associated visible label/dropzone, since the input itself is visually hidden and cannot show its own ring.
    - No visual regression for sighted users on a normal-contrast display — layout, copy, and color hue are otherwise unchanged; this is a contrast/focus-visibility fix, not a redesign.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge`
  - **Notes:** Both components are shared across `/admin/business` and `/admin/homepage` — fixing here fixes every current consumer at once, and any future one (e.g. T-004's product editor, if it reuses either component).

### Dependency Order
1. **T-003** — **next to run.** Fully unblocked: T-001's SQL is applied and user-confirmed (`STATUS: APPLIED 2026-09-27`), T-001 is `[x]` and merged. This sprint's stated goal is the client feature (T-003 → T-005) — deliberately prioritized ahead of every security/QA fast-follow below, none of which block a local `/git Merge`.
2. **T-004** — depends on T-003 (and transitively T-001).
3. **T-005** — depends on T-003 (and transitively T-001); can be built in parallel with T-004 once T-003 lands, since T-004 (admin write UI) and T-005 (public read UI) touch different files.
4. **T-006** — independent of T-003/T-004/T-005; closes the standing deploy-blocker (SEC-HIGH-1). Does not block any ticket above's local merge, but must land — and `/cso review` must confirm `npm audit` is clean — before the next `deploy`. `docs/SECURITY.md` SEC-HIGH-2 (Supabase Dashboard signup-toggle check) also blocks the next `deploy` and has **no ticket**; it needs the user's own confirmation, not code.
5. **T-007** — independent; 🟡 Medium, non-blocking.
6. **T-008** — independent; 🟡 Medium, non-blocking.
7. **T-009** — independent fast-follow on T-002.
8. **T-010** — independent fast-follow on T-002; consider landing before T-004 if T-004 ends up extending `ObjectListEditor` directly rather than building a wholly new component.
9. **T-011** — independent accessibility fast-follow on T-002.
