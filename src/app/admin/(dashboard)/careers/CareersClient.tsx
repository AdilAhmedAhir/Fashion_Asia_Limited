"use client";

import { useState, useTransition } from "react";
import { createJob, updateJob, deleteJob, type Job } from "@/app/actions/jobs-actions";
import { Plus, Pencil, Trash2, X, Briefcase, Loader2, Eye, EyeOff } from "lucide-react";

const EMPTY_JOB: Job = {
    id: "", title: "", department: "", vacancy: 1, location: "Sreepur, Bangladesh",
    employment_type: "Full-time", responsibilities: "", educational_requirements: "",
    experience_requirements: "", additional_requirements: "", workplace: "Work at office",
    salary: "Negotiable", compensation: "", published_at: new Date().toISOString().split("T")[0],
    deadline: "", is_active: true, created_at: ""
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none";
const textareaCls = `${inputCls} resize-y`;

export default function CareersClient({ initial }: { initial: Job[] }) {
    const [jobs] = useState(initial);
    const [modal, setModal] = useState<Job | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [isPending, startTransition] = useTransition();

    const openNew = () => { setModal({ ...EMPTY_JOB }); setIsNew(true); };
    const openEdit = (j: Job) => { setModal({ ...j }); setIsNew(false); };
    const set = (field: string, val: string | number | boolean) => modal && setModal({ ...modal, [field]: val });

    const handleSave = () => {
        if (!modal) return;
        const fd = new FormData();
        Object.entries(modal).forEach(([k, v]) => { if (k !== "id" && k !== "created_at") fd.set(k, String(v ?? "")); });
        startTransition(async () => {
            if (isNew) await createJob(fd); else await updateJob(modal.id, fd);
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
                    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111] p-8 my-auto max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-xl font-bold text-white">{isNew ? "Post New Job" : "Edit Job"}</h2>
                            <button onClick={() => setModal(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <Field label="Job Title *">
                                <input type="text" value={modal.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Officer, Procurement & Development" className={inputCls} />
                            </Field>

                            <div className="grid grid-cols-3 gap-4">
                                <Field label="Department">
                                    <input type="text" value={modal.department || ""} onChange={e => set("department", e.target.value)} placeholder="e.g. Merchandising" className={inputCls} />
                                </Field>
                                <Field label="Vacancy">
                                    <input type="number" min={1} value={modal.vacancy} onChange={e => set("vacancy", parseInt(e.target.value) || 1)} className={inputCls} />
                                </Field>
                                <Field label="Employment Type">
                                    <select value={modal.employment_type} onChange={e => set("employment_type", e.target.value)} className={inputCls}>
                                        <option value="Full-time">Full-time</option>
                                        <option value="Full-time (Work at Office)">Full-time (Work at Office)</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Location">
                                    <input type="text" value={modal.location} onChange={e => set("location", e.target.value)} className={inputCls} />
                                </Field>
                                <Field label="Workplace">
                                    <input type="text" value={modal.workplace || ""} onChange={e => set("workplace", e.target.value)} placeholder="e.g. Work at office" className={inputCls} />
                                </Field>
                            </div>

                            <div className="border-t border-white/5 pt-5 mt-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Job Details</span>
                            </div>

                            <Field label="Job Responsibilities (one per line)">
                                <textarea value={modal.responsibilities || ""} onChange={e => set("responsibilities", e.target.value)} rows={5} placeholder="Find potential Supplier.&#10;Compare & evaluate offers from suppliers.&#10;Track orders and ensure timely delivery." className={textareaCls} />
                            </Field>

                            <Field label="Educational Requirements (one per line)">
                                <textarea value={modal.educational_requirements || ""} onChange={e => set("educational_requirements", e.target.value)} rows={3} placeholder="Bachelor of Science (BSc) in Textile Engineering.&#10;Diploma or Certified course on SCM." className={textareaCls} />
                            </Field>

                            <Field label="Experience Requirements (one per line)">
                                <textarea value={modal.experience_requirements || ""} onChange={e => set("experience_requirements", e.target.value)} rows={3} placeholder="1 to 2 year(s)&#10;Experience in Foreign procurement, International Procurement" className={textareaCls} />
                            </Field>

                            <Field label="Additional Requirements (one per line)">
                                <textarea value={modal.additional_requirements || ""} onChange={e => set("additional_requirements", e.target.value)} rows={3} placeholder="Knowledge on garments & textiles&#10;Good interpersonal skills" className={textareaCls} />
                            </Field>

                            <div className="border-t border-white/5 pt-5 mt-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">Compensation</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Salary">
                                    <input type="text" value={modal.salary || ""} onChange={e => set("salary", e.target.value)} placeholder="Negotiable" className={inputCls} />
                                </Field>
                                <Field label="Deadline">
                                    <input type="date" value={modal.deadline || ""} onChange={e => set("deadline", e.target.value)} className={inputCls} />
                                </Field>
                            </div>

                            <Field label="Compensation & Benefits (one per line)">
                                <textarea value={modal.compensation || ""} onChange={e => set("compensation", e.target.value)} rows={3} placeholder="Mobile bill, Gratuity&#10;Festival Bonus: 2 (Yearly)&#10;Others as per company policy." className={textareaCls} />
                            </Field>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={modal.is_active} onChange={e => set("is_active", e.target.checked)}
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
