import type { FastifyReply, FastifyRequest } from "fastify";
import type { AuthService } from "../services/auth.service.js";
/**
 * AuthController — factory returning route handlers.
 *
 * Factory pattern (vs class with methods):
 *   We could have exposed a class with bound methods, but Fastify handlers
 *   are plain functions — a factory avoids `this`-binding footguns when
 *   the handler is passed by reference to `fastify.get(...)`.
 */
export declare function createAuthController(service: AuthService): {
    /** GET /auth/salt?email=... */
    salt(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** POST /auth/register */
    register(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** POST /auth/login */
    login(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** POST /auth/refresh */
    refresh(request: FastifyRequest, reply: FastifyReply): Promise<never>;
    /** POST /auth/logout */
    logout(request: FastifyRequest, reply: FastifyReply): Promise<never>;
};
export type AuthController = ReturnType<typeof createAuthController>;
//# sourceMappingURL=auth.controller.d.ts.map