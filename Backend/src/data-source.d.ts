import "reflect-metadata";
import { DataSource } from "typeorm";
/**
 * TypeORM DataSource — single source of truth for DB access.
 *
 * Why this file is separate from `index.ts`:
 *   The TypeORM CLI (`typeorm migration:generate`, `migration:create`) needs
 *   a module that exports a DataSource *without* booting Fastify. Keeping the
 *   DataSource here means the CLI can import it, and so can the app.
 *
 * `synchronize: false` is critical — autosync would silently drop or alter
 * columns. All schema changes go through numbered migrations under
 * `src/migrations/`, which are run at boot via `runMigrations()` in index.ts.
 *
 * `migrationsRun: false` — we call `runMigrations()` explicitly in the boot
 * sequence so we can log it and fail fast with a clear error.
 */
export declare const AppDataSource: DataSource;
//# sourceMappingURL=data-source.d.ts.map