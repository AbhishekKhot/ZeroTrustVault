import "reflect-metadata";
import Fastify from "fastify";
/**
 * Application entry point.
 *
 * Responsibilities (in order):
 *   1. Build a configured Fastify instance with all security plugins.
 *   2. Initialise the TypeORM DataSource and run pending migrations.
 *   3. Listen on the configured port.
 *
 * Exposed as a factory (`buildServer`) so tests can boot the HTTP layer
 * without binding to a port.
 */
export declare function buildServer(): Promise<Fastify.FastifyInstance<import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>, import("node:http").IncomingMessage, import("node:http").ServerResponse<import("node:http").IncomingMessage>, Fastify.FastifyBaseLogger, Fastify.FastifyTypeProviderDefault>>;
//# sourceMappingURL=index.d.ts.map