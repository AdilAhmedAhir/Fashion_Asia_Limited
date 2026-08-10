"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextArea } from "@/components/admin/SettingsForm";

interface WhoWeWorkWithData {
    intro: string;
}

export default function WhoWeWorkWithClient({ initial }: { initial: WhoWeWorkWithData }) {
    const [data, setData] = useState(initial);
    const [isPending, startTransition] = useTransition();

    const save = () => startTransition(async () => {
        await updateSettings("who_we_work_with", data as unknown as Record<string, unknown>);
    });

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <SettingsHeader tag="Page Settings" title="Who We Work With" onSave={save} saving={isPending} />

            <SettingsCard title="Introduction">
                <TextArea
                    label="Intro Paragraph"
                    value={data.intro}
                    onChange={v => setData(p => ({ ...p, intro: v }))}
                    rows={6}
                />
            </SettingsCard>

            <SettingsCard title="Buyer Logos">
                <p className="text-xs leading-relaxed text-white/40">
                    The brand logos on this page come from the{" "}
                    <code className="text-primary">CLIENT_LOGOS</code> array in{" "}
                    <code className="text-primary">src/lib/site-content.ts</code>, because each entry
                    needs an image file in <code className="text-primary">public/images/client/logos/</code>.
                    Add the file first, then the entry.
                </p>
            </SettingsCard>
        </div>
    );
}
