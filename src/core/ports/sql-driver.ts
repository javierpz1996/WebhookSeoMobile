import type { DbError } from '@/core/types/db-error';
import type { Result } from '@/core/utils/result';

export type SqlBindValue = string | number | null;

export type SqlRow = Record<string, SqlBindValue>;

export type SqlDriver = {
  readonly isPersistent: boolean;
  getUserVersion(): Result<number, DbError>;
  setUserVersion(version: number): Result<void, DbError>;
  run(sql: string, params?: readonly SqlBindValue[]): Result<void, DbError>;
  getAll<T extends Record<string, SqlBindValue>>(
    sql: string,
    params?: readonly SqlBindValue[],
  ): Result<readonly T[], DbError>;
  getFirst<T extends Record<string, SqlBindValue>>(
    sql: string,
    params?: readonly SqlBindValue[],
  ): Result<T | null, DbError>;
  withTransaction<T>(fn: () => Result<T, DbError>): Result<T, DbError>;
  checkpoint(): Result<void, DbError>;
};
