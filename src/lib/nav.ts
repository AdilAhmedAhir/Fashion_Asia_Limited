/**
 * ============================================================================
 *  NAVIGATION — single source of truth for the site menu
 * ============================================================================
 *
 *  Header (desktop), MobileOverlayMenu, and Footer all read from here, so a
 *  label or route only ever needs changing in one place.
 *
 *  `label` is what visitors read; `href` is the actual route on disk. They are
 *  deliberately kept separate — renaming a menu item must never change a URL
 *  that is already indexed or shared.
 * ============================================================================
 */

export interface NavLink {
    label: string;
    href: string;
}

/**
 * The product catalog's routes (T-025): the overview at /products, and each
 * category's page at /products/<slug>. Pages, the sitemap and the Server
 * Actions' revalidation all build these paths from here. Two files spell the
 * scheme out by hand instead, so change them together with this one: the
 * /what-we-do/:slug redirect in next.config.ts, and the two slug-collision
 * messages in site-content.ts (which deliberately imports nothing).
 * @purpose The /products overview path, shared by the menu, pages, sitemap and revalidation.
 */
export const PRODUCTS_PATH = "/products";

/**
 * @purpose A category page's public path, /products/<slug>.
 * Pass a normalized category's own `slug`, never a raw route param.
 */
export function categoryPath(slug: string): string {
    return `${PRODUCTS_PATH}/${slug}`;
}

export const MAIN_NAV: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Who We Are", href: "/who-we-are" },
    { label: "What We Do", href: "/what-we-do" },
    { label: "Products", href: PRODUCTS_PATH },
    { label: "Global Partner", href: "/global-partner" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Life at Fashion Asia", href: "/life-at-fashion-asia" },
];

// The primary call-to-action, shown as a button rather than a plain nav link.
export const NAV_CTA: NavLink = { label: "Connect", href: "/contact" };
