import type { Repository } from "typeorm";
import { VaultItem } from "../entities/VaultItem.js";
export interface ListArgs {
    userId: string;
    limit?: number;
    after?: string;
}
export interface ListResult {
    items: VaultItem[];
    nextCursor: string | null;
}
export interface CreateArgs {
    userId: string;
    iv: string;
    encrypted_data: string;
}
export interface UpdateArgs {
    userId: string;
    id: string;
    iv?: string;
    encrypted_data?: string;
}
export interface DeleteArgs {
    userId: string;
    id: string;
}
export declare class VaultService {
    private readonly vaultRepository;
    constructor(vaultRepository: Repository<VaultItem>);
    /**
     * List a user's encrypted vault items, cursor-paginated.
     *
     * Concept — "cursor pagination" (a.k.a. keyset pagination):
     *   We return rows with `id > after`. This is stable under concurrent
     *   inserts — unlike offset pagination which skips or repeats rows
     *   when the underlying set mutates between pages.
     *
     * Trick — "limit + 1":
     *   We request one row more than the page size. If we get it, another
     *   page exists and we emit the last-included row's ID as the next
     *   cursor. If not, we're on the last page (`nextCursor: null`). This
     *   avoids a second `count(*)` query.
     */
    list({ userId, limit, after }: ListArgs): Promise<ListResult>;
    /**
     * Create a new encrypted item for the user.
     *
     * Why we `count` before insert:
     *   Enforces MAX_ITEMS_PER_USER. There is a theoretical TOCTOU race
     *   (two concurrent inserts could both observe count=9999 and both
     *   win at 10000) but it is not exploitable in practice — hitting
     *   this quota is already an anomalous signal worth investigating.
     *
     * Why the service does not validate hex format:
     *   That's the controller's zod-schema job. By the time args reach
     *   the service, shape and size are already guaranteed. Re-validating
     *   here would duplicate responsibility and drift over time.
     */
    create({ userId, iv, encrypted_data }: CreateArgs): Promise<VaultItem>;
    /**
     * Update an existing vault item, enforcing per-user ownership.
     *
     * Why one UPDATE with RETURNING instead of SELECT + UPDATE:
     *   Single round-trip. The `WHERE id = :id AND user_id = :userId`
     *   clause is also implicit authorisation — a user cannot touch
     *   another user's row even if they guess a UUID, because the WHERE
     *   won't match.
     *
     * Why we build `updates` step-by-step:
     *   `exactOptionalPropertyTypes` in tsconfig makes `{ iv: undefined }`
     *   a type error (it's not the same as omitting `iv`). Conditional
     *   assignment produces an object with only the set keys.
     *
     * Why `updated_at: () => "now()"`:
     *   TypeORM treats function values as raw SQL expressions. We want
     *   the DB clock to stamp the row (consistent, atomic with the
     *   UPDATE), not Node's `Date.now()` which drifts between replicas.
     */
    update({ userId, id, iv, encrypted_data }: UpdateArgs): Promise<VaultItem>;
    /**
     * Delete a vault item the user owns.
     *
     * `.delete({ id, user_id })` is an implicit authorisation check:
     *   if the row belongs to someone else, `affected` is 0. We return
     *   404 (not 403) on the miss branch to avoid leaking the existence
     *   of an ID that isn't theirs.
     */
    remove({ userId, id }: DeleteArgs): Promise<void>;
}
//# sourceMappingURL=vault.service.d.ts.map