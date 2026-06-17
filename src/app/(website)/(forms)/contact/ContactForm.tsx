"use client";

import { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { CONTACT_EMAIL } from "@/lib/site-content";

export default function ContactForm() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name") || "");
        const email = String(fd.get("email") || "");
        const subject = String(fd.get("subject") || "");
        const message = String(fd.get("message") || "");

        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            subject || "Website enquiry"
        )}&body=${encodeURIComponent(body)}`;
        setSent(true);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormInput label="Full Name" name="name" />
                <FormInput label="Email Address" name="email" type="email" />
            </div>
            <FormInput label="Subject" name="subject" />
            <FormInput label="Message" name="message" textarea />
            <div className="mt-4">
                <button
                    type="submit"
                    className="group relative flex w-full md:w-fit items-center justify-center gap-4 overflow-hidden rounded-full border-2 border-primary bg-primary px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-transparent hover:text-primary hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                >
                    Send Message
                </button>
            </div>
            {sent && (
                <p className="text-sm text-primary">
                    Your email app should now open with the message ready to send. If it didn&apos;t,
                    email us directly at {CONTACT_EMAIL}.
                </p>
            )}
        </form>
    );
}
