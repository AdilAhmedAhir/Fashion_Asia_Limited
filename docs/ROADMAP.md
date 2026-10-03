# ROADMAP.md

Owner: `/pm`. Last updated: 2026-09-28.

Status: first `/pm` pass on this repo. No prior `ROADMAP.md` entries exist to amend. `docs/QA_REPORT.md` and `docs/SECURITY.md` do not exist yet, so there are no open 🔴/🟡 or SEC-CRIT/SEC-HIGH findings to convert ahead of feature work. `docs/MARKETING.md` does not exist, WORKFLOW §10 is inert, and no marketing-originated drafts (`SEO_REPORT.md`, `CRO_PLAN.md`, `ANALYTICS_SPEC.md`, `GROWTH_PLAN.md`, `docs/copy/`) exist to ticket this pass. `docs/DECISIONS.md` has no open Counters. Scope is exactly the three MVP features in `docs/VISION.md`; nothing from its Cut / Anti-Goals list is ticketed here — including the homepage "Business Preview" strip, which `VISION.md`'s Scope Ruling explicitly keeps as-is for this sprint.

**Second pass — 2026-09-27, dispatched by `/system-architect` mid-sprint (amend, not replace).** T-001 and T-002 are now `[x]`, merged into local `main` (not deployed — nothing pushed to `origin`/`client`). `docs/QA_REPORT.md` and `docs/SECURITY.md` now exist and were both read in full this pass. Their findings against T-001/T-002 are handled two ways, per each reviewer's own recommendation: `/cso`'s SEC-MED-3/SEC-MED-4 and `/qa`'s T-001 WARN-1/WARN-2/WARN-3 are folded directly into T-003's and T-005's existing **Acceptance** lists below as new bullets (nothing already there is removed or reworded) rather than spawned as parallel tickets; `/cso`'s SEC-HIGH-1 (Next.js CVE range; fix = lockfile bump to `16.3.6`) becomes **T-006** and blocks the next `deploy`. `/cso`'s SEC-HIGH-2 (a Supabase Dashboard "allow new signups" toggle) is **not** a ticket — `docs/SECURITY.md` §5 itself calls it "user action, not a code ticket" — but it also blocks the next `deploy`, pending the user's own confirmation. `/cso`'s SEC-MED-1/SEC-MED-2 become standalone follow-ups **T-007**/**T-008**. `/qa`'s T-002 WARN-1–WARN-4 become follow-up tickets **T-009** (WARN-1/2/3 — `ImageUploadField` advisory/error-state hardening) and **T-010** (WARN-4 — stale state leaking across a reordered/deleted `ObjectListEditor` row). A `/ui-ux` finding relayed by the orchestrator (not written to a doc — cited as "ui-ux T-002 pass, 2026-09-26") becomes **T-011** (contrast + keyboard-focus fixes on the same two shared admin components). None of T-006–T-011 blocks T-003, T-004, T-005, or displaces this sprint's stated goal (the client feature) — see the rewritten Dependency Order at the bottom.

**Third pass — 2026-09-27, dispatched by `/system-architect` resuming Sprint 1 after the archive at `78a3498` (amend, not replace).** T-003 is now merged (`ed76507`) and was archived out of this file into `docs/MEMORY_BANK.md` §12 by the intervening `/archivist` pass (`a8c4490`, `78a3498`) — which is why the Dependency Order below no longer mentions it, and why T-005's Notes gain one more dated addendum rather than a rewrite. This pass: (1) **SEC-HIGH-4** (`docs/SECURITY.md`, T-003's throw-based `updateSettings` contract) is spun as a new standalone ticket, **T-012**, sequenced as a blocking prerequisite ahead of T-004, rather than folded into T-004's own Acceptance list — offered as "your rubric's call" by the dispatch; decided against folding because the fix fails this file's own Ticket Template atomicity test when folded (single-PR / one-revert: the contract change must land atomically across all six settings-page callers regardless of T-004's own timeline, and it also repairs five settings pages — homepage, contact, sustainability, who-we-are, who-we-work-with — that have nothing to do with T-004's product editor; folding it in would leave their identical silent-failure bug open until T-004's much larger, manual-checklist-gated ticket finishes). (2) The one-time `/admin/business` bootstrap-save precondition (`docs/QA_REPORT.md` "Manual Checklist — T-003" Step 1; `docs/TECH_STACK.md` "legacy (id-less) categories" follow-up) **is** folded directly into T-004's own Acceptance list, unconditionally, as the dispatch specified. (3) The two T-004 acceptance-criterion candidates `docs/MEMORY_BANK.md`'s T-003 entry flagged (QA re-run INFO-1 — preserve unknown category keys, `id` above all; QA first-pass INFO-1 — new products append at `sort_order` = max + 1, not the front) are folded directly into T-004's Acceptance list. (4) **Ordering ruling:** T-005 now runs before T-004 in the refreshed Dependency Order below — T-004's own 4th acceptance bullet needs T-005's public page to exist to verify end-to-end, and T-005 is fully agent-verifiable (public, read-only, no manual checklist) while T-004 needs one; finishing agent-only work first means the eventual T-004 manual checklist can confirm the add-product flow *and* its public-page reflection in one sitting instead of pulling the user in twice. (5) Of the still-unfiled T-003 findings in `docs/MEMORY_BANK.md`'s T-003 entry: QA WARN-2 + CSO SEC-INFO-16 (same function, `reorderCategoryProducts`, complementary gaps) are folded into one new ticket, **T-013**; CSO SEC-MED-7 + SEC-INFO-15 (same function, `sanitizeInput`, both small validation additions) are folded into one new ticket, **T-014**; CSO SEC-MED-5 (TOCTOU) is **explicitly deferred, not ticketed** — CSO's own accepted rationale stands (small, hand-created admin roster, not concurrent public traffic) and its only known mitigation (a Postgres RPC/transaction rewrite) is disproportionate to that accepted, low-probability risk — revisit only if concurrent-admin-editing patterns actually emerge; the note `/qa`'s T-003 Live Pass routed to `/cso` (deployed `origin/main`'s pre-T-003 `updateSettings` has no `getUser()` check) is likewise **deferred, not ticketed** — the fix already exists in local `main` as a side effect of T-003's own auth work (merged `ed76507`), so the only open question is live `site_settings` anon-RLS exploitability during the window before the next `deploy`, which no agent can verify and which is already carried by this project's existing standing deploy-blocker list (`docs/MEMORY_BANK.md` "Standing state carried forward") rather than a new code ticket — recommend `/cso` assess directly with Supabase Dashboard access on its next pass. None of T-012–T-014 displaces T-004/T-005 as the sprint's primary thread — see the rewritten Dependency Order at the bottom.

**Fourth pass — 2026-09-28, dispatched by `/system-architect` to plan the post-launch hardening sprint (amend, not replace; docs-only branch `chore/sprint-2-plan`, cut from `main` at `e8eace1`).** **Sprint 1 is deployed.** On 2026-09-28 the user typed "deploy", and `main` at `e8eace1` was pushed as a fast-forward to both `origin` and `client`; both are now at `e8eace1`. Vercel served it about 60 s later on `www.fal.com.bd` and `www.fashionasialtd.com`, which are the same deployment. The orchestrator's live checks all passed: 8 clickable category cards, 8 category pages showing "Coming Soon" (no products exist yet), unknown slug → 404, a sitemap with 8 category URLs, the admin gate returning 307 → login, and every other page 200. Production therefore runs with SEC-HIGH-1 (T-006) and SEC-HIGH-5 still open, and every "blocks the next `deploy`" note earlier in this file now means "live on production". `docs/MEMORY_BANK.md`'s latest standing-state block (2026-09-27T05:00Z) still says "deploy blocked"; `/archivist` records the deploy at the end of this run. T-004, T-005 and T-012 were archived out of this file (`87e7a09`, `846ac6e`), so the Dependency Order at the bottom is rewritten. Numbering: this file's "Sprint 2" section already holds T-006–T-014, so this pass's tickets (T-015–T-022) go under a new "Sprint 3", even though the orchestrator's branch calls this run sprint 2. The Dependency Order ranks both sections together.

*User actions, not tickets (surface these to the user):*
- **SEC-HIGH-2: user-reported, verification pending.** The user reports turning off "Allow new users to sign up", but the orchestrator's first read of Supabase's public `/auth/v1/settings` endpoint right afterwards still returned `disable_signup: false`. SEC-HIGH-2 stays open in `docs/SECURITY.md` §5 until that endpoint reads `true`. Separately, the user has to check Authentication → Users for accounts they don't recognize, created while sign-ups were open (`docs/SECURITY.md` §7, runbook item 6). T-015's new `getUser()` checks don't change this, because a self-registered account passes `getUser()`.
- **The one-time `/admin/business` bootstrap Save is now urgent, for two reasons.** First, the product editor stays locked on production until it runs. Second, `docs/QA_REPORT.md` T-005 WARN-3's link-rot window is open: the live sitemap now advertises all 8 category URLs, and renaming a category before the bootstrap Save changes its URL with no redirect. Run it before any other `/admin/business` edit.
- **Manual checklists T-002, T-003, T-012 and T-004 are still pending.** T-004's Step 1 is the bootstrap Save and also satisfies T-003's Step 1 and T-012's Step 2. One caveat for whoever relays it: T-004's checklist ("Before you start", third bullet) says test products "will not appear on the live public website" until someone deploys. Since this deploy, that's no longer true. A test product appears on the live `/what-we-do/sportswear` the moment it's added, so name test products clearly and delete them in the same sitting. `/qa` should update that line on its next pass.

*Dispositions of the unticketed findings the dispatch listed:*
- **Ticketed:** SEC-HIGH-5 → **T-015**, which also covers leader CRUD (same shape) and SEC-MED-10 for 10 of its 12 functions. T-004 QA WARN-1/2/3 → **T-016**, plus the per-keystroke path-box saves found while scoping. T-005 WARN-5 → **T-017**. SEC-MED-8 → **T-018**, with T-005 WARN-1's comment fix riding along. SEC-MED-9, SEC-MED-10's last two functions, and the failed-upload broken-item insert → **T-019**. The `/ui-ux` sitewide `text-black`/`bg-primary` finding → **T-020**. T-005 WARN-4 → **T-021**. T-005 WARN-2 → **T-022**.
- **Folded into existing tickets:** SEC-MED-11 and SEC-MED-13 → **T-014**, per `/cso`'s own §5 routing. T-014 also closes T-004 QA INFO-2 (fractional `sort_order`), and gains a dependency on T-016. **T-006** gains one bullet: a production-build regression check after the bump.
- **Deferred, no ticket:**
  - SEC-MED-12 (same accepted TOCTOU class as SEC-MED-5, per `/cso`).
  - SEC-INFO-19 (Info; no live write path can set an unsafe slug). Fold it into the next ticket that edits `normalizeProducts()`; none is queued.
  - SEC-INFO-20 and SEC-INFO-22 (both closed as informational in `docs/SECURITY.md` §5).
  - T-005 WARN-3 (a user action, above).
  - T-005 INFO-1 (no monitoring stack exists, per `docs/TECH_STACK.md`; `/devops` territory), INFO-2 (the sitewide OG-image gap; left for an SEO pass once WORKFLOW §10 is active), INFO-3 (fails closed), INFO-4 (folded into T-021's `/qa live` if real products exist by then) and INFO-5 (no test runner).
  - T-004 QA INFO-1 (self-heals; QA didn't file it) and INFO-3 (moot, since T-004 is archived).
  - T-012 QA WARN-1 (a wording nit on an archived ticket). The lesson is applied in T-015, which specifies the error slot's behavior rather than naming components.

*Found while verifying source for these tickets; the docs' owners should correct them (this pass edits only this file):*
- `uploadFile` has a live caller, `ReportsClient.tsx:46` (report uploads to the `reports` bucket). `docs/MEMORY_BANK.md` §4 and Known Trap #9 say it has none. For `/archivist`.
- SEC-MED-10's headline says "10 write functions", but its own per-file list sums to 12 (7 + 2 + 3). T-015 and T-019 together cover all 12. For `/cso`.
- SEC-HIGH-5's body names two clients, while its verdict line says "reports/leaders/jobs". `WhoWeAreClient.tsx:41-57` confirms the leader case: `saveLeader` gives no signal on failure or on success. `/cso` confirms this at T-015's review.

*Priority for this run.* The orchestrator stops at `/archivist` after the 3rd merge, so the top three in the Dependency Order ship next:
- **T-006**: public framework CVEs, including a Server Actions CSRF bypass, now front every live admin write, and the fix is a lockfile bump.
- **T-015**: the only other open High; live admin edits fail with no message.
- **T-016**: the catalog editor's ordinary-use bugs can silently corrupt buyer-facing pages, and staff are about to start using it.

T-014 is #4, behind T-016 (a real dependency) rather than behind a High. T-017 is #5: it's pre-existing and perf-only, but has the widest reach.

## 📊 PM Sprint Plan — 2026-09-26
### Sprint 1: Ship the three MVP features from VISION.md — category detail pages, products-within-category admin management, and the image-size warning

## 📊 PM Sprint Plan — 2026-09-27
### Sprint 2: Close `/cso` + `/qa` fast-follow findings from T-001/T-002 without displacing the client feature (T-003 → T-005) as the sprint's primary thread

- [x] **T-006** — Bump `next` to close SEC-HIGH-1 (Server Actions CSRF bypass + rolled-up CVE range)
  - **Source:** `docs/SECURITY.md` SEC-HIGH-1, 2026-09-26 (reconfirmed still open in the 2026-09-27 T-001 CSO entry: "SEC-HIGH-1 ... remains open and unresolved")
  - **Files:** `package.json`, `package-lock.json`
  - **Flags:** schema-touching: **no** · sensitive: **yes** (framework version underpinning every Server Action mutation in the app) · UI: **no**
  - **Acceptance:**
    - `next` resolves to `16.3.6` or later — still satisfying the existing `package.json` range `^16.1.6` (a lockfile-only bump, not a semver-range or major-version change).
    - `npm audit --omit=dev` no longer reports the `next` advisory range (`9.3.4-canary.0 - 16.3.2`, installed `16.1.6`) as present, including the directly-reachable null-origin Server Actions CSRF bypass (`GHSA-mq59-m269-xvcx`).
    - No dependency other than `next` and its own transitive tree (e.g. `sharp`, expected to clear as a side effect per `docs/SECURITY.md`'s own note) is bumped as a separate, unrelated change.
    - `npx tsc --noEmit` and `npm run build` both stay clean after the bump.
    - `/cso review` re-runs `npm audit --omit=dev` and confirms the SEC-HIGH-1 advisory is gone before this ticket is treated as closing that finding.
    - *(Folded 2026-09-28, fourth `/pm` pass. Sprint 1 is now live, so this is the first framework change to land under a production deployment.)* `/qa live` repeats, against a production build (`npm run build && npm start`, the T-012/T-004 precedent), the checks the orchestrator ran on production on 2026-09-28: `/admin/*` → 307 to `/admin/login` with zero `Set-Cookie`; `/`, `/what-we-do`, all 8 `/what-we-do/<slug>` pages and `/sitemap.xml` (17 entries) → 200 with unchanged content; an unknown slug → 404. Why: the admin gate lives in `src/middleware.ts`, and every build log this sprint already flags that file convention as deprecated under Next 16, so a minor-version bump is where it could break.
  - **Sequence:** `/git Start` → `/architect` (confirm the version target; flag any 16.1.6→16.3.6 breaking changes) → `/lead-dev` → `/qa static` → `/qa live` → `/cso review` → `/git Merge` (order per `docs/SECURITY.md` SEC-HIGH-1's own prescribed sequence)
  - **Notes:** Blocks the next `deploy` (push to `origin`/`client`) per `docs/SECURITY.md` §5 and `docs/WORKFLOW.md` §6 — does **not** block any local `/git Merge`, including this sprint's. Independent of T-003/T-004/T-005; can run in parallel with the feature chain at any point before the next `deploy`. `docs/SECURITY.md` SEC-HIGH-2 (Supabase Dashboard "allow new user signups" toggle) also blocks the next deploy but is explicitly **not** a ticket — it's a Dashboard setting only the user can check (`docs/SECURITY.md` §5: "User action, not a code ticket — no `/pm` ticket needed"). **Addendum 2026-09-28 (fourth `/pm` pass):** Sprint 1 deployed on 2026-09-28 without this fix. The advisory range, including the null-origin Server Actions CSRF bypass (`GHSA-mq59-m269-xvcx`), now fronts every live Server Action, T-004's product create/update/delete/reorder included. The "blocks the next deploy" framing above is superseded: the exposure is live now, and the fix reaches production only on the next user-typed "deploy". Ranked #1 in the refreshed Dependency Order. `16.3.6` was npm's latest on 2026-09-26; `/architect` confirms the current patched release within `^16` when the ticket starts.

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

*(T-012–T-014 appended 2026-09-27, third `/pm` pass — fast-follow findings from T-003, which had not yet been built when this Sprint 2 section was first written.)*

- [ ] **T-013** — Harden `reorderCategoryProducts`: validate input completeness, batch the write, revalidate on failure
  - **Source:** `docs/QA_REPORT.md` T-003 Static Pass WARN-2, 2026-09-27 (re-checked and still open in the re-run pass); `docs/SECURITY.md` SEC-INFO-16, 2026-09-27 (T-003 CSO entry) — same function, complementary gaps: QA flagged the missing input-completeness check and the missing revalidate-on-failure call; CSO flagged the missing transaction
  - **Files:** `src/app/actions/products-actions.ts` (`reorderCategoryProducts`)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (server action, writes `public.products`) · UI: **no**
  - **Acceptance:**
    - `reorderCategoryProducts` validates that the caller's `orderedIds` is exactly the set of ids currently stored for that category (same count, no duplicates, no unknown/foreign id) before writing anything, rejecting with a named error rather than silently accepting a partial or duplicated list.
    - The per-row `sort_order` updates land as a single batched write (e.g. one upsert call with an array of `{id, sort_order}`, still scoped by `category_slug`) rather than sequential per-row updates, so a failure partway through cannot leave some rows at their new order and others at the old one.
    - `revalidateCategory(slug)` is called on every code path that could have written at least one row, including a failure path — not skipped on a mid-operation failure as today.
    - Every update remains scoped by both `id` and `category_slug` (unchanged safety property from T-003, SEC-INFO-18) — no cross-category reassignment introduced by the batching change.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` (read-only regression) → `/git Merge`
  - **Notes:** Both source findings are 🟡 non-blocking (self-heals on the next successful full reorder). Recommend landing before or alongside T-004 if T-004's reorder UI calls this function directly — not a hard block either way, since T-004 can ship against today's non-atomic behavior without violating any of its own acceptance criteria.

- [ ] **T-014** — Add an image-URL scheme allow-list and a `name` length cap to the products write path
  - **Source:** `docs/SECURITY.md` SEC-MED-7, 2026-09-27 (T-003 CSO entry, reconfirmed still open in the re-review entry); `docs/SECURITY.md` SEC-INFO-15, 2026-09-27 (T-003 CSO entry) — bundled into one ticket: same file (`products-actions.ts::sanitizeInput`), both small validation-hardening additions with no interaction between them
  - **Files:** `src/app/actions/products-actions.ts` (`sanitizeInput`), `src/lib/site-content.ts` (`resolveCategoriesForSave` — same `.trim()`-only pattern on the pre-existing category-level `Product.image` field; CSO's own finding notes both fields share the identical gap)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (server actions, writes) · UI: **no**
  - **Acceptance:**
    - `CategoryProductInput.image` (`products-actions.ts::sanitizeInput`) is rejected with a named error unless it starts with `http://`, `https://`, or `/` — closing SEC-MED-7's no-allow-list gap for the product-level image field.
    - The pre-existing category-level `Product.image` field (`resolveCategoriesForSave`, `site-content.ts`) gets the identical allow-list check, closing the same gap for the field CSO flagged as sharing "the same pre-existing pattern already accepted."
    - `name` (`sanitizeInput`) is capped to 255 characters (`name.slice(0, 255)`), matching `products.name VARCHAR(255)` and the same pattern already used for `slug`'s 255-char cap — closing SEC-INFO-15.
    - A currently-valid product/category save (any `https://`-or-relative image, any name ≤ 255 chars) is unaffected — regression check.
    - `npx tsc --noEmit` and `npm run build` stay clean.
    - *(Folded 2026-09-28, fourth `/pm` pass. Source: `docs/SECURITY.md` SEC-MED-11, T-004 CSO entry: "recommend folding into **T-014**".)* `sanitizeInput()` truncates a caller-supplied `sort_order` to an integer and clamps it to `0`–`2147483647` (Postgres `INTEGER`'s range) before any insert or update. Today any finite value passes through to the insert verbatim; `-500`, `3.5` and `1e15` all do, per `/cso`'s 11-case execution. Unaffected: T-004's behavior when `sort_order` is omitted or non-finite (current max + 1), and the UI's own `0..n−1` values. This also settles `docs/QA_REPORT.md` T-004 Static Pass INFO-2 (whether a fractional value can reach the `INTEGER` column): it can no longer be sent.
    - *(Folded 2026-09-28. Source: `docs/SECURITY.md` SEC-MED-13, T-004 CSO entry: the path box makes SEC-MED-7 reachable "through entirely ordinary, shipped-UI staff use".)* The allow-list rejection is visible through ordinary UI. A value that fails it (e.g. `C:\photos\tee.jpg`, `www.example.com/tee.jpg`, `javascript:alert(1)`), typed or pasted into `ImageUploadField`'s path box on a product row, in the Add-a-product form, or on a category card, produces a visible, named error in the admin: the row error, the Add-form error, or `SettingsHeader` via T-012's result contract. The stored value and the public page stay unchanged. This needs an admin session, so `/qa` adds it as a manual-checklist step (`docs/WORKFLOW.md` §4).
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` (read-only regression) → `/git Merge`
  - **Notes:** Both source findings are non-blocking, bounded impact (per CSO: browsers don't execute `javascript:`/SVG-`data:` via `<img>`; worst case is an attacker-controlled `https://` URL rendering site-wide). Independent of T-004/T-005/T-012/T-013 — can land anytime. **Addendum 2026-09-28 (fourth `/pm` pass):** The two bullets folded in above follow `/cso`'s own §5 routing: SEC-MED-11 "recommend folding into **T-014**", and SEC-MED-13 "Filed as **T-014** (existing) — recommend elevating scheduling priority". The "can land anytime" line is superseded. `/cso` twice recommended landing this before or alongside T-004 (the T-005 and T-004 entries), and T-004 has since shipped and deployed, so the gap is live and reachable by ordinary staff use. It's ranked #4, not in the top three, for two reasons. Its impact ceiling stays bounded: `/cso` explicitly declined to reclassify it to High. And it has a real dependency on **T-016**: until T-016 stops `ProductRow` saving the path box on every keystroke, this allow-list would reject each intermediate keystroke of a typed `https://` URL (`h`, `ht`, …) with a visible error. SEC-MED-12, the max + 1 race, is not folded: `/cso` keeps it in SEC-MED-5's accepted TOCTOU class with no ticket.

## 📊 PM Sprint Plan — 2026-09-28
### Sprint 3: Post-launch hardening. Close what the deploy left live (both open Highs, and the catalog editor's ordinary-use data bugs) before the client's staff populate the catalog, then work down the post-launch Medium backlog.

*(T-015–T-022 appended 2026-09-28, fourth `/pm` pass. T-006 and T-014 are Sprint 2 tickets amended this pass; they keep their IDs and places above. The Dependency Order below ranks both sprints together.)*

- [x] **T-015** — Surface failures from report, job and leader CRUD instead of failing silently, and add the session check those actions skip
  - **Source:** `docs/SECURITY.md` SEC-HIGH-5, 2026-09-27 (`ticket-review:T-012` entry; §5 lists it as "blocks next `deploy`", and it shipped anyway on 2026-09-28, so it's live now). `docs/SECURITY.md` SEC-MED-10, same entry: "recommend `/pm` batch this with SEC-HIGH-5's fix ticket". Leader CRUD is included on the strength of that entry's own verdict line ("SEC-HIGH-5 — reports/leaders/jobs CRUD") and a PM source check on 2026-09-28: `WhoWeAreClient.tsx:41-57` has the identical unguarded shape, though the finding's body names only `ReportsClient`/`CareersClient`.
  - **Files:** `src/app/actions/settings-actions.ts` (`createReport`/`updateReport`/`deleteReport` :239-280, `createLeader`/`updateLeader`/`deleteLeader` :292-326, `uploadFile` :332-346), `src/app/actions/jobs-actions.ts` (`createJob`/`updateJob`/`deleteJob` :61-83), `src/app/admin/(dashboard)/reports/ReportsClient.tsx`, `src/app/admin/(dashboard)/careers/CareersClient.tsx`, `src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx` (leader handlers :41-57 only; its `updateSettings` path was fixed by T-012)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (writing Server Actions, a storage upload path, `src/app/admin/**`) · UI: **yes**
  - **Acceptance:**
    - All ten functions above return a typed result, `{ ok: true, ... } | { ok: false, error: string }`, for every expected failure. None `throw` for one (`docs/TECH_STACK.md` "Server Action failure-reporting convention"). `uploadFile` returns its public URL inside the `ok` branch.
    - Each of the ten calls `supabase.auth.getUser()` before any read or write (the `requireUser()` pattern in `products-actions.ts`). With no user, it returns `{ ok: false, error: "Your session expired. Sign in again and retry." }`, the string `updateSettings` and `products-actions.ts` already use. This closes SEC-MED-10 for 10 of its 12 enumerated functions; the other two (`addMediaAction`/`deleteMediaAction`) are T-019.
    - An update or delete that matches zero rows returns `{ ok: false }` with a not-found message rather than success, matching `updateCategoryProduct`/`deleteCategoryProduct`'s existing "Product not found." behavior.
    - Every call site in the three clients handles the result. On `ok: false` or an unexpected throw, the admin sees visible text on the page (`role="alert"`): the returned message, or T-012's generic fallback for a throw. The edit modal stays open with the admin's input intact, and `window.location.reload()` doesn't run. On success, today's behavior is unchanged. `ReportsClient` and `CareersClient` each get an error slot, since neither has one today. Placement is `/ui-ux`'s call; what's required is visible, specific text next to the action that failed.
    - `saveLeader` (today: no `try`/`catch`, no reload, no signal whether it worked or not) shows a visible message when it fails.
    - A failed report-file upload (`ReportsClient.handleFileUpload` → `uploadFile`) shows the real returned reason, not Next's production-redacted text.
    - `/qa live` boots a production build (`npm run build && npm start`, the T-012 precedent), because this bug class only shows in production. `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Security-sensitive row, UI). `/qa` also writes a manual checklist, since these are admin writes (`docs/WORKFLOW.md` §4). A realistic failure trigger is signing out in a second tab, then saving.
  - **Notes:** Ranked #2. Out of scope: `uploadFile`'s missing size and type checks (`docs/MEMORY_BANK.md` Known Trap #9). DB-error branches may forward `error.message` exactly as T-012 does (the tracked SEC-MED-8 class); T-018 then replaces that across all three action files in one pass. The new `getUser()` checks don't mitigate SEC-HIGH-2, because a self-registered account passes `getUser()`, so that finding stays a user action.

- [ ] **T-016** — Fix the product editor's ordinary-use data bugs before staff start using it
  - **Source:** `docs/QA_REPORT.md` Static Pass — T-004 WARN-1, WARN-2, WARN-3, 2026-09-27 (`docs/MEMORY_BANK.md` T-004 entry: "QA and `/cso` both recommend picking these three (WARN-1/2/3) up as `/pm` fast-follow tickets"). Also a PM source check on 2026-09-28, same race class as WARN-1, for `/qa` to confirm: `ImageUploadField.tsx:249-251` calls `onChange` on every keystroke in its hand-editable path box, and `CategoryProductsManager.tsx:532` wires that `onChange` straight to `persist()`. Typing a path into a product row therefore fires one `updateCategoryProduct` write per keystroke, and those writes aren't serialized.
  - **Files:** `src/components/admin/CategoryProductsManager.tsx` (`ProductRow.persist()` :409-445 and its `<ImageUploadField>` :532; the `<AddProductForm>` mount :242; the empty-state line :252), `src/app/actions/products-actions.ts` (`getAllCategoryProducts` :125-143), `src/app/admin/(dashboard)/business/page.tsx`, `src/app/admin/(dashboard)/business/BusinessClient.tsx` (pass the load state through). `src/components/admin/ImageUploadField.tsx` is touched only if the chosen fix needs a new prop there (see Notes).
  - **Flags:** schema-touching: **no** · sensitive: **yes** (`src/app/admin/**`, Server Action module) · UI: **yes**
  - **Acceptance:**
    - WARN-1: for any interleaving of a Name/Description save and an Image save on one product row, both the stored row and the on-screen preview end on the most recently chosen image and the most recently typed text. There's no silent revert and no "Saved" shown over a stale value. Ignoring stale responses on the client isn't enough on its own: `updateCategoryProduct` overwrites the whole row, so a stale request applied last on the server still wins in the database. A row's saves must not overlap. For example, queue them and build each payload from the latest draft at send time, or block the image control while a save is in flight.
    - Path box: typing into a product row's path box sends nothing until the edit is committed (on blur or an equivalent), then sends exactly one save. The box never drops or reverts characters mid-typing, and the stored value equals the full committed text. Pasting, and completing an upload, each still save once.
    - WARN-2: changing the category picker discards any in-progress "Add a product" draft (name, description, image), for example with `key={selected.slug}` on `<AddProductForm>`. After a switch, nothing typed or uploaded for the previous category can be added to the new one.
    - WARN-3: `getAllCategoryProducts` distinguishes a failed read from an empty result, for example `{ ok: true, data } | { ok: false }`. After a failed read the editor never presents a category as empty. "No products in this category yet" doesn't render; a visible `role="alert"` message says products couldn't be loaded and to refresh; and the add form is withheld until a reload succeeds, so a transient read failure can't lead to a duplicate add. That message is fixed copy, not the raw DB error.
    - `getCategoryProducts`, the public category page's read, is unchanged. Its fail-open "Coming Soon" was ruled correct for visitors (`docs/QA_REPORT.md` T-005 Static Pass INFO-1).
    - No regression to T-004's verified behavior: `product.id` row keys, save-on-blur, Retry, the Saving→Saved status, focus handling after delete and reorder, the bootstrap-gate banner, and max + 1 `sort_order` all behave as before. Any other `ImageUploadField` consumer (category cards, homepage facility photos, the add form) behaves exactly as today. `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Security-sensitive row, UI). `/qa` adds the WARN-1, WARN-2 and path-box repros as manual-checklist steps, which the user can run in the same sitting as the still-pending T-004 checklist.
  - **Notes:** Ranked #3. T-014 depends on this ticket: until the path box stops saving per keystroke, T-014's allow-list would reject every intermediate keystroke of a typed `https://` URL with a visible error. If the fix adds a prop to the shared `ImageUploadField`, T-009/T-010/T-011 (which also edit that file) come later in the order and rebase onto it. Not in scope: T-004 QA INFO-1, where a delete during a failing reorder briefly resurrects a row client-side; it self-heals and QA didn't file it as an action item.

- [ ] **T-017** — Remove the dead hero frame-preload loop from the desktop Preloader without freezing its progress bar
  - **Source:** `docs/QA_REPORT.md` Live Pass — T-005 WARN-5, 2026-09-27 (`docs/MEMORY_BANK.md` T-005 entry: "For `/pm`: delete the dead loop ... or restore the missing frames")
  - **Files:** `src/components/global/Preloader.tsx` (desktop branch :63-81, `TOTAL_FRAMES` :13, header comment :6-11)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes** (global public component)
  - **Acceptance:**
    - A desktop (≥ 768 px) load of any `(website)` page makes zero requests for `/sequence/hero/frame_*.webp`. Verify with the CDP network capture from the T-005 Live Pass on `/`, `/what-we-do` and one category page at 1440 px; each shows about 160 404s today.
    - The desktop progress bar still visibly advances 0→100%. Today `setProgress` and the early `finishLoading()` call are driven only by that loop's `onload`/`onerror` callbacks, so deleting the loop without a replacement would leave the bar at 0% until the safety timer. Reusing the mobile branch's timed progress is one option.
    - Desktop timing stays inside today's bounds: the overlay starts its exit no earlier than `finishLoading`'s 1200 ms minimum and no later than the 2000 ms safety net. The mobile branch is unchanged.
    - `public/sequence/hero/poster.webp` and `HeroSection.tsx`'s `poster` reference are untouched, and the hero renders as today. The file's header comment (currently "DESKTOP: Preloads frames while showing branding") is updated to match.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Full-stack row; no DB, not sensitive). Fully agent-verifiable, no manual checklist.
  - **Notes:** Ranked #5. QA's other option, restoring the frame sequence, needs 160 frame assets that exist nowhere in the repo, plus a product decision on the hero effect. The hero moved to one poster plus a video before the A-Team era (`docs/MEMORY_BANK.md` §12, onboarding entry). Not ticketed; restoring the frames would need a new ticket if the user wants it. This would trigger WORKFLOW §10's Core Web Vitals review if marketing were active; §10 is inert.

- [ ] **T-018** — Replace raw database error text in admin Server Action results with generic messages, logging the raw error server-side
  - **Source:** `docs/SECURITY.md` SEC-MED-8, 2026-09-27 (`ticket-review:T-012` entry: "a small, shared ... helper, applied to both `settings-actions.ts` and `products-actions.ts` in one pass rather than patched file-by-file"), extended to `jobs-actions.ts` because T-015 gives its functions the same result shape. Also `docs/QA_REPORT.md` Static Pass — T-005 WARN-1, a comment-only fix in a function this ticket already edits.
  - **Files:** one new shared helper (e.g. `src/lib/action-errors.ts`; name at `/lead-dev`'s discretion; plain TypeScript, no dependency), `src/app/actions/settings-actions.ts`, `src/app/actions/products-actions.ts`, `src/app/actions/jobs-actions.ts`
  - **Flags:** schema-touching: **no** · sensitive: **yes** · UI: **no**
  - **Acceptance:**
    - No `{ ok: false }` result in these three files carries a raw Supabase/Postgres `error.message`. Each DB-error branch returns a fixed, plain-language admin message and logs the raw error server-side only (`console.error`).
    - Coverage includes `updateSettings`'s three DB-error branches (existing-row read, delete-guard count, upsert), every `error: error.message` site in `products-actions.ts`, and the report, leader, upload and job functions T-015 converted.
    - Hand-written guard messages stay byte-for-byte unchanged: session-expired, slug collision, "Remove its products first…", not-found, and not-yet-bootstrapped. They're app copy, not DB errors.
    - *(Folded from QA T-005 WARN-1.)* The comment on `updateSettings`'s `revalidatePath("/sitemap.xml")` line is corrected to say the sitemap's freshness comes from forced-dynamic rendering (`createClient()` calls `cookies()`), not from this call. No logic change.
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` (read-only regression) → `/git Merge` (WORKFLOW §3, Backend-only row, sensitive)
  - **Notes:** Must follow T-015. Non-blocking per `docs/SECURITY.md` §5. SEC-INFO-15's raw "value too long" path disappears once T-014 caps `name`.

- [ ] **T-019** — Make Media Center add and delete report their failures, stop a failed upload from publishing a broken item, and add the session check
  - **Source:** `docs/SECURITY.md` SEC-MED-9, 2026-09-27 (`ticket-review:T-012` entry: "needs a distinct design ... rather than a copy of T-012's pattern"); `docs/SECURITY.md` SEC-MED-10, same entry (the two functions T-015 doesn't cover). Also a PM source check on 2026-09-28: when the storage upload fails, `addMediaAction` (`media-actions.ts:139-149`) only logs it and still inserts the `media_assets` row, with `url` left empty or unchanged. `deleteMediaAction` (:157-173) removes the storage file first and checks neither result.
  - **Files:** `src/app/actions/media-actions.ts` (`addMediaAction` :126-155, `deleteMediaAction` :157-173), `src/app/admin/(dashboard)/media/page.tsx` (the two `<form action>` sites, :26 and :88), new client component(s) under `src/app/admin/(dashboard)/media/` for form state (name at `/lead-dev`'s discretion)
  - **Flags:** schema-touching: **no** · sensitive: **yes** (storage upload path, WORKFLOW §5) · UI: **yes**
  - **Acceptance:**
    - Both actions return a typed `{ ok: true } | { ok: false, error: string }`, and the Media page renders it. A failed add or delete shows visible text (`role="alert"`) in every environment, `npm run dev` included; today nothing shows anywhere. Built with React 19's built-in form-state support (`useActionState`; React 19.2.4 per `docs/TECH_STACK.md`) or an equivalent client wrapper, with no new package.
    - A failed storage upload aborts the add: no `media_assets` row is inserted, so nothing broken appears on `/life-at-fashion-asia`.
    - A delete never leaves a published gallery entry pointing at a file that's already gone. One way: delete the row first and remove the storage object only after that succeeds. Any failure is reported.
    - Both actions call `supabase.auth.getUser()` first and return the standard session-expired message when there's no user, which closes SEC-MED-10's last two functions.
    - Unchanged: this path's lack of size and type validation (`docs/MEMORY_BANK.md` Known Trap #9; a `docs/VISION.md` anti-goal scope). `importBuiltInGallery` and `uploadOptimizedImage` in the same file already check `getUser()` and aren't touched. `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/architect` (confirm the form-state approach and result contract; SEC-MED-9 asks for "its own design pass", the same insertion precedent as T-006/T-008) → `/lead-dev` → `/cso review` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Security-sensitive row, UI), plus a manual checklist for the user
  - **Notes:** Ranked #7. Independent of T-015 (different file, different mechanism).

- [ ] **T-020** — Raise the `text-black`-on-`bg-primary` controls to WCAG AA contrast across the public site and admin
  - **Source:** ui-ux T-004 pass, 2026-09-27: `docs/qa-evidence/T-004/ui-ux/contrast-and-methodology.log` §5 ("text-black on bg-primary ... ~2.77:1 ... EIGHT files ... recommend a dedicated cross-cutting follow-up ticket (bundling with or alongside T-011)"); `docs/MEMORY_BANK.md` T-004 entry ("For `/pm`")
  - **Files** (the log's 8, re-grepped by PM on 2026-09-28): `src/app/admin/login/page.tsx:37` (sign-in button), `src/components/ui/SubmitButton.tsx:16-17` (submit button on all three public forms), `src/components/admin/SettingsForm.tsx:32` (`SettingsHeader` "Save Changes"), `src/components/admin/CategoryProductsManager.tsx:360` ("Add product"), `src/app/admin/(dashboard)/submissions/page.tsx:38` (active tab), `src/app/not-found.tsx:15` (hover state), `src/app/(website)/(marketing)/sustainability/page.tsx:167` (hover state), `src/app/layout.tsx:65` (text-selection highlight)
  - **Flags:** schema-touching: **no** · sensitive: **no** by content (className-only), but two files sit under `src/app/admin/**` · UI: **yes**
  - **Acceptance:**
    - Every text-on-fill pair in these eight usages meets WCAG AA (≥ 4.5:1, or ≥ 3:1 only where the text qualifies as large) in every state it has: resting, hover, focus, active/selected, and text selection. Disabled states are exempt under WCAG. Each usage and state gets its measured ratio in a `docs/qa-evidence/T-020/` contrast log, using the T-004 log's method (real `tailwind.config.ts` hex values, measured on the real background).
    - One consistent treatment across all eight, chosen by `/ui-ux`. There's an in-repo precedent: `text-white` on `bg-primary` on the admin "Post New Job" and "Publish New Report" buttons (`CareersClient.tsx:60`, `ReportsClient.tsx:84`). PM arithmetic puts that at about 7.6:1, for `/ui-ux` to confirm. No new color token unless `/ui-ux` records why.
    - This includes hover states that swap to `text-primary` on a dark background, such as `SubmitButton`'s `hover:bg-transparent hover:text-primary`. By PM arithmetic that pairing is also under 4.5:1 (about 2.2:1 on `#1a1f1a`), again for `/ui-ux` to confirm.
    - Layout, sizing, copy and brand hue are otherwise unchanged. `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` (className-only diff; required by WORKFLOW §5's literal `src/app/admin/**` trigger) → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Security-sensitive row, UI)
  - **Notes:** Ranked #8, with T-011 straight after it. Kept separate from T-011 for a clean revert: this is one CTA color treatment across public and admin, while T-011 is admin label opacity and focus rings in two shared components. Out of scope: `text-primary` used as plain, non-CTA text on dark backgrounds (e.g. admin kicker labels); `/ui-ux` logs it as its own finding if it fails. This touches the public forms' CTA; §10 is inert, so there's no marketing review.

- [ ] **T-021** — Give catalog photos on `/what-we-do` and the category pages a meaningful accessible name
  - **Source:** `docs/QA_REPORT.md` Static Pass — T-005 WARN-4, 2026-09-27 ("Recommend: `/pm` fast-follow across both `what-we-do/page.tsx` and `[category]/page.tsx` together")
  - **Files:** `src/app/(website)/(marketing)/what-we-do/[category]/page.tsx` (product photo, `alt=""` plus `aria-hidden`, :142), `src/app/(website)/(marketing)/what-we-do/page.tsx` (category-card photo, :133)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes** (public)
  - **Acceptance:**
    - Each product photo on `/what-we-do/<slug>` has a non-empty accessible name (e.g. `alt={product.name}`) and is no longer `aria-hidden`. A product whose name is empty (the server doesn't require one) still gets a non-empty `alt`; the fallback wording is `/ui-ux`'s call.
    - The `/what-we-do` category cards get the same treatment, unless `/ui-ux` records why a decorative image is correct inside that linked card: the link text already names the category, so an `alt` repeating it would be read twice.
    - Visual output is unchanged. `/qa live` confirms the rendered `alt` on `/what-we-do` and all eight category pages. `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Full-stack row)
  - **2026-10-03:** folded into **T-024** (the shared catalog components rebuild both of these images). It closes when T-024 merges.
  - **Notes:** Ranked #11. It matters now because T-004 lets real products exist. If real products exist by the time `/qa live` runs, that pass also closes T-005 INFO-4 (the populated grid's variable-height cards were only ever reasoned through statically).

- [ ] **T-022** — Stop `/sitemap.xml` from stamping every URL as modified on every request
  - **Source:** `docs/QA_REPORT.md` Static Pass — T-005 WARN-2, 2026-09-27 (live-confirmed in that ticket's Live Pass, Flow 4: `docs/qa-evidence/T-005/sitemap/lastmod-drift-check.log`)
  - **Files:** `src/app/sitemap.ts` (10 `lastModified: new Date()` sites)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **no**
  - **Acceptance:**
    - `<lastmod>` values no longer come from request time or process start, so they stay stable across requests and across serverless instances. Omitting `<lastmod>` satisfies this. Two fetches a few seconds apart return identical `<lastmod>` values, or none; today every entry changes on every fetch.
    - All 17 entries (9 static, 8 categories) are still present, with unchanged `loc`/`changefreq`/`priority`, in the same order, and the file is still valid XML (the T-005 Live Pass parse method).
    - `npx tsc --noEmit` and `npm run build` stay clean.
  - **Sequence:** `/git Start` → `/lead-dev` → `/qa static` → `/qa live` → `/git Merge` (WORKFLOW §3, Backend-only row)
  - **Notes:** Ranked #12. This has been live since the 2026-09-28 deploy: every crawl sees all 17 URLs as "just modified". T-005 WARN-1's comment-only fix rides along with T-018 instead, which already edits that function under `/cso review`. §10 is inert, so there's no `/seo` review.

## GENESIS blueprint follow-up — 2026-09-28 (A-Team V7)

- [ ] **T-023** [db] [sec] — Admin allowlist: only named FAL admins can use `/admin` or write data, even if Supabase sign-ups are ever turned back on
  - **Source:** GENESIS GATE 2 (the blueprint the owner approved on 2026-09-28); `docs/RISKS.md` R1; `docs/SECURITY.md` SEC-HIGH-2, plus `/cso`'s 2026-09-28 recommendation to rank an admin-role fix above T-015 and T-018.
  - **Files:**
    - a new `db/migrations/0002_admin-allowlist.sql` (`supabase-engineer`);
    - `src/lib/supabase/middleware.ts` (the `/admin` gate checks the allowlist);
    - one shared `requireAdmin()` replacing the per-file session checks in `settings-actions.ts`, `products-actions.ts`, `jobs-actions.ts` and `media-actions.ts`;
    - every `authenticated` RLS policy, including `submissions` SELECT;
    - `supabase-schema.sql` and `docs/DATA_MODEL.md`.
  - **Acceptance:**
    - A signed-in account that **isn't** on the allowlist can't reach `/admin`: it's redirected, with an honest "not authorized" message. Every writing Server Action returns `{ ok: false, error: "…not authorized…" }` for it, and RLS denies its reads and writes on every table, `submissions` included. Test this as another user: the migration's VERIFY block gives the owner an SQL-editor check that impersonates a non-admin, and the manual checklist covers the UI.
    - The existing FAL admin account keeps full access, confirmed by the owner's checklist.
    - The allowlist lives in the database, not in code. Adding or removing an admin is a documented owner SQL step (`docs/DATA_MODEL.md`).
    - No new blanket `USING (true)` policy for `authenticated`.
    - `npx tsc --noEmit` and `npm run build` are clean. The production-build check passes, because the gate lives in middleware.
  - **Sequence:** `premortem-planner` → **`/debate`** (a one-way door: allowlist table, JWT custom claim, or app-only check) → owner decision recorded in `docs/DECISIONS.md` → `supabase-engineer` (migration) → `security-reviewer` → **HARD STOP: the owner applies the SQL** → `/build` (middleware + `requireAdmin`) → `security-reviewer` → `/qa` (production build + owner checklist) → review → merge.
  - **Notes:** Until this ships, keeping Supabase sign-ups **OFF** is the only safeguard. It's a one-way door because it changes every access policy. Rank it ahead of T-018 and T-019: it's the structural fix those findings keep pointing at.

## Client request — 2026-10-03: the `/products` catalog (A-Team V7)

**Source:** the client's request, relayed by the owner on 2026-10-03:
- a `/products` page;
- category pages under `/products/<slug>`;
- a way to add categories in the admin.

The owner added a "View all products" button on `/what-we-do`. The owner's decisions, batched once on 2026-10-03, are in `docs/DECISIONS.md` §3.

**This run goes first, in this order: T-024 → T-025 → T-026 → T-016.**
- Each ticket is built in place on its own branch, one at a time, with no worktrees: a second checkout would need a copy of `.env.local`.
- T-025 and T-026 both edit `settings-actions.ts`, and T-026 and T-016 both edit the product editor, so they can't overlap anyway.

- [ ] **T-024** — Shared catalog components: the category photo-card grid and the product card, with meaningful image names [app:site][design]
  AC:
  - One reusable category photo-card grid renders today's `/what-we-do` "Product Catalog" cards with the same look: photo, dark gradient, serif title, 2 columns on phones and 4 from `md`. Each card is a link, and the page passes in its destination.
  - One reusable product card and product grid render today's category-page product tiles (image, name, description), with the same look.
  - `/what-we-do` and the category page render through these components with **no visible change**, shown by screenshots before and after at 360, 768, 1024 and 1440.
  - Every catalog photo gets a meaningful accessible name (the category or product name) instead of `alt=""` plus `aria-hidden`. This closes **T-021**. If `/design-review` judges a photo decorative inside a link that already names it, that reasoning is recorded instead.
  - Semantic tokens only. Motion keeps the existing `ScrollReveal` and `prefers-reduced-motion` behavior.
  Touches:
  - new `src/components/catalog/*`. This is new: INVENTORY has no such component, and the markup is inline in the two pages today;
  - `src/app/(website)/(marketing)/what-we-do/page.tsx` and `…/what-we-do/[category]/page.tsx` (refactor only).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge.
  Risk: low. It's shared UI, so it runs first and alone.

- [ ] **T-025** — Move category pages to `/products/<slug>`, and add the `/products` overview page, the "View all products" button and the "Products" menu item [app:site][design][sec]
  AC:
  - **`/products`:**
    - a page header;
    - the category photo-card grid, with every category linking to `/products/<slug>`;
    - below it, one section per category **that has products**. The heading is the category name, linking to its page, and its products follow in a grid.
    - Categories with no products get no empty section. While no category has products (the live state on 2026-10-03), one honest note says products are being added. There are no placeholder products.
    - If the product read fails, the page still shows the category grid and logs the error server-side.
  - **Category pages** are served at `/products/<slug>` with today's content.
    - The back link goes to `/products`.
    - Canonical and OpenGraph URLs use the new path.
    - An unknown slug is still a 404.
  - **Old links keep working.** `/what-we-do/<slug>` permanently redirects (308) to `/products/<slug>` (`next.config.ts`). `/what-we-do` itself is unchanged.
  - **Every internal reference uses the new path:**
    - the `/what-we-do` category cards;
    - `sitemap.ts`, which adds `/products` and moves the category entries to `/products/<slug>`;
    - the `revalidatePath` targets in `settings-actions.ts` and `products-actions.ts`, which add `/products` and `/products/<slug>`;
    - the slug-collision messages in `site-content.ts`.
  - **A "View all products" button** sits in the `/what-we-do` Product Catalog section, under the category grid, and links to `/products`. It uses the existing button style, with AA contrast and a visible focus ring.
  - **"Products"** is added to `MAIN_NAV` right after "What We Do" (header and mobile menu) and to the footer links, so URLs keep matching menu names.
  - `/products` has its own metadata (title, description, canonical, OpenGraph), following the existing page pattern.
  - **Read-only live QA:**
    - all 8 old URLs redirect;
    - every new URL answers 200;
    - the sitemap lists the new paths;
    - no hidden category id leaks;
    - screenshots at 360, 768, 1024 and 1440.
  Touches:
  - new `src/app/(website)/(marketing)/products/page.tsx`;
  - `products/[category]/page.tsx`, moved from `what-we-do/[category]`;
  - `next.config.ts`;
  - `src/app/sitemap.ts`;
  - `src/app/actions/settings-actions.ts` and `products-actions.ts` (revalidate targets only);
  - `src/lib/site-content.ts` (message text only);
  - `src/lib/nav.ts`;
  - `src/components/global/Footer.tsx`;
  - `what-we-do/page.tsx`.
  Sequence: `premortem-planner` (it touches `next.config.ts`) → `/build` → `/design-review` → `/security-review` → `/qa` (live, read-only) → `code-reviewer` → merge.
  Risk: the URL change, mitigated by the permanent redirect. Slugs stay as they are: `/products/t-shirts`, not the client's "t-shirt".

- [ ] **T-026** — A dedicated admin "Products" page for categories and their products [app:admin][design][sec]
  AC:
  - A new admin page, `/admin/products`, appears as "Products" in the admin sidebar. It has two parts:
    - **Categories:** add ("Add category"), rename, change the image and description, reorder, delete;
    - **Products in each category:** the existing product manager.
  - `/admin/business` keeps only the What We Do page text ("Our Craft" and the Product Catalog intro copy), plus a one-line pointer to `/admin/products`.
  - **The two pages can't overwrite each other.** They share one stored record, `site_settings.business`.
    - Each page's save changes only its own fields.
    - A stale tab on one page can never wipe the other page's edits.
    - `architect-reviewer` sets the exact design before building.
    - Category saves keep every existing rule: server-issued ids, frozen slugs, collision rejection and the delete guard.
  - The first-Save step stays visible. Until the categories have been saved once, the products part says so and points to the Categories Save.
  - Help text names the new public URLs (`/products/<slug>`).
  - The security posture is unchanged:
    - the page sits behind the existing `/admin` gate;
    - every write checks the session;
    - RLS is unchanged, and there are no new database objects.
  - `/qa` writes the owner's manual checklist into `docs/QA_REPORT.md`, because agents can't sign in. The admin UI is **NOT VISUALLY VERIFIED** by agents.
  Touches:
  - new `src/app/admin/(dashboard)/products/*`;
  - `src/app/admin/(dashboard)/business/{page,BusinessClient}.tsx`;
  - the admin sidebar (`src/app/admin/(dashboard)/layout.tsx`);
  - `src/app/actions/settings-actions.ts` (the partial-save contract);
  - `src/components/admin/*` labels. This is reuse: `ObjectListEditor` already takes `addLabel`.
  Sequence: `architect-reviewer` (the cross-page save contract) → `premortem-planner` (admin writes) → `/build` → `/design-review` (code-level only) → `/security-review` → `/qa` → `code-reviewer` → merge.
  Risk: the shared record. Two admin pages saving one record is exactly the overwrite risk the architect review is for.

After T-026 this run also does **T-016** (above), by the owner's decision on 2026-10-03, because staff are about to use the product editor.

### Dependency Order

**2026-10-03:** the `/products` client request above runs first: T-024, then T-025, then T-026, then T-016. T-021 is folded into T-024. After that, the order below resumes, without T-016, which is done in that run.

**Refreshed 2026-09-28 (fourth `/pm` pass).** The T-005, T-012 and T-004 entries are gone: all three merged, shipped in the 2026-09-28 deploy, and were archived into `docs/MEMORY_BANK.md` §12 (`87e7a09`, `846ac6e`). The earlier "consider landing before T-004" notes on T-010 and T-013 are also superseded. T-004 built a new component with stable row keys, so it doesn't extend `ObjectListEditor`, and its ▲/▼ controls call `reorderCategoryProducts` directly on production. Everything is ranked by live risk to the client now that Sprint 1 is on production. `/system-architect sprint` stops at `/archivist` after the 3rd merge, so items 1–3 are what ship next. Nothing reaches production until the user types "deploy" again.

**Ships next: the top three.**
1. **T-006.** Publicly known Next.js advisories, including the null-origin Server Actions CSRF bypass, now front every live admin write, product create and delete included, and the fix is a lockfile-only bump that agents can verify end to end. It goes first so every later ticket is built and verified on the framework version production will run.
2. **T-015.** This is the only other open High (SEC-HIGH-5). Report, job-posting and leadership edits on shipped admin pages fail with no message, and a failed leader-profile save gives no signal at all. The same pass adds the session check those ten write actions skip.
3. **T-016.** The client's staff are about to populate the catalog. Four ordinary-use gaps in the new editor can silently put the wrong image or content on buyer-facing category pages: T-004 WARN-1/2/3, plus a save per keystroke in the path box. Fixing them before first use costs less than cleaning up bad catalog data afterwards.

**Next batch (after the `/archivist` stop):**
4. **T-014.** `/cso` asked for this before deploy twice. The image-URL gap is now live and reachable through ordinary staff use of the path box (SEC-MED-13). It must follow T-016, or the allow-list would flag each keystroke of a typed `https://` URL.
5. **T-017.** About 160 failed requests fire on every desktop visit to every public page, and this is the smallest, fully agent-verifiable fix in the backlog. It sits below the data and security tickets because it's pre-existing (not introduced by the deploy) and perf-only.
6. **T-013.** `reorderCategoryProducts` now sits behind the live ▲/▼ controls. A failure mid-reorder leaves a mixed order until the next full reorder.
7. **T-019.** Media Center adds and deletes fail with no signal in any environment, and a failed upload still publishes a broken item on `/life-at-fashion-asia`.
8. **T-020.** Text contrast is about 2.77:1 on `/admin/login`'s sign-in button and on the submit button of all three public forms.
9. **T-011.** Straight after T-020: the same `/ui-ux` contrast work, on admin micro-labels and upload focus rings.
10. **T-008.** Sitewide security headers. `/admin/login` still has no clickjacking defense on production.
11. **T-021.** Catalog photos are hidden from screen readers, which matters now that products are about to exist.
12. **T-022.** Every sitemap URL has claimed "modified now" on every crawl since the deploy.
13. **T-018.** Must follow T-015, whose converted functions it covers.
14. **T-009.** `ImageUploadField`'s re-pick race and advisory edge cases. Staff now upload through it on product rows too.
15. **T-007.** A server-side pixel-dimension check. Only reachable by a crafted call.
16. **T-010.** Stale warnings on reordered category and facility cards only. The product editor doesn't use `ObjectListEditor`.

**User actions that gate real use (not tickets, listed so the orchestrator raises them):**
- (a) The `/admin/business` bootstrap Save, before any other `/admin/business` edit.
- (b) SEC-HIGH-2: `/auth/v1/settings` must read `disable_signup: true`, and the user reviews Authentication → Users.
- (c) The pending T-002, T-003, T-012 and T-004 manual checklists. T-004's Step 1 is (a).
