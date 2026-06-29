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
                    <ScrollReveal delay={0.1}>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                            Trusted by Leading Global Brands
                        </h2>
                    </ScrollReveal>
                    <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-16 md:gap-6 lg:grid-cols-4">
                        {[
                            { name: "El Corte Inglés", src: "/images/client/logos/el-corte-ingles.png" },
                            { name: "Kappahl", src: "/images/client/logos/kappahl.png" },
                            { name: "Sports Direct", src: "/images/client/logos/sports-direct.png" },
                            { name: "Renner", src: "/images/client/logos/renner.png" },
                            { name: "Kenneth Cole New York", src: "/images/client/logos/kenneth-cole.png" },
                            { name: "Beverly Hills Polo Club", src: "/images/client/logos/beverly-hills-polo-club.png" },
                            { name: "Ochnik", src: "/images/client/logos/ochnik.png" },
                            { name: "Piazza Italia", src: "/images/client/logos/piazza-italia.png" },
                            { name: "American Holic", src: "/images/client/logos/american-holic.png" },
                            { name: "Lakole", src: "/images/client/logos/lakole.png" },
                            { name: "Paper Denim & Cloth", src: "/images/client/logos/paper-denim-cloth.png" },
                            { name: "Gym Glamour", src: "/images/client/logos/gym-glamour.png" },
                            { name: "Free Planet", src: "/images/client/logos/free-planet.png" },
                            { name: "JVZ", src: "/images/client/logos/jvz.png" },
                        ].map((brand, i) => (
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
                </div>
            </section>

            <ContactSection cards={hp.contactCards} />
        </div>
    );
}
