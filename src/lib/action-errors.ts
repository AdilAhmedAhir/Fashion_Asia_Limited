/**
 * ============================================================================
 *  SERVER ACTION FAILURES (T-018) — fixed answers, raw errors logged
 * ============================================================================
 *
 *  A database or storage error's own text (a constraint, a column, a policy,
 *  a Postgres code) never reaches a Server Action's result. The admin sees one
 *  of four fixed messages instead, and the raw error is logged on the server
 *  under a fixed context label (docs/SECURITY.md SEC-MED-8). A label names the
 *  function and the step, never anything the caller sent.
 *
 *  Plain TypeScript with no imports. Deliberately NOT a "use server" module:
 *  every export of one is a public endpoint (docs/STACK.md §5), and these
 *  helpers must not become endpoints. Only the three action files import it
 *  (settings-actions.ts, products-actions.ts and jobs-actions.ts), never a
 *  client component.
 * ============================================================================
 */

// One fixed answer per kind of failure. Private: a caller names the kind,
// never the words, so no branch can hand back its own text by mistake.
const FAILURE_MESSAGES = {
    save: "Something went wrong, so nothing was saved. Try again in a moment.",
    delete: "Something went wrong, so nothing was deleted. Try again in a moment.",
    read: "Nothing was saved, because the saved data couldn't be read. Try again in a moment.",
    upload: "The file couldn't be uploaded. Try again in a moment.",
} as const;

/**
 * @purpose Log a Server Action's raw database error on the server only, for a branch that returns its own fixed message.
 * Logs the context label and the error object (code, message, details, hint),
 * and nothing else: never the request payload, form data, user, cookies or tokens.
 */
export function logActionError(context: string, error: unknown): void {
    console.error(context, error);
}

/**
 * @purpose A Server Action's answer to a database or storage failure: logs the raw error on the server, then returns that kind's fixed message, never the database's text.
 */
export function actionFailure(
    kind: "save" | "delete" | "read" | "upload",
    context: string,
    error: unknown,
): { ok: false; error: string } {
    logActionError(context, error);
    return { ok: false, error: FAILURE_MESSAGES[kind] };
}
