import { getSettings } from "@/app/actions/settings-actions";
import SustainabilityClient from "./SustainabilityClient";

export default async function SustainabilitySettingsPage() {
    const data = await getSettings("sustainability");
    return <SustainabilityClient initial={data} />;
}
