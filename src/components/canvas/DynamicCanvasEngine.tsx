"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES = 160;
const PRIORITY_COUNT = 8; // Load first 8 frames immediately for instant scroll readiness

export default function DynamicCanvasEngine({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ frame: 1 });
    const [canvasReady, setCanvasReady] = useState(false);

    useGSAP(() => {
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === containerRef.current) t.kill();
        });

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        const render = (index: number) => {
            const img = imagesRef.current[index - 1];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            const scale = Math.max(cw / iw, ch / ih);
            const x = (cw / 2) - (iw / 2) * scale;
            const y = (ch / 2) - (ih / 2) * scale;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.fillStyle = "#0a0a0a";
            ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(img, x, y, iw * scale, ih * scale);
        };

        const handleResize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;
            render(Math.round(frameRef.current.frame));
        };

        window.addEventListener("resize", handleResize);

        // === Priority Loading Strategy ===
        // 1. Load first PRIORITY_COUNT frames immediately (covers initial scroll)
        // 2. Once first frame renders, show canvas (hide poster)
        // 3. Load remaining frames in background

        const images: HTMLImageElement[] = new Array(TOTAL_FRAMES);

        const loadFrame = (i: number): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `/sequence/hero/frame_${i}.webp`;
                img.onload = () => resolve();
                img.onerror = () => resolve(); // Don't block on missing frames
                images[i - 1] = img;
            });
        };

        // Phase 1: Load priority frames (1-8) in parallel
        const priorityPromises = [];
        for (let i = 1; i <= PRIORITY_COUNT; i++) {
            priorityPromises.push(loadFrame(i));
        }

        Promise.all(priorityPromises).then(() => {
            imagesRef.current = images;
            handleResize();
            setCanvasReady(true);

            // Phase 2: Load remaining frames in background (small batches to avoid blocking)
            const loadRemaining = async () => {
                const BATCH = 10;
                for (let start = PRIORITY_COUNT + 1; start <= TOTAL_FRAMES; start += BATCH) {
                    const batch = [];
                    for (let i = start; i < Math.min(start + BATCH, TOTAL_FRAMES + 1); i++) {
                        batch.push(loadFrame(i));
                    }
                    await Promise.all(batch);
                    imagesRef.current = images; // Update ref as batches complete
                }
            };
            loadRemaining();
        });

        // Touch-optimized ScrollTrigger
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: isTouch ? "+=150%" : "+=300%",
                scrub: isTouch ? 0.3 : 1,
                pin: true,
                anticipatePin: 1,
            }
        });

        tl.to(frameRef.current, {
            frame: TOTAL_FRAMES,
            snap: "frame",
            ease: "none",
            onUpdate: () => {
                requestAnimationFrame(() => render(Math.round(frameRef.current.frame)));
            }
        }, 0);

        tl.to(".hero-overlay-wrapper", { opacity: 0, ease: "none" }, 0.6);

        return () => window.removeEventListener("resize", handleResize);
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            {/* Poster: instant fallback — shows while priority frames load */}
            <img
                src="/sequence/hero/poster.webp"
                alt=""
                className={`absolute inset-0 z-[1] h-full w-full object-cover transition-opacity duration-700 ${canvasReady ? "opacity-0 pointer-events-none" : "opacity-100"}`}
            />
            <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full object-cover transform-gpu" />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
            <div className="hero-overlay-wrapper absolute inset-0 z-20 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
