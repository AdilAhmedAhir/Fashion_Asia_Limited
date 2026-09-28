---
title: Authenticate Server Actions Like API Routes
impact: CRITICAL
impactDescription: prevents unauthorized access to server mutations
tags: server, server-actions, authentication, security, authorization
---

## Authenticate Server Actions Like API Routes

**Impact: CRITICAL (prevents unauthorized access to server mutations)**

Server Actions (functions with `"use server"`) are exposed as public endpoints, just like API routes. Always verify authentication and authorization **inside** each Server Action—do not rely solely on middleware, layout guards, or page-level checks, as Server Actions can be invoked directly.

Next.js documentation explicitly states: "Treat Server Actions with the same security considerations as public-facing API endpoints, and verify if the user is allowed to perform a mutation."

**Incorrect (no authentication check):**

```typescript
'use server'

export async function deleteUser(userId: string) {
  // Anyone can call this! No auth check
  await db.user.delete({ where: { id: userId } })
  return { success: true }
}
```

**Correct for this project (the session is checked inside the action, and a typed result is returned instead of throwing):**

> Fashion Asia rewrite, 2026-09-28. The upstream examples `throw`, and Next.js redacts thrown
> Server Action messages in production, so the admin would see nothing. Every action here returns
> `{ ok: true } | { ok: false; error }` (see `docs/TECH_STACK.md`, "Server Action failure-reporting convention").

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function deleteReport(id: string): Promise<ActionResult> {
  // Every "use server" export is a public endpoint: check the session here, not only in middleware
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Your session expired. Sign in again and retry.' }

  if (!id) return { ok: false, error: 'Missing report id.' }

  const { data, error } = await supabase
    .from('reports').delete().eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('deleteReport failed', error) // raw details stay in the server log
    return { ok: false, error: "Couldn't delete the report. Try again." }
  }
  if (!data) return { ok: false, error: 'Report not found. Reload the page to see the current list.' }
  return { ok: true }
}
```

**With input validation (no schema library: this project adds no package without an `architect-reviewer` decision):**

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateLeaderName(id: string, input: unknown): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Your session expired. Sign in again and retry.' }

  // Validate every boundary input, and never trust the client
  const raw = (input as { name?: unknown } | null)?.name
  const name = typeof raw === 'string' ? raw.trim() : ''
  if (!id) return { ok: false, error: 'Missing leader id.' }
  if (!name || name.length > 255) return { ok: false, error: 'Enter a name of 1 to 255 characters.' }

  const { data, error } = await supabase
    .from('leaders').update({ name }).eq('id', id).select('id').maybeSingle()
  if (error) {
    console.error('updateLeaderName failed', error)
    return { ok: false, error: "Couldn't save the leader. Try again." }
  }
  if (!data) return { ok: false, error: 'Leader not found. Reload the page to see the current list.' }
  return { ok: true }
}
```

> Today any signed-in account passes `getUser()`. The admin allowlist (T-023) will replace
> it with a shared `requireAdmin()`.

Reference: [https://nextjs.org/docs/app/guides/authentication](https://nextjs.org/docs/app/guides/authentication)
