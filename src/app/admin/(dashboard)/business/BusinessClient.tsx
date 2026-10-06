"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Info } from "lucide-react";
import { saveWhatWeDoText } from "@/app/actions/settings-actions";
import { SettingsHeader, SettingsCard, TextInput, TextArea, ChipList, SettingsLoadError } from "@/components/admin/SettingsForm";
import type { WhatWeDoText } from "@/lib/site-content";

/**
 * @purpose What /admin/business hands its editor: the 4 What We Do text fields it loaded, or a failed load that must not be edited.
 */
export type WhatWeDoTextLoad = { ok: true; text: WhatWeDoText } | { ok: false };

const LOAD_FAILED =
    "The saved page text couldn't be loaded, so editing is turned off to keep it safe. Refresh the page to try again.";

const SAVE_THREW = "Something went wrong saving these changes. Check your connection and try again.";

// Never shown or saved: only fills state when the load failed.
const NO_TEXT: WhatWeDoText = { processTitle: "", processSteps: [], whatWeDoTagline: "", whatWeDoText: "" };

// Whether the editor's text differs from the last saved copy in any of the 4
// fields. The process steps are compared one by one, in order, never by
// reference: a new list holding the same steps is no change.
function textDiffers(a: WhatWeDoText, b: WhatWeDoText): boolean {
    return (
        a.processTitle !== b.processTitle ||
        a.whatWeDoTagline !== b.whatWeDoTagline ||
        a.whatWeDoText !== b.whatWeDoText ||
        a.processSteps.length !== b.processSteps.length ||
        a.processSteps.some((step, i) => step !== b.processSteps[i])
    );
}

// The What We Do page text (T-026): "Our Craft" and the Product Catalog intro.
// Its Save writes only these 4 fields; the categories stored beside them in
// the same row are edited under /admin/products. State comes from the first
// `load` only, so a later re-render (after a save) can't replace it.
//
// `saved` is the last saved copy (T-033): the loaded text, replaced by what
// was sent once a save succeeds. While `data` differs from it, the status line
// says the changes aren't on the site yet.
export default function BusinessClient({ load }: { load: WhatWeDoTextLoad }) {
    const [initial] = useState(load);
    const [data, setData] = useState<WhatWeDoText>(() => (initial.ok ? initial.text : NO_TEXT));
    const [saved, setSaved] = useState<WhatWeDoText>(() => (initial.ok ? initial.text : NO_TEXT));
    const [error, setError] = useState<string | null>(null);
    const [justSaved, setJustSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Fail closed: no editor and no Save button without a successful read.
    if (!initial.ok) {
        return <SettingsLoadError tag="Page Settings" title="What We Do" message={LOAD_FAILED} />;
    }

    const dirty = textDiffers(data, saved);

    const set = <K extends keyof WhatWeDoText>(k: K, v: WhatWeDoText[K]) => {
        setData(p => ({ ...p, [k]: v }));
        setJustSaved(false);
    };

    const save = () => {
        setError(null);
        setJustSaved(false);
        const sent = data;
        startTransition(async () => {
            try {
                const result = await saveWhatWeDoText(sent);
                if (!result.ok) {
                    // The text and the unsaved line stay as they were.
                    setError(result.error);
                    return;
                }
                setSaved(sent);
                setJustSaved(true);
            } catch {
                setError(SAVE_THREW);
            }
        });
    };

    return (
        <div className="flex flex-col gap-8 max-w-4xl">
            <div>
                <SettingsHeader tag="Page Settings" title="What We Do" onSave={save} saving={isPending} error={error} saveLabel="Save page text" />
                {/* Always mounted (empty, it takes no space), so screen
                    readers hear the change in place. "Page text saved."
                    shows only while nothing differs from what was saved. */}
                <div role="status" aria-live="polite" className="text-sm leading-relaxed">
                    {dirty ? (
                        <p className="flex items-start gap-2 text-amber-300">
                            <Info size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                            <span>
                                <strong className="font-bold">Unsaved page text changes.</strong> They aren&apos;t on
                                the site until you click Save page text.
                            </span>
                        </p>
                    ) : justSaved ? (
                        <p className="flex items-start gap-2 text-accent">
                            <Check size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                            Page text saved.
                        </p>
                    ) : null}
                </div>
            </div>

            {/* Each card's fields are read-only while a save is in flight, as
                on /admin/products: anything typed meanwhile wouldn't be in
                the save. A fieldset, never a form: ChipList's buttons have no
                type, so inside a form they'd submit it. */}
            <SettingsCard title="Our Craft">
                <fieldset disabled={isPending} className="m-0 min-w-0 border-0 p-0">
                    <legend className="sr-only">Our Craft</legend>
                    <div className="flex flex-col gap-6">
                        <TextInput label="Heading" value={data.processTitle} onChange={v => set("processTitle", v)} />
                        <ChipList label="Process Steps (shown in order, joined by arrows)" items={data.processSteps} onChange={v => set("processSteps", v)} />
                        <TextInput label="Closing Line" value={data.whatWeDoTagline} onChange={v => set("whatWeDoTagline", v)} />
                    </div>
                </fieldset>
            </SettingsCard>

            <SettingsCard title="Product Catalog">
                <fieldset disabled={isPending} className="m-0 min-w-0 border-0 p-0">
                    <legend className="sr-only">Product Catalog</legend>
                    <div className="flex flex-col gap-6">
                        <TextArea label="Intro Copy — leave a blank line between paragraphs" value={data.whatWeDoText} onChange={v => set("whatWeDoText", v)} rows={10} />
                        <p className="text-sm leading-relaxed text-white/70">
                            The category cards under this text, and each category&apos;s products, are edited under{" "}
                            <Link
                                href="/admin/products"
                                className="rounded-sm font-bold text-accent underline underline-offset-2 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                            >
                                Admin → Products
                            </Link>
                            .
                        </p>
                    </div>
                </fieldset>
            </SettingsCard>
        </div>
    );
}
