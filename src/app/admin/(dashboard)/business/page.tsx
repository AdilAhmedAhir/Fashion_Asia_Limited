import { readSettingsForEditor } from "@/lib/settings-read";
import { pickWhatWeDoText } from "@/lib/site-content";
import BusinessClient, { type WhatWeDoTextLoad } from "./BusinessClient";

// The What We Do page text only (T-026). The categories and their products
// moved to /admin/products, which stores into the same site_settings row.
export default async function BusinessSettingsPage() {
    // readSettingsForEditor, not getSettings: a failed read must turn editing
    // off, never hand the editor the code defaults to save over the real text.
    const read = await readSettingsForEditor("business");

    // The same picker the save uses, so the editor only ever holds the 4
    // fields it may save, and a stored field of the wrong type turns editing
    // off rather than reaching an input.
    const picked = read.ok ? pickWhatWeDoText(read.value) : null;
    if (picked && !picked.ok) {
        console.error("/admin/business: the stored What We Do text has an unexpected shape, so editing is off.");
    }

    const load: WhatWeDoTextLoad = picked?.ok ? { ok: true, text: picked.value } : { ok: false };
    return <BusinessClient load={load} />;
}
