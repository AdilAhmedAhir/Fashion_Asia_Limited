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

export const MAIN_NAV: NavLink[] = [
    { label: "Home", href: "/" },
    { label: "Who We Are", href: "/who-we-are" },
    { label: "What We Do", href: "/business" },
    { label: "Global Partner", href: "/who-we-work-with" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Life at Fashion Asia", href: "/media" },
];

// The primary call-to-action, shown as a button rather than a plain nav link.
export const NAV_CTA: NavLink = { label: "Connect", href: "/contact" };
