import type { ComponentProps } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProductCard from "@/components/catalog/ProductCard";
import type { ProductCardData } from "@/components/catalog/ProductCard";
import { cn } from "@/lib/utils";
import type { CategoryProduct } from "@/lib/site-content";

/**
 * @purpose Narrow product rows to the 3 fields a ProductCard renders, so a row's id, category, order and timestamps never reach component props or a page's payload.
 * New objects, in the same order and number; nothing is trimmed or filtered.
 */
export function toProductCards(rows: readonly CategoryProduct[]): ProductCardData[] {
    return rows.map(({ name, description, image }) => ({ name, description, image }));
}

type ProductGridProps = {
    /** Narrowed with toProductCards: a whole product row is a type error. */
    products: ProductCardData[];
    /** The category these products belong to. It names any photo whose product name is blank. */
    categoryTitle: string;
    /** Passed to every card; see ProductCard. */
    headingLevel?: ComponentProps<typeof ProductCard>["headingLevel"];
    /** Outer spacing only, such as a top margin. It can't override the grid's own columns or gaps. */
    className?: string;
};

/** @purpose Product grid (1 column on phones, 2 from sm, 4 from md) of ProductCards, each revealed on scroll with a staggered delay. */
export default function ProductGrid({ products, categoryTitle, headingLevel, className }: ProductGridProps) {
    return (
        // className comes first, so a page's extra spacing can't displace the
        // grid's own column and gap classes. One column below sm keeps a
        // product's photo and full description readable at 360px.
        <div className={cn(className, "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:gap-6")}>
            {/* The stagger restarts every 4 cards (one row from md up), so a
                long list never waits seconds to appear. Keyed by name and
                position, never the product's row id: a key on a client
                component like ScrollReveal is written into the page's
                serialized payload, and T-025 requires no UUID-shaped string
                in the HTML of the catalog pages. Names can repeat or be
                blank, so the position keeps every key unique. */}
            {products.map((product, i) => (
                <ScrollReveal key={`${product.name}-${i}`} delay={(i % 4) * 0.1}>
                    <ProductCard product={product} categoryTitle={categoryTitle} headingLevel={headingLevel} />
                </ScrollReveal>
            ))}
        </div>
    );
}
