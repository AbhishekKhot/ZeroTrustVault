var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from "typeorm";
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
let RefreshToken = class RefreshToken {
    id;
    // Indexed because we may want to revoke all tokens for a user (e.g. on
    // "sign out everywhere") — that query filters by user_id.
    user_id;
    user;
    // SHA-256(tokenSecret). We never store the raw token.
    // Unique index: lets us look up a refresh token by hash in O(log n)
    // during /auth/refresh AND prevents duplicate hashes (collision defense).
    token_hash;
    expires_at;
    // Null = still valid. Non-null = rotated or explicitly revoked on logout.
    revoked_at;
    created_at;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], RefreshToken.prototype, "id", void 0);
__decorate([
    Index(),
    Column({ type: "uuid" }),
    __metadata("design:type", String)
], RefreshToken.prototype, "user_id", void 0);
__decorate([
    ManyToOne(() => User, { onDelete: "CASCADE" }),
    JoinColumn({ name: "user_id" }),
    __metadata("design:type", User)
], RefreshToken.prototype, "user", void 0);
__decorate([
    Index({ unique: true }),
    Column({ type: "varchar", length: 64 }),
    __metadata("design:type", String)
], RefreshToken.prototype, "token_hash", void 0);
__decorate([
    Column({ type: "timestamp" }),
    __metadata("design:type", Date)
], RefreshToken.prototype, "expires_at", void 0);
__decorate([
    Column({ type: "timestamp", nullable: true }),
    __metadata("design:type", Object)
], RefreshToken.prototype, "revoked_at", void 0);
__decorate([
    CreateDateColumn(),
    __metadata("design:type", Date)
], RefreshToken.prototype, "created_at", void 0);
RefreshToken = __decorate([
    Entity("refresh_tokens")
], RefreshToken);
export { RefreshToken };
//# sourceMappingURL=RefreshToken.js.map