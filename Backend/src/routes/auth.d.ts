import type { FastifyInstance } from "fastify";
/**
 * Auth routes — URL-to-controller wiring.
 *
 * ── Layering (top → bottom of the call stack) ─────────────────────────────
 *   routes/      — Fastify URL wiring + auth-plugin registration (this file).
 *   controllers/ — HTTP adapter: parses input, calls service, shapes reply.
 *   services/    — business logic, zero HTTP knowledge.
 *   entities/    — ORM mapping.
 *
 * ── Design pattern: Composition Root ──────────────────────────────────────
 * This function is where services and controllers are *constructed and
 * wired together*, once, at process start. Elsewhere, the controller is
 * handed to the route by reference. Keeping construction here (rather
 * than using a DI container) is the simplest working option for a small
 * codebase — see Mark Seemann's "Composition Root" concept.
 *
 * Note on the purge sweep at the bottom:
 *   We run `tokens.purgeExpired()` at plugin boot to trim old refresh
 *   rows. `.catch(() => undefined)` keeps a transient DB hiccup from
 *   blocking server startup.
 */
export default function authRoutes(fastify: FastifyInstance): Promise<void>;
//# sourceMappingURL=auth.d.ts.map