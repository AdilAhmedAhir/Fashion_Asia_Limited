# LOG.md — Shipped-Work History

> Format: `YYYY-MM-DD — T-### shipped (<units>): <one line>. Learned: <one line or —>.`
> Earlier history, from the V5 era, is in `docs/MEMORY_BANK.md` §12 and `docs/PROJECT_STATE.md`.
> Entries from 2026-09-28 onwards are written here, and deploys are marked.

- 2026-09-26 — T-002 merged (admin): recommended image size plus a non-blocking upload warning. Learned: advisory state needs its own role (`status`), separate from hard errors (`alert`).
- 2026-09-27 — T-001 merged (db): `public.products` table (migration 0001, applied by the owner) plus the category slug groundwork. Learned: explicit GRANTs are now required for new tables.
- 2026-09-27 — T-003 merged (catalog): the product data layer, a hidden category id and the delete guard. Learned: identity must be an id, never a slug string (QA CRIT-1).
- 2026-09-27 — T-005 merged (public): 8 category detail pages under `/what-we-do`, plus the sitemap. Learned: every page is dynamic (`cookies()`), so revalidation is mostly moot.
- 2026-09-27 — T-012 merged (admin): settings saves return `{ ok, error }`, and all 6 settings pages show errors (SEC-HIGH-4). Learned: thrown Server Action errors are silent in production.
- 2026-09-27 — T-004 merged (admin): the products-within-category editor on `/admin/business`. Learned: two save models on one page need an explicit banner.
- **2026-09-28 — DEPLOYED `e8eace1`** to origin and client (T-001–T-005, T-012). Live on www.fal.com.bd and www.fashionasialtd.com within about 60 s. Learned: Supabase sign-ups were ON at deploy time (RISKS R1).
- 2026-09-28 — T-006 merged (deps): `next` 16.1.6 → 16.3.6, closing SEC-HIGH-1 in code, plus the dev-only `agentRules` and `serverFunctions` config keys. **Not yet deployed.** Learned: `npm audit` missed the 16.2–16.3.5 `next/og` advisory; the release notes caught it.
- 2026-09-28 — T-015 merged (admin): report, job and leader CRUD return `{ ok, error }` and check the session (SEC-HIGH-5, most of SEC-MED-10). **Not yet deployed.** Learned: PDFs over 1 MB fail on Next's Server Action body limit (Q08).
- 2026-09-28 — A-Team V7 + GENESIS installed; V5 retired (rollback `backup-a-team-v5`). Commit-name hooks and the two-repo `/ship` were added. Learned: V7's post-edit lint hook had to be disabled until lint is fixed.
- 2026-10-03 — T-024 merged (catalog): shared category photo-card grid plus product card and grid (`src/components/catalog/*`), now rendering `/what-we-do` and the category pages. Product photos are named (closes T-021), and titles use the `foreground` token. **Not yet deployed.** Learned: "no visible change" can conflict with design law; DESIGN.md §7 wins, and the sanctioned pixel change is recorded in DECISIONS.
- 2026-10-03 — T-025 merged (catalog): a new `/products` overview (category grid plus sections per category that has products); category pages move to `/products/<slug>`, with a permanent 308 from `/what-we-do/<slug>`; a "View all products" button on `/what-we-do`; "Products" in the menu and footer; every page-header tag now passes AA (`text-accent`); the mobile menu scrolls with a mouse. Closes SEC-MED-15 in code. **Not yet deployed.** Learned: a 7th menu item pushed Connect below the fold, which exposed that Lenis eats wheel events in overlays; and the redirect needs live checks after deploy, because Vercel routes redirects outside `next start`.
