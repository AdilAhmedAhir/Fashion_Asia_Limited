import { getSettings } from "@/app/actions/settings-actions";
import { getAllCategoryProducts } from "@/app/actions/products-actions";
import { normalizeProducts } from "@/lib/site-content";
import BusinessClient, { type BusinessData } from "./BusinessClient";

export default async function BusinessSettingsPage() {
    // One query grouped by category_slug for every category's products,
    // alongside the existing category-list read — two independent reads, run
    // in parallel rather than one blocking the other (docs/ROADMAP.md T-004).
    const [data, productsByCategory] = await Promise.all([
        getSettings("business"),
        getAllCategoryProducts(),
    ]);
    // Stored rows may still hold the old string list; the editor needs objects.
    return (
        <BusinessClient
            initial={{ ...data, products: normalizeProducts(data.products) } as BusinessData}
            initialProductsByCategory={productsByCategory}
        />
    );
}
