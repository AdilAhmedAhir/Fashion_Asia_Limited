"use client";

import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { hasVisibleText } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/catalog/ProductCard";

type ProductPreviewDialogProps = {
    product: ProductCardData;
    /** The category the product belongs to: the pop-up's label, and the photo's name when the product's own name is blank. */
    categoryTitle: string;
    /** The photo's name: the product's name, or the category fallback ProductCard works out. */
    alt: string;
    /** Called once the dialog has closed, by Close, Escape or a backdrop click. */
    onClose: () => void;
};

// The house focus ring, on the dialog's own surface.
const FOCUS_RING =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

/**
 * @purpose The product preview pop-up (T-045): a native modal <dialog> with the product's photos (the main image, then its gallery), its name and its full description, and nothing else: no price, cart or links.
 * It opens with showModal() when it mounts, so the page behind is inert and
 * focus moves in. Close, Escape and a click on the backdrop close it, and the
 * card that opened it takes focus back (ProductCard). While it's open the page
 * behind can't scroll: <html> is held at overflow: hidden, and
 * data-lenis-prevent hands wheel and trackpad scrolling inside it back to the
 * browser. Nothing moves or animates, so reduced motion needs no guard.
 * Every id comes from useId(), never from the product.
 */
export default function ProductPreviewDialog({ product, categoryTitle, alt, onClose }: ProductPreviewDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const [current, setCurrent] = useState(0);

    // The main image first, then the gallery, which the product read has
    // already cleaned (normalizeGallery). A blank main image (an old row) is
    // left out rather than shown broken.
    const photos = [product.image, ...product.gallery].filter((photo) => hasVisibleText(photo));
    const shown = Math.min(current, Math.max(photos.length - 1, 0));
    const name = product.name.trim();
    const hasName = hasVisibleText(product.name);
    const hasDescription = hasVisibleText(product.description);
    const photoAlt = (i: number) => (photos.length > 1 ? `${alt}, photo ${i + 1} of ${photos.length}` : alt);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        // Already open when React runs this effect twice in development.
        if (!dialog.open) dialog.showModal();
        const html = document.documentElement;
        const previousOverflow = html.style.overflow;
        html.style.overflow = "hidden";
        // No close() here: the dialog leaves the page when this unmounts, and
        // a close() would fire onClose during development's second run.
        return () => {
            html.style.overflow = previousOverflow;
        };
    }, []);

    const close = () => dialogRef.current?.close();

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            data-lenis-prevent
            onClose={onClose}
            // The dialog has no padding, so a click whose target is the dialog
            // itself landed on the backdrop, outside the content.
            onClick={(event) => {
                if (event.target === event.currentTarget) close();
            }}
            className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-surface p-0 text-foreground backdrop:bg-black/80"
        >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/10 bg-surface px-5 py-3">
                <p className="min-w-0 truncate text-xs font-bold uppercase tracking-[0.2em] text-accent">{categoryTitle}</p>
                <button
                    type="button"
                    onClick={close}
                    className={cn(
                        "inline-flex flex-none items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-accent hover:text-accent",
                        FOCUS_RING,
                    )}
                >
                    <X size={14} aria-hidden="true" />
                    Close
                </button>
            </div>

            <div className="grid gap-6 p-5 md:grid-cols-5 md:gap-8 md:p-8">
                <div className="flex flex-col gap-3 md:col-span-3">
                    {photos.length > 0 && (
                        <div className="overflow-hidden rounded-lg bg-black/40">
                            <img src={photos[shown]} alt={photoAlt(shown)} className="aspect-[4/3] w-full object-contain" />
                        </div>
                    )}
                    {photos.length > 1 && (
                        <ul className="grid grid-cols-6 gap-2">
                            {photos.map((photo, i) => (
                                <li key={`${i}-${photo}`}>
                                    <button
                                        type="button"
                                        onClick={() => setCurrent(i)}
                                        aria-label={`Show photo ${i + 1} of ${photos.length}`}
                                        aria-current={i === shown ? "true" : undefined}
                                        className={cn(
                                            "block aspect-square w-full overflow-hidden rounded-md border-2 transition-opacity",
                                            i === shown ? "border-accent" : "border-transparent opacity-70 hover:opacity-100",
                                            FOCUS_RING,
                                        )}
                                    >
                                        <img src={photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="flex flex-col gap-3 md:col-span-2">
                    {/* The dialog's name. A blank product name still names it,
                        for screen readers only, by the photo's fallback. */}
                    <h2
                        id={titleId}
                        className={hasName ? "break-words font-serif text-2xl font-bold leading-snug text-foreground md:text-3xl" : "sr-only"}
                    >
                        {hasName ? name : alt}
                    </h2>
                    {hasDescription && (
                        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-white/70 md:text-base">
                            {product.description}
                        </p>
                    )}
                </div>
            </div>
        </dialog>
    );
}
