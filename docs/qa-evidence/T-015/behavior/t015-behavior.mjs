// T-015 /qa live, flow "behavior": failure paths never reload, modals keep
// their input, every call site shows the right text.
//
// Drives the REAL ReportsClient / CareersClient / WhoWeAreClient, as built by
// /ui-ux's harness (docs/qa-evidence/T-015/ui-ux/harness/build.mjs "after"),
// on React 19.2.4's production build in headless Chrome over raw CDP. The
// "use server" modules are /ui-ux's controllable stubs: nothing reaches a
// server, Supabase, or the network (all http/https URLs are blocked and any
// attempt is recorded). Pages load from file://.
//
// In-page, the stub exports are wrapped (the transpiled clients look them up
// at call time) so each scenario can assert exactly what each action was
// sent, and uploadFile returns a distinct URL per call.
//
// usage: node t015-behavior.mjs <harness-dir containing after/*.html> <out-dir> [variant]
//   variant defaults to "after" (the working tree). The negative control
//   runs "before", built from the pre-T-015 HEAD clients, and must FAIL.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const HARNESS = process.argv[2];
const OUT = process.argv[3];
const VARIANT = process.argv[4] || "after";
if (!HARNESS || !OUT) throw new Error("usage: node t015-behavior.mjs <harness-dir> <out-dir>");
fs.mkdirSync(OUT, { recursive: true });
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TMP = fs.mkdtempSync(path.join(process.env.QA_TMP || os.tmpdir(), "t015-behavior-"));
const PDF1 = path.join(TMP, "qa-report-1.pdf");
const PDF2 = path.join(TMP, "qa-report-2.pdf");
fs.writeFileSync(PDF1, "%PDF-1.4\n% qa file one\n%%EOF\n");
fs.writeFileSync(PDF2, "%PDF-1.4\n% qa file two\n%%EOF\n");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Exact strings, copied from the source under test.
const GENERIC = "Something went wrong saving these changes. Check your connection and try again.";
const DELETE_REPORT = "Couldn't delete this report. Check your connection and try again.";
const DELETE_JOB = "Couldn't delete this job posting. Check your connection and try again.";
const UPLOAD = "Couldn't upload this PDF. Files must be under 1 MB. If this one is, check your connection and try again.";
const ADD_LEADER = "Couldn't add a leader. Check your connection and try again.";
const REMOVE_LEADER = "Couldn't remove this leader. Check your connection and try again.";
const SESSION = "Your session expired. Sign in again and retry.";
const NF_REPORT = "Report not found. Reload the page to see the current list.";
const NF_JOB = "Job posting not found. Reload the page to see the current list.";
const NF_LEADER = "Leader not found. Reload the page to see the current list.";
const STORAGE = 'new row violates row-level security policy';

// ------------------------------------------------------------------ CDP
const profile = path.join(TMP, "chrome-profile");
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", "--disable-background-networking", "--disable-sync",
    "--disable-component-update", "--force-color-profile=srgb", "--allow-file-access-from-files", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] });
const wsUrl = await new Promise((resolve, reject) => {
    let buf = "";
    proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]); });
    setTimeout(() => reject(new Error("chrome did not start")), 20000);
});
const ws = new WebSocket(wsUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let mid = 0; const pending = new Map(); const listeners = new Set();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); } else listeners.forEach((l) => l(m)); };
const send = (method, params = {}, sessionId) => { const id = ++mid; ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) })); return new Promise((resolve, reject) => pending.set(id, { resolve, reject })); };

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const s = (m, p) => send(m, p, sessionId);
const state = { navs: 0, httpAttempts: [], errors: [] };
listeners.add((m) => {
    if (m.sessionId !== sessionId) return;
    const p = m.params;
    if (m.method === "Page.frameNavigated" && !p.frame.parentId) state.navs++;
    if (m.method === "Network.requestWillBeSent" && /^https?:/.test(p.request.url)) state.httpAttempts.push(p.request.url);
    if (m.method === "Runtime.exceptionThrown") state.errors.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text);
    if (m.method === "Runtime.consoleAPICalled" && p.type === "error") state.errors.push("console.error: " + p.args.map((a) => a.value ?? a.description).join(" "));
    // T-015 removed alert(); any native dialog (confirm() is stubbed by the
    // harness) is recorded as a page error and dismissed so the run can't hang.
    if (m.method === "Page.javascriptDialogOpening") {
        state.errors.push(`native ${p.type}() dialog: ${p.message}`);
        s("Page.handleJavaScriptDialog", { accept: true }).catch(() => {});
    }
});
await s("Runtime.enable"); await s("Page.enable"); await s("Network.enable");
await s("Network.setBlockedURLs", { urls: ["http://*", "https://*"] });
await s("Emulation.setDeviceMetricsOverride", { width: 1366, height: 800, deviceScaleFactor: 1, mobile: false });

async function ev(expression) {
    const r = await s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error("eval failed: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + "\n" + expression.slice(0, 200));
    return r.result.value;
}
async function waitFor(expr, ms = 4000) {
    const t = Date.now();
    while (Date.now() - t < ms) { if (await ev(expr).catch(() => false)) return true; await sleep(25); }
    throw new Error("timeout waiting for: " + expr);
}
async function setFile(selector, file) {
    const { result } = await s("Runtime.evaluate", { expression: `document.querySelector(${JSON.stringify(selector)})` });
    await s("DOM.setFileInputFiles", { files: [file], objectId: result.objectId });
}
async function shot(file, clipExpr) {
    const params = { format: "png" };
    if (clipExpr) {
        // Bring the element into the viewport first: a clip outside it
        // captures nothing (the leader cards and Add Leader sit below the fold).
        await ev(`(function(){ var e=${clipExpr}; if(e) e.scrollIntoView({ block: "center" }); return true; })()`);
        await sleep(120);
        const c = await ev(`(function(){ var e=${clipExpr}; if(!e) return null; var r=e.getBoundingClientRect(); return { x: Math.max(0,r.x-8)+scrollX, y: Math.max(0,r.y-8)+scrollY, width: Math.min(innerWidth, r.width+16), height: Math.min(innerHeight, r.height+16), scale: 1 }; })()`);
        if (c) params.clip = c;
    }
    const r = await s("Page.captureScreenshot", params);
    fs.writeFileSync(path.join(OUT, file), Buffer.from(r.data, "base64"));
    return file;
}

// Load a harness page, then wrap the stubbed action exports.
const INSTRUMENT = String.raw`(function(){
  var m = __require("@/app/actions/settings-actions"), j = __require("@/app/actions/jobs-actions");
  window.__args = []; window.__up = 0; window.__qaMarker = "t015-" + Math.random();
  function fdPick(fd){ return fd && fd.get ? { title: fd.get("title"), file_url: fd.get("file_url"), name: fd.get("name"), is_active: fd.get("is_active") } : {}; }
  function wrap(mod, name, pick){ var o = mod[name]; mod[name] = function(){ window.__args.push(Object.assign({ fn: name }, pick.apply(null, arguments))); return o.apply(this, arguments); }; }
  wrap(m, "createReport", function(fd){ return fdPick(fd); });
  wrap(m, "updateReport", function(id, fd){ return Object.assign({ id: id }, fdPick(fd)); });
  wrap(m, "deleteReport", function(id){ return { id: id }; });
  wrap(m, "createLeader", function(fd){ return fdPick(fd); });
  wrap(m, "updateLeader", function(id, fd){ return Object.assign({ id: id }, fdPick(fd)); });
  wrap(m, "deleteLeader", function(id){ return { id: id }; });
  wrap(j, "createJob", function(fd){ return fdPick(fd); });
  wrap(j, "updateJob", function(id, fd){ return Object.assign({ id: id }, fdPick(fd)); });
  wrap(j, "deleteJob", function(id){ return { id: id }; });
  var ou = m.uploadFile;
  m.uploadFile = function(fd, bucket){ var n = ++window.__up; var f = fd.get("file"); window.__args.push({ fn: "uploadFile", n: n, bucket: bucket, file: f && f.name });
    return ou.apply(this, arguments).then(function(r){ return r && r.ok ? { ok: true, url: "https://example.invalid/upload-" + n + ".pdf" } : r; }); };
  return window.__qaMarker;
})()`;
async function open(page) {
    const before = state.navs;
    await s("Page.navigate", { url: "file://" + path.join(HARNESS, VARIANT, `${page}.html`) });
    await waitFor(`document.readyState === "complete" && !!document.querySelector("main table, main h1, main h2")`, 8000);
    const marker = await ev(INSTRUMENT);
    return { marker, navsAtOpen: state.navs, navsBefore: before };
}
const setVal = (sel, v) => `(function(){ var i=${sel}; var d=Object.getOwnPropertyDescriptor(i.tagName==="TEXTAREA"?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,"value").set; d.call(i, ${JSON.stringify(v)}); i.dispatchEvent(new Event("input",{bubbles:true})); return true; })()`;
const ROWS = `[].filter.call(document.querySelectorAll("tbody tr"),function(tr){return tr.querySelectorAll("button").length===2})`;
const SAVE = `(function(){var bs=document.querySelectorAll(".fixed button"); return bs[bs.length-1];})()`;
const TITLE = `document.querySelector(".fixed input[type=text]")`;
const PANEL = `(document.querySelector(".fixed") && document.querySelector(".fixed").firstElementChild)`;
const LEAD = `[].find.call(document.querySelectorAll("h2"), function(h){ return h.textContent.trim()==="Leadership Team"; }).parentElement`;
const CARDS = `${LEAD}.querySelectorAll("div.rounded-xl")`;
const ADD = `[].find.call(${LEAD}.querySelectorAll("button"), function(b){ return /Add Leader/.test(b.textContent); })`;
const alerts = () => ev(`[].map.call(document.querySelectorAll('[role="alert"]'), function(a){ return a.textContent.trim(); })`);
const reloadedSince = async (o) => state.navs > o.navsAtOpen || (await ev(`window.__qaMarker`).catch(() => undefined)) !== o.marker;
const settle = () => sleep(450); // stub delay is 150 ms; leave room for React to commit

const results = [];
async function scenario(name, fn) {
    const errBefore = state.errors.length;
    const r = { name };
    try { Object.assign(r, await fn()); } catch (e) { r.pass = false; r.error = String(e.message || e); }
    r.pageErrors = state.errors.slice(errBefore);
    if (r.pageErrors.length) r.pass = false;
    results.push(r);
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${name}${r.error ? "  ERROR " + r.error.split("\n")[0] : ""}`);
}
const reset = () => ev(`__ctl.mode = {}; __ctl.hold = false; __ctl.calls.length = 0; __ctl.confirms = 0; true`);

// ------------------------------------------------------------ Reports
async function reportsSave({ edit, mode, fn, expect, typed, file }) {
    const o = await open("reports"); await reset();
    if (edit) await ev(`${ROWS}[0].querySelectorAll("button")[0].click(); true`); else await ev(`document.querySelector("header button").click(); true`);
    await waitFor(`!!${TITLE}`);
    await ev(setVal(TITLE, typed));
    await sleep(60);
    await ev(`__ctl.mode.${fn} = ${JSON.stringify(mode)}; ${SAVE}.click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), modalOpen: await ev(`!!document.querySelector(".fixed")`),
        titleValue: await ev(`${TITLE} && ${TITLE}.value`), sent: await ev(`__args.filter(function(a){return a.fn===${JSON.stringify(fn)}})`), reloaded,
        saveEnabled: await ev(`!${SAVE}.disabled`) };
    out.shot = await shot(file, PANEL);
    out.pass = !reloaded && out.modalOpen && out.titleValue === typed && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts)
        && out.sent.length === 1 && out.sent[0].title === typed && out.saveEnabled;
    return out;
}
await scenario("reports: update -> {ok:false} not found", () => reportsSave({ edit: true, fn: "updateReport", mode: "fail:" + NF_REPORT, expect: NF_REPORT, typed: "QA-T015 typed title (edit)", file: "01-reports-update-notfound.png" }));
await scenario("reports: update -> throw", () => reportsSave({ edit: true, fn: "updateReport", mode: "throw", expect: GENERIC, typed: "QA-T015 typed title (edit, throw)", file: "02-reports-update-throw.png" }));
await scenario("reports: create -> {ok:false} session expired", () => reportsSave({ edit: false, fn: "createReport", mode: "fail:" + SESSION, expect: SESSION, typed: "QA-T015 typed title (new)", file: "03-reports-create-session.png" }));
await scenario("reports: update -> ok (reload, as before)", () => reportsSave({ edit: true, fn: "updateReport", mode: "ok", expect: "reload", typed: "QA-T015 ok" }));

async function reportsUpload({ edit, mode, expect, file }) {
    const o = await open("reports"); await reset();
    if (edit) await ev(`${ROWS}[0].querySelectorAll("button")[0].click(); true`); else await ev(`document.querySelector("header button").click(); true`);
    await waitFor(`!!document.querySelector("input[type=file]")`);
    const typed = "QA-T015 upload title";
    await ev(setVal(TITLE, typed));
    await sleep(60);
    const pillBefore = await ev(`document.querySelector("input[type=file]").nextElementSibling.textContent.trim()`);
    await ev(`__ctl.mode.uploadFile = ${JSON.stringify(mode)}; true`);
    await setFile("input[type=file]", PDF1);
    await settle();
    const out = { expectedAlerts: [expect], alerts: await alerts(), modalOpen: await ev(`!!document.querySelector(".fixed")`), titleValue: await ev(`${TITLE}.value`),
        fileInputCleared: await ev(`document.querySelector("input[type=file]").value === ""`), pillBefore,
        pillAfter: await ev(`document.querySelector("input[type=file]").nextElementSibling.textContent.trim()`),
        saveEnabled: await ev(`!${SAVE}.disabled`), sent: await ev(`__args.filter(function(a){return a.fn==="uploadFile"})`), reloaded: await reloadedSince(o) };
    out.shot = await shot(file, PANEL);
    out.pass = !out.reloaded && out.modalOpen && out.titleValue === typed && out.fileInputCleared && out.saveEnabled && out.pillAfter === out.pillBefore
        && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts) && out.sent.length === 1 && out.sent[0].bucket === "reports";
    return out;
}
await scenario("reports: upload -> {ok:false} real reason shown", () => reportsUpload({ edit: false, mode: "fail:" + STORAGE, expect: STORAGE, file: "04-reports-upload-fail.png" }));
await scenario("reports: upload -> throw (e.g. >1 MB body) shows UPLOAD_ERROR", () => reportsUpload({ edit: false, mode: "throw", expect: UPLOAD, file: "05-reports-upload-throw.png" }));
await scenario("reports: failed Replace keeps the attached file", () => reportsUpload({ edit: true, mode: "fail:" + STORAGE, expect: STORAGE, file: "06-reports-replace-fail-keeps-file.png" }));

await scenario("reports: upload ok keeps text typed during the upload", async () => {
    const o = await open("reports"); await reset();
    await ev(`document.querySelector("header button").click(); true`);
    await waitFor(`!!document.querySelector("input[type=file]")`);
    await ev(`__ctl.hold = true; true`);
    await setFile("input[type=file]", PDF1);
    await sleep(120);
    await ev(setVal(TITLE, "typed while the PDF uploads"));
    await sleep(60);
    await ev(`__ctl.hold = false; __ctl.release(); true`);
    await settle();
    const out = { titleValue: await ev(`${TITLE}.value`), pill: await ev(`document.querySelector("input[type=file]").nextElementSibling.textContent.trim()`), alerts: await alerts(), reloaded: await reloadedSince(o) };
    await ev(`${SAVE}.click(); true`); // hold is off: resolves ok -> reload; capture what was sent first
    await sleep(60);
    out.sentOnSave = await ev(`(__args||[]).filter(function(a){return a.fn==="createReport"})`).catch(() => "page reloaded before read");
    out.pass = out.titleValue === "typed while the PDF uploads" && /qa-report-1\.pdf/.test(out.pill) && out.alerts.length === 0 && !out.reloaded;
    return out;
});

async function reportsDelete({ mode, expect, file }) {
    const o = await open("reports"); await reset();
    await ev(`__ctl.mode.deleteReport = ${JSON.stringify(mode)}; ${ROWS}[1].querySelectorAll("button")[1].click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), confirms: await ev(`__ctl.confirms`), reloaded,
        alertUnderFailedRow: await ev(`(function(){ var a=document.querySelector('[role="alert"]'); if(!a) return false; var tr=a.closest("tr"); return tr.previousElementSibling === ${ROWS}[1]; })()`),
        sent: await ev(`__args.filter(function(a){return a.fn==="deleteReport"})`) };
    out.shot = await shot(file, `document.querySelector("table").parentElement`);
    out.pass = !reloaded && out.confirms === 1 && out.alertUnderFailedRow && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts) && out.sent.length === 1 && out.sent[0].id === "r2";
    return out;
}
await scenario("reports: delete -> {ok:false} not found", () => reportsDelete({ mode: "fail:" + NF_REPORT, expect: NF_REPORT, file: "07-reports-delete-notfound.png" }));
await scenario("reports: delete -> throw", () => reportsDelete({ mode: "throw", expect: DELETE_REPORT, file: "08-reports-delete-throw.png" }));
await scenario("reports: delete -> ok (reload, as before)", () => reportsDelete({ mode: "ok", expect: "reload" }));

await scenario("reports: modal can't be dismissed mid-save; failure then shows in it", async () => {
    const o = await open("reports"); await reset();
    await ev(`${ROWS}[0].querySelectorAll("button")[0].click(); true`);
    await waitFor(`!!${TITLE}`);
    await ev(setVal(TITLE, "QA-T015 in flight"));
    await sleep(60);
    await ev(`__ctl.mode.updateReport = ${JSON.stringify("fail:" + SESSION)}; __ctl.hold = true; ${SAVE}.click(); true`);
    await sleep(120);
    await ev(`document.querySelector(".fixed").click(); true`); // backdrop
    await ev(`(function(){ var x=document.querySelector('.fixed button[aria-label="Close"]'); x && x.click(); return true; })()`);
    const openWhileHeld = await ev(`!!document.querySelector(".fixed")`);
    const saveBusy = await ev(`${SAVE}.disabled && /Saving/.test(${SAVE}.textContent)`);
    await ev(`__ctl.hold = false; __ctl.release(); true`);
    await settle();
    const out = { openWhileHeld, saveBusy, alerts: await alerts(), modalOpen: await ev(`!!document.querySelector(".fixed")`), titleValue: await ev(`${TITLE}.value`), reloaded: await reloadedSince(o) };
    out.pass = openWhileHeld && saveBusy && out.modalOpen && out.titleValue === "QA-T015 in flight" && JSON.stringify(out.alerts) === JSON.stringify([SESSION]) && !out.reloaded;
    return out;
});

// INFO-3 demonstration (pre-existing; expected to show the race, not a pass/fail of T-015).
await scenario("INFO-3 demo: a second pick during an upload, Save in the gap sends the FIRST file", async () => {
    const o = await open("reports"); await reset();
    await ev(`${ROWS}[0].querySelectorAll("button")[0].click(); true`);
    await waitFor(`!!document.querySelector("input[type=file]")`);
    await ev(`__ctl.hold = true; true`);
    await setFile("input[type=file]", PDF1);            // upload #1, held
    await sleep(100);
    await setFile("input[type=file]", PDF2);            // Replace stays enabled: upload #2, held
    await sleep(100);
    const inFlight = await ev(`__ctl.held.length`);
    await ev(`__ctl.held.shift()(); true`);             // upload #1 completes; #2 still in flight
    await settle();
    const gap = { saveEnabledWhileSecondUploadInFlight: await ev(`!${SAVE}.disabled`), pill: await ev(`document.querySelector("input[type=file]").nextElementSibling.textContent.trim()`) };
    await ev(`${SAVE}.click(); true`);                   // held too
    await sleep(80);
    const sent = await ev(`__args.filter(function(a){return a.fn==="updateReport"})`);
    await ev(`__ctl.hold = false; __ctl.release(); true`);
    await sleep(300);
    return { inFlightUploads: inFlight, gap, sentOnSave: sent, demonstrated: gap.saveEnabledWhileSecondUploadInFlight && sent.length === 1 && sent[0].file_url === "https://example.invalid/upload-1.pdf", pass: true, note: "documents INFO-3; pass=true means the demo ran" };
});

// ------------------------------------------------------------ Careers
async function careersSave({ edit, mode, fn, expect, typed, file }) {
    const o = await open("careers"); await reset();
    if (edit) await ev(`${ROWS}[0].querySelectorAll("button")[0].click(); true`); else await ev(`document.querySelector("header button").click(); true`);
    await waitFor(`!!${TITLE}`);
    await ev(setVal(TITLE, typed));
    await ev(setVal(`document.querySelectorAll(".fixed textarea")[0]`, "QA-T015 responsibilities line"));
    await sleep(60);
    await ev(`(function(){ var p=document.querySelector(".fixed").firstElementChild; p.scrollTop=p.scrollHeight; })(); __ctl.mode.${fn} = ${JSON.stringify(mode)}; ${SAVE}.click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), modalOpen: await ev(`!!document.querySelector(".fixed")`), titleValue: await ev(`${TITLE}.value`),
        textareaValue: await ev(`document.querySelectorAll(".fixed textarea")[0].value`), sent: await ev(`__args.filter(function(a){return a.fn===${JSON.stringify(fn)}})`), reloaded,
        alertVisible: await ev(`(function(){ var a=document.querySelector('[role="alert"]'); if(!a) return false; var r=a.getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()`) };
    out.shot = await shot(file, PANEL);
    out.pass = !reloaded && out.modalOpen && out.titleValue === typed && out.textareaValue === "QA-T015 responsibilities line" && out.alertVisible
        && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts) && out.sent.length === 1 && out.sent[0].title === typed;
    return out;
}
await scenario("careers: update -> {ok:false} not found", () => careersSave({ edit: true, fn: "updateJob", mode: "fail:" + NF_JOB, expect: NF_JOB, typed: "QA-T015 job (edit)", file: "09-careers-update-notfound.png" }));
await scenario("careers: create -> throw", () => careersSave({ edit: false, fn: "createJob", mode: "throw", expect: GENERIC, typed: "QA-T015 job (new)", file: "10-careers-create-throw.png" }));
await scenario("careers: update -> ok (reload, as before)", () => careersSave({ edit: true, fn: "updateJob", mode: "ok", expect: "reload", typed: "QA-T015 ok" }));

async function careersDelete({ mode, expect, file }) {
    const o = await open("careers"); await reset();
    await ev(`__ctl.mode.deleteJob = ${JSON.stringify(mode)}; ${ROWS}[1].querySelectorAll("button")[1].click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), confirms: await ev(`__ctl.confirms`), reloaded,
        alertUnderFailedRow: await ev(`(function(){ var a=document.querySelector('[role="alert"]'); if(!a) return false; return a.closest("tr").previousElementSibling === ${ROWS}[1]; })()`),
        sent: await ev(`__args.filter(function(a){return a.fn==="deleteJob"})`) };
    out.shot = await shot(file, `document.querySelector("table").parentElement`);
    out.pass = !reloaded && out.confirms === 1 && out.alertUnderFailedRow && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts) && out.sent.length === 1 && out.sent[0].id === "j2";
    return out;
}
await scenario("careers: delete -> {ok:false} session expired", () => careersDelete({ mode: "fail:" + SESSION, expect: SESSION, file: "11-careers-delete-session.png" }));
await scenario("careers: delete -> throw", () => careersDelete({ mode: "throw", expect: DELETE_JOB, file: "12-careers-delete-throw.png" }));
await scenario("careers: delete -> ok (reload, as before)", () => careersDelete({ mode: "ok", expect: "reload" }));

// ------------------------------------------------------------ Leaders
async function leaderSave({ mode, expect, file }) {
    const o = await open("whoweare"); await reset();
    const typed = "QA-T015 Leader Name";
    await ev(`${CARDS}[0].querySelector("input").focus(); true`);
    await ev(setVal(`${CARDS}[0].querySelector("input")`, typed));
    await sleep(60);
    await ev(`__ctl.mode.updateLeader = ${JSON.stringify(mode)}; ${CARDS}[0].querySelector("input").blur(); true`);
    await settle();
    const out = { expectedAlerts: expect ? [expect] : [], alerts: await alerts(), cardAlert: await ev(`(function(){ var a=${CARDS}[0].querySelector('[role="alert"]'); return a ? a.textContent.trim() : null; })()`),
        inputValue: await ev(`${CARDS}[0].querySelector("input").value`), sent: await ev(`__args.filter(function(a){return a.fn==="updateLeader"})`), reloaded: await reloadedSince(o) };
    if (file) out.shot = await shot(file, `${CARDS}[0]`);
    out.pass = !out.reloaded && out.inputValue === typed && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts)
        && (expect ? out.cardAlert === expect : out.cardAlert === null) && out.sent.length === 1 && out.sent[0].name === typed;
    return out;
}
await scenario("leaders: blur-save -> {ok:false} not found (saveLeader now signals)", () => leaderSave({ mode: "fail:" + NF_LEADER, expect: NF_LEADER, file: "13-leaders-save-notfound.png" }));
await scenario("leaders: blur-save -> throw", () => leaderSave({ mode: "throw", expect: GENERIC, file: "14-leaders-save-throw.png" }));
await scenario("leaders: blur-save -> ok stays silent, no reload (as before)", () => leaderSave({ mode: "ok", expect: null }));

await scenario("leaders: a failed save's alert clears when a retry succeeds", async () => {
    const o = await open("whoweare"); await reset();
    const inp = `${CARDS}[0].querySelector("input")`;
    await ev(`${inp}.focus(); true`); await ev(setVal(inp, "QA-T015 retry")); await sleep(60);
    await ev(`__ctl.mode.updateLeader = ${JSON.stringify("fail:" + SESSION)}; ${inp}.blur(); true`); await settle();
    const first = await alerts();
    await ev(`__ctl.mode.updateLeader = "ok"; ${inp}.focus(); true`); await sleep(40); await ev(`${inp}.blur(); true`); await settle();
    const second = await alerts();
    return { first, second, reloaded: await reloadedSince(o), pass: JSON.stringify(first) === JSON.stringify([SESSION]) && second.length === 0 && !(await reloadedSince(o)) };
});

async function leaderAdd({ mode, expect, file }) {
    const o = await open("whoweare"); await reset();
    await ev(`__ctl.mode.createLeader = ${JSON.stringify(mode)}; ${ADD}.click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), reloaded,
        alertBesideAdd: await ev(`(function(){ var a=${ADD}.parentElement.querySelector('[role="alert"]'); return a ? a.textContent.trim() : null; })()`) };
    out.shot = await shot(file, `${ADD}.parentElement`);
    out.pass = !reloaded && out.alertBesideAdd === expect && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts);
    return out;
}
await scenario("leaders: add -> {ok:false} session expired", () => leaderAdd({ mode: "fail:" + SESSION, expect: SESSION, file: "15-leaders-add-session.png" }));
await scenario("leaders: add -> throw", () => leaderAdd({ mode: "throw", expect: ADD_LEADER, file: "16-leaders-add-throw.png" }));
await scenario("leaders: add -> ok (reload, as before)", () => leaderAdd({ mode: "ok", expect: "reload" }));

async function leaderRemove({ mode, expect, file }) {
    const o = await open("whoweare"); await reset();
    const typed = "QA-T015 unsaved edit in card 2";
    await ev(setVal(`${CARDS}[1].querySelectorAll("input")[1]`, typed)); // title field, no blur
    await sleep(60);
    await ev(`__ctl.mode.deleteLeader = ${JSON.stringify(mode)}; [].find.call(${CARDS}[1].querySelectorAll("button"), function(b){ return /^Remove/.test(b.getAttribute("aria-label")||""); }).click(); true`);
    await settle();
    const reloaded = await reloadedSince(o);
    if (expect === "reload") return { pass: reloaded, reloaded, expected: "reload" };
    const out = { expectedAlerts: [expect], alerts: await alerts(), confirms: await ev(`__ctl.confirms`), reloaded,
        cardAlert: await ev(`(function(){ var a=${CARDS}[1].querySelector('[role="alert"]'); return a ? a.textContent.trim() : null; })()`),
        otherFieldKept: await ev(`${CARDS}[1].querySelectorAll("input")[1].value`) === typed };
    out.shot = await shot(file, `${CARDS}[1]`);
    out.pass = !reloaded && out.confirms === 1 && out.cardAlert === expect && out.otherFieldKept && JSON.stringify(out.alerts) === JSON.stringify(out.expectedAlerts);
    return out;
}
await scenario("leaders: remove -> {ok:false} not found", () => leaderRemove({ mode: "fail:" + NF_LEADER, expect: NF_LEADER, file: "17-leaders-remove-notfound.png" }));
await scenario("leaders: remove -> throw", () => leaderRemove({ mode: "throw", expect: REMOVE_LEADER, file: "18-leaders-remove-throw.png" }));
await scenario("leaders: remove -> ok (reload, as before)", () => leaderRemove({ mode: "ok", expect: "reload" }));

// INFO-4 demonstration (conservative; expected to show a stale error, not a pass/fail of T-015).
await scenario("INFO-4 demo: A throws, B succeeds, A's error stays", async () => {
    const o = await open("whoweare"); await reset();
    const inp = `${CARDS}[0].querySelector("input")`;
    await ev(`${inp}.focus(); true`); await ev(setVal(inp, "QA-T015 A")); await sleep(60);
    await ev(`__ctl.hold = true; __ctl.mode.updateLeader = "throw"; ${inp}.blur(); true`);   // save A, held, will throw
    await sleep(60);
    await ev(`${inp}.focus(); true`); await ev(setVal(inp, "QA-T015 B")); await sleep(60);
    await ev(`__ctl.mode.updateLeader = "ok"; ${inp}.blur(); true`);                          // save B, held, will succeed
    await sleep(60);
    await ev(`__ctl.held.shift()(); true`); await sleep(250);                                  // A throws first
    await ev(`__ctl.hold = false; __ctl.release(); true`); await settle();                     // then B succeeds
    const finalAlerts = await alerts();
    return { sent: await ev(`__args.filter(function(a){return a.fn==="updateLeader"}).map(function(a){return a.name})`), finalAlerts, reloaded: await reloadedSince(o),
        demonstrated: JSON.stringify(finalAlerts) === JSON.stringify([GENERIC]), pass: true, note: "documents INFO-4; pass=true means the demo ran" };
});

// ------------------------------------------------------------ wrap up
const summary = { when: new Date().toISOString(), chrome: (await send("Browser.getVersion")).product, react: "19.2.4 production (from node_modules)",
    httpAttemptsBlocked: state.httpAttempts, total: results.length, passed: results.filter((r) => r.pass).length, failed: results.filter((r) => !r.pass).map((r) => r.name) };
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ summary, results }, null, 2));
console.log(`\n${summary.passed}/${summary.total} pass; http(s) attempts: ${state.httpAttempts.length}`);
const exited = new Promise((r) => proc.once("exit", r));
await send("Browser.close").catch(() => {});
await Promise.race([exited, sleep(5000)]);
if (proc.exitCode === null) { proc.kill(); await Promise.race([exited, sleep(3000)]); }
fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
process.exit(summary.failed.length === 0 && state.httpAttempts.length === 0 ? 0 : 1);
