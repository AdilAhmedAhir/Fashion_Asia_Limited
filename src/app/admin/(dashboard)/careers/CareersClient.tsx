"use client";

import { useState, useTransition } from "react";
import { createJob, updateJob, deleteJob, type Job } from "@/app/actions/jobs-actions";
import { Plus, Pencil, Trash2, X, Briefcase, Loader2, Eye, EyeOff } from "lucide-react";

export default function CareersClient({ initial }: { initial: Job[] }) {
    const [jobs, setJobs] = useState(initial);
    const [modal, setModal] = useState<Job | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [isPending, startTransition] = useTransition();

    const openNew = () => {
        setModal({
            id: "", title: "", department: "", location: "Sreepur, Bangladesh",
            employment_type: "Full-time", description: "", requirements: "",
            published_at: new Date().toISOString().split("T")[0], deadline: "",
            is_active: true, created_at: ""
        });
        setIsNew(true);
    };

    const openEdit = (j: Job) => { setModal({ ...j }); setIsNew(false); };

    const handleSave = () => {
        if (!modal) return;
        const fd = new FormData();
        fd.set("title", modal.title);
        fd.set("department", modal.department || "");
        fd.set("location", modal.location);
        fd.set("employment_type", modal.employment_type);
        fd.set("description", modal.description || "");
        fd.set("requirements", modal.requirements || "");
        fd.set("published_at", modal.published_at);
        fd.set("deadline", modal.deadline || "");
        fd.set("is_active", modal.is_active.toString());

        startTransition(async () => {
            if (isNew) { await createJob(fd); } else { await updateJob(modal.id, fd); }
            setModal(null);
            window.location.reload();
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this job posting?")) return;
        startTransition(async () => { await deleteJob(id); window.location.reload(); });
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            <header className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Management</span>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Career / Job Postings</h1>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                    <Plus size={16} /> Post New Job
                </button>
            </header>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Deadline</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-white/30">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {jobs.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-white/30">No job postings yet. Click &quot;Post New Job&quot; to add one.</td></tr>
                        ) : jobs.map(j => (
                            <tr key={j.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                    <Briefcase size={16} className="text-white/30" /> {j.title}
                                </td>
                                <td className="px-6 py-4 text-white/50">{j.department || "—"}</td>
                                <td className="px-6 py-4 text-white/50">{j.deadline || "Open"}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-widest font-bold ${j.is_active ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"}`}>
                                        {j.is_active ? <><Eye size={10} /> Active</> : <><EyeOff size={10} /> Closed</>}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEdit(j)} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(j.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-8" onClick={() => setModal(null)}>
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-8 my-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-xl font-bold text-white">{isNew ? "Post New Job" : "Edit Job"}</h2>
                            <button onClick={() => setModal(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Job Title *</label>
                                <input type="text" value={modal.title} onChange={e => setModal({ ...modal, title: e.target.value })}
                                    placeholder="e.g. Officer, Procurement & Development"
                                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Department</label>
                                    <input type="text" value={modal.department || ""} onChange={e => setModal({ ...modal, department: e.target.value })}
                                        placeholder="e.g. Merchandising"
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Location</label>
                                    <input type="text" value={modal.location} onChange={e => setModal({ ...modal, location: e.target.value })}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Employment Type</label>
                                    <select value={modal.employment_type} onChange={e => setModal({ ...modal, employment_type: e.target.value })}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Deadline</label>
                                    <input type="date" value={modal.deadline || ""} onChange={e => setModal({ ...modal, deadline: e.target.value })}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Job Description</label>
                                <textarea value={modal.description || ""} onChange={e => setModal({ ...modal, description: e.target.value })}
                                    rows={5} placeholder="Responsibilities, qualifications, benefits..."
                                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none resize-y" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Requirements (one per line)</label>
                                <textarea value={modal.requirements || ""} onChange={e => setModal({ ...modal, requirements: e.target.value })}
                                    rows={4} placeholder="Bachelor's degree in Textile Engineering&#10;2+ years experience&#10;Strong communication skills"
                                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none resize-y" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={modal.is_active} onChange={e => setModal({ ...modal, is_active: e.target.checked })}
                                    className="h-4 w-4 rounded border-white/20 bg-black accent-primary" />
                                <span className="text-sm text-white/70">Active (visible on career page)</span>
                            </label>
                        </div>
                        <button onClick={handleSave} disabled={isPending || !modal.title}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isPending ? "Saving..." : isNew ? "Post Job" : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
