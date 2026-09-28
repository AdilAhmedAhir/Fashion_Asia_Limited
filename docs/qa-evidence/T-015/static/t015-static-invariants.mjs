// T-015 /qa static: mechanical invariant check over the REAL source files,
// using the project's own TypeScript compiler API (no new dependency).
//
// Read-only: parses files, runs `git show HEAD:<file>` for import baselines,
// writes nothing. Exit code 0 = every invariant holds, 1 = at least one failed.
//
// usage: node t015-static-invariants.mjs [/path/to/repo]
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const REPO = process.argv[2] || "/Volumes/D_Architect/Codebase/Fashion_asia_limited";
const req = createRequire(path.join(REPO, "package.json"));
const ts = req("typescript");

const SERVER = {
    "src/app/actions/settings-actions.ts": {
        createReport: "ActionResult", updateReport: "ActionResult", deleteReport: "ActionResult",
        createLeader: "ActionResult", updateLeader: "ActionResult", deleteLeader: "ActionResult",
        uploadFile: "UploadFileResult",
    },
    "src/app/actions/jobs-actions.ts": {
        createJob: "JobActionResult", updateJob: "JobActionResult", deleteJob: "JobActionResult",
    },
};
const TEN = Object.values(SERVER).flatMap((o) => Object.keys(o));
const CLIENTS = [
    "src/app/admin/(dashboard)/reports/ReportsClient.tsx",
    "src/app/admin/(dashboard)/careers/CareersClient.tsx",
    "src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx",
];
const SESSION_TEXT = "Your session expired. Sign in again and retry.";

let failures = 0;
const out = [];
const log = (s = "") => out.push(s);
const check = (ok, label) => { if (!ok) failures++; log(`  ${ok ? "PASS" : "FAIL"}  ${label}`); return ok; };

function parse(rel, text) {
    const src = text ?? fs.readFileSync(path.join(REPO, rel), "utf8");
    return ts.createSourceFile(rel, src, ts.ScriptTarget.Latest, true, rel.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
}
const line = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
function walk(node, fn, { intoFunctions = true } = {}) {
    fn(node);
    node.forEachChild((c) => {
        if (!intoFunctions && ts.isFunctionLike(c)) return;
        walk(c, fn, { intoFunctions });
    });
}
const isFnBoundary = (n) => ts.isFunctionLike(n);
const hasExport = (n) => (ts.getCombinedModifierFlags(n) & ts.ModifierFlags.Export) !== 0;
const hasAsync = (n) => (n.modifiers || []).some((m) => m.kind === ts.SyntaxKind.AsyncKeyword);

// ------------------------------------------------------------------ server
log("== SERVER: the ten actions ==");
for (const [rel, fns] of Object.entries(SERVER)) {
    const sf = parse(rel);
    log(`-- ${rel}`);
    // "use server" constraint: every VALUE export is an async function declaration.
    const valueExports = [];
    for (const st of sf.statements) {
        if (!hasExport(st)) continue;
        if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) continue;
        valueExports.push(st);
    }
    const badExports = valueExports.filter((st) => !(ts.isFunctionDeclaration(st) && hasAsync(st)));
    check(badExports.length === 0, `every value export is an async function declaration (${valueExports.length} value exports)`);
    // requireUser helper must not be exported (it would become a callable action).
    const ru = sf.statements.find((s) => ts.isFunctionDeclaration(s) && s.name?.text === "requireUser");
    check(!!ru && !hasExport(ru), "requireUser() exists and is NOT exported");
    // SESSION_EXPIRED text is byte-identical to the precedent.
    let sessionConst = null;
    walk(sf, (n) => { if (ts.isVariableDeclaration(n) && n.name.getText(sf) === "SESSION_EXPIRED") sessionConst = n.initializer?.text; });
    check(sessionConst === SESSION_TEXT, `SESSION_EXPIRED === ${JSON.stringify(SESSION_TEXT)}`);

    for (const [name, resultType] of Object.entries(fns)) {
        const fn = sf.statements.find((s) => ts.isFunctionDeclaration(s) && s.name?.text === name);
        log(`   ${name}()`);
        if (!check(!!fn && hasExport(fn) && hasAsync(fn), `   exported async function`)) continue;
        check(fn.type && fn.type.getText(sf) === `Promise<${resultType}>`, `   declared return type Promise<${resultType}> (got ${fn.type ? fn.type.getText(sf) : "none"})`);
        let throws = 0;
        walk(fn.body, (n) => { if (ts.isThrowStatement(n)) throws++; });
        check(throws === 0, `   zero throw statements in body`);
        const st = fn.body.statements;
        check(/^const supabase = await createClient\(\);$/.test(st[0]?.getText(sf) || ""), `   stmt 1: const supabase = await createClient();`);
        check(/^const user = await requireUser\(supabase\);$/.test(st[1]?.getText(sf) || ""), `   stmt 2: const user = await requireUser(supabase);  (line ${st[1] ? line(sf, st[1]) : "?"})`);
        check(/^if \(!user\) return \{ ok: false, error: SESSION_EXPIRED \};$/.test(st[2]?.getText(sf) || ""), `   stmt 3: if (!user) return { ok: false, error: SESSION_EXPIRED };`);
        // Nothing before the check touches data, storage or caller input.
        let firstData = null, firstInput = null;
        walk(fn.body, (n) => {
            if (ts.isPropertyAccessExpression(n)) {
                const nm = n.name.text;
                if ((nm === "from" || nm === "storage") && n.expression.getText(sf).startsWith("supabase")) {
                    const l = line(sf, n); if (firstData === null || l < firstData) firstData = l;
                }
                if (nm === "get" && n.expression.getText(sf) === "formData") {
                    const l = line(sf, n); if (firstInput === null || l < firstInput) firstInput = l;
                }
            }
        });
        const checkLine = line(sf, st[1]);
        check(firstData !== null && checkLine < firstData, `   getUser() line ${checkLine} < first .from/.storage line ${firstData}`);
        check(firstInput === null || checkLine < firstInput, `   getUser() precedes first formData.get (line ${firstInput ?? "n/a"})`);
        // Every return statement returns { ok: true|false, ... } (ok:false carries error).
        const returns = [];
        walk(fn.body, (n) => { if (ts.isReturnStatement(n)) returns.push(n); }, { intoFunctions: false });
        const badReturns = returns.filter((r) => {
            const e = r.expression;
            if (!e || !ts.isObjectLiteralExpression(e)) return true;
            const ok = e.properties.find((p) => p.name?.getText(sf) === "ok");
            if (!ok || !ts.isPropertyAssignment(ok)) return true;
            const v = ok.initializer.kind;
            if (v === ts.SyntaxKind.FalseKeyword) return !e.properties.some((p) => p.name?.getText(sf) === "error");
            return v !== ts.SyntaxKind.TrueKeyword;
        });
        check(returns.length > 0 && badReturns.length === 0, `   all ${returns.length} return statements are {ok:true|false[, error]} literals`);
        const okTrue = returns.filter((r) => /ok: true/.test(r.getText(sf)));
        check(okTrue.length === 1 && okTrue[0] === returns[returns.length - 1] && st[st.length - 1] === okTrue[0], `   exactly one ok:true, and it is the last statement`);
        if (name === "uploadFile") check(/^return \{ ok: true, url: urlData\.publicUrl \};$/.test(okTrue[0]?.getText(sf) || ""), `   uploadFile returns its public URL inside the ok branch`);
        if (/^(update|delete)/.test(name)) {
            const txt = fn.body.getText(sf);
            check(/\.eq\("id", id\)\s*\.select\("id"\)\s*\.maybeSingle\(\)/.test(txt), `   zero-row guard: .eq("id", id).select("id").maybeSingle()`);
            check(/if \(!data\) return \{ ok: false, error: (REPORT|LEADER|JOB)_NOT_FOUND \};/.test(txt), `   if (!data) return { ok: false, error: *_NOT_FOUND }`);
        }
    }
}

// ------------------------------------------------------------------ clients
log("");
log("== CLIENTS: /cso's four post-/ui-ux rules ==");
let totalSites = 0, totalCalls = 0;
for (const rel of CLIENTS) {
    const sf = parse(rel);
    log(`-- ${rel}`);
    // Rule 3: no new Server Action import (compare with HEAD).
    const importsOf = (s) => s.statements.filter(ts.isImportDeclaration)
        .filter((d) => /^["']@\/app\/actions\//.test(d.moduleSpecifier.getText(s)))
        .map((d) => d.getText(s).replace(/\s+/g, " ")).sort();
    const head = parse(rel, execFileSync("git", ["-C", REPO, "show", `HEAD:${rel}`], { encoding: "utf8" }));
    const now = importsOf(sf), before = importsOf(head);
    check(JSON.stringify(now) === JSON.stringify(before), `rule 3: action imports identical to HEAD: ${now.join(" | ")}`);

    // Rule 1: every call to the ten sits inside a try block, awaited, bound to
    // `result`, whose try block branches on result.ok.
    const sites = new Map();
    walk(sf, (n) => {
        if (!ts.isCallExpression(n) || !ts.isIdentifier(n.expression) || !TEN.includes(n.expression.text)) return;
        totalCalls++;
        // climb to the nearest enclosing try block within the same function
        let p = n, inTry = null, inCatch = false;
        while (p && !isFnBoundary(p)) {
            if (p.parent && ts.isTryStatement(p.parent) && p.parent.tryBlock === p) { inTry = p.parent; break; }
            if (ts.isCatchClause(p)) inCatch = true;
            p = p.parent;
        }
        const awaited = ts.isAwaitExpression(n.parent);
        let decl = n.parent; while (decl && !ts.isVariableDeclaration(decl) && !ts.isStatement(decl)) decl = decl.parent;
        const bound = decl && ts.isVariableDeclaration(decl) && decl.name.getText(sf) === "result";
        const tryText = inTry ? inTry.tryBlock.getText(sf) : "";
        const branches = /if \(!?result\.ok\)/.test(tryText);
        const key = line(sf, n);
        sites.set(key, (sites.get(key) || []).concat(n.expression.text));
        check(!!inTry && !inCatch && awaited && bound && branches,
            `rule 1: ${n.expression.text}() at line ${key}: inside try=${!!inTry}, awaited=${awaited}, bound to result=${bound}, branches on .ok=${branches}`);
    });
    totalSites += sites.size;
    log(`  call sites in this file: ${[...sites].map(([l, f]) => `${l}:${f.join("/")}`).join(", ")}`);

    // Rule 1 (cont.): reload only on success. Every window.location.reload()
    // is in a try block (never a catch), after an `if (!result.ok) { ...; return; }`
    // in the same block.
    walk(sf, (n) => {
        if (!ts.isCallExpression(n) || n.expression.getText(sf) !== "window.location.reload") return;
        let stmt = n; while (!ts.isStatement(stmt)) stmt = stmt.parent;
        const block = stmt.parent;
        let p = n, inCatch = false, inTry = false;
        while (p && !isFnBoundary(p)) { if (ts.isCatchClause(p)) inCatch = true; if (p.parent && ts.isTryStatement(p.parent) && p.parent.tryBlock === p) inTry = true; p = p.parent; }
        const idx = block.statements ? block.statements.indexOf(stmt) : -1;
        const guard = idx > 0 && block.statements.slice(0, idx).some((s) => ts.isIfStatement(s) && s.expression.getText(sf) === "!result.ok" && /return;?\s*\}?$/.test(s.thenStatement.getText(sf).trim()));
        check(inTry && !inCatch && guard, `rule 1: reload() at line ${line(sf, n)}: in try=${inTry}, in catch=${inCatch}, preceded by 'if (!result.ok) {... return; }'=${guard}`);
    });
    // No catch clause reloads, closes the modal, or rethrows.
    walk(sf, (n) => {
        if (!ts.isCatchClause(n)) return;
        const t = n.block.getText(sf);
        check(!/reload\(|setModal\(null\)|throw /.test(t), `catch at line ${line(sf, n)} never reloads, closes the modal or rethrows: ${t.replace(/\s+/g, " ")}`);
    });

    // Rule 2: error text renders only as a JSX text child of <p role="alert">.
    const ERR = /^(saveError|uploadError|deleteError\.message|leaderErrors\[leader\.id\]|addLeaderError|error)$/;
    let errRenders = 0;
    walk(sf, (n) => {
        if (!ts.isJsxExpression(n) || !n.expression) return;
        const e = n.expression.getText(sf);
        if (!ERR.test(e)) return;
        if (ts.isJsxAttribute(n.parent)) {
            // The only attribute use allowed is SettingsHeader's error={error} prop (T-012, unchanged).
            const ok = e === "error" && n.parent.name.getText(sf) === "error" && /^<SettingsHeader/.test(n.parent.parent.parent.getText(sf));
            check(ok, `rule 2: {${e}} used as attribute ${n.parent.name.getText(sf)} at line ${line(sf, n)}`);
            return;
        }
        errRenders++;
        const el = n.parent; // JsxElement
        const open = ts.isJsxElement(el) ? el.openingElement : null;
        const tag = open?.tagName.getText(sf);
        const role = open?.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "role");
        check(tag === "p" && role?.initializer?.getText(sf) === '"alert"', `rule 2: {${e}} at line ${line(sf, n)} is a text child of <${tag} role=${role?.initializer?.getText(sf)}>`);
    });
    log(`  error render sites: ${errRenders}`);

    // Rule 4: no render sink.
    const sinks = [];
    walk(sf, (n) => {
        if (ts.isJsxAttribute(n)) {
            const a = n.name.getText(sf);
            if (a === "dangerouslySetInnerHTML" || a.toLowerCase() === "srcdoc") sinks.push(`${a} @${line(sf, n)}`);
            if ((a === "href" || a === "src" || a === "action" || a === "formAction") && n.initializer && !ts.isStringLiteral(n.initializer)) sinks.push(`${a}={...} @${line(sf, n)}`);
        }
        if (ts.isPropertyAccessExpression(n) && /^(innerHTML|outerHTML|insertAdjacentHTML|write|writeln|open)$/.test(n.name.text)) {
            const obj = n.expression.getText(sf);
            if (n.name.text === "innerHTML" || n.name.text === "outerHTML" || n.name.text === "insertAdjacentHTML" || /document$/.test(obj) || /window$/.test(obj)) sinks.push(`${n.getText(sf)} @${line(sf, n)}`);
        }
        if (ts.isIdentifier(n) && n.text === "eval" && ts.isCallExpression(n.parent)) sinks.push(`eval @${line(sf, n)}`);
        if (ts.isNewExpression(n) && n.expression.getText(sf) === "Function") sinks.push(`new Function @${line(sf, n)}`);
        if (ts.isBinaryExpression(n) && n.operatorToken.kind === ts.SyntaxKind.EqualsToken && /(^|\.)location(\.href)?$/.test(n.left.getText(sf))) sinks.push(`location assignment @${line(sf, n)}`);
    });
    check(sinks.length === 0, `rule 4: no render sink (${sinks.length ? sinks.join(", ") : "none found"})`);
    // No debug statements.
    const dbg = [];
    walk(sf, (n) => {
        if (n.kind === ts.SyntaxKind.DebuggerStatement) dbg.push(`debugger @${line(sf, n)}`);
        if (ts.isPropertyAccessExpression(n) && n.expression.getText(sf) === "console") dbg.push(`${n.getText(sf)} @${line(sf, n)}`);
    });
    check(dbg.length === 0, `no console.* / debugger (${dbg.length ? dbg.join(", ") : "none"})`);
}
log("");
check(totalSites === 8 && totalCalls === 10, `call-site census: ${totalSites} sites, ${totalCalls} calls (expected 8 sites, 10 calls)`);
log("");
log(failures === 0 ? "RESULT: ALL INVARIANTS HOLD" : `RESULT: ${failures} FAILURE(S)`);
console.log(out.join("\n"));
process.exit(failures === 0 ? 0 : 1);
