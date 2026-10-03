"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    SITE_SETTINGS,
    resolveCategoriesForSave,
    computeRemovedCategories,
    readStoredCategoryIdentities,
    isWellFormedSlug,
    pickWhatWeDoText,
    type ExistingCategoryRef,
    type Product,
    type WhatWeDoText,
} from "@/lib/site-content";
import { PRODUCTS_PATH, categoryPath } from "@/lib/nav";

// ============================================
// SETTINGS CRUD
// ============================================

// Stored values are layered over the defaults in site-content.ts rather than
// replacing them. A row written before a redesign is missing the new fields, so
// returning it raw would hand the page (and the admin editors) undefined arrays.
// Anything the client has actually edited still wins.
export async function getSettings(key: string): Promise<Record<string, any>> {
    const defaults = SITE_SETTINGS[key] ?? {};
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();

    const stored = data?.value;
    if (!stored || typeof stored !== "object" || Array.isArray(stored)) return { ...defaults };

    return { ...defaults, ...(stored as Record<string, unknown>) };
}

// Which public route each settings key actually renders on. Deriving the path
// from the key does not work: String.replace only swaps the first underscore,
// so who_we_work_with became "/who-we_work_with" and the page was never
// revalidated. homepage and general have no page of their own. `business` has
// its own two writers since T-026 (saveCategories and saveWhatWeDoText, below),
// each revalidating its own pages, so it has no entry here.
const SETTINGS_ROUTES: Record<string, string> = {
    homepage: "/",
    who_we_are: "/who-we-are",
    who_we_work_with: "/global-partner",
    sustainability: "/sustainability",
    contact: "/contact"
};

// Failure-reporting convention (docs/TECH_STACK.md "Server Action
// failure-reporting convention", 2026-09-27; docs/SECURITY.md SEC-HIGH-4;
// T-012): every failure RETURNS a typed result — never throws — including a
// reported Supabase `error`, matching products-actions.ts. Every caller must
// check `.ok` — awaiting this and ignoring the result is a bug.
export type UpdateSettingsResult = { ok: true } | { ok: false; error: string };

// Saves one whole settings row for every page editor except What We Do and
// Products. It replaces the row's whole value, which is why it must never
// write `business` (T-026): that row is shared by two editors, and each one
// owns only its own fields (saveCategories and saveWhatWeDoText, below).
export async function updateSettings(key: string, value: Record<string, unknown>): Promise<UpdateSettingsResult> {
    const supabase = await createClient();

    // Every write action checks for an authenticated session server-side, in
    // addition to RLS (matches the existing uploadOptimizedImage/
    // importBuiltInGallery/seedSettingsFromDefaults pattern in this
    // codebase) — updateSettings previously had no such check.
    const {
        data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    // A What We Do tab left open from before T-026 still calls this with the
    // page's whole old value, categories included. Refused outright, with
    // wording that makes sense on that old screen.
    if (key === "business") return { ok: false, error: BUSINESS_MOVED };

    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return { ok: false, error: error.message };

    revalidatePath("/admin");

    // general drives the footer and site metadata, so it has to clear the layout.
    if (key === "general") {
        revalidatePath("/", "layout");
        return { ok: true };
    }

    revalidatePath("/");
    const route = SETTINGS_ROUTES[key];
    if (route && route !== "/") revalidatePath(route);

    // who_we_are also supplies the culture pillars rendered on /life-at-fashion-asia.
    if (key === "who_we_are") revalidatePath("/life-at-fashion-asia");

    return { ok: true };
}

// The "Sync content from code" result: which keys were written, or why not.
type SeedResult = { ok: true; seeded: string[] } | { ok: false; error: string };

// Writes the defaults from site-content.ts into site_settings for the named
// keys. Used after a redesign, when the stored rows still hold copy written
// against the previous page structure.
//
// Fields the code defines overwrite what is stored, but fields that exist only
// in the stored row are carried over untouched — a plain upsert would replace
// the whole JSON blob and silently drop them.
//
// `business` is the exception (T-026): only its 4 What We Do text fields are
// reset, through the same compare-and-swap writer as the page's own Save. Its
// categories are never touched: overlaying the code's default list used to
// wipe every category's id and every category staff had added.
export async function seedSettingsFromDefaults(keys: string[]): Promise<SeedResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    // Own keys only, so "constructor" and friends can't match Object.prototype.
    const targets = Array.isArray(keys)
        ? [...new Set(keys.filter(key => typeof key === "string" && Object.prototype.hasOwnProperty.call(SITE_SETTINGS, key)))]
        : [];
    if (!targets.length) return { ok: false, error: "No pages selected." };

    const seeded: string[] = [];
    const wholeRows = targets.filter(key => key !== "business");

    if (wholeRows.length) {
        // A failed read must stop the sync: treating it as "nothing stored"
        // would drop every stored-only field from these rows.
        const { data: existing, error: readError } = await supabase
            .from("site_settings")
            .select("key,value")
            .in("key", wholeRows);

        if (readError) return { ok: false, error: readError.message };

        const stored = new Map<string, Record<string, unknown>>(
            (existing ?? []).map(row => [row.key as string, isPlainObject(row.value) ? row.value : {}])
        );

        const now = new Date().toISOString();
        const rows = wholeRows.map(key => ({
            key,
            value: { ...(stored.get(key) ?? {}), ...SITE_SETTINGS[key] },
            updated_at: now
        }));

        const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
        if (error) return { ok: false, error: error.message };
        seeded.push(...wholeRows);
    }

    if (targets.includes("business")) {
        const defaults = pickWhatWeDoText(SITE_SETTINGS.business);
        const result: ActionResult = defaults.ok
            ? await writeBusinessFields(supabase, stored => ({ ok: true, value: { ...stored, ...defaults.value } }))
            : { ok: false, error: defaults.error };

        if (!result.ok) {
            if (!seeded.length) return result;
            revalidatePath("/admin");
            revalidatePath("/", "layout");
            return { ok: false, error: `Synced ${seeded.join(", ")}, but not the What We Do page text: ${result.error}` };
        }
        seeded.push("business");
    }

    revalidatePath("/admin");
    revalidatePath("/", "layout");

    return { ok: true, seeded };
}

// ============================================
// SHARED BY THE WRITES BELOW (AND seedSettingsFromDefaults ABOVE)
// ============================================
//
// T-015 (docs/SECURITY.md SEC-HIGH-5 + SEC-MED-10). These writes follow
// docs/TECH_STACK.md's "Server Action failure-reporting convention": every
// expected failure (no session, not found, a reported Supabase error) is
// RETURNED as {ok:false, error}, never thrown. Next.js redacts a thrown
// Server Action message in production, so a throw reached the admin as
// nothing useful. Same shape as UpdateSettingsResult above and
// products-actions.ts's ProductVoidResult. Every caller must check `.ok`.
export type ActionResult = { ok: true } | { ok: false; error: string };

// uploadFile's public URL travels inside the ok branch.
export type UploadFileResult = { ok: true; url: string } | { ok: false; error: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Byte-for-byte the string updateSettings and products-actions.ts return.
const SESSION_EXPIRED = "Your session expired. Sign in again and retry.";

// Every write action checks for an authenticated session server-side, in
// addition to RLS. An exported "use server" function can be called by its
// action ID from anywhere, not only from the /admin page that imports it, so
// the middleware's /admin page gate doesn't protect it. Same helper as
// products-actions.ts's requireUser(); it runs before any read or write.
async function requireUser(supabase: SupabaseServerClient) {
    const {
        data: { user }
    } = await supabase.auth.getUser();
    return user;
}

// ============================================
// WHAT WE DO + PRODUCTS: site_settings[key='business'] (T-026)
// ============================================
//
// Two admin pages store into this one row, so it has one writer per field
// (docs/DECISIONS.md, 2026-10-03, the T-026 save contract):
// - `products` (the CATEGORIES; see the naming-quirk note in docs/DOMAIN.md)
//   is written only by saveCategories (/admin/products);
// - processTitle, processSteps, whatWeDoTagline and whatWeDoText are written
//   only by saveWhatWeDoText (/admin/business), and reset by
//   seedSettingsFromDefaults;
// - any other stored key has no writer: both saves carry it through untouched.
// Each save merges onto a fresh server read of the raw row and writes with a
// compare-and-swap on that row's updated_at (writeBusinessFields), so a stale
// tab of one page can never wipe the other page's edits. Two stale tabs of the
// SAME page stay last-writer-wins on that page's own fields (the accepted
// limitation); the category ids and the delete guard still stop that from ever
// orphaning products.
//
// Nothing in this section except the two save actions is exported: every
// export of a "use server" file is a public endpoint (docs/STACK.md §5).

const SAVE_CONFLICT = "Another save changed these settings at the same moment, so nothing was saved. Click Save again.";

const BUSINESS_MOVED =
    "Nothing was saved. This editor has moved: copy anything you typed, reload, and edit categories under Admin → Products.";

// The row exists but its value isn't a plain object, or its stamp is
// unreadable. Only a direct database edit can cause that, and merging onto it
// would guess, so the save stops instead.
const BUSINESS_UNREADABLE =
    "The saved What We Do settings couldn't be read, so nothing was saved. Reload the page and try again. If this keeps happening, the stored settings need a developer to check them.";

type StoredBusinessValue = Record<string, unknown>;
type BuildResult = { ok: true; value: StoredBusinessValue } | { ok: false; error: string };

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

// The one writer for site_settings[key='business']. Private on purpose.
//
// 1. One fresh read of the RAW row: `value` is the merge base handed to
//    `build`, and `updated_at` is the swap condition, so the category ids,
//    the delete guard and the swap all come from the same read. Never
//    getSettings(): its code defaults would get frozen into storage.
// 2. `build(stored)` returns the complete new value, or a refusal.
// 3. The write changes the row only if it still carries the exact stamp read
//    in step 1. The stamp goes back exactly as PostgREST returned it, never
//    through a JS Date, which would drop its microseconds and never match.
//    `.select("key")` then counts the changed rows: 0 means another save got
//    there first (or something else blocked the row), and the save fails
//    closed with SAVE_CONFLICT. There's no automatic retry.
// 4. A missing row is inserted, never upserted, so a row another save created
//    in the meantime (unique violation 23505) is a conflict, not an overwrite.
//
// `ok: true` only follows a confirmed changed row. Callers revalidate only
// after that.
async function writeBusinessFields(
    supabase: SupabaseServerClient,
    build: (stored: StoredBusinessValue) => BuildResult | Promise<BuildResult>,
): Promise<ActionResult> {
    const { data: row, error: readError } = await supabase
        .from("site_settings")
        .select("value, updated_at")
        .eq("key", "business")
        .maybeSingle();

    if (readError) return { ok: false, error: readError.message };

    if (row && !isPlainObject(row.value)) {
        console.error("writeBusinessFields: the stored business value is not an object, so nothing was saved.", {
            valueType: row.value === null ? "null" : Array.isArray(row.value) ? "array" : typeof row.value,
        });
        return { ok: false, error: BUSINESS_UNREADABLE };
    }

    const readStamp: unknown = row ? row.updated_at : null;
    if (row && readStamp !== null && typeof readStamp !== "string") {
        console.error("writeBusinessFields: the stored updated_at is not a string, so nothing was saved.", {
            stampType: typeof readStamp,
        });
        return { ok: false, error: BUSINESS_UNREADABLE };
    }

    const built = await build(row ? (row.value as StoredBusinessValue) : {});
    if (!built.ok) return { ok: false, error: built.error };

    const writtenStamp = new Date().toISOString();

    if (!row) {
        const { data: inserted, error: insertError } = await supabase
            .from("site_settings")
            .insert({ key: "business", value: built.value, updated_at: writtenStamp })
            .select("key");

        if (insertError) {
            if (insertError.code === "23505") {
                console.error("writeBusinessFields: another save created the business row first, so nothing was saved.", {
                    readStamp: null,
                    writtenStamp,
                });
                return { ok: false, error: SAVE_CONFLICT };
            }
            return { ok: false, error: insertError.message };
        }
        if (!inserted?.length) {
            console.error("writeBusinessFields: the insert reported no row, so the save is treated as not done.", {
                readStamp: null,
                writtenStamp,
            });
            return { ok: false, error: SAVE_CONFLICT };
        }
        return { ok: true };
    }

    const update = supabase
        .from("site_settings")
        .update({ value: built.value, updated_at: writtenStamp })
        .eq("key", "business");
    const swap = readStamp === null ? update.is("updated_at", null) : update.eq("updated_at", readStamp as string);
    const { data: changed, error: updateError } = await swap.select("key");

    if (updateError) return { ok: false, error: updateError.message };

    if (!changed?.length) {
        // Diagnostics only (the result is SAVE_CONFLICT either way). If the
        // current stamp still equals the one read, no other save happened:
        // the row was blocked by something else (a policy, a trigger, a stamp
        // format mismatch), which is what the owner's SQL check looks at.
        const { data: current } = await supabase
            .from("site_settings")
            .select("updated_at")
            .eq("key", "business")
            .maybeSingle();
        console.error("writeBusinessFields: the compare-and-swap changed 0 rows, so nothing was saved.", {
            readStamp,
            writtenStamp,
            currentStamp: current ? current.updated_at : "(row not found)",
        });
        return { ok: false, error: SAVE_CONFLICT };
    }

    return { ok: true };
}

// saveCategories' result carries the list exactly as stored, server-issued
// ids and frozen slugs included, so the editor can adopt it as-is.
type SaveCategoriesResult = { ok: true; categories: Product[] } | { ok: false; error: string };

/**
 * @purpose Save the category list (site_settings.business.products) and nothing else in that row, under every category identity rule.
 *
 * A category's `slug` is its permanent identity and public URL segment
 * (docs/TECH_STACK.md decision (b)); this is the only place that ever assigns
 * or freezes one. Matching is by server-issued `id` alone, never by slug or
 * title (decision (d)): resolveCategoriesForSave never reads a client `.slug`.
 */
export async function saveCategories(categories: Product[]): Promise<SaveCategoriesResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    let resolved: Product[] = [];
    let removed: ExistingCategoryRef[] = [];

    const write = await writeBusinessFields(supabase, async stored => {
        // Every already-stored category's own id, mapped to its frozen
        // {slug, title}, from the same fresh read the swap is guarded by.
        // resolveCategoriesForSave re-validates each one rather than trusting
        // membership alone (docs/QA_REPORT.md T-001 WARN-2).
        const existingById = readStoredCategoryIdentities(stored.products);

        const resolution = resolveCategoriesForSave(categories, existingById);
        if (!resolution.ok) return { ok: false, error: resolution.error };

        // Delete guard (decision (c)): a category whose id was stored but is
        // absent from the resolved list is a real delete, found by id-diff,
        // never slug-diff, so a rename can't look like one and a new slug
        // that matches a just-vacated one can't hide one (closes CRIT-1 /
        // SEC-HIGH-3). Refuse the whole save if any removed category still
        // has a product.
        const gone = computeRemovedCategories(existingById, resolution.categories);

        if (gone.length) {
            const { data: remainingProducts, error: countError } = await supabase
                .from("products")
                .select("category_slug")
                .in("category_slug", gone.map(r => r.slug));

            if (countError) return { ok: false, error: countError.message };

            const remainingSlugs = new Set((remainingProducts ?? []).map(row => row.category_slug as string));
            const blocked = gone.filter(r => remainingSlugs.has(r.slug));
            if (blocked.length) {
                const names = blocked.map(r => r.title).join(", ");
                return { ok: false, error: `Remove its products first: "${names}" still has products assigned to it.` };
            }
        }

        resolved = resolution.categories;
        removed = gone;
        return { ok: true, value: { ...stored, products: resolution.categories } };
    });

    if (!write.ok) return write;

    // Only slugs this save resolved or read from storage, never a raw client
    // string, and only well-formed ones (a removed category's stored slug is
    // never re-validated on the way out). /what-we-do and /products show the
    // category cards, each /products/<slug> is a category page, and the
    // sitemap lists one entry per category. Not "/", which shows none of
    // this, and not /what-we-do/<slug>, which only redirects now (T-025).
    revalidatePath("/admin");
    revalidatePath("/what-we-do");
    revalidatePath(PRODUCTS_PATH);
    const slugs = new Set([...resolved.map(c => c.slug), ...removed.map(r => r.slug)]);
    for (const slug of slugs) {
        if (isWellFormedSlug(slug)) revalidatePath(categoryPath(slug));
    }
    revalidatePath("/sitemap.xml");

    return { ok: true, categories: resolved };
}

/**
 * @purpose Save the 4 What We Do page-text fields in site_settings.business and nothing else in that row.
 *
 * pickWhatWeDoText copies exactly those 4 fields out of the input and refuses
 * the whole save if any is missing or mistyped, so the categories stored
 * beside them can't be touched from here.
 */
export async function saveWhatWeDoText(input: WhatWeDoText): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const picked = pickWhatWeDoText(input);
    if (!picked.ok) return { ok: false, error: picked.error };
    const text = picked.value;

    const write = await writeBusinessFields(supabase, stored => ({ ok: true, value: { ...stored, ...text } }));
    if (!write.ok) return write;

    // Only /what-we-do renders these 4 fields; no /products page reads them.
    revalidatePath("/admin");
    revalidatePath("/what-we-do");

    return { ok: true };
}

// ============================================
// REPORTS CRUD
// ============================================

const REPORT_NOT_FOUND = "Report not found. Reload the page to see the current list.";

export async function getReports(publishedOnly = false) {
    const supabase = await createClient();
    let query = supabase.from("reports").select("*").order("year", { ascending: false });
    if (publishedOnly) query = query.eq("published", true);
    const { data } = await query;
    return data || [];
}

export async function createReport(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const year = parseInt(formData.get("year") as string);
    const published = formData.get("published") === "true";
    const fileUrl = formData.get("file_url") as string;

    const { error } = await supabase.from("reports").insert({
        title, category, year, published, file_url: fileUrl,
    });

    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
    return { ok: true };
}

// Updates and deletes ask for the affected row's id back (`.select("id")`) so
// that matching zero rows (deleted in another tab, or a stale id) is reported
// as not-found instead of succeeding silently. Same check as
// products-actions.ts's deleteCategoryProduct. RLS-neutral: the `.eq("id")`
// filter already makes Postgres apply the table's SELECT policies to these
// rows, so returning the id asks for nothing new.
export async function updateReport(id: string, formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing report id." };

    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const year = parseInt(formData.get("year") as string);
    const published = formData.get("published") === "true";
    const fileUrl = formData.get("file_url") as string;

    const { data, error } = await supabase.from("reports").update({
        title, category, year, published, file_url: fileUrl,
        updated_at: new Date().toISOString(),
    }).eq("id", id).select("id").maybeSingle();

    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: REPORT_NOT_FOUND };
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
    return { ok: true };
}

export async function deleteReport(id: string): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing report id." };

    const { data, error } = await supabase.from("reports").delete().eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: REPORT_NOT_FOUND };
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
    return { ok: true };
}

// ============================================
// LEADERS CRUD
// ============================================

const LEADER_NOT_FOUND = "Leader not found. Reload the page to see the current list.";

export async function getLeaders() {
    const supabase = await createClient();
    const { data } = await supabase.from("leaders").select("*").order("sort_order");
    return data || [];
}

export async function createLeader(formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const { error } = await supabase.from("leaders").insert({
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        photo_url: formData.get("photo_url") as string,
        sort_order: parseInt(formData.get("sort_order") as string || "0"),
    });
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
    return { ok: true };
}

export async function updateLeader(id: string, formData: FormData): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing leader id." };

    const { data, error } = await supabase.from("leaders").update({
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        photo_url: formData.get("photo_url") as string,
        sort_order: parseInt(formData.get("sort_order") as string || "0"),
    }).eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: LEADER_NOT_FOUND };
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
    return { ok: true };
}

export async function deleteLeader(id: string): Promise<ActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing leader id." };

    const { data, error } = await supabase.from("leaders").delete().eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: LEADER_NOT_FOUND };
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
    return { ok: true };
}

// ============================================
// FILE UPLOAD (Supabase Storage)
// ============================================

// No size or type check on this path yet (docs/MEMORY_BANK.md Known Trap #9).
export async function uploadFile(formData: FormData, bucket: string = "uploads"): Promise<UploadFileResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const file = formData.get("file");
    if (!file || typeof file === "string") return { ok: false, error: "No file provided." };

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { error } = await supabase.storage.from(bucket).upload(filename, file);
    if (error) return { ok: false, error: error.message };

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return { ok: true, url: urlData.publicUrl };
}
