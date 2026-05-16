import { User } from "./User.js";
/**
 * `vault_items` table.
 *
 * Use case:
 *   One row per stored credential. The server treats each row as an opaque
 *   encrypted blob — it does not know the website, username, or password
 *   inside `encrypted_data`.
 *
 * Zero-knowledge contract:
 *   - `iv` (initialisation vector): 12 random bytes, fresh per encryption.
 *     AES-GCM **must not** reuse an (iv, key) pair — doing so leaks the XOR
 *     of the plaintexts. The client re-rolls the IV on every encrypt call.
 *   - `encrypted_data`: hex-encoded AES-GCM-256 ciphertext including the auth
 *     tag. Anyone without the key (derived from the master password) sees
 *     random bytes.
 *   - No columns for website/username/notes. If we added them, we'd break the
 *     "server cannot read your vault" guarantee.
 *
 * Why the @Index on user_id:
 *   The primary query pattern is `WHERE user_id = $1 ORDER BY id`. Without
 *   an index that becomes a full table scan; with one it's an index range
 *   scan regardless of how many other users' rows exist in the table.
 *
 * CASCADE delete:
 *   When a user row is deleted, Postgres removes their vault rows
 *   automatically — no stale ciphertext survives account deletion.
 */
export declare class VaultItem {
    id: string;
    user_id: string;
    user: User;
    iv: string;
    encrypted_data: string;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=VaultItem.d.ts.map