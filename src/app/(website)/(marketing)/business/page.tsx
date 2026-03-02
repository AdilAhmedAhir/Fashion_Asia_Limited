import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Business | Fashion Asia Limited",
};

export default function BusinessPage() {
    const products = ['T-Shirts', 'Polo Shirts', 'Tank Tops', 'Dresses', 'Sleepwear', 'Leggings', 'Sportswear', 'Heavy Jersey Products'];
    const customers = ['Elcort ECI', 'Kappahl', 'Tamurakoma', 'Max India'];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Scale & Precision"
                title="Our Business"
                description="Delivering efficiency, transparency, and precision at every stage of production for the global apparel market."
            />

            {/* Product Catalog */}
            <section className="container py-24 border-b border-white/5">
                <ScrollReveal>
                    <div className="max-w-3xl mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">01. Product Catalog</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Comprehensive Range</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            Fashion Asia Ltd. produces a comprehensive range of high-quality knit garments for global markets. We are capable of handling diverse fabric compositions, designs, and finishing techniques, ensuring that each product meets international quality standards and buyer specifications.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                    {products.map((product, i) => (
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
                            Our factory operates 26 production lines with a monthly production capacity of 800,000 pieces of knit garments. Supported by 2,000 skilled employees and modern production planning systems, we ensure efficient workflow, optimized lead times, and consistent quality output.
                        </p>
                        <p className="mt-4 text-white/70 leading-relaxed text-lg">
                            Advanced machinery including auto spreaders, plotters, and automated cutting systems enhances precision and productivity. Our integrated digital systems across departments ensure real-time data management and operational transparency.
                        </p>
                    </ScrollReveal>

                    <div className="grid grid-cols-2 gap-6">
                        {[
                            { val: "26", lbl: "Production Lines" },
                            { val: "800K", lbl: "Pieces Monthly" },
                            { val: "2,000+", lbl: "Skilled Employees" },
                            { val: "$30M", lbl: "Annual Turnover" }
                        ].map((stat, i) => (
                            <ScrollReveal key={stat.lbl} delay={0.2 + (i * 0.1)}>
                                <div className="flex flex-col items-start gap-2 p-6 md:p-8 rounded-2xl border border-white/5 bg-black">
                                    <span className="text-3xl md:text-4xl font-bold text-gradient">{stat.val}</span>
                                    <span className="text-[0.65rem] md:text-xs uppercase tracking-widest text-white/50">{stat.lbl}</span>
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
                            Fashion Asia Ltd. is proud to serve reputable international buyers who trust us for quality, compliance, and timely delivery. We build strong, long-term partnerships by maintaining transparency, product consistency, and a customer-focused approach.
                        </p>
                    </ScrollReveal>
                </div>

                <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                    {customers.map((customer, i) => (
                        <ScrollReveal key={customer} delay={i * 0.1}>
                            <div className="px-12 py-6 rounded-full border border-white/10 bg-white/[0.02] text-xl font-serif text-white/80 transition-colors hover:border-primary/50 hover:text-primary cursor-default">
                                {customer}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}
