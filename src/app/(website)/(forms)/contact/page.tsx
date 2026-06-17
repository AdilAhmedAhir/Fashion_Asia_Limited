import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ContactForm from "./ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us | Fashion Asia Limited" };

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
