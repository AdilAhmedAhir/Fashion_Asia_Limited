// T-015 /qa live, flow "public-screenshots": headless Chrome over raw CDP
// (Node's built-in WebSocket; no Playwright/Puppeteer, nothing installed).
// Loads each public page from the local production build, anonymously, and
// records: a viewport screenshot at the top and at the section T-015's admin
// page feeds, console errors/warnings, uncaught exceptions, every request with
// its METHOD (any non-GET is flagged), and every failed or >=400 response.
// Read-only: page loads only; no clicks, no typing, no form submission.
//
// usage: node cdp-public.mjs [base-url] [out-dir]
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3001";
const OUT = process.argv[3] || path.dirname(new URL(import.meta.url).pathname);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PAGES = [
    { path: "/sustainability", section: "#reports" },
    { path: "/who-we-are", section: "h2,h3", sectionText: "Leadership" },
    { path: "/career", section: "h2", sectionText: "Open Positions" },
];
const VIEWPORTS = [{ name: "desktop-1440", width: 1440, height: 900, mobile: false }, { name: "mobile-390", width: 390, height: 844, mobile: true }];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Throwaway Chrome profile; set QA_TMP to keep it somewhere specific.
const profile = fs.mkdtempSync(path.join(process.env.QA_TMP || os.tmpdir(), "t015-qa-chrome-"));
const proc = spawn(CHROME, ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run",
    "--no-default-browser-check", "--disable-extensions", "--disable-background-networking", "--disable-sync",
    "--disable-component-update", "--force-color-profile=srgb", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
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

const report = { base: BASE, when: new Date().toISOString(), chrome: (await send("Browser.getVersion")).product, runs: [] };
for (const vp of VIEWPORTS) {
    for (const pg of PAGES) {
        const { targetId } = await send("Target.createTarget", { url: "about:blank" });
        const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
        const s = (m, p) => send(m, p, sessionId);
        const run = { page: pg.path, viewport: vp.name, console: [], exceptions: [], requests: [], nonGet: [], failed: [], httpErrors: [] };
        const reqs = new Map();
        const onMsg = (m) => {
            if (m.sessionId !== sessionId) return;
            const p = m.params;
            if (m.method === "Runtime.consoleAPICalled" && ["error", "warning", "assert"].includes(p.type)) run.console.push(`${p.type}: ${p.args.map((a) => a.value ?? a.description).join(" ")}`);
            if (m.method === "Runtime.exceptionThrown") run.exceptions.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text);
            if (m.method === "Log.entryAdded" && p.entry.level === "error") run.console.push(`log-error: ${p.entry.text} ${p.entry.url || ""}`);
            if (m.method === "Network.requestWillBeSent") { reqs.set(p.requestId, p.request.url); run.requests.push(`${p.request.method} ${p.request.url.slice(0, 160)}`); if (p.request.method !== "GET") run.nonGet.push(`${p.request.method} ${p.request.url}`); }
            if (m.method === "Network.responseReceived" && p.response.status >= 400) run.httpErrors.push(`${p.response.status} ${p.response.url.slice(0, 160)}`);
            if (m.method === "Network.loadingFailed" && !p.canceled) run.failed.push(`${p.errorText} ${(reqs.get(p.requestId) || "").slice(0, 160)}`);
        };
        listeners.add(onMsg);
        await s("Runtime.enable"); await s("Log.enable"); await s("Network.enable"); await s("Page.enable");
        await s("Emulation.setDeviceMetricsOverride", { width: vp.width, height: vp.height, deviceScaleFactor: 1, mobile: vp.mobile });
        const nav = await s("Page.navigate", { url: BASE + pg.path });
        run.navigateError = nav.errorText || null;
        for (let i = 0; i < 300; i++) { const r = await s("Runtime.evaluate", { expression: "document.readyState", returnByValue: true }); if (r.result.value === "complete") break; await sleep(50); }
        await sleep(3500); // Preloader: 1200 ms minimum, 2000 ms safety net (T-017)
        const ev = async (expression) => (await s("Runtime.evaluate", { expression, returnByValue: true })).result.value;
        run.title = await ev("document.title");
        run.errorScreen = await ev(`/Application error|Internal Server Error|could not be found|server-side exception|client-side exception/.test(document.body.innerText)`);
        const slug = pg.path.replace(/\//g, "_").replace(/^_/, "");
        const shot = async (file) => { const r = await s("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(OUT, file), Buffer.from(r.data, "base64")); return file; };
        run.shots = [await shot(`${slug}.${vp.name}.01-top.png`)];
        run.sectionFound = await ev(`(function(){ var els=[].slice.call(document.querySelectorAll(${JSON.stringify(pg.section)})); var t=${JSON.stringify(pg.sectionText || "")}; var el=els.find(function(e){return !t || e.textContent.trim()===t || e.textContent.indexOf(t)===0;}); if(!el) return false; el.scrollIntoView({block:"start"}); window.scrollBy(0,-80); return true; })()`);
        await sleep(2000);
        run.sectionText = await ev(`(function(){ var y=window.scrollY, h=innerHeight; return [].slice.call(document.querySelectorAll("h1,h2,h3,p,a,button")).filter(function(e){var r=e.getBoundingClientRect(); return r.top>=0 && r.bottom<=h && e.offsetParent!==null;}).map(function(e){return e.textContent.trim().replace(/\\s+/g," ")}).filter(Boolean).slice(0,12); })()`);
        run.shots.push(await shot(`${slug}.${vp.name}.02-section.png`));
        listeners.delete(onMsg);
        await send("Target.closeTarget", { targetId });
        run.requestCount = run.requests.length; delete run.requests;
        const known = (u) => /\/sequence\/hero\/frame_\d+\.webp/.test(u);
        run.httpErrorsKnownT017 = run.httpErrors.filter(known).length;
        run.httpErrors = run.httpErrors.filter((u) => !known(u));
        run.failed = run.failed.filter((u) => !known(u));
        run.console = run.console.filter((c) => !known(c));
        run.verdict = !run.navigateError && !run.errorScreen && run.exceptions.length === 0 && run.nonGet.length === 0 && run.httpErrors.length === 0 && run.failed.length === 0 && run.console.length === 0 && run.sectionFound ? "PASS" : "CHECK";
        report.runs.push(run);
        console.log(`${pg.path} @ ${vp.name}: ${run.verdict} | title="${run.title}" | requests=${run.requestCount} nonGET=${run.nonGet.length} httpErr=${run.httpErrors.length} (+${run.httpErrorsKnownT017} known T-017 frame 404s) failed=${run.failed.length} console=${run.console.length} exceptions=${run.exceptions.length} section=${run.sectionFound}`);
    }
}
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
const exited = new Promise((r) => proc.once("exit", r));
await send("Browser.close").catch(() => {});
await Promise.race([exited, sleep(5000)]);
if (proc.exitCode === null) { proc.kill(); await Promise.race([exited, sleep(3000)]); }
fs.rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
process.exit(report.runs.every((r) => r.verdict === "PASS") ? 0 : 1);
