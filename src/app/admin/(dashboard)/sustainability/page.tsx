import { getSettings } from "@/app/actions/settings-actions";
import SustainabilityClient, { type SustainabilityData } from "./SustainabilityClient";

export default async function SustainabilitySettingsPage() {
    const data = await getSettings("sustainability");
    return <SustainabilityClient initial={data as SustainabilityData} />;
}
