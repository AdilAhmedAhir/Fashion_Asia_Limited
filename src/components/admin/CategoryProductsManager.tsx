"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Info, Loader2, Plus, Trash2, TriangleAlert, Zap } from "lucide-react";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import {
    createCategoryProduct,
    deleteCategoryProduct,
    reorderCategoryProducts,
    updateCategoryProduct,
} from "@/app/actions/products-actions";
import type { CategoryProduct, CategoryProductInput, Product } from "@/lib/site-content";

const GENERIC_ERROR = "Something went wrong. Check your connection and try again.";

/**
 * The product editor nested inside `/admin/business`, one level below the
 * category cards ("Product Catalog" above). Deliberately a *separate* save
 * model from the rest of the page (docs/ROADMAP.md T-004, design point 1):
 * every add/edit/delete/reorder here is its own immediate Server Action
 * against `public.products`, not batched behind the page's own Save Changes
 * button — so this component owns its own state entirely and never folds
 * product data into `BusinessClient`'s `data` (the object that DOES get sent
 * to `updateSettings`). A product operation must never touch `site_settings`
 * — keeping the two states structurally separate is what guarantees that,
 * not a runtime check.
 */
export function CategoryProductsManager({
    categories,
    initialProductsByCategory,
}: {
    categories: Product[];
    initialProductsByCategory: Record<string, CategoryProduct[]>;
}) {
    const [productsByCategory, setProductsByCategory] = useState(initialProductsByCategory);
    const [selectedSlug, setSelectedSlug] = useState<string>(() => categories.find(c => c.slug)?.slug ?? "");
    const [reorderBusy, setReorderBusy] = useState(false);
    const [reorderError, setReorderError] = useState<string | null>(null);

    // Focus-management bookkeeping only — never read for rendering, so it
    // doesn't need to be state. Populated by each ProductRow's own up/down/
    // delete buttons (via registerControlRef, handed down below) so a row's
    // control can be re-focused after a *sibling* row's action removes or
    // (briefly, mid-reorder) disables the control the keyboard user's focus
    // was actually on — otherwise a removed/disabled focused element sends
    // focus to <body>, silently restarting Tab order from the top of the page.
    const controlRefs = useRef(new Map<string, { up?: HTMLButtonElement | null; down?: HTMLButtonElement | null; delete?: HTMLButtonElement | null }>());
    const selectRef = useRef<HTMLSelectElement>(null);
    const [pendingFocus, setPendingFocus] = useState<{ productId: string; direction: "up" | "down" } | null>(null);

    const registerControlRef = (productId: string, kind: "up" | "down" | "delete", el: HTMLButtonElement | null) => {
        const entry = controlRefs.current.get(productId) ?? {};
        entry[kind] = el;
        controlRefs.current.set(productId, entry);
    };

    // Best-effort: try the control the user actually just used first, then
    // its siblings on the same row, before giving up — never leaves focus
    // stranded on a control that happens to be disabled at that instant
    // (e.g. a row that reordered to the top, whose own "up" button just
    // disabled itself as a direct result of the click that moved it there).
    const focusRowControl = (productId: string, preferred: "up" | "down" | "delete") => {
        const entry = controlRefs.current.get(productId);
        if (!entry) return false;
        const fallbackOrder = (["up", "down", "delete"] as const).filter(k => k !== preferred);
        for (const kind of [preferred, ...fallbackOrder]) {
            const el = entry[kind];
            if (el && !el.disabled) {
                el.focus();
                return true;
            }
        }
        return false;
    };

    // categories (and therefore `selected`) is a live prop, not copied into
    // state — it's BusinessClient's own in-progress `data.products`, so a
    // rename/add/bootstrap-save up there is reflected here on the very next
    // render with no separate sync step.
    const selected = categories.find(c => c.slug === selectedSlug) ?? null;
    // A category only ever gets a real `id` by surviving a save under
    // docs/TECH_STACK.md decision (d) — "" is the not-yet-assigned sentinel
    // (see the Product type's own comment in site-content.ts). Checking `id`
    // here, proactively, means staff see the "not saved yet" message the
    // moment they select such a category, not only after a failed add.
    const bootstrapped = Boolean(selected?.id);
    const products = selectedSlug ? productsByCategory[selectedSlug] ?? [] : [];

    // Waits for a reorder to actually settle (reorderBusy back to false)
    // before trying to refocus — every row's up/down buttons are disabled
    // for the whole in-flight window (they share this one flag), and a
    // browser silently refuses .focus() on a disabled element, so acting
    // immediately on click would always lose the race.
    useEffect(() => {
        if (!pendingFocus || reorderBusy) return;
        focusRowControl(pendingFocus.productId, pendingFocus.direction);
        setPendingFocus(null);
        // focusRowControl only reads refs (stable across renders), never
        // component state, so it's intentionally left out of the deps below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingFocus, reorderBusy]);

    const handleCreated = (product: CategoryProduct) => {
        setProductsByCategory(prev => ({
            ...prev,
            [product.category_slug]: [...(prev[product.category_slug] ?? []), product],
        }));
    };

    const handleSaved = (product: CategoryProduct) => {
        setProductsByCategory(prev => ({
            ...prev,
            [product.category_slug]: (prev[product.category_slug] ?? []).map(p => (p.id === product.id ? product : p)),
        }));
    };

    const handleDeleted = (categorySlug: string, id: string) => {
        const list = productsByCategory[categorySlug] ?? [];
        const index = list.findIndex(p => p.id === id);
        // The row after the deleted one slides into its position, so
        // focusing that row's own Delete button keeps a keyboard user
        // deleting downward without focus ever landing back at the top of
        // the page. If the deleted row was last, its new-last neighbour
        // (the row before it) is the next best thing. If it was the only
        // row, there's no row left — fall back to the category picker.
        const neighborId = index === -1 ? null : list[index + 1]?.id ?? list[index - 1]?.id ?? null;

        setProductsByCategory(prev => ({
            ...prev,
            [categorySlug]: (prev[categorySlug] ?? []).filter(p => p.id !== id),
        }));

        if (neighborId) {
            focusRowControl(neighborId, "delete");
        } else {
            selectRef.current?.focus();
        }
    };

    const moveProduct = async (index: number, delta: number) => {
        if (!selectedSlug) return;
        const list = productsByCategory[selectedSlug] ?? [];
        const target = index + delta;
        if (target < 0 || target >= list.length) return;

        const movedProductId = list[index].id;
        const direction: "up" | "down" = delta < 0 ? "up" : "down";

        const swapped = [...list];
        [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
        // Keep each row's own sort_order field in sync with its new position
        // immediately — not just the array order — so a subsequent edit on
        // any of these rows (ProductRow always sends its product's current
        // sort_order back unchanged) doesn't silently undo this reorder.
        const renumbered = swapped.map((p, i) => ({ ...p, sort_order: i }));

        const previous = list;
        setProductsByCategory(prev => ({ ...prev, [selectedSlug]: renumbered }));
        setReorderBusy(true);
        setReorderError(null);
        // Claim the moved row's own control for refocus once this settles —
        // the effect above waits for reorderBusy to clear before acting, so
        // it never races the disabled attribute this same click just set.
        setPendingFocus({ productId: movedProductId, direction });
        try {
            const result = await reorderCategoryProducts(selectedSlug, renumbered.map(p => p.id));
            if (!result.ok) {
                setReorderError(result.error);
                setProductsByCategory(prev => ({ ...prev, [selectedSlug]: previous }));
            }
        } catch {
            setReorderError(GENERIC_ERROR);
            setProductsByCategory(prev => ({ ...prev, [selectedSlug]: previous }));
        } finally {
            setReorderBusy(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-white/80">
                <Zap size={16} className="mt-0.5 flex-none text-accent" aria-hidden="true" />
                <span>
                    <strong className="font-bold text-accent">Products save automatically.</strong> The moment you
                    add, edit, reorder, or delete one below, it&apos;s live on the public site — there&apos;s no Save
                    button down here. That&apos;s different from the category cards above, which only take effect
                    once you click <strong className="font-bold text-white">Save Changes</strong>.
                </span>
            </div>

            <div className="flex max-w-sm flex-col gap-2">
                <label htmlFor="category-products-select" className="text-xs font-bold uppercase tracking-widest text-white/50">
                    Category
                </label>
                <select
                    ref={selectRef}
                    id="category-products-select"
                    value={selectedSlug}
                    onChange={e => setSelectedSlug(e.target.value)}
                    className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white focus:border-primary/50 focus:outline-none"
                >
                    {categories.length === 0 && <option value="">No categories yet</option>}
                    {categories.length > 0 && !selectedSlug && <option value="">Select a category…</option>}
                    {categories.map((c, i) => (
                        // Disabled options are never user-selectable, so a
                        // shared "" value across multiple not-yet-saved
                        // categories (see the comment on `bootstrapped`
                        // above) can never actually be chosen — only used
                        // here to avoid leaking a literal "undefined" into
                        // the DOM when `c.slug` doesn't exist yet.
                        <option key={c.slug || `__unsaved-${i}`} value={c.slug ?? ""} disabled={!c.slug}>
                            {c.title || "(untitled category)"}
                            {!c.slug ? " — not saved yet" : ""}
                        </option>
                    ))}
                </select>
            </div>

            {categories.length === 0 ? (
                <p className="text-sm text-white/50">Add a category above first, then come back here to add its products.</p>
            ) : !selected ? (
                <p className="text-sm text-white/50">Pick a category above to manage its products.</p>
            ) : !bootstrapped ? (
                // Amber + role="status" + Info, not role="alert" + TriangleAlert:
                // matches this codebase's *other* established amber pattern
                // (ImageUploadField's non-blocking size/shape warning) rather
                // than mixing it with the red hard-error pattern's icon/role.
                // Nothing failed here — this is a proactive heads-up shown
                // before the editor has attempted anything, so "status/info"
                // is the closer fit; TriangleAlert+role="alert" stays reserved
                // for genuine save failures (see the red errors below).
                <div role="status" aria-live="polite" className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-300">
                    <Info size={16} className="mt-0.5 flex-none" aria-hidden="true" />
                    <span>
                        <strong className="font-bold">&quot;{selected.title}&quot; hasn&apos;t been saved yet.</strong>{" "}
                        Products can only be added to a category once it&apos;s been saved at least once. Click{" "}
                        <strong>Save Changes</strong> above (no other changes needed), then come back here.
                    </span>
                </div>
            ) : (
                <>
                    <AddProductForm categorySlug={selected.slug} onCreated={handleCreated} />

                    {reorderError && (
                        <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                            <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                            {reorderError}
                        </p>
                    )}

                    {products.length === 0 ? (
                        <p className="text-sm text-white/50">No products in this category yet. Add the first one above.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {products.map((product, i) => (
                                <ProductRow
                                    key={product.id}
                                    product={product}
                                    index={i}
                                    total={products.length}
                                    reorderBusy={reorderBusy}
                                    onMove={delta => moveProduct(i, delta)}
                                    onSaved={handleSaved}
                                    onDeleted={id => handleDeleted(selected.slug, id)}
                                    registerControlRef={(kind, el) => registerControlRef(product.id, kind, el)}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function AddProductForm({ categorySlug, onCreated }: { categorySlug: string; onCreated: (product: CategoryProduct) => void }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canAdd = name.trim().length > 0 && image.trim().length > 0 && !busy;

    const handleAdd = async () => {
        if (!canAdd) return;
        setBusy(true);
        setError(null);
        try {
            const input: CategoryProductInput = {
                category_slug: categorySlug,
                name: name.trim(),
                description: description.trim(),
                image: image.trim(),
                // sort_order intentionally omitted — createCategoryProduct
                // computes current max + 1 server-side so this lands at the
                // end of the category's list.
            };
            const result = await createCategoryProduct(input);
            if (result.ok) {
                onCreated(result.product);
                setName("");
                setDescription("");
                setImage("");
            } else {
                setError(result.error);
            }
        } catch {
            setError(GENERIC_ERROR);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-white/50">Add a product</p>
            <div className="flex flex-col gap-3">
                <ImageUploadField label="Product image" value={image} onChange={setImage} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="new-product-name" className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                        Name
                    </label>
                    <input
                        id="new-product-name"
                        type="text"
                        value={name}
                        disabled={busy}
                        onChange={e => setName(e.target.value)}
                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="new-product-description" className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                        Description (optional)
                    </label>
                    <textarea
                        id="new-product-description"
                        rows={2}
                        value={description}
                        disabled={busy}
                        onChange={e => setDescription(e.target.value)}
                        className="resize-none rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>

                {error && (
                    <p role="alert" className="flex items-start gap-2 text-[13px] leading-relaxed text-red-400">
                        <TriangleAlert size={14} className="mt-0.5 flex-none" aria-hidden="true" />
                        {error}
                    </p>
                )}

                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!canAdd}
                    className="flex items-center justify-center gap-2 self-start rounded-lg bg-primary px-5 py-2.5 text-xs font-bold text-black transition-colors hover:bg-primary/90 disabled:opacity-40"
                >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    {busy ? "Adding…" : "Add product"}
                </button>
            </div>
        </div>
    );
}

function ProductRow({
    product,
    index,
    total,
    reorderBusy,
    onMove,
    onSaved,
    onDeleted,
    registerControlRef,
}: {
    product: CategoryProduct;
    index: number;
    total: number;
    reorderBusy: boolean;
    onMove: (delta: number) => void;
    onSaved: (product: CategoryProduct) => void;
    onDeleted: (id: string) => void;
    registerControlRef: (kind: "up" | "down" | "delete", el: HTMLButtonElement | null) => void;
}) {
    // Only the fields this row's own inputs can change. `sort_order` and
    // `category_slug` are always read fresh from the `product` prop at save
    // time instead (below) — never cached in local state — so a reorder
    // driven by a sibling row's up/down click (which updates this row's
    // `product` prop, not its `draft`) can never be silently overwritten by
    // this row saving a stale order the next time someone edits its name.
    const [draft, setDraft] = useState({ name: product.name, description: product.description, image: product.image });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Auto-dismissing "Saved" confirmation (docs/ROADMAP.md T-004 /ui-ux
    // pass) — the only prior signal a save succeeded was the busy spinner
    // disappearing, which a non-technical editor who isn't watching closely
    // can easily miss entirely.
    const [justSaved, setJustSaved] = useState(false);
    const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    }, []);

    const persist = async (overrides: Partial<{ name: string; description: string; image: string }> = {}) => {
        const next = { ...draft, ...overrides };
        setDraft(next);
        setBusy(true);
        setError(null);
        try {
            const input: CategoryProductInput = {
                category_slug: product.category_slug,
                name: next.name,
                description: next.description,
                image: next.image,
                sort_order: product.sort_order,
            };
            const result = await updateCategoryProduct(product.id, input);
            if (result.ok) {
                setDraft({ name: result.product.name, description: result.product.description, image: result.product.image });
                onSaved(result.product);
                setJustSaved(true);
                if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
                savedTimeoutRef.current = setTimeout(() => setJustSaved(false), 2000);
            } else {
                // Deliberately does NOT reset `draft` back to `product`'s
                // last-confirmed values here (docs/ROADMAP.md T-004 /ui-ux
                // pass — the prior behaviour did, and threw away whatever
                // the editor had just typed the moment a save failed, with
                // only a small error line as the only trace anything went
                // wrong). The failed value stays on screen, still editable,
                // and the Retry action below re-sends exactly what's showing
                // — no server-contract change, this is client-only.
                setError(result.error);
            }
        } catch {
            setError(GENERIC_ERROR);
        } finally {
            setBusy(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Delete "${product.name || "this product"}"? This can't be undone.`)) return;
        setBusy(true);
        setError(null);
        try {
            const result = await deleteCategoryProduct(product.id);
            if (result.ok) {
                onDeleted(product.id);
            } else {
                setError(result.error);
            }
        } catch {
            setError(GENERIC_ERROR);
        } finally {
            setBusy(false);
        }
    };

    // Falls back to a generic noun rather than an empty aria-label — a
    // product can be edited down to a blank name (no server-side non-empty
    // check on this field) without leaving its row's controls unlabelled.
    const productLabel = product.name.trim() || "this product";

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                    Product {index + 1} of {total}
                </span>
                <div className="flex items-center gap-2">
                    {/* Persistent live region (docs/ROADMAP.md T-004 /ui-ux pass): kept
                        mounted at all times so screen readers pick up busy→saved as an
                        in-place content change, not a region appearing from nothing.
                        text-white/50, not /40 — this is real 11px body text (not an
                        aria-hidden decorative icon), so it needs the 4.5:1 text floor,
                        not the 3:1 UI-component floor; /50 is the same shade already
                        used for every other muted label in this file. */}
                    <div role="status" aria-live="polite" className="flex items-center gap-1 text-[11px] font-bold">
                        {busy && (
                            <span className="flex items-center gap-1 text-white/50">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                Saving…
                            </span>
                        )}
                        {!busy && justSaved && (
                            <span className="flex items-center gap-1 text-accent">
                                <Check size={14} aria-hidden="true" />
                                Saved
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        ref={el => registerControlRef("up", el)}
                        onClick={() => onMove(-1)}
                        disabled={index === 0 || reorderBusy || busy}
                        aria-label={`Move ${productLabel} up`}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-20 disabled:hover:text-white/40"
                    >
                        <ChevronUp size={14} />
                    </button>
                    <button
                        type="button"
                        ref={el => registerControlRef("down", el)}
                        onClick={() => onMove(1)}
                        disabled={index === total - 1 || reorderBusy || busy}
                        aria-label={`Move ${productLabel} down`}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-20 disabled:hover:text-white/40"
                    >
                        <ChevronDown size={14} />
                    </button>
                    <button
                        type="button"
                        ref={el => registerControlRef("delete", el)}
                        onClick={handleDelete}
                        disabled={busy}
                        aria-label={`Delete ${productLabel}`}
                        className="rounded-md p-1.5 text-red-400 transition-colors hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <ImageUploadField label="Product image" value={draft.image} onChange={url => void persist({ image: url })} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor={`product-name-${product.id}`} className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                        Name
                    </label>
                    <input
                        id={`product-name-${product.id}`}
                        type="text"
                        value={draft.name}
                        disabled={busy}
                        onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                        onBlur={() => { if (draft.name !== product.name) void persist(); }}
                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor={`product-description-${product.id}`} className="text-[11px] font-bold uppercase tracking-widest text-white/50">
                        Description (optional)
                    </label>
                    <textarea
                        id={`product-description-${product.id}`}
                        rows={2}
                        value={draft.description}
                        disabled={busy}
                        onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
                        onBlur={() => { if (draft.description !== product.description) void persist(); }}
                        className="resize-none rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>
            </div>

            {error && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-red-400">
                    <TriangleAlert size={14} className="mt-0.5 flex-none" aria-hidden="true" />
                    <span>
                        {error}{" "}
                        <button
                            type="button"
                            onClick={() => void persist()}
                            className="font-bold text-red-300 underline underline-offset-2 transition-colors hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                            Retry
                        </button>
                    </span>
                </p>
            )}
        </div>
    );
}
