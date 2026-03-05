"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES = 160;

export default function DynamicCanvasEngine({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>(new Array(TOTAL_FRAMES));
    const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
    const frameRef = useRef({ frame: 1 });
    const [canvasReady, setCanvasReady] = useState(false);

    useGSAP(() => {
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === containerRef.current) t.kill();
        });

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        const images = imagesRef.current;
        const loaded = loadedRef.current;

        // Find the nearest loaded frame to the requested index
        const findNearestLoaded = (target: number): number => {
            if (loaded[target - 1]) return target;

            // Search outward from target in both directions
            for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
                const before = target - offset;
                const after = target + offset;
                if (before >= 1 && loaded[before - 1]) return before;
                if (after <= TOTAL_FRAMES && loaded[after - 1]) return after;
            }
            return -1; // Nothing loaded yet
        };

        const render = (index: number) => {
            const nearest = findNearestLoaded(index);
            if (nearest === -1) return;

            const img = images[nearest - 1];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            const scale = Math.max(cw / iw, ch / ih);
            const x = (cw / 2) - (iw / 2) * scale;
            const y = (ch / 2) - (ih / 2) * scale;

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

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "medium";
            ctx.fillStyle = "#0a0a0a";

            render(Math.round(frameRef.current.frame));
        };

        window.addEventListener("resize", handleResize);

        // === Progressive Loading ===
        // Frame 1 loads first (HQ), then rest stream in background.
        // Scroll is always enabled — renders nearest available frame.

        const loadFrame = (i: number): Promise<void> => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = `/sequence/hero/frame_${i}.webp`;
                img.onload = () => {
                    images[i - 1] = img;
                    loaded[i - 1] = true;
                    resolve();
                };
                img.onerror = () => resolve();
            });
        };

        // Phase 1: Load frame 1 immediately → show canvas
        loadFrame(1).then(() => {
            handleResize();
            setCanvasReady(true);

            // Phase 2: Stream remaining frames in small batches
            const loadRemaining = async () => {
                const BATCH = 8;
                for (let start = 2; start <= TOTAL_FRAMES; start += BATCH) {
                    const batch = [];
                    for (let i = start; i < Math.min(start + BATCH, TOTAL_FRAMES + 1); i++) {
                        batch.push(loadFrame(i));
                    }
                    await Promise.all(batch);
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
            ease: "none",
            onUpdate: () => render(Math.round(frameRef.current.frame)),
        }, 0);

        tl.to(".hero-overlay-wrapper", { opacity: 0, ease: "none" }, 0.6);

        return () => window.removeEventListener("resize", handleResize);
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            {/* Poster: instant fallback — shows before frame 1 loads */}
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
