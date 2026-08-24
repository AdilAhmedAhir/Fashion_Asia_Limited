import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getMediaAssets } from "@/app/actions/media-actions";
import { getSettings } from "@/app/actions/settings-actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Life at Fashion Asia",
    description:
        "The culture, welfare, and working life behind Fashion Asia Limited — our people, rewards, wellbeing and safety, and learning — plus photographs from inside the facility.",
    // Self-referencing canonical and per-page OG. Without these every page
    // inherited the homepage's og:url, which matters most right after a
    // URL rename when crawlers are re-resolving these paths.
    alternates: { canonical: "/life-at-fashion-asia" },
    openGraph: {
        url: "/life-at-fashion-asia",
        title: "Life at Fashion Asia",
        description:
                    "The culture, welfare, and working life behind Fashion Asia Limited — our people, rewards, wellbeing and safety, and learning — plus photographs from inside the facility.",
    },
};

export default async function MediaPage() {
    const mediaAssets = await getMediaAssets();
    const galleryItems = mediaAssets.filter((m) => m.type === "gallery");
    const newsItems = mediaAssets.filter((m) => m.type === "news");
    const culture = await getSettings("who_we_are");
    const lifeAtFAL: { title: string; description: string }[] = culture.lifeAtFAL || [];

    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader
                tag="Our Culture"
                title="Life at Fashion Asia"
                description="More than a workplace — a community built on respect, growth, and shared success."
            />

            {/* Culture pillars — moved here from /who-we-are so this page opens
                on the people rather than on the gallery. */}
            {lifeAtFAL.length > 0 && (
                <section className="bg-surface py-24 md:py-32 border-b border-white/5">
                    <div className="container">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {lifeAtFAL.map((item, i) => (
                                <ScrollReveal key={item.title} delay={i * 0.1}>
                                    <div className="h-full rounded-2xl border border-white/10 bg-black/40 p-8 transition-colors hover:border-primary/30">
                                        <h3 className="mb-3 font-serif text-xl font-bold text-foreground">{item.title}</h3>
                                        <p className="leading-relaxed text-white/60">{item.description}</p>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Latest News Section */}
            {newsItems.length > 0 && (
                <section className="container py-24 border-b border-white/5">
                    <ScrollReveal>
                        <h2 className="font-serif text-3xl font-bold text-foreground mb-12">Latest Press &amp; News</h2>
                    </ScrollReveal>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {newsItems.map((news, i) => (
                            <ScrollReveal key={news.id} delay={i * 0.1}>
                                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover:border-primary/50 transition-colors">
                                    {news.url && (
                                        <div className="aspect-video w-full overflow-hidden bg-black">
                                            <img src={news.url} alt={news.title} className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                                        </div>
                                    )}
                                    <div className="flex flex-col flex-grow p-6">
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary/70 mb-3">{new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                        <h3 className="font-serif text-xl font-bold text-white mb-4 line-clamp-2">{news.title}</h3>
                                        <p className="text-white/60 text-sm whitespace-pre-wrap leading-relaxed">{news.content}</p>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </section>
            )}

            {/* Photo Gallery Section */}
            <section className="container py-24">
                <ScrollReveal>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-12">Gallery</h2>
                </ScrollReveal>

                {galleryItems.length === 0 && newsItems.length === 0 ? (
                    <div className="rounded-3xl border border-white/10 border-dashed bg-white/[0.02] p-16 text-center">
                        <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Media assets pending publication via CMS</p>
                    </div>
                ) : galleryItems.length === 0 ? null : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {galleryItems.map((img, i) => (
                            <ScrollReveal key={img.id} delay={(i % 3) * 0.1}>
                                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface break-inside-avoid">
                                    <img src={img.url} alt={img.title} loading="lazy" decoding="async" className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                                        <span className="font-serif text-lg font-bold text-white">{img.title}</span>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
