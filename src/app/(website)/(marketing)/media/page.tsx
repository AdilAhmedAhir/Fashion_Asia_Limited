import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media Center | Fashion Asia Limited",
};

export const revalidate = 60; // Cache for 60 seconds (ISR)

export default async function MediaPage() {
    const supabase = await createClient();
    const { data: media } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });

    const galleryItems = media?.filter(m => m.type === "gallery") || [];
    const newsItems = media?.filter(m => m.type === "news") || [];

    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader
                tag="Press & Gallery"
                title="Media Center"
                description="Latest news, press releases, and visual insights into our manufacturing excellence."
            />

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
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-12">Factory Gallery</h2>
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
                                    <img src={img.url} alt={img.title} className="w-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
