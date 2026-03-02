"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const menuLinks = [
    { num: "02", label: "Who We Are", href: "/who-we-are" },
    { num: "03", label: "Business", href: "/business" },
    { num: "04", label: "Sustainability", href: "/sustainability" },
    { num: "05", label: "Media", href: "/media" },
];

const homeVariants = [
    { id: "1", name: "Concept 1: Flow" },
    { id: "2", name: "Concept 2: Yarn Spools A" },
    { id: "3", name: "Concept 3: Fibers Weaving A" },
    { id: "4", name: "Concept 4: Yarn Spools B" },
    { id: "5", name: "Concept 5: Fibers Weaving B" },
    { id: "6", name: "Concept 6: Yarn Spools C" },
];

export default function MobileOverlayMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [homeOpen, setHomeOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            setHomeOpen(false); // Reset accordion on open
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
                    className="fixed inset-0 z-[999] flex flex-col justify-center bg-background px-6 sm:px-12 overflow-y-auto pt-24 pb-12"
                >
                    <nav className="flex flex-col gap-6">

                        {/* Home Accordion Dropdown */}
                        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                            <div className="flex flex-col border-b border-white/5 pb-4">
                                <button onClick={() => setHomeOpen(!homeOpen)} className="group flex items-center justify-between gap-4 text-left w-full">
                                    <div className="flex items-baseline gap-4">
                                        <span className="font-sans text-sm text-primary/30">01</span>
                                        <span className="font-serif text-4xl font-bold text-foreground transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary sm:text-6xl">
                                            Home
                                        </span>
                                    </div>
                                    <ChevronDown size={28} className={cn("text-white/50 transition-transform duration-300", homeOpen ? "rotate-180 text-primary" : "")} />
                                </button>

                                <AnimatePresence>
                                    {homeOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden flex flex-col gap-4 pl-[3.25rem] pt-6"
                                        >
                                            {homeVariants.map((v) => (
                                                <Link key={v.id} href={`/?v=${v.id}`} onClick={onClose} className="font-sans text-lg text-white/60 hover:text-primary transition-colors">
                                                    {v.name}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>

                        {/* Standard Links */}
                        {menuLinks.map((link, i) => (
                            <motion.div
                                key={link.label}
                                initial={{ y: 40, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ delay: (i + 2) * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
                        <p className="font-sans text-sm text-white/50">contact@fashionasia.ltd</p>
                        <p className="font-sans text-sm text-white/50">+880 1711 691 366</p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
