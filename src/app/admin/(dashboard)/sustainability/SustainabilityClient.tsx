"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextArea, ChipList, ListEditor } from "@/components/admin/SettingsForm";

interface SustainabilityData {
    description: string;
    certifications: string[];
    initiatives: string[];
}

export default function SustainabilityClient({ initial }: { initial: SustainabilityData }) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();

    const set = <K extends keyof SustainabilityData>(k: K, v: SustainabilityData[K]) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        await updateSettings("sustainability", data as unknown as Record<string, unknown>);
    });

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="Sustainability" onSave={save} saving={isPending} />

            <SettingsCard title="Main Content">
                <TextArea label="Overview Description" value={data.description} onChange={v => set("description", v)} rows={5} />
            </SettingsCard>

            <SettingsCard title="Certifications & Audits">
                <ChipList label="Certifications" items={data.certifications} onChange={v => set("certifications", v)} />
            </SettingsCard>

            <SettingsCard title="Key Initiatives">
                <ListEditor label="Initiative Descriptions" items={data.initiatives} onChange={v => set("initiatives", v)} />
            </SettingsCard>
        </div>
    );
}
