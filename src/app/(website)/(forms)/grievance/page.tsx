import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import GrievanceForm from "./GrievanceForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Grievance | Fashion Asia Limited" };

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
