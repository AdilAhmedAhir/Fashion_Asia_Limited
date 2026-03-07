"use client";

import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES_DESKTOP = 160;
const TOTAL_FRAMES_MOBILE = 40; // Every 4th frame on mobile

export default function DynamicCanvasEngine({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const loadedRef = useRef<boolean[]>([]);
    const frameRef = useRef({ frame: 1 });
    const [canvasReady, setCanvasReady] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setIsMobile(window.innerWidth < 768);
    }, []);

    useGSAP(() => {
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === containerRef.current) t.kill();
        });

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        const mobile = window.innerWidth < 768;
        const totalFrames = mobile ? TOTAL_FRAMES_MOBILE : TOTAL_FRAMES_DESKTOP;
        const frameStep = mobile ? 4 : 1; // On mobile, load every 4th frame

        imagesRef.current = new Array(totalFrames);
        loadedRef.current = new Array(totalFrames).fill(false);

        const images = imagesRef.current;
        const loaded = loadedRef.current;

        const findNearestLoaded = (target: number): number => {
            if (target >= 1 && target <= totalFrames && loaded[target - 1]) return target;
            for (let offset = 1; offset < totalFrames; offset++) {
                const before = target - offset;
                const after = target + offset;
                if (before >= 1 && loaded[before - 1]) return before;
                if (after <= totalFrames && loaded[after - 1]) return after;
            }
            return -1;
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
            // Mobile: 1x DPR, Desktop: up to 2x
            const dpr = mobile ? 1 : Math.min(window.devicePixelRatio || 1, 2);
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = mobile ? "low" : "medium";
            ctx.fillStyle = "#0a0a0a";

            render(Math.round(frameRef.current.frame));
        };

        window.addEventListener("resize", handleResize);

        // Load frame helper — maps local index to actual file index
        const loadFrame = (localIndex: number): Promise<void> => {
            return new Promise((resolve) => {
                const fileIndex = mobile ? (localIndex * frameStep) : localIndex;
                const actualFileIndex = Math.min(fileIndex, TOTAL_FRAMES_DESKTOP);
                const img = new Image();
                img.src = `/sequence/hero/frame_${actualFileIndex}.webp`;
                img.onload = () => {
                    images[localIndex - 1] = img;
                    loaded[localIndex - 1] = true;
                    resolve();
                };
                img.onerror = () => resolve();
            });
        };

        // Phase 1: Load frame 1 → render it on canvas (behind poster)
        loadFrame(1).then(() => {
            handleResize();

            // Phase 2: Stream ALL remaining frames, reveal canvas only when done
            const loadRemaining = async () => {
                const BATCH = mobile ? 4 : 8;
                for (let start = 2; start <= totalFrames; start += BATCH) {
                    const batch = [];
                    for (let i = start; i < Math.min(start + BATCH, totalFrames + 1); i++) {
                        batch.push(loadFrame(i));
                    }
                    await Promise.all(batch);
                }
                // ALL frames loaded → swap poster for canvas
                setCanvasReady(true);
            };
            loadRemaining();

            // Safety: if frames take too long, reveal canvas anyway after 8s
            setTimeout(() => setCanvasReady(true), 8000);
        });

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
            frame: totalFrames,
            ease: "none",
            onUpdate: () => render(Math.round(frameRef.current.frame)),
        }, 0);

        tl.to(".hero-overlay-wrapper", { opacity: 0, ease: "none" }, 0.6);

        return () => window.removeEventListener("resize", handleResize);
    }, { scope: containerRef, dependencies: [isMobile] });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            {/* Poster: high-priority LCP image */}
            <img
                src="/sequence/hero/poster.webp"
                alt="Fashion Asia Limited Factory"
                fetchPriority="high"
                decoding="async"
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
