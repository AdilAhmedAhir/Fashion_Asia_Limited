"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MEDIA_ASSETS, type MediaAsset } from "@/lib/site-content";

// Falls back to the static gallery in site-content.ts so the page still renders
// if the table is empty — the admin media manager writes to media_assets.
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

    return data?.length ? (data as MediaAsset[]) : (MEDIA_ASSETS as MediaAsset[]);
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
