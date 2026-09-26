# ROADMAP.md

Owner: `/pm`. Last updated: 2026-09-26.

Status: first `/pm` pass on this repo. No prior `ROADMAP.md` entries exist to amend. `docs/QA_REPORT.md` and `docs/SECURITY.md` do not exist yet, so there are no open 🔴/🟡 or SEC-CRIT/SEC-HIGH findings to convert ahead of feature work. `docs/MARKETING.md` does not exist, WORKFLOW §10 is inert, and no marketing-originated drafts (`SEO_REPORT.md`, `CRO_PLAN.md`, `ANALYTICS_SPEC.md`, `GROWTH_PLAN.md`, `docs/copy/`) exist to ticket this pass. `docs/DECISIONS.md` has no open Counters. Scope is exactly the three MVP features in `docs/VISION.md`; nothing from its Cut / Anti-Goals list is ticketed here — including the homepage "Business Preview" strip, which `VISION.md`'s Scope Ruling explicitly keeps as-is for this sprint.

## 📊 PM Sprint Plan — 2026-09-26
### Sprint 1: Ship the three MVP features from VISION.md — category detail pages, products-within-category admin management, and the image-size warning

- [ ] **T-001** — Design the products-within-category schema and author the migration
  - **Source:** direct — `docs/VISION.md` "Settled inputs carried into this VISION" + MVP Feature 2 (category attachment is a prerequisite for Features 1 and 2)
  - **Files:** `db/migrations/0001_products-within-category.sql` (new — first use of the `WORKFLOW.md` §1 migration convention), `supabase-schema.sql` (update the rolled-up reference snapshot to match), `docs/TECH_STACK.md` (append the new table, if any, to the "Tables:" line), `src/lib/site-content.ts` (update `Product`/category TypeScript types — including a stable identifier field — to match the chosen shape; no data-access logic yet)
  - **Flags:** schema-touching: **yes** · sensitive: **yes** (new RLS policies) · UI: **no**
  - **Acceptance:**
    - `/architect` has decided and written down: (a) whether products-within-category data lives in a new table or nested inside `site_settings.business` JSONB, (b) how a product row stays attached to its category given `site_settings.business.products` items have no stable ID today, (c) how "block deleting a non-empty category" is enforced (schema constraint, application check, or both). This ticket does not pre-decide any of the three — deciding them, on the record, is what makes this ticket done.
    - The chosen identifier scheme guarantees two categories can never resolve to the same public URL (e.g., if a slug is derived from title, duplicate/near-duplicate titles are handled explicitly — disallow-on-save, or a stable-ID fallback — `/architect`'s call which, but it must be decided, not left implicit).
    - If a new table is created: RLS is enabled, with an explicit `anon` SELECT policy (matching the public-read pattern already used by `site_settings` / `media_assets` / `leaders`) **and** an explicit `authenticated` ALL policy (following the `jobs` table's `FOR ALL TO authenticated USING (true) WITH CHECK (true)` pattern) — so this new table does not repeat the missing-`authenticated`-policy gap already flagged for the other five tables (`docs/WORKFLOW.md` §8, row 2).
    - Migration file follows the `WORKFLOW.md` §1 format exactly: header comment with ticket ID, authoring role, and `-- STATUS: PENDING_USER_APPLY`.
    - `src/lib/site-content.ts` types reflect the chosen shape so T-003 can build the data-access layer against a typed contract without re-deriving it.
    - **HARD STOP:** the user has explicitly confirmed, in the same thread, that the SQL was applied by hand in the Supabase SQL editor. No code depending on this schema (T-003, T-004, T-005) is `/qa live`-verified or merged before that confirmation (`WORKFLOW.md` §5, §7).
  - **Sequence:** `/git Start` → `/architect Review schema` → **HARD STOP: user confirms SQL applied** → `/lead-dev` (types only) → `/cso review` (new RLS policies) → `/qa static` → `/qa live` (read-only: confirm the table/columns and RLS behave as designed — no writes) → `/git Merge`
  - **Notes:** First ticket in the sprint, deliberately — every ticket below either depends on this one's SQL being applied, or doesn't. See Dependency Order.

- [x] **T-002** — Show a recommended image size and a non-blocking warning on product image uploads
  - **Source:** direct — `docs/VISION.md` MVP Feature 3
  - **Files:** `src/lib/upload-limits.ts` (add recommended-size constants alongside the existing hard-limit constants), `src/components/admin/ImageUploadField.tsx` (show the recommendation; add a non-blocking warning state distinct from the existing hard-block error state)
  - **Flags:** schema-touching: **no** · sensitive: **no** · UI: **yes**
  - **Acceptance:**
    - The upload field shows a recommended image size before/at upload, without changing the existing hard-limit copy.
    - Existing hard block is byte-for-byte unchanged: a file over 400 KB, over 2400 px, or not JPG/WebP is still rejected with the same messages and the same TinyPNG pointer (`MAX_UPLOAD_BYTES`, `MAX_UPLOAD_DIMENSION`, `sniffImageFormat` in `src/lib/upload-limits.ts` are read, not changed in behavior).
    - A file that passes the hard limits but is smaller than the recommended size, or has a markedly different aspect ratio, still uploads successfully via the existing `uploadOptimizedImage` call and shows a warning that is visually distinct from the hard-block error (e.g., different color/icon) — staff can see it and choose to proceed anyway.
    - No server-side re-encoding/auto-resizing is introduced (VISION Anti-Goals) — this ticket only adds client-side display logic and shared constants.
    - `addMediaAction` and the generic `uploadFile` action (`src/app/actions/media-actions.ts`, `src/app/actions/settings-actions.ts`) are not touched — VISION Anti-Goals explicitly excludes extending this warning to the Media Center gallery or the generic upload action.
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge`
  - **Notes:** Independent of T-001 — no schema/table dependency. Can start immediately; not stuck behind T-001's hard stop.

- [ ] **T-003** — Build the products-within-category data layer, including the category delete-guard
  - **Source:** direct — `docs/VISION.md` MVP Feature 2 (data/backend half)
  - **Files:** `src/app/actions/settings-actions.ts` (most likely extension point) — or a new `src/app/actions/products-actions.ts` if T-001's schema calls for a dedicated table; exact file follows T-001's decision — `src/lib/site-content.ts` (data-access/normalize helpers matching the types T-001 added)
  - **Flags:** schema-touching: **no** (built on T-001) · sensitive: **yes** (server actions that write) · UI: **no**
  - **Acceptance:**
    - A read function returns a given category's products (image, name, description) in staff-set order, per T-001's schema.
    - Create/update/delete functions exist for a single product within a category; delete removes exactly one product without touching any other product or the parent category.
    - A reorder path persists staff-set order.
    - Every write above calls `revalidatePath` at the affected category's public detail path (T-005's URL scheme) in addition to `/what-we-do` itself — following the existing `SETTINGS_ROUTES` pattern in `settings-actions.ts`, which maps settings keys to **public** paths, not admin paths (`docs/MEMORY_BANK.md` Known Trap #6).
    - Deleting a category that still has ≥1 product is refused with a clear, specific message (e.g., "Remove its products first") rather than silently cascading the deletion.
    - No public route, admin path, or `site_settings` key is renamed.
  - **Sequence:** `/git Start` → `/lead-dev` → `/cso review` → `/qa static` → `/qa live` (read-only checks only — no writes, no deletes, per `WORKFLOW.md` §4) → `/git Merge`
  - **Notes:** Depends on T-001. Per `WORKFLOW.md` §5's hard stop, this ticket's code is not `/qa live`-verified or merged until the user has confirmed T-001's SQL is applied.

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
  - **Sequence:** `/git Start` → `/lead-dev` → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge`
  - **Notes:** Depends on T-001 (identifier scheme) and T-003 (read function + revalidation). Per `WORKFLOW.md` §5's hard stop, not `/qa live`-verified or merged until T-001's SQL is confirmed applied.

### Dependency Order
1. **T-001** — schema decision + migration. Dispatch to `/architect` first so the SQL reaches the user as early as possible.
2. **T-002** — no dependency on T-001. Runs in parallel with T-001, while the user is applying the SQL.
3. **T-003** — depends on T-001's SQL being confirmed applied.
4. **T-004** — depends on T-003 (and transitively T-001).
5. **T-005** — depends on T-003 (and transitively T-001); can be built in parallel with T-004 once T-003 lands, since T-004 (admin write UI) and T-005 (public read UI) touch different files.
