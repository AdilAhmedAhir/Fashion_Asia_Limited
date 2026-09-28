---
name: ship
description: Release Fashion Asia to production. Runs the gates, the reviewer check, a secret scan and a commit-name check, then pushes main to BOTH GitHub repos (AdilAhmedAhir and happierbangladesh) at the same commit and verifies the live site. Runs only when the owner's current message contains the word "deploy". Use for "ship", "deploy", "release", "push this live".
---

# /ship — Fashion Asia release (two-repo sync)

> **Project customization of the V7 `/ship`** (GENESIS, 2026-09-28). The stock skill pushes a
> branch and opens a PR. This project instead deploys by pushing `main` to two GitHub repos
> that must always hold the same commit. Vercel builds production from `main`.

**Owner-only hard stop:** run this only when the owner's **current** message contains the
word **"deploy"**. An earlier "looks good", a green sprint or a previous turn's approval is
not consent (`docs/DECISION_RIGHTS.md`, the prod-deploy row).

## Facts (from `docs/STACK.md` §8 and `docs/WORKFLOW.md` §6)

| Thing | Value |
|---|---|
| Production | Vercel, building `main` |
| Live domains | `www.fal.com.bd` and `www.fashionasialtd.com` (same deployment) |
| Remote `origin` | `AdilAhmedAhir/Fashion_Asia_Limited` |
| Remote `client` | `happierbangladesh/Fashion_Asia_Limited` |
| Rule | Both remotes' `main` are always the same commit. A push is fast-forward only; **never force**. |
| Remote `staging` | Never pushed by `/ship`. Only when the owner asks for staging in that same message. |

## Procedure
1. **Preflight.**
   - You are on `main`, the working tree is clean, and there are no unmerged ticket branches meant for this release.
   - Read both remote heads without fetching:
     `git ls-remote origin refs/heads/main` and `git ls-remote client refs/heads/main`.
   - The two must be **equal**, and each must be an ancestor of local `main`.
   - If they differ: STOP. Report "the two repos have drifted apart" with both SHAs, and never pick one.
2. **Gates** (`docs/STACK.md` §3), on `main`:
   - `npx tsc --noEmit`
   - then `npm run build`
   - Lint is suspended (Known Trap #10), and there is no test runner. Any red: STOP.
3. **Reviews.** Every ticket in `origin/main..main` has cleared its `docs/WORKFLOW.md` §5 reviewers, with no unresolved 🔴 (check ROADMAP/LOG). Otherwise STOP.
4. **Secret scan.**
   - Check `git diff origin/main..main` for `.claude/stack.json` `secretPatterns`.
   - No `.env*` is tracked.
   - No server-only secret sits in a client-reachable file.
5. **Commit names.**
   - Every commit in `origin/main..main` must be authored `happierbangladesh <happierbangladesh@users.noreply.github.com>`.
   - Each must carry exactly one `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` line and no other co-author line.
   - The `.githooks/pre-push` hook enforces this too. **Never** use `--no-verify`.
6. **Database.** Any `db/migrations/*.sql` whose header still says `STATUS: PENDING_USER_APPLY`: STOP. The owner applies SQL by hand in the Supabase SQL editor first (`docs/WORKFLOW.md` §3).
7. **Push**, as a normal push, never force:
   - `git push origin main`, then `git push client main`.
   - If the second push fails: retry once, then STOP and report loudly that the two repos are out of sync, with both SHAs. Don't push anything else until it's resolved.
8. **Verify sync.** `git ls-remote` on both remotes must equal local `main`'s SHA.
9. **Verify live.**
   - Poll `https://www.fal.com.bd` until the new build serves, using a route or content this release changed.
   - Then check on **both** domains:
     - `/` → 200
     - `/what-we-do` → 200, with the category links present
     - one `/what-we-do/<slug>` → 200
     - an unknown slug → 404
     - `/sitemap.xml` → 200
     - `/admin` → 307 to `/admin/login`
     - `/admin/login` → 200
   - Report anything else that looks wrong.
10. **Record.** Append to `docs/LOG.md` (`YYYY-MM-DD — deployed <sha> (T-…): <one line>`) and update the checkpoint memory.

Output: gate results, reviewer verdicts, commits shipped with their names verified, both
remote SHAs, live-check results, and the log entry. Next: `/team`.

## Hard stops (never autopilot past these)
- No "deploy" in the owner's current message.
- The remotes have diverged.
- A red gate.
- An unresolved 🔴.
- A commit carrying any other name.
- Pending SQL.
- Anything that would need force.
- Pushing to only one repo.

Present the problem plainly and wait.
