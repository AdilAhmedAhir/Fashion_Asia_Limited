import { getAllCategoryProducts } from "@/app/actions/products-actions";
import { readSettingsForEditor } from "@/lib/settings-read";
import { normalizeProducts } from "@/lib/site-content";
import ProductsClient, { type ProductsLoad } from "./ProductsClient";

/**
 * @purpose The /admin/products page (T-026): loads the categories, failing closed, together with every category's products, for the editor.
 *
 * Behind the /admin gate in src/lib/supabase/middleware.ts, like every admin
 * page. The category read is readSettingsForEditor, not getSettings: a failed
 * read here must turn editing off, never hand the editor the code defaults.
 */
export default async function AdminProductsPage() {
    // Two independent reads in parallel: the categories from
    // site_settings.business, and every product in one query, grouped by
    // category (T-004). Neither rejects: each answers { ok: false } when its
    // read fails (T-016), so a failure never lands on Next's error page.
    const [business, products] = await Promise.all([
        readSettingsForEditor("business"),
        getAllCategoryProducts(),
    ]);

    // Stored rows may still hold the old string list; the editor needs objects.
    // A failed category read turns the whole page off. A failed product read
    // turns off only the products, in ProductsClient.
    const load: ProductsLoad = business.ok
        ? { ok: true, categories: normalizeProducts(business.value.products), products }
        : { ok: false };

    return <ProductsClient load={load} />;
}
