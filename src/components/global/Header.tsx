"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileOverlayMenu from "./MobileOverlayMenu";
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
                    <Link href="/" className="group relative z-[1001] flex flex-col" onClick={() => setMenuOpen(false)}>
                        <span className="font-serif text-xl font-bold leading-none tracking-wide text-foreground transition-colors group-hover:text-primary">
                            FASHION ASIA
                        </span>
                        <span className="text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
                            Limited
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 lg:flex z-[1001]">
                        {["Home", "Who We Are", "Business", "Sustainability", "Media"].map((item) => (
                            <Link
                                key={item}
                                href={item === "Home" ? "/" : `/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group relative font-sans text-sm font-medium text-foreground"
                            >
                                {item}
                                <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            className="rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-secondary"
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
