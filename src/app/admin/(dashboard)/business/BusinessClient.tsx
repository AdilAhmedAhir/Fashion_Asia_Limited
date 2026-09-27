"use client";

import { useState, useTransition } from "react";
import { getSettings, updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList, ObjectListEditor } from "@/components/admin/SettingsForm";
import { CategoryProductsManager } from "@/components/admin/CategoryProductsManager";
import { normalizeProducts, type CategoryProduct, type Product } from "@/lib/site-content";

export interface BusinessData {
    processTitle: string;
    processSteps: string[];
    whatWeDoTagline: string;
    whatWeDoText: string;
    products: Product[];
}

export default function BusinessClient({ initial, initialProductsByCategory }: {
    initial: BusinessData;
    initialProductsByCategory: Record<string, CategoryProduct[]>;
}) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const set = <K extends keyof BusinessData>(k: K, v: BusinessData[K]) => setData(p => ({ ...p, [k]: v }));

    const save = () => startTransition(async () => {
        setError(null);
        try {
            const result = await updateSettings("business", data as unknown as Record<string, unknown>);
            if (!result.ok) {
                setError(result.error);
                return;
            }
            // A successful save mints an id+slug for every category in the
            // row at once, including ones nobody touched this time
            // (docs/TECH_STACK.md decision (d)'s "legacy (id-less)
            // categories" follow-up) — every category is now attachable.
            // Re-reading rather than guessing the new ids client-side means
            // CategoryProductsManager's "not saved yet" warning below clears
            // the instant it's no longer true, without a full page reload.
            const fresh = await getSettings("business");
            setData(prev => ({ ...prev, products: normalizeProducts(fresh.products) }));
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
                        label="Product Cards (the categories shown on /what-we-do, e.g. T-Shirts, Polo Shirts)"
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

            <SettingsCard title="Products Within Each Category">
                <div className="flex flex-col gap-6">
                    <p className="text-sm leading-relaxed text-white/70">
                        These are the individual items shown on a category&apos;s own page (e.g. every T-shirt style
                        under /what-we-do/t-shirts) — not the category cards above.
                    </p>
                    <CategoryProductsManager categories={data.products} initialProductsByCategory={initialProductsByCategory} />
                </div>
            </SettingsCard>
        </div>
    );
}
