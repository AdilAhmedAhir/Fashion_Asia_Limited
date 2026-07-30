"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

import { MAIN_NAV, NAV_CTA } from "@/lib/nav";

const menuLinks = MAIN_NAV.map((link, i) => ({
    ...link,
    num: String(i + 1).padStart(2, "0"),
}));

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
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed inset-0 z-[999] flex flex-col justify-start bg-background px-6 sm:px-12 overflow-y-auto pt-28 pb-12"
                >
                    <nav className="flex flex-col gap-4">
                        {menuLinks.map((link, i) => (
                            <motion.div
                                key={link.href}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: (i + 1) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="border-b border-white/5 pb-3"
                            >
                                <Link href={link.href} onClick={onClose} className="group flex items-baseline gap-4 w-full">
                                    <span className="font-sans text-sm text-primary/30">{link.num}</span>
                                    <span className="font-serif text-[clamp(1.75rem,7vw,3.25rem)] font-bold leading-tight text-foreground transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary">
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
                            className="rounded-full bg-primary px-8 py-3.5 font-sans text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-secondary"
                        >
                            {NAV_CTA.label}
                        </Link>
                        <div>
                            <a href="mailto:admin@fashionasialtd.com" className="block font-sans text-sm text-white/50 transition-colors hover:text-primary">
                                admin@fashionasialtd.com
                            </a>
                            <a href="tel:+8801711691366" className="block font-sans text-sm text-white/50 transition-colors hover:text-primary">
                                +880 1711 691 366
                            </a>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
