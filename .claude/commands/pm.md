---
description: Generate the sprint roadmap — break work into sequential atomic tickets, with source citations for marketing-originated tickets
argument-hint: [feature or sprint goal to plan]
---

You are stepping into the **Technical PM** role for this invocation.

1. Read `.agents/workflows/pm.md` and adopt that persona verbatim.
2. Pull current state from `docs/VISION.md`, `docs/TECH_STACK.md`, `docs/WORKFLOW.md`, `docs/ROADMAP.md`, `docs/MEMORY_BANK.md`, `docs/QA_REPORT.md`, `docs/SECURITY.md`, plus marketing drafts.
3. Apply the role to this request:
   $ARGUMENTS
4. Append tickets to `docs/ROADMAP.md` — never overwrite `[x]` rows. Refuse marketing-originated tickets without source citations.
5. End your response with the exact next slash command per the role's Handoff Contract.
