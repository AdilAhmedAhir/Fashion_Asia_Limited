"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MobileOverlayMenu from "./MobileOverlayMenu";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { MAIN_NAV, NAV_CTA } from "@/lib/nav";
import { useOverlayMenu } from "@/lib/use-overlay-menu";
import { cn } from "@/lib/utils";

// The menu sits in a wrapper that is always in the page, so the toggle's
// aria-controls has a target whether the menu is open or closed.
const MENU_ID = "mobile-menu";

// The house focus ring (DESIGN §6). It has no transition, so it shows at once (§4).
const FOCUS_RING = "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    // Any route change closes the menu, Back and Forward included (Wave 4d's
    // pattern in AdminNav). A link click closes it too, for a link to the page
    // already shown.
    const pathname = usePathname();
    const [menuPath, setMenuPath] = useState(pathname);
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        setMenuOpen(false);
    }
    const toggleRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const closeMenu = useCallback(() => setMenuOpen(false), []);

    // Focus moves into the open menu and Tab wraps within the toggle plus the
    // menu; Escape closes it and returns focus to the toggle; the page behind
    // is inert (T-029).
    useOverlayMenu({
        open: menuOpen,
        onClose: closeMenu,
        toggleRef,
        panelRef,
        inertTargets: "#site-main, #site-footer",
        // Tailwind's `xl`, where the header's own links replace the menu.
        closeWhen: "(min-width: 1280px)",
    });

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 z-[1000] w-full transition-all duration-300 ease-in-out motion-reduce:transition-colors",
                    scrolled ? "bg-background/90 py-4 backdrop-blur-md border-b border-white/5" : "bg-transparent py-6",
                    // Opaque while the mobile menu is open, so menu items
                    // scrolled up pass under the logo instead of showing through.
                    menuOpen && "bg-background"
                )}
            >
                <div className="container flex items-center justify-between">
                    <Link href="/" className={cn("group relative z-[1001] flex items-center gap-3", FOCUS_RING)} onClick={() => setMenuOpen(false)}>
                        <BrandLogo className="w-10 h-10 transition-transform duration-700 motion-safe:group-hover:rotate-180" />
                        <div className="flex flex-col">
                            <span className="font-serif text-xl font-bold leading-none tracking-wide text-foreground transition-colors group-hover:text-accent">
                                FASHION ASIA
                            </span>
                            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
                                Limited
                            </span>
                        </div>
                    </Link>

                    <nav aria-label="Main" className="hidden items-center gap-5 xl:flex z-[1001]">
                        {MAIN_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn("group relative whitespace-nowrap font-sans text-sm font-medium text-foreground py-6", FOCUS_RING)}
                            >
                                {item.label}
                                <span className="absolute bottom-4 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        <Link
                            href={NAV_CTA.href}
                            className={cn("whitespace-nowrap rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-foreground transition-transform motion-safe:hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(14,201,122,0.4)]", FOCUS_RING)}
                        >
                            {NAV_CTA.label}
                        </Link>
                    </nav>

                    {/* A stable name, "Menu"; aria-expanded says whether it's open. */}
                    <button
                        ref={toggleRef}
                        type="button"
                        className={cn("relative z-[1001] flex h-6 w-8 flex-col items-end justify-between xl:hidden", FOCUS_RING)}
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Menu"
                        aria-expanded={menuOpen}
                        aria-controls={MENU_ID}
                    >
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300 motion-reduce:transition-none", menuOpen ? "w-8 translate-y-[11px] rotate-45" : "w-8")} />
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300 motion-reduce:transition-none", menuOpen ? "w-0 opacity-0" : "w-6")} />
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300 motion-reduce:transition-none", menuOpen ? "w-8 -translate-y-[11px] -rotate-45" : "w-8")} />
                    </button>
                </div>
            </header>
            <div id={MENU_ID} ref={panelRef}>
                <MobileOverlayMenu isOpen={menuOpen} onClose={closeMenu} />
            </div>
        </>
    );
}
