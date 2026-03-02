import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Who We Are | Fashion Asia Limited",
};

export default function WhoWeArePage() {
    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Inheriting Excellence"
                title="Who We Are"
                description="A 100% export-oriented Ready-Made Garments manufacturing company specializing in knitwear, backed by the 34-year legacy of Northern Tosrifa Group."
            />

            <section className="container py-24 md:py-32">
                <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl">Our Mission</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            To deliver superior knit garments through innovation, efficiency, and responsible manufacturing while ensuring employee welfare, environmental protection, and long-term value creation for our stakeholders.
                        </p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl">Our Vision</h2>
                        <p className="mt-6 text-white/70 leading-relaxed text-lg">
                            To be a globally recognized knitwear manufacturer known for sustainable practices, technological advancement, and excellence in product quality.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            <section className="bg-surface py-24 border-y border-white/5">
                <div className="container text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold md:text-4xl">Leadership</h2>
                        <p className="mt-4 text-white/50">Guided by decades of industry knowledge and strategic management.</p>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
