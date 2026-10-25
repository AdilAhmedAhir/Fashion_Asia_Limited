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

- [x] **T-007** — Add a server-side pixel-dimension re-check to `uploadOptimizedImage`
  Done 2026-10-07 in **Wave 3a** (commit `a42ddcb`; reviews under T-019's done note). `readImageDimensions` walks the JPEG segments and reads the WebP chunk header with no dependency; an unreadable image, or one over 2400 px on its longest edge, is refused before any storage write, with the browser's wording.
  **Built in Wave 3a with T-019 under one binding contract** (`architect-reviewer`, 2026-10-06): see T-019, items 5–6 plus the amendments. Where this ticket's AC differs, the contract wins.
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

- [x] **T-008** — Add sitewide security headers (`next.config.ts`)
  Done 2026-10-08, in **Wave 5a** with T-022 and T-017:
  - **Commits:** `edd1c6c` (the premortem folded in), `b4c01e8` (T-008), `b8558c3` (T-022) and `2db0af9` (T-017).
  - **What changed:**
    - every response except a config redirect now carries `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a Permissions-Policy that turns off camera, microphone, location, payment and USB, `X-Frame-Options: DENY`, and an enforcing structural CSP (`frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`);
    - production builds also send `Strict-Transport-Security: max-age=63072000; includeSubDomains`, never with `preload`;
    - `X-Powered-By` is gone, and `/admin/login` can't be framed.
  - **Redirects:** Accepted as a framework limitation (SEC-INFO-49, `security-reviewer`). A redirect never becomes a page, the destination's 200 carries all six, and every redirect stays on our own origin, so a browser loses nothing. Under `next start`, PM3 counts the 308s as N/A, though they must still match `main`'s status, `location` and `Refresh`. PM13 records what Vercel sends on the live 308s, and neither outcome is a STOP or a rollback.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP, with no defect in the diff. It re-ran PM1–PM11: 29/29 source checks, 25/25 mutants, 9/9 timing runs and 7/7 pages with 0 CSP violations.
    - `security-reviewer`: CLEARED. It agreed the CSP ships enforcing (PM12, under SEC-MED-2), accepted the 308s as a framework limitation (SEC-INFO-49), and bound `next.config.ts` `d1af850c…`, `sitemap.ts` `bdfd4112…`, `[category]/page.tsx` `b6b09179…` and `ImportBuiltInGallery.tsx` `acf7a662…`. It recommends `npm audit --omit=dev` at `/ship`.
  - **`/ship` binds:** PM13's live header assertions and the bare-domain STOP, and PM14's rollback rule (DECISIONS 2026-10-07).
  - **Follow-ups:** under "Follow-ups found in Wave 5a".
  **Wave 5 binding contract, covering T-008, T-022, T-017, T-028 and T-029** (`architect-reviewer`, 2026-10-06: APPROVE; folded verbatim on 2026-10-07, so no second `/architect-review` is needed). It's split into **5a** (T-008, T-022, T-017; premortem first), **5b** (T-028) and **5c** (T-029), after Wave 4 merges. There's no SQL, middleware change or new dependency, so there's no HARD STOP. The facts behind it are under T-034's Wave 4 contract. Where older AC conflicts with this contract, the contract wins.

  **Scope:**
  - Code only: no SQL, no dependency, no middleware change.
  - **Precondition:** Wave 4 has merged. T-029 needs 4d's hook, and 5b/5c build on 4a/4b's Header and menu classes.

  **5a: T-008, T-022, T-017 (premortem first)**

  1. **`next.config.ts` (T-008):**
     - add `poweredByHeader: false`;
     - add one `headers()` rule, `source: "/:path*"`, with exactly these static values:

       | Header | Value |
       |---|---|
       | `X-Content-Type-Options` | `nosniff` |
       | `Referrer-Policy` | `strict-origin-when-cross-origin` |
       | `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
       | `X-Frame-Options` | `DENY` |
       | `Content-Security-Policy` | `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'` |
       | `Strict-Transport-Security` | `max-age=63072000; includeSubDomains` |

     - **Permissions-Policy** must never include `autoplay`, `fullscreen` or `picture-in-picture`: the hero autoplays.
     - **The CSP** is enforcing but structural only. It has no fetch directive, so it can't block any script, style, image, font, video or request. *(Note, 2026-10-08: in CSP Level 3 `object-src` counts as a fetch directive. It's the only one here, set to `'none'`, which blocks `<object>` and `<embed>`; the site has none.)*
     - **HSTS** is sent from production builds only (`NODE_ENV === "production"`) and never with `preload`.
     - **Must not change:** `agentRules: false`, `logging.serverFunctions: false` and `redirects()` stay byte-identical.
     - **Fallback:** if security-reviewer doesn't agree to the CSP going straight to enforcing, drop that line. X-Frame-Options still protects against clickjacking.
  2. **Rejected for this run:**
     - a nonce-based CSP: it edits the login gate, and a script-policy mistake breaks production, which can only be proven after a deploy;
     - Report-Only.

     Both go to T-038.
  3. **Sitemap (T-022):**
     - remove all 11 `lastModified` lines;
     - keep all 18 entries, with the same `loc`, `changeFrequency`, `priority` and order;
     - add a one-line comment saying why.
  4. **Preloader (T-017):**
     - **Delete:** the frame loop, `TOTAL_FRAMES` and the 2000 ms safety timer.
     - **Every screen width** runs today's mobile path: progress +8% every 100 ms, finishing at 1500 ms.
     - **Must not change:** `finishLoading`, the 800 ms exit, the scroll lock, `scrollTo`, the poster and `HeroSection`.

  **5b: T-028**

  **5b addition, 2026-10-07** (orchestrator, on Wave 4b's design review; DECISIONS 2026-10-07). `HeroOverlay.tsx` is already on 5b's list:
  - the hero tag (`HeroOverlay.tsx:41`, `text-accent` on `bg-background/90` over the video) and the "Legacy" stat label (`:62`, `text-white/70`) reach AA. Measured on one paused frame, they're 4.36:1 at the median (1.88:1 at worst) and 3.07:1.
  - Class tokens only. `design-reviewer` measures across at least 3 video frames, and the motion rules above are unchanged.

  5. **framer-motion:** `MotionConfig reducedMotion="user"` goes inside `SmoothScrollProvider`, not in `layout.tsx`, so the layout stays a server component.
  6. **Lenis** isn't created when reduced motion is on. It's checked at mount, next to the touch check.
  7. **GSAP:**
     - HeroOverlay's timeline and ScaleSection's parallax run inside `gsap.matchMedia("(prefers-reduced-motion: no-preference)")`, reverted on unmount;
     - with reduced motion on, they render in their final state.
  8. **CSS:**
     - the 26 hover transforms and 2 infinite animations the grep found get `motion-safe:`;
     - opacity and colour transitions stay.
  9. **Videos:**
     - a new client component, `src/components/ui/AutoplayVideo.tsx`, renders byte-identical server markup;
     - with reduced motion on, it pauses and shows the poster;
     - it's used in Hero, About and what-we-do.
     - **Cut:** if 5b runs long, this item moves to 5d.
  10. **Preloader with reduced motion:**
      - `motion-reduce:hidden` on its layers, so it never paints;
      - its effect returns at once: no scroll lock, no `scrollTo`, no timers.
  11. **Career page:** `scrollIntoView` uses `behavior: "auto"` when reduced motion is on.
  12. **Must not change:**
      - motion with no reduced-motion setting stays as it is;
      - the admin is untouched;
      - no global "kill all animations" rule.

  **5c: T-029**

  **5c additions** (orchestrator; DECISIONS 2026-10-08). Same files, class tokens and one small behaviour:
  - the public menu closes on any route change, Back and Forward included, with Wave 4d's `menuPath` pattern;
  - `motion-reduce:transition-colors` on the header's padding and border transition (`Header.tsx:24`), and `motion-reduce:transition-none` on the hamburger's bar spans (`:68`), so nothing moves with reduced motion on (Wave 5b's design review).

  13. **The toggle:**
      - `aria-expanded`, plus `aria-controls="mobile-menu"` pointing at a wrapper that's always in the page;
      - a stable name, "Menu";
      - the house focus ring.
  14. **The shared hook, unchanged:**
      - `inertTargets` = `#site-main` and `#site-footer`, with those ids added in `(website)/layout.tsx` and `Footer.tsx`;
      - `closeWhen: "(min-width: 1280px)"`.
  15. **Screen readers and focus:**
      - the menu numbers get `aria-hidden="true"`;
      - each `<nav>` gets a distinct name;
      - every header and menu link gets the house ring.
  16. **Must not change:** `data-lenis-prevent`, `overscroll-contain`, the body-scroll effect, the solid header while the menu is open, and `nav.ts`.

  **Touches:**
  - **5a:** `next.config.ts`, `sitemap.ts`, `Preloader.tsx`.
  - **5b:**
    - `SmoothScrollProvider`, `Preloader`, `HeroOverlay`, `ScaleSection`, `MarqueeSection`;
    - `HeroSection`, `AboutSection` and `what-we-do/page.tsx`;
    - the new `AutoplayVideo` and `CareerPageClient`;
    - class tokens in item 8's files.
  - **5c:** `Header`, `MobileOverlayMenu`, `Footer`, `(website)/layout.tsx`.

  **Unchanged:**
  - Wave 4's unchanged list, except the two files 5a touches;
  - `nav.ts` (`507e5c62…`);
  - every admin file and the hook;
  - `ProductGrid`, `ProductCard` and `products/page.tsx`;
  - the lockfile (`6a026457…`).

  **Security sign-offs voided:** `next.config.ts` (T-025's `a44a56d9…`) and `sitemap.ts` (T-025's `105e1025…`). 5a re-binds both, plus 4b's `[category]` page.

  **Verification:**
  - **5a, local production build on :3101:**
    - `curl -sI` on `/`, `/admin/login`, `/admin` (307), `/what-we-do/t-shirts` (308), `/sitemap.xml` and one static asset: exactly the header set above, and no `x-powered-by`;
      *(Amended 2026-10-08, SEC-INFO-49: under `next start` the 308 is N/A for the header set, because Next 16 drops `headers()` on config redirects. It must still match `main`'s status, `location` and `Refresh`. PM13 records what Vercel sends on the live 308s.)*
    - `/admin/login` is refused inside an iframe;
    - 0 console errors on `/`, `/products` and `/contact`;
    - `npm ls next` still reports 16.3.6;
    - **sitemap:** two fetches are byte-identical, with 0 `<lastmod>` and 18 entries equal to the baseline;
    - **preloader at 1440 px:** 0 frame requests, the bar reaches 100%, and it starts closing between 1200 and 2000 ms; at 360 px it matches `main`.
  - **`/ship`:** the same `curl` on both `www` domains, the bare-domain redirects, and T-025's four checks.
  - **5b:** emulated reduced motion at 360 and 1440 px on `/`, `/what-we-do` and `/products`:
    - no `lenis` class;
    - no transform or infinite animation in `getAnimations()`;
    - no GSAP tween running;
    - videos paused on their posters;
    - the preloader hidden and the page scrollable at 200 ms;
    - hovering a card leaves `transform: none`;
    - with no reduced-motion setting, the same pages match `main`.
  - **5c:** at 360 px:
    - open, Tab wraps, Escape returns focus to the toggle;
    - `inert` is set while open;
    - no menu numbers in link names;
    - resizing to 1280 px closes it;
    - scrolling the open menu with a wheel doesn't scroll the page.

  **Re-review triggers:**
  - any header or value beyond item 1, a fetch directive in the CSP, Report-Only, nonces or middleware, or `preload`;
  - serving the site from a bare domain with `includeSubDomains` (CLIENT_QUESTIONS Q01);
  - touching `redirects()` or the two keep flags;
  - any `lastmod` source;
  - restoring the frames, or timings outside 1200–2000 ms;
  - changes to motion for users without reduced motion, admin changes, or a global kill rule;
  - `aria-modal` or a focus-trap package;
  - editing the hook;
  - an edit to an unchanged file;
  - a sub-wave running past its cut.

  **Split and reviewers:**

  | Sub-wave | Ticket | Time | Reviewers |
  |---|---|---|---|
  | 5a | T-008, T-022, T-017 | about 3 h | premortem first, then code-reviewer and security-reviewer |
  | 5b | T-028 | about 4 h | code-reviewer, design-reviewer |
  | 5c | T-029 | about 2.5 h | code-reviewer, design-reviewer |

  **Premortem — Wave 5a (T-008, T-022, T-017) — 2026-10-07** (`premortem-planner`: GO WITH ADDITIONS; folded verbatim). Its MUST-ADDs PM1–PM15 bind the 5a builder and reviewers; PM13 and PM14 bind `/ship`; its rulings R-1 to R-6 are adopted (DECISIONS 2026-10-07). It ran without a shell, so its production facts come from the contract and `docs/SECURITY.md`; PM13 re-checks them at `/ship`.

  TOP FAILURE MODES (most likely first, max 5):
  1. **A header value, or which responses it reaches, drifts from the contract without anyone noticing.** The typecheck and the build don't check the six hand-typed strings. The worst slips:
     - any fetch directive (`default-src`, `script-src`) blocks Next's scripts, so the preloader painted by the server never lifts;
     - a keyword without quotes (`self`, `none`) is read as a host name, so `form-action self` refuses every form POST sent before the page's JavaScript loads, or with JavaScript off;
     - HSTS is gated on the wrong variable, or sent with `preload`;
     - a narrowed `source` misses the 308s, the middleware's 307 or static files.

     — likelihood L-M × impact H
     SHOWS UP AS: at worst, every page stuck on the black "FASHION ASIA" curtain. Otherwise, contact, career and grievance posts from slow phones fail, or a later scan finds SEC-MED-2 still open.
     CATCH BEFORE MERGE: PM1 and PM2 (agent, source), then PM3, PM6 and PM7 (production build on :3101).
  2. **The preloader rewrite leaves desktop with no way to finish.** If the builder deletes the desktop block but keeps the `if (isMobile)` gate (`Preloader.tsx:44-61`), widths of 768 px and up get no timer at all, because the 2000 ms safety timer (`:77`) is gone too. Dropping the cleanup's `overflow = ""` would also leave the body locked after a fast navigation away. — likelihood L-M × impact H
     SHOWS UP AS: desktop visitors see the curtain forever and can't scroll. Phones are fine, so a 360 px spot check passes.
     CATCH BEFORE MERGE: PM9 (agent, source) and PM10 (headless Chrome at 1440, 1024 and 360 px on :3101).
  3. **Production behaves differently from `next start`.** Vercel already adds its own HSTS (`max-age=63072000`, the only security header `www` sends today). Ours may replace it, or the response may carry two lines. Browsers obey only the first (RFC 6797 §8.1), so `includeSubDomains` could be silently lost. Whether our headers reach the middleware's 307 on Vercel can also only be proven live. — likelihood M × impact M
     SHOWS UP AS: SEC-MED-2 recorded as closed while production still sends Vercel's HSTS, or no headers on `/admin`.
     CATCH BEFORE MERGE: write PM13's exact line-count assertions into the `/ship` checklist now. They run only under an owner "deploy".
  4. **Something legitimate frames the site and goes blank.** Only HSTS is gated, so `X-Frame-Options: DENY` and `frame-ancestors 'none'` also apply under `next dev`, from the moment 5a merges locally. Candidates:
     - the preview pane behind `.claude/launch.json` (the repo doesn't show whether it uses an iframe);
     - VS Code's Simple Browser, which is iframe-based;
     - responsive-preview sites, and Teams or Notion embeds;
     - any review harness that frames pages to screenshot several widths. 5b and 5c's design reviews are next.

     — likelihood M × impact L-M
     SHOWS UP AS: a "refused to connect" pane, or blank frames accepted as screenshots, followed by pressure to loosen the header. Visitors are unaffected: nothing in `src/` or `public/` uses an `<iframe>`, `<embed>`, `<object>` or `<base>`.
     CATCH BEFORE MERGE: PM5 (agent), PM15 (a rule for reviewers), O2 and O3 (owner).
  5. **A header scare after the deploy is "fixed" with Vercel's Instant Rollback.** This is the first deploy since `e8eace1`, so it also ships T-025's permanent 308s (`/what-we-do/:slug` to `/products/:slug`), and browsers cache those. Rolling back to `e8eace1` brings back a build with no `/products/[category]`. No rollback can withdraw HSTS either; that's harmless while it's sent only from `www`. — likelihood L × impact H
     SHOWS UP AS: category pages 404 for every visitor who came after the deploy.
     CATCH BEFORE MERGE: PM14, written into the `/ship` runbook.

  HARD STOPS THIS TICKET TOUCHES: none for the build (no schema, no data deletion, no writes). PM13 and PM14 run only inside an owner message containing "deploy". For R5, nothing unusual is needed: no force push, both remotes, normal commit names.

  MUST-ADD ACCEPTANCE CRITERIA:
  - **PM1 — source literals (agent).**
    - The six values in `next.config.ts` match the contract byte for byte. The CSP is exactly `frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'`.
    - `grep -nE "default-src|script-src|style-src|img-src|connect-src|frame-src|upgrade-insecure|report-|Report-Only|preload" next.config.ts` returns nothing.
    - All values are static literals. The only conditional is HSTS, on `process.env.NODE_ENV === "production"`.
    - There's one rule, `source: "/:path*"`, with no `has` or `missing`.
  - **PM2 — keep flags (agent).** `git diff -U0 main -- next.config.ts | grep -E '^-[^-]'` is empty (additions only), and no added line falls inside `async redirects()` (`:11-33`). That proves `agentRules: false` (`:7`) and `logging: { serverFunctions: false }` (`:10`) are untouched.
  - **PM3 — header check on :3101 (agent; `curl -sI`, no cookies).**
    - URLs:
      - `/`, `/admin/login`, `/admin` (307) and `/no-such-page` (404);
      - `/what-we-do/t-shirts` and `/reports` (308);
      - `/sitemap.xml` and `/robots.txt`;
      - `/logo.png` and one `/_next/static/chunks/*.js` taken from `/`'s HTML (both skip the middleware);
      - `/videos/hero.mp4` (goes through the middleware);
      - `/api/keep-alive` (a HEAD request runs its GET handler, one read-only `select id … limit 1`).
    - On each response: each of the six headers appears exactly once (name case-insensitive, value byte-exact), with no `x-powered-by` and no `content-security-policy-report-only`.
    - HSTS shows here too. The gate is evaluated by `next build`, and browsers ignore HSTS over plain HTTP.
    - Don't sample `/_next/image`: Next's image optimizer may add its own CSP and a second `nosniff`.
  - **PM4 — dev gate (agent, optional).** Only if a dev server is already running on :3000 (don't start one): `curl -sI http://localhost:3000/` shows the five other headers and no `strict-transport-security`.
  - **PM5 — framing (agent; headless Chrome, page loads only).** Frame `http://localhost:3101/admin/login` from (a) `about:blank`, a cross-origin parent, and (b) `http://localhost:3101/`, a same-origin parent, with the iframe injected via `Runtime.evaluate`.
    - In both cases, the child frame ends on an error page (`Page.getFrameTree` shows `unreachableUrl` or `chrome-error://`) and the console shows the `frame-ancestors 'none'` refusal.
    - Use a separate tab, so this expected error doesn't count against PM7.
  - **PM6 — forms stay same-origin (agent, no submit).**
    - In the server-rendered HTML (`curl -s`) of `/contact`, `/career`, `/grievance` and `/admin/login`, every `<form` has `method="POST"` and `action=""` or a relative path. A `javascript:` action would be an older no-JavaScript gap: report it, but don't block on it.
    - `src/` has no absolute `action=` and no `.submit(` call (true today).
    - Install a `securitypolicyviolation` listener with `Page.addScriptToEvaluateOnNewDocument` on `/`, `/products`, `/contact`, `/career`, `/grievance` and `/admin/login`. Load each page, wait 5 s and scroll to the bottom: 0 violations.
  - **PM7 — console (agent).** Extend the contract's "0 console errors" to `/admin/login` and one `/products/<slug>`. Also require 0 messages mentioning `Content Security Policy` or `Permissions-Policy`: Chrome may report quote-less keywords and unknown features as warnings or Issues, not errors.
  - **PM8 — sitemap (agent).**
    - **Baseline:** from a `main` build on :3101, before 5a is built, save `curl -s …/sitemap.xml | sed '/<lastmod>/d'` to the scratchpad. Production can't be the baseline: it predates T-025 and lists 17 URLs under `/what-we-do/<slug>`.
    - **After 5a:**
      - two fetches are identical (`cmp`), and identical to the baseline;
      - `<lastmod>` count is 0, and `<url>` count equals the baseline's (18 today). If the live category count moved, re-take the baseline; don't change code.
      - `xmllint --noout` passes.
    - **Source:**
      - 0 `lastModified` and 0 `new Date`;
      - one comment line added;
      - every removed line is a `lastModified` line.
    - **Build output:** the `npm run build` route table shows `/sitemap.xml` with the same render mode as `main`. A flip to static would freeze the category list and break T-005's AC.
  - **PM9 — preloader source (agent).**
    - `grep -nE "frame_|TOTAL_FRAMES|new Image|innerWidth|isMobile|2000" src/components/global/Preloader.tsx` returns nothing.
    - `setTimeout(finishLoading, 1500)` appears exactly once, outside any `if`.
    - The cleanup still clears the timer and the interval and resets `document.body.style.overflow`.
    - `finishLoading` (`:23-38`) and the JSX return (`:84-171`) match `main` by sha256.
    - The header comment (`:6-11`) is updated.
    - `git diff --stat main` lists only the three Touches files, plus docs.
  - **PM10 — preloader in the browser (agent; headless Chrome, page loads only).**
    - Run at 1440×900, 1024×768 and 360×800, on `/`, `/what-we-do` and one `/products/<slug>`.
    - **Network:** 0 requests matching `/sequence/hero/frame_`. `/` still requests `poster.webp` and `/videos/hero.mp4`.
    - **Timing:** a small logger injected into the page records three moments:
      - t0, when `body.style.overflow` first becomes `"hidden"`;
      - t1, when the top panel first moves;
      - t2, when overflow returns to `""`.
    - **Pass if:**
      - t1 − t0 is between 1200 and 2000 ms (about 1500 expected);
      - t2 − t1 is about 800 ms (± 150);
      - "100%" shows before t1;
      - the overlay is gone about 1 s after t2;
      - a scroll-wheel event after t2 moves the page.
    - At 360 px, the times match `main` within ±100 ms.
    - Optional: a background tab unlocks within 5 s. Chrome throttles timers in hidden tabs, so the bar may stop short of 100% there, which is only cosmetic.
  - **PM11 — unchanged files (agent).**
    - 0-byte diff against `main` for:
      - `HeroSection.tsx`, `poster.webp` and `SmoothScrollProvider.tsx`;
      - both middleware files and `vercel.json`;
      - `nav.ts` (`507e5c62…`) and the lockfile (`6a026457…`).
    - `npm ls next` still reports 16.3.6.
  - **PM12 — paper trail (security-reviewer).** Record the explicit agreement to an enforcing CSP (or to the fallback of dropping it) under SEC-MED-2 in `docs/SECURITY.md`. T-008's AC #2 still requires that written agreement. Re-bind the hashes of `next.config.ts`, `sitemap.ts` and 4b's `[category]` page.
  - **PM13 — `/ship` assertions (owner "deploy" only).**
    - Run PM3 on both `www` domains. Skip `/api/keep-alive`, and take the `_next/static` URL from freshly fetched HTML: during the switch-over (Skew Protection), old-deployment files lack the headers.
    - `strict-transport-security` appears exactly once, as `max-age=63072000; includeSubDomains`. If there are two lines, or Vercel's value wins, mark SEC-MED-2 as still open and file a follow-up. Don't roll back.
    - The bare domains `https://fashionasialtd.com/` and `https://fal.com.bd/` still answer 307 or 308 to their own `www` host, with none of our headers. If either returns 200 or carries our headers, **STOP**: the app is serving a bare domain, and `includeSubDomains` would force HTTPS on every one of its subdomains for 2 years.
  - **PM14 — rollback rule (`/ship` runbook).** If a 5a header misbehaves live, revert 5a's commits and ship again (both remotes, no force). Never use Instant Rollback to `e8eace1` or any build before T-025.
  - **PM15 — review rule (applies from 5a; 5b and 5c inherit it).** No screenshot or evidence from a page rendered inside an `<iframe>`. Use one top-level tab per width, with the browser's device emulation.

  GO / NO-GO: GO WITH ADDITIONS. Fold in PM1–PM15 and rulings R-1 to R-6 below. None of them needs an owner decision before building.

  **Lower-ranked failure modes**
  6. **Wrong baselines cause false failures, then out-of-contract "fixes".** Examples: comparing the sitemap with production, a category edited mid-run, preloader timing measured from navigation start instead of from mount, or "exactly the header set" read as "no other headers", which would flag Next's own `vary` and `cache-control`. M × L-M. PM3, PM8 and PM10 define these.
  7. **`form-action 'self'` blocks a real submission.** L × H.
     - All five Server Action forms post to their own origin: `ContactForm.tsx:13`, `CareerPageClient.tsx:44`, `GrievanceForm.tsx:13`, `admin/login/page.tsx:26` and `(dashboard)/layout.tsx:12`. `MediaPublishForm` is JavaScript-only.
     - Every redirect is relative (`auth-actions.ts:19,25`) or built with `nextUrl.clone()` (`supabase/middleware.ts:25-33`).
     - Submissions with JavaScript on are `fetch` calls, which no directive here covers.
     - PM6 and O1 cover it.
  8. **`includeSubDomains` later reaches a bare domain.** That happens if the site moves to the bare domain (CLIENT_QUESTIONS Q01; `NEXT_PUBLIC_SITE_URL` already defaults to bare `fashionasialtd.com`). Webmail, cPanel or any HTTP-only subdomain would then fail for 2 years in every browser that visited. L today × H. PM13's STOP and R-3 cover it.
  9. **A local HSTS pin.** If the :3101 build were ever served over HTTPS on `localhost`, the 2-year pin would apply to every localhost port, including the other project on :3001. L × M. R-2 covers it.
  10. **The sitemap turns static at build time** and freezes the category list. L × M. PM8 covers it.
  11. **`nosniff` blocks a script or stylesheet with the wrong content type.** `public/` has no `.js` or `.css`, so the risk is effectively nil.
  12. **Background tabs** open the curtain late, or with the bar under 100%. Today's phone path already behaves this way. L × L.

  **Owner-only checks**
  - **O1.** On `http://localhost:3101`, sign in at `/admin/login`, open one admin page and sign out. Don't save anything. This proves sign-in and sign-out (cookies and redirects) still work with all the headers on. It's the only 5a check that needs a session.
  - **O2.** Open the dev server and :3101 in whatever preview pane you use. If it says "refused to connect", that's the clickjacking protection working: use a normal browser tab, and don't ask for the header to be loosened.
  - **O3.** Before the deploy: does anything show the site inside a frame? For example an FAL intranet page, a buyer or compliance portal, a Teams tab, or a Notion or Figma embed of `/layout-preview.html`. If so, it needs named origins added to `frame-ancestors`, which goes back to review. Removing the header isn't the fix.
  - **O4.** After the deploy, on a real desktop and a phone, on both `www` domains: the curtain opens in about 1.5 s and the page scrolls. Within a day, Vercel's 404s for `/sequence/hero/frame_` should drop to near zero (today about 160 per desktop page view).
  - **O5.** A `/ship` precondition rather than a 5a check: Supabase sign-ups are OFF (R1). The checkpoint memory says they're still on.

  **Rulings to make before building**
  - **R-1. No header in item 1 is unsafe here; go straight to an enforcing CSP.**
    - There's no `<iframe>`, `<embed>`, `<object>` or `<base>` in `src/`, and no PDF in `public/`. Reports are Supabase links that open in a new tab (`sustainability/page.tsx:163-170`).
    - Nothing uses the camera, microphone, location, payments or USB.
    - The hero is a muted autoplay `<video>` with no fullscreen (`HeroSection.tsx:15-24`).
    - Record the agreement as PM12.
  - **R-2. Keep the `NODE_ENV` gate, but write down what it means.** `headers()` is resolved during `next build`, so every build sends HSTS: :3101 (ignored over plain HTTP) and any `*.vercel.app` preview (harmless). The local production check stays on plain `http://`.
  - **R-3. Put a one-line comment beside the HSTS entry, plus a DECISIONS line:** `includeSubDomains` is safe only while both bare domains are Vercel redirects, and must be removed before the site is ever served from one.
  - **R-4. A rollback means reverting and shipping again** (PM14).
  - **R-5. Accept that the framing headers also apply under `next dev`,** so dev matches production. PM15 becomes the rule for reviewers.
  - **R-6. Add `Referrer-Policy: no-referrer` to the re-review triggers.** With it, form posts sent without JavaScript carry `Origin: null`, which Next 16.3.6 rejects (`docs/SECURITY.md`, 2026-09-28 amendment). Every no-JavaScript submission would then fail.
  - **Two older AC lines the contract already overrides:**
    - T-022's AC says there are 10 `lastModified` lines; the file has 11 (`sitemap.ts:24,32,38,44,50,57,63,69,75,81,87`).
    - T-017's "mobile branch unchanged" is satisfied, since every width now runs that branch.

  **Other findings in the code (not 5a; for the backlog)**
  - `public/layout-preview.html` is a design-comparison page that production serves publicly. It's marked noindex, loads Google Fonts and has an inline script. 5a doesn't break it, but after 5a it can't be embedded in a frame. Whether it should ship at all is an owner question.
  - The `/reports` redirect goes to `/sustainability#reports`, but the preloader's `scrollTo(0,0)` and scroll lock probably undo the jump, so visitors likely land at the top. This predates 5a, and `scrollTo` is frozen for this wave.
  - The middleware matcher (`src/middleware.ts:10`) doesn't skip `.mp4`, `.xml`, `.txt` or `.html`, so the session check runs on hero-video requests, the sitemap and robots. This also predates 5a, and changing the middleware triggers a re-review.
  - If report PDFs ever move onto this site's own domain, re-test Chrome's PDF viewer under `object-src 'none'` and `X-Frame-Options`.
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

- [x] **T-009** — Harden `ImageUploadField`'s advisory/error state: 0×0 NaN guard, re-entrant upload race, stale warning after manual path edit
  Done 2026-10-07, in **Wave 3b** with T-010:
  - **Commits:** `f8e29ed` (T-009) and `367a6ab` (T-010). 5 files, +248/−25: `upload-limits.ts` (item 7), `ImageUploadField.tsx`, `SettingsForm.tsx` (`ObjectListEditor`), `ProductsClient.tsx` and `HomepageSettingsClient.tsx`. `CategoryProductsManager.tsx` and every server file have a 0-byte diff.
  - **What changed:** a zero or non-finite side now warns instead of passing silently; only the latest pick is applied, through the `onChange` captured at that pick; a hand edit in the path box clears stale notices; list rows are keyed by a per-instance `WeakMap`, so an edit or upload lands on its own row (a result for a removed row is dropped); focus stays on a moved row and goes to a neighbour after a remove; Save on Products and Homepage waits for uploads (UPLOAD_IN_PROGRESS).
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: FIX FIRST for missing tests only (no bug found), then SHIP. It added 11 scenarios itself (save-then-edit, an overtaken pick that throws or fails, two picks in the same task). HEAD passed them all, and its surviving mutants R8, R2 and R1 are now caught.
    - `security-reviewer`: CLEARED. `upload-limits.ts` is re-bound at `3bff92b6…`, the four client files are bound by the restated invariants, and there's no new finding.
    - No `/design-review` (DECISIONS 2026-10-07). The admin is NOT VISUALLY VERIFIED against the live login.
  - **Follow-ups:** under "Follow-ups found in Wave 3b" (UPLOAD_IN_PROGRESS staying up goes to T-034; the focus selector note goes to T-011).
  **Built in Wave 3b with T-010 under the Wave 3 contract** (`architect-reviewer`, 2026-10-06): see T-019, items 7–8 plus the amendments. Where this ticket's AC differs, the contract wins.
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

- [x] **T-010** — Stop a reordered/deleted `ObjectListEditor` row from inheriting a sibling's stale upload warning/error
  Done 2026-10-07 in **Wave 3b** (commit `367a6ab`; reviews and evidence under T-009's done note). WARN-4's repro is fixed by stable row keys: a moved or neighbouring row no longer shows another row's notice, and the shared upload race is closed on every `ObjectListEditor` image list.
  **Built in Wave 3b under the Wave 3 contract** (`architect-reviewer`, 2026-10-06): see T-019, items 9–12 plus the amendments. These replace this ticket's interim fix with stable row keys, uploads that land on their own row, and Save waiting for uploads.
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

- [x] **T-011** — Fix WCAG AA contrast and keyboard-focus visibility in shared admin upload/list components
  Done 2026-10-07 in **Wave 4c**:
  - **Commits:** `b007771` (items 11–12: ids, names, list groups), `a77ad46` (items 13–15 plus the 4c additions), `bf72bfe` (items 16–17) and `43fd990` (fix round: Stats rows fit at 360 px and are named per card; the login page's raw values go; login errors are announced; the drop zone uses a named group).
  - **What changed:** every control in the shared editor parts, the Sync panel and `/admin/login` has a name tied to its visible label (0 unnamed controls, from 6 on Products, 8 on Business and 2 on login); list headings name their group; Move/Remove names carry the row number and title; labels and hints are at least 5.3:1; every control has the house focus ring, the file input's on its drop zone; controls look disabled while saving; focus returns to Save after a keyboard save; the Sync checkboxes keep focus; the result regions are always mounted.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP, with five minor notes; two were fixed in `43fd990`, which it re-checked SHIP. Every logic block matches `main` by sha256, and each commit typechecks on its own tree.
    - `design-reviewer`: FIX FIRST (the Stats rows were cut off at 360 px, the homepage's Stats names repeated, and two raw values remained on the login page), then SHIP after `43fd990`.
    - No `security-reviewer`: the recorded 4a–4c exception. `code-reviewer` confirmed its conditions, with React APIs from the existing `react` import counting as no new import (DECISIONS 2026-10-07).
  - **NOT VISUALLY VERIFIED:** the live signed-in admin (stand-ins with the real components and CSS), Safari and Firefox, Windows High Contrast, a real screen reader, and 768/1024 px.
  - **Follow-ups:** under "Follow-ups found in Wave 4c".
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

- [x] **T-013** — Harden `reorderCategoryProducts`: validate input completeness, batch the write, revalidate on failure
  Done 2026-10-06 in **Wave 2b**, commit `48fc3d7`. There's an exact-set check before any write; only rows that move are written, each filtered by id and category and confirmed; a failure puts the written rows back (REORDER_STALE / FAILED / PARTIAL); pages refresh after any write attempt; there's no upsert or insert.
  - **Reviews** (lean protocol): `code-reviewer`, with light QA: SHIP. `security-reviewer`: CLEARED, re-bound `products-actions.ts`, narrowed SEC-INFO-16 to the accepted residual, and filed SEC-INFO-45.
  - **Tests:** T-013 100/100 and 59/59 mutants; the T-016 harness passes, with the UI at 319/319.
  **Built in Wave 2b under the Wave 2 contract** (`architect-reviewer`, 2026-10-06): see T-018, item 9. There's no upsert and no database function: exact-set validation, writes only for changed rows, put-backs on failure. Where this ticket's AC below differs ("single batched write"), the contract wins.
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

- [x] **T-014** — Add an image-URL scheme allow-list and a `name` length cap to the products write path
  Done 2026-10-06 in **Wave 2a** (commits `1c3027a`, `732c67e`; reviews and evidence under T-018's done note). Image addresses must be `https://` or a root path, with no whitespace or invisible characters; names over 255 code points are refused; a new product always goes at the end of its category.
  **Built in Wave 2a with T-018, under one binding contract** (`architect-reviewer`, 2026-10-06): see T-018, items 5–8. Where this ticket's AC below differs (the `http://` scheme, `name.slice`, the `sort_order` clamp), the contract wins.
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

- [x] **T-017** — Remove the dead hero frame-preload loop from the desktop Preloader without freezing its progress bar
  Done 2026-10-08 in **Wave 5a** (commit `2db0af9`; reviews under T-008's done note). Every width runs the timed path: the bar reaches 100% and the curtain starts opening at about 1.5 s (1563–1585 ms measured at 1440, 1024 and 360 px), with 0 frame requests instead of 160 per desktop page view. `finishLoading` and the JSX are byte-identical to `main`. Desktop now opens about 300 ms later than before, as item 4 intends.
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

- [x] **T-018** — Replace raw database error text in admin Server Action results with generic messages, logging the raw error server-side
  Done 2026-10-06, in **Wave 2a** with T-014:
  - **Commits:** `e87f2ab` (contract and premortem folded in), `022d5fc` (T-018), `1c3027a` (T-014), `732c67e` (the fix round: a stricter image rule and clearer image messages).
  - **Reviews** (the lean protocol, DECISIONS 2026-10-06):
    - `code-reviewer`, which also reviewed the wording in place of a separate `/design-review` for copy-only changes: FIX FIRST on the image rule, then fixed and re-checked.
    - `security-reviewer`: CLEARED. It re-bound the five files, and re-bound the two fix-round files. SEC-MED-7, 8, 11 and 13 and SEC-INFO-15 close in code; SEC-INFO-42 and 43 close in the fix round.
    - QA: PASS. 15 public pages are byte-identical to the post-Wave-1 baseline, and the admin gate held on 40 of 40 probes.
  - **Narrowed:** premortem MUST-ADD 10 now covers the product writes only; the other writes went to T-039 (DECISIONS 2026-10-06, SEC-MED-16).
  - **Evidence:** `docs/qa-evidence/WAVE-2A/`.
  **Wave 2 binding contract, covering T-018, T-014 and T-013** (`architect-reviewer`, 2026-10-06: APPROVE; folded verbatim, so no second `/architect-review` is needed). It's split under the ½-day line: **Wave 2a** is T-018 then T-014; **Wave 2b** is T-013. Each wave has its own review stage. It needs no schema change, no new dependency and no new database object, so there's no HARD STOP. Where the older AC below conflicts with this contract, the contract wins.
  - **Scope guard:** code only. Every file on the unchanged list stays byte-identical. No new exported function in any `"use server"` file. Every message is a non-exported constant or a private function that builds it. `/design-review` may tune the wording; the names, the files they live in and when they show are binding.
  1. **The shared helper** (T-018), a new file, `src/lib/action-errors.ts`.
     - Plain TypeScript with no imports. It isn't a `"use server"` file, and only the three action files import it.
     - `actionFailure(kind: "save" | "delete" | "read" | "upload", context: string, error: unknown): { ok: false; error: string }` logs `console.error(context, error)` on the server, then returns that kind's fixed message. `logActionError(context, error)` only logs, for branches that return their own message.
     - The fixed messages, private to the helper:
       - **save:** "Something went wrong, so nothing was saved. Try again in a moment."
       - **delete:** "Something went wrong, so nothing was deleted. Try again in a moment."
       - **read:** "Nothing was saved, because the saved data couldn't be read. Try again in a moment."
       - **upload:** "The file couldn't be uploaded. Try again in a moment."
     - No `server-only` package: it isn't installed, and adding it would be a new dependency.
  2. **What it covers** (T-018). Every returned `error.message`, `readError.message`, `insertError.message`, `updateError.message` or `countError.message` in the three files becomes an `actionFailure` call:
     - **save:** the product insert and update; `updateSettings`' upsert; the Sync's whole-row upsert; `writeBusinessFields`' insert (except 23505) and its update; create and update for reports, leaders and jobs.
     - **delete:** the product, report, leader and job deletes.
     - **read:** the product update's read of the stored row; `writeBusinessFields`' read; `saveCategories`' delete-guard count; the Sync's read.
     - **upload:** `uploadFile`'s storage error.
     - **Unchanged inside the compare-and-swap writer:** the 23505 → SAVE_CONFLICT branch, the 0-row SAVE_CONFLICT with its diagnostic logs, and BUSINESS_UNREADABLE. In `writeBusinessFields` and `saveCategories`, only the error-return lines change.
     - **Through Wave 1's Sync wording,** a database failure in the What We Do step reads "The What We Do page text wasn't synced: Something went wrong, so nothing was saved. Try again in a moment." `/design-review` may tune the generic text; Wave 1's wrapper stays.
  3. **Malformed arguments** (T-018, QA T-016 I1). These checks run right after `getUser()`, so no action throws on a malformed argument.
     - **Create:** an input that isn't a plain object (null, an array or a primitive) returns NOTHING_TO_SAVE, with Wave 1's wording. A `category_slug` that isn't a string, or is blank after trimming, returns "Missing category.".
     - **Update and delete:** an `id` that isn't a string, or is empty, returns "Missing product id.".
     - **Reorder:** see item 9.
  4. **The sitemap comment** (T-018). In `saveCategories`, the comment above `revalidatePath("/sitemap.xml")` should say the sitemap stays fresh because it renders on every request (`sitemap.ts` → `getSettings` → `createClient()` → `cookies()`), and that this call is a harmless extra. Comment only.
  5. **The image address rule** (T-014, SEC-MED-7 and 13).
     - **The rule:** `export function isAllowedImageUrl(value: string): boolean` in `site-content.ts`. It uses only the global `URL`, so the file keeps no imports. It returns true only for:
       - a path from the site root (a `/` followed by a character that's neither `/` nor `\`); or
       - an absolute `https:` address that `new URL` can parse, with a host and no username or password;
       - and, in both cases, no backslash, whitespace or control character anywhere.
     - **Refused:** everything else, including `http:`, `data:`, `javascript:`, `blob:`, `//host`, `/\host` and paths without a leading slash. `http:` is refused on purpose, narrowing the ticket's AC: on this `https` site, browsers upgrade or block such images.
     - **Products:** on create, and on update when an image is sent, after the visible-character check. A failure returns PRODUCT_IMAGE_INVALID: "The image address must start with https:// or /. Upload the image, or paste its full https:// address, then try again."
     - **Categories:** in `resolveCategoriesForSave`, after the blank-image fallback and Wave 1's title checks. Every row's image must pass, or the whole save is refused: `"<title>"'s image address must start with https:// or /, so nothing was saved. Upload the image, or paste its full https:// address, then save again.`
     - **No check in the browser.** The add form, the product row and the Categories header already show the server's message, which meets SEC-MED-13's "visible in the ordinary admin" rule.
  6. **The name length** (T-014, SEC-INFO-15).
     - A private `MAX_PRODUCT_NAME_LENGTH = 255` in `products-actions.ts`, with a comment saying it mirrors `products.name VARCHAR(255)`. Length is counted in code points (`Array.from(name).length`), the way Postgres counts `VARCHAR`.
     - A longer name is refused, never cut: PRODUCT_NAME_TOO_LONG, "A product name can be at most 255 characters. Shorten it, then try again." It's checked on create, and on update when a name is sent, right after the PRODUCT_NAME_REQUIRED check. This replaces the AC's `name.slice(0, 255)`.
  7. **Where a new product goes** (T-014, SEC-MED-11).
     - A caller's `sort_order` is never read. Every new product goes at the end of its category (the current highest position + 1). `sort_order` comes out of `CategoryProductInput` and `sanitizeInput`, and the type's comment is updated.
     - If the read of the highest position fails, the create fails closed with `actionFailure("read", …)` and nothing is inserted. Today that failure is ignored and the product lands first. This replaces the AC's clamp to 0–2147483647.
  8. **Check order in the product write actions.** Every action starts with `getUser()` as its first await (SESSION_EXPIRED).
     - **Create:** item 3's argument checks; `sanitizeInput`; the name (visible → PRODUCT_NAME_REQUIRED, then at most 255 → PRODUCT_NAME_TOO_LONG); the image (visible → PRODUCT_IMAGE_REQUIRED, then allowed → PRODUCT_IMAGE_INVALID); `checkCategoryAttachable`; the read of the highest position; the insert; refresh.
     - **Update:** the id check; `takePatchFields` (T-016's, unchanged); NOTHING_TO_SAVE if nothing was taken; the item 6 and item 5 checks on whichever fields were sent; the stored-row read (not found → PRODUCT_NOT_FOUND); `checkCategoryAttachable` on the stored category; the update (no row → PRODUCT_NOT_FOUND); refresh.
     - **Delete:** the id check, the delete (no row → PRODUCT_NOT_FOUND), then refresh.
  9. **Reorder** (T-013, **Wave 2b**). No upsert and no database function: a batched upsert would insert a blank product for an id deleted in the meantime, or fail NOT NULL on `category_slug`, and a database function is a new database object (an owner HARD STOP).
     1. `getUser()`.
     2. `categorySlug` must be a non-blank string, or "Missing category.".
     3. `orderedIds` must be a non-empty array, or "Nothing to reorder.".
     4. `checkCategoryAttachable`.
     5. Read the category's rows (`id, sort_order`, filtered by `category_slug`). An error returns `actionFailure("read", …)`.
     6. `orderedIds` must be exactly the stored ids: every entry a string, no duplicates, the same count, and each one stored. Otherwise REORDER_STALE: "The products in this category changed since the page loaded, so the new order wasn't saved. Reload the page and try again."
     7. Write only the rows whose stored `sort_order` differs from their new position, one at a time, as `update({ sort_order, updated_at }).eq("id", id).eq("category_slug", slug).select("id")`. Each write must change exactly one row. If nothing differs, return ok without writing.
     8. On an error, or a write that changes no row: log it with `logActionError`, then put every row already written back to its stored `sort_order`, newest first, with the same filters. Return REORDER_STALE if everything was put back and a product had disappeared; REORDER_FAILED ("The new order couldn't be saved, so nothing changed. Try again in a moment.") if everything was put back after an error; REORDER_PARTIAL ("The new order was only partly saved. Reload the page to see the current order, then try again.") if any put-back failed.
     9. After any write attempt, successful or not, call `revalidateCategory(slug)`.
     - **Accepted residual:** if a write and its put-back both fail, the category keeps a mixed order until the next successful reorder, and REORDER_PARTIAL tells staff to reload. Making it truly all-or-nothing needs a database function, which waits for the owner.
  10. **No client changes.** T-016's queue shows `error` as plain text, keeps the committed values on a failure, and resends them on Retry or the next commit. So a refusal stays on the row until the user fixes the field the message names. `moveProduct` already swaps the two products back on screen and shows the message.
  11. **Must not change:**
      - **Every hand-written message, byte for byte, re-baselined on Wave 1's merged strings:** SESSION_EXPIRED in all three files; PRODUCT_NOT_FOUND, REPORT_NOT_FOUND, LEADER_NOT_FOUND and JOB_NOT_FOUND; every "Missing … id." message, "Missing category.", "Nothing to reorder.", "No file provided." and "No pages selected."; PRODUCT_NAME_REQUIRED and PRODUCT_IMAGE_REQUIRED; Wave 1's NOTHING_TO_SAVE, CATEGORY_CHECK_FAILED, UNKNOWN_SETTINGS_KEY and SEED_CONFLICT; BUSINESS_MOVED, BUSINESS_UNREADABLE and SAVE_CONFLICT; the "not saved yet" and "does not exist" texts, every name-clash and category-identity message, Wave 1's title refusals, both delete-guard messages, and `pickWhatWeDoText`'s message.
      - T-026's compare-and-swap, apart from item 2's error-return lines; T-016's partial update.
      - Every read function (`getCategoryProducts`, `getAllCategoryProducts`, `getSettings`, `getReports`, `getLeaders`, `getJobs`).
      - Every page-refresh target, apart from reorder's new refresh after a failure; and Wave 1's rules.
  12. **Commits and checks.**
      - **Wave 2a:** a T-018 commit (helper, coverage, argument checks, comment), then a T-014 commit (image rule, name length, create order). **Wave 2b:** one T-013 commit. Each must typecheck and build on its own.
      - **No agent writes anything.** Fake-database scripts must cover:
        - every database-error branch, showing it returns the fixed message and that no result contains the fake error's text;
        - a table of image addresses and a table of name lengths, including 255 emoji;
        - reorder: the exact set, changed rows only, put-backs, a disappeared row, and both filters on every write;
        - a re-run of T-016's harness;
        - a byte-for-byte diff of item 11's message list.
      - If staff edit category images after 2026-10-06, re-check the live images read-only before merge.
  - **Touches.**
    - **Wave 2a:**
      - new `src/lib/action-errors.ts` (a new sign-off);
      - `settings-actions.ts` and `products-actions.ts` (both void Wave 1's re-signs);
      - `jobs-actions.ts` (voids T-015's `628e5e74…`);
      - `site-content.ts` (voids Wave 1's re-sign).
    - **Wave 2b:** `products-actions.ts`, the reorder function only.
  - **Unchanged** (byte-identical, by hash where signed off):
    - `settings-read.ts` (`cc5c8a2c…`), `business/page.tsx` (`87071736…`) and the admin `products/page.tsx` (`969a00de…`);
    - both public products pages at Wave 1's hashes;
    - `nav.ts`, `sitemap.ts`, `next.config.ts`, `middleware.ts` and `src/lib/supabase/*`;
    - `media-actions.ts`, `form-actions.ts` and `auth-actions.ts`;
    - every client component (`CategoryProductsManager`, `ProductsClient`, `ImageUploadField`, `SettingsForm`, `BusinessClient`, `SeedDefaultsPanel`, `category-draft`, the six settings clients, Reports, Careers, Who We Are and the catalog components);
    - `db/`, `supabase-schema.sql`, `package.json` and `package-lock.json`.
  - **Docs at close:**
    - ROADMAP and DECISIONS;
    - SECURITY, which closes SEC-MED-7, 8, 11 and 13, SEC-INFO-15 and 16, and QA T-016 I1;
    - DATA_MODEL §3, the products rules;
    - STACK §4, which adds the shared helper;
    - INVENTORY, regenerated with `@purpose` on `actionFailure`, `logActionError` and `isAllowedImageUrl`.
  - **Sequence:**
    - **Wave 2a (about 3.5 hours):** `/build` ✅ → wording (folded into `code-reviewer` under the lean protocol) ✅ → `/security-review` ✅ CLEARED → `/qa` ✅ PASS → `code-reviewer` ✅ FIX FIRST → fixed → merge ✅ (2026-10-06).
    - **Wave 2b (about 1.5 hours):** `/build` ✅ → `/security-review` ✅ CLEARED → `/qa` (folded into `code-reviewer`'s light QA, under the lean protocol) → `code-reviewer` ✅ SHIP → merge ✅ (2026-10-06).
  - **Re-review triggers:**
    - **Schema and dependencies:** any SQL, migration, table, column, index, constraint, RPC, database function or trigger; any new dependency, including `server-only`.
    - **Reorder:** an upsert or insert in reorder, or any write other than create that can make a product row; a reorder write without both the id and category filters; dropping the exact-set check.
    - **The validation rules:** an image rule wider than `https://` plus root paths, or a host allow-list; truncating names, or counting UTF-16 units; reading a caller's `sort_order`.
    - **What must not change:** a change to any message in item 11; raw database text reaching any result in the three files; changes to `writeBusinessFields` or `saveCategories` beyond their error-return lines, to `takePatchFields`, or to any refresh target.
    - **Files and scope:** an edit to any file on the unchanged list; the helper becoming `"use server"` or being imported by a client component; pulling in items from T-019, T-010, T-007 or T-009; either wave growing past its estimate.
  **Wave 2 premortem (`premortem-planner`, 2026-10-06: GO WITH ADDITIONS). These MUST-ADDs are binding.** Its must-settle points L1–L4 are settled by contract items 5, 6, 7 and 9. Where a MUST-ADD assumed a different answer (spaces in image paths, a per-code error mapping), it's restated here to fit the contract.
  - **Top failure modes:**
    1. The image rule refuses real values. Because it runs on every category in every save, that locks the catalog: no first Save means no products.
    2. Generic messages swallow the instructions staff act on, above all the "save the categories once" prompt.
    3. A reorder is refused, half-written, or creates ghost rows.
    4. A correct refusal still loses an edit in T-016's queue.
    5. The name cap or the `sort_order` handling quietly damages data.
  1. **One image rule, in one place:** `isAllowedImageUrl` in `site-content.ts`.
     - **Called by:** create (`sanitizeInput`'s output); `updateCategoryProduct`, only when `image` is present; and `resolveCategoriesForSave` on every category, after the blank-image fallback. All three run before any database read.
     - **Untouched:** every other image field (homepage, leaders, gallery) keeps its save path byte for byte.
  2. **The rule's truth table, checked offline.**
     - **Accepted:**
       - the 8 live category image URLs (from the scratchpad `wave-1/baseline-95f7ea1/*.html`);
       - every `PRODUCT_IMAGES` value and `PRODUCT_IMAGE_FALLBACK`;
       - an upload's returned URL shape;
       - a Storage URL with `?t=1&width=800`;
       - an uppercase `HTTPS://` address (normalized by `URL`).
     - **Refused, with the named message:**
       - `C:\photos\tee.jpg`, `www.example.com/tee.jpg`, `example.com/x.jpg`;
       - `javascript:alert(1)`, `data:image/svg+xml,…`, `blob:…`, `file:///x`;
       - `//cdn.example.com/x.jpg`, `/\evil.example/x.jpg`, `images/x.webp`;
       - `https://` with no host, a username or password in the URL;
       - `http://…`;
       - any value containing a space, tab or newline (contract item 5).
     - **Check before merge:** no live or default image contains whitespace.
     - **Regex:** any regex used has no `g` or `y` flag.
  3. **Staff's first Save still succeeds.** Re-run Wave 1's offline first-Save simulation with this rule: `resolveCategoriesForSave(<the 8 baseline categories with their live images>, new Map())` returns `ok: true`, with the same 8 slugs. A category whose image fails the rule refuses the whole save, with a message naming its title.
  4. **The refusal is visible in ordinary use,** in T-016's synthetic UI harness.
     - **Product row:** a refused image shows the row's red error and Retry; the draft keeps the text; ▼ and the trash work again; a later valid commit sends `{ image }` and saves.
     - **Merged commits:** a merged `{ description, image: <bad> }` is refused as a unit, and the next commit, after the image is fixed, sends both.
     - **Add a product:** the form's red error shows, and nothing is added.
     - **A category card:** `SettingsHeader` shows the message naming the category, and the draft stays.
     - **Client mirrors:** none disables a button without showing the same text.
  5. **The name cap:** a trimmed name over 255 code points is refused on create and update, before any read. 255 Bengali characters, 255 ASCII characters, and 127 emoji plus one letter are all accepted. No lone surrogate can reach the database, and names of 255 code points or fewer pass unchanged.
  6. **`sort_order` on create:** a caller's value is ignored, a failed max-order read returns `actionFailure("read", …)` and inserts nothing, and an omitted value still lands at max + 1.
  7. **Reorder (T-013, Wave 2b),** with a fake database that interleaves concurrent edits.
     *(Amended 2026-10-06, `code-reviewer` Y3: an empty list or a non-array answers "Nothing to reorder.", per contract item 9.3 and item 11, not REORDER_STALE. The contract wins.)*
     - **Order:** the checks run in item 9's order.
     - **REORDER_STALE, nothing written,** for a missing id, an extra id, an id from another category, a duplicate, an empty list, a non-array, or non-string entries.
     - **No upsert or insert:** none on the reorder path.
     - **Scoped, confirmed writes:** every update is filtered by `id` and `category_slug` and confirmed with `.select("id")`. A product deleted between the check and the write leads to put-backs and REORDER_STALE, and never creates a row.
     - **Results:** `ok: true` only when every changed row is confirmed written. `revalidateCategory` runs after any write attempt.
     - **In T-016's UI harness:** a refused reorder swaps the rows back by id and shows the message.
  8. **Generic messages (T-018),** by code reading plus a harness.
     - **All 22 raw-message sites** return a fixed message:

       | File | Functions |
       |---|---|
       | `jobs-actions.ts` | `createJob`, `updateJob`, `deleteJob` |
       | `settings-actions.ts` | `updateSettings`; the Sync's read and write; `writeBusinessFields` (read, non-23505 insert, update); `saveCategories`' product count; reports ×3; leaders ×3; `uploadFile` |
       | `products-actions.ts` | create; update (read and write); delete; reorder |

     - **No `.message` in any returned `error`** in the three files, Wave 2's own new branches included.
     - **The mapping** is the contract's four kinds (save, delete, read, upload). There's no per-code mapping.
     - **Byte-identical:** every message in contract item 11.
  9. **Logs.**
     - **What's logged:** the helper logs a context label and the error object (`code`, `message`, `details`, `hint`).
     - **What's never logged:** the request payload or form data, the user object, emails, cookies or tokens.
     - **Not an endpoint:** the helper isn't a `"use server"` module.
     - **Unchanged files:** `form-actions.ts` (the submissions insert), `admin/(dashboard)/submissions/page.tsx` and `media-actions.ts` have 0-byte diffs.
  10. **No action throws on a bad argument.**
      - **What the harness sends:** every write in the three files gets `null`, `undefined`, numbers, arrays, `{ category_slug: 5 }` and `orderedIds` values that aren't arrays.
      - **Signed out:** SESSION_EXPIRED comes back first.
      - **Signed in (fake):** each call returns `{ ok: false }` with fixed wording, never throws, and writes nothing.
  11. **T-016 and Wave 1 still hold.** Re-run their harnesses on the Wave 2 tree. Expectations may change only for the new refusals and the generic messages, and the mutation suites still catch everything.
  12. **Each editor's error display.**
      - **Plain text:** the 5 settings clients, `CareersClient`, `ReportsClient`, `WhoWeAreClient`, `ProductsClient` and `CategoryProductsManager` still show `result.error` as plain text in a `role="alert"`.
      - **No text matching:** none checks the error's text.
      - **`ReportsClient`'s comment** ("the real reason from uploadFile") becomes stale, because the file is on the unchanged list. That's accepted, and noted for T-033's or a later copy pass.
  13. **Scope and security sign-offs.**
      - **Public pages:** HTML is identical to the post-Wave-1 baseline at 0 products.
      - **Unchanged-list files:** 0-byte diffs, and no new export in any `"use server"` file.
      - **Security re-binds by sha256:** `products-actions.ts`, `settings-actions.ts`, `site-content.ts` and `jobs-actions.ts`, plus a new binding for the helper.
      - **INVENTORY:** `@purpose` lines for the helper and the image rule.
      - **Evidence:** in `docs/qa-evidence/WAVE-2/`, with local paths and the Supabase project ref scrubbed.
  - **Optional owner rows** (evidence only):
    - **O1:** paste a bad image address on a ZZ-TEST product, then a good one; delete the product afterwards.
    - **O2:** clear a job's title, then click Save.
    - **O3:** add a product in tab A, then press ▲ in tab B without reloading.
    - **O4:** paste a 300-character name.
  - **`/ship` additions:**
    1. **Before the push:** MUST-ADD 2–3's evidence exists.
    2. **After the deploy:** `/what-we-do` and `/products` still show the same 8 image URLs, and each answers 200.
    3. **If the first Save never lands:** if staff report refusals and the category ids never appear, treat it as a Wave 2 incident.
  - **Backlog:** the admin list reads `getJobs`, `getReports` and `getLeaders` turn a failed read into an empty list, which invites duplicate re-entry. That's filed as T-035.
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

- [x] **T-019** — Make Media Center add and delete report their failures, stop a failed upload from publishing a broken item, and add the session check
  Done 2026-10-07, in **Wave 3a** with T-007:
  - **Commits:** `b7a4e8f` (the contract, rulings and premortem folded in), `fb34d7d` (T-019), `a42ddcb` (T-007), `4abe008` (design fix: AA status, a visible busy delete, focus rings).
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP.
    - `security-reviewer`: CLEARED. The delete held, including a crafted row carrying a live category URL. SEC-MED-1 and SEC-MED-9 closed; SEC-MED-10 is at 12/12; SEC-INFO-46 and 47 are new. The two components are re-bound after the fix.
    - `design-reviewer`: FIX FIRST (F1–F5), then fixed in `4abe008`. The orchestrator confirmed the classes compile. This used a SYNTHETIC harness: the admin is NOT VISUALLY VERIFIED against the live login.
    - MUST-ADD 7, run by the orchestrator: the gallery list is identical on the local build and production, 14 images in the same order.
  - **Not run:** MUST-ADD 8's Chrome canvas exports and MUST-ADD 9's Chrome natural sizes (the weekly usage limit; DECISIONS 2026-10-07). The reader matched `sips` on all 80 real files (58 in `public/`, plus 22 live), with 0 disagreements.
  - **After the deploy (optional, owner):** row O1 is the only live check of the DELETE policies. Use a ZZ-TEST photo.
  **Wave 3 binding contract, covering T-019, T-007, T-009 and T-010** (`architect-reviewer`, 2026-10-06: APPROVE; folded verbatim, so no second `/architect-review` is needed). It's split under the ½-day line: **Wave 3a** is T-019 then T-007, and **Wave 3b** is T-009 then T-010. Each has its own review stage. There's no schema change, database object, storage-policy or bucket change, or new dependency, so there's no HARD STOP. Where older AC conflicts with this contract, the contract wins.
  - **Scope guard:**
    - Code only. Every file on the unchanged lists stays byte-identical.
    - No new exported function in any `"use server"` file. The only new export there is the type `MediaActionResult`.
    - Every message is a non-exported constant, apart from the shared `describeDimensionLimit`. `/design-review` may tune the wording; the names, the files they live in and when they show are binding.
  - **Preconditions:**
    - 3a builds on a `main` that already holds Wave 1 and Waves 2a/2b (`actionFailure`, `logActionError`, `isAllowedImageUrl`, Wave 1's placeholder).
    - 3b builds after 3a merges.
    - If either precondition fails, stop.

  **Wave 3a**

  1. **The result contract** (T-019, `media-actions.ts`).
     - `export type MediaActionResult = { ok: true } | { ok: false; error: string }`. `addMediaAction(formData)` and `deleteMediaAction(formData)` return it. Their argument stays `FormData`.
     - `getUser()` is each action's first await. With no user, it returns SESSION_EXPIRED (byte-identical to the other action files) and makes no table or storage call.
     - **A bad argument:** one that isn't a `FormData` returns NOTHING_RECEIVED ("Nothing was received. Reload the page, then try again.") from add, and MISSING_MEDIA_ID ("Missing media id.") from delete. A text field that isn't a string counts as missing.
     - **Supabase errors** go through Wave 2's `actionFailure`: the upload is `"upload"`, the insert `"save"` and the delete `"delete"`. Clean-up failures go through `logActionError`. No result carries database or storage text.
  2. **Add, in this order** (T-019):
     1. `getUser()`, then the argument check.
     2. **Type:** `type` must be exactly `gallery` or `news`, else MEDIA_TYPE_INVALID: "Choose Photo Gallery or Press / News, then publish again."
     3. **Title:** it's trimmed and must pass `hasVisibleText`, else MEDIA_TITLE_REQUIRED: "Give the item a title, then publish again."
        - It's at most 255 code points: a private `MAX_MEDIA_TITLE_LENGTH = 255`, commented as mirroring `media_assets.title VARCHAR(255)`.
        - A longer title gets MEDIA_TITLE_TOO_LONG: "A title can be at most 255 characters. Shorten it, then publish again."
     4. **Content** is stored as sent, or as `""`.
     5. **The image:**
        - A `File` with `size > 0` counts as a file, and the URL box is then ignored, as today.
        - With no file, a non-blank URL must pass `isAllowedImageUrl`, else MEDIA_URL_INVALID: "The image address must start with https:// or /. Choose a file instead, or paste its full https:// address, then publish again."
        - A `gallery` item with neither a file nor a URL gets GALLERY_IMAGE_REQUIRED: "A gallery photo needs an image. Choose a file or paste its address, then publish again."
        - A `news` item may still have no image.
     6. **The upload:**
        - The storage key is today's `<Date.now()>_<random>`, plus the file name's extension only if it matches `\.[A-Za-z0-9]{1,5}$` (lowercased). Nothing else from the file name reaches the key.
        - It goes to the root of bucket `media`, with no upsert.
        - **An upload error returns `actionFailure("upload", …)` and nothing is inserted.** There's no fallback to the URL box.
     7. **The insert:** on an error, remove the key this request uploaded (best effort, and log a failure), then return `actionFailure("save", …)`.
     8. Refresh `/admin/media` and `/life-at-fashion-asia`, then return ok. A refusal refreshes nothing.
     - **Unchanged:** there's still no file size, type or dimension check on this path (Known Trap #9, the VISION anti-goal, T-019's AC), and `accept="image/*"` stays.
  3. **Delete, in this order** (T-019). The browser's `url` field is never read.
     1. `getUser()`, then the argument check. `id` must be a non-empty string, else MISSING_MEDIA_ID.
     2. `delete().eq("id", id).select("url")`. An error returns `actionFailure("delete", …)`. No row returns MEDIA_NOT_FOUND: "Media item not found. Reload the page to see the current list."
     3. Refresh both paths. From here the result is `{ ok: true }`, whatever the clean-up does.
     4. **Clean-up, only when it's safe:**
        - **Ours only:** the stored URL must equal `getPublicUrl(name)` for one bucket-root name matching `^[A-Za-z0-9._-]+$`.
        - **Unused only:** nothing else may mention `name`: `media_assets.url`, `products.image`, `leaders.photo_url` (each an `ilike %name%` count), or any `site_settings` value searched as JSON text.
        - **Any doubt keeps the file:** a failed or uncertain check keeps it.
        - **Then the removal:** `remove([name])`; an error, or an empty result, is logged.
     - "Any failure is reported" therefore means every failure that leaves the item listed is shown. A clean-up failure after the item is gone is logged only.
  4. **The Media page's client side** (T-019): a client wrapper, not `useActionState`.
     - **Files:** new `media/MediaPublishForm.tsx` and `media/MediaDeleteButton.tsx`, both `"use client"`, each importing only its own action. `page.tsx` stays a server component, with its read and its `revalidate` unchanged.
     - **Publishing:**
       - `onSubmit` prevents the default and captures the `FormData` synchronously, then calls the action inside `startTransition` with try/catch, the `ImportBuiltInGallery` pattern.
       - The fields sit in `<fieldset disabled={isPending}>`.
       - On `ok: false`, every field, the chosen file included, stays as it was, and the error shows in a `role="alert"`.
       - On a throw (a dropped connection, or Next's 1 MB body limit), PUBLISH_THREW shows: "The item couldn't be published. Check your connection, then try again. A very large photo can also fail, so compress it at TinyPNG first."
       - On success the form resets, and an always-mounted `role="status"` says "Published."
     - **Why not `useActionState` with `<form action>`:** React 19 resets the form's uncontrolled fields when the action finishes, whatever it returns. A failed upload would then lose the title and the chosen file.
     - **The submit button:** `SubmitButton` gets an opt-in `pending?: boolean` that overrides `useFormStatus()`. Without it, its markup is byte-identical, so the three public forms don't change.
     - **Deleting:**
       - **The button:** one per card, with `aria-label` "Delete <title>". It's visible on focus as well as on hover.
       - **A confirm first,** worded like the product delete: `Delete "<title>"? This can't be undone.`
       - **While it runs,** the button is disabled.
       - **On a failure:** `ok: false`, or a throw (DELETE_THREW: "The item couldn't be deleted. Check your connection, then try again."), shows in a `role="alert"` on that card.
       - **On success,** focus moves to the "Published Assets" heading (`tabIndex={-1}`). That's a default; `/design-review` may pick another target, as long as focus doesn't land on `<body>`.
     - **Labels** get `htmlFor`/`id`. The layout and classes are otherwise unchanged.
  5. **The dimension reader** (T-007, `upload-limits.ts`, which still has no imports). No dependency is needed.
     - **The function:** `export function readImageDimensions(bytes: Uint8Array, format: "jpeg" | "webp"): { width: number; height: number } | null`. It's pure, bounds-checks before every read, never throws and never decodes.
     - **JPEG:** walk the segments from offset 2 the way libjpeg finds markers:
       - **Finding a marker:** skip to the next `0xFF`, skip any fill `0xFF`s, and skip `FF 00` like any stray byte.
       - **No length:** RST0–7 and TEM have none.
       - **Too early:** SOS, EOI or a second SOI before a frame header returns null.
       - **Lengths:** must be at least 2 and stay inside the buffer, else null.
       - **The frame header:** the first SOFn (`C0`–`CF`, except `C4`, `C8` and `CC`) gives height, then width. A length under 8, or a zero side, returns null.
       - **Every other segment is skipped whole by its length,** APP1/EXIF included.
       - **Never byte-scan for `FF C0`:** an EXIF thumbnail's frame header comes first.
     - **WebP:** read the chunk at offset 12. A file under 30 bytes returns null.
       - **`VP8 `:** start code `9D 01 2A` at offset 23; width and height are the 14-bit values at 26 and 28.
       - **`VP8L`:** byte `0x2F` at 20; width−1 and height−1 are bits 0–13 and 14–27 of the 32-bit value at 21.
       - **`VP8X`:** canvas width−1 and height−1 are the 24-bit values at 24 and 27.
       - **Anything else** returns null.
     - **The shared message:** `export function describeDimensionLimit(width, height)` returns `ImageUploadField.tsx:153`'s exact text: `That image is ${width}×${height}. Resize it to ${MAX_UPLOAD_DIMENSION}px on the longest edge or smaller.`
     - **Limits:** no new policy value. `MAX_UPLOAD_BYTES` (400 KB) runs first and bounds the walk. `MAX_UPLOAD_DIMENSION` (2400 px, longest edge) is the limit: 2400 passes, and 2401 fails, using the same `>` as the browser. There's no minimum and no pixel-area limit. The format constants stay private, commented as format facts.
  6. **`uploadOptimizedImage`** (T-007). After the format sniff and before the storage write:
     - **Unreadable:** returns IMAGE_DIMENSIONS_UNREADABLE: "That image's width and height couldn't be read. Export it again as a WebP or JPG, then upload it."
     - **Too big:** a longest edge over the limit returns `describeDimensionLimit(w, h)`.
     - **Fail closed:** both refuse with no storage call.
     - **Nothing else changes** apart from the doc comment.

  **Wave 3b**

  7. **The advisory guard** (T-009 WARN-1). `checkImageSizeAdvisory` returns `{ tooSmall: true, offProportion: true }` when either side isn't a finite number above 0. Otherwise it's unchanged.
  8. **The latest pick wins** (T-009 WARN-2 and WARN-3, `ImageUploadField`).
     - **The pick counter:** a private counter numbers every pick (file input or drop), and each pick resets `error`, `warning` and `busy`. After each await, a pick that's been overtaken stops, with no `onChange` and no state change. `busy` clears only for the latest pick. Both files still upload; only the latest one is applied and shown.
     - **The callback:** the field still calls the `onChange` it captured at that pick, never a newer one.
     - **Hand edits:** a hand edit in the path box, in both modes, clears `error` and `warning`. It doesn't cancel an upload: a finished upload still replaces the path (T-016's rule).
     - **The shared message:** the dimension hard block uses `describeDimensionLimit`, with byte-identical output. The `readDimensions` comment now notes the server re-checks.
     - **Unchanged:** T-002's hard blocks, Wave 1's placeholder, and all of the `commitPathOnBlur` logic and styling.
  9. **Stable row keys** (T-010, `ObjectListEditor` only).
     - **How rows are keyed:** each row's key comes from a per-instance `WeakMap` from item object to key. It's assigned lazily on first sight, which is idempotent under StrictMode.
       - The editor carries the key over when it replaces an item.
       - A new row gets a new key.
       - A non-object entry gets a positional key.
     - **No item field is read or written for keying:** no `id`, slug, title or `_key`. Consumers save byte-identical lists, and category identity (server id plus frozen slug) is untouched.
     - **After a save:** rows that `ProductsClient` hands in as new objects after a successful save remount, which clears their upload notices. That's an accepted, admin-only visible change.
     - This closes WARN-4 and supersedes T-010's original "clear on an outside value change" fix.
  10. **Every change lands on its own row in the latest list** (T-010).
      - **The refs:** the latest list and `onChange` live in refs. They're set after each commit and moved forward on every emitted change. The only writes during render are the lazy key assignments.
      - **By key:** edit, move and remove name their row by key and build from the latest list. An image field's callback is `v => updateRow(key, field, v)`.
      - **Uploads:**
        - An upload lands on the row it started on, keeping every edit made in the meantime.
        - If that row has been removed, the result is dropped (the file stays in storage). It never lands on another row.
        - Two uploads that finish back to back both land, without relying on Next's one-at-a-time dispatch (DECISIONS 2026-10-04).
  11. **Focus** (T-010), following `CategoryProductsManager`'s precedent.
      - **After a move:** the pressed button keeps focus. If it's now disabled, the row's other move button takes it.
      - **After a remove:** focus goes to the next row's Remove button, else the previous row's, else the Add button.
      - **Never `<body>`:** focus never lands there. Accessible names and contrast stay with T-011.
  12. **Save waits for uploads** (T-010).
      - **Opt-in props:**
        - **`ImageUploadField`** gets `onBusyChange?(busy)`. It reports true once a pick passes its synchronous checks, and false after the latest pick's outcome has been applied, or when the field unmounts.
        - **`ObjectListEditor`** gets `onUploadingChange?(uploading)`, combining its rows by key, and reports false on its own unmount.
        - **With either prop off,** every attribute and branch is unchanged.
      - **The two pages:** `ProductsClient` (categories) and `HomepageSettingsClient` (Facilities) hold an `uploading` state, declared with the other hooks, above `ProductsClient`'s fail-closed return.
        - `save()` checks it first. While it's true, the save shows UPLOAD_IN_PROGRESS in `SettingsHeader`'s error slot and sends nothing.
        - The message: "An image is still uploading. Wait for it to finish, then click Save categories." On Homepage it ends "…then click Save Changes."
      - **A drop on a disabled field** (`inputRef.current.matches(":disabled")`, as inside the saving fieldset) is ignored: no upload and no highlight. The drop's default is still prevented, so the browser doesn't open the file.
      - **Unchanged:** T-026's draft and confirmed logic, `confirmed` being what `CategoryProductsManager` gets, `blankTitleRows`, the fieldset and `SettingsHeader`.
  13. **Must not change:**
      - **Messages:** every existing message, byte for byte, measured on Wave 1's and Wave 2's merged strings.
      - **Media functions:** `getMediaAssets`; `importBuiltInGallery`; `uploadOptimizedImage` beyond item 6; `sniffImageFormat`.
      - **Pages and editors:** every public page, `/life-at-fashion-asia` included; what any editor saves.
      - **The product editor:** `CategoryProductsManager.tsx` (0-byte diff); T-016's save queue.
      - **Auth:** `getUser()` stays every write's first await.
  14. **Commits and checks.** Commits go T-019, then T-007 (3a), then T-009, then T-010 (3b). Each must typecheck and build on its own. No agent publishes, deletes, uploads or saves.
      - **3a, against a fake database and storage:**
        - every branch, in order;
        - signed out: no calls at all;
        - a failed upload makes 0 inserts, and a failed insert removes its own key;
        - a planted browser `url` is never removed;
        - clean-up is skipped for a foreign URL, for each of the 4 references, and when a check fails;
        - no fake error text reaches any result.
      - **T-007's reader:**
        - checked against `sips` on the 40 JPGs and 18 WebPs in `public/`;
        - crafted cases: an EXIF thumbnail before the frame, SOF2, fill bytes, SOS before SOF, zero sides, 2400 and 2401 on each axis, and a 2²⁴ VP8X canvas;
        - every truncation of each sample's first 4 KB returns null or the true size, and never throws;
        - a refusal makes no storage call, and its text is byte-identical to the browser's.
      - **The media page:** a synthetic render with stubbed actions.
      - **3b:** a synthetic UI harness in StrictMode and production, on both pages:
        - WARN-4's repro;
        - an upload followed by typing, a move or a remove;
        - two uploads finishing back to back;
        - picks A and B resolving in both orders, and B failing a hard check;
        - Save while an upload runs, with no `saveCategories` call;
        - a drop during a save;
        - focus after moves and removes;
        - 0 duplicate-key warnings;
        - payloads byte-identical to `main`'s;
        - T-016's harness re-run, where a product-row upload that finishes after a category switch behaves exactly as on `main`.
  - **Touches:**
    - **3a:**
      - `src/app/actions/media-actions.ts`, `src/lib/upload-limits.ts` and `src/app/admin/(dashboard)/media/page.tsx`;
      - the 2 new media components;
      - `src/components/ui/SubmitButton.tsx` (the opt-in prop only).
    - **3b:**
      - `upload-limits.ts` (item 7 only), `src/components/admin/ImageUploadField.tsx` and `src/components/admin/SettingsForm.tsx` (`ObjectListEditor` only);
      - `products/ProductsClient.tsx` and `homepage/HomepageSettingsClient.tsx` (item 12 only).
  - **Unchanged:**
    - **3a:**
      - every file 3b touches;
      - every other action file, `action-errors.ts`, `site-content.ts` and `settings-read.ts`;
      - `ImportBuiltInGallery.tsx` and the public pages;
      - `nav.ts`, `sitemap.ts`, `next.config.ts`, `middleware.ts` and `src/lib/supabase/*`;
      - `db/`, `supabase-schema.sql`, `package.json` and the lockfile.
    - **3b:**
      - all of 3a's files except `upload-limits.ts`;
      - `CategoryProductsManager.tsx`, `category-draft.ts`, `WhoWeAreClient`, `BusinessClient` and `SeedDefaultsPanel`;
      - every server file.
  - **Sign-offs:** no sha256 sign-off is voided.
    - **Invariant sign-offs reopened:**
      - T-016's 5 client invariants on `ImageUploadField` and `ProductsClient`. Invariant 4 is restated: "`commitPathOnBlur` opt-in; one `uploadOptimizedImage` call per accepted pick, with one `file` field; only the latest pick is applied, through the `onChange` captured at that pick."
      - T-026's 7 client invariants on `SettingsForm` and `ProductsClient`.
      - T-012's `.ok` rule on `HomepageSettingsClient`.
    - **New hash bindings:** `media-actions.ts` and `upload-limits.ts` at 3a. `upload-limits.ts` is re-bound at 3b.
  - **Docs at close:**
    - ROADMAP, DECISIONS and INVENTORY, with `@purpose` lines for `readImageDimensions`, `describeDimensionLimit`, `MediaActionResult` and the 2 components;
    - STACK §4: drop "except media", and add the new upload-contract functions;
    - ARCHITECTURE §4 and §5, and DATA_MODEL §3's `media_assets` row;
    - SECURITY: SEC-MED-1, SEC-MED-9, and the last 2 functions of SEC-MED-10;
    - QA_REPORT: T-002 WARN-1 to WARN-4.
  - **Sequence:**
    - **3a (about 4 hours):** `/build` ✅ → `/design-review` ✅ FIX FIRST → fixed (`4abe008`) → `/security-review` ✅ CLEARED → `/qa` (folded into `code-reviewer`'s light QA plus the orchestrator's MUST-ADD 7 check, under the lean protocol) → `code-reviewer` ✅ SHIP → merge ✅ (2026-10-07).
    - **3b (about 4 hours):** the same stages.
    - **Pre-agreed cuts, with no new architect review:** if 3a runs past ½ day, items 5–6 become Wave 3c. Wave 3c runs after 3b and also switches T-009's dimension-message line. If 3b runs past ½ day, item 12 becomes Wave 3d, and T-010 stays open until then.
  - **Re-review triggers:**
    - **Schema and dependencies:** any SQL, migration, table, column, constraint, index, RPC, database function, trigger, storage policy, bucket or key prefix; any new dependency, including `sharp` or `image-size` as a direct dependency, `server-only` or a test runner.
    - **T-019:**
      - an insert after a failed upload;
      - removing a file before the row delete, by a browser-sent URL, or without item 3's checks;
      - any file size or type check on the Media Center;
      - `<form action>` or `useActionState` auto-reset;
      - a signature change beyond the return type, or raw error text in a result;
      - touching `importBuiltInGallery` or `getMediaAssets`.
    - **T-007:**
      - decoding or re-encoding, byte-scanning, or failing open;
      - any new or changed policy value;
      - the dimension check anywhere other than `uploadOptimizedImage`;
      - a message that differs from the browser's.
    - **T-009/T-010:**
      - keys taken from, or stored in, item fields;
      - the field calling its latest `onChange`, or dropping a result on unmount;
      - any change to what a consumer saves;
      - a non-zero diff on `CategoryProductsManager.tsx`;
      - changes to `ProductsClient`'s draft/confirmed logic or to `commitPathOnBlur`;
      - pulling in T-011, T-020 or T-034.
    - **Files and scope:** an edit to any unchanged-list file; either sub-wave passing its cut.
  - **Optional owner rows** (the checklists are waived):
    - **O1:** publish a gallery photo, then delete it.
    - **O2:** paste `www.example.com/x.jpg` with no file. Expected: the message, and nothing published.
    - **O3:** pick a category image and click Save categories straight away. Expected: the "still uploading" message.
    - **O4:** move a facility row while its photo uploads. Expected: the photo lands on that row.
  - **`/ship` additions:** an anonymous `/admin/media` answers 307 on both domains, and `/life-at-fashion-asia` answers 200 with the same number of gallery images as before.
  - **For later waves and the backlog:**
    - Wave 4's T-011 and T-020 re-baseline on `SubmitButton`, `ImageUploadField` and `SettingsForm` as Wave 3 leaves them.
    - **Backlog:** `importBuiltInGallery` still throws raw database text; `CategoryProductsManager`'s Add form can add during an upload (it can use `onBusyChange` later); the Media Center keeps storing the browser-reported content type (Known Trap #9).
  **Amendments from `architect-reviewer`'s rulings on the premortem's C1–C10 (2026-10-06: APPROVE, no re-review trigger). Folded verbatim; each amendment wins over the item it amends:**
  **Architecture Review: Wave 3 premortem rulings (C1 to C10)**

  **Verdict: APPROVE, with the amendments below. No re-review trigger is tripped.** The rulings make item 3 stricter, add one read on a failure path, spell out item 12 more exactly, and add tests. None of them involves SQL, a database object, a storage policy, a dependency, an edit to an unchanged-list file, or growth past the cuts. 3a gains about 30 minutes and stays inside its cut; 3b doesn't change.

  Before ruling, I checked the source:
  - **C1:** `site_settings.value` is `jsonb`, while `media_assets.url`, `products.image`, `leaders.photo_url` and `reports.file_url` are all `TEXT` (`supabase-schema.sql`, migration 0001).
  - **C9:** `reports.file_url` is only set through `uploadFile(fd, "reports")`. It has no text box, so a `media` file can only end up there through a crafted call.

  **Amendments, to fold verbatim into the Wave 3 contract**

  **Item 3, step 2 (replaces it):**
     2. `delete().eq("id", id).select("url")`. An error returns `actionFailure("delete", …)`. **If no row comes back, re-read it** (C3) with `select("id").eq("id", id).maybeSingle()`, because RLS turns a refused delete into "0 rows" with no error:
        - **A read error:** returns `actionFailure("delete", …)`.
        - **The row is still there:** returns MEDIA_DELETE_REFUSED: "This item couldn't be deleted, because the database refused the change. Ask your developer to check the gallery's delete permission." It's logged with `logActionError`, with the row id only. The fix is an owner SQL step, so the run doesn't attempt it.
        - **The row is gone:** returns MEDIA_NOT_FOUND, unchanged.
        - None of the three makes a storage call or a refresh.

  **Item 3, step 4 (replaces it):**
     4. **Clean-up, only when it's safe** (C1, C7, C9). It runs inside its own try/catch, so nothing in it can throw out of the action.
        - **Ours only:**
          - `name` is the stored URL's last `/`-segment, and it must match `^[A-Za-z0-9][A-Za-z0-9._-]*$`, so `.` and `..` fail.
          - `getPublicUrl(name).data.publicUrl` must equal the stored URL exactly. A foreign host, a query string, a `/render/image/` URL, a subfolder or a repo path therefore keeps the file.
        - **Unused only:** 4 counts and 1 read, run together.
          - **The counts:** `media_assets.url`, `products.image`, `leaders.photo_url` and `reports.file_url`, all `TEXT`. Each is `.select("id", { count: "exact", head: true }).ilike(column, "%" + name + "%")`. An error, a `null` count or a count above 0 keeps the file. A `_` in `name` is a LIKE wildcard, so it can only over-match, which keeps more files.
          - **`site_settings`:** `.select("value")` reads every row, and the search is `JSON.stringify(value).includes(name)`, in code. An error, `null` data, 0 rows or any match keeps the file.
          - **Never** an `ilike` on `value`: Postgres has no jsonb ILIKE, so it errors and no file is ever removed. **Never** a single-key `value->>…` filter: it misses `homepage.lifeFacilities` and every other key, so a file in use is removed. The 8 live category images are bucket-root keys of the same shape as gallery uploads, so this read is what protects them.
        - **Not searched, on purpose:**
          - free-text fields (news `content`, the job fields), which hold no image or file address;
          - `submissions`, which is personal data and never published.
        - **Then:** `remove([name])`, once. An error, or an empty result, is logged.

  **Item 4, add:**
     - **Capture before awaiting:** `onSubmit` captures the form element and its `FormData` synchronously, before any await. The try/catch wraps only the action call, so the success branch can't show PUBLISH_THREW.
     - **Focus after a settle** (C6): a disabled fieldset or button drops focus. When a publish settles, either way, focus goes back to the Publish button once it's enabled again. When a delete fails, it goes back to that card's delete button. Never `<body>`. `/design-review` may choose other targets.

  **Item 6, add (C8):**
     - **EXIF orientation isn't applied:** the server reads the stored width × height, and the browser reports those swapped for a rotated photo.
       - The longest edge is the same either way, so the accept-or-refuse decision is too. That's accepted.
       - Only a refusal's `W×H` order can differ. A server refusal is only reachable when the browser check was skipped.

  **Item 11, add (C5):**
     - **Restore focus explicitly:** after the list commits, apply a pending-focus record in a layout effect (`CategoryProductsManager`'s pattern). Never trust the row's DOM node to stay put: React moves the node of a row that moves down, and Chrome drops focus from a moved node, while Move up keeps it.

  **Item 12, "Opt-in props" (replaces it; C2):**
      - **Opt-in props:**
        - **`ImageUploadField`** gets `onBusyChange?(busy)`. It reports changes only, never during render, and only for the latest pick:
          - true when the latest pick passes its synchronous checks;
          - false when the latest pick settles in any way: applied (after its `onChange`), refused at any stage (a synchronous check, the dimension read, the server's `ok: false`), or thrown;
          - false on unmount, if it last reported true.
          - **An overtaken pick never reports.** So "A in flight, then B refused" ends false at B's refusal.
        - **`ObjectListEditor`** gets `onUploadingChange?(uploading)`. `uploading` is true only while a key in the current list last reported busy.
          - A key that leaves the list, such as a removed row or rows replaced after a save, stops counting at once, whatever its field reports.
          - It reports changes only, and false on its own unmount.
        - **With either prop off,** every attribute and branch is unchanged.
      - **Accepted:** a hung upload keeps Save refused only while its field shows "Uploading…". A new pick, or removing the row, ends it.

  **Item 14, add:**
     - **3a:** the reference checks run through the real supabase-js client with an injected `fetch` (premortem MUST-ADD 1); a fake returning canned counts doesn't count. The harness covers the C3 re-read's three answers with 0 storage calls, and focus after a publish and after a failed delete, in real Chrome.
     - **3b:** the harness drives all 8 `ObjectListEditor` instances, including Who We Are's 3 and Homepage's 3 without images (C4).
       - `WhoWeAreClient` stays on the unchanged list (0-byte), but its runtime changes.
       - Typing, move, remove and focus are checked in real Chrome on a production bundle, not jsdom (C5).
       - Each page's saved payload is byte-identical to `main`'s.

  **Docs at close, add (C10):** STACK §4 and INVENTORY list `media-actions.ts` as the fourth importer of `action-errors.ts`. That file stays byte-identical, and its Wave 2 binding stands.

  **Re-review triggers, add:**
  - **The reference checks:**
    - a `site_settings` search other than reading every row and searching `JSON.stringify(value)` in code;
    - a reference set narrower than the 4 columns plus `site_settings`;
    - a storage name rule that admits a leading `.`, `-` or `_`.
  - **The delete:** a zero-row delete answered without the re-read.
  - **The Save guard:** `uploading` counting keys outside the current list, or an overtaken pick reporting busy.

  **For later waves, add:** `SettingsHeader`'s Save button drops focus to `<body>` while it's disabled for a save, on every settings page. That's pre-existing, so it goes to T-011's notes.

  **On each concern:**
  - **C1, C2 and C9** are ruled in the amendments.
  - **C3:** I chose the re-read over neutral wording. Neutral wording would hide a missing DELETE policy, and that policy has never been tested live; owner row O1 is still the only live check.
  - **C4, C5 and C6:** confirmed, and amended into items 14, 11 and 4.
  - **C7:** adopted in item 3.
  - **C8:** accepted, and recorded in item 6.
  - **C10:** confirmed, and recorded under "Docs at close".

  **DECISIONS.md row:**

  | 2026-10-06 | **Wave 3 premortem rulings (C1–C10).** C1: the delete's `site_settings` check reads every row and searches `JSON.stringify(value)` in code; 0 rows or an error keeps the file. The other checks are `ilike` counts with `head: true`; an error or a `null` count keeps the file. C9: `reports.file_url` joins the reference set, which is every column that holds a file address; free text and `submissions` are excluded. C3: a delete that removes no row re-reads it, and says MEDIA_DELETE_REFUSED if RLS kept it. C7: storage names start with a letter or digit. C2: only the latest pick reports busy, and any refusal reports false; `uploading` counts only keys in the current list. C5 and C6: focus is restored explicitly after Move down, after a publish and after a failed delete, and tested in real Chrome. C4: all 8 list editors are in 3b's harness. C8: the server doesn't apply EXIF orientation, which is accepted. C10: `media-actions.ts` is the fourth importer of `action-errors.ts`. | `architect-reviewer` | two-way (code only) | No re-review trigger is tripped: the rulings tighten item 3, add one read on a failure path, clarify item 12 and add tests. Rejected: `ilike` on jsonb (it errors, so nothing is ever removed); a `value->>key` filter (a file in use is removed); neutral "wasn't deleted" wording (it hides a missing DELETE policy). |

  Approved. Next: fold the contract, these amendments and the premortem's MUST-ADDs into ROADMAP at the top of T-019, then run `/build` for Wave 3a once Waves 2a and 2b have merged.

  **Files:**
  - /Users/adilahmed/.claude/projects/-Volumes-D-Architect-Codebase-Fashion-asia-limited/memory/fashion-asia-wave3-contract-draft.md
  - /Volumes/D_Architect/Codebase/Fashion_asia_limited/docs/ROADMAP.md
  - /Volumes/D_Architect/Codebase/Fashion_asia_limited/docs/DECISIONS.md
  - /Volumes/D_Architect/Codebase/Fashion_asia_limited/supabase-schema.sql
  - /Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/actions/media-actions.ts
  - /Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/admin/(dashboard)/reports/ReportsClient.tsx
  **Wave 3 premortem (`premortem-planner`, 2026-10-06: GO WITH ADDITIONS). Its MUST-ADDs are binding, as amended by the rulings above. Folded verbatim:**
  **Premortem — Wave 3 (T-019, T-007, T-009, T-010) — 2026-10-06**

  **Verdict: GO WITH ADDITIONS.** No owner decision is needed. `architect-reviewer` must settle two points first: C1 before 3a builds, and C2 before 3b builds.

  Two facts from the code change the picture:
  - **The 8 live category images are bucket-root keys like `media/1788158482273_0vq7mdv.jpg`** (Wave 1 baseline evidence, `docs/qa-evidence/T-012/public-regression/`), not short `<n>.jpg` names. That's the same key shape as the gallery's uploads, so the `site_settings` search is the only check that protects a category or facility file from a gallery delete.
  - **`ObjectListEditor` has 8 instances in 3 files**, not 6: Products ×1, Homepage ×4, Who We Are ×3. The categories also carry `id` and `slug` on top of the editor's three fields.

  **TOP FAILURE MODES (most likely first):**

  1. **Save is refused forever: "An image is still uploading", with nothing uploading.** — likelihood M × impact H
     - **How it happens:** staff pick photo A on a slow connection, then pick B before A finishes. B is refused by a synchronous check (wrong type, over 400 KB) or the dimension check. A is now stale, so it never reports. B never reports "not busy" either, if that's only reported on the async success path. A second way in: a row removed mid-upload whose key stays in the editor's busy set.
     - **The cost:** staff can't run the one-time first Save (R6), and a reload throws away the draft.
     - **SHOWS UP AS:** staff report they can't save `/admin/products` or `/admin/homepage`.
     - **CATCH BEFORE MERGE:** production-bundle harness (MUST-ADD 11) and contract point C2.

  2. **The rewritten shared editors break a page the harness didn't drive.** — M × H
     - A row remounts on every keystroke and loses focus.
     - Move down drops focus to `<body>`. React 19.2 physically moves the DOM node of the row moving down, and the browser blurs a moved focused node; Move up keeps focus.
     - An upload lands on the wrong row, or reverts typing.
     - Rows rebuilt from `fields` drop a category's `id`/`slug`. That's the category-identity pattern: changed web addresses, or confusing refusals.
     - An "is it still mounted" guard silently drops T-016's product-row upload after a category switch.
     - **SHOWS UP AS:** typing stops after one letter; "Unsaved category changes" after a save; a product photo that never saves.
     - **CATCH:** real-Chrome production harness, identity diff, and T-016 re-run (MUST-ADDs 12–15).

  3. **The Media Center's new publish form or delete button reports the wrong result.** — M × M
     - Using `e.currentTarget` after the await (React has nulled it by then) turns a successful publish into PUBLISH_THREW, so staff publish again and the live gallery gets duplicates.
     - A failure wipes the chosen file.
     - A throw outside the transition's try/catch blanks the page.
     - Every delete says "Media item not found" if the live `media_assets` table has no DELETE policy for signed-in users. Nobody has ever tested this, because today's delete ignores its result (R2; the policy isn't in `supabase-schema.sql`).
     - **SHOWS UP AS:** duplicate photos on `/life-at-fashion-asia`, or "not found" while the item stays listed.
     - **CATCH:** synthetic render (MUST-ADDs 4–6) and contract point C3.

  4. **T-007's fail-closed reader refuses ordinary photos.** — L × H
     - It runs on every `ImageUploadField` upload: categories, facilities and products. A product needs an image (T-016's rule), so a refusal also stops new products.
     - The corpus lacks real phone JPEGs: EXIF thumbnail plus MPF/ICC, ICC pushing the frame header past 64 KB, stray bytes between segments.
     - `public/`'s 18 WebPs are cwebp lossy output, so VP8L and VP8X are probably only crafted.
     - **SHOWS UP AS:** "That image's width and height couldn't be read" sitewide, after the deploy.
     - **CATCH:** the client's own 17 live images plus a server-equals-browser agreement check (MUST-ADDs 8–10).

  5. **The delete clean-up gets the reference check wrong.** — L × H (deletes a file in use, irreversibly) / M × L (never deletes)
     - **Never deletes (likely):** an `ilike` on the jsonb `value` column errors, because Postgres has no jsonb-ILIKE operator. Every file is then kept, and the orphans are silent.
     - **Deletes a file in use (unlikely, irreversible):**
       - a `value->>key` filter searches only one key and misses `homepage.lifeFacilities`;
       - a hand-written fake returning canned counts passes a wrong query;
       - a URL split on its last segment matches one of our keys on a foreign host.
     - **SHOWS UP AS:** a broken category card or facility photo after a gallery delete. Supabase Storage has no undo.
     - **CATCH:** real supabase-js behind a stubbed network layer, plus positive controls (MUST-ADDs 1–3), and contract point C1.

  **HARD STOPS THIS TICKET TOUCHES:**
  - **Deploy:** the end-of-run `/ship`, on the owner's "deploy" only.
  - **Data deletion:** a new code path removes a Storage file when staff delete. It's irreversible, and no agent may exercise it.
  - **No schema apply.**

  **MUST-ADD ACCEPTANCE CRITERIA**

  **3a — T-019 (Media Center)**

  1. **The reference checks run real query code, with a positive control.**
     - The `site_settings` check reads every row's `value` and searches `JSON.stringify(value)` in code. It never uses `ilike` on the jsonb column, and never a single-key `value->>…` filter.
     - The other three checks are `.ilike(col, "%name%")` counts with `head: true`. An error, or a `null` count, keeps the file.
     - The harness drives the real supabase-js client through an injected `fetch`, with no network, and asserts each request: table, column, filter, HEAD, `count=exact`.
     - Fed rows shaped like the live data, the file is kept when it's referenced by:
       - the `business` categories (the 8 baseline URLs);
       - `homepage.lifeFacilities[].image`;
       - a leader `photo_url`;
       - a product `image`;
       - a second `media_assets` row.
     - With no reference, it's removed exactly once, as `remove([name])`.
  2. **The "ours only" check holds on real and hostile URLs.**
     - It returns true for the 9 live gallery URLs and the 8 category URLs, checked offline. The URLs are scraped read-only from the public pages, and the check uses a supabase-js client built from the scraped origin and a dummy key.
     - It returns false for:
       - a foreign host whose last path segment equals a real key;
       - a `?width=800` query string;
       - a `/render/image/` URL;
       - a subfolder;
       - `.` and `..`;
       - `/images/client/…` paths.
     - Any URL shared between the gallery and the category or facility images is recorded and used in MUST-ADD 1's positive control.
  3. **The delete runs in order, and failures stay safe.**
     - The order is `getUser` → `delete().eq("id").select("url")` → both refreshes → checks → `remove`.
     - A failed row delete makes 0 Storage calls.
     - A 0-row delete makes 0 Storage calls, including one where the row still exists because RLS refused it.
     - Deleting a built-in (repo-path) row makes 0 Storage calls.
     - A `remove` that returns `[]` is logged, and the result is still `{ ok: true }`.
  4. **The publish form passes a synthetic render, in StrictMode and in a production bundle.**
     - The FormData carries exactly `title`, `type`, `file`, `url` and `content`.
     - **Success:**
       - The form element is captured synchronously, never read from `e.currentTarget` after an await.
       - The form resets, "Published." shows, no alert appears, and the action is called exactly once.
       - The catch wraps only the action call, so the success branch can't show PUBLISH_THREW.
     - **`ok: false`:** every field stays, including `fileInput.files.length === 1`, and the alert shows the result's text.
     - **A rejected promise** (the 1 MB body limit, or the network): PUBLISH_THREW shows, every field stays, and the page never hits the error boundary.
     - **Double submit:** a double click, or Enter twice, makes 1 call.
     - "Published." clears when the next submit starts.
     - After success or failure, focus isn't on `<body>`.
  5. **The delete button behaves.**
     - A cancelled confirm makes no call.
     - The button is disabled while the delete runs.
     - On `ok: false` or a throw, the message shows on that card only and the button re-enables.
     - On success, simulated with the card removed from the list, focus moves to the heading. No mounted-check may skip the focus call.
     - With two cards, each card's button sends its own id.
  6. **`SubmitButton` is unchanged for the public forms.**
     - `useFormStatus()` is called unconditionally.
     - Without `pending`, its static markup inside a `<form>` is byte-identical to `main`'s.
     - The three public form pages' production-build button markup matches the pre-3a baseline.
  7. **The gallery is untouched.**
     - `getMediaAssets`, `importBuiltInGallery` and `ImportBuiltInGallery.tsx` have 0-byte diffs, checked by sha256.
     - The production build's `/life-at-fashion-asia` gallery `<img src>` list, in order, equals production's list fetched in the same minute. Both read the same database, so a difference can only come from code.

  **3a — T-007 (dimension reader)**

  8. **The corpus goes beyond `public/`.**
     - **The client's live images:** the 8 category images, the facility photos and the 9 gallery photos, downloaded read-only to the scratchpad and never committed.
     - **Headless-Chrome canvas exports:** JPEG, lossy WebP, and WebP with alpha (VP8X).
     - **Crafted headers:**
       - WebP: VP8L, and animated VP8X;
       - JPEG frame types: SOF1 at 12-bit, SOF3, SOF9;
       - CMYK with an Adobe APP14 segment;
       - ICC or XMP data pushing the frame header past 64 KB;
       - stray non-FF bytes between segments;
       - DNL, where the height is 0, which must return null.
     - Results go in a table: the reader's answer, `sips`, and Chrome's natural size.
  9. **Server and browser agree.** For every real file, the server's accept/refuse under the 2400 px rule equals the browser's, with 0 disagreements. Compare the longest edge, because EXIF rotation swaps width and height.
  10. **Misalignment traps.**
      - The EXIF thumbnail has different dimensions from the main frame, and the reader returns the main ones.
      - A decoy `FF C0` sits where an off-by-2 length error would land.
      - The reader indexes the `Uint8Array` directly, never a `DataView` over `.buffer` without the byte offset.
      - Truncation tests use `slice` copies, not `subarray`.
      - It walks the whole array, not a fixed-size head.

  **3b — T-009/T-010 (shared upload field and list editor)**

  11. **The Save guard always comes back to false.** On both pages, in StrictMode and in a production bundle: once every stubbed promise settles, `uploading === false`, and one Save click calls the save action exactly once. The scenarios:
      - a single pick ending: ok, `ok: false`, a throw, null dimensions, 2401 px, the wrong type, or over 400 KB;
      - A in flight, then B refused at each stage (synchronous check, dimension check, server);
      - A and B resolving in both orders;
      - a row removed or moved mid-upload.

      `uploading` counts only rows in the current list. No React warning of any kind appears.
  12. **Category identity is kept.**
      - Every surviving row keeps `id`, `slug` and any unknown key. Rows are spread, never rebuilt from `fields`; `blank()` is the only exception.
      - For sequences with no race, the payload sent to `saveCategories`/`updateSettings` equals `main`'s byte for byte.
      - With an upload in flight, every edit is kept and the image lands on its own row.
  13. **Focus and typing hold in real Chrome, not jsdom, on a production bundle.**
      - Typing 20 characters into every text box, textarea and path box of all 8 instances keeps focus, the caret and the row's DOM node.
      - Move up and Move down both keep focus in the moved row.
      - After a remove, focus follows contract item 11.
      - Focus never lands on `<body>`.
  14. **The pick counter works on all 4 consumers:** category row, facility row, product row and the product add form.
      - A single pick applies the image and clears busy.
      - An overtaken pick makes 0 `onChange` calls, 0 `onBusyChange` calls and 0 state updates, while both files still reach the upload stub.
      - The `onChange` captured at the pick fires after a re-render with a new prop, and after unmount.
  15. **T-016's harness re-runs after each 3b commit** (T-009, then T-010), on a production bundle.
      - A product-row upload that finishes after a category switch commits exactly one `{ image }`, to its own product.
      - A second pick on the same row commits only the second image.
      - The add form's image still fills.
      - `CategoryProductsManager.tsx` has a 0-byte diff.

  **Evidence**

  16. **Baseline and evidence rules.**
      - Before 3a, capture a production baseline: the gallery list, the facility image URLs, the 8 category URLs and the three form pages.
      - Evidence goes in `docs/qa-evidence/WAVE-3/`, with the project ref and local paths scrubbed and no client photo committed.

  **OPTIONAL OWNER ROWS** (on top of the contract's O1–O4)
  - **O1 matters most.** It's the only check of the live DELETE policies, on the table and on Storage. If the owner runs one row, it should be O1, using a ZZ-TEST title.
  - **O5:** upload a phone photo, after TinyPNG, as a category image. Expected: it uploads.
  - **O6:** pick an image, pick a `.png` while it uploads, then click Save categories. Expected: it saves, with no "still uploading" message.

  **/SHIP ADDITIONS**
  1. **Before the push,** the evidence exists for MUST-ADDs 8–9 (0 disagreements), 11 (every run ends false), 12 (empty diff) and 15.
  2. **A few minutes before the push,** capture production's `/life-at-fashion-asia` `<img src>` list.
  3. **After the deploy, on both domains:**
     - that list is unchanged, and every image answers 200;
     - the facility images and the 8 category images are unchanged and answer 200;
     - an anonymous `/admin/media` answers 307 with no `Set-Cookie`.
  4. **Tell the owner to reload any `/admin` tab opened before the deploy.** Server Action ids change with each build, so saves from an old tab fail with the "check your connection" messages.
  5. **These reports mean a Wave 3 incident:**

     | Report | Points to |
     |---|---|
     | "Still uploading" when nothing is uploading | T-010 |
     | "Width and height couldn't be read" on an ordinary photo | T-007 |
     | "Not found" while the item stays listed | the DELETE policy (RLS) |
     | A broken image after a gallery delete | the clean-up |

     Fix by reverting through `/ship` to both remotes.

  **CONTRACT CONCERNS for `architect-reviewer`**
  - **C1 — MUST SETTLE BEFORE BUILD (3a).** Name the `site_settings` search method: every row's `JSON.stringify(value)`, searched in code. An `ilike` on the column errors, so files are never deleted. A `value->>key` filter misses other keys, so an in-use file is deleted. A fake database can't tell these apart.
  - **C2 — MUST SETTLE BEFORE BUILD (3b).** Add one sentence to item 12:
    - a newer pick refused at any stage is "the latest pick's outcome", and reports false;
    - an overtaken pick never reports;
    - `uploading` is computed over keys in the current list only.
  - **C3 — settle before build, or at `/design-review` by wording.** MEDIA_NOT_FOUND also fires when RLS refuses the delete and the row is still there. Either add a follow-up read with its own message, or use neutral wording such as "The item wasn't deleted. Reload the page to see the current list."
  - **C4.** The rekey changes Who We Are's three editors, a file on the unchanged list. Add it to the harness (MUST-ADD 13).
  - **C5.** Item 11's focus rule matters mostly for Move down, because React moves that row's node. Require tests in real Chrome.
  - **C6.** Extend "never `<body>`" to publishing. The disabled fieldset blurs the focused button.
  - **C7.** The name regex `^[A-Za-z0-9._-]+$` accepts `.` and `..`. Require a leading letter or digit. This is defence in depth only; it takes a crafted row.
  - **C8.** For EXIF-rotated photos, the server reports the stored width×height, swapped relative to the browser. Record that as accepted; the decision on the longest edge is the same.
  - **C9.** `reports.file_url` is the only URL column outside the reference set. Add one count, or record why it's excluded.
  - **C10.** `media-actions.ts` becomes the fourth importer of `action-errors.ts`. Update STACK §4 and INVENTORY at close.

  **GO / NO-GO: GO WITH ADDITIONS.** C1 is settled before 3a builds, C2 before 3b builds, and C3 by `/design-review` at the latest.

  Files read (source from the working tree, which a builder may be editing):
  - `/Users/adilahmed/.claude/projects/-Volumes-D-Architect-Codebase-Fashion-asia-limited/memory/fashion-asia-wave3-contract-draft.md`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/actions/media-actions.ts`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/components/admin/SettingsForm.tsx`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/components/admin/ImageUploadField.tsx`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/admin/(dashboard)/products/ProductsClient.tsx`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/admin/(dashboard)/homepage/HomepageSettingsClient.tsx`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx`
  - `/Volumes/D_Architect/Codebase/Fashion_asia_limited/supabase-schema.sql`
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

- [x] **T-020** — Raise the `text-black`-on-`bg-primary` controls to WCAG AA contrast across the public site and admin
  Done 2026-10-07 in **Wave 4a** (commit `82067bd`; reviews under T-034's done note). Text on solid green is `text-foreground` in every state but disabled, outline states use `text-accent`, no light text sits on `secondary` (now unused in `src`), and `::selection` uses the tokens instead of raw hex. The contrast log is `docs/qa-evidence/T-020/contrast-log.md`: every non-disabled state is at least 7.18:1.
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

- [x] **T-022** — Stop `/sitemap.xml` from stamping every URL as modified on every request
  Done 2026-10-08 in **Wave 5a** (commit `b8558c3`; reviews under T-008's done note). All 11 `lastModified` lines are gone, and the 18 entries are byte-identical to `main`'s minus `<lastmod>`. Two fetches match, and `/sitemap.xml` is still rendered per request.
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
- [x] **T-027** — Make `text-primary` micro-labels pass WCAG AA sitewide [app:site][design]
  Done 2026-10-07 in **Wave 4b**:
  - **Commits:** `84e4da3` (the token sweep: items 6–8 plus the 4b additions F2 and F4, 35 files), `684ed09` (item 9, the `scrim` token) and `647b2d5` (design fix: the "Secure Session" icon matches its label). Item 10's DESIGN.md §2 entries landed with the close-out docs.
  - **What changed:** green text is `text-accent` everywhere (`text-primary` now colours only `aria-hidden` decoration and the mobile-menu numbers); every `h1`–`h4` uses `text-foreground`; the admin sidebar group and dashboard stat labels are `text-white/50`; text on solid green is `text-foreground`; the sustainability caption is `text-surface/70 text-xs`; the category cards use `bg-scrim`, pixel-identical. Every changed label measures at least 5.28:1.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP. Class tokens only (123 changes, 0 outside `className`); the public HTML is identical apart from class tokens on 13 pages; the five conditions for skipping the security review hold.
    - `design-reviewer`: FIX FIRST (the ShieldCheck icon), then SHIP; it approved the DESIGN.md draft with five recording edits.
  - **Re-bind at 5a:** `products/[category]/page.tsx` is now `b6b09179…` and `ImportBuiltInGallery.tsx` is `acf7a662…` (class tokens only).
  - **NOT VISUALLY VERIFIED:** the live admin (stand-in renders with the exact classes), live `FormStatusMessage` lines, and 768/1024 px.
  - **Follow-ups:** under "Follow-ups found in Wave 4b".
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
- [x] **T-028** — Respect `prefers-reduced-motion` sitewide [app:site][design]
  Done 2026-10-08 in **Wave 5b**:
  - **Commits:** `2f5b093` (items 5, 6, 7, 10 and 11), `0a5bf42` (item 8, `motion-safe:` on 26 hover transforms and 2 infinite animations), `1768926` (item 9, `AutoplayVideo`), `f65a8c2` (the hero overlay AA addition) and `01245bf` (fix round: the preloader unmounts under reduced motion; the hero's accent word and stats become `text-accent` over a `bg-background/30` layer; the static marquee wraps and centres).
  - **What changed:** with the setting on, there's no smooth scroll, no GSAP motion (final states render), no hover transforms or infinite animations, videos hold on their posters, the preloader never renders, and the career page jumps instantly. Without it, motion is unchanged. Every hero text element passes AA on 6 video frames at both widths.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: FIX FIRST (turning the setting off mid-visit brought the preloader curtain back for good), then SHIP after `01245bf`. Mutants 8/8, with M8 re-killed; the preference-flip probe passes.
    - `design-reviewer`: FIX FIRST (the gradient hero word and stat values failed 3:1; the static marquee was clipped), then SHIP after `01245bf`.
  - **Accepted:** `autoPlay` stays in the server markup (the byte-identical rule), so a reduced-motion visitor may see up to about 50 ms of the hero video before hydration pauses it.
  - **Follow-ups:** under "Follow-ups found in Wave 5b".
  AC:
  - With reduced motion set:
    - `ScrollReveal` content shows without sliding (`MotionConfig reducedMotion="user"` in `src/app/(website)/layout.tsx`);
    - the card hover zoom is `motion-safe:` only;
    - Lenis smooth scrolling is off;
    - the preloader is shortened or skipped.
  - Default motion is unchanged.
  Source: `design-reviewer` and `code-reviewer`, T-024 review, 2026-10-03. It breaks the a11y floor in CLAUDE.md; it isn't an AA failure (WCAG 2.3.3 is AAA).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge.
- [x] **T-029** — Make the mobile menu keyboard- and screen-reader-safe [app:site][design]
  Done 2026-10-08 in **Wave 5c**, the autonomous run's last wave:
  - **Commits:** `00f6105` (T-029) and `0924597` (fix round: focus stays visible under the header, tidier rings, the closing menu inert, the logo link named).
  - **What changed:** the public "Menu" toggle has `aria-expanded`, `aria-controls` and the house ring. It reuses Wave 4d's `useOverlayMenu` unchanged: focus moves in, Tab wraps, Escape closes and returns focus to the toggle, and `#site-main` and `#site-footer` are `inert` while it's open. The menu numbers are hidden from screen readers, the navs are named "Main" and "Menu", and every header and menu link has the ring. Any route change closes the menu, and with reduced motion on the header's height and the hamburger bars don't animate. Without reduced motion, it looks and moves as on `main`. The menu wrapper is `inert` while closed, so fading links can't take focus or taps during the close animation. The logo link is named "Fashion Asia Limited home".
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP, with four minor notes: the closing-menu gap (fixed in `0924597`), the 1280 px focus gap (accepted), the copied ring string (for T-040) and a 150 ms colour fade under reduced motion. It re-checked `0924597` SHIP: 24/24 control checks and 16/16 mutants, with new ones for the `before:` ring and the wrapper's `inert`.
    - `design-reviewer`: FIX FIRST (focus hidden under the header at 360×640, tall desktop ring boxes, overlapping contact rings), then SHIP after `0924597`: 0 of 21 focus steps hidden, 44 px desktop ring boxes, and no overlap.
  - **Accepted gaps:** widening to 1280 px with the menu open leaves focus on `<body>`, as in T-030. The scroll lock stays with T-042.
  - **NOT VISUALLY VERIFIED:** real phones, a real screen reader, and the iOS scroll lock.
  AC:
  - While the menu is open, focus stays inside it; today Tab moves into page cards hidden behind the overlay.
  - Escape closes the menu and returns focus to the toggle.
  - The toggle has `aria-expanded` and `aria-controls`.
  - The decorative ordinals ("04") are `aria-hidden` (1.22:1), so they stop leaking into link names.
  - Header and menu links show a `ring-accent` focus ring instead of the browser default.
  Source: `design-reviewer`, T-025 review, 2026-10-03. This is an existing problem, not caused by T-025.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge.
- [x] **T-030** — Give the admin a way to navigate on phones, and mark the current page in the sidebar [app:admin][design]
  Done 2026-10-07 in **Wave 4d**:
  - **Commits:** `8b718dd` (the shared `useOverlayMenu` hook), `a8a3fdd` (`AdminNav` and the layout) and `edff562` (fix round: group spacing, 44 px phone targets, `text-foreground`, close on any route change).
  - **What changed:**
    - below 768 px, a top bar's Menu toggle opens every sidebar link, in the same groups, plus Sign Out. Focus moves in, Tab wraps, Escape closes and returns focus to the toggle, and the page behind is `inert` and doesn't scroll. A link click, Back, Forward or widening to 768 px closes it;
    - the current page is marked with `aria-current` plus a bar and bold text;
    - the layout stays a server component and hands its Sign Out form to the client `AdminNav`.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP, with five yellow notes. Y1 (Back and Forward) and Y2 (a JSDoc note) were handled in `edff562`, and Y3 went to T-036. It re-checked the fix SHIP: 79/79 in production and 75/75 in StrictMode with its own probes, and 28/28 mutants.
    - `design-reviewer`: FIX FIRST (group spacing, 44 px phone targets, `text-white`, Back and Forward), then SHIP after `edff562`, re-shot at 360 and 1440 px.
    - `security-reviewer`: CLEARED, then re-bound after the fix: `layout.tsx` `817b002d…`, `AdminNav.tsx` `dd00bffb…` and `use-overlay-menu.ts` `3bbc4bd3…`. SEC-INFO-48 is accepted. The entry is in `docs/SECURITY.md`.
  - **Accepted gaps:** widening to 768 px while the menu is open leaves focus on `<body>`, because the toggle is hidden at that width; the next Tab reaches the sidebar. Back and Forward navigate and close the menu, not "Back closes the menu instead of navigating", which would need a history entry; decide that once for T-030 and T-029.
  - **NOT VISUALLY VERIFIED:** the live signed-in admin, real phones (iOS scroll lock, safe areas, Android's system Back), and a real screen reader.
  - **Follow-ups:** under "Follow-ups found in Wave 4d".
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
- [x] **T-032** — Small category-save and settings-key edge cases [app:admin]
  Done 2026-10-06 in **Wave 1** (commit `032c8fa`; reviews and evidence under T-033's done note).
  **Built in Wave 1 with T-033 under one binding contract** (`architect-reviewer`, 2026-10-06): see T-033, items 3–6. Where this ticket's AC below differs, the contract wins.
  AC:
  - Titles with no Latin letters or digits all slugify to `category`, so a second one is refused (QA T-026 F5). Give them a distinct, readable slug, or explain the refusal in the error.
  - `updateSettings` accepts any key, so "Business" or "business " creates a junk row (QA T-026 F6, within RISKS R1). Allow only the known settings keys.
  - The delete-guard message for several categories reads `"T-Shirts, Sportswear" still has products assigned to it.` (QA T-026 F7). Name them grammatically.
  - *(Added 2026-10-04, from T-016's `architect-reviewer`.)* `checkCategoryAttachable` reads through `getSettings`, which falls back to the code defaults when the read fails. A failed read therefore refuses the product write with a misleading "hasn't been saved as a category yet". Make it fail closed with its own "couldn't check the category, try again" message.
  Source: QA T-026 Static Pass, 2026-10-04. All Info-level, and all predate T-026.
  Sequence: `/build` → `/security-review` (it touches `settings-actions.ts`) → `/qa` → `code-reviewer` → merge.
- [x] **T-033** — Category-title and slug hygiene, catalog narrowing, and admin copy [app:admin][app:site][design][sec]
  Done 2026-10-06, in **Wave 1** with T-032:
  - **Commits:** `010939f` (the contract and premortem folded in), `2aab4d5` (T-033), `032c8fa` (T-032), `1a57cfa` (the fix round: placeholder, digit wording, an own-key `PRODUCT_IMAGES` guard).
  - **Reviews:**
    - `architect-reviewer`: APPROVE. `premortem-planner`: GO WITH ADDITIONS (K1–K3 were settled by the contract).
    - `code-reviewer`: SHIP. Its 20 own mutants were killed. It found a latent bug: a category titled "constructor" got a function as its default image. That's fixed in `1a57cfa`.
    - `security-reviewer`: CLEARED. It re-bound the five touched files, and `site-content.ts` is re-bound again at `1a57cfa`. SEC-INFO-36 is closed in code.
    - `design-reviewer`: FIX FIRST (the placeholder clipped at 360), then fixed. This used a SYNTHETIC harness: the admin is NOT VISUALLY VERIFIED against the live login.
    - QA: PASS. MUST-ADD 2's 11 public captures are identical to the before-build baseline, with the same 8 category addresses.
  - **Tests** (scratchpad harness, evidence in `docs/qa-evidence/WAVE-1/`): 782 checks and 67/67 mutations; T-016's harness re-run is green.
  - **Accepted visible changes:** DECISIONS 2026-10-06 (Wave 1).
  **Wave 1 binding contract, covering T-033 and T-032** (`architect-reviewer`, 2026-10-06: APPROVE; folded verbatim, so no second `/architect-review` is needed). It needs no schema change, no new dependency and no new database object, so there's no HARD STOP. Where the older rules below conflict with this contract, the contract wins.
  - **Scope guard:** code only. Every file on the unchanged list stays byte-identical. No new exported function in any `"use server"` file. Every message is a non-exported constant (or a private function that builds it); `/design-review` may tune the wording, but the names, the files they live in and when they show are binding.
  1. **The slug cut** (T-033, `site-content.ts`).
     - A private `MAX_SLUG_LENGTH = 255`, with a comment saying it mirrors `products.category_slug VARCHAR(255)` (migration 0001). It's a schema limit, not a policy number.
     - A private `slugBody(title)`: today's mapping (lowercase, every run outside `a-z0-9` becomes `-`, outer dashes trimmed), with no fallback and no cut.
     - A private `cutSlug(slug, max)`: `slice(0, max)`, then trim trailing dashes.
     - `slugify(title)` becomes `cutSlug(slugBody(title), MAX_SLUG_LENGTH) || "category"`.
     - `dedupeSlug`: for each `n` from 2 up, the candidate is ``${cutSlug(slug, MAX_SLUG_LENGTH - `-${n}`.length)}-${n}``. The first one not already taken wins.
     - `isWellFormedSlug` uses `MAX_SLUG_LENGTH`; its pattern doesn't change.
     - `resolveCategoriesForSave` drops its inline `.slice(0, 255).replace(/-+$/, "")` and calls `slugify`.
     - **The effect:** every slug that today comes out at 255 characters or fewer stays exactly the same. Only today's over-long read-time slugs change, and they become valid. The builder re-checks the live titles read-only. The character mapping itself doesn't change: no transliteration, no accent stripping.
  2. **Invisible category titles** (T-033, QA F4), in `resolveCategoriesForSave`.
     - A title that's blank after trimming is still skipped, which deletes the category (T-026's rule, unchanged).
     - A title that isn't blank but fails `hasVisibleText` refuses the whole save: "Category #n's title has no visible characters, so nothing was saved. Type a title, then save again." `n` is the row's 1-based position in the list sent, which is the editor's #n. This applies to existing and new categories, and it's never treated as a deletion.
     - `blankTitleRows` in `category-draft.ts` flags a row whose title fails `hasVisibleText`, so the editor blocks Save first with its existing message. Update that file's header comment: it now imports one function from `site-content.ts`, which itself has no imports.
     - `normalizeProducts` doesn't change.
  3. **A new category needs a letter or a number** (T-032, QA F5), in `resolveCategoriesForSave`.
     - A new category (no matching stored id) whose `slugBody(title)` is empty refuses the whole save: `"<title>" needs at least one letter from A to Z or a number in its title, because its web address is made from them. Add one (the rest of the title can stay), then save again.`
       *(Amended 2026-10-06 in `1a57cfa`: "or a number" became "or a digit from 0 to 9", because Bengali digits don't count; DECISIONS 2026-10-06.)*
     - This check runs after item 2's, so an invisible title gets item 2's message.
     - An existing category, matched by id, keeps its frozen slug whatever its title says, even if that slug is already `category`. So no URL changes, and renaming an existing category to a non-Latin title still saves.
     - At read time, `normalizeProducts` keeps the `category` fallback (and `-N`) for categories that have never been saved.
  4. **`updateSettings` accepts only six keys** (T-032, QA F6), in `settings-actions.ts`.
     - A private `UPDATABLE_SETTINGS_KEYS = new Set(["homepage", "who_we_are", "who_we_work_with", "sustainability", "contact", "general"])`, written out by hand, never derived from `SITE_SETTINGS`.
     - Check order: (1) `getUser()` stays the first await (SESSION_EXPIRED). (2) `"business"` still gets BUSINESS_MOVED, unchanged and checked before the allowlist, so an old What We Do tab still gets the "moved" message. (3) A key that isn't a string, or isn't in the set by exact match (no trimming, no case folding), returns UNKNOWN_SETTINGS_KEY: "Nothing was saved, because these settings aren't recognized. Reload the page and try again." (4) Then the existing upsert, unchanged.
     - No caller changes. `seedSettingsFromDefaults` doesn't go through `updateSettings`. Page refreshes don't change. This limits which settings rows a signed-in account can write, not who can write them; RISKS R1 stands.
  5. **The delete-guard message for several categories** (T-032, QA F7).
     - One blocked category keeps today's message exactly: `Remove its products first: "T-Shirts" still has products assigned to it.`
     - Two or more quote each title separately, with commas and a final "and": `Remove their products first: "T-Shirts" and "Sportswear" still have products assigned to them.`, or `"T-Shirts", "Polo Shirts" and "Sportswear"`.
     - The list join is a private helper in `settings-actions.ts`. The rest of the guard (the id comparison, the product count, the refusal) doesn't change.
  6. **`checkCategoryAttachable` fails closed** (T-032, `products-actions.ts`).
     - It reads through `readSettingsForEditor("business")`, reused as it is. That file is server-only and not a `"use server"` module, so importing it here adds no public endpoint. Don't write a second read.
     - On `ok: false`, a new reason `{ attachable: false; reason: "unchecked" }` returns CATEGORY_CHECK_FAILED: "Nothing was saved, because the category couldn't be checked. Try again in a moment."
     - On `ok: true`, `value.products` goes through today's logic, unchanged. `products-actions.ts` stops importing `getSettings`.
     - These don't change: `getSettings` itself; `settings-read.ts`, byte for byte; the attachable rule; the "not saved yet" and "does not exist" answers and their wording; and the order of checks in create, update and reorder.
  7. **NOTHING_TO_SAVE** (T-033): the string becomes "Nothing was saved. Reload the page, then try again."
  8. **Narrowing products for the public pages** (T-033, SEC-INFO-36).
     - **The type:** `ProductCardData = Pick<CategoryProduct, "name" | "description" | "image"> & { id?: never }`, defined once in `ProductCard.tsx`; `ProductGrid.tsx` imports it with `import type`.
     - **The mapper:** `toProductCards(rows: readonly CategoryProduct[]): ProductCardData[]`, in `ProductGrid.tsx`, builds new objects with exactly those 3 fields.
     - Both components take `ProductCardData`, so passing a whole product row is a type error. Both public pages call `toProductCards` first. React keys stay `${name}-${i}`.
     - **`ProductCard`:** a name or description counts as blank if it fails `hasVisibleText`. The heading and the image's alt text use the name only if it passes. If both are blank, the `p-5` text block doesn't render.
  9. **The What We Do text page** (T-033, `BusinessClient.tsx`).
     - It keeps a last-saved copy of the text: the loaded text, replaced by what was sent when a save succeeds.
     - While the 4 fields differ from it (process steps compared one by one), the existing status area shows: "Unsaved page text changes. They aren't on the site until you click Save page text."
     - The editor is read-only while a save is in flight (`<fieldset disabled>`, as in `ProductsClient`). "Page text saved." shows only when nothing differs.
     - T-026's client rules still hold, and `business/page.tsx` doesn't change.
  10. **The sync panel's messages** (T-033).
      - `SeedResult` becomes `{ ok: true; seeded: string[] } | { ok: false; error: string; seeded: string[] }`. `seeded` lists the keys synced before a failure, or `[]` if none were. Its one consumer, `SeedDefaultsPanel`, changes in the same commit.
      - No message from the server contains a storage key. A failure on the What We Do page text is a full sentence: a SAVE_CONFLICT becomes SEED_CONFLICT: "The What We Do page text wasn't synced, because another save changed it at the same moment. Click Sync again."; any other reason becomes `The What We Do page text wasn't synced: <reason>`. `writeBusinessFields` and SAVE_CONFLICT don't change.
      - The panel names pages only by their labels: "Synced <labels>." on success; "Synced <labels>. <error>" when some pages synced first; otherwise just `<error>`.
      - What the sync writes doesn't change: the same rows, values, order and page refreshes.
  11. **The comment and the placeholder** (T-033).
      - `settings-actions.ts:262-266` gets `code-reviewer`'s comment wording. It's a comment-only change.
      - The placeholder at `ImageUploadField.tsx:316` changes to text that can't be mistaken for a real path; `/design-review` picks the wording. That changes the empty state of every image field, and nothing else in the file changes.
  12. **Must not change:** the slug alphabet; every stored slug; every new slug that's 255 characters or fewer today; T-026's save contract (`writeBusinessFields` and its compare-and-swap, SAVE_CONFLICT, BUSINESS_MOVED, `saveCategories`' identity rules, its delete guard apart from item 5's wording, `saveWhatWeDoText` and `pickWhatWeDoText`); `getSettings`; what the sync writes; `normalizeProducts`, apart from the cut; `getUser()` as every write's first await.
  13. **Commits and checks.**
      - Commit T-033 first, then T-032 (item 3 uses item 1's `slugBody`). Each commit must typecheck and build on its own.
      - No agent saves or syncs anything. The slug, title and category-check rules are verified by code reading plus scratch scripts against the pure functions in `site-content.ts`, which has no imports. The What We Do and sync messages are verified by code reading or a synthetic render. Never run "Sync Content From Code".
  - **Touches** (11 source files; corrected 2026-10-06, QA I6):
    - `site-content.ts` (voids T-016's sign-off `2ae9d3f1…`), `settings-actions.ts` (voids T-026's `2785952a…`), `products-actions.ts` (voids T-016's `6899ea96…`);
    - `(website)/(marketing)/products/page.tsx` (voids T-016's `0aec2d41…`) and `products/[category]/page.tsx` (voids T-025's `aa384615…`);
    - `src/components/catalog/ProductGrid.tsx` and `ProductCard.tsx` (no hash sign-off);
    - `admin/(dashboard)/products/category-draft.ts`, `business/BusinessClient.tsx` and `SeedDefaultsPanel.tsx` (`/security-review` re-checks T-026's client rules on them);
    - `src/components/admin/ImageUploadField.tsx` (the placeholder only).
  - **Unchanged** (byte-identical, by hash where signed off): `settings-read.ts` `cc5c8a2c…` and `business/page.tsx` `87071736…` (T-026), the admin `products/page.tsx` `969a00de…` (T-016), and `nav.ts`, `sitemap.ts` and `next.config.ts` (T-025) all stay signed off. Also unchanged: `ProductsClient.tsx`, `CategoryProductsManager.tsx`, `SettingsForm.tsx`, `CategoryCardGrid.tsx`, the six settings clients, `middleware.ts`, `src/lib/supabase/*`, `db/`, `supabase-schema.sql`, `package.json` and `package-lock.json`.
  - **Docs at close:** ROADMAP; DECISIONS; DATA_MODEL §3 and STACK §4 (the six-key allowlist); INVENTORY regenerated, with `@purpose` on `toProductCards` and `ProductCardData`; SECURITY and QA_REPORT from their owners.
  - **Sequence:** `/build` ✅ (T-033, then T-032) → `/design-review` ✅ FIX FIRST → fixed → `/security-review` ✅ CLEARED (re-signs the five files above; re-checks three client files) → `/qa` ✅ PASS (read-only; production build on :3101) → `code-reviewer` ✅ SHIP → merge ✅ (2026-10-06). About ½ day plus one review stage; it must not grow.
  - **Re-review triggers** (re-run `/architect-review`): any SQL, migration, table, column, index, RPC, trigger or new dependency, including any slug or transliteration library; any change to the slug alphabet or `isWellFormedSlug`'s pattern; any change to a stored slug, or to a new slug that's 255 characters or fewer today; any change to item 12's T-026 save-contract parts or to `getSettings`; an edit to any file on the unchanged list; a new export in a `"use server"` file, or a signature change to any exported action other than `SeedResult`'s shape; an allowlist other than the six keys, or one derived from `SITE_SETTINGS`; any change to what the sync writes; `normalizeProducts` dropping or hiding categories; `ImageUploadField` changes beyond the placeholder text; pulling in items from Waves 2–5 (T-014, T-018, T-013, T-010); the wave growing past ½ day.
  **Wave 1 premortem (`premortem-planner`, 2026-10-06: GO WITH ADDITIONS). These MUST-ADDs are binding.** The premortem ran in parallel with the contract. Its must-settle points K1–K3 are already settled by contract items 3, 4 and 6, so it needs no second `/architect-review`. Where a MUST-ADD below assumed a different answer, it's restated to fit the contract.
  - **Top failure modes,** most likely first:
    1. The first Save (staff, after the deploy) locks in different category addresses, because `slugify` changed for an ordinary title, or a non-ASCII slug fails `isWellFormedSlug` and blocks every later category save.
    2. Products show wrongly, or a category page crashes, once real products exist. `toProductCards` drops a field, the blank-text rule hides real text, or `ProductGrid` gains `"use client"`. Agents see 0 live products, so this has to be caught offline.
    3. The settings-key allowlist breaks an editor: a typo, `general` missing, the check placed before BUSINESS_MOVED, or reuse in Sync.
    4. The fail-closed category check blocks or mislabels every product write, by over-validating legitimate states (no row, a legacy string list, categories without ids).
    5. A wording-only change alters a save path. Sync rewrites `business` whole (T-026's old live bug); a throw escapes the What We Do save; `processSteps` is compared by reference; or shared strings change.
  1. **The slug functions are compared old against new, offline.**
     - **Setup:** a harness in the scratchpad loads `main` @ `95f7ea1`'s `site-content.ts` (via `git show`) next to the branch's copy, with id generation stubbed.
     - **`slugify`:** byte-identical for every title whose `main` output is non-empty and at most 255 characters. Test it on the 8 live titles and the 8 defaults; at least 10,000 generated titles mixing ASCII, punctuation runs, digits, Bengali, emoji, combining marks and invisible characters; and every length from 250 to 260, plus 500. A `main` output over 255 must come out cut at 255 with trailing dashes removed.
     - **Valid shape:** every new output matches `^[a-z0-9]+(-[a-z0-9]+)*$` and is at most 255 characters, and `isWellFormedSlug` answers exactly as `main` does.
     - **`normalizeProducts`:** identical for every list whose slugs are all at most 255. This includes duplicate titles (`-2`, `-3`), string lists, object lists, mixed lists and malformed stored slugs.
     - **`resolveCategoriesForSave`:** identical results, with ids masked, for every list that doesn't hit the two new refusals. Name-clash messages are included.
  2. **The 8 live addresses survive the first Save.**
     - **Baseline:** captured 2026-10-06 before `/build`, from build `Cc0bmCDVMakGcv-X7ur5m` (`main` `95f7ea1`) on :3101, into the scratchpad `wave-1/baseline-95f7ea1/`. It holds `/what-we-do`, `/products`, the 8 `/products/<slug>` pages and `/sitemap.xml`. All were 200 with 0 UUIDs, and the slugs were `t-shirts`, `polo-shirts`, `tank-tops`, `dresses`, `sleepwear`, `leggings`, `sportswear` and `heavy-jersey-products`.
     - **Simulated first Save:** offline, the branch's `resolveCategoriesForSave(<the 8 as the editor sends them>, new Map())` returns `ok: true` with the same 8 slugs in the same order. Repeat it with `SITE_SETTINGS.business.products`, and with the 8 as a legacy list of plain strings.
     - **After the build:** the same pages and the sitemap are identical once the build id is normalized, with 0 UUIDs. If staff change live titles in between, rerun the simulation on a fresh read-only capture.
  3. **The slug rules stay closed.** `isWellFormedSlug`'s pattern doesn't change, and `MAX_SLUG_LENGTH` and `cutSlug` stay private. `resolveCategoriesForSave` still never reads a slug sent by the client. A name clash at save time is still refused, never given a `-2`. `package.json` and the lockfile are byte-identical.
  4. **Category titles with no visible characters (T-033).**
     - **Refused:** a title that's not blank after trimming but fails `hasVisibleText` refuses the whole save with item 2's message. Test U+200B, U+200E, U+202E, U+FEFF, U+3164, U+00AD and mixes of them.
     - **Row numbers:** "#n" is the 1-based position in the submitted list, counting blank rows.
     - **Unchanged:** a title that's blank after trimming is still treated as removed, and "T-Shirts" followed by a U+200B still saves with `main`'s slug.
     - **Client mirror:** `blankTitleRows` flags invisible-only titles; `hasVisibleText` is the only new import in `category-draft.ts`.
  5. **Titles with no Latin letters or digits (T-032, settled by contract item 3).**
     - A new category whose `slugBody(title)` is empty is refused with item 3's message. That's tested on `slugBody`, never by checking `slug === "category"`, so a category literally titled "Category" still saves.
     - An existing category keeps its frozen slug and still saves under a non-Latin rename.
     - Every name-clash message for Latin titles is byte-identical to `main`'s.
  6. **The `updateSettings` key allowlist (T-032, settled by contract item 4)**, checked with a fake database.
     - **Order:** `getUser()` comes first, then `business` gets the unchanged BUSINESS_MOVED message, then the hand-written six-key set.
     - **Allowed keys:** `homepage`, `who_we_are`, `who_we_work_with`, `sustainability`, `contact` and `general`, matched exactly. Each gets the same database write and page refreshes as on `main`.
     - **Refused, with no table access:** "Business", "business ", "general ", "constructor", "__proto__", "toString", an empty string, a number and `null`.
     - **Call sites:** every `updateSettings("…")` call in `src` uses an allowed key (6 calls in 5 client files).
     - **Sync:** `seedSettingsFromDefaults`' key filter is byte-identical.
  7. **The fail-closed category check (T-032, settled by contract item 6)**, checked with a fake database.
     - **How it reads:** through `readSettingsForEditor("business")`, imported only, with `settings-read.ts` byte-identical (`cc5c8a2c…`).
     - **Answers:**
       - a stored id with a well-formed slug: allowed;
       - no row, a legacy string list, or categories without ids: today's "hasn't been saved as a category yet…", byte-identical;
       - an unknown slug: "does not exist", byte-identical;
       - a read error, a throw (after `unstable_rethrow`), or a stored value that isn't an object: CATEGORY_CHECK_FAILED, with no database text.
     - **Callers:** create, update and reorder each return that message and write nothing.
  8. **T-016 still holds.**
     - Re-run T-016's harness from the scratchpad. That covers the server, serializer, `hasVisibleText`, the UI in production and StrictMode, and the mutation suite.
     - Only the NOTHING_TO_SAVE wording and the stub for the category read may change in expectations. The mutation suite still catches everything it caught at `09702d0`.
     - If the scratchpad has gone, rebuild the server and UI suites.
     - `CategoryProductsManager.tsx` and `ProductsClient.tsx` have 0-byte diffs.
  9. **The product mapper (SEC-INFO-36).**
     - **Mapping:** `toProductCards` copies `{ name, description, image }` exactly, with the same count and order; nothing is trimmed or filtered.
     - **Types:** `ProductGrid` and `ProductCard` take `ProductCardData` (`id?: never`), so tsc rejects un-narrowed rows on both pages. Neither file gains `"use client"`.
     - **Server render, old against new:** render `main`'s and the branch's `ProductGrid` server-side with sample products: a Bengali name, a long unbroken word, an empty description, name plus description, and 9 products in one grid. Markup is identical for every product with a name or a description; a product with both blank loses only its text block.
     - **No leaks:** a render of `/products` and `/products/<slug>` with sample products, through Next's compiled serializer, has 0 UUIDs and no `category_slug`, `sort_order`, `created_at` or `updated_at`.
  10. **The What We Do page (T-033)**, checked in a synthetic harness on `BusinessClient`.
      - **The marker:** "Unsaved" shows exactly while the 4 fields differ from the last saved snapshot. `processSteps` is compared deeply and in order. The marker clears after a successful save, and the saved snapshot is the one that was sent.
      - **During a save:** every input and ChipList button is disabled by a `<fieldset disabled>`. Never use a `<form>`: ChipList's buttons have no `type`.
      - **On a refusal, SAVE_CONFLICT or a throw:** the draft and the marker stay, the editor unfreezes and the error shows. A throw is caught inside the save and never reaches an error boundary.
      - **Imports:** no new Server Action, and the comparison helper lives in `business/` or `src/lib`, never imported from `products/*` (T-026 invariant 7).
  11. **Sync (T-033)**, checked with a fake database.
      - **Same writes:** for every combination of the 7 keys, the rows written and the value `writeBusinessFields` builds are identical to `main`'s.
      - **No raw keys:** no message shows a raw storage key. The server returns `seeded` keys and the panel maps them to its labels, with no `?? key` fallback that could show a raw key.
      - **Wording:** the partial-failure and conflict messages say "click Sync again". SAVE_CONFLICT's wording for the two save actions doesn't change. If `SeedResult` changes shape, `SeedDefaultsPanel` changes in the same commit. No agent runs Sync.
  12. **Only the intended wording changes.**
      - **Byte-identical to `main`:** SESSION_EXPIRED, PRODUCT_NOT_FOUND, PRODUCT_NAME_REQUIRED, PRODUCT_IMAGE_REQUIRED, the "not saved yet" text, "does not exist", BUSINESS_MOVED, BUSINESS_UNREADABLE, SAVE_CONFLICT, every Latin name-clash message, and the one-category delete guard.
      - **Changed only:** NOTHING_TO_SAVE, the multi-category guard, the invisible-title refusal, the non-Latin refusal, CATEGORY_CHECK_FAILED, UNKNOWN_SETTINGS_KEY, the Sync messages and the image placeholder.
      - The `writeBusinessFields` change touches only comment lines, and the only change in `ImageUploadField.tsx` is the `placeholder` attribute.
  13. **Scope and security sign-offs.**
      - **0-byte diffs:** `settings-read.ts`, `business/page.tsx`, `SettingsForm.tsx`, `media-actions.ts`, `nav.ts`, `sitemap.ts`, the middleware, `next.config.ts`, `db/` and `supabase-schema.sql`.
      - **Exports:** the server-action files export the same functions as `main`, and no constants.
      - **Re-binds:** `/security-review` re-binds by sha256 every touched file that carries a hash: `site-content.ts`, `products-actions.ts` and both `products/page.tsx` files (T-016), `settings-actions.ts` (T-026), and `products/[category]/page.tsx` (T-025 `aa384615…`). It also re-checks T-026's client rules on `BusinessClient`, `SeedDefaultsPanel` and `category-draft`.
      - **Docs:** INVENTORY gets `@purpose` lines for `toProductCards` and `ProductCardData`. Evidence goes in `docs/qa-evidence/WAVE-1/`, with local paths scrubbed.
  - **Optional owner rows** (evidence only; the owner waived checklists on 2026-10-06):
    - **O1:** Contact & General: Save Changes with no change. Expected: no red text.
    - **O2:** What We Do: add a letter and watch the marker and the freeze, then undo and save.
    - **O3:** Products: add two Bengali-titled categories and save. Expected: the explanation, and nothing saved.
    - **O4:** After the first Save, the 8 category pages keep their addresses.
  - **`/ship` additions:**
    1. **Before the push:** MUST-ADD 2's evidence exists, and `main`'s sitemap lists the same 8 category addresses as the baseline.
    2. **After the deploy, read-only on both domains:** the sitemap's category addresses match the baseline, each `/products/<slug>` returns 200, and one `/what-we-do/<slug>` gives one 308, then 200.
    3. **After the first Save:** run item 2 again once a read-only check shows the categories have ids, and record it in LOG. Any moved address reopens Wave 1.
  - **Notes from the premortem for later waves:**
    - **K4:** re-baseline T-018's (Wave 2) "byte-for-byte unchanged" list on Wave 1's strings, so it doesn't revert them.
    - **K8:** the new placeholder appears in every `ImageUploadField` across the admin. Log it in DECISIONS as an accepted admin-only visible change.
    - **K9:** through `slugify`, the length cut also changes `normalizeProducts`' read-time slug for titles over 255 characters. None are live, and it's intended: read time and save time then agree.
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
- [x] **T-034** — Warn before leaving `/admin/products` while a product save is still pending [app:admin][design]
  Done 2026-10-07, in **Wave 4a** with T-020:
  - **Commits:** `3d6f745` (T-034: the leave guard, the two nits and 4a item 5's two token changes, all in `CategoryProductsManager.tsx`), `82067bd` (T-020) and `40d4424` (fix: the LEAVE_WHILE_SAVING words now cover Sign Out).
  - **What changed:** while any product shows "Saving…", closing or reloading the tab asks the browser's leave question, and an in-app link or Sign Out asks first (LEAVE_WHILE_SAVING). Cancel stays on the page; OK leaves, and the queued save still goes out, except after Sign Out, where a waiting follow-up runs signed out and fails unseen (an accepted gap, so the words say the change "may not be saved"). A row shows "Saving…" ahead of "Deleting…", and the notice says "leave a field you've edited". The nine save-queue functions are byte-identical to `main`.
  - **Reviews** (lean protocol):
    - `code-reviewer`, with light QA: SHIP, with five yellow notes. Note 1 (Sign Out) led to the copy fix `40d4424`, re-checked SHIP. Its 6 added checks and 3 mutants became the guard evidence, and the four conditions for skipping the security review hold.
    - `design-reviewer`: SHIP, with no change. Both nits kept word for word, and the original LEAVE_WHILE_SAVING approved; the orchestrator later widened it to cover Sign Out, on `code-reviewer`'s note 1, and design approved the new words (DECISIONS 2026-10-07). Every non-disabled state measures at least 7.18:1 on real backgrounds (`docs/qa-evidence/T-020/contrast-log.md`).
    - No `security-reviewer`: the recorded 4a–4c exception (DECISIONS 2026-10-06), with `code-reviewer` checking its four conditions.
  - **NOT VISUALLY VERIFIED:** the live admin (no agent signs in) and the two browser dialogs themselves; their words are checked by the harness.
  - **Follow-ups:** under "Follow-ups found in Wave 4a".
  **Wave 4 binding contract, covering T-034, T-020, T-027, T-011 and T-030** (`architect-reviewer`, 2026-10-06: APPROVE; folded verbatim on 2026-10-07, so no second `/architect-review` is needed). It's split into **4a** (T-034, T-020), **4b** (T-027), **4c** (T-011) and **4d** (T-030), each with its own review stage. There's no SQL, database object or new dependency, so there's no HARD STOP. Where older AC conflicts with this contract, the contract wins. The facts below also ground the Wave 5 contract (under T-008).

  **Verdict: both waves APPROVE, under the two binding contracts below.**
  - Neither wave needs SQL, a migration, a database object or a new dependency, so neither has a HARD STOP.
  - Where older ticket wording conflicts with a contract, the contract wins.
  - Source was read at `main` `30edcb6`, plus the Wave 2 contract on `wave-2a-write-path` and the Wave 3 draft.
  - The only network checks were read-only HEAD requests to production (no cookies) and public DNS lookups.

  **Facts behind the rulings:**
  - **What production sends today:**
    - `www` sends only HSTS `max-age=63072000` and `x-powered-by`.
    - Both bare domains (no `www`) are redirects handled by Vercel itself (307 and 308) before Next runs, so `next.config` headers never reach them.
    - So `includeSubDomains` sent from `www` covers only subdomains of `www.*`. None exist; mail is Namecheap forwarding.
  - **Why a script CSP is hard here:**
    - The middleware already runs on every page. A nonce would mean editing the login gate's `updateSession`.
    - Next's inline scripts, server-rendered `style=` attributes and the Marquee's `<style>` all need nonces or `'unsafe-inline'`.
    - Wave 2 allows any `https:` image host, so `img-src` would have to allow all of `https:` anyway.
  - **Why not Report-Only:** there's no reporting endpoint, and Chrome warns on every page load for a Report-Only policy without `report-uri`.
  - **How leaving a page works:** in the App Router, a `<Link>` click never fires `beforeunload`, and same-page Back/Forward can't be cancelled.
  - **Contrast, measured from the token hex values:**

    | Pair | Ratio | AA (4.5:1) |
    |---|---|---|
    | `foreground` on `primary` | 7.18:1 | passes |
    | light text on `secondary` (white / `foreground`) | 4.47 / 4.23:1 | fails; this is the Header "Connect" and mobile-menu button hover today |
    | `accent` on `background` | 7.69:1 | passes |
    | `accent` on `surface` | 9.10:1 | passes |
    | `accent/70` on `background` | about 4.4:1 | fails |
    | `FormStatusMessage` (the public forms' success line) | 2.2:1 | fails |

  - **A focus bug:** `SeedDefaultsPanel` defines `Checkbox` inside render, so every toggle remounts it and keyboard focus is lost.
  - **Motion still running on reduced-motion settings:** 26 hover transforms and 2 infinite animations in 18 public files aren't gated. All three videos are local autoplay loops.

  **Scope:**
  - Code plus DESIGN.md entries that record existing values only.
  - No server file, Server Action, payload or save timing changes.
  - **Preconditions:** Wave 3b has merged, and each sub-wave builds on the previous merge. If either isn't true, stop.

  **4a: T-034 and T-020, plus every other Wave 4 change to `CategoryProductsManager.tsx`, so that file is opened once**

  1. **Leave guard (T-034).** It's private in `CategoryProductsManager.tsx`, with no new export.
     - It's on while any product's `SaveView.pending` is true. An effect adds the listeners only then and removes them afterwards.
     - **Leaving the page:** `beforeunload` (`preventDefault` plus `returnValue = ""`) covers closing the tab, reloading, typing a URL, and hard navigations.
     - **In-app links and forms** use capture-phase listeners on `window`:
       - a `click` on a same-origin `<a href>` counts when it's a plain click or Enter, with no modifier keys, no `target` or `download`, and a URL that differs from the current one ignoring the hash;
       - every `submit` counts (today only Sign Out);
       - either one asks `confirm(LEAVE_WHILE_SAVING)`, a private constant whose words design-review sets.
       - **Cancel:** `preventDefault()` plus `stopPropagation()`.
       - **OK:** nothing. The queue keeps sending, because T-016's queue has no "still mounted" check.
     - **Accepted gaps:**
       - Back/Forward within the same page isn't covered.
       - After a real unload, a save that was still waiting can't be sent. That's what the prompt protects.
       - No `sendBeacon`, `keepalive` or flush on unload.
     - **Must stay byte-identical:** `SaveQueue`, `changedFields`, `queueFor`, `send`, `runSave`, `settle`, `requestSave`, `commitField` and `retrySave`, plus T-016's invariants 1–5.
  2. **T-034's two nits:**
     - the label becomes `pending ? "Saving…" : "Deleting…"`;
     - the notice changes "click away from a field" to "leave a field". Design-review may tune it.
  3. **One treatment for green-filled buttons (T-020):**
     - **The rule:**
       - text on solid `bg-primary` is `text-foreground` in every state except disabled;
       - light text never sits on `secondary`;
       - outline or transparent states use `text-accent` or `text-foreground`;
       - the fill colour doesn't change, and there's no new token.
     - **Sites:**
       - the ticket's 8;
       - `globals.css` `::selection` (the same colour pair, written as raw hex);
       - two hovers found while scoping: Header "Connect" and the mobile-menu button.
  4. **`SubmitButton`:** classes only. Wave 3a's opt-in `pending` prop and the unconditional `useFormStatus()` stay as they are.
  5. **`CategoryProductsManager` also gets two token changes here:**
     - its 2 `hover:text-primary` become `hover:text-accent` (T-027's rule);
     - `text-[11px]` becomes `text-xs` (T-011's rule).

  **4b: T-027**

  **4b additions, 2026-10-07** (orchestrator, on `design-reviewer`'s Wave 4a findings; DECISIONS 2026-10-07). Class tokens only; the files join 4b's Touches list.
  - **F2:** apply item 3's rule to the strings that still put `text-white` (mostly `hover:text-white`) on a solid `bg-primary`: they become `text-foreground`. `code-reviewer` found 12: `CareersClient.tsx:105,275`, `ReportsClient.tsx:159,352`, `JobAccordion.tsx:109`, `(website)/page.tsx:114`, `AboutSection.tsx:54`, `BusinessPreviewSection.tsx:39`, `MediaPreviewSection.tsx:141`, `SustainabilityPreviewSection.tsx:47,66` and `ContactSection.tsx:40` (line numbers at `82067bd`). Re-grep; `design-reviewer` counted 11 strings in 9 files.
  - **F4:** measure the `text-black/50` caption at `text-[0.65rem]` (`sustainability/page.tsx`, about line 107) on its real tile. If it's under 4.5:1, raise it with semantic tokens, and replace the magic size with `text-xs` unless design rules otherwise.

  6. **The rule:** after 4b, no `text-primary` (any opacity, any state prefix) colours text or a control anywhere in `src/`.
     - **Default replacement:** `text-accent` at full opacity. Any opacity variant must be re-measured.
     - **Allowed to stay:** `aria-hidden` decorative graphics that aren't controls, and the mobile-menu numbers, which T-029 hides from screen readers.
     - The builder prints whatever remains, with a reason for each.
  7. **Headings:** every `h1`–`h4` with `text-white` becomes `text-foreground`, public and admin. That includes Wave 3a's media components, the Sync panel, the dashboard and login.
  8. **Two low-contrast label sets reach at least 4.5:1:** the sidebar group labels (`white/25`) and the dashboard's three stat labels (`white/40`).
  9. **`scrim`, recorded:** `theme.extend.backgroundImage.scrim` equals `CategoryCardGrid`'s current gradient, and `CategoryCardGrid` uses `bg-scrim`. It must be pixel-identical.
  10. **DESIGN.md §2, recording only:**
      - the scrim;
      - the status colours already shipped, with their ratios (red-400, amber-300 on amber-400/10, accent);
      - the item 3 rule;
      - the known-failures list, updated.

      **No `warning` token this run.**

  **4c: T-011**

  **4c additions, 2026-10-07** (orchestrator, on Wave 4b's reviews; DECISIONS 2026-10-07):
  - **The stale comment** at `SettingsForm.tsx:70-71` becomes: "The tag is `text-accent`, the same as SettingsHeader's (T-027): `text-primary` as text on the dark admin fails AA (docs/DESIGN.md §2)."
  - **`SeedDefaultsPanel.tsx:78`:** the native checkbox's `accent-primary` becomes `accent-accent`, because `primary` on the dark admin is under 3:1 for a control. The same fix in `CareersClient` and `ReportsClient` belongs to T-036.

  11. **Accessible names:**
      - **Where:** every control in `SettingsForm`'s shared parts, `ImageUploadField`, `SeedDefaultsPanel` and `/admin/login`.
      - **The rule:** each has a programmatic name containing its visible label (`useId` plus `htmlFor`/`id`).
      - **`ObjectListEditor` ids:** the editor's id, plus Wave 3b's row key, plus the field key. Never an item field.
      - **No orphan `<label>`:** a list heading labels its group (`role="group"` plus `aria-labelledby`).
      - **Login:** `name`s, `loginAction` and `useActionState` stay unchanged.
  12. **Icon-only buttons:**
      - Move/Remove names are unique on the page and carry the row number, plus its title when it isn't blank;
      - a chip's remove button reads "Remove <chip>";
      - the `StatsList`/`ListEditor` remove buttons get names.
  13. **Labels and text size:** labels and hints reach at least 4.5:1 on their real panel, measured. `text-[10px]`/`text-[11px]` become `text-xs`.
  14. **Focus:**
      - every control in these files gets the house focus ring (`focus-visible:ring-2 ring-accent`);
      - the hidden file input shows its ring on the drop zone, through `has-[:focus-visible]:`.
  15. **Saving looks like saving:** controls inside a disabled fieldset show disabled styles; the drop zone uses `has-[:disabled]:`.
  16. **Small fixes:**
      - the ChipList input gets `min-w-0`;
      - in `SeedDefaultsPanel`, the checkbox gets `shrink-0`;
      - `Checkbox` is hoisted out of render, so it no longer remounts;
      - the result's live region is always mounted.
  17. **`SettingsHeader` focus:** if Save had focus when a save started and focus is on `<body>` when it ends, focus returns to Save. `disabled` stays, so there's no new double-submit path.
  18. **Unchanged:** all of Wave 3's logic and `commitPathOnBlur`'s gated classes and behaviour.

  **4d: T-030 and the shared menu hook**

  **4d additions, 2026-10-07** (orchestrator, on Wave 4b's design review; DECISIONS 2026-10-07). Class tokens only, in the files 4d already rewrites (`layout.tsx`, `AdminNav.tsx`):
  - the nav links rise from `text-white/50` to `text-white/70`, so the `white/50` group labels stay below them;
  - `text-[0.6rem]` (the group labels and "Secure Session") becomes `text-xs`;
  - the layout's `bg-[#0a0a0a]` becomes `bg-surface`, which is the same colour.

  19. **The hook:** `useOverlayMenu({ open, onClose, toggleRef, panelRef, inertTargets, closeWhen })` in a new `src/lib/use-overlay-menu.ts`.
      - **On open:** focus goes to the panel's first focusable element.
      - **While open:**
        - Escape calls `onClose()`;
        - Tab and Shift+Tab wrap within the toggle plus the panel;
        - the `inertTargets` elements get `inert` (only ones the hook added are removed on close);
        - `closeWhen` (a media query) closes the menu once it matches.
      - **On close:** if focus is inside the panel or on `<body>`, it moves to the toggle.
      - **Limits:** no timers, no `aria-modal`, no dependency, safe under StrictMode.
      - **The reuse ruling:** one behaviour with two looks. T-029 reuses it unchanged.
  20. **The admin layout:**
      - it stays a server component and keeps `logoutAction`; it passes the Sign Out form to the menu as a ReactNode prop;
      - a new `src/app/admin/(dashboard)/AdminNav.tsx` (`"use client"`) holds `navItems` unchanged;
      - `AdminNav` imports no Server Action, nothing from `@/lib/supabase/*` and nothing from `settings-read`.
  21. **Current page:** `aria-current="page"` plus a visible current state that doesn't rely on colour alone.
      - `/admin` matches exactly;
      - every other link matches its own path or any path under it.
  22. **Below 768 px:**
      - a top bar with a "Menu" toggle (`aria-expanded`, plus `aria-controls` pointing at an element that's always in the page);
      - the menu lists every sidebar link, in the same groups, plus Sign Out;
      - it uses the hook with `inertTargets = #admin-main` and `closeWhen: "(min-width: 768px)"`;
      - a link click closes it, and body scroll is locked while it's open;
      - no sideways scroll at 360 px.

  **Touches:**
  - **4a:**
    - `CategoryProductsManager.tsx` and `SubmitButton.tsx`;
    - `SettingsForm.tsx` (only the Save button's classes);
    - `admin/login/page.tsx` and `submissions/page.tsx` (tab classes);
    - `not-found.tsx` and `sustainability/page.tsx`;
    - `src/app/layout.tsx` and `globals.css`;
    - `Header.tsx` and `MobileOverlayMenu.tsx` (button classes).
  - **4b:**
    - class tokens in the files item 6's grep and item 7 find;
    - `CategoryCardGrid.tsx` and `tailwind.config.ts`;
    - `docs/DESIGN.md`.
  - **4c:**
    - `SettingsForm.tsx`, `ImageUploadField.tsx` and `SeedDefaultsPanel.tsx`;
    - `admin/login/page.tsx`;
    - `ProductsClient.tsx`/`BusinessClient.tsx`, only if the shared parts can't carry the disabled look.
  - **4d:** the new hook, the new `AdminNav.tsx`, and `admin/(dashboard)/layout.tsx`.

  **Unchanged (0-byte):**
  - **Server side:**
    - every `src/app/actions/*` file and `action-errors.ts`;
    - `site-content.ts`, `settings-read.ts`, `upload-limits.ts`, `nav.ts` and `category-draft.ts`;
    - `middleware.ts` and `src/lib/supabase/*`;
    - `next.config.ts`, `sitemap.ts`, `robots.ts` and `api/*`.
  - **Page reads:** every server page's database reads; admin `page.tsx` files may change class tokens only.
  - **Components:** `HomepageSettingsClient`, `ProductGrid`, `ProductCard` and `products/page.tsx`.
  - **Everything else:** `db/`, `supabase-schema.sql`, `package.json` and the lockfile.

  **Security sign-offs:**
  - **Voided by sha256:** `products/[category]/page.tsx` (Wave 1's `bc243115…`) at 4b. Also `ImportBuiltInGallery.tsx`, if Wave 3a's sign-off binds it. Both are re-bound at 5a's security pass.
  - **Invariants reopened (code-reviewer checks them):**
    - T-016's invariants 1–5;
    - Wave 3's restated invariant 4;
    - T-026's 7 client invariants (`SettingsForm`, `SeedDefaultsPanel`, `BusinessClient`, `ProductsClient`, the admin layout);
    - T-025's catalog invariants.

  **Verification (targeted):**
  - **Every commit:**
    - `tsc` and `build`;
    - the diff only touches files on the Touches list, and the unchanged files are 0-byte;
    - rule greps for items 3, 6, 13 and 11.
  - **4a:**
    - re-run T-016's harness; the send sequence is byte-identical;
    - **one guard harness** on a production bundle, with a save that never finishes:
      - reload shows the browser's prompt;
      - a link click shows the confirm;
      - Cancel leaves the URL unchanged;
      - OK navigates, and the queued follow-up is still sent;
      - with nothing pending, there's no prompt;
    - the changed button states at 360 and 1440 px.
  - **4b:**
    - one contrast sample per changed label type, at 360 and 1440 px;
    - public HTML differs from the baseline only in class tokens;
    - the scrim screenshot differs by 0 pixels.
  - **4c:**
    - the Chrome DevTools accessibility tree on stand-in renders of Products, Business and the Sync panel, plus the real `/admin/login`: 0 unnamed controls;
    - keyboard: Tab through one row, Space on a Sync checkbox, Enter on Save;
    - no sideways scroll at 360 px;
    - Wave 3b's harness re-run, with payloads equal to `main`'s.
  - **4d:** a stand-in layout at 360 and 1440 px:
    - open with the keyboard;
    - Tab wraps;
    - Escape returns focus to the toggle;
    - `inert` is set while open;
    - `aria-current` is correct;
    - resizing to 768 px closes it.

  **Re-review triggers:**
  - any SQL, database object or dependency, including a focus-trap or accessibility package;
  - T-034 changing what or when the queue sends, calling an action, flushing on unload, using `popstate`/Navigation API blocking, or widening the guard;
  - a new colour token (other than `scrim`), a fill colour change, or light text on `secondary`;
  - changing `SubmitButton`'s `pending`/`useFormStatus` behaviour;
  - touching Wave 3's logic or `commitPathOnBlur`'s gating;
  - ids built from item fields;
  - the admin layout becoming a client component, or a client file importing an action or Supabase;
  - any change to nav links, their order or labels;
  - the hook doing more than item 19;
  - DESIGN.md edits beyond recording;
  - an edit to an unchanged file;
  - a sub-wave running past its cut.

  **Split and reviewers:**

  | Sub-wave | Ticket | Time | Pre-agreed cut | Reviewers |
  |---|---|---|---|---|
  | 4a | T-034, T-020 | about 3.5 h | — | code-reviewer, design-reviewer |
  | 4b | T-027 | about 4 h | items 9–10 move to 4b-ii | code-reviewer, design-reviewer |
  | 4c | T-011 | about 4 h | item 16 and login move to 4c-ii | code-reviewer, design-reviewer |
  | 4d | T-030 | about 3 h | — | code-reviewer, design-reviewer, security-reviewer |

  - **Security-reviewer at 4d only:** the admin shell renders Sign Out.
  - **4a–4c skip security-review:** their admin diffs are classes, ARIA, copy and a client-side guard. Instead, code-reviewer checks: no new import, no changed handler, and the invariants above.
  - That skip is an exception to WORKFLOW §3's `src/app/admin/**` rule, so it's recorded in DECISIONS (2026-10-06, "Wave 4 split and lean reviews").
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

**Follow-ups found in Wave 1 (2026-10-06)**, for the backlog. None blocks the run.
- **QA I2:** a title containing U+202E can scramble the refusal messages that quote it, and `main`'s name-clash messages already do this. Wrap quoted titles in FSI/PDI (U+2068/U+2069). Admin-only.
- **QA I3:** `/career` (1) and `/life-at-fashion-asia` (17) render public row UUIDs (job and media ids). They come from anon-readable tables, so it's not a leak, but it's outside T-025's catalog "0 UUIDs" rule. Look at it with T-019 (Wave 3).
- **`code-reviewer`:** the two delete-guard strings in `settings-actions.ts` are inline. Move them into a private builder the next time the file opens (Wave 2a does).
- **`design-reviewer`, extending T-011:**
  - the Sync result's live region appears only when there's a result; keep it always present;
  - the What We Do checkbox needs `shrink-0`;
  - `ImageUploadField` uses `text-[10px]`/`text-[11px]`;
  - the frozen editors don't look frozen.
- **`design-reviewer`, extending T-027:** the Sync panel's `text-white` heading and `text-primary` code text, and the dashboard's `text-white` h1.
- **`design-reviewer`, DESIGN.md §2:** add a `warning` token for the amber advisory color (13.7:1), alongside T-027's `scrim`.
- **`security-reviewer`:** `settings-read.ts` now has three importers. If its `next/headers` chain is ever removed, add `import "server-only"`.

- [ ] **T-035** — Admin list reads must not show a failed read as an empty list [app:admin]
  AC:
  - `getJobs`, `getReports` and `getLeaders` tell a failed read apart from an empty result (for example `{ ok: true, data } | { ok: false }`, like T-016's `getAllCategoryProducts`).
  - Their admin pages show a `role="alert"` "couldn't load, refresh" message and withhold their create buttons after a failed read, so staff can't re-enter duplicates.
  - The public pages that read the same data keep failing open (the T-005 / T-016 visitor ruling).
  Source: Wave 2 premortem, 2026-10-06.
  Sequence: `architect-reviewer` (the result shape of three `"use server"` reads) → `/build` → `/design-review` → `/security-review` → `/qa` → `code-reviewer` → merge. Backlog.

- [ ] **T-039** — Argument-shape guards on the non-product admin writes [app:admin][sec]
  AC:
  - **The writes covered:** `createReport`, `updateReport`, `createLeader`, `updateLeader`, `createJob`, `updateJob` and `uploadFile` return `{ ok: false }` with fixed wording, instead of throwing, when the argument isn't a `FormData`.
  - **`uploadFile`:** it accepts only the `reports` bucket (or an explicit server-side list), never a caller-chosen bucket.
  - **`updateSettings`:** it refuses a value that isn't a plain object for any allowed key.
  - **Category titles:** `resolveCategoriesForSave` refuses a non-text title, instead of dropping the row (QA Wave 2a INFO-3).
  - **Order:** signed out still answers SESSION_EXPIRED first. Wave 2a's harness `args-known-gaps-final.json` is the spec; it records 12 known-gap cases that must flip.
  Source: SEC-MED-16 (Medium; security Wave 2a), from Wave 2a's premortem MUST-ADD 10, which DECISIONS 2026-10-06 narrowed to the product writes.
  Sequence: `/build` → `/security-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-036** — Names, focus rings and AA labels on the hand-built admin forms [app:admin][design]
  AC:
  - The Careers, Reports, Who We Are leaders and Contact socials forms get what Wave 4c (T-011) gives the shared admin parts: every control has a programmatic name containing its visible label, the house focus ring (`focus-visible:ring-2 ring-accent`), and labels and hints at 4.5:1 or more on their real panel.
  - No change to what any form sends, its handlers or its Server Actions.
  Source: the Wave 4 architect review, 2026-10-06 (outside T-011's shared-component scope).
  - **Also (Wave 4d `code-reviewer` Y3):** the Careers and Reports modals (`CareersClient.tsx:183`, `ReportsClient.tsx:246`) are `fixed inset-0 z-50` inside `#admin-main`, with no Escape, focus handling or `role="dialog"`. Below 768 px a keyboard user can reach the Menu toggle under a modal's backdrop. Give them dialog semantics, Escape and focus handling.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-037** — A pause control for the marquee and the three looping videos [app:site][design]
  AC:
  - Visitors can pause and resume the homepage marquee and each of the three autoplaying videos (WCAG 2.2.2 Pause, Stop, Hide; Level A).
  - The control is keyboard-reachable, has a name, and passes AA on its background.
  - Visitors with reduced motion turned on already get still content through T-028; this ticket is for everyone else.
  Source: the Wave 5 architect review, 2026-10-06. Owner call Q13 took its default: not built in the autonomous run.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-038** — A script Content-Security-Policy, with a reporting decision [app:site][sec]
  AC:
  - Decide the script and style policy (nonces, or hashes and allow-lists) and where violation reports go (an endpoint, or none) before any code.
  - A nonce has to come from the middleware, so this edits the login gate's `updateSession`; it needs its own premortem.
  - A script-policy mistake breaks production, so the plan must say how it's proven before release.
  Source: the Wave 5 architect review, 2026-10-06. A nonce CSP and Report-Only were both rejected for T-008 in this run.
  Sequence: `premortem-planner` → `architect-reviewer` → `/build` → `/security-review` → `/qa` → `code-reviewer` → merge. Backlog.

- [ ] **T-040** — Give every public control the house focus ring [app:site][design]
  AC:
  - Every public control not covered by T-029 (the header and menu links) shows `focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background` on keyboard focus, instead of the browser's default outline. That includes the public forms' submit button, the 404 button and the report buttons.
  - Admin controls outside T-011's shared parts and T-036's forms use the same string ending in `focus-visible:ring-offset-surface`.
  - Wherever `transition-all` is present, add `focus-visible:transition-none`, so the ring appears at once (DESIGN.md §4).
  - **Known sites** (Wave 4b's design review): `(website)/page.tsx:114`, `AboutSection.tsx:54`, `BusinessPreviewSection.tsx:39`, `ContactSection.tsx:40`, `MediaPreviewSection.tsx:141`, `SustainabilityPreviewSection.tsx:47,66`, `JobAccordion.tsx:109` and its toggle, "Apply for this Position", and `SubmitButton`. Match the ring offset to each section's background (`-background`, `-surface` or `-black`).
  - No change to layout, copy or colour at rest.
  Source: `design-reviewer`, Wave 4a F1 and Wave 4b, 2026-10-07 (a banned default that predates the run).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-041** — Sweep the remaining banned defaults in components [app:site][app:admin][design]
  AC:
  - **Plain white text:** the 45 remaining plain `text-white` (where `foreground` is meant) become `text-foreground`, unless design records why not.
  - **Magic text sizes:** the 38 remaining `text-[…]` sizes become type-scale steps (`text-xs` and up), unless design records why not.
  - **Raw hex:** none in components, for example the dashboard status dot's `bg-[#016138]` becomes `bg-primary`.
  - **`FormStatusMessage`:** uses `role={state.ok ? "status" : "alert"}`, so errors are announced (DESIGN.md §6).
  - **`JobAccordion`'s toggle** gets `type="button"`.
  - No layout or copy change, and AA holds on every changed pair.
  Source: Wave 4b's reviews, 2026-10-07 (DESIGN.md §7).
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-042** — Make the public scroll locks hold, and never leave the preloader curtain up [app:site][design]
  AC:
  - **One lock:** a single ref-counted helper in `src/lib` (for example `lockScroll(): () => void`) is the only code that sets or clears the page's overflow. It locks `<html>`, the element the page scrolls by here (`globals.css` clips `<html>`). The preloader and `MobileOverlayMenu` both use it, and the menu takes a lock only while it's open and never clears one on mount.
  - **Design decides first** whether the preloader should really lock. A lock that holds would block scrolling for about 2.3 s on every first load, which production has never done.
  - **`finishLoading`** stops depending on the wall clock: drop `minTime` and `remaining` (the 1500 ms timer already guarantees the minimum), or use `performance.now()`.
  - **No JavaScript:** a page whose scripts don't run (JavaScript off, or a chunk that fails to load) is never left behind the curtain, for example with a `<noscript>` style or a CSS fail-safe.
  - Motion without reduced-motion settings, `finishLoading`'s 800 ms exit and `HeroSection` stay as they are.
  Source: Wave 5a's builder and `code-reviewer`, 2026-10-08. It's pre-existing: on `main` the preloader's lock is cleared 1 ms after it's set (`MobileOverlayMenu.tsx:15-21`). The Wave 5 contract freezes both effects, so this is its own ticket.
  Sequence: `architect-reviewer` (it reopens two frozen effects and the preloader's JSX) → `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-043** — Lighten the homepage hero video [app:site][perf]
  AC:
  - `public/videos/hero.mp4` (28.4 MB today) gets a compressed rendition at the same look, and a smaller source for phones if that helps (for example `<source media>`), with the poster unchanged.
  - The hero's markup, `AutoplayVideo`'s reduced-motion behaviour and the AA overlay stay as they are.
  Source: `design-reviewer`, Wave 5b, 2026-10-08.
  Sequence: `/build` → `/design-review` → `code-reviewer` → merge. Backlog.

- [ ] **T-044** — Bump Next.js to 16.4.3 and clear the tooling advisories [app:site][sec]
  **Re-scoped 2026-10-25 (SEC-HIGH-6):** 16.3.8 is no longer enough. `next` 16.3.6 is also in range of GHSA-2464-fhr4-w9xw (critical: image-optimizer RCE with SVGs), GHSA-673q-mjm6-r5xr (critical: `use cache`, unused here) and GHSA-p3m5-59mp-jv5r (high: Server Actions DoS), all fixed from 16.4.1. The target is now `next` and `eslint-config-next` **16.4.3** (a minor bump), and it ships in the same release as T-045. The AC below still applies, with 16.4.3 in place of 16.3.8; also: `agentRules: false` and `logging.serverFunctions: false` stay in `next.config.ts` and still take effect, and 16.4.0–16.4.3's release notes are checked for breaking changes before the bump.
  AC (as filed 2026-10-11):
  - `next` goes from 16.3.6 to 16.3.8 (patch only), which fixes GHSA-cjq9-62q9-8jv4, mcj8-r9mp-w47p, 4jqv-mc3x-m676, 3w37-wq28-93x7, f87g-xv8r-7p7x and 39w2-rjm5-chcv. None applies to this site as deployed (no `images.remotePatterns`, Vercel-hosted, no catch-all, no `use cache`/draftMode, static icons), so this is hygiene, not an incident.
  - `npm audit fix` (no `--force`) for the build-tooling advisories (tailwindcss's chokidar/fast-glob/micromatch, eslint-config-next, brace-expansion, browserslist, flatted, js-yaml, picomatch, source-map-js), with no major-version jumps.
  - The gates pass, a production-build smoke test passes (Wave 5a's header and preloader checks, the public pages), and `npm audit --omit=dev` shows no high items left that can be fixed.
  - `npm run dev` binds to this computer only (`next dev -H 127.0.0.1`), because the dev server talks to the live database (SEC-MED-17's note).
  Source: `/ship` preflight, 2026-10-11; SECURITY.md SEC-MED-17.
  Sequence: `/build` → `/security-review` → `code-reviewer` → merge, then deploy on the owner's "deploy".

- [ ] **T-045** — Product preview pop-up with up to 6 photos, layout samples, and no banner on /products [app:site][app:admin][db][design]
  Owner request 2026-10-25 ("urgent… this needs to be live"). Owner answers: remove the big banner on /products; a pop-up preview; up to 6 photos per product; deploy when ready.
  AC:
  - **/products banner:** the "OUR RANGE / Products" `PageHeader` is gone, so the page starts at "Browse by Category". That heading becomes the page's only `h1` (same look) and clears the fixed header. Metadata and everything else are unchanged.
  - **Schema (`db/migrations/0002_product-gallery.sql`, HARD STOP until the owner applies it):** `products.gallery text[] not null default '{}'`, holding the extra photos after the main `image`. The app limit is `MAX_PRODUCT_GALLERY_PHOTOS = 5` in `src/lib/site-content.ts` (6 photos in all). Until the column exists, code treats a missing `gallery` as empty, because the reads already use `select("*")`.
  - **Server:** `updateCategoryProduct`'s patch may carry `gallery`, an array of strings.
    - Each entry is trimmed and must pass `isAllowedImageUrl`. At most 5 entries; anything else is refused with fixed wording, and nothing is written.
    - It's written only when sent, like the other fields. `getUser()` stays first, and `createCategoryProduct` is unchanged.
  - **Admin (`/admin/products`):** each product row gets "More photos (up to 5)". Staff can add a photo (the same `ImageUploadField` and upload limits), remove one, or move one up or down. Each change saves through that product's existing save queue, with the same Saving/Saved states. The other fields behave exactly as before.
  - **Public:** a product card on `/products` and on each category page opens a pop-up preview (a native `<dialog>`).
    - **It shows** a large photo, small thumbnails to switch between the main photo and the gallery, the name and the description. There's nothing else: no price, cart or links.
    - **Closing:** a Close button, Escape or a backdrop click closes it, and focus returns to the card.
    - **Keyboard and screen readers:** both are supported; contrast meets AA; it's usable at 360 px; reduced motion is respected.
    - **One photo only:** no thumbnails are shown.
    - **No product ids:** none appear in the HTML or props (the T-025 rule); only photo addresses do.
  - **Layout samples:** the pop-up supports numbered layouts (1–4). The live one is chosen by one constant. A hidden samples page shows each numbered layout with sample photos, so the client can pick a number. It's `noindex`, and not in the nav or the sitemap.
  Sequence: `architect-reviewer` (migration + contract) → owner applies SQL → `/build` → `code-reviewer` + `security-reviewer` + `design-reviewer` → merge → `/ship` (owner pre-authorised "deploy when ready").

**Follow-ups found in Wave 2b (2026-10-06)**, for the backlog:
- **`code-reviewer` Y4, watch only:** `getAllCategoryProducts` reads every product in one query with no paging, so Supabase's default 1,000-row API cap applies. Past that, the admin's lists would be cut short, and reorders there would be refused with REORDER_STALE. That doesn't matter at today's catalog size.
- **`code-reviewer` Y1, test only:** assert that the reorder's refresh comes after its last write. Today's `return await` is correct, but a "clean-up" that drops the `await` would pass the current suite.

**Follow-ups found in Wave 3a (2026-10-07)**, for the backlog:
- **`code-reviewer`:**
  - an insert whose reply is lost still removes its file (skip the removal on `status === 0`, or check first for a row with that `url`);
  - tests are missing for the throwing-insert branch, the VP8L alpha bit, and a frame header 1 byte past the end;
  - a submit before the page hydrates sends a GET (an optional mount gate).
- **`design-reviewer`:**
  - a "Publishing…" status line (needs an architect ruling: it's a new string);
  - show the delete button on touch below `md`;
  - a chevron on the category select;
  - "Image URL (Fallback if no upload)" → "Or paste an image address";
  - heading order on `/admin/media`;
  - `ring-accent` on the "Published Assets" heading's focus;
  - T-027 should also cover `media/page.tsx:18` and `:51`.
- **`security-reviewer`:**
  - **SEC-INFO-46:** `isAllowedImageUrl` accepts `"<>()` inside an https address. It's harmless while every sink is React-escaped; ban them before adding any CSS or raw-HTML sink.
  - **SEC-INFO-47:** the clean-up can remove a file named only in an unsaved draft. That's accepted.

**Follow-ups found in Wave 3b (2026-10-07)**, for the backlog:
- **`code-reviewer`:**
  - **For T-034:** UPLOAD_IN_PROGRESS stays up after the upload finishes, until the next Save click (DECISIONS 2026-10-07). Decide whether it should clear on its own.
  - **For T-011:** `ObjectListEditor` finds its focus targets with `:scope > div:first-child button` (`SettingsForm.tsx:269`), so they depend on the row header's DOM order. If T-011 changes those buttons, re-run the focus scenarios (S13).
  - **Untested, accepted:** the same object listed twice (the duplicate-key guard, mutant R5). No page can produce that today.
- **`security-reviewer`, no finding:** an overtaken pick still uploads its file, which then sits unused in the public bucket. It's the same kind of orphan an abandoned pick leaves on `main`, and it's signed-in only.

**Follow-ups found in Wave 4a (2026-10-07)**, for the backlog:
- **`design-reviewer`:**
  - **F1, now T-040:** no public control has the house focus ring; they show the browser's default outline. 4c (T-011) rings the shared admin parts, 5c (T-029) the header and menu links, and T-036 the hand-built admin forms. T-040 covers the rest.
  - **F2 and F4:** folded into 4b (see "4b additions" in the Wave 4 contract).
  - **F3:** done. The T-020 contrast log is `docs/qa-evidence/T-020/contrast-log.md`.
- **`code-reviewer`:**
  - **Accepted gap (note 1):** OK on Sign Out while a follow-up save is waiting very likely loses that save. Next runs Server Actions one at a time, so the follow-up runs after the logout, signed out, and fails unseen. `main` loses it too, with no warning. The words now say the change "may not be saved", and the owner's checklist has a row for it.
  - **Watch only:** `new URL(link.href)` would throw on an href that won't parse, and `target="_self"` links are skipped because the contract says "no target". No admin link has either today.
- **The builder's note:** a plain `<a href>` to another page in the admin would ask twice (the guard's confirm, then the browser's leave question). No such link exists today, because the admin shell uses only `<Link>` and the Sign Out form. If T-030's `AdminNav` adds one, give it a `<Link>`.

**Follow-ups found in Wave 4b (2026-10-07)**, for the backlog:
- **Folded into later sub-waves:** 4c (the stale comment, the checkbox accent), 4d (nav link opacity, `text-xs`, `bg-surface`) and 5b (the hero overlay). See each sub-wave's additions in the Wave 4 and Wave 5 contracts.
- **New tickets:** T-041 (the remaining banned defaults). T-040 gains Wave 4b's list of CTAs that still show the browser's default focus ring.
- **`code-reviewer`, accepted:** after F4's `text-xs`, the "RMG Sustainability Council" caption runs 8 px into its white tile's padding at 360 px (11 px on `main`; 18 px at 320 px), and OEKO-TEX wraps to 3 lines. It stays inside the tile and nothing scrolls sideways; design approved F4.
- **`code-reviewer`, for T-036:** `accent-primary` on the native checkboxes in `CareersClient.tsx:260` and `ReportsClient.tsx:338`.

**Follow-ups found in Wave 4c (2026-10-07)**, for the backlog:
- **`design-reviewer`, optional, for T-041:**
  - a row's Remove dims to `disabled:opacity-20` while saving; `disabled:opacity-50` would match everything else;
  - at 360 px the drop zone's hint wraps to about 14 lines; `flex-col items-start sm:flex-row sm:items-center` on the zone would fix it;
  - in Windows High Contrast the drop zone's ring probably disappears; add `has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-transparent`;
  - the login error box uses `text-red-500` (about 5.2:1, which passes), while DESIGN.md §2's error colour is `text-red-400`.
- **`code-reviewer`, tests:** add a homepage stand-in to the 4c suite (0 unnamed controls; the Stats names unique), and an "always refocus" mutant for item 17.
- **Harness upkeep (scratchpad only):** T-016's harness needs `NOTICE_VARIANT=4a` since Wave 4a's notice copy, its path-box className pin predates 4c, and its mutation step's `ImageUploadField` anchor has been gone since Wave 3b. With current expectations it's 319/319.
- **The builder's process slip:** commit 2's first attempt was committed with the gate's exit codes hidden, on a tree that didn't compile, then amended before anything built on it. Builders must read exit codes, never just log tails.

**Follow-ups found in Wave 4d (2026-10-07)**, for the backlog:
- **For T-029 (Wave 5c), reusing the hook:** close the public menu on any route change too, with the same `menuPath` pattern (a 5c addition). The `<html>` scroll lock goes to T-042 instead, because 5c item 16 freezes the menu's body-scroll effect.
- **`security-reviewer`, SEC-INFO-48 (accepted):** the 12 admin route names are now in a public static chunk. It's route names only, and every path stays gated. The guardrail: nothing secret, user-specific or role-specific may go into `AdminNav` or `navItems`.
- **`code-reviewer` Y3:** the Careers and Reports modals, added to T-036.
- **`design-reviewer`, minor:** about 42 more `text-white` lines in the admin predate 4d (T-041's sweep).

**Follow-ups found in the Wave 5a premortem (2026-10-07)**, for the backlog:
- **`/reports` anchor:** the redirect goes to `/sustainability#reports`, but the preloader's `scrollTo(0,0)` undoes the jump, so visitors land at the top. (Its scroll lock never holds; see T-042.) This predates 5a, and `scrollTo` is frozen in this run.
- **The middleware matcher** (`src/middleware.ts:10`) doesn't skip `.mp4`, `.xml`, `.txt` or `.html`, so the session check runs on hero-video, sitemap and robots requests. A middleware change needs its own review.
- **Report PDFs:** if they ever move onto this site's own domain, re-test Chrome's PDF viewer under `object-src 'none'` and `X-Frame-Options`.
- **`public/layout-preview.html`** is publicly served (CLIENT_QUESTIONS Q15).

**Follow-ups found in Wave 5a (2026-10-08)**, for the backlog:
- **`code-reviewer`:**
  - **The comment at `next.config.ts:38`** says the CSP "has no fetch directive"; `object-src` is one. Change it to "its only fetch directive is object-src 'none', which blocks <object> and <embed> (the site has none), so it can't block any script, style, image, font, video or request" the next time the file opens (T-038 will), because any edit voids the security binding.
  - **For T-042:** the scroll-lock race, `finishLoading`'s wall-clock timing, and the curtain staying up with JavaScript off.
- **Redirects:** Next's built-in trailing-slash redirect (`/contact/`) also carries none of the six headers. Same ruling as the config redirects.

**Follow-ups found in Wave 5c (2026-10-08)**, for the backlog:
- **`code-reviewer`, for T-040:** the 122-character focus-ring string is defined in `Header.tsx` and `MobileOverlayMenu.tsx`, and inlined in 14 other files. T-040's sweep should export one constant from `src/lib` and import it everywhere.
- **`code-reviewer`, note only:** with reduced motion on, `transition-colors` shortens the header's colour fade from 300 ms to 150 ms. Nothing moves, so the 5c addition is met.
- **Not verified by agents:** real phones (does a tapped menu link show a ring?) and a real screen reader.

**Follow-ups found in Wave 5b (2026-10-08)**, for the backlog:
- **`design-reviewer`:**
  - **`hero.mp4` is 28.4 MB,** heavy on mobile. It needs a compressed rendition, and possibly a smaller mobile source (new T-043).
  - **For T-041, optional:** each line of the static marquee ends with a dot, which nudges it slightly off centre at 360 px. Add `motion-reduce:hidden` on the dot span (`MarqueeSection.tsx:22`).
- **`code-reviewer`:** the builder's harness lacked a preference-flip probe. The review's `rv.mjs` P1 now covers it, and any future motion work should run it.

**DEPLOYED 2026-10-11:** client `4c10234` / origin `318e73b` (the same files), live on both domains, with 0 failed live checks (LOG 2026-10-11). Sign-ups were confirmed OFF first. The one-time authorship rewrite is pushed. **Staff next:** Admin → Products → **Save categories** once, then add products.
- **Owner, before the next deploy (SEC-HIGH-2, still open):** in Supabase, review Authentication → Users and remove any account you don't recognise. Sign-ups were open until 2026-10-11, and every account is an admin.

**Autonomous run status (2026-10-08, kept for history): every agent-buildable ticket in Waves 1–5 is merged into local `main`; nothing is deployed.**
- **Production is still `e8eace1`** (2026-09-28). Local `main` holds T-006 through T-034 as listed in the waves above.
- **`/ship` needs two things from the owner:**
  - Supabase sign-ups OFF: SEC-HIGH-2 blocks the deploy, and they read ON live on 2026-10-08;
  - a new owner message containing "deploy" (CLAUDE.md law).
- **At `/ship`:**
  - PM13's live header assertions and the bare-domain STOP, plus PM14's rollback rule (revert and ship again, never Instant Rollback to `e8eace1`);
  - T-025's four checks and Wave 3a's gallery comparison;
  - `npm audit --omit=dev`, security's recommendation.
- **Still with the owner:** T-023 (the admin allowlist; LAW and SQL), T-031 (grants SQL), the CLIENT_QUESTIONS confirmations (Q01–Q15), rotating the GitHub token stored in plaintext in `.git/config`, and the optional owner checklist rows (O1, the admin's phone menu, the leave prompts).
- **Backlog filed during the run:** T-035 to T-043.

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
