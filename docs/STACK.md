# STACK.md — The Architecture Memory Map

<!-- draft: auto-created by A-Team v7 install. Run `/adapt` to fill this from the real project. -->

> **This is the single most-read file in the framework.** It is the *map* every role loads instead of scanning the repo — the answer to "what is this project made of and how do I run its gates." Keeping it accurate is what makes cold resumes cheap and stops agents from re-deriving the stack by reading files at random (see `docs/CONTEXT_PROTOCOL.md`).
>
> `/adapt` writes this (human-readable) alongside `.claude/stack.json` (machine-readable — scripts read that). Keep the two in sync. If you change the stack, run `/stack-change`.

## §1 — Identity
- **Project:** _<name>_ · **Domain:** see `docs/DOMAIN.md` · **Status:** _<pre-scaffold | in build | production>_
- **One-line what-it-is:** _<fill>_

## §2 — Stack (quoted from real manifests — never guessed)
| Layer | Choice | Source of truth |
|---|---|---|
| Language(s) | _<e.g. TypeScript strict>_ | `tsconfig.json` |
| Package manager | _<pnpm \| npm \| yarn \| bun \| poetry \| uv \| cargo \| go>_ | lockfile |
| Repo shape | _<single-package \| turborepo \| nx \| workspaces>_ | `turbo.json` / `nx.json` / workspaces |
| Framework(s) | _<next \| react \| django \| fastapi \| …>_ | manifest deps |
| Database | _<supabase-postgres \| prisma \| drizzle \| django-orm \| none>_ | manifest / config |
| Authorization model | _<rls \| app-layer \| none>_ | see §5 |
| Deploy target | _<vercel \| docker \| fly \| netlify \| …>_ | config |
| Design system | _<tailwind+shadcn \| mui \| none/backend-only>_ | manifest |

## §3 — Gates (the hard chain — run in this order, per affected unit)
> A red gate stops the ticket. These commands come from `.claude/stack.json` `gates`; the exact strings below are what `/build`, `/ship`, and `worktree.sh gates` execute.

1. **lint:** `<cmd>`
2. **typecheck:** `<cmd>`
3. **test:** `<cmd>`
4. **build:** `<cmd>`
5. **e2e** (if specs exist): `<cmd>`

Filter one unit: `<gate-cmd> <filterFlag> <unit>` (filter flag: `<--filter | -p | n/a>`).

## §4 — The reuse surface (workspace map)
> Where shared code lives — search `docs/INVENTORY.md` (generated) before writing anything new.

| Unit | Path | Purpose |
|---|---|---|
| _<e.g. packages/ui>_ | `packages/ui` | _<fill>_ |
| … | | |

Scan roots (for the inventory scanner): _<packages, apps, src>_ · **Rule:** shared logic goes in a shared unit, never duplicated across apps, never app→app import.

## §5 — Data & authorization (the security boundary)
- **DB kind:** _<fill>_ · **Schema-change flow:** `<cmd>` → review generated migration → apply → regenerate types (`<typegen cmd>`).
- **Authorization is enforced in the _<DB (RLS) | server layer>_, not the UI.** Every access path is tested *as another user* (see `/security-review`).
  - If **RLS**: every table has RLS + per-operation policies before it holds real data; policy columns are indexed.
  - If **app-layer**: every mutation/query re-checks the caller's identity server-side; never trust a client-supplied ID for authorization.
- **Secrets that must never reach a client bundle:** _<e.g. SERVICE_ROLE key, private API keys>_ (guarded by `.claude/hooks/post-edit.sh` + patterns in `stack.json`).

## §6 — Policy-as-config (no magic numbers)
Anything a stakeholder could change (thresholds, cutoffs, fees, limits, feature flags) lives in **config/DB, never hard-coded in components**. See `docs/DOMAIN.md` for the domain's policy values.

## §7 — Design law pointer (if the project has UI)
Read `docs/DESIGN.md` before any UI. Semantic tokens only; the banned-defaults list is enforced; UI is never "done" from code — it ends at `/design-review` (screenshots) at the breakpoints listed there.

## §8 — External services & integrations
_<notifications provider, payments, storage/CDN, auth provider, third-party APIs — names + which package wraps each; secret NAMES only, never values>_
