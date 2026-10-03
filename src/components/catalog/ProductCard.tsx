import type { CategoryProduct } from "@/lib/site-content";

type ProductCardProps = {
    product: Pick<CategoryProduct, "name" | "description" | "image">;
    /** The category the product belongs to. It names the photo when the product's own name is blank. */
    categoryTitle: string;
    /**
     * The heading level of the product name. "h2" (the default) suits a page
     * whose only h1 is its header, with nothing at h2 before the products;
     * pass "h3" where the products sit under their own h2 section heading.
     */
    headingLevel?: "h2" | "h3";
};

// Same photo-card materials as the category cards (rounded-xl border,
// bg-surface, fixed-height crop) but a different layout: a category card links
// onward, so a clamped, overlaid teaser is enough there. This card has nowhere
// further to click. It IS the product detail (VISION Feature 1: buyers see the
// real range, image + name + description), so the description is real,
// admin-entered catalog copy and renders in full, in normal flow below the
// photo, instead of being clamped over it.

/** @purpose One catalog product tile: the photo, then the serif name and full description in normal flow below it. */
export default function ProductCard({ product, categoryTitle, headingLevel: Heading = "h2" }: ProductCardProps) {
    // The photo shows the product itself, so unlike the decorative category-card
    // photo it gets a name (T-024, closing T-021). The database doesn't require
    // one (products.name defaults to ''), so a blank name falls back to the
    // product's category for the alt, and renders no heading rather than an
    // empty one.
    // Precondition: categoryTitle is non-empty (normalizeProducts drops categories with a blank title).
    const name = product.name.trim();
    const alt = name || `Product from our ${categoryTitle} range`;

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-surface">
            {/* The photo's lower edge fades into the card's own surface, so a
                product shot on a white studio backdrop flows into the dark
                card the way the category cards sit under their scrim, rather
                than ending in a hard bright edge like a generic shop tile
                (T-025, from T-024's design review). The fade sits only on the
                lower third, keeping the product itself clear, and carries no
                content, so it's invisible to assistive technology. */}
            <div className="relative h-48 shrink-0 md:h-56">
                <img
                    src={product.image}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface to-transparent" />
            </div>
            <div className="flex flex-col gap-2 p-5">
                {name && (
                    <Heading className="break-words font-serif text-lg font-bold leading-snug text-foreground">
                        {name}
                    </Heading>
                )}
                {product.description && (
                    <p className="break-words text-sm leading-relaxed text-white/70">
                        {product.description}
                    </p>
                )}
            </div>
        </div>
    );
}
