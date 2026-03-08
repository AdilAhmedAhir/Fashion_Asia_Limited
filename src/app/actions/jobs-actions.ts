"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Job {
    id: string;
    title: string;
    department: string | null;
    location: string;
    employment_type: string;
    description: string | null;
    requirements: string | null;
    published_at: string;
    deadline: string | null;
    is_active: boolean;
    created_at: string;
}

export async function getJobs(activeOnly = false): Promise<Job[]> {
    const supabase = await createClient();
    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (activeOnly) query = query.eq("is_active", true);
    const { data } = await query;
    return (data as Job[]) || [];
}

export async function createJob(formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").insert({
        title: formData.get("title") as string,
        department: formData.get("department") as string || null,
        location: formData.get("location") as string || "Sreepur, Bangladesh",
        employment_type: formData.get("employment_type") as string || "Full-time",
        description: formData.get("description") as string || null,
        requirements: formData.get("requirements") as string || null,
        published_at: formData.get("published_at") as string || new Date().toISOString().split("T")[0],
        deadline: formData.get("deadline") as string || null,
        is_active: formData.get("is_active") === "true",
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/careers");
    revalidatePath("/career");
}

export async function updateJob(id: string, formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").update({
        title: formData.get("title") as string,
        department: formData.get("department") as string || null,
        location: formData.get("location") as string || "Sreepur, Bangladesh",
        employment_type: formData.get("employment_type") as string || "Full-time",
        description: formData.get("description") as string || null,
        requirements: formData.get("requirements") as string || null,
        published_at: formData.get("published_at") as string || new Date().toISOString().split("T")[0],
        deadline: formData.get("deadline") as string || null,
        is_active: formData.get("is_active") === "true",
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/careers");
    revalidatePath("/career");
}

export async function deleteJob(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/careers");
    revalidatePath("/career");
}
