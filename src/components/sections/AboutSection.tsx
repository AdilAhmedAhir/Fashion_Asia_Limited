import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Props {
    tag?: string;
    title?: string;
    description?: string;
    stats?: { value: string; label: string }[];
}

export default function AboutSection({ tag, title, description, stats }: Props) {
    const finalStats = stats?.length ? stats : [
        { label: "Right First Time", value: "99.2%" },
        { label: "On-Time Delivery", value: "98.5%" },
        { label: "Pieces/Month", value: "800K" },
    ];

    return (
        <section id="about" className="bg-gradient-to-b from-black to-[#0a0a0a] py-24 md:py-32">
            <div className="container grid grid-cols-1 gap-16 md:grid-cols-2 lg:gap-24">

                <div className="flex flex-col justify-center">
                    <ScrollReveal delay={0}>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{tag || "About Fashion Asia Limited"}</span>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold leading-tight text-foreground">
                            {title || <>Where Bold <span className="text-gradient">Vision</span> Meets Precise <span className="text-gradient">Execution</span></>}
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-white/70">
                            {description || "As a proud sister concern of Northern Tosrifa Group (NTG), which has over 34 years of excellence in the apparel industry, we continue the legacy of quality, innovation, and responsible manufacturing from our modern, compliant facility in Sreepur, Gazipur."}
                        </p>
                    </ScrollReveal>

                    <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-3">
                        {finalStats.map((stat, i) => (
                            <ScrollReveal key={stat.label} delay={0.3 + i * 0.1}>
                                <div className="group flex flex-col items-start gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:bg-primary/5 hover:shadow-[0_10px_30px_rgba(14,201,122,0.1)]">
                                    <span className="text-3xl font-bold text-gradient">{stat.value}</span>
                                    <span className="text-[0.65rem] uppercase tracking-wider text-white/50">{stat.label}</span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    <ScrollReveal delay={0.5} className="mt-10 w-fit">
                        <Link
                            href="/who-we-are"
                            className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                        >
                            Discover Our Story
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                        </Link>
                    </ScrollReveal>
                </div>

                <ScrollReveal delay={0.4} className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/5 md:aspect-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f1a] to-black z-0"></div>
                    <img
                        src="/images/client/about-us-copy.jpg"
                        alt="Fashion Asia Manufacturing Facility"
                        className="absolute inset-0 z-10 h-full w-full object-cover opacity-60 mix-blend-luminosity grayscale transition-all duration-1000 hover:scale-105 hover:grayscale-0 hover:opacity-100"
                    />
                    <div className="absolute bottom-6 right-6 z-20 rounded-full border border-primary bg-background/90 px-6 py-3 font-sans text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
                        01 — Manufacturing Excellence
                    </div>
                </ScrollReveal>

            </div>
        </section>
    );
}
