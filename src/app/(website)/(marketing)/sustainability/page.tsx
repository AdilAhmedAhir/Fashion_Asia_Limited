import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sustainability | Fashion Asia Limited",
};

export const revalidate = 60;

export default async function SustainabilityPage() {
    const data = await getSettings("sustainability");
    const certifications = data.certifications?.length ? data.certifications : ['BSCI', 'WRAP', 'SEDEX', 'SLCP', 'OCS', 'GOTS', 'FEM'];
    const initiatives = data.initiatives?.length ? data.initiatives : [
        "Use of renewable and solar energy",
        "Rainwater harvesting systems",
        "Energy-efficient production processes",
        "Waste reduction and responsible resource management",
        "Fair Price Shop facility for employees",
        "Educational support through the '100 Dream School Program' under Jaggo Foundation",
    ];

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Green Manufacturing"
                title="Sustainability"
                description="Operating as a Green Factory with a strong commitment to environmental stewardship and social responsibility."
            />

            {/* Reports & Compliance */}
            <section className="container py-24 border-b border-white/5">
                <ScrollReveal>
                    <div className="max-w-4xl mx-auto text-center">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Reports &amp; Compliance</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl mb-8">Integral to our Business Model</h2>
                        <p className="text-white/70 leading-relaxed text-lg">
                            {data.description || "Sustainability and compliance are integral to our business model. We maintain transparent documentation and reporting aligned with international standards and buyer requirements."}
                        </p>
                    </div>
                </ScrollReveal>
            </section>

            {/* Initiatives */}
            <section className="bg-surface py-24 border-b border-white/5">
                <div className="container max-w-5xl mx-auto">
                    <ScrollReveal>
                        <div className="mb-16">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Environmental &amp; Social</span>
                            <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Key Sustainability Initiatives</h2>
                            <p className="mt-4 text-white/70 text-lg">We believe sustainable growth is only possible when business success aligns with social and environmental well-being.</p>
                        </div>
                    </ScrollReveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {initiatives.map((item: string, i: number) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="flex items-start gap-4 p-8 rounded-2xl border border-white/5 bg-black/40 hover:border-primary/20 transition-colors h-full">
                                    <div className="mt-1 h-3 w-3 rounded-full bg-primary flex-shrink-0 shadow-[0_0_10px_#016138]" />
                                    <p className="text-white/80 font-sans leading-relaxed text-lg">{item}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Certifications */}
            <section className="container py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Global Recognition</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold mb-6">Certifications &amp; Audits</h2>
                        <p className="text-white/70 leading-relaxed text-lg mb-12">
                            These certifications demonstrate our commitment to ethical business conduct, responsible sourcing, environmental management, and international labor standards.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            {certifications.map((cert: string, i: number) => (
                                <ScrollReveal key={cert} delay={i * 0.1}>
                                    <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-8 py-3 text-sm font-bold tracking-widest text-primary hover:bg-primary hover:text-black transition-colors cursor-default">
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
