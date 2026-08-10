import { getSettings } from "@/app/actions/settings-actions";
import HomepageSettingsClient, { type HomepageData } from "./HomepageSettingsClient";

export default async function HomepageSettingsPage() {
    const data = await getSettings("homepage");
    return <HomepageSettingsClient initial={data as HomepageData} />;
}
