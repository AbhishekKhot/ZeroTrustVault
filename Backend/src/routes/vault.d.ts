import type { FastifyInstance } from "fastify";
/**
 * Vault routes — URL-to-controller wiring, JWT-gated.
 *
 * Layering: routes → controllers → services → entities.
 *
 * Design pattern: Composition Root.
 *   Services/controllers are constructed here once at plugin boot and
 *   passed to Fastify by reference. No globals, no DI container — just
 *   explicit wiring suitable for a small, focused codebase.
 *
 * Auth gating:
 *   Every route runs `fastify.authenticate` as an `onRequest` hook. That
 *   decorator is defined in [index.ts](../index.ts) and verifies the JWT
 *   access-token cookie, populating `request.user`. A failure there
 *   short-circuits to 401 before the controller runs.
 */
export default function vaultRoutes(fastify: FastifyInstance): Promise<void>;
//# sourceMappingURL=vault.d.ts.map