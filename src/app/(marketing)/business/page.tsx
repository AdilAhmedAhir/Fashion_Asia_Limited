import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Business | Fashion Asia Limited",
};

export default function BusinessPage() {
    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Scale & Precision"
                title="Our Business"
                description="Operating 26 production lines with a monthly capacity of 800,000 pieces, delivering efficiency, transparency, and precision at every stage."
            />

            <section className="container py-24">
                <ScrollReveal>
                    <h2 className="font-serif text-3xl font-bold mb-12 text-center md:text-left">Product Portfolio</h2>
                </ScrollReveal>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-8">
                    {['T-Shirts', 'Polo Shirts', 'Tank Tops', 'Dresses', 'Sleepwear', 'Leggings', 'Sportswear', 'Heavy Jersey'].map((product, i) => (
                        <ScrollReveal key={product} delay={i * 0.1}>
                            <div className="flex h-32 items-center justify-center rounded-xl border border-white/5 bg-white/[0.02] text-center font-serif text-lg text-white/80 transition-colors hover:border-primary/50 hover:bg-primary/5 hover:text-primary">
                                {product}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>
        </div>
    );
}
