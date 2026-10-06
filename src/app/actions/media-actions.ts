"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { MEDIA_ASSETS, hasVisibleText, isAllowedImageUrl, type MediaAsset } from "@/lib/site-content";
import {
    MAX_UPLOAD_BYTES,
    MAX_UPLOAD_DIMENSION,
    describeDimensionLimit,
    formatBytes,
    readImageDimensions,
    sniffImageFormat
} from "@/lib/upload-limits";
import { actionFailure, logActionError } from "@/lib/action-errors";

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

// T-007: the header's width and height couldn't be read, so the upload is
// refused rather than let through unchecked.
const IMAGE_DIMENSIONS_UNREADABLE = "That image's width and height couldn't be read. Export it again as a WebP or JPG, then upload it.";

/**
 * Store one already-optimised image and hand back its public URL.
 *
 * Everything the browser told us is re-checked here, because the form is only a
 * convenience: size, the real format read from the file's own bytes, and the
 * pixel size read from the header (T-007), refused when it can't be read. Files
 * are NOT re-encoded — the brief is to accept optimised images only, so an
 * oversized one is refused with instructions rather than silently shrunk.
 * Nothing is decoded either, and EXIF orientation isn't applied: a rotated
 * photo's width and height come out swapped, but its longest edge, and so the
 * decision, is the same as the browser's.
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

    const dimensions = readImageDimensions(bytes, format);
    if (!dimensions) return { ok: false, error: IMAGE_DIMENSIONS_UNREADABLE };
    if (Math.max(dimensions.width, dimensions.height) > MAX_UPLOAD_DIMENSION) {
        return { ok: false, error: describeDimensionLimit(dimensions.width, dimensions.height) };
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

/**
 * @purpose What the Media Center's add and delete answer (T-019): ok, or the one fixed message the admin sees, never database or storage text.
 */
export type MediaActionResult = { ok: true } | { ok: false; error: string };

// The Media Center's messages (T-019). Private: a caller names none of them,
// so no branch can hand back its own text. SESSION_EXPIRED is word for word
// the other action files'.
const SESSION_EXPIRED = "Your session expired. Sign in again and retry.";
const NOTHING_RECEIVED = "Nothing was received. Reload the page, then try again.";
const MISSING_MEDIA_ID = "Missing media id.";
const MEDIA_TYPE_INVALID = "Choose Photo Gallery or Press / News, then publish again.";
const MEDIA_TITLE_REQUIRED = "Give the item a title, then publish again.";
// Mirrors media_assets.title VARCHAR(255), counted in code points the way
// Postgres counts characters.
const MAX_MEDIA_TITLE_LENGTH = 255;
const MEDIA_TITLE_TOO_LONG = `A title can be at most ${MAX_MEDIA_TITLE_LENGTH} characters. Shorten it, then publish again.`;
const MEDIA_URL_INVALID = "The image address must start with https:// or /. Choose a file instead, or paste its full https:// address, then publish again.";
const GALLERY_IMAGE_REQUIRED = "A gallery photo needs an image. Choose a file or paste its address, then publish again.";
const MEDIA_NOT_FOUND = "Media item not found. Reload the page to see the current list.";
const MEDIA_DELETE_REFUSED = "This item couldn't be deleted, because the database refused the change. Ask your developer to check the gallery's delete permission.";

// The only part of a chosen file's name that reaches its storage key.
const KEY_EXTENSION = /\.[A-Za-z0-9]{1,5}$/;
// A storage name the delete may remove: one bucket-root name starting with a
// letter or digit, so "." and ".." never pass (premortem C7).
const STORAGE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

type Supabase = Awaited<ReturnType<typeof createClient>>;

// A form field's text. Anything that isn't a string, a File included, counts
// as missing.
function textField(formData: FormData, name: string): string {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
}

// Removes one storage file, best effort. An error, or a result that removed
// nothing, is logged on the server and never reaches the admin.
async function removeStoredFile(supabase: Supabase, name: string, context: string): Promise<void> {
    try {
        const { data, error } = await supabase.storage.from("media").remove([name]);
        if (error || !data?.length) logActionError(context, error ?? "no file was removed");
    } catch (error) {
        logActionError(context, error);
    }
}

/**
 * Publish one gallery photo or news item from the Media Center (T-019).
 *
 * The session is checked first, then the form, in order. A chosen file is
 * uploaded to the bucket root and replaces the URL box; this path still has no
 * size or type check (Known Trap #9). A failed upload publishes nothing, and a
 * failed insert removes the file this request uploaded.
 */
export async function addMediaAction(formData: FormData): Promise<MediaActionResult> {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: SESSION_EXPIRED };
    if (!(formData instanceof FormData)) return { ok: false, error: NOTHING_RECEIVED };

    const type = textField(formData, "type");
    if (type !== "gallery" && type !== "news") return { ok: false, error: MEDIA_TYPE_INVALID };

    const title = textField(formData, "title").trim();
    if (!hasVisibleText(title)) return { ok: false, error: MEDIA_TITLE_REQUIRED };
    if (Array.from(title).length > MAX_MEDIA_TITLE_LENGTH) return { ok: false, error: MEDIA_TITLE_TOO_LONG };

    const content = textField(formData, "content");

    const chosen = formData.get("file");
    const file = chosen instanceof File && chosen.size > 0 ? chosen : null;
    let url = "";
    if (!file) {
        url = textField(formData, "url").trim();
        if (url !== "" && !isAllowedImageUrl(url)) return { ok: false, error: MEDIA_URL_INVALID };
        if (url === "" && type === "gallery") return { ok: false, error: GALLERY_IMAGE_REQUIRED };
    }

    let uploadedKey: string | null = null;
    if (file) {
        const extension = KEY_EXTENSION.exec(file.name)?.[0].toLowerCase() ?? "";
        const key = `${Date.now()}_${Math.random().toString(36).substring(7)}${extension}`;
        const { error } = await supabase.storage.from("media").upload(key, file, { upsert: false });
        if (error) return actionFailure("upload", "addMediaAction: the upload failed.", error);
        uploadedKey = key;
        url = supabase.storage.from("media").getPublicUrl(key).data.publicUrl;
    }

    let insertError: unknown = null;
    try {
        insertError = (await supabase.from("media_assets").insert({ type, title, content, url })).error;
    } catch (error) {
        insertError = error ?? "the insert threw";
    }
    if (insertError) {
        if (uploadedKey) {
            await removeStoredFile(supabase, uploadedKey, "addMediaAction: removing the upload after a failed insert failed.");
        }
        return actionFailure("save", "addMediaAction: the insert failed.", insertError);
    }

    revalidatePath("/admin/media");
    revalidatePath("/life-at-fashion-asia");
    return { ok: true };
}

/**
 * Delete one Media Center item (T-019): the row first, then its file, and only
 * a file that's provably ours and unused. The browser's `url` field is never
 * read; the file comes from the row the database hands back.
 */
export async function deleteMediaAction(formData: FormData): Promise<MediaActionResult> {
    const supabase = await createClient();
    const {
        data: { user }
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, error: SESSION_EXPIRED };
    if (!(formData instanceof FormData)) return { ok: false, error: MISSING_MEDIA_ID };

    const id = textField(formData, "id");
    if (id === "") return { ok: false, error: MISSING_MEDIA_ID };

    const { data: deleted, error } = await supabase.from("media_assets").delete().eq("id", id).select("url");
    if (error) return actionFailure("delete", "deleteMediaAction: the delete failed.", error);

    if (!deleted?.length) {
        // RLS turns a refused delete into 0 rows with no error, so look again
        // (premortem C3). None of these answers touches storage or refreshes.
        const { data: remaining, error: readError } = await supabase
            .from("media_assets")
            .select("id")
            .eq("id", id)
            .maybeSingle();
        if (readError) return actionFailure("delete", "deleteMediaAction: the re-read after a 0-row delete failed.", readError);
        if (remaining) {
            logActionError("deleteMediaAction: the database refused the delete.", { id });
            return { ok: false, error: MEDIA_DELETE_REFUSED };
        }
        return { ok: false, error: MEDIA_NOT_FOUND };
    }

    revalidatePath("/admin/media");
    revalidatePath("/life-at-fashion-asia");

    // The item is gone, so the answer is ok whatever the clean-up does.
    await removeFileIfOursAndUnused(supabase, deleted[0]?.url);
    return { ok: true };
}

// Removes a deleted row's file only when it's provably ours and nothing else
// mentions it (contract item 3, premortem C1, C7 and C9). Any doubt keeps the
// file: a kept file is a silent orphan, while a removed file that's still in
// use is a broken image, and Storage has no undo. Nothing here can throw out.
async function removeFileIfOursAndUnused(supabase: Supabase, storedUrl: unknown): Promise<void> {
    try {
        if (typeof storedUrl !== "string") return;

        // Ours only: one bucket-root name whose public URL is exactly the
        // stored one. A foreign host, a query string, a /render/image/ URL, a
        // subfolder or a repo path keeps its file.
        const name = storedUrl.slice(storedUrl.lastIndexOf("/") + 1);
        if (!STORAGE_NAME.test(name)) return;
        if (supabase.storage.from("media").getPublicUrl(name).data.publicUrl !== storedUrl) return;

        // Unused only: every column that holds a file address, as an ilike
        // count (a "_" in the name is a LIKE wildcard, so it can only
        // over-match and keep more), plus every site_settings row searched as
        // JSON text here in code. Never an ilike on the jsonb value (Postgres
        // has none, so it errors) and never a value->>key filter (it misses
        // every other key, homepage.lifeFacilities included).
        const pattern = `%${name}%`;
        const count = (table: string, column: string) =>
            supabase.from(table).select("id", { count: "exact", head: true }).ilike(column, pattern);
        const [assets, products, leaders, reports, settings] = await Promise.all([
            count("media_assets", "url"),
            count("products", "image"),
            count("leaders", "photo_url"),
            count("reports", "file_url"),
            supabase.from("site_settings").select("value"),
        ]);
        for (const check of [assets, products, leaders, reports]) {
            if (check.error || check.count === null) {
                logActionError("deleteMediaAction: a reference check failed, so the file was kept.", check.error ?? "no count");
                return;
            }
            if (check.count !== 0) return;
        }
        if (settings.error || !settings.data?.length) {
            logActionError("deleteMediaAction: the settings check failed, so the file was kept.", settings.error ?? "no settings rows");
            return;
        }
        const mentioned = settings.data.some((row) => {
            const text = JSON.stringify(row?.value);
            return typeof text !== "string" || text.includes(name);
        });
        if (mentioned) return;

        await removeStoredFile(supabase, name, "deleteMediaAction: removing the file failed.");
    } catch (error) {
        logActionError("deleteMediaAction: the file clean-up threw, so the file was kept.", error);
    }
}
