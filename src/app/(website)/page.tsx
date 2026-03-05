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

export default function Home() {
    return (
        <div className="flex flex-col">
            <HeroSection />

            <section className="bg-black py-24 text-center">
                <div className="container max-w-3xl flex flex-col items-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Cinematic Experience</span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-5xl">Innovation in Motion</h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <p className="mt-6 font-sans text-sm leading-relaxed text-white/60 md:text-base">
                            From automated cutting to precision sewing, every step of our manufacturing process is designed for absolute quality and a zero defect philosophy.
                        </p>
                    </ScrollReveal>
                </div>
            </section>

            <AboutSection />
            <BusinessPreviewSection />
            <PillarsSection />
            <ScaleSection />
            <SustainabilityPreviewSection />
            <MediaPreviewSection />
            <MarqueeSection />
            <ContactSection />
        </div>
    );
}
