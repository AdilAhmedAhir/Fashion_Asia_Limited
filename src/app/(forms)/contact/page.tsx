import PageHeader from "@/components/ui/PageHeader";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { submitContactAction } from "@/app/actions/form-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact Us | Fashion Asia Limited" };

export default function ContactPage() {
    return (
        <div className="flex flex-col bg-background min-h-screen">
            <PageHeader tag="Get in Touch" title="Contact Us" description="Reach out for business inquiries, partnerships, or general questions." />

            <section className="container max-w-3xl py-24">
                <ScrollReveal>
                    <form action={submitContactAction} className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormInput label="Full Name" name="name" />
                            <FormInput label="Email Address" name="email" type="email" />
                        </div>
                        <FormInput label="Subject" name="subject" />
                        <FormInput label="Message" name="message" textarea />
                        <div className="mt-4"><SubmitButton label="Send Message" /></div>
                    </form>
                </ScrollReveal>
            </section>
        </div>
    );
}
