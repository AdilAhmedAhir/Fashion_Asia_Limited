"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/ui/BrandLogo";

const TOTAL_FRAMES = 106;
const CRITICAL_FRAMES: number = 35;

const LOADING_MESSAGES = [
    "Weaving Digital Infrastructure...",
    "Aligning Sustainable Threads...",
    "Calibrating 4-Point Inspection...",
    "Experience Ready."
];

export default function PreloaderManager() {
    const [loadedFrames, setLoadedFrames] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        let loadedCount = 0;

        const checkReady = () => {
            if (loadedCount >= CRITICAL_FRAMES && !isReady) {
                setIsReady(true);
                document.body.style.overflow = "";
            }
        };

        if (CRITICAL_FRAMES === 0) {
            checkReady();
            return;
        }

        const preloadImage = (index: number) => {
            const img = new Image();
            img.src = `/sequence/frame_${index}.webp`;
            const handleLoad = () => {
                loadedCount++;
                setLoadedFrames(loadedCount);
                checkReady();
            };
            img.onload = handleLoad;
            img.onerror = handleLoad;
        };

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            preloadImage(i);
        }

        return () => { document.body.style.overflow = ""; };
    }, [isReady]);

    const progressPercentage = CRITICAL_FRAMES === 0
        ? 100
        : Math.min(Math.round((loadedFrames / CRITICAL_FRAMES) * 100), 100);

    const messageIndex = Math.min(
        Math.floor((progressPercentage / 100) * LOADING_MESSAGES.length),
        LOADING_MESSAGES.length - 1
    );

    return (
        <AnimatePresence>
            {!isReady && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden"
                >
                    {/* Animated Thread Weaving Background Grid */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        {[...Array(10)].map((_, i) => (
                            <motion.div
                                key={`h-${i}`}
                                className="absolute h-[1px] bg-primary/30"
                                style={{ top: `${(i + 1) * 9}%`, left: 0, right: 0 }}
                                initial={{ scaleX: 0, opacity: 0 }}
                                animate={{ scaleX: 1, opacity: [0, 0.5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                            />
                        ))}
                        {[...Array(15)].map((_, i) => (
                            <motion.div
                                key={`v-${i}`}
                                className="absolute w-[1px] bg-[#019329]/30"
                                style={{ left: `${(i + 1) * 6}%`, top: 0, bottom: 0 }}
                                initial={{ scaleY: 0, opacity: 0 }}
                                animate={{ scaleY: 1, opacity: [0, 0.5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                            />
                        ))}
                    </div>

                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0EC97A_0%,transparent_35%)] opacity-10 blur-[80px] pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center">

                        {/* Pulsating Brand Logo */}
                        <motion.div
                            animate={{
                                scale: 1 + (progressPercentage / 500),
                                filter: `drop-shadow(0 0 ${progressPercentage / 3}px rgba(14,201,122,0.6))`
                            }}
                            transition={{ duration: 0.3 }}
                            className="mb-10"
                        >
                            <BrandLogo className="w-24 h-24" animated={true} />
                        </motion.div>

                        {/* Cinematic Counter */}
                        <div className="flex items-start overflow-hidden">
                            <motion.span
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="font-serif text-[clamp(5rem,12vw,9rem)] font-black leading-none text-transparent bg-clip-text bg-gradient-to-br from-white via-primary to-[#019329]"
                            >
                                {progressPercentage}
                            </motion.span>
                            <span className="font-serif text-[clamp(1.5rem,3vw,2.5rem)] font-bold text-primary mt-2">%</span>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="text-center mt-6"
                        >
                            <h2 className="font-serif text-xl md:text-2xl tracking-[0.25em] text-foreground font-bold uppercase">Fashion Asia</h2>
                        </motion.div>

                        {/* Dynamic Status Text */}
                        <div className="mt-8 h-6 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={messageIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="font-sans text-xs font-bold uppercase tracking-[0.3em] text-white/40 text-center"
                                >
                                    {LOADING_MESSAGES[messageIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Premium Bottom Loading Bar */}
                    <div className="absolute bottom-12 w-[80%] max-w-md h-[2px] bg-white/10 overflow-hidden backdrop-blur-sm">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#019329] via-primary to-white shadow-[0_0_15px_#0EC97A]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.2, ease: "linear" }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
