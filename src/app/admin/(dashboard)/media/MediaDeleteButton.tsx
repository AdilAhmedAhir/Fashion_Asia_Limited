"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteMediaAction, type MediaActionResult } from "@/app/actions/media-actions";

// Shown when the call itself fails rather than answering.
const DELETE_THREW = "The item couldn't be deleted. Check your connection, then try again.";

/**
 * @purpose One Media Center card's delete button (T-019): confirms first, sends only the item's id to deleteMediaAction, shows a failure on that card, and moves focus to the element with id `focusAfterDelete` once the item is gone.
 */
export default function MediaDeleteButton({ id, title, focusAfterDelete }: { id: string; title: string; focusAfterDelete: string }) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const sending = useRef(false);
    // The disabled button drops focus, so a failed delete puts it back here
    // once the button is enabled again (premortem C6).
    const refocus = useRef(false);
    const button = useRef<HTMLButtonElement>(null);
    const name = title || "this item";

    useEffect(() => {
        if (isPending || !refocus.current) return;
        refocus.current = false;
        button.current?.focus();
    }, [isPending]);

    function onDelete() {
        if (sending.current) return;
        if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
        sending.current = true;
        const formData = new FormData();
        formData.set("id", id);
        setError(null);
        startTransition(async () => {
            let answer: MediaActionResult;
            try {
                answer = await deleteMediaAction(formData);
            } catch {
                answer = { ok: false, error: DELETE_THREW };
            }
            sending.current = false;
            if (answer.ok) {
                // The card is gone, or about to be. There's deliberately no
                // mounted check, so focus never stays on <body>.
                document.getElementById(focusAfterDelete)?.focus();
                return;
            }
            const failure = answer.error;
            refocus.current = true;
            startTransition(() => setError(failure));
        });
    }

    return (
        <>
            <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <button
                    ref={button}
                    type="button"
                    onClick={onDelete}
                    disabled={isPending}
                    aria-label={`Delete ${name}`}
                    className="rounded-full bg-red-500/80 p-2 text-white hover:bg-red-500 backdrop-blur-sm shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Trash2 size={16} />
                </button>
            </div>
            {error && (
                <p role="alert" className="px-4 pb-4 text-xs text-red-400">
                    {error}
                </p>
            )}
        </>
    );
}
