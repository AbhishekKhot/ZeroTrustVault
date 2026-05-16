import { randomBytes, createHash } from "node:crypto";
import { IsNull, LessThan } from "typeorm";
import { RefreshToken } from "../entities/RefreshToken.js";
import { UnauthorizedError } from "../errors/AppError.js";
/**
 * Token service — issues / rotates / revokes access + refresh tokens.
 *
 * ── Design pattern: Service Layer ─────────────────────────────────────────
 * Business logic that the controller (HTTP layer) depends on. It knows
 * nothing about Fastify requests or replies — only about users and tokens.
 *
 * ── Design pattern: Dependency Injection (constructor) ────────────────────
 * We take the TypeORM repository and the Fastify JWT signer through the
 * constructor rather than reaching into a module-level singleton. This
 * makes the service:
 *   - Testable: pass a stub repo + a fake signer in unit tests.
 *   - Reusable: no hidden coupling to `AppDataSource` / `fastify` singletons.
 *
 * ── Design pattern: Repository pattern (via TypeORM) ──────────────────────
 * `Repository<RefreshToken>` abstracts the data-access details
 * (SQL, connection pooling). Services never write raw SQL here — they
 * speak to the repo in entity terms.
 */
const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export class TokenService {
    refreshRepository;
    jwt;
    constructor(refreshRepository, jwt) {
        this.refreshRepository = refreshRepository;
        this.jwt = jwt;
    }
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
    hash(raw) {
        return createHash("sha256").update(raw).digest("hex");
    }
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
    async issue(userId, email) {
        const accessToken = this.jwt.sign({ id: userId, email }, { expiresIn: ACCESS_TOKEN_TTL });
        // 32 bytes from CSPRNG → 256 bits of entropy. Not brute-forceable.
        const rawRefresh = randomBytes(32).toString("hex");
        const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
        await this.refreshRepository.save(this.refreshRepository.create({
            user_id: userId,
            token_hash: this.hash(rawRefresh),
            expires_at: refreshExpiresAt,
            revoked_at: null,
        }));
        return { accessToken, refreshToken: rawRefresh, refreshExpiresAt };
    }
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
    async rotate(rawRefresh) {
        const tokenHash = this.hash(rawRefresh);
        const record = await this.refreshRepository.findOne({ where: { token_hash: tokenHash } });
        if (!record || record.revoked_at || record.expires_at < new Date()) {
            throw new UnauthorizedError("Invalid refresh token");
        }
        record.revoked_at = new Date();
        await this.refreshRepository.save(record);
        return { userId: record.user_id };
    }
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
    async revoke(rawRefresh) {
        await this.refreshRepository
            .update({ token_hash: this.hash(rawRefresh), revoked_at: IsNull() }, { revoked_at: new Date() })
            .catch(() => undefined);
    }
    /**
     * Delete expired refresh tokens.
     *
     * Called at boot (see [auth.routes.ts](../routes/auth.ts)). Without this
     * sweep, the `refresh_tokens` table grows unbounded as rows expire
     * and get revoked. This is the classic "background cleanup" job —
     * stateless, idempotent, safe to run concurrently on replicas.
     */
    async purgeExpired() {
        await this.refreshRepository
            .delete({ expires_at: LessThan(new Date()) })
            .catch(() => undefined);
    }
}
/**
 * Factory — convenience wrapper so callers don't have to wire the repo and
 * signer manually. This is effectively a tiny composition root.
 */
export function createTokenService(fastify, refreshRepository) {
    return new TokenService(refreshRepository, fastify.jwt);
}
//# sourceMappingURL=token.service.js.map