"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 106;
const CRITICAL_FRAMES: number = 35; // Set to 0 temporarily if testing without images in public/sequence/

const LOADING_MESSAGES = [
    "Initiating Green Manufacturing...",
    "Calibrating Zero-Defect Pipeline...",
    "Loading Experience Sequence...",
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

        return () => {
            document.body.style.overflow = "";
        };
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
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background overflow-hidden"
                >
                    {/* Subtle Ambient Glow */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0EC97A_0%,transparent_40%)] opacity-5 blur-[100px] pointer-events-none" />

                    {/* Abstract Heritage Logo (Rotating SVG) */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/4 h-32 w-32 opacity-20"
                    >
                        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            {/* Swoosh 1 */}
                            <path d="M50 20 C65 20 75 35 75 50 C75 40 65 30 50 30 C35 30 25 40 25 50 C25 35 35 20 50 20 Z" fill="#019329" transform="rotate(0 50 50)" />
                            <circle cx="50" cy="10" r="5" fill="#0EC97A" transform="rotate(0 50 50)" />
                            {/* Swoosh 2 */}
                            <path d="M50 20 C65 20 75 35 75 50 C75 40 65 30 50 30 C35 30 25 40 25 50 C25 35 35 20 50 20 Z" fill="#0EC97A" transform="rotate(120 50 50)" />
                            <circle cx="50" cy="10" r="5" fill="#019329" transform="rotate(120 50 50)" />
                            {/* Swoosh 3 */}
                            <path d="M50 20 C65 20 75 35 75 50 C75 40 65 30 50 30 C35 30 25 40 25 50 C25 35 35 20 50 20 Z" fill="#019329" transform="rotate(240 50 50)" />
                            <circle cx="50" cy="10" r="5" fill="#0EC97A" transform="rotate(240 50 50)" />
                        </svg>
                    </motion.div>

                    <div className="relative z-10 flex flex-col items-center text-center mt-16">
                        {/* Cinematic Percentage Counter */}
                        <div className="overflow-hidden mb-2 flex items-start">
                            <motion.span
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="font-serif text-[clamp(6rem,15vw,12rem)] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-[#0EC97A] to-[#019329]"
                            >
                                {progressPercentage}
                            </motion.span>
                            <span className="font-serif text-[clamp(2rem,5vw,4rem)] font-bold text-primary mt-4">%</span>
                        </div>

                        {/* Brand Name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h2 className="font-serif text-2xl md:text-3xl tracking-[0.2em] text-foreground font-bold">FASHION ASIA</h2>
                            <p className="mt-2 text-[0.65rem] font-bold uppercase tracking-[0.5em] text-primary/70">Green Powered Innovation</p>
                        </motion.div>

                        {/* Dynamic Status Text */}
                        <div className="mt-12 h-6 overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={messageIndex}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="font-sans text-[0.7rem] font-bold uppercase tracking-[0.2em] text-white/40"
                                >
                                    {LOADING_MESSAGES[messageIndex]}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Edge to Edge Progress Line */}
                    <div className="absolute bottom-0 left-0 h-1.5 w-full bg-white/5">
                        <motion.div
                            className="h-full bg-gradient-to-r from-[#019329] to-[#0EC97A] shadow-[0_0_20px_rgba(14,201,122,0.8)] relative"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.2, ease: "linear" }}
                        >
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-white shadow-[0_0_15px_white]" />
                        </motion.div>
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
}
