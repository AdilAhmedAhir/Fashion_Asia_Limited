"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

export default function HeroOverlay() {
    const overlayRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        const tl = gsap.timeline({ delay: 0.5 });

        tl.from(".hero-tag", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" })
            .from(".hero-title", { y: 80, opacity: 0, duration: 1, ease: "power3.out" }, "-=0.6")
            .from(".hero-subtitle", { y: 30, opacity: 0, duration: 0.8, ease: "power3.out" }, "-=0.6")
            .from(".hero-stats .stat-item", { y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, "-=0.4")
            .from(".scroll-indicator", { opacity: 0, duration: 1 }, "-=0.2");
    }, { scope: overlayRef });

    return (
        <div ref={overlayRef} className="container relative flex h-full w-full flex-col items-center justify-center pt-20">

            <div className="flex flex-col items-center text-center pointer-events-auto">
                <span className="hero-tag mb-6 text-xs font-bold uppercase tracking-[0.3em] text-accent" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>
                    Northern Tosrifa Group
                </span>
                <h1 className="hero-title mb-8 font-serif text-[clamp(3rem,8vw,7rem)] font-bold leading-[1.1] text-foreground" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.6), 0 0px 8px rgba(0,0,0,0.4)' }}>
                    Green Powered <br className="hidden md:block" />
                    <span className="text-gradient" style={{ textShadow: '0 2px 30px rgba(14,201,122,0.3), 0 0px 60px rgba(14,201,122,0.15)' }}>Innovation</span>
                </h1>
                <div className="hero-subtitle flex flex-wrap items-center justify-center gap-3 font-sans text-sm md:text-lg text-white/80">
                    <span>LEED Gold Certified</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                    <span>800K Monthly</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-accent/50" />
                    <span>Est. 2000</span>
                </div>
            </div>

            <div className="hero-stats mt-16 flex flex-row gap-6 pointer-events-auto md:absolute md:right-16 md:top-32 md:mt-0 md:flex-col md:gap-8">
                {[
                    { label: "Legacy", value: "24+ Yrs" },
                    { label: "Machines", value: "750" },
                    { label: "Annual Revenue", value: "$30M" },
                ].map((stat) => (
                    <div key={stat.label} className="stat-item flex flex-col items-center md:items-end">
                        <span className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</span>
                        <span className="text-[0.65rem] uppercase tracking-widest text-white/50">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="scroll-indicator absolute bottom-12 flex flex-col items-center gap-4">
                <span className="text-[0.65rem] uppercase tracking-widest text-white/50">Scroll to explore</span>
                <div className="relative h-12 w-[1px] overflow-hidden bg-white/10">
                    <div className="absolute inset-0 h-full w-full origin-top animate-[pulse_2s_ease-in-out_infinite] bg-gradient-to-b from-accent to-transparent" />
                </div>
            </div>

        </div>
    );
}
