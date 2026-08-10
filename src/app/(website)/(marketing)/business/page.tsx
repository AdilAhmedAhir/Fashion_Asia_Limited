import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "What We Do",
    description:
        "Knit garment manufacturing at scale — 26 production lines, 800,000 pieces monthly, from t-shirts and polos to sportswear and heavy jersey.",
};

export const revalidate = 60;

export default async function BusinessPage() {
    const data = await getSettings("business");
    const products = data.products?.length ? data.products : ['T-Shirts', 'Polo Shirts', 'Tank Tops', 'Dresses', 'Sleepwear', 'Leggings', 'Sportswear', 'Heavy Jersey Products'];
    const capacityStats = data.capacityStats?.length ? data.capacityStats : [
        { value: "26", label: "Production Lines" },
        { value: "800K", label: "Pieces Monthly" },
        { value: "2,000+", label: "Skilled Employees" },
        { value: "$30M", label: "Annual Turnover" },
    ];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Scale & Precision"
                title="What We Do"
                description="Delivering efficiency, transparency, and precision at every stage of production for the global apparel market."
            />

            {/* What We Do */}
            {data.whatWeDoText && (
                <section className="container py-24 border-b border-white/5">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
                        <ScrollReveal>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Craft</span>
                                <h2 className="mt-4 mb-8 font-serif text-3xl font-bold text-foreground md:text-4xl">Ideas Into World-Class Knitwear</h2>
                                <p className="text-lg leading-relaxed text-white/70">{data.whatWeDoText}</p>
                                {data.whatWeDoTagline && (
                                    <p className="mt-8 font-serif text-2xl font-bold text-gradient md:text-3xl">{data.whatWeDoTagline}</p>
                                )}
                            </div>
                        </ScrollReveal>

                        {/* Cutting-room clip. Muted + playsInline so it can
                            autoplay on mobile; the poster covers the gap before
                            the file arrives. */}
                        <ScrollReveal delay={0.2}>
                            <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:max-w-[360px]">
                                <video
                                    src="/videos/cutting.mp4"
                                    poster="/images/client/cutting-poster.webp"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label="Automated fabric cutting on the production floor"
                                    className="h-full w-full object-cover"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-5 left-5 rounded-full border border-primary/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md">
                                    Precision Cutting
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            )}

            {/* Product Catalog */}
            <section className="container py-24 border-b border-white/5">
                <ScrollReveal>
                    <div className="max-w-3xl mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">01. Product Catalog</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Comprehensive Range</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            Fashion Asia Ltd. produces a comprehensive range of high-quality knit garments for global markets. We are capable of handling diverse fabric compositions, designs, and finishing techniques.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                    {products.map((product: string, i: number) => (
                        <ScrollReveal key={product} delay={i * 0.1}>
                            <div className="flex h-32 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center font-serif text-lg text-white/80 transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-primary hover:-translate-y-1">
                                {product}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Capacity */}
            <section className="bg-surface py-24 border-b border-white/5">
                <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">02. Capacity</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Built for Global Scale</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            {data.capacityDescription || "Our factory operates 26 production lines with a monthly production capacity of 800,000 pieces of knit garments."}
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-2 gap-6">
                        {capacityStats.map((stat: { value: string; label: string }, i: number) => (
                            <ScrollReveal key={stat.label} delay={0.2 + (i * 0.1)}>
                                <div className="flex flex-col items-start gap-2 p-6 md:p-8 rounded-2xl border border-white/5 bg-black">
                                    <span className="text-3xl md:text-4xl font-bold text-gradient">{stat.value}</span>
                                    <span className="text-[0.65rem] md:text-xs uppercase tracking-widest text-white/50">{stat.label}</span>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}
