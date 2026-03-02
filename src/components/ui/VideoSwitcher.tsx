"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Settings2, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const videos = [
    { id: "1", name: "Concept 1: Flow" },
    { id: "2", name: "Concept 2: Yarn Spools A" },
    { id: "3", name: "Concept 3: Fibers Weaving A" },
    { id: "4", name: "Concept 4: Yarn Spools B" },
    { id: "5", name: "Concept 5: Fibers Weaving B" },
    { id: "6", name: "Concept 6: Yarn Spools C" },
];

function SwitcherContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentV = searchParams.get("v") || "1";
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 w-64 rounded-2xl border border-white/10 bg-black/90 p-4 shadow-2xl backdrop-blur-xl"
                    >
                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary">Client Preview</span>
                            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {videos.map((v) => (
                                <button
                                    key={v.id}
                                    onClick={() => { setIsOpen(false); router.push(`/?v=${v.id}`, { scroll: false }); }}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                                        currentV === v.id ? "bg-primary/20 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <span className="truncate">{v.name}</span>
                                    {currentV === v.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/80 text-white shadow-xl backdrop-blur-md transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
                <Settings2 size={24} className="transition-transform duration-500 group-hover:rotate-90" />
            </button>
        </div>
    );
}

export function VideoSwitcher() {
    return (
        <Suspense fallback={null}>
            <SwitcherContent />
        </Suspense>
    );
}
