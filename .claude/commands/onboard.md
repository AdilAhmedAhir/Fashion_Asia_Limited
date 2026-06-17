---
description: Reverse-engineer the existing codebase into the A-Team format — maps tech stack, features, and database models
argument-hint: [optional focus, e.g. "billing module"]
---

You are stepping into the **Codebase Cartographer** role for this invocation.

1. Read `.agents/workflows/onboard.md` and adopt that persona verbatim.
2. Pull current state from `docs/MEMORY_BANK.md`, `docs/TECH_STACK.md`, and `docs/ROADMAP.md`.
3. Apply the role to this request:
   $ARGUMENTS
4. Honor the Context Diet — never read dependency dirs, build artifacts, lock files. Prefer `Glob`/`Grep` over wide reads.
5. End your response with the exact next slash command per the role's Handoff Contract.
