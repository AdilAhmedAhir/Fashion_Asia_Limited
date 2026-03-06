"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea } from "@/components/admin/SettingsForm";
import { Plus, X } from "lucide-react";

interface ContactData {
    phone: string; email: string; factoryAddress: string; corporateAddress: string;
    mapsUrl: string; socialLinks: { platform: string; url: string }[];
}
interface GeneralData {
    companyName: string; seoTitle: string; seoDescription: string; footerCopyright: string;
}

export default function ContactSettingsClient({ contact: initContact, general: initGeneral }: {
    contact: ContactData; general: GeneralData;
}) {
    const [contact, setContact] = useState<ContactData>(initContact);
    const [general, setGeneral] = useState<GeneralData>(initGeneral);
    const [isPending, startTransition] = useTransition();

    const setC = <K extends keyof ContactData>(k: K, v: ContactData[K]) => setContact(p => ({ ...p, [k]: v }));
    const setG = <K extends keyof GeneralData>(k: K, v: GeneralData[K]) => setGeneral(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        await updateSettings("contact", contact as unknown as Record<string, unknown>);
        await updateSettings("general", general as unknown as Record<string, unknown>);
    });

    const updateSocial = (i: number, field: "platform" | "url", val: string) => {
        const next = [...contact.socialLinks];
        next[i] = { ...next[i], [field]: val };
        setC("socialLinks", next);
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            <SettingsHeader tag="Configuration" title="Contact & General Settings" onSave={save} saving={isPending} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <SettingsCard title="Contact Information">
                    <div className="flex flex-col gap-5">
                        <TextInput label="Phone" value={contact.phone} onChange={v => setC("phone", v)} />
                        <TextInput label="Email" value={contact.email} onChange={v => setC("email", v)} />
                        <TextArea label="Factory Address" value={contact.factoryAddress} onChange={v => setC("factoryAddress", v)} rows={2} />
                        <TextArea label="Corporate Address" value={contact.corporateAddress} onChange={v => setC("corporateAddress", v)} rows={2} />
                        <TextInput label="Google Maps URL" value={contact.mapsUrl} onChange={v => setC("mapsUrl", v)} />
                    </div>
                </SettingsCard>

                <SettingsCard title="General Settings">
                    <div className="flex flex-col gap-5">
                        <TextInput label="Company Name" value={general.companyName} onChange={v => setG("companyName", v)} />
                        <TextInput label="SEO Default Title" value={general.seoTitle} onChange={v => setG("seoTitle", v)} />
                        <TextArea label="SEO Meta Description" value={general.seoDescription} onChange={v => setG("seoDescription", v)} rows={3} />
                        <TextInput label="Footer Copyright" value={general.footerCopyright} onChange={v => setG("footerCopyright", v)} />
                    </div>
                </SettingsCard>
            </div>

            <SettingsCard title="Social Media Links">
                <div className="flex flex-col gap-4">
                    {(contact.socialLinks || []).map((link, i) => (
                        <div key={i} className="grid grid-cols-[160px_1fr_auto] gap-3 items-center">
                            <select value={link.platform} onChange={e => updateSocial(i, "platform", e.target.value)}
                                className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none">
                                <option value="">Platform</option>
                                <option value="facebook">Facebook</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="twitter">Twitter / X</option>
                                <option value="instagram">Instagram</option>
                                <option value="youtube">YouTube</option>
                            </select>
                            <input type="text" value={link.url} onChange={e => updateSocial(i, "url", e.target.value)} placeholder="https://..."
                                className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                            <button onClick={() => setC("socialLinks", contact.socialLinks.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-2"><X size={14} /></button>
                        </div>
                    ))}
                    <button onClick={() => setC("socialLinks", [...(contact.socialLinks || []), { platform: "", url: "" }])}
                        className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                        <Plus size={14} /> Add Social Link
                    </button>
                </div>
            </SettingsCard>
        </div>
    );
}
