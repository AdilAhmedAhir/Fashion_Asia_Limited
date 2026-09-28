#!/usr/bin/env bash
# T-015 /qa static: negative control for t015-static-invariants.mjs.
#
# Proves the checker is load-bearing, not vacuous: copies the five T-015 files
# (plus the HEAD versions of the three clients, for the import baseline) into
# a throwaway temp dir, confirms the unmutated copy PASSES, seeds 7 deliberate
# violations, and confirms the checker FAILS on every one of them.
# Writes nothing inside the repo. Needs the repo's node_modules (symlinked).
#
# usage: bash negative-control.sh [/path/to/repo]
set -euo pipefail
R="${1:-/Volumes/D_Architect/Codebase/Fashion_asia_limited}"
HERE="$(cd "$(dirname "$0")" && pwd)"
S="$(mktemp -d)"
trap 'rm -rf "$S"' EXIT
cd "$S"
git init -q .
git config user.email qa@example.invalid
git config user.name qa-negctl
CLIENTS=("src/app/admin/(dashboard)/reports/ReportsClient.tsx" "src/app/admin/(dashboard)/careers/CareersClient.tsx" "src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx")
for f in "${CLIENTS[@]}"; do mkdir -p "$(dirname "$f")"; git -C "$R" show "HEAD:$f" > "$f"; done
git add -A >/dev/null && git commit -qm base
for f in src/app/actions/settings-actions.ts src/app/actions/jobs-actions.ts "${CLIENTS[@]}"; do mkdir -p "$(dirname "$f")"; cp "$R/$f" "$f"; done
ln -s "$R/node_modules" node_modules
echo '{"name":"negctl","private":true}' > package.json

echo "== 1. unmutated copy (expect ALL INVARIANTS HOLD)"
node "$HERE/t015-static-invariants.mjs" "$S" | tail -1

echo "== 2. seeding 7 violations"
python3 - "$S" <<'EOF'
import sys, pathlib
S = pathlib.Path(sys.argv[1])
def sub(rel, old, new, label):
    p = S / rel; t = p.read_text(); assert old in t, (rel, label); p.write_text(t.replace(old, new, 1)); print("   seeded:", label)
sub("src/app/actions/jobs-actions.ts",
    'if (!data) return { ok: false, error: JOB_NOT_FOUND };\n    revalidatePath("/admin/careers");\n    revalidatePath("/career");\n    return { ok: true };\n}\n',
    'if (!data) throw new Error("gone");\n    revalidatePath("/admin/careers");\n    revalidatePath("/career");\n    return { ok: true };\n}\n',
    "V1 deleteJob throws on not-found")
sub("src/app/actions/settings-actions.ts",
    'export async function createLeader(formData: FormData): Promise<ActionResult> {\n    const supabase = await createClient();\n',
    'export async function createLeader(formData: FormData): Promise<ActionResult> {\n    const supabase = await createClient();\n    await supabase.from("leaders").select("id");\n',
    "V2 createLeader reads before the session check")
sub("src/app/admin/(dashboard)/careers/CareersClient.tsx",
    'const result = await deleteJob(id);\n',
    'const result = await deleteJob(id);\n                window.location.reload();\n',
    "V3 CareersClient reloads before checking .ok")
sub("src/app/admin/(dashboard)/reports/ReportsClient.tsx",
    '<p role="alert" className="flex items-start gap-2 text-sm leading-relaxed text-red-400">\n                                    <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />\n                                    {saveError}',
    '<p className="flex items-start gap-2 text-sm leading-relaxed text-red-400">\n                                    <TriangleAlert size={15} className="mt-0.5 flex-none" aria-hidden="true" />\n                                    {saveError}',
    "V4 save error loses role=alert")
sub("src/app/admin/(dashboard)/reports/ReportsClient.tsx",
    '<td className="px-6 py-4 text-white/50">{r.year}</td>',
    '<td className="px-6 py-4 text-white/50" dangerouslySetInnerHTML={{ __html: String(r.year) }} />',
    "V5 new render sink")
sub("src/app/admin/(dashboard)/who-we-are/WhoWeAreClient.tsx",
    'import { Plus, Trash2, TriangleAlert } from "lucide-react";',
    'import { Plus, Trash2, TriangleAlert } from "lucide-react";\nimport { seedSettingsFromDefaults } from "@/app/actions/settings-actions";',
    "V6 new Server Action import")
sub("src/app/admin/(dashboard)/reports/ReportsClient.tsx",
    '        let failure: string | null = null;\n        try {\n            const fd = new FormData();\n            fd.set("file", file);\n            const result = await uploadFile(fd, "reports");',
    '        let failure: string | null = null;\n        const fd = new FormData();\n        fd.set("file", file);\n        const result = await uploadFile(fd, "reports");\n        try {',
    "V7 uploadFile called outside its try")
EOF

echo "== 3. mutated copy (expect exit 1 and a FAIL for each violation)"
set +e
node "$HERE/t015-static-invariants.mjs" "$S" > "$S/out.txt"; rc=$?
set -e
grep -E "FAIL|RESULT" "$S/out.txt"
echo "checker exit on mutated copy: $rc"
[ "$rc" -eq 1 ] && echo "NEGATIVE CONTROL: PASS (checker rejected the seeded violations)" || { echo "NEGATIVE CONTROL: FAIL"; exit 1; }
