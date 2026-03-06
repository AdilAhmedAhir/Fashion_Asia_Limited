import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings, getLeaders } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Who We Are | Fashion Asia Limited",
};

export const revalidate = 60;

export default async function WhoWeArePage() {
    const data = await getSettings("who_we_are");
    const leaders = await getLeaders();

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
                            {data.aboutParagraph1 || "Fashion Asia Ltd. is a 100% export-oriented Ready-Made Garments (RMG) manufacturing company specializing in knitwear. Located in Sreepur, Gazipur, one of Bangladesh's key industrial hubs, our factory operates with modern infrastructure and advanced production technology."}
                        </p>
                        <p className="text-white/70 leading-relaxed text-lg">
                            {data.aboutParagraph2 || "As part of Northern Tosrifa Group, we inherit decades of industry expertise, strong governance, and global market experience."}
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
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">{data.visionTitle || "A Globally Recognized Leader"}</h3>
                            <p className="mt-6 text-white/60 leading-relaxed text-lg">
                                {data.visionDescription || "To be a globally recognized knitwear manufacturer known for sustainable practices, technological advancement, and excellence in product quality."}
                            </p>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <div className="p-8 md:p-12 rounded-3xl border border-white/10 bg-black/50 h-full hover:border-primary/30 transition-colors">
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Mission</span>
                            <h3 className="mt-4 font-serif text-2xl md:text-3xl font-bold text-foreground">{data.missionTitle || "Responsible Manufacturing"}</h3>
                            <p className="mt-6 text-white/60 leading-relaxed text-lg">
                                {data.missionDescription || "To deliver superior knit garments through innovation, efficiency, and responsible manufacturing while ensuring employee welfare, environmental protection, and long-term value creation for our stakeholders."}
                            </p>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* Leadership */}
            <section className="container py-24 md:py-32">
                <div className="mx-auto max-w-4xl text-center">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold text-gradient md:text-4xl mb-8">Leadership</h2>
                        <p className="text-white/70 leading-relaxed text-lg mb-12">
                            Fashion Asia Ltd. is guided by experienced industry leaders who bring decades of knowledge in garment manufacturing, strategic management, and global sourcing.
                        </p>
                    </ScrollReveal>

                    {leaders.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
                            {leaders.map((leader, i) => (
                                <ScrollReveal key={leader.id} delay={i * 0.1}>
                                    <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:border-primary/30 transition-colors">
                                        {leader.photo_url ? (
                                            <img src={leader.photo_url} alt={leader.name} className="h-24 w-24 rounded-full object-cover border-2 border-primary/30" />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                                                {leader.name.charAt(0)}
                                            </div>
                                        )}
                                        <h3 className="font-serif text-xl font-bold text-white">{leader.name}</h3>
                                        <span className="text-xs uppercase tracking-widest text-primary font-bold">{leader.title}</span>
                                        {leader.bio && <p className="text-white/60 text-sm leading-relaxed mt-2">{leader.bio}</p>}
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-12 p-8 border border-dashed border-white/20 rounded-2xl bg-white/[0.01]">
                            <p className="text-xs uppercase tracking-widest text-white/30 font-bold">Leadership profiles can be managed via the Admin Panel</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
