import { getSettings } from "@/app/actions/settings-actions";
import WhoWeWorkWithClient from "./WhoWeWorkWithClient";

export default async function WhoWeWorkWithSettingsPage() {
    const data = await getSettings("who_we_work_with");
    return <WhoWeWorkWithClient initial={data as { intro: string }} />;
}
