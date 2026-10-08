"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { MAIN_NAV, NAV_CTA } from "@/lib/nav";

const menuLinks = MAIN_NAV.map((link, i) => ({
    ...link,
    num: String(i + 1).padStart(2, "0"),
}));

// The house focus ring (DESIGN §6). It has no transition, so it shows at once (§4).
const FOCUS_RING = "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export default function MobileOverlayMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                // data-lenis-prevent hands wheel and trackpad scrolling back to
                // this overlay: otherwise Lenis takes the wheel for the page
                // behind it, and a menu taller than the screen can't be
                // scrolled with a mouse. overscroll-contain keeps the page
                // put: the body-scroll lock in the effect above doesn't, and
                // without it, scrolling past the end of the menu scrolled the
                // page behind it too (measured with Lenis active).
                <motion.div
                    data-lenis-prevent
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[999] flex flex-col justify-start bg-background px-6 sm:px-12 overflow-y-auto overscroll-contain pt-28 pb-12 scroll-pt-28 scroll-pb-12"
                >
                    <nav aria-label="Menu" className="flex flex-col gap-4">
                        {menuLinks.map((link, i) => (
                            <motion.div
                                key={link.href}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: (i + 1) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="border-b border-white/5 pb-3"
                            >
                                <Link href={link.href} onClick={onClose} className={`group flex items-baseline gap-4 w-full ${FOCUS_RING}`}>
                                    {/* Decorative, so "01" stays out of the link's name. */}
                                    <span aria-hidden="true" className="font-sans text-sm text-primary/30">{link.num}</span>
                                    <span className="font-serif text-[clamp(1.75rem,7vw,3.25rem)] font-bold leading-tight text-foreground transition-all duration-300 motion-safe:group-hover:translate-x-2 group-hover:text-accent">
                                        {link.label}
                                    </span>
                                </Link>
                            </motion.div>
                        ))}
                    </nav>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="mt-12 flex flex-col items-start gap-6"
                    >
                        <Link
                            href={NAV_CTA.href}
                            onClick={onClose}
                            className={`rounded-full bg-primary px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-foreground transition-colors hover:bg-primary/90 ${FOCUS_RING}`}
                        >
                            {NAV_CTA.label}
                        </Link>
                        <div>
                            <a href="mailto:admin@fashionasialtd.com" className="block w-fit font-sans text-sm text-white/50 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                admin@fashionasialtd.com
                            </a>
                            <a href="tel:+8801711691366" className="block w-fit font-sans text-sm text-white/50 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                                +880 1711 691 366
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
