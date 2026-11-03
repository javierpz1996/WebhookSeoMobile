import type { SQLiteDatabase } from 'expo-sqlite';

import type { DbError } from '@/core/types/db-error';
import type { SqlBindValue, SqlDriver } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

function toDbError(error: unknown): DbError {
  if (error instanceof Error) {
    return { kind: 'sqlite', message: error.message };
  }
  return { kind: 'unknown', message: 'unexpected sqlite failure' };
}

export function createExpoSqlDriver(db: SQLiteDatabase, isPersistent: boolean): SqlDriver {
  let inTransaction = false;

  const driver: SqlDriver = {
    isPersistent,

    getUserVersion(): Result<number, DbError> {
      try {
        const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
        const version = row?.user_version ?? 0;
        return ok(version);
      } catch (error) {
        return err(toDbError(error));
      }
    },

    setUserVersion(version: number): Result<void, DbError> {
      try {
        db.execSync(`PRAGMA user_version = ${String(version)}`);
        return ok(undefined);
      } catch (error) {
        return err(toDbError(error));
      }
    },

    run(sql: string, params: readonly SqlBindValue[] = []): Result<void, DbError> {
      try {
        db.runSync(sql, params as never);
        return ok(undefined);
      } catch (error) {
        return err(toDbError(error));
      }
    },

    getAll<T extends Record<string, SqlBindValue>>(
      sql: string,
      params: readonly SqlBindValue[] = [],
    ): Result<readonly T[], DbError> {
      try {
        const rows = db.getAllSync<T>(sql, params as never);
        return ok(rows);
      } catch (error) {
        return err(toDbError(error));
      }
    },

    getFirst<T extends Record<string, SqlBindValue>>(
      sql: string,
      params: readonly SqlBindValue[] = [],
    ): Result<T | null, DbError> {
      try {
        const row = db.getFirstSync<T>(sql, params as never);
        return ok(row);
      } catch (error) {
        return err(toDbError(error));
      }
    },

    withTransaction<T>(fn: () => Result<T, DbError>): Result<T, DbError> {
      if (inTransaction) {
        return err({ kind: 'sqlite', message: 'nested transactions are not supported' });
      }
      const begin = driver.run('BEGIN IMMEDIATE');
      if (!begin.ok) {
        return begin;
      }
      inTransaction = true;
      const result = fn();
      inTransaction = false;
      if (result.ok) {
        const commit = driver.run('COMMIT');
        if (!commit.ok) {
          driver.run('ROLLBACK');
          return commit;
        }
        return result;
      }
      driver.run('ROLLBACK');
      return result;
    },

    checkpoint(): Result<void, DbError> {
      try {
        db.execSync('PRAGMA wal_checkpoint(TRUNCATE)');
        return ok(undefined);
      } catch (error) {
        return err(toDbError(error));
      }
    },
  };

  return driver;
}

export function applyAppPragmas(driver: SqlDriver): Result<void, DbError> {
  const pragmas = [
    'PRAGMA journal_mode = WAL',
    'PRAGMA synchronous = FULL',
    'PRAGMA foreign_keys = ON',
  ] as const;

  for (const pragma of pragmas) {
    const result = driver.run(pragma);
    if (!result.ok) {
      return result;
    }
  }
  return ok(undefined);
}
