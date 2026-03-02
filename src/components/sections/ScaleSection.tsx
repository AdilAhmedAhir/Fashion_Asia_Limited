"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollReveal from "@/components/ui/ScrollReveal";

export default function ScaleSection() {
    const containerRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLImageElement>(null);

    useGSAP(() => {
        gsap.to(bgRef.current, {
            yPercent: 30,
            ease: "none",
            scrollTrigger: {
                trigger: containerRef.current,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
            }
        });
    }, { scope: containerRef });

    return (
        <section id="scale" ref={containerRef} className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden py-32 bg-black">

            <div className="absolute inset-0 z-0 h-[130%] w-full -top-[15%]">
                <img
                    ref={bgRef}
                    src="/images/client/4-copy.jpg"
                    alt="Factory Scale"
                    className="h-full w-full object-cover brightness-[0.25] mix-blend-luminosity grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
                <ScrollReveal delay={0}>
                    <div className="flex flex-col items-center leading-none">
                        <span className="font-serif text-[clamp(5rem,15vw,12rem)] font-black text-gradient drop-shadow-2xl">
                            800<span className="text-[clamp(3rem,8vw,6rem)] text-primary">K</span>
                        </span>
                        <span className="mt-4 font-sans text-xl font-bold uppercase tracking-[0.2em] text-white">
                            Pieces Monthly
                        </span>
                    </div>
                </ScrollReveal>

                <div className="mt-24 w-full max-w-4xl border-t border-white/10 pt-12">
                    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                        {[
                            { val: "30,000", lbl: "Daily Output" },
                            { val: "750", lbl: "Sewing Machines" },
                            { val: "45K", lbl: "Daily Cuts" },
                            { val: "$30M", lbl: "Group Revenue" }
                        ].map((stat, i) => (
                            <ScrollReveal key={stat.lbl} delay={0.2 + (i * 0.1)}>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-3xl font-bold text-primary">{stat.val}</span>
                                    <span className="text-[0.65rem] uppercase tracking-widest text-white/50">{stat.lbl}</span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
