import type { ComponentProps } from "react";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProductCard from "@/components/catalog/ProductCard";
import { cn } from "@/lib/utils";
import type { CategoryProduct } from "@/lib/site-content";

type ProductGridProps = {
    products: Pick<CategoryProduct, "id" | "name" | "description" | "image">[];
    /** The category these products belong to. It names any photo whose product name is blank. */
    categoryTitle: string;
    /** Passed to every card; see ProductCard. */
    headingLevel?: ComponentProps<typeof ProductCard>["headingLevel"];
    /** Outer spacing only, such as a top margin. It can't override the grid's own columns or gaps. */
    className?: string;
};

/** @purpose Product grid (2 columns on phones, 4 from md) of ProductCards, each revealed on scroll with a staggered delay. */
export default function ProductGrid({ products, categoryTitle, headingLevel, className }: ProductGridProps) {
    return (
        // className comes first, so a page's extra spacing can't displace the
        // grid's own classes and the rendered class string stays unchanged.
        <div className={cn(className, "grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6")}>
            {products.map((product, i) => (
                <ScrollReveal key={product.id} delay={i * 0.1}>
                    <ProductCard product={product} categoryTitle={categoryTitle} headingLevel={headingLevel} />
                </ScrollReveal>
            ))}
        </div>
    );
}
