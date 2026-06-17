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
