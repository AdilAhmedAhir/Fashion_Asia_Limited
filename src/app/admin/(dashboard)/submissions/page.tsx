import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
    searchParams: Promise<{ type?: string }>
}

export const revalidate = 0; // Force dynamic fetching for fresh data

export default async function SubmissionsPage(props: Props) {
    const searchParams = await props.searchParams;
    const currentType = searchParams.type || "contact";
    const supabase = await createClient();

    const { data: submissions, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("type", currentType)
        .order("created_at", { ascending: false });

    return (
        <div className="flex max-w-6xl flex-col gap-10">
            <header className="flex flex-col gap-2">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Data Management</span>
                <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">Form Submissions</h1>
                <p className="text-white/50">Review inquiries, applications, and reports securely.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-4">
                {["contact", "career", "grievance"].map((tab) => (
                    <Link
                        key={tab}
                        href={`/admin/submissions?type=${tab}`}
                        className={cn(
                            "rounded-lg px-6 py-2 text-sm font-bold uppercase tracking-widest transition-colors",
                            currentType === tab ? "bg-primary text-black" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        {tab}
                    </Link>
                ))}
            </div>

            {/* Data Grid */}
            <div className="flex flex-col gap-6">
                {error ? (
                    <div className="p-6 text-red-400 bg-red-400/10 rounded-xl border border-red-500/20">
                        Failed to load submissions.
                    </div>
                ) : submissions?.length === 0 ? (
                    <div className="p-12 text-center text-white/40 border border-white/5 border-dashed rounded-2xl bg-white/[0.01]">
                        No {currentType} submissions found yet.
                    </div>
                ) : (
                    submissions?.map((sub) => (
                        <div key={sub.id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black p-6 shadow-xl">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <span className="text-xs text-white/40 font-mono">ID: {sub.id.slice(0, 8)}...</span>
                                <span className="text-xs text-white/40 bg-white/5 px-3 py-1 rounded-md">
                                    {new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(sub.created_at))}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {Object.entries(sub.payload as Record<string, string>).map(([key, value]) => (
                                    <div key={key} className={cn("flex flex-col gap-1 bg-white/[0.02] p-4 rounded-xl border border-white/5", key === "message" || key === "details" ? "md:col-span-2" : "")}>
                                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-primary/70">
                                            {key.replace("_", " ")}
                                        </span>
                                        <p className="text-sm text-white/90 whitespace-pre-wrap">{value || "N/A"}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
