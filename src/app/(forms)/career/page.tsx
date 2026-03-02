import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { submitCareerAction } from "@/app/actions/form-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Career | Fashion Asia Limited" };

export default function CareerPage() {
    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader tag="Join Our Team" title="Career Opportunities" description="Submit your CV to join our dedicated workforce of 2,000 skilled employees." />

            <section className="container max-w-3xl py-24">
                <ScrollReveal>
                    <form action={submitCareerAction} className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInput label="Full Name" name="name" />
                            <FormInput label="Phone Number" name="phone" type="tel" />
                        </div>
                        <FormInput label="Position Applied For" name="position" />
                        <FormInput label="Link to CV (Google Drive, LinkedIn, etc.)" name="cv_link" type="url" />
                        <div className="mt-4"><SubmitButton label="Submit Application" /></div>
                    </form>
                </ScrollReveal>
            </section>
        </div>
    );
}
