"use client";

import { useRef, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { submitCareerAction } from "@/app/actions/form-actions";
import JobAccordion from "./JobAccordion";
import type { Job } from "@/app/actions/jobs-actions";

export default function CareerPageClient({ jobs }: { jobs: Job[] }) {
    const formRef = useRef<HTMLFormElement>(null);
    const formSectionRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState("");

    const handleApply = (jobTitle: string) => {
        setPosition(jobTitle);
        // Scroll to form section
        formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader tag="Join Our Team" title="Career Opportunities" description="Submit your CV to join our dedicated workforce of 2,000+ skilled employees." />

            {/* Job Listings Section */}
            {jobs.length > 0 && (
                <section className="container max-w-4xl py-16 md:py-24">
                    <ScrollReveal>
                        <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">Open Positions</h2>
                        <p className="text-sm text-white/40 mb-8">Click on a position to view details and apply</p>
                        <JobAccordion jobs={jobs} onApply={handleApply} />
                    </ScrollReveal>
                </section>
            )}

            {/* Application Form */}
            <section ref={formSectionRef} id="apply" className="container max-w-3xl pb-24 pt-8 scroll-mt-24">
                <ScrollReveal>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">Submit Your Application</h2>
                    <p className="text-sm text-white/40 mb-8">Don&apos;t see a position that fits? Send us your CV and we&apos;ll keep it on file.</p>
                    <form ref={formRef} action={submitCareerAction} className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInput label="Full Name" name="name" />
                            <FormInput label="Phone Number" name="phone" type="tel" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="position" className="font-sans text-xs font-bold uppercase tracking-widest text-white/50">
                                Position Applied For <span className="text-primary">*</span>
                            </label>
                            <input
                                required
                                id="position"
                                name="position"
                                type="text"
                                value={position}
                                onChange={(e) => setPosition(e.target.value)}
                                placeholder="e.g. Officer, Procurement & Development"
                                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 font-sans text-white focus:border-primary focus:outline-none"
                            />
                            {position && (
                                <p className="text-xs text-primary mt-1">Applying for: {position}</p>
                            )}
                        </div>
                        <FormInput label="Link to CV (Google Drive, LinkedIn, etc.)" name="cv_link" type="url" />
                        <div className="mt-4"><SubmitButton label="Submit Application" /></div>
                    </form>
                </ScrollReveal>
            </section>
        </div>
    );
}
