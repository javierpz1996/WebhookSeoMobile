import type { ContextEntry, ContextKind, NewContextEntry } from '@/core/types/context-entry';
import type { DbError } from '@/core/types/db-error';
import type { Result } from '@/core/utils/result';

export type ContextRepository = {
  listByKind(kind: ContextKind): Result<readonly ContextEntry[], DbError>;
  listAll(): Result<readonly ContextEntry[], DbError>;
  save(entry: NewContextEntry): Result<ContextEntry, DbError>;
  remove(id: string): Result<void, DbError>;
};
