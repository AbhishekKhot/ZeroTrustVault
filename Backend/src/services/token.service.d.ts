import { type Repository } from "typeorm";
import type { FastifyInstance } from "fastify";
import { RefreshToken } from "../entities/RefreshToken.js";
export interface IssuedTokens {
    accessToken: string;
    refreshToken: string;
    /** Refresh-token expiry, used by the controller to set cookie maxAge. */
    refreshExpiresAt: Date;
}
/**
 * Minimal JWT signer contract the service needs.
 *
 * Why a narrow interface instead of `FastifyInstance`:
 *   Classic Interface Segregation Principle — we only need `.jwt.sign`, so
 *   we declare only that. Tests don't have to fake the entire Fastify API.
 */
export interface JwtSigner {
    sign: (payload: object, options?: {
        expiresIn?: string;
    }) => string;
}
export declare class TokenService {
    private readonly refreshRepository;
    private readonly jwt;
    constructor(refreshRepository: Repository<RefreshToken>, jwt: JwtSigner);
    /**
     * Hashes a raw refresh token with SHA-256 before storage or lookup.
     *
     * Why SHA-256 (not argon2id) for refresh tokens:
     *   The raw token is already 32 cryptographic bytes (256 bits of
     *   entropy from `randomBytes`). Brute-forcing a random 256-bit value
     *   is infeasible regardless of hash speed, so a slow hash buys
     *   nothing — it only burns CPU on every auth'd request.
     *   (This is a fundamentally different input from a user-chosen
     *   password, where slow hashing is essential.)
     */
    private hash;
    /**
     * Issue a fresh (access, refresh) token pair for a user.
     *
     * Called from:
     *   - AuthService.login
     *   - AuthService.refresh (after rotating the old one)
     *
     * Why refresh tokens are stored server-side:
     *   The access JWT is self-verifying (HMAC). The refresh token is an
     *   opaque random blob — the server looks it up by hash to decide
     *   validity. That gives us server-side revocation: we can kill a
     *   session immediately rather than waiting for the JWT to expire.
     */
    issue(userId: string, email: string): Promise<IssuedTokens>;
    /**
     * Rotate a refresh token: verify, revoke the old row, and return the
     * owning user id/email so the caller can issue a new pair.
     *
     * Throws `UnauthorizedError` if the token is missing, revoked, expired,
     * or the owning user no longer exists. The caller (controller) should
     * clear cookies when it catches this error.
     *
     * Why rotation matters:
     *   If a refresh token is leaked, it's burned on first use by either
     *   party. A second attempted use indicates theft — a future version
     *   could detect the reuse and kill every session for that user.
     */
    rotate(rawRefresh: string): Promise<{
        userId: string;
    }>;
    /**
     * Best-effort revocation for logout.
     *
     * Why `IsNull()` in the filter:
     *   We only update rows that aren't already revoked — makes the operation
     *   idempotent so double-clicking "logout" doesn't re-stamp the row.
     *
     * Why the swallow-catch:
     *   If the DB is momentarily flaky during logout we'd rather clear the
     *   client's cookies anyway than error out — the user's intent was
     *   "get me out", not "retry later".
     */
    revoke(rawRefresh: string): Promise<void>;
    /**
     * Delete expired refresh tokens.
     *
     * Called at boot (see [auth.routes.ts](../routes/auth.ts)). Without this
     * sweep, the `refresh_tokens` table grows unbounded as rows expire
     * and get revoked. This is the classic "background cleanup" job —
     * stateless, idempotent, safe to run concurrently on replicas.
     */
    purgeExpired(): Promise<void>;
}
/**
 * Factory — convenience wrapper so callers don't have to wire the repo and
 * signer manually. This is effectively a tiny composition root.
 */
export declare function createTokenService(fastify: FastifyInstance, refreshRepository: Repository<RefreshToken>): TokenService;
//# sourceMappingURL=token.service.d.ts.map