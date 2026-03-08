"use client";

import { useState } from "react";
import { Plus, Minus, MapPin, Clock, Calendar, Send } from "lucide-react";
import type { Job } from "@/app/actions/jobs-actions";

/* Only render a section if the text is non-empty */
function Section({ title, text, list = false }: { title: string; text: string | null; list?: boolean }) {
    if (!text?.trim()) return null;
    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">{title}</h4>
            {list ? (
                <ul className="flex flex-col gap-2">
                    {text.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {line.trim()}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-white/70 leading-relaxed whitespace-pre-line">{text}</p>
            )}
        </div>
    );
}

function Badge({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
            <Icon size={10} /> {text}
        </span>
    );
}

export default function JobAccordion({ jobs, onApply }: { jobs: Job[]; onApply: (title: string) => void }) {
    const [openId, setOpenId] = useState<string | null>(null);
    const toggle = (id: string) => setOpenId(openId === id ? null : id);

    const fmtDate = (d: string) =>
        new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });

    return (
        <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden">
            {jobs.map((job, i) => {
                const isOpen = openId === job.id;
                return (
                    <div key={job.id} className={i > 0 ? "border-t border-white/5" : ""}>
                        {/* Collapsed row */}
                        <button
                            onClick={() => toggle(job.id)}
                            className={`w-full flex items-center gap-4 px-6 py-5 text-left transition-colors ${isOpen ? "bg-primary/10" : "bg-white/[0.02] hover:bg-white/[0.04]"
                                }`}
                        >
                            <span className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full border transition-colors ${isOpen ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-white/30"
                                }`}>
                                {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                            </span>
                            <span className={`flex-grow font-medium text-sm md:text-base transition-colors ${isOpen ? "text-primary" : "text-white"
                                }`}>
                                {job.title}
                            </span>
                            <span className="hidden sm:block text-xs text-white/40 flex-shrink-0">
                                Published: {fmtDate(job.published_at)}
                            </span>
                            {job.deadline && (
                                <span className="hidden sm:block text-xs text-white/40 flex-shrink-0">
                                    Deadline: {fmtDate(job.deadline)}
                                </span>
                            )}
                        </button>

                        {/* Expanded content */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[4000px] opacity-100" : "max-h-0 opacity-0"
                            }`}>
                            <div className="px-6 py-8 bg-white/[0.01] border-t border-white/5">
                                {/* Header */}
                                <h3 className="text-lg font-bold text-white mb-1">{job.title}</h3>
                                <p className="text-sm text-white/50 mb-1">Fashion Asia Limited</p>
                                {job.vacancy > 1 && <p className="text-sm text-white/50 mb-4">Vacancy: {String(job.vacancy).padStart(2, "0")}</p>}

                                {/* Meta badges */}
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {job.department && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary font-medium">
                                            {job.department}
                                        </span>
                                    )}
                                    <Badge icon={Clock} text={job.employment_type} />
                                    <Badge icon={MapPin} text={job.location} />
                                    {job.deadline && <Badge icon={Calendar} text={`Deadline: ${fmtDate(job.deadline)}`} />}
                                </div>

                                {/* Dynamic sections — only render if content exists */}
                                <Section title="Job Responsibilities" text={job.responsibilities} list />
                                <Section title="Employment Status" text={job.employment_type} />
                                <Section title="Educational Requirements" text={job.educational_requirements} list />
                                <Section title="Experience Requirements" text={job.experience_requirements} list />
                                <Section title="Additional Requirements" text={job.additional_requirements} list />
                                {job.workplace && <Section title="Workplace" text={job.workplace} />}
                                {job.location && <Section title="Job Location" text={job.location} />}
                                {job.salary && <Section title="Salary" text={job.salary} />}
                                <Section title="Compensation & Other Benefits" text={job.compensation} list />

                                {/* Apply button */}
                                <button
                                    onClick={() => onApply(job.title)}
                                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-white hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20"
                                >
                                    <Send size={14} /> Apply for this Position
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
