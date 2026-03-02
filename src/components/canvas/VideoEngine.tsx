"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function VideoEngine({ videoIndex, children }: { videoIndex: string, children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Ensure scroll is at the top when switching videos
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [videoIndex]);

    useGSAP(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top top",
                end: "+=150%",
                scrub: true,
                pin: true,
                anticipatePin: 1,
            }
        });

        // Cinematic GSAP scaling and fade effect on scroll
        tl.to(videoRef.current, { scale: 1.15, opacity: 0, filter: "blur(10px)", ease: "power1.inOut" }, 0);
        tl.to(".hero-overlay-wrapper", { y: -100, opacity: 0, ease: "power1.in" }, 0);

    }, { scope: containerRef, dependencies: [videoIndex] });

    return (
        <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
            {/* #t=0.001 forces mobile/desktop browsers to instantly render the first frame as a poster */}
            <video
                ref={videoRef}
                key={videoIndex}
                src={`/videos/v${videoIndex}.mp4#t=0.001`}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 z-0 h-full w-full object-cover transform-gpu"
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/60 via-black/20 to-black/90 pointer-events-none" />
            <div className="hero-overlay-wrapper absolute inset-0 z-20 flex flex-col items-center justify-center">
                {children}
            </div>
        </div>
    );
}
