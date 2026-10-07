# DESIGN.md — Design Law

> GENESIS Phase 2, 2026-09-28. This records the existing, shipped design as law. It's
> recorded, not invented. The sources are `tailwind.config.ts`, the live site, and the
> `/ui-ux` passes on T-002, T-004, T-005, T-012 and T-015.

## §1 — Direction
- **Direction:** cinematic industrial-dark. A dark green-black canvas, big serif display
  type, B&W factory photography and restrained green accents. It should read as a serious
  export manufacturer, not a fashion brand.
- **Signature element:** full-bleed B&W photography under a dark gradient scrim, with serif
  titles on top: the category photo cards and the hero.

## §2 — Tokens (semantic only; use Tailwind names, never raw hex in components)

| Token | Value | Use |
|---|---|---|
| `background` | `#1a1f1a` | Public page canvas |
| `surface` | `#0a0a0a` | Cards, admin shell background |
| `foreground` | `#f5faf5` | Body text |
| `primary` | `#016138` | Brand green: fills and buttons |
| `accent` | `#0EC97A` | Bright green: links, focus rings, highlights |
| `secondary` | `#02894f` | The end of `.text-gradient` only (`globals.css`); never under light text |
| `scrim` (`bg-scrim`) | `linear-gradient(360deg, rgb(0 0 0 / 0.9), rgb(0 0 0 / 0.4), transparent)` | The dark gradient under the titles on full-bleed photo cards (`CategoryCardGrid`) |
| Fonts | `sans` = Inter; `serif` = Playfair | |

**`scrim`:**
- It's the gradient the category cards already had (`bg-gradient-to-t from-black/90 via-black/40 to-transparent`), now recorded as a token (T-027).
- `360deg` means "to top". It's spelled that way on purpose: the CSS minifier rewrites "to top" and `0deg` as a reversed "to bottom". That draws the same gradient but rounds a few hundred pixels one level differently.
- With `360deg`, a fixed render of the card is 0 pixels different from before, at 360 and 1440 px. Live captures can differ by one colour level on a few photo pixels; that's capture noise, not the token. Don't change it back to "to top".

**Green on buttons and in text (T-020, T-027):**
- **Solid fills:** text on a solid `bg-primary` fill is `text-foreground` (7.18:1) in every state except disabled. That includes hover-only fills such as `hover:bg-primary hover:text-foreground`, and `::selection`.
- **`secondary`:** light text never sits on `secondary` (`#02894f`, which is still in `tailwind.config.ts`). White there is 4.47:1 and `foreground` is 4.23:1; both fail.
- **Outline and transparent states:** they use `text-accent` or `text-foreground`.
- **Fills:** the fill colour doesn't change for any of this.
- **Green text** is `text-accent` at full opacity.
  - `text-primary` colours no text and no control.
  - It may only colour `aria-hidden` decorative graphics that aren't controls, plus the mobile-menu numbers.
  - A graphic inside a control, such as an accordion's +/− icon or a button's spinner, counts as part of the control and uses `text-accent`.
  - Inline links in body text keep `underline underline-offset-4`. `accent` is only about 1.1:1 from `text-white/70` body text, so the underline marks the link (WCAG 1.4.1).
  - An `accent` link hovers to `text-foreground`.

**Status colours** (already shipped, measured):

| Status | Classes | Ratio | Measured on |
|---|---|---|---|
| Error | `text-red-400` | 6.93:1 | admin card (`bg-white/[0.02]` on `surface`) |
| | | about 5.8:1 (computed) | public form panel |
| Advisory | `text-amber-300` on `bg-amber-400/10` (with `border-amber-400/30`) | 11.71:1 | admin page (`surface`) |
| | | 11.19:1 | inside an admin card |
| | `text-amber-300`, no tint | 13.29:1 | admin card |
| Success | `text-accent` | 7.35:1 | public form panel (`FormStatusMessage`; measured on the same panel's `text-accent` asterisk) |
| | | 7.69:1 | bare `background` |
| | | 8.81:1 | admin card |

- The advisory colour stays on Tailwind's amber scale. There's no `warning` token.
- Status lines use `role="status"` and errors use `role="alert"` (§6).

**Contrast facts (measured):**
- **`accent` text:**
  - 7.69:1 on `background`;
  - 9.10:1 on `surface`;
  - 8.81:1 on an admin card;
  - 8.40:1 on `bg-primary/10` chips;
  - 7.89:1 on `bg-primary/20` status chips;
  - 5.8–6.7:1 on photo badges (`bg-background/80`–`/90` over a photo; the worst 5% of pixels).
- **`foreground`:** 15.8:1 on `background`, 18.7:1 on `surface`, and 7.18:1 on `primary`.
- **`text-white/50`:** 5.32:1 on the admin sidebar's `bg-black`, and 5.34:1 on an admin card. It's the lowest step that passes there; `white/45` is about 4.4:1 on black (computed).
- **`text-white/70` on `surface`:** about 9.8:1.
- **Focus ring:** `accent` on `background` is about 7.7:1.
- **White tiles** (the certification marks): `text-surface/70` is 7.69:1.

**Known failures to fix, not copy:**
- **Admin panels:** `text-white/30` and `text-white/40` labels and hints are about 2.6:1 and 3.8:1 on an admin card (computed; T-011, Wave 4c).
- **`accent` below full opacity:** `accent/70` on `background` is about 4.4:1.
- **Light text on `secondary`:** see above.
- **The homepage hero overlay** (one paused video frame; text-shadow not counted): the tag (`text-accent` on `bg-background/90` over the video) is 4.36:1 at the median and 1.88:1 at worst, and the "Legacy" stat label (`text-white/70`) is 3.07:1. Scheduled with Wave 5b.
- **`FormStatusMessage` errors** use `role="status"`, not `role="alert"` (T-041).
- **Fixed in Wave 4.** Kept here so they aren't reintroduced:
  - `text-black` on `bg-primary`, 2.77:1 (T-020);
  - `text-primary` as text, 2.0–2.6:1 (T-027);
  - `FormStatusMessage`'s success line, 2.2:1, now `text-accent` (T-027);
  - `text-white/25` sidebar labels (2.03:1) and `text-white/40` stat labels (about 3.8:1), now `text-white/50` (T-027).

## §3 — Type & numerals
Serif (Playfair) for headings and display; sans (Inter) for body and UI. Micro-labels are
uppercase with wide tracking, at ≥ 4.5:1 contrast.

## §4 — Motion
- **Libraries:** Framer Motion (`ScrollReveal`), GSAP and Lenis smooth scroll (hover-capable
  devices only; off on touch).
- **Preloader:** on every public page, 1.2–2.0 s.
- **Guards:**
  - `prefers-reduced-motion` guards on new motion (`motion-safe:`);
  - no motion in admin tables;
  - focus rings appear instantly, with no transition.

## §5 — Breakpoints (for `/design-review` screenshots)
360 · 768 · 1024 · 1440. The admin must not scroll sideways at 360; wide tables scroll
inside their card.

## §6 — A11y floor
- WCAG AA contrast, with a visible `focus-visible` ring (`ring-accent`).
- Semantic HTML: one `h1` per page, with no skipped heading levels.
- Errors use `role="alert"`; advisories use `role="status"`.
- Icon buttons carry specific `aria-label`s.
- Everything is usable at 360px.

## §7 — Banned defaults (enforced)
- **Colour:** raw hex or magic px in components; pure `#000` or `#fff` text, where `foreground`
  or a white-opacity token exists; new `text-black`-on-`primary` or `text-primary`-as-text
  combinations.
- **Focus:** unstyled or missing focus states.
- **Copy:** stock "Lorem" or invented placeholder products. Empty states say "Coming Soon",
  honestly.
- **Feedback:** silent failures. Every async action shows busy, success or error.
