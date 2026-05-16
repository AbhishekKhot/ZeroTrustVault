/**
 * `users` table.
 *
 * Use case:
 *   One row per account. Stores *only* what the server needs to prove identity
 *   at login time — never plaintext passwords, never derived encryption keys.
 *
 * Zero-knowledge contract:
 *   - `auth_hash` is `argon2id(SHA-256(encryptionKey))`. The client sends the
 *     SHA-256 hash; we hash it a second time with argon2 before storing.
 *     That means even a full DB dump does not yield a value that can be
 *     replayed against /auth/login — the attacker would have to brute-force
 *     argon2 first, then brute-force the user's master password through PBKDF2.
 *   - `kdf_salt` is a 16-byte random value generated in the browser at
 *     registration. It's public (returned by GET /auth/salt) because its job
 *     is to defeat rainbow tables, not to be secret.
 *   - `kdf_iterations` is stored per-user so we can raise the floor (e.g.
 *     600k → 1M) without forcing re-enrollment — old users keep their
 *     original iteration count until they rotate their password.
 */
export declare class User {
    id: string;
    email: string;
    auth_hash: string;
    kdf_salt: string;
    kdf_iterations: number;
    created_at: Date;
}
//# sourceMappingURL=User.d.ts.map