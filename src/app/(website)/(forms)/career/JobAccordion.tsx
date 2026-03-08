"use client";

import { useState } from "react";
import { Plus, Minus, MapPin, Clock, Calendar } from "lucide-react";
import type { Job } from "@/app/actions/jobs-actions";

export default function JobAccordion({ jobs }: { jobs: Job[] }) {
    const [openId, setOpenId] = useState<string | null>(null);

    const toggle = (id: string) => setOpenId(openId === id ? null : id);

    return (
        <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden">
            {jobs.map((job, i) => {
                const isOpen = openId === job.id;
                return (
                    <div key={job.id} className={i > 0 ? "border-t border-white/5" : ""}>
                        {/* Collapsed Row */}
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
                                Published: {new Date(job.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                            </span>
                            {job.deadline && (
                                <span className="hidden sm:block text-xs text-white/40 flex-shrink-0">
                                    Deadline: {new Date(job.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" })}
                                </span>
                            )}
                        </button>

                        {/* Expanded Content */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="px-6 py-8 bg-white/[0.01] border-t border-white/5">
                                {/* Meta badges */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {job.department && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs text-primary font-medium">
                                            {job.department}
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
                                        <Clock size={10} /> {job.employment_type}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
                                        <MapPin size={10} /> {job.location}
                                    </span>
                                    {job.deadline && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60">
                                            <Calendar size={10} /> Deadline: {new Date(job.deadline).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                {job.description && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Job Description</h4>
                                        <div className="text-sm text-white/70 leading-relaxed whitespace-pre-line">
                                            {job.description}
                                        </div>
                                    </div>
                                )}

                                {/* Requirements */}
                                {job.requirements && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Requirements</h4>
                                        <ul className="flex flex-col gap-2">
                                            {job.requirements.split("\n").filter(Boolean).map((req, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-white/70">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                                                    {req.trim()}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
