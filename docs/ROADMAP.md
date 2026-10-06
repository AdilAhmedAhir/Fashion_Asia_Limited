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
  - **Re-scoped 2026-10-04** (T-016's `architect-reviewer`; DECISIONS 2026-10-04):
    - T-010 now also owns the **shared upload race** on `ObjectListEditor` image lists: `ImageUploadField` calls the `onChange` it captured when an upload started (`ImageUploadField.tsx:126-128`), and `ObjectListEditor.update` builds the new list from that older `items`.
    - The result: on every image list (the categories on `/admin/products`, the homepage facility photos), typing during an upload can be reverted, and clicking Save categories during an upload silently drops that image.
    - It also owns T-009's race when a second image is picked before the first finishes uploading.
    - **The fix needs stable row keys first.** A "call the latest callback" fix alone would put an uploaded image on whichever row slid into that position after a reorder, which is worse than today's revert. So the deferred rekey below is now in scope.
    - It needs its own `/architect-review`, because it changes a shared admin component used in 6 places. Order: after T-016 and T-033.
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
  - **2026-10-04, extended from T-026's `/design-review`** (measured in a synthetic render of `/admin/products` and `/admin/business`):
    - Small labels ("TITLE", "#n", "CARD IMAGE") measure 2.6:1, and the group label 3.8:1. Both need AA.
    - Input and picker focus indicators measure about 1.2–1.5:1 and need a visible ring.
    - Accessible names are missing on 16 fields on `/admin/products` and 3 on `/admin/business`. Row buttons are named only "Move up"/"Remove", and 7 chip-remove buttons have no name.
    - Add `min-w-0` to the chip input, so the "Process Steps" Add button stops poking out of its card at 360 px.
    - These components now live on `/admin/products` too (the category cards).

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
  - **2026-10-05 (T-016 `/security-review`): now unblocked.** T-016's path box saves only on blur or Enter, so the allow-list will no longer refuse every keystroke of a typed `https://` URL. Still open here: the image URL allow-list (SEC-MED-7/13), the create path's caller-supplied `sort_order` (SEC-MED-11, halved by T-016: an update can no longer write `sort_order`), and the 255-character name cap (SEC-INFO-15). With T-016, the server already refuses a name or image without a visible character.

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

- [x] **T-016** — Fix the product editor's ordinary-use data bugs before staff start using it [app:admin][design][sec]
  Done 2026-10-05:
  - **Commits:**
    - `afb7997`: the contract, the premortem and the split folded in;
    - `44cdfb2`: the server and both pages (partial update, the `{ ok }` read with a `Map`, `hasVisibleText`);
    - `eabec4b`: one save queue per product, and the opt-in `commitPathOnBlur`;
    - `09702d0`: design FIX FIRST (type-scale errors, a cue on the busy path box, "Deleting…", the 360 wrap, the notice copy).
  - **Reviews:**
    - `architect-reviewer`: REVISE (doc-only, folded), then rulings on C1–C6, then a build check of the builder's 5 judgment calls: all inside the contract, with no re-review trigger.
    - `premortem-planner`: GO WITH ADDITIONS (13 MUST-ADDs).
    - `code-reviewer`: SHIP twice (`eabec4b`, `09702d0`). Codex: SKIPPED (not connected).
    - `security-reviewer`: CLEARED, with no Critical, High or Medium findings. It re-bound the four server files by sha256 at `eabec4b` (unchanged by `09702d0`); the three client files are bound by 5 rules. SEC-INFO-37 and SEC-INFO-20 are closed in code; SEC-MED-11 is halved.
    - `design-reviewer`: FIX FIRST, then SHIP. This used a SYNTHETIC harness: the admin is NOT VISUALLY VERIFIED against the live login.
    - QA: PASS (offline suites, wire-level requests, the Map round trip, MUST-ADD 8's public HTML identical to the baseline, the live admin-gate matrix), plus a static re-check PASS on `09702d0`.
  - **Tests** (scratchpad harness, evidence in `docs/qa-evidence/T-016/`): server 117/117, Map 14/14, `hasVisibleText` 111/111, UI 269/269 (production and StrictMode dev), mutations 40/40.
  - **Also fixed:** T-004 QA INFO-1. A failed reorder now swaps the two products back by id, so a delete during a failing reorder no longer brings the row back (`architect-reviewer`, judgment call 2).
  - **Owner checklist:** `docs/QA_REPORT.md`, "Manual Checklist — T-016 — 2026-10-05". Rows 1, 2, 3, 7 and 11, plus T-025 row 4 rerun on this build, block deploy, alongside T-026 rows 1–3 and 7. **The staff freeze** runs from the first Save until the deploy's live check. Errata for the older checklists are in the same file.
  - **Accepted visible changes:** DECISIONS 2026-10-05.
  - **Follow-ups:** T-033 (plus the NOTHING_TO_SAVE rewording), the re-scoped T-010, new T-034 (a leave-page prompt, plus two status/copy nits), and notes on T-014 (now unblocked) and T-018 (QA I1).
  **Binding contract (`architect-reviewer`, 2026-10-04: REVISE, doc-only; folded here verbatim, so no second `/architect-review` is needed).** It needs no migration, SQL, new dependency or new database object, so there's no owner HARD STOP. **Where the older notes, AC or Files below conflict with this contract, the contract wins.**
  - **Scope guard:** code only. These stay untouched: `settings-actions.ts`, `SettingsForm.tsx` (`ObjectListEditor`), `category-draft.ts`, `ProductsClient`'s draft/confirmed logic, `resolveCategoriesForSave`, `src/components/catalog/*`, `/products/[category]`, `next.config.ts`, `db/` and `supabase-schema.sql`. No new exported function in any `"use server"` file; type exports are fine.
  - **Facts behind it** (checked read-only):
    - `Object.create(null)` crashes `/admin/products`. React 19.2.4's serializer throws on null-prototype props ("Classes or null prototypes are not supported"); a `Map` survives the trip to the client.
    - Next runs one Server Action at a time per tab, but documents that as an implementation detail that may change. So within one tab, WARN-1 is stale closures and responses overwriting newer typing; across tabs, whole-row writes clobber edits and `sort_order`. The fix must not depend on one-at-a-time.
    - `products.category_slug` and `products.name` are `VARCHAR(255)` (migration 0001), so 255 is a schema limit, not a policy number.
    - There's no `error.tsx` in `src/app`, so a thrown read on `/admin/products` lands on Next's bare error page.
    - `checkCategoryAttachable` reads through `getSettings`, which falls back to code defaults (no ids) on a failed read. That refuses the product write with a misleading message but fails closed; a "re-check after insert, then delete" built on it could delete real products.
  1. **The product read** (`products-actions.ts`).
     - New type: `export type AllProductsRead = { ok: true; byCategory: Map<string, CategoryProduct[]> } | { ok: false };`
     - New signature: `getAllCategoryProducts(): Promise<AllProductsRead>`. The query stays the same: `select("*")`, ordered by `category_slug`, then `sort_order`. Rows are grouped into a `Map` in query order, by a private helper.
     - A database error is logged with `console.error` on the server and returns `{ ok: false }`. A throw calls `unstable_rethrow(error)` first, then logs and returns `{ ok: false }`. The function never rejects, except with Next's own control-flow signals. `ok: false` carries no error text, the same shape as `EditorSettingsRead`.
  2. **The public `/products` page.** `ok: false` renders as an empty catalog: the category grid plus Coming Soon (DECISIONS 2026-10-04). The action has already logged it. The existing rejection handler stays, with `unstable_rethrow`. The database-error path looks exactly as it does today; a thrown read (today only the `constructor` crash) now shows Coming Soon too. Rewrite the comment above `ProductRead`. `getCategoryProducts` and `/products/<slug>` don't change.
  3. **The admin load.** `ProductsLoad = { ok: true; categories: Product[]; products: AllProductsRead } | { ok: false }`.
     - A failed category read still turns the whole page off, as today.
     - When `products.ok` is false, the "Products in Each Category" card shows only a fixed-copy `role="alert"` (PRODUCTS_LOAD_FAILED): no picker, no add form and no rows, so "No products in this category yet" can't appear.
     - The category editor stays usable, because the server's delete guard re-counts products. The load is read once (`useState(load)`), so only a manual refresh brings the products back.
  4. **The editor's grouped state** (`CategoryProductsManager`). The prop becomes `initialProductsByCategory: ReadonlyMap<string, CategoryProduct[]>`. State is a `Map`; every lookup is `.get(slug) ?? []`, and every update builds a new `Map`. No lookup by slug on a plain object remains, which closes the browser half of SEC-INFO-37.
  5. **`updateCategoryProduct` becomes a partial update.**
     - In `site-content.ts`: `export type CategoryProductPatch = Partial<Pick<CategoryProduct, "name" | "description" | "image">>;`
     - New signature: `updateCategoryProduct(id: string, patch: CategoryProductPatch): Promise<ProductActionResult>`. In this order:
       1. `getUser()` is the first await (SESSION_EXPIRED).
       2. An empty `id` returns "Missing product id."
       3. Take only `name`, `description` and `image`, and only when each is an own property whose value is a string. Anything else, including `null`, a number or an object, is ignored, never turned into "". Trim what's taken, the way `sanitizeInput` does. *(Amended 2026-10-04, premortem C3.)* `createCategoryProduct` keeps `sanitizeInput` unchanged: a non-string name or image there becomes "" and fails item 7.
       4. If none is present, return NOTHING_TO_SAVE.
       5. Validate (item 7) before any database read.
       6. Read the row's stored `category_slug` with `.maybeSingle()`. No row returns PRODUCT_NOT_FOUND.
       7. Run `checkCategoryAttachable` on that stored slug, never on a value the client sent.
       8. Update only the fields taken in step 3, plus `updated_at`, then `.select().maybeSingle()`. Null returns PRODUCT_NOT_FOUND.
     - **It never writes `category_slug` or `sort_order`.** Any other key in the payload is ignored. *(Corrected 2026-10-04, premortem C5:)* that doesn't protect tabs left open across the deploy. With Vercel Skew Protection they keep calling the old deployment's whole-row update; without it, their action ids don't resolve, because Next recalculates them between builds. `/ship`'s staff freeze and tab reloads are what protect them.
  6. **WARN-1: one save queue per product**, owned by `CategoryProductsManager` and keyed by product id, inside `CategoryProductsManager.tsx`; no new shared module. *(Amended 2026-10-04 from the premortem, C1 and C2.)*
     - **The queue belongs to the product, not to the row on screen.** A row that unmounts (a category switch) and mounts again uses the same queue. So a product never has two saves in flight, and a commit waiting to be sent is never dropped or sent twice.
     - At most one update is in flight per product. Commits made meanwhile merge into exactly one follow-up save, sent when the first one settles.
     - A save sends only what the user has committed: Name or Description on blur (Tab or a click away) when changed, the path box on blur or Enter, an upload finishing, or Retry. Text still being typed is never sent.
     - Each save's fields are worked out at send time: whatever differs between the committed values and the last confirmed values. Both are read through refs, never from an older captured closure, so `ImageUploadField.tsx:126-128`'s stale `onChange` can't do harm. If nothing differs, nothing is sent.
     - Committed saves, including a waiting follow-up, are always sent and always reach `onSaved`, whether or not their row is on screen. There's no is-mounted check anywhere in the save path.
     - **The draft follows the product.** While a row is on screen, whenever its confirmed values change (its own save landing, or any other change to the `product` prop), each draft field the user hasn't changed since it was last synced or sent takes the new value. A field the user has changed keeps their text.
     - **Status:** a row shows its product's save state wherever it mounts. "Saving…" shows while a save is in flight or waiting. "Saved" shows only once nothing is waiting and the latest attempt succeeded, so never while the latest attempt failed.
     - **After a failure** (`ok: false` or a throw), keep the draft and show that error with Retry. The queue keeps working: a commit already waiting when the failure lands is sent, and every later commit, and Retry, goes through the queue like any other. Each save is built from all the committed values, so it carries the failed fields too. Starting a send clears the error. A commit or Retry with nothing to send also clears it, because the row then matches the server.
     - **Nothing retries on its own:** no timers, no backoff, and no resend unless the user has committed something or pressed Retry since the failure. A commit that was already waiting when the failure landed counts as the user's.
     - Name, Description and the path box stay editable during a save (today they're disabled, which drops keys typed after tabbing out mid-save). Up, down and delete stay disabled while their product has a save in flight or waiting.
  7. **Validation (the domain rule).**
     - The helper: `export function hasVisibleText(value: unknown): boolean` in `site-content.ts`. True only for a string with at least one character other than whitespace, invisible formatting characters (`\p{Default_Ignorable_Code_Point}`) or control characters (`\p{C}`); one module-level regex with the `u` flag. Checked with TS 5.9.3 at the ES2017 target and in Node: zero-width space, LRM, RLO, BOM and U+3164 are rejected; Bengali text passes.
     - `createCategoryProduct`: after `getUser()` and the check that a category slug was sent, and before any read, the trimmed `name` and `image` must pass `hasVisibleText` (PRODUCT_NAME_REQUIRED or PRODUCT_IMAGE_REQUIRED). The description stays optional.
     - `updateCategoryProduct`: the same check for whichever of `name` and `image` step 3 took.
     - `AddProductForm`: `canAdd` uses the same helper. That only mirrors the rule in the browser; the server decides.
  8. **The path box** (`ImageUploadField.tsx`): one new optional prop, `commitPathOnBlur?: boolean`, default false, which keeps today's behavior exactly for every other consumer. When true:
     - typing changes only local text and never calls `onChange`;
     - blur or Enter calls `onChange(text.trim())` once, if the text differs from `value`;
     - the box's text follows `value` whenever `value` changes, unless the user has typed in the box since it last matched `value`; then their text stays until blur or Enter commits it. Finishing an upload always replaces the text with the new path. *(Amended 2026-10-04, a consequence of item 6's "the draft follows the product".)*
     - the box is read-only while an upload is in flight;
     - finishing an upload still calls `onChange(url)` straight away.

     Only `ProductRow` sets it. With the prop off, the upload path and the placeholder don't change. With it on, a finished upload sets the box's text to the new path before `onChange` (the third bullet). *(Amended 2026-10-05, `architect-reviewer`'s build check: the builder's judgment calls 1–5 are inside the contract, with no re-review trigger.)*
  9. **WARN-2:** `<AddProductForm key={selected.slug} …/>`, so switching category throws away the half-filled add form.
  10. **Error messages,** as non-exported constants. `/design-review` may tune the wording; the names, the files they live in and when they show are binding.
      - In `products-actions.ts`: SESSION_EXPIRED: "Your session expired. Sign in again and retry." (replaces the 4 existing copies, word for word); PRODUCT_NOT_FOUND: "Product not found." (unchanged); PRODUCT_NAME_REQUIRED: "A product needs a name. Type one in, then try again."; PRODUCT_IMAGE_REQUIRED: "A product needs an image. Upload one or paste its path, then try again."; NOTHING_TO_SAVE: "There was nothing to save."
      - In `ProductsClient.tsx`: PRODUCTS_LOAD_FAILED: "The products couldn't be loaded, so adding and editing products is turned off to keep them safe. Refresh the page to try again."
  11. **Page refreshes.** Create, delete and reorder: unchanged. Update: after a confirmed write, refresh only `/products/<stored slug>` and `/products`; delete the code for a product moving between categories. Reads refresh nothing.
  12. **Must not change:** `getCategoryProducts`; `createCategoryProduct`'s signature, its "add at the end" order and its category check; `deleteCategoryProduct`, and `reorderCategoryProducts` (T-013's); `getUser()` as the first await of every write; T-004's verified behaviors (product ids as row keys, save on blur, Retry, Saving→Saved, focus after delete and reorder, the first-Save banner); every other `ImageUploadField` and `ObjectListEditor` user; the public product keys, and T-025's check that the public HTML has no ids; `settings-actions.ts`, so T-026's security sign-off on that file still holds.
  - **Accepted until T-010 lands:** on every image list built with `ObjectListEditor`, including the categories on `/admin/products`, typing during an upload can be reverted, and clicking Save categories during an upload silently drops that image.
  - **How it's verified:** no agent causes a failure on the live database. WARN-3 and the `Map` grouping: code reading plus a scratch harness. WARN-1's orderings, the path box and WARN-2: rows in the owner's checklist, using `ZZ-TEST` records.
  - **Scope.** **IN T-016:** contract items 1–12 (WARN-1 and the path box; WARN-2; WARN-3's admin alert and the public page's handling of the new result; SEC-INFO-37, both halves; the server-side name and image rule with the visible-character check). **OUT:** to **T-033** (category-title and slug hygiene, the product mapper SEC-INFO-36 and the empty `ProductCard` block, the What We Do save state, the seed panel copy, the `settings-actions.ts` comment wording, the image path placeholder); to **T-010**, re-scoped (the shared upload race on `ObjectListEditor` image lists, with stable row keys); to the **backlog** (SEC-MED-5 / QA F1, DECISIONS 2026-10-04; T-014's name cap and URL allow-list; T-018's raw DB error text; T-013's reorder hardening; T-032's `checkCategoryAttachable` fail-closed message). The trimmed T-016 is about ½ day and must not grow.
  - **Touches:** `src/app/actions/products-actions.ts`; `src/lib/site-content.ts` (`hasVisibleText`, `CategoryProductPatch`, the `CategoryProductInput` comment); `src/components/admin/CategoryProductsManager.tsx`; `src/components/admin/ImageUploadField.tsx` (the opt-in prop only); `src/app/admin/(dashboard)/products/page.tsx`; `src/app/admin/(dashboard)/products/ProductsClient.tsx`; `src/app/(website)/(marketing)/products/page.tsx` (the new result shape and its comment only). **Docs at close:** this ticket's Files line; DECISIONS; STACK §4 (the new read result and the opt-in prop); DATA_MODEL §3's products row (an update writes only name, description and image); INVENTORY regenerated with `@purpose` on the 3 new exports; SECURITY and QA_REPORT from their owners.
  - **Re-review triggers** (re-run `/architect-review`): any SQL, migration, table, column, index, database function, trigger or new dependency; a new exported function in a `"use server"` file, or a signature change to a product action other than items 1 and 5; any edit to `settings-actions.ts`, `resolveCategoriesForSave`, `ObjectListEditor` or the category draft/confirmed logic; any change to `ImageUploadField` beyond the opt-in prop; `Object.create(null)` or any class instance passed to a client component or returned from a Server Action; `updateCategoryProduct` writing `sort_order` or `category_slug`; a clean-up delete or an automatic retry in any product write; any visitor-visible change on `/products` beyond item 2, or on `/products/<slug>`; pulling T-033 or T-010 items into T-016.
  - **Sequence (V7):** `architect-reviewer` ✅ REVISE, doc-only, folded (2026-10-04) → `premortem-planner` ✅ GO WITH ADDITIONS (2026-10-04) → `architect-reviewer` ✅ rulings on the premortem's C1–C6 folded verbatim, no re-review trigger (2026-10-04) → `/build` ✅ (2026-10-05; the architect's build check is OK) → `/design-review` ✅ FIX FIRST → SHIP (code-level only; the admin is NOT VISUALLY VERIFIED) → `/security-review` (re-binds by sha256 `products-actions.ts`, `site-content.ts`, `admin/(dashboard)/products/page.tsx` and `(website)/(marketing)/products/page.tsx`; re-checks T-026's 7 client invariants on `ProductsClient` and `CategoryProductsManager`; client invariant 1 means `ProductsClient` may import `AllProductsRead` only with `import type`) ✅ CLEARED → `/qa` ✅ PASS (static checks plus the production build on :3101, read-only; it writes the owner checklist) → `code-reviewer` ✅ SHIP → merge ✅ (2026-10-05). This replaces the V5 sequence further down.
  **Premortem (`premortem-planner`, 2026-10-04: GO WITH ADDITIONS). These MUST-ADD criteria are binding:**
  - **Top failure modes,** most likely first:
    1. A product save puts older text or an older image back over newer edits. One old path survives the queue: the image handler builds `{ ...draft, image }` from a captured `draft`; a reply is copied over newer typing; a save is fired from an effect or updater; or `ProductRow` still sends the whole row. That last one compiles, because a `CategoryProductInput` passes as a `CategoryProductPatch`.
    2. Around the deploy, the live site runs the old, buggy editor. The first Save unlocks production's old editor (`e8eace1`) until the deploy, and after the deploy old tabs call the old server (Skew Protection on) or fail (off).
    3. `/products` keeps showing Coming Soon after real products exist. Keeping `new Map(Object.entries(…))` on a Map gives no entries, or `ok: false` gets mapped onto the "no note" branch. Agent checks run against 0 live products, so neither slip shows until the first real product.
    4. An edit is lost or reverted when a row unmounts mid-save, or after a failure (contract concerns C1 and C2).
    5. The partial update's unusual branches give the wrong answer. A database error on the step-6 read reads as "Product not found." (staff then add a duplicate), and a `null` field empties the description (C3).
  1. **The save-order fix (WARN-1) is proven offline before `/qa` signs off.**
     - **Where the harness lives:** the session scratchpad only. `package.json` and `package-lock.json` stay byte-identical, and only evidence goes into `docs/qa-evidence/T-016/`.
     - **What it never touches:** `.env.local` is never read, and `@/lib/supabase/*` is never imported.
     - **Stubs:** the four product actions and `uploadOptimizedImage` are stubs whose replies the harness releases by hand.
     - **What it renders and checks:** the real `CategoryProductsManager`, checking every payload sent, the draft and the status line.
     - **The orderings:**
       - **a.** Name is committed, then Description is typed and committed while that save is in flight. Exactly one follow-up save is sent, carrying only `description`. No keystroke is lost. ▼ and the trash stay disabled throughout, with no render in between where they're enabled. "Saved" appears only after the follow-up.
       - **b.** The `onChange` captured when an upload started fires during a name save. The follow-up carries only `image`, and the new name survives.
       - **c.** A reply lands while the user is typing in a field. That field keeps the newer text; untouched fields take the server's (trimmed) value.
       - **d.** A save returns `ok: false`, then (i) Retry and, separately, (ii) a new commit without Retry. The full difference is sent once in each case. Nothing is sent by a timer, and "Saved" never shows over a failure. A thrown call behaves the same way.
       - **e.** Commit, then the row unmounts (category switch) and remounts, then the reply lands, then another field is committed. The old value is never sent, and a follow-up committed before the unmount is still sent.
       - **f.** Two instances share one stub store, standing in for two tabs. A saves the name and B saves the description: both are kept. A reorders and B saves a field: `sort_order` is untouched.
       - **g.** Retry, or a commit with nothing different: nothing is sent, the error clears, and no "Saved" shows.
       - **h.** `ProductsClient` rendered with `products: { ok: false }`. That card shows only PRODUCTS_LOAD_FAILED: no picker, no add form, no rows, no "No products…" line. The Categories card stays editable.
  2. **What a row sends.** Every `updateCategoryProduct` patch has an own key only for each field being sent, a string for every value (never `undefined` or `null`), and never `category_slug`, `sort_order` or `id`. `ProductRow` no longer uses `CategoryProductInput`.
  3. **No stale state in `ProductRow`.**
     - No `{ ...draft, … }` built from a captured `draft`.
     - Every draft update is functional or ref-based and touches only its own field; the image handler sets only `image`.
     - The draft and confirmed refs are current at every send.
     - Server Actions are called only from event handlers and from the previous save's completion handler: never during render, in a state updater, or in an effect.
  4. **After a failure (C1):** a new commit (Tab, Enter, or an upload finishing) goes through the queue like any other, and the error clears once it's sent. Retry does the same. Nothing is sent by a timer. "Saved" never shows while the latest attempt failed.
  5. **Unmount and remount (C2):** a committed save, including a follow-up committed before the unmount, is always sent and always reaches `onSaved`, with no "is it still mounted" check. While the row is on screen, a draft field the user hasn't changed follows the `product` prop when it changes; a field the user has changed keeps their text.
  6. **The partial update's other branches**, by code reading:
     - **Steps 6 and 8:** a returned `error` takes this file's error path; only `data === null` with no error returns PRODUCT_NOT_FOUND.
     - **Update validation:** `hasVisibleText` runs only on the fields present, before step 6, so an older row with an empty image can still have its description saved.
     - **Create validation:** `createCategoryProduct` checks name and image after `getUser()` and the slug check, and before `checkCategoryAttachable` or any query.
     - **Revalidation:** runs only after step 8 returns a row, and only for `categoryPath(<stored slug>)` and `PRODUCTS_PATH`.
  7. **The `Map`, end to end.**
     - **Typed read-only:** state is typed `ReadonlyMap<string, readonly CategoryProduct[]>`, so changing it in place fails tsc. Every update builds `new Map(prev)` inside the updater.
     - **Grep:** the touched files contain none of these on a products map: `Object.entries`, `Object.keys`, `Object.fromEntries`, object spread, `JSON.stringify`, or a bracket lookup. There's no `Object.create(null)` anywhere.
     - **No client fetch:** no client component imports `getAllCategoryProducts` (T-026 client invariant 1).
     - **Round trip:** a harness using Next 16.3.6's own compiled React server-to-client serializer (under `node_modules/next/dist/compiled/`) round-trips a `ProductsLoad` whose `byCategory` has the keys `constructor`, `toString` and `t-shirts`, plus a second case with `products: { ok: false }`. Both decode to an equal `Map`.
  8. **`/products` for visitors.**
     - **Code reading:** `ok: true` builds sections with `byCategory.get(slug) ?? []`, in the staff's category order; `ok: false` shows the grid plus Coming Soon; the rejection handler keeps `unstable_rethrow`.
     - **The baseline:** the HTML of `/products`, all 8 `/products/<slug>` pages and `/what-we-do`, captured before `/build` changes any source. It was captured 2026-10-04 from build `FswViKlxkyJ_aN3x-CSSt` (`main` @ `2c77b0c`) on :3101 into the session scratchpad `t-016/baseline-2c77b0c/`: all 200, 0 UUIDs.
     - **After the build:** the same pages are identical once build ids and asset hashes are normalized, with no catalog write in between, and they have 0 UUID-shaped strings.
     - **Build output:** the route table still shows `ƒ /products`, `ƒ /products/[category]` and `ƒ /admin/products`, and the build log has no product-read error line.
  9. **`hasVisibleText`**, run in a small offline harness in both Node and headless Chrome:
     - **Rejects:** `""`, plain whitespace, NBSP, U+3000, U+200B, U+200D, U+200E, U+202E, U+FEFF, U+00AD, U+2060, U+180E, U+FE0F and U+3164, alone and mixed.
     - **Accepts:** "Polo"; Bengali with a hasant and a ZWJ conjunct (for example "ক্‍ষ"); Bengali digits; "👕"; a ZWJ emoji family; "A" followed by U+200B.
     - **Non-strings** return false.
     - **Repeat calls:** the same input gives the same answer twice in a row, so the module-level regex has no `g` or `y` flag.
     - **tsc at ES2017:** passes with only the `u` flag, no `v`.
     - **Recorded as accepted passes:** a lone combining mark (U+0301) and U+2800.
  10. **The path box (`commitPathOnBlur`)**, checked with a harness of `ImageUploadField` in both modes.
      - **Prop omitted:** every keystroke calls `onChange` with the raw, untrimmed text, as today. The diff against `main` in that path is only the prop's presence.
      - **Prop on:**
        - typing calls nothing;
        - Tab or Enter calls `onChange(text.trim())` once when `text.trim() !== value`, and Enter followed by blur calls it once in total;
        - when the trimmed text equals `value`, nothing is called and the box resets to `value`;
        - the box's text changes only when `value` changes;
        - the box is read-only, not disabled, during an upload;
        - a finished upload calls `onChange(url)` at once;
        - Enter during IME composition doesn't commit.
  11. **Scope and security sign-offs.**
      - **Scope:** `git diff main --stat` lists only the Touches files plus docs.
      - **`site-content.ts`:** changes only by `hasVisibleText`, `CategoryProductPatch` and the `CategoryProductInput` comment.
      - **Exports:** `products-actions.ts` exports the same 6 functions plus types, and no constant.
      - **0-byte diffs:** `settings-actions.ts` (T-026 sha256 `2785952a…`), `settings-read.ts` (`cc5c8a2c…`), `business/page.tsx` (`87071736…`), `SettingsForm.tsx`, `category-draft.ts`, `src/components/catalog/*`, `products/[category]/page.tsx`, `media-actions.ts`, `nav.ts`, the middleware, `next.config.ts`, `db/` and `supabase-schema.sql`.
      - **Re-binds:** `/security-review` re-binds by sha256 the four files whose sign-off T-016 voids: `products-actions.ts` (T-026 `44b47ada…`), `site-content.ts` (T-026 `465f6712…`), `admin/(dashboard)/products/page.tsx` (T-026 `1067bb51…`) and `(website)/(marketing)/products/page.tsx` (T-025 `af42e298…`).
      - **Client invariants:** it also re-checks T-026's 7 client invariants on `ProductsClient` and `CategoryProductsManager`.
  12. **Owner checklist:** `/qa` writes "Manual Checklist — T-016 — <date>" from the rows below, quoting the final strings after `/design-review`. Rows 1, 2, 3, 7 and 11, plus T-025 row 4 rerun on this build, block the deploy. A fail in any other row reopens T-016.
  13. **`/ship`** carries the additions below.
  - **Owner checklist rows, for `/qa`.**
    - **Before you start:**
      - **Build:** the production build of `main` after T-016 merges (it includes T-026), at `http://localhost:3101`. Never use :3001. Close tabs from earlier builds.
      - **One sitting, in this order:** T-026 rows 1–2 (the first Save), then these rows, then T-025 rows 3–7 (option A), then T-026 rows 3–7. T-004 rows 3–6 count as done if rows 1–3 and 11 here pass.
      - **Everything writes to the LIVE database.** Keep it short and finish with row 11.
      - **Staff freeze:** from the first Save until the deploy's live check passes, FAL staff must not add or edit products or categories, because the first Save unlocks the live site's old editor. Plan the deploy for the same day.
      - **Category:** use Sportswear only if it has no real products.
      - **Slow rows:** use Chrome DevTools → Network → "3G" for rows marked slow. Count saves as POST requests under Network → Fetch/XHR.
      - **Don't edit categories while a category image is uploading** (the known T-010 issue).
      - **Photo:** only row 1 needs one (JPG or WebP, under 400 KB, at most 2400 px).
    - **The rows:**
      0. **Set up.** Under Sportswear, add `ZZ-TEST T-016 one (delete me)` and `ZZ-TEST T-016 two (delete me)`, each with the path `/images/client/product-sportswear.webp`.
      1. **Several edits on one row (slow). Blocks deploy.** Rename "one" to `ZZ-TEST T-016 এক (delete me)` and press Tab. While "Saving…" shows, type `ZZ desc` in Description and press Tab, then replace the image. **Expected:** no character is lost or jumps back; ▼ and the trash stay disabled until the end; "Saved" shows once; after a reload all three changes are stored and show on `/products/sportswear`.
      2. **The path box. Blocks deploy.**
         1. In "two", type `/images/client/product-tshirts.webp` and press Tab. Expected: no POST while typing, then exactly one POST and "Saved".
         2. Add a trailing space, press Enter and click away. Expected: no POST, and the space goes.
         3. Paste `/images/client/product-sportswear.webp` and press Enter. Expected: one POST, and the stored path is exactly that.
      3. **Two tabs. Blocks deploy.** In tab A, rename "two". In tab B, without reloading, set "two"'s description. In tab A, press ▲ on "two". In tab B, still without reloading, set "one"'s description. Reload both. **Expected:** "two" is first, with A's name and B's description; "one" has B's description; `/products/sportswear` shows the same order.
      4. **Failure, then Retry.** Go offline, edit a description, press Tab, go online, click Retry. **Expected:** while offline, red text with Retry, the text stays and there's no "Saved". Retry sends one POST, then "Saved", and the change is stored.
      5. **A new edit after a failure (C1).** Go offline, change the name, Tab, go online, change the description, Tab without Retry. **Expected:** one POST carrying both changes, then "Saved", and the red text goes.
      6. **Name and image are required.**
         1. Clear the name and press Tab. Expected: "A product needs a name…", and the old name is back after a reload.
         2. Clear the path box and press Tab. Expected: "A product needs an image…", and the old path is back after a reload.
      7. **Switching category mid-save (slow, C2). Blocks deploy.** Rename "one", Tab, switch the picker to T-Shirts and straight back while "Saving…" shows, wait 10 s, set the description and wait for "Saved", then reload. **Expected:** the name box shows the new name after the wait, and both the name and the description are stored.
      8. **Switching category clears the add form (WARN-2).** Type a name and path in Add a product, don't add, then switch category and back. **Expected:** the form is empty, and nothing is added.
      9. **Session expired.** Sign out in tab B, then edit in tab A and press Tab. **Expected:** "Your session expired…" with Retry; the text stays; after signing in again, the old description is stored.
      10. **Other image fields are unchanged.** Type one character into a category's image path box, then reload without saving. **Expected:** "Unsaved category changes" appears on the first keystroke.
      11. **Clean up. Blocks deploy.** Delete every ZZ-TEST product, then run the premortem's read-only `ZZ` count command on `/products`, `/products/sportswear` and the live `/what-we-do/sportswear`. **Expected:** Sportswear shows "No products in this category yet.", and every line prints `0`.
  - **`/ship` additions for this release:**
    1. **Before pushing:** T-016 rows 1, 2, 3, 7 and 11 and T-025 row 4 are ticked, alongside T-026 rows 1–3 and 7, or the owner waives them in DECISIONS.
    2. **Staff freeze:** FAL staff haven't touched products since the first Save and won't until the live check passes. Every `/admin` tab, live and local, is closed before the push.
    3. **Vercel Skew Protection:** record whether it's on. Either way, reload every admin tab after the deploy.
    4. **Live checks, read-only, on both domains:** `/products` 200, matching the database (Coming Soon while there are 0 products); the 8 `/products/<slug>` pages 200; 0 UUID-shaped strings on `/products` and one category page; `/admin/products` → 307 `/admin/login`.
    5. **After staff add the first real product:** a read-only check that `/products` shows its section and `/products/<slug>` its card, recorded in LOG.
  - **Contract notes from the premortem:**
    - **C4 (doc fix):** T-016 voids four sign-offs, not two. That's folded into MUST-ADD 11 and the Sequence line.
    - **C5:** "an old tab's full-row payload still works" isn't a real protection. With Skew Protection, old tabs run the old code; without it, their action ids most likely don't resolve. `/ship` additions 2–3 are the real protection.
    - **C6:** two older AC lines are retired. "Pasting… each still save once" now means on Tab or Enter. "Ends on the most recently chosen image" excludes two overlapping uploads in one row, which T-010 owns.
  - **2026-10-03 notes, from the `/products` run:**
    - **Re-point Files.** Per T-026's `architect-reviewer` ruling, the editor moves from `business/{page,BusinessClient}.tsx` to `src/app/admin/(dashboard)/products/*`.
    - **Add to the AC (T-024 code review):**
      - the server must require a non-blank product `name` and `image`. Today only the editor's add button enforces them, so a blank name or an empty image can still arrive through edits or direct action calls;
      - a product with neither a name nor a description shouldn't leave an empty padded block (`ProductCard.tsx`).
    - **Add from T-025's reviews:**
      - **Files:** add `src/app/(website)/(marketing)/products/page.tsx`. Its grouping callback is now type-annotated, so a new `getAllCategoryProducts()` return shape has to be handled there (`code-reviewer`).
      - **WARN-3 scope:** after a failed product read, `/products` and `/products/<slug>` show a "couldn't load products" state, not "Coming Soon".
      - **SEC-INFO-37:** `getAllCategoryProducts()` throws for a category slugged `constructor`, because it groups into a plain object. Use `Object.create(null)` or a `Map`; the same goes for `CategoryProductsManager.tsx:87,106`.
      - **SEC-INFO-36:** add a product mapper like `toCategoryCards`, so whole product rows don't reach the catalog components.
      - A title of 255+ characters can save a slug ending in `-`, and the category's next save is then refused (security-review, for `/pm`). **Fixed for saves on 2026-10-04 by T-026's `a6ce5f6`;** the remaining read-time half is in the 2026-10-04 notes below.
  - **2026-10-04 notes, from T-026's reviews** (scoped by the contract above: the read-time slug cut, the What We Do text page, the seed panel copy, the comment wording and the image placeholder go to T-033; the upload race goes to T-010; the delete-vs-add race stays in the backlog):
    - **Decided: what visitors see when the product read fails** (DECISIONS 2026-10-04; the owner should confirm). Visitors keep the existing empty state ("Coming Soon"), and the failure is logged on the server. Only the admin fails closed, with a `role="alert"` "couldn't load products" message and no add form.
      - That keeps this ticket's AC bullet on `getCategoryProducts`, and the T-005 QA INFO-1 ruling.
      - It replaces the public half of the 2026-10-03 "WARN-3 scope" note above. If `getAllCategoryProducts` gets an `{ ok }` result, `/products` treats `ok: false` like an empty catalog, plus a server log.
    - **WARN-3, admin half, still open at T-026:** `/admin/products` shows every category as "No products in this category yet." after a failed read (QA T-026 F2; `products-actions.ts:150-155`). Nothing is lost, because the server-side delete guard re-counts products.
      - The page loads with `Promise.all`, so a *thrown* read falls to Next's error screen instead of the friendly alert. It still fails closed.
    - **The upload race, the same class as WARN-1 (`code-reviewer`):** `ImageUploadField` calls the `onChange` it captured when an upload started (`ImageUploadField.tsx:126-128`), and `ObjectListEditor.update` builds the new list from that older `items`.
      - On `/admin/products`, an upload that finishes after a category save can roll the draft back to the pre-save list. Saved rows lose their new ids, so a second Save treats them as new.
      - On every image list, typing done during an upload is lost.
      - Fix it together with WARN-1, with a functional update or a ref to the latest list.
    - **SEC-INFO-37, current lines:** `products-actions.ts:157-159` and `CategoryProductsManager.tsx:91,110,117,122,134,146`.
    - **SEC-INFO-36:** narrow the product rows passed to `ProductGrid` at runtime, not just in its type (`ProductGrid.tsx:8`).
    - **Visible-character check (QA F4):** a name or title made only of a zero-width space, LRM or RLO passes `trim()`. Product names (required by this ticket) should use a visible-character check, and so should category titles (`resolveCategoriesForSave`).
    - **The delete-vs-add race (QA F1, SEC-MED-5):** a product added while another admin's category delete commits can end up with no category. Fix it if cheap: re-check the category after the insert and undo the insert if it's gone. Otherwise leave it in the backlog with a DECISIONS note. It's recoverable by re-adding the title.
    - **Read-time slug cut (`code-reviewer`):** `normalizeProducts`' fallback slug for a never-saved category isn't cut at 255. Make the read-time and save-time paths share one cut-and-trim helper. Note that `dedupeSlug`'s `-2` can push a 255-character slug past 255.
    - **The What We Do text page** (`BusinessClient.tsx`) has no unsaved marker and isn't frozen during a save. Typing during a save ends with "Page text saved." even though the newest keystrokes weren't sent (`code-reviewer`).
    - **Seed panel copy (`design-reviewer`):** the success and partial-failure messages show raw storage keys (`who_we_are`) and say "Click Save again" beside a "Sync" button.
      - Show the panel's labels and say "click Sync again".
      - The partial-failure string lives in `settings-actions.ts:168`; the success string is in `SeedDefaultsPanel.tsx:53`.
    - **Comment wording (`code-reviewer`, `a6ce5f6`):** in `settings-actions.ts:262-266`, change "at least 1 ms past it" to "strictly later than the one read (1 ms past its millisecond part)", and add "when the stamp parses".
    - **The empty add-product form (`design-reviewer`):** the image path placeholder (`ImageUploadField.tsx:252`) looks like a real value.
    - **Security:** touching `settings-actions.ts`, `products-actions.ts` or `site-content.ts` voids T-026's sha256 sign-off on those files, so this ticket's `/security-review` re-binds them.
  - **Source:** `docs/QA_REPORT.md` Static Pass — T-004 WARN-1, WARN-2, WARN-3, 2026-09-27 (`docs/MEMORY_BANK.md` T-004 entry: "QA and `/cso` both recommend picking these three (WARN-1/2/3) up as `/pm` fast-follow tickets"). Also a PM source check on 2026-09-28, same race class as WARN-1, for `/qa` to confirm: `ImageUploadField.tsx:249-251` calls `onChange` on every keystroke in its hand-editable path box, and `CategoryProductsManager.tsx:532` wires that `onChange` straight to `persist()`. Typing a path into a product row therefore fires one `updateCategoryProduct` write per keystroke, and those writes aren't serialized.
  - **Files:** `src/components/admin/CategoryProductsManager.tsx` (`ProductRow.persist()` :409-445 and its `<ImageUploadField>` :532; the `<AddProductForm>` mount :242; the empty-state line :252), `src/app/actions/products-actions.ts` (`getAllCategoryProducts` :125-143), `src/app/admin/(dashboard)/business/page.tsx`, `src/app/admin/(dashboard)/business/BusinessClient.tsx` (pass the load state through). `src/components/admin/ImageUploadField.tsx` is touched only if the chosen fix needs a new prop there (see Notes). **2026-10-04: superseded by the contract's Touches list above.** The editor moved to `src/app/admin/(dashboard)/products/*` in T-026, and the line numbers here are pre-T-026.
  - **Flags:** schema-touching: **no** · sensitive: **yes** (`src/app/admin/**`, Server Action module) · UI: **yes**
  - **Acceptance:**
    - WARN-1: for any interleaving of a Name/Description save and an Image save on one product row, both the stored row and the on-screen preview end on the most recently chosen image and the most recently typed text. There's no silent revert and no "Saved" shown over a stale value. Ignoring stale responses on the client isn't enough on its own: `updateCategoryProduct` overwrites the whole row, so a stale request applied last on the server still wins in the database. A row's saves must not overlap. For example, queue them and build each payload from the latest draft at send time. ~~or block the image control while a save is in flight~~ (struck 2026-10-04: the contract rejected that option). This holds for one upload at a time per row. Two overlapping uploads in one row (a second image picked before the first finishes) belong to T-010, with T-009's race. *(C6, 2026-10-04.)*
    - Path box: typing into a product row's path box sends nothing until the edit is committed (on blur or an equivalent), then sends exactly one save. The box never drops or reverts characters mid-typing, and the stored value equals the full committed text. ~~Pasting, and completing an upload, each still save once.~~ *(Replaced 2026-10-04, C6:)* A paste saves once, at the next blur (Tab) or Enter. Finishing an upload saves once, straight away.
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
  - **2026-10-05 (T-016):**
    - T-016's partial `updateCategoryProduct` adds two branches that return the raw database message: the stored-slug read and the update. They're covered here (SEC-MED-8, extended).
    - QA T-016 I1: `createCategoryProduct(null)` or `(undefined)` throws a `TypeError` instead of returning `{ ok: false }`, so a crafted call gets Next's generic error. The editor always sends an object. Guard the argument here, or in T-014, which already edits `sanitizeInput`.

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
  - **2026-10-04 (T-026 `/design-review`):** `SettingsHeader`'s Save button (`text-black` on `bg-primary`, 2.77:1) now also reads "Save categories" on `/admin/products` and "Save page text" on `/admin/business`. It's already in this ticket's file list.

- [x] **T-021** — Give catalog photos on `/what-we-do` and the category pages a meaningful accessible name
  - **Closed 2026-10-03 by T-024** (`9755389`, `49e13ba`).
    - Product photos now carry the product's name, with a fallback of "Product from our {category} range".
    - Category-card photos stay decorative (`alt=""`; `aria-hidden` dropped), because the visible title already names each link (WCAG H2). `design-reviewer` agreed; see DECISIONS 2026-10-03.
    - Live, there are 0 products, so the product `alt` was verified by an offline render and a SYNTHETIC grid. The owner's first-product checklist row re-checks it.
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
    - All 18 entries (10 static, 8 categories; T-025 added `/products` and moved the category entries to `/products/<slug>`) are still present, with unchanged `loc`/`changefreq`/`priority`, in the same order, and the file is still valid XML (the T-005 Live Pass parse method).
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

- [x] **T-024** — Shared catalog components: the category photo-card grid and the product card, with meaningful image names [app:site][design]
  Done 2026-10-03:
  - **Commits:** `9755389`, then `49e13ba`, the follow-up fixing design-review's FIX FIRST plus code-review's minor items.
  - **Reviews:** `code-reviewer` SHIP twice; `design-reviewer` FIX FIRST, then SHIP. Codex: SKIPPED (not connected).
  - **Visible changes accepted** (recorded in DECISIONS):
    - catalog titles go from #fff to the `foreground` token;
    - the product grid is 1 column below 640 px;
    - the `/what-we-do` reveal stagger is capped at 0.3 s;
    - a blank product name renders no heading;
    - long words wrap.
  - **Carried forward:**
    - to T-025: a backslash `hrefBase` edge case, and `break-words` on descriptions;
    - to T-016: the name and image are required server-side.
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

- [x] **T-025** — Move category pages to `/products/<slug>`, and add the `/products` overview page, the "View all products" button and the "Products" menu item [app:site][design][sec]
  Done 2026-10-03:
  - **Commits:**
    - `271bdd3`: the premortem folded in;
    - `309bc0d`: the build;
    - `f1bd94d`: design FIX FIRST plus security's SEC-MED-15 one-liner;
    - `c8d4d85`: `overscroll-contain` and encoded card links.
  - **Reviews:**
    - `design-reviewer`: FIX FIRST, then SHIP;
    - `security-reviewer`: CLEARED, with a re-check, which closed SEC-MED-15 in code;
    - `code-reviewer`: SHIP three times;
    - QA production-build matrix: all PASS on :3101;
    - Codex: SKIPPED.
  - **Accepted visible changes** are in DECISIONS (2026-10-03):
    - every page's header tag moves to `text-accent` (T-027's `PageHeader` part);
    - the category tag says "Products";
    - "Products" is in the menu, plus the "View all products" button;
    - the header goes solid while the menu is open, and the menu scrolls with a mouse without dragging the page.
  - **Deferred:** the code reviewer's `nav.ts` comment rewording, because `nav.ts` is hash-bound by the security clearance. It goes in the next `nav.ts` change.
  - **Owner:** the T-025 manual checklist is in QA_REPORT, and doesn't block the merge.
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
  **Premortem (2026-10-03): GO WITH ADDITIONS.** These MUST-ADD criteria are folded in and binding:
  - **Redirect rule:** exactly `{ source: "/what-we-do/:slug", destination: "/products/:slug", permanent: true }`, with a comment saying it overrides any future `/what-we-do/<x>` page. The `next.config.ts` diff only adds lines: `agentRules: false`, `logging: { serverFunctions: false }` and the 4 existing redirect rules stay byte-identical.
  - **Redirect matrix,** run read-only with `curl` on a production build (`npm run build && npm start -- -p 3001`):
    - `/what-we-do` → 200, with no `Location` header;
    - `/what-we-do/` → `/what-we-do` → 200;
    - each of the 8 old slugs → one 308 → 200;
    - `/what-we-do/t-shirts/` → 200 in at most 2 hops;
    - the query string is kept;
    - unknown and mixed-case paths end in 200 or 404, never a loop;
    - `/business` → `/what-we-do` in one hop;
    - `/products` and `/products/<slug>` → 200 with no redirect;
    - `/products/no-such-slug` → 404.
  - **`/products` read and layout:**
    - One `getAllCategoryProducts()` call inside `Promise.all` with `getSettings("business")`. `getAllCategoryProducts()` itself stays unchanged.
    - Sections follow the category list, in the staff's order.
    - The category name is an `h2` link; product names are `h3` (`headingLevel`).
    - The note shows only when no *displayed* category has products.
  - **No leaks:**
    - No category `id` in any prop or React key on `/products`, and no browser-side data fetch.
    - On the production build, 0 UUID-shaped strings in the HTML of `/products` and `/products/<slug>`.
    - 0 anon-key-shaped strings in `.next/static`.
  - **Server Actions:**
    - No new export in any `"use server"` file. A shared path helper, if needed, goes in `src/lib/nav.ts`.
    - `getUser()` stays the first call in every write action touched.
    - Revalidate targets: a business save revalidates `/what-we-do`, `/products`, each `/products/<slug>` and `/sitemap.xml`. A product write revalidates `/products/<slug>` and `/products`.
    - These are verified by reading the code only. No agent saves anything.
  - **`site-content.ts`:** the diff is only the 2 slug-collision message strings. No slug, id or default changes.
  - **`BusinessClient.tsx` help text** (`:65`, `:82`) isn't touched here; it moves to T-026, which rewrites that page.
  - **`/design-review` additions:**
    - the closed header at 1280×800;
    - the open menu at 360×640 and 1024×768;
    - a keyboard Tab pass that reaches "Connect".
  - **Owner checklist row:** the populated-catalog check, using either a `ZZ-TEST T-025 (delete me)` product on the local production build or the first real product. It's the owner's choice, and it gets dated.
  - **At close:** T-022's AC count goes from 17 to 18 sitemap entries, plus ARCHITECTURE §1's route row and `/ship`'s live check (`/what-we-do` → 200; one old slug → 308 → 200).

  **Also folded in, carried forward from T-024's reviews:**
  - `hrefBase`'s runtime check mirrors its type, rejecting `/\…` (`CategoryCardGrid.tsx:47`).
  - `break-words` on product and category descriptions.
  - Design guidance: populated product tiles shouldn't look like any shop's. `design-reviewer` suggested a `surface` mat for white-backdrop shots, a `from-surface` photo fade, or an AA-passing micro-label. The builder chooses; `/design-review` judges.
  - Any *new* label uses an AA-passing token, never `text-primary` on dark (see T-027).

  Sequence: `premortem-planner` (it touches `next.config.ts`) ✅ → `/build` → `/design-review` → `/security-review` → `/qa` (production-build matrix, read-only) → `code-reviewer` → merge.
  Risk: the URL change, mitigated by the permanent redirect. Slugs stay as they are: `/products/t-shirts`, not the client's "t-shirt".

- [x] **T-026** — A dedicated admin "Products" page for categories and their products [app:admin][design][sec]
  Done 2026-10-04:
  - **Commits:**
    - `8ee80bf`: the contract and premortem folded into the AC;
    - `e050f85`: the server (one writer per field, the compare-and-swap, `updateSettings` refusing `business`, the seed fix, SEC-MED-15's root cause);
    - `8d850bd`: the UI (`/admin/products`, the slimmed `/admin/business`, the sidebar item, `saveLabel`, `SettingsLoadError`, `settings-read.ts`);
    - `a6ce5f6`: stamps always move forward, and long titles give valid slugs (`code-reviewer`'s minor items);
    - `e201aca`: the `foreground` token on new admin text (design FIX FIRST).
  - **Reviews:**
    - `architect-reviewer`: APPROVE. `premortem-planner`: GO WITH ADDITIONS.
    - `code-reviewer`: SHIP three times (the build, `a6ce5f6`, `e201aca`). Codex: SKIPPED.
    - `security-reviewer`: CLEARED, with no Critical, High or Medium findings. SEC-INFO-38 and 39 are new; SEC-INFO-40 is filed as T-031. The six server files are sha256-bound at `a6ce5f6` and unchanged by `e201aca`.
    - `design-reviewer`: FIX FIRST, then SHIP. This used a SYNTHETIC harness: the admin is NOT VISUALLY VERIFIED against the live login.
    - QA: PASS (offline attacks, wire-level requests, rendered markup, the live admin-gate matrix), plus a static re-check PASS on `e201aca`.
    - **The owner's SQL HARD STOP: answered 2026-10-04, with all 8 points matching.**
  - **Owner checklist:** `docs/QA_REPORT.md`, "Manual Checklist — T-026 — 2026-10-04". Rows 1–3 and 7 block deploy. Errata for the older pending checklists are in the same file.
  - **Accepted visible change** (DECISIONS 2026-10-04): admin headings and the bold "Save categories" mentions use `foreground` (#f5faf5).
  - **Follow-ups:** T-016's 2026-10-04 notes; T-011, T-020 and T-027 extended; new T-030 (admin phone navigation), T-031 (SEC-INFO-40 grants) and T-032 (QA F5–F7).
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
  **Contract (`architect-reviewer`, 2026-10-03: APPROVE; binding).** It needs no migration, no new settings key, no new dependency and no new database object. If the build needs any of those, a client-held version token, or an exported generic writer, re-run `/architect-review`.
  1. **One writer per field of `site_settings[key='business'].value`:**
     - `products` (the categories) is written only by `saveCategories`.
     - `processTitle`, `processSteps`, `whatWeDoTagline` and `whatWeDoText` are written only by `saveWhatWeDoText`. `seedSettingsFromDefaults` may reset them too.
     - Any other stored key: no writer. Both actions carry it through untouched.
  2. **Signatures:**
     - `src/lib/site-content.ts`, pure and shared:
       - `type WhatWeDoText = { processTitle: string; processSteps: string[]; whatWeDoTagline: string; whatWeDoText: string }`;
       - `pickWhatWeDoText(raw: unknown): { ok: true; value: WhatWeDoText } | { ok: false; error: string }`.
     - `settings-actions.ts`:
       - `type SaveCategoriesResult = { ok: true; categories: Product[] } | { ok: false; error: string }`;
       - `saveCategories(categories: Product[]): Promise<SaveCategoriesResult>`;
       - `saveWhatWeDoText(input: WhatWeDoText): Promise<ActionResult>`;
       - `writeBusinessFields(supabase, build: (stored) => BuildResult | Promise<BuildResult>): Promise<ActionResult>`, which is **private and not exported** (every `"use server"` export is a public endpoint).
  3. **`writeBusinessFields`:**
     - **Read:** `value, updated_at` via `.eq("key","business").maybeSingle()`. The merge base is the raw stored `row.value`, or `{}` if it isn't a plain object. **Never `getSettings()`**: its defaults would get frozen into storage.
     - **Write when the row exists:** a conditional update. Pass `row.updated_at` back **exactly as returned**; never parse it, because microseconds would be lost. That's `.update({ value: next, updated_at: new Date().toISOString() }).eq("key","business")` plus `.eq("updated_at", <raw string>)`, or `.is("updated_at", null)` when it's null, then `.select("key")`. 0 rows → SAVE_CONFLICT.
     - **Write when the row is missing:** `insert`. Error code `23505` → SAVE_CONFLICT; any other error → its message.
     - **On a conflict:** fail closed, with no automatic retry.
     - **Amended 2026-10-04** (`code-reviewer`, `a6ce5f6`): the written stamp is `max(now, read stamp + 1 ms)` instead of plain `new Date()`, so stamps always move forward. The condition still uses the raw string. This is an implementation refinement inside the contract (DECISIONS 2026-10-04). The live table has no `updated_at` trigger (owner SQL, 2026-10-04), so this line is the only thing stopping a repeated stamp.
  4. **`saveCategories`:**
     - `getUser()` is the first statement; no user → SESSION_EXPIRED.
     - Inside `build`, keep every rule: `readStoredCategoryIdentities(stored.products)`, `resolveCategoriesForSave`, `computeRemovedCategories`, and the delete-guard count with "Remove its products first".
     - Return `{ ...stored, products: resolved }`, then `{ ok: true, categories: resolved }`.
     - Every error is returned, never thrown.
  5. **`saveWhatWeDoText`:** `getUser()` first. `pickWhatWeDoText` builds a new object from the 4 allowed keys only. A missing or wrongly typed field rejects the whole save, with no trimming, coercion or length cap. It writes `{ ...stored, ...picked }`.
  6. **`updateSettings`:** after `getUser()`, `key === "business"` → `{ ok:false, error: BUSINESS_MOVED }`. Delete the old `business` branch and `SETTINGS_ROUTES.business`.
  7. **`seedSettingsFromDefaults`:** for `business`, it overlays `SITE_SETTINGS.business` **without `products`**. It currently wipes category ids and staff-added categories, a live bug. Relabel the panel's option.
  8. **`products-actions.ts`:** the 3 copies of the "not saved yet" message become one constant that points at `/admin/products` and names the real Save button.
  9. **Client:**
     - **Data:** the `/admin/products` loader fetches the business settings and all products together, and passes `normalizeProducts(data.products)` plus the products map.
     - **Two lists:** `draft` is the category editor's list, and `confirmed` is the server's last confirmed list. "Save categories" calls `saveCategories(draft)`. On success, both become `result.categories`. On failure, show the error and keep the draft.
     - **`CategoryProductsManager` gets `confirmed`, never `draft`.** Product rows keep saving immediately on their own.
     - **First Save:** while any confirmed category has no `id`, a visible message points at the categories Save.
     - **Save label:** the button names its scope, via an optional `saveLabel` on `SettingsHeader` that defaults to "Save Changes".
     - **No sibling-route imports.**
     - **`/admin/business`:** loads and saves only the 4 text fields, and gets a one-line pointer to `/admin/products`.
  10. **Revalidation** uses only slugs the server resolved:
      - `saveWhatWeDoText`: `/admin` and `/what-we-do`. It adds `/products` only if a `products` page reads one of the 4 fields.
      - `saveCategories`: `/admin`, `/what-we-do`, `/products`, `/products/<slug>` for every saved and removed category, and `/sitemap.xml`. Not `/`, and not `/what-we-do/<slug>`, which is now a redirect.
  11. **Error strings** (constants, not exported):
      - SAVE_CONFLICT: "Another save changed these settings at the same moment, so nothing was saved. Click Save again."
      - BUSINESS_MOVED: see the premortem's wording below.
      - `pickWhatWeDoText`: "The page text couldn't be read, so nothing was saved. Reload the page and try again."

  **Accepted limitation:** two stale tabs of the same page (or two admins) are last-writer-wins on category content. That can revert a rename's title, drop a newer empty category, or bring back a deleted empty one. It can't orphan products, because ids plus the delete guard prevent that. This is the same as every settings editor today.
  *Correction 2026-10-04 (QA F1, `code-reviewer`):* "can't orphan products" holds through stale tabs. One true race remains: a category delete that commits while another admin adds a product to that category can leave the product with no category. It predates T-026 (SEC-MED-5) and is recoverable, because re-adding the category's title brings the product back. It's tracked in T-016's notes.

  **Premortem (`premortem-planner`, 2026-10-03: GO WITH ADDITIONS). These MUST-ADD criteria are binding:**
  - **The compare-and-swap is checked by code reading:**
    - one read feeds the ids, the guard and the swap;
    - a read error, or a stored `value` that isn't an object, stops the save;
    - the `updated_at` condition uses the raw string and never goes through a JS `Date`;
    - `.select("key")` or `count` follows the write, and 0 rows gives SAVE_CONFLICT plus a `console.error` with both stamps;
    - `ok: true` only after a confirmed changed row;
    - insert, never upsert;
    - revalidate only after a confirmed write.
  - **Public endpoints:** exactly two new exports, `saveCategories` and `saveWhatWeDoText`, each with `getUser()` as its first await. `writeBusinessFields`, `pickWhatWeDoText` and the message constants aren't exported from any `"use server"` file, and any read the new pages need lives outside `"use server"` files.
  - **Loads fail closed.** Both `/admin/products` and `/admin/business` build editable state only from a read that can tell "failed" from "empty". On failure they show a `role="alert"` message ("couldn't load — refresh") and no Save button. Public pages keep their fallback to defaults.
  - **The category editor:**
    - a blank title blocks Save and names the row (#n), because otherwise it's treated as a deletion;
    - `id` passes through unchanged;
    - `draft` and `confirmed` are set from props once, and replaced only by `saveCategories`' returned list (no effect or key reset);
    - after SAVE_CONFLICT, any `ok:false` or a thrown call, the draft stays and the message says to click Save again;
    - "Unsaved category changes" shows while `draft` differs from `confirmed`;
    - a category removed in the draft stays in the product manager until the save succeeds;
    - before the first Save, the card says: "Click Save categories once with no other changes. Renaming a category before that changes its web address."
  - **BUSINESS_MOVED wording**, which has to make sense on an old tab: "Nothing was saved. This editor has moved: copy anything you typed, reload, and edit categories under Admin → Products."
  - **The sync:**
    - `business` goes through `writeBusinessFields` with only the 4 text fields;
    - `seedSettingsFromDefaults` returns `{ ok, error }`, and `SeedDefaultsPanel` displays it;
    - the option is relabeled "What We Do page text (categories are never touched)".
  - **Wording:** no "Save Changes" or `/admin/business` in any category or product text (`CategoryProductsManager.tsx:187,237`, and the shared products-actions message). Help text names `/products/<slug>`. That includes the `BusinessClient.tsx:65,82` help text T-025 deferred here.
  - **The admin gate:**
    - the production-build route list shows `ƒ /admin/products`;
    - the anonymous probes (plain, `RSC: 1`, prefetch, `.rsc`, a trailing slash, `//admin/products`) each return 307 to `/admin/login` with no `Set-Cookie`;
    - `products/*` and `business/*` don't import from each other.
  - **Before the first Save, read-only:** check that each live category's `slugify(title)` equals its URL slug. **Done on 2026-10-03: all 8 match.**
  - **Owner SQL check, read-only, before merge: a HARD STOP.** It covers the `site_settings` policies, its triggers and `updated_at::text`. The query was given to the owner on 2026-10-03. **Answered 2026-10-04:** the owner ran an expanded query, which added RLS, grants, rules, columns and the primary key, and all 8 of `security-reviewer`'s points match. The evidence is in `docs/SECURITY.md`, "CSO Audit — 2026-10-04 — ticket-review:T-026 (the owner's SQL evidence)".
  - **QA errata:** dated corrections on the pending T-002, T-003, T-012, T-004, T-006 and T-025 rows that send the owner to `/admin/business` for categories, products or the first Save.
  - **The owner's two-tab checklist,** on the production build against the LIVE database, with `ZZ-TEST T-026 (delete me)` records:
    1. the first Save, if still pending, then reload;
    2. a second unchanged Save;
    3. a text save in a stale tab can't wipe a category save;
    4. a category save in a stale tab can't wipe the text;
    5. the delete guard;
    6. session expired;
    7. cleanup.

    Never run "Sync Content From Code". Rows 1–3 and 7 block deploy.
  - **`/ship` for this release:** close every `/admin` tab and tell FAL staff not to edit until the live check passes; reload open admin tabs after the deploy; record whether Vercel Skew Protection is on; live check that `/admin/products` → 307 `/admin/login`.
  - **Docs at close:** DATA_MODEL §3 and STACK §4 name the two new save actions, ARCHITECTURE §1 gets the new admin route, and INVENTORY is regenerated.

  **Also folded in:** SEC-MED-15's root cause, from the T-025 security review. `normalizeProducts()` keeps a stored slug only if `isWellFormedSlug()` passes, which closes every slug path at once.

  Sequence: `architect-reviewer` ✅ APPROVE (2026-10-03) → `premortem-planner` ✅ GO WITH ADDITIONS (2026-10-03) → `/build` ✅ → `/design-review` ✅ FIX FIRST → SHIP (code-level and a SYNTHETIC harness; the admin is NOT VISUALLY VERIFIED by agents) → `/security-review` ✅ CLEARED → `/qa` ✅ PASS → `code-reviewer` ✅ SHIP → **HARD STOP: the owner's read-only SQL check** ✅ answered 2026-10-04 → merge ✅ (2026-10-04).
  Risk: the shared record. Two admin pages saving one record is exactly the overwrite risk the architect review is for.

After T-026 this run also does **T-016** (above), by the owner's decision on 2026-10-03, because staff are about to use the product editor.

**Follow-ups found in this run** (backlog; not part of the `/products` run):
- [ ] **T-027** — Make `text-primary` micro-labels pass WCAG AA sitewide [app:site][design]
  AC:
  - Every `text-primary` text label on a dark background reaches at least 4.5:1, or 3:1 where it's large text under DESIGN.md §3. Measured from pixels:
    - the "01. PRODUCT CATALOG" kicker and the category page's "ALL PRODUCTS" back link are 2.21:1;
    - the category page's "contact us" is 2.61:1;
    - the homepage's inline "Who We Work With" kicker (`src/app/(website)/page.tsx:83`) is also `text-primary`.

    `design-reviewer` suggests `text-accent`, about 7.7:1. **The `PageHeader` tag is already done:** T-025 (2026-10-03) moved it to `text-accent`, which measures about 9.5:1 on 5 pages.
  - DESIGN.md §2 gains a `scrim` token for the photo-card gradient (Low).
  Source: `design-reviewer`, T-024 review, 2026-10-03.
  - **2026-10-04, extended to the admin** (T-026 `/design-review`, measured in a synthetic render):
    - `SettingsHeader`'s `text-primary` page tag is 2.61:1, card titles 2.52:1, the process-step chips are dim too, "Secure Session" is 2.17:1, and the sidebar group labels are 2.03:1.
    - `SettingsLoadError`'s tag already uses `text-accent`, so the same page's tag changes color between its normal and failed-load states.
    - The Careers, Reports, Submissions and Media admin pages have hand-written `text-white` h1s, which DESIGN.md §7 bans (the builder's note on T-026's `e201aca`).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Rank it with T-020 and T-011.
- [ ] **T-028** — Respect `prefers-reduced-motion` sitewide [app:site][design]
  AC:
  - With reduced motion set:
    - `ScrollReveal` content shows without sliding (`MotionConfig reducedMotion="user"` in `src/app/(website)/layout.tsx`);
    - the card hover zoom is `motion-safe:` only;
    - Lenis smooth scrolling is off;
    - the preloader is shortened or skipped.
  - Default motion is unchanged.
  Source: `design-reviewer` and `code-reviewer`, T-024 review, 2026-10-03. It breaks the a11y floor in CLAUDE.md; it isn't an AA failure (WCAG 2.3.3 is AAA).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge.
- [ ] **T-029** — Make the mobile menu keyboard- and screen-reader-safe [app:site][design]
  AC:
  - While the menu is open, focus stays inside it; today Tab moves into page cards hidden behind the overlay.
  - Escape closes the menu and returns focus to the toggle.
  - The toggle has `aria-expanded` and `aria-controls`.
  - The decorative ordinals ("04") are `aria-hidden` (1.22:1), so they stop leaking into link names.
  - Header and menu links show a `ring-accent` focus ring instead of the browser default.
  Source: `design-reviewer`, T-025 review, 2026-10-03. This is an existing problem, not caused by T-025.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge.
- [ ] **T-030** — Give the admin a way to navigate on phones, and mark the current page in the sidebar [app:admin][design]
  AC:
  - Below 768 px, the admin has working navigation to every sidebar destination. Today the sidebar is `hidden md:flex` with no menu, so a phone shows the current page and no way to reach the others.
  - The sidebar marks the current page visually and with `aria-current="page"`.
  - Keyboard and screen-reader safe, on the same terms as T-029's menu rules: focus stays inside an open menu, Escape closes it, and the toggle has `aria-expanded`.
  Source: `design-reviewer`, T-026 review, 2026-10-04. This is an existing problem, not caused by T-026.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Admin-only, so the admin is NOT VISUALLY VERIFIED by agents without a synthetic harness; `/qa` writes an owner checklist row.
- [ ] **T-031** [db] [sec] — Remove the anon role's unused write grants on `site_settings` (and make every table's grants explicit)
  AC:
  - `anon` keeps only SELECT on `site_settings`. INSERT, UPDATE, DELETE and TRUNCATE are revoked; RLS never covers TRUNCATE.
  - Optionally, `authenticated` loses DELETE and TRUNCATE on `site_settings`, since the app never deletes a settings row.
  - The other tables that rely on Supabase's default grants get explicit ones, following `products` (migration 0001). `submissions` keeps anon INSERT and never gets anon SELECT.
  - It's a hand-applied migration in `db/migrations/` (`STATUS: PENDING_USER_APPLY`), reviewed by `architect-reviewer` and `/security-review`, with a HARD STOP until the owner applies it and confirms. `supabase-schema.sql` and DATA_MODEL §3 are updated.
  Source: SEC-INFO-40, `security-reviewer`, 2026-10-04, from the owner's SQL evidence. Today RLS is the only control stopping anonymous writes; this makes two controls have to fail instead of one. It's not exploitable today and doesn't block deploy.
  Sequence: `supabase-engineer` → `architect-reviewer` → `/security-review` → owner applies (HARD STOP) → `/qa` (read-only probes) → merge. Coordinate with T-023 (the admin allowlist), which rewrites the same policies.
- [ ] **T-032** — Small category-save and settings-key edge cases [app:admin]
  AC:
  - Titles with no Latin letters or digits all slugify to `category`, so a second one is refused (QA T-026 F5). Give them a distinct, readable slug, or explain the refusal in the error.
  - `updateSettings` accepts any key, so "Business" or "business " creates a junk row (QA T-026 F6, within RISKS R1). Allow only the known settings keys.
  - The delete-guard message for several categories reads `"T-Shirts, Sportswear" still has products assigned to it.` (QA T-026 F7). Name them grammatically.
  - *(Added 2026-10-04, from T-016's `architect-reviewer`.)* `checkCategoryAttachable` reads through `getSettings`, which falls back to the code defaults when the read fails. A failed read therefore refuses the product write with a misleading "hasn't been saved as a category yet". Make it fail closed with its own "couldn't check the category, try again" message.
  Source: QA T-026 Static Pass, 2026-10-04. All Info-level, and all predate T-026.
  Sequence: `/build` → `/security-review` (it touches `settings-actions.ts`) → `/qa` → `code-reviewer` → merge.
- [ ] **T-033** — Category-title and slug hygiene, catalog narrowing, and admin copy [app:admin][app:site][design][sec]
  Split out of T-016 on 2026-10-04 by `architect-reviewer` (the V7 ½-day stop); about ½ day. It touches `site-content.ts` and `settings-actions.ts`, so `/security-review` re-checks both (re-binding T-026's sha256 sign-off). Pre-cleared under these rules:
  - **Category titles (QA T-026 F4).** In `resolveCategoriesForSave`, a title that isn't blank after trimming but fails `hasVisibleText` (added by T-016) refuses the whole save: "Category #n's title has no visible characters, so nothing was saved. Type a title, then save again." It's never treated as a deletion. `blankTitleRows` uses `hasVisibleText`. `normalizeProducts` doesn't change.
  - **The slug cut.**
    - A private `MAX_SLUG_LENGTH = 255`, with a comment pointing at `VARCHAR(255)` (migration 0001).
    - A private `cutSlug(slug, max)` that cuts, then trims trailing dashes.
    - `slugify` returns `cutSlug(raw, MAX) || "category"`; `dedupeSlug` cuts the base to `MAX - "-N".length`; `isWellFormedSlug` uses the same constant; `resolveCategoriesForSave` drops its own inline cut.
    - Every slug of 255 characters or fewer must stay exactly as it is. Check that read-only against the live titles.
  - **SEC-INFO-36.** `toProductCards` and `ProductCardData` (with `id?: never`) go in `src/components/catalog/ProductGrid.tsx`, next to the component, as `toCategoryCards` does. Both public pages narrow products before passing them on. `ProductCard` renders no text block when both name and description are blank. Keys stay as they are.
  - **The What We Do text page** (`BusinessClient.tsx`) gets an "unsaved" marker, and its editor is read-only while saving, the same pattern `ProductsClient` uses.
  - **Seed panel copy:** no raw storage keys in any message, and "click Sync again". If `SeedResult` changes shape, `SeedDefaultsPanel` changes in the same commit. What the sync writes doesn't change.
  - **NOTHING_TO_SAVE wording** (`products-actions.ts`, deferred from T-016's `/design-review` on 2026-10-05): "There was nothing to save." reads like a success but shows as a red error beside Retry. The final string is "Nothing was saved. Reload the page, then try again." It's unreachable from T-016's editor (the queue never sends an empty patch), so it waited for a ticket that re-binds `products-actions.ts` anyway. Touching `products-actions.ts` voids T-016's sha256 sign-off on it, so `/security-review` re-binds it.
  - **The comment wording** at `settings-actions.ts:262-266` ("strictly later than the one read (1 ms past its millisecond part)", plus "when the stamp parses"), and **the image path placeholder** at `ImageUploadField.tsx:252`, which looks like a real value in an empty add form.
  Source: T-016's contract (`architect-reviewer`, 2026-10-04), from T-026's reviews (QA F4, `code-reviewer`, `design-reviewer`, `security-reviewer`).
  Sequence: `/build` → `/design-review` → `/security-review` → `/qa` → `code-reviewer` → merge. After T-016; then T-010.
- [ ] **T-034** — Warn before leaving `/admin/products` while a product save is still pending [app:admin][design]
  AC:
  - While any product on `/admin/products` shows "Saving…" (a save in flight or waiting), leaving the page (a link, the back button, closing or reloading the tab) first asks the browser's standard "leave site?" question. Once nothing is pending, it doesn't.
  - No change to what the save queue sends or when; the queued save still goes out if the person leaves anyway.
  - **Two small nits from T-016's `code-reviewer` (2026-10-05), in the same file:**
    - During a delete, the image field stays enabled, as on `main`. A path-box commit or a finished upload can therefore queue a real save while the row reads "Deleting…". Contract item 6's letter wants "Saving…" whenever a save is in flight or waiting, so use `pending ? "Saving…" : "Deleting…"`. It's cosmetic: the row disappears if the delete succeeds.
    - The notice's "click away from a field you've edited" undersells Tab and Enter, which also commit. Design may prefer "leave a field you've edited".
  Source: QA T-016 I3, 2026-10-05. Leaving mid-save still sends the save, by design, but nobody sees how it ends. Until then, staff guidance is to wait for "Saved".
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

## Autonomous run — 2026-10-06 (owner: "complete all the things… and then deploy it")
The owner asked for every open ticket to be finished, then one deploy at the end, with no further input ("I don't want to put any thought into this anymore"). Mode: AUTONOMOUS (documented defaults, logged). LAW-touching calls and hard stops still go to the owner.
- **Agent-buildable, in waves.** Each wave builds in place, one builder at a time; a wave may carry several tickets as separate commits, and its review stage covers every ticket's AC.
  1. **Wave 1, catalog data hygiene:** T-033, T-032.
  2. **Wave 2, products write path:** T-014, T-013, T-018.
  3. **Wave 3, uploads and media:** T-019, T-007, T-009, T-010 (T-010 and T-019 need `architect-reviewer` first).
  4. **Wave 4, admin UX and accessibility:** T-034 (with T-016's two nits), T-011, T-020, T-027, T-030.
  5. **Wave 5, public site:** T-008, T-017, T-022, T-028, T-029.
- **Needs the owner (not built autonomously):**
  - **T-023**, the admin allowlist: it changes the auth model (LAW), needs `/debate` and a hand-applied migration.
  - **T-031**, the grants hardening: a hand-applied migration. It may be prepared on its own branch, never merged with `STATUS: PENDING_USER_APPLY`, because that blocks `/ship`.
  - **Supabase sign-ups:** still ON on 2026-10-06, read live (`disable_signup: false`). Only the owner can turn them off in the dashboard.
- **Deploy:** one `/ship` at the end, under the owner's "deploy". An earlier deploy, attempted on 2026-10-06 because of SEC-HIGH-1's live exposure, was refused by the session's permission check, since the owner sequenced it after the tickets. The manual checklist rows count as waived by the owner's instruction, recorded in DECISIONS at deploy time.

### Dependency Order

**2026-10-03:** the `/products` client request above runs first: T-024, then T-025, then T-026, then T-016. T-021 is folded into T-024. After that, the order below resumes, without T-016, which is done in that run.

**2026-10-04:** T-016 was split under the ½-day stop (DECISIONS 2026-10-04). After the `/products` run, take T-033 and then the re-scoped T-010 first. T-030 (admin phone navigation), T-031 (SEC-INFO-40 grants, a `[db]` HARD STOP) and T-032 are backlog.

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
