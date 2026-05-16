import type { Repository } from "typeorm";
import { User } from "../entities/User.js";
import type { IssuedTokens, TokenService } from "./token.service.js";
export interface SaltResponse {
    salt: string;
    iterations: number;
}
export interface LoginResult extends IssuedTokens {
    user: {
        id: string;
        email: string;
    };
}
export declare class AuthService {
    private readonly userRepository;
    private readonly tokens;
    constructor(userRepository: Repository<User>, tokens: TokenService);
    /**
     * Return the stored salt + iteration count for a given email.
     *
     * Use case:
     *   The client needs both values to re-run PBKDF2 and arrive at the
     *   same AES key that was derived at registration. Called by /login
     *   and /unlock flows.
     *
     * Known enumeration trade-off:
     *   A 404 here tells an attacker "this email is not registered". We
     *   accept that because: (a) the salt has to be stable per user —
     *   returning a random one per call would break real logins; and
     *   (b) /auth/* is rate-limited to 5/min/IP.
     */
    getSalt(email: string): Promise<SaltResponse>;
    /**
     * Create a new user account.
     *
     * Inputs:
     *   - `email`            — normalised (lowercased) by the zod schema.
     *   - `authHash`         — client's SHA-256(encryptionKey), 32 hex bytes.
     *   - `kdfSalt`          — client-generated 16-byte CSPRNG salt.
     *
     * Why argon2id on top of a SHA-256 hash:
     *   argon2id is memory-hard, so brute-forcing it requires both CPU
     *   and RAM — unlike plain SHA-256 which is GPU-friendly. We cannot
     *   pick our own PBKDF2 parameters here because PBKDF2 happened on
     *   the client; argon2id is our server-side defence against DB leaks.
     */
    register(input: {
        email: string;
        authHash: string;
        kdfSalt: string;
    }): Promise<void>;
    /**
     * Verify credentials and issue a fresh token pair.
     *
     * Timing-attack defence:
     *   If the user doesn't exist we'd normally skip argon2.verify and
     *   return 401 much faster than for a real user — leaking
     *   "this email is registered" via response-time side channel.
     *   We run `argon2.verify` against `DUMMY_ARGON2_HASH` on the miss
     *   branch to equalise latency. The comma operator discards the
     *   return value and forces `valid` to `false`.
     */
    login(input: {
        email: string;
        authHash: string;
    }): Promise<LoginResult>;
    /**
     * Rotate a valid refresh token into a brand-new (access, refresh) pair.
     *
     * The token service verifies + revokes the presented token. We then
     * look up the user and issue a new pair. Note that we re-fetch the
     * user here (not cached in the refresh row) so that a deleted user
     * cannot keep refreshing tokens from an old valid refresh record.
     */
    refresh(rawRefreshToken: string): Promise<IssuedTokens>;
    /**
     * Server-side revocation of the presented refresh token.
     *
     * Intentionally accepts an `undefined` token (cookie may be missing
     * if the browser state is partially cleared) and is a no-op in that
     * case — the caller clears cookies either way.
     */
    logout(rawRefreshToken: string | undefined): Promise<void>;
}
//# sourceMappingURL=auth.service.d.ts.map