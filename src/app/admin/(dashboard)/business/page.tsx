import { getSettings } from "@/app/actions/settings-actions";
import { normalizeProducts } from "@/lib/site-content";
import BusinessClient, { type BusinessData } from "./BusinessClient";

export default async function BusinessSettingsPage() {
    const data = await getSettings("business");
    // Stored rows may still hold the old string list; the editor needs objects.
    return <BusinessClient initial={{ ...data, products: normalizeProducts(data.products) } as BusinessData} />;
}
