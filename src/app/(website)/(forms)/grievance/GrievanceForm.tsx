"use client";

import { useState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { CONTACT_EMAIL } from "@/lib/site-content";

export default function GrievanceForm() {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const category = String(fd.get("category") || "");
        const details = String(fd.get("details") || "");
        const name = String(fd.get("name") || "");
        const department = String(fd.get("department") || "");

        const body =
            `Nature of Grievance: ${category}\n\n` +
            `Details:\n${details}\n\n` +
            `Name: ${name || "(anonymous)"}\n` +
            `Department: ${department || "(not provided)"}`;
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
            "Grievance Submission"
        )}&body=${encodeURIComponent(body)}`;
        setSent(true);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-3xl border border-red-500/20 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
            <div className="flex flex-col gap-2">
                <label htmlFor="category" className="font-sans text-xs font-bold uppercase tracking-widest text-white/50">Nature of Grievance <span className="text-primary">*</span></label>
                <select required id="category" name="category" defaultValue="" className="mt-2 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-4 font-sans text-white focus:border-primary focus:outline-none appearance-none">
                    <option value="" disabled>Select category...</option>
                    <option value="compliance">Compliance Issue</option>
                    <option value="harassment">Harassment / Discrimination</option>
                    <option value="safety">Health &amp; Safety</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <FormInput label="Grievance Details" name="details" textarea />

            <div className="mt-4 border-t border-white/10 pt-8">
                <p className="mb-6 text-xs text-white/40 uppercase tracking-widest">Optional Contact Information (Leave blank to remain anonymous)</p>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormInput label="Name (Optional)" name="name" required={false} />
                    <FormInput label="Department (Optional)" name="department" required={false} />
                </div>
            </div>

            <div className="mt-4">
                <button
                    type="submit"
                    className="group relative flex w-full md:w-fit items-center justify-center gap-4 overflow-hidden rounded-full border-2 border-primary bg-primary px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-transparent hover:text-primary hover:shadow-[0_0_30px_rgba(14,201,122,0.3)]"
                >
                    Submit Securely
                </button>
            </div>
            {sent && (
                <p className="text-sm text-primary">
                    Your email app should now open with the grievance ready to send. If it didn&apos;t,
                    email us directly at {CONTACT_EMAIL}.
                </p>
            )}
        </form>
    );
}
