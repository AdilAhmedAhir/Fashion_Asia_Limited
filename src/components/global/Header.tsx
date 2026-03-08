"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileOverlayMenu from "./MobileOverlayMenu";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { cn } from "@/lib/utils";

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <>
            <header
                className={cn(
                    "fixed top-0 z-[1000] w-full transition-all duration-300 ease-in-out",
                    scrolled ? "bg-background/90 py-4 backdrop-blur-md border-b border-white/5" : "bg-transparent py-6"
                )}
            >
                <div className="container flex items-center justify-between">
                    <Link href="/" className="group relative z-[1001] flex items-center gap-3" onClick={() => setMenuOpen(false)}>
                        <BrandLogo className="w-10 h-10 transition-transform duration-700 group-hover:rotate-180" />
                        <div className="flex flex-col">
                            <span className="font-serif text-xl font-bold leading-none tracking-wide text-foreground transition-colors group-hover:text-primary">
                                FASHION ASIA
                            </span>
                            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
                                Limited
                            </span>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-8 lg:flex z-[1001]">
                        {["Home", "Who We Are", "Business", "Sustainability", "Reports", "Media"].map((item) => (
                            <Link
                                key={item}
                                href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group relative font-sans text-sm font-medium text-foreground py-6"
                            >
                                {item}
                                <span className="absolute bottom-4 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            className="rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_0_20px_rgba(14,201,122,0.4)]"
                        >
                            Connect
                        </Link>
                    </nav>

                    <button
                        className="relative z-[1001] flex h-6 w-8 flex-col items-end justify-between lg:hidden"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300", menuOpen ? "w-8 translate-y-[11px] rotate-45" : "w-8")} />
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300", menuOpen ? "w-0 opacity-0" : "w-6")} />
                        <span className={cn("h-[2px] bg-foreground transition-all duration-300", menuOpen ? "w-8 -translate-y-[11px] -rotate-45" : "w-8")} />
                    </button>
                </div>
            </header>
            <MobileOverlayMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
    );
}
