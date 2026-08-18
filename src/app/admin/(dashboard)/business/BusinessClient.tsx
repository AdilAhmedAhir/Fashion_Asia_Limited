"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList } from "@/components/admin/SettingsForm";

export interface BusinessData {
    processTitle: string;
    processSteps: string[];
    whatWeDoTagline: string;
    whatWeDoText: string;
    products: string[];
}

export default function BusinessClient({ initial }: { initial: BusinessData }) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();

    const set = <K extends keyof BusinessData>(k: K, v: BusinessData[K]) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        await updateSettings("business", data as unknown as Record<string, unknown>);
    });

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="What We Do" onSave={save} saving={isPending} />

            <SettingsCard title="Our Craft">
                <div className="flex flex-col gap-6">
                    <TextInput label="Heading" value={data.processTitle} onChange={v => set("processTitle", v)} />
                    <ChipList label="Process Steps (shown in order, joined by arrows)" items={data.processSteps} onChange={v => set("processSteps", v)} />
                    <TextInput label="Closing Line" value={data.whatWeDoTagline} onChange={v => set("whatWeDoTagline", v)} />
                </div>
            </SettingsCard>

            <SettingsCard title="Product Catalog">
                <div className="flex flex-col gap-6">
                    <TextArea label="Intro Copy — leave a blank line between paragraphs" value={data.whatWeDoText} onChange={v => set("whatWeDoText", v)} rows={10} />
                    <ChipList label="Products" items={data.products} onChange={v => set("products", v)} />
                </div>
            </SettingsCard>
        </div>
    );
}
