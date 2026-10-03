import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/site-content";

/**
 * A category's `id` is internal-only (docs/TECH_STACK.md decision (d)): never
 * displayed, never in the DOM or the RSC payload. In development React also
 * streams every server component's props to the browser's debug channel, so
 * the id must not be passed in at all. `id?: never` turns handing over a whole
 * `Product` into a type error: narrow with `toCategoryCards` first.
 * @purpose The fields a category photo card renders, and nothing more (no internal id).
 */
export type CategoryCardData = Pick<Product, "title" | "slug" | "description" | "image"> & { id?: never };

/** @purpose Narrow categories to the fields a CategoryCardGrid card renders, so a category's internal id never reaches component props. */
export function toCategoryCards(categories: Product[]): CategoryCardData[] {
    return categories.map(({ title, slug, description, image }) => ({ title, slug, description, image }));
}

// The character after hrefBase's leading slash. Requiring one makes a bare "/"
// and a "//host" base type errors: either would turn a card's href
// protocol-relative ("//t-shirts" points at a host named t-shirts).
type PathStart =
    | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m"
    | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
    | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type CategoryCardGridProps = {
    categories: CategoryCardData[];
    /**
     * The root-relative path the cards link under, such as "/products": each
     * card links to `${hrefBase}/${slug}`. A trailing slash is stripped.
     */
    hrefBase: `/${PathStart}${string}`;
    /** Outer spacing only, such as a margin. It can't override the grid's own columns or gaps. */
    className?: string;
};

// The runtime twin of PathStart: a slash, then a lowercase letter or digit.
const PATH_START = /^\/[a-z0-9]/;

// Backs up the type at runtime, in case a cast slips past it. Trailing
// slashes are stripped, so "/products/" can't produce "/products//t-shirts".
// The first character after the slash is held to the same set PathStart
// allows, which also refuses "/\host": browsers read a backslash as a slash,
// so that href would be protocol-relative. A base that would still give an
// empty, protocol-relative or doubled-slash href, or that holds a backslash
// anywhere, is refused outright, since a wrong link is worse than a loud
// error.
function normalizeHrefBase(hrefBase: string): string {
    const base = hrefBase.replace(/\/+$/, "");
    if (!PATH_START.test(base) || base.includes("//") || base.includes("\\")) {
        throw new Error(`CategoryCardGrid: hrefBase must be a root-relative path such as "/products", got ${JSON.stringify(hrefBase)}.`);
    }
    return base;
}

/** @purpose Category photo-card grid (2 columns on phones, 4 from md): each card links to its category page and is revealed on scroll. */
export default function CategoryCardGrid({ categories, hrefBase, className }: CategoryCardGridProps) {
    const base = normalizeHrefBase(hrefBase);

    return (
        // className comes first, so a page's extra spacing can't displace the
        // grid's own classes and the rendered class string stays unchanged.
        <div className={cn(className, "grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6")}>
            {/* Titles are client-entered and can repeat, so the key pairs the
                title with its position rather than trusting uniqueness. `slug`
                is normalizeProducts()'s safe, dedupe-guaranteed output, never
                the raw title, so it's safe to use directly as a path segment.
                The stagger restarts every 4 cards (one row from md up), so a
                long list never waits seconds to appear. */}
            {categories.map((category, i) => (
                <ScrollReveal key={`${category.title}-${i}`} delay={(i % 4) * 0.1}>
                    <CategoryCard category={category} href={`${base}/${category.slug}`} />
                </ScrollReveal>
            ))}
        </div>
    );
}

// Photo card per the client's reference: the photograph behind, the name on a
// scrim at the bottom left.
function CategoryCard({ category, href }: { category: CategoryCardData; href: string }) {
    return (
        <Link
            href={href}
            className="group relative block h-48 overflow-hidden rounded-xl border border-white/10 bg-surface md:h-56 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            {/* Decorative on purpose (T-024, closing T-021). The link's
                accessible name already comes from the visible title (and
                description) below, so an alt repeating the category name
                would be announced twice ("T-Shirts T-Shirts"); the photo is
                the card's backdrop, not extra information (WCAG technique H2:
                image and text in the same link). alt="" alone removes the
                image from the accessibility tree, so the old aria-hidden was
                redundant and is gone. */}
            <img
                src={category.image}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
            {/* Title and description share one bottom block so the card
                looks right whether or not a description is set. */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
                <span className="line-clamp-2 break-words font-serif text-lg font-bold leading-snug text-foreground">
                    {category.title}
                </span>
                {/* Clamped: the card is a fixed height and the description is
                    free text, so an over-long one would otherwise grow this
                    block past the top of the card and clip the title. */}
                {category.description && (
                    <p className="line-clamp-3 break-words text-xs leading-relaxed text-white/70">
                        {category.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
