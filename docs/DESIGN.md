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
| Fonts | `sans` = Inter; `serif` = Playfair | |

**Contrast facts (measured):**
- `text-white/70` on `surface` ≈ 9.8:1.
- `text-red-400` errors on the admin backgrounds ≈ 6.8–7.3:1.
- `accent` focus ring on `background` ≈ 7.7:1.
- **Known failures to fix, not copy:**
  - `text-black` on `bg-primary` buttons ≈ 2.77:1 (T-020);
  - `text-primary` as text on the dark admin ≈ 2.3–2.6:1;
  - `text-white/30` labels (T-011).

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
