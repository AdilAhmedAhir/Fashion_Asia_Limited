# DATA_MODEL.md — Schema / ERD / Authorization

> GENESIS Phase 2, 2026-09-28, mapped from `supabase-schema.sql`,
> `db/migrations/0001_products-within-category.sql` and the `src/app/actions/*` reads and
> writes. **Caveat:** the live database carries hand-added `authenticated` policies that were
> never copied back into `supabase-schema.sql` (`docs/WORKFLOW.md` §7 #2). The policy column
> below states what the file says, plus what the working admin proves must exist live.

## §1 — Entities (Postgres, schema `public`)

| Table | Key columns | Notes |
|---|---|---|
| `site_settings` | `key` varchar(100) PK, `value` JSONB NOT NULL, `updated_at` timestamptz NOT NULL (read live 2026-10-04) | One row per page key: `homepage`, `who_we_are`, `business`, `who_we_work_with`, `sustainability`, `contact`, `general`. Code defaults in `src/lib/site-content.ts` are layered underneath: `{...defaults, ...stored}`. Since T-026, `business.updated_at` is also the compare-and-swap stamp for that row's two admin pages. No trigger sets it, so the app writes it. |
| ↳ `business.value.products[]` | `title`, `description`, `image`, **`slug`**, **`id`** | **Categories.** They're JSONB elements, not rows. `slug` is frozen at the first save; `id` is a hidden, server-issued identity. |
| `products` | `id` uuid PK, `category_slug`, `name`, `description`, `image`, `sort_order`, timestamps | **Items within a category.** Composite index `(category_slug, sort_order)`. **No FK:** attachment is enforced by the app (`checkCategoryAttachable`). |
| `jobs` | `id`, `title`, `department`, `vacancy`, `location`, `employment_type`, `responsibilities`, `educational_requirements`, `experience_requirements`, `additional_requirements`, `workplace`, `salary`, `compensation`, `published_at`, `deadline`, `is_active`, `created_at` | Career postings. |
| `reports` | `id`, `title`, `category` (financial, audit, compliance, environmental, csr), `year`, `file_url`, `published`, timestamps | Publications. The PDF goes through `uploadFile(fd, "reports")`. |
| `leaders` | `id`, `name`, `title`, `bio`, `photo_url`, `sort_order`, `created_at` | Leadership profiles. |
| `media_assets` | `id`, `title`, `type` (gallery or news), `url`, `content`, `created_at` | Gallery and news. Built-ins stop appearing once any one is imported (MEMORY_BANK Known Trap #8). |
| `submissions` | `id`, `type` (contact, career or grievance), `payload` JSONB, `status`, `created_at` | **Holds personal data.** Written by the public forms, read only in `/admin/submissions`. |
| Storage | bucket `media` (images); bucket `reports` (report PDFs, via `uploadFile`'s caller-set bucket) | Bucket policies live only in the Supabase dashboard (Known Trap #14). |

## §2 — ERD (relationships)
```
site_settings[key='business'].value.products[]  (category: id, slug, title, …)
        │ 1
        │   app-enforced: products.category_slug = category.slug   (no FK; delete-guard in updateSettings)
        ▼ N
products (id, category_slug, name, description, image, sort_order)

jobs · reports · leaders · media_assets · submissions   — independent, no relations
```

## §3 — Authorization per entity

| Table | `anon` (the public site) | `authenticated` (= admin; see RISKS R1) | Server-side check |
|---|---|---|---|
| `site_settings` | SELECT: policy "Allow public read on site_settings", permissive, `using: true` | ALL: policy "Allow authenticated full access to site_settings", permissive, `using: true`, `check: true`. Read live 2026-10-04 (owner SQL); there are no triggers or rules. Both roles also hold every table grant, the Supabase default (SEC-INFO-40, T-031). | **`business` (T-026), one writer per field:** `saveCategories` writes only `products` (the category identity, collision and delete guards run inside it); `saveWhatWeDoText` writes only the 4 page-text fields. Both call `getUser()` first, then a private compare-and-swap on `updated_at`, failing closed. **Other keys:** `updateSettings` (`getUser()`; it refuses `business`). `seedSettingsFromDefaults` never writes `business.products`. |
| `products` | SELECT | ALL (explicit `GRANT` + policy) | all 4 writes: `getUser()`, plus `checkCategoryAttachable` on create and update |
| `jobs` | SELECT `WHERE is_active` | ALL | `create`, `update` and `deleteJob`: `getUser()` (T-015) |
| `reports` | SELECT `WHERE published` | writes (the live policy isn't in the file) | report CRUD and `uploadFile`: `getUser()` (T-015) |
| `leaders` | SELECT | writes (the live policy isn't in the file) | leader CRUD: `getUser()` (T-015) |
| `media_assets` | SELECT | writes (the live policy isn't in the file) | **`addMediaAction` / `deleteMediaAction`: no `getUser()` yet (T-019)** |
| `submissions` | INSERT only; SELECT denied | SELECT (the live policy isn't in the file) | the forms insert through `form-actions.ts` |

**Rule:** any new table gets RLS, explicit `GRANT`s and per-operation policies **before** it
holds real data (`docs/WORKFLOW.md` §6).

## §4 — Migrations

| Migration | Contents | Status |
|---|---|---|
| `db/migrations/0001_products-within-category.sql` | `public.products`, its index, grants and policies | `STATUS: APPLIED 2026-09-27` |

- **Flow:** `docs/STACK.md` §5. Hand-written SQL, then the owner applies it in the SQL
  editor. This is a **hard stop**. No CLI, no type generation.
- **Planned (see RISKS R1):** an explicit admin allowlist or role. It would change every
  `authenticated` policy, so it's one-way and needs `/debate` plus `/security-review` before
  the SQL is written.
