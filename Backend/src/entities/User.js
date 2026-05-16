var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
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
let User = class User {
    // UUIDs (not auto-increment integers) so user IDs are not enumerable and
    // don't leak "how many users we have" through ID values in logs/tokens.
    id;
    email;
    // Server-side argon2id hash of the client's auth_hash. Never reversed.
    auth_hash;
    // Hex-encoded 16-byte salt, per user. Required by the client on every login
    // to re-derive the same AES key from the master password.
    kdf_salt;
    // PBKDF2 iteration count the client used to derive this user's key.
    // Per-user so we can bump the default without invalidating old accounts.
    kdf_iterations;
    created_at;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column({ type: "varchar", unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "auth_hash", void 0);
__decorate([
    Column({ type: "varchar" }),
    __metadata("design:type", String)
], User.prototype, "kdf_salt", void 0);
__decorate([
    Column({ type: "integer", default: 600000 }),
    __metadata("design:type", Number)
], User.prototype, "kdf_iterations", void 0);
__decorate([
    CreateDateColumn({ type: "timestamp" }),
    __metadata("design:type", Date)
], User.prototype, "created_at", void 0);
User = __decorate([
    Entity("users")
], User);
export { User };
//# sourceMappingURL=User.js.map