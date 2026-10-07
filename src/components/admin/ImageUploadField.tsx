"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
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
    describeDimensionLimit,
    formatBytes,
} from "@/lib/upload-limits";

/**
 * Drop-or-browse image field.
 *
 * Checks run here purely so the client gets an answer instantly instead of after
 * a round trip; uploadOptimizedImage repeats every one of them, because these
 * are trivially bypassable. Images are never re-encoded — an unoptimised file is
 * refused with a pointer to TinyPNG, which is the agreed workflow.
 *
 * `commitPathOnBlur` (opt-in, T-016) makes the path box keep typed text to
 * itself and call `onChange` once, on blur or Enter, instead of on every
 * keystroke. Only a product row sets it, because each of its changes is an
 * immediate save. Without it, the path box behaves exactly as before.
 *
 * `onBusyChange` (opt-in, T-010) tells a list editor whether the latest pick
 * is still running, so its page can hold Save until the image has landed.
 * Without it, nothing is reported and nothing else changes.
 */
export function ImageUploadField({
    label,
    value,
    onChange,
    commitPathOnBlur = false,
    onBusyChange,
}: {
    label: string;
    value: string;
    onChange: (url: string) => void;
    commitPathOnBlur?: boolean;
    onBusyChange?: (busy: boolean) => void;
}) {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    // T-009: numbers every pick (file input or drop), so only the latest one
    // is applied. Private: never rendered, never sent.
    const pickCount = useRef(0);

    // onBusyChange (T-010): changes only, never during render, and only for
    // the latest pick. True once it passes the synchronous checks; false once
    // it settles in any way (applied, refused at any stage, or thrown), and
    // false on unmount if it last reported true. An overtaken pick never
    // reports, so "A uploading, then B refused" ends false at B's refusal.
    const busyReport = useRef({ onBusyChange, reported: false });
    useLayoutEffect(() => {
        busyReport.current.onBusyChange = onBusyChange;
    });
    useEffect(() => {
        const report = busyReport.current;
        return () => {
            if (!report.reported) return;
            report.reported = false;
            report.onBusyChange?.(false);
        };
    }, []);
    const reportBusy = (busy: boolean) => {
        const report = busyReport.current;
        if (!report.onBusyChange || report.reported === busy) return;
        report.reported = busy;
        report.onBusyChange(busy);
    };

    // commitPathOnBlur only: the path box's own text. `pathTyped` says the
    // user has typed since the text last matched `value`. Until they do, the
    // text follows `value` whenever `value` changes; after, their text stays
    // until blur or Enter commits it. `pathValue` is the `value` the box last
    // saw, so the text changes only when `value` does.
    const [pathText, setPathText] = useState(value);
    const [pathTyped, setPathTyped] = useState(false);
    const [pathValue, setPathValue] = useState(value);
    if (commitPathOnBlur && value !== pathValue) {
        setPathValue(value);
        if (!pathTyped || pathText === pathValue) {
            setPathText(value);
            setPathTyped(false);
        }
    }

    // Blur or Enter: one onChange with the trimmed text, if it differs from
    // `value`. If it doesn't, nothing is called and the box shows `value`.
    const commitPath = () => {
        if (!pathTyped) return;
        setPathTyped(false);
        const next = pathText.trim();
        if (next === value) {
            setPathText(value);
            return;
        }
        setPathText(next);
        onChange(next);
    };

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

    /**
     * Measured here for an instant answer. The server re-checks the longest
     * edge from the file's own header (uploadOptimizedImage, T-007).
     */
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

    // T-009: every pick resets the notices and `busy`. After each await, a
    // pick that a newer one has overtaken stops, with no onChange and no
    // state change. Both files may still upload; only the latest pick is
    // applied and shown, through the onChange captured at that pick (never a
    // newer one), even if the field has unmounted since.
    const handleFile = async (file: File) => {
        const pick = ++pickCount.current;
        const isLatest = () => pickCount.current === pick;
        const applyUrl = onChange;
        setError(null);
        setWarning(null);
        setBusy(false);

        const hardProblem = wrongType(file) ?? tooLarge(file);
        if (hardProblem) {
            setError(hardProblem);
            reportBusy(false);
            return;
        }
        reportBusy(true);

        const dimensions = await readDimensions(file);
        if (!isLatest()) return;
        if (!dimensions) {
            setError("That file could not be read as an image.");
            reportBusy(false);
            return;
        }

        const { width, height } = dimensions;
        const longest = Math.max(width, height);
        if (longest > MAX_UPLOAD_DIMENSION) {
            setError(describeDimensionLimit(width, height));
            reportBusy(false);
            return;
        }

        const advisory = describeSizeAdvisory(width, height);

        setBusy(true);
        try {
            const body = new FormData();
            body.set("file", file);
            const result = await uploadOptimizedImage(body);
            if (!isLatest()) return;
            if (result.ok) {
                // commitPathOnBlur: a finished upload always replaces any
                // typed text with the new path.
                if (commitPathOnBlur) {
                    setPathText(result.url);
                    setPathTyped(false);
                }
                applyUrl(result.url);
                setWarning(advisory);
            } else {
                setError(result.error);
            }
        } catch {
            if (!isLatest()) return;
            setError("Upload failed. Check your connection and try again.");
        } finally {
            // Only the latest pick clears `busy` and the file input.
            if (isLatest()) {
                setBusy(false);
                if (inputRef.current) inputRef.current.value = "";
                reportBusy(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={inputId} className="text-xs font-bold uppercase tracking-widest text-white/50">
                {label}
            </label>

            {/* T-011: the file input is visually hidden, so its keyboard focus
                ring shows on this drop zone (for the input only, not the
                TinyPNG link inside it), and the zone looks disabled when a
                saving fieldset disables the input. */}
            <div
                onDragOver={e => {
                    e.preventDefault();
                    // T-010: a disabled field (inside a saving fieldset)
                    // shows no highlight and takes no drop.
                    if (inputRef.current?.matches(":disabled")) return;
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => {
                    e.preventDefault();
                    setDragging(false);
                    if (inputRef.current?.matches(":disabled")) return;
                    const file = e.dataTransfer.files?.[0];
                    if (file) void handleFile(file);
                }}
                className={`group flex items-center gap-4 rounded-xl border border-dashed p-3 transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-accent has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50 ${
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
                            className="cursor-pointer rounded-lg border border-primary/40 px-3 py-1.5 text-xs font-bold text-accent transition-colors hover:bg-primary/10 group-has-[:disabled]:cursor-not-allowed"
                        >
                            {busy ? "Uploading…" : value ? "Replace image" : "Choose image"}
                        </label>
                        {busy && <Loader2 size={14} className="animate-spin text-accent" />}
                        <span className="text-xs text-white/50">or drag one here</span>
                    </div>
                    {/* text-white/50: this box sits two layers of bg-black/40 deep
                        (ObjectListEditor's item card, then this dropzone), so the
                        effective background is near-black — /30 measures ~2.5:1
                        there, below the 4.5:1 AA floor. /50 clears ~5.3:1 on the
                        same background (T-011). */}
                    <p className="text-xs leading-relaxed text-white/50">
                        {extList} · up to {formatBytes(MAX_UPLOAD_BYTES)} · max {MAX_UPLOAD_DIMENSION}px.
                        Compress at{" "}
                        <a
                            href={TINYPNG_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-sm text-accent underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            TinyPNG
                        </a>{" "}
                        before uploading.
                    </p>
                    <p className="text-xs leading-relaxed text-white/50">
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
                <p role="alert" className="flex items-start gap-2 text-xs leading-relaxed text-red-400">
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
                    className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-xs leading-relaxed text-amber-300"
                >
                    <Info size={13} className="mt-px flex-none" aria-hidden="true" />
                    <span>
                        <strong className="font-bold">Heads up —</strong> {warning}
                    </span>
                </p>
            )}

            {/* Kept editable: the built-in photographs are repo paths, not uploads.
                With commitPathOnBlur it commits on blur or Enter (not while an
                IME is composing), and it's read-only, not disabled, during an
                upload, so it keeps focus and its text. */}
            <input
                type="text"
                value={commitPathOnBlur ? pathText : value}
                onChange={e => {
                    // T-009: a hand edit, in either mode, clears the last
                    // pick's notices. It doesn't cancel an upload: a finished
                    // upload still replaces the path.
                    setError(null);
                    setWarning(null);
                    if (commitPathOnBlur) {
                        setPathText(e.target.value);
                        setPathTyped(true);
                    } else {
                        onChange(e.target.value);
                    }
                }}
                onBlur={commitPathOnBlur ? commitPath : undefined}
                onKeyDown={
                    commitPathOnBlur
                        ? e => {
                              if (e.key !== "Enter" || e.nativeEvent.isComposing || e.keyCode === 229) return;
                              e.preventDefault();
                              commitPath();
                          }
                        : undefined
                }
                readOnly={commitPathOnBlur && busy}
                placeholder="Or paste an image path"
                aria-label={`${label} — path`}
                className={`rounded-lg border border-white/10 bg-black px-4 py-2 font-mono text-xs text-white/60 focus:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-50${commitPathOnBlur ? " read-only:cursor-wait read-only:opacity-50" : ""}`}
            />
        </div>
    );
}
