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
import { unstable_rethrow } from "next/navigation";
import { readSettingsForEditor } from "@/lib/settings-read";
import { actionFailure, logActionError } from "@/lib/action-errors";
import {
    hasVisibleText,
    isAllowedImageUrl,
    normalizeProducts,
    readStoredCategoryIdentities,
    isWellFormedSlug,
    type CategoryProduct,
    type CategoryProductInput,
    type CategoryProductPatch,
} from "@/lib/site-content";
import { PRODUCTS_PATH, categoryPath } from "@/lib/nav";

export type ProductActionResult =
    | { ok: true; product: CategoryProduct }
    | { ok: false; error: string };

export type ProductVoidResult = { ok: true } | { ok: false; error: string };

/**
 * @purpose Every product grouped by category, or a failed read that an editor must not mistake for an empty catalog.
 * A Map, never a plain object: a category slugged "constructor" is just
 * another key, and React passes a Map to a client component intact (it
 * refuses a null-prototype object). `ok: false` carries no error text,
 * like EditorSettingsRead (settings-read.ts); the read has logged it.
 */
export type AllProductsRead = { ok: true; byCategory: Map<string, CategoryProduct[]> } | { ok: false };

// The answers these actions give (T-016). Not exported: a "use server" file
// exports only its async functions, because every export is an endpoint.
const SESSION_EXPIRED = "Your session expired. Sign in again and retry.";
const PRODUCT_NOT_FOUND = "Product not found.";
const PRODUCT_NAME_REQUIRED = "A product needs a name. Type one in, then try again.";
const PRODUCT_IMAGE_REQUIRED = "A product needs an image. Upload one or paste its path, then try again.";
const NOTHING_TO_SAVE = "Nothing was saved. Reload the page, then try again.";
const CATEGORY_CHECK_FAILED = "Nothing was saved, because the category couldn't be checked. Try again in a moment.";

// The longest a product name can be, in code points. It mirrors
// products.name VARCHAR(255) (db/migrations/0001_products-within-category.sql),
// which Postgres counts in characters, so it's a schema limit, not a policy
// number. A longer name is refused, never cut (T-014, SEC-INFO-15).
const MAX_PRODUCT_NAME_LENGTH = 255;
const PRODUCT_NAME_TOO_LONG = `A product name can be at most ${MAX_PRODUCT_NAME_LENGTH} characters. Shorten it, then try again.`;
// An image address isAllowedImageUrl refuses (T-014).
const PRODUCT_IMAGE_INVALID = "This image path can't be used. Upload the image, or paste a path that starts with https://, then try again.";
// A reorder that wasn't saved (T-013).
const REORDER_STALE = "The products in this category changed since the page loaded, so the new order wasn't saved. Reload the page and try again.";
const REORDER_FAILED = "The new order couldn't be saved, so nothing changed. Try again in a moment.";
const REORDER_PARTIAL = "The new order was only partly saved. Reload the page to see the current order, then try again.";

// The only fields an edit can write (T-016, partial update).
const PATCH_FIELDS = ["name", "description", "image"] as const;

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
    | { attachable: false; reason: "not_yet_bootstrapped"; title: string }
    | { attachable: false; reason: "unchecked" };

// The one copy of the "category not saved yet" answer (T-026), shared by every
// write below. It names the page and the button staff actually use: categories
// moved from /admin/business to /admin/products, and its Save button is
// "Save categories".
const categoryNotSavedYet = (title: string) =>
    `"${title}" hasn't been saved as a category yet. Open /admin/products and click Save categories once (no other changes needed), then try again.`;

function attachabilityError(attachability: Exclude<CategoryAttachability, { attachable: true }>, categorySlug: string) {
    // Fixed copy for a read that failed (T-032), never the database's text.
    if (attachability.reason === "unchecked") return CATEGORY_CHECK_FAILED;
    return attachability.reason === "not_yet_bootstrapped"
        ? categoryNotSavedYet(attachability.title)
        : `Category "${categorySlug}" does not exist.`;
}

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
//
// It fails closed (T-032). getSettings falls back to the code defaults when
// its read fails, which used to turn a failed read into a misleading "hasn't
// been saved as a category yet". readSettingsForEditor tells the two apart: a
// missing row still reads as the defaults, but a read error, a throw (Next's
// own signals pass through) or a stored value that isn't an object answers
// `unchecked`, and the write is refused. settings-read.ts is server-only and
// not a "use server" module, so importing it adds no endpoint.
async function checkCategoryAttachable(categorySlug: string): Promise<CategoryAttachability> {
    const read = await readSettingsForEditor("business");
    if (!read.ok) return { attachable: false, reason: "unchecked" };
    const business = read.value;

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

// The two pages that show a category's products (T-025): its own page at
// /products/<slug>, and the /products overview, which lists every category's
// products. /what-we-do shows only the category cards, never products, and
// /what-we-do/<slug> now only redirects, so neither is revalidated here.
function revalidateCategory(categorySlug: string) {
    revalidatePath(categoryPath(categorySlug));
    revalidatePath(PRODUCTS_PATH);
}

// A crafted call can send any value as an argument, so each write checks the
// shape of its arguments right after the session check and answers a
// malformed one with a fixed message instead of throwing (QA T-016 I1).
function isPlainObject(value: unknown): boolean {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeInput(input: CategoryProductInput) {
    return {
        name: typeof input.name === "string" ? input.name.trim() : "",
        description: typeof input.description === "string" ? input.description.trim() : "",
        image: typeof input.image === "string" ? input.image.trim() : "",
    };
}

// What an edit may write: name, description and image, each only when it's
// an own property holding a string, trimmed the way sanitizeInput trims.
// Everything else in the payload is ignored: category_slug, sort_order, id,
// any other key, and a field that's null, a number or an object, which is
// never turned into "".
function takePatchFields(patch: unknown): CategoryProductPatch {
    const taken: CategoryProductPatch = {};
    if (typeof patch !== "object" || patch === null) return taken;
    for (const field of PATCH_FIELDS) {
        if (!Object.prototype.hasOwnProperty.call(patch, field)) continue;
        const value: unknown = (patch as Record<string, unknown>)[field];
        if (typeof value === "string") taken[field] = value.trim();
    }
    return taken;
}

// The domain rule for a product (T-016, T-014): its name needs a visible
// character and at most MAX_PRODUCT_NAME_LENGTH code points, and its image a
// visible character and an address isAllowedImageUrl accepts. Checked only
// for the fields given, so an edit that doesn't touch the image can still
// save an older row whose image is empty or predates the rule. The
// description stays optional.
function productFieldsError(fields: CategoryProductPatch): string | null {
    if (fields.name !== undefined) {
        if (!hasVisibleText(fields.name)) return PRODUCT_NAME_REQUIRED;
        // Code points, the way Postgres counts VARCHAR: an emoji counts as one.
        if (Array.from(fields.name).length > MAX_PRODUCT_NAME_LENGTH) return PRODUCT_NAME_TOO_LONG;
    }
    if (fields.image !== undefined) {
        if (!hasVisibleText(fields.image)) return PRODUCT_IMAGE_REQUIRED;
        if (!isAllowedImageUrl(fields.image)) return PRODUCT_IMAGE_INVALID;
    }
    return null;
}

// Rows grouped by category_slug in query order, so each category's list keeps
// the query's sort_order order. A Map, never a plain object (AllProductsRead).
function groupByCategory(rows: CategoryProduct[]): Map<string, CategoryProduct[]> {
    const byCategory = new Map<string, CategoryProduct[]>();
    for (const row of rows) {
        const list = byCategory.get(row.category_slug);
        if (list) list.push(row);
        else byCategory.set(row.category_slug, [row]);
    }
    return byCategory;
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
// exactly like getCategoryProducts — one query for /admin/products (T-026;
// T-004 put it on /admin/business) and the /products overview instead of one
// round trip per category. Same "no auth check, anon-readable" shape as
// getCategoryProducts above; a category with zero products simply has no key
// in the Map rather than an empty list.
//
// It never rejects, except with Next's own control-flow signals (T-016): a
// failed read, a database error or a throw, is logged here and answered with
// { ok: false }, so /admin/products can tell it apart from an empty catalog.
export async function getAllCategoryProducts(): Promise<AllProductsRead> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("category_slug", { ascending: true })
            .order("sort_order", { ascending: true });

        if (error) {
            console.error("products read error:", error);
            return { ok: false };
        }

        return { ok: true, byCategory: groupByCategory((data ?? []) as CategoryProduct[]) };
    } catch (error) {
        // Next's own control-flow signals (cookies() marking the route as
        // rendered per request) must pass straight through, as in
        // settings-read.ts.
        unstable_rethrow(error);
        console.error("products read threw:", error);
        return { ok: false };
    }
}

export async function createCategoryProduct(input: CategoryProductInput): Promise<ProductActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    // The argument's shape: a plain object, with a category_slug that's a
    // string and isn't blank.
    if (!isPlainObject(input)) return { ok: false, error: NOTHING_TO_SAVE };
    const categorySlug = typeof input.category_slug === "string" ? input.category_slug.trim() : "";
    if (!categorySlug) return { ok: false, error: "Missing category." };

    // Before any read (T-016). sanitizeInput turns a non-string name or image
    // into "", which fails here.
    const sanitized = sanitizeInput(input);
    const invalid = productFieldsError({ name: sanitized.name, image: sanitized.image });
    if (invalid) return { ok: false, error: invalid };

    const attachability = await checkCategoryAttachable(categorySlug);
    if (!attachability.attachable) return { ok: false, error: attachabilityError(attachability, categorySlug) };

    // A new product always goes at the end of its category's list, at the
    // current highest position + 1, read here, server-side (T-014,
    // SEC-MED-11). A caller's sort_order is never read, so no caller can put
    // a product first or outside the column's range. If the read fails,
    // nothing is inserted: guessing would put the product first.
    const { data: maxRow, error: maxError } = await supabase
        .from("products")
        .select("sort_order")
        .eq("category_slug", categorySlug)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
    if (maxError) return actionFailure("read", "createCategoryProduct: the position read failed.", maxError);
    const sortOrder = maxRow ? (maxRow.sort_order as number) + 1 : 0;

    const { data, error } = await supabase
        .from("products")
        .insert({ category_slug: categorySlug, ...sanitized, sort_order: sortOrder })
        .select()
        .single();

    if (error) return actionFailure("save", "createCategoryProduct: the insert failed.", error);

    revalidateCategory(categorySlug);
    return { ok: true, product: data as CategoryProduct };
}

// A partial update (T-016): it writes only the name, description and image
// fields present in `patch`, so two tabs editing different fields of one
// product both keep their edit. It never writes category_slug or sort_order,
// so an edit can't move a product or undo a reorder.
export async function updateCategoryProduct(id: string, patch: CategoryProductPatch): Promise<ProductActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (typeof id !== "string" || !id) return { ok: false, error: "Missing product id." };

    const fields = takePatchFields(patch);
    if (fields.name === undefined && fields.description === undefined && fields.image === undefined) {
        return { ok: false, error: NOTHING_TO_SAVE };
    }

    // Before any database read.
    const invalid = productFieldsError(fields);
    if (invalid) return { ok: false, error: invalid };

    // The category comes from the stored row, never from the caller, and the
    // category check below runs on it. A read error is reported as an error,
    // not as "not found", so staff don't add a duplicate of a product that's
    // still there.
    const { data: stored, error: readError } = await supabase
        .from("products")
        .select("category_slug")
        .eq("id", id)
        .maybeSingle();

    if (readError) return actionFailure("read", "updateCategoryProduct: the read failed.", readError);
    if (!stored) return { ok: false, error: PRODUCT_NOT_FOUND };

    const categorySlug = stored.category_slug as string;
    const attachability = await checkCategoryAttachable(categorySlug);
    if (!attachability.attachable) return { ok: false, error: attachabilityError(attachability, categorySlug) };

    const { data, error } = await supabase
        .from("products")
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .maybeSingle();

    if (error) return actionFailure("save", "updateCategoryProduct: the update failed.", error);
    // Deleted (by another tab) between the read and the update.
    if (!data) return { ok: false, error: PRODUCT_NOT_FOUND };

    revalidateCategory(categorySlug);
    return { ok: true, product: data as CategoryProduct };
}

// Removes exactly one product by id — never touches any other product row,
// and never touches site_settings / the parent category at all.
export async function deleteCategoryProduct(id: string): Promise<ProductVoidResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (typeof id !== "string" || !id) return { ok: false, error: "Missing product id." };

    const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .select("category_slug")
        .maybeSingle();

    if (error) return actionFailure("delete", "deleteCategoryProduct: the delete failed.", error);
    if (!data) return { ok: false, error: PRODUCT_NOT_FOUND };

    revalidateCategory(data.category_slug as string);

    return { ok: true };
}

// One product's place in a reorder (T-013): its stored sort_order and its new one.
type SortOrderMove = { id: string; from: number; to: number };

// The reorder's exact-set check (T-013): every entry a string, no duplicates,
// the same count, and each one stored in the category. Indexed, so a hole in
// a crafted array counts as a non-string entry.
function isStoredIdSet(orderedIds: unknown[], stored: Map<string, number>): boolean {
    if (orderedIds.length !== stored.size) return false;
    const seen = new Set<string>();
    for (let i = 0; i < orderedIds.length; i++) {
        const id = orderedIds[i];
        if (typeof id !== "string" || seen.has(id) || !stored.has(id)) return false;
        seen.add(id);
    }
    return true;
}

// Writes one product's sort_order, filtered by its id AND the category, and
// reports how many rows changed. Used for the new order and for the put-backs.
async function writeSortOrder(supabase: SupabaseServerClient, slug: string, id: string, sortOrder: number) {
    const { data, error } = await supabase
        .from("products")
        .update({ sort_order: sortOrder, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("category_slug", slug)
        .select("id");
    return { error, changed: data?.length ?? 0 };
}

// Writes the moves one at a time; each must change exactly one row. On an
// error, or a write that changed no row, it logs that, then puts every row
// already written back to its stored sort_order, newest first.
async function writeSortOrders(supabase: SupabaseServerClient, slug: string, moves: SortOrderMove[]): Promise<ProductVoidResult> {
    const written: SortOrderMove[] = [];
    for (const move of moves) {
        const { error, changed } = await writeSortOrder(supabase, slug, move.id, move.to);
        if (!error && changed === 1) {
            written.push(move);
            continue;
        }
        if (error) logActionError("reorderCategoryProducts: an update failed.", error);
        else logActionError("reorderCategoryProducts: an update didn't change exactly one row.", { changed });

        // Every put-back is tried, even after one fails.
        let allPutBack = true;
        for (let i = written.length - 1; i >= 0; i--) {
            const back = await writeSortOrder(supabase, slug, written[i].id, written[i].from);
            if (back.error) logActionError("reorderCategoryProducts: a put-back failed.", back.error);
            else if (back.changed !== 1) logActionError("reorderCategoryProducts: a put-back didn't change exactly one row.", { changed: back.changed });
            if (back.error || back.changed !== 1) allPutBack = false;
        }
        if (!allPutBack) return { ok: false, error: REORDER_PARTIAL };
        // A write that changed no row: the product left this category (another
        // tab deleted it) after the exact-set check.
        return { ok: false, error: error ? REORDER_FAILED : REORDER_STALE };
    }
    return { ok: true };
}

// Persists staff-set order for one category's products (T-013, the Wave 2
// contract's item 9). `orderedIds` must be exactly the ids stored in that
// category, front to back, and each id's sort_order becomes its index. There
// is no upsert and no database function: an upsert would create a blank row
// for an id deleted in the meantime. Only the rows whose position changes are
// written, one at a time, each filtered by id and category; if one fails, the
// rows already written are put back. If a write and its put-back both fail,
// the category keeps a mixed order until the next reorder, and
// REORDER_PARTIAL tells staff to reload (the contract's accepted residual).
export async function reorderCategoryProducts(categorySlug: string, orderedIds: string[]): Promise<ProductVoidResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const slug = typeof categorySlug === "string" ? categorySlug.trim() : "";
    if (!slug) return { ok: false, error: "Missing category." };
    if (!Array.isArray(orderedIds) || !orderedIds.length) return { ok: false, error: "Nothing to reorder." };

    const attachability = await checkCategoryAttachable(slug);
    if (!attachability.attachable) return { ok: false, error: attachabilityError(attachability, slug) };

    const { data: rows, error: readError } = await supabase
        .from("products")
        .select("id, sort_order")
        .eq("category_slug", slug);

    if (readError) return actionFailure("read", "reorderCategoryProducts: the read failed.", readError);

    const stored = new Map<string, number>();
    for (const row of rows ?? []) stored.set(row.id as string, row.sort_order as number);
    if (!isStoredIdSet(orderedIds, stored)) return { ok: false, error: REORDER_STALE };

    // Only the rows whose stored sort_order differs from their new place.
    const moves: SortOrderMove[] = [];
    for (let i = 0; i < orderedIds.length; i++) {
        const from = stored.get(orderedIds[i]) as number;
        if (from !== i) moves.push({ id: orderedIds[i], from, to: i });
    }
    if (!moves.length) return { ok: true };

    try {
        return await writeSortOrders(supabase, slug, moves);
    } finally {
        // After any write attempt, saved or not. A throw still propagates.
        revalidateCategory(slug);
    }
}
