import type { FastifyReply, FastifyRequest } from "fastify";
import type { VaultService } from "../services/vault.service.js";
/**
 * Vault controller — HTTP adapter over VaultService.
 *
 * ── Design pattern: Controller (MVC) ──────────────────────────────────────
 * Parses request inputs (body / params / query) via zod, extracts
 * `request.user.id` from the JWT, and calls the service. Responses are
 * plain JSON — no cookies, no special headers.
 *
 * Why a factory (not a class):
 *   Fastify handlers are plain functions. A factory avoids `this`-binding
 *   surprises when we pass the handler by reference to `fastify.get(...)`.
 */
export declare function createVaultController(service: VaultService): {
    /** GET /vault — list authenticated user's items. */
    list(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** POST /vault — create a new encrypted item. */
    create(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** PUT /vault/:id — partial update of iv and/or encrypted_data. */
    update(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** DELETE /vault/:id — remove an item the user owns. */
    remove(request: FastifyRequest, reply: FastifyReply): Promise<never>;
};
export type VaultController = ReturnType<typeof createVaultController>;
//# sourceMappingURL=vault.controller.d.ts.map