"use client";

import { useState, useTransition } from "react";
import { createReport, updateReport, deleteReport } from "@/app/actions/settings-actions";
import { Plus, Pencil, Trash2, X, FileText, Loader2 } from "lucide-react";

const CATEGORIES = ["financial", "audit", "compliance", "environmental", "csr"] as const;
const CATEGORY_COLORS: Record<string, string> = {
    financial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    audit: "bg-green-500/20 text-green-400 border-green-500/30",
    compliance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    environmental: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    csr: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

interface Report {
    id: string; title: string; category: string; year: number;
    file_url: string | null; published: boolean; created_at: string;
}

export default function ReportsClient({ initial }: { initial: Report[] }) {
    const [reports, setReports] = useState(initial);
    const [modal, setModal] = useState<Report | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [isPending, startTransition] = useTransition();

    const openNew = () => {
        setModal({ id: "", title: "", category: "financial", year: new Date().getFullYear(), file_url: "", published: false, created_at: "" });
        setIsNew(true);
    };

    const openEdit = (r: Report) => { setModal({ ...r }); setIsNew(false); };

    const handleSave = () => {
        if (!modal) return;
        const fd = new FormData();
        fd.set("title", modal.title);
        fd.set("category", modal.category);
        fd.set("year", modal.year.toString());
        fd.set("published", modal.published.toString());
        fd.set("file_url", modal.file_url || "");

        startTransition(async () => {
            if (isNew) { await createReport(fd); } else { await updateReport(modal.id, fd); }
            setModal(null);
            // Refresh page
            window.location.reload();
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this report?")) return;
        startTransition(async () => { await deleteReport(id); window.location.reload(); });
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            <header className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Management</span>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Reports & Publications</h1>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-black hover:bg-primary/90 transition-colors">
                    <Plus size={16} /> Publish New Report
                </button>
            </header>

            {/* Table */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Year</th>
                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-white/30">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-white/30">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-white/30">No reports yet. Click &quot;Publish New Report&quot; to add one.</td></tr>
                        ) : reports.map(r => (
                            <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                    <FileText size={16} className="text-white/30" /> {r.title}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-widest font-bold ${CATEGORY_COLORS[r.category] || ""}`}>
                                        {r.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-white/50">{r.year}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-block rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-widest font-bold ${r.published ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40"}`}>
                                        {r.published ? "Published" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openEdit(r)} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                                    <button onClick={() => handleDelete(r.id)} className="p-2 text-red-400/50 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}>
                    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-xl font-bold text-white">{isNew ? "Add Report" : "Edit Report"}</h2>
                            <button onClick={() => setModal(null)} className="text-white/40 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Title</label>
                                <input type="text" value={modal.title} onChange={e => setModal({ ...modal, title: e.target.value })}
                                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Category</label>
                                    <select value={modal.category} onChange={e => setModal({ ...modal, category: e.target.value })}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Year</label>
                                    <input type="number" value={modal.year} onChange={e => setModal({ ...modal, year: parseInt(e.target.value) })}
                                        className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">PDF File URL</label>
                                <input type="text" value={modal.file_url || ""} onChange={e => setModal({ ...modal, file_url: e.target.value })} placeholder="https://..."
                                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={modal.published} onChange={e => setModal({ ...modal, published: e.target.checked })}
                                    className="h-4 w-4 rounded border-white/20 bg-black accent-primary" />
                                <span className="text-sm text-white/70">Published (visible to public)</span>
                            </label>
                        </div>
                        <button onClick={handleSave} disabled={isPending}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-black hover:bg-primary/90 disabled:opacity-50 transition-colors">
                            {isPending ? <Loader2 size={16} className="animate-spin" /> : null}
                            {isPending ? "Saving..." : isNew ? "Publish Report" : "Save Changes"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
