"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES = 106;

export default function CanvasEngine({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ frame: 0 });

    useGSAP(() => {
        // 1. Preload images into memory
        const images: HTMLImageElement[] = [];
        for (let i = 0; i < TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `/sequence/frame_${i}.webp`;
            images.push(img);
        }
        imagesRef.current = images;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        // 2. Render function (Cover math)
        const render = (index: number) => {
            const img = imagesRef.current[index];
            if (!img || !img.complete) return;

            const cw = canvas.width;
            const ch = canvas.height;
            const iw = img.width;
            const ih = img.height;

            const scale = Math.max(cw / iw, ch / ih);
            const x = (cw / 2) - (iw / 2) * scale;
            const y = (ch / 2) - (ih / 2) * scale;

            ctx.fillStyle = "#1a1f1a";
            ctx.fillRect(0, 0, cw, ch);
            ctx.drawImage(img, x, y, iw * scale, ih * scale);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render(Math.round(frameRef.current.frame));
        };

        window.addEventListener("resize", handleResize);

        // Initial draw
        if (images[0]) {
            images[0].onload = handleResize;
        } else {
            handleResize();
        }

        // 3. GSAP Scroll Scrubber
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
            frame: TOTAL_FRAMES - 1,
            snap: "frame",
            ease: "none",
            onUpdate: () => {
                requestAnimationFrame(() => render(Math.round(frameRef.current.frame)));
            }
        }, 0);

        // Fade out overlay container near the end of the scroll
        tl.to(".hero-overlay-wrapper", { opacity: 0, ease: "none" }, 0.6);

        return () => window.removeEventListener("resize", handleResize);
    }, { scope: containerRef });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full object-cover" />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
            <div className="hero-overlay-wrapper absolute inset-0 z-20 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
