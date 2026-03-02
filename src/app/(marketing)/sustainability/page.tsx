import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sustainability | Fashion Asia Limited",
};

export default function SustainabilityPage() {
    const certifications = ['BSCI', 'WRAP', 'SEDEX', 'SLCP', 'OCS', 'GOTS', 'FEM'];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Green Manufacturing"
                title="Sustainability"
                description="Operating as a Green Factory with a strong commitment to environmental stewardship and social responsibility."
            />

            <section className="container py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold mb-8">Global Certifications</h2>
                        <div className="flex flex-wrap justify-center gap-4">
                            {certifications.map((cert, i) => (
                                <ScrollReveal key={cert} delay={i * 0.1}>
                                    <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-6 py-2 text-sm font-bold tracking-widest text-primary">
                                        {cert}
                                    </span>
                                </ScrollReveal>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
