// T-015 /ui-ux harness: scenario runner (headless Chrome over raw CDP, using
// Node's built-in WebSocket; no Playwright/Puppeteer).
//
// usage: node run.mjs <before|after> [scenario ...]
// Writes screenshots and results.json to ./shots/<variant>/. No server is
// started (pages are file://), nothing in the project is written, and the
// stubbed actions never touch the network.
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const SCRATCH = path.dirname(HERE);
const variant = process.argv[2];
const only = process.argv.slice(3);
const SHOTS = path.join(HERE, "shots", variant);
fs.mkdirSync(SHOTS, { recursive: true });
const PDF = path.join(SCRATCH, "test-report.pdf");
if (!fs.existsSync(PDF)) fs.writeFileSync(PDF, "%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");
const url = (page) => "file://" + path.join(HERE, variant, `${page}.html`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- CDP plumbing
async function launch() {
    const profile = path.join(SCRATCH, "chrome-profile");
    fs.rmSync(profile, { recursive: true, force: true });
    const proc = spawn(CHROME, [
        "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`,
        "--no-first-run", "--no-default-browser-check", "--disable-extensions",
        "--disable-background-networking", "--disable-sync", "--disable-component-update",
        "--force-color-profile=srgb", "--allow-file-access-from-files", "about:blank",
    ], { stdio: ["ignore", "ignore", "pipe"] });
    const wsUrl = await new Promise((resolve, reject) => {
        let buf = "";
        proc.stderr.on("data", (d) => {
            buf += d;
            const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
            if (m) resolve(m[1]);
        });
        setTimeout(() => reject(new Error("chrome did not start:\n" + buf)), 20000);
    });
    const ws = new WebSocket(wsUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0;
    const pending = new Map();
    const listeners = new Set();
    ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.id) {
            const p = pending.get(msg.id);
            if (!p) return;
            pending.delete(msg.id);
            msg.error ? p.reject(new Error(msg.error.message + " " + (msg.error.data || ""))) : p.resolve(msg.result);
        } else for (const l of listeners) l(msg);
    };
    const send = (method, params = {}, sessionId) => {
        const mid = ++id;
        ws.send(JSON.stringify(sessionId ? { id: mid, method, params, sessionId } : { id: mid, method, params }));
        return new Promise((resolve, reject) => pending.set(mid, { resolve, reject }));
    };
    return { proc, ws, send, listeners };
}

async function newPage(browser) {
    const { targetId } = await browser.send("Target.createTarget", { url: "about:blank" });
    const { sessionId } = await browser.send("Target.attachToTarget", { targetId, flatten: true });
    const send = (m, p) => browser.send(m, p, sessionId);
    const errors = [];
    browser.listeners.add((msg) => {
        if (msg.sessionId !== sessionId) return;
        if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
        if (msg.method === "Runtime.consoleAPICalled" && (msg.params.type === "error" || msg.params.type === "warning"))
            errors.push(msg.params.type + ": " + msg.params.args.map((a) => a.value ?? a.description).join(" "));
    });
    await send("Runtime.enable");
    await send("Page.enable");
    const page = {
        send, errors,
        async eval(expression) {
            const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
            if (r.exceptionDetails) throw new Error("eval failed: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + "\n" + expression.slice(0, 300));
            return r.result.value;
        },
        async handle(expression) {
            const r = await send("Runtime.evaluate", { expression, returnByValue: false });
            if (r.exceptionDetails) throw new Error("handle failed: " + expression);
            return r.result.objectId;
        },
        async viewport(width, height) {
            await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 768 });
        },
        async goto(name) {
            await send("Page.navigate", { url: url(name) });
            for (let i = 0; i < 200; i++) {
                const ok = await page.eval(`document.readyState === "complete" && !!document.querySelector("main table, main h1") && document.fonts.status === "loaded"`).catch(() => false);
                if (ok) break;
                await sleep(25);
            }
            await page.eval(MEASURE);
            await sleep(60);
        },
        // clip / pixel take VIEWPORT coordinates; CDP's clip is in document
        // coordinates, so the current scroll offset is added here.
        async shot(file, clip) {
            const params = { format: "png", captureBeyondViewport: false };
            if (clip) {
                const [sx, sy] = await page.eval(`[scrollX, scrollY]`);
                params.clip = { ...clip, x: clip.x + sx, y: clip.y + sy, scale: 1 };
            }
            const r = await send("Page.captureScreenshot", params);
            fs.writeFileSync(path.join(SHOTS, file), Buffer.from(r.data, "base64"));
            return file;
        },
        async pixel(x, y) {
            const [sx, sy] = await page.eval(`[scrollX, scrollY]`);
            const r = await send("Page.captureScreenshot", { format: "png", clip: { x: x + sx, y: y + sy, width: 1, height: 1, scale: 1 } });
            return decodePixel(Buffer.from(r.data, "base64"));
        },
        async press(name, modifiers = 0) {
            const k = KEYS[name];
            await send("Input.dispatchKeyEvent", { type: k.text ? "keyDown" : "rawKeyDown", modifiers, ...k });
            await send("Input.dispatchKeyEvent", { type: "keyUp", modifiers, key: k.key, code: k.code, windowsVirtualKeyCode: k.windowsVirtualKeyCode });
            await sleep(40);
        },
        async type(text) { await send("Input.insertText", { text }); await sleep(30); },
        async hover(x, y) { await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y }); await sleep(60); },
        async setFile(selector) {
            const objectId = await page.handle(`document.querySelector(${JSON.stringify(selector)})`);
            await send("DOM.setFileInputFiles", { files: [PDF], objectId });
        },
        async waitFor(expr, ms = 3000) {
            const t = Date.now();
            while (Date.now() - t < ms) { if (await page.eval(expr)) return true; await sleep(25); }
            throw new Error("timeout waiting for: " + expr);
        },
    };
    return page;
}

const KEYS = {
    Tab: { key: "Tab", code: "Tab", windowsVirtualKeyCode: 9 },
    Enter: { key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" },
    Escape: { key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 },
};

// A 1x1 PNG screenshot: one scanline, every PNG filter reduces to the raw
// bytes when the left/up neighbours are zero, so no unfiltering is needed.
function decodePixel(png) {
    let off = 8, ihdr, idat = [];
    while (off < png.length) {
        const len = png.readUInt32BE(off), type = png.toString("ascii", off + 4, off + 8);
        const data = png.subarray(off + 8, off + 8 + len);
        if (type === "IHDR") ihdr = { colorType: data[9] };
        if (type === "IDAT") idat.push(data);
        off += 12 + len;
    }
    const raw = zlib.inflateSync(Buffer.concat(idat));
    return { r: raw[1], g: raw[2], b: raw[3], colorType: ihdr.colorType };
}

// ------------------------------------------------------------ in-page helpers
const MEASURE = String.raw`
window.__m = (function () {
  function d(el) {
    if (!el) return null;
    var s = el.tagName.toLowerCase();
    var c = typeof el.className === "string" ? el.className : (el.className && el.className.baseVal) || "";
    if (c) s += "." + c.trim().split(/\s+/).slice(0, 6).join(".");
    var t = (el.getAttribute && (el.getAttribute("aria-label") || "")) || "";
    var txt = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40);
    return s + (t ? ' [aria-label="' + t + '"]' : "") + (txt ? ' "' + txt + '"' : "");
  }
  function rect(el) { var r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), right: Math.round(r.right), bottom: Math.round(r.bottom) }; }
  function rgba(c) { var m = c.match(/rgba?\(([^)]+)\)/); var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
  function lin(v) { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
  function L(c) { return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b); }
  function ratio(a, b) { var x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function composite(el) {
    var chain = []; for (var a = el; a; a = a.parentElement) chain.unshift(a);
    var bg = { r: 255, g: 255, b: 255 };
    chain.forEach(function (n) {
      var c = rgba(getComputedStyle(n).backgroundColor);
      if (c.a > 0) bg = { r: c.r * c.a + bg.r * (1 - c.a), g: c.g * c.a + bg.g * (1 - c.a), b: c.b * c.a + bg.b * (1 - c.a) };
    });
    return bg;
  }
  function hex(c) { return "#" + [c.r, c.g, c.b].map(function (v) { return Math.round(v).toString(16).padStart(2, "0"); }).join(""); }
  function scrollsX(a) { var s = getComputedStyle(a); return (s.overflowX === "auto" || s.overflowX === "scroll"); }
  return {
    d: d, rect: rect,
    contrast: function (el) {
      var fg = rgba(getComputedStyle(el).color), bg = composite(el);
      var fgc = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
      return { fg: hex(fgc), bg: hex(bg), ratio: Math.round(ratio(fgc, bg) * 100) / 100 };
    },
    ratio: function (a, b) { return Math.round(ratio(a, b) * 100) / 100; },
    doc: function () {
      var de = document.documentElement;
      return { innerWidth: innerWidth, innerHeight: innerHeight, docScrollWidth: de.scrollWidth, docClientWidth: de.clientWidth, htmlOverflowX: getComputedStyle(de).overflowX };
    },
    // Boxes past the viewport's right edge. html/body are overflow-x:clip, so
    // this is content the user can never see unless an ancestor scrolls.
    offscreen: function () {
      var out = [];
      document.querySelectorAll("body *").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (!r.width || !r.height || r.right <= innerWidth + 0.5) return;
        var p = el.parentElement; if (p && p.getBoundingClientRect().right > innerWidth + 0.5) return; // report top-most only
        var reach = false; for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) if (scrollsX(a) && a.scrollWidth > a.clientWidth) { reach = true; break; }
        out.push({ el: d(el), right: Math.round(r.right), reachableByScroll: reach });
      });
      return out;
    },
    // Containers whose content is wider than their box: "clipped" (hidden /
    // clip, unreachable) or "scrolls" (auto / scroll, reachable).
    hOverflow: function () {
      var out = [];
      document.querySelectorAll("body *").forEach(function (el) {
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)) return; // their own text scrolling, not layout
        if (el.scrollWidth <= el.clientWidth + 1) return;
        var s = getComputedStyle(el).overflowX;
        if (s === "visible") return;
        out.push({ el: d(el), overflowX: s, scrollWidth: el.scrollWidth, clientWidth: el.clientWidth, kind: (s === "auto" || s === "scroll") ? "scrolls" : "clipped" });
      });
      return out;
    },
    lines: function (el) { var r = document.createRange(); r.selectNodeContents(el); return Array.prototype.map.call(r.getClientRects(), function (q) { return { left: Math.round(q.left), right: Math.round(q.right), top: Math.round(q.top), bottom: Math.round(q.bottom) }; }); },
    visibleBox: function (el) {
      var b = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
      // The root's box is the viewport itself (already the starting box);
      // its clientHeight is the viewport's, but its rect moves with scroll.
      for (var a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
        var s = getComputedStyle(a);
        if (s.overflowX !== "visible" || s.overflowY !== "visible") {
          var r = a.getBoundingClientRect();
          b = { left: Math.max(b.left, r.left + a.clientLeft), top: Math.max(b.top, r.top + a.clientTop), right: Math.min(b.right, r.left + a.clientLeft + a.clientWidth), bottom: Math.min(b.bottom, r.top + a.clientTop + a.clientHeight) };
        }
      }
      return { left: Math.round(b.left), top: Math.round(b.top), right: Math.round(b.right), bottom: Math.round(b.bottom) };
    },
    // Every text line of el lies inside what its clipping/scrolling ancestors
    // and the viewport actually show.
    fullyVisible: function (el) {
      var b = this.visibleBox(el), ls = this.lines(el);
      var ok = ls.every(function (q) { return q.left >= b.left - 1 && q.right <= b.right + 1 && q.top >= b.top - 1 && q.bottom <= b.bottom + 1; });
      return { ok: ok, box: b, lines: ls };
    },
    alerts: function () { return Array.prototype.map.call(document.querySelectorAll('[role="alert"]'), function (a) { return { text: a.textContent.trim(), empty: !a.textContent.trim() }; }); },
    active: function () { var a = document.activeElement; return a === document.body ? "BODY" : d(a); },
  };
})();
`;

// ------------------------------------------------------------------ scenarios
const results = { variant, when: new Date().toISOString(), scenarios: {} };
const S = {};
const LONG_DB = 'update or delete on table "reports" violates foreign key constraint "report_downloads_report_id_fkey" on table "report_downloads"';
const SESSION = "Your session expired. Sign in again and retry.";
const sizes = { phone: [360, 740], tablet: [768, 1024], small: [1024, 768], laptop: [1366, 657] };
const tableSel = (n) => `(function(){var rows=[].filter.call(document.querySelectorAll("tbody tr"),function(tr){return tr.querySelectorAll("button").length===2});return rows[${n}].querySelectorAll("button")})()`;

async function tableScenario(page, name, pageName, deleteFn) {
    const out = {};
    for (const [label, [w, h]] of Object.entries(sizes)) {
        await page.viewport(w, h);
        await page.goto(pageName);
        const table = await page.eval(`(function(){
            var t=document.querySelector("table"), wrap=t.parentElement;
            var rows=[].filter.call(document.querySelectorAll("tbody tr"),function(tr){return tr.querySelectorAll("button").length===2});
            return { wrapOverflowX:getComputedStyle(wrap).overflowX, wrapClient:wrap.clientWidth, wrapScroll:wrap.scrollWidth, tableW:Math.round(t.getBoundingClientRect().width),
              trashVisible: rows.map(function(tr){ var b=tr.querySelectorAll("button")[1]; var v=__m.visibleBox(b), r=b.getBoundingClientRect(); return r.left>=v.left-1 && r.right<=v.right+1; }),
              names: rows.map(function(tr){ return [].map.call(tr.querySelectorAll("button"), function(b){ return b.getAttribute("aria-label") || b.textContent.trim() || "(no accessible name)"; }); }),
              doc: __m.doc(), offscreen: __m.offscreen(), hOverflow: __m.hOverflow() };
        })()`);
        await page.eval(`__ctl.mode[${JSON.stringify(deleteFn)}] = ${JSON.stringify("fail:" + LONG_DB)}; ${tableSel(1)}[1].click(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
        await sleep(50);
        const alertAtStart = await page.eval(`__m.fullyVisible(document.querySelector('[role="alert"]'))`);
        const shotAtStart = await page.shot(`${name}-${label}-${w}-unscrolled.png`);
        // Where the admin actually is when they press Delete: scrolled to the
        // trash icon. Scroll the table's own box fully right, then re-check.
        const scrolled = await page.eval(`(function(){ var w=document.querySelector("table").parentElement; w.scrollLeft = w.scrollWidth; return w.scrollLeft; })()`);
        await sleep(50);
        const alertScrolled = await page.eval(`__m.fullyVisible(document.querySelector('[role="alert"]'))`);
        const trashAfterScroll = await page.eval(`[].filter.call(document.querySelectorAll("tbody tr"),function(tr){return tr.querySelectorAll("button").length===2}).map(function(tr){ var b=tr.querySelectorAll("button")[1]; var v=__m.visibleBox(b), r=b.getBoundingClientRect(); return r.left>=v.left-1 && r.right<=v.right+1; })`);
        const shot = await page.shot(`${name}-${label}-${w}.png`);
        await page.eval(`(function(){ var w=document.querySelector("table").parentElement; w.scrollLeft = 0; })()`);
        const contrast = await page.eval(`__m.contrast(document.querySelector('[role="alert"]'))`);
        out[label] = { viewport: [w, h], table, alertAtStart, shotAtStart, scrolledTo: scrolled, alertWhenScrolledToTrash: alertScrolled, trashVisibleAfterScrollingRight: trashAfterScroll, alerts: await page.eval(`__m.alerts()`), contrast, shot };
    }
    return out;
}

S.reportsTable = async (page) => tableScenario(page, "reports-table", "reports", "deleteReport");
S.careersTable = async (page) => tableScenario(page, "careers-table", "careers", "deleteJob");

S.reportsModal = async (page) => {
    const out = {};
    for (const [label, [w, h]] of Object.entries({ ...sizes, laptop720: [1280, 632], short: [1280, 560] })) {
        await page.viewport(w, h);
        await page.goto("reports");
        await page.eval(`document.querySelector("header button").click(); true`);
        await page.waitFor(`!!document.querySelector("input[type=file]")`);
        await page.eval(`__ctl.mode.uploadFile = "throw"; true`);
        await page.setFile("input[type=file]");
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
        await page.eval(`(function(){ var i=document.querySelector(".fixed input[type=text]"); var s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; s.call(i,"Sustainability Report 2025"); i.dispatchEvent(new Event("input",{bubbles:true})); return true; })()`);
        await page.eval(`__ctl.mode.createReport = ${JSON.stringify("fail:" + SESSION)}; var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].click(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 2`);
        await sleep(50);
        const m = await page.eval(`(function(){
            var bd=document.querySelector(".fixed"), panel=bd.firstElementChild, bs=panel.querySelectorAll("button"), save=bs[bs.length-1], al=document.querySelectorAll('[role="alert"]');
            var sr=save.getBoundingClientRect();
            return { panel: __m.rect(panel), panelScrolls: panel.scrollHeight > panel.clientHeight + 1, backdropScrolls: bd.scrollHeight > bd.clientHeight + 1,
              panelOverflowY: getComputedStyle(panel).overflowY, backdropOverflowY: getComputedStyle(bd).overflowY,
              saveButton: __m.rect(save), saveInViewport: sr.top >= 0 && sr.bottom <= innerHeight,
              uploadAlert: __m.fullyVisible(al[0]), saveAlert: __m.fullyVisible(al[1]),
              topCutOff: panel.getBoundingClientRect().top < -0.5, bottomCutOff: panel.getBoundingClientRect().bottom > innerHeight + 0.5,
              texts: __m.alerts(), contrast: [__m.contrast(al[0]), __m.contrast(al[1])], doc: __m.doc(), offscreen: __m.offscreen(), hOverflow: __m.hOverflow() };
        })()`);
        // Can the admin still reach Save? If only the backdrop or panel scrolls,
        // scroll it the way a wheel/trackpad would and re-check.
        m.saveReachable = m.saveInViewport || await page.eval(`(function(){ var bd=document.querySelector(".fixed"), p=bd.firstElementChild; p.scrollTop=p.scrollHeight; bd.scrollTop=bd.scrollHeight; var bs=p.querySelectorAll("button"), r=bs[bs.length-1].getBoundingClientRect(); return r.top>=0 && r.bottom<=innerHeight; })()`);
        await page.eval(`(function(){ var bd=document.querySelector(".fixed"); bd.scrollTop=0; bd.firstElementChild.scrollTop=0; })()`);
        m.shot = await page.shot(`reports-modal-errors-${label}-${w}x${h}.png`);
        out[label] = m;
    }
    return out;
};

S.reportsReplace = async (page) => {
    await page.viewport(1366, 657);
    await page.goto("reports");
    await page.eval(`${tableSel(0)}[0].click(); true`);
    await page.waitFor(`!!document.querySelector("input[type=file]")`);
    const pill = `document.querySelector("input[type=file]").nextElementSibling`;
    const idle = await page.eval(`({ text: ${pill}.textContent.trim(), replace: __m.contrast(${pill}.querySelector("button")), check: __m.contrast(${pill}.querySelector("svg")) })`);
    const idleShot = await page.shot("reports-replace-idle.png", await page.eval(`(function(){ var r=${pill}.getBoundingClientRect(); return { x: r.x-8, y: r.y-8, width: r.width+16, height: r.height+16 }; })()`));
    const rr = await page.eval(`(function(){ var r=${pill}.querySelector("button").getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
    await page.hover(rr.x, rr.y);
    idle.replaceHover = await page.eval(`__m.contrast(${pill}.querySelector("button"))`);
    await page.hover(5, 5);
    await page.eval(`__ctl.hold = true; true`);
    await page.setFile("input[type=file]");
    await sleep(120);
    const x = `document.querySelector(".fixed").firstElementChild.querySelector("button")`;
    const busy = await page.eval(`(function(){ var bs=document.querySelectorAll(".fixed button"), save=bs[bs.length-1], x=${x}, rb=${pill}.querySelector("button");
        return { pillText: ${pill}.textContent.trim(), replaceDisabled: rb.disabled, replaceBusyLabel: rb.textContent.trim(), replaceContrast: __m.contrast(rb),
          xDisabled: x.disabled, xAriaLabel: x.getAttribute("aria-label"), xColorRest: getComputedStyle(x).color, xOpacity: getComputedStyle(x).opacity,
          saveDisabled: save.disabled, saveLabel: save.textContent.trim() }; })()`);
    const xr = await page.eval(`(function(){ var r=${x}.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
    await page.hover(xr.x, xr.y);
    busy.xColorHoverWhileDisabled = await page.eval(`getComputedStyle(${x}).color`);
    const busyShot = await page.shot("reports-replace-uploading.png", await page.eval(`(function(){ var p=document.querySelector(".fixed").firstElementChild.getBoundingClientRect(); return { x: p.x, y: p.y, width: p.width, height: Math.min(p.height, 360) }; })()`));
    // Escape and backdrop click while the upload is in flight.
    await page.press("Escape");
    busy.modalOpenAfterEscape = await page.eval(`!!document.querySelector(".fixed")`);
    await page.eval(`document.querySelector(".fixed").click(); true`);
    busy.modalOpenAfterBackdropClick = await page.eval(`!!document.querySelector(".fixed")`);
    await page.eval(`__ctl.hold = false; __ctl.release(); true`);
    await sleep(120);
    const after = await page.eval(`({ pillText: ${pill}.textContent.trim(), alerts: __m.alerts() })`);
    return { idle, idleShot, busy, busyShot, afterUpload: after, errors: page.errors.slice() };
};

// Keyboard: Save pressed with Enter, request held in flight, then a failure,
// then an identical retry. Records focus and whether the alert node is new.
S.reportsKeyboard = async (page) => {
    await page.viewport(1366, 657);
    await page.goto("reports");
    await page.eval(`document.querySelector("header button").click(); true`);
    await page.waitFor(`!!document.querySelector("input[type=file]")`);
    const out = {};
    await page.eval(`(function(){ var i=document.querySelector(".fixed input[type=text]"); i.focus(); return true; })()`);
    await page.type("Q3 Report");
    out.tabOrderInModal = [];
    for (let i = 0; i < 6; i++) { await page.press("Tab"); out.tabOrderInModal.push(await page.eval(`__m.active()`)); }
    await page.eval(`__ctl.mode.createReport = ${JSON.stringify("fail:" + SESSION)}; __ctl.hold = true; var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].focus(); true`);
    out.focusBeforeEnter = await page.eval(`__m.active()`);
    await page.press("Enter");
    await sleep(80);
    out.inFlight = await page.eval(`(function(){ var bs=document.querySelectorAll(".fixed button"), s=bs[bs.length-1]; return { saveDisabled: s.disabled, saveLabel: s.textContent.trim(), active: __m.active(), calls: __ctl.calls.slice() }; })()`);
    await page.press("Escape");
    out.inFlight.modalOpenAfterEscape = await page.eval(`!!document.querySelector(".fixed")`);
    await page.eval(`window.__mo = []; new MutationObserver(function(ms){ ms.forEach(function(m){ [].forEach.call(m.removedNodes,function(n){ if(n.nodeType===1 && (n.getAttribute("role")==="alert" || n.querySelector && n.querySelector('[role="alert"]'))) __mo.push("alert removed"); }); [].forEach.call(m.addedNodes,function(n){ if(n.nodeType===1 && (n.getAttribute("role")==="alert" || n.querySelector && n.querySelector('[role="alert"]'))) __mo.push("alert added"); }); if(m.type==="characterData") __mo.push("alert text changed"); }); }).observe(document.body,{subtree:true,childList:true,characterData:true}); true`);
    await page.eval(`__ctl.release(); true`);
    await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
    out.afterFailure = { active: await page.eval(`__m.active()`), alerts: await page.eval(`__m.alerts()`), mutations: await page.eval(`__mo.slice()`) };
    await page.press("Tab");
    out.afterFailure.tabGoesTo = await page.eval(`__m.active()`);
    await page.eval(`(function(){ var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].focus(); })(); true`);
    await page.press("Tab", 8);
    out.afterFailure.shiftTabFromSaveGoesTo = await page.eval(`__m.active()`);
    // Identical retry: same failure text again.
    await page.eval(`window.__firstAlert = document.querySelector('[role="alert"]'); __mo.length = 0; var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].click(); true`);
    await sleep(60);
    out.retryInFlight = { alertsDuringRetry: await page.eval(`__m.alerts()`) };
    await page.eval(`__ctl.release(); true`);
    await sleep(200);
    out.retry = { sameAlertNode: await page.eval(`document.querySelector('[role="alert"]') === window.__firstAlert`), mutations: await page.eval(`__mo.slice()`), alerts: await page.eval(`__m.alerts()`) };
    out.errors = page.errors.slice();
    return out;
};

// Post-failure focus, measured literally: Enter on Save, failure, then
// Shift+Tab straight from the resulting <body> state.
S.shiftTabAfterFailure = async (page) => {
    await page.viewport(1366, 657);
    await page.goto("reports");
    await page.eval(`document.querySelector("header button").click(); true`);
    await page.waitFor(`!!document.querySelector("input[type=file]")`);
    await page.eval(`__ctl.mode.createReport = ${JSON.stringify("fail:" + SESSION)}; __ctl.hold = true; var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].focus(); true`);
    await page.press("Enter");
    await sleep(60);
    const during = await page.eval(`__m.active()`);
    await page.eval(`__ctl.hold = false; __ctl.release(); true`);
    await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
    const after = await page.eval(`__m.active()`);
    await page.press("Tab", 8);
    const shiftTab = await page.eval(`__m.active()`);
    await page.press("Tab", 8);
    const shiftTab2 = await page.eval(`__m.active()`);
    return { during, after, shiftTab, shiftTab2 };
};

S.careersModal = async (page) => {
    const out = {};
    for (const [label, [w, h]] of Object.entries({ ...sizes, laptop720: [1280, 632] })) {
        await page.viewport(w, h);
        await page.goto("careers");
        await page.eval(`document.querySelector("header button").click(); true`);
        await page.waitFor(`!!document.querySelector(".fixed input[type=text]")`);
        const idleOverflow = await page.eval(`({ offscreen: __m.offscreen(), hOverflow: __m.hOverflow() })`);
        await page.eval(`(function(){ var i=document.querySelector(".fixed input[type=text]"); var s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; s.call(i,"Assistant Manager, Industrial Engineering"); i.dispatchEvent(new Event("input",{bubbles:true})); return true; })()`);
        // The admin scrolls to the bottom to reach Save, then clicks it.
        await page.eval(`(function(){ var p=document.querySelector(".fixed").firstElementChild; p.scrollTop=p.scrollHeight; return true; })()`);
        await page.eval(`__ctl.mode.createJob = ${JSON.stringify("fail:" + SESSION)}; var bs=document.querySelectorAll(".fixed button"); bs[bs.length-1].click(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
        await sleep(60);
        const m = await page.eval(`(function(){ var p=document.querySelector(".fixed").firstElementChild, bs=p.querySelectorAll("button"), s=bs[bs.length-1], a=document.querySelector('[role="alert"]');
            var vb=__m.visibleBox(s), r=s.getBoundingClientRect();
            return { panel: __m.rect(p), scrollTop: p.scrollTop, alert: __m.fullyVisible(a), saveVisiblePx: Math.max(0, Math.min(r.bottom, vb.bottom) - Math.max(r.top, vb.top)), saveHeight: Math.round(r.height), contrast: __m.contrast(a) }; })()`);
        m.idleOverflow = idleOverflow;
        m.shot = await page.shot(`careers-modal-error-${label}-${w}x${h}.png`);
        out[label] = m;
    }
    return out;
};

S.leaders = async (page) => {
    const out = {};
    for (const [label, [w, h]] of Object.entries(sizes)) {
        await page.viewport(w, h);
        await page.goto("whoweare");
        const card = `[].find.call(document.querySelectorAll("h2"), function(h){ return h.textContent.trim()==="Leadership Team"; }).parentElement`;
        const leaderCards = `${card}.querySelectorAll("div.rounded-xl")`;
        // Per-card geometry: does the Photo URL row (input + remove button)
        // stay inside its own leader card?
        const rowProbe = `[].map.call(${leaderCards}, function(lc){ var row=[].find.call(lc.children,function(c){return /justify-between/.test(c.className)}); var i=row.querySelector("input"), b=row.querySelector("button"), cr=lc.getBoundingClientRect(), ir=i.getBoundingClientRect(), br=b.getBoundingClientRect();
            return { card: Math.round(cr.left)+".."+Math.round(cr.right), input: Math.round(ir.left)+".."+Math.round(ir.right), removeBtn: Math.round(br.left)+".."+Math.round(br.right), btnInsideCard: br.right <= cr.right - 1, btnInViewport: br.right <= innerWidth }; })`;
        out[label + "_cleanLoad"] = { rows: await page.eval(rowProbe), offscreen: await page.eval(`__m.offscreen()`) };
        // Blur-save failure on leader 1.
        await page.eval(`__ctl.mode.updateLeader = ${JSON.stringify("fail:" + SESSION)}; ${leaderCards}[0].querySelector("input").focus(); true`);
        await page.type(" Jr.");
        await page.eval(`${leaderCards}[0].querySelectorAll("input")[1].focus(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
        // Delete failure on leader 2 (throw -> fallback text).
        await page.eval(`__ctl.mode.deleteLeader = "throw"; ${leaderCards}[1].querySelector("button").click(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 2`);
        // Add Leader, held in flight.
        const addBtn = `[].find.call(${card}.querySelectorAll("button"), function(b){ return /Add Leader/.test(b.textContent); })`;
        await page.eval(`__ctl.hold = true; __ctl.mode.createLeader = "throw"; ${addBtn}.click(); true`);
        await sleep(80);
        const pending = await page.eval(`(function(){ var b=${addBtn}; return { disabled: b.disabled, opacity: getComputedStyle(b).opacity, bg: getComputedStyle(b).backgroundColor, headerSave: document.querySelector("header button").textContent.trim(), headerSaveDisabled: document.querySelector("header button").disabled }; })()`);
        const ab = await page.eval(`(function(){ var r=${addBtn}.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
        await page.eval(`${addBtn}.scrollIntoView({block:"center"}); true`);
        const ab2 = await page.eval(`(function(){ var r=${addBtn}.getBoundingClientRect(); return { x: r.x + r.width/2, y: r.y + r.height/2 }; })()`);
        await page.hover(ab2.x, ab2.y);
        pending.bgOnHoverWhileDisabled = await page.eval(`getComputedStyle(${addBtn}).backgroundColor`);
        const pendingShot = await page.shot(`leaders-add-pending-${label}-${w}.png`, await page.eval(`(function(){ var r=${addBtn}.getBoundingClientRect(); return { x: Math.max(0, r.x-16), y: r.y-16, width: Math.min(innerWidth - Math.max(0, r.x-16), 420), height: r.height+32 }; })()`));
        await page.eval(`__ctl.hold = false; __ctl.release(); true`);
        await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 3`);
        await sleep(50);
        const m = await page.eval(`(function(){ var al=document.querySelectorAll('[role="alert"]');
            return { alerts: __m.alerts(), rows: ${rowProbe},
              visible: [].map.call(al, function(a){ a.scrollIntoView({block:"center"}); return __m.fullyVisible(a).ok; }), contrast: [].map.call(al, function(a){ return __m.contrast(a); }),
              trashNames: [].map.call(${leaderCards}, function(c){ var b=c.querySelector("button"); return b.getAttribute("aria-label") || b.textContent.trim() || "(no accessible name)"; }),
              doc: __m.doc(), offscreen: __m.offscreen(), hOverflow: __m.hOverflow() }; })()`);
        m.pending = pending;
        m.pendingShot = pendingShot;
        await page.eval(`${card}.scrollIntoView({block:"start"}); true`);
        await sleep(50);
        m.shot = await page.shot(`leaders-errors-${label}-${w}.png`);
        // A full-card capture regardless of viewport height.
        const cr = await page.eval(`(function(){ var r=${card}.getBoundingClientRect(); return { x: r.x, y: r.y + scrollY, width: r.width, height: r.height }; })()`);
        await page.send("Emulation.setDeviceMetricsOverride", { width: w, height: Math.ceil(cr.y + cr.height + 40), deviceScaleFactor: 1, mobile: w < 768 });
        await sleep(80);
        await page.eval(`scrollTo(0, 0); true`);
        m.cardShot = await page.shot(`leaders-card-${label}-${w}.png`, { x: 0, y: Math.max(0, cr.y - 24), width: w, height: cr.height + 48 });
        out[label] = m;
    }
    return out;
};

// Genuine :focus-visible rings, reached by real Tab key events.
S.focusRings = async (page) => {
    const out = {};
    await page.viewport(1024, 768);
    for (const [pg, targets] of [["reports", ["Delete", "Edit"]], ["careers", ["Delete"]]]) {
        await page.goto(pg);
        for (const t of targets) {
            await page.goto(pg);
            let hit = null;
            for (let i = 0; i < 60; i++) {
                await page.press("Tab");
                const a = await page.eval(`(function(){ var a=document.activeElement; var rows=[].filter.call(document.querySelectorAll("tbody tr"),function(tr){return tr.querySelectorAll("button").length===2}); var idx=${t === "Delete" ? 1 : 0}; return rows[0] && a === rows[0].querySelectorAll("button")[idx]; })()`);
                if (a) { hit = i + 1; break; }
            }
            const info = await page.eval(`(function(){ var a=document.activeElement, s=getComputedStyle(a); return { matchesFocusVisible: a.matches(":focus-visible"), outline: s.outlineStyle + " " + s.outlineWidth + " " + s.outlineColor, boxShadow: s.boxShadow, name: a.getAttribute("aria-label") || "(none)" }; })()`);
            const r = await page.eval(`(function(){ var r=document.activeElement.getBoundingClientRect(); return { x: r.x-24, y: r.y-14, width: r.width+48, height: r.height+28 }; })()`);
            info.tabsToReach = hit;
            info.shot = await page.shot(`focus-${pg}-${t.toLowerCase()}.png`, r);
            out[`${pg}-${t}`] = info;
        }
    }
    return out;
};

// Pixel cross-check of the composited-background arithmetic: sample the
// rendered background right beside each error line.
S.pixels = async (page) => {
    const out = {};
    await page.viewport(1366, 657);
    await page.goto("reports");
    await page.eval(`__ctl.mode.deleteReport = ${JSON.stringify("fail:" + SESSION)}; ${tableSel(1)}[1].click(); true`);
    await page.waitFor(`document.querySelectorAll('[role="alert"]').length === 1`);
    out.tableRowBg = await page.pixel(...(await page.eval(`(function(){ var r=document.querySelector('[role="alert"]').getBoundingClientRect(); return [Math.round(r.right)+6, Math.round(r.top)+2]; })()`)));
    await page.eval(`document.querySelector("header button").click(); true`);
    await page.waitFor(`!!document.querySelector(".fixed")`);
    out.modalPanelBg = await page.pixel(...(await page.eval(`(function(){ var r=document.querySelector(".fixed").firstElementChild.getBoundingClientRect(); return [Math.round(r.x)+12, Math.round(r.y)+40]; })()`)));
    await page.goto("whoweare");
    const card = `[].find.call(document.querySelectorAll("h2"), function(h){ return h.textContent.trim()==="Leadership Team"; }).parentElement`;
    await page.eval(`${card}.scrollIntoView({block:"start"}); true`);
    await sleep(60);
    out.leaderCardBg = await page.pixel(...(await page.eval(`(function(){ var r=${card}.querySelector("div.rounded-xl").getBoundingClientRect(); return [Math.round(r.x)+8, Math.round(r.y)+8]; })()`)));
    out.settingsCardBg = await page.pixel(...(await page.eval(`(function(){ var r=${card}.getBoundingClientRect(); return [Math.round(r.x)+8, Math.round(r.y)+8]; })()`)));
    const red = { r: 248, g: 113, b: 113 };
    for (const k of Object.keys(out)) out[k].redOnThis = await page.eval(`__m.ratio(${JSON.stringify(red)}, ${JSON.stringify(out[k])})`);
    return out;
};

// ------------------------------------------------------------------------ main
const browser = await launch();
try {
    for (const [name, fn] of Object.entries(S)) {
        if (only.length && !only.includes(name)) continue;
        const page = await newPage(browser);
        const t = Date.now();
        try {
            results.scenarios[name] = await fn(page);
            results.scenarios[name].pageErrors = page.errors.slice();
        } catch (e) {
            results.scenarios[name] = { error: String(e.stack || e), pageErrors: page.errors.slice() };
        }
        console.log(`${name}: ${((Date.now() - t) / 1000).toFixed(1)}s${results.scenarios[name].error ? "  ERROR " + results.scenarios[name].error.split("\n")[0] : ""}`);
    }
} finally {
    browser.proc.kill("SIGTERM");
}
const file = path.join(SHOTS, only.length ? `results-${only.join("+")}.json` : "results.json");
fs.writeFileSync(file, JSON.stringify(results, null, 2));
console.log("wrote", file);
