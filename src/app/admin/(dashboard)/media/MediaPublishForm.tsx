"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { addMediaAction, type MediaActionResult } from "@/app/actions/media-actions";
import { SubmitButton } from "@/components/ui/SubmitButton";

// Shown when the call itself fails rather than answering: a dropped
// connection, or Next's 1 MB Server Action body limit on a large photo.
const PUBLISH_THREW = "The item couldn't be published. Check your connection, then try again. A very large photo can also fail, so compress it at TinyPNG first.";
const PUBLISHED = "Published.";

/**
 * @purpose The Media Center's publish form (T-019): sends addMediaAction from a transition, shows its answer, and keeps every field, the chosen file included, when publishing fails.
 * Deliberately not <form action> or useActionState: React 19 resets a form's
 * uncontrolled fields when its action finishes, whatever the action returns,
 * so a failed upload would lose the title and the chosen file.
 */
export default function MediaPublishForm() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [published, setPublished] = useState(false);
    // Set synchronously on submit, so a second submit before React re-renders
    // (a double click, or Enter twice) sends nothing.
    const sending = useRef(false);
    // The disabled fieldset drops focus, so it goes back to Publish once the
    // fieldset is enabled again (premortem C6).
    const refocus = useRef(false);
    const submitArea = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isPending || !refocus.current) return;
        refocus.current = false;
        submitArea.current?.querySelector("button")?.focus();
    }, [isPending]);

    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (sending.current) return;
        sending.current = true;
        // Both captured before any await: React clears currentTarget once
        // this handler returns.
        const form = event.currentTarget;
        const formData = new FormData(form);
        setError(null);
        setPublished(false);
        startTransition(async () => {
            let answer: MediaActionResult;
            try {
                answer = await addMediaAction(formData);
            } catch {
                answer = { ok: false, error: PUBLISH_THREW };
            }
            const failure = answer.ok ? null : answer.error;
            if (failure === null) form.reset();
            sending.current = false;
            refocus.current = true;
            startTransition(() => {
                setError(failure);
                setPublished(failure === null);
            });
        });
    }

    return (
        <form onSubmit={onSubmit} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-black p-6 shadow-xl sticky top-8">
            <h2 className="font-serif text-xl font-bold text-foreground mb-2">Publish New Item</h2>

            <fieldset disabled={isPending} className="contents">
                <div className="flex flex-col gap-2">
                    <label htmlFor="media-title" className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Title</label>
                    <input id="media-title" name="title" required className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-accent focus:outline-none" placeholder="e.g. Factory Floor" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="media-type" className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Category</label>
                    <select id="media-type" name="type" required className="rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-accent focus:outline-none appearance-none">
                        <option value="gallery">Photo Gallery</option>
                        <option value="news">Press / News</option>
                    </select>
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="media-file" className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Image Upload</label>
                    <input id="media-file" name="file" type="file" accept="image/*" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-accent focus:outline-none file:mr-4 file:rounded-md file:border-0 file:bg-primary/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-accent hover:file:bg-primary/30" />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="media-url" className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Image URL (Fallback if no upload)</label>
                    <input id="media-url" name="url" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-accent focus:outline-none" placeholder="/images/client/1.jpg or https://..." />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="media-content" className="text-[0.65rem] font-bold uppercase tracking-widest text-white/50">Text Content (For News)</label>
                    <textarea id="media-content" name="content" rows={4} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus-visible:ring-2 focus-visible:ring-accent focus:outline-none resize-none" />
                </div>

                <div ref={submitArea} className="mt-2 w-full">
                    <SubmitButton label="Publish to Site" pending={isPending} />
                    {error && (
                        <p role="alert" className="mt-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}
                    <p role="status" className="mt-3 text-sm text-accent empty:mt-0">
                        {published ? PUBLISHED : ""}
                    </p>
                </div>
            </fieldset>
        </form>
    );
}
