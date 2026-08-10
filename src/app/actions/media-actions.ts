"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MEDIA_ASSETS, type MediaAsset } from "@/lib/site-content";

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
    revalidatePath("/media");

    return { added: missing.length };
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
    revalidatePath("/media");
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
    revalidatePath("/media");
}
