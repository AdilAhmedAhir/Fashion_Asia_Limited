"use client";

import { Fragment, useState, useTransition, useRef } from "react";
import { createReport, updateReport, deleteReport, uploadFile } from "@/app/actions/settings-actions";
import { Plus, Pencil, Trash2, X, FileText, Loader2, Upload, CheckCircle, TriangleAlert } from "lucide-react";

const CATEGORIES = ["financial", "audit", "compliance", "environmental", "csr"] as const;
const CATEGORY_COLORS: Record<string, string> = {
    financial: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    audit: "bg-green-500/20 text-green-400 border-green-500/30",
    compliance: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    environmental: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    csr: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

// Fallbacks for an unexpected throw (a dropped connection, or a failure the
// action didn't anticipate, whose message Next.js redacts in production).
// Every expected failure arrives as the action's own {ok:false, error} text
// instead and is shown as-is. Saves keep T-012's wording, shared with the six
// settings pages; delete and upload name their own action, because "saving
// these changes" misdescribes both.
const GENERIC_ERROR = "Something went wrong saving these changes. Check your connection and try again.";
const DELETE_ERROR = "Couldn't delete this report. Check your connection and try again.";
// A PDF over Next's default 1 MB Server Action body limit is rejected before
// uploadFile runs, so it lands here rather than as {ok:false}. That is the
// likeliest cause of a throw for a real report, so the copy names the limit.
// next.config.ts sets no serverActions.bodySizeLimit (SEC-INFO-35); if that
// changes, change this line with it.
const UPLOAD_ERROR = "Couldn't upload this PDF. Files must be under 1 MB. If this one is, check your connection and try again.";

interface Report {
    id: string; title: string; category: string; year: number;
    file_url: string | null; published: boolean; created_at: string;
}

export default function ReportsClient({ initial }: { initial: Report[] }) {
    const [reports, setReports] = useState(initial);
    const [modal, setModal] = useState<Report | null>(null);
    const [isNew, setIsNew] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [uploading, setUploading] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    // One failure slot per action, each rendered next to the control that
    // triggered it (T-015): the modal's Save button, its PDF upload, and the
    // table row whose delete failed.
    const [saveError, setSaveError] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

    const openNew = () => {
        setModal({ id: "", title: "", category: "financial", year: new Date().getFullYear(), file_url: "", published: false, created_at: "" });
        setIsNew(true);
        setUploadedFileName("");
        setSaveError(null);
        setUploadError(null);
    };

    const openEdit = (r: Report) => {
        setModal({ ...r });
        setIsNew(false);
        setUploadedFileName("");
        setSaveError(null);
        setUploadError(null);
    };

    // The modal can't be dismissed while a save or an upload is in flight. Its
    // outcome is shown inside the modal, and closing early would hide a
    // failure and throw away what the admin entered.
    const closeModal = () => {
        if (isPending || uploading) return;
        setModal(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !modal) return;

        setUploading(true);
        setUploadError(null);
        let failure: string | null = null;
        try {
            const fd = new FormData();
            fd.set("file", file);
            const result = await uploadFile(fd, "reports");
            if (result.ok) {
                const url = result.url;
                // Functional update, so anything typed into the modal while
                // the file uploaded is kept rather than reverted.
                setModal(m => (m ? { ...m, file_url: url } : m));
                setUploadedFileName(file.name);
            } else {
                failure = result.error;
            }
        } catch {
            failure = UPLOAD_ERROR;
        }
        setUploading(false);

        if (failure) {
            setUploadError(failure);
            // An <input type="file"> that still holds the same file fires no
            // change event, so clear it to let picking that file again retry.
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSave = () => {
        if (!modal) return;
        const fd = new FormData();
        fd.set("title", modal.title);
        fd.set("category", modal.category);
        fd.set("year", modal.year.toString());
        fd.set("published", modal.published.toString());
        fd.set("file_url", modal.file_url || "");

        startTransition(async () => {
            setSaveError(null);
            try {
                const result = isNew ? await createReport(fd) : await updateReport(modal.id, fd);
                if (!result.ok) {
                    // The modal stays open with everything the admin entered,
                    // and nothing reloads, so they can fix it and retry.
                    setSaveError(result.error);
                    return;
                }
                setModal(null);
                window.location.reload();
            } catch {
                setSaveError(GENERIC_ERROR);
            }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm("Delete this report?")) return;
        startTransition(async () => {
            setDeleteError(null);
            try {
                const result = await deleteReport(id);
                if (!result.ok) {
                    setDeleteError({ id, message: result.error });
                    return;
                }
                window.location.reload();
            } catch {
                setDeleteError({ id, message: DELETE_ERROR });
            }
        });
    };

    return (
        <div className="flex flex-col gap-8 max-w-5xl">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Management</span>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">Reports & Publications</h1>
                </div>
                <button onClick={openNew} className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                    <Plus size={16} /> Publish New Report
                </button>
            </header>

            {/* Table. It needs ~680px, more than the content area below
                ~1030px wide (768px tablet, split-screen), so it scrolls inside
                its own card rather than having Status and Actions (the delete
                button included) clipped away. Its scrollbar gets the same 8px
                as globals.css gives the page's (which only sets width, so a
                horizontal bar would otherwise be the default ~16px). The card
                is also a size container, so a delete error can be sized to its
                visible width (100cqw) instead of the table's. */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-x-auto [container-type:inline-size] [&::-webkit-scrollbar]:h-2">
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
                            <Fragment key={r.id}>
                                {/* No divider between a row and its own delete error,
                                    so the two read as one unit. */}
                                <tr className={`${deleteError?.id === r.id ? "" : "border-b border-white/5 "}hover:bg-white/[0.02] transition-colors`}>
                                    <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                        <FileText size={16} className="flex-none text-white/30" /> {r.title}
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
                                        {/* lucide marks its icons aria-hidden, so without a
                                            label these buttons are announced as just "button".
                                            Delete now uses the admin's usual red-400 at rest
                                            (as on leader cards and list editors): the old
                                            red-400/50 was 2.5:1, under the 3:1 minimum for a
                                            control. */}
                                        <button onClick={() => openEdit(r)} aria-label={`Edit ${r.title || "this report"}`} className="p-2 text-white/40 hover:text-white transition-colors"><Pencil size={14} /></button>
                                        <button onClick={() => handleDelete(r.id)} aria-label={`Delete ${r.title || "this report"}`} className="p-2 text-red-400 hover:text-red-300 transition-colors"><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                                {/* Directly under the row whose delete failed. Same
                                    markup as SettingsHeader's save-failure line (T-012);
                                    text-red-400 on this table's #0f0f0f is 6.93:1.
                                    When the table scrolls sideways (narrow screens),
                                    the message stays pinned to the card's visible left
                                    edge and wraps to its visible width, so it's readable
                                    from wherever the admin scrolled to reach Delete. */}
                                {deleteError?.id === r.id && (
                                    <tr className="border-b border-white/5">
                                        <td colSpan={5} className="px-6 pb-4">
                                            <p role="alert" className="sticky left-6 flex max-w-[calc(100cqw-3rem)] items-start gap-2 text-sm leading-relaxed text-red-400">
                                                <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                                {deleteError.message}
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal. With both error lines showing, it is ~610px tall. It
                still fits a 1280x720 laptop's viewport without scrolling; on a
                shorter window it used to be cut off top and bottom with no way
                to reach Save. The backdrop now scrolls, and my-auto (not the
                backdrop's centring alone) keeps the top reachable. When it
                fits, nothing moves. */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 backdrop-blur-sm" onClick={closeModal}>
                    <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#111] p-8" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="font-serif text-xl font-bold text-white">{isNew ? "Add Report" : "Edit Report"}</h2>
                            <button onClick={closeModal} disabled={isPending || uploading} aria-label="Close" className="text-white/40 enabled:hover:text-white disabled:opacity-40"><X size={18} /></button>
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

                            {/* PDF Upload Section */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40">PDF File</label>
                                <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileUpload} className="hidden" />

                                {modal.file_url ? (
                                    // text-accent, as on ImageUploadField's upload
                                    // controls: text-primary here was 2.4:1 on this
                                    // pill; accent is 8.5:1 (5.8:1 on hover). While a
                                    // replacement uploads, the button says so; the X
                                    // and Save above are disabled, and without this
                                    // nothing explained why. It stays focusable so a
                                    // keyboard user isn't dropped to <body> mid-upload.
                                    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                                        <CheckCircle size={16} className="text-accent flex-shrink-0" />
                                        <span className="text-sm text-white/70 truncate flex-grow">
                                            {uploadedFileName || "File attached"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="flex flex-shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:text-accent/80"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 size={12} className="motion-safe:animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : "Replace"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="flex items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-4 py-6 text-sm text-white/50 hover:border-primary/40 hover:text-white/70 hover:bg-white/[0.04] transition-all disabled:opacity-50"
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader2 size={18} className="motion-safe:animate-spin text-primary" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} />
                                                <span>Click to upload PDF file</span>
                                            </>
                                        )}
                                    </button>
                                )}
                                {/* The real reason from uploadFile, not Next's redacted
                                    production text. A failed replace keeps the file that
                                    was already attached. text-red-400 on the modal's #111
                                    is 6.83:1. */}
                                {uploadError && (
                                    <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                                        <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                        {uploadError}
                                    </p>
                                )}
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={modal.published} onChange={e => setModal({ ...modal, published: e.target.checked })}
                                    className="h-4 w-4 rounded border-white/20 bg-black accent-primary" />
                                <span className="text-sm text-white/70">Published (visible to public)</span>
                            </label>
                        </div>
                        {/* The failure sits directly above the button that caused
                            it, where the admin is already looking; 6.83:1 on #111. */}
                        <div className="mt-8 flex flex-col gap-3">
                            {saveError && (
                                <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                                    <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                    {saveError}
                                </p>
                            )}
                            <button onClick={handleSave} disabled={isPending || uploading}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 transition-colors">
                                {isPending ? <Loader2 size={16} className="motion-safe:animate-spin" /> : null}
                                {isPending ? "Saving..." : isNew ? "Publish Report" : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
