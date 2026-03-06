"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextArea, ChipList, StatsList } from "@/components/admin/SettingsForm";

interface BusinessData {
    products: string[];
    capacityDescription: string;
    capacityStats: { value: string; label: string }[];
    customers: string[];
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
            <SettingsHeader tag="Page Settings" title="Business" onSave={save} saving={isPending} />

            <SettingsCard title="Product Catalog">
                <ChipList label="Products" items={data.products} onChange={v => set("products", v)} />
            </SettingsCard>

            <SettingsCard title="Capacity & Operations">
                <div className="flex flex-col gap-6">
                    <TextArea label="Description" value={data.capacityDescription} onChange={v => set("capacityDescription", v)} rows={4} />
                    <StatsList label="Capacity Stats" items={data.capacityStats} onChange={v => set("capacityStats", v)} />
                </div>
            </SettingsCard>

            <SettingsCard title="Trusted Partners">
                <ChipList label="Customer / Partner Names" items={data.customers} onChange={v => set("customers", v)} />
            </SettingsCard>
        </div>
    );
}
