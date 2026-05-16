/**
 * Domain error hierarchy.
 *
 * ── Design pattern: Custom Exception / Typed Error hierarchy ──────────────
 * Services throw rich, typed errors that describe *what went wrong in
 * business terms* (e.g. "email already exists"). Controllers (and the
 * global error handler in `index.ts`) map them to HTTP status codes.
 *
 * Why this matters — separation of concerns:
 *   - Services know nothing about HTTP. They cannot set `reply.status(409)`
 *     because they don't own the response object. Throwing `ConflictError`
 *     keeps them transport-agnostic — the same service could be called
 *     from a gRPC handler, a CLI, or a test without changes.
 *   - Controllers translate the domain error to an HTTP status. The mapping
 *     is one place, easy to audit ("which errors leak which status?").
 *
 * Anti-pattern this replaces:
 *   Returning `{ ok: false, error: "..." }` tuples from services. That
 *   forces every caller to branch on a boolean, and there is no compiler
 *   help for exhaustiveness. Throwing typed errors lets TypeScript enforce
 *   the shape at the mapping site.
 */
/**
 * Base class for all errors thrown by the service layer.
 *
 * - `statusCode` is the HTTP status the controller should use when mapping.
 * - `expose: true` means the message is safe to surface to the client
 *   (validation failures, not-found, etc.). We keep it `false` on 5xx so
 *   internals aren't leaked — matching the policy in [index.ts](../index.ts).
 */
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly expose: boolean;
    constructor(message: string, statusCode: number, expose?: boolean);
}
/** 400 — request failed schema validation or a business precondition. */
export declare class ValidationError extends AppError {
    readonly details?: unknown;
    constructor(message: string, details?: unknown);
}
/** 401 — caller could not prove identity (bad credentials, expired/missing token). */
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
/** 404 — the requested resource does not exist (or caller is not allowed to see it). */
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
/** 409 — valid request, but conflicts with current state (duplicate email, quota reached). */
export declare class ConflictError extends AppError {
    constructor(message: string);
}
//# sourceMappingURL=AppError.d.ts.map