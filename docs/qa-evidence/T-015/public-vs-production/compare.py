#!/usr/bin/env python3
"""T-015 /qa live, flow "public-vs-production": read-only GETs only.

Fetches each public page from the local production build and from the live
site, anonymously (no cookies, no POST), and compares what a visitor gets:
title, meta/OG/canonical tags, headings, link targets, image/video sources and
alts, and every line of visible text. Script/style bodies (chunk hashes, the
RSC flight payload) are excluded. Writes <page>.{local,prod}.content.txt,
<page>.{local,prod}.headers.log, <page>.content.diff and summary.tsv here.

usage: python3 compare.py [local-base] [prod-base]
"""
import difflib, html.parser, os, re, subprocess, sys, datetime

LOCAL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:3001"
PROD = sys.argv[2] if len(sys.argv) > 2 else "https://www.fal.com.bd"
HERE = os.path.dirname(os.path.abspath(__file__))
PAGES = ["/sustainability", "/who-we-are", "/career"]
ERROR_STRINGS = ["Application error", "Internal Server Error", "This page could not be found",
                 "Unhandled Runtime Error", "a server-side exception has occurred",
                 "a client-side exception has occurred"]

class Extract(html.parser.HTMLParser):
    SKIP = {"script", "style", "noscript", "template"}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lines, self.skip, self.title, self.in_title, self.heading = [], 0, "", False, None
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in self.SKIP:
            self.skip += 1
            return
        if tag == "title":
            self.in_title = True
        elif tag == "meta" and (a.get("name") or a.get("property")) and "content" in a:
            key = a.get("name") or a.get("property")
            if key not in ("next-size-adjust",):
                self.lines.append(f"META {key} = {a['content']}")
        elif tag == "link" and a.get("rel") in ("canonical", "alternate", "icon", "apple-touch-icon", "manifest"):
            self.lines.append(f"LINK {a.get('rel')} {a.get('href')}")
        elif tag == "a" and "href" in a:
            self.lines.append(f"A {a['href']}")
        elif tag in ("img", "source", "video", "iframe", "embed", "object"):
            for k in ("src", "srcset", "poster", "data", "alt", "type"):
                if k in a and a[k] is not None:
                    self.lines.append(f"{tag.upper()} {k}={a[k]}")
        elif re.fullmatch(r"h[1-6]", tag):
            self.heading = tag
            self.lines.append(f"{tag.upper()} >")
    def handle_endtag(self, tag):
        if tag in self.SKIP:
            self.skip = max(0, self.skip - 1)
        elif tag == "title":
            self.in_title = False
        elif re.fullmatch(r"h[1-6]", tag):
            self.heading = None
    def handle_data(self, data):
        if self.skip:
            return
        t = re.sub(r"\s+", " ", data).strip()
        if not t:
            return
        if self.in_title:
            self.title += t
            return
        self.lines.append(("  " if self.heading else "TEXT ") + t)

def fetch(url):
    """Anonymous GET. Returns (status_line, headers_text, body)."""
    r = subprocess.run(["curl", "-sS", "--max-time", "30", "-D", "-", "-o", "/dev/stdout",
                        "-H", "User-Agent: Mozilla/5.0 (Macintosh) FAL-QA-T015-readonly", url],
                       capture_output=True)
    raw = r.stdout.decode("utf-8", "replace")
    head, _, body = raw.partition("\r\n\r\n")
    return head.splitlines()[0] if head else "NO RESPONSE", head, body

def normalize(body):
    p = Extract()
    p.feed(body)
    return [f"TITLE {p.title}"] + p.lines

def data_lists(page, lines):
    """The rows T-015's admin tables feed, as the public page shows them."""
    if page == "/sustainability":
        return [l for l in lines if l.startswith("A ") and ("/storage/v1/object/" in l or l.lower().endswith(".pdf"))]
    if page == "/who-we-are":
        return [l for l in lines if l.startswith("IMG alt=") or l.startswith("  ")]
    if page == "/career":
        return [l for l in lines if l.startswith("  ")]
    return []

summary = ["page\tlocal_status\tprod_status\tlocal_set_cookie\tprod_set_cookie\tlocal_error_strings\tprod_error_strings\tcontent_lines\tdiff_lines\tdiff_only_icon_query\tverdict"]
allpass = True
for page in PAGES:
    slug = page.strip("/").replace("/", "_") or "home"
    res = {}
    for side, base in (("local", LOCAL), ("prod", PROD)):
        status, head, body = fetch(base + page)
        lines = normalize(body)
        errs = [e for e in ERROR_STRINGS if e in body]
        setc = len([h for h in head.splitlines() if h.lower().startswith("set-cookie:")])
        with open(os.path.join(HERE, f"{slug}.{side}.headers.log"), "w") as f:
            f.write(f"# {datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')}  anonymous GET {base}{page}\n{head}\n")
            f.write(f"# body {len(body.encode())} bytes; error-screen strings: {errs or 'none'}; set-cookie headers: {setc}\n")
        with open(os.path.join(HERE, f"{slug}.{side}.content.txt"), "w") as f:
            f.write("\n".join(lines) + "\n")
        res[side] = dict(status=status, lines=lines, errs=errs, setc=setc)
    diff = list(difflib.unified_diff(res["prod"]["lines"], res["local"]["lines"], "prod", "local", lineterm="", n=0))
    changed = [d for d in diff if d[:1] in "+-" and not d.startswith(("+++", "---"))]
    icon_only = all(re.search(r"^[+-]LINK (icon|apple-touch-icon) /(apple-)?icon\.png\?", d) for d in changed)
    with open(os.path.join(HERE, f"{slug}.content.diff"), "w") as f:
        f.write("\n".join(diff) + ("\n" if diff else "(no differences)\n"))
    ok = ("200" in res["local"]["status"] and "200" in res["prod"]["status"]
          and not res["local"]["errs"] and not res["prod"]["errs"] and res["local"]["setc"] == 0
          and (not changed or icon_only))
    allpass &= ok
    # Data rows, compared on their own so a pass can't hide an empty page.
    dl, dp = data_lists(page, res["local"]["lines"]), data_lists(page, res["prod"]["lines"])
    with open(os.path.join(HERE, f"{slug}.data-rows.txt"), "w") as f:
        f.write(f"# rows the public page renders from the table T-015's admin page edits; local={len(dl)} prod={len(dp)} identical={dl == dp}\n")
        f.write("\n".join(dl) + "\n")
    summary.append("\t".join(map(str, [page, res["local"]["status"], res["prod"]["status"], res["local"]["setc"], res["prod"]["setc"],
                                      len(res["local"]["errs"]), len(res["prod"]["errs"]), len(res["local"]["lines"]),
                                      len(changed), icon_only if changed else "n/a (identical)", "PASS" if ok and dl == dp else "FAIL"])))
    allpass &= dl == dp
    print(f"{page}: local {res['local']['status']} | prod {res['prod']['status']} | lines {len(res['local']['lines'])} | changed {len(changed)} (icon-query-only={icon_only if changed else 'n/a'}) | data rows local={len(dl)} prod={len(dp)} same={dl == dp}")
with open(os.path.join(HERE, "summary.tsv"), "w") as f:
    f.write("\n".join(summary) + "\n")
print("public-vs-production:", "PASS" if allpass else "FAIL")
sys.exit(0 if allpass else 1)
