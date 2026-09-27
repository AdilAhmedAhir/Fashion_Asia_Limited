"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList, ObjectListEditor } from "@/components/admin/SettingsForm";
import type { Product } from "@/lib/site-content";

export interface BusinessData {
    processTitle: string;
    processSteps: string[];
    whatWeDoTagline: string;
    whatWeDoText: string;
    products: Product[];
}

export default function BusinessClient({ initial }: { initial: BusinessData }) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof BusinessData>(k: K, v: BusinessData[K]) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        setError(null);
        try {
            const result = await updateSettings("business", data as unknown as Record<string, unknown>);
            if (!result.ok) setError(result.error);
        } catch {
            setError("Something went wrong saving these changes. Check your connection and try again.");
        }
    });

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="What We Do" onSave={save} saving={isPending} error={error} />

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
                    <ObjectListEditor
                        label="Product Cards"
                        items={data.products}
                        onChange={v => set("products", v)}
                        addLabel="Add Product"
                        fields={[
                            { key: "title", label: "Title" },
                            { key: "description", label: "Short Description (optional — hidden when blank)", type: "textarea" },
                            { key: "image", label: "Card image", type: "image" },
                        ]}
                    />
                </div>
            </SettingsCard>
        </div>
    );
}
