"use client";

import { useState, useTransition } from "react";
import { Check, Info, TriangleAlert } from "lucide-react";
import { saveCategories } from "@/app/actions/settings-actions";
import type { AllProductsRead } from "@/app/actions/products-actions";
import { ObjectListEditor, SettingsCard, SettingsHeader, SettingsLoadError } from "@/components/admin/SettingsForm";
import { CategoryProductsManager } from "@/components/admin/CategoryProductsManager";
import type { Product } from "@/lib/site-content";
import { blankTitleMessage, blankTitleRows, categoriesDiffer, needsFirstSave } from "./category-draft";

/**
 * @purpose What /admin/products hands its editor: the categories and products it loaded, or a failed load that must not be edited.
 * `products` can fail on its own (T-016): the categories stay editable, and
 * only the products card turns off.
 */
export type ProductsLoad =
    | { ok: true; categories: Product[]; products: AllProductsRead }
    | { ok: false };

const LOAD_FAILED =
    "The saved categories couldn't be loaded, so editing is turned off to keep them safe. Refresh the page to try again.";

const PRODUCTS_LOAD_FAILED =
    "The products couldn't be loaded, so adding and editing products is turned off to keep them safe. Refresh the page to try again.";

const SAVE_THREW =
    "Something went wrong saving the categories. Check your connection, then click Save categories again.";

/**
 * @purpose The /admin/products editor: the category list, saved together by "Save categories", above the per-category product manager, whose products save on their own.
 *
 * Two lists (T-026 contract, item 9):
 * - `draft` is what the category editor shows and edits;
 * - `confirmed` is the list the server last confirmed. The product manager is
 *   fed only this one, so a category added, renamed or removed in the draft
 *   doesn't reach it until "Save categories" succeeds.
 * Both come from the first `load` only, and afterwards change only to the
 * list saveCategories returns. The page re-renders after every save (each
 * action revalidates paths), and those later props are ignored on purpose:
 * there's no effect or key that resets them, so a later failed reload can't
 * swap out the editor or throw away a draft.
 */
export default function ProductsClient({ load }: { load: ProductsLoad }) {
    const [initial] = useState(load);
    const [draft, setDraft] = useState<Product[]>(() => (initial.ok ? initial.categories : []));
    const [confirmed, setConfirmed] = useState<Product[]>(() => (initial.ok ? initial.categories : []));
    const [error, setError] = useState<string | null>(null);
    const [justSaved, setJustSaved] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Fail closed: no editor and no Save button without a successful read.
    if (!initial.ok) {
        return <SettingsLoadError tag="Page Settings" title="Products" message={LOAD_FAILED} />;
    }

    const dirty = categoriesDiffer(draft, confirmed);
    const firstSavePending = needsFirstSave(confirmed);

    const edit = (next: Product[]) => {
        setDraft(next);
        setJustSaved(false);
    };

    const save = () => {
        setError(null);
        setJustSaved(false);

        // The server treats an untitled category as removed, so a title
        // cleared by mistake would delete it. Blocked here, by row number.
        const blanks = blankTitleRows(draft);
        if (blanks.length) {
            setError(blankTitleMessage(blanks));
            return;
        }

        const sent = draft;
        startTransition(async () => {
            try {
                const result = await saveCategories(sent);
                if (!result.ok) {
                    // The draft stays exactly as it was. Every refusal says
                    // what to fix, and the unsaved-changes line says to save.
                    setError(result.error);
                    return;
                }
                setDraft(result.categories);
                setConfirmed(result.categories);
                setJustSaved(true);
            } catch {
                setError(SAVE_THREW);
            }
        });
    };

    return (
        <div className="flex max-w-4xl flex-col gap-8">
            <SettingsHeader
                tag="Page Settings"
                title="Products"
                onSave={save}
                saving={isPending}
                error={error}
                saveLabel="Save categories"
            />

            <SettingsCard title="Categories">
                <div className="flex flex-col gap-6">
                    {firstSavePending && (
                        <div className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm leading-relaxed text-amber-300">
                            <Info size={16} className="mt-0.5 flex-none" aria-hidden="true" />
                            <span>
                                <strong className="font-bold">These categories haven&apos;t been saved yet.</strong>{" "}
                                Click <strong className="font-bold">Save categories</strong> once with no other changes. Renaming a category before that
                                changes its web address.
                            </span>
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <p className="text-sm leading-relaxed text-white/70">
                            Each category is a photo card on /what-we-do and /products, with its own page at
                            /products/&lt;slug&gt; (for example, /products/t-shirts). Changes here go live only when you
                            click <strong className="font-bold text-foreground">Save categories</strong>. After its first
                            save, a category keeps its web address even if you rename it.
                        </p>
                        {/* Always mounted, so screen readers hear each change
                            in place rather than a region appearing. */}
                        <div role="status" aria-live="polite" className="text-sm leading-relaxed">
                            {dirty ? (
                                <p className="flex items-start gap-2 text-amber-300">
                                    <Info size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                    <span>
                                        <strong className="font-bold">Unsaved category changes.</strong> They aren&apos;t
                                        on the site until you click Save categories.
                                    </span>
                                </p>
                            ) : justSaved ? (
                                <p className="flex items-start gap-2 text-accent">
                                    <Check size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                                    Categories saved.
                                </p>
                            ) : null}
                        </div>
                    </div>

                    {/* Read-only while a save is in flight: the save's result
                        replaces the draft, so anything typed meanwhile would
                        be lost. */}
                    <fieldset disabled={isPending} className="m-0 min-w-0 border-0 p-0">
                        <legend className="sr-only">Categories</legend>
                        <ObjectListEditor
                            label="Categories, in the order the site shows them"
                            items={draft}
                            onChange={edit}
                            addLabel="Add category"
                            fields={[
                                { key: "title", label: "Title" },
                                { key: "description", label: "Short Description (optional — hidden when blank)", type: "textarea" },
                                { key: "image", label: "Card image", type: "image" },
                            ]}
                        />
                    </fieldset>
                </div>
            </SettingsCard>

            <SettingsCard title="Products in Each Category">
                {initial.products.ok ? (
                    <div className="flex flex-col gap-6">
                        <p className="text-sm leading-relaxed text-white/70">
                            These are the individual items inside each category, shown on its own page (for example, every
                            T-shirt style on /products/t-shirts) and on /products. They aren&apos;t the category cards above.
                        </p>
                        <CategoryProductsManager categories={confirmed} initialProductsByCategory={initial.products.byCategory} />
                    </div>
                ) : (
                    // Fail closed (T-016): no picker, no add form and no rows,
                    // so a failed read can't pass for an empty category and
                    // lead staff to add a product twice. Fixed copy, never the
                    // database error. Read once, so only a refresh retries.
                    <p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">
                        <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />
                        {PRODUCTS_LOAD_FAILED}
                    </p>
                )}
            </SettingsCard>
        </div>
    );
}
