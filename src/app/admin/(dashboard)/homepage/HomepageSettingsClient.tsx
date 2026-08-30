"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList, StatsList, ObjectListEditor } from "@/components/admin/SettingsForm";

type Stat = { value: string; label: string };

export interface HomepageData {
    // Hero
    heroKicker: string;
    heroTitleTop: string;
    heroTitleAccent: string;
    heroFacts: string[];
    heroStats: Stat[];
    heroTagline: string;
    heroSubtitle: string;
    // About preview
    aboutTag: string;
    aboutTitle: string;
    aboutDescription: string;
    aboutStats: Stat[];
    // Business preview
    businessTag: string;
    businessTitle: string;
    businessDescription: string;
    businessProducts: string[];
    businessStats: Stat[];
    // Sustainability preview
    sustainabilityTag: string;
    sustainabilityTitle: string;
    sustainabilityDescription: string;
    sustainabilityCerts: string[];
    sustainabilityHighlights: { icon: string; label: string }[];
    // Scale
    scaleStats: Stat[];
    // Life at Fashion Asia
    lifeTag: string;
    lifeEyebrow: string;
    lifeDescription: string;
    lifeStat: Stat;
    lifeFacilities: { title: string; description: string; image: string }[];
    lifePillars: { title: string; description: string }[];
    // Contact
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
                    <TextInput label="Kicker" value={data.heroKicker} onChange={v => set("heroKicker", v)} />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <TextInput label="Headline (top line)" value={data.heroTitleTop} onChange={v => set("heroTitleTop", v)} />
                        <TextInput label="Headline (accent line)" value={data.heroTitleAccent} onChange={v => set("heroTitleAccent", v)} />
                    </div>
                    <ChipList label="Facts" items={data.heroFacts} onChange={v => set("heroFacts", v)} />
                    <StatsList label="Stat Rail" items={data.heroStats} onChange={v => set("heroStats", v)} />
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
                    <ObjectListEditor
                        label="Highlights"
                        items={data.sustainabilityHighlights}
                        onChange={v => set("sustainabilityHighlights", v)}
                        addLabel="Add Highlight"
                        fields={[
                            { key: "icon", label: "Icon (emoji)" },
                            { key: "label", label: "Label" },
                        ]}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="Scale Stats">
                <StatsList label="Stats" items={data.scaleStats} onChange={v => set("scaleStats", v)} />
            </SettingsCard>

            <SettingsCard title="Life at Fashion Asia">
                <div className="flex flex-col gap-6">
                    <TextInput label="Tag" value={data.lifeTag} onChange={v => set("lifeTag", v)} />
                    <TextArea label="Eyebrow" value={data.lifeEyebrow} onChange={v => set("lifeEyebrow", v)} rows={2} />
                    <TextArea label="Description" value={data.lifeDescription} onChange={v => set("lifeDescription", v)} />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <TextInput label="Headline Stat — Value" value={data.lifeStat?.value ?? ""}
                            onChange={v => set("lifeStat", { ...data.lifeStat, value: v })} />
                        <TextInput label="Headline Stat — Label" value={data.lifeStat?.label ?? ""}
                            onChange={v => set("lifeStat", { ...data.lifeStat, label: v })} />
                    </div>
                    <ObjectListEditor
                        label="Facilities"
                        items={data.lifeFacilities}
                        onChange={v => set("lifeFacilities", v)}
                        addLabel="Add Facility"
                        fields={[
                            { key: "title", label: "Title" },
                            { key: "description", label: "Description", type: "textarea" },
                            { key: "image", label: "Facility photo", type: "image" },
                        ]}
                    />
                    <ObjectListEditor
                        label="Culture Pillars"
                        items={data.lifePillars}
                        onChange={v => set("lifePillars", v)}
                        addLabel="Add Pillar"
                        fields={[
                            { key: "title", label: "Title" },
                            { key: "description", label: "Description", type: "textarea" },
                        ]}
                    />
                </div>
            </SettingsCard>

            <SettingsCard title="Contact Cards">
                <ObjectListEditor
                    label="Cards"
                    items={data.contactCards}
                    onChange={v => set("contactCards", v)}
                    addLabel="Add Card"
                    fields={[
                        { key: "label", label: "Label" },
                        { key: "value", label: "Value" },
                    ]}
                />
            </SettingsCard>
        </div>
    );
}
