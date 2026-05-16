import type { MigrationInterface, QueryRunner } from "typeorm";
/**
 * Baseline schema migration.
 *
 * Creates the three tables the application depends on:
 *   - users          — one row per account, holds the argon2id'd auth hash + KDF metadata.
 *   - vault_items    — opaque per-user encrypted blobs.
 *   - refresh_tokens — server-side rotating refresh-token store (hashes only).
 *
 * Why hand-written SQL instead of TypeORM's schema-build API:
 *   The DDL is short, greppable, and reviewable in one place. TypeORM's
 *   builder API would generate equivalent statements but obscure the
 *   constraints — and the CHECK + composite indexes below benefit from
 *   being explicit.
 *
 * Idempotency:
 *   `up` is NOT idempotent (no IF NOT EXISTS on tables) — TypeORM tracks
 *   which migrations have run via the migrations table, so running it
 *   twice would already be prevented by the framework.
 */
export declare class Baseline1700000000000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
//# sourceMappingURL=1700000000000-Baseline.d.ts.map