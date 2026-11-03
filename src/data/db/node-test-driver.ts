import { DatabaseSync } from 'node:sqlite';

import type { DbError } from '@/core/types/db-error';
import type { SqlBindValue, SqlDriver } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

import { runMigrations } from '@/data/db/migrations/run-migrations';
import { applyAppPragmas } from '@/data/db/sql-driver-adapter';

type SqlRow = Record<string, SqlBindValue>;

function toDbError(error: unknown): DbError {
  if (error instanceof Error) {
    return { kind: 'sqlite', message: error.message };
  }
  return { kind: 'unknown', message: 'unexpected sqlite failure' };
}

export function createNodeMemorySqlDriver(): Result<SqlDriver, DbError> {
  try {
    const db = new DatabaseSync(':memory:');
    let inTransaction = false;

    const driver: SqlDriver = {
      isPersistent: false,

      getUserVersion(): Result<number, DbError> {
        try {
          const row = db.prepare('PRAGMA user_version').get() as SqlRow | undefined;
          const raw = row?.['user_version'];
          const version = typeof raw === 'number' ? raw : Number(raw ?? 0);
          return ok(Number.isFinite(version) ? version : 0);
        } catch (error) {
          return err(toDbError(error));
        }
      },

      setUserVersion(version: number): Result<void, DbError> {
        try {
          db.exec(`PRAGMA user_version = ${String(version)}`);
          return ok(undefined);
        } catch (error) {
          return err(toDbError(error));
        }
      },

      run(sql: string, params: readonly SqlBindValue[] = []): Result<void, DbError> {
        try {
          db.prepare(sql).run(...params);
          return ok(undefined);
        } catch (error) {
          return err(toDbError(error));
        }
      },

      getAll<T extends SqlRow>(
        sql: string,
        params: readonly SqlBindValue[] = [],
      ): Result<readonly T[], DbError> {
        try {
          const rows = db.prepare(sql).all(...params) as unknown as readonly T[];
          return ok(rows);
        } catch (error) {
          return err(toDbError(error));
        }
      },

      getFirst<T extends SqlRow>(
        sql: string,
        params: readonly SqlBindValue[] = [],
      ): Result<T | null, DbError> {
        try {
          const row = db.prepare(sql).get(...params) as T | undefined;
          return ok(row ?? null);
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
          db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
          return ok(undefined);
        } catch (error) {
          return err(toDbError(error));
        }
      },
    };

    const pragmas = applyAppPragmas(driver);
    if (!pragmas.ok) {
      return pragmas;
    }
    const migrated = runMigrations(driver);
    if (!migrated.ok) {
      return migrated;
    }
    return ok(driver);
  } catch (error) {
    return err(toDbError(error));
  }
}

export function openNodeMemoryDatabaseForTests(): Result<SqlDriver, DbError> {
  return createNodeMemorySqlDriver();
}
