import type { Metadata } from "next";
import ProductCard, { type ProductCardData } from "@/components/catalog/ProductCard";
import {
    PRODUCT_PREVIEW_LAYOUT,
    PRODUCT_PREVIEW_LAYOUTS,
    type ProductPreviewLayout,
} from "@/components/catalog/product-preview-layout";

const PAGE_PATH = "/product-preview-samples";

// Hidden on purpose (T-045): noindex, nofollow, and in no menu, footer,
// sitemap or robots rule (a Disallow line would only advertise it). It lives
// outside /products, where it would hide a category with the same slug.
export const metadata: Metadata = {
    title: "Product preview layouts",
    description: "Sample layouts for the product preview pop-up, for the client to choose from.",
    robots: { index: false, follow: false },
    // Its own canonical, never the homepage's from the root layout.
    alternates: { canonical: PAGE_PATH },
};

// Fixed sample photos already in /public (the category photographs), so this
// page never reads the database.
const SAMPLE_PHOTOS = [
    "/images/client/product-tshirts.webp",
    "/images/client/box12-copy.webp",
    "/images/client/product-tanktops.webp",
    "/images/client/product-dresses.webp",
    "/images/client/product-sleepwear.webp",
    "/images/client/product-sportswear.webp",
];

// What each layout looks like, in the card and as the pop-up's description.
const LAYOUT_DESCRIPTIONS: Record<ProductPreviewLayout, string> = {
    1: "A large photo with the small photos underneath. On a computer the name and description sit beside the photo; on a phone they sit below it.",
    2: "The small photos run down the side of the large photo. On a computer the name and description sit beside them; on a phone they sit below.",
    3: "One full-width photo at a time, with previous and next arrows and dots underneath, then the name and description below.",
    4: "The name and description at the top, then every photo laid out in a grid you scroll through.",
};

const sampleProduct = (layout: ProductPreviewLayout): ProductCardData => ({
    name: `Layout ${layout}`,
    description: LAYOUT_DESCRIPTIONS[layout],
    image: SAMPLE_PHOTOS[0],
    gallery: SAMPLE_PHOTOS.slice(1),
});

/** @purpose The hidden samples page for the product preview pop-up (T-045): one card per numbered layout, each opening that layout with sample photos, so the client can pick a number. */
export default function ProductPreviewSamplesPage() {
    return (
        <div className="flex flex-col bg-background">
            <section className="container pb-24 pt-32">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent">For review</p>
                <h1 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Product preview layouts</h1>
                <div className="mt-6 flex max-w-2xl flex-col gap-3 text-white/70">
                    <p>
                        When a visitor clicks a product, a preview opens with its photos, name and description. Here
                        are four ways it can look. Open each card below, then tell us the number of the layout you
                        prefer.
                    </p>
                    <p>
                        Each sample shows the same six photos from this site. A real product shows its own photos
                        and description. The live site uses Layout {PRODUCT_PREVIEW_LAYOUT} until you choose.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6">
                    {PRODUCT_PREVIEW_LAYOUTS.map((layout) => (
                        <ProductCard
                            key={layout}
                            product={sampleProduct(layout)}
                            categoryTitle="Sample preview"
                            layout={layout}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}
