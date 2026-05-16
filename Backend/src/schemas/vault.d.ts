import { z } from "zod";
/** AES-GCM IV is exactly 12 bytes → 24 hex chars. Tight schema = early failure. */
export declare const ivSchema: z.ZodString;
/** Hex-only ciphertext, bounded length. `*2` because each byte is two hex chars. */
export declare const ciphertextSchema: z.ZodString;
export declare const createBody: z.ZodObject<{
    iv: z.ZodString;
    encrypted_data: z.ZodString;
}, z.core.$strip>;
/**
 * Partial-update schema.
 *
 * `.refine()` enforces "at least one of iv or encrypted_data must be set"
 * — accepting an empty `{}` is meaningless work.
 *
 * Why both fields often update together:
 *   AES-GCM requires a fresh IV on every re-encryption. Updating the
 *   ciphertext without the IV would yield a row that can't be decrypted.
 */
export declare const updateBody: z.ZodObject<{
    iv: z.ZodOptional<z.ZodString>;
    encrypted_data: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const idParam: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Cursor-pagination query.
 *
 * `after` is the ID returned by the previous page. The service uses
 * `id > after` to generate the next slice — see VaultService.list.
 */
export declare const listQuery: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    after: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=vault.d.ts.map