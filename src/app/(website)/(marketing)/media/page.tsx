import PageHeader from "@/components/ui/PageHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Media | Fashion Asia Limited",
};

export default function MediaPage() {
    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader
                tag="Press & Gallery"
                title="Media Center"
                description="Latest news, press releases, and visual insights into our manufacturing excellence."
            />

            <section className="container flex-grow py-24 flex items-center justify-center">
                <div className="rounded-3xl border border-white/10 border-dashed bg-white/[0.02] p-16 text-center">
                    <p className="text-white/30 uppercase tracking-widest text-sm font-bold">Media assets pending CMS Integration</p>
                </div>
            </section>
        </div>
    );
}
