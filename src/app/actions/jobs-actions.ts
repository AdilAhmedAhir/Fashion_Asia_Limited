"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface Job {
    id: string;
    title: string;
    department: string | null;
    vacancy: number;
    location: string;
    employment_type: string;
    responsibilities: string | null;
    educational_requirements: string | null;
    experience_requirements: string | null;
    additional_requirements: string | null;
    workplace: string | null;
    salary: string | null;
    compensation: string | null;
    published_at: string;
    deadline: string | null;
    is_active: boolean;
    created_at: string;
}

const JOB_FIELDS = [
    "title", "department", "vacancy", "location", "employment_type",
    "responsibilities", "educational_requirements", "experience_requirements",
    "additional_requirements", "workplace", "salary", "compensation",
    "published_at", "deadline", "is_active"
] as const;

function formToPayload(fd: FormData) {
    return {
        title: fd.get("title") as string,
        department: (fd.get("department") as string) || null,
        vacancy: parseInt(fd.get("vacancy") as string) || 1,
        location: (fd.get("location") as string) || "Sreepur, Bangladesh",
        employment_type: (fd.get("employment_type") as string) || "Full-time",
        responsibilities: (fd.get("responsibilities") as string) || null,
        educational_requirements: (fd.get("educational_requirements") as string) || null,
        experience_requirements: (fd.get("experience_requirements") as string) || null,
        additional_requirements: (fd.get("additional_requirements") as string) || null,
        workplace: (fd.get("workplace") as string) || null,
        salary: (fd.get("salary") as string) || null,
        compensation: (fd.get("compensation") as string) || null,
        published_at: (fd.get("published_at") as string) || new Date().toISOString().split("T")[0],
        deadline: (fd.get("deadline") as string) || null,
        is_active: fd.get("is_active") === "true",
    };
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
    const { error } = await supabase.from("jobs").insert(formToPayload(formData));
    if (error) throw new Error(error.message);
    revalidatePath("/admin/careers");
    revalidatePath("/career");
}

export async function updateJob(id: string, formData: FormData) {
    const supabase = await createClient();
    const { error } = await supabase.from("jobs").update(formToPayload(formData)).eq("id", id);
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
