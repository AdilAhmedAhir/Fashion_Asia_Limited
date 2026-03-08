"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";

const menuLinks = [
    { num: "01", label: "Home", href: "/" },
    { num: "02", label: "Who We Are", href: "/who-we-are" },
    { num: "03", label: "Business", href: "/business" },
    { num: "04", label: "Sustainability", href: "/sustainability" },
    { num: "05", label: "Reports", href: "/reports" },
    { num: "06", label: "Media", href: "/media" },
];

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
                    <nav className="flex flex-col gap-6">
                        {menuLinks.map((link, i) => (
                            <motion.div
                                key={link.label}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: (i + 1) * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                className="border-b border-white/5 pb-4"
                            >
                                <Link href={link.href} onClick={onClose} className="group flex items-baseline gap-4 w-full">
                                    <span className="font-sans text-sm text-primary/30">{link.num}</span>
                                    <span className="font-serif text-4xl font-bold text-foreground transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary sm:text-6xl">
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
                        className="mt-16 pt-8"
                    >
                        <p className="font-sans text-sm text-white/50">admin@fashionasialtd.com</p>
                        <p className="font-sans text-sm text-white/50">+880 1711 691 366</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
