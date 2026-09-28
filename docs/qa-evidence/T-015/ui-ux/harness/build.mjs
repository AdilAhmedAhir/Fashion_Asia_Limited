// T-015 /ui-ux harness: build step.
//
// Runs the REAL admin client components (ReportsClient, CareersClient,
// WhoWeAreClient) and the REAL dashboard layout, SettingsForm and
// ImageUploadField in headless Chrome, with only the network edges stubbed:
// the "use server" action modules, next/link and BrandLogo (next/image).
// Nothing here writes to the project: sources are read, output goes to the
// session scratchpad. No server is started; pages load from file://.
//
// usage: node build.mjs <before|after>
//   before = /lead-dev's three client files, snapshotted to ../baseline/
//   after  = the working tree's three client files, as edited by /ui-ux
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const PROJECT = "/Volumes/D_Architect/Codebase/Fashion_asia_limited";
const HERE = path.dirname(new URL(import.meta.url).pathname);
const SCRATCH = path.dirname(HERE);
const variant = process.argv[2];
if (!["before", "after"].includes(variant)) throw new Error("usage: node build.mjs <before|after>");
const OUT = path.join(HERE, variant);
fs.mkdirSync(OUT, { recursive: true });

const req = createRequire(path.join(PROJECT, "package.json"));
const ts = req("typescript");

function transpile(file) {
    const src = fs.readFileSync(file, "utf8");
    return ts.transpileModule(src, {
        fileName: file,
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            jsx: ts.JsxEmit.ReactJSX,
            esModuleInterop: true,
            isolatedModules: true,
        },
    }).outputText;
}

const P = (rel) => path.join(PROJECT, rel);
const clientFile = (rel) => (variant === "before" ? path.join(SCRATCH, "baseline", path.basename(rel)) : P(rel));

// Registry name -> JS source (CommonJS body).
const modules = {};
const vendor = {
    "react": "node_modules/react/cjs/react.production.js",
    "react/jsx-runtime": "node_modules/react/cjs/react-jsx-runtime.production.js",
    "react-dom": "node_modules/react-dom/cjs/react-dom.production.js",
    "react-dom/client": "node_modules/react-dom/cjs/react-dom-client.production.js",
    "scheduler": "node_modules/scheduler/cjs/scheduler.production.js",
    "lucide-react": "node_modules/lucide-react/dist/cjs/lucide-react.js",
};
for (const [name, rel] of Object.entries(vendor)) modules[name] = fs.readFileSync(P(rel), "utf8");

const real = {
    "@/lib/site-content": P("src/lib/site-content.ts"),
    "@/lib/upload-limits": P("src/lib/upload-limits.ts"),
    "@/components/admin/ImageUploadField": P("src/components/admin/ImageUploadField.tsx"),
    "@/components/admin/SettingsForm": P("src/components/admin/SettingsForm.tsx"),
    "dashboard-layout": P("src/app/admin/(dashboard)/layout.tsx"),
    "reports-client": clientFile("src/app/admin/(dashboard)/reports/ReportsClient.tsx"),
    "careers-client": clientFile("src/app/admin/(dashboard)/careers/CareersClient.tsx"),
    "whoweare-client": clientFile("src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx"),
};
for (const [name, file] of Object.entries(real)) modules[name] = transpile(file);

// Controllable stand-ins for the "use server" modules. window.__ctl.mode[fn]:
//   "ok" (default) | "fail:<message>" -> resolves {ok:false, error} | "throw"
// window.__ctl.hold = true parks every call until __ctl.release() is called,
// so an in-flight state can be inspected and screenshotted.
const actionStub = (names) => `
const ctl = window.__ctl;
function action(name) {
  return function () {
    ctl.calls.push(name);
    const mode = ctl.mode[name] || "ok";
    return new Promise(function (resolve, reject) {
      function settle() {
        if (mode === "throw") reject(new Error("An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details."));
        else if (mode.indexOf("fail:") === 0) resolve({ ok: false, error: mode.slice(5) });
        else if (name === "uploadFile") resolve({ ok: true, url: "https://example.invalid/storage/v1/object/public/reports/1727500000000_k3j9x2.pdf" });
        else resolve({ ok: true });
      }
      if (ctl.hold) ctl.held.push(settle); else setTimeout(settle, ctl.delay);
    });
  };
}
Object.defineProperty(exports, "__esModule", { value: true });
${names.map((n) => `exports.${n} = action(${JSON.stringify(n)});`).join("\n")}
`;
modules["@/app/actions/settings-actions"] = actionStub([
    "getSettings", "updateSettings", "createReport", "updateReport", "deleteReport",
    "uploadFile", "createLeader", "updateLeader", "deleteLeader",
]);
modules["@/app/actions/jobs-actions"] = actionStub(["createJob", "updateJob", "deleteJob"]);
modules["@/app/actions/media-actions"] = actionStub(["uploadOptimizedImage"]);
modules["@/app/actions/auth-actions"] = actionStub(["logoutAction"]);
modules["next/link"] = `
const React = require("react");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = function Link(props) {
  const { href, children, ...rest } = props;
  return React.createElement("a", Object.assign({ href: href }, rest), children);
};`;
// BrandLogo renders next/image of /logo.png; a same-sized box keeps the
// sidebar's layout without a network request.
modules["@/components/ui/BrandLogo"] = `
const React = require("react");
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandLogo = function BrandLogo(props) {
  return React.createElement("span", { className: props.className, style: { display: "inline-block", background: "#016138", borderRadius: 4 } });
};`;

// Representative props, shaped exactly like each page.tsx loader's output.
modules["fixtures"] = `
const sc = require("@/lib/site-content");
exports.reports = [
  { id: "r1", title: "Sustainability Report 2024", category: "environmental", year: 2024, file_url: "https://example.invalid/r1.pdf", published: true, created_at: "2026-01-10" },
  { id: "r2", title: "Annual Financial Statement and Independent Auditor\\u2019s Report 2023\\u201324", category: "financial", year: 2024, file_url: null, published: false, created_at: "2026-02-01" },
  { id: "r3", title: "Social Compliance Audit Summary", category: "compliance", year: 2023, file_url: "https://example.invalid/r3.pdf", published: true, created_at: "2025-11-20" },
];
function job(id, title, department, deadline, is_active) {
  return { id, title, department, vacancy: 1, location: "Sreepur, Bangladesh", employment_type: "Full-time",
    responsibilities: "Find potential suppliers.\\nCompare and evaluate offers.", educational_requirements: "BSc in Textile Engineering.",
    experience_requirements: "1 to 2 years", additional_requirements: "", workplace: "Work at office", salary: "Negotiable",
    compensation: "Festival Bonus: 2 (Yearly)", published_at: "2026-09-01", deadline, is_active, created_at: "2026-09-01" };
}
exports.jobs = [
  job("j1", "Officer, Procurement & Development", "Procurement", "2026-10-31", true),
  job("j2", "Senior Executive, Merchandising (Knit Division)", "Merchandising", "", false),
  job("j3", "Compliance Officer", "Compliance", "2026-11-15", true),
];
exports.whoWeAre = sc.SITE_SETTINGS.who_we_are;
exports.leaders = sc.LEADERS.map(function (l) { return Object.assign({}, l); }).concat([
  { id: "4", name: sc.NEW_LEADER_NAME, title: sc.NEW_LEADER_TITLE, bio: null, photo_url: null, sort_order: 3 },
]);
`;

modules["entry"] = `
const React = require("react");
const { createRoot } = require("react-dom/client");
const Layout = require("dashboard-layout").default;
const fx = require("fixtures");
window.confirm = function () { window.__ctl.confirms++; return true; };
const page = window.__PAGE;
let el;
if (page === "reports") el = React.createElement(require("reports-client").default, { initial: fx.reports });
else if (page === "careers") el = React.createElement(require("careers-client").default, { initial: fx.jobs });
else el = React.createElement(require("whoweare-client").default, { settings: fx.whoWeAre, leaders: fx.leaders });
createRoot(document.getElementById("root")).render(React.createElement(Layout, null, el));
`;

const prelude = `
window.__ctl = { mode: {}, calls: [], held: [], hold: false, delay: 150, confirms: 0,
  release: function () { const h = this.held.splice(0); h.forEach(function (f) { f(); }); return h.length; } };
(function () {
  const defs = {}, cache = {};
  window.__define = function (n, f) { defs[n] = f; };
  window.__require = function r(n) {
    if (cache[n]) return cache[n].exports;
    if (!defs[n]) throw new Error("harness: module not registered: " + n);
    const m = { exports: {} }; cache[n] = m; defs[n](m, m.exports, r); return m.exports;
  };
})();
`;
let bundle = prelude;
for (const [name, body] of Object.entries(modules)) {
    bundle += `\n__define(${JSON.stringify(name)}, function (module, exports, require) {\n${body}\n});\n`;
}
bundle += `\n__require("entry");\n`;
fs.writeFileSync(path.join(OUT, "bundle.js"), bundle);

// Tailwind: the project's own config + globals.css, content globs resolved
// from the project root exactly as `next build` does. Output to scratchpad.
if (variant === "after" || !fs.existsSync(path.join(OUT, "app.css"))) {
    execFileSync(P("node_modules/.bin/tailwindcss"), ["-c", "tailwind.config.ts", "-i", "src/app/globals.css", "-o", path.join(OUT, "app.css")], { cwd: PROJECT, stdio: "pipe" });
}

// next/font self-hosted files from the last build, embedded as data: URIs
// (Chrome blocks file:// web fonts). Latin subsets + the metric-matched
// fallbacks next/font generates, so text wraps as it does in the app.
const media = P(".next/static/media");
const b64 = (f) => fs.readFileSync(path.join(media, f)).toString("base64");
const fonts = `
@font-face{font-family:Inter;font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${b64("83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2")}) format("woff2")}
@font-face{font-family:Inter Fallback;src:local(Arial);ascent-override:90.44%;descent-override:22.52%;line-gap-override:0.0%;size-adjust:107.12%}
@font-face{font-family:Playfair Display;font-style:normal;font-weight:400 900;font-display:block;src:url(data:font/woff2;base64,${b64("2a65768255d6b625-s.p.3u4lli0-axodc.woff2")}) format("woff2")}
@font-face{font-family:Playfair Display Fallback;src:local(Times New Roman);ascent-override:97.25%;descent-override:22.56%;line-gap-override:0.0%;size-adjust:111.26%}
html{--font-inter:"Inter","Inter Fallback";--font-playfair:"Playfair Display","Playfair Display Fallback"}
`;
fs.writeFileSync(path.join(HERE, "fonts.css"), fonts);

for (const page of ["reports", "careers", "whoweare"]) {
    fs.writeFileSync(path.join(OUT, `${page}.html`), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>T-015 ui-ux harness (${variant}) - ${page}</title>
<link rel="stylesheet" href="../fonts.css"><link rel="stylesheet" href="app.css"></head>
<body class="font-sans min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-black">
<div id="root" style="display:contents"></div>
<script>window.__PAGE = ${JSON.stringify(page)};</script>
<script src="bundle.js"></script>
</body></html>`);
}
console.log(`built ${variant}: ${Object.keys(modules).length} modules, bundle ${(bundle.length / 1024).toFixed(0)} KB -> ${OUT}`);
