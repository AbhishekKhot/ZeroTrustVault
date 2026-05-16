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
export class Baseline1700000000000 implements MigrationInterface {
    name = "Baseline1700000000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // pgcrypto provides gen_random_uuid() — used as the column default
        // so manual INSERTs (psql / pgcli) work without specifying an id.
        // TypeORM's @PrimaryGeneratedColumn("uuid") still generates ids in
        // the app layer; the default is a belt-and-suspenders fallback.
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "email" varchar(254) NOT NULL,
                "auth_hash" varchar NOT NULL,
                "kdf_salt" varchar(64) NOT NULL,
                "kdf_iterations" integer NOT NULL DEFAULT 600000,
                "created_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "uq_users_email" UNIQUE ("email")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "vault_items" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "iv" varchar(24) NOT NULL,
                "encrypted_data" text NOT NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                "updated_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "fk_vault_items_user"
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "ck_vault_items_iv_len" CHECK (char_length("iv") = 24),
                CONSTRAINT "ck_vault_items_data_len" CHECK (char_length("encrypted_data") <= 131072)
            )
        `);
        await queryRunner.query(
            `CREATE INDEX "idx_vault_items_user_id" ON "vault_items"("user_id")`,
        );

        await queryRunner.query(`
            CREATE TABLE "refresh_tokens" (
                "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "token_hash" varchar(64) NOT NULL,
                "expires_at" timestamp NOT NULL,
                "revoked_at" timestamp NULL,
                "created_at" timestamp NOT NULL DEFAULT now(),
                CONSTRAINT "fk_refresh_tokens_user"
                    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "uq_refresh_tokens_hash" UNIQUE ("token_hash")
            )
        `);
        await queryRunner.query(
            `CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens"("user_id")`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vault_items"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
