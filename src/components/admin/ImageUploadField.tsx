"use client";

import { useId, useRef, useState } from "react";
import { ImageUp, Info, Loader2, TriangleAlert } from "lucide-react";
import { uploadOptimizedImage } from "@/app/actions/media-actions";
import {
    ALLOWED_EXTENSIONS,
    MAX_UPLOAD_BYTES,
    MAX_UPLOAD_DIMENSION,
    RECOMMENDED_UPLOAD_HEIGHT,
    RECOMMENDED_UPLOAD_WIDTH,
    TINYPNG_URL,
    UPLOAD_ACCEPT,
    checkImageSizeAdvisory,
    formatBytes,
} from "@/lib/upload-limits";

/**
 * Drop-or-browse image field.
 *
 * Checks run here purely so the client gets an answer instantly instead of after
 * a round trip; uploadOptimizedImage repeats every one of them, because these
 * are trivially bypassable. Images are never re-encoded — an unoptimised file is
 * refused with a pointer to TinyPNG, which is the agreed workflow.
 */
export function ImageUploadField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (url: string) => void;
}) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const extList = ALLOWED_EXTENSIONS.join(", ");

    /** Reject oversized images before they are read, so huge files fail fast. */
    const tooLarge = (file: File) =>
        file.size > MAX_UPLOAD_BYTES
            ? `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_UPLOAD_BYTES)} — optimise it at TinyPNG first.`
            : null;

    const wrongType = (file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
        return (ALLOWED_EXTENSIONS as readonly string[]).includes(ext)
            ? null
            : `Only ${extList} files are accepted.`;
    };

    /** Measured in the browser only; the server cannot cheaply read dimensions. */
    const readDimensions = (file: File) =>
        new Promise<{ width: number; height: number } | null>(resolve => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve({ width: img.naturalWidth, height: img.naturalHeight });
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(null);
            };
            img.src = url;
        });

    /**
     * Soft guidance only — called after the hard limits already passed, so
     * this never blocks. Returns null when the image matches the
     * recommendation closely enough that no warning is worth showing.
     */
    const describeSizeAdvisory = (width: number, height: number): string | null => {
        const { tooSmall, offProportion } = checkImageSizeAdvisory(width, height);
        const recommended = `${RECOMMENDED_UPLOAD_WIDTH}×${RECOMMENDED_UPLOAD_HEIGHT}px`;
        // Shared close, appended to every branch below — states the fix as an
        // optional next step (the file already uploaded), not a command.
        const fix = `If you'd like, export a version closer to ${recommended} landscape and upload that instead.`;

        if (tooSmall && offProportion) {
            return `This image is ${width}×${height}px — smaller than the recommended ${recommended} and a noticeably different shape. It uploaded, but may look soft or be cropped awkwardly here. ${fix}`;
        }
        if (tooSmall) {
            return `This image is ${width}×${height}px, smaller than the recommended ${recommended}. It uploaded, but may look soft on larger or higher-resolution screens. ${fix}`;
        }
        if (offProportion) {
            return `This image is ${width}×${height}px — a noticeably different shape than the recommended ${recommended} landscape. It uploaded, but may be cropped awkwardly where it's displayed. ${fix}`;
        }
        return null;
    };

    const handleFile = async (file: File) => {
        setError(null);
        setWarning(null);

        const hardProblem = wrongType(file) ?? tooLarge(file);
        if (hardProblem) {
            setError(hardProblem);
            return;
        }

        const dimensions = await readDimensions(file);
        if (!dimensions) {
            setError("That file could not be read as an image.");
            return;
        }

        const { width, height } = dimensions;
        const longest = Math.max(width, height);
        if (longest > MAX_UPLOAD_DIMENSION) {
            setError(`That image is ${width}×${height}. Resize it to ${MAX_UPLOAD_DIMENSION}px on the longest edge or smaller.`);
            return;
        }

        const advisory = describeSizeAdvisory(width, height);

        setBusy(true);
        try {
            const body = new FormData();
            body.set("file", file);
            const result = await uploadOptimizedImage(body);
            if (result.ok) {
                onChange(result.url);
                setWarning(advisory);
            } else {
                setError(result.error);
            }
        } catch {
            setError("Upload failed. Check your connection and try again.");
        } finally {
            setBusy(false);
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                {label}
            </label>

            <div
                onDragOver={e => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                    e.preventDefault();
                    setDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleFile(file);
                }}
                className={`flex items-center gap-4 rounded-xl border border-dashed p-3 transition-colors ${
                    dragging ? "border-primary bg-primary/10" : "border-white/15 bg-black/40"
                }`}
            >
                {/* Preview doubles as proof the stored path actually resolves. */}
                <div className="h-16 w-16 flex-none overflow-hidden rounded-lg border border-white/10 bg-black">
                    {value ? (
                        <img src={value} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-white/20">
                            <ImageUp size={18} />
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <label
                            htmlFor={inputId}
                            className="cursor-pointer rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-primary/10"
                        >
                            {busy ? "Uploading…" : value ? "Replace image" : "Choose image"}
                        </label>
                        {busy && <Loader2 size={14} className="animate-spin text-accent" />}
                        <span className="text-[11px] text-white/50">or drag one here</span>
                    </div>
                    {/* text-white/50, not the /30 used for labels elsewhere: this box
                        sits two layers of bg-black/40 deep (ObjectListEditor's item
                        card, then this dropzone), so the effective background is
                        near-black — /30 measures ~2.5:1 there, below the 4.5:1 AA
                        floor for 11px text. /50 clears ~5.3:1 on the same background. */}
                    <p className="text-[11px] leading-relaxed text-white/50">
                        {extList} · up to {formatBytes(MAX_UPLOAD_BYTES)} · max {MAX_UPLOAD_DIMENSION}px.
                        Compress at{" "}
                        <a
                            href={TINYPNG_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent underline underline-offset-2"
                        >
                            TinyPNG
                        </a>{" "}
                        before uploading.
                    </p>
                    <p className="text-[11px] leading-relaxed text-white/50">
                        Recommended: {RECOMMENDED_UPLOAD_WIDTH}×{RECOMMENDED_UPLOAD_HEIGHT}px landscape,
                        for the sharpest result wherever this appears on the site.
                    </p>
                </div>

                <input
                    ref={inputRef}
                    id={inputId}
                    type="file"
                    accept={UPLOAD_ACCEPT}
                    className="sr-only"
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                    }}
                />
            </div>

            {error && (
                <p role="alert" className="flex items-start gap-2 text-[11px] leading-relaxed text-red-400">
                    <TriangleAlert size={13} className="mt-px flex-none" aria-hidden="true" />
                    {error}
                </p>
            )}

            {/* Advisory only — never blocks. Distinct from the hard-block error
                above in shape (bordered box, not plain text), icon (info circle,
                not a warning triangle), colour (amber, not red), and live-region
                priority (role="status" is polite; the error above is assertive),
                so the difference doesn't rely on colour alone. */}
            {warning && (
                <p
                    role="status"
                    aria-live="polite"
                    className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-[11px] leading-relaxed text-amber-300"
                >
                    <Info size={13} className="mt-px flex-none" aria-hidden="true" />
                    <span>
                        <strong className="font-bold">Heads up —</strong> {warning}
                    </span>
                </p>
            )}

            {/* Kept editable: the built-in photographs are repo paths, not uploads. */}
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="/images/client/product-tshirts.webp"
                aria-label={`${label} — path`}
                className="rounded-lg border border-white/10 bg-black px-4 py-2 font-mono text-[11px] text-white/60 focus:border-primary/50 focus:outline-none"
            />
        </div>
    );
}
