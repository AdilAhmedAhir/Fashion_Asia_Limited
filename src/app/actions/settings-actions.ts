"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { SITE_SETTINGS } from "@/lib/site-content";

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

export async function updateSettings(key: string, value: Record<string, unknown>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    revalidatePath("/admin");

    // general drives the footer and site metadata, so it has to clear the layout.
    if (key === "general") {
        revalidatePath("/", "layout");
        return;
    }

    revalidatePath("/");
    const route = SETTINGS_ROUTES[key];
    if (route && route !== "/") revalidatePath(route);

    // who_we_are also supplies the culture pillars rendered on /life-at-fashion-asia.
    if (key === "who_we_are") revalidatePath("/life-at-fashion-asia");
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
// REPORTS CRUD
// ============================================

export async function getReports(publishedOnly = false) {
    const supabase = await createClient();
    let query = supabase.from("reports").select("*").order("year", { ascending: false });
    if (publishedOnly) query = query.eq("published", true);
    const { data } = await query;
    return data || [];
}

export async function createReport(formData: FormData) {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const year = parseInt(formData.get("year") as string);
    const published = formData.get("published") === "true";
    const fileUrl = formData.get("file_url") as string;

    const { error } = await supabase.from("reports").insert({
        title, category, year, published, file_url: fileUrl,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
}

export async function updateReport(id: string, formData: FormData) {
    const supabase = await createClient();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const year = parseInt(formData.get("year") as string);
    const published = formData.get("published") === "true";
    const fileUrl = formData.get("file_url") as string;

    const { error } = await supabase.from("reports").update({
        title, category, year, published, file_url: fileUrl,
        updated_at: new Date().toISOString(),
    }).eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
}

export async function deleteReport(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reports");
    revalidatePath("/sustainability");
}

// ============================================
// LEADERS CRUD
// ============================================

export async function getLeaders() {
    const supabase = await createClient();
    const { data } = await supabase.from("leaders").select("*").order("sort_order");
    return data || [];
}

export async function createLeader(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("leaders").insert({
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        photo_url: formData.get("photo_url") as string,
        sort_order: parseInt(formData.get("sort_order") as string || "0"),
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
}

export async function updateLeader(id: string, formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("leaders").update({
        name: formData.get("name") as string,
        title: formData.get("title") as string,
        bio: formData.get("bio") as string,
        photo_url: formData.get("photo_url") as string,
        sort_order: parseInt(formData.get("sort_order") as string || "0"),
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
}

export async function deleteLeader(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("leaders").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/who-we-are");
    revalidatePath("/who-we-are");
}

// ============================================
// FILE UPLOAD (Supabase Storage)
// ============================================

export async function uploadFile(formData: FormData, bucket: string = "uploads") {
    const supabase = await createClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${bucket}/${filename}`;

    const { error } = await supabase.storage.from(bucket).upload(filename, file);
    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return urlData.publicUrl;
}
