/** @purpose The shared overlay-menu behaviour (T-030; T-029 reuses it unchanged): focus moves in on open, Escape closes, Tab wraps within the toggle plus the panel, the page behind is inert, a media query closes it, and focus returns to the toggle. */
import { useEffect, useRef, type RefObject } from "react";

export type OverlayMenuOptions = {
    /** Whether the menu is open. The caller owns this state. */
    open: boolean;
    /** Closes the menu. It's called on Escape, and once `closeWhen` matches. */
    onClose: () => void;
    /** The button that opens and closes the menu. It's part of the Tab cycle and gets focus back on close. */
    toggleRef: RefObject<HTMLElement | null>;
    /** The menu panel. Its first focusable element gets focus on open. */
    panelRef: RefObject<HTMLElement | null>;
    /** A CSS selector for the page behind the menu, made `inert` while it's open. It mustn't match the toggle, the panel or anything that holds them. */
    inertTargets?: string;
    /** A media query that closes the menu once it matches, such as the width where the menu isn't shown. */
    closeWhen?: string;
};

// What Tab can reach. Disabled, hidden and inert elements are filtered out in focusablesIn.
const FOCUSABLE =
    'a[href], area[href], button, input:not([type="hidden"]), select, textarea, iframe, summary, [contenteditable]:not([contenteditable="false"]), [tabindex]';

function focusablesIn(panel: HTMLElement): HTMLElement[] {
    return Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.tabIndex >= 0 && !el.matches(":disabled") && !el.closest("[inert]") && el.getClientRects().length > 0,
    );
}

/**
 * Keyboard and focus behaviour for a menu that opens over the page.
 * - On open, focus moves to the panel's first focusable element.
 * - While open:
 *   - Escape calls `onClose`;
 *   - Tab and Shift+Tab wrap within the toggle plus the panel;
 *   - the `inertTargets` elements are `inert`, and on close only the ones this hook made inert are released;
 *   - once `closeWhen` matches, `onClose` is called.
 * - On close, if focus is inside the panel or on `<body>`, it moves to the toggle. If the toggle can't take focus
 *   (hidden at that width, for example after `closeWhen`), focus stays on `<body>`.
 * It has no timers and doesn't set `aria-modal`. Each effect undoes exactly what it did, so StrictMode's extra run leaves nothing behind.
 */
export function useOverlayMenu({ open, onClose, toggleRef, panelRef, inertTargets, closeWhen }: OverlayMenuOptions): void {
    // The latest onClose, so a new callback on each render doesn't re-run the effects (which would move focus).
    const onCloseRef = useRef(onClose);
    useEffect(() => {
        onCloseRef.current = onClose;
    });

    useEffect(() => {
        if (!open) return;
        const panel = panelRef.current;
        if (panel) focusablesIn(panel)[0]?.focus();
        return () => {
            const active = document.activeElement;
            if (!active || active === document.body || (panel !== null && panel.contains(active))) toggleRef.current?.focus();
        };
    }, [open, panelRef, toggleRef]);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onCloseRef.current();
                return;
            }
            if (event.key !== "Tab") return;
            const toggle = toggleRef.current;
            const panel = panelRef.current;
            if (!toggle || !panel) return;
            const cycle = [toggle, ...focusablesIn(panel)];
            const at = cycle.indexOf(document.activeElement as HTMLElement);
            const next = event.shiftKey
                ? cycle[at <= 0 ? cycle.length - 1 : at - 1]
                : cycle[at === -1 || at === cycle.length - 1 ? 0 : at + 1];
            event.preventDefault();
            next.focus();
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, panelRef, toggleRef]);

    useEffect(() => {
        if (!open || !inertTargets) return;
        const added = Array.from(document.querySelectorAll<HTMLElement>(inertTargets)).filter((el) => !el.inert);
        for (const el of added) el.inert = true;
        return () => {
            for (const el of added) el.inert = false;
        };
    }, [open, inertTargets]);

    useEffect(() => {
        if (!open || !closeWhen) return;
        const query = window.matchMedia(closeWhen);
        const closeIfMatched = () => {
            if (query.matches) onCloseRef.current();
        };
        closeIfMatched();
        query.addEventListener("change", closeIfMatched);
        return () => query.removeEventListener("change", closeIfMatched);
    }, [open, closeWhen]);
}
