"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES = 160; // 8 seconds at 20fps

export default function DynamicCanvasEngine({ videoIndex, children }: { videoIndex: string, children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ frame: 1 });
    const [canvasReady, setCanvasReady] = useState(false);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        setCanvasReady(false);
    }, [videoIndex]);

    useGSAP(() => {
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === containerRef.current) t.kill();
        });

        const images: HTMLImageElement[] = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `/sequence/v${videoIndex}/frame_${i}.webp`;
            images.push(img);
        }
        imagesRef.current = images;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        const render = (index: number) => {
            const img = imagesRef.current[index - 1];
            if (!img || !img.complete || img.naturalWidth === 0) return;

            // Use natural (backing store) resolution for sharp rendering
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
            // KEY FIX: Render at device pixel ratio for retina-sharp canvas
            const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x to avoid excess memory
            const displayWidth = window.innerWidth;
            const displayHeight = window.innerHeight;

            // Set canvas backing store to DPR-scaled resolution
            canvas.width = displayWidth * dpr;
            canvas.height = displayHeight * dpr;

            // Keep CSS size at viewport dimensions
            canvas.style.width = `${displayWidth}px`;
            canvas.style.height = `${displayHeight}px`;

            render(Math.round(frameRef.current.frame));
        };

        window.addEventListener("resize", handleResize);

        if (images[0]) {
            images[0].onload = () => {
                handleResize();
                setCanvasReady(true);
            };
        } else {
            handleResize();
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=300%",
                scrub: 1,
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
    }, { scope: containerRef, dependencies: [videoIndex] });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            {/* Poster: instant fallback for slow connections */}
            <img
                src={`/sequence/v${videoIndex}/poster.webp`}
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
