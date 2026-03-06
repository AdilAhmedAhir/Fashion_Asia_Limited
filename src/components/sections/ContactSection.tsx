import ScrollReveal from "@/components/ui/ScrollReveal";
import { ArrowUpRight } from "lucide-react";

interface Props {
    cards?: { label: string; value: string }[];
}

export default function ContactSection({ cards }: Props) {
    const infoCards = cards?.length ? cards : [
        { label: "Phone", value: "+880 1711 691 366" },
        { label: "Factory", value: "Teprirbari, Sreepur, Gazipur" },
        { label: "Corporate", value: "Gopalpur, Munnu Nagar, Tongi" },
    ];

    return (
        <section id="contact" className="bg-gradient-to-b from-[#0a0a0a] to-black py-24 md:py-32">
            <div className="container grid grid-cols-1 gap-16 lg:grid-cols-[1.5fr_1fr] lg:gap-24">

                <div className="flex flex-col justify-center">
                    <ScrollReveal delay={0}>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Let&apos;s Talk</span>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-tight text-foreground">
                            Ready to Build <br className="hidden md:block" />
                            <span className="text-gradient">Together?</span>
                        </h2>
                    </ScrollReveal>

                    <ScrollReveal delay={0.2}>
                        <p className="mt-6 max-w-xl font-sans text-lg leading-relaxed text-white/70">
                            Partner with a manufacturer that prioritizes sustainability, efficiency, and zero-defect execution. Let us bring your apparel vision to life.
                        </p>
                    </ScrollReveal>

                    <ScrollReveal delay={0.3} className="mt-12 w-fit">
                        <a
                            href="mailto:contact@fashionasia.ltd"
                            className="group flex items-center gap-4 rounded-full border-2 border-primary bg-transparent px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-black hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                        >
                            Start a Conversation
                            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:rotate-45" />
                        </a>
                    </ScrollReveal>
                </div>

                <div className="flex flex-col justify-center gap-6">
                    {infoCards.map((card, i) => (
                        <ScrollReveal key={card.label} delay={0.4 + (i * 0.1)}>
                            <div className="flex w-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-white/[0.05]">
                                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                                    {card.label}
                                </span>
                                <span className="font-serif text-xl md:text-2xl text-white/90">
                                    {card.value}
                                </span>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

            </div>
        </section>
    );
}
