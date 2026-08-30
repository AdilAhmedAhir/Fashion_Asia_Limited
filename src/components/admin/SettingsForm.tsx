"use client";

import { useState } from "react";
import { X, Plus, Save, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

// ============================================
// Generic form components for settings pages
// ============================================

export function SettingsHeader({ title, tag, onSave, saving }: {
    title: string; tag: string; onSave: () => void; saving: boolean;
}) {
    return (
        <header className="flex items-start justify-between mb-10">
            <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{tag}</span>
                <h1 className="mt-2 font-serif text-3xl font-bold text-white md:text-4xl">{title}</h1>
            </div>
            <button onClick={onSave} disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-black transition-all hover:bg-primary/90 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving..." : "Save Changes"}
            </button>
        </header>
    );
}

export function SettingsCard({ title, children, className = "" }: {
    title: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-8 ${className}`}>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-primary">{title}</h2>
            {children}
        </div>
    );
}

export function TextInput({ label, value, onChange, placeholder = "" }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-colors" />
        </div>
    );
}

export function TextArea({ label, value, onChange, rows = 4 }: {
    label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
                className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-colors resize-none" />
        </div>
    );
}

export function ChipList({ label, items, onChange }: {
    label: string; items: string[]; onChange: (items: string[]) => void;
}) {
    const [input, setInput] = useState("");

    const add = () => {
        if (input.trim() && !items.includes(input.trim())) {
            onChange([...items, input.trim()]);
            setInput("");
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
                        {item}
                        <button onClick={() => onChange(items.filter(i => i !== item))} className="hover:text-red-400 transition-colors">
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder="Type and press Enter..."
                    className="flex-grow rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                <button onClick={add} className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                    <Plus size={14} /> Add
                </button>
            </div>
        </div>
    );
}

export function StatsList({ label, items, onChange }: {
    label: string; items: { value: string; label: string }[]; onChange: (items: { value: string; label: string }[]) => void;
}) {
    const update = (index: number, field: "value" | "label", val: string) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: val };
        onChange(next);
    };

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center">
                        <input type="text" value={item.value} onChange={e => update(i, "value", e.target.value)} placeholder="Value"
                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm font-bold text-primary focus:border-primary/50 focus:outline-none" />
                        <input type="text" value={item.label} onChange={e => update(i, "label", e.target.value)} placeholder="Label"
                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-2"><X size={14} /></button>
                    </div>
                ))}
            </div>
            <button onClick={() => onChange([...items, { value: "", label: "" }])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                <Plus size={14} /> Add Row
            </button>
        </div>
    );
}

// Editor for a list of objects with a fixed set of text fields — covers the
// stat, pillar, facility and milestone shapes used across the site content.
export type ObjectField = { key: string; label: string; type?: "text" | "textarea" | "image" };

export function ObjectListEditor<T extends Record<string, string>>({
    label, items, fields, onChange, addLabel = "Add Item"
}: {
    label: string;
    items: T[];
    fields: ObjectField[];
    onChange: (items: T[]) => void;
    addLabel?: string;
}) {
    const update = (index: number, key: string, val: string) => {
        const next = [...items];
        next[index] = { ...next[index], [key]: val };
        onChange(next);
    };

    const move = (index: number, delta: number) => {
        const target = index + delta;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const blank = () => Object.fromEntries(fields.map(f => [f.key, ""])) as T;

    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <div className="flex flex-col gap-4">
                {items.map((item, i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                #{i + 1}
                            </span>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                                    aria-label="Move up"
                                    className="p-1.5 text-white/40 hover:text-primary disabled:opacity-20 disabled:hover:text-white/40 transition-colors">
                                    <ChevronUp size={14} />
                                </button>
                                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1}
                                    aria-label="Move down"
                                    className="p-1.5 text-white/40 hover:text-primary disabled:opacity-20 disabled:hover:text-white/40 transition-colors">
                                    <ChevronDown size={14} />
                                </button>
                                <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
                                    aria-label="Remove"
                                    className="p-1.5 text-red-400 hover:text-red-300 transition-colors">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            {fields.map(f => f.type === "image" ? (
                                <ImageUploadField
                                    key={f.key}
                                    label={f.label}
                                    value={item[f.key] ?? ""}
                                    onChange={v => update(i, f.key, v)}
                                />
                            ) : (
                                <div key={f.key} className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30">{f.label}</label>
                                    {f.type === "textarea" ? (
                                        <textarea rows={3} value={item[f.key] ?? ""}
                                            onChange={e => update(i, f.key, e.target.value)}
                                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none resize-none" />
                                    ) : (
                                        <input type="text" value={item[f.key] ?? ""}
                                            onChange={e => update(i, f.key, e.target.value)}
                                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => onChange([...items, blank()])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                <Plus size={14} /> {addLabel}
            </button>
        </div>
    );
}

export function ListEditor({ label, items, onChange }: {
    label: string; items: string[]; onChange: (items: string[]) => void;
}) {
    return (
        <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <textarea value={item} rows={2}
                            onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
                            className="flex-grow rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none resize-none" />
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 p-2 mt-1"><X size={14} /></button>
                    </div>
                ))}
            </div>
            <button onClick={() => onChange([...items, ""])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/10 transition-colors">
                <Plus size={14} /> Add Item
            </button>
        </div>
    );
}
