# WORKFLOW.md

Owner: `/director`. Initial lock-in: 2026-09-26.

This is the law for how tickets move through The Claude A-Team on this repo. Every role in `AGENTS.md` reads this file for process; it does not override `docs/TECH_STACK.md` (tooling/package facts) or `docs/VISION.md` (product scope) — it sequences work around them.

**Status at initial lock-in:** `docs/VISION.md` was still being written by `/ceo` in parallel and had not landed at the time this file was authored; `docs/ROADMAP.md` does not exist yet (the first `/pm` pass is the next step per the Handoff Contract below); `docs/MARKETING.md` does not exist, so §10 is recorded as inert. Nothing below is blocked by those gaps. Re-run `/director` to tighten §3 if `VISION.md`, once it lands, implies ticket types that don't fit the rows already here.

## 1. Source of truth + branch model

- `main` is shipped truth. Every change lands on `main` only through a local, gated merge — never a direct commit, by any role, including at the user's own request routed through an agent (see Refuse-If in every role file).
- One feature branch per ticket, cut from `main`:
  - `feat/<ID>-<slug>` — new functionality.
  - `fix/<ID>-<slug>` — bug fix.
  - `refactor/<slug>` — no behavior change.
  - `chore/<slug>` — tooling, config, **docs**. Docs-only work uses `chore/`: this initial setup batch (`docs/TECH_STACK.md`, `docs/MEMORY_BANK.md`, `docs/VISION.md`, `docs/WORKFLOW.md`, `docs/ROADMAP.md`) is committed by `/git` on one docs-only `chore/` branch and merged with the same `--no-ff` + gate discipline as code — see the Docs-only row in §3.
  - `backup-<reason>` — point-in-time safety branch, no merge expected.
- Merges into local `main` use `git merge --no-ff` and only happen after every gate in §3/§4/§5 for that ticket type is green. No fast-forward merges — `main`'s history shows one merge commit per ticket.
- **Schema migration files.** Until `/architect` sets a different convention on first use, SQL migrations live at `db/migrations/<NNNN>_<slug>.sql` (zero-padded, ascending, one file per applied change). Each file opens with a header comment: ticket ID, authoring role, and a status line — `-- STATUS: PENDING_USER_APPLY` or `-- STATUS: APPLIED <date>` — that `/git` only flips to `APPLIED` after the user has explicitly confirmed it (§5, §7 hard stop). `supabase-schema.sql` at the repo root stays the rolled-up reference snapshot of current schema; migration files are the change log explaining how it got there. This repo has no `supabase/` CLI directory and none is being introduced by this convention — `db/migrations/` is plain SQL, applied by hand in the Supabase SQL editor, never by tooling.

## 2. Commit format

- Conventional Commits: `<type>(<scope>): <summary>`, types `feat|fix|refactor|chore|docs`.
- Footer: `Refs: <ticket ID>` once `docs/ROADMAP.md` exists and `/pm` has assigned a numbering scheme. For this initial setup batch — before `docs/ROADMAP.md` exists — use `Refs: SETUP`.
- Trailer, always present: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Pinned by the user on 2026-09-28: this exact line on every commit, whichever agent makes it, and no other co-author name may appear. All role agents run on Opus 5.5 (`model: opus` in `.claude/agents/*.md`).
- Author identity is fixed at the repo level: `happierbangladesh <happierbangladesh@users.noreply.github.com>`. Never override it with a personal identity, even at the user's own request mid-session.
- Stage by path (`git add <specific paths>`) — never a blanket `git add -A`/`git add .` reflex. No `--no-verify`. No amending a commit that has already been pushed to any remote.

## 3. Agent sequence per ticket

Default flow per `AGENTS.md`: `/git → /lead-dev → /ui-ux (if UI) → /qa → /git`, refined below per ticket type. Every row ends at `/git Merge`, which only fires once every gate for that row is green (§4, §5).

| Ticket type | Sequence |
|---|---|
| Full-stack feature (touches UI) | `/git Start` → [`/architect Review schema` if it touches the DB] → `/lead-dev` → [`/cso review` if the §5 sensitive-surface list matches] → `/ui-ux` → `/qa static` → `/qa live` → `/git Merge` |
| Backend-only (no UI change) | `/git Start` → [`/architect Review schema` if DB touched] → `/lead-dev` → [`/cso review` if sensitive] → `/qa static` → `/qa live` → `/git Merge` |
| Schema-touching | `/git Start` → `/architect Review schema` → **HARD STOP: user confirms the SQL has been applied by hand in the Supabase SQL editor** (§5, §7) → `/lead-dev` → [`/cso review` if sensitive] → `/qa static` → `/qa live` → `/git Merge` |
| Security-sensitive (§5 list) | `/git Start` → `/lead-dev` → `/cso review` → [`/ui-ux` if UI] → `/qa static` → `/qa live` → `/git Merge` |
| Docs-only (this setup batch; future `/onboard`, `/archivist`, `/director`, `/pm` passes) | `/git Start` (branch `chore/<slug>`) → `/git Merge` — no `tsc`/`build` gate (no source changed), but `/git` confirms the diff touches only `docs/` (or other non-source paths) before merging |
| Marketing-surface | **Inert** — see §10. Activates automatically once `docs/MARKETING.md` exists; `/director` is re-run to flip this row live. |

**Orchestration note** (`/system-architect sprint`): the orchestrator walks this table automatically, batches upfront decisions once per sprint, auto-merges locally the moment a ticket's row goes fully green, and stops for `/archivist` after the 3rd merge in a sprint. It never pushes to any remote — pushing is always a separate, explicit action gated by §6.

## 4. Testing minimums

Every ticket, before `/git Merge`:

- `npx tsc --noEmit` — clean, zero errors.
- `npm run build` — clean.
- `npm run lint` is **excluded from the gate.** `next lint` is broken under Next.js 16.1.6 (ESLint 9.39.3 installed, only a legacy `.eslintrc.json`, no flat `eslint.config.*` — `docs/MEMORY_BANK.md` Known Trap #10). This is a *suspended* gate, not a *dropped* one: the day a working lint command lands, `/director` re-adds it here as required, and `/architect`/`/lead-dev` should treat that as a standing follow-up until it does (tracked in §8, row 1).
- No unit-test runner or E2E tool is installed (`docs/TECH_STACK.md` → Testing framework). Until one is chosen:
  - `/qa static` = code review against the ticket's diff — there is no test suite to run.
  - `/qa live` = HTTP-level and rendered-page checks against the local dev server (`npm run dev`, port 3000 — §7).
- **No writes during any testing pass, by any agent.** Local dev points at the client's live Supabase project and live storage bucket (`docs/MEMORY_BANK.md` Known Trap #3) — there is no local or staging database. No form submissions, no admin saves, no uploads, no deletes, during `/qa static`, `/qa live`, or any other verification step. Read-only checks only.
- `/admin/*` is gated by the client's own Supabase credentials (email + password, no OAuth, no self-serve signup), which no agent holds. Admin-side flows are never live-verified by an agent; `/qa` produces a manual checklist and the user runs it by hand.

## 5. PR gates checklist

Before `/git Merge`, all of:

- [ ] §4 testing minimums green.
- [ ] No `.env` / `.env.local` / secret material staged.
- [ ] No unrelated lock-file churn.
- [ ] No debug statements (`console.log`, `debugger`) left in the diff.
- [ ] No weakened auth, no relaxed RLS, no widened middleware matcher — without `/cso` sign-off in `docs/SECURITY.md`.
- [ ] No commented-out code blocks.
- [ ] If the ticket touches any of — `src/app/admin/**`, auth/middleware (`src/middleware.ts`, `src/lib/supabase/middleware.ts`, `src/app/actions/auth-actions.ts`), any server action that writes, storage upload paths (`media-actions.ts`, `settings-actions.ts::uploadFile`), or RLS policies — `/cso review` has run and signed off in `docs/SECURITY.md`.
- [ ] If the ticket includes a schema change — `/architect` has reviewed it, the migration file exists at `db/migrations/` (§1), **and the user has explicitly confirmed the SQL was applied by hand in the Supabase SQL editor.** Hard stop: no code depending on the new schema is live-verified (`/qa live`) or merged (`/git Merge`) before that confirmation, regardless of how confident `/lead-dev` is that the SQL is correct.
- [ ] Docs-only tickets: diff contains only `docs/` (or other non-source) paths — no source edits riding along.

## 6. Deploy flow

- **Local merge to `main` is not a deploy.** `/git Merge` (`--no-ff`, §1) only updates the local repository's `main` branch. That happens autonomously once a ticket clears §4/§5 — no additional permission is needed beyond those gates.
- **Pushing `main` is a production deploy.** Vercel on the client's account builds production from GitHub `main`. Pushing `main` to a remote is therefore never routine and never automatic.
- **Hard rule:** no agent pushes `main` — or takes any action that lands new commits on `origin/main` or `client/main` — unless the user types the literal word **"deploy"** in that same turn. A previously green sprint, an earlier "looks good," or the ticket simply being merged locally is not consent to deploy. Silence is not consent. Only the word "deploy," from the user, in the turn where the push happens, authorizes it.
- **When "deploy" is given:** `/git` pushes the current local `main` to **both** `origin` and `client` at the identical commit SHA — never one without the other, never with a rebase or rewrite in between. Confirm both remotes report the same SHA after pushing.
- **`staging` is a separate track.** It is not required to mirror `origin`/`client` and is currently known to sit at a different commit (`docs/MEMORY_BANK.md` Known Trap #1). Pushing to `staging` is not "the deploy" and doesn't require the word "deploy," but it is still never a silent side effect of another action — it happens only when the user explicitly asks for a staging push in that same turn, and it is never combined with or mistaken for the production push above.
- No auto-deploy exists anywhere in this workflow, including under `/system-architect sprint` — the orchestrator never pushes; it stops at local merges and, after the 3rd merge in a sprint, at `/archivist`.

## 7. Local dev

- `npm run dev` — Next.js dev server on port 3000 (matches the `dev` launch config in `.claude/launch.json`).
- Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`docs/TECH_STACK.md` → Required env vars) — this points at the client's **live** Supabase project. There is no local or staging database. Treat every write path as a real write to production data (§4).
- `/admin` login requires the client's own credentials. No agent has these. Admin-side verification is always a manual pass by the user, guided by the checklist `/qa` produces alongside its automated read-only findings.
- Schema changes are applied by the user, by hand, in the Supabase SQL editor — there is no CLI push path (`docs/TECH_STACK.md` confirms no `supabase/` directory exists). See §1 for where the migration file lives and §5 for the hard-stop gate.

## 8. Known issues

*(Fresh table — this is the first `docs/WORKFLOW.md`. The rows below are process-relevant risks carried forward from `/onboard`'s pass over `docs/MEMORY_BANK.md`, not violations of a prior workflow — there wasn't one yet. Future rows append here, oldest first; nothing is ever deleted, only marked resolved with a date.)*

| # | Issue | Severity | Ticket | Date discovered | Status |
|---|---|---|---|---|---|
| 1 | `npm run lint` is broken (`next lint` under Next.js 16.1.6, no flat ESLint config) — lint gate suspended in §4 until fixed. | 🟠 Medium | N/A (pre-ticket, onboarding) | 2026-09-26 | Open — re-add to §4 the day a working lint command lands. |
| 2 | `supabase-schema.sql` is missing `authenticated`-role RLS policies for 5 of its 6 tables (only `jobs` has one) — the live database almost certainly carries hand-added policies never backported to this file. A schema replay from this file alone would break admin writes. | 🔴 High (disaster-recovery risk, not a live bug) | N/A (pre-ticket, onboarding) | 2026-09-26 | Open — flag for `/architect` to reconcile the file with the live dashboard, or explicitly accept and document the gap as permanent. |
| 3 | `staging` remote's `main` sits at a different commit than `origin`/`client` — don't assume it mirrors production. | 🟡 Low | N/A (pre-ticket, onboarding) | 2026-09-26 | Open — informational; §6 already treats `staging` as non-authoritative. |
| 4 | `public/layout-preview.html` and the local/`origin` branch `design-preview` (unreachable from `main`'s history) have an untraced purpose/relationship — confirm with whoever owns the layout work before any `/git` prune. | 🟡 Low | N/A (pre-ticket, onboarding) | 2026-09-26 | Open. |

## 9. What changed in this workflow

| Date | Change |
|---|---|
| 2026-09-26 | Initial lock-in. Wrote `docs/WORKFLOW.md` fresh (all 10 sections) from `docs/TECH_STACK.md` and `docs/MEMORY_BANK.md`, plus the standing session decisions on branching, deploy gating, commit identity, pre-commit checks, live-DB testing safety, the schema hard-stop, and sensitive-surface triggers. §10 recorded as present-but-inert: `docs/MARKETING.md` does not exist yet, though the marketing role files themselves are already installed under `.agents/workflows/`, `.claude/agents/`, and `.claude/commands/` — this project is marketing-capable but not yet activated. |
| 2026-09-28 | §2: the user pinned the commit trailer to `Claude Opus 5.5` on every commit, with `happierbangladesh` as the only author and no other name. All 20 role agents moved from `model: sonnet` to `model: opus`. The six unpushed commits that carried a Sonnet 5 trailer were rewritten to match, message only; the old-to-new ID map is in `docs/MEMORY_BANK.md`. |

## 10. Marketing-surface review triggers

**Status: inert.** `docs/MARKETING.md` does not exist. The marketing role files (`cmo`, `seo`, `copywriter`, `cro`, `analytics`, `growth`) are present in `.agents/workflows/`, `.claude/agents/`, and `.claude/commands/` — this project has not had its marketing roster removed per `AGENTS.md`'s "disabling marketing" instructions — but no role has produced `docs/MARKETING.md` yet, so no §10 trigger currently fires and no row in §3 inserts a marketing-review step today.

When `/cmo` produces `docs/MARKETING.md`, re-run `/director` to activate this section with the full trigger list: modifies public-facing copy (hero, value prop, CTA, product descriptions, pricing display, error messages on public flows); changes a public route (URL change, redirect, sitemap entry, robots rule); modifies the signup, checkout, onboarding, or cancellation flow; modifies transactional emails or push notifications; adds, removes, or modifies schema markup; modifies meta tags, OpenGraph, Twitter card, robots, or canonical tags; changes Core Web Vitals signals on a public template; modifies `ANALYTICS_SPEC.md` or any tracked event property.

On activation, triggered tickets insert, after `/qa` and before `/git Merge`: `/seo` (re-audit affected URLs), `/copywriter` (if copy changed), `/cro` (if a conversion flow changed), `/cso review` (if `ANALYTICS_SPEC.md` or event properties changed). These reviews produce findings and tickets; they do not block merge unless 🔴 (CRIT). 🟠 findings file follow-up tickets via `/pm`. The reverse direction — a marketing spec that requires code — is always filed as a ticket via `/pm` and picked up by engineering in its normal §3 sequence; marketing roles never write source code directly.
