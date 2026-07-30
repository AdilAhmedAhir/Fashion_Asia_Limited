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
import { CLIENT_LOGOS } from "@/lib/site-content";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const revalidate = 60;

export default async function Home() {
    const hp = await getSettings("homepage");

    return (
        <div className="flex flex-col">
            <HeroSection
                kicker={hp.heroKicker}
                titleTop={hp.heroTitleTop}
                titleAccent={hp.heroTitleAccent}
                facts={hp.heroFacts}
                stats={hp.heroStats}
            />

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
            <MediaPreviewSection
                tag={hp.lifeTag}
                eyebrow={hp.lifeEyebrow}
                description={hp.lifeDescription}
                stat={hp.lifeStat}
                facilities={hp.lifeFacilities}
                pillars={hp.lifePillars}
            />
            <MarqueeSection />

            {/* Trusted By */}
            <section className="bg-background py-20 md:py-28">
                <div className="container text-center">
                    <ScrollReveal>
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Who We Work With</span>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                            Trusted by Leading Global Brands
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.15}>
                        <p className="mx-auto mt-5 max-w-2xl font-sans text-base leading-relaxed text-white/60">
                            Retailers and labels across Europe, the Americas, and Asia rely on us for quality,
                            compliance, and delivery they can plan around.
                        </p>
                    </ScrollReveal>
                    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-16 md:gap-6 lg:grid-cols-4">
                        {CLIENT_LOGOS.map((brand, i) => (
                            <ScrollReveal key={brand.name} delay={0.05 + (i % 4) * 0.08}>
                                <div className="flex h-24 items-center justify-center rounded-xl bg-white px-6 py-5 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md md:h-28">
                                    <img
                                        src={brand.src}
                                        alt={brand.name}
                                        loading="lazy"
                                        className="max-h-12 w-auto max-w-full object-contain md:max-h-14"
                                    />
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                    <ScrollReveal delay={0.2}>
                        <div className="mt-12 flex justify-center">
                            <Link
                                href="/who-we-work-with"
                                className="group flex items-center gap-3 rounded-full border-2 border-primary/50 bg-transparent px-7 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                            >
                                How We Partner
                                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            <ContactSection cards={hp.contactCards} />
        </div>
    );
}
