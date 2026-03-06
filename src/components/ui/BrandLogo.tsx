"use client";

import { motion, type Variants } from "framer-motion";

export function BrandLogo({ className = "w-8 h-8", animated = false }: { className?: string; animated?: boolean }) {
    const pathVariants: Variants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 1.5, ease: "easeOut" as const } }
    };

    const dotVariants: Variants = {
        hidden: { scale: 0, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.8, delay: 0.5, ease: "backOut" as const } }
    };

    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <motion.g variants={animated ? pathVariants : undefined} initial={animated ? "hidden" : "visible"} animate="visible">
                {/* Segment 1 */}
                <path d="M50 15 C 65 15, 80 30, 80 50 C 80 40, 65 30, 50 30 C 35 30, 20 40, 20 50 C 20 30, 35 15, 50 15 Z" fill="#016138" transform="rotate(0 50 50)" />
                <motion.circle variants={animated ? dotVariants : undefined} cx="50" cy="8" r="5" fill="#016138" transform="rotate(0 50 50)" />

                {/* Segment 2 */}
                <path d="M50 15 C 65 15, 80 30, 80 50 C 80 40, 65 30, 50 30 C 35 30, 20 40, 20 50 C 20 30, 35 15, 50 15 Z" fill="#016138" transform="rotate(120 50 50)" />
                <motion.circle variants={animated ? dotVariants : undefined} cx="50" cy="8" r="5" fill="#016138" transform="rotate(120 50 50)" />

                {/* Segment 3 */}
                <path d="M50 15 C 65 15, 80 30, 80 50 C 80 40, 65 30, 50 30 C 35 30, 20 40, 20 50 C 20 30, 35 15, 50 15 Z" fill="#016138" transform="rotate(240 50 50)" />
                <motion.circle variants={animated ? dotVariants : undefined} cx="50" cy="8" r="5" fill="#016138" transform="rotate(240 50 50)" />
            </motion.g>
        </svg>
    );
}
