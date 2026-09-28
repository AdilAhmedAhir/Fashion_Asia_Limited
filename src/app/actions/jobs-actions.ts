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

// T-015 (docs/SECURITY.md SEC-HIGH-5 + SEC-MED-10). The three writes below
// follow docs/TECH_STACK.md's "Server Action failure-reporting convention":
// every expected failure (no session, not found, a reported Supabase error)
// is RETURNED as {ok:false, error}, never thrown. Next.js redacts a thrown
// Server Action message in production, so a throw reached the admin as
// nothing useful. Same shape as products-actions.ts's ProductVoidResult.
// Every caller must check `.ok`.
export type JobActionResult = { ok: true } | { ok: false; error: string };

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Byte-for-byte the string updateSettings and products-actions.ts return.
const SESSION_EXPIRED = "Your session expired. Sign in again and retry.";
const JOB_NOT_FOUND = "Job posting not found. Reload the page to see the current list.";

// Every write action checks for an authenticated session server-side, in
// addition to RLS. An exported "use server" function can be called by its
// action ID from anywhere, not only from /admin/careers, so the middleware's
// /admin page gate doesn't protect it. Same helper as products-actions.ts's
// requireUser(); it runs before any read or write.
async function requireUser(supabase: SupabaseServerClient) {
    const {
        data: { user }
    } = await supabase.auth.getUser();
    return user;
}

export async function getJobs(activeOnly = false): Promise<Job[]> {
    const supabase = await createClient();
    let query = supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (activeOnly) query = query.eq("is_active", true);
    const { data } = await query;
    return (data as Job[]) || [];
}

export async function createJob(formData: FormData): Promise<JobActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    const { error } = await supabase.from("jobs").insert(formToPayload(formData));
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/careers");
    revalidatePath("/career");
    return { ok: true };
}

// Updates and deletes ask for the affected row's id back (`.select("id")`) so
// that matching zero rows (deleted in another tab, or a stale id) is reported
// as not-found instead of succeeding silently. Same check as
// products-actions.ts's deleteCategoryProduct. RLS-neutral: the `.eq("id")`
// filter already makes Postgres apply the table's SELECT policies to these
// rows, so returning the id asks for nothing new.
export async function updateJob(id: string, formData: FormData): Promise<JobActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing job posting id." };

    const { data, error } = await supabase
        .from("jobs")
        .update(formToPayload(formData))
        .eq("id", id)
        .select("id")
        .maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: JOB_NOT_FOUND };
    revalidatePath("/admin/careers");
    revalidatePath("/career");
    return { ok: true };
}

export async function deleteJob(id: string): Promise<JobActionResult> {
    const supabase = await createClient();
    const user = await requireUser(supabase);
    if (!user) return { ok: false, error: SESSION_EXPIRED };

    if (!id) return { ok: false, error: "Missing job posting id." };

    const { data, error } = await supabase.from("jobs").delete().eq("id", id).select("id").maybeSingle();
    if (error) return { ok: false, error: error.message };
    if (!data) return { ok: false, error: JOB_NOT_FOUND };
    revalidatePath("/admin/careers");
    revalidatePath("/career");
    return { ok: true };
}
