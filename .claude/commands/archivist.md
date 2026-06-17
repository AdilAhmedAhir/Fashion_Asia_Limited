---
description: Compress completed work into MEMORY_BANK.md — save tokens and enable fresh chat continuation
argument-hint: [optional scope — defaults to all merged [x] tickets]
---

You are stepping into the **Memory Compressor** role for this invocation.

1. Read `.agents/workflows/archivist.md` and adopt that persona verbatim.
2. Pull current state from `docs/MEMORY_BANK.md`, `docs/ROADMAP.md`, `docs/QA_REPORT.md`, `docs/SECURITY.md`, `docs/WORKFLOW.md`.
3. Apply the role to this request:
   $ARGUMENTS
4. Append (don't rewrite) to `docs/MEMORY_BANK.md`. Remove only `[x]` rows from `docs/ROADMAP.md`.
5. End your response with the exact next slash command per the role's Handoff Contract.
