import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import BusinessPreviewSection from "@/components/sections/BusinessPreviewSection";
import PillarsSection from "@/components/sections/PillarsSection";
import ScaleSection from "@/components/sections/ScaleSection";
import SustainabilityPreviewSection from "@/components/sections/SustainabilityPreviewSection";
import MediaPreviewSection from "@/components/sections/MediaPreviewSection";
import MarqueeSection from "@/components/sections/MarqueeSection";
import ContactSection from "@/components/sections/ContactSection";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";

export const revalidate = 60;

export default async function Home() {
    const hp = await getSettings("homepage");

    return (
        <div className="flex flex-col">
            <HeroSection />

            <section className="bg-black py-24 text-center">
                <div className="container max-w-3xl flex flex-col items-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cinematic Experience</span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-5xl">{hp.heroTagline || "Innovation in Motion"}</h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="mt-6 font-sans text-sm leading-relaxed text-white/60 md:text-base">
                            {hp.heroSubtitle || "From automated cutting to precision sewing, every step of our manufacturing process is designed for absolute quality and a zero defect philosophy."}
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            <AboutSection
                tag={hp.aboutTag}
                title={hp.aboutTitle}
                description={hp.aboutDescription}
                stats={hp.aboutStats}
            />
            <BusinessPreviewSection
                tag={hp.businessTag}
                title={hp.businessTitle}
                description={hp.businessDescription}
                products={hp.businessProducts}
                stats={hp.businessStats}
            />
            <PillarsSection />
            <ScaleSection stats={hp.scaleStats} />
            <SustainabilityPreviewSection
                tag={hp.sustainabilityTag}
                title={hp.sustainabilityTitle}
                description={hp.sustainabilityDescription}
                certs={hp.sustainabilityCerts}
                highlights={hp.sustainabilityHighlights}
            />
            <MediaPreviewSection />
            <MarqueeSection />

            {/* Trusted By */}
            <section className="bg-background py-20 md:py-28">
                <div className="container text-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Trusted By</span>
                    </ScrollReveal>
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-12 md:gap-20">
                        {["El Corte Inglés", "KappAhl", "U.S. Polo Assn."].map((brand, i) => (
                            <ScrollReveal key={brand} delay={0.1 + i * 0.15}>
                                <span className="font-serif text-2xl md:text-3xl font-semibold text-foreground/70 transition-colors hover:text-foreground cursor-default">
                                    {brand}
                                </span>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            <ContactSection cards={hp.contactCards} />
        </div>
    );
}
