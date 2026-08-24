import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ContactForm from "./ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description:
        "Get in touch with Fashion Asia Limited — factory in Teprirbari, Sreepur, Gazipur and corporate office in Gopalpur, Munnu Nagar, Tongi.",
    // Self-referencing canonical and per-page OG. Without these every page
    // inherited the homepage's og:url, which matters most right after a
    // URL rename when crawlers are re-resolving these paths.
    alternates: { canonical: "/contact" },
    openGraph: {
        url: "/contact",
        title: "Contact Us",
        description:
                    "Get in touch with Fashion Asia Limited — factory in Teprirbari, Sreepur, Gazipur and corporate office in Gopalpur, Munnu Nagar, Tongi.",
    },
};

export default function ContactPage() {
    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader tag="Get in Touch" title="Contact Us" description="Reach out for business inquiries, partnerships, or general questions." />

            <section className="container max-w-3xl py-24">
                <ScrollReveal>
                    <ContactForm />
                </ScrollReveal>
            </section>
        </div>
    );
}
