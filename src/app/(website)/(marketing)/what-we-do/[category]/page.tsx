import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import { getCategoryProducts } from "@/app/actions/products-actions";
import { normalizeProducts } from "@/lib/site-content";
import type { Metadata } from "next";

// Same ISR shape as the parent /what-we-do list page. No generateStaticParams
// is defined on purpose: with dynamicParams left at its Next.js default
// (true), a category slug added in /admin later resolves on the very next
// request — no code change, no redeploy (T-005 acceptance). The read chain
// (getSettings -> createClient -> cookies()) already forces this route to
// render per-request, exactly like /what-we-do/page.tsx does today, so a
// product/category edit is reflected as soon as it's requested; `revalidate`
// here only mirrors that sibling page's declared cadence, and the
// revalidatePath("/what-we-do/<slug>") calls already wired in
// settings-actions.ts::updateSettings and
// products-actions.ts::revalidateCategory are what make an edit-triggered
// refresh immediate rather than waiting out this window.
export const revalidate = 60;

type CategoryPageParams = { category: string };

// The route param is untrusted (docs/SECURITY.md SEC-MED-4, T-005 half):
// resolved by exact string equality against the already-normalized slug
// list only. The raw param is never used to build a path, query, or string
// beyond this comparison — every downstream read uses the matched
// category's own `.slug`, which normalizeProducts() guarantees is either a
// hand-picked default or slugify()/isWellFormedSlug-shaped output.
//
// Wrapped in React's cache() so generateMetadata and the page body (both
// need the same lookup) share one Supabase round-trip per request instead
// of two.
const findCategory = cache(async (rawSlug: string) => {
    const business = await getSettings("business");
    const categories = normalizeProducts(business.products);
    return categories.find((c) => c.slug === rawSlug) ?? null;
});

export async function generateMetadata(
    { params }: { params: Promise<CategoryPageParams> }
): Promise<Metadata> {
    const { category: rawSlug } = await params;
    const category = await findCategory(rawSlug);
    if (!category) return {};

    // Falls back to already-published, factual site copy (the same 100%-
    // export-oriented / 26-lines / 800K-pieces claims used in this file's
    // own parent page and site-wide) rather than inventing new claims —
    // every one of today's 8 live categories still ships with an empty
    // description by design (site-content.ts), so this fallback is the
    // common case today, not an edge case.
    const description = category.description ||
        `${category.title} from Fashion Asia Limited — a 100%-export-oriented knitwear manufacturer with 26 production lines and 800,000 pieces monthly capacity.`;
    const canonical = `/what-we-do/${category.slug}`;

    return {
        title: category.title,
        description,
        alternates: { canonical },
        openGraph: {
            url: canonical,
            title: category.title,
            description,
        },
    };
}

export default async function CategoryDetailPage(
    { params }: { params: Promise<CategoryPageParams> }
) {
    const { category: rawSlug } = await params;
    const category = await findCategory(rawSlug);
    if (!category) notFound();

    const products = await getCategoryProducts(category.slug);

    return (
        <div className="flex flex-col bg-background">
            {/* Only title/description/slug are read from `category` anywhere
                below — never the whole object, never `category.id`. Decision
                (d) (docs/TECH_STACK.md) makes that field internal-only: never
                displayed, never in the DOM or the RSC/serialized payload. */}
            <PageHeader
                tag="What We Do"
                title={category.title}
                description={category.description}
            />

            <section className="container py-24">
                <ScrollReveal>
                    <Link
                        href="/what-we-do"
                        className="inline-flex items-center gap-2 rounded-sm text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors duration-300 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                        All Products
                    </Link>
                </ScrollReveal>

                {products.length === 0 ? (
                    // Honest empty state — never a 404, never an invented
                    // placeholder product (T-005 acceptance). Today every
                    // live category resolves here: public.products is empty
                    // until T-004 ships.
                    <ScrollReveal delay={0.1}>
                        <div className="mt-12 rounded-xl border border-white/10 bg-surface px-8 py-16 text-center">
                            <p className="font-serif text-2xl font-bold text-foreground">Coming Soon</p>
                            <p className="mx-auto mt-3 max-w-md text-white/70">
                                We&apos;re still building out this part of the catalog. In the
                                meantime,{" "}
                                <Link
                                    href="/contact"
                                    className="rounded-sm text-primary underline underline-offset-4 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                                >
                                    contact us
                                </Link>{" "}
                                to ask about our {category.title} range directly.
                            </p>
                        </div>
                    </ScrollReveal>
                ) : (
                    // Same photo-card materials as the /what-we-do teaser grid
                    // (rounded-xl border, bg-surface, fixed-height crop) but a
                    // different layout: that grid links onward into a category,
                    // so a clamped, overlaid teaser is enough there. This card
                    // has nowhere further to click — it IS the product detail
                    // (VISION Feature 1: buyers see the real range, image +
                    // name + description) — so the description is real,
                    // admin-entered catalog copy and renders in full, in normal
                    // flow below the photo, instead of being clamped over it.
                    <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                        {products.map((product, i) => (
                            <ScrollReveal key={product.id} delay={i * 0.1}>
                                <div className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-surface">
                                    <img
                                        src={product.image}
                                        alt=""
                                        aria-hidden="true"
                                        loading="lazy"
                                        decoding="async"
                                        className="h-48 w-full shrink-0 object-cover md:h-56"
                                    />
                                    <div className="flex flex-col gap-2 p-5">
                                        {/* h2, not h3: PageHeader above renders this page's only
                                            h1 and nothing sits at h2 between it and this repeating
                                            product list, so h2 keeps heading order unbroken. */}
                                        <h2 className="font-serif text-lg font-bold leading-snug text-white">
                                            {product.name}
                                        </h2>
                                        {product.description && (
                                            <p className="text-sm leading-relaxed text-white/70">
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
