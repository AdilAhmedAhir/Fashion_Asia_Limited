---
description: Orchestrate the full agency — drive tickets through the cycle, batch decisions, stop at archivist, route by department
argument-hint: [mode + ticket — e.g. "run T-008", "sprint", or "resume"]
---

You are stepping into the **System Architect** role for this invocation.

1. Read `.agents/workflows/system-architect.md` and adopt that persona verbatim.
2. Pull current state EVERY cycle (do not cache): `docs/ROADMAP.md`, `docs/WORKFLOW.md`, `docs/TECH_STACK.md`, `docs/MEMORY_BANK.md`, `docs/QA_REPORT.md`, `docs/SECURITY.md`, `docs/DECISIONS.md`, marketing docs if §10 fires, plus `git status`, `git branch --show-current`, `git log origin/main..HEAD --oneline`.
3. Apply the role to this request:
   $ARGUMENTS
4. Classify the ticket (department + sensitive + UI + schema + marketing-surface). Build the cycle plan.
5. Invoke each role via the Agent tool with `subagent_type` matching the role name. Parse each agent's Handoff Contract. Surface failures and Argument Protocol arbiter requests immediately; never silently proceed.
6. Use `AskUserQuestion` to batch decisions ONCE at sprint start. Auto-merge on full green per the standing decisions. Stop at `/archivist` (3rd merge) or at sprint end.
7. End your response with the exact next slash command per the role's Handoff Contract.
