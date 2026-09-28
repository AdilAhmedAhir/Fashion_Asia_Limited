#!/usr/bin/env bash
# T-015 /qa live, flow "admin-auth-gate": anonymous GET/HEAD only.
# No cookies, no redirect following, no POST of any kind. Writes one transcript
# per probe plus summary.tsv into the directory given as $2 (default: here).
#
# usage: bash probe.sh [base-url] [out-dir]
set -uo pipefail
BASE="${1:-http://localhost:3001}"
OUT="${2:-$(cd "$(dirname "$0")" && pwd)}"
mkdir -p "$OUT"
# Strings that only render inside the three admin pages (never on /admin/login).
MARKERS='Reports &amp; Publications|Reports & Publications|Publish New Report|Career / Job Postings|Post New Job|Leadership Team|Add Leader'
printf "route\tvariant\tstatus\tlocation\tset_cookie_count\tbody_bytes\tadmin_markers\tverdict\n" > "$OUT/summary.tsv"
pass=0; fail=0
probe() { # route variant curl-args...
    local route="$1" variant="$2"; shift 2
    local slug; slug="$(echo "$route" | tr '/' '_' | sed 's/^_//')"
    local f="$OUT/${slug}.${variant}.log" body; body="$(mktemp)"
    {
        echo "# $(date -u +%Y-%m-%dT%H:%M:%SZ)  anonymous $variant  $BASE$route"
        echo "# curl $* (no cookie jar, no -L)"
    } > "$f"
    curl -sS --max-time 15 -D "$f.hdr" -o "$body" "$@" "$BASE$route"
    cat "$f.hdr" >> "$f"; rm -f "$f.hdr"
    local status loc sc bytes markers verdict
    status="$(awk 'toupper($1) ~ /^HTTP/ {s=$2} END{print s}' "$f")"
    loc="$(awk 'tolower($1)=="location:" {print $2}' "$f" | tr -d '\r' | tail -1)"
    sc="$(grep -ci '^set-cookie:' "$f")"
    bytes="$(wc -c < "$body" | tr -d ' ')"
    markers="$(grep -Eoc "$MARKERS" "$body" || true)"
    echo "# body: ${bytes} bytes; admin-only markers found: ${markers}" >> "$f"
    head -c 300 "$body" | sed 's/^/# body> /' >> "$f"; echo >> "$f"
    rm -f "$body"
    if [ "$status" = "307" ] && [ "$loc" = "/admin/login" ] && [ "$sc" = "0" ] && [ "$markers" = "0" ]; then verdict=PASS; pass=$((pass+1)); else verdict=FAIL; fail=$((fail+1)); fi
    printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "$route" "$variant" "$status" "$loc" "$sc" "$bytes" "$markers" "$verdict" >> "$OUT/summary.tsv"
}
for r in /admin/reports /admin/careers /admin/who-we-are; do
    probe "$r" plain
    probe "$r" head -I
    probe "$r" rsc -H "RSC: 1"
    probe "$r" rsc-prefetch -H "RSC: 1" -H "Next-Router-Prefetch: 1"
    probe "$r" rsc-query -G --data-urlencode "_rsc=qa015"
done
# Sanity: the login page itself must render (200) and set no cookie.
lf="$OUT/admin_login.plain.log"
echo "# $(date -u +%Y-%m-%dT%H:%M:%SZ)  anonymous plain  $BASE/admin/login" > "$lf"
lb="$(mktemp)"; curl -sS --max-time 15 -D "$lf.hdr" -o "$lb" "$BASE/admin/login"; cat "$lf.hdr" >> "$lf"; rm -f "$lf.hdr"
ls_status="$(awk 'toupper($1) ~ /^HTTP/ {s=$2} END{print s}' "$lf")"; ls_sc="$(grep -ci '^set-cookie:' "$lf")"
ls_err="$(grep -Eoc 'Application error|Internal Server Error|This page could not be found' "$lb" || true)"
echo "# body: $(wc -c < "$lb" | tr -d ' ') bytes; error-screen strings: $ls_err" >> "$lf"; rm -f "$lb"
if [ "$ls_status" = "200" ] && [ "$ls_sc" = "0" ] && [ "$ls_err" = "0" ]; then v=PASS; pass=$((pass+1)); else v=FAIL; fail=$((fail+1)); fi
printf "%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n" "/admin/login" plain "$ls_status" "-" "$ls_sc" "-" "-" "$v" >> "$OUT/summary.tsv"
echo "admin-auth-gate: $pass pass, $fail fail"
[ "$fail" -eq 0 ]
