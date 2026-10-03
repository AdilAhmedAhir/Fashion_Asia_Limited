// Pure helpers for the /admin/products category editor's draft (T-026). No
// imports but a type, so they run in plain Node too.

import type { Product } from "@/lib/site-content";

// A draft row. Rows added with "Add category" start without `id` or `slug`
// (ObjectListEditor creates only its field keys), which is how the server
// knows they're new.
type DraftCategory = Partial<Product>;

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * @purpose The 1-based row numbers (#n, as the editor labels its rows) of draft categories with a blank title, which a save would treat as deletions.
 */
export function blankTitleRows(draft: readonly DraftCategory[]): number[] {
    const rows: number[] = [];
    draft.forEach((category, i) => {
        if (!text(category.title).trim()) rows.push(i + 1);
    });
    return rows;
}

/**
 * @purpose The message that blocks Save categories while rows are untitled, naming each row (#n).
 */
export function blankTitleMessage(rows: readonly number[]): string {
    const names = rows.map(n => `#${n}`);
    const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "";
    return names.length > 1
        ? `Categories ${list} have no title, so nothing was saved. Give each one a title or remove it, then click Save categories again.`
        : `Category ${list} has no title, so nothing was saved. Give it a title or remove it, then click Save categories again.`;
}

/**
 * @purpose Whether two category lists differ in anything the editor can change: which categories, their order, title, description or image.
 * The slug isn't compared: the editor never changes it, and only the server assigns it.
 */
export function categoriesDiffer(a: readonly DraftCategory[], b: readonly DraftCategory[]): boolean {
    if (a.length !== b.length) return true;
    return a.some((x, i) => {
        const y = b[i];
        return (
            text(x.id) !== text(y.id) ||
            text(x.title) !== text(y.title) ||
            text(x.description) !== text(y.description) ||
            text(x.image) !== text(y.image)
        );
    });
}

/**
 * @purpose Whether any category still lacks its server-issued id, i.e. the categories have never been saved under the id system (the first Save is pending).
 */
export function needsFirstSave(confirmed: readonly DraftCategory[]): boolean {
    return confirmed.some(category => !text(category.id));
}
