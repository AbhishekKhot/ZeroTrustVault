import { User } from "./User.js";
/**
 * `refresh_tokens` table.
 *
 * Use case:
 *   Powers the rotating-refresh-token auth model. A row per issued refresh
 *   token; the client holds the raw token in an httpOnly cookie and sends it
 *   back on `POST /auth/refresh`, which verifies + rotates it.
 *
 * Why refresh tokens exist at all:
 *   The access token (JWT) is short-lived (15 min). If a user's access token
 *   is stolen, the attacker has at most 15 minutes of use. A long-lived
 *   refresh token lets the user stay "logged in" for days without us having
 *   to make the access token long-lived too.
 *
 * Why we store a HASH, not the raw token:
 *   If the DB leaks, the attacker gets sha256(tokenSecret), not tokenSecret
 *   itself. SHA-256 is not reversible, so the leak cannot be replayed.
 *   We use plain SHA-256 (not argon2) because:
 *     1. The input is a 32-byte random value — already high-entropy — so
 *        slow hashing provides no additional brute-force protection.
 *     2. Refresh endpoints are hot-path; argon2 would add 100-500 ms per call.
 *
 * Rotation:
 *   Each use of a refresh token sets `revoked_at` on the old row and issues
 *   a brand-new token. If an attacker ever replays a revoked token we
 *   detect it (revoked_at != null) and can invalidate the whole session.
 */
export declare class RefreshToken {
    id: string;
    user_id: string;
    user: User;
    token_hash: string;
    expires_at: Date;
    revoked_at: Date | null;
    created_at: Date;
}
//# sourceMappingURL=RefreshToken.d.ts.map