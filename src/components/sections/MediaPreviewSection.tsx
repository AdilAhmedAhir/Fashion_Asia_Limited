import ScrollReveal from "@/components/ui/ScrollReveal";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function MediaPreviewSection() {
    // Static preview images from the client folder
    const previewImages = [
        { src: "/images/client/box2-copy.jpg", title: "Production Floor" },
        { src: "/images/client/box3-copy.jpg", title: "Quality Control" },
        { src: "/images/client/box4-copy.jpg", title: "Cutting Section" },
        { src: "/images/client/box6-copy.jpg", title: "Finishing Line" },
    ];

    return (
        <section className="bg-gradient-to-b from-[#0a0a0a] to-background py-24 md:py-32">
            <div className="container">
                <div className="flex flex-col items-center text-center mb-16">
                    <ScrollReveal delay={0}>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Inside the Factory</span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-bold text-foreground">
                            See It in <span className="text-gradient">Action</span>
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="mt-4 max-w-xl font-sans text-base text-white/60">
                            From precision cutting to finished garments — explore our world-class manufacturing facility through our media center.
                        </p>
                    </ScrollReveal>
                </div>

                {/* Image Grid — 2x2 with hover reveals */}
                <div className="grid grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
                    {previewImages.map((img, i) => (
                        <ScrollReveal key={img.title} delay={0.2 + i * 0.1}>
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-surface">
                                <img
                                    src={img.src}
                                    alt={img.title}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-5">
                                    <span className="font-serif text-sm md:text-base font-bold text-white">{img.title}</span>
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal delay={0.6} className="mt-12 flex justify-center">
                    <Link
                        href="/media"
                        className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                    >
                        Visit Media Center
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                </ScrollReveal>
            </div>
        </section>
    );
}
