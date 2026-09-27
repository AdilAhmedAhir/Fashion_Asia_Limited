"use server";

// ============================================
// CATEGORY PRODUCTS CRUD (public.products)
// ============================================
//
// Individual catalog items inside a category (image/name/description) — see
// the naming-quirk note in docs/TECH_STACK.md: this is NOT the `Product`
// type in site-content.ts (that one is a CATEGORY, e.g. "T-Shirts"). This
// file is the data-access layer T-003 adds for the new public.products table
// (db/migrations/0001_products-within-category.sql).
//
// `category_slug` has no DB-level foreign key — categories are JSONB array
// elements inside site_settings.business, not table rows
// (docs/TECH_STACK.md decision (b)/(c)) — so every write below validates it
// against the CURRENT live category list itself before touching the table.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getSettings } from "@/app/actions/settings-actions";
import {
    normalizeProducts,
    readStoredCategoryIdentities,
    isWellFormedSlug,
    type CategoryProduct,
    type CategoryProductInput,
} from "@/lib/site-content";

export type ProductActionResult =
    | { ok: true; product: CategoryProduct }
    | { ok: false; error: string };

export type ProductVoidResult = { ok: true } | { ok: false; error: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Every write action checks for an authenticated session server-side, in
// addition to RLS — matches the existing uploadOptimizedImage /
// importBuiltInGallery / seedSettingsFromDefaults pattern in this codebase.
async function requireUser(supabase: SupabaseServerClient) {
    const {
        data: { user }
    } = await supabase.auth.getUser();
    return user;
}

type CategoryAttachability =
    | { attachable: true }
    | { attachable: false; reason: "not_found" }
    | { attachable: false; reason: "not_yet_bootstrapped"; title: string };

// Products may only attach to a category that already has a genuine,
// stored, well-formed id + slug — i.e. has survived at least one save under
// docs/TECH_STACK.md decision (d). normalizeProducts()'s read-time,
// auto-suffixing fallback exists purely so a page always has something to
// render for a category that predates this feature; it was never meant to
// make that category attachable, only displayable (docs/TECH_STACK.md,
// "legacy (id-less) categories" follow-up, 2026-09-27) — so the frozen
// identities (readStoredCategoryIdentities) are checked first, and only a
// category that's genuinely displayed but not yet frozen gets the distinct
// "not_yet_bootstrapped" answer instead of being lumped in with "does not
// exist."
async function checkCategoryAttachable(categorySlug: string): Promise<CategoryAttachability> {
    const business = await getSettings("business");

    const frozen = readStoredCategoryIdentities(business.products);
    for (const ref of frozen.values()) {
        if (ref.slug === categorySlug && isWellFormedSlug(ref.slug)) {
            return { attachable: true };
        }
    }

    const displayed = normalizeProducts(business.products);
    const match = displayed.find(c => c.slug === categorySlug);
    if (match) {
        return { attachable: false, reason: "not_yet_bootstrapped", title: match.title };
    }

    return { attachable: false, reason: "not_found" };
}

function revalidateCategory(categorySlug: string) {
    revalidatePath(`/what-we-do/${categorySlug}`);
    revalidatePath("/what-we-do");
}

function sanitizeInput(input: CategoryProductInput) {
    return {
        name: typeof input.name === "string" ? input.name.trim() : "",
        description: typeof input.description === "string" ? input.description.trim() : "",
        image: typeof input.image === "string" ? input.image.trim() : "",
        sort_order: Number.isFinite(input.sort_order) ? input.sort_order : 0,
    };
}

// A given category's products, in staff-set order — the composite index on
// (category_slug, sort_order) from 0001_products-within-category.sql serves
// this query directly. No auth check: this is a plain read, gated by the
// table's own `anon` SELECT policy, and is the function T-005's public
// category page calls too.
export async function getCategoryProducts(categorySlug: string): Promise<CategoryProduct[]> {
    const slug = categorySlug?.trim();
    if (!slug) return [];

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category_slug", slug)
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("products read error:", error);
        return [];
    }
    return (data ?? []) as CategoryProduct[];
}

// Every product across every category, grouped by category_slug and ordered
// exactly like getCategoryProducts — one query for the whole admin page
// (src/app/admin/(dashboard)/business/page.tsx, T-004) instead of one round
// trip per category. Same "no auth check, anon-readable" shape as
// getCategoryProducts above; a category with zero products simply has no key
// in the returned record rather than an empty array entry.
export async function getAllCategoryProducts(): Promise<Record<string, CategoryProduct[]>> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("category_slug", { ascending: true })
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("products read error:", error);
        return {};
    }

    const grouped: Record<string, CategoryProduct[]> = {};
    for (const row of (data ?? []) as CategoryProduct[]) {
        (grouped[row.category_slug] ??= []).push(row);
    }
    return grouped;
}

export async function createCategoryProduct(input: CategoryProductInput): Promise<ProductActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    const categorySlug = input.category_slug?.trim();
    if (!categorySlug) return { ok: false, error: "Missing category." };

    const attachability = await checkCategoryAttachable(categorySlug);
    if (!attachability.attachable) {
        return {
            ok: false,
            error: attachability.reason === "not_yet_bootstrapped"
                ? `"${attachability.title}" hasn't been saved yet under the current system. Open /admin/business and click Save once (no other changes needed), then try again.`
                : `Category "${categorySlug}" does not exist.`,
        };
    }

    const sanitized = sanitizeInput(input);

    // A newly added product with no explicit order lands at the end of the
    // category's list, not the front (docs/ROADMAP.md T-004, folded
    // 2026-09-27; docs/QA_REPORT.md T-003 Static Pass first-pass INFO-1) —
    // sanitizeInput()'s own bare default is 0, which would put it at the
    // front instead. Computed here, server-side, rather than trusted from
    // the caller: T-004's "Add product" UI never sends one, and resolving it
    // here means the guarantee holds for any caller, not just that one.
    let sortOrder: number = sanitized.sort_order ?? 0;
    if (!Number.isFinite(input.sort_order)) {
        const { data: maxRow } = await supabase
            .from("products")
            .select("sort_order")
            .eq("category_slug", categorySlug)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();
        sortOrder = maxRow ? (maxRow.sort_order as number) + 1 : 0;
    }

    const { data, error } = await supabase
        .from("products")
        .insert({ category_slug: categorySlug, ...sanitized, sort_order: sortOrder })
        .select()
        .single();

    if (error) return { ok: false, error: error.message };

    revalidateCategory(categorySlug);
    return { ok: true, product: data as CategoryProduct };
}

export async function updateCategoryProduct(id: string, input: CategoryProductInput): Promise<ProductActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    if (!id) return { ok: false, error: "Missing product id." };

    const categorySlug = input.category_slug?.trim();
    if (!categorySlug) return { ok: false, error: "Missing category." };

    const attachability = await checkCategoryAttachable(categorySlug);
    if (!attachability.attachable) {
        return {
            ok: false,
            error: attachability.reason === "not_yet_bootstrapped"
                ? `"${attachability.title}" hasn't been saved yet under the current system. Open /admin/business and click Save once (no other changes needed), then try again.`
                : `Category "${categorySlug}" does not exist.`,
        };
    }

    // Read the row's category before the update so a product moved to a
    // different category (not exposed by T-004's planned UI, but the type
    // allows it) revalidates the page it left, not just the one it landed on.
    // Doubles as an explicit not-found check, rather than letting a missing
    // id surface as a raw "JSON object requested, multiple (or no) rows
    // returned" error from the .single() call below.
    const { data: before } = await supabase
        .from("products")
        .select("category_slug")
        .eq("id", id)
        .maybeSingle();

    if (!before) return { ok: false, error: "Product not found." };

    const { data, error } = await supabase
        .from("products")
        .update({
            category_slug: categorySlug,
            ...sanitizeInput(input),
            updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) return { ok: false, error: error.message };

    const previousSlug = before?.category_slug as string | undefined;
    if (previousSlug && previousSlug !== categorySlug) revalidateCategory(previousSlug);
    revalidateCategory(categorySlug);

    return { ok: true, product: data as CategoryProduct };
}

// Removes exactly one product by id — never touches any other product row,
// and never touches site_settings / the parent category at all.
export async function deleteCategoryProduct(id: string): Promise<ProductVoidResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    if (!id) return { ok: false, error: "Missing product id." };

    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("category_slug")
        .maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: "Product not found." };

    revalidateCategory(data.category_slug as string);

    return { ok: true };
}

// Persists staff-set order for one category's products. `orderedIds` must
// list every product currently in that category, front to back — each id's
// sort_order is written as its index in this array. The category_slug filter
// on every update means an id that doesn't actually belong to this category
// simply matches zero rows rather than corrupting another category's list.
export async function reorderCategoryProducts(categorySlug: string, orderedIds: string[]): Promise<ProductVoidResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    const slug = categorySlug?.trim();
    if (!slug) return { ok: false, error: "Missing category." };
    if (!orderedIds?.length) return { ok: false, error: "Nothing to reorder." };

    const attachability = await checkCategoryAttachable(slug);
    if (!attachability.attachable) {
        return {
            ok: false,
            error: attachability.reason === "not_yet_bootstrapped"
                ? `"${attachability.title}" hasn't been saved yet under the current system. Open /admin/business and click Save once (no other changes needed), then try again.`
                : `Category "${slug}" does not exist.`,
        };
    }

    for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
            .from("products")
            .update({ sort_order: i, updated_at: new Date().toISOString() })
            .eq("id", orderedIds[i])
            .eq("category_slug", slug);

        if (error) return { ok: false, error: error.message };
    }

    revalidateCategory(slug);
    return { ok: true };
}
