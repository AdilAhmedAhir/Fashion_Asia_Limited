"use client";

import { useRef, useState } from "react";
import { Images } from "lucide-react";
import ProductPreviewDialog from "@/components/catalog/ProductPreviewDialog";
import { PRODUCT_PREVIEW_LAYOUT, type ProductPreviewLayout } from "@/components/catalog/product-preview-layout";
import { hasVisibleText, type CategoryProduct } from "@/lib/site-content";

/**
 * A product row also carries its id, its category's slug, its order and its
 * timestamps. None of them is rendered, and a client component's props are
 * written into the page's serialized payload, so they must not be passed in
 * at all (SEC-INFO-36, T-025). `id?: never` turns handing over a whole
 * `CategoryProduct` into a type error: narrow with `toProductCards`
 * (ProductGrid.tsx) first. `gallery` (T-045) holds photo addresses only.
 * @purpose The fields a product card renders (name, description, image, gallery), and nothing more: no row id, category, order or timestamps.
 */
export type ProductCardData = Pick<CategoryProduct, "name" | "description" | "image" | "gallery"> & { id?: never };

type ProductCardProps = {
    product: ProductCardData;
    /** The category the product belongs to. It names the photo when the product's own name is blank. */
    categoryTitle: string;
    /**
     * The heading level of the product name. "h2" (the default) suits a page
     * whose only h1 is its header, with nothing at h2 before the products;
     * pass "h3" where the products sit under their own h2 section heading.
     */
    headingLevel?: "h2" | "h3";
    /** The pop-up's numbered layout. Only the samples page passes one; every other card uses PRODUCT_PREVIEW_LAYOUT. */
    layout?: ProductPreviewLayout;
};

// Same photo-card materials as the category cards (rounded-xl border,
// bg-surface, fixed-height crop) but a different layout: the description is
// real, admin-entered catalog copy and renders in full, in normal flow below
// the photo. Since T-045 the whole card opens a preview pop-up with every
// photo of the product (ProductPreviewDialog).
//
// The trigger is its own button laid over the whole card, after the content,
// rather than a button wrapped around it: a heading can't sit inside a
// button, and the name stays a real heading for screen readers.

/** @purpose One catalog product tile: the photo, then the serif name and full description; the whole card is a button that opens the product's preview pop-up. */
export default function ProductCard({ product, categoryTitle, headingLevel: Heading = "h2", layout = PRODUCT_PREVIEW_LAYOUT }: ProductCardProps) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    // The photo shows the product itself, so unlike the decorative category-card
    // photo it gets a name (T-024, closing T-021). The database doesn't require
    // one (products.name defaults to ''), so a blank name falls back to the
    // product's category for the alt, and renders no heading rather than an
    // empty one. A name or description made only of spaces or invisible
    // characters (zero-width spaces, direction marks) counts as blank, by the
    // same rule the product save applies (T-033).
    // Precondition: categoryTitle is non-empty (normalizeProducts drops categories with a blank title).
    const name = product.name.trim();
    const hasName = hasVisibleText(product.name);
    const hasDescription = hasVisibleText(product.description);
    const alt = hasName ? name : `Product from our ${categoryTitle} range`;
    const photoCount = [product.image, ...product.gallery].filter((photo) => hasVisibleText(photo)).length;

    const close = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };

    return (
        <div className="group relative flex h-full flex-col rounded-xl border border-white/10 bg-surface transition-colors hover:border-accent/40">
            {/* The photo's lower edge fades into the card's own surface, so a
                product shot on a white studio backdrop flows into the dark
                card the way the category cards sit under their scrim, rather
                than ending in a hard bright edge like a generic shop tile
                (T-025, from T-024's design review). The fade sits only on the
                lower third, keeping the product itself clear, and carries no
                content, so it's invisible to assistive technology. */}
            <div className="relative h-48 shrink-0 overflow-hidden rounded-t-xl md:h-56">
                <img
                    src={product.image}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
                {/* A visual hint only: the trigger below carries the name. */}
                <span
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-bold text-accent"
                >
                    <Images size={14} />
                    {photoCount > 1 ? `${photoCount} photos` : "View"}
                </span>
            </div>
            {/* No text block at all when both are blank, rather than empty
                padding under the photo. */}
            {(hasName || hasDescription) && (
                <div className="flex flex-col gap-2 p-5">
                    {hasName && (
                        <Heading className="break-words font-serif text-lg font-bold leading-snug text-foreground">
                            {name}
                        </Heading>
                    )}
                    {hasDescription && (
                        <p className="break-words text-sm leading-relaxed text-white/70">
                            {product.description}
                        </p>
                    )}
                </div>
            )}

            <button
                ref={triggerRef}
                type="button"
                onClick={() => setOpen(true)}
                aria-haspopup="dialog"
                aria-label={`View ${hasName ? name : alt.charAt(0).toLowerCase() + alt.slice(1)}`}
                className="absolute inset-0 z-10 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            />

            {open && <ProductPreviewDialog product={product} categoryTitle={categoryTitle} alt={alt} layout={layout} onClose={close} />}
        </div>
    );
}
