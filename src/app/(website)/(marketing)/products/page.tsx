import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import CategoryCardGrid, { toCategoryCards } from "@/components/catalog/CategoryCardGrid";
import ProductGrid from "@/components/catalog/ProductGrid";
import { getSettings } from "@/app/actions/settings-actions";
import { getAllCategoryProducts } from "@/app/actions/products-actions";
import { normalizeProducts, type CategoryProduct } from "@/lib/site-content";
import { PRODUCTS_PATH, categoryPath } from "@/lib/nav";
import type { Metadata } from "next";

// Already-published site claims only (the same ones /what-we-do and the
// category pages use), never new ones.
const PAGE_DESCRIPTION =
    "Fashion Asia Limited's knitwear range, from t-shirts and polos to sportswear and heavy jersey, made by a 100%-export-oriented manufacturer with 26 production lines.";

export const metadata: Metadata = {
    title: "Products",
    description: PAGE_DESCRIPTION,
    // Self-referencing canonical and per-page OG, like every other page.
    // Without them this page would inherit the homepage's og:url.
    alternates: { canonical: PRODUCTS_PATH },
    openGraph: {
        url: PRODUCTS_PATH,
        title: "Products",
        description: PAGE_DESCRIPTION,
    },
};

// Same cadence as /what-we-do and the category pages. The read chain
// (getSettings -> createClient -> cookies()) renders this page per request
// anyway; the revalidatePath calls in settings-actions.ts and
// products-actions.ts cover it after every category or product write.
export const revalidate = 60;

// A failed read is kept apart from an empty catalog, so the page never claims
// that no products exist when it simply couldn't read them.
type ProductRead = { ok: true; bySlug: Map<string, CategoryProduct[]> } | { ok: false };

/** @purpose The /products overview: every category as a photo card, then a section of products for each category that has any. */
export default async function ProductsPage() {
    // Two independent reads in parallel: the category list, and every product
    // in one query, grouped by category. A failed product read must not take
    // the category grid down with it, so it's caught and logged here.
    const [business, productRead] = await Promise.all([
        getSettings("business"),
        getAllCategoryProducts().then(
            // Own keys only: the grouped record is a plain object, so a
            // category slugged "constructor" must not resolve to
            // Object.prototype's member of that name.
            (grouped): ProductRead => ({ ok: true, bySlug: new Map(Object.entries(grouped)) }),
            (error: unknown): ProductRead => {
                // Next's own control-flow signals pass straight through: at
                // build time, cookies() throws one to mark this route as
                // rendered per request. Swallowing it would log a false
                // failure and could let the page prerender without products.
                unstable_rethrow(error);
                console.error("/products: product read failed:", error);
                return { ok: false };
            },
        ),
    ]);

    // Narrowed to the fields a card renders, so a category's internal id
    // (docs/TECH_STACK.md decision (d)) never reaches a prop, a key or the
    // page's serialized payload. Everything below reads only title and slug.
    const categories = toCategoryCards(normalizeProducts(business.products));
    const productsBySlug = productRead.ok ? productRead.bySlug : null;

    // In the staff's category order, never the query's alphabetical slug
    // order. Products whose category isn't displayed are never shown, and a
    // category with no products gets no empty section.
    const sections = productsBySlug
        ? categories
              .map(({ title, slug }) => ({ title, slug, products: productsBySlug.get(slug) ?? [] }))
              .filter((section) => section.products.length > 0)
        : [];

    // Only when the read worked and no displayed category has a product yet
    // (the live catalog on 2026-10-03). There are no placeholder products.
    const showComingSoon = productsBySlug !== null && sections.length === 0;

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Our Range"
                title="Products"
                description="Knitwear for the global apparel market, from t-shirts and polos to sportswear and heavy jersey."
            />

            <section className="container py-24">
                <ScrollReveal>
                    <h2 className="mb-12 font-serif text-3xl font-bold text-foreground md:text-4xl">Browse by Category</h2>
                </ScrollReveal>

                <CategoryCardGrid categories={categories} hrefBase={PRODUCTS_PATH} />

                {showComingSoon && (
                    <ScrollReveal delay={0.1}>
                        <div className="mt-16 rounded-xl border border-white/10 bg-surface px-8 py-16 text-center">
                            <p className="font-serif text-2xl font-bold text-foreground">Coming Soon</p>
                            <p className="mx-auto mt-3 max-w-md text-white/70">
                                We&apos;re adding products to each category now. In the meantime,{" "}
                                {/* text-accent, not text-primary: primary text on
                                    this dark card fails AA (T-027). */}
                                <Link
                                    href="/contact"
                                    className="rounded-sm text-accent underline underline-offset-4 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                                >
                                    contact us
                                </Link>{" "}
                                to ask about any of the ranges above.
                            </p>
                        </div>
                    </ScrollReveal>
                )}
            </section>

            {/* One section per category that has products. The category name
                is the section's h2 and links to the category page, so each
                product name below it is an h3. Slugs are unique by design;
                the index only keeps keys unique if old stored data ever
                repeats one. */}
            {sections.map((section, i) => (
                <section key={`${section.slug}-${i}`} className="container border-t border-white/5 py-24">
                    <ScrollReveal>
                        <h2 className="break-words font-serif text-3xl font-bold text-foreground md:text-4xl">
                            {/* inline-block, so a long name wraps inside one
                                focus ring instead of a ring per line. Only
                                colour transitions: the ring appears at once. */}
                            <Link
                                href={categoryPath(section.slug)}
                                className="group inline-block max-w-full rounded-sm transition-colors duration-300 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                            >
                                {section.title}
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="ml-2 inline-block h-6 w-6 align-middle text-accent md:h-7 md:w-7 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:rotate-45"
                                />
                            </Link>
                        </h2>
                    </ScrollReveal>

                    {/* Only the category's title string is passed in, never
                        a category object. */}
                    <ProductGrid
                        products={section.products}
                        categoryTitle={section.title}
                        headingLevel="h3"
                        className="mt-12"
                    />
                </section>
            ))}
        </div>
    );
}
