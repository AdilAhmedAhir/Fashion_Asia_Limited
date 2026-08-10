"use client";

import { useActionState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormStatusMessage } from "@/components/ui/FormStatusMessage";
import { submitGrievanceAction, type SubmitState } from "@/app/actions/form-actions";

export default function GrievanceForm() {
    const [state, formAction] = useActionState<SubmitState, FormData>(submitGrievanceAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-6 rounded-3xl border border-red-500/20 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
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
                <SubmitButton label="Submit Securely" />
            </div>
            <FormStatusMessage state={state} />
        </form>
    );
}
