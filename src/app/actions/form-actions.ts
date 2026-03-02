"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitContactAction(formData: FormData) {
    const supabase = await createClient();
    const payload = Object.fromEntries(formData.entries());

    const { error } = await supabase.from("submissions").insert({
        type: "contact",
        payload,
        status: "new"
    });

    if (error) console.error("Contact Submission Error:", error);
    revalidatePath("/contact");
}

export async function submitCareerAction(formData: FormData) {
    const supabase = await createClient();
    const payload = Object.fromEntries(formData.entries());

    const { error } = await supabase.from("submissions").insert({
        type: "career",
        payload,
        status: "new"
    });

    if (error) console.error("Career Submission Error:", error);
    revalidatePath("/career");
}

export async function submitGrievanceAction(formData: FormData) {
    const supabase = await createClient();
    const payload = Object.fromEntries(formData.entries());

    const { error } = await supabase.from("submissions").insert({
        type: "grievance",
        payload,
        status: "new"
    });

    if (error) console.error("Grievance Submission Error:", error);
    revalidatePath("/grievance");
}
