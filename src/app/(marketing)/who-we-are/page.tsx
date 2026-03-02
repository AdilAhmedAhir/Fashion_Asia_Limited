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
                description="A 100% export-oriented Ready-Made Garments manufacturing company specializing in knitwear, backed by the legacy of Northern Tosrifa Group."
            />

            {/* About Us */}
            <section className="container py-24 md:py-32">
                <ScrollReveal>
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl mb-8">About Us</h2>
                        <p className="text-white/70 leading-relaxed text-lg mb-6">
                            Fashion Asia Ltd. is a 100% export-oriented Ready-Made Garments (RMG) manufacturing company specializing in knitwear. Located in Sreepur, Gazipur, one of Bangladesh&apos;s key industrial hubs, our factory operates with modern infrastructure and advanced production technology.
                        </p>
                        <p className="text-white/70 leading-relaxed text-lg">
                            As part of Northern Tosrifa Group, we inherit decades of industry expertise, strong governance, and global market experience. Our operational model focuses on quality excellence, production efficiency, social compliance, and environmental responsibility. We are committed to building long-term partnerships with international brands through reliability, transparency, and ethical business practices.
                        </p>
                    </div>
                </ScrollReveal>
            </section>

            {/* Mission & Vision */}
            <section className="bg-surface py-24 border-y border-white/5">
                <div className="container grid grid-cols-1 gap-16 md:grid-cols-2 max-w-6xl mx-auto">
                    <ScrollReveal delay={0.1}>
                        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/50 h-full hover:border-primary/30 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Vision</span>
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">A Globally Recognized Leader</h3>
                            <p className="mt-6 text-white/60 leading-relaxed text-lg">
                                To be a globally recognized knitwear manufacturer known for sustainable practices, technological advancement, and excellence in product quality.
                            </p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/50 h-full hover:border-primary/30 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Mission</span>
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">Responsible Manufacturing</h3>
                            <p className="mt-6 text-white/60 leading-relaxed text-lg">
                                To deliver superior knit garments through innovation, efficiency, and responsible manufacturing while ensuring employee welfare, environmental protection, and long-term value creation for our stakeholders. We strive to continuously improve our processes, empower our workforce, and contribute positively to the apparel industry and the communities we serve.
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Leaders Introduction */}
            <section className="container py-24 md:py-32">
                <div className="mx-auto max-w-4xl text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl mb-8">Leadership</h2>
                        <p className="text-white/70 leading-relaxed text-lg mb-6">
                            Fashion Asia Ltd. is guided by experienced industry leaders who bring decades of knowledge in garment manufacturing, strategic management, and global sourcing. Under the strategic direction of Northern Tosrifa Group, our leadership team ensures operational excellence, compliance integrity, and continuous innovation.
                        </p>
                        <p className="text-white/70 leading-relaxed text-lg">
                            Our management philosophy is rooted in professionalism, accountability, and ethical governance. By combining visionary leadership with strong technical expertise, we drive sustainable growth and maintain our commitment to quality and customer satisfaction.
                        </p>
                        <div className="mt-12 p-8 border border-dashed border-white/20 rounded-2xl bg-white/[0.01]">
                            <p className="text-xs uppercase tracking-widest text-white/30 font-bold">Leadership Profiles Pending CMS Integration</p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    );
}
