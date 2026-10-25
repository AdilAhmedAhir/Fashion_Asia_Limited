"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { hasVisibleText } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import type { ProductCardData } from "@/components/catalog/ProductCard";
import type { ProductPreviewLayout } from "@/components/catalog/product-preview-layout";

type ProductPreviewDialogProps = {
    product: ProductCardData;
    /** The category the product belongs to: the pop-up's label, and the photo's name when the product's own name is blank. */
    categoryTitle: string;
    /** The photo's name: the product's name, or the category fallback ProductCard works out. */
    alt: string;
    /** Which numbered layout to render (product-preview-layout.ts). */
    layout: ProductPreviewLayout;
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
export default function ProductPreviewDialog({ product, categoryTitle, alt, layout, onClose }: ProductPreviewDialogProps) {
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
    const step = (delta: number) => setCurrent((shown + delta + photos.length) % photos.length);

    // The parts each layout arranges. With one photo there are no
    // thumbnails, arrows or dots.
    const mainPhoto = photos.length > 0 && (
        <div className="relative overflow-hidden rounded-lg bg-black/40">
            <img src={photos[shown]} alt={photoAlt(shown)} className="aspect-[4/3] w-full object-contain" />
            {layout === 3 && photos.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => step(-1)}
                        aria-label="Previous photo"
                        className={cn(
                            "absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground transition-colors hover:text-accent",
                            FOCUS_RING,
                        )}
                    >
                        <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => step(1)}
                        aria-label="Next photo"
                        className={cn(
                            "absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 text-foreground transition-colors hover:text-accent",
                            FOCUS_RING,
                        )}
                    >
                        <ChevronRight size={20} aria-hidden="true" />
                    </button>
                </>
            )}
        </div>
    );

    const thumbnails = (direction: "row" | "column") =>
        photos.length > 1 && (
            <ul className={direction === "row" ? "grid grid-cols-6 gap-2" : "flex w-12 flex-none flex-col gap-2 sm:w-16"}>
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
        );

    const dots = photos.length > 1 && (
        <ul className="flex flex-wrap justify-center gap-1">
            {photos.map((photo, i) => (
                <li key={`${i}-${photo}`}>
                    <button
                        type="button"
                        onClick={() => setCurrent(i)}
                        aria-label={`Show photo ${i + 1} of ${photos.length}`}
                        aria-current={i === shown ? "true" : undefined}
                        className={cn("block rounded-full p-2", FOCUS_RING)}
                    >
                        <span className={cn("block h-2.5 w-2.5 rounded-full", i === shown ? "bg-accent" : "bg-white/40")} />
                    </button>
                </li>
            ))}
        </ul>
    );

    // Says which photo is showing after a thumbnail, arrow or dot, for
    // screen readers. Layout 4 shows every photo at once, so it has none.
    const photoStatus = layout !== 4 && photos.length > 1 && (
        <p className="sr-only" aria-live="polite">
            {`Photo ${shown + 1} of ${photos.length}`}
        </p>
    );

    const info = (
        <div className="flex flex-col gap-3">
            {/* The dialog's name. A blank product name still names it, for
                screen readers only, by the photo's fallback. */}
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
    );

    let body;
    if (layout === 2) {
        body = (
            <div className="grid gap-6 p-5 md:grid-cols-5 md:gap-8 md:p-8">
                <div className="flex items-start gap-3 md:col-span-3">
                    {thumbnails("column")}
                    <div className="min-w-0 flex-1">{mainPhoto}</div>
                </div>
                <div className="md:col-span-2">{info}</div>
            </div>
        );
    } else if (layout === 3) {
        body = (
            <div className="flex flex-col gap-6 p-5 md:p-8">
                <div className="flex flex-col gap-2">
                    {mainPhoto}
                    {dots}
                </div>
                {info}
            </div>
        );
    } else if (layout === 4) {
        body = (
            <div className="flex flex-col gap-6 p-5 md:p-8">
                {info}
                {photos.length > 0 && (
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {photos.map((photo, i) => (
                            <li key={`${i}-${photo}`} className={i === 0 ? "sm:col-span-2" : undefined}>
                                <img
                                    src={photo}
                                    alt={photoAlt(i)}
                                    loading={i === 0 ? undefined : "lazy"}
                                    decoding="async"
                                    className="aspect-[4/3] w-full rounded-lg bg-black/40 object-contain"
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    } else {
        body = (
            <div className="grid gap-6 p-5 md:grid-cols-5 md:gap-8 md:p-8">
                <div className="flex flex-col gap-3 md:col-span-3">
                    {mainPhoto}
                    {thumbnails("row")}
                </div>
                <div className="md:col-span-2">{info}</div>
            </div>
        );
    }

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
            className={cn(
                "m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto overscroll-contain rounded-xl border border-white/10 bg-surface p-0 text-foreground backdrop:bg-black/80",
                layout === 3 || layout === 4 ? "max-w-3xl" : "max-w-5xl",
            )}
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

            {body}
            {photoStatus}
        </dialog>
    );
}
