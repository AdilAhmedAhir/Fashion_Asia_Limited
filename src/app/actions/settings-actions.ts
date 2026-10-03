"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import {
    SITE_SETTINGS,
    resolveCategoriesForSave,
    computeRemovedCategories,
    readStoredCategoryIdentities,
    type Product,
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
// revalidated. homepage and general have no page of their own.
const SETTINGS_ROUTES: Record<string, string> = {
    homepage: "/",
    who_we_are: "/who-we-are",
    business: "/what-we-do",
    who_we_work_with: "/global-partner",
    sustainability: "/sustainability",
    contact: "/contact"
};

// `business`'s `products` field actually holds CATEGORIES (T-Shirts, Polo
// Shirts, ...) — see the naming-quirk note in docs/TECH_STACK.md. Every
// category's `slug` is its permanent identity and public URL segment
// (docs/TECH_STACK.md decision (b)); this save path is the only place that
// is ever allowed to assign or freeze one.
//
// Failure-reporting convention (docs/TECH_STACK.md "Server Action
// failure-reporting convention", 2026-09-27; docs/SECURITY.md SEC-HIGH-4;
// T-012): every guard failure below RETURNS a typed result — never throws —
// matching the shape src/app/actions/products-actions.ts already uses. This
// includes the Supabase `error` branches (the existing-row read, the
// delete-guard's product count, and the final upsert), not just the
// hand-written app-level guards: products-actions.ts's own precedent
// already treats a reported DB error the same way as a validation guard
// (`return { ok: false, error: error.message }`), never a throw, so doing
// the same here matches that file's shape exactly rather than inventing a
// second convention for "infrastructure" errors. Every caller must check
// `.ok` — awaiting this and ignoring the result is a bug.
export type UpdateSettingsResult = { ok: true } | { ok: false; error: string };

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

    let finalValue: Record<string, unknown> = value;
    let savedCategories: Product[] | null = null;

    if (key === "business") {
        // Re-fetch the currently-persisted row fresh — never trust the
        // client's own copy of what's already stored. If this read itself
        // fails, fail the whole save closed rather than silently treating
        // every category as brand new (which would let an already-frozen
        // slug get silently re-derived from today's title — decision (b)
        // promises a slug is "frozen forever" once assigned).
        const { data: existingRow, error: existingError } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "business")
            .maybeSingle();

        if (existingError) return { ok: false, error: existingError.message };

        const existingValue = existingRow?.value as Record<string, unknown> | undefined;
        const existingProductsRaw: unknown[] = Array.isArray(existingValue?.products)
            ? (existingValue!.products as unknown[])
            : [];

        // Every already-stored category's own internal id, mapped to its
        // frozen {slug, title} — matching is by id alone, never by slug,
        // never by title (docs/TECH_STACK.md decision (d), 2026-09-27).
        // Treated as already-possibly-untrustworthy, not just legacy
        // pre-T-001 rows — the pre-existing, unmodified Save button could
        // already have persisted an unvalidated slug (docs/QA_REPORT.md
        // T-001 WARN-2) — resolveCategoriesForSave() re-validates every
        // one of these for collisions rather than assuming membership alone
        // makes it safe.
        const existingById = readStoredCategoryIdentities(existingProductsRaw);

        const resolution = resolveCategoriesForSave(value.products, existingById);
        if (!resolution.ok) return { ok: false, error: resolution.error };

        // Delete guard (decision (c)): a category whose id existed before
        // this save but is absent from the resolved output is a real
        // delete — identified by id-diff, never slug-diff, so a rename can
        // never be mistaken for one and a freshly-derived slug that happens
        // to match a just-vacated one can never make a real removal
        // invisible (closes CRIT-1 / SEC-HIGH-3). Refuse the entire save if
        // any removed category still has >=1 product row.
        const removed = computeRemovedCategories(existingById, resolution.categories);

        if (removed.length) {
            const removedSlugs = removed.map(r => r.slug);
            const { data: remainingProducts, error: countError } = await supabase
                .from("products")
                .select("category_slug")
                .in("category_slug", removedSlugs);

            if (countError) return { ok: false, error: countError.message };

            const remainingSlugs = new Set((remainingProducts ?? []).map(row => row.category_slug as string));
            const blocked = removed.filter(r => remainingSlugs.has(r.slug));
            if (blocked.length) {
                const names = blocked.map(r => r.title).join(", ");
                return { ok: false, error: `Remove its products first: "${names}" still has products assigned to it.` };
            }
        }

        savedCategories = resolution.categories;
        finalValue = { ...value, products: resolution.categories };
    }

    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value: finalValue, updated_at: new Date().toISOString() }, { onConflict: "key" });

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

    // The /products overview (it shows every category's card) and each
    // category's own page at /products/<slug> (T-025; T-005 put them under
    // /what-we-do/<slug>, which now only redirects), in addition to
    // /what-we-do itself (already covered by SETTINGS_ROUTES above) — built
    // only from the slugs this same save just resolved and validated, never a
    // raw client-supplied string. A category add/rename/delete also changes
    // sitemap.ts's own output (it lists one entry per live category), so the
    // sitemap route is revalidated here too — it was not before T-005, which
    // would have left a stale sitemap between deploys until its own
    // time-based revalidation caught up.
    if (savedCategories) {
        revalidatePath(PRODUCTS_PATH);
        for (const category of savedCategories) {
            revalidatePath(categoryPath(category.slug));
        }
        revalidatePath("/sitemap.xml");
    }

    return { ok: true };
}

// Writes the defaults from site-content.ts into site_settings for the named
// keys. Used after a redesign, when the stored rows still hold copy written
// against the previous page structure.
//
// Fields the code defines overwrite what is stored, but fields that exist only
// in the stored row are carried over untouched — a plain upsert would replace
// the whole JSON blob and silently drop them.
export async function seedSettingsFromDefaults(keys: string[]) {
    if (!keys?.length) throw new Error("No pages selected");

    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const targets = keys.filter(key => SITE_SETTINGS[key]);
    const now = new Date().toISOString();

    const { data: existing } = await supabase
        .from("site_settings")
        .select("key,value")
        .in("key", targets);

    const stored = new Map<string, Record<string, unknown>>(
        (existing ?? []).map(row => [row.key as string, (row.value ?? {}) as Record<string, unknown>])
    );

    const rows = targets.map(key => ({
        key,
        value: { ...(stored.get(key) ?? {}), ...SITE_SETTINGS[key] },
        updated_at: now
    }));

    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
    if (error) throw new Error(error.message);

    revalidatePath("/admin");
    revalidatePath("/", "layout");

    return { seeded: rows.map(r => r.key) };
}

// ============================================
// SHARED BY THE REPORT, LEADER AND UPLOAD WRITES BELOW
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
