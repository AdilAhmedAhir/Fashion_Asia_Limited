# VISION.md

Owner: `/ceo`. Last updated: 2026-09-26.

## Problem Statement

On `/what-we-do`, all 8 product-category cards (T-Shirts, Polo Shirts, Tank Tops, Dresses, Sleepwear, Leggings, Sportswear, Heavy Jersey Products) are decorative dead ends — clicking one does nothing, so a prospective buyer evaluating Fashion Asia's range sees one photo per category and has no way to see what's actually inside it. The client's own `/admin` staff can already customize the category cards themselves, but have no way to add the individual products behind a category, and no guardrail stops them from publishing a badly-sized photo when they try.

## Target User

1. **Sourcing manager at a prospective buyer brand** — mid-evaluation of Fashion Asia as a manufacturing partner, clicking through `/what-we-do` to gauge real production range before requesting samples or a quote.
2. **Fashion Asia's own content-editor** — the same non-technical person who already logs into `/admin/business` today to edit category cards; needs to add a product to a category and see it live the same day, without filing a developer ticket.

## Core Value Proposition

Every category card on `/what-we-do` becomes a real catalog page the client's own staff can populate — so a buyer sees actual range instead of a single placeholder photo, and the client never waits on a developer for a routine catalog update.

## MVP Feature List

1. **Category detail pages** — Named user: sourcing manager (buyer persona). Every category card on `/what-we-do` links to its own page listing that category's products (image + name + description, in the site's existing photo-card style). A category with no products yet shows an honest "coming soon" state — never a 404, never an invented placeholder product. *Acceptance:* click every category card that exists today (currently 8) — and any added later — from `/what-we-do`; each lands on a distinct, working page; that page renders only its own category's products (or the empty state); no card is a dead click.

2. **Products-within-category management in `/admin`** — Named user: Fashion Asia's content-editor. Staff can add, edit, delete, and reorder products inside a given category — each product carrying exactly **image, name, description** (no "type" field — explicitly declined; no other field ships without a new named user and a VISION amendment) — and the public category page reflects the change immediately, no deploy required. Deleting a category that still holds products is blocked with a clear message ("remove its products first") rather than silently cascading the data loss. *Acceptance:* staff adds a product to "Sportswear" in `/admin`; it appears on the public Sportswear category page without developer involvement.

3. **Recommended size + soft image warning, on top of the existing hard limits** — Named user: Fashion Asia's content-editor, protected from unknowingly publishing a bad photo. Before/at upload, the field shows a recommended size. The existing hard block is unchanged (JPG/WebP only, ≤ 400 KB, ≤ 2400 px, clear how-to-fix message pointing at TinyPNG) — nothing here loosens it. Images that are merely smaller than recommended or oddly proportioned are still **allowed** but flagged with a visible warning so staff can decide. *Acceptance:* an oversized or wrong-format file is hard-blocked exactly as today; a too-small or oddly-cropped file uploads successfully but shows a warning.

**Settled inputs carried into this VISION (not open questions — do not relitigate):** product fields are exactly image/name/description plus category, per explicit client decision. A new database table is pre-approved — the user will hand-apply the SQL in the Supabase dashboard, consistent with how every existing table in this project was added (`docs/MEMORY_BANK.md` Known Trap #3). Whether the products-within-category data lives in a new table or nested inside the existing `site_settings.business` JSONB is `/architect`'s call to make, not this document's.

## Anti-Goals (explicitly NOT doing in v1)

- **Category-level CRUD is not new work — it already shipped.** Add / rename / delete / reorder-category, each with its own image, title, and description, already works today in `/admin/business` (`ObjectListEditor` + `ImageUploadField`, confirmed in source). Do not schedule a ticket to rebuild this; if the client doesn't know it exists, that's a support/training note, not an engineering ticket.
- **No "type" field, or any field beyond image / name / description, on products.** The user explicitly declined it ("no need anything else"). A future SKU, price, size chart, or tag field needs its own named user and a VISION amendment — it does not ride in on this ticket.
- **No server-side re-encoding or auto-resizing of uploaded images.** Standing project rule (`src/lib/upload-limits.ts`): the site accepts only already-optimized files and sends everyone else to TinyPNG. The new size warning augments that rule; it does not replace it with silent server-side processing.
- **No bulk product import (CSV/spreadsheet) and no "move/merge products between categories" tooling.** No named user asked for either; staff can hand-enter products at today's catalog scale, and category deletion is handled safely by requiring the category to be emptied first (Feature 2).
- **No extension of the size-warning UX to the Media Center gallery (`addMediaAction`) or the generic `uploadFile` action.** Both are pre-existing, unvalidated upload paths (`docs/MEMORY_BANK.md` Known Trap #9) — real tech debt, but unrelated to this pitch and not requested by any named user this sprint.
- **No pagination, filtering, or search on category pages.** Current catalog sizes don't need it; revisit only if a category's product count actually makes a page unwieldy.
- **Homepage "Business preview" strip stays exactly as-is this sprint.** See ruling below.

## Success Metrics

1. **Zero dead category cards.** Every category on `/what-we-do` (whatever the count is at any time) resolves to a working page — either populated or an honest empty state — verified at ship and re-verified whenever a category is added or removed. Capturable today with a manual pass or a direct query against the category source of truth; no new instrumentation required.
2. **Zero over-limit images ever published.** 100% of product and category image uploads that exceed 400 KB / 2400 px / wrong-format are rejected server-side, not merely warned client-side — enforced by the existing `uploadOptimizedImage` validation path, which this feature must keep calling rather than bypass.
3. **Staff adoption, tracked at 30/60/90 days post-launch.** Count of categories with zero products in the new products list. A number trending toward 0 shows staff are actually using the self-service flow; a number stuck at "all categories, zero products" past 30 days means the self-service UX failed even though the feature technically shipped — a signal for a follow-up ticket, not a reason to build more before checking why. Directly queryable from Supabase; no analytics SDK needed (none is installed today, and installing one is out of scope for this pitch).

## Scope Ruling — Homepage "Business Preview" Strip

**Ruling: stays as plain text, unlinked, for this sprint.**

The homepage strip (`BusinessPreviewSection`, fed by `site_settings.homepage.businessProducts`) and the `/what-we-do` category grid (`site_settings.business.products`) are two independently-edited lists that have already drifted: the homepage list has 6 entries against the catalog's 8 (missing Tank Tops and Leggings entirely), and even the names that do overlap don't match exactly ("Heavy Jersey" vs. "Heavy Jersey Products"). Nothing keeps the two lists in sync today — editing one in `/admin` has no effect on the other.

Linking the homepage strip to category pages now would mean matching against titles that are known to drift, which will silently mislink or 404 the next time either list is edited independently — that is not a one-line addition, it is new, separable work (pick one list as the single source of truth, or build a real link between the two, each with its own acceptance criteria). The client's own capture, per the pitch, was specifically the `/what-we-do` Product Catalog grid, and no named user has asked for the homepage strip to be clickable. Cutting it here keeps this sprint's scope to what was actually asked.

**Follow-up for `/pm`'s backlog, not this sprint:** either point `homepage.businessProducts` at the same category list `/what-we-do` uses (removing the drift permanently), or leave it as free-text marketing copy and stop implying it's a live index of categories. Either is a legitimate v2 decision; doing nothing is also acceptable until the drift causes a real complaint.
