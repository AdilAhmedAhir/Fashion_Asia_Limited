# The A-Team — v7 (portable edition)

Multi-agent engineering framework for **this project**. This file is always loaded — it is the law. Details live in `docs/`. It is **stack-agnostic**: the concrete stack lives in `docs/STACK.md` (human map) + `.claude/stack.json` (machine facts), written by `/adapt`. If those still say `adapted: false`, **run `/adapt` first.**

## This project: Fashion Asia hard rules (owner law; they override anything generic below)
Installed 2026-09-28 by GENESIS, replacing A-Team V5. The details and reasons are in
`docs/WORKFLOW.md` §2/§4/§6.
- **Commit names:**
  - Every commit is authored `happierbangladesh <happierbangladesh@users.noreply.github.com>`.
  - Every commit ends with exactly one `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line, with no other co-author, whichever agent or model made it.
  - Enforced by `.githooks/` (`git config core.hooksPath .githooks`). Never use `--no-verify`.
- **Deploy = `/ship`, only when the owner's current message contains "deploy".**
  - It pushes `main` to **both** `origin` (AdilAhmedAhir) and `client` (happierbangladesh) at the same commit.
  - Never force, and never push only one of the two.
  - `staging` is never pushed unless the owner asks for it in that same message.
- **The local dev server is the LIVE database.**
  - No agent writes during testing: no form submits, admin saves, uploads or deletes.
  - `/admin` flows are verified by the owner, using manual checklists that `/qa` writes into `docs/QA_REPORT.md`.
- **Schema changes are hand-applied SQL** in `db/migrations/` (`STATUS: PENDING_USER_APPLY`).
  - The owner applies it in the Supabase SQL editor.
  - This is a hard stop until the owner confirms.
- **Any signed-in Supabase account is an admin today.** Supabase sign-ups must stay OFF (RISKS R1).
- **Keep `agentRules: false` and `logging.serverFunctions: false` in `next.config.ts`.**
- **Every role agent runs Opus 5.5** (`model: opus`), by owner instruction on 2026-09-28.
- **Naming quirk:** in code, `Product` means a *category* and `CategoryProduct` means an *item*. See `docs/DOMAIN.md` §1.
- **V5-era docs are kept as history,** not as law: `docs/MEMORY_BANK.md` (its Known Traps §9 still apply), `docs/QA_REPORT.md`, `docs/VISION.md`, `docs/TECH_STACK.md`, `docs/PROJECT_STATE.md`, `docs/CLIENT_HANDOVER.md` and `docs/ENV_SETUP_GUIDE.md`.

## State files (read the ones a task needs — not all of them; see CONTEXT_PROTOCOL)
| File | Purpose |
|---|---|
| `docs/STACK.md` | **The architecture memory map** — stack, gate commands, reuse surface, auth model. First read for every role. |
| `docs/CONTEXT_PROTOCOL.md` | Token/context discipline — read-the-map-not-the-repo, load budgets per role, fan-out cap |
| `docs/PROJECT.md` | Vision, MVP scope, pinned versions, env var names |
| `docs/ARCHITECTURE.md` | Topology, auth/role model, data access, deploy |
| `docs/DOMAIN.md` | Domain truth — the vocabulary, entities, and policy this product encodes |
| `docs/DESIGN.md` | Aesthetic direction, tokens, banned defaults — design law (if the project has UI) |
| `docs/DATA_MODEL.md` | Schema / ERD / authorization model (the DB plan) |
| `docs/WORKFLOW.md` | Per-ticket sequences, gates, the review stage (+ Codex seam) |
| `docs/SESSION_PROTOCOL.md` | Context/session economy — resume-from-files law, when to start fresh |
| `docs/ROADMAP.md` | Tickets `T-###` with acceptance criteria + tags |
| `docs/DECISIONS.md` | Dated log of non-obvious choices + why |
| `docs/SECURITY.md` | Threat model + security findings (owned by `/security-review`) |
| `docs/INVENTORY.md` | **Generated** reuse map — what already exists (never hand-edit) |
| `docs/LOG.md` | Shipped-work history |
| `CLIENT_QUESTIONS.md` | Open questions for stakeholders; `[CONFIRM]` items trace here |

If a needed file is missing: create a minimal honest version marked `<!-- draft: auto-created -->` and continue. Never refuse over a missing doc.

## Memory protocol (ABSOLUTE — the project's lifeline)
Sessions end without warning. **One** checkpoint memory (a `.claude` memory named `<project>-build-state` + its line in `MEMORY.md`) is the ONE source of resume truth — it must ALWAYS reflect reality: *current state · what's done · the exact NEXT action · how-to-resume*, with **absolute dates**.
- Update it at the **end of every response that changed anything** (code, schema, docs, a decision, a finished step, a new next-action).
- Detail lives in the docs (LOG / DECISIONS / ROADMAP); the checkpoint memory is the "where are we + what's next" map for a one-read cold start.
- **UPDATE it in place — never spawn a duplicate.** Never let project state live only in chat.

## Stack (the binding — see docs/STACK.md; deviations need a DECISIONS.md entry)
The locked stack is whatever `/adapt` recorded in `docs/STACK.md`. Skills read gate commands, the DB flow, the auth model, and the reuse surface from there — they do **not** assume any particular framework. Changing the stack goes through `/stack-change` (which re-runs detection and updates the maps + a DECISIONS entry).

## Engineering rules (stack-neutral)
- Put shared/business logic in a shared unit (per `docs/STACK.md §4`) — never copy-paste across apps, never app→app import. Domain rules live in the domain package/module so future clients (mobile/API) reuse them.
- Validate every boundary input; **never trust a client-supplied ID for authorization** — re-check server-side (RLS or app-layer per STACK.md §5).
- **No policy number hard-coded.** Thresholds, cutoffs, fees, limits live in config/DB (see DOMAIN.md / STACK.md §6).
- Errors: friendly user state + structured server log; no swallowed promises; no debug prints in shipped code.
- Secrets stay server-only — a server-only secret reachable from a client bundle is a release-blocking bug (guarded by the post-edit hook).
- Conventional commits; branch `t-###-slug` per ticket; never force-push shared branches.

## Data & schema discipline (applies to whatever DB STACK.md names)
- Schema changes go through the project's declared migration flow (STACK.md §5), reviewed before applying — never mutate schema out-of-band (dashboard/manual).
- After every schema change: regenerate types (if the stack has typegen) and fix resulting type errors.
- **Authorization enforced in the data/server layer, not the UI**, and tested *as another user* (see `/security-review`, `/qa`). A new table/collection holding real data without an access policy is a release-blocking bug.

## Design law (if UI — details in docs/DESIGN.md)
- Read `docs/DESIGN.md` BEFORE writing UI. Semantic tokens only — raw hex / magic px in components are bugs.
- The Banned Defaults list is enforced; "it looks fine" is not a counter-argument.
- Never claim UI is done from code alone — UI tickets end at `/design-review` (screenshots) or carry an explicit "NOT VISUALLY VERIFIED" label.
- A11y floor: WCAG AA contrast, visible focus, `prefers-reduced-motion` guard, semantic HTML, mobile usable at the smallest breakpoint in DESIGN.md.

## Context & orchestration economy (see docs/CONTEXT_PROTOCOL.md)
- **Read the map, not the repo.** Every role loads `docs/STACK.md` + `docs/INVENTORY.md` + the checkpoint memory before touching source; it does not re-derive the stack by grepping.
- **The orchestrator stays thin** and never fans out a swarm: **default cap 5 concurrent worktree agents; more requires explicit user approval.** Shared-package waves run first and alone; only file-disjoint work parallelizes.
- Delegate heavy reading to subagents; consume their structured return. Close the session after ~3 tickets or a big workflow — nothing lives only in chat.

## Workflow
- Work happens against ROADMAP tickets. Done = AC met + §4 gates green + §5 reviewers clear + ticket checked off with commit ref.
- Suggest the natural next command at the end of a task, one line.
- Resuming a session → `/team`. Hands-off execution → `/sprint` or `/system-architect`. Parallel subagents only for read-only/review work or worktree-isolated, file-disjoint work; never two agents editing the same files at once.
