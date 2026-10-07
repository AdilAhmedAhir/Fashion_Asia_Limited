"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { MotionConfig } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins globally once (client-side only)
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
    gsap.config({ nullTargetWarn: false });
}

interface SmoothScrollProviderProps {
    children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Skip Lenis on touch devices — native scroll works better with GSAP on tablets/phones
        const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
        // Reduced motion: keep native scrolling, checked once at mount (T-028)
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isTouch || prefersReducedMotion) return;

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
            wheelMultiplier: 1,
        });

        lenisRef.current = lenis;

        lenis.on("scroll", ScrollTrigger.update);

        const update = (time: number) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(update);
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // reducedMotion="user": with reduced motion on, framer-motion skips transform
    // animations (ScrollReveal fades without sliding). The layout stays a server component.
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
