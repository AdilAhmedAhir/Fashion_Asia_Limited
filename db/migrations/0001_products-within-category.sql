-- Ticket: T-001 — Design the products-within-category schema and author the migration
-- Author: /architect
-- STATUS: APPLIED 2026-09-27
--
-- ============================================================================
-- DECISION RECORD (full rationale: docs/TECH_STACK.md → "Products-within-
-- category schema" under Database, dated 2026-09-26)
-- ============================================================================
--
-- (a) Storage: categories stay exactly where they are today — nested inside
--     site_settings.business.products (JSONB), edited by the existing
--     ObjectListEditor / BusinessClient.tsx, completely unchanged. No new
--     table for categories. Individual PRODUCTS (image/name/description,
--     inside a category) get the new dedicated table created below,
--     public.products — not a further-nested JSONB array under each
--     category. Reasons: per-product add/edit/delete/reorder are single-item
--     operations (matches the jobs/reports/leaders per-row-CRUD pattern
--     already used three times in this codebase), a table gets a
--     collision-proof primary key for free, and nesting would force every
--     single product edit to re-save the entire business JSONB blob
--     (write amplification + a real lost-update risk).
--
-- (b) Attachment: there is no categories TABLE, so Postgres cannot express a
--     real foreign key from products to a category. Each category JSON
--     object instead gains one new field, `slug` (e.g. "t-shirts"),
--     computed once from its title and frozen forever after — renaming a
--     category's title never changes its slug, so a rename can never
--     orphan its products or change its public URL. public.products.
--     category_slug stores that same value; the link is enforced entirely
--     in application code (T-003). `slug` doubles as the public URL segment
--     (/what-we-do/<slug>), so no separate ID scheme is needed for T-005.
--     Two categories can never resolve to the same URL because a freshly
--     computed slug that would collide with a sibling category's slug in
--     the same save is REJECTED outright (save fails with a specific,
--     actionable error) — not silently suffixed, not silently overwritten.
--     The read-time half of this (a display-only auto-suffixed fallback for
--     any legacy category that predates `slug` and hasn't been saved yet
--     under the new code) is a small addition to normalizeProducts() in
--     src/lib/site-content.ts, plus a new slugify() helper alongside it —
--     not yet in that file as of this migration; see the T-001 handoff
--     (docs/TECH_STACK.md → Database) for the exact spec `/lead-dev` adds.
--
-- (c) Delete guard: application check only — a schema constraint is not
--     possible, for the same structural reason as (b): there is no category
--     row for a REFERENCES/ON DELETE RESTRICT constraint to attach to.
--     T-003's write path for `business` settings must fetch the
--     currently-stored category list, compute which category slugs are
--     present in the old list but absent from the incoming save (a real
--     delete, not a rename — renames keep their slug), run one grouped
--     count against public.products for exactly those removed slugs, and
--     refuse the entire save (e.g. "Remove its products first") if any of
--     them is non-zero. The composite index below serves this count query
--     as well as the ordered product listing, via its leftmost column.
--
-- ============================================================================
-- FOLLOW-UP (2026-09-26, same day, pre-apply): explicit GRANTs added.
-- ============================================================================
-- RLS policies filter ROWS; they do nothing without the underlying TABLE-level
-- privilege — GRANT is checked first, RLS second. This project's other six
-- tables have zero GRANT statements anywhere in supabase-schema.sql and work
-- today, because Supabase's project-level default privileges have
-- historically auto-granted SELECT/INSERT/UPDATE/DELETE on every new public
-- table to anon/authenticated/service_role. That default is being phased out
-- platform-wide: an opt-out toggle ("automatically expose new tables") has
-- existed since 2026-04-28, it becomes the default for brand-new projects as
-- of 2026-05-30, and — critically — it is enforced on EXISTING projects
-- (this one included) from 2026-10-30. This file may well be hand-run on
-- either side of that date, and the toggle may already be off for this
-- project independent of it; neither is verifiable from here. `ALTER DEFAULT
-- PRIVILEGES` is create-time-only, so this does NOT retroactively affect the
-- six tables already created — only new tables, i.e. exactly this one.
-- GRANT is natively idempotent in Postgres (unlike CREATE POLICY) — re-
-- running an already-held grant is a silent no-op, no guard needed. Scoped
-- to exactly what the two RLS policies below already intend: SELECT for
-- anon, SELECT/INSERT/UPDATE/DELETE for authenticated. No `service_role`
-- grant — this project has no service-role key anywhere in `src/`
-- (confirmed), so granting it would be an unused, unjustified addition.
-- ============================================================================
-- SAFETY: additive and idempotent. Safe to run more than once.
-- ============================================================================
-- - CREATE TABLE / CREATE INDEX use IF NOT EXISTS (native Postgres support).
-- - The two RLS policies are wrapped in a guarded DO block, because Postgres
--   has no CREATE POLICY IF NOT EXISTS — re-running this file unguarded
--   would error with "policy already exists" on the second run.
-- - The two GRANT statements need no such guard — GRANT is natively
--   idempotent in Postgres; re-granting an already-held privilege is a
--   silent no-op, never an error.
-- - No DROP, no destructive ALTER, of anything.
-- - No existing table, column, or row is touched. site_settings needs no
--   DDL at all — its `value` column is already JSONB and accepts the new
--   `slug` field with no schema change — and the `slug` backfill for the 8
--   categories already live in site_settings happens lazily in application
--   code on next read/save (site-content.ts::normalizeProducts), never via
--   an UPDATE statement here.
-- ============================================================================

-- ================================================================
-- products — individual catalog items inside a category
-- ================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    -- Application-enforced link to a category's `slug` field inside
    -- site_settings.business.products (JSONB) — see decision (b) above.
    -- No REFERENCES clause: categories are not rows in a table.
    category_slug VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.products IS
    'Individual catalog items shown on a /what-we-do/<slug> category page. category_slug is an application-enforced link to a category object inside site_settings.business.products (JSONB) -- there is no DB-level foreign key because categories are not table rows.';

-- Serves both "products of category X in order" (T-005's category page) and
-- the delete-guard's per-category count in (c), via the leftmost column.
CREATE INDEX IF NOT EXISTS idx_products_category_sort
    ON public.products (category_slug, sort_order);

-- Table-level privileges — see the FOLLOW-UP note above. Without these, the
-- RLS policies below have nothing to filter: a missing GRANT fails the
-- request before RLS is ever evaluated. Scoped to exactly what the two
-- policies below intend; no service_role grant (this project uses none).
GRANT SELECT ON TABLE public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'products'
          AND policyname = 'Allow public read on products'
    ) THEN
        CREATE POLICY "Allow public read on products"
            ON public.products FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'products'
          AND policyname = 'Allow authenticated full access to products'
    ) THEN
        CREATE POLICY "Allow authenticated full access to products"
            ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ================================================================
-- Verification — READ-ONLY. Safe to run (and re-run) at any time, by the
-- user or by /qa, to confirm the table/columns/index/policies exist.
-- ================================================================

-- 1. Table + columns exist with the expected types/defaults.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products'
ORDER BY ordinal_position;

-- 2. RLS is enabled on the table.
SELECT relrowsecurity
FROM pg_class
WHERE oid = 'public.products'::regclass;

-- 3. Both policies exist, scoped to the expected roles/commands.
SELECT policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'products';

-- 4. The composite index exists.
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'products';

-- 4b. Table-level GRANTs exist for anon/authenticated (independent of, and a
-- prerequisite for, the RLS policies in query 3 above actually taking
-- effect). Expect anon -> SELECT only; authenticated -> SELECT/INSERT/
-- UPDATE/DELETE. If this comes back empty for either role, every query that
-- role makes against this table will fail with "permission denied" even
-- though the policies in query 3 look correct.
SELECT grantee, privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public' AND table_name = 'products'
  AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 5. Row count sanity check — expect 0 immediately after this migration.
SELECT count(*) FROM public.products;

-- 6. Context only (not created by this migration): current shape of the
-- category list this table's category_slug values must line up with.
-- Confirms whether any category already has a `slug` key (it shouldn't yet,
-- until T-003/T-004 ship and the business page is saved at least once).
SELECT key, jsonb_pretty(value -> 'products') AS categories
FROM public.site_settings
WHERE key = 'business';
