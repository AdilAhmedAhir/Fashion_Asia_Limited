import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSettings } from "@/app/actions/settings-actions";
import { normalizeProducts } from "@/lib/site-content";
import { ArrowRight } from "lucide-react";
import { Fragment } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "What We Do",
    description:
        "Knit garment manufacturing at scale — 26 production lines, 800,000 pieces monthly, from t-shirts and polos to sportswear and heavy jersey.",
    // Self-referencing canonical and per-page OG. Without these every page
    // inherited the homepage's og:url, which matters most right after a
    // URL rename when crawlers are re-resolving these paths.
    alternates: { canonical: "/what-we-do" },
    openGraph: {
        url: "/what-we-do",
        title: "What We Do",
        description:
                    "Knit garment manufacturing at scale — 26 production lines, 800,000 pieces monthly, from t-shirts and polos to sportswear and heavy jersey.",
    },
};

export const revalidate = 60;

export default async function BusinessPage() {
    const data = await getSettings("business");
    const products = normalizeProducts(data.products);
    const processSteps: string[] = data.processSteps?.length ? data.processSteps : [];
    // Blank lines separate paragraphs, so the copy stays a single textarea in the admin.
    const craftParagraphs: string[] = (data.whatWeDoText || "").split(/\n\s*\n/).map((p: string) => p.trim()).filter(Boolean);

    return (
        <div className="flex flex-col bg-background">
            <PageHeader
                tag="Scale & Precision"
                title="What We Do"
                description="Delivering efficiency, transparency, and precision at every stage of production for the global apparel market."
            />

            {/* End-to-end process. The pipeline reads as chips joined by arrows,
                echoing how the steps were written, and wraps rather than
                squeezing seven items onto one line. */}
            {processSteps.length > 0 && (
                <section className="container py-24 border-b border-white/5">
                    <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
                        <ScrollReveal>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our Craft</span>
                                <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                                    {data.processTitle || "A complete solution from start to finish."}
                                </h2>

                                <ol className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4">
                                    {processSteps.map((step, i) => (
                                        <Fragment key={step}>
                                            {i > 0 && (
                                                <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                                            )}
                                            <li className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 font-sans text-sm font-semibold text-foreground transition-all duration-300 hover:border-primary/60 hover:bg-primary/20">
                                                {step}
                                            </li>
                                        </Fragment>
                                    ))}
                                </ol>

                                {data.whatWeDoTagline && (
                                    <p className="mt-10 font-serif text-2xl font-bold text-gradient md:text-3xl">{data.whatWeDoTagline}</p>
                                )}
                            </div>
                        </ScrollReveal>

                        {/* Cutting-room clip. Muted + playsInline so it can
                            autoplay on mobile; the poster covers the gap before
                            the file arrives. */}
                        <ScrollReveal delay={0.2}>
                            <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-surface lg:max-w-[360px]">
                                <video
                                    src="/videos/cutting.mp4"
                                    poster="/images/client/cutting-poster.webp"
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    aria-label="Automated fabric cutting on the production floor"
                                    className="h-full w-full object-cover"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                <div className="absolute bottom-5 left-5 rounded-full border border-primary/60 bg-background/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-accent backdrop-blur-md">
                                    Precision Cutting
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
            )}

            {/* Product Catalog */}
            <section className="container py-24 border-b border-white/5">
                <ScrollReveal>
                    <div className="max-w-3xl mb-16">
                        <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">01. Product Catalog</span>
                        <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">Comprehensive Range</h2>
                        <div className="mt-6 flex flex-col gap-5">
                            {craftParagraphs.map((para, i) => (
                                <p key={i} className="text-white/70 leading-relaxed text-lg">{para}</p>
                            ))}
                        </div>
                    </div>
                </ScrollReveal>

                {/* Photo cards per the client's reference — photograph behind,
                    name on a scrim at the bottom left. Photos are real production
                    shots (no per-product photography exists), B&W for cohesion. */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
                    {/* Titles are client-entered and can repeat, so the key pairs
                        the title with its position rather than trusting uniqueness. */}
                    {products.map((product, i) => (
                        <ScrollReveal key={`${product.title}-${i}`} delay={i * 0.1}>
                            <div className="group relative h-48 overflow-hidden rounded-xl border border-white/10 bg-surface md:h-56">
                                <img
                                    src={product.image}
                                    alt=""
                                    aria-hidden="true"
                                    loading="lazy"
                                    decoding="async"
                                    className="absolute inset-0 h-full w-full object-cover opacity-70 transition-all duration-700 group-hover:scale-105 group-hover:opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                {/* Title and description share one bottom block so the
                                    card looks right whether or not a description is set. */}
                                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1.5 p-4">
                                    <span className="line-clamp-2 font-serif text-lg font-bold leading-snug text-white">
                                        {product.title}
                                    </span>
                                    {/* Clamped: the card is a fixed height and the description is
                                        free text, so an over-long one would otherwise grow this
                                        block past the top of the card and clip the title. */}
                                    {product.description && (
                                        <p className="line-clamp-3 text-xs leading-relaxed text-white/70">
                                            {product.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </section>

            {/* Showroom band — moved here from /global-partner. The photograph is
                near-white, so the image itself is dimmed rather than buried under
                scrims, keeping the room legible behind white type. */}
            <section className="relative h-[280px] w-full overflow-hidden md:h-[400px]">
                <img
                    src="/images/client/showroom.jpg"
                    alt="Sample showroom at Fashion Asia Limited, with garment rails and display plinths"
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[0.45] grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
                <div className="absolute inset-0 flex items-center">
                    <div className="container">
                        <ScrollReveal>
                            <p className="max-w-xl font-serif text-2xl font-bold leading-tight text-foreground md:text-3xl">
                                Every partnership starts in the sample room — with fit, fabric, and finish
                                agreed before a single bulk piece is cut.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </section>

        </div>
    );
}
