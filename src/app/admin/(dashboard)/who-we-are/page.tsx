import { getSettings, getLeaders } from "@/app/actions/settings-actions";
import WhoWeAreClient from "./WhoWeAreClient";

export default async function WhoWeAreSettingsPage() {
    const settings = await getSettings("who_we_are");
    const leaders = await getLeaders();
    return <WhoWeAreClient settings={settings} leaders={leaders} />;
}
