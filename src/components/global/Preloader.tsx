"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function Preloader() {
    const [done, setDone] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const startTime = useRef(Date.now());

    useEffect(() => {
        document.body.style.overflow = "hidden";

        // Cosmetic preloader: minimum 1.5s for logo animation, max 3s safety net
        const minTime = 1500;

        // Preload just the poster + frame 1 (tiny payload ~860KB)
        const poster = new Image();
        const frame1 = new Image();
        let loaded = 0;

        const checkReady = () => {
            loaded++;
            if (loaded >= 2) {
                const elapsed = Date.now() - startTime.current;
                const remaining = Math.max(0, minTime - elapsed);
                setTimeout(() => {
                    setDone(true);
                    document.body.style.overflow = "";
                }, remaining);
            }
        };

        poster.onload = checkReady;
        poster.onerror = checkReady;
        frame1.onload = checkReady;
        frame1.onerror = checkReady;

        poster.src = "/sequence/hero/poster.webp";
        frame1.src = "/sequence/hero/frame_1.webp";

        // Safety net: dismiss after 3s no matter what
        const safety = setTimeout(() => {
            setDone(true);
            document.body.style.overflow = "";
        }, 3000);

        return () => {
            clearTimeout(safety);
            document.body.style.overflow = "";
        };
    }, []);

    if (dismissed) return null;

    return (
        <AnimatePresence onExitComplete={() => setDismissed(true)}>
            {!done && (
                <motion.div
                    key="preloader"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <BrandLogo className="w-20 h-20 md:w-24 md:h-24" animated />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
                        className="mt-8 flex flex-col items-center"
                    >
                        <span className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-foreground">
                            FASHION ASIA
                        </span>
                        <span className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/40">
                            Limited
                        </span>
                    </motion.div>

                    {/* Subtle pulsing dot instead of progress bar — cosmetic only */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="absolute bottom-16"
                    >
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_12px_rgba(14,201,122,0.6)]" />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
