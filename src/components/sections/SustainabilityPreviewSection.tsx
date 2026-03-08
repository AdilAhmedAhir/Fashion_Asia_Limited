import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Props {
    tag?: string;
    title?: string;
    description?: string;
    certs?: string[];
    highlights?: { icon: string; label: string }[];
}

export default function SustainabilityPreviewSection({ tag, title, description, certs, highlights }: Props) {
    const finalCerts = certs?.length ? certs : ['BSCI', 'WRAP', 'SEDEX', 'GOTS', 'OCS', 'SLCP', 'FEM'];
    const finalHighlights = highlights?.length ? highlights : [
        { icon: "☀️", label: "Solar Powered" },
        { icon: "💧", label: "Zero Discharge" },
        { icon: "♻️", label: "Water Recycling" },
        { icon: "🌿", label: "100% Compliant" },
    ];

    return (
        <section className="relative bg-gradient-to-b from-background to-[#0a0a0a] py-24 md:py-32 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img src="/images/client/csr-main-copy.jpg" alt="Sustainability" className="h-full w-full object-cover opacity-10 grayscale" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-[#0a0a0a]" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
                <ScrollReveal delay={0}>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{tag || "Green Manufacturing"}</span>
                </ScrollReveal>
                <ScrollReveal delay={0.1}>
                    <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold text-foreground">
                        {title || <>LEED Gold <span className="text-gradient">Certified</span></>}
                    </h2>
                </ScrollReveal>
                <ScrollReveal delay={0.2}>
                    <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-white/70">
                        {description || "Solar powered. Zero salt dyeing. Rainwater harvesting. Our factory operates as a fully compliant green facility, setting the benchmark for responsible garment manufacturing."}
                    </p>
                </ScrollReveal>

                <div className="mt-12 flex flex-wrap justify-center gap-3">
                    {finalCerts.map((cert, i) => (
                        <ScrollReveal key={cert} delay={0.3 + i * 0.05}>
                            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:text-white">
                                {cert}
                            </span>
                        </ScrollReveal>
                    ))}
                </div>

                <div className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 w-full max-w-3xl">
                    {finalHighlights.map((item, i) => (
                        <ScrollReveal key={item.label} delay={0.4 + i * 0.08}>
                            <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-500 hover:border-primary/30 hover:-translate-y-1">
                                <span className="text-2xl">{item.icon}</span>
                                <span className="text-[0.65rem] uppercase tracking-widest text-white/60">{item.label}</span>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal delay={0.6} className="mt-12">
                    <Link href="/sustainability" className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]">
                        Our Sustainability Story
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                </ScrollReveal>
            </div>
        </section>
    );
}
