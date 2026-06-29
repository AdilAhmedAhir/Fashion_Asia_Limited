import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Business | Fashion Asia Limited",
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
                title="Our Business"
                description="Delivering efficiency, transparency, and precision at every stage of production for the global apparel market."
            />

            {/* What We Do */}
            {data.whatWeDoText && (
                <section className="container py-24 border-b border-white/5">
                    <ScrollReveal>
                        <div className="mx-auto max-w-4xl text-center">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">What We Do</span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl mb-8">Ideas Into World-Class Knitwear</h2>
                            <p className="text-white/70 leading-relaxed text-lg">{data.whatWeDoText}</p>
                            {data.whatWeDoTagline && (
                                <p className="mt-8 font-serif text-2xl md:text-3xl font-bold text-gradient">{data.whatWeDoTagline}</p>
                            )}
                        </div>
                    </ScrollReveal>
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

            {/* Customers */}
            <section className="container py-24">
                <div className="max-w-3xl mx-auto text-center mb-16">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">03. Customers</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Trusted Global Partners</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            Fashion Asia Ltd. is proud to serve reputable international buyers who trust us for quality, compliance, and timely delivery.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4">
                    {[
                        { name: "El Corte Inglés", src: "/images/client/logos/el-corte-ingles.png" },
                        { name: "Kappahl", src: "/images/client/logos/kappahl.png" },
                        { name: "Sports Direct", src: "/images/client/logos/sports-direct.png" },
                        { name: "Renner", src: "/images/client/logos/renner.png" },
                        { name: "Kenneth Cole New York", src: "/images/client/logos/kenneth-cole.png" },
                        { name: "Beverly Hills Polo Club", src: "/images/client/logos/beverly-hills-polo-club.png" },
                        { name: "Ochnik", src: "/images/client/logos/ochnik.png" },
                        { name: "Piazza Italia", src: "/images/client/logos/piazza-italia.png" },
                        { name: "American Holic", src: "/images/client/logos/american-holic.png" },
                        { name: "Lakole", src: "/images/client/logos/lakole.png" },
                        { name: "Paper Denim & Cloth", src: "/images/client/logos/paper-denim-cloth.png" },
                        { name: "Gym Glamour", src: "/images/client/logos/gym-glamour.png" },
                        { name: "Free Planet", src: "/images/client/logos/free-planet.png" },
                        { name: "JVZ", src: "/images/client/logos/jvz.png" },
                    ].map((customer, i) => (
                        <ScrollReveal key={customer.name} delay={0.05 + (i % 4) * 0.08}>
                            <div className="flex h-24 items-center justify-center rounded-xl bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md md:h-28">
                                <img
                                    src={customer.src}
                                    alt={customer.name}
                                    loading="lazy"
                                    className="max-h-12 w-auto max-w-full object-contain md:max-h-14"
                                />
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}
