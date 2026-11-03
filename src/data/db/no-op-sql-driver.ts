import type { DbError } from '@/core/types/db-error';
import type { SqlDriver } from '@/core/ports/sql-driver';
import { ok, type Result } from '@/core/utils/result';

export function createNoOpSqlDriver(): SqlDriver {
  const unsupported = (): Result<never, DbError> => ({
    ok: false,
    error: { kind: 'unknown', message: 'json storage mode' },
  });

  return {
    isPersistent: false,
    getUserVersion: () => ok(1),
    setUserVersion: () => ok(undefined),
    run: unsupported,
    getAll: unsupported,
    getFirst: unsupported,
    withTransaction: unsupported,
    checkpoint: () => ok(undefined),
  };
}
