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
import {
    hasVisibleText,
    type CategoryProduct,
    type CategoryProductInput,
    type CategoryProductPatch,
    type Product,
} from "@/lib/site-content";

const GENERIC_ERROR = "Something went wrong. Check your connection and try again.";

// How long "Saved" stays up after a save lands (T-004's /ui-ux pass). Display
// only: nothing in the save queue below uses a timer.
const SAVED_VISIBLE_MS = 2000;

// What staff see if they try to leave this page while a product is still
// saving (T-034). Design review may tune the words.
const LEAVE_WHILE_SAVING =
    "A product is still saving. If you leave this page now, you won't see whether your change was saved.\n\nPress OK to leave anyway, or Cancel to stay until it says “Saved”.";

// Each category's products, keyed by category slug. A Map, never a plain
// object (T-016, SEC-INFO-37): a category slugged "constructor" is just
// another key. Read-only, so every change builds a new Map.
type ProductsByCategory = ReadonlyMap<string, readonly CategoryProduct[]>;

// The fields a product row edits, and the only ones its saves ever send.
const EDITABLE_FIELDS = ["name", "description", "image"] as const;
type EditableField = (typeof EDITABLE_FIELDS)[number];
type EditableFields = Record<EditableField, string>;

type SaveResult = Awaited<ReturnType<typeof updateCategoryProduct>>;

/**
 * One product's save queue (T-016, WARN-1). CategoryProductsManager keeps one
 * per product, keyed by product id, in a ref, so it belongs to the product,
 * not to the row on screen: a row that unmounts (a category switch) and
 * mounts again finds the same queue, with any save still in flight or
 * waiting.
 * - At most one save is in flight. A commit made meanwhile sets `waiting`,
 *   and exactly one follow-up is sent when that save settles.
 * - What a save sends is worked out when it's sent: every field whose
 *   committed value differs from the confirmed one. If nothing differs,
 *   nothing is sent.
 * - A failure keeps everything committed, so the next save (Retry, or any
 *   new commit) carries the failed fields too. Nothing is ever sent by a
 *   timer or on its own.
 */
type SaveQueue = {
    /** What the server last confirmed. */
    confirmed: EditableFields;
    /** The confirmed values plus the user's own committed edits. */
    committed: EditableFields;
    inFlight: boolean;
    waiting: boolean;
    /** The latest attempt's error, until a send starts or a commit or Retry finds nothing to send. */
    error: string | null;
    /** Set when the queue drains after a success: a new object for each one. */
    saved: { at: number } | null;
};

/** A snapshot of one product's queue, published as state, so its row shows it wherever it mounts. */
type SaveView = {
    committed: EditableFields;
    /** A save is in flight or waiting. */
    pending: boolean;
    error: string | null;
    saved: { at: number } | null;
};

const editableFieldsOf = (product: CategoryProduct): EditableFields => ({
    name: product.name,
    description: product.description,
    image: product.image,
});

// What a save sends: an own key for each field whose committed value differs
// from the confirmed one, always a string, and nothing else (never
// category_slug, sort_order or id).
function changedFields(queue: SaveQueue): CategoryProductPatch {
    const patch: CategoryProductPatch = {};
    for (const field of EDITABLE_FIELDS) {
        if (queue.committed[field] !== queue.confirmed[field]) patch[field] = queue.committed[field];
    }
    return patch;
}

// The list with two products' places swapped, found by id, and each
// product's sort_order renumbered to its place, as a reorder stores it.
function swapProducts(list: readonly CategoryProduct[], idA: string, idB: string): CategoryProduct[] {
    const swapped = [...list];
    const a = swapped.findIndex(p => p.id === idA);
    const b = swapped.findIndex(p => p.id === idB);
    if (a !== -1 && b !== -1) [swapped[a], swapped[b]] = [swapped[b], swapped[a]];
    return swapped.map((p, i) => ({ ...p, sort_order: i }));
}

/**
 * The product editor on `/admin/products`, below the category editor (T-026;
 * T-004 put it on `/admin/business`). Deliberately a *separate* save model
 * from the categories (docs/ROADMAP.md T-004, design point 1): every
 * add/edit/delete/reorder here is its own immediate Server Action against
 * `public.products`, not batched behind the page's "Save categories" button —
 * so this component owns its own state entirely and never folds product data
 * into the page's category draft (the list that DOES get sent to
 * `saveCategories`). A product operation must never touch `site_settings` —
 * keeping the two states structurally separate is what guarantees that, not a
 * runtime check.
 *
 * `categories` is the page's last server-confirmed category list, never its
 * unsaved draft (T-026 contract, item 9), so a category only appears here, or
 * disappears, once a categories save has succeeded.
 *
 * Product edits go through one save queue per product, held here rather than
 * in its row (T-016; see SaveQueue), and each save sends only the fields that
 * changed.
 */
export function CategoryProductsManager({
    categories,
    initialProductsByCategory,
}: {
    categories: Product[];
    initialProductsByCategory: ReadonlyMap<string, CategoryProduct[]>;
}) {
    const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>(initialProductsByCategory);
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

    // The save queues, one per product id (see SaveQueue). Never rendered
    // directly: every change is published to `saveViews`. The functions
    // below reach the queues only through this ref and the products only
    // through state updaters, so an older copy of one of them (the onChange an
    // upload captured when it started) acts exactly like the current one.
    const queues = useRef(new Map<string, SaveQueue>()).current;
    const [saveViews, setSaveViews] = useState<ReadonlyMap<string, SaveView>>(() => new Map());

    // While any product is still saving, leaving the page asks first (T-034).
    useLeaveGuard(Array.from(saveViews.values()).some(view => view.pending));

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
    // state — it's the page's confirmed category list, so a successful
    // categories save (a rename, an add, the first bootstrap save) is
    // reflected here on the very next render with no separate sync step.
    const selected = categories.find(c => c.slug === selectedSlug) ?? null;
    // A category only ever gets a real `id` by surviving a save under
    // docs/TECH_STACK.md decision (d) — "" is the not-yet-assigned sentinel
    // (see the Product type's own comment in site-content.ts). Checking `id`
    // here, proactively, means staff see the "not saved yet" message the
    // moment they select such a category, not only after a failed add.
    const bootstrapped = Boolean(selected?.id);
    const products = selectedSlug ? productsByCategory.get(selectedSlug) ?? [] : [];

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
        setProductsByCategory(prev => {
            const next = new Map(prev);
            next.set(product.category_slug, [...(prev.get(product.category_slug) ?? []), product]);
            return next;
        });
    };

    const handleSaved = (product: CategoryProduct) => {
        setProductsByCategory(prev => {
            const list = prev.get(product.category_slug);
            if (!list) return prev;
            const next = new Map(prev);
            next.set(product.category_slug, list.map(p => (p.id === product.id ? product : p)));
            return next;
        });
    };

    const publish = (id: string, queue: SaveQueue) => {
        const view: SaveView = {
            committed: { ...queue.committed },
            pending: queue.inFlight || queue.waiting,
            error: queue.error,
            saved: queue.saved,
        };
        setSaveViews(prev => new Map(prev).set(id, view));
    };

    // Created at the product's first commit, from the product as this tab
    // has it. Until then nothing in this tab can have changed its name,
    // description or image: only a save does that.
    const queueFor = (product: CategoryProduct): SaveQueue => {
        let queue = queues.get(product.id);
        if (!queue) {
            const fields = editableFieldsOf(product);
            queue = { confirmed: fields, committed: { ...fields }, inFlight: false, waiting: false, error: null, saved: null };
            queues.set(product.id, queue);
        }
        return queue;
    };

    // Sends one save, built now from the queue. Only ever called from a
    // commit or Retry (event handlers) and from the previous save's
    // completion: never during render, in a state updater or in an effect.
    // Returns false, sending nothing, when nothing differs.
    const send = (id: string, queue: SaveQueue): boolean => {
        const patch = changedFields(queue);
        if (patch.name === undefined && patch.description === undefined && patch.image === undefined) return false;
        const sent = { ...queue.committed };
        queue.inFlight = true;
        queue.waiting = false;
        queue.error = null;
        queue.saved = null;
        void runSave(id, queue, patch, sent);
        return true;
    };

    const runSave = async (id: string, queue: SaveQueue, patch: CategoryProductPatch, sent: EditableFields) => {
        let result: SaveResult;
        try {
            result = await updateCategoryProduct(id, patch);
        } catch {
            result = { ok: false, error: GENERIC_ERROR };
        }
        settle(id, queue, sent, result);
    };

    // Runs for every save, whether or not its row is on screen: there's no
    // "still mounted" check anywhere in the save path, so a committed save
    // always reaches handleSaved.
    const settle = (id: string, queue: SaveQueue, sent: EditableFields, result: SaveResult) => {
        queue.inFlight = false;
        if (result.ok) {
            const confirmed = editableFieldsOf(result.product);
            for (const field of EDITABLE_FIELDS) {
                // Not committed again since this save was sent: take the
                // server's value (trimmed, or another tab's edit).
                if (queue.committed[field] === sent[field]) queue.committed[field] = confirmed[field];
            }
            queue.confirmed = confirmed;
            queue.error = null;
            handleSaved(result.product);
        } else {
            queue.error = result.error;
        }

        if (queue.waiting) {
            queue.waiting = false;
            // The one follow-up for what was committed meanwhile. It carries
            // every field that still differs, failed ones included.
            if (send(id, queue)) {
                publish(id, queue);
                return;
            }
            // That commit left nothing different from the server, so the
            // row matches it and a failure's error clears.
            queue.error = null;
        }
        queue.saved = result.ok ? { at: Date.now() } : null;
        publish(id, queue);
    };

    // A commit or Retry. While a save is in flight it only asks for the
    // follow-up; otherwise it sends now. When nothing differs from the
    // server, nothing is sent and a failure's error clears, because the row
    // then matches the server.
    const requestSave = (id: string, queue: SaveQueue) => {
        if (queue.inFlight) queue.waiting = true;
        else if (!send(id, queue)) queue.error = null;
        publish(id, queue);
    };

    // Name or Description on blur, the path box on blur or Enter, and an
    // upload finishing: the only ways a value reaches a product's queue.
    // Typing the same text back isn't a change, so it commits nothing.
    const commitField = (product: CategoryProduct, field: EditableField, value: string) => {
        const queue = queueFor(product);
        if (queue.committed[field] === value) return;
        queue.committed[field] = value;
        requestSave(product.id, queue);
    };

    const retrySave = (product: CategoryProduct) => requestSave(product.id, queueFor(product));

    const handleDeleted = (categorySlug: string, id: string) => {
        const list = productsByCategory.get(categorySlug) ?? [];
        const index = list.findIndex(p => p.id === id);
        // The row after the deleted one slides into its position, so
        // focusing that row's own Delete button keeps a keyboard user
        // deleting downward without focus ever landing back at the top of
        // the page. If the deleted row was last, its new-last neighbour
        // (the row before it) is the next best thing. If it was the only
        // row, there's no row left — fall back to the category picker.
        const neighborId = index === -1 ? null : list[index + 1]?.id ?? list[index - 1]?.id ?? null;

        setProductsByCategory(prev => {
            const next = new Map(prev);
            next.set(categorySlug, (prev.get(categorySlug) ?? []).filter(p => p.id !== id));
            return next;
        });

        if (neighborId) {
            focusRowControl(neighborId, "delete");
        } else {
            selectRef.current?.focus();
        }
    };

    const moveProduct = async (index: number, delta: number) => {
        if (!selectedSlug) return;
        const slug = selectedSlug;
        const list = productsByCategory.get(slug) ?? [];
        const target = index + delta;
        if (target < 0 || target >= list.length) return;

        const movedProductId = list[index].id;
        const otherProductId = list[target].id;
        const direction: "up" | "down" = delta < 0 ? "up" : "down";

        // The order sent to the server, front to back. The list on screen is
        // rebuilt inside each updater from the current state instead, so a
        // product save that lands during the reorder is never overwritten by
        // this click's older copy. Each row's sort_order follows its new
        // place, matching what the server stores; a product save never sends
        // sort_order (T-016), so an edit can't undo a reorder either way.
        const orderedIds = swapProducts(list, movedProductId, otherProductId).map(p => p.id);
        // Swapping the same two products again puts them back.
        const swapOnScreen = () =>
            setProductsByCategory(prev => new Map(prev).set(slug, swapProducts(prev.get(slug) ?? [], movedProductId, otherProductId)));

        swapOnScreen();
        setReorderBusy(true);
        setReorderError(null);
        // Claim the moved row's own control for refocus once this settles —
        // the effect above waits for reorderBusy to clear before acting, so
        // it never races the disabled attribute this same click just set.
        setPendingFocus({ productId: movedProductId, direction });
        try {
            const result = await reorderCategoryProducts(slug, orderedIds);
            if (!result.ok) {
                setReorderError(result.error);
                swapOnScreen();
            }
        } catch {
            setReorderError(GENERIC_ERROR);
            swapOnScreen();
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
                    add, reorder or delete a product below, or leave a field you&apos;ve edited,
                    it&apos;s live on the public site — there&apos;s no Save button down here. That&apos;s
                    different from the categories above, which only take effect
                    once you click <strong className="font-bold text-foreground">Save categories</strong>.
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
                <p className="text-sm text-white/50">Add a category above and click Save categories, then come back here to add its products.</p>
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
                        <strong>Save categories</strong> at the top of this page (no other changes needed), then come
                        back here.
                    </span>
                </div>
            ) : (
                <>
                    {/* Keyed by category (WARN-2): switching category throws
                        away a half-filled form, so nothing typed or uploaded
                        for one category can be added to another. */}
                    <AddProductForm key={selected.slug} categorySlug={selected.slug} onCreated={handleCreated} />

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
                                    saveView={saveViews.get(product.id)}
                                    index={i}
                                    total={products.length}
                                    reorderBusy={reorderBusy}
                                    onMove={delta => moveProduct(i, delta)}
                                    onCommit={commitField}
                                    onRetry={retrySave}
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

    // Mirrors the server's rule (T-016): a name and an image with a visible
    // character each. The server decides; this only keeps the button honest.
    const canAdd = hasVisibleText(name) && hasVisibleText(image) && !busy;

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
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/50">Add a product</p>
            <div className="flex flex-col gap-3">
                <ImageUploadField label="Product image" value={image} onChange={setImage} />

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="new-product-name" className="text-xs font-bold uppercase tracking-widest text-white/50">
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
                    <label htmlFor="new-product-description" className="text-xs font-bold uppercase tracking-widest text-white/50">
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
                    <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
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
    saveView,
    index,
    total,
    reorderBusy,
    onMove,
    onCommit,
    onRetry,
    onDeleted,
    registerControlRef,
}: {
    product: CategoryProduct;
    saveView: SaveView | undefined;
    index: number;
    total: number;
    reorderBusy: boolean;
    onMove: (delta: number) => void;
    onCommit: (product: CategoryProduct, field: EditableField, value: string) => void;
    onRetry: (product: CategoryProduct) => void;
    onDeleted: (id: string) => void;
    registerControlRef: (kind: "up" | "down" | "delete", el: HTMLButtonElement | null) => void;
}) {
    // The draft: the product's committed values (its save queue's, or the
    // product's own before its first commit), with the user's uncommitted
    // typing in Name and Description laid over them. A field with no typing
    // follows the product as its saves land; a field being typed in keeps
    // the user's text until blur commits it. The path box keeps its own
    // typing (ImageUploadField's commitPathOnBlur). Nothing here is sent:
    // only the manager's queue sends, and only what was committed.
    const committed = saveView?.committed ?? editableFieldsOf(product);
    const [typing, setTyping] = useState<{ name: string | null; description: string | null }>({ name: null, description: null });
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    // The product's save state, wherever this row mounts.
    const pending = saveView?.pending ?? false;
    const saveError = saveView?.error ?? null;
    const savedVisible = useSavedFlash(saveView?.saved ?? null);

    const handleTyping = (field: "name" | "description", text: string) => setTyping(prev => ({ ...prev, [field]: text }));

    // Blur (Tab or a click away) hands the typed text to the queue, which
    // treats it as a commit only if it differs from what's committed.
    const commitTyping = (field: "name" | "description") => {
        const text = typing[field];
        if (text === null) return;
        setTyping(prev => ({ ...prev, [field]: null }));
        onCommit(product, field, text);
    };

    const handleDelete = async () => {
        if (!confirm(`Delete "${product.name || "this product"}"? This can't be undone.`)) return;
        setDeleting(true);
        setDeleteError(null);
        try {
            const result = await deleteCategoryProduct(product.id);
            if (result.ok) {
                onDeleted(product.id);
            } else {
                setDeleteError(result.error);
            }
        } catch {
            setDeleteError(GENERIC_ERROR);
        } finally {
            setDeleting(false);
        }
    };

    // Falls back to a generic noun rather than an empty aria-label — a row
    // stored before T-016's name rule can still have a blank name, and it
    // mustn't leave its row's controls unlabelled.
    const productLabel = product.name.trim() || "this product";

    // Up, down and delete wait for this product's saves, in flight or waiting.
    const controlsLocked = pending || deleting;

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 gap-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">
                    Product {index + 1} of {total}
                </span>
                <div className="flex items-center gap-2">
                    {/* Persistent live region (docs/ROADMAP.md T-004 /ui-ux pass): kept
                        mounted at all times so screen readers pick up busy→saved as an
                        in-place content change, not a region appearing from nothing.
                        text-white/50, not /40 — this is real 12px body text (not an
                        aria-hidden decorative icon), so it needs the 4.5:1 text floor,
                        not the 3:1 UI-component floor; /50 is the same shade already
                        used for every other muted label in this file. */}
                    <div role="status" aria-live="polite" className="flex items-center gap-1 text-xs font-bold">
                        {controlsLocked && (
                            <span className="flex items-center gap-1 text-white/50">
                                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                                {pending ? "Saving…" : "Deleting…"}
                            </span>
                        )}
                        {/* Only once nothing is waiting and the latest attempt
                            succeeded: never over a failure. */}
                        {!controlsLocked && !saveError && savedVisible && (
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
                        disabled={index === 0 || reorderBusy || controlsLocked}
                        aria-label={`Move ${productLabel} up`}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-20 disabled:hover:text-white/40"
                    >
                        <ChevronUp size={14} />
                    </button>
                    <button
                        type="button"
                        ref={el => registerControlRef("down", el)}
                        onClick={() => onMove(1)}
                        disabled={index === total - 1 || reorderBusy || controlsLocked}
                        aria-label={`Move ${productLabel} down`}
                        className="rounded-md p-1.5 text-white/40 transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-20 disabled:hover:text-white/40"
                    >
                        <ChevronDown size={14} />
                    </button>
                    <button
                        type="button"
                        ref={el => registerControlRef("delete", el)}
                        onClick={handleDelete}
                        disabled={controlsLocked}
                        aria-label={`Delete ${productLabel}`}
                        className="rounded-md p-1.5 text-red-400 transition-colors hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {/* The path box commits on blur or Enter, not per keystroke;
                    an upload commits as soon as it finishes. */}
                <ImageUploadField
                    label="Product image"
                    value={committed.image}
                    commitPathOnBlur
                    onChange={url => onCommit(product, "image", url)}
                />

                {/* Editable while a save is in flight, so nothing typed after
                    tabbing out mid-save is dropped. Only a delete locks them. */}
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={`product-name-${product.id}`} className="text-xs font-bold uppercase tracking-widest text-white/50">
                        Name
                    </label>
                    <input
                        id={`product-name-${product.id}`}
                        type="text"
                        value={typing.name ?? committed.name}
                        disabled={deleting}
                        onChange={e => handleTyping("name", e.target.value)}
                        onBlur={() => commitTyping("name")}
                        className="rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor={`product-description-${product.id}`} className="text-xs font-bold uppercase tracking-widest text-white/50">
                        Description (optional)
                    </label>
                    <textarea
                        id={`product-description-${product.id}`}
                        rows={2}
                        value={typing.description ?? committed.description}
                        disabled={deleting}
                        onChange={e => handleTyping("description", e.target.value)}
                        onBlur={() => commitTyping("description")}
                        className="resize-none rounded-lg border border-white/10 bg-black px-4 py-2.5 text-sm text-white focus:border-primary/50 focus:outline-none disabled:opacity-50"
                    />
                </div>
            </div>

            {/* A failed save keeps the draft on screen, still editable
                (docs/ROADMAP.md T-004 /ui-ux pass). Retry, like any new
                commit, sends everything committed that the server doesn't
                have yet. */}
            {saveError && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-red-400">
                    <TriangleAlert size={14} className="mt-0.5 flex-none" aria-hidden="true" />
                    <span>
                        {saveError}{" "}
                        <button
                            type="button"
                            onClick={() => onRetry(product)}
                            className="font-bold text-red-300 underline underline-offset-2 transition-colors hover:text-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                        >
                            Retry
                        </button>
                    </span>
                </p>
            )}

            {/* A failed delete: the trash button tries again. */}
            {deleteError && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-red-400">
                    <TriangleAlert size={14} className="mt-0.5 flex-none" aria-hidden="true" />
                    {deleteError}
                </p>
            )}
        </div>
    );
}

// Whether "Saved" is up: for SAVED_VISIBLE_MS after the save landed, wherever
// the row is mounted in that time (T-004's /ui-ux pass: it confirms briefly,
// then goes). Display only: this timer never sends or changes anything else.
function useSavedFlash(saved: { at: number } | null): boolean {
    const [expired, setExpired] = useState<{ at: number } | null>(() =>
        saved && Date.now() - saved.at >= SAVED_VISIBLE_MS ? saved : null,
    );
    useEffect(() => {
        if (!saved) return;
        const remaining = saved.at + SAVED_VISIBLE_MS - Date.now();
        if (remaining <= 0) {
            setExpired(saved);
            return;
        }
        const timer = setTimeout(() => setExpired(saved), remaining);
        return () => clearTimeout(timer);
    }, [saved]);
    return saved !== null && expired !== saved;
}

/**
 * While `active`, asks before this page is left (T-034). Closing the tab,
 * reloading, typing a URL or any hard navigation gets the browser's own
 * prompt. An in-app link or a form submit (Sign Out) never fires
 * `beforeunload`, so those ask LEAVE_WHILE_SAVING first: Cancel stops the
 * click or submit before the app sees it, and OK lets it through. It only
 * asks: it never sends, flushes or cancels a save, so after OK the save
 * queue keeps sending.
 */
function useLeaveGuard(active: boolean) {
    useEffect(() => {
        if (!active) return;
        const onBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };
        const stayUnlessConfirmed = (event: Event) => {
            if (confirm(LEAVE_WHILE_SAVING)) return;
            event.preventDefault();
            event.stopPropagation();
        };
        const onClick = (event: MouseEvent) => {
            if (leavesByLink(event)) stayUnlessConfirmed(event);
        };
        window.addEventListener("beforeunload", onBeforeUnload);
        window.addEventListener("click", onClick, true);
        window.addEventListener("submit", stayUnlessConfirmed, true);
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
            window.removeEventListener("click", onClick, true);
            window.removeEventListener("submit", stayUnlessConfirmed, true);
        };
    }, [active]);
}

// A plain click (or Enter) on a same-origin link to another page in this
// tab. Modifier-clicks, `target` and `download` links, and links that only
// change the hash don't leave the page, so they're never asked about.
function leavesByLink(event: MouseEvent): boolean {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(link instanceof HTMLAnchorElement) || link.target || link.hasAttribute("download")) return false;
    const to = new URL(link.href);
    const here = new URL(window.location.href);
    if (to.origin !== here.origin) return false;
    to.hash = "";
    here.hash = "";
    return to.href !== here.href;
}
