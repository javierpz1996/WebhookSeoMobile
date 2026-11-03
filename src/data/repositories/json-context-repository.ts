import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';
import type { ContextRepository } from '@/core/ports/context-repository';
import { err, ok, type Result } from '@/core/utils/result';

import { parseNewContextEntry } from '@/data/repositories/context-schemas';
import type { JsonDocumentStore } from '@/data/persistence/json-document-store';

function sortContextEntries(entries: readonly ContextEntry[]): ContextEntry[] {
  return [...entries].sort((a, b) => {
    if (a.kind !== b.kind) {
      return a.kind.localeCompare(b.kind);
    }
    if (a.position !== b.position) {
      return a.position - b.position;
    }
    return a.createdAt - b.createdAt;
  });
}

export function createJsonContextRepository(store: JsonDocumentStore): ContextRepository {
  return {
    listByKind(kind: ContextKind): Result<readonly ContextEntry[], DbError> {
      const items = sortContextEntries(store.get().contextEntries).filter((entry) => entry.kind === kind);
      return ok(items);
    },

    listAll(): Result<readonly ContextEntry[], DbError> {
      return ok(sortContextEntries(store.get().contextEntries));
    },

    save(input: NewContextEntry): Result<ContextEntry, DbError> {
      const parsed = parseNewContextEntry(input);
      if (!parsed.ok) {
        return parsed;
      }
      const entry = parsed.value;
      const position = entry.position ?? 0;
      const saved: ContextEntry = {
        id: entry.id,
        kind: entry.kind,
        value: entry.value,
        meta: entry.meta,
        position,
        createdAt: entry.createdAt,
      };

      return store.update((doc) => {
        const without = doc.contextEntries.filter((item) => item.id !== saved.id);
        return ok({
          doc: { ...doc, contextEntries: [...without, saved] },
          value: saved,
        });
      });
    },

    remove(id: string): Result<void, DbError> {
      const exists = store.get().contextEntries.some((item) => item.id === id);
      if (!exists) {
        return err({ kind: 'not-found' });
      }
      return store.update((doc) =>
        ok({
          doc: { ...doc, contextEntries: doc.contextEntries.filter((item) => item.id !== id) },
          value: undefined,
        }),
      );
    },
  };
}
