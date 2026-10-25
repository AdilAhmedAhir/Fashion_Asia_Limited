-- STATUS: PENDING_USER_APPLY
-- 0002 — product photo gallery (T-045, 2026-10-25)
--
-- What it does: gives each product up to 5 extra photos, for the click-to-preview pop-up on the
-- category pages. The existing `image` column stays the main photo (photo 1), so a product can
-- show up to 6 photos in all (owner decision, 2026-10-25).
--
-- The 5-photo limit is app policy (MAX_PRODUCT_GALLERY_PHOTOS in src/lib/site-content.ts), checked
-- by the product save. The CHECK below is only a structural backstop against a runaway write.
--
-- No new table, policy or grant: the column inherits public.products' existing RLS policies
-- (anon SELECT, authenticated ALL) and table grants, exactly like `image`.
--
-- Safe to run twice. Adding a column with a constant default is a metadata-only change in
-- Postgres 11 and later, so it doesn't rewrite or lock the table for long. Existing products get
-- an empty gallery and look exactly as they do today.
--
-- How to apply: paste this whole file into the Supabase SQL editor for the live project and run
-- it. The last two queries print the new column and the constraint, so you can see it worked.

-- Give up rather than queue behind a stuck lock (architect-reviewer, 2026-10-25).
SET lock_timeout = '5s';

ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS gallery TEXT[] NOT NULL DEFAULT '{}'::text[];

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.products'::regclass
          AND conname = 'products_gallery_max'
    ) THEN
        ALTER TABLE public.products
            ADD CONSTRAINT products_gallery_max CHECK (cardinality(gallery) <= 20);
    END IF;
END $$;

COMMENT ON COLUMN public.products.gallery IS
    'Extra product photos after the main `image`, in display order (T-045). The app allows up to 5; the CHECK is a structural backstop only.';

-- So the website's database API sees the new column straight away.
NOTIFY pgrst, 'reload schema';

-- VERIFY (read-only)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'gallery';

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.products'::regclass AND conname = 'products_gallery_max';
