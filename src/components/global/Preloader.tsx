"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Premium preloader with logo mask reveal.
 * 
 * Strategy: Wait for ALL hero frames to load (or timeout after 6s),
 * then reveal the site with a dramatic logo-expand animation.
 * This ensures no half-baked scroll transitions.
 */

const TOTAL_FRAMES = 160;

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [done, setDone] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const startTime = useRef(Date.now());
    const animationStarted = useRef(false);

    const finishPreloader = useCallback(() => {
        if (animationStarted.current) return;
        animationStarted.current = true;

        const elapsed = Date.now() - startTime.current;
        const minTime = 2000; // At least 2 seconds for branding
        const remaining = Math.max(0, minTime - elapsed);

        setTimeout(() => {
            setDone(true);
            document.body.style.overflow = "";
        }, remaining);
    }, []);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);

        let loaded = 0;

        // Load ALL hero frames
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `/sequence/hero/frame_${i}.webp`;
            const onDone = () => {
                loaded++;
                setProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
                if (loaded >= TOTAL_FRAMES) finishPreloader();
            };
            img.onload = onDone;
            img.onerror = onDone;
        }

        // Safety net: if frames haven't loaded in 6 seconds, reveal anyway
        const safety = setTimeout(finishPreloader, 6000);

        return () => {
            clearTimeout(safety);
            document.body.style.overflow = "";
        };
    }, [finishPreloader]);

    if (dismissed) return null;

    return (
        <AnimatePresence onExitComplete={() => setDismissed(true)}>
            {!done && (
                <motion.div
                    key="preloader"
                    exit={{
                        clipPath: "circle(150% at 50% 50%)",
                        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
                    }}
                    initial={{ clipPath: "circle(150% at 50% 50%)" }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505]"
                >
                    {/* Logo with scale-up pulse */}
                    <motion.div
                        initial={{ scale: 0.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                        className="relative"
                    >
                        {/* Green glow behind logo */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.3 }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
                            className="absolute inset-0 -m-8 rounded-full bg-primary/20 blur-3xl"
                        />
                        <img src="/icon.png" alt="" className="relative z-10 w-20 h-20 md:w-28 md:h-28" />
                    </motion.div>

                    {/* Company Name — letter-spacing reveal */}
                    <motion.div
                        initial={{ y: 30, opacity: 0, letterSpacing: "0.5em" }}
                        animate={{ y: 0, opacity: 1, letterSpacing: "0.2em" }}
                        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="mt-8 flex flex-col items-center"
                    >
                        <span className="font-serif text-2xl md:text-3xl font-bold tracking-widest text-foreground">
                            FASHION ASIA
                        </span>
                        <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6 }}
                            className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-foreground/40"
                        >
                            Limited
                        </motion.span>
                    </motion.div>

                    {/* Progress bar (thin, elegant) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="absolute bottom-16 w-48 flex flex-col items-center gap-3"
                    >
                        <div className="relative w-full h-[2px] rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-primary rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                            />
                        </div>
                        <span className="text-[0.55rem] uppercase tracking-[0.3em] text-white/25 font-bold tabular-nums">
                            {progress}%
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
