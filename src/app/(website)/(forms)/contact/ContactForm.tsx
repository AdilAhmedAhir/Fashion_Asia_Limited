"use client";

import { useActionState } from "react";
import { FormInput } from "@/components/ui/FormInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { FormStatusMessage } from "@/components/ui/FormStatusMessage";
import { submitContactAction, type SubmitState } from "@/app/actions/form-actions";

export default function ContactForm() {
    const [state, formAction] = useActionState<SubmitState, FormData>(submitContactAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-6 rounded-3xl border border-white/5 bg-white/[0.02] p-8 md:p-12 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormInput label="Full Name" name="name" />
                <FormInput label="Email Address" name="email" type="email" />
            </div>
            <FormInput label="Subject" name="subject" />
            <FormInput label="Message" name="message" textarea />
            <div className="mt-4">
                <SubmitButton label="Send Message" />
            </div>
            <FormStatusMessage state={state} />
        </form>
    );
}
