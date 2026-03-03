"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

const TOTAL_FRAMES = 192; // 8 seconds at 24fps for buttery-smooth scroll

export default function DynamicCanvasEngine({ videoIndex, children }: { videoIndex: string, children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const frameRef = useRef({ frame: 1 }); // ffmpeg %d starts at 1

    // Ensure scroll is at the top when switching concepts
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [videoIndex]);

    useGSAP(() => {
        // Prevent old ScrollTriggers from bleeding when switching versions
        ScrollTrigger.getAll().forEach(t => {
            if (t.vars.trigger === containerRef.current) t.kill();
        });

        const images: HTMLImageElement[] = [];
        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            img.src = `/sequence/v${videoIndex}/frame_${i}.jpg`;
            images.push(img);
        }
        imagesRef.current = images;

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        if (!canvas || !ctx) return;

        const render = (index: number) => {
            const img = imagesRef.current[index - 1]; // Array is 0-indexed, frames are 1-indexed
            if (!img || !img.complete || img.naturalWidth === 0) return;

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

        // Initial draw — wait until first frame loads
        if (images[0]) {
            images[0].onload = handleResize;
        } else {
            handleResize();
        }

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=300%",
                scrub: 1, // 1-second lag smoothing for cinematic feel
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
            <canvas ref={canvasRef} className="absolute inset-0 z-0 h-full w-full object-cover transform-gpu" />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/80 pointer-events-none" />
            <div className="hero-overlay-wrapper absolute inset-0 z-20 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
