"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, ListEditor } from "@/components/admin/SettingsForm";

export interface SustainabilityData {
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

            <SettingsCard title="Certifications & Audits">
                <p className="text-xs leading-relaxed text-white/40">
                    Certifications are no longer a text list — the page renders the certification
                    artwork instead. To add or remove one, edit the <code className="text-primary">CERTIFICATIONS</code>{" "}
                    array in <code className="text-primary">src/lib/site-content.ts</code> and supply the mark image.
                </p>
            </SettingsCard>

            <SettingsCard title="Key Initiatives">
                <ListEditor label="Initiative Descriptions" items={data.initiatives} onChange={v => set("initiatives", v)} />
            </SettingsCard>
        </div>
    );
}
