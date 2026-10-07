"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { X, Plus, Save, Loader2, ChevronUp, ChevronDown, TriangleAlert } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

// ============================================
// Generic form components for settings pages
// ============================================

// `error` is this settings page's single save-failure slot (T-012): every
// updateSettings() caller sets it from that action's own {ok:false, error}
// result (or a generic message on an unexpected throw) and clears it back
// to null at the start of its next save attempt, so a stale failure never
// survives a retry and a successful save is never mistaken for a failed one.
// One shared slot here, not a second copy inside ObjectListEditor: a save
// failure (auth, collision, delete-guard) is a whole-page outcome, and
// duplicating the identical text into every nested list editor on a page
// that has several (e.g. HomepageSettingsClient's three) would repeat an
// unrelated message next to lists that had nothing to do with it.
//
// `saveLabel` (T-026) lets a page name what its button saves, for a page that
// saves only part of what it shows: /admin/products' "Save categories" doesn't
// save its products, which save on their own. Every other page keeps the
// default.
export function SettingsHeader({ title, tag, onSave, saving, error, saveLabel = "Save Changes" }: {
    title: string; tag: string; onSave: () => void; saving: boolean; error?: string | null; saveLabel?: string;
}) {
    return (
        <header className="mb-10 flex flex-col gap-3">
            <div className="flex items-start justify-between">
                <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{tag}</span>
                    <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
                </div>
                <button onClick={onSave} disabled={saving}
                    className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? "Saving..." : saveLabel}
                </button>
            </div>
            {/* Same visual language as ImageUploadField's hard-block error —
                role="alert", TriangleAlert icon, plain red text, not colour
                alone — so this is a known pattern, not a new one. Measured
                against what actually paints behind this header — the admin
                shell's own bg-[#0a0a0a] ("surface" in tailwind.config.ts, set
                by admin/(dashboard)/layout.tsx's outer div; SettingsHeader
                carries no bg- of its own, so that colour shows straight
                through) — text-red-400 clears ~7.16:1, comfortably past the
                4.5:1 AA floor (T-011's own bar). Not "background" (#1a1f1a):
                that token belongs to the public (website) route group and is
                never painted behind /admin content, so it isn't the right
                swatch to check this placement against. */}
            {error && (
                <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                    <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                    {error}
                </p>
            )}
        </header>
    );
}

/**
 * @purpose A settings page's header when its saved content couldn't be loaded: the page title and a role="alert" message, with no Save button.
 *
 * T-026's fail-closed load. An editor filled from fallback defaults after a
 * failed read would save those defaults over the real content, so a page
 * whose read failed shows this instead of its editor. The tag is
 * `text-accent`, not SettingsHeader's `text-primary`: primary as text on the
 * dark admin fails AA (docs/DESIGN.md §2), and new code doesn't copy that.
 */
export function SettingsLoadError({ title, tag, message }: { title: string; tag: string; message: string }) {
    return (
        <header className="mb-10 flex flex-col gap-3">
            <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{tag}</span>
                <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
            </div>
            <p role="alert" className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-red-400">
                <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                {message}
            </p>
        </header>
    );
}

export function SettingsCard({ title, children, className = "" }: {
    title: string; children: React.ReactNode; className?: string;
}) {
    return (
        <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-8 ${className}`}>
            <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-accent">{title}</h2>
            {children}
        </div>
    );
}

export function TextInput({ label, value, onChange, placeholder = "" }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
    const id = useId();
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <input id={id} type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-colors" />
        </div>
    );
}

export function TextArea({ label, value, onChange, rows = 4 }: {
    label: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
    const id = useId();
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <textarea id={id} value={value} onChange={e => onChange(e.target.value)} rows={rows}
                className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-colors resize-none" />
        </div>
    );
}

export function ChipList({ label, items, onChange }: {
    label: string; items: string[]; onChange: (items: string[]) => void;
}) {
    const [input, setInput] = useState("");
    // Names (T-011): the heading labels the type box and names the group.
    const id = useId();

    const add = () => {
        if (input.trim() && !items.includes(input.trim())) {
            onChange([...items, input.trim()]);
            setInput("");
        }
    };

    return (
        <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-3">
            <label id={`${id}-label`} htmlFor={`${id}-input`} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</label>
            <div className="flex flex-wrap gap-2">
                {items.map(item => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-accent">
                        {item}
                        <button onClick={() => onChange(items.filter(i => i !== item))} aria-label={`Remove ${item}`}
                            className="hover:text-red-400 transition-colors">
                            <X size={12} />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input id={`${id}-input`} type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
                    placeholder="Type and press Enter..."
                    className="flex-grow rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                <button onClick={add} className="flex items-center gap-1.5 rounded-lg border border-primary/30 px-4 py-2.5 text-xs font-bold text-accent hover:bg-primary/10 transition-colors">
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
    // Names (T-011): the heading names the group; each box and Remove names its row.
    const id = useId();

    return (
        <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-3">
            <span id={`${id}-label`} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
            <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-3 items-center">
                        <input type="text" value={item.value} onChange={e => update(i, "value", e.target.value)} placeholder="Value"
                            aria-label={`Value, row ${i + 1} (${label})`}
                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm font-bold text-accent focus:border-primary/50 focus:outline-none" />
                        <input type="text" value={item.label} onChange={e => update(i, "label", e.target.value)} placeholder="Label"
                            aria-label={`Label, row ${i + 1} (${label})`}
                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove row ${i + 1} (${label})`}
                            className="text-red-400 hover:text-red-300 p-2"><X size={14} /></button>
                    </div>
                ))}
            </div>
            <button onClick={() => onChange([...items, { value: "", label: "" }])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-accent hover:bg-primary/10 transition-colors">
                <Plus size={14} /> Add Row
            </button>
        </div>
    );
}

// Editor for a list of objects with a fixed set of text fields — covers the
// stat, pillar, facility and milestone shapes used across the site content.
export type ObjectField = { key: string; label: string; type?: "text" | "textarea" | "image" };

export function ObjectListEditor<T extends Record<string, string>>({
    label, items, fields, onChange, addLabel = "Add Item", onUploadingChange
}: {
    label: string;
    items: T[];
    fields: ObjectField[];
    onChange: (items: T[]) => void;
    addLabel?: string;
    // Opt-in (T-010): whether an image is still uploading on a row of the
    // current list, so the page can hold its Save until the image lands.
    onUploadingChange?: (uploading: boolean) => void;
}) {
    // Row keys (T-010): a per-instance WeakMap from item object to key,
    // assigned lazily on first sight, which is idempotent under StrictMode.
    // The key moves to the object that replaces an item, a new row gets a
    // new key, and a non-object entry gets a positional one. No item field
    // is read or written for keying, so every page saves what it did before.
    const [keyStore] = useState(() => ({ byItem: new WeakMap<object, string>(), next: 0 }));
    const keysOf = (list: readonly T[]): string[] => {
        const seen = new Set<string>();
        return list.map((item: unknown, index) => {
            let key = `p${index}`;
            if (typeof item === "object" && item !== null) {
                key = keyStore.byItem.get(item) ?? "";
                if (!key) {
                    key = `k${++keyStore.next}`;
                    keyStore.byItem.set(item, key);
                }
            }
            // The same object listed twice can't share a key.
            if (seen.has(key)) key = `d${index}`;
            seen.add(key);
            return key;
        });
    };

    // The latest list and callbacks (T-010): set after each commit and moved
    // forward by every change emitted here, so an edit, a move, a remove or
    // a finished upload names its row by key and builds on the newest list,
    // never on the list its row rendered with.
    const latest = useRef({ items, onChange, onUploadingChange });
    const rowEls = useRef(new Map<string, HTMLDivElement>());
    const addButton = useRef<HTMLButtonElement>(null);
    const pendingFocus = useRef<{ key: string | null; control: "up" | "down" | "remove" } | null>(null);
    const busyFields = useRef(new Map<string, Set<string>>());
    const reportedUploading = useRef(false);

    // `uploading` is true only while a row of the current list has an image
    // field that last reported busy; a row that leaves the list stops
    // counting at once. Changes only.
    const reportUploading = () => {
        const report = latest.current.onUploadingChange;
        if (!report) return;
        const current = new Set(keysOf(latest.current.items));
        let uploading = false;
        busyFields.current.forEach((busy, key) => {
            if (busy.size && current.has(key)) uploading = true;
        });
        if (uploading === reportedUploading.current) return;
        reportedUploading.current = uploading;
        report(uploading);
    };

    // Focus (T-010, C5) is restored explicitly once the list has committed:
    // React moves the node of a row that moves down, and Chrome drops focus
    // from a moved node. It's never left on <body>.
    useLayoutEffect(() => {
        latest.current = { items, onChange, onUploadingChange };
        reportUploading();
        const focus = pendingFocus.current;
        if (!focus) return;
        pendingFocus.current = null;
        const row = focus.key === null ? undefined : rowEls.current.get(focus.key);
        const [up, down, remove] = row ? Array.from(row.querySelectorAll<HTMLButtonElement>(":scope > div:first-child button")) : [];
        const usable = (button?: HTMLButtonElement) => (button && !button.disabled ? button : undefined);
        const target =
            focus.control === "remove" ? remove
            : focus.control === "up" ? usable(up) ?? usable(down)
            : usable(down) ?? usable(up);
        (target ?? addButton.current)?.focus();
    });

    useEffect(() => () => {
        if (!reportedUploading.current) return;
        reportedUploading.current = false;
        latest.current.onUploadingChange?.(false);
    }, []);

    const emit = (next: T[]) => {
        latest.current.items = next;
        latest.current.onChange(next);
        reportUploading();
    };

    const update = (key: string, field: string, val: string) => {
        const list = latest.current.items;
        const index = keysOf(list).indexOf(key);
        // The row has gone (removed, or replaced after a save): a late
        // upload is dropped, never written to another row.
        if (index === -1) return;
        const next = [...list];
        next[index] = { ...list[index], [field]: val };
        keyStore.byItem.set(next[index], key);
        emit(next);
    };

    const move = (key: string, delta: number) => {
        const list = latest.current.items;
        const index = keysOf(list).indexOf(key);
        const target = index + delta;
        if (index === -1 || target < 0 || target >= list.length) return;
        const next = [...list];
        [next[index], next[target]] = [next[target], next[index]];
        // The pressed button keeps focus, or the row's other move button.
        pendingFocus.current = { key, control: delta < 0 ? "up" : "down" };
        emit(next);
    };

    const remove = (key: string) => {
        const list = latest.current.items;
        const keys = keysOf(list);
        const index = keys.indexOf(key);
        if (index === -1) return;
        // Focus goes to the next row's Remove, else the previous row's, else Add.
        pendingFocus.current = { key: keys[index + 1] ?? keys[index - 1] ?? null, control: "remove" };
        emit(list.filter((_, j) => j !== index));
    };

    const setFieldBusy = (key: string, field: string, busy: boolean) => {
        let busyHere = busyFields.current.get(key);
        if (busy) {
            if (!busyHere) busyFields.current.set(key, (busyHere = new Set()));
            busyHere.add(field);
        } else if (busyHere) {
            busyHere.delete(field);
            if (!busyHere.size) busyFields.current.delete(key);
        }
        reportUploading();
    };

    const bindRow = (key: string) => (el: HTMLDivElement | null) => {
        if (el) rowEls.current.set(key, el);
        else rowEls.current.delete(key);
    };

    const blank = () => Object.fromEntries(fields.map(f => [f.key, ""])) as T;
    const rowKeys = keysOf(items);

    // Names (T-011). A field's id is this editor's id, the row's key and the
    // field's key, never an item field. A row's Move and Remove names carry
    // its number, its title when it isn't blank, and the list's label, so
    // each is unique on the page. The title (the "title" field, else the
    // first text field) is read for those names only.
    const editorId = useId();
    const titleField = fields.find(f => f.key === "title") ?? fields.find(f => !f.type || f.type === "text");
    const rowName = (index: number, action: string) => {
        const title = titleField ? String(items[index][titleField.key] ?? "").trim() : "";
        return `${action}${title ? `: ${title}` : ""} (${label})`;
    };

    return (
        <div role="group" aria-labelledby={`${editorId}-label`} className="flex flex-col gap-3">
            <span id={`${editorId}-label`} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
            <div className="flex flex-col gap-4">
                {items.map((item, i) => (
                    <div key={rowKeys[i]} ref={bindRow(rowKeys[i])} className="rounded-xl border border-white/10 bg-black/40 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                                #{i + 1}
                            </span>
                            <div className="flex items-center gap-1">
                                <button type="button" onClick={() => move(rowKeys[i], -1)} disabled={i === 0}
                                    aria-label={rowName(i, `Move row ${i + 1} up`)}
                                    className="p-1.5 text-white/40 hover:text-accent disabled:opacity-20 disabled:hover:text-white/40 transition-colors">
                                    <ChevronUp size={14} />
                                </button>
                                <button type="button" onClick={() => move(rowKeys[i], 1)} disabled={i === items.length - 1}
                                    aria-label={rowName(i, `Move row ${i + 1} down`)}
                                    className="p-1.5 text-white/40 hover:text-accent disabled:opacity-20 disabled:hover:text-white/40 transition-colors">
                                    <ChevronDown size={14} />
                                </button>
                                <button type="button" onClick={() => remove(rowKeys[i])}
                                    aria-label={rowName(i, `Remove row ${i + 1}`)}
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
                                    onChange={v => update(rowKeys[i], f.key, v)}
                                    onBusyChange={onUploadingChange ? busy => setFieldBusy(rowKeys[i], f.key, busy) : undefined}
                                />
                            ) : (
                                <div key={f.key} className="flex flex-col gap-1.5">
                                    <label htmlFor={`${editorId}-${rowKeys[i]}-${f.key}`} className="text-[10px] font-bold uppercase tracking-widest text-white/30">{f.label}</label>
                                    {f.type === "textarea" ? (
                                        <textarea id={`${editorId}-${rowKeys[i]}-${f.key}`} rows={3} value={item[f.key] ?? ""}
                                            onChange={e => update(rowKeys[i], f.key, e.target.value)}
                                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none resize-none" />
                                    ) : (
                                        <input id={`${editorId}-${rowKeys[i]}-${f.key}`} type="text" value={item[f.key] ?? ""}
                                            onChange={e => update(rowKeys[i], f.key, e.target.value)}
                                            className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <button ref={addButton} type="button" onClick={() => emit([...latest.current.items, blank()])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-accent hover:bg-primary/10 transition-colors">
                <Plus size={14} /> {addLabel}
            </button>
        </div>
    );
}

export function ListEditor({ label, items, onChange }: {
    label: string; items: string[]; onChange: (items: string[]) => void;
}) {
    // Names (T-011): the heading names the group; each box and Remove names its row.
    const id = useId();
    return (
        <div role="group" aria-labelledby={`${id}-label`} className="flex flex-col gap-3">
            <span id={`${id}-label`} className="text-xs font-bold uppercase tracking-widest text-white/40">{label}</span>
            <div className="flex flex-col gap-3">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                        <textarea value={item} rows={2} aria-label={`Row ${i + 1} (${label})`}
                            onChange={e => { const next = [...items]; next[i] = e.target.value; onChange(next); }}
                            className="flex-grow rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none resize-none" />
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove row ${i + 1} (${label})`}
                            className="text-red-400 hover:text-red-300 p-2 mt-1"><X size={14} /></button>
                    </div>
                ))}
            </div>
            <button onClick={() => onChange([...items, ""])}
                className="flex items-center gap-1.5 self-start rounded-lg border border-primary/30 px-4 py-2 text-xs font-bold text-accent hover:bg-primary/10 transition-colors">
                <Plus size={14} /> Add Item
            </button>
        </div>
    );
}
