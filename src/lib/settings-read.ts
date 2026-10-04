/**
 * ============================================================================
 *  SETTINGS READS FOR ADMIN EDITORS (T-026) — server-only, fail-closed
 * ============================================================================
 *
 *  getSettings() (settings-actions.ts) falls back to the code defaults when the
 *  read fails. That's right for public pages, which should always render
 *  something, and wrong for an editor: an editor built from those defaults
 *  after a failed read would save them over the real stored content. This
 *  read tells the two cases apart instead, so /admin/products and
 *  /admin/business build editable state only from a read that succeeded.
 *
 *  Deliberately NOT a "use server" module: every export of one is a public
 *  endpoint (docs/STACK.md §5), and this read must not become one. It's only
 *  reachable from server components. It imports @/lib/supabase/server, which
 *  imports next/headers, so a client component that imported it would fail
 *  the build.
 * ============================================================================
 */

import { unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SITE_SETTINGS } from "@/lib/site-content";

/**
 * @purpose An admin editor's settings read: the stored row layered over the code defaults, or a failure that must not be edited.
 * `ok: true` with only the defaults means the row doesn't exist yet (empty).
 * `ok: false` means the read failed or the stored value isn't an object.
 */
export type EditorSettingsRead = { ok: true; value: Record<string, unknown> } | { ok: false };

/**
 * @purpose Read one site_settings row for an admin editor, telling a failed read apart from a missing row, so an editor is never built from fallback defaults.
 * Same layering as getSettings ({ ...defaults, ...stored }) when it succeeds.
 */
export async function readSettingsForEditor(key: string): Promise<EditorSettingsRead> {
    const defaults = Object.prototype.hasOwnProperty.call(SITE_SETTINGS, key) ? SITE_SETTINGS[key] : {};

    try {
        const supabase = await createClient();
        const { data, error } = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();

        if (error) {
            console.error(`readSettingsForEditor("${key}"): the read failed.`, error);
            return { ok: false };
        }

        // No row yet: the editor starts from the same defaults the public
        // page is showing.
        if (!data) return { ok: true, value: { ...defaults } };

        const stored: unknown = data.value;
        if (typeof stored !== "object" || stored === null || Array.isArray(stored)) {
            console.error(`readSettingsForEditor("${key}"): the stored value is not an object.`);
            return { ok: false };
        }

        return { ok: true, value: { ...defaults, ...(stored as Record<string, unknown>) } };
    } catch (error) {
        // Next's own control-flow signals (cookies() marking the route as
        // rendered per request) must pass straight through, as on /products.
        unstable_rethrow(error);
        console.error(`readSettingsForEditor("${key}"): the read threw.`, error);
        return { ok: false };
    }
}
