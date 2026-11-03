import * as SQLite from 'expo-sqlite';

import { DATABASE_FILE_NAME } from '@/core/constants';
import type { DbError } from '@/core/types/db-error';
import type { SqlDriver } from '@/core/ports/sql-driver';
import { err, ok, type Result } from '@/core/utils/result';

import { runMigrations } from '@/data/db/migrations/run-migrations';
import { applyAppPragmas, createExpoSqlDriver } from '@/data/db/sql-driver-adapter';

export type DatabaseOutcome =
  | { readonly kind: 'persistent'; readonly schemaVersion: number }
  | { readonly kind: 'memory-fallback'; readonly schemaVersion: number }
  | { readonly kind: 'json'; readonly schemaVersion: number };

export type OpenDatabaseResult = {
  readonly driver: SqlDriver;
  readonly outcome: DatabaseOutcome;
};

function openNamedDatabase(name: string, isPersistent: boolean): Result<SqlDriver, DbError> {
  try {
    const db = SQLite.openDatabaseSync(name);
    const driver = createExpoSqlDriver(db, isPersistent);
    const pragmas = applyAppPragmas(driver);
    if (!pragmas.ok) {
      db.closeSync();
      return pragmas;
    }
    const migrated = runMigrations(driver);
    if (!migrated.ok) {
      db.closeSync();
      return migrated;
    }
    return ok(driver);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'failed to open database';
    return err({ kind: 'sqlite', message });
  }
}

export function openDeviceDatabase(): OpenDatabaseResult {
  const persistent = openNamedDatabase(DATABASE_FILE_NAME, true);
  if (persistent.ok) {
    const version = persistent.value.getUserVersion();
    return {
      driver: persistent.value,
      outcome: {
        kind: 'persistent',
        schemaVersion: version.ok ? version.value : 0,
      },
    };
  }

  const memory = openNamedDatabase(':memory:', false);
  if (memory.ok) {
    const version = memory.value.getUserVersion();
    return {
      driver: memory.value,
      outcome: {
        kind: 'memory-fallback',
        schemaVersion: version.ok ? version.value : 0,
      },
    };
  }

  throw new Error('unable to open sqlite session');
}
