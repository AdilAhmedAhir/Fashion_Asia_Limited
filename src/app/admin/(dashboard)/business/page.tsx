import { getSettings } from "@/app/actions/settings-actions";
import BusinessClient from "./BusinessClient";

export default async function BusinessSettingsPage() {
    const data = await getSettings("business");
    return <BusinessClient initial={data} />;
}
