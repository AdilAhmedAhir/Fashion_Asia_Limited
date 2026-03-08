"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Cinematic split-screen preloader.
 * 
 * MOBILE: Pure branding animation only (no frame preloading).
 * DESKTOP: Preloads frames while showing branding, 2s max.
 */

const TOTAL_FRAMES = 160;
const COMPANY = "FASHION ASIA";

export default function Preloader() {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"loading" | "complete" | "exit">("loading");
    const [dismissed, setDismissed] = useState(false);
    const startTime = useRef(Date.now());
    const finishedRef = useRef(false);

    const finishLoading = useCallback(() => {
        if (finishedRef.current) return;
        finishedRef.current = true;

        const elapsed = Date.now() - startTime.current;
        const minTime = 1200;
        const remaining = Math.max(0, minTime - elapsed);

        setTimeout(() => {
            setPhase("complete");
            setTimeout(() => {
                setPhase("exit");
                document.body.style.overflow = "";
            }, 800);
        }, remaining);
    }, []);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);

        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            // Mobile: NO frame preloading — just branding animation, dismiss after 1.5s
            const timer = setTimeout(finishLoading, 1500);
            // Fake progress for visual feedback
            let fakeProgress = 0;
            const interval = setInterval(() => {
                fakeProgress += 8;
                setProgress(Math.min(fakeProgress, 100));
                if (fakeProgress >= 100) clearInterval(interval);
            }, 100);
            return () => {
                clearTimeout(timer);
                clearInterval(interval);
                document.body.style.overflow = "";
            };
        }

        // Desktop: preload frames (2s safety net)
        let loaded = 0;
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `/sequence/hero/frame_${i}.webp`;
            const onDone = () => {
                loaded++;
                setProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
                if (loaded >= TOTAL_FRAMES) finishLoading();
            };
            img.onload = onDone;
            img.onerror = onDone;
        }

        const safety = setTimeout(finishLoading, 2000);
        return () => {
            clearTimeout(safety);
            document.body.style.overflow = "";
        };
    }, [finishLoading]);

    if (dismissed) return null;

    return (
        <AnimatePresence onExitComplete={() => setDismissed(true)}>
            {phase !== "exit" && (
                <>
                    <motion.div
                        key="top"
                        initial={{ y: 0 }}
                        animate={phase === "complete" ? { y: "-100%" } : { y: 0 }}
                        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                        exit={{ y: "-100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
                        className="fixed inset-x-0 top-0 h-1/2 z-[9999] bg-[#050505]"
                    />
                    <motion.div
                        key="bottom"
                        initial={{ y: 0 }}
                        animate={phase === "complete" ? { y: "100%" } : { y: 0 }}
                        transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
                        exit={{ y: "100%", transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } }}
                        className="fixed inset-x-0 bottom-0 h-1/2 z-[9999] bg-[#050505]"
                    />
                    <motion.div
                        key="content"
                        initial={{ opacity: 1 }}
                        animate={phase === "complete" ? { opacity: 0, scale: 1.1 } : { opacity: 1 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-none"
                    >
                        <motion.img
                            src="/logo.png"
                            alt=""
                            className="w-16 h-16 md:w-20 md:h-20 mb-6"
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                        />
                        <div className="flex overflow-hidden">
                            {COMPANY.split("").map((letter, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ y: 80, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: 0.1 + i * 0.06,
                                        duration: 0.8,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className={`font-serif text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.15em] ${letter === " " ? "w-4 md:w-6" : "text-foreground"
                                        }`}
                                >
                                    {letter === " " ? "\u00A0" : letter}
                                </motion.span>
                            ))}
                        </div>
                        <motion.span
                            initial={{ opacity: 0, letterSpacing: "0.8em" }}
                            animate={{ opacity: 0.4, letterSpacing: "0.4em" }}
                            transition={{ delay: 0.9, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="mt-3 text-[0.6rem] md:text-xs uppercase font-bold text-foreground/40"
                        >
                            LIMITED
                        </motion.span>
                        <div className="absolute bottom-[15%] flex flex-col items-center gap-4 w-full">
                            <div className="w-32 md:w-48 h-[1px] bg-white/10 overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.2, ease: "linear" }}
                                />
                            </div>
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ delay: 0.5 }}
                                className="text-[0.5rem] uppercase tracking-[0.4em] text-foreground/30 font-bold tabular-nums"
                            >
                                {progress}%
                            </motion.span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
