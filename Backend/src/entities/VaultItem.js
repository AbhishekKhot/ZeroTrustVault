var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
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
let VaultItem = class VaultItem {
    id;
    user_id;
    user;
    // 24 hex chars = 12 bytes = the AES-GCM IV size.
    iv;
    // Hex ciphertext. A CHECK constraint in the migration caps length at
    // 131072 hex chars (64 KiB of bytes) so a malicious client can't balloon
    // a single row.
    encrypted_data;
    created_at;
    updated_at;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], VaultItem.prototype, "id", void 0);
__decorate([
    Index(),
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], VaultItem.prototype, "user_id", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "user_id" }),
    __metadata("design:type", User)
], VaultItem.prototype, "user", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], VaultItem.prototype, "iv", void 0);
__decorate([
    Column({ type: "text" }),
    __metadata("design:type", String)
], VaultItem.prototype, "encrypted_data", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], VaultItem.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn(),
    __metadata("design:type", Date)
], VaultItem.prototype, "updated_at", void 0);
VaultItem = __decorate([
    Entity("vault_items")
], VaultItem);
export { VaultItem };
//# sourceMappingURL=VaultItem.js.map