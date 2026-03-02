"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TOTAL_FRAMES = 106;
const CRITICAL_FRAMES = 35;

export default function PreloaderManager() {
    const [loadedFrames, setLoadedFrames] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        let loadedCount = 0;

        const preloadImage = (index: number) => {
            const img = new Image();
            img.src = `/sequence/frame_${index}.webp`;
            img.onload = () => {
                loadedCount++;
                setLoadedFrames(loadedCount);
                if (loadedCount >= CRITICAL_FRAMES && !isReady) {
                    setIsReady(true);
                    document.body.style.overflow = "";
                }
            };
            img.onerror = () => {
                loadedCount++;
                setLoadedFrames(loadedCount);
                if (loadedCount >= CRITICAL_FRAMES && !isReady) {
                    setIsReady(true);
                    document.body.style.overflow = "";
                }
            };
        };

        for (let i = 0; i < TOTAL_FRAMES; i++) {
            preloadImage(i);
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isReady]);

    const progressPercentage = Math.min(
        Math.round((loadedFrames / CRITICAL_FRAMES) * 100),
        100
    );

    return (
        <AnimatePresence>
            {!isReady && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
                >
                    <div className="flex w-64 flex-col items-center gap-4">
                        <h2 className="font-sans text-sm font-bold tracking-widest text-primary uppercase">
                            Loading Experience: {progressPercentage}%
                        </h2>
                        <div className="h-[2px] w-full overflow-hidden rounded-full bg-primary/15">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary to-secondary"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 0.1, ease: "linear" }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
