import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GrievanceForm from "./GrievanceForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Grievance",
    description:
        "Raise a grievance with Fashion Asia Limited. Our grievance procedure is confidential and open to employees, suppliers, and community members.",
    // Self-referencing canonical and per-page OG. Without these every page
    // inherited the homepage's og:url, which matters most right after a
    // URL rename when crawlers are re-resolving these paths.
    alternates: { canonical: "/grievance" },
    openGraph: {
        url: "/grievance",
        title: "Grievance",
        description:
                    "Raise a grievance with Fashion Asia Limited. Our grievance procedure is confidential and open to employees, suppliers, and community members.",
    },
};

export default function GrievancePage() {
    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader tag="Safe & Confidential" title="Grievance Cell" description="We strictly maintain confidentiality. Your voice matters in keeping our workplace safe and compliant." />

            <section className="container max-w-3xl py-24">
                <ScrollReveal>
                    <GrievanceForm />
                </ScrollReveal>
            </section>
        </div>
    );
}
