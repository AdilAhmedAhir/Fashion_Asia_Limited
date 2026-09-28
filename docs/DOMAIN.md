# DOMAIN.md — Domain Truth

> GENESIS Phase 1, 2026-09-28. This is the vocabulary and the rules of FAL's world, written in
> the words the client and the site already use. Unknowns are recorded as `[CONFIRM Q##]` items
> in `/CLIENT_QUESTIONS.md`.

## §1 — Vocabulary

**FAL, the business**

| Term | Meaning here |
|---|---|
| **FAL** | Fashion Asia Limited: a 100% export-oriented knitwear manufacturer in Sreepur, Gazipur, Bangladesh. |
| **Northern Tosrifa Group** | FAL's parent group ("sister concern"). |
| **Buyer / brand** | An international apparel company that places production orders. The site's primary audience. |
| **Sourcing / merchandising manager** | The person at a buyer who evaluates suppliers. They're who the catalog is for. |
| **Merchandiser** | FAL-side staff who handle a buyer's orders. Not a site user today. |
| **Capacity** | Published production facts: 26 lines, 800,000 pieces per month. They appear in page copy and metadata fallbacks. |

**The catalog.** In code these two words swap meanings, so read the table carefully.

| Term | Meaning here |
|---|---|
| **Category** | A product family card on `/what-we-do`: T-Shirts, Polo Shirts, Tank Tops, Dresses, Sleepwear, Leggings, Sportswear, Heavy Jersey Products. Stored as an element of `site_settings.business.products`, but **named `Product` in code**. |
| **Product** | One item inside a category: a row in `public.products` (image, name, description, `sort_order`, `category_slug`). **Named `CategoryProduct` in code.** |
| **Slug** | A category's URL segment (`/what-we-do/<slug>`). Computed from the title, then **frozen** from its first Save onwards. |
| **Category id** | A hidden, server-issued identity that decides "is this the same category". Internal only: never shown, never in a URL. |
| **Bootstrap Save** | The one-time Save on `/admin/business` that freezes every category's id and slug. No product can be added to a category before it. |
| **Coming Soon** | The honest empty state on a category page with no products. Never a 404, never a fake product. |

**Everything else the admin manages**

| Term | Meaning here |
|---|---|
| **Submission** | One entry from the contact, career or grievance form, stored in `submissions` with a `type`. **Contains personal data.** |
| **Grievance channel** | The worker-complaint form buyers and auditors expect an export factory to run. |
| **Report** | A publication, usually a sustainability report PDF. Either published or draft. |
| **Leader** | A leadership profile on `/who-we-are`. |
| **Job** | A career posting, either active or closed. |
| **Media asset** | A gallery or news item on `/life-at-fashion-asia`. |
| **Facility** | A homepage "Life at Fashion Asia" facility photo (medical center, day care, shop, bicycle parking). |
| **Site settings** | Per-page editable copy in `site_settings`. The keys keep old page names on purpose: `business` = What We Do, `who_we_work_with` = Global Partner. |

## §2 — Core entities & relationships
- **Category 1 → N Product.** They're linked by `products.category_slug` = the category's frozen
  slug. The app enforces this; there's no foreign key, because categories are JSONB elements,
  not rows.
- **A category holding products can't be deleted.** The admin must remove its products first.
- `site_settings` has one JSONB row per key: `homepage`, `who_we_are`, `business`,
  `who_we_work_with`, `sustainability`, `contact` and `general`. The `contact` and `general`
  rows are dead editors; see Q05.
- `reports`, `leaders`, `jobs`, `media_assets` and `submissions` are independent tables.
  `media` is the Storage bucket that holds uploaded images and PDFs.

## §3 — Policy values (config, never hard-coded in components)

| Policy | Value | Lives in |
|---|---|---|
| Max image size | 400 KB | `src/lib/upload-limits.ts` (`MAX_UPLOAD_BYTES`) |
| Max image edge | 2400 px | `src/lib/upload-limits.ts` (`MAX_UPLOAD_DIMENSION`) |
| Accepted image formats | JPG and WebP, checked by file signature | `src/lib/upload-limits.ts` (`sniffImageFormat`) |
| Recommended image | 1200 × 900; shape between 1:1 and 2:1 (a warning, not a block) | `src/lib/upload-limits.ts` |
| Server Action request body | 1 MB (the Next.js default). Blocks most report PDFs; see Q08. | Framework default; would go in `next.config.ts` |
| Page revalidation | 60 s on marketing pages | Each page's `revalidate` export |
| Company facts | 26 lines, 800,000 pieces a month | Page copy and metadata fallbacks. Move them to settings if FAL ever edits them; see Q11. |

## §4 — Roles & what each may see or do

| Role | Who | May do |
|---|---|---|
| **Visitor** | Anyone | Read public pages; submit the contact, career and grievance forms. It can never read submissions. |
| **FAL admin** | Anyone signed into Supabase Auth | **Everything in `/admin`**: all editors, CRUD, uploads and the submissions inbox (personal data). There's no role separation today, so *any* authenticated account is an admin. This is RISKS.md R1 and SEC-HIGH-2, and Q09 records the intended policy. |
| **Agency / developer** | happierbangladesh | Code and deploys. No CMS role is needed. |

## §5 — Domain edge cases (what QA must probe)
- **Renaming a category before the bootstrap Save** changes its public URL, with no redirect.
  After that Save, the slug is frozen.
- **Duplicate or colliding category titles** get a deduped slug. A save that would take a
  sibling's slug is refused, with the category named.
- **Adding a product to a category that hasn't had its bootstrap Save** is refused with
  "Save once first". The editor hides the add form.
- **A new product with no order given** lands at the end of its category (`max + 1`).
- **Unknown category URLs** return 404. A category with no products shows Coming Soon.
- **Images:** any over the size, edge or format limit is hard-blocked. A merely small or
  odd-shaped one uploads with a warning.
- **Report PDFs over 1 MB** fail before upload; Q08 decides the policy.
- **Signing out in another tab mid-edit** shows "Your session expired. Sign in again and
  retry." on the next save.
- **Editing a row that another tab deleted** shows "… not found. Reload the page to see the
  current list."
