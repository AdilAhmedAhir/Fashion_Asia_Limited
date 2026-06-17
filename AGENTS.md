# The Claude A-Team — V5

This repo uses **The Claude A-Team V5**, a 20-role two-department agency framework. All durable state lives in `docs/`. All persona definitions live in `.agents/workflows/`. Slash commands live in `.claude/commands/`.

## Quick start

### Engineering Department

```
/onboard           🕵️  Codebase Cartographer    Map an existing codebase
/ceo               👑  Skeptical CEO             Define vision & MVP
/architect         🏗️  Principal Architect       Lock the tech stack
/director          🎬  Agency Director           Set workflow rules
/pm                📊  Technical PM              Break work into tickets
/git               🐙  Version Control Master    Safe Git operations
/lead-dev          💻  10X Staff Engineer        Write production code
/ui-ux             🎨  Elite Design Engineer     Polish UI/UX
/qa                🛡️  Paranoid QA Lead          Static + live testing
/cso               🔒  Adversarial CSO           Security audit & sign-off (also PII guard over analytics)
/devops            🚀  DevOps Manager            Deploy & monitor
/archivist         🗄️  Memory Compressor         Save context to disk
```

### Marketing Department

```
/cmo               📣  Strategic CMO             Lock positioning & brand voice
/seo               🔍  Technical SEO             Audit + ticket drafts
/copywriter        ✍️  Conversion Copywriter    Draft page copy
/cro               📈  Conversion Optimizer     Hypothesis-driven testing
/analytics         📊  Measurement Engineer     Event taxonomy + PII guard
/growth            🚀  Distribution Strategist  Channels, launches, sales enablement
```

### Orchestration

```
/team              📋  Team Coordinator         Read-only dual-department dashboard
/system-architect  🎛️  System Architect         Orchestrate full cycles (autopilot)
```

## How a role behaves

Every role file in `.agents/workflows/`:

- Names its **lane** (engineering or marketing).
- Lists its **Inputs** (which docs it reads, in order).
- Has a **Decision Rubric** with concrete tests instead of vague instructions.
- Has a **Refuse If** list (situations where it stops and escalates).
- Has a baked-in **Stay-In-Lane** block (refuses out-of-lane work with handoff).
- Has a **When You Disagree** section pointing at the Argument Protocol.
- Has a **Self-Check** before handoff.
- Ends with a **Handoff Contract** naming the next exact slash command.

## Recommended ticket flow

The default sequence is `/git → /lead-dev → /ui-ux (if UI) → /qa → /git`. `/cso review <ticket>` inserts if sensitive surface is touched. `/architect Review schema` inserts if migrations touch the DB. The §10 marketing-review chain (`/seo`, `/copywriter`, `/cro`, `/cso review` if analytics touched) inserts after `/qa` if marketing-surface triggers fire (see `docs/WORKFLOW.md` §10).

For hands-off mode, use `/system-architect sprint` — it walks the state machine, batches decisions once at sprint start, stops at `/archivist` after the 3rd merge, and never auto-deploys.

## Cross-Department Protocol

**Stay In Lane (Rule 8).** Every role has a declared lane (engineering or marketing) and refuses out-of-lane work. Cross-department commentary in a single response is forbidden. The only mechanisms for cross-department coordination are tickets via `/pm` and the Argument Protocol via `docs/DECISIONS.md`.

**Argument Protocol (Rule 9).** When a role disagrees with another role's output, it files a Counter in `docs/DECISIONS.md`. Maximum 3 rounds: Counter → Response → Resolution-or-Escalation. After Round 3, the matter is closed; the losing role executes anyway. A role may file at most one Counter per decision. To revisit a closed decision, open a *new* DEC-### entry referencing the old ID.

### Final arbiters

| Dispute type | Arbiter |
|---|---|
| Product (positioning, scope, feature value) | `/ceo` |
| Technical (architecture, package choice, implementation approach) | `/architect` |
| Privacy (PII handling, consent, data exposure) | `/cso` |
| Marketing-vs-marketing (e.g., `/seo` vs `/copywriter`, `/cro` vs `/copywriter`) | `/cmo` |
| `/cso` vs `/architect` deadlock on privacy-infrastructure trade-offs | **Escalate to user** — no auto-resolve. |

### Per-project: disabling marketing

For internal-only projects (no marketing surface), delete the 6 marketing role files from `.agents/workflows/`, `.claude/agents/`, and `.claude/commands/`. The remaining 14-role engineering A-Team works unchanged. WORKFLOW.md §10 also becomes inert if MARKETING.md is absent.

## State of the system

Every role reads `docs/` for state. The canonical files:

| File | Owner | Purpose |
|---|---|---|
| `docs/VISION.md` | `/ceo` | Product vision, MVP scope, success metrics |
| `docs/TECH_STACK.md` | `/architect` (or `/onboard`) | Approved packages and tools |
| `docs/WORKFLOW.md` | `/director` | Branching, sequences, gates, §10 marketing triggers |
| `docs/ROADMAP.md` | `/pm` | Atomic tickets in flight |
| `docs/MEMORY_BANK.md` | `/onboard`, `/archivist` | Shipped history, observed architecture |
| `docs/QA_REPORT.md` | `/qa` | Static + live findings (append-only) |
| `docs/SECURITY.md` | `/cso` | Threat model + security findings (append-only) |
| `docs/DECISIONS.md` | All roles (Argument Protocol) | Cross-role disagreements & resolutions |
| `docs/MARKETING.md` | `/cmo` | Positioning, brand voice, banned words |
| `docs/SEO_REPORT.md` | `/seo` | SEO audit findings (append-only) |
| `docs/copy/<page>.md` | `/copywriter` | Page copy drafts |
| `docs/CRO_PLAN.md` | `/cro` | Hypotheses, running tests, learnings |
| `docs/ANALYTICS_SPEC.md` | `/analytics` | Event taxonomy + dashboards |
| `docs/GROWTH_PLAN.md` | `/growth` | Channel mix, launches, sales enablement |

`docs/qa-evidence/` holds screenshots and HTTP transcripts from `/qa live` runs.
