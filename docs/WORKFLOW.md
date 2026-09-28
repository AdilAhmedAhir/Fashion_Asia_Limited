# WORKFLOW.md — The Process Law

> How work moves from idea to shipped, and which gates are mandatory. `/sprint` and
> `/system-architect` execute this; humans follow it for attended work. Stack basis:
> `docs/STACK.md`. §7–§8 are append-only.
>
> **A-Team V7 + genesis, installed 2026-09-28**, replacing the V5 20-role workflow. The V5
> file's project rules (identity, deploy, live-database safety, the schema hard stop, manual
> admin checklists) are carried into the sections below. Its rows are preserved verbatim in
> §7/§8. Full V5 text: git history before the migration commit.

## §1 — Source of truth + branch model
- **`main` is shipped truth.** It must always pass the §4 gates. Pushing `main` **is** a
  production deploy (Vercel builds it), and only `/ship` does it (§6).
- **No direct commits to `main`.** Every change lands via a branch and `git merge --no-ff`,
  giving one merge commit per ticket, even solo.
- **Branch naming:**

  | Kind | Pattern |
  |---|---|
  | Ticket | `t-###-slug` |
  | Docs, tooling | `chore/slug` |
  | Safety snapshot | `backup-<reason>` |

  Older branches keep their V5 names (`feat/T-###-…`, `fix/T-###-…`).
- **One ticket = one branch = one focused merge.** No two agents edit the same files at once.
- **Schema changes** are plain SQL files in `db/migrations/<NNNN>_<slug>.sql`.
  - Each opens with the ticket, the author role and `-- STATUS: PENDING_USER_APPLY`.
  - The owner applies it by hand in the Supabase SQL editor. There's no Supabase CLI.
  - Only after the owner confirms does the header flip to `-- STATUS: APPLIED <date>`.
  - `supabase-schema.sql` stays the rolled-up snapshot.

## §2 — Commit format + the name rule (enforced)
- **Conventional Commits:** `type(scope): subject (T-###)`, where type is `feat`, `fix`,
  `refactor`, `chore`, `docs` or `test`. Imperative mood, ≤72 characters.
- **No:** "wip", secrets, debug prints, commented-out code, or unrelated lockfile churn.
- **Names (owner rule, 2026-09-28; no exceptions):**
  - **Author:** `happierbangladesh <happierbangladesh@users.noreply.github.com>` (the
    repo-level identity).
  - **Co-author:** the message ends with **exactly one**
    `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line, with **no other**
    co-author line, whichever agent or model made the commit.
  - **Enforced by versioned git hooks.** `.githooks/commit-msg` checks every commit, and
    `.githooks/pre-push` checks every pushed commit. They're enabled once per clone with
    `git config core.hooksPath .githooks`.
  - **Never** use `--no-verify`.
  - A commit that slips through gets fixed **before it's pushed**. Pushed commits are never
    amended.
- **Staging:** stage by path, never `git add -A` or `git add .`.

## §3 — Per-ticket sequence (by ticket type)
Every sequence is branch → work → **gates** → **review** → merge. Tickets are tagged in
ROADMAP (`[design] [db] [sec] [migrate] [notify]`).

| Ticket type | Sequence |
|---|---|
| **Logic / no UI** | `/build → /qa (if risky) → review → merge` |
| **UI feature** `[design]` | `/build → /design-review → /qa (if risky) → review → merge` |
| **Schema-touching** `[db]` | `architect-reviewer (schema) → /db (write migration) → **HARD STOP: owner applies the SQL and confirms** → /build → /qa (authz) → /security-review → review → merge` |
| **Security-sensitive** (see the list below) | `/build → /security-review → /qa (authz as another user) → review → merge` |
| **Data migration** `[migrate]` | `architect-reviewer (mapping) → /migrate → /qa (row counts + spot check) → review → merge` |
| **New dependency / version bump** | `architect-reviewer (approve) → /build → /security-review (audit) → review → merge` |
| **Docs only** | `chore/` branch → merge (diff must touch only non-source paths) |

**Security-sensitive in this project:**
- anything under `src/app/admin/**`;
- auth and middleware: `src/middleware.ts`, `src/lib/supabase/*`, `src/app/actions/auth-actions.ts`;
- any Server Action that writes;
- upload paths (`media-actions.ts`, `settings-actions.ts` `uploadFile`);
- RLS, grants and storage policies;
- anything that exposes `submissions`, which hold personal data.

`/security-review` inserts into ANY sequence touching these.

## §4 — Gates (hard; must be green before review/merge)
1. **Typecheck:** `npx tsc --noEmit`
2. **Build:** `npm run build`

These are the exact commands in `docs/STACK.md` §3 and `.claude/stack.json`.
- **Lint is suspended, not dropped.** `next lint` is broken here: ESLint 9 with only a
  legacy `.eslintrc.json` (Known Trap #10). It returns the day a working lint command lands.
- **No test runner is installed.** `/qa static` means a code review of the diff, plus direct
  execution of pure functions against synthetic data.
- **The local dev server reads the LIVE Supabase project.** No agent writes during any
  testing pass: no form submits, admin saves, uploads, deletes or crafted Server Action
  calls. Live checks are read-only (GET/HEAD, headers, screenshots of public pages).
- **`/admin` needs the owner's own login,** which no agent holds. Admin write flows are
  verified by the owner from a **manual checklist** that `/qa` writes into
  `docs/QA_REPORT.md`. By the owner's standing choice, pending checklists don't block a
  local merge. They go on the pre-deploy list.
- **Production-only behavior** (for example, Next.js redacting thrown Server Action
  messages) is checked on `npm run build && npm start -- -p 3001`, not only on `next dev`.
- **`next.config.ts` must keep `agentRules: false`,** so `next dev` never edits
  `AGENTS.md`/`CLAUDE.md`, **and `logging.serverFunctions: false`.** See the TECH_STACK
  decision of 2026-09-28.

## §5 — Review stage (the quality gate)
Before merge, the applicable reviewers run. A 🔴 blocks the merge until it's fixed, or
explicitly waived by the owner in `docs/DECISIONS.md`.

| Reviewer | Scope | Verdict |
|---|---|---|
| **`code-reviewer`** (correctness) | logic bugs, edge cases, contract drift | `SHIP / FIX FIRST / BLOCK` |
| **`security-reviewer`** | authorization tested as another user, secrets, personal data, server-key leaks, upload paths | `CLEARED / BLOCKED` |
| **`design-reviewer`** | UI against DESIGN.md, screenshots at its breakpoints | `SHIP / FIX FIRST / NEEDS DIRECTION` |
| **`architect-reviewer`** (pre-build) | schema, dependencies, cross-unit contracts | `APPROVE / REVISE / BLOCK` |

The Codex second reviewer isn't installed. `code-reviewer` holds the slot (`/codex` for
status).

## §6 — Merge & ship

**Merge to local `main`** (the orchestrator does this once green; it isn't a deploy):
- [ ] The §4 gates are green.
- [ ] No unresolved 🔴 from the §5 reviewers.
- [ ] No `.env`, secrets or keys are staged. No server-only secret is reachable from a client file.
- [ ] Every new or changed table has RLS and grants, verified rather than assumed.
- [ ] The acceptance criteria are met; ROADMAP is checked `[x]` with the commit ref; `docs/LOG.md` is appended.
- [ ] The commit names follow §2 (the hooks enforce this).

**Deploy = `/ship`.** This is an owner-only hard stop.
- It runs **only when the owner's current message contains "deploy"**.
- It pushes `main` to **both** `origin` (`AdilAhmedAhir/Fashion_Asia_Limited`) and `client`
  (`happierbangladesh/Fashion_Asia_Limited`), at the **same commit**, as a fast-forward.
- **Never force. Never push only one of the two.**
- It verifies both SHAs, then the live site (`www.fal.com.bd` = `www.fashionasialtd.com`).
- `staging` (`AdilAhmedAhir/Fashion_Asia_Limited_staging`) is never pushed unless the owner
  asks for it in that same message.

## §7 — Known issues (append-only)

| # | Issue | Severity | Date | Status |
|---|---|---|---|---|
| 1 | `npm run lint` is broken (`next lint` on Next 16, no flat ESLint config). The lint gate is suspended in §4. | 🟠 Medium | 2026-09-26 | Open |
| 2 | `supabase-schema.sql` lacks `authenticated` RLS policies for 5 of its 6 tables. The live database has hand-added policies that were never copied back. Replaying from this file would break admin writes. | 🔴 High (disaster recovery) | 2026-09-26 | Open |
| 3 | The `staging` remote sits at a different commit from `origin`/`client`. That's informational: staging isn't production. | 🟡 Low | 2026-09-26 | Open |
| 4 | The purpose of `public/layout-preview.html` and the `design-preview` branch is untraced. Confirm before pruning. | 🟡 Low | 2026-09-26 | Open |
| 5 | Any authenticated Supabase account is an admin: there's no admin role or allowlist. Keeping sign-ups OFF is the only safeguard (SEC-HIGH-2, RISKS R1). | 🔴 High | 2026-09-28 | Open. As of 2026-09-28, sign-ups were still reading as ON. |

## §8 — Changelog (append-only)

| Date | Change |
|---|---|
| 2026-09-26 | V5 initial lock-in: branching, deploy gating, commit identity, pre-commit checks, live-database testing safety, the schema hard stop and sensitive-surface triggers. |
| 2026-09-28 | V5 §2: the owner pinned the commit trailer to `Claude Opus 5.5`, with `happierbangladesh` as the only author and no other name. All V5 role agents moved to `model: opus`. |
| 2026-09-28 | **Migrated to A-Team V7 + genesis.** The V5 20-role agents, commands and `AGENTS.md` were retired (the rollback branch `backup-a-team-v5` holds them). The V7 skills, reviewers, scripts and hooks were installed and adapted: the lint and format hook is off while lint is broken, and the secret patterns were tuned. The custom two-repo `/ship` and the commit-name git hooks were added. |
