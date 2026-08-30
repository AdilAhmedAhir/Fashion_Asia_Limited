"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MEDIA_ASSETS, type MediaAsset } from "@/lib/site-content";
import { MAX_UPLOAD_BYTES, formatBytes, sniffImageFormat } from "@/lib/upload-limits";

// The gallery is the built-in photographs plus whatever the client has uploaded
// through the media manager — both, without anyone having to press a button.
//
// Once any built-in has been imported as a real row, the client is curating
// them, so the table takes over completely and deletions stick. Until then the
// built-ins are appended from code, which is what keeps them on the site out of
// the box. Ordering puts uploads first, since built-ins carry a backdated
// created_at and would otherwise bury new photographs.
export async function getMediaAssets(): Promise<MediaAsset[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("media_assets read error:", error);
        return MEDIA_ASSETS as MediaAsset[];
    }

    const stored = (data ?? []) as MediaAsset[];
    const storedUrls = new Set(stored.map(asset => asset.url));
    const anyBuiltInImported = MEDIA_ASSETS.some(asset => storedUrls.has(asset.url));

    if (anyBuiltInImported) return stored;

    return [...stored, ...(MEDIA_ASSETS.filter(asset => !storedUrls.has(asset.url)) as MediaAsset[])];
}

// Adds the built-in photos from site-content.ts to the gallery, skipping any
// whose url is already there. Idempotent, so it is safe to press twice.
export async function importBuiltInGallery() {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data: existing, error: readError } = await supabase.from("media_assets").select("url");
    if (readError) throw new Error(readError.message);

    const present = new Set((existing ?? []).map(row => row.url as string));
    const missing = MEDIA_ASSETS.filter(asset => !present.has(asset.url));

    if (!missing.length) return { added: 0 };

    const { error } = await supabase.from("media_assets").insert(
        missing.map(({ type, title, url, content }) => ({ type, title, url, content }))
    );
    if (error) throw new Error(error.message);

    revalidatePath("/admin/media");
    revalidatePath("/life-at-fashion-asia");

    return { added: missing.length };
}

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Store one already-optimised image and hand back its public URL.
 *
 * Everything the browser told us is re-checked here, because the form is only a
 * convenience: size, and the real format read from the file's own bytes. Files
 * are NOT re-encoded — the brief is to accept optimised images only, so an
 * oversized one is refused with instructions rather than silently shrunk.
 *
 * Uploads go to the existing public `media` bucket under a products/ prefix.
 * That bucket already backs the gallery, so no new bucket has to be created in
 * Supabase for this to work.
 */
export async function uploadOptimizedImage(formData: FormData): Promise<UploadResult> {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: "Your session expired. Sign in again and retry." };

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { ok: false, error: "No file received. Try choosing it again." };
    }

    if (file.size > MAX_UPLOAD_BYTES) {
        return {
            ok: false,
            error: `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — run it through TinyPNG and upload the result.`
        };
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const format = sniffImageFormat(bytes);
    if (!format) {
        return { ok: false, error: "That is not a WebP or JPG image. Convert it first, then upload." };
    }

    const ext = format === "jpeg" ? "jpg" : "webp";
    // Bucket root, matching addMediaAction — that path is proven against this
    // project's storage policy. A products/ prefix would be tidier, but a policy
    // scoped by folder would reject it and this cannot be tested without the
    // client's admin login. The gallery is driven by media_assets, not by
    // listing the bucket, so sharing the root changes nothing on the site.
    const path = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const { error } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: format === "jpeg" ? "image/jpeg" : "image/webp", upsert: false });

    if (error) {
        console.error("image upload error:", error);
        return { ok: false, error: "Upload failed. Please try again." };
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
}

export async function addMediaAction(formData: FormData) {
    const supabase = await createClient();
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    let url = (formData.get("url") as string) || "";

    const file = formData.get("file") as File;

    if (file && file.size > 0) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage.from('media').upload(fileName, file);

        if (data) {
            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName);
            url = publicUrlData.publicUrl;
        } else {
            console.error("[Storage Upload Error]", error);
        }
    }

    const { error } = await supabase.from("media_assets").insert({ type, title, content, url });

    if (error) console.error("[Database Insert Error]", error);

    revalidatePath("/admin/media");
    revalidatePath("/life-at-fashion-asia");
}

export async function deleteMediaAction(formData: FormData) {
    const supabase = await createClient();
    const id = formData.get("id") as string;
    const url = formData.get("url") as string;

    if (url && url.includes('supabase.co')) {
        const fileName = url.split('/').pop();
        if (fileName) {
            await supabase.storage.from('media').remove([fileName]);
        }
    }

    await supabase.from("media_assets").delete().eq("id", id);

    revalidatePath("/admin/media");
    revalidatePath("/life-at-fashion-asia");
}
