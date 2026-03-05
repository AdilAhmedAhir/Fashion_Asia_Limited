"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

const TOTAL_FRAMES = 160;
const PRIORITY_FRAMES = 20; // Preload first 20 frames during preloader

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const startTime = useRef(Date.now());

    useEffect(() => {
        // Prevent scrolling during preloader
        document.body.style.overflow = "hidden";

        let loaded = 0;

        const updateProgress = () => {
            loaded++;
            // Map priority frames (0-20) to percentage (0-100)
            const pct = Math.round((loaded / PRIORITY_FRAMES) * 100);
            setProgress(Math.min(pct, 100));

            if (loaded >= PRIORITY_FRAMES) {
                // Ensure minimum display time of 2s for the logo animation to play
                const elapsed = Date.now() - startTime.current;
                const remaining = Math.max(0, 2000 - elapsed);
                setTimeout(() => {
                    setDone(true);
                    document.body.style.overflow = "";
                }, remaining);
            }
        };

        // Preload priority hero frames — these will be cached for the canvas engine
        for (let i = 1; i <= PRIORITY_FRAMES; i++) {
            const img = new Image();
            img.onload = updateProgress;
            img.onerror = updateProgress; // Don't block on errors
            img.src = `/sequence/hero/frame_${i}.webp`;
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    // After exit animation, remove from DOM
    if (dismissed) return null;

    return (
        <AnimatePresence onExitComplete={() => setDismissed(true)}>
            {!done && (
                <motion.div
                    key="preloader"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                >
                    {/* Logo with draw animation */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <BrandLogo className="w-20 h-20 md:w-24 md:h-24" animated />
                    </motion.div>

                    {/* Brand Name */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        className="mt-8 flex flex-col items-center"
                    >
                        <span className="font-serif text-2xl md:text-3xl font-bold tracking-wide text-foreground">
                            FASHION ASIA
                        </span>
                        <span className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/40">
                            Limited
                        </span>
                    </motion.div>

                    {/* Progress Bar */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 w-48"
                    >
                        <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-[0.6rem] uppercase tracking-[0.2em] text-white/30 tabular-nums">
                            {progress}%
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
