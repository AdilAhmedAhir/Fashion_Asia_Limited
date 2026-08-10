"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CONTACT_EMAIL } from "@/lib/site-content";

export type SubmitState = { ok: boolean; message: string } | null;

const FAILURE = `We couldn't record your message. Please email us directly at ${CONTACT_EMAIL}.`;

async function submit(
    type: "contact" | "career" | "grievance",
    path: string,
    success: string,
    formData: FormData
): Promise<SubmitState> {
    const supabase = await createClient();
    const payload = Object.fromEntries(formData.entries());

    const { error } = await supabase.from("submissions").insert({
        type,
        payload,
        status: "new"
    });

    if (error) {
        console.error(`${type} submission error:`, error);
        return { ok: false, message: FAILURE };
    }

    revalidatePath(path);
    return { ok: true, message: success };
}

export async function submitContactAction(_prev: SubmitState, formData: FormData) {
    return submit("contact", "/contact", "Thank you — we've received your message and will be in touch.", formData);
}

export async function submitCareerAction(_prev: SubmitState, formData: FormData) {
    return submit("career", "/career", "Thank you — your application has been received.", formData);
}

export async function submitGrievanceAction(_prev: SubmitState, formData: FormData) {
    return submit("grievance", "/grievance", "Your grievance has been submitted and will be reviewed confidentially.", formData);
}
