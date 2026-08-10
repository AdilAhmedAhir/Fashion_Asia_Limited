import { getSettings } from "@/app/actions/settings-actions";
import ContactSettingsClient, { type ContactData, type GeneralData } from "./ContactSettingsClient";

export default async function SettingsPage() {
    const contact = await getSettings("contact");
    const general = await getSettings("general");
    return <ContactSettingsClient contact={contact as ContactData} general={general as GeneralData} />;
}
