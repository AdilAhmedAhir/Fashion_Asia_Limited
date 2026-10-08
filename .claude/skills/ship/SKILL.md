---
name: ship
description: Release Fashion Asia to production. Runs the gates, the reviewer check, a secret scan and a commit-name check, then pushes main to the happierbangladesh repo and its AdilAhmedAhir-authored mirror to the AdilAhmedAhir repo (same files, each repo authored only by its own account) and verifies the live site. Runs only when the owner's current message contains the word "deploy". Use for "ship", "deploy", "release", "push this live".
---

# /ship — Fashion Asia release (two-repo sync, one author per repo)

> **Project customization of the V7 `/ship`** (GENESIS, 2026-09-28; authorship changed by owner
> ruling 2026-10-08). The stock skill pushes a branch and opens a PR. This project instead
> deploys by pushing to two GitHub repos that must always hold the same files, each authored
> only by its own account. Vercel builds production from `main`.

**Owner-only hard stop:** run this only when the owner's **current** message contains the
word **"deploy"**. An earlier "looks good", a green sprint or a previous turn's approval is
not consent (`docs/DECISION_RIGHTS.md`, the prod-deploy row).

## Facts (from `docs/STACK.md` §8 and `docs/WORKFLOW.md` §2 and §6)

| Thing | Value |
|---|---|
| Production | Vercel, building `main` |
| Live domains | `www.fal.com.bd` and `www.fashionasialtd.com` (same deployment) |
| Remote `client` | `happierbangladesh/Fashion_Asia_Limited`: gets local `main`, authored and committed by `happierbangladesh <happierbangladesh@users.noreply.github.com>` |
| Remote `origin` | `AdilAhmedAhir/Fashion_Asia_Limited` (public): gets `publish/origin-main`, the mirror of `main` authored and committed by `AdilAhmedAhir <90372976+AdilAhmedAhir@users.noreply.github.com>` |
| Rule | Both tips hold the **same tree**; their commit ids differ. No commit carries a co-author line. Pushes are fast-forward only; **never force**, apart from the one-time 2026-10-08 rewrite. |
| Remote `staging` | Never pushed by `/ship`. Only when the owner asks for staging in that same message. |

## Procedure
1. **Preflight.**
   - You are on `main`, the working tree is clean, and there are no unmerged ticket branches meant for this release.
   - Build the origin mirror: `node .claude/scripts/mirror-authorship.mjs --identity origin main:publish/origin-main`. It's deterministic, so it reproduces every commit already on `origin`.
   - Read both remote heads: `git ls-remote client refs/heads/main` and `git ls-remote origin refs/heads/main`.
   - `client`'s head must be an ancestor of `main`, and `origin`'s head an ancestor of `publish/origin-main`.
   - If either isn't: STOP. Report "the repos have drifted" with both ids, and never force.
2. **Gates** (`docs/STACK.md` §3), on `main`:
   - `npx tsc --noEmit`
   - then `npm run build`
   - Lint is suspended (Known Trap #10), and there is no test runner. Any red: STOP.
3. **Reviews.** Every ticket in `client/main..main` has cleared its `docs/WORKFLOW.md` §5 reviewers, with no unresolved 🔴 (check ROADMAP/LOG). Otherwise STOP.
4. **Secret scan.**
   - Check `git diff client/main..main` for `.claude/stack.json` `secretPatterns`.
   - No `.env*` is tracked.
   - No server-only secret sits in a client-reachable file.
   - Run `npm audit --omit=dev` and report anything high or critical.
5. **Commit names and files.**
   - **`client` range:** every commit in `client/main..main` is authored and committed by happierbangladesh.
   - **`origin` range:** every commit in `origin/main..publish/origin-main` is authored and committed by AdilAhmedAhir's private address.
   - **Both ranges:** no co-author line anywhere.
   - **Files:** `git rev-parse main^{tree}` equals `git rev-parse publish/origin-main^{tree}`.
   - The `.githooks/pre-push` hook enforces the names per remote too. **Never** use `--no-verify`.
6. **Database.** Any `db/migrations/*.sql` whose header still says `STATUS: PENDING_USER_APPLY`: STOP. The owner applies SQL by hand in the Supabase SQL editor first (`docs/WORKFLOW.md` §3).
7. **Supabase sign-ups.** Read `GET /auth/v1/settings` with the anon key, printing only the flag. If `disable_signup` isn't `true`: STOP and tell the owner (SEC-HIGH-2), unless the owner's current message explicitly accepts deploying with sign-ups on.
8. **Push**, as normal pushes, never force:
   - `git push client main`, then `git push origin publish/origin-main:main`.
   - If the second push fails: retry once, then STOP and report loudly that the repos are out of sync, with both ids. Don't push anything else until it's resolved.
9. **Verify sync.**
   - `git ls-remote client refs/heads/main` equals `main`'s id.
   - `git ls-remote origin refs/heads/main` equals `publish/origin-main`'s id.
   - The two trees are equal.
10. **Verify live.**
    - Poll `https://www.fal.com.bd` until the new build serves, using a route or content this release changed.
    - Then check on **both** `www` domains:
      - `/` → 200
      - `/products` → 200, with the category links present
      - one `/products/<slug>` → 200
      - `/what-we-do/<slug>` → 308 to `/products/<slug>`
      - an unknown slug → 404
      - `/sitemap.xml` → 200
      - `/admin` → 307 to `/admin/login`
      - `/admin/login` → 200
    - **The response headers** (Wave 5a's PM13): each of the six security headers appears exactly once, and HSTS reads `max-age=63072000; includeSubDomains`.
    - **The bare domains** (`https://fashionasialtd.com/`, `https://fal.com.bd/`) still redirect to their `www` host without our headers. If either serves the site, STOP.
    - Report anything else that looks wrong.
11. **Record.** Append to `docs/LOG.md` (`YYYY-MM-DD — deployed client <id> / origin <id> (T-…): <one line>`) and update the checkpoint memory.

**Rollback rule (Wave 5a's PM14):** if something misbehaves live, revert the commits on `main`, rebuild the mirror and ship again. Never use Vercel's Instant Rollback to a build from before T-025.

Output: gate results, reviewer verdicts, commits shipped with their names verified, both
remote ids and the tree check, live-check results, and the log entry. Next: `/team`.

## Hard stops (never autopilot past these)
- No "deploy" in the owner's current message.
- The remotes have drifted from `main` or its mirror.
- A red gate.
- An unresolved 🔴.
- A commit carrying any other name, or any co-author line.
- The two tips' trees differ.
- Pending SQL.
- Supabase sign-ups ON, without the owner's explicit acceptance in that message.
- Anything that would need force.
- Pushing to only one repo.

Present the problem plainly and wait.
