# Decisions Log — Argument Protocol

Append-only. Every entry is a row in §1 (Open) or §2 (Closed). Never edit a prior entry; if a decision needs revisiting, open a *new* entry referencing the old ID.

## How to file a Counter

1. A role disagrees with another role's output.
2. The challenging role writes a Counter (Round 1) here under §1 with status `OPEN_RESPONSE`.
3. The challenged role writes a Response (Round 2). Status moves to `OPEN_RESOLUTION`.
4. Either both agree (Round 3a — Resolved) or escalate to the named arbiter (Round 3b — Escalated).
5. After Round 3, status moves to `CLOSED` and the losing role executes the resolution.

**Hard rule:** A role may file at most ONE Counter per decision. After Round 3, the matter is final — no re-litigation, no "but actually."

## Arbiter table (see AGENTS.md → Cross-Department Protocol)

| Dispute type | Arbiter |
|---|---|
| Product | `/ceo` |
| Technical | `/architect` |
| Privacy | `/cso` |
| Marketing-vs-marketing | `/cmo` |
| `/cso` vs `/architect` privacy-infrastructure deadlock | **Escalate to user** |

## Counter template

```
### DEC-### — <one-line decision title>
- **Filed by:** <role> on <YYYY-MM-DD>
- **About:** <which prior output is being challenged — quote or cite>
- **Counter (Round 1):** <belief that could be wrong, alternative proposed, cost of being wrong>
- **Response (Round 2):** <revise / hold with evidence / accept>
- **Resolution (Round 3):** <agreed approach | escalated to <arbiter> — final call>
- **Status:** OPEN_RESPONSE | OPEN_RESOLUTION | CLOSED
- **Outcome:** <one line — who executes what>
```

## §1 — Open

(empty)

## §2 — Closed (append-only)

(empty)

## §3 — Decision log (A-Team V7 format, from 2026-09-28)

`docs/DECISION_RIGHTS.md` governs who decides. Door types: two-way (cheap to reverse) or one-way (expensive to reverse).

| Date | Decision | Decided by | Door | Why / notes |
|---|---|---|---|---|
| 2026-09-28 | **Retire A-Team V5 and install A-Team V7 + GENESIS.** | Owner | two-way (rollback branch `backup-a-team-v5` @ `8f085e7`) | Follows the owner's REGISTRY policy: legacy projects migrate to V7 on next real touch. Taken after T-015 merged, per the owner. |
| 2026-09-28 | **GATE 0: existing-project mode.** | Owner | two-way | The owner: "This is a complete site as you can see." |
| 2026-09-28 | **Founder Table answers delegated to the orchestrator.** | Owner | two-way | The owner: "Answer them yourself. Let me know the conclusion." Answers are in `docs/PROJECT.md`. The idea lock still needs the owner (GATE 1). |
| 2026-09-28 | **Commit names pinned:** `happierbangladesh` author plus exactly one `Co-Authored-By: Claude Opus 5.5` line, no other name. Enforced by `.githooks/commit-msg` and `.githooks/pre-push`. | Owner | two-way | The owner: "you are not allowed to commit it under any other name other than mine". |
| 2026-09-28 | **Every agent runs Opus 5.5 (`model: opus`)**, including the 4 V7 reviewers, whose template default is `fable`. | Owner | two-way | The owner: "promote all the agents to prod for 5.5". This is a mind-tier change under `DECISION_RIGHTS.md`. |
| 2026-09-28 | **Custom `/ship`:** deploy pushes `main` to both `origin` and `client` at the same commit, only on "deploy", never force, and staging only on request. | Owner | two-way | Replaces V7's stock branch-and-PR `/ship`, which doesn't fit this project's deploy. |
| 2026-09-28 | **GATE 1: idea locked**, as written in `docs/PROJECT.md` "Locked idea". The 90-day number: 0 of 8 categories on "Coming Soon" by 2026-12-27, each with at least 3 real products added by FAL staff. | Owner | two-way (later scope changes are formal decisions) | The owner: "Great lock that". From here on, scope changes need a new decision brief. |
| 2026-09-28 | **`/adapt` bound V7 to this stack.** Lint is suspended (Next 16 dropped `next lint`). No test runner. Schema is hand-applied SQL with no CLI or type generation. The post-edit format and lint step is off; the secret guard stays on with tuned patterns. | Orchestrator | two-way | These are implementation-level defaults, taken because the owner said "the system needs to be working now". Recorded in `docs/STACK.md` and `.claude/stack.json`. |
| 2026-09-28 | **GATE 2: blueprint approved.** The stack stays as it is (Next.js 16 on Vercel, Supabase with RLS). The data and access model are as mapped in `DATA_MODEL.md` and `ARCHITECTURE.md`. The admin allowlist is planned as T-023, going through `/debate` before any SQL. | Owner | two-way for the blueprint; T-023 itself is one-way | Existing system; see RISKS R1–R6. |
| 2026-09-28 | **GATE 3: team approved.** Two custom agents: `supabase-engineer` (R1/R2; writes only `db/migrations/`, `supabase-schema.sql` and `DATA_MODEL.md`, guard-armed; never applies SQL) and `premortem-planner` (R1/R3/R5; read-only). Both run `model: opus`. A scenario tester is deferred until a test runner is approved. | Owner | two-way | GENESIS Phase 3: each agent is justified by a RISKS entry, and no role-play personas were added. |
| 2026-09-28 | **GATE 4: 3 skills installed with edits.** Each was downloaded pinned to a commit, read in full by read-only reviewers plus a mechanical scan, and never auto-updates. **(1) `supabase`**: from `supabase/agent-skills` @ `544bfc56c89a` (MIT). A project-law override was added. Removed: the CLI, MCP and direct-schema-change sections, the MCP docs option, the token advice for CLI/MCP, and the feedback files that post GitHub issues. "Run a test query" became "give the owner a verification query". 156 → 98 lines. **(2) `supabase-postgres-best-practices`**: same source. A law note was added (agents never execute SQL, including `EXPLAIN ANALYZE`, `CREATE EXTENSION` and `ALTER SYSTEM`); contributor files and the changelog were removed. **(3) `react-best-practices`**: from `vercel-labs/agent-skills` @ `063bee94c3f4` (MIT). A project-law override was added (no new package without `architect-reviewer`; Server Actions return `{ ok, error }`; never run example commands; 9 outdated Next 16 rules marked don't-copy; auth-material examples marked don't-copy). `server-auth-actions` was rewritten to the project pattern, and `npx svgo`, `AGENTS.md`, `README.md` and `metadata.json` were removed. | Owner (approved per item) | two-way (delete the skill folder) | GENESIS Phase 4 protocol. Unread upstream changelogs were not installed. |
| 2026-09-28 | **Rejected:** `web-design-guidelines` fetches its instructions from GitHub on every run (unreviewed, self-updating); `vercel-deploy-claimable` uploads the project to an outside deploy service (breaks the deploy law); `vercel-optimize` needs Vercel metrics access. | Orchestrator (under the GENESIS rejection rules) | two-way | Reported to the owner before GATE 4. |
| 2026-09-28 | **Database lockdown in `.claude/settings.json`:** deny `Bash(supabase*)`, `Bash(psql*)`, writes to `.mcp.json`, and the owner's account-level Supabase MCP connector (`mcp__854b58fd-…`, which has `execute_sql` and `apply_migration`). | Orchestrator, enforcing owner law | two-way | This enforces "agents have no database access" in the harness rather than only in prose (DECISION_RIGHTS enforcement layer 1). |
