"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList, StatsList } from "@/components/admin/SettingsForm";

interface HomepageData {
    heroTagline: string;
    heroSubtitle: string;
    aboutTag: string;
    aboutTitle: string;
    aboutDescription: string;
    aboutStats: { value: string; label: string }[];
    businessTag: string;
    businessTitle: string;
    businessDescription: string;
    businessProducts: string[];
    businessStats: { value: string; label: string }[];
    sustainabilityTag: string;
    sustainabilityTitle: string;
    sustainabilityDescription: string;
    sustainabilityCerts: string[];
    sustainabilityHighlights: { icon: string; label: string }[];
    scaleStats: { value: string; label: string }[];
    contactCards: { label: string; value: string }[];
}

export default function HomepageSettingsClient({ initial }: { initial: HomepageData }) {
    const [data, setData] = useState<HomepageData>(initial);
    const [isPending, startTransition] = useTransition();

    const set = <K extends keyof HomepageData>(key: K, val: HomepageData[K]) =>
        setData(prev => ({ ...prev, [key]: val }));

    const save = () => startTransition(async () => {
        await updateSettings("homepage", data as unknown as Record<string, unknown>);
    });

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="Homepage" onSave={save} saving={isPending} />

            <SettingsCard title="Hero Section">
                <div className="flex flex-col gap-6">
                    <TextInput label="Tagline" value={data.heroTagline} onChange={v => set("heroTagline", v)} />
                    <TextArea label="Subtitle" value={data.heroSubtitle} onChange={v => set("heroSubtitle", v)} rows={3} />
                </div>
            </SettingsCard>

            <SettingsCard title="About Preview">
                <div className="flex flex-col gap-6">
                    <TextInput label="Tag" value={data.aboutTag} onChange={v => set("aboutTag", v)} />
                    <TextInput label="Title" value={data.aboutTitle} onChange={v => set("aboutTitle", v)} />
                    <TextArea label="Description" value={data.aboutDescription} onChange={v => set("aboutDescription", v)} />
                    <StatsList label="Stats" items={data.aboutStats} onChange={v => set("aboutStats", v)} />
                </div>
            </SettingsCard>

            <SettingsCard title="Business Preview">
                <div className="flex flex-col gap-6">
                    <TextInput label="Tag" value={data.businessTag} onChange={v => set("businessTag", v)} />
                    <TextInput label="Title" value={data.businessTitle} onChange={v => set("businessTitle", v)} />
                    <TextArea label="Description" value={data.businessDescription} onChange={v => set("businessDescription", v)} />
                    <ChipList label="Products" items={data.businessProducts} onChange={v => set("businessProducts", v)} />
                    <StatsList label="Stats" items={data.businessStats} onChange={v => set("businessStats", v)} />
                </div>
            </SettingsCard>

            <SettingsCard title="Sustainability Preview">
                <div className="flex flex-col gap-6">
                    <TextInput label="Tag" value={data.sustainabilityTag} onChange={v => set("sustainabilityTag", v)} />
                    <TextInput label="Title" value={data.sustainabilityTitle} onChange={v => set("sustainabilityTitle", v)} />
                    <TextArea label="Description" value={data.sustainabilityDescription} onChange={v => set("sustainabilityDescription", v)} />
                    <ChipList label="Certifications" items={data.sustainabilityCerts} onChange={v => set("sustainabilityCerts", v)} />
                    <StatsList label="Highlights (icon + label)" items={data.sustainabilityHighlights as unknown as { value: string; label: string }[]} onChange={v => set("sustainabilityHighlights", v as unknown as { icon: string; label: string }[])} />
                </div>
            </SettingsCard>

            <SettingsCard title="Scale Stats">
                <StatsList label="Main Statistics" items={data.scaleStats} onChange={v => set("scaleStats", v)} />
            </SettingsCard>

            <SettingsCard title="Contact Preview">
                <StatsList label="Info Cards" items={data.contactCards as unknown as { value: string; label: string }[]} onChange={v => set("contactCards", v as unknown as { label: string; value: string }[])} />
            </SettingsCard>
        </div>
    );
}
