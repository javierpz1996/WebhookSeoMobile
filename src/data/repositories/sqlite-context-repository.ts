import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';
import type { ContextRepository } from '@/core/ports/context-repository';
import type { SqlDriver, SqlRow } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

import {
  parseContextRow,
  parseNewContextEntry,
  serializeContextMeta,
} from '@/data/repositories/context-schemas';

export function createContextRepository(driver: SqlDriver): ContextRepository {
  return {
    listByKind(kind: ContextKind): Result<readonly ContextEntry[], DbError> {
      const rows = driver.getAll<SqlRow>(
        `SELECT id, kind, value, meta, position, created_at
         FROM context_entries
         WHERE kind = ?
         ORDER BY position ASC, created_at ASC`,
        [kind],
      );
      if (!rows.ok) {
        return rows;
      }
      const items: ContextEntry[] = [];
      for (const row of rows.value) {
        const parsed = parseContextRow(row);
        if (!parsed.ok) {
          continue;
        }
        items.push(parsed.value);
      }
      return ok(items);
    },

    listAll(): Result<readonly ContextEntry[], DbError> {
      const rows = driver.getAll<SqlRow>(
        `SELECT id, kind, value, meta, position, created_at
         FROM context_entries
         ORDER BY kind ASC, position ASC, created_at ASC`,
      );
      if (!rows.ok) {
        return rows;
      }
      const items: ContextEntry[] = [];
      for (const row of rows.value) {
        const parsed = parseContextRow(row);
        if (!parsed.ok) {
          continue;
        }
        items.push(parsed.value);
      }
      return ok(items);
    },

    save(input: NewContextEntry): Result<ContextEntry, DbError> {
      const parsed = parseNewContextEntry(input);
      if (!parsed.ok) {
        return parsed;
      }
      const entry = parsed.value;
      const position = entry.position ?? 0;

      const upsert = driver.run(
        `INSERT INTO context_entries (id, kind, value, meta, position, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           kind = excluded.kind,
           value = excluded.value,
           meta = excluded.meta,
           position = excluded.position,
           created_at = excluded.created_at`,
        [
          entry.id,
          entry.kind,
          entry.value,
          serializeContextMeta(entry.meta),
          position,
          entry.createdAt,
        ],
      );
      if (!upsert.ok) {
        return upsert;
      }

      return ok({
        id: entry.id,
        kind: entry.kind,
        value: entry.value,
        meta: entry.meta,
        position,
        createdAt: entry.createdAt,
      });
    },

    remove(id: string): Result<void, DbError> {
      const existing = driver.getFirst<{ id: string }>(
        'SELECT id FROM context_entries WHERE id = ?',
        [id],
      );
      if (!existing.ok) {
        return existing;
      }
      if (existing.value === null) {
        return err({ kind: 'not-found' });
      }
      return driver.run('DELETE FROM context_entries WHERE id = ?', [id]);
    },
  };
}
