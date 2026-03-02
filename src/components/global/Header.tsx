"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MobileOverlayMenu from "./MobileOverlayMenu";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const homeVariants = [
    { id: "1", name: "Concept 1: Flow" },
    { id: "2", name: "Concept 2: Yarn Spools A" },
    { id: "3", name: "Concept 3: Fibers Weaving A" },
    { id: "4", name: "Concept 4: Yarn Spools B" },
    { id: "5", name: "Concept 5: Fibers Weaving B" },
    { id: "6", name: "Concept 6: Yarn Spools C" },
];

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

                        {/* Dropdown for Home */}
                        <div className="group relative py-6 font-sans text-sm font-medium text-foreground cursor-pointer">
                            <div className="flex items-center gap-1 transition-colors group-hover:text-primary">
                                Home <ChevronDown size={14} className="transition-transform duration-300 group-hover:rotate-180" />
                            </div>
                            <span className="absolute bottom-4 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>

                            <div className="absolute left-0 top-full mt-0 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 flex flex-col rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
                                <span className="px-3 py-2 text-[0.65rem] font-bold uppercase tracking-widest text-primary/50">Video Concepts</span>
                                {homeVariants.map((v) => (
                                    <Link
                                        key={v.id}
                                        href={`/?v=${v.id}`}
                                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        {v.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Standard Links */}
                        {["Who We Are", "Business", "Sustainability", "Media"].map((item) => (
                            <Link
                                key={item}
                                href={`/${item.toLowerCase().replace(/\s+/g, "-")}`}
                                className="group relative font-sans text-sm font-medium text-foreground py-6"
                            >
                                {item}
                                <span className="absolute bottom-4 left-0 h-[1px] w-0 bg-primary transition-all duration-300 group-hover:w-full"></span>
                            </Link>
                        ))}
                        <Link
                            href="/contact"
                            className="rounded-full bg-primary px-6 py-2.5 font-sans text-sm font-semibold text-black transition-transform hover:-translate-y-0.5 hover:bg-secondary hover:shadow-[0_0_20px_rgba(14,201,122,0.4)]"
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
