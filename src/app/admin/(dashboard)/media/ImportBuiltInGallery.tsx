"use client";

import { useState, useTransition } from "react";
import { importBuiltInGallery } from "@/app/actions/media-actions";
import { ImagePlus, Loader2 } from "lucide-react";

export default function ImportBuiltInGallery() {
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

    const run = () =>
        startTransition(async () => {
            try {
                const { added } = await importBuiltInGallery();
                setResult({
                    ok: true,
                    message: added
                        ? `Added ${added} built-in photo(s) to the gallery.`
                        : "Nothing to add — every built-in photo is already in the gallery."
                });
            } catch (err) {
                setResult({ ok: false, message: err instanceof Error ? err.message : "Import failed." });
            }
        });

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
            <h3 className="font-serif text-lg font-bold text-white">Built-in factory photos</h3>
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/50">
                The site ships with a set of factory photographs, and they already show on the
                gallery alongside your uploads. Import them here only if you want to retitle,
                reorder or delete them — after importing, this list controls the gallery
                completely. Photos already imported are skipped.
            </p>
            <button
                onClick={run}
                disabled={isPending}
                className="mt-5 flex items-center gap-2 rounded-lg border border-primary/30 px-5 py-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
                {isPending ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                {isPending ? "Importing..." : "Import built-in photos"}
            </button>
            {result && (
                <p role="status" className={`mt-3 text-xs ${result.ok ? "text-primary" : "text-red-400"}`}>
                    {result.message}
                </p>
            )}
        </div>
    );
}
