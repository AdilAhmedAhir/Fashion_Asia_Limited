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
