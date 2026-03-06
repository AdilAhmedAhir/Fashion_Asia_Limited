"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================
// SETTINGS CRUD
// ============================================

export async function getSettings(key: string) {
    const supabase = await createClient();
    const { data } = await supabase.from("site_settings").select("value").eq("key", key).single();
    return data?.value || {};
}

export async function updateSettings(key: string, value: Record<string, unknown>) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("site_settings")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    // Revalidate both admin and public pages
    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath(`/${key.replace("_", "-")}`);
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
    revalidatePath("/reports");
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
    revalidatePath("/reports");
}

export async function deleteReport(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reports");
    revalidatePath("/reports");
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
