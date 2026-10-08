#!/usr/bin/env node
/**
 * @purpose Give each GitHub repo its own authorship (owner ruling 2026-10-08). Re-creates every
 * commit reachable from the given refs with the same tree, the same parents (mapped) and the same
 * dates, authored and committed by one account, with every co-author line removed.
 *
 * It's deterministic: the same commits in always give the same commit ids out. So the origin
 * (AdilAhmedAhir) mirror of `main` can be recomputed from scratch at any time, and it lines up
 * with what's already on origin, which keeps every later push a fast-forward.
 *
 * Usage:
 *   node .claude/scripts/mirror-authorship.mjs --identity client|origin [--map out.tsv] [--dry-run] <src>:<dst> [<src>:<dst> ...]
 *     <src>  any commit-ish (a branch, a remote-tracking ref or an id)
 *     <dst>  a local branch name, written as refs/heads/<dst>
 *
 *   /ship's origin mirror:  --identity origin main:publish/origin-main
 *
 * It writes only the <dst> branches. It never pushes and never touches the working tree.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const IDENTITIES = {
    client: { name: "happierbangladesh", email: "happierbangladesh@users.noreply.github.com" },
    origin: { name: "AdilAhmedAhir", email: "90372976+AdilAhmedAhir@users.noreply.github.com" },
};

const git = (args, opts = {}) =>
    execFileSync("git", args, { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, ...opts });

function fail(message) {
    console.error(`mirror-authorship: ${message}`);
    process.exit(1);
}

const args = process.argv.slice(2);
let identityKey = null, mapFile = null, dryRun = false;
const pairs = [];
for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--identity") identityKey = args[++i];
    else if (a === "--map") mapFile = args[++i];
    else if (a === "--dry-run") dryRun = true;
    else if (a.includes(":")) {
        const at = a.lastIndexOf(":");
        pairs.push({ src: a.slice(0, at), dst: a.slice(at + 1) });
    } else fail(`unknown argument '${a}'`);
}
const identity = IDENTITIES[identityKey];
if (!identity) fail("--identity must be 'client' or 'origin'");
if (pairs.length === 0) fail("give at least one <src>:<dst> pair");
for (const p of pairs) if (!/^[\w./-]+$/.test(p.dst)) fail(`bad destination branch '${p.dst}'`);

// Every co-author line goes, whatever its case. Trailing blank lines are trimmed and the message
// ends with exactly one newline. Running it twice changes nothing, which keeps the output stable.
function cleanMessage(message) {
    const kept = message.split("\n").filter((line) => !/^co-authored-by:/i.test(line.trim()));
    return kept.join("\n").replace(/\s+$/, "") + "\n";
}

function readCommit(sha) {
    const raw = git(["cat-file", "commit", sha]);
    const split = raw.indexOf("\n\n");
    const head = split === -1 ? raw : raw.slice(0, split);
    const message = split === -1 ? "" : raw.slice(split + 2);
    let tree = null, author = null, committer = null;
    const parents = [];
    for (const line of head.split("\n")) {
        const space = line.indexOf(" ");
        const key = line.slice(0, space), value = line.slice(space + 1);
        if (key === "tree") tree = value;
        else if (key === "parent") parents.push(value);
        else if (key === "author") author = value;
        else if (key === "committer") committer = value;
        else fail(`commit ${sha.slice(0, 7)} has a '${key}' header this script doesn't handle`);
    }
    // "Name <email> 1791431121 +0600": keep the timestamp and its zone exactly.
    const dateOf = (ident) => {
        const m = /> (\d+) ([+-]\d{4})$/.exec(ident || "");
        if (!m) fail(`commit ${sha.slice(0, 7)} has an unreadable date`);
        return `@${m[1]} ${m[2]}`;
    };
    return { tree, parents, authorDate: dateOf(author), committerDate: dateOf(committer), message };
}

const srcShas = pairs.map((p) => git(["rev-parse", "--verify", `${p.src}^{commit}`]).trim());
const order = git(["rev-list", "--topo-order", "--reverse", ...srcShas]).trim().split("\n").filter(Boolean);

const map = new Map();
const rows = [];
for (const sha of order) {
    const c = readCommit(sha);
    const parentArgs = [];
    for (const p of c.parents) {
        const mapped = map.get(p);
        if (!mapped) fail(`parent ${p.slice(0, 7)} of ${sha.slice(0, 7)} wasn't rewritten first`);
        parentArgs.push("-p", mapped);
    }
    const env = {
        ...process.env,
        GIT_AUTHOR_NAME: identity.name,
        GIT_AUTHOR_EMAIL: identity.email,
        GIT_AUTHOR_DATE: c.authorDate,
        GIT_COMMITTER_NAME: identity.name,
        GIT_COMMITTER_EMAIL: identity.email,
        GIT_COMMITTER_DATE: c.committerDate,
    };
    const message = cleanMessage(c.message);
    const created = git(["commit-tree", "--no-gpg-sign", c.tree, ...parentArgs, "-F", "-"], { env, input: message }).trim();

    // The new commit must carry the same tree and the exact original dates.
    const check = readCommit(created);
    if (check.tree !== c.tree) fail(`tree changed for ${sha.slice(0, 7)}`);
    if (check.authorDate !== c.authorDate || check.committerDate !== c.committerDate) fail(`date changed for ${sha.slice(0, 7)}`);

    map.set(sha, created);
    rows.push([sha, created, message.split("\n")[0]]);
}

for (let i = 0; i < pairs.length; i++) {
    const out = map.get(srcShas[i]);
    if (!dryRun) git(["update-ref", `refs/heads/${pairs[i].dst}`, out]);
    console.log(`${pairs[i].src} -> ${dryRun ? "(dry run) " : ""}${pairs[i].dst} ${out}`);
}
if (mapFile) fs.writeFileSync(mapFile, rows.map((r) => r.join("\t")).join("\n") + "\n");
console.log(`rewrote ${rows.length} commits as ${identity.name} <${identity.email}>, with no co-author lines`);
